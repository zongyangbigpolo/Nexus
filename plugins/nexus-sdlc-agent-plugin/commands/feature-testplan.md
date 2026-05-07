---
name: feature-testplan
description: Generate comprehensive test plan from feature specification. Writes functional and non-functional test cases to Confluence.
agent: feature-testplan-author
argument-hint: "spec=<path-or-JIRA-ID> confluencePage=<page-ID>"
---

# Generate Test Plan

Create a comprehensive test plan from a feature specification.

## Inputs

- **spec**: ${input:spec} — Path to `.github/specs/*.spec.md` file or JIRA Epic/Story ID
- **confluencePage**: ${input:confluencePage} — Target Confluence page ID for publishing

## Workflow

1. **Load specification** — read spec file or fetch JIRA description
2. **Analyze** — identify testable requirements, edge cases, integration points
3. **Generate test cases** — functional + non-functional, grounded in SPA/NetScaler domain
4. **Write to Confluence** — section by section with validation

## Usage

```
/feature-testplan spec=.github/specs/my-feature.spec.md confluencePage=123456
/feature-testplan spec=SPAOP-12345
```
