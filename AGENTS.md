# Agent Instructions & Workflows (EGM)

This repository uses the **Elephant-Goldfish Model (EGM)** for grounded architecture documentation, specification drafting, adversarial design review, and drift detection.

## Available EGM Skills (`.agents/skills/`)
- **`egm-bootstrap`** (`.agents/skills/egm-bootstrap/SKILL.md`): Generates and updates bottom-up architectural contracts (`EGM.md` or `README.md`) across the codebase ("Peanuts" leaf contracts and "Hay" root blueprints).
- **`egm-brainstorm`** (`.agents/skills/egm-brainstorm/SKILL.md`): Turns rough feature ideas into structured `concepts_brief.md` documents via open-ended drilling and 7 adversarial Goldfish lenses.
- **`egm-draft`** (`.agents/skills/egm-draft/SKILL.md`): Drafts `design_draft.md` specifications section by section with human decision gates and zero premature production code.
- **`egm-review`** (`.agents/skills/egm-review/SKILL.md`): Executes the 5-stage Goldfish Review Protocol (Initial Zoom Out, Comprehension, Critic Review, Intermediate Zoom Out, Implementation Readiness).
- **`egm-review-loop`** (`.agents/skills/egm-review-loop/SKILL.md`): Runs multi-round adversarial review loops until two consecutive clean rounds or the 5-round cap.
- **`egm-resolve`** (`.agents/skills/egm-resolve/SKILL.md`): Triages Goldfish findings into `PROPOSE FIX`, `CONTEST`, `ESCALATE`, or `DECLINE` in `goldfish_review_report.md`.
- **`egm-drift-report`** (`.agents/skills/egm-drift-report/SKILL.md`): Audits source code against design specs or contracts across 4 drift vectors (`Missing Feature`, `Incomplete Model`, `Logic Shortcut`, `Architectural Divergence`).

## Workspace Hygiene
- Store temporary EGM working artifacts (`concepts_brief.md`, `design_draft.md`, `goldfish_review_report.md`, `*_DRIFT_REPORT.md`) inside `.egm/` (which is gitignored) and clean up scratch files after completing a feature unless instructed to retain them.
