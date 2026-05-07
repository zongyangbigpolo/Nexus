# architect Playbook — Solution/Enterprise Specialization

Operational details for the **Solution/Enterprise Architect** specialization of the `architect` agent.

**Source of truth**: [architect.agent.md](../../agents/architect.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [architect.agent.md](../../agents/architect.agent.md) |
| ADR Skill | [adr-generator](../../skills/adr-generator/SKILL.md) |
| C4 Diagrams Skill | [c4-diagrams](../../skills/c4-diagrams/SKILL.md) |
| Related | [spec-author](../../agents/spec-author.agent.md), [feature-planner](../../agents/feature-planner.agent.md) |

---

## Role Definition

### Solution Architect Scope
- Design solutions for specific initiatives/projects
- Define integration patterns between systems
- Select appropriate services and components
- Balance functional and non-functional requirements
- Make technology decisions within project scope

### Enterprise Architect Scope
- Define target architecture and technology standards
- Manage capability maps and system portfolio
- Establish governance frameworks
- Drive technology strategy alignment
- Ensure architectural consistency across organization

**Default**: Start with Solution Architect scope unless explicitly asked for enterprise-level work.

---

## Core Frameworks & Methods

### TOGAF (The Open Group Architecture Framework)
Use for enterprise architecture engagements:

| Phase | Activities |
|-------|------------|
| Preliminary | Define architecture principles, governance |
| A: Vision | Establish scope, stakeholders, concerns |
| B: Business | Business capabilities, processes, organization |
| C: Information Systems | Data and application architecture |
| D: Technology | Infrastructure and technology choices |
| E: Opportunities | Gap analysis, roadmap |
| F: Migration Planning | Implementation sequencing |
| G: Governance | Change management, compliance |
| H: Change Management | Architecture evolution |

### Domain-Driven Design (DDD)
Use for complex business domains:

| Concept | Application |
|---------|-------------|
| Bounded Contexts | Identify service boundaries |
| Ubiquitous Language | Align terminology with domain experts |
| Aggregates | Define consistency boundaries |
| Domain Events | Identify integration points |
| Context Mapping | Document relationships between contexts |

### Integration Patterns

| Pattern | When to Use |
|---------|-------------|
| API Gateway | Single entry point, cross-cutting concerns |
| Event-Driven | Loose coupling, eventual consistency acceptable |
| Service Mesh | Complex microservices, observability needs |
| BFF (Backend for Frontend) | Different client requirements |
| Saga | Distributed transactions |
| CQRS | Read/write optimization needed |

---

## Deliverables by Engagement Type

### New System Design

| Artifact | Description | Template |
|----------|-------------|----------|
| Architecture Vision | High-level goals and constraints | See below |
| C4 Diagrams | Context, Container, Component | [c4-diagrams skill](../../skills/c4-diagrams/SKILL.md) |
| ADRs | Key technology decisions | [adr-generator skill](../../skills/adr-generator/SKILL.md) |
| Integration Design | API contracts, event schemas | OpenAPI/AsyncAPI |
| NFR Matrix | Quality attributes with targets | See below |

### Integration Project

| Artifact | Description |
|----------|-------------|
| Integration Architecture | Systems involved, data flows |
| Sequence Diagrams | Interaction patterns |
| Error Handling Strategy | Failure modes, retry policies |
| Data Mapping | Source to target field mapping |
| SLA Definition | Latency, availability, throughput |

### Architecture Review

| Artifact | Description |
|----------|-------------|
| Current State Assessment | As-is architecture documentation |
| Gap Analysis | Issues, risks, technical debt |
| Recommendations | Prioritized improvements |
| Roadmap | Phased implementation plan |

---

## Templates

### Architecture Vision Template

```markdown
# Architecture Vision: {Initiative Name}

## Business Context
{Why this initiative exists, business drivers}

## Scope
### In Scope
- {System/capability 1}
- {System/capability 2}

### Out of Scope
- {Explicitly excluded items}

## Stakeholders
| Role | Name | Concerns |
|------|------|----------|
| Product Owner | | Business value, timeline |
| Tech Lead | | Feasibility, maintainability |
| Security | | Compliance, data protection |
| Operations | | Reliability, supportability |

## Key Requirements
### Functional
1. {Requirement 1}
2. {Requirement 2}

### Non-Functional
| Attribute | Target | Rationale |
|-----------|--------|-----------|
| Availability | 99.9% | Business-critical |
| Latency | <200ms p95 | User experience |
| Throughput | 1000 RPS | Expected load |

## Constraints
- {Budget constraint}
- {Timeline constraint}
- {Technology constraint}
- {Team skill constraint}

## Assumptions
- {Assumption 1}
- {Assumption 2}

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {Risk 1} | High | {Mitigation strategy} |
```

### NFR Matrix Template

```markdown
# Non-Functional Requirements Matrix

| Category | Attribute | Target | Measurement | Priority |
|----------|-----------|--------|-------------|----------|
| Performance | Response time | <200ms p95 | APM metrics | High |
| Performance | Throughput | 1000 RPS | Load testing | High |
| Scalability | Horizontal scale | 10x current | Auto-scaling | Medium |
| Availability | Uptime | 99.9% | Monitoring | High |
| Availability | RTO | 4 hours | DR testing | Medium |
| Availability | RPO | 1 hour | Backup validation | Medium |
| Security | Authentication | OAuth 2.0/OIDC | Security audit | High |
| Security | Data encryption | TLS 1.3, AES-256 | Compliance check | High |
| Maintainability | Code coverage | >80% | CI pipeline | Medium |
| Maintainability | Documentation | ADRs for decisions | Review process | Medium |
```

### Capability Map Template

```markdown
# Capability Map: {Domain}

## Level 0: Business Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│                    {Organization Name}                       │
├──────────────────┬──────────────────┬───────────────────────┤
│   Customer       │   Operations     │   Support             │
│   Engagement     │                  │                       │
├──────────────────┼──────────────────┼───────────────────────┤
│ • Onboarding     │ • Provisioning   │ • Help Desk           │
│ • Portal         │ • Monitoring     │ • Documentation       │
│ • Billing        │ • Automation     │ • Training            │
└──────────────────┴──────────────────┴───────────────────────┘
```

## Level 1: Capability Details

### {Capability Name}
- **Description**: {What this capability does}
- **Systems**: {Supporting systems}
- **Maturity**: {Current/Target}
- **Owner**: {Team/Person}
- **Status**: {Invest/Maintain/Retire}
```

---

## Decision Frameworks

### Technology Selection Criteria

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Fit for Purpose | 30% | Does it solve the problem? |
| Team Skills | 20% | Can the team use it effectively? |
| Ecosystem | 15% | Community, documentation, support? |
| Total Cost | 15% | License, infrastructure, maintenance? |
| Strategic Alignment | 10% | Matches organization standards? |
| Risk | 10% | Vendor stability, security, lock-in? |

### Build vs Buy Decision

```markdown
## Build vs Buy Analysis: {Component}

### Option 1: Build
| Factor | Score (1-5) | Notes |
|--------|-------------|-------|
| Time to market | | |
| Total cost (3 yr) | | |
| Customization | | |
| Maintenance burden | | |
| Strategic value | | |

### Option 2: Buy {Product}
| Factor | Score (1-5) | Notes |
|--------|-------------|-------|
| Time to market | | |
| Total cost (3 yr) | | |
| Customization | | |
| Maintenance burden | | |
| Strategic value | | |

### Recommendation
{Decision with rationale}
```

---

## Common Patterns

### Microservices Decomposition

**Strategies**:
1. **By Business Capability** — align with domain capabilities
2. **By Subdomain** — follow DDD bounded contexts
3. **By Team** — Conway's Law, team ownership
4. **By Data** — data ownership and lifecycle

**Anti-patterns to avoid**:
- Distributed monolith (tight coupling)
- Shared database between services
- Synchronous chains (cascading failures)
- Too fine-grained services (nano-services)

### API Design Principles

| Principle | Guidance |
|-----------|----------|
| Contract First | Design API before implementation |
| Versioning | URL path (`/v1/`) or header |
| Consistency | Naming conventions, error formats |
| Pagination | Cursor-based for large datasets |
| Rate Limiting | Protect resources, fair usage |
| Documentation | OpenAPI spec, examples |

---

## Stakeholder Communication

### Architecture Review Board (ARB) Presentation

Structure for presenting to ARB:
1. **Context** (2 min) — problem and business drivers
2. **Scope** (2 min) — boundaries and constraints
3. **Options Considered** (5 min) — alternatives with trade-offs
4. **Recommendation** (3 min) — proposed solution
5. **Risks & Mitigations** (3 min) — known risks
6. **Ask** (1 min) — what you need from ARB

### Executive Summary Template

```markdown
## Executive Summary: {Initiative}

**Status**: {Green/Yellow/Red}

### Key Points
- {Main takeaway 1}
- {Main takeaway 2}
- {Main takeaway 3}

### Decision Needed
{What decision is required from leadership}

### Timeline Impact
{Any schedule implications}

### Budget Impact
{Cost implications if any}
```

---

## Reference Architectures

### Event-Driven Architecture

```
┌─────────┐    Events    ┌──────────────┐    Events    ┌─────────┐
│ Producer├─────────────►│ Event Broker ├─────────────►│Consumer │
│ Service │              │ (Kafka/SB)   │              │ Service │
└─────────┘              └──────────────┘              └─────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Event Store  │
                         │ (Audit/Replay)│
                         └──────────────┘
```

**When to use**:
- Loose coupling required
- Eventual consistency acceptable
- Audit trail needed
- Multiple consumers for same events

### API Gateway Pattern

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│ Mobile  │────►│             │────►│ Service A   │
└─────────┘     │             │     └─────────────┘
                │ API Gateway │
┌─────────┐     │             │     ┌─────────────┐
│ Web App │────►│ • Auth      │────►│ Service B   │
└─────────┘     │ • Rate Limit│     └─────────────┘
                │ • Routing   │
┌─────────┐     │ • Transform │     ┌─────────────┐
│ Partner │────►│             │────►│ Service C   │
└─────────┘     └─────────────┘     └─────────────┘
```

**Responsibilities**:
- Authentication/Authorization
- Rate limiting
- Request/Response transformation
- Routing
- Monitoring/Logging

---

## Checklists

### Architecture Review Checklist

- [ ] Business requirements understood and documented
- [ ] Non-functional requirements defined with targets
- [ ] Constraints and assumptions documented
- [ ] Multiple options considered with trade-offs
- [ ] Key decisions documented as ADRs
- [ ] C4 diagrams created (Context, Container minimum)
- [ ] Integration points identified
- [ ] Security considerations addressed
- [ ] Operational concerns addressed (monitoring, deployment)
- [ ] Cost estimate provided
- [ ] Risks identified with mitigations
- [ ] Stakeholder review completed

### Pre-Implementation Checklist

- [ ] Architecture approved by stakeholders
- [ ] ADRs reviewed and accepted
- [ ] API contracts defined
- [ ] Data models documented
- [ ] Security review completed
- [ ] Capacity planning done
- [ ] Monitoring strategy defined
- [ ] Deployment strategy defined
- [ ] Rollback plan documented
