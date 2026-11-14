# Skills and commands for Apollo RCA

## Project context

Work in `D:\ApolloRCA_webapp`, the clone of https://github.com/h2c-DataSci/apollo-rca. Read README.md for product context and PROGRESS.md for the latest handoff. Preserve Standard Mode, investigator approval of AI suggestions, local-only Ollama, and the existing privacy rules.

## Using RCA Coach

1. Open the one RCA Coach panel. The connection controls are at the top of that panel.
2. Choose Local AI, Free cloud, or Paid cloud. Start with Free cloud if you are authorized to share the case with that provider.
3. For cloud AI, choose a provider and model. Open Get your key in a new tab, create your personal provider key, and paste it in the masked field. No Cloudflare account or shared key is used. Never send your key in chat or a report.
4. Read the notice and authorize this destination. Test connection checks the key and lists models without running inference. For paid APIs, test first to discover model IDs, then choose one. Other APIs must support OpenAI-compatible chat and browser CORS.
5. In the existing workbench choose Enable AI Assistant, then Enable assistant. Run a task, review its findings, and accept only evidence-supported suggestions. Deterministic BLOCK remains binding.
6. Download your report/ZIP or print before leaving. Case data and keys do not survive reload. Your browser controls the save location. Disconnect & clear key removes the active credential.

Local setup: start the installed Ollama app or run `ollama serve`; Test connection lists installed tags. The default address is `http://127.0.0.1:11434`. Do not enter a model folder into the address box. This website cannot start OS processes or read model folders. Keep existing OLLAMA_MODELS settings; no automatic installation or model download is performed. For local-network permissions or origin restrictions, use targeted official Ollama/browser guidance; never disable browser security.

Free means the provider's current model offer, not guaranteed availability or billing verification. Check account spending and data settings. There is no automatic paid fallback or provider switch. Provider retention and AI accuracy cannot be universally guaranteed. Use Local AI or Standard Mode for data you cannot share.

Older saved browser data is not loaded automatically. The notice lets you download an archival recovery file or explicitly delete old data/keys. This archival file is not a new-format case import; retain it for recovery. It omits the old API configuration because it may contain a key.

Developer checks: `node --test`. Browser smoke scripts under scripts/ accept an existing Playwright package root as an argument and use an isolated installed Edge profile; they do not install dependencies or run paid inference. `verify-coach-browser.mjs` additionally requires an output directory on C:. `verify-provider-cors.mjs` uses deliberately invalid credentials on model-list endpoints only.

## EGM installation

Elephant-Goldfish Model (EGM), by Google, was installed on 2026-11-14 with the supported Codex CLI installer. The installed manifest reports version 0.1.1. The complete bundle includes skills, reviewer personas, and document standards. It is development tooling and does not run in the Apollo RCA website.

Installation commands, for another computer:

```powershell
codex plugin marketplace add google/elephant-goldfish-model
codex plugin add egm@egm
```

Start a fresh Codex session after installation. In Codex, select the corresponding EGM skill from the skill picker and give it the target path and request. Slash examples in upstream documentation describe workflow names; typing an unregistered slash command alone does not establish that a skill loaded.

The installer reported a complete local installation. Skill discovery in a fresh desktop session and an end-to-end Goldfish review have not yet been verified. If the desktop skill picker does not show EGM, use the published desktop listing: https://chatgpt.com/plugins/plugins_6aeb90f47ec88191a3c107e01d3eb357 . The user must operate app settings; do not automate Codex's own UI.

Locate the installed skill through the current skill inventory or installer metadata. Read its SKILL.md before use, and resolve shared files from that installed bundle. Do not hardcode a versioned cache path or copy only the skills directory.

## Available EGM skills

| Skill | Purpose | Example request after selecting the skill |
| --- | --- | --- |
| egm-brainstorm | Explore requirements and trade-offs; save a concept brief | Explore cancellation and recovery for the local RCA Coach. |
| egm-draft | Turn a brief into a design, with section feedback | Draft a specification from the agreed concept brief. |
| egm-review | Review a software design through five stages with fresh reviewers | Review ARCHITECTURE.md against the current source. |
| egm-resolve | Work through findings and agree on changes | Resolve the selected findings in the review report. |
| egm-bootstrap | Create or update documentation from an existing codebase | Document the current local AI pipeline. |
| egm-drift-report | Compare documentation with implementation | Compare ARCHITECTURE.md with the current code and report drift. |
| egm-review-loop | Configure reviewers and standards for a document | Review README.md against explicitly selected standards. |

EGM's built-in review focuses on documents and software specifications. For a request such as "review my script", identify the script and review goal; use source code as an explicit reading list for a design review, or perform a separately identified code review. Do not label an ordinary single-agent code review as EGM.

For egm-review-loop, supply TargetFile, SemanticTarget (for example, full file), Reviewers, Standards (a reviewer-to-standard mapping), and GoldfishContext (an explicit reading list, which may be empty). Read the installed skill for the exact workflow and supported reviewer names.

## Review execution rules

The Elephant keeps project context. Each Goldfish reviewer gets the target, persona, standards, and selected source material in a fresh conversation context. In this host, use the native subagent tool with `fork_turns: "none"`; inspect its current schema rather than assuming tool names. Wait for actual results before reporting completion. If isolated subagents are unavailable, stop the Goldfish review and state the limitation. Fresh conversation context does not prove that user or project instructions are excluded.

Follow the skill's feedback and approval gates. The user resolves trade-offs and approves the design before implementation. Installation and passing app tests do not verify an EGM review. Do not claim a review has run unless reviewers actually completed it.

To keep generated artifacts together, include this in the request:

```text
EGM artifact directory: docs/egm
```

Update README.md when standing context or commands change, and PROGRESS.md after every task. Keep temporary work on C: or this authorized project directory. Leave E: and F: untouched.

## Application commands

Run from the project root:

```powershell
node --test
npm run serve
```

Open http://127.0.0.1:8080/apollo-rca/ to view the static app. Node is required; no dependency installation is needed. The server binds only to loopback and maps the published asset paths. `npm test` also runs the tests. Choose another port with `node scripts/serve.mjs 8081`.

## Sources

- EGM source and quickstart: https://github.com/google/elephant-goldfish-model
- Codex integration: https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md
- Supported environments: https://github.com/google/elephant-goldfish-model/blob/main/docs/harnesses.md

EGM is Apache-2.0 licensed and is not an officially supported Google product.
