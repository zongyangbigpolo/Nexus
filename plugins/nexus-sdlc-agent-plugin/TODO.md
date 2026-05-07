# TODO — Future Features & Ideas

This document tracks ideas and planned improvements for `nexus-common-agent-plugin`.

Items are organized by category and priority. Remove completed items when implemented.

---

## Agents

### New Agents (Planned)

| Agent | Description | Priority | Depends On |
| --- | --- | --- | --- |
| ctxbv-refiner | CTXBV requirements extraction and refinement | Medium | spec-author agent |

---

## Instructions

### New Instructions (Planned)

| Instruction | Description | Priority |
| --- | --- | --- |
| dotnet-conventions | .NET project conventions | Medium |
| react-conventions | React/TypeScript conventions | Medium |
| api-design | REST/gRPC API design guidelines | Medium |
| database-conventions | SQL/NoSQL schema guidelines | Low |

---

## Skills

### Enhancement Ideas

| Skill | Enhancement | Priority |
| --- | --- | --- |
| threat-modeling | Add PASTA methodology alongside STRIDE | Low |
| adr-generator | Add lightweight RFC template | Low |

---

## Architect Agent

### Future Enhancements

| Enhancement | Description | Priority |
| --- | --- | --- |
| Data Architect specialization | Data modeling, ETL, data governance playbook | Medium |
| Infrastructure-as-Code patterns | Terraform/Bicep templates in cloud playbook | Medium |
| Architecture fitness functions | Automated architecture validation | Low |

---

## Help & Documentation

| Item | Description | Priority |
| --- | --- | --- |
| Help content sync | Consider auto-generating help.md from AGENTS.md tables | Low |

---

## Asset Quality

| Item | Description | Priority |
| --- | --- | --- |
| Agent section order normalization | Normalize all agents to recommended section order: Frontmatter → Role → Skills → Objective → Workflow → Constraints → Error Recovery → Handoffs | Low |
| release-manager size limit | Refactor release-manager.agent.md (~260 lines) to ≤150 — extract Phase steps to playbook | Medium |
| Coordinator native merge mode coverage | Audit other coordinator-style agents for native merge flow consistency instead of merge handoffs | Low |
| Router route/button consistency | Audit router summaries so all routed suggestions show both agent name and handoff button label when applicable | Low |

---

## Backlog from Round 3 Audit

| Item | Description | Priority |
| --- | --- | --- |
| Onboarding workflow | Guided onboarding prompt for new team members | Low |

---

## Asset Integrity

| Item | Description | Priority |
| --- | --- | --- |
| Automated validation script | Script to parse frontmatter and verify handoff targets exist | Low |
| `fetch` tool usage | `feature-testplan-author` declares `fetch` tool — no other agent does. Verify validity | Low |
| 19/19 injection coverage | All 19 agents now have guards. Monitor new agents | Low |

---

Last updated: 2026-04-02
