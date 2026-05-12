---
name: feature-spec
description: Create a feature specification markdown file from various sources using the spec-author agent.
agent: spec-author
argument-hint: "jira=<JIRA-ID> source=<URL|document|text>"
---

Create a comprehensive feature specification as a **markdown file**.

## Inputs

- **JIRA ID**: ${input:jira} (required for file naming)
- **Source**: ${input:source} (Confluence URL, JIRA ID, document path, or describe requirements)
- **Feature Name**: ${input:name} (optional, derived from JIRA if not provided)

## Examples

```
/feature-spec jira=ENG-1234 source=https://example.atlassian.net/wiki/...
/feature-spec jira=ENG-5678 source='User needs ability to configure multiple datacenters'
/feature-spec jira=APP-9999 source=requirements.md
```

## Workflow

1. Read requirements from source
2. Analyze and structure into Design Spec Template
3. Generate diagrams (architecture, sequence)
4. **Save to `../specs/{JIRA-ID}-{FeatureName}.spec.md`**
5. Offer handoff to:
   - `article-publisher` → publish to Confluence
   - `feature-planner` → create JIRA tasks

## Output

- Markdown file in `.github/specs/`
- Can be reviewed in Git before publishing
- Ready for Confluence via `/article` prompt

## Publishing to Confluence

After spec is ready:

```
/article action=create source=file path=.github/specs/ENG-1234-FeatureName.spec.md space=DOCS
```
