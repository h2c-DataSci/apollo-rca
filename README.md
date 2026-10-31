# H2C Root Cause Analyst

Analysis based on Apollo RCA or RealityCharting principles and is an opensourced AI-aided Web Tool for RCA.

Built by **h2c_Creates**. Live: https://h2c-datasci.github.io/apollo-rca/

## What is in this build (Grok Build core)
- Seven-step workflow: Define, Causes, Chart, Evidence, Test, Solutions, Track.
- Up to three primary effects, stacked cause chart (PNG/SVG/JSON), formal report, PDF and .ZIP package.
- Evidence upload (txt, csv, json, pdf, images) with tag quality.
- Native **RCA Coach** (local AI, optional): Qwen2.5-0.5B-Instruct runs in a Web Worker in your browser. Principles P01-P15, PASS/WARN/BLOCK report integrity, evidence binding. The coach never writes into the case until you accept.
- **QA / Stress Test Suite**: 3-PE stress case and a 25-point audit (checks 11-13 need the chart on screen).
- **New analysis**: one click, with confirm dialog and Undo (`h2c-shell.js`).
- Standard Mode works without AI. Investigation data stays in your browser.

## GitHub Pages notes
- Served under `/apollo-rca/`: router basepath and all asset URLs are patched. Bundles carry `-v13` names for cache busting.
- The ONNX runtime WASM (27 MB, over the web-upload limit) loads from jsDelivr (`onnxruntime-web@1.31.0-dev.20260914-8d85527a0`); model files come from Hugging Face on first AI enable.
- Fonts, manifest and tracking links were removed.

## Legacy files
`coach-ui.js`, `ai-*.js`, `rca-*.js`, `case-io.js`, `*.test.mjs`, `golden-*.json`, `index-v12.js`, `routes-v12.js`, `styles-v11.css` belong to the earlier overlay build. They are no longer loaded by `index.html`. The rules and adversarial tests remain as a reference for methodology checks.

Investigator remains responsible for all findings. Not affiliated with Reality Charting or ARMS Reliability.

## QA notes (independent QA pass, Oct 31 2026)
- Measured model download: `onnx/model_q4.onnx` is 786 MB (not 400 MB). The in-app notice now says about 790 MB.
- Production in-app engine = Grok Build core. The old overlay engine files (`rca-*.js`, `ai-*.js`) and their tests are **not loaded** in production; passing tests there do not prove the production engine.
- Verified in production without AI: P05/P01/P14 BLOCK with Accept disabled for blame/person/injection wording.
- A real in-browser model download/inference was not completed in the QA sandbox (stalled at 0%). Full AI path is unverified.
