---
name: hdx-design-document
description: >
  Design document template and guidelines for platform/target repository features.
  Follows the project's Docs/ convention for technical design documentation.
trigger: |
  Activate when the user mentions:
  - Design document or design doc
  - Feature specification for target repository
  - platform design or architecture document
  - Docs/ directory or documentation template
---

# Purpose

Provide the design document template used in the target repository project's `Docs/` directory. Design docs capture technical decisions, architecture, and implementation plans for new features.

# Template

```markdown
# <Feature Name> — Design Document

**Author**: <name>
**Date**: <YYYY-MM-DD>
**Status**: Draft | In Review | Approved | Implemented
**JIRA**: <JIRA-ID>

## 1. Overview

Brief description of the feature and its purpose.

## 2. Background

Context, current state, and why this change is needed.

## 3. Goals

- Goal 1
- Goal 2

### Non-Goals

- Explicitly out of scope item 1

## 4. Design

### 4.1 Architecture

Describe the high-level architecture. Include diagrams if helpful.

### 4.2 Data Flow

How data flows through the system for this feature.

### 4.3 API / Interface Changes

Any new or modified interfaces, protocols, or APIs.

### 4.4 extension channel Protocol (if applicable)

Channel name, data format, direction, message types.

## 5. Implementation Plan

### 5.1 Files to Create/Modify

| File | Change |
|------|--------|
| `path/to/file.m` | Description |

### 5.2 Phases

- Phase 1: <description>
- Phase 2: <description>

## 6. Testing Plan

- Unit tests for <component>
- Integration tests for <flow>
- Manual test scenarios

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk 1 | High | Mitigation approach |

## 8. References

- [Related design doc](link)
- [JIRA Epic](link)
```

# Guidelines

1. **Store in `Docs/` or `docs/`** — follow existing project convention
2. **Name format**: `<Feature-Name>.md` — use kebab-case
3. **Keep updated** — mark status changes as design evolves
4. **Link to JIRA** — every design doc should reference the tracking ticket
5. **Include diagrams** — ASCII art or Mermaid for architecture views
6. **Review before implementation** — design docs should be reviewed by peers

# Existing Design Docs

The target repository project has design docs for:
- DNS Cache
- Shield V2
- PoP Survey
- And others under `Docs/` and `docs/` directories

Reference these as examples when creating new design documents.
