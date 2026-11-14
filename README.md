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

AI is optional. Open **RCA Coach**, then use **Connect your RCA Coach** above the workbench:

| Path | Setup |
|---|---|
| Local AI | Start Ollama, leave the loopback address or enter your loopback server URL, then Test connection. Select an installed model. No folder path is needed. |
| Free cloud | Choose Groq or OpenRouter and a listed free model. Follow Get your key, paste your own key, authorize processing, and Test connection. Your own account's limits apply. |
| Paid cloud | Choose OpenAI or Other OpenAI-compatible API. Enter your key, test to discover models, select a model and authorize processing. Custom APIs require their HTTPS base URL and compatible browser access. |

Then choose **Enable AI Assistant**, confirm **Enable assistant**, and run a Coach task. AI suggestions require investigator review; deterministic BLOCK decisions remain enforced. Existing Browser AI remains available separately as an optional on-device model download.

No Cloudflare account, shared API key, hosted AI proxy or application-owned inference backend is used. Cloud requests go directly to the provider you choose. Free mode restricts provider/model IDs and never falls back to paid models. A free model label does not verify your account's billing settings; use provider spending controls. Provider access, model availability, retention and terms can change. Groq users should review their account's Zero Data Retention controls; OpenRouter may route to different underlying free providers.

**Cases and keys now stay in tab memory. Reloading, closing the tab or a crash loses unsaved work. Download reports before leaving.** Existing older browser-saved data is not automatically loaded or deleted: the session notice offers a recovery download (excluding the old API-key configuration) and explicit deletion. Other browser preferences and app assets may still be cached. No app-controlled persistent investigation storage is used; browser/OS behavior and external provider retention cannot be universally guaranteed.

Download report uses the existing PDF/ZIP flow. ZIP packages include the PDF, full-size chart SVG/PNG, action CSV and project JSON. Print remains available. Browser settings determine the folder prompt; enable Ask where to save if desired. Downloaded files may remain in backups or synced folders.

Privacy, accuracy, costs, local setup limitations and saving-work notices appear in the connection panel. Reports contain an AI accuracy disclaimer. See [INSTRUCTION.md](INSTRUCTION.md) for detailed steps.

Rules live in `rca-principles.js`, `rca-rules.js`, and `rca-integrity.js` (P01–P15).

## Run locally

```bash
git clone https://github.com/h2c-DataSci/apollo-rca.git
cd apollo-rca
npm run serve
```

Open [http://127.0.0.1:8080/apollo-rca/](http://127.0.0.1:8080/apollo-rca/). The preview server maps the published `/apollo-rca/` path correctly, binds only to this computer, and requires no Python or package installation. Choose another port with `node scripts/serve.mjs 8081`.

```bash
node --test
```

The pre-change baseline was **147 passed, 0 failed**. Current implementation validation is recorded in PROGRESS.md. Node 18, 20, and 22 are the CI matrix (Ubuntu and Windows). The accepted baseline remains `b1afdd3`; later commits are fixes on top of it.

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
| `session-store.js` / `provider-presets.js` | Memory-only case storage and public provider connection presets. |
| `local-ai-bridge.js` | Ollama on `127.0.0.1:11434`, or a user-supplied HTTPS API. No cloud fallback. |
| `sw.js` | App-shell cache. Install fails if a shell file is missing. Runtime cache is capped. |
| `rca.test.mjs` and `test/` | Node test runner. No package install required. |

There is no `local-bridge.js` or `ai-coach.js`. Those names in older notes are wrong.

## AI transport and privacy

`provider-presets.js` contains public connection metadata only. `local-ai-bridge.js` holds configuration in memory, enforces consent and free-provider restrictions, aborts streams and rejects partial failed output. Model-list tests make no inference calls. Groq reasoning requests use a bounded completion budget, low reasoning effort and JSON output; other providers use their supported payloads.

`session-store.js` holds case data, hypotheses, notes and clear/undo backups in memory. The active bundled editor and shell share this store. Shell and Help wait for the editor's first React commit before modifying the page. Service worker shell v27 reloads assets on install and runtime cache v2 retires stale runtime entries; credential-bearing requests and cross-origin inference are excluded from caching.

Local mode enforces loopback. The website cannot start Ollama, install models, inspect folders or change OLLAMA_MODELS. On this Windows computer keep Ollama runtime on C: and its existing models at D:\Ollama\models. A read-only check found installed `qwen3.5:4b` and `qwen3.5:2b`; no model was run or downloaded. No local companion has been installed.

Implementation verification: 164 automated tests passed, plus synthetic mocked inference in isolated Edge, real credential-free browser model-list connectivity, a sample report download, and a real service-worker offline reload. Authenticated live inference and published-site validation remain pending; no API keys, paid inference or Cloudflare account were used. Publication to origin/main was authorized on 2026-11-14; the branch-managed Pages deployment publishes the site after push.

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

## Developer tooling: Elephant-Goldfish Model

Google's [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) (EGM) helps develop specifications with project context and review them with fresh agents. The complete EGM plugin was installed through the supported Codex CLI on 2026-11-14; its manifest reports version 0.1.1. It is developer tooling, separate from the website and its local AI models.

Read [INSTRUCTION.md](INSTRUCTION.md) for installation commands, the seven EGM skills, review requirements, and application commands. Start a fresh Codex session and select an EGM skill from the skill picker. Desktop skill discovery and a full Goldfish review still need verification in that fresh session.

Local checkout: `D:\ApolloRCA_webapp`, tracking `origin/main`. Use `node --test` to run the application tests. Keep this README as product context and PROGRESS.md as the task handoff.

## Three-path RCA Coach implementation

The design and remaining limitations are in [docs/AI_COACH_PLAN.md](docs/AI_COACH_PLAN.md). Local AI, free BYOK cloud, and paid BYOK cloud are implemented in the repository. The seven-step workflow and report formats remain. Automatic local startup still requires an optional separately installed companion and is not implemented by the website.

Hard usage rule: no runtime resets, credit purchases, paid upgrades or additional spend; test inference with mocks and checkpoint before resource limits. No automatic paid fallback. README.md and PROGRESS.md must be updated for every task. Disclaimers supplement controls; do not promise absolute zero retention across external services.

Git workflow: a local commit records the reviewed implementation; it does not publish to GitHub Pages. Push or publication is a separate action.
