---
name: project-init
description: Initialize a repository for AI-assisted development — JIRA context, feature branch, AGENTS.md, ARCHITECTURE.md, copilot-instructions.md, and PR.
agent: architect
argument-hint: "jira=<JIRA_ID>"
---

# Project Initialization

End-to-end repository initialization for AI-assisted development.

**JIRA ID**: ${input:jira:JIRA ID (e.g., SPAOP-12345, CTXENG-1234)}

## Workflow

Use **system specialization** — load [architect-system playbook](../agent-assets/architect/architect-system.playbook.md).

### Phase 1: Setup (delegate)
1. Hand off to `dev-coordinator` with JIRA ID → transitions JIRA "In Progress", creates branch
2. Once branch is ready, proceed to Phase 2

### Phase 2: Generate AGENTS.md
Per [agentsmd workflow](agentsmd.md):
1. Scan repository structure — root and subprojects
2. Detect tech stack, architecture patterns, build/test commands
3. Generate/update AGENTS.md per [template](../agent-assets/templates/agents-md.template.md)
4. **Augment, don't replace** existing content

### Phase 3: Generate ARCHITECTURE.md
Per [architecturemd workflow](architecturemd.md):
1. Scan repository per system playbook phases
2. Generate all sections per [template](../agent-assets/templates/architecture-md.template.md)
3. Validate — all sections present, diagrams exist, no secrets

### Phase 3.5: Go + Protobuf Enrichment (conditional)
If `go.mod` exists in the repository root:
1. Identify the repo name (e.g., `acs-policy-service`)
2. Check `icaclientmac/protobuf` repo for a matching folder with the same name
3. If found, scan `.proto` files to extract gRPC service definitions, methods, and message types
4. Enrich the **API Surface** section in AGENTS.md with API contract tables from proto definitions
5. Update ARCHITECTURE.md with gRPC service interaction details

> **Note**: The protobuf repo follows the convention of using the same folder name as the service repo name.

### Phase 4: Generate copilot-instructions.md
1. Generate `.github/copilot-instructions.md` per [template](../agent-assets/templates/copilot-instructions-md.template.md)
2. Keep it short — reference AGENTS.md and ARCHITECTURE.md, do not duplicate content
3. Include 3-5 quick reminders specific to this repo's conventions
4. If file already exists, **augment** — add missing references, don't overwrite

### Phase 5: Submit (delegate)
Hand off to `git-ops`: commit, push, create PR linked to JIRA.
Commit message: `{JIRA-ID} Initialize project AI context [AI-Generated]`

## Rules
- AGENTS.md first, then ARCHITECTURE.md, then copilot-instructions.md (later files may reference earlier ones)
- Augment existing files — never overwrite
- ASCII or Mermaid diagrams only (no Unicode box-drawing)

---

**JIRA**: ${input:jira}
