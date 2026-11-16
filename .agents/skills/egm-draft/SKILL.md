---
name: egm-draft
description: Drafts a software design specification (design_draft.md) section by section from a concept brief (concepts_brief.md) or user notes following the Elephant-Goldfish Model (EGM). Enforces the No-Code rule, human decision gates for architectural trade-offs, and section-by-section approval. Use when the user runs /egm-draft or wants to write a structured technical design doc after brainstorming.
---

# egm-draft

Section-by-section specification drafting skill adapted from the Google Elephant-Goldfish Model (EGM). Operating as the deep-context "Elephant", it converts a `concepts_brief.md` or user requirements into a rigorous `design_draft.md` with human approval gates after each section and zero production code implementation.

## When to Use

  - The user invokes `/egm-draft` or asks to turn a concept brief or notes into a full software design specification.
  - The user wants an interactive, section-by-section technical design workflow that enumerates every modified file before implementation begins.

## Steps

### Step 1: Ingest Predecessor Context

1. Check if the user provided `concepts_brief.md`, `discussion_summary.md`, or inline requirements in the conversation.
2. If no brief or notes are present, ask the user to provide the problem statement, goals, and technical context (or offer to start with `egm-brainstorm`).
3. Summarize the ingested context in 2 to 3 sentences and confirm with the user before drafting Section 1.
4. Enforce core drafting constraints throughout every step:
   - **Owner Decides Architecture:** Whenever an architectural choice has more than one defensible option (data model, storage engine, protocol, module boundary), present up to 3 options with their mechanisms, trade-offs, and failure conditions. Ask the user to choose via a single question gate without ranking or picking a default.
   - **No Production Code:** Do not write implementation code during drafting. Interface signatures, data schemas, and brief illustrative pseudocode are permitted.
   - **Plain-English Standard:** Write direct, objective technical prose without buzzwords, flattery, or apologies.

### Step 2: Draft Overview, Goals, and Problem Statement

1. Draft Section 1 of `design_draft.md` covering:
   - **The Problem:** Concrete failure modes, bottlenecks, or missing capabilities in the current system.
   - **Overview:** High-level summary of the proposed solution.
   - **Goals and Non-Goals:** Explicit measurable goals and out-of-scope boundaries.
2. Update or output `design_draft.md`, summarize the 2 to 3 key framing points in chat, and pause at the Section Approval Gate:
   - Ask whether the user wants to **Approve Overview & Goals and proceed to Technical Plan** or **Request revisions to Overview & Goals**.

### Step 3: Draft Technical Plan

1. Once Overview & Goals is approved, draft the **Technical Plan** section covering:
   - System architecture, component boundaries, and state transitions.
   - Data flow diagrams (Mermaid or ASCII), API contracts, data models, failure recovery, and observability.
2. Update `design_draft.md`, highlight the key architectural decisions in chat, and pause at the Section Approval Gate:
   - Ask whether the user wants to **Approve Technical Plan and proceed to Alternatives Considered** or **Request revisions to Technical Plan**.

### Step 4: Draft Alternatives Considered

1. Re-read the rejected alternatives from `concepts_brief.md` (or ask the user if none were recorded).
2. Draft the **Alternatives Considered** section detailing each rejected approach and the concrete technical reason it was ruled out (such as latency, operational complexity, or schema lock-in).
3. Update `design_draft.md`, summarize the documented alternatives in chat, and pause at the Section Approval Gate:
   - Ask whether the user wants to **Approve Alternatives Considered and proceed to Detailed Implementation Plan** or **Request revisions to Alternatives Considered**.

### Step 5: Draft Detailed Implementation Plan

1. Draft the **## Detailed Implementation Plan** section (using that exact heading so `egm-review` can detect the semantic boundary):
   - Provide a single unified list enumerating every file to be created, modified, or deleted (including source files, schemas, configs, docs, and tests).
   - For every file, state the repository-relative path and a concrete rationale explaining what changes and why.
   - Include deterministic verification and test steps so an engineer or coding agent can implement the spec without making unstated architectural decisions.
2. Update `design_draft.md`, summarize the file boundary scope in chat, and pause at the Section Approval Gate:
   - Ask whether the user wants to **Approve Detailed Implementation Plan and finalize** or **Request revisions to Detailed Implementation Plan**.

### Step 6: Reconcile Against Predecessor Brief and Finalize

1. Compare the completed `design_draft.md` against the initial `concepts_brief.md`:
   - **Contradictions:** List any point where the brief decided a question one way and the draft decided it differently, quoting both.
   - **Architectural Additions:** List any new architectural decision, external interface, or dependency added in the draft that was absent from the brief.
2. If any contradictions exist, ask the user to resolve each one before finalizing.
3. Produce the final `design_draft.md` and recommend running `egm-review` on the completed document.

## Gotchas

  - Never dump all four sections in a single turn without user approval between sections unless the user explicitly asks for a one-shot full draft.
  - Always include the exact heading `## Detailed Implementation Plan` to preserve compatibility with `egm-review` semantic split detection.
  - Never silently resolve an architectural trade-off on the user's behalf.
