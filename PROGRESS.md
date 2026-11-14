# Progress

Hard rule: update this file after every task, and update [README.md](README.md) when the product description changes. This file is how the next session avoids getting lost. README keeps the standing context.

## Now

| | |
|---|---|
| Product | H2C Root Cause Analyst |
| Repo | https://github.com/h2c-DataSci/apollo-rca |
| Clone | `/workspace/apollo-rca` |
| Branch | `main`, even with `origin/main` |
| HEAD | `b1afdd3` — **baseline**. Later commits are changes on top of this tree unless a newer baseline is recorded here. |
| Live | https://h2c-datasci.github.io/apollo-rca/ |
| Tests | `node --test` → 147 passed, 0 failed (11 suites). Last full run after Ollama streaming. |
| Not this app | Anything in `/workspace` outside this folder. That tree is a separate Grok Build app. |

## Work log

Newest first. Add a row for each task. Do not delete older rows.

| When | SHA | Done |
|---|---|---|
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
- Service worker deletes only Cache Storage names that start with `apollo-rca-`, and it keeps `apollo-rca-shell-v26` and `apollo-rca-runtime-v1`.
- Cache bust: shell `v=27`, help `v=26`, videos `v=25`, local bridge `v=23`, browser AI `v=24`. Bump the query of a file when that file changes.
- Episode lengths last read from the player: 55:50, 20:22, 07:57, 06:59, 08:19, 07:20, 07:10. Episode 6 id is `Q4-Bu2qUaaE`.

## Do not

- Edit `.github/workflows`, Dependabot, or branch protection unless that is the task.
- Merge or publish unless asked.
- Ollama stays on `127.0.0.1` or `localhost`. A remote model is used only when the user chooses **My API key** and types that HTTPS address. Do not fall back to a cloud model.
- Add a second RCA Coach panel at the top.

## Known gaps

- No `LICENSE` file, though the UI says MIT.
- `index.html` asset URLs use the `/apollo-rca/` prefix, so a server at the repo root is not path-identical to Pages.
- An old `h2c-rca-shell-*` cache is not deleted, because it lacks the `apollo-rca-` prefix.

## Next session

Read this file, then `git status -sb`. The baseline stays `b1afdd3` until the user names a new one. If `git rev-parse --short HEAD` is newer, the work log must explain those commits. Do not move the baseline on your own.
