# H2C Root Cause Analyst

Production: https://h2c-datasci.github.io/apollo-rca/ · Embedded at https://sites.google.com/view/h2ccreates-reality-charting

A free, static, browser-only root cause analysis workspace (seven-step Apollo-style method: Define, Causes, Chart, Evidence, Test, Solutions, Track) with an **optional local AI RCA Coach**. By h2c_Creates. The method is "inspired by" the Apollo root cause approach; this project is not affiliated with or endorsed by its originators.

## Modes
- **Standard Mode** (default): the complete RCA workflow with no AI, no model download.
- **AI-Assisted Mode**: user clicks *Enable AI Assistant* in the RCA Coach drawer (pill at bottom right, or the chip that appears beside a focused field). A capability check runs, the ~400 MB model download is disclosed, then it loads in a Web Worker with progress, cancel, and *Unload / Disable AI*.

## Architecture (three layers)
| Layer | Files | Role |
|---|---|---|
| A — deterministic rule engine | `rca-rules.js` | Primary-effect length/blame/person/implied-cause checks, cause-statement checks, keyword evidence-support, action alignment, timeline sentence extraction. No model, no DOM. |
| B — local AI Coach (advisory) | `ai-config.js`, `ai-service.js`, `ai-parser.js`, `ai-transport.js`, `ai-worker.js` | Ten task-specific prompts with JSON schemas, strict validation/sanitisation, status machine (disabled/unsupported/loading/ready/generating/error), injectable transport (mocked in tests). |
| C — investigator decision | `coach-ui.js` | Every suggestion card is labelled **AI suggestion — investigator validation required** with Accept / Modify / Reject. Nothing changes investigation data without Accept. Undo for inserted text/rows. Non-field outputs (questions, gaps, hypotheses, summaries, narratives) are saved only as *AI-assisted notes*, never as validated findings. |

The original RCA app (`index.html` + `index-*.js`, `routes-*.js`, `styles-*.css`) is the Grok Build output, preserved unchanged apart from branding and base-path fixes. The coach is an additive overlay (`coach-ui.js` loaded as a module); if it fails, the app is unaffected.

AI tasks: `reviewPrimaryEffect`, `rewritePrimaryEffect`, `extractTimelineCandidates`, `reviewCauseStatement`, `identifyEvidenceGaps`, `generateClarifyingQuestions`, `suggestHypothesisBranches`, `reviewCorrectiveActionAlignment`, `summarizeInvestigation`, `draftInvestigationNarrative`.

## Model
`onnx-community/Qwen2.5-0.5B-Instruct` (Apache-2.0) via `@huggingface/transformers` 3.7.6 (Apache-2.0), loaded at runtime from jsDelivr and the Hugging Face model host. WebGPU (q4f16) is preferred with WASM (q4) fallback. Weights are **not** in this repo; the browser caches them. Change the model in `ai-config.js` only.

## Privacy
Investigation data stays in your browser (localStorage key `realitychart-intake-v1`). No analytics, no telemetry, no cloud AI call, no API keys. The only network traffic added by AI is fetching the library and model files. *Reset local data* in the drawer deletes investigation data and AI notes.

## AI limitations
A 0.5B local model is small: it can miss issues, produce weak wording, or fail to return valid JSON (then nothing is inserted and you can retry). It is advisory only, never declares root causes, and must not be used to assign blame. First use needs a ~400 MB download and a reasonably capable desktop browser; mobile/low-memory devices stay in Standard Mode.

## Develop / test / deploy
- Test: `npm test` (Node ≥ 20, no dependencies; 16 tests: rules, parser, mocked AI service, invalid output, unsupported/failed load, base path, no secrets/network in client code).
- Serve locally: place the files under a folder named `apollo-rca` and run `python3 -m http.server` one level up, then open `/apollo-rca/`.
- Deploy: GitHub Pages from `main` / (root) of `h2c-DataSci/apollo-rca`; all asset URLs are prefixed `/apollo-rca/`. The app's built bundle has no source in this repo (see limitations).

## Known limitations / backlog
- Only the compiled bundle exists, so AI controls are an overlay (floating chip + drawer) rather than native React components; "Check evidence gap", "Review cause alignment" and "Draft narrative" are in the drawer instead of inline.
- No GitHub Actions workflow yet (Pages serves the static files directly). Backlog: Vite source project, Actions deploy, Playwright E2E, richer undo history, model self-hosting evaluation.
- The bundled router expects to run at `/`, so `index.html` temporarily rewrites the address to `/` while the app starts, then restores `/apollo-rca/`. `404.html` redirects stray paths to the app. Deep links inside the app are not supported.

## Licenses
App bundle: generated with Grok Build for h2c_Creates. Qwen2.5-0.5B-Instruct: Apache-2.0 (Alibaba Qwen team). Transformers.js: Apache-2.0 (Hugging Face). ONNX Runtime Web: MIT.
