---
name: analysis-framework
description: Universal MECE-based analysis framework for structured technical analysis. Provides consistent methodology and report format for any analysis type.
---

# Analysis Framework Skill

Universal framework for structured technical analysis using **MECE (Mutually Exclusive, Collectively Exhaustive)** methodology.

## Core Principles

### MECE Methodology
Ensures analysis is:
- **Mutually Exclusive**: No overlapping categories (each finding belongs to exactly one category)
- **Collectively Exhaustive**: All possibilities covered (nothing missed)

### Analysis Quality Attributes
Every analysis must be:
- **Objective**: Based on evidence, not assumptions
- **Actionable**: Clear recommendations with owners
- **Prioritized**: Severity/impact ranked findings
- **Traceable**: Each finding linked to source evidence

---

## Input Classification Matrix

| Input Type | Indicators | Primary Analyst | Analysis Type |
|------------|------------|-----------------|---------------|
| **Config files** | `.conf`, `.config`, `.xml`, `.json`, `web.config`, `ns.conf` | architect (solution) | Infrastructure Analysis |
| **Log files** | `.log`, timestamps, ERROR/WARN/INFO, stack traces | developer/bugfix | Root Cause Analysis |
| **Architecture specs** | diagrams, components, data flows, API specs | architect (security) | Security Analysis |
| **Cost/resource data** | Azure resources, pricing, usage metrics | azure-ops | Cost Analysis |
| **Feature specs** | requirements, user stories, acceptance criteria | architect (security) | Security Analysis |
| **Code files** | `.cs`, `.ts`, `.py`, `.go`, source code | developer | Code Analysis |
| **Screenshots/images** | `.png`, `.jpg`, UI screenshots, error dialogs | developer | Visual Analysis |
| **Network configs** | firewall rules, routing, load balancer configs | architect (cloud) | Network Analysis |

---

## Universal Analysis Workflow

### Phase 1: Input Processing

Document all input sources (filename, type, size, description). Classify: primary type (config/logs/spec/cost/code), domain, complexity (L/M/H), recommended analyst agent.

### Phase 2: Context Gathering

Establish: system/product name, environment (dev/stg/prod), version, related components. Define scope explicitly: in-scope items, out-of-scope exclusions, assumptions.

### Phase 3: MECE Analysis Structure

Select MECE dimensions based on input type:

| Analysis Type | MECE Dimensions |
|---------------|----------------|
| Infrastructure | Components (Frontend/Middleware/Backend/Integration) × Concerns (Availability/Security/Performance/Maintainability) |
| Logs | Error Categories (User/System/Integration/Data) × Timeline (Before/During/After) |
| Security | STRIDE (6 categories) × Attack Surface (External/Internal/Physical) |
| Cost | Categories (Compute/Storage/Network/Platform) × Optimization (Right-sizing/Scheduling/Commitment/Architecture) |

### Phase 4: Finding Documentation

Each finding must include: ID (F-{category}-{number}), Category, Severity (🔴/🟠/🟡/🟢), Confidence (H/M/L), Source (file:line), Observation (factual), Impact (risk), Evidence (snippet), Recommendation (action), Effort (L/M/H), Owner (role/team).

### Phase 5: Severity Matrix

#### Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| 🔴 **Critical** | Immediate risk: security breach, data loss, system down | Immediate |
| 🟠 **High** | Significant risk: degraded service, compliance violation | Days |
| 🟡 **Medium** | Moderate risk: suboptimal performance, technical debt | Weeks |
| 🟢 **Low** | Minor issue: best practice deviation, cosmetic | Backlog |

#### Impact Assessment Matrix

| | Low Impact | Medium Impact | High Impact |
|---|------------|---------------|-------------|
| **High Likelihood** | 🟡 Medium | 🟠 High | 🔴 Critical |
| **Medium Likelihood** | 🟢 Low | 🟡 Medium | 🟠 High |
| **Low Likelihood** | 🟢 Low | 🟢 Low | 🟡 Medium |

---

## Report Templates

### Standard Analysis Report

```markdown
# {Analysis Type} Report

**Generated**: {date}
**Analyst**: {agent name}
**Input Sources**: {count} files analyzed

---

## Executive Summary

{2-3 sentences: what was analyzed, key findings, overall assessment}

### Key Metrics
| Metric | Value |
|--------|-------|
| Total Findings | {n} |
| 🔴 Critical | {n} |
| 🟠 High | {n} |
| 🟡 Medium | {n} |
| 🟢 Low | {n} |

### Top 3 Priorities
1. {Finding title} — {one-line impact}
2. {Finding title} — {one-line impact}
3. {Finding title} — {one-line impact}

---

## Input Analysis

### Sources Analyzed
| # | File | Type | Lines | Key Content |
|---|------|------|-------|-------------|
| 1 | {name} | {type} | {n} | {description} |

### Scope & Assumptions
- **In Scope**: {list}
- **Out of Scope**: {list}
- **Assumptions**: {list}

---

## Architecture Overview

{If infrastructure analysis: describe discovered architecture}

```
{ASCII diagram of discovered components and relationships}
```

### Component Inventory
| Component | Type | Role | Config Source |
|-----------|------|------|---------------|
| {name} | {type} | {role} | {file:line} |

---

## Findings

### 🔴 Critical Findings
{findings with severity=critical}

### 🟠 High Findings
{findings with severity=high}

### 🟡 Medium Findings
{findings with severity=medium}

### 🟢 Low Findings
{findings with severity=low}

---

## Recommendations Summary

| # | Finding | Recommendation | Effort | Owner |
|---|---------|----------------|--------|-------|
| 1 | {title} | {action} | {L/M/H} | {role} |

### Quick Wins (Low Effort, High Impact)
{filtered list}

### Strategic Improvements (High Effort, High Impact)
{filtered list}

---

## Appendix

### A. Raw Data References
{links to source files, line numbers}

### B. Methodology
Analysis performed using MECE framework with {specific analysis type} methodology.

### C. Glossary
{domain-specific terms}
```

---

## Analysis Type Checklists

**Infrastructure**: components identification, relationship mapping, HA config, security settings, performance settings, hardcoded values, deprecated features, logging config.
**Logs**: timeline establishment, error patterns, cross-source correlation, root cause candidates, blast radius, contributing factors, prevention measures.
**Security**: trust boundaries, data flows, STRIDE per component, authN, authZ, data protection (rest/transit), compliance gaps, third-party risks.
**Cost**: resource inventory, cost center categorization, top cost drivers, orphaned resources, utilization rates, right-sizing, reserved capacity, future projections.

---

## Cross-References

- For **threat modeling specifics**: [threat-modeling skill](../threat-modeling/SKILL.md)
- For **cost analysis commands**: [azure-cost-analysis skill](../azure-cost-analysis/SKILL.md)
- For **architecture patterns**: [architect playbooks](../../agent-assets/architect/)
- For **debugging patterns**: [bugfix playbook](../../agent-assets/bugfix.playbook.md)
