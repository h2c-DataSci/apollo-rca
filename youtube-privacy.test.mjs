import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIDEO_MODULES,
  parseYouTubeId,
  escapeHtml,
  sanitizeVideoId,
  getStoredVideos,
  saveVideoId
} from './h2c-videos.js';

describe('YouTube Video Integration, Privacy & OWASP Security Audit', () => {

  test('parseYouTubeId: correctly parses valid YouTube URLs and 11-char IDs', () => {
    // 11-character direct ID
    assert.equal(parseYouTubeId('IXXgr85wO74'), 'IXXgr85wO74');
    assert.equal(parseYouTubeId('tCQuu_rvSJ8'), 'tCQuu_rvSJ8');

    // youtu.be shortlinks
    assert.equal(parseYouTubeId('https://youtu.be/IXXgr85wO74'), 'IXXgr85wO74');
    assert.equal(parseYouTubeId('http://youtu.be/8y501jMIS7k?si=12345'), '8y501jMIS7k');

    // youtube.com watch URLs with and without extra query params
    assert.equal(parseYouTubeId('https://www.youtube.com/watch?v=lppZuZFyHzM'), 'lppZuZFyHzM');
    assert.equal(parseYouTubeId('https://youtube.com/watch?feature=shared&v=IXXgr85wO74'), 'IXXgr85wO74');
    assert.equal(parseYouTubeId('https://www.youtube.com/watch?v=tCQuu_rvSJ8&t=45s'), 'tCQuu_rvSJ8');

    // embed URLs
    assert.equal(parseYouTubeId('https://www.youtube.com/embed/8y501jMIS7k'), '8y501jMIS7k');
    assert.equal(parseYouTubeId('https://www.youtube-nocookie.com/embed/lppZuZFyHzM'), 'lppZuZFyHzM');

    // YouTube shorts and live
    assert.equal(parseYouTubeId('https://www.youtube.com/shorts/IXXgr85wO74'), 'IXXgr85wO74');
    assert.equal(parseYouTubeId('https://www.youtube.com/live/tCQuu_rvSJ8'), 'tCQuu_rvSJ8');
  });

  test('parseYouTubeId: strictly rejects XSS payloads, arbitrary URLs, and invalid IDs', () => {
    assert.equal(parseYouTubeId(''), null);
    assert.equal(parseYouTubeId(null), null);
    assert.equal(parseYouTubeId(undefined), null);
    assert.equal(parseYouTubeId('   '), null);

    // XSS injection attempts
    assert.equal(parseYouTubeId('"><script>alert(1)</script>'), null);
    assert.equal(parseYouTubeId('javascript:alert(document.cookie)'), null);
    assert.equal(parseYouTubeId('https://evil.com/watch?v=IXXgr85wO74'), null);
    assert.equal(parseYouTubeId('http://attacker.com/youtu.be/12345678901'), null);
    assert.equal(parseYouTubeId('<iframe src="x"></iframe>'), null);
    assert.equal(parseYouTubeId('short'), null);
    assert.equal(parseYouTubeId('toolongstringwithmorethan11charactershere'), null);
    assert.equal(parseYouTubeId('invalid*char'), null);
  });

  test('escapeHtml: properly escapes HTML control characters to prevent XSS', () => {
    assert.equal(escapeHtml('<script>alert("XSS")</script>'), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert.equal(escapeHtml("Tom & Jerry's \"Adventure\""), 'Tom &amp; Jerry&#39;s &quot;Adventure&quot;');
    assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
    assert.equal(escapeHtml(''), '');
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
  });

  test('sanitizeVideoId: validates ID format and returns fallback on malformed input', () => {
    assert.equal(sanitizeVideoId('IXXgr85wO74', 'fallback'), 'IXXgr85wO74');
    assert.equal(sanitizeVideoId('PLACEHOLDER_EPISODE5', 'fallback'), 'PLACEHOLDER_EPISODE5');
    assert.equal(sanitizeVideoId('bad_id!', 'fallback'), 'fallback');
    assert.equal(sanitizeVideoId('"><script>', 'fallback'), 'fallback');
    assert.equal(sanitizeVideoId(null, 'fallback'), 'fallback');
  });

  test('getStoredVideos: returns default official video IDs and sanitizes tampered keys', () => {
    const videos = getStoredVideos();
    assert.ok(videos);
    assert.equal(videos[1], 'IXXgr85wO74');
    assert.equal(videos[2], 'tCQuu_rvSJ8');
    assert.equal(videos[3], '8y501jMIS7k');
    assert.equal(videos[4], 'lppZuZFyHzM');
  });

  test('saveVideoId: rejects malicious injection payloads', () => {
    const resultBad = saveVideoId(1, '"><script>alert(1)</script>');
    assert.equal(resultBad, null, 'Must reject malicious input');

    const resultGood = saveVideoId(1, 'IXXgr85wO74');
    assert.equal(resultGood, 'IXXgr85wO74', 'Must accept valid 11-char ID');
  });

  test('privacy invariant: youtube-nocookie.com and modestbranding used in embeds', () => {
    const code = readFileSync(new URL('./h2c-videos.js', import.meta.url), 'utf8');
    assert.ok(
      code.includes('https://www.youtube-nocookie.com/embed/'),
      'Must use youtube-nocookie.com domain for privacy-enhanced mode'
    );
    assert.ok(
      code.includes('rel=0&modestbranding=1') || code.includes('modestbranding=1'),
      'Must include rel=0 and modestbranding=1 embed parameters'
    );
  });

  test('privacy invariant: zero automatic network requests to Google/YouTube on page load', () => {
    const code = readFileSync(new URL('./h2c-videos.js', import.meta.url), 'utf8');
    // Iframe must only be constructed inside the click handler
    assert.ok(
      code.includes('screen.onclick'),
      'Video iframes must only be generated inside user click handler'
    );
    // index.html must not contain youtube or google tags
    const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
    const csp = indexHtml.match(/Content-Security-Policy" content="([^"]*)"/)?.[1] || '';
    assert.match(csp, /frame-src https:\/\/www\.youtube-nocookie\.com;/);
    assert.ok(!/frame-src https:(?:;|\s|$)/.test(csp), 'frame-src must name the embed host, not every https origin');
    const withoutCsp = indexHtml.replace(csp, '');
    assert.ok(!withoutCsp.includes('youtube.com'), 'index.html must not contain eager youtube.com embeds');
    assert.ok(!withoutCsp.includes('youtube-nocookie.com'), 'index.html must not contain eager youtube-nocookie embeds');
    assert.ok(!indexHtml.includes('googletagmanager.com'), 'index.html must not contain tracking scripts');
  });

  test('legal attribution & trademark disclaimers in video modules', () => {
    assert.equal(VIDEO_MODULES.length, 7, 'Must have exactly 7 video training modules');

    VIDEO_MODULES.forEach(mod => {
      assert.ok(mod.title, `Module ${mod.step} must have title`);
      assert.ok(mod.fullDescription, `Module ${mod.step} must have fullDescription`);
      assert.ok(
        mod.fullDescription.includes('Dean L. Gano') || mod.fullDescription.includes('Apollonian Publications'),
        `Module ${mod.step} must cite Dean L. Gano or Apollonian Publications`
      );
      assert.ok(
        mod.fullDescription.includes('RealityCharting®') || mod.fullDescription.includes('RealityCharting'),
        `Module ${mod.step} must cite RealityCharting trademark`
      );
      assert.ok(
        mod.fullDescription.includes('Nominative Fair Use') || mod.fullDescription.includes('15 U.S.C.'),
        `Module ${mod.step} must declare Nominative Fair Use`
      );
      assert.ok(
        mod.fullDescription.includes('https://realitycharting.com/home/'),
        `Module ${mod.step} must link to official software website`
      );
    });
  });

  test('executive legal safe harbor showcase in h2c-shell.js', () => {
    const shellCode = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
    assert.ok(shellCode.includes('NOMINATIVE FAIR USE (15 U.S.C. &sect; 1125)'));
    assert.ok(shellCode.includes('DEAN L. GANO INTELLECTUAL PROPERTY'));
    assert.ok(shellCode.includes('Apollo Root Cause Analysis: A New Way of Thinking'));
    assert.ok(shellCode.includes('RealityCharting: Seven Steps to Effective Problem-Solving'));
    assert.ok(shellCode.includes('https://realitycharting.com/home/'));
    assert.ok(shellCode.includes('escapeHtml('), 'h2c-shell.js must define escapeHtml for dynamic outputs');
  });

});
