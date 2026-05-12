# JIRA Common Playbook

Shared templates and references for JIRA agents:

- `feature-planner` — feature hierarchy creation
- `jira-manager` — single item CRUD

**Common Rules**: See [jira-ops instruction](../instructions/jira-ops.instructions.md) for project codes, MCP tools, and mandatory labels.

---

## JIRA Project & Component Mapping

> **Note**: This section contains **APP-specific** mappings as a reference example.
> For other repositories, check the repository's `AGENTS.md` for project/component mappings.

| Component/Service | JIRA Project | Component Name | Team |
| --- | --- | --- | --- |
| APP Proxy Service | `APP2` | `APP Proxy Service` | APP Hybrid Team |
| APP Plugin (Broker) | `APP2` | `Broker - Runtime` | APP Hybrid Team |
| APP Admin UI | `APP2` | `Console - UI` | APP UI Team |
| APP Micro Frontend (MFE) | `APP2` | `Console - UI` | APP UI Team |
| APP Config Service | `APP` | `GW Core` | APP Service Team |
| CEP Integration Service | `APP` | `CEP Integration Service` | APP Service Team |
| Gateway Core | `APP` | `GW Core` | APP Service Team |

**Default Investment Type**: `CTXBV Linked Feature`

---

## Acceptance Criteria Format

Use a short, testable checklist. Preferred format:

```text
Given [context/precondition]
When [action]
Then [expected outcome]

✅ [Specific condition 1]
✅ [Specific condition 2]
✅ [Unit tests added with >80% coverage]
✅ [Code reviewed and approved]
```

**Example**:

```text
Given an authenticated user with admin role
When they call GET /api/v1/gateways/regions
Then they receive a 200 response with JSON array of regions

✅ Response includes region, endpoint, health, lastChecked
✅ Handles empty results with 200 and empty array
✅ Returns 401 for unauthenticated requests
✅ Unit tests cover success and error cases
```

---

## Story Sizing Guidelines

Use Fibonacci scale for story points:

| Points | Effort | Complexity | Uncertainty |
| --- | --- | --- | --- |
| **1** | < 1 day | Simple, well-understood | Very low |
| **2** | 1-2 days | Straightforward with minor unknowns | Low |
| **3** | 2-3 days | Moderate complexity | Medium |
| **5** | 3-5 days | Complex or multiple unknowns | Medium-High |
| **8** | > 5 days | Very complex, needs breakdown | High |

**Rule**: If a Story is estimated at 8+ points, break it down into smaller Stories.

---

## Labels Convention

All AI-created tickets must include:

- `AI-Generated` — mandatory marker for all created tickets
- Type tag: `bug`, `story`, `task`, `epic`
- Component tag: based on mapping above

**Optional labels**:

- `api` — API-related changes
- `ui` — Frontend changes
- `configuration` — Config/settings changes
- `testing` — Test-related work
- `documentation` — Docs updates

---

## Bug Severity Guidelines

| Severity | Criteria | Priority |
| --- | --- | --- |
| **Critical** | System down, data loss, no workaround | Highest |
| **Major** | Feature broken, workaround exists | High |
| **Minor** | Feature works with limitations | Medium |
| **Trivial** | Cosmetic, typo, minor inconvenience | Low |

---

## Story Writing Checklist

Each Story should include:

- ✅ **Summary**: Starts with action verb (Implement, Add, Update, Fix, Create)
- ✅ **Description**: What to change (files/modules/components)
- ✅ **Acceptance Criteria**: Testable conditions
- ✅ **Story Points**: Estimated effort (1-8)
- ✅ **Component**: Mapped from table above
- ✅ **Labels**: `AI-Generated` + relevant tags

---

## Type-Specific Templates

### Bug Template

```text
Summary: [Component] - [Brief description of bug]

Description:
**Environment**: [Dev/Staging/Prod, version]
**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Result**: ...
**Actual Result**: ...

**Screenshots/Logs**: (if available)

Labels: AI-Generated, bug, {component}
Priority: {based on severity}
```

### Story Template

```text
Summary: [Action verb] [feature/capability]

Description:
As a [user type],
I want [capability],
So that [benefit].

Acceptance Criteria:
- [ ] ...
- [ ] Unit tests added
- [ ] Documentation updated

Story Points: {1-8}
Labels: AI-Generated, story, {component}
```

### Task Template

```text
Summary: [Action verb] [technical work]

Description:
**Objective**: ...
**Approach**: ...
**Definition of Done**:
- [ ] ...

Labels: AI-Generated, task, {component}
```

### Epic Template

```text
Summary: [Component] - [Feature/Initiative name]

Description:
**Objective**: ...
**Scope**:
- ...
- ...

**Success Criteria**:
- [ ] ...

Labels: AI-Generated, epic, {component}
```

---

## Component Resolution for `createJiraIssue`

**`components` is required** in projects like `APP2`. Always include it when calling `createJiraIssue`.

If the visible MCP tool schema omits `additional_fields`, still attempt the call using the payload below. In this repo, Atlassian MCP may accept undocumented `additional_fields`, and agents should prefer the repo's known-working payload shape over assuming the request is unsupported.

### Resolution Order

1. **User-specified** — if user explicitly provided a component value, use it
2. **Parent Epic** — if creating a Story/Task under an Epic, fetch the Epic via `getJiraIssue` and copy its `components`
3. **Default fallback** — `"Hybrid"`

### Example

Pass `components` and `labels` via the `additional_fields` parameter:

```json
{
  "cloudId": "<UUID for example.atlassian.net from list_accessible_resources>",
  "projectKey": "APP2",
  "issueTypeName": "Story",
  "summary": "Implement feature X",
  "description": "...",
  "parent": "APP2-12345",
  "additional_fields": {
    "components": [{"name": "Hybrid"}],
    "labels": ["AI-Generated"]
  }
}
```

### Practical Rule

- For `APP2`, do not declare ticket creation blocked until you have tried `additional_fields` with `components` and `labels`.
- When creating a Story or Task under an Epic, pass the Epic key in `parent` and inherit `components` from the parent if available.

> **Note**: `components` and `labels` are **not** top-level parameters — they must be inside `additional_fields`. The `parent` key (Epic key) **is** a top-level parameter.

---

## Sprint Field Reference

| Property | Value |
| --- | --- |
| Field name | `customfield_10020` |
| Field type | Array of sprint objects |
| Update format | Sprint ID as direct value (e.g., `59923`) |
| Sprint object properties | `id`, `name`, `state`, `boardId`, `startDate`, `endDate` |

**Update payload**: `{"customfield_10020": <SPRINT_ID>}`

**Sprint discovery**: Search active/future sprints, match by name (exact first, then partial). Extract Sprint ID for field updates.

**Error handling**:

- No matching sprint → list available active sprints, ask for clarification
- No stories found → confirm with user
- Individual update failure → report error details, continue with remaining
