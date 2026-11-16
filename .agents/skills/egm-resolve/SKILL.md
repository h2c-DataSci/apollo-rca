---
name: egm-resolve
description: The Elephant resolution engine from the Elephant-Goldfish Model (EGM). Ingests deficiency findings from Goldfish reviewers, categorizes each as PROPOSE FIX, CONTEST, ESCALATE, or DECLINE, generates goldfish_review_report.md, and guides interactive human triage. Use when the user runs /egm-resolve or wants to triage and apply design review findings.
---

# egm-resolve

Interactive review resolution skill adapted from the Google Elephant-Goldfish Model (EGM). Operating inside the persistent Elephant context, it evaluates raw critique findings from stateless Goldfish reviewers, defends valid architectural decisions with verifiable evidence, proposes exact text repairs for genuine gaps, and hands control to the human engineer for final triage.

## When to Use

  - The user invokes `/egm-resolve` or asks to resolve findings from a design review report.
  - `egm-review` or `egm-review-loop` hands off a list of reviewer findings for categorization and interactive fixing.

## Steps

### Step 1: Intake Validation and Context Gathering

1. Check if `TargetFile` (the design document), `LineRange` (or `full file`), and `FindingsList` (the reviewer critiques) are present in the conversation.
2. If any input is missing, ask the user for one missing item at a time in chat until all inputs are available.
3. Read `TargetFile` at `LineRange` and parse all items in `FindingsList`.

### Step 2: Evaluate and Categorize Findings

Assign every finding to exactly one of four categories using strict evidence rules:

1. **PROPOSE FIX:** The critique is valid (or is a worthwhile Nit). Write an exact replacement text block or structural edit to fix the issue.
2. **CONTEST:** The critique is inaccurate or misreads the system, and the refuting evidence exists inside files the reviewer could read (cite the exact file, symbol, or document section).
3. **ESCALATE:** The critique is invalid, but the refuting evidence lives outside the reviewed files (such as an unwritten team convention, external business constraint, or verbal agreement). Do not modify the document automatically; escalate to the user.
4. **DECLINE:** The finding is a minor `Nit` that does not warrant editing the document. Record it and skip fixing.

Enforce these mandatory evaluation invariants:

  - **"This was intentional" is not evidence.** A `CONTEST` must cite concrete, checkable text in the document or codebase. If you cannot cite checkable evidence, use `ESCALATE` or `PROPOSE FIX`.
  - **Never contest a Comprehension gap.** If a naive reader (`comprehension` persona) could not follow the document, the document is missing context or clarity. Always use `PROPOSE FIX` (or `ESCALATE` if external domain policy applies).
  - **Do not add bloat just to appease a subagent.** Only add context to the document when a human engineer reading the spec needs it.
  - **Preserve original severities.** Never silently downgrade a reviewer's `Blocker` or `Major` label to `Nit`; if the severity is wrong, `CONTEST` it and state why.

### Step 3: Generate the Annotated Review Report

Format and output `goldfish_review_report.md` ordered by severity (`Blocker`, then `Major`, then `Nit`):

```markdown
# Goldfish Annotated Review Report

**Target:** `[TargetFile]` (`[LineRange]`)
**Status:** pending_resolution

## Prioritized Findings & AI Suggestions

### [Finding ID / Issue Title] [`[ReviewerPersona]`] - Severity: [Blocker | Major | Nit]
* **Affected Scope:** [Section Header / Lines Start-End]
* **Discrepancy Description:** [Reviewer critique]
* **Rationale:** [Reviewer reasoning]
* **AI Suggestion:** [PROPOSE FIX | CONTEST | ESCALATE | DECLINE]
* **Justification:** [Concrete reasoning or cited evidence]
* **Proposed Edit:**
  * Location: [Line / Section Header]
  * Change: [Exact replacement text or N/A]
```

### Step 4: Present the Interactive Resolution Gate

1. If any findings are marked `ESCALATE`, list them prominently at the top of your chat message since they require the human's domain decision.
2. Ask the user how they want to resolve the report and pause for their response:
   - **Auto accept:** Batch-apply all `PROPOSE FIX` edits to `TargetFile` and skip `CONTEST`, `ESCALATE`, and `DECLINE` items.
   - **Interactive breakdown:** Step through each non-declined finding one at a time in chat so the user can accept, skip, or overrule each item before applying edits.
   - **Continue / No changes:** Leave `TargetFile` unchanged and exit the resolution phase.
   - **Custom instruction:** Apply specific edits, overrule specific contests, or answer ad-hoc questions specified by the user.

### Step 5: Apply Approved Edits and Synchronize

1. Apply the user-approved edits cleanly to `TargetFile`, ensuring all Markdown headers, tables, and code fences remain well-formed.
2. Update `goldfish_review_report.md` status to `Status: resolved` and report a summary count of applied fixes, contested items, escalated decisions, and declined nits.

## Gotchas

  - Never apply `PROPOSE FIX` edits to `TargetFile` before the user responds to the Step 4 resolution gate.
  - Never contest a finding out of authorship defensiveness; require verifiable citations for every `CONTEST`.
