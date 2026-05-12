---
name: article
description: Create or update Confluence articles with diagrams and rich formatting
agent: article-publisher
---

# Confluence Article Publisher

Create, update, or publish articles to Confluence with professional formatting and diagrams.

## Inputs

- **Action**: ${input:action:create}
  - `create` = new page
  - `update` = modify existing page
  - `publish` = finalize and publish draft
- **Source**: ${input:source:text}
  - `file` = read from markdown file (path required)
  - `text` = direct input in chat
- **Path** (if source=file): ${input:path}
- **Space**: ${input:space} (e.g., `APP`, `DOCS`, `ENG`)
- **Title**: ${input:title}
- **Parent Page** (optional): ${input:parent}
- **Page ID** (for update): ${input:pageId}

---

## Workflow

1. **Validate** — Check space exists, no duplicates
2. **Prepare** — Structure content, generate diagrams
3. **Publish** — Create/update via Atlassian MCP
4. **Verify** — Confirm page accessible, return URL

---

## Usage

```
/article action=create source=file path=.github/specs/ENG-1234-Feature.spec.md space=DOCS
/article action=create space=APP title="Feature X Overview"
/article action=update pageId=123456 title="Feature X Overview"
```

Supports: headings, tables, code blocks, info/warning panels, draw.io diagrams (generated from text descriptions).
