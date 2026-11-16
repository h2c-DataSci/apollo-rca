---
name: egm-review-loop
description: Orchestrates the iterative Antagonistic-Review sharpening loop from the Elephant-Goldfish Model (EGM). Coordinates configured Goldfish reviewer personas and document standards across rounds until convergence (two consecutive clean rounds) or the 5-round cap. Use when the user runs /egm-review-loop or wants a custom multi-agent review loop on any document.
---

# egm-review-loop

Configurable multi-round review orchestration driver adapted from the Google Elephant-Goldfish Model (EGM). It pairs adversarial zero-context Goldfish reviewer personas with the persistent Elephant resolver across iterative sharpening rounds until the document converges.

## When to Use

  - The user invokes `/egm-review-loop` or asks to run a custom combination of Goldfish reviewers and standards on a specification, README, or implementation plan.
  - `egm-review` delegates Stage 7 (Critic Review) or Stage 9 (Implementation Readiness) to an iterative review-and-resolve loop.

## Steps

### Step 1: Intake and Configuration UX

1. Check which of the required parameters are provided:
   - `TargetFile`: The document path or text to audit.
   - `SemanticTarget`: Target section header, line range, or `full file`.
   - `Reviewers`: List of reviewer personas (`zoom_out`, `comprehension`, `design_critic`, `implementation_readiness`, `codebase_details`, `structural`, `style`, `inventive_catalyst`).
   - `Standards`: Mapping of reviewers to evaluation standards (`feature-spec-standard`, `implementation-readiness-standard`, `zoom-out-standard`, `heilmeier-standard`).
   - `GoldfishContext`: Optional list of baseline reference files (an empty list counts as provided).

2. If any required inputs are missing, prompt the user one question at a time and provide default recommendations:
   - **For Feature Specs:** Recommend `design_critic`, `structural`, and `style` against `feature-spec-standard`.
   - **For Implementation Plans:** Recommend `implementation_readiness`, `codebase_details`, and `style` against `implementation-readiness-standard`.
   - **For Strategic / RFC Checks:** Recommend `zoom_out` and `inventive_catalyst` against `zoom-out-standard` and `heilmeier-standard`.

3. Display the consolidated configuration plan (`TargetFile`, `SemanticTarget`, `Reviewers`, `Standards`) and ask the user to confirm before starting Round 1.

### Step 2: The Iterative Sharpening Loop

For each round `r` (up to a maximum cap of 5 rounds):

1. **Unconditional Target Resolution:** Re-read `TargetFile` and resolve the current line bounds of `SemanticTarget` so edits from prior rounds never cause line-number drift.
2. **Goldfish Swarm Audit:** Run each configured reviewer persona against `TargetFile` at the resolved line range using its mapped rubric:
   - Assign every finding a stable ID formatted as `<reviewer>-<round>-<n>` (for example, `design_critic-1-1`).
   - Record severity (`Blocker`, `Major`, or `Nit`), affected line range/section, discrepancy description, and technical rationale.
   - Record a status table listing each requested reviewer as `completed` or `not run`.
3. **Convergence and State Tracking (Evaluated Before Fixes):**
   - **Settled Findings:** Any finding previously marked `CONTEST` or accepted as risk without a fix stays settled across future rounds. Do not re-open it if raised again at the same scope.
   - **Fixed Findings:** If a previously fixed issue reappears at the same scope in a later round, re-open it.
   - **Clean Round:** A round is clean when every requested reviewer has status `completed` and zero unsettled `Blocker` or `Major` findings are raised (Nits do not block convergence).
   - **Converged:** Two consecutive clean rounds (`clean_streak == 2`), or zero unsettled `Blocker`/`Major` findings when the user selects single-pass completion.
   - **Churn Detection:** Flag churn if a new finding targets the exact scope of an earlier applied fix and reverting that fix would resolve it.
4. **Resolution Hand-off (`egm-resolve`):** Pass the round's findings list to the `egm-resolve` workflow to categorize each item (`PROPOSE FIX`, `CONTEST`, `ESCALATE`, `DECLINE`), generate `goldfish_review_report.md`, and pause for the user's triage decision (`auto accept`, `interactive breakdown`, or `continue`).
5. **Turn Boundary Check:** Wait for the user to approve fixes and explicitly confirm before starting the next review round. If Round 5 is reached or churn is detected, list the remaining open findings by severity and ask the user whether to accept and proceed, continue past the cap, or return to drafting.

### Step 3: Completion Summary

1. When the loop converges, hits an accepted cap, or is halted by the user, output a concise completion summary stating the total rounds executed, the final convergence status, and any remaining open findings.

## Gotchas

  - Always re-verify section and line boundaries at the start of every round after edits are applied.
  - Never silently drop a failed or skipped reviewer; only rounds where all configured reviewers completed can count as clean.
