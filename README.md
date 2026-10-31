# H2C Root Cause Analyst

Production: https://h2c-datasci.github.io/apollo-rca/ · Embedded at https://sites.google.com/view/h2ccreates-reality-charting
By h2c_Creates. A free, static, browser-only root cause analysis workspace (seven steps: Define, Causes, Chart, Evidence, Test, Solutions, Track) with an **optional local AI RCA Coach** and a **deterministic methodology enforcement layer**. The method is "inspired by" the Apollo root cause approach; this project is not affiliated with its originators.

**Investigator responsibility:** the investigator owns every conclusion. The tool never declares a root cause, never assigns blame, and never writes AI text into the case without an explicit Accept.

## Modes
- **Standard Mode** (default, no AI, no downloads): the complete RCA workflow plus the rule-based *Rule check* and integrity checks in the coach drawer.
- **AI-Assisted Mode** (explicit opt-in): *Enable AI Assistant* → privacy notice, ~400 MB download notice, capability check, progress, cancel, *Unload / Disable AI*. Inference runs in a Web Worker.

## Architecture
| Layer | Files | Role |
|---|---|---|
| Methodology registry | `rca-principles.js` | Principles P01–P15 (hard/warning), and the versions `analysis-principles-v1.0`, `coach-system-v1.2`, `integrity-reviewer-v1.0`, `schemas-v1.1`. All prompts are generated from this registry. |
| A — deterministic rules | `rca-rules.js`, `rca-integrity.js` | Pure functions. Principle checks, evidence-ID binding, contradiction vs validated timeline, abstention recognition, PASS/WARN/BLOCK. |
| B — local AI Coach | `ai-config.js`, `ai-service.js`, `ai-parser.js`, `ai-transport.js`, `ai-worker.js` | 14 task-specific prompts with JSON schemas, strict parsing and sanitising, independent second-pass Integrity Reviewer. |
| C — investigator decision | `coach-ui.js`, `case-io.js` | Suggestion cards with Accept / Modify / Reject, undo, provenance, export/import. |

The compiled RCA app (`index.html`, `index-*.js`, `routes-*.js`, `styles-*.css`) is the Grok Build output; only branding, base path (`basepath: /apollo-rca`), head links and a few labels were patched. The coach is an additive overlay module; if it fails the app is unaffected.

## Validation pipeline (every high-impact AI output)
generate → parse → schema validate → hard rule validate → evidence-ID validate → AI Integrity Review (second pass, may only *escalate*) → contradiction check → **PASS / WARN / BLOCK** → investigator decision.
- **PASS**: no material concern; review and accept normally. Abstention ("Insufficient evidence to determine") is PASS by design.
- **WARN**: concern and principle IDs shown; accept only after an explicit confirmation. If the AI reviewer is unavailable the result is at least WARN ("Integrity review unavailable").
- **BLOCK**: Accept is disabled, the principle IDs and reasons are shown; you may Modify (re-reviewed on every Accept), Regenerate, or Reject. Blocked text cannot enter the case; Accept re-validates the current text so DOM tampering cannot bypass it.
- **Evidence binding:** evidence IDs are `EVID-<record id>` from the case's real evidence records. Unknown, malformed or AI-invented IDs are P02 BLOCK. Duplicate IDs are reported.
- Accepted AI content is stored only as *AI-assisted notes* (status `ai-assisted` or `hypothesis`) with provenance: task, model ID, prompt/reviewer/principle/schema versions, reviewer decision, principle IDs, user action, timestamp, source IDs. No chain-of-thought is stored. Rejections store metadata only.

## Principles
P01 Evidence before conclusion · P02 No invented evidence · P03 Observation vs inference · P04 Hypotheses remain hypotheses · P05 No person as root cause · P06 No unsupported blame · P07 Preserve uncertainty · P08 Sequence ≠ causation · P09 Contradictions surfaced · P10 Corrective action addresses cause · P11 Consequence ≠ cause · P12 Missing control ≠ proven cause · P13 Source fidelity · P14 Investigator authority · P15 No autonomous final root cause. Deterministic checks are heuristics (keyword/pattern based); they catch the common failure modes listed in the golden scenarios but are not a substitute for investigator judgement. Raw notes are unrestricted; the checks apply to analytical findings and AI output.

## Model
`onnx-community/Qwen2.5-0.5B-Instruct` via Transformers.js 3.7.6, loaded at runtime from jsDelivr and Hugging Face (not in git; cached by the browser). WebGPU (q4f16) preferred, WASM (q4, `onnx/model_q4.onnx`) fallback. Change the model only in `ai-config.js`; after any model or prompt change rerun `npm test` (includes golden scenarios `golden-*.json`).

## Privacy
Investigation data stays in your browser (localStorage `realitychart-intake-v1`). No analytics, telemetry or cloud AI call; the page loads no third-party fonts or scripts. With AI enabled the browser additionally downloads the library (jsDelivr) and model files (Hugging Face); those requests contain no investigation text. *Reset local data* deletes the case and AI notes. GitHub Pages itself sees normal page requests.

## Export / import
Drawer → *Export case (JSON)* (case + AI notes + versions). *Import* validates format, effects, timeline, unique evidence IDs and notes; malformed files are rejected without changes; imported AI notes are never promoted to validated findings. The app's own PDF/ZIP report export is unchanged.

## Develop / test / deploy
- `npm test` (Node ≥ 20, zero dependencies): rules, principles A–J scenarios, evidence binding, reviewer rubber-stamp resistance, mocked AI pipeline (malformed/empty/huge/crash), export/import, base path, privacy/secrets checks, golden scenarios.
- Local: put the files in a folder named `apollo-rca` and serve its parent (`python3 -m http.server`), open `/apollo-rca/`.
- Deploy: GitHub Pages from `main` / (root); no build step and no Actions workflow (static files). Troubleshooting: hard-refresh after deploys (Pages caches ~10 min); if AI fails, check the status text in the drawer and retry; Standard Mode is always available.

## Browser support
Chrome/Edge (desktop) primary. Firefox/Safari: Standard Mode; AI only where Workers/WASM work. Mobile or low-memory devices (<4 GB reported) have AI disabled by the capability check.

## Known limitations
- No application source in this repo (compiled bundle); controls are an overlay rather than native components.
- A 0.5B model is weak; the deterministic layer is the authority. Local model inference was not verified end-to-end in the release-QA environment (model download did not complete there); verify in your own Chrome before relying on AI features.
- Causes live in the compiled app's chart state, which the overlay cannot read; cause-level checks use the text you select or paste.
- Heuristic principle checks can have false positives/negatives.

## Licenses
Application bundle: generated with Grok Build for h2c_Creates. Qwen2.5-0.5B-Instruct: Apache-2.0 (Alibaba Qwen); the ONNX conversion repo `onnx-community/Qwen2.5-0.5B-Instruct` carries no explicit license tag (it inherits the base model's Apache-2.0 — verify before redistribution). Transformers.js: Apache-2.0 (Hugging Face). ONNX Runtime Web: MIT. React / TanStack Router (in bundle): MIT. This project does not claim ownership of any third-party model.
