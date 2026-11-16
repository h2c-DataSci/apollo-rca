---
name: egm-drift-report
description: Detects architectural and implementation drift between design documents (or README contracts) and current source code following the Elephant-Goldfish Model (EGM). Produces a structured {YYYY-MM-DD}_DRIFT_REPORT.md listing only concrete divergences. Use when the user runs /egm-drift-report or asks to check whether code matches design specs or READMEs.
---

# egm-drift-report

Specification-to-code drift detection skill adapted from the Google Elephant-Goldfish Model (EGM). It systematically compares design documents or `README.md` contracts against actual source code files and reports every discrepancy so the engineer can decide whether to update the documentation or fix the code.

## When to Use

  - The user invokes `/egm-drift-report` or asks to check for drift between design documents/READMEs and the live codebase.
  - The user wants to audit whether an implemented feature faithfully matches its approved specification.

## Steps

### Step 1: Verify Target Inputs

1. Check that the user has provided (or pointed to) the target design document(s) or `README.md` contract(s) and the corresponding source code files.
2. If either the documentation target or source code context is missing, prompt the user to specify the target directory/files or share them in the conversation.

### Step 2: Sequential Document-to-Code Audit

Process each design document or README sequentially:

1. **Contextualize:** Read the document and extract every stated intent, architectural pattern, file path, class/struct/proto definition, function signature, API endpoint, and invariant.
2. **Locate Source:** Match each referenced symbol, endpoint, or file to the corresponding source code. If a document references symbols without explicit file paths, note the missing file link so the user can add it to make future drift checks deterministic.
3. **Detect Drift Across Four Vectors:** Compare the specification against the current source code and look specifically for:
   - **Missing Features:** Logic, endpoints, error handling, or workflows described in the document that are absent from the code.
   - **Incomplete Models:** Dataclasses, structs, database schemas, or protos missing fields, types, or constraints specified in the design.
   - **Logic Shortcuts:** Hardcoded values, stubbed methods, or bypassed validations where dynamic or enforced logic was planned.
   - **Architectural Divergence:** Implementation using different libraries, concurrency models, state machines, or module boundaries than proposed, or undocumented code logic within the component boundary that is missing from the contract.
4. **Filter Noise:** Report only the differences. Do not summarize what is working or what matches. If a document and its code match completely, record `"No drift detected."` for that document.

### Step 3: Generate the Drift Report Artifact

Compile all findings into `{YYYY-MM-DD}_DRIFT_REPORT.md` using this strict format:

```markdown
# EGM Drift Report ({YYYY-MM-DD})

## <DESIGN_DOC_OR_README_NAME>
- **[Missing Feature | Incomplete Model | Logic Shortcut | Architectural Divergence | Missing Link]:** `<file_path:symbol>` - [Exact description of what the document specifies vs. what the current code actually does]
```

*(Or output `No drift detected.` under `## <DESIGN_DOC_OR_README_NAME>` if zero divergences exist.)*

After presenting the report, ask the user which divergences should be resolved by updating the specification/README versus updating the source code.

## Gotchas

  - Be rigorous: if a design doc names a specific field, function signature, or file path and the code omits or renames it, always flag it as drift.
  - Do not pad the report with praise or summaries of matching components; include only concrete discrepancies.
