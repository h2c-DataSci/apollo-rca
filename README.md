# H2C Root Cause Analyst

Independent, privacy-first web tool for investigations that follow Apollo RCA and RealityCharting principles. The investigator stays in control. Standard Mode does not need AI or a network.

- Live site: [https://h2c-datasci.github.io/apollo-rca/](https://h2c-datasci.github.io/apollo-rca/)
- Repository: [h2c-DataSci/apollo-rca](https://github.com/h2c-DataSci/apollo-rca)
- Developer: [www.haroldhenrycabanilla.com](https://www.haroldhenrycabanilla.com)
- Feedback: [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w/viewform)
- Training channel: [youtube.com/@h2c_Learnings](https://www.youtube.com/@h2c_Learnings)
- Current handoff: [PROGRESS.md](PROGRESS.md)
- Baseline: `b1afdd3` on `main` (2026-11-09). That commit is the accepted starting point. Later work is a change on top of it.

## Documentation rule

Hard rule for this project: every task updates both files before the work is called done.

- [PROGRESS.md](PROGRESS.md) is the running log. Update it on every task so the next session can see where the work stopped.
- This README is the standing description of the product. Update it when behavior, commands, or file roles change.

This repository is the GitHub Pages app. It is a static site at the repo root. It is not the separate Grok Build workspace that may sit next to this clone.

## Legal

Apollo Root Cause Analysis and RealityCharting were created by Dean L. Gano (Apollonian Publications, LLC). Those names are their trademarks. This tool is an independent educational prototype by Engr. Harold Henry G. Cabanilla. It is not affiliated with, endorsed by, or certified by Dean L. Gano or Apollonian Publications.

Official software: [realitycharting.com](https://realitycharting.com/home/).

Help text is original summary guidance. Do not copy book pages or copyrighted figures into the app. Diagrams in `help-diagrams.js` are original SVG.

## What the app does

Seven steps: Define, Causes, RealityChart, Evidence, Test, Solutions, Track.

- Up to three primary effects.
- Each causal set is an action plus at least one condition.
- Chart colors: primary effect black `#111827` with white text, action `#dc2626`, condition `#16a34a`, STOP `#d32f2f` with white text, unknown `?` `#fbc02d` with black text.
- Evidence tiers: Sensed, Inferred, Intuited, Emotional. Missing evidence shows `?`.
- Reports export as PDF, and as ZIP when one file would damage figures.
- One-click New analysis, with confirm and undo.
- Help knowledge base and a Feedback link next to About the developer.
- Offline shell via `sw.js` (`apollo-rca-` caches only).

## AI

AI is optional. It never writes the case until the investigator accepts. A BLOCK from the rules cannot be accepted.

| Mode | Where it runs | Notes |
|---|---|---|
| Standard | Browser only | No model. Full chart and report. |
| Local daemon | `http://127.0.0.1:11434` only | Ollama or an OpenAI-compatible local server. Loopback is enforced. |
| Browser AI | ONNX `onnx-community/Qwen2.5-0.5B-Instruct` | The only model that runs inside the browser. The popup explains why other models stay on a local server. |

Rules live in `rca-principles.js`, `rca-rules.js`, and `rca-integrity.js` (P01–P15).

## Run locally

```bash
git clone https://github.com/h2c-DataSci/apollo-rca.git
cd apollo-rca
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). The live Pages site adds the `/apollo-rca/` prefix; asset URLs in `index.html` already use that prefix, so local viewing of images and modules is most faithful behind a `/apollo-rca/` path (or the published site).

```bash
node --test
```

On 2026-11-13 the suite was **140 passed, 0 failed**. Node 18, 20, and 22 are the CI matrix (Ubuntu and Windows). The accepted baseline remains `b1afdd3`; later commits are fixes on top of it.

## Files that matter

| File | Role |
|---|---|
| `index.html` | Pages entry, CSP, reserved layout, script hashes |
| `routes-v13.js` | Chart, coach, report UI (bundled) |
| `styles-v13.css` | Theme and chart swatches |
| `h2c-shell.js` | Toolbar, workflow hub, sanitizer, chart-color enforcement. The hub does not move React's step list. |
| `h2c-help.js` | Help drawer, developer credit, Feedback link |
| `help-kb.js` / `help-diagrams.js` | Knowledge text and original diagrams |
| `h2c-videos.js` | Seven YouTube episodes. Players load from `youtube-nocookie.com` only after a click. Sync Official Durations reads the player length. |
| `browser-ai.js` | In-browser ONNX loader |
| `local-ai-bridge.js` | Loopback daemon client |
| `sw.js` | App-shell cache. Install fails if a shell file is missing. Runtime cache is capped. |
| `rca.test.mjs` and `test/` | Node test runner. No package install required. |

There is no `local-bridge.js` or `ai-coach.js`. Those names in older notes are wrong.

## Training videos

Official series on [@h2c_Learnings](https://www.youtube.com/@h2c_Learnings). Open them from the floating **7 Videos** button. Help opens from the floating **? Help** button. The toolbar copies of both were removed. Lengths below are the player durations checked on 2026-11-09. Sync Official Durations refreshes them from YouTube.

| Ep | Duration | Video |
|---|---|---|
| 1 | 55:50 | [IXXgr85wO74](https://youtu.be/IXXgr85wO74) |
| 2 | 20:22 | [tCQuu_rvSJ8](https://youtu.be/tCQuu_rvSJ8) |
| 3 | 07:57 | [8y501jMIS7k](https://youtu.be/8y501jMIS7k) |
| 4 | 06:59 | [lppZuZFyHzM](https://youtu.be/lppZuZFyHzM) |
| 5 | 08:19 | [yBVaGu31ik8](https://youtu.be/yBVaGu31ik8) |
| 6 | 07:20 | [Q4-Bu2qUaaE](https://youtu.be/Q4-Bu2qUaaE) |
| 7 | 07:10 | [_w5WUcNRYWU](https://youtu.be/_w5WUcNRYWU) |

## Invariants

- Do not change `.github/workflows`, Dependabot, or branch protection unless that is the task. CI hardening landed in merged PR #1. Service-worker lifetime fixes landed in merged PR #2.
- Do not merge or publish unless asked.
- Keep the About the developer link. Keep the Help knowledge base.
- `frame-src` is `https://www.youtube-nocookie.com` only.
- `activate` deletes Cache Storage names that start with `apollo-rca-` and are not the current shell or runtime cache. It must not delete other caches on the origin.
- Hydration: do not read `Date`, `localStorage`, or `window` during the first render. Shell DOM waits until `$_TSR.hydrated`.
- Shell HTML goes through `setSafeHtml` in `h2c-shell.js`.

## License

Source is intended as MIT. A `LICENSE` file is not in the tree yet. Methodology and trademarks remain with Dean L. Gano and Apollonian Publications, LLC.
