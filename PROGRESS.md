# Where this repo is

Read this file first. Older phase notes that used to live here contradicted `main` (wrong test totals, placeholder videos, grey STOP nodes). Git history is the audit trail. This file is the handoff.

| | |
|---|---|
| Product | H2C Root Cause Analyst |
| Repo | https://github.com/h2c-DataSci/apollo-rca |
| Local clone | `/workspace/apollo-rca` (this checkout) |
| Branch | `main`, even with `origin/main` |
| HEAD | `9704444` Merge pull request #2 (2026-11-09) |
| Live | https://h2c-datasci.github.io/apollo-rca/ (Pages from `main` root) |
| Tests | `node --test` → **139 passed, 0 failed**, 11 suites, about 4.3s |
| Not this app | `/workspace` outside this folder is a separate Grok Build TanStack app. Do not treat it as the Pages site. |

## Latest commits

| SHA | What it did |
|---|---|
| `9704444` | Merge PR #2. Service worker keeps cache writes alive and bounds streamed copies. |
| `6950f70` | Merge PR #1. CI pins `actions/checkout` and `actions/setup-node`, `contents: read`, `persist-credentials: false`, 10-minute timeout, Dependabot for Actions. |
| `11034a2` | `apollo-rca-` cache prefix only, install fails if a shell asset is missing, runtime cache capped (40 entries, 7 days, 1.5 MB), nested HTML sanitizer, `frame-src` limited to YouTube nocookie, Feedback link. |
| `8a7b120` | STOP nodes `#d32f2f` white text. `?` nodes `#fbc02d` black text. |
| `2399a76` | Layout reservation, hydration date fix, offline shell, CSP, non-blocking Browser AI. Its message still says "grey STOP"; `8a7b120` replaced that color. |
| `e228805` | Local daemon stays on loopback. |
| `4552793` | Duplicate top RCA Coach panel removed. Bottom coach remains. |
| `c092be3` | Browser AI button for in-browser ONNX Qwen2.5-0.5B-Instruct. |

PR #1 and PR #2 are **merged**. Do not reopen that CI work unless asked. Do not edit `.github/` as a side effect of an app change.

## Behavior that must stay

- Subtitle: "Analysis based on Apollo RCA or RealityCharting principles and is an opensourced AI-aided Web Tool for RCA."
- About the developer: https://www.haroldhenrycabanilla.com (`h2c-help.js`, footer and Help drawer).
- Feedback, next to that credit, new tab, `rel="noopener noreferrer"`: https://docs.google.com/forms/d/e/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w/viewform
- Chart: black primary effect, red action `#dc2626`, green condition `#16a34a`, red STOP `#d32f2f` + white text, yellow `?` `#fbc02d` + black text. Legend matches. `h2c-shell.js` `enforceChartColors` reapplies this. Do not paint STOP or `?` grey.
- Help knowledge base stays. No copyrighted book images. Diagrams are original (`help-diagrams.js`).
- One-click New analysis with confirm and undo.
- Standard Mode works with AI off.
- Browser AI popup is dismissible. 150+ cause rows stay usable (`content-visibility` on those rows).
- CSP meta in `index.html`. `frame-src` is only `https://www.youtube-nocookie.com`. Iframes are created on click inside `h2c-videos.js`.
- Service worker cache names start with `apollo-rca-`. `activate` deletes only that prefix, and it keeps `apollo-rca-shell-v24` and `apollo-rca-runtime-v1`. A failed shell precache fails install.

## How to work

```bash
cd /workspace/apollo-rca
git status -sb          # must be even with origin/main before editing
node --test             # expect 139 pass unless you added tests
python3 -m http.server 8080
```

App source is the static root (`index.html`, `h2c-*.js`, `routes-v13.js`, `styles-v13.css`, `sw.js`). Bundled `routes-v13.js` is edited in place; there is no separate app build step in this repo.

Cache-bust query: `h2c-shell.js` is `v=22`, `h2c-help.js` and `h2c-videos.js` are `v=24`, `local-ai-bridge.js` is `v=21`. Bump the query when that file changes. Episode 6 is `https://youtu.be/Q4-Bu2qUaaE` (`Q4-Bu2qUaaE`, `07:20`). Sync Official Durations reads the YouTube player length. Verified lengths: `55:50`, `20:22`, `07:57`, `06:59`, `08:19`, `07:20`, `07:10`.

## Known gaps

- No `LICENSE` file in the tree, though the UI and README say MIT.
- `index.html` script and stylesheet URLs use the `/apollo-rca/` prefix, so a server started at the repo root does not match Pages path-for-path unless a prefix is added.
- Commit `2399a76` message is historically wrong about STOP color. Trust `8a7b120` and the colors above.
- An older `h2c-rca-shell-*` Cache Storage entry, if a browser still has it, is not deleted, because it does not use the `apollo-rca-` prefix.
- Pages deployment is the built-in branch deployment from `main`. It is not the CI workflow.

## Do not

- Change workflows, Dependabot, or branch protection unless the task is CI.
- Merge a PR or click Publish unless asked.
- Point the daemon at anything except loopback `127.0.0.1:11434` or `localhost:11434`.
- Let AI write authoritative case state without an explicit accept.
- Reintroduce a second RCA Coach panel at the top.
