# article-publisher Playbook

Operational details for the `article-publisher` custom agent.

**Source of truth**: [article-publisher.agent.md](../agents/article-publisher.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [article-publisher.agent.md](../agents/article-publisher.agent.md) |
| Prompt | [article.md](../commands/article.md) |
| Atlassian MCP | `.vscode/mcp.json` |

---

## Common Source Paths

| Source Type | Path Pattern | Producer |
|-------------|--------------|----------|
| Feature specs | `specs/*.spec.md` | spec-author |
| General docs | `docs/*.md` | Manual |
| ADRs | `docs/adr/*.md` | architect |

---

## Content Structure Guidelines

### Heading Hierarchy

```markdown
# Page Title (set via API, not in content)

## Main Section (H2)
### Subsection (H3)
#### Detail (H4) — use sparingly
```

**Rules**:
- Use H2 for main sections
- Use H3 for subsections
- Avoid H1 (reserved for page title in Confluence)

### Formatting Best Practices

| Element | Markdown | Use Case |
|---------|----------|----------|
| **Bold** | `**text**` | Emphasis, key terms |
| `Code` | `` `text` `` | Technical terms, commands |
| Tables | `\| a \| b \|` | Structured data |
| Bullets | `- item` | Unordered lists |
| Numbers | `1. item` | Sequential steps |

### Special Panels

| Panel Type | When to Use |
|------------|-------------|
| Info | Notes, tips, additional context |
| Warning | Cautions, deprecations |
| Note | Important callouts |

---

## Storage Format Conversion

Convert markdown to Confluence storage format for API calls.

### Basic Elements

| Markdown | Confluence Storage Format |
|----------|---------------------------|
| `## Heading` | `<h2>Heading</h2>` |
| `### Subheading` | `<h3>Subheading</h3>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| `- item` | `<ul><li>item</li></ul>` |
| `1. item` | `<ol><li>item</li></ol>` |
| `> quote` | `<blockquote>quote</blockquote>` |
| `[text](url)` | `<a href="url">text</a>` |

### Info Panel

```xml
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p>Info text here</p>
  </ac:rich-text-body>
</ac:structured-macro>
```

### Warning Panel

```xml
<ac:structured-macro ac:name="warning">
  <ac:rich-text-body>
    <p>Warning text here</p>
  </ac:rich-text-body>
</ac:structured-macro>
```

### Code Block

```xml
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:parameter ac:name="title">Optional Title</ac:parameter>
  <ac:plain-text-body><![CDATA[
    // code here
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

**Supported languages**: `javascript`, `typescript`, `csharp`, `python`, `json`, `yaml`, `bash`, `sql`, `xml`

### draw.io Diagram

```xml
<ac:structured-macro ac:name="drawio">
  <ac:parameter ac:name="diagramName">Diagram Name</ac:parameter>
  <ac:plain-text-body><![CDATA[
    <!-- draw.io XML content from .drawio file -->
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

### Table

```xml
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
  </tbody>
</table>
```

---

## Verification Output Template

After successful create/update, output:

```markdown
✅ Article published successfully!

**Title**: {title}
**Space**: {space}
**URL**: {confluence-url}
**Parent**: {parent-title or "Space root"}

**Sections**:
- {section 1}
- {section 2}
- ...

**Diagrams**: {count} diagram(s) included
**Status**: Published
```

---

## Update Strategy (Append-Only)

When updating existing pages:

1. **GET** current page content via Atlassian MCP
2. **PRESERVE** all existing content — never delete human-authored sections
3. **APPEND** new sections with date marker:
   ```markdown
   ---
   ## Updated: {YYYY-MM-DD}
   
   {new content here}
   ```
4. **PUT** updated content
5. **VERIFY** update succeeded

**⚠️ NEVER**:
- Delete or overwrite human content
- Replace entire sections without preservation
- Use placeholders like "[unchanged]"

---

## Error Messages

| Error | User-Friendly Message |
|-------|----------------------|
| Space not found | "Space '{key}' not found. Available spaces: {list}" |
| Page exists | "Page '{title}' already exists in {space}. Update existing or use new title?" |
| Permission denied | "No edit access to space '{space}'. Contact space admin." |
| Content too large | "Content exceeds Confluence limit. Consider splitting into multiple pages." |

---

## Diagram Generation

For simple diagrams, use ASCII art in code blocks. Use **pure ASCII only** (`+`, `-`, `|`, `>`, `v`) — never Unicode box-drawing symbols (`┌─┐│└┘►▼`), which misalign across fonts.

```
+-------------+     +-------------+
|   Client    |---->|   Server    |
+-------------+     +-------------+
        |                  |
        v                  v
+-------------+     +-------------+
|   Cache     |     |  Database   |
+-------------+     +-------------+
```

For complex diagrams:
1. Describe verbally in the article
2. Suggest manual creation in draw.io
3. Or handoff to `architect` for C4 diagrams
