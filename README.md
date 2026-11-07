# H2C Root Cause Analyst (`apollo-rca`)

> **An Independent, Privacy-First, AI-Aided Web Workspace & Learning Hub for Apollo Root Cause Analysis™ & RealityCharting® Methodology**  
> *Created by Engr. Harold Henry G. Cabanilla (`h2c_Creates` / `h2c-DataSci`) for `h2c_Learnings`*  
> **Live Web Application**: [https://h2c-datasci.github.io/apollo-rca/](https://h2c-datasci.github.io/apollo-rca/)  
> **Official YouTube Training Channel**: [https://www.youtube.com/@h2c_Learnings](https://www.youtube.com/@h2c_Learnings)

---

## ⚖️ Mandatory Legal Disclosure & Trademark Attribution

> [!IMPORTANT]
> **ATTRIBUTION TO ORIGINAL AUTHOR & TRADEMARK CREDIT:**  
> Root Cause Analysis principles and the RealityCharting methodology were created and authored by **Dean L. Gano**, author of the foundational books:
> - 📖 *"Apollo Root Cause Analysis: A New Way of Thinking"* (Apollonian Publications)
> - 📖 *"RealityCharting: Seven Steps to Effective Problem-Solving and Strategies for Personal Success"*
>
> *"Apollo Root Cause Analysis"*, *"Apollo RCA"*, *"Reality Tree"*, and *"RealityCharting®"* are registered trademarks and intellectual property of **Dean L. Gano** and **Apollonian Publications, LLC**. All rights are fully reserved by the respective trademark owners.

> [!NOTE]
> **RECOMMENDATION: USE THE OFFICIAL CERTIFIED ENTERPRISE SOFTWARE**  
> If you want to master genuine certified methodology, undergo formal practitioner accreditation, or use the official enterprise software instead of this experimental open-source tool, please visit the official website:  
> 🔗 **[Official RealityCharting® Software & Website (realitycharting.com)](https://realitycharting.com/home/)**

> [!CAUTION]
> **LEGAL NON-AFFILIATION, SAFE HARBOR & DISCLAIMER OF CLAIMS:**  
> This web application (*H2C Root Cause Analyst*) is an independent, non-commercial open-source experimental prototype developed strictly for educational, personal research, and community demonstration purposes under the MIT License. It is **NOT affiliated with, endorsed by, sponsored by, authorized by, or in any way officially connected with Dean L. Gano, Apollonian Publications, LLC, or RealityCharting.com**. All methodology references are made strictly under **Nominative Fair Use (15 U.S.C. § 1125 / Lanham Act)** for descriptive identification. Provided strictly "AS IS" without warranty of any kind.

---

## 🌟 What Makes This Workspace "10x Better"

1. **Strict 7-Step Apollo RCA Workflow Navigator**:
   - Step-by-step guidance following Gano's 7-Step framework: **1. Define Problem**, **2. Causes**, **3. RealityChart**, **4. Evidence**, **5. Test Logic**, **6. Solutions**, **7. Tracking**.
   - Interactive Workflow Navigator with real-time heuristic validation pills:
     - 🔴 **Red Alert**: Missing data or anti-pattern detected (e.g. blame language, "Who/Why" in definition, <2 words).
     - 🟡 **Amber Warning**: Incomplete step (e.g. single cause branch without paired condition).
     - 🟢 **Emerald Green**: Methodologically compliant (noun-verb format, 2–4 words, paired action/condition).
   - Click-to-scroll navigation that smoothly guides users between steps.

2. **Official 7-Episode YouTube Video Training Companion**:
   - Integrated slide-out Video Training Drawer accessible from both the header toolbar (`[▶ 7 Videos (Training)]`) and floating action button.
   - Synchronized with the official masterclass series on **@h2c_Learnings**:
     - **Episode 1 of 7** (`55:50`): *Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)* (`IXXgr85wO74`)
     - **Episode 2 of 7** (`20:22`): *Defining the Problem — The 4-Element Formula Without Placing Blame* (`tCQuu_rvSJ8`)
     - **Episode 3 of 7** (`07:57`): *Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)* (`8y501jMIS7k`)
     - **Episode 4 of 7** (`06:59`): *Evidence; Sufficient and Necessary — How to Test and Prove Causes* (`lppZuZFyHzM`)
     - **Episode 5 of 7** (`08:45`): *Effective Solutions, Implementation, and Tracking (Preventing Recurrence)* (`yBVaGu31ik8`)
     - **Episode 6 of 7** (`16:30`): *Culture and Facilitation — Fix the Cause, Not the Blame*
     - **Episode 7 of 7** (`14:45`): *Success and a New Way of Thinking (Why Success Is Planned)*
   - Dynamic 16:9 responsive embeds with zero third-party tracking on page load (lazy-loaded upon explicit user click).
   - Expandable Lesson Plan outlines with exact Dean L. Gano book page citations (RC 2011, AR 2003), student objectives, and `📋 Copy Full YouTube Description` button.

3. **Dual-Mode Local AI Architecture (100% Privacy-Preserving)**:
   - **Mode A: Local AI Daemon Bridge (Recommended for Older Laptops)**:
     - Connects directly to local Ollama, Gemma, LiteRT, LM Studio, or any OpenAI-compatible runner on `http://127.0.0.1:11434`.
     - Consumes **0 MB browser RAM**; leverages local GPU/CPU hardware.
   - **Mode B: In-Browser Web Worker WASM (Offline Standalone)**:
     - Runs Qwen2.5-0.5B-Instruct inside an isolated Web Worker via ONNX Runtime Web.
     - Strict human-in-the-loop safety: The AI Coach provides constructive feedback based on Gano's 15 Core Principles (P01–P15), but **never modifies case data without explicit user confirmation**.

4. **Multi-Tier Evidence Management**:
   - Evidence classification across Dean L. Gano's 4 Quality Tiers:
     - **Sensed**: Direct sensory observation (sight, sound, smell, physical touch).
     - **Inferred**: Measurements, instrument logs, sensor telemetry, engineering calculations.
     - **Intuited**: Experienced professional instincts and educated deductions.
     - **Emotional**: Unsubstantiated impressions or hearsay (flagged for corroboration).
   - Visual question mark (`?`) tags automatically attached to unsupported causes on the RealityChart until verified evidence is anchored.

5. **Multi-Format Export & Report Generation**:
   - Generates professional executive RCA summary reports with 1 click.
   - Exports RealityCharts to vector SVG, high-resolution PNG, and structured JSON.
   - Bundles complete case packages into offline-ready ZIP files with full audit logs.

6. **Comprehensive Automated QA / Stress Test Suite**:
   - Embedded 25-point automated verification suite auditing data models, rule engines, and SVG rendering.
   - Pre-loaded 3-Primary Effect industrial stress test case simulating complex petrochemical equipment failures.
   - 100% automated test coverage with Node.js test runner (`node --test`).

---

## 🏗 System Architecture & Tech Stack

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
|                                                                                 |
|  +------------------------+  +------------------------+  +-------------------+  |
|  |   index.html Shell     |  |  7-Step Workflow Nav   |  | Video Drawer Hub  |  |
|  | (Zero-telemetry load)  |  | (Real-time Validation) |  | (h2c-videos.js)   |  |
|  +-----------+------------+  +-----------+------------+  +---------+---------+  |
|              |                           |                         |            |
|              v                           v                         v            |
|  +---------------------------------------------------------------------------+  |
|  |                TanStack Router & Client State Engine (v13)                 |  |
|  +-------------------------------------+-------------------------------------+  |
|                                        |                                        |
|              +-------------------------+-------------------------+              |
|              v                                                   v              |
|  +------------------------+                             +--------------------+  |
|  |   Methodology Engine   |                             | Evidence Vault &   |  |
|  | - Actions & Conditions |                             | RealityChart SVG   |  |
|  | - AND/OR Logic Gates   |                             | - 4 Quality Tiers  |  |
|  | - 4 Stop Reasons       |                             | - Vector Rendering |  |
|  +-----------+------------+                             +---------+----------+  |
|              |                                                    |             |
|              v                                                    v             |
|  +---------------------------------------------------------------------------+  |
|  |                        Local AI Coaching Layer                            |  |
|  |  +-----------------------------------+  +------------------------------+  |  |
|  |  | Option A: Local AI Daemon Bridge  |  | Option B: Web Worker WASM    |  |  |
|  |  | (http://127.0.0.1:11434 - Ollama) |  | (Qwen2.5-0.5B ONNX Worker)   |  |  |
|  |  +-----------------------------------+  +------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### Key Modules & File Structure
- `index.html`: Production HTML entry point with cache-busted module scripts and hydration-safe layout.
- `h2c-videos.js`: Video Training Companion module containing the 7 episode modules, lesson plan outlines, timestamps, duration badges, and drawer UI.
- `h2c-help.js`: Methodology Help Drawer and Knowledge Base integrating 15 Dean L. Gano principles.
- `h2c-shell.js`: Global application shell, navigation toolbar, and state reset/undo manager.
- `local-bridge.js`: Local AI Daemon Bridge interface communicating with Ollama / LiteRT / OpenAI endpoints.
- `ai-coach.js`: Rule-based and LLM-assisted coaching engine checking P01–P15 methodology rules.
- `test/`: Automated test suite executed via native Node.js test runner (`node --test`).
- `YOUTUBE_DESCRIPTIONS.md`: Production-ready, copy-paste YouTube descriptions with chapters, timestamps, and book citations.
- `PROGRESS.md`: Complete audit and development log across all 15 project phases.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v20.x or later (LTS recommended)
- **Python**: 3.10+ (optional, for local HTTP daemon)
- **Modern Web Browser**: Chrome 120+, Edge, Firefox, or Safari

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/h2c-DataSci/apollo-rca.git
   cd apollo-rca
   ```
2. Start a local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Or using Node.js npx
   npx serve -l 8080 .
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080/apollo-rca/
   ```

### Running Automated Tests
Run the comprehensive regression and unit test suite across all 11 test suites:
```bash
# Run all 124 unit, e2e, security, privacy, and stability tests:
node --test

# Or run the specialized video and stress-stability test suites:
node --test test/*.mjs
```
Expected output: **124/124 passing tests (0 regressions)**.

---

## 🤖 LLM Handover & Maintenance Guide

If you are an AI assistant or human engineer continuing development on this repository, observe the following architectural invariants:

1. **Hydration Safety**:
   - `index.html` uses TanStack Router with client-side hydration. **Never append DOM elements directly to `<html>` or `<head>` before hydration completes**, as this causes React Minified Error #418.
2. **Zero Third-Party Telemetry**:
   - In Standard Mode, the application makes **zero network requests** to external third parties.
   - YouTube iframes must only be generated inside the video drawer when a user explicitly clicks the play button (`h2cv-play-btn`).
3. **Cache Busting Protocol**:
   - All module script imports in `index.html` and `h2c-help.js` carry version query parameters (e.g. `?v=16`). When modifying `h2c-videos.js`, `h2c-help.js`, or stylesheets, always bump the corresponding version numbers to prevent stale browser caching.
4. **Trademark & Nominative Fair Use Discipline**:
   - Always maintain the Dean L. Gano authorship attribution and registered trademark notices for *Apollo Root Cause Analysis™* and *RealityCharting®*.
   - Never claim official endorsement or certification. Always retain the link to the official software at `https://realitycharting.com/home/`.
5. **Human-in-the-Loop AI**:
   - The AI Coach is strictly advisory. It must never auto-apply suggestions or mutate the case store without explicit investigator acceptance.

---

## 📄 License & Attribution

- **Source Code**: Released under the [MIT License](LICENSE).
- **Methodology & Trademarks**: Apollo Root Cause Analysis and RealityCharting are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. Used under Nominative Fair Use (15 U.S.C. § 1125).
