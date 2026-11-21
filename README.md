# H2C Root Cause Analyst

Independent, privacy-first web tool for investigations that follow Apollo RCA and RealityCharting principles. The investigator stays in control. Standard Mode does not need AI or a network.

- Live site: [https://h2c-datasci.github.io/apollo-rca/](https://h2c-datasci.github.io/apollo-rca/)
- Repository: [h2c-DataSci/apollo-rca](https://github.com/h2c-DataSci/apollo-rca)
- Developer: [www.haroldhenrycabanilla.com](https://www.haroldhenrycabanilla.com)
- Feedback: [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w/viewform)
- Training channel: [youtube.com/@h2c_Learnings](https://www.youtube.com/@h2c_Learnings)
- Current handoff: [PROGRESS.md](PROGRESS.md)
- Earlier starting point: `b1afdd3` on `main` (2026-11-09). The sequence below is the current investigation order.

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

Seven steps, in page order: Define, Timeline, Evidence, Chart, Solutions, Schedule, Download.

- Up to three primary effects.
- Each causal set is an action plus at least one condition.
- Order on the page: problem definition, timeline, then the evidence and hypothesized causes, then Generate RealityChart. Each observation needs the cause it supports, labelled as a hypothesis. Layer 1 is a direct cause of the primary effect. Layers 2, 3, and 4 are deeper causes and must name the cause they explain. The chart is not generated until that list is complete.
- The chart is editable and drawn at a readable size. Fit keeps titles readable, so a wide stacked chart can extend past the panel. Drag empty space to pan, including to the right-hand side. Zoom in, Zoom out, and the wheel zoom toward the pointer. Click a cause to open the inspector. Double-click a title to edit it. The And/Or junction follows the verified-cause checkbox for that whole cause set. Adding, renaming, or removing a cause updates the evidence table, and edits in the table update the chart. Evidence fields stack so the hypothesized-cause label, the layer list, and the typed cause stay fully visible.
- When the chart is final, Generate blank solution matrix and corrective actions opens an empty matrix and schedule. Download stays off until every action, the person responsible, and the due date are filled. The caption names each missing piece. Cost / ROI does not block the report. On a narrow screen the corrective-action and action-item tables stack as cards.
- RCA Coach can check each step. The final check becomes available with Download. Coach comments are optional. The investigator keeps the final say. The lead investigator field is labelled Lead investigator. Times use 24-hour form. Money is shown as dollars, for example $18,500. Ctrl+Z or Cmd+Z undoes a removed timeline row or primary effect. Where is required.
- Load sample case opens a finished fictional haul-truck fire example. The chart is interactive and already has evidence, a STOP, a Need More Info marker, and a filled solution matrix.
- Chart colors: primary effect black `#111827` with white text, action `#dc2626`, condition `#16a34a`, STOP `#d32f2f` with white text, unknown `?` `#fbc02d` with black text.
- Evidence tiers: Sensed, Inferred, Intuited, Emotional. Missing evidence shows `?`.
- The downloaded PDF follows problem definition, timeline, evidence, the chart, then the summary, solutions, corrective actions, action items, and causal log. Reports export as PDF, and as ZIP when one file would damage figures.
- One-click New analysis, with confirm and undo. Open case (JSON) reloads a Cause Chart_Project_State.json export; a project JSON dropped on evidence is offered as an import, not stored as an evidence row.
- Help knowledge base and a Feedback link next to About the developer.
- Offline shell via `sw.js` (`apollo-rca-` caches only). The current shell cache is `apollo-rca-shell-v68`. Script queries: shell `v=50`, help `v=36`, help knowledge `v=29`, diagrams `v=24`, videos `v=27`, local bridge `v=28`, coach steps `v=2`. Secondary workspace tools (`QA / Stress Test Suite`, `Load full test case`, `Browser AI`, `Legal & Trademarks`) sit in the header `Tools ▾` menu; the Workflow Navigator offers an optional `Focus mode` toggle; RealityChart exports (`PNG`, `SVG`, `JSON`) sit in an `Export ▾` dropdown; RCA Coach tasks are grouped into category tabs; JSON imports enforce a 5 MB cap, strip/warn on embedded API keys, and use inline notices instead of raw browser alerts; and `setSafeHtml` enforces a strict tag/attribute allowlist.

## AI

AI is optional. There is one **RCA Coach** panel. Connect a model at the top of that panel:

| Path | Setup |
|---|---|
| Local AI | Start Ollama or LM Studio, choose that local runtime, leave the loopback address or enter your loopback server URL, then Test connection. Select an installed model. No folder path or API key is needed. |
| Free cloud | Choose Groq, Google AI, OpenRouter, or Hugging Face Inference and a listed free model. The panel links each provider's key page and shows the setup steps. Groq offers `openai/gpt-oss-20b` (the default), `openai/gpt-oss-120b`, and `qwen/qwen3.8-27b`. Classifier models are not listed. Google AI offers `gemini-3.8-flash` (the default for that provider), `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemma-4-31b-it`, and `gemma-4-26b-a4b-it`. A quota error does not switch models. Paste your own key, authorize processing, and Test connection. Your own account's limits apply. |
| Paid cloud | Choose OpenAI, DeepSeek, Mistral, Anthropic, or Other / custom provider. DeepSeek fills in `https://api.deepseek.com/v1` and selects `deepseek-flash`, which is DeepSeek-V4.1-Flash-1017. `deepseek-v4-pro` is the other listed model. Enter your key, authorize processing, and Test connection. A custom provider needs a name, base URL, API style (OpenAI-compatible, Anthropic, or Gemini), model, and a key unless the URL is a keyless local server. Optional extra headers go only to that URL. |

Then choose **Enable AI Assistant**, confirm **Enable assistant**, and run a Coach task, or use **Ask coach about this step** on each stage. AI suggestions require investigator review; deterministic BLOCK decisions remain enforced. Existing Browser AI remains available separately as an optional on-device model download. Its Transformers.js file and the ONNX Runtime wasm files are stored with the app and checked with sha384; the model weights are still downloaded from Hugging Face when that option is used.

No Cloudflare account, shared API key, hosted AI proxy or application-owned inference backend is used. Cloud requests go directly to the provider you choose. Free mode restricts provider/model IDs and never falls back to paid models. A free model label does not verify your account's billing settings; use provider spending controls. Provider access, model availability, retention and terms can change. Groq users should review their account's Zero Data Retention controls. Google free-tier prompts may be used by Google to improve its products. OpenRouter may route to different underlying free providers.

**The case draft is restored when this tab reloads and is dropped when the tab closes.** API keys stay in memory only unless you tick Remember key on this device (off by default). Disconnect & clear key removes a remembered key. Keys are never written into exports or reports. Closing the tab or a crash drops the draft. Download reports before leaving. Existing older browser-saved data is not automatically loaded or deleted: the session notice offers a recovery download (excluding the old API-key configuration) and explicit deletion. Other browser preferences and app assets may still be cached. The draft uses this tab's session storage, not long-term storage. Browser/OS behavior and external provider retention cannot be universally guaranteed.

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

The current test count and HEAD are recorded in [PROGRESS.md](PROGRESS.md). Node 18, 20, and 22 are the CI matrix (Ubuntu and Windows).

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
| `session-store.js` / `provider-presets.js` | Case draft for this tab (restored on reload, dropped when the tab closes) and public provider connection presets. |
| `local-ai-bridge.js` | Ollama on `127.0.0.1:11434`, or a user-supplied HTTPS API. No cloud fallback. |
| `coach-deeper.js` | Longer reviews: whole chart, next interview, solution screen, and full report audit. |
| `sw.js` | App-shell cache. Install fails if a shell file is missing. Runtime cache is capped. |
| `rca.test.mjs` and `test/` | Node test runner. No package install required. |

There is no `local-bridge.js` or `ai-coach.js`. Those names in older notes are wrong.

## AI transport and privacy

The existing short coach buttons stay. Under the RCA Coach controls, four longer reviews use the same connected model once: review the whole chart, plan the next interview, screen solutions, and audit every section of the formal report. On a Free or Paid API, Audit full report also returns a section check for problem definition, the chart, evidence, and solutions. Those notes appear on the matching step, in the on-screen report, and in the PDF, Markdown, and project JSON when Include RCA Coach API Audit in Report is checked. Local AI keeps the single review and does not show those notes. A failed or partial answer changes nothing in the chart. The audit is kept with the case for this tab and is not written to long-term storage. The legal notice stays at the bottom of the page, after the report download line. `local-ai-bridge.js` holds configuration in memory, enforces consent and free-provider restrictions, aborts streams and rejects partial failed output. Model-list tests make no inference calls. Groq reasoning requests use a bounded completion budget, low reasoning effort and JSON output; other providers use their supported payloads.

`session-store.js` holds the case draft, hypotheses, notes and clear/undo backups for this browser tab. A reload restores that draft. Closing the tab drops it. It is not long-term storage, and it is not `localStorage`. Shell and Help wait for the editor's first React commit before modifying the page. The current service-worker shell reloads assets on install and runtime cache v2 retires stale runtime entries; credential-bearing requests and cross-origin inference are excluded from caching.

Local mode enforces loopback. The website cannot start Ollama, install models, inspect folders or change OLLAMA_MODELS. On this Windows computer keep Ollama runtime on C: and its existing models at D:\Ollama\models. A read-only check found installed `qwen3.5:4b` and `qwen3.5:2b`; no model was run or downloaded. No local companion has been installed.

Implementation verification: the current `node --test` count is in [PROGRESS.md](PROGRESS.md). Earlier browser checks used mocked answers, a credential-free model-list request, a sample report download, and an offline reload. The automated suite still does not send a real API key or run a live model. GitHub Pages publishes `main`.

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

Source is MIT. See [LICENSE](LICENSE). Methodology and trademarks remain with Dean L. Gano and Apollonian Publications, LLC.

## Developer tooling: Elephant-Goldfish Model

Google's [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) (EGM) helps develop specifications with project context and review them with fresh agents. The complete EGM plugin was installed through the supported Codex CLI on 2026-11-14; its manifest reports version 0.1.1. It is developer tooling, separate from the website and its local AI models.

Read [INSTRUCTION.md](INSTRUCTION.md) for installation commands, the seven EGM skills, review requirements, and application commands. Start a fresh Codex session and select an EGM skill from the skill picker. Desktop skill discovery and a full Goldfish review still need verification in that fresh session.

Local checkout: `D:\ApolloRCA_webapp`, tracking `origin/main`. Use `node --test` to run the application tests. Keep this README as product context and PROGRESS.md as the task handoff.

## Three-path RCA Coach implementation

The design and remaining limitations are in [docs/AI_COACH_PLAN.md](docs/AI_COACH_PLAN.md). Local AI, free BYOK cloud, and paid BYOK cloud are implemented in the repository. The seven-step workflow and report formats remain. Automatic local startup still requires an optional separately installed companion and is not implemented by the website.

Hard usage rule: no runtime resets, credit purchases, paid upgrades or additional spend; test inference with mocks and checkpoint before resource limits. No automatic paid fallback. README.md and PROGRESS.md must be updated for every task. Disclaimers supplement controls; do not promise absolute zero retention across external services.

Git workflow: a local commit records the reviewed implementation; it does not publish to GitHub Pages. Push or publication is a separate action.
