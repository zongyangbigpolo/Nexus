---
name: adr-generator
description: Generate Architecture Decision Records (ADRs) following industry best practices. Documents technical decisions with context, options, and consequences.
---

# ADR Generator Skill

## When to Use
- Making significant technical decisions
- Selecting technologies, frameworks, or patterns
- Changing established patterns
- After architecture discussions/reviews
- Documenting existing decisions retroactively

## ADR Format

Based on Michael Nygard's template with extensions.

### Filename Convention
```
docs/adr/NNNN-{short-title-in-kebab-case}.md
```
- NNNN: Sequential number (0001, 0002, etc.)
- Use kebab-case for title

### Template

```markdown
# ADR-{NNNN}: {Title}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXXX}

## Date
{YYYY-MM-DD}

## Decision Makers
- {Name/Role 1}
- {Name/Role 2}

## Context

### Problem Statement
{What is the issue we're trying to solve?}

### Background
{What led to this decision being needed?}

### Constraints
- {Constraint 1}
- {Constraint 2}

### Requirements
- {Requirement 1}
- {Requirement 2}

## Options Considered

### Option 1: {Name}
{Description}

**Pros**:
- {Pro 1}
- {Pro 2}

**Cons**:
- {Con 1}
- {Con 2}

**Estimated Effort**: {Low/Medium/High}

### Option 2: {Name}
{Description}

**Pros**:
- {Pro 1}
- {Pro 2}

**Cons**:
- {Con 1}
- {Con 2}

**Estimated Effort**: {Low/Medium/High}

### Option 3: {Name}
{Description}

**Pros**:
- {Pro 1}
- {Pro 2}

**Cons**:
- {Con 1}
- {Con 2}

**Estimated Effort**: {Low/Medium/High}

## Decision

We will use **{Option X}** because:
1. {Primary reason}
2. {Secondary reason}
3. {Tertiary reason}

## Consequences

### Positive
- {Positive consequence 1}
- {Positive consequence 2}

### Negative
- {Negative consequence 1}
- {Negative consequence 2}

### Risks
- {Risk 1}: {Mitigation}
- {Risk 2}: {Mitigation}

## Implementation

### Action Items
- [ ] {Action 1}
- [ ] {Action 2}

### Timeline
{When this will be implemented}

## Related

- ADR-{XXXX}: {Related decision}
- {Link to related documentation}

## Notes

{Any additional context or discussion notes}
```

## Workflow

### Step 1: Gather Decision Context

Ask user for:
```markdown
1. What decision needs to be made?
2. What triggered this decision?
3. What constraints exist (time, budget, skills, compatibility)?
4. Who are the stakeholders/decision makers?
5. What options have been considered?
```

### Step 2: Research Options

For technology decisions, evaluate:
| Criterion | Weight | Option 1 | Option 2 | Option 3 |
|-----------|--------|----------|----------|----------|
| Fit for purpose | 30% | | | |
| Team familiarity | 20% | | | |
| Community/Support | 15% | | | |
| Total cost | 15% | | | |
| Strategic fit | 10% | | | |
| Risk | 10% | | | |

### Step 3: Generate ADR

Create ADR using template above with:
- Clear problem statement
- At least 2-3 options analyzed
- Explicit pros/cons for each
- Clear decision with rationale
- Documented consequences

### Step 4: Determine File Location

Check if ADR folder exists:
```bash
# Standard locations
docs/adr/
docs/architecture/decisions/
architecture/decisions/
```

If not exists, recommend: `docs/adr/`

### Step 5: Assign Number

Scan existing ADRs and assign next sequential number:
```bash
# Find highest existing number
ls docs/adr/*.md | sort -n | tail -1
```

## Common ADR Types

| Type | Title Pattern | Key Options |
|------|---------------|-------------|
| Technology Selection | "Select {Technology Type}" | 2+ technologies + "Build custom" |
| Architecture Pattern | "Adopt {Pattern} for {Context}" | Competing patterns (e.g., Monolith vs Microservices) |
| Migration Decision | "Migrate from {Old} to {New}" | Keep current + Migrate + Hybrid |
| Standard/Convention | "Adopt {Standard/Convention}" | Convention options + "Team discretion" |

Use the full ADR template above for all types.

## ADR Index Template

Maintain `docs/adr/README.md` with table: ADR number (linked), Title, Status (Proposed/Accepted/Deprecated/Superseded), Date.

## Best Practices

1. **Write ADRs early** — Document decisions when context is fresh
2. **Keep them short** — Target 1-2 pages
3. **Be specific** — Include version numbers, dates, names
4. **Link related ADRs** — Build a decision graph
5. **Update status** — Mark superseded ADRs
6. **Version control** — ADRs are code, treat them as such
7. **Review periodically** — Validate decisions are still valid

## Integration with Architect Agent

When generating ADRs:
1. Reference [architect playbooks](../../agent-assets/architect/) for decision frameworks
2. Use [C4 diagrams skill](../c4-diagrams/SKILL.md) for architectural context
3. Link to threat models from [threat-modeling skill](../threat-modeling/SKILL.md) for security decisions
