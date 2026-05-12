# spec-author Playbook

Operational details for the `spec-author` custom agent.

**Source of truth**: [spec-author.agent.md](../agents/spec-author.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Design Spec Template | [Confluence](https://example.atlassian.net/wiki/spaces/DOCS/pages/461832544/Design+Spec+Template) |
| Agent | [spec-author.agent.md](../agents/spec-author.agent.md) |
| Output Location | `specs/` |
| Confluence Publisher | [article-publisher](../agents/article-publisher.agent.md) |

---

## Design Spec Template
- The final output must conform to the **Design Spec Template** structure.
- Use the template as the source of truth for section order and headings.

## JIRA Discovery Rules
- Do **not** invent JIRA IDs.
- Only use tickets that are explicitly provided by the user or found in source documents.
- If no JIRA ID is available, use a placeholder like `ENG-XXXXX`.

---

## Output File Format

### File Location & Naming

```
specs/{JIRA-ID}-{FeatureName}.spec.md
```

**Examples:**
- `specs/ENG-1234-MultiDatacenterSupport.spec.md`
- `specs/ENG-5678-BrowserPolicyEnhancements.spec.md`

### File Header Template

```markdown
# {Feature Name} - Design Specification

| Field | Value |
|-------|-------|
| JIRA | [{JIRA-ID}](https://example.atlassian.net/browse/{JIRA-ID}) |
| Author | AI-Generated |
| Date | {YYYY-MM-DD} |
| Status | Draft |
| Confluence | *Pending publish via article-publisher* |

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [High-Level Design](#high-level-design)
4. [Low-Level Design](#low-level-design)
5. [Security](#security)
6. [Testability](#testability)

---
```

### Section Order

Follow this order to match Design Spec Template:

| # | Section | Subsections |
|---|---------|-------------|
| 1 | Overview | Problem Statement, Goals, Non-Goals |
| 2 | Requirements | Functional, Non-Functional, Out of Scope |
| 3 | Dependencies | External services, APIs |
| 4 | High-Level Design | UX/UI, Architecture Diagrams |
| 5 | Low-Level Design | Components, Data Models, APIs, Feature Flags |
| 6 | Security | Threat Model, Mitigations |
| 7 | Testability | Test Plan, Scenarios |

---

## Publishing to Confluence

After spec is complete, use **article-publisher** handoff:

```
Handoff → article-publisher
  source=file
  path=specs/{JIRA-ID}-{FeatureName}.spec.md
  space=DOCS
  title='{Feature Name} Design Spec'
```

**article-publisher** will:
1. Read the markdown file
2. Convert to Confluence storage format
3. Publish to specified space

---

## Diagram Generation

### System Architecture (ASCII Art)

**MUST** generate in ASCII art format using box-drawing characters for portability.

**Requirements:**
- Use Unicode box-drawing characters (┌ ─ ┐ │ └ ┘ ► ◄ ▲ ▼)
- Label all components and data flows
- Keep diagrams under 100 characters wide

### Sequence Diagrams (Web Sequence Diagram)

**Import Instructions** (include above code):
```
<!--
To visualize this sequence diagram:
1. Copy the code below
2. Open UML Sequence Diagram embedded app
3. Select Style: magazine
4. Paste in Content section
5. Click Save
-->
```

**Requirements:**
- Use clear actor/participant names
- Label all interactions with descriptive messages
- Include response arrows

---

## Writing Guidelines

### General Principles
- **Be Specific**: Use concrete examples, exact values (not vague descriptions)
- **Be Visual**: Include diagrams for complex concepts
- **Be Comprehensive**: Cover happy paths and error scenarios
- **Use Tables**: For comparing options, listing scenarios
- **Reference Code**: Link to actual files/functions when relevant

### Section-Specific Guidelines

#### Dependencies
- **SKIP Internal Dependencies**: Do not document internal Organization products (NetScaler, StoreFront)
- **SKIP Version Compatibility Matrix**
- Document only external dependencies (cloud providers, third-party services)

#### User Experience
- **Keep UI Details High-Level** — Figma link provides visual details
- Focus on user workflows and key interactions only

#### Architectural Diagrams
- **NEVER SKIP**: Always include System Architecture and Sequence Diagrams
- **SKIP "Key Architecture Components"** textual section — let diagrams speak

#### Low-Level Design - Component Changes

**⚠️ KEEP CONCISE**: Implementation-focused and brief.

- Focus on WHAT changed, not HOW to implement
- Use bullet points instead of code blocks
- Limit code examples to 5-10 lines max
- One paragraph per component (2-4 sentences)
- Reference code locations instead of duplicating

#### Model Change Documentation

**ALWAYS use JSON format** with change indicators:
- `[NEW]` - Field added
- `[MODIFIED]` - Field changed
- `[DELETED]` - Field removed
- `[UNCHANGED]` - Existing (only if critical for context)

**Example:**
```json
{
  "CustomerId": "string",     // [UNCHANGED] Partition key
  "Gateways": [               // [NEW] Multi-datacenter configs
    { "Id": "Guid", "Name": "string" }
  ],
  "LegacyField": "string"     // [DELETED] Marked obsolete
}
```

**Rules:**
- ✅ JSON structure, NOT tables
- ✅ Annotate every field
- ✅ Include migration notes (1-2 sentences)
- ❌ Do NOT show complete unchanged models

#### API Base Paths
- **spa-proxy-service**: `/accessSecurityProxy`
- **spa-onprem-service**: `/secureAccess`
- **cep-integration-service**: `/accessSecurity`

#### Sections to SKIP (Keep Placeholders)
- Monitoring & Alerts
- Cost Impact
- Future Development
- Rate Limiting

#### Telemetry
- KEEP BRIEF (3-5 bullet points)
- Key metrics and events only
- Skip detailed dashboards

#### Feature Flags
- Naming: `{JIRAID}-PascalCaseFeatureFlagName`
- Document: name, purpose (1 sentence), default value
- SKIP rollout strategy

#### Security - Threat Model
- One concise table: | Threat | Mitigation |
- Keep entries brief and actionable

#### Testability
- KEEP VERY BRIEF (5-7 bullets)
- SKIP Unit Tests (understood as standard)
- Focus on regression impact, integration scenarios
