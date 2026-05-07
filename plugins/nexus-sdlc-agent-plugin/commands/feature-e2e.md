---
name: feature-e2e
description: >
  End-to-end feature delivery — from JIRA Feature ticket through design doc, Confluence publishing,
  JIRA story breakdown, implementation, security review, and PR submission.
agent: spec-author
---

# End-to-End Feature Delivery

Execute the complete feature delivery pipeline: design → publish → plan → implement.

## JIRA Feature ID

${input:jira:JIRA Feature/Epic ID (e.g., HDX-12345)}

---

## What happens

This command orchestrates the full delivery chain:

1. **Phase 1: Design Document** (`spec-author`)
   - Read JIRA Feature requirements
   - Write technical specification → `specs/{JIRA-ID}.spec.md`
   - Generate architecture and sequence diagrams
   - **→ Handoff to article-publisher**

2. **Phase 2: Confluence Publishing** (`article-publisher`)
   - Convert spec to Confluence format
   - Create/update Confluence page
   - **→ Handoff to feature-planner**

3. **Phase 3: Story Breakdown** (`feature-planner` → `jira-manager`)
   - Extract work items from spec
   - Create JIRA Epic → Stories hierarchy
   - **→ Handoff to dev-coordinator**

4. **Phase 4: Implementation Loop** (`dev-coordinator` → `developer` → `security-engineer`)
   - For each Story:
     - Create branch and task file
     - Implement code and tests
     - Security review
     - Create PR and merge
   - Update JIRA status on completion

## E2E Mode

When invoked via `/feature-e2e`, `spec-author` operates in **E2E mode**:
- After writing the spec, it presents handoff buttons in the recommended order
- The suggested path is: Confluence → Plan → Implement
- Each handoff requires a user click (VS Code platform requirement)

## Estimated Interactions

| Scenario | User Clicks | Duration |
|----------|------------|----------|
| Single Story | ~6 | Design → PR |
| Epic (3 Stories) | ~12 | Design → 3 PRs |
| Epic (5 Stories) | ~18 | Design → 5 PRs |

---

**JIRA**: ${input:jira}
