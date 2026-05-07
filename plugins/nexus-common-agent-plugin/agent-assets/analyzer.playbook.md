# Analyzer Playbook

Operational details for the `analyzer` agent. Load when performing self-analysis or orchestrating multi-domain analysis.

**Source of truth**: [analyzer.agent.md](../agents/analyzer.agent.md)

---

## Input Classification Matrix

| File Pattern | Detected Type | Route To | Analysis Focus |
|--------------|---------------|----------|----------------|
| `*.conf`, `ns.conf`, `web.config` | Infrastructure | architect (solution) | Components, HA, security |
| `*.log`, stack traces, timestamps | Log Analysis | bugfix | Timeline, errors, RCA |
| Feature spec, threat model request | Security | architect (security) | STRIDE, trust boundaries |
| Azure resources, cost data | Cost | azure-ops | Spend, optimization |
| `*.cs`, `*.ts`, `*.py`, source code | Code | developer | Quality, patterns |
| Screenshots, UI images | Visual | self | Describe findings |
| Mixed/unclear | Multi-domain | self (orchestrate) | Decompose and route |

---

## Context Gathering Questions

When scope is unclear, ask:

| Question | Purpose |
|----------|---------|
| What system/product is this? | Identify domain |
| What environment? (dev/stg/prod) | Risk assessment |
| What specific concerns to investigate? | Focus analysis |
| What decisions will this inform? | Tailor recommendations |
| Any known issues to focus on? | Prioritize investigation |

---

## Self-Analysis Procedure (Option A)

For straightforward single-type inputs that don't require specialist:

### Step 1: Load Framework
Load [analysis-framework skill](../skills/analysis-framework/SKILL.md) for:
- MECE category definitions
- Finding documentation template
- Severity matrix
- Report templates

### Step 2: Apply MECE Structure

Select structure based on input type:

**For Configs**:
```
├── Components (Frontend, Middleware, Backend, Integration)
└── Concerns (Availability, Security, Performance, Maintainability)
```

**For Logs**:
```
├── Error Categories (User, System, Integration, Data)
└── Timeline (Before, During, After incident)
```

**For Screenshots**:
```
├── UI Elements (Layout, Controls, Navigation)
└── Issues (Errors, Warnings, Usability)
```

### Step 3: Document Findings

For each finding, use template from skill:
```markdown
### Finding #{n}: {Title}
| Attribute | Value |
|-----------|-------|
| **Severity** | 🔴/🟠/🟡/🟢 |
| **Source** | {file:line} |

**Observation**: {factual}
**Impact**: {risk}
**Recommendation**: {action}
```

### Step 4: Generate Report

Use Standard Analysis Report template from skill.

---

## Multi-Domain Orchestration (Option C)

For inputs spanning multiple domains:

### Step 1: Decompose
Identify domain boundaries:
```markdown
| Domain | Inputs | Specialist | Focus |
|--------|--------|------------|-------|
| Infrastructure | {files} | architect | {concerns} |
| Security | {files} | architect (security) | {concerns} |
| Performance | {files} | developer | {concerns} |
```

### Step 2: Route Sequentially
1. Hand off to first specialist with context
2. Collect findings
3. Hand off to next specialist
4. Repeat until all domains covered

### Step 3: Synthesize
- Deduplicate overlapping findings
- Normalize severity ratings
- Cross-reference related findings
- Generate unified report

---

## Handoff Templates

### To Architect (Infrastructure)
```markdown
## Infrastructure Analysis Request

**Input Files**: {list}
**System**: {name}
**Environment**: {env}
**Focus Areas**: components, HA, security settings, performance
**Expected Output**: Component inventory, findings by concern area

Use MECE framework from analysis-framework skill.
```

### To Architect (Security)
```markdown
## Security Analysis Request

**Input Files**: {list}
**System**: {name}
**Trust Boundaries**: {if known}
**Focus Areas**: STRIDE analysis, data flows, auth mechanisms
**Expected Output**: Threat model, security findings

Use threat-modeling skill for STRIDE methodology.
```

### To Bugfix (Logs)
```markdown
## Log Analysis Request

**Input Files**: {list}
**Time Range**: {if known}
**Known Symptoms**: {description}
**Focus Areas**: Error patterns, timeline, root cause candidates
**Expected Output**: RCA findings, contributing factors
```

### To Azure-Ops (Cost)
```markdown
## Cost Analysis Request

**Input Files/Scope**: {list or subscription}
**Time Period**: {days}
**Focus Areas**: Top spenders, optimization opportunities
**Expected Output**: Cost breakdown, savings recommendations

Use azure-cost-analysis skill.
```

### To Developer (Code)
```markdown
## Code Analysis Request

**Input Files**: {list}
**Focus Areas**: {quality, security, performance, patterns}
**Context**: {what the code does}
**Expected Output**: Code findings, improvement recommendations
```

---

## Report Customization

### Executive Summary Formula
```
We analyzed {n} {file types} from {system name}.
Found {critical} critical, {high} high-priority issues.
Top concern: {highest impact finding summary}.
```

### Priority Filtering

**Quick Wins** (recommend first):
- Severity ≥ Medium AND Effort = Low

**Strategic** (recommend for roadmap):
- Severity ≥ High AND Effort = High

**Defer** (backlog):
- Severity = Low OR (Severity = Medium AND Effort = High)

---

## Checklists

### Pre-Analysis Checklist
- [ ] All inputs inventoried
- [ ] Input types classified
- [ ] Analysis type confirmed with user
- [ ] Scope defined (in/out)
- [ ] Specialist identified (self or handoff)

### Post-Analysis Checklist
- [ ] All findings documented with evidence
- [ ] Severity assigned to each finding
- [ ] Recommendations are actionable
- [ ] Report generated
- [ ] Next steps offered (JIRA, Confluence, deep dive)

---

## Related

- [analysis-framework skill](../skills/analysis-framework/SKILL.md) — MECE methodology, templates
- [threat-modeling skill](../skills/threat-modeling/SKILL.md) — STRIDE for security
- [azure-cost-analysis skill](../skills/azure-cost-analysis/SKILL.md) — Cost analysis
