---
name: egm-brainstorm
description: Interactive ideation and brainstorming skill adapted from the Elephant-Goldfish Model (EGM). Turns raw feature ideas into structured concept briefs (concepts_brief.md) via multi-turn open-ended problem drilling, adversarial multi-lens Goldfish stress-testing, and iterative refinement. Use when the user wants to brainstorm a software feature, stress-test an architecture concept, run /egm-brainstorm, or prepare a concept brief for egm-draft.
---

# egm-brainstorm

Interactive upstream ideation and stress-testing workflow adapted from the Google Elephant-Goldfish Model (EGM). It transforms early-stage concepts into a structured RFC summary (`concepts_brief.md`) by combining open-ended problem clarification with adversarial multi-lens review before any code or full specification is written.

## When to Use

  - The user invokes `/egm-brainstorm` or asks to brainstorm a feature using the Elephant-Goldfish Model.
  - The user wants to stress-test a rough software idea, define scope boundaries, or surface edge cases before drafting a design doc.
  - The user needs a structured `concepts_brief.md` artifact to feed into `egm-draft`.

## Steps

### Step 1: Deep Clarification and Problem Statement Drilling

1. Verify whether the user provided an initial feature idea or problem description, along with an author name or handle. If missing, ask the user to describe the concept they want to brainstorm.
2. Adopt a rigorous, non-sycophantic posture:
   - Never agree by default or use flattering adjectives ("great", "brilliant", "smart", "perfect", "spot-on").
   - Do not output polite apologies when corrected; state the updated technical logic and trade-offs directly.
   - Use plain, direct English without buzzwords or promotional adverbs.
3. Drill into the problem across chat turns using open-ended questions (do not offer pre-canned multiple-choice guesses for the core problem):
   - What specific problem, bottleneck, or pain point does this solve, and how is it handled today?
   - Who or what system consumes this feature, and under what SLAs or invariants?
   - What are the hard non-negotiable constraints (such as latency, offline operation, platform limits, or security boundaries)?
   - What are the edge cases and explicit out-of-scope boundaries?
   - How will success be measured?
4. Once the problem foundation is clear, summarize the anchored working hypothesis in 2 to 3 plain-English sentences and present a single readiness checkpoint question:
   - Option A: Review with Goldfish lenses now.
   - Option B: Clarify additional constraints or assumptions in chat.
5. Wait for the user to confirm Option A before running the Goldfish review synthesis.

### Step 2: Multi-Lens Goldfish Review and Synthesis

1. Evaluate the anchored hypothesis across the seven adversarial Goldfish brainstorming lenses without conversational bias (if subagent spawning is available, run each lens in a fresh context; otherwise, execute an isolated pass per lens or provide a zero-context prompt the user can run in a fresh session):
   - **Contrarian / YAGNI (`egm-zoom-out`):** Why does this feature need to exist? Can an existing library, dependency, or configuration solve 90% of the problem without new code?
   - **Cost, Quota, and Token Economics (`egm-design`):** What is the peak load, memory footprint, database query impact, or token budget at scale?
   - **UX and Developer Ergonomics (`egm-comprehension`):** Is the interface intuitive, consistent with ecosystem conventions, and backed by actionable error messages?
   - **Migration and Backward Compatibility (`egm-implementation-readiness`):** How do existing clients and persisted schemas migrate safely, and how does rollback work mid-migration?
   - **Observability and SRE Debuggability (`egm-codebase-details`):** Are operations traceable and metrics actionable for an engineer debugging an incident at 3 AM?
   - **Long-Term Tech Debt and Maintenance (`egm-structural`):** Does this introduce brittle state machines or tight coupling that will hurt maintainability in 2 years?
   - **Inventive Catalyst (`egm-inventive-catalyst`):** What fundamental trade-off is the design accepting as inevitable, and what architectural pattern resolves the contradiction without compromise?

2. Deduplicate overlapping critiques and synthesize the findings into `concepts_brief.md` using this exact structure:

```markdown
# [Feature Name]

* **Author:** [Author Name or Handle]
* **Date:** [YYYY-MM-DD]

## Overview
[High-level summary of the feature, target user, and core value proposition in plain English.]

## Analysis
[Cohesive analysis from the Goldfish lenses covering technical contradictions, pattern resolutions, operational risks, and the Ideal Final Result.]

## Goals vs. Non-Goals
* **In-Scope Goals:** [Explicitly defined scope items]
* **Out-of-Scope Non-Goals:** [Features intentionally excluded]

## Alternatives Weighed
[Each option rejected during ideation with the concrete technical reason, e.g., "Rejected by author: higher write amplification under burst load."]

## Key Decisions & Staging for Next Steps
[Resolved architectural trade-offs and open questions to carry forward into egm-draft.]
```

### Step 3: Interactive Iteration and Handoff

1. Highlight the 2 to 3 sharpest objections or unresolved risks surfaced by the Goldfish lenses.
2. Ask the user whether they want to refine specific decisions in `concepts_brief.md` or proceed to `egm-draft` to construct the full specification section by section.

## Gotchas

  - Never skip open-ended problem drilling to jump straight into generating `concepts_brief.md` on the first turn unless the user supplies a complete problem brief and explicitly asks for immediate Goldfish synthesis.
  - Never fabricate maintainer rejections in `Alternatives Weighed`; record who rejected an option and the technical reason why.
  - Keep all prose strictly factual and free of promotional filler.
