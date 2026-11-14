# RCA Coach: three-path implementation plan

Status: implementation completed in the local working tree on 2026-11-14; authenticated live inference and published deployment remain unverified. This document preserves the design requirements and residual risks. The optional local companion is not implemented.

## Outcome and scope

Keep the existing RCA workflow, chart, colors, Help and investigator acceptance flow. Replace the existing Coach provider selector with three choices: Local AI, Free cloud AI (recommended for non-confidential cases after consent), and Paid / own API. Standard Mode remains fully usable without AI. No automatic cloud submission or paid fallback.

The user's hard rules apply: minimize agent and inference usage; no runtime resets, credit purchases, paid upgrades or additional spend; update README.md and PROGRESS.md every task. Agent reasoning itself consumes the current account's allowance, which this project cannot measure or guarantee to be free. Stop and checkpoint before an available usage limit instead of purchasing capacity or claiming automatic continuation. No numeric usage ceiling was supplied. Do not infer a paid testing allowance from inclusion of a paid-provider feature.

## User experience

One small selector inside the existing Coach. Reveal only fields relevant to that choice. Show a concise status: Not connected, Checking, Ready, Generating, Cancelled, Quota reached, or Connection failed. Keep Test connection, a model dropdown, Generate, and Cancel. Use plain recovery messages and keyboard-accessible controls. Preserve entered investigation text on errors and provider changes. Never apply suggestions without investigator acceptance; deterministic BLOCK cannot be overridden.

Local: default endpoint http://127.0.0.1:11434, editable with advanced address settings. Test the address explicitly entered by the user, read /api/tags, and populate installed model tags. No subnet scanning, filesystem probing, automatic model download, or requirement to type a folder before connecting. Requests load the selected installed model through Ollama's API. Stop generation on cancel and block cloud-backed model tags for the strictly local option.

Free cloud: each visitor selects a supported provider and free model, then enters their own provider key. This includes the app owner when using the website. Groq is the first candidate; qualify other providers through browser CORS, privacy and model-output tests. No shared key, Cloudflare account, Worker, hosted proxy or operator billing account is used. Explain personal provider quotas and link key creation and data-control settings. Only offer verified free models; account billing cannot be inferred from a key. Gemini unpaid services are unsuitable for confidential incidents. Stop on quota exhaustion without switching to paid models.

Paid / own API: provider preset, model selector or ID, masked key, and optional advanced base URL. Use provider adapters rather than claiming all APIs share one schema. Start with existing OpenAI-compatible transport; add native providers only when their adapter has meaningful tests. User keys and model metadata remain in memory. Warn that their provider can charge for requests. No live paid request is authorized for implementation testing.

## Local setup reality and companion option

A GitHub Pages website cannot launch an OS process, install Ollama, inspect arbitrary folder paths, or reconfigure a service merely because a path was typed. Folder location belongs to the Ollama host, not the browser. If Ollama responds, its installed model list is the source of truth. A model directory is not a model identifier and an arbitrary weights folder is not automatically an Ollama installation.

Baseline release: guided setup with official installation link, copyable start command, targeted origin/CORS help, and Retry. Verify published HTTPS-to-loopback behavior in supported browsers; account for local-network permission and CORS failures. Do not disable browser protections or expose Ollama broadly.

For the requested automatic start experience, a separately installed, opt-in local companion is required. Scope a Windows helper as an optional second delivery: trusted installer or user-launched script, loopback-only authenticated control, strict web-origin checks, explicit pairing, fixed allowed operations, no arbitrary shell execution, and no public exposure. It can locate Ollama, check the configured model directory, start Ollama if installed, list tags, and relay requests. Downloads and service changes require explicit local action. Review security before distribution. Do not claim unattended setup before this helper exists and passes tests.

On this Windows computer preserve runtime on C: and model storage D:\Ollama\models via user OLLAMA_MODELS. Never enumerate, read or write E: or F:. Do not require local paths for cloud users or send them to cloud services. For another device use its existing configuration. A LAN address is advanced, explicit opt-in only: the current bridge enforces loopback; add authenticated HTTPS local-server support separately rather than silently relaxing that rule. Plain LAN Ollama is not an authenticated private service.

## Cloud architecture and privacy

Keep the website on GitHub Pages. All cloud requests go directly from the visitor browser to the explicitly selected HTTPS provider. No application-owned AI backend, proxy or shared credential. A provider must support browser CORS and a compatible tested adapter; otherwise mark it unsupported rather than introducing a proxy. Never request or connect the owner's Cloudflare account, including when the owner is the visitor. Keys remain in browser memory and are sent only as authorization to the chosen provider. Validate model, request size, output budget and destination before sending. Clear credentials when changing providers; never carry a key to a different host.

No app-owned database of investigations, content logs, analytics payloads, prompt cache, AI Gateway content logging, replay history, files API, batch jobs or vector storage. Use no-store response headers and exclude AI traffic from service-worker caches. Redact error bodies. Aborting the browser must cancel upstream work as far as the provider supports it. No provider routing changes without fresh user choice.

Privacy target, to be claimed only after implementation verification: the application does not persist investigation content or API keys. Requests go directly to the chosen provider under its published policy and the visitor's account settings. The app cannot guarantee provider deletion, account privacy configuration or absence of infrastructure metadata. Groq ordinary inference can be retained for reliability/abuse unless Zero Data Retention controls are enabled; visitors control their own settings. Strictly confidential/offline use stays local. No provider is silently substituted.

Client privacy migration is necessary: currently localStorage holds case data, raw notes, hypotheses, coach notes, backups and keys. Introduce an in-memory store used by both source modules and the bundled case UI. Read existing storage only to offer an explicit recovery/export or deletion choice; do not silently destroy saved investigations. Never send old stored cases to cloud. Provide Clear session, revoke object URLs, and remove secrets on mode changes. Document that reload/close loses unsaved work. Avoid a recovery feature that secretly reintroduces persistent storage. The browser and OS may independently retain downloads, memory or session information; make only claims the app can enforce.

## Cost and resource controls

Use personal free-provider quotas with no app-funded account, purchases, upgrades or paid fallback. Allowlist currently free model IDs and reject paid model selection in free mode. A free model label cannot guarantee that the visitor's account is unbilled; explain this and recommend an account with billing disabled or provider-enforced spending controls. Stop on 429 or exhausted allowance. Bound input/output and concurrency. No parallel calls, hidden second opinions, automatic regeneration loops or background inference. Preserve deterministic checks; assess any existing AI-review second call and reserve allowance for both calls rather than silently removing validation.

Implementation checks use mock APIs and synthetic cases. No actual case content in tests. One bounded free-provider smoke test is a separate final readiness check only after account setup and allowance are verified. Paid features are tested with mocks unless explicitly authorized otherwise. Local tests use already-installed software/models; no model downloads. No reset or top-up as recovery. Two focused planning agents were used; implementation may use one provider-transport agent and one UI/privacy agent only when independent file ownership avoids conflicts. Main agent integrates changes, performs focused validation, and updates handoff. Do not rerun full suites after documentation-only changes.

## Downloads

Reuse existing exports first: PDF/ZIP reports, JSON case download and available chart formats. Verify actual report contents and figure preservation before promising formats. Add a compact format selector only if absent. Normal browser download or print-to-PDF determines destination; do not ask for or transmit a folder path. Use Save File Picker when supported and invoked by a user gesture, with Blob/anchor fallback. Browsers configured for automatic downloads may use Downloads without a prompt; explain how to enable Ask where to save. Revoke temporary URLs after download. No server-side report storage. CSV, Markdown or DOCX are optional later requirements, not assumed delivered formats.

## Delivery sequence and acceptance gates

1. Establish current branch/diff and baseline tests; create a synthetic acceptance set covering unsupported causes, missing evidence, blame, contradictions and valid suggestions. Audit actual case storage and export implementation.
2. Implement provider configuration/adapter boundary, strict endpoint construction, robust SSE/NDJSON parsing and cancellation. Reject provider errors, truncated JSON and non-success finish reasons; never apply partial output.
3. Replace persistent case/key handling with the in-memory abstraction and consent-based legacy recovery. Verify no content in storage, caches, logs or outgoing calls before consent. Preserve the existing seven-step UI.
4. Implement the three-choice Coach selector, installed local model discovery, free presets and paid BYOK adapters. Mock every provider and quota path; test accessibility, mobile layout and actionable failures.
5. Verify direct browser access for every enabled free provider using mocks first and a bounded synthetic free-tier smoke test only with verified allowance and explicit credentials. No backend provisioning. Show unavailable, CORS-blocked or quota-exhausted providers honestly. Do not weaken browser security or silently proxy requests.
6. Validate exports and browser download behavior; run targeted tests, then one full application suite after integration. Browser verification must include the published path, service-worker update and HTTPS-to-local behavior. Bump touched asset queries and shell cache entries as required.
7. Prepare a concrete deployment diff, configuration checklist and privacy wording. Deploy only to the authorized account after prerequisites are met; do not merge or publish based solely on this planning request. Verify configured free cloud inference end to end with synthetic content before calling cloud mode functional.
8. Optional Windows companion follows a separate security and usability gate; guided local connection can ship before automatic local start. Record this limitation clearly.

Completion means: all three UI paths actually connect to a supported configured local server or direct cloud API; no stored case/keys by the application; no shared secrets shipped; quota/cancel/error cases preserve work; deterministic blocks hold; exports open correctly; privacy copy matches verified behavior; README and PROGRESS updated. Mock success, installation, or a passing unit suite alone is insufficient.

## Deployment prerequisites

No Cloudflare or AI-backend deployment account is needed or authorized. Each visitor, including the owner, creates a key with their selected model provider and enters it for the current session. Never place keys in chat, source files, URLs, report exports or repository configuration. GitHub Pages deployment remains separate. Provider quality must be assessed with synthetic RCA cases, not assumed from marketing.

## Official references checked on 2026-11-14

- https://docs.ollama.com/faq (origins, model storage and service configuration)
- https://console.groq.com/docs/your-data (retention and Zero Data Retention controls)
- https://console.groq.com/docs/rate-limits (model/account quotas)

## Audit findings for implementation ownership

The active editor is bundled in routes-v13.js and calls globalThis.h2cExternal* installed by local-ai-bridge.js. coach-ui.js is a separate overlay; editing it alone does not change the active workbench. routes-v13.js also directly persists intake, hypotheses and raw notes. h2c-shell.js persists intake-related content and undo backups. Audit the live path before any storage migration. ai-service.js currently attributes provenance to MODEL_CONFIG.id; update provenance to the actual provider/model used so exports remain accurate.

The current bridge parser records streamed errors but only throws when the answer is empty. Reject failed partial responses in both collected and live streaming paths before enabling more providers.

Quota accounting: browser-side counters are advisory and resettable; they cannot enforce account-wide billing limits. Provider-side free quotas and account spending controls are the final boundaries. No application server or global quota database is introduced.

## Residual-risk notices and placement

These notices are approved requirements for the future UI, not a claim that protections are already implemented. Disclaimers supplement safeguards; they do not authorize paid fallback, unnecessary collection, unsafe local access or unverified privacy claims.

- Next to cloud selection, before first submission: "Cloud AI sends the selected investigation information to the provider shown here. Provider policies and account settings govern processing, retention and location. We cannot guarantee absolute confidentiality, deletion from every system, or protection from all security incidents. Remove identifying or confidential information unless you are authorized to share it. Choose Local AI or Standard Mode when cloud processing is unsuitable." Link the actual provider policy and disclose metadata and applicable exceptions. Do not claim the current app stores nothing until its storage migration is verified.
- Beside every AI suggestion and in exported reports containing AI material: "AI suggestions may be incorrect, incomplete or biased. They are not verified findings. Check evidence and causal logic before accepting them. The investigator remains responsible for decisions; AI does not replace qualified professional judgment."
- Beside free-cloud status: "Free models use your own provider account and its limits. Availability, pricing and terms may change. The app cannot verify every billing setting. Use a free-only account or provider spending controls. Requests stop on quota errors; there is no automatic paid fallback."
- Before enabling paid / own API: "Your provider may charge your account. The app cannot verify every account's billing configuration or guarantee the final cost. Cancel may not prevent charges for work already processed. Paid requests require your explicit selection; free mode never falls back to paid." This notice does not permit paid tests or upgrades during development.
- Beside local setup: "Local AI depends on your installed software, hardware and browser permissions. Connection, speed and compatibility are not guaranteed. A folder path alone cannot start or import a model. Optional helper installation changes the trust boundary and requires separate user consent. Local runtimes may keep their own logs; review their settings."
- Beside Clear session and download: "In memory-only mode, reload, tab closure or a crash can lose unsaved work. Download a copy when needed. Download location depends on browser settings. Downloads may remain on your device, backups or synced folders; clearing this app does not erase those copies."

Keep notices concise in the main UI, with expandable details. Require a specific cloud-processing acknowledgment when selecting a new destination; a generic acceptance checkbox must not conceal provider differences. Retain accessible links and avoid repeated modal dialogs for the same unchanged choice. Never put credentials, raw prompts or case text into disclaimer acknowledgment logs.

## Owner account boundary

The earlier shared Cloudflare backend proposal is superseded by the user decision: visitor-supplied keys only. The owner's Cloudflare account must never be requested, connected or used by this app. The owner follows the same personal provider-key flow as every other visitor. This decision does not require removing unrelated Cloudflare resources or changing unrelated accounts.


## Implementation verification record (2026-11-14)

Implemented in the local working tree with no paid model calls or runtime resets. Current suite: 164 passed, zero failed, 11 suites. The isolated Edge acceptance scenario covered all three connection paths with synthetic responses, a complete cloud Coach task, consent before requests, destination key clearing, paid model discovery, memory-only case/keys, reset/undo, responsive page width, reload and report download. The resulting ZIP passed archive integrity checks and contained PDF, charts, CSV and project JSON. Separate real-browser checks reached provider model-list endpoints with deliberately invalid credentials (Groq/OpenAI 401, OpenRouter 200), confirming browser-readable connectivity without inference. Real service-worker install and offline Coach controls passed; cache install bypasses stale HTTP entries and retires only old app caches.

Ollama is already reachable on this computer and listed qwen3.5:4b and qwen3.5:2b. No model was invoked, downloaded or moved. Local preview is available through npm run serve at http://127.0.0.1:8080/apollo-rca/. Authenticated provider inference, the published HTTPS-to-local scenario and public deployment are not verified. The website cannot automatically start Ollama or inspect device folders; the optional local companion remains unimplemented. Older-data recovery downloads are archival and are not automatically imported.
