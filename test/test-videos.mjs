// Automated QA-QC Test Suite for Apollo RCA 7-Episode Video Training Companion
// Aligned with Thinking in Causes (v3) & RealityCharting Methodology
// Validates:
// 1. Episode durations (55:50, 20:22, 07:57, 06:59, etc.)
// 2. Official YouTube IDs (IXXgr85wO74, tCQuu_rvSJ8, 8y501jMIS7k, lppZuZFyHzM)
// 3. Complete curriculum alignments (bookRef, summary, objectives, keyPoints, bookExamples, youtubeOutline)
// 4. Legacy placeholder durations elimination
// 5. Edge cases: parseYouTubeId with valid, invalid, malformed, and injection inputs
// 6. Local storage persistence, overrides, and legacy migrations
// 7. Drawer lifecycle, DOM rendering, filtering, and tab switching

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIDEO_MODULES,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  OFFICIAL_VIDEOS,
  OFFICIAL_CHANNEL_URL,
  getStoredVideos,
  saveVideoId,
  parseYouTubeId,
  escapeHtml,
  sanitizeVideoId,
  syncOfficialVideos,
  openVideoDrawer,
  closeVideoDrawer,
  mountVideoButtons
} from '../h2c-videos.js';

// --- Lightweight Headless DOM Mock for Drawer & UI Tests ---
class MockElement {
  constructor(tagName) {
    this.tagName = tagName ? tagName.toUpperCase() : 'DIV';
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.style = {};
    this.dataset = {};
    this._listeners = new Map();
    this._textContent = '';
    this._innerHTML = '';
    this.type = tagName === 'button' ? 'button' : tagName === 'input' ? 'text' : '';
    this.id = '';
    this.title = '';
    this.className = '';
    this.onclick = null;
  }

  get isConnected() {
    let p = this.parentNode;
    while (p) {
      if (p === mockDoc.documentElement || p === mockDoc.body) return true;
      p = p.parentNode;
    }
    return false;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
    // Parse lightweight elements for querying in tests
    this.children = [];
    const str = String(val);
    
    // Extract class names and IDs present in template strings
    const classMatches = [...str.matchAll(/class="([^"]+)"/g)];
    for (const cm of classMatches) {
      const classNames = cm[1].split(/\s+/).filter(Boolean);
      for (const cls of classNames) {
        if (cls.startsWith('h2cv-')) {
          const el = new MockElement('div');
          el.className = cls;
          el.parentNode = this;
          this.children.push(el);
        }
      }
    }

    // Extract any iframes
    const iframeMatches = [...str.matchAll(/<iframe\b[^>]*>/gi)];
    for (const im of iframeMatches) {
      const ifr = new MockElement('iframe');
      ifr.parentNode = this;
      this.children.push(ifr);
    }
  }

  get classList() {
    return {
      _classes: new Set(this.className.split(/\s+/).filter(Boolean)),
      add: (...cls) => {
        cls.forEach(c => this.classList._classes.add(c));
        this.className = [...this.classList._classes].join(' ');
      },
      remove: (...cls) => {
        cls.forEach(c => this.classList._classes.delete(c));
        this.className = [...this.classList._classes].join(' ');
      },
      contains: (c) => this.classList._classes.has(c)
    };
  }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k === 'type') this.type = String(v);
    if (k === 'title') this.title = String(v);
  }

  getAttribute(k) {
    return this.attributes.get(k) || null;
  }

  removeAttribute(k) {
    this.attributes.delete(k);
    if (k === 'id') this.id = '';
    if (k === 'class') this.className = '';
  }

  hasAttribute(k) {
    return this.attributes.has(k);
  }

  append(...nodes) {
    for (const n of nodes) {
      if (!n) continue;
      if (typeof n === 'string') {
        const textNode = new MockElement('#text');
        textNode._textContent = n;
        textNode.parentNode = this;
        this.children.push(textNode);
      } else {
        if (n.parentNode) n.remove();
        n.parentNode = this;
        this.children.push(n);
      }
    }
  }

  appendChild(node) {
    this.append(node);
    return node;
  }

  insertBefore(newNode, refNode) {
    if (!refNode) {
      this.append(newNode);
      return newNode;
    }
    const idx = this.children.indexOf(refNode);
    if (idx === -1) {
      this.append(newNode);
    } else {
      if (newNode.parentNode) newNode.remove();
      newNode.parentNode = this;
      this.children.splice(idx, 0, newNode);
    }
    return newNode;
  }

  remove() {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) this.parentNode.children.splice(idx, 1);
      this.parentNode = null;
    }
  }

  contains(node) {
    if (!node) return false;
    if (node === this) return true;
    for (const c of this.children) {
      if (c instanceof MockElement && c.contains(node)) return true;
    }
    return false;
  }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (!(child instanceof MockElement)) continue;
        if (matchesSel(child, sel)) {
          results.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return results;
  }

  addEventListener(type, handler) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    if (this._listeners.has(type)) {
      this._listeners.get(type).delete(handler);
    }
  }

  dispatchEvent(event) {
    const list = this._listeners.get(event.type);
    if (list) {
      for (const fn of list) {
        try { fn.call(this, event); } catch {}
      }
    }
    return true;
  }

  focus() {
    mockDoc.activeElement = this;
  }

  scrollIntoView() {}
}

function matchesSel(el, sel) {
  if (!sel) return false;
  sel = sel.trim();
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (/^[a-zA-Z0-9_-]+$/.test(sel)) return el.tagName.toLowerCase() === sel.toLowerCase();
  if (sel.includes('[data-step')) {
    const m = sel.match(/\[data-step=["']?(.*?)["']?\]/);
    if (m) return el.getAttribute('data-step') === m[1];
  }
  return false;
}

const mockStore = new Map();
const mockLocalStorageObj = {
  getItem: (k) => mockStore.get(k) || null,
  setItem: (k, v) => mockStore.set(k, String(v)),
  removeItem: (k) => mockStore.delete(k),
  clear: () => mockStore.clear()
};

const mockDoc = {
  documentElement: new MockElement('html'),
  head: new MockElement('head'),
  body: new MockElement('body'),
  activeElement: null,
  readyState: 'complete',
  createElement(tag) {
    return new MockElement(tag);
  },
  getElementById(id) {
    const walk = (node) => {
      if (node.id === id) return node;
      for (const child of node.children) {
        if (child instanceof MockElement) {
          const found = walk(child);
          if (found) return found;
        }
      }
      return null;
    };
    return walk(mockDoc.body);
  },
  querySelector(sel) {
    return mockDoc.body.querySelector(sel);
  },
  querySelectorAll(sel) {
    return mockDoc.body.querySelectorAll(sel);
  },
  addEventListener() {},
  removeEventListener() {}
};
mockDoc.documentElement.append(mockDoc.head, mockDoc.body);

// Set globals for UI tests
globalThis.window = globalThis;
globalThis.document = mockDoc;
globalThis.localStorage = mockLocalStorageObj;

describe('Apollo RCA — 7-Episode Video Training QA/QC Suite', () => {

  beforeEach(() => {
    mockStore.clear();
    mockDoc.body.children = [];
  });

  // =========================================================================
  // 1. EXACT OFFICIAL EPISODE DURATIONS
  // =========================================================================
  describe('1. Episode Duration Verifications', () => {
    it('Assert that Episode 1 duration is exactly "55:50"', () => {
      const ep1 = VIDEO_MODULES.find(m => m.step === 1);
      assert.ok(ep1, 'Episode 1 must exist');
      assert.strictEqual(ep1.duration, '55:50', 'Episode 1 official duration must be 55:50');
    });

    it('Assert that Episode 2 duration is exactly "20:22"', () => {
      const ep2 = VIDEO_MODULES.find(m => m.step === 2);
      assert.ok(ep2, 'Episode 2 must exist');
      assert.strictEqual(ep2.duration, '20:22', 'Episode 2 duration must be exactly 20:22 (matching official YouTube length)');
    });

    it('Assert that Episode 3 duration is exactly "07:57"', () => {
      const ep3 = VIDEO_MODULES.find(m => m.step === 3);
      assert.ok(ep3, 'Episode 3 must exist');
      assert.strictEqual(ep3.duration, '07:57', 'Episode 3 official duration must be 07:57');
    });

    it('Assert that Episode 4 duration is exactly "06:59"', () => {
      const ep4 = VIDEO_MODULES.find(m => m.step === 4);
      assert.ok(ep4, 'Episode 4 must exist');
      assert.strictEqual(ep4.duration, '06:59', 'Episode 4 official duration must be 06:59');
    });

    it('Assert that Episodes 5, 6, and 7 have production-ready durations', () => {
      const ep5 = VIDEO_MODULES.find(m => m.step === 5);
      const ep6 = VIDEO_MODULES.find(m => m.step === 6);
      const ep7 = VIDEO_MODULES.find(m => m.step === 7);

      assert.strictEqual(ep5.duration, '08:19', 'Episode 5 duration must be 08:19');
      assert.strictEqual(ep6.duration, '07:20', 'Episode 6 duration must be 07:20');
      assert.strictEqual(ep7.duration, '07:10', 'Episode 7 duration must be 07:10');
    });

    it('Assert that no legacy placeholder durations exist in VIDEO_MODULES', () => {
      const legacyDurations = ['11:45', '14:20', '18:50', '13:15', '12:00', '10:00', '22:02'];
      VIDEO_MODULES.forEach(mod => {
        assert.ok(
          !legacyDurations.includes(mod.duration),
          `Episode ${mod.step} has obsolete/legacy duration: ${mod.duration}`
        );
        // Duration format validation MM:SS
        assert.match(
          mod.duration,
          /^\d{2}:\d{2}$/,
          `Episode ${mod.step} duration format must be strictly MM:SS (got: ${mod.duration})`
        );
      });
    });
  });

  // =========================================================================
  // 2. OFFICIAL YOUTUBE IDS
  // =========================================================================
  describe('2. Official YouTube IDs & Placeholders', () => {
    it('Assert that Episode 1 defaultYtId is "IXXgr85wO74"', () => {
      const ep1 = VIDEO_MODULES.find(m => m.step === 1);
      assert.strictEqual(ep1.defaultYtId, 'IXXgr85wO74');
    });

    it('Assert that Episode 2 defaultYtId is "tCQuu_rvSJ8"', () => {
      const ep2 = VIDEO_MODULES.find(m => m.step === 2);
      assert.strictEqual(ep2.defaultYtId, 'tCQuu_rvSJ8');
    });

    it('Assert that Episode 3 defaultYtId is "8y501jMIS7k"', () => {
      const ep3 = VIDEO_MODULES.find(m => m.step === 3);
      assert.strictEqual(ep3.defaultYtId, '8y501jMIS7k');
    });

    it('Assert that Episode 4 defaultYtId is "lppZuZFyHzM"', () => {
      const ep4 = VIDEO_MODULES.find(m => m.step === 4);
      assert.strictEqual(ep4.defaultYtId, 'lppZuZFyHzM');
    });

    it('Assert that all 7 episodes have official YouTube IDs (0 placeholders remaining)', () => {
      const ep5 = VIDEO_MODULES.find(m => m.step === 5);
      const ep6 = VIDEO_MODULES.find(m => m.step === 6);
      const ep7 = VIDEO_MODULES.find(m => m.step === 7);

      assert.strictEqual(ep5.defaultYtId, 'yBVaGu31ik8');
      assert.strictEqual(ep6.defaultYtId, 'Q4-Bu2qUaaE');
      assert.strictEqual(ep7.defaultYtId, '_w5WUcNRYWU');
    });

    it('Assert that no Rickroll IDs (dQw4w9WgXcQ) exist in VIDEO_MODULES', () => {
      VIDEO_MODULES.forEach(mod => {
        assert.notStrictEqual(
          mod.defaultYtId,
          'dQw4w9WgXcQ',
          `Episode ${mod.step} must not use legacy placeholder dQw4w9WgXcQ`
        );
      });
    });

    it('Assert OFFICIAL_VIDEOS and OFFICIAL_CHANNEL_URL are correctly exposed', () => {
      assert.strictEqual(OFFICIAL_CHANNEL_URL, 'https://www.youtube.com/@h2c_Learnings');
      assert.strictEqual(OFFICIAL_VIDEOS[1].id, 'IXXgr85wO74');
      assert.strictEqual(OFFICIAL_VIDEOS[1].duration, '55:50');
      assert.strictEqual(OFFICIAL_VIDEOS[2].id, 'tCQuu_rvSJ8');
      assert.strictEqual(OFFICIAL_VIDEOS[2].duration, '20:22');
      assert.strictEqual(OFFICIAL_VIDEOS[3].id, '8y501jMIS7k');
      assert.strictEqual(OFFICIAL_VIDEOS[3].duration, '07:57');
      assert.strictEqual(OFFICIAL_VIDEOS[4].id, 'lppZuZFyHzM');
      assert.strictEqual(OFFICIAL_VIDEOS[4].duration, '06:59');
      assert.strictEqual(OFFICIAL_VIDEOS[5].id, 'yBVaGu31ik8');
      assert.strictEqual(OFFICIAL_VIDEOS[5].duration, '08:19');
      assert.strictEqual(OFFICIAL_VIDEOS[6].id, 'Q4-Bu2qUaaE');
      assert.strictEqual(OFFICIAL_VIDEOS[6].duration, '07:20');
      assert.strictEqual(OFFICIAL_VIDEOS[7].id, '_w5WUcNRYWU');
      assert.strictEqual(OFFICIAL_VIDEOS[7].duration, '07:10');
    });
  });

  // =========================================================================
  // 3. CURRICULUM ALIGNMENT & METHODOLOGY METADATA (7 OF 7 EPISODES)
  // =========================================================================
  describe('3. Curriculum Alignment & Lesson Plan Integrity', () => {
    it('Assert exactly 7 episodes exist and are numbered 1 through 7 sequentially', () => {
      assert.strictEqual(VIDEO_MODULES.length, 7, 'Must have exactly 7 video modules');
      VIDEO_MODULES.forEach((mod, idx) => {
        assert.strictEqual(mod.step, idx + 1, `Module at index ${idx} must have step ${idx + 1}`);
      });
    });

    it('Assert that all 7 episodes have non-empty bookRef, summary, objectives, keyPoints, bookExamples, and youtubeOutline', () => {
      VIDEO_MODULES.forEach(mod => {
        // bookRef
        assert.ok(typeof mod.bookRef === 'string' && mod.bookRef.trim().length > 10,
          `Episode ${mod.step} bookRef must be non-empty string (>10 chars)`);
        assert.ok(/RC|AR|Gano/i.test(mod.bookRef),
          `Episode ${mod.step} bookRef must cite RealityCharting (RC) or Apollo RCA (AR)`);

        // summary
        assert.ok(typeof mod.summary === 'string' && mod.summary.trim().length > 30,
          `Episode ${mod.step} summary must be descriptive (>30 chars)`);

        // objectives
        assert.ok(Array.isArray(mod.objectives) && mod.objectives.length >= 3,
          `Episode ${mod.step} objectives must have at least 3 items (found: ${mod.objectives?.length})`);
        mod.objectives.forEach((obj, i) => {
          assert.ok(typeof obj === 'string' && obj.trim().length > 5,
            `Episode ${mod.step} objective ${i} must be a non-empty string`);
        });

        // keyPoints
        assert.ok(Array.isArray(mod.keyPoints) && mod.keyPoints.length >= 3,
          `Episode ${mod.step} keyPoints must have at least 3 items (found: ${mod.keyPoints?.length})`);
        mod.keyPoints.forEach((kp, i) => {
          assert.ok(typeof kp === 'string' && kp.trim().length > 5,
            `Episode ${mod.step} keyPoint ${i} must be a non-empty string`);
        });

        // bookExamples
        assert.ok(Array.isArray(mod.bookExamples) && mod.bookExamples.length >= 2,
          `Episode ${mod.step} bookExamples must have at least 2 items (found: ${mod.bookExamples?.length})`);
        mod.bookExamples.forEach((ex, i) => {
          assert.ok(typeof ex === 'string' && ex.trim().length > 5,
            `Episode ${mod.step} bookExample ${i} must be a non-empty string`);
        });

        // youtubeOutline
        assert.ok(Array.isArray(mod.youtubeOutline) && mod.youtubeOutline.length >= 4,
          `Episode ${mod.step} youtubeOutline must have at least 4 timestamps (found: ${mod.youtubeOutline?.length})`);
        mod.youtubeOutline.forEach((item, i) => {
          assert.ok(typeof item === 'string' && /^\d{2}:\d{2}\s*-\s*/.test(item),
            `Episode ${mod.step} outline item ${i} must start with MM:SS - timestamp (got: ${item})`);
        });

        // targetId
        assert.ok(typeof mod.targetId === 'string' && mod.targetId.length > 0,
          `Episode ${mod.step} must have a valid targetId`);

        // fullDescription
        assert.ok(typeof mod.fullDescription === 'string' && mod.fullDescription.length > 200,
          `Episode ${mod.step} fullDescription must be comprehensive (>200 chars)`);
        assert.ok(mod.fullDescription.includes('Dean L. Gano') || mod.fullDescription.includes('RealityCharting'),
          `Episode ${mod.step} fullDescription must contain attribution`);
      });
    });

    it('Assert targetId bindings match valid application sections', () => {
      const validSections = [
        'section-define',
        'realitychart',
        'section-evidence',
        'section-solutions',
        'section-timeline',
        'section-track'
      ];
      VIDEO_MODULES.forEach(mod => {
        assert.ok(
          validSections.includes(mod.targetId),
          `Episode ${mod.step} targetId "${mod.targetId}" must match a valid application section`
        );
      });
    });
  });

  // =========================================================================
  // 4. EDGE CASE TESTING: YOUTUBE ID PARSING
  // =========================================================================
  describe('4. Edge Cases: parseYouTubeId Input Sanitization', () => {
    it('handles standard 11-character video IDs', () => {
      assert.strictEqual(parseYouTubeId('IXXgr85wO74'), 'IXXgr85wO74');
      assert.strictEqual(parseYouTubeId('tCQuu_rvSJ8'), 'tCQuu_rvSJ8');
      assert.strictEqual(parseYouTubeId('8y501jMIS7k'), '8y501jMIS7k');
      assert.strictEqual(parseYouTubeId('lppZuZFyHzM'), 'lppZuZFyHzM');
    });

    it('handles youtu.be short URLs', () => {
      assert.strictEqual(parseYouTubeId('https://youtu.be/IXXgr85wO74'), 'IXXgr85wO74');
      assert.strictEqual(parseYouTubeId('http://youtu.be/tCQuu_rvSJ8'), 'tCQuu_rvSJ8');
      assert.strictEqual(parseYouTubeId('youtu.be/8y501jMIS7k'), '8y501jMIS7k');
    });

    it('handles youtube.com/watch?v= URLs with extra query params', () => {
      assert.strictEqual(
        parseYouTubeId('https://www.youtube.com/watch?v=IXXgr85wO74'),
        'IXXgr85wO74'
      );
      assert.strictEqual(
        parseYouTubeId('https://www.youtube.com/watch?v=tCQuu_rvSJ8&feature=youtu.be&t=120s'),
        'tCQuu_rvSJ8'
      );
      assert.strictEqual(
        parseYouTubeId('https://youtube.com/watch?list=PL123&v=8y501jMIS7k&index=2'),
        '8y501jMIS7k'
      );
    });

    it('handles youtube.com/embed/ URLs', () => {
      assert.strictEqual(
        parseYouTubeId('https://www.youtube.com/embed/lppZuZFyHzM'),
        'lppZuZFyHzM'
      );
      assert.strictEqual(
        parseYouTubeId('https://www.youtube-nocookie.com/embed/IXXgr85wO74?autoplay=1'),
        'IXXgr85wO74'
      );
    });

    it('handles leading and trailing whitespace gracefully', () => {
      assert.strictEqual(parseYouTubeId('   IXXgr85wO74   '), 'IXXgr85wO74');
      assert.strictEqual(
        parseYouTubeId('   https://youtu.be/tCQuu_rvSJ8 \n\t'),
        'tCQuu_rvSJ8'
      );
    });

    it('rejects invalid, malformed, empty, or malicious inputs returning null', () => {
      assert.strictEqual(parseYouTubeId(''), null);
      assert.strictEqual(parseYouTubeId('    '), null);
      assert.strictEqual(parseYouTubeId(null), null);
      assert.strictEqual(parseYouTubeId(undefined), null);
      assert.strictEqual(parseYouTubeId('short'), null);
      assert.strictEqual(parseYouTubeId('toolongstring1234567890'), null);
      assert.strictEqual(parseYouTubeId('https://vimeo.com/123456789'), null);
      assert.strictEqual(parseYouTubeId('https://malicious.example.com/watch?v=IXXgr85wO74'), null);
      assert.strictEqual(parseYouTubeId('javascript:alert(1)'), null);
      assert.strictEqual(parseYouTubeId('<script>alert("xss")</script>'), null);
    });

    it('escapeHtml escapes dangerous HTML characters and handles non-string inputs', () => {
      assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      assert.strictEqual(escapeHtml('Apollo & RealityCharting'), 'Apollo &amp; RealityCharting');
      assert.strictEqual(escapeHtml("Gano's Methodology"), 'Gano&#39;s Methodology');
      assert.strictEqual(escapeHtml(null), '');
      assert.strictEqual(escapeHtml(undefined), '');
      assert.strictEqual(escapeHtml(12345), '12345');
    });

    it('sanitizeVideoId validates clean 11-char IDs and placeholders while rejecting payloads', () => {
      assert.strictEqual(sanitizeVideoId('IXXgr85wO74', 'fallback'), 'IXXgr85wO74');
      assert.strictEqual(sanitizeVideoId('PLACEHOLDER_EPISODE5', 'fallback'), 'PLACEHOLDER_EPISODE5');
      assert.strictEqual(sanitizeVideoId('<script>', 'fallback'), 'fallback');
      assert.strictEqual(sanitizeVideoId('short', 'fallback'), 'fallback');
      assert.strictEqual(sanitizeVideoId(null, 'fallback'), 'fallback');
      assert.strictEqual(sanitizeVideoId({}, 'fallback'), 'fallback');
    });
  });

  // =========================================================================
  // 5. LOCAL STORAGE PERSISTENCE & LEGACY DATA MIGRATION
  // =========================================================================
  describe('5. Local Storage Persistence & Legacy Migration', () => {
    it('returns official default video IDs when localStorage is completely empty', () => {
      const stored = getStoredVideos();
      assert.strictEqual(stored[1], 'IXXgr85wO74');
      assert.strictEqual(stored[2], 'tCQuu_rvSJ8');
      assert.strictEqual(stored[3], '8y501jMIS7k');
      assert.strictEqual(stored[4], 'lppZuZFyHzM');
      assert.strictEqual(stored[5], 'yBVaGu31ik8');
      assert.strictEqual(stored[6], 'Q4-Bu2qUaaE');
      assert.strictEqual(stored[7], '_w5WUcNRYWU');
    });

    it('persists and retrieves user-configured video IDs', () => {
      saveVideoId(1, 'custom_vid1');
      saveVideoId(2, 'custom_vid2');

      const updated = getStoredVideos();
      assert.strictEqual(updated[1], 'custom_vid1');
      assert.strictEqual(updated[2], 'custom_vid2');
      // Unmodified steps retain defaults
      assert.strictEqual(updated[3], '8y501jMIS7k');
    });

    it('automatically migrates legacy Rickroll IDs (dQw4w9WgXcQ) to official video IDs', () => {
      // Simulate existing legacy storage containing Rickroll
      const legacyState = {
        1: 'dQw4w9WgXcQ',
        2: 'dQw4w9WgXcQ',
        3: 'dQw4w9WgXcQ',
        4: 'dQw4w9WgXcQ'
      };
      mockLocalStorageObj.setItem(STORAGE_KEY, JSON.stringify(legacyState));

      const migrated = getStoredVideos();
      assert.strictEqual(migrated[1], 'IXXgr85wO74', 'Episode 1 must migrate away from Rickroll');
      assert.strictEqual(migrated[2], 'tCQuu_rvSJ8', 'Episode 2 must migrate away from Rickroll');
      assert.strictEqual(migrated[3], '8y501jMIS7k', 'Episode 3 must migrate away from Rickroll');
      assert.strictEqual(migrated[4], 'lppZuZFyHzM', 'Episode 4 must migrate away from Rickroll');
    });

    it('automatically upgrades legacy placeholder IDs to newly published official IDs', () => {
      const legacyState = {
        1: 'PLACEHOLDER_EPISODE1',
        2: 'PLACEHOLDER_EPISODE2',
        5: 'PLACEHOLDER_EPISODE5',
        6: 'PLACEHOLDER_EPISODE6',
        7: 'PLACEHOLDER_EPISODE7'
      };
      mockLocalStorageObj.setItem(STORAGE_KEY, JSON.stringify(legacyState));

      const migrated = getStoredVideos();
      assert.strictEqual(migrated[1], 'IXXgr85wO74', 'Episode 1 placeholder must upgrade to official ID');
      assert.strictEqual(migrated[2], 'tCQuu_rvSJ8', 'Episode 2 placeholder must upgrade to official ID');
      assert.strictEqual(migrated[5], 'yBVaGu31ik8', 'Episode 5 placeholder must upgrade to official ID');
      assert.strictEqual(migrated[6], 'Q4-Bu2qUaaE', 'Episode 6 placeholder must upgrade to official ID');
      assert.strictEqual(migrated[7], '_w5WUcNRYWU', 'Episode 7 placeholder must upgrade to official ID');
    });

    it('syncOfficialVideos synchronizes official videos and handles version migrations', () => {
      mockStore.clear();
      const synced = syncOfficialVideos(false);
      assert.strictEqual(synced[1], 'IXXgr85wO74');
      assert.strictEqual(synced[2], 'tCQuu_rvSJ8');
      assert.strictEqual(synced[3], '8y501jMIS7k');
      assert.strictEqual(synced[4], 'lppZuZFyHzM');

      // Test force sync overwrites corrupt/unexpected data
      mockLocalStorageObj.setItem(STORAGE_KEY, JSON.stringify({ 1: 'corrupt_data', 2: 'dQw4w9WgXcQ' }));
      const forceSynced = syncOfficialVideos(true);
      assert.strictEqual(forceSynced[1], 'IXXgr85wO74');
      assert.strictEqual(forceSynced[2], 'tCQuu_rvSJ8');
    });
  });

  // =========================================================================
  // 6. DRAWER LIFECYCLE & DOM INTERACTIONS
  // =========================================================================
  describe('6. Drawer Lifecycle, DOM Rendering, & Filter Switching', () => {
    it('openVideoDrawer mounts modal panel and overlay backdrop', () => {
      openVideoDrawer();
      const panel = mockDoc.querySelector('.h2cv-panel');
      const back = mockDoc.querySelector('.h2cv-back');

      assert.ok(panel, 'Panel container must be rendered');
      assert.ok(back, 'Backdrop overlay must be rendered');
      assert.strictEqual(panel.getAttribute('role'), 'dialog');

      closeVideoDrawer();
      assert.strictEqual(mockDoc.querySelector('.h2cv-panel'), null, 'Panel must be removed on close');
      assert.strictEqual(mockDoc.querySelector('.h2cv-back'), null, 'Backdrop must be removed on close');
    });

    it('renders exactly 7 cards initially when opening without a step filter', () => {
      openVideoDrawer();
      const panel = mockDoc.querySelector('.h2cv-panel');
      assert.ok(panel);

      const cards = panel.querySelectorAll('.h2cv-card');
      assert.strictEqual(cards.length, 7, 'Must render all 7 video cards initially');
      closeVideoDrawer();
    });

    it('openVideoDrawer supports step filtering', () => {
      openVideoDrawer(3);
      const panel = mockDoc.querySelector('.h2cv-panel');
      assert.ok(panel);
      assert.strictEqual(panel.getAttribute('role'), 'dialog');
      closeVideoDrawer();
    });

    it('Escape key triggers drawer closure', () => {
      openVideoDrawer();
      const panel = mockDoc.querySelector('.h2cv-panel');
      assert.ok(panel);

      panel.dispatchEvent({ type: 'keydown', key: 'Escape' });
      assert.strictEqual(mockDoc.querySelector('.h2cv-panel'), null, 'Panel must close on Escape key');
    });

    it('mountVideoButtons creates both floating FAB and toolbar button without duplicates', () => {
      // Create mock help button to anchor toolbar button
      const helpBtn = new MockElement('button');
      helpBtn.className = 'h2ch-tb';
      helpBtn.textContent = '? Help';
      mockDoc.body.append(helpBtn);

      mountVideoButtons();
      const fab1 = mockDoc.querySelector('.h2cv-fab');
      const tb1 = mockDoc.querySelector('.h2cv-tb');
      assert.ok(fab1, 'Floating FAB must be mounted');
      assert.ok(tb1, 'Toolbar button must be mounted');

      // Call again to verify idempotent mount
      mountVideoButtons();
      const fabs = mockDoc.querySelectorAll('.h2cv-fab');
      const tbs = mockDoc.querySelectorAll('.h2cv-tb');
      assert.strictEqual(fabs.length, 1, 'Duplicate FABs must not be injected');
      assert.strictEqual(tbs.length, 1, 'Duplicate toolbar buttons must not be injected');
    });
  });

  // =========================================================================
  // 7. DOCUMENTATION CONSISTENCY
  // =========================================================================
  describe('7. Documentation Consistency (USER_GUIDE.md & YOUTUBE_DESCRIPTIONS.md)', () => {
    it('USER_GUIDE.md contains updated official video durations', () => {
      const guide = readFileSync(new URL('../USER_GUIDE.md', import.meta.url), 'utf8');
      assert.ok(guide.includes('55:50'), 'USER_GUIDE.md must contain 55:50 for Episode 1');
      assert.ok(guide.includes('20:22'), 'USER_GUIDE.md must contain 20:22 for Episode 2');
      assert.ok(guide.includes('07:57'), 'USER_GUIDE.md must contain 07:57 for Episode 3');
      assert.ok(guide.includes('06:59'), 'USER_GUIDE.md must contain 06:59 for Episode 4');
      assert.ok(guide.includes('08:19'), 'USER_GUIDE.md must contain 08:19 for Episode 5');
      assert.ok(guide.includes('07:20'), 'USER_GUIDE.md must contain 07:20 for Episode 6');
      assert.ok(guide.includes('07:10'), 'USER_GUIDE.md must contain 07:10 for Episode 7');
      assert.ok(!guide.includes('22:02'), 'USER_GUIDE.md must not contain typo 22:02');
    });

    it('YOUTUBE_DESCRIPTIONS.md contains official YouTube IDs and durations', () => {
      const desc = readFileSync(new URL('../YOUTUBE_DESCRIPTIONS.md', import.meta.url), 'utf8');
      assert.ok(desc.includes('IXXgr85wO74'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 1 ID');
      assert.ok(desc.includes('tCQuu_rvSJ8'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 2 ID');
      assert.ok(desc.includes('8y501jMIS7k'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 3 ID');
      assert.ok(desc.includes('lppZuZFyHzM'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 4 ID');
      assert.ok(desc.includes('yBVaGu31ik8'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 5 ID');
      assert.ok(desc.includes('Q4-Bu2qUaaE'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 6 ID');
      assert.ok(desc.includes('_w5WUcNRYWU'), 'YOUTUBE_DESCRIPTIONS.md must contain Episode 7 ID');
      assert.ok(desc.includes('Duration: 55:50'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 1 duration');
      assert.ok(desc.includes('Duration: 20:22'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 2 duration');
      assert.ok(desc.includes('Duration: 07:57'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 3 duration');
      assert.ok(desc.includes('Duration: 06:59'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 4 duration');
      assert.ok(desc.includes('Duration: 08:19'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 5 duration');
      assert.ok(desc.includes('Duration: 07:20'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 6 duration');
      assert.ok(desc.includes('Duration: 07:10'), 'YOUTUBE_DESCRIPTIONS.md must have Episode 7 duration');
      assert.ok(!desc.includes('Duration: 22:02'), 'YOUTUBE_DESCRIPTIONS.md must not contain 22:02');
    });

    it('Cache busting query parameters (v=22) are synchronized across index.html and h2c-help.js', () => {
      const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
      assert.ok(indexHtml.includes('/apollo-rca/h2c-shell.js?v=23'), 'index.html must load h2c-shell.js?v=23');
      assert.ok(indexHtml.includes('/apollo-rca/h2c-help.js?v=24'), 'index.html must load h2c-help.js?v=24');

      const helpJs = readFileSync(new URL('../h2c-help.js', import.meta.url), 'utf8');
      assert.ok(helpJs.includes("./h2c-videos.js?v=24'"), 'h2c-help.js must import h2c-videos.js?v=24');
    });

    it('Episode tier descriptors and glowing badge formatting match 10x UX specifications', () => {
      const ep1 = VIDEO_MODULES.find(m => m.step === 1);
      const ep2 = VIDEO_MODULES.find(m => m.step === 2);
      const ep3 = VIDEO_MODULES.find(m => m.step === 3);
      const ep4 = VIDEO_MODULES.find(m => m.step === 4);

      assert.strictEqual(ep1.tier, 'Full Masterclass');
      assert.strictEqual(ep1.badgeText, '55:50 • Full Masterclass');
      assert.strictEqual(ep1.verified, true);

      assert.strictEqual(ep2.tier, 'Deep Dive');
      assert.strictEqual(ep2.badgeText, '20:22 • Deep Dive');
      assert.strictEqual(ep2.verified, true);

      assert.strictEqual(ep3.tier, 'Focused Guide');
      assert.strictEqual(ep3.badgeText, '07:57 • Focused Guide');
      assert.strictEqual(ep3.verified, true);

      assert.strictEqual(ep4.tier, 'Essential Lab');
      assert.strictEqual(ep4.badgeText, '06:59 • Essential Lab');
      assert.strictEqual(ep4.verified, true);

      const ep5 = VIDEO_MODULES.find(m => m.step === 5);
      assert.strictEqual(ep5.tier, 'Action Framework');
      assert.strictEqual(ep5.badgeText, '08:19 • Action Framework');
      assert.strictEqual(ep5.verified, true);

      const ep6 = VIDEO_MODULES.find(m => m.step === 6);
      assert.strictEqual(ep6.tier, 'Culture & Alignment');
      assert.strictEqual(ep6.badgeText, '07:20 • Culture & Alignment');
      assert.strictEqual(ep6.verified, true);

      const ep7 = VIDEO_MODULES.find(m => m.step === 7);
      assert.strictEqual(ep7.tier, 'Proactive Mastery');
      assert.strictEqual(ep7.badgeText, '07:10 • Proactive Mastery');
      assert.strictEqual(ep7.verified, true);
    });
  });
});
