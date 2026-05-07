---
name: architecture
description: Create architecture artifacts — diagrams, ADRs, threat models, design documents. Supports Solution, Cloud, and Security architecture specializations.
agent: architect
---

# Architecture Design

Design and document software architecture using proven methodologies.

## Inputs

- **Specialization**: ${input:specialization:auto} — `auto`, `solution`, `cloud`, `security`
- **Task**: ${input:task:design} — `design`, `review`, `adr`, `threat-model`, `diagram`
- **Context**: ${input:context:} — Describe the system, feature, or decision

---

## Specialization Guide

| Keywords | Specialization |
|----------|---------------|
| integration, API, microservices, domain | Solution |
| Azure, Kubernetes, CI/CD, landing zone | Cloud |
| threat, compliance, encryption, OWASP | Security |

When `auto` (default), the agent analyzes context and selects automatically.

---

## Usage

```
/architecture task=design context="Auth system with Azure AD B2C"
/architecture task=adr context="PostgreSQL vs CosmosDB for transactions"
/architecture task=diagram context="C4 Container for order processing"
```
