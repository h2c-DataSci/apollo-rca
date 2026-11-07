# User Manual & Methodology Guide: H2C Root Cause Analyst

Welcome to the **H2C Root Cause Analyst**, an AI-aided, open-source web application designed for root cause analysis based on the acclaimed methodology of **Dean L. Gano** (*"Apollo Root Cause Analysis: A New Way of Thinking"* and *"RealityCharting"*).

---

## 1. Quick Start

1. **Open the App**: Launch your browser and navigate to `http://127.0.0.1:8080/apollo-rca/` (or your deployed URL).
2. **Standard Mode**: You can begin immediately without downloading any AI models or connecting to any external services.
3. **Load Sample Case**: Click `Load sample case` in the top toolbar to explore a fully articulated incident (*"Oil Released"*).
4. **New Analysis**: Click `New analysis` anytime to clear the workspace and start fresh (with full 20-second Undo protection).

---

## 2. The 7-Step Apollo RCA Workflow

The interactive 7-Step Workflow Navigator at the top tracks your investigation progress in real time:

### Step 1: Define Problem
- **The 4-Element Formula**:
  - **What**: 2–4 words describing the primary effect as a noun and an active verb (e.g. *"Oil Released"*). No who, no why, and no blame.
  - **When**: Date, time, and operating phase.
  - **Where**: Specific facility, unit, or equipment location.
  - **Significance**: Safety hazard, financial loss (\$), or event frequency.
- **Validation**: Real-time color codes provide immediate feedback (Red = Incomplete/Blame, Emerald Green = Validated).

### Step 2: Causes (Action & Condition)
- For every effect, ask *"Why?"* to discover causes.
- Every cause set requires **at least one Action** (momentary trigger) and **at least one Condition** (pre-existing state).
- **Rule**: Never name a person as the cause. Blaming people stops problem-solving.

### Step 3: Reality Tree Chart
- Visualizes causes running from left (Primary Effect) to right (Preceding Causes).
- Black nodes = Primary Effect, Red nodes = Action Causes, Green nodes = Condition Causes.
- Export as high-resolution PNG, vector SVG, or structured JSON.

### Step 4: Evidence Register
- Attach proof to every cause node.
- Tag each item with its **Quality Tier**:
  - **Sensed**: Direct human physical observation.
  - **Inferred**: SCADA logs, instruments, measurements, or metallurgical calculations.
  - **Intuited**: Experienced guesses or hypotheses.
  - **Emotional**: Unsubstantiated impressions.
- Cause nodes lacking verified evidence display a yellow `?` (*Need More Info*) balloon.

### Step 5: Logic Verification
- Deterministic checks ensure that every cause is both **Necessary** and **Sufficient**.
- Rejects fabricated evidence references, unsupported claims, and timeline contradictions.

### Step 6: Solution Challenge Matrix
- Challenge each condition cause from right to left using the **4 Solution Criteria**:
  1. *Does it prevent recurrence?*
  2. *Is it within our control?*
  3. *Does it meet our operational goals and ROI?*
  4. *Does it introduce new problems?*
- **Favorite Solution Filter**: Automatically blocks low-effectiveness favorite solutions (e.g. *"Retrain the operator"*, *"Discipline staff"*).

### Step 7: Corrective Actions Tracking Log
- Approved solutions pass into the formal tracking log.
- Assign responsible owners, target completion dates, and cost/ROI metrics.
- Export to Excel/CSV for team accountability.

---

## 3. Official 7-Episode Training Series & Lesson Plan (Thinking in Causes)

Click the `▶ 7 Videos (Training)` button in the top toolbar to access the official video curriculum aligned with the **Thinking in Causes (v3)** lesson plan on Dean L. Gano's *RealityCharting®* (2011) and *Apollo Root Cause Analysis* (2003):

- **Episode 1 of 7** (⏱ **55:50**): [Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)](https://youtu.be/IXXgr85wO74)
  - *Lesson Alignment:* **PART 1: Foundations** (RC Intro & Chs. 1–3, pp. 13–69; AR Chs. 1–2, Appendix)
  - *Core Concepts:* Common reality, 3 failed strategies, the single root cause myth, 6 RCA criteria, 4 Principles of Cause and Effect, Action & Condition causal sets.
- **Episode 2 of 7** (⏱ **20:22**): [Defining the Problem — The 4-Element Formula Without Placing Blame](https://youtu.be/tCQuu_rvSJ8)
  - *Lesson Alignment:* **PART 2: Step 1, Define the Problem** (RC Ch. 4, pp. 70–77; AR Ch. 3, pp. 61–66)
  - *Core Concepts:* 4-element formula (What, When, Where, Significance), noun-verb primary effect (2–4 words), Zero Blame rule (no Who/no Why), 95% failure rule.
- **Episode 3 of 7** (⏱ **07:57**): [Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)](https://youtu.be/8y501jMIS7k)
  - *Lesson Alignment:* **PART 3: Steps 2–3, Causal Relationships and the RealityChart** (RC Chs. 5–6, pp. 78–96; AR Ch. 3, pp. 67–74, 81–87)
  - *Core Concepts:* 4-part process, "Caused By" statements, finding missing conditions (add "exists"), Square One Loop, Four Stop Reasons (Desired Condition, Lack of Control, New Primary Effect, Other Paths), no single correct chart.
- **Episode 4 of 7** (⏱ **06:59**): [Evidence; Sufficient and Necessary — How to Test and Prove Causes](https://youtu.be/lppZuZFyHzM)
  - *Lesson Alignment:* **PART 4: Steps 4–5, Evidence; Sufficient and Necessary** (RC Chs. 7–8, pp. 97–111; AR Ch. 3, pp. 74–81)
  - *Core Concepts:* 4 Evidence Quality Tiers (Sensed, Inferred, Intuited, Emotional), Fact = cause supported by evidence, Sufficiency test, Necessity test (Remove-It Test), Sagan's Baloney Detection Kit.
- **Episode 5 of 7** (⏱ **08:45**): Effective Solutions, Implementation, and Tracking (Preventing Recurrence) ([yBVaGu31ik8](https://youtu.be/yBVaGu31ik8))
  - *Lesson Alignment:* **PART 5: Steps 6–7, Solutions, Implement and Track** (RC Chs. 9–10, pp. 112–131; AR Chs. 4–5)
  - *Core Concepts:* Root causes defined by solutions, challenge causes right-to-left, 4 Solution Criteria, eliminating "re" traps (retrain, rewrite), Rapid Response brainstorming, corrective-action log & trending.
- **Episode 6 of 7** (⏱ **08:19**): [Culture and Facilitation — Fix the Cause, Not the Blame](https://youtu.be/lj2e9A-qmVA)
  - *Lesson Alignment:* **PART 6: Culture and Facilitation, Light** (RC Chs. 11–12, pp. 132–174; AR Chs. 5–6)
  - *Core Concepts:* Facilitator role (< 8 members), evidence go-bag & checklist, no-blame interview ("Please help me understand..."), 3 group traps (Consensus, Groupthink, Time as a cause), "Fix the cause, not the blame".
- **Episode 7 of 7** (⏱ **07:10**): [Success and a New Way of Thinking (Why Success Is Planned)](https://youtu.be/_w5WUcNRYWU)
  - *Lesson Alignment:* **PART 7: Success and a New Way of Thinking** (RC Chs. 13–14, pp. 175–194)
  - *Core Concepts:* Success is planned and failure is not, serendipity anatomy, decoupling systems in time and space, applying solutions to conditions, moving from caveman storytelling to causal thinking.

> 📋 **YouTube Studio Ready Descriptions**: Complete video titles, timestamps, book quotes, case studies, and tags are accessible in [`YOUTUBE_DESCRIPTIONS.md`](file:///d:/GitHub-Antigravity/apollo-rca/YOUTUBE_DESCRIPTIONS.md) and via the **📋 Copy Full YouTube Description** button in each in-app video module card.

---

## 4. Local AI Daemon Bridge (Older Laptops & Low-Spec Hardware)

For older laptops or resource-constrained environments, you can run private AI models on your CPU with **0 MB browser memory overhead**:

1. Click **` RCA Coach`** in the top navigation toolbar.
2. The **Local AI Daemon Bridge** panel opens at the top of your workspace.
3. Start Ollama in your computer's terminal:
   ```bash
   ollama run gemma2:2b
   ```
4. Click **`⚡ Test Connection`** to verify connection to `http://127.0.0.1:11434`.
5. Use the quick action buttons (*Review wording*, *Suggest rewrite*, *Extract timeline*, *Check evidence gap*, *Clarifying questions*, *Suggest hypotheses*, *Review solution alignment*, *Validate integrity*).
6. Review suggestions in the advisory card and click **`Accept into Case`**, **`Modify`**, or **`Dismiss`**.

---

## 5. Trademark & Attribution Disclosure

- **Original Author**: Root Cause Analysis principles and RealityCharting were created and authored by **Dean L. Gano**, author of *"Apollo Root Cause Analysis: A New Way of Thinking"* and *"RealityCharting: Seven Steps to Effective Problem-Solving"*.
- **Trademarks**: *"Apollo Root Cause Analysis"*, *"Apollo RCA"*, *"Reality Tree"*, and *"RealityCharting®"* are registered trademarks of Dean L. Gano and Apollonian Publications, LLC.
- **Enterprise Software**: If you wish to use official certified enterprise software, please visit [https://realitycharting.com/home/](https://realitycharting.com/home/).
- **Safe Harbor**: This web tool is an independent, non-commercial open-source prototype under the MIT License and Nominative Fair Use (15 U.S.C. § 1125 / Lanham Act).
