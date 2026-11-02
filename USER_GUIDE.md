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

## 3. Official 7-Episode Training Series

Click the `▶ 7 Videos (Training)` button in the top toolbar to access the official video curriculum:
1. **Episode 1 of 7** (⏱ **55:50**): [Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)](https://youtu.be/IXXgr85wO74)
2. **Episode 2 of 7** (⏱ **22:02**): [Defining the Problem — The 4-Element Formula Without Placing Blame](https://youtu.be/tCQuu_rvSJ8)
3. **Episode 3 of 7** (⏱ **07:57**): [Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)](https://youtu.be/8y501jMIS7k)
4. **Episode 4 of 7** (⏱ **06:59**): [Evidence; Sufficient and Necessary — How to Test and Prove Causes](https://youtu.be/lppZuZFyHzM)
5. **Episode 5 of 7**: Effective Solutions, Implementation, and Tracking (Preventing Recurrence) *(Placeholder)*
6. **Episode 6 of 7**: Culture and Facilitation — Fix the Cause, Not the Blame *(Placeholder)*
7. **Episode 7 of 7**: Success and a New Way of Thinking (Why Success Is Planned) *(Placeholder)*

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
