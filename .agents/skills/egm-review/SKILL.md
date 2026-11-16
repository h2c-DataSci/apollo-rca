---
name: egm-review
description: Orchestrates the 5-stage Goldfish Review Protocol from the Elephant-Goldfish Model (EGM) on software design documents and specifications. Runs Initial Zoom Out, Comprehension, Critic Review, Intermediate Zoom Out, and Implementation Readiness checks. Use when the user runs /egm-review or asks for a thorough multi-stage EGM design review.
---

# egm-review

Five-stage specification verification pipeline adapted from the Google Elephant-Goldfish Model (EGM). It evaluates a design document (`design_draft.md` or any technical spec) across isolated Goldfish reviewer personas to expose unstated assumptions, architectural bloat, failure modes, and implementation gaps.

## When to Use

  - The user invokes `/egm-review` or asks to review a design document, RFC, or PR plan using the Elephant-Goldfish Model.
  - The user wants a staged audit checking YAGNI simplicity, naive-reader comprehension, adversarial design failure modes, and implementation readiness.

## Steps

### Step 1: Intake and Context Setup

1. Verify that the target design document (`TargetFile` or pasted document content) is provided. If missing, ask the user for the document or path in plain text and wait for their reply.
2. Check whether the user provided optional `GoldfishContext` (referenced source files or architecture docs). Note that Stage 6 (Comprehension) always evaluates the document alone without external context files.

### Step 2: Pipeline Preset Selection

1. If the user did not specify an execution mode or stage number (5 through 9), ask them to choose one preset:
   - **Preset 0 - Interactive review with all review rubrics:** Step-by-step execution across Stages 5, 6, 7, 8, and 9 with checkpoints between stages.
   - **Preset 1 - Consolidated report with all review rubrics:** Runs all five stages without pausing and produces a unified `consolidated_review_report.md`.
   - **Preset 2 - Feature spec only:** Evaluates high-level architecture across Stages 5, 6, 7, and 8 (skips Stage 9).
   - **Preset 3 - Implementation plan only:** Discovers the implementation plan section and jumps directly to Stage 9.

### Step 3: Semantic Split Discovery

1. Unless Preset 2 was chosen, scan the target document for the dividing header `## Detailed Implementation Plan` (or `## Implementation Plan`, `## Work Breakdown`, `## Implementation Steps`) at line `L`:
   - Assign `FeatureRange = 1..(L-1)` and `DetailedRange = L..End`.
   - If no implementation plan section exists, notify the user, set `FeatureRange = 1..End`, and run Stages 5 through 8.

### Step 4: Execute the Five Review Stages

For each active stage, evaluate the target range strictly from the isolated Goldfish persona rubrics (spawning fresh subagents if supported by the harness, or executing isolated zero-context persona passes and offering copy-paste prompts for fresh chat sessions). Classify every finding as `Blocker`, `Major`, or `Nit` with exact line numbers or section references:

1. **Stage 5 - Initial Strategic Review (Full Document):**
   - **`zoom_out` (Skeptical Architect):** Checks whether the problem framing justifies building anything at all, flags YAGNI over-engineering, and checks whether existing codebase utilities can be reused.
   - **`inventive_catalyst` (Inventive Catalyst):** Identifies technical contradictions and false compromises using TRIZ-inspired software patterns.

2. **Stage 6 - Comprehension Test (Full Document, Zero External Context):**
   - **`comprehension` (Naive Reader):** Reads the document with zero prior conversation or codebase context. Flags undefined acronyms, missing prerequisites, unstated system assumptions, and unclear data flows.

3. **Stage 7 - Critic Review (`FeatureRange`):**
   - **`design_critic` (Analytical Design Critic):** Probes single points of failure (SPOFs), concurrency races, scaling limits, quota exhaustion, rollback safety, and unmitigated operational risks.
   - **`structural` (Layout Validator):** Verifies heading hierarchy, required specification sections (Problem, Overview, Goals/Non-Goals, Technical Plan, Alternatives Considered), and table formatting.
   - **`style` (Technical Copy Editor):** Strips promotional buzzwords, ungrounded adjectives, and weak defensive caveats (`DROP`, `CALIBRATE`, `RELOCATE`, `KEEP`).

4. **Stage 8 - Intermediate Zoom Out Review (Full Document):**
   - **`zoom_out` (Skeptical Architect):** Audits additions and defensive mitigations introduced during Stages 6 and 7 to prune bloat and secondary over-engineering without re-litigating core decisions accepted in Stage 5.

5. **Stage 9 - Implementation Readiness Test (`DetailedRange`):**
   - **`implementation_readiness` (Tech Lead Auditor):** Verifies that every touched file is explicitly listed with a rationale, interfaces and data structures are unambiguous, and concrete test verification steps exist.
   - **`codebase_details` (Codebase Auditor):** Cross-references file paths, class names, and function signatures against provided source files to catch hallucinated APIs or drift.
   - **`style` (Technical Copy Editor):** Verifies clear, deterministic phrasing in the implementation steps.

### Step 5: Resolution Hand-off

1. In Interactive mode, after each stage (or in Consolidated mode after all stages), pass the structured findings list to the `egm-resolve` workflow (categorizing items into `PROPOSE FIX`, `CONTEST`, `ESCALATE`, or `DECLINE`) and present the report (`goldfish_review_report.md` or `consolidated_review_report.md`) for human triage.

## Gotchas

  - Never allow Stage 6 (`comprehension`) to rely on conversation history or external context; if a fresh reader cannot understand the document on its own, it is a valid comprehension gap.
  - Do not rubber-stamp a specification; lead with concrete weaknesses, missing invariants, and failure modes.
