# Progress

Hard rule: update this file after every task, and update [README.md](README.md) when the product description changes. This file is how the next session avoids getting lost. README keeps the standing context.

## Now

| | |
|---|---|
| Product | H2C Root Cause Analyst |
| Repo | https://github.com/h2c-DataSci/apollo-rca |
| Clone | `D:\ApolloRCA_webapp` |
| Branch | `main`, even with `origin/main` |
| HEAD | The editable chart is the tip of `main`. The previous sample-report change was `a3b54e9`. |
| Live | https://h2c-datasci.github.io/apollo-rca/ |
| Tests | `node --test` → 194 passed, 0 failed. |
| Not this app | Anything in `/workspace` outside this folder. That tree is a separate Grok Build app. |

## Work log

Newest first. Add a row for each task. Do not delete older rows.

| When | SHA | Done |
|---|---|---|
| 2026-11-16 | `f8f26d7` | The chart is editable again. Clicking a node no longer starts a pan, so the inspector opens. Double-click focuses the title. Drag empty space to pan. Zoom in, Zoom out, the wheel, and Fit all work. Add cause set and Remove node stay in the inspector. Service-worker cache is v47. |
| 2026-11-16 | `a3b54e9` | Load sample case builds the chart and report immediately. Generate chart and RCA report sits under the timeline and is hidden for the sample. It remains for a real case. Help text matches. Service-worker cache is v46. |
| 2026-11-16 | `5940a77` | A case with one primary effect no longer shows both "Own timeline and evidence" and the shared Timeline. The extra control stays only when there are two or three primary effects. Service-worker cache is v45. |
| 2026-11-16 | `372ed9a` | Housekeeping. Only `main` is checked out, and it matches `origin/main`. Cache queries match the service worker: shell `v=41`, cache `apollo-rca-shell-v44`. No unused file was removed. The vendored Transformers file, the ONNX wasm files, `rolldown-runtime-v11.js`, `404.html`, and the loaded bundles stay. Open pull requests left as they are: #9 gitleaks, #6 color-guide docs, #4 setup-node, and #3 checkout. Tests remain 193. |
| 2026-11-16 | `b80f105` | Second pass on the Free and Paid API audit. Notes now sit on Problem definition, Chart and report, and Evidence, with the solutions check in the workflow hub when that step has no heading of its own. A modified chart says so and offers Audit again. Report sections 1 through 5 keep one note each, and the PDF, Markdown, and project JSON still follow the include toggle. Local AI still shows none of this. Shell query is v41 and the service-worker cache is v44. The seven EGM skills are installed and `.egm/` is ignored. |
| 2026-11-16 | `9131b4e` | Published pull request #10. Free and Paid API section audits are on `main` and GitHub Pages is deploying that commit. Local AI is unchanged. Shell query is v40 and the service-worker cache is v43. The merged `feat/cloud-api-audit` branch was deleted. Open pull requests for gitleaks, the color-guide docs, and Dependabot were left open. No unused file was removed: the vendored Transformers file, the ONNX wasm files, and `rolldown-runtime-v11.js` are still loaded. Tests remain 191. |
| 2026-11-16 | `e958eb4` | Free and Paid API audits now return a section check for problem definition, the chart, evidence, and solutions. The notes appear on those steps and, when the report toggle is on, in the on-screen report, the PDF, a Markdown file, and the project JSON. Local AI keeps the single review and shows none of those notes. The audit stays in tab memory, not localStorage. Brought onto `main` after the vendored ONNX wasm merge. Shell query is v40 and the service-worker cache is v43. |
| 2026-11-15 | `0e82573` | The published coach worker (`rca-coach.worker-v13.js`) no longer fetches ONNX wasm from jsDelivr. The four `onnxruntime-web@1.31.0-dev.20260914-8d85527a0` files (`ort-wasm-simd-threaded.asyncify.{wasm,mjs}` and the unsuffixed Safari fallback pair) are stored under `vendor/onnx-wasm/`, marked `-text`, and checked with sha384. Each file is under 27 MB (GitHub Pages limit is 100 MB). They are not in the shell cache, so ordinary visits are not forced to download 41 MB. `cdn.jsdelivr.net` is removed from `connect-src`; model weights still use `https:` and the Hugging Face hosts. Shell cache was v42 before this audit merge. Layout, Feedback, About the developer, sign-in, and RealityChart colors are unchanged. |
| 2026-11-15 | `931566b` | Windows CI only: the vendored Transformers.js sha384 test failed because Git converted the file's trailing LF to CRLF. `.gitattributes` now marks `vendor/transformers-3.7.6.min.js` as `-text`. App behavior, layout, and RealityChart colors are unchanged. Tests remain 181. |
| 2026-11-15 | `5f8513f` | Security follow-up. Transformers.js 3.7.6 is vendored and checked with its sha384 because a worker import cannot take an integrity attribute. `cdn.jsdelivr.net` remains out of `script-src`. `rolldown-runtime-v11.js` stays because `index-v13.js`, `routes-v13.js`, and `es-DawnZXYc.js` still import it. The invalid `http://[::1]:*` CSP token is removed. Ollama remains allowed on `localhost` and `127.0.0.1`. |
| 2026-11-15 | `3c16a71` | Housekeeping. Only `main` exists. Cache queries match the service worker. No unused file was removed. The handoff now says the four reviews stay in the coach card and the legal notice stays last. Tests remain 179. |
| 2026-11-15 | `2a20113` | The four longer reviews and their results now sit in the RCA Coach card, under the coach controls, not in the connection card. The same four actions still call the connected model. The legal notice is moved to the end of the page whenever the report appears, so it stays after the download line. Shell query is v39 and the service-worker cache is v40. |
| 2026-11-15 | `3585ade` | Housekeeping after the user confirmed the app works, including paid DeepSeek. Only `main` exists. Cache queries match the service worker. No unused file was removed. Instructions now name the DeepSeek paid path. |
| 2026-11-15 | `79eabcb` | Paid cloud includes DeepSeek. The address is `https://api.deepseek.com/v1` and V4.1-Flash-1017 is requested as `deepseek-flash`. Thinking is turned off so the answer is not consumed by reasoning. An empty address now names that URL. Shell query is v38 and the service-worker cache is v39. |
| 2026-11-15 | `d70c1ad` | Housekeeping. Only `main` exists and no unused file was removed. Browser AI now loads `local-ai-bridge.js?v=26`, the same copy the coach uses, so an offline reload is not left asking for `v=23`. |
| 2026-11-15 | `0ffb2b4` | Free cloud in RCA Coach now shows setup steps and a create-a-key link for Groq, Google AI Studio, and OpenRouter. Shell query is v36 and the service-worker cache is v37. |
| 2026-11-14 | `2ef7aae` | Housekeeping. Only `main` exists. No unused bundle was removed; `404.html` stays because Pages uses it. The handoff now separates shell query `v=35` from service-worker cache `v36`, and notes Google free-tier retention. |
| 2026-11-14 | `eb028af` | Groq free-cloud list now keeps only the three chat models useful for RCA: gpt-oss-20b, gpt-oss-120b, and qwen/qwen3.8-27b. Removed Allam, the safeguard model, and both Prompt Guard classifiers. Shell cache is v36. |
| 2026-11-14 | `a5b5b48` | Free cloud can use a Google AI key. The selector lists gemini-3.8-flash, gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemma-4-31b-it, and gemma-4-26b-a4b-it. Calls use generateContent. A quota error does not switch models. |
| 2026-11-14 | `56b6dc3` | Housekeeping. Only `main` is present. The live bundles are still loaded, so none were deleted. Stale notes that said the site was unpublished and the suite was 164 tests now point at this file. |
| 2026-11-14 | `462fc5c` | Longer AI reviews are shown as a summary, then one card per finding with a heading and Holds / Missing / Contradiction bullets. A plain multi-sentence answer is split into bullets. Shell cache is v34. |
| 2026-11-14 | `fd4b826` | Added Audit full report. One connected-model pass checks problem definition, executive summary, the cause chart, the solution matrix, the corrective-action log, and the action items. It does not edit the report. |
| 2026-11-14 | `95c2206` | Screen solutions now reads the filled Solution challenge matrix from the report, so a completed matrix is not described as having no proposed actions. |
| 2026-11-14 | `a0bc7a9` | One RCA Coach. The connection controls are the top of that panel, not a second coach. The React coach section stays in place. |
| 2026-11-14 | `a367cbf` | A Groq (or other cloud) selection no longer falls through to local Ollama. The connection card and the longer reviews share one configuration, so `qwen/qwen3.8-27b` is not checked as `qwen3:2b` on port 11434. |
| 2026-11-14 | `2d65a99` | Removed unused `styles-v11.css` and its identical copy `styles-CjEoaxHy.css`. The live page still uses `styles-v13.css`. Kept `browser-dCISOrnY.js` (report ZIP), `rolldown-runtime-v11.js`, and `es-DawnZXYc.js` because the current bundle loads them. Added the MIT `LICENSE`. Deleted the merged `housekeeping/sri-stale-legacy` branch. Dependabot pull requests were left open. |
| 2026-11-14 | `1bac0d6` | Groq free-cloud choices now include every chat model from the console limits list: gpt-oss-20b, gpt-oss-120b, qwen/qwen3.8-27b, allam-2-7b, gpt-oss-safeguard-20b, and both Llama Prompt Guard models. The default remains gpt-oss-20b. Reasoning settings stay on the two gpt-oss chat models. Shell cache is v29. |
| 2026-11-14 | `7563be0` | Recorded publication of merge `0133a0a` (PR #5). Pinned Transformers.js is integrity-checked before import. Unused v11/v12 bundles and coach-ui.js removed. Offline check expects shell cache v28. Legacy localStorage is cleared after the recovery download is offered, and the saved API key is not kept. Ollama fetches use redirect error. Tests were 171/171. |
| 2026-11-14 | `9d3672b` | Added three one-pass reviews on the connection card: whole chart, next interview, and solution screen. They use the connected model, including free or paid cloud, and do not edit the case. |
| 2026-11-14 | `495dad7` | User authorized publication to GitHub. Prepared push of 459973d and this documentation update to origin/main; Pages is branch-managed. Prior checks: 164 tests and browser/offline/export acceptance passed. CI/Pages outcome is verified after push and reported in chat. No Cloudflare or paid inference involved. |
| 2026-11-14 | `459973d` | Committed the three-path RCA Coach implementation, session-only privacy, provider adapters, browser verification tools and EGM documentation. Formatting check passed; credential scan found only synthetic test keys. Prior validation: 164 tests passed plus browser/offline/report checks. |
| 2026-11-14 | note | Implemented Local / Free BYOK / Paid BYOK Coach with provider/model dropdowns, key links, consent and recovery guidance. Session-only case/keys, explicit legacy export/delete, streamed-error rejection, reasoning adapters, actual-model audit labels and PDF disclaimer. Added dependency-free npm run serve preview with correct /apollo-rca/ paths; offline assets revalidate on install and stale runtime cache is retired. Two implementation agents; no resets or inference charges. 164 tests pass; Edge mocked full analysis, case reset/undo, reload, responsive controls and ZIP download verified. Real SW install plus offline reload/Coach controls passed with shell v27/runtime v2; preview running at http://127.0.0.1:8080/apollo-rca/. Credential-free browser CORS reached Groq/OpenRouter/OpenAI; Ollama tags found qwen3.5:4b and qwen3.5:2b. No real model invoked, no Cloudflare connection or deployment. |
| 2026-11-14 | note | User selected visitor BYOK for all cloud AI. Removed proposed shared Cloudflare backend/account requirement from current plan and README. Owner uses the same provider-key flow as visitors; no Cloudflare connection authorized. Documentation only. |
| 2026-11-14 | note | Added residual-risk disclaimer copy and UI placement requirements to AI_COACH_PLAN.md; clarified owner deployment account versus visitor accounts. README updated. Documentation only; no deployment, inference or paid service changes. |
| 2026-11-14 | note | Planned three-path RCA Coach in docs/AI_COACH_PLAN.md with two focused read-only agents. Recorded no-spend/no-reset usage rule, memory-only privacy migration, bounded free backend, guided local setup and optional companion. Updated README. No app implementation, inference calls or deployment performed. |
| 2026-11-14 | note | Installed complete EGM 0.1.1 with Codex CLI. Added INSTRUCTION.md and README tooling context. Fresh-session discovery and EGM workflow execution remain unverified. No application code changed. |
| 2026-11-14 | `0643a08` | Ollama chat now uses NDJSON streaming. Thinking chunks are dropped. Cancel aborts the request. |
| 2026-11-14 | `751af7d` | RCA Coach can use local Ollama. Default tag `qwen3:2b` at `http://127.0.0.1:11434`. Test connection selects an installed Qwen3 2B tag. Users can also set their own model tag or HTTPS API key. No cloud fallback and no model download. |
| 2026-11-13 | `25e69f7` | Removed the toolbar `? Help` button. The floating `? Help` button is the only Help control. |
| 2026-11-13 | `186479a` | Removed the redundant toolbar `7 Videos (Training)` button and the step-card `Video Tutorial` buttons. The floating `7 Videos` button remains. |
| 2026-11-13 | `fd654b4` | Header RCA Coach opens the coach section. The step list stays a child of `main`, so React no longer throws `insertBefore`. Shell cache is `v=23`. Tests 140/140. |
| 2026-11-08 | `c8a8d94` | Synchronized clone to `origin/main` (`c8a8d94`). Verified full test suite (139/139 PASS across 11 suites). Confirmed HARD RULE: PROGRESS.md updated on every task so we do not get lost; README.md maintained as standard standing context. |
| 2026-11-09 | `b1afdd3` | **Baseline.** This tree is the latest accepted state: docs rule, live duration sync, Episode 6 `Q4-Bu2qUaaE`. Do not roll back past it. |
| 2026-11-09 | `755af2c` | Hard rule recorded: update PROGRESS.md after every task and README.md when the product description changes. |
| 2026-11-09 | `651f478` | Sync Official Durations now reads the YouTube player length. Corrected Episode 5 to 08:19 and Episode 6 to 07:20. Cache bust `h2c-help.js` and `h2c-videos.js` to `v=24`. Tests 139/139. |
| 2026-11-09 | `1153bc2` | Episode 6 video set to `Q4-Bu2qUaaE` (`https://youtu.be/Q4-Bu2qUaaE`). Old stored id `lj2e9A-qmVA` migrates forward. |
| 2026-11-09 | `5cb16c9` | Replaced the stale phase diary with this handoff and a factual README. |
| 2026-11-09 | `9704444` | Merged PR #2. Service worker keeps cache writes alive and bounds streamed copies. |
| 2026-11-09 | `6950f70` | Merged PR #1. CI pins checkout and setup-node, `contents: read`, no persisted credentials, 10-minute timeout, Dependabot for Actions. |
| 2026-11-08 | `11034a2` | `apollo-rca-` cache prefix, failed shell install if an asset is missing, runtime cache cap, HTML sanitizer, YouTube nocookie frame-src, Feedback link. |
| 2026-11-08 | `8a7b120` | STOP `#d32f2f` white text. Unknown `?` `#fbc02d` black text. |
| 2026-11-08 | `2399a76` | Layout reservation, hydration date, offline shell, CSP, non-blocking Browser AI. Commit message still says grey STOP. Color authority is `8a7b120`. |
| 2026-11-08 | `4552793` | Removed the duplicate top RCA Coach. Bottom coach remains. |
| 2026-11-08 | `c092be3` | Browser AI button for in-browser ONNX Qwen2.5-0.5B-Instruct. |

## Must stay true

- Subtitle: "Analysis based on Apollo RCA or RealityCharting principles and is an opensourced AI-aided Web Tool for RCA."
- About the developer: https://www.haroldhenrycabanilla.com
- Feedback (new tab, `noopener`): https://docs.google.com/forms/d/e/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w/viewform
- Chart: black primary effect, red action `#dc2626`, green condition `#16a34a`, red STOP `#d32f2f` with white text, yellow `?` `#fbc02d` with black text. Do not paint STOP or `?` grey.
- Help knowledge base stays. No copyrighted book images.
- Standard Mode works with AI off. AI never writes the case until the investigator accepts.
- `frame-src` is only `https://www.youtube-nocookie.com`. Video iframes are created on click.
- Service worker deletes only Cache Storage names that start with `apollo-rca-`, and it keeps `apollo-rca-shell-v47` and `apollo-rca-runtime-v2`.
- Script queries: shell `v=41`, help `v=29`, help knowledge `v=24`, videos `v=25`, local bridge `v=27`, browser AI `v=26`, deeper reviews `v=7`, cloud section audit `v=1`. Bump a file's query when that file changes.
- A Free or Paid API audit may place notes on the steps and in the report. Local AI does not. The audit record stays in tab memory under `h2c-coach-api-audit-v1` and is not written to localStorage.
- The four longer reviews stay under the RCA Coach controls, with their results in that card. The connection card is only the path, provider, model, and key.
- The legal notice stays the last block in `main`, after the Download report line.
- Episode lengths last read from the player: 55:50, 20:22, 07:57, 06:59, 08:19, 07:20, 07:10. Episode 6 id is `Q4-Bu2qUaaE`.

## Do not

- Edit `.github/workflows`, Dependabot, or branch protection unless that is the task.
- Merge or publish unless asked.
- Ollama stays on loopback. Cloud is used only after explicit Free cloud or Paid cloud selection and destination consent with the visitor's own key. No shared key, proxy, Cloudflare connection or automatic cloud/paid fallback.
- Add a second RCA Coach panel at the top.

## Known gaps

- The automated suite does not call a live model. A review on the published site still depends on the visitor's own key, quota, and browser access.
- User confirmed on 2026-11-15 that paid DeepSeek works with their own key. Keep `deepseek-flash` as the V4.1-Flash-1017 ID. Do not replace it with the display name.
- Google free-tier prompts may be retained by Google to improve its products. The app has no zero-retention switch for that provider.
- Automatic Ollama startup and folder inspection require an optional companion; no companion is installed. Local origin/permission behavior must still be checked on the published HTTPS site.
- Cases/keys now live in tab memory; download before close/reload. Legacy recovery is archival export plus explicit deletion, not automatic import.
- `index.html` asset URLs use the `/apollo-rca/` prefix, so a server at the repo root is not path-identical to Pages.
- An old `h2c-rca-shell-*` cache is not deleted, because it lacks the `apollo-rca-` prefix.

## Next session

Read this file, then `git status -sb`. The baseline stays `b1afdd3` until the user names a new one. If `git rev-parse --short HEAD` is newer, the work log must explain those commits. Do not move the baseline on your own.
