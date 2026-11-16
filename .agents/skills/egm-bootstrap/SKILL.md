---
name: egm-bootstrap
description: Generates, updates, and verifies Elephant-Goldfish Model (EGM) architectural contract README.md files ("Peanuts" leaf package contracts and "Hay" parent blueprints) across a codebase directory tree. Use when the user runs /egm-bootstrap or wants to document codebase interfaces, invariants, and side effects bottom-up.
---

# egm-bootstrap

Bottom-up codebase documentation and contract verification skill adapted from the Google Elephant-Goldfish Model (EGM). It creates or updates structured `README.md` (or custom contract filename) files across a repository tree so both human engineers and AI agents have grounded architectural contracts:

  - **Peanuts (Leaf Component Contracts):** Document public symbols, state/call invariants, and side effects for leaf packages, grounded in exact source citations.
  - **Hay (Parent Blueprints):** Roll up child component contracts into intermediate and repository-root architectural indexes.

## When to Use

  - The user invokes `/egm-bootstrap` or asks to generate or refresh EGM architectural contracts (`README.md` or `EGM.md`) across a codebase directory or repository.
  - The user wants grounded documentation of public interfaces, invariants, and side effects cited directly to code symbols.

## Steps

### Step 1: Ecosystem and Scope Discovery

1. Confirm the target directory `path` and `target_filename` (defaults to `README.md`; suggest `EGM.md` if the user wants to preserve existing human READMEs untouched).
2. Inspect the project root for build/test manifests to determine the `<test-command>` (`package.json` -> `npm test`, `Cargo.toml` -> `cargo test`, `go.mod` -> `go test ./...`, `pyproject.toml` -> `pytest`, `Makefile` -> `make test`, `BUILD.bazel` -> `bazel test //...`).
3. Map the directory tree level by level (ignoring `.git`, `node_modules`, `venv`, `dist`, `build`, `third_party`, `.gitignore` patterns, test-only directories, and directories without source code or schemas).
4. **Mandatory Safety Gate:** If the mapped tree contains more than 15 code directories, pause immediately and ask the user for confirmation before processing the full tree.

### Step 2: Bottom-Up Leaf Contract Generation ("Peanuts")

Traverse the code directories in post-order (deepest leaves first). For each leaf or component directory:

1. Scan all source files in the directory as a read-only code scout (`goldfish-explorer` rules):
   - Extract public classes, functions, endpoints, schemas, and exported symbols.
   - Identify explicit state/call invariants and side effects (disk I/O, network calls, database mutations, locks, environment reads).
   - **Strict Grounding Rule:** Never guess RPC routes, status enums, invariants, or side effects from filenames alone. Cite the exact `[file:symbol_or_flag]` for every entry, and write `None` if no explicit invariants or side effects exist in the code.

2. If `target_filename` already exists in the directory, preserve valid existing context while updating and formatting it to match the Component Package (Peanuts) template:

```markdown
# [Component Name]

## Overview
[Factual prose overview of the component's architectural role and goals]

## Interface
- `[file:symbol]`: [Description of public class, function, or schema]
- [Subdirectories and relative links to their contracts, e.g., `./subdir/README.md`]

## Invariants
- `[file:symbol]`: [State and call invariants that must be preserved, or None]

## Side Effects
- `[file:symbol]`: [State mutations, network calls, disk access, locks, or None]

## Verification
- Run: `<test-command>`
```

### Step 3: Intermediate and Root Blueprint Roll-Up ("Hay")

Once child directories have verified contracts, synthesize parent directories bottom-up:

1. For **Intermediate Directories** (grouping subdirectories without root-level scope), use the Intermediate Blueprint template:

```markdown
# [Directory Name]

## Overview
[Factual overview of the subsystems grouped under this directory]

## Subdirectories & Boundaries
- **[Subdirectory Name]** (`./subdir/README.md`): [Summary of child contract role and boundary]
```

2. For the **Repository or Subtree Root**, generate the Repository Root Blueprint ("Hay") template:

```markdown
# [Repository Name] Blueprint

## System Overview
[High-altitude architectural overview of the system]

## Local Interface & Invariants
- [Direct symbols, invariants, and side effects of files in the root folder, if any]

## Subdirectories & System Boundaries
- **[Subdirectory Name]** (`./subdir/README.md`): [Summary of child contract and architectural boundary]

## Global Invariants
- [System-wide constraints that cross component boundaries]

## Global Side Effects
- [Shared resources, databases, or external integrations affected by this system]

## System Verification
- Run: `<test-command>`
```

## Gotchas

  - Never write or modify functional source code or run `git commit` during `egm-bootstrap`; restrict output strictly to documentation contracts.
  - Never hallucinate invariants or side effects that cannot be cited to a specific file and symbol in the directory.
