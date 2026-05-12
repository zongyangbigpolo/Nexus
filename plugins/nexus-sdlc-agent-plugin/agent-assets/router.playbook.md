# router Playbook

Operational details for the `router` custom agent.

**Source of truth**: [router.agent.md](../agents/router.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [router.agent.md](../agents/router.agent.md) |
| Entry Prompt | [start.md](../commands/start.md) |

---

## Classification Matrix

⛔ Confidence boosts require **confirmed** JIRA type — never infer from title!

| Category | Keywords / Patterns | Confidence Boost | Route To |
|----------|---------------------|------------------|----------|
| **Bug/Issue** | "bug", "error", "fix", "broken", "not working", "exception", stack trace | +30% if **confirmed** Bug | `bugfix` |
| **Implementation** | JIRA ID pattern, "implement", "develop", "build" | +20% if **confirmed** Story/Task | `dev-coordinator` |
| **PR Review** | "address PR", "PR review", "review comments", "fix review" + JIRA ID | +30% (high confidence) | `dev-coordinator` (PR Review mode) |
| **Epic Orchestration** | JIRA ID where **confirmed** Epic type | Route as Epic | `dev-coordinator` (Epic mode) |
| **Project Init** | "initialize repo", "project init", "setup repo", "onboard repo", AGENTS.md + ARCHITECTURE.md | +20% if JIRA ID | suggest `/project-init` |
| **Planning** | "plan", "breakdown", "split into tasks", "JIRA hierarchy", spec URL | +20% if has spec | `feature-planner` |
| **Git** | "branch", "commit", "PR", "merge", "push", "checkout" | — | `git-ops` |
| **Analysis** | config files, logs, screenshots, "analyze" | — | `analyzer` |
| **JIRA** | "create ticket", "update JIRA" (without impl context) | — | `jira-manager` |
| **SRE** | "cluster logs", "AKS", "kubernetes", "pods", "dev/stg environment" | — | `sre` |
| **Help** | "help", "what can you do", "?" | — | Show `/help` |

### JIRA ID Patterns

```regex
(APP|ENG|CTXBV|AAUTH|CGS|APP2|WSSUCE|WSSHELP|ATH|CC|CCOPS|CCUI|CINC|CINF|COUT|LUI|UNICON|CGSHELP|SPAHELP|DPS|RDXDEV|AAUTHHELP)-\d+
```

---

## Prompt Suggestion Reference

For categories without direct handoff, suggest appropriate prompt:

| Category | Suggest Prompt | Example |
|----------|---------------|---------|
| Project init | `/project-init` | `/project-init jira=APP2-12345` |
| Specification | `/feature-spec` | `/feature-spec source=confluence jiraId=ENG-123` |
| Architecture | `/architecture` | `/architecture mode=solution topic='API design'` |
| Security | `/security` | `/security 'review PR #123'` |
| Azure Costs | `/azure-costs` | `/azure-costs subscription=... days=30` |
| Azure Audit | `/azure-audit` | `/azure-audit resource-group=...` |
| Local Env | `/local-env` | `/local-env env=spa-proxy action=start` |
| Documentation | `/article` | `/article action=create space=APP` |

---

## JIRA Type Detection

See also [jira-ops instruction](../instructions/jira-ops.instructions.md) for MCP tool patterns.

### MCP Tool Usage

**Use `getJiraIssue`** (NOT `search` which is Rovo Search).

**First**, resolve `cloudId` by calling `list_accessible_resources` and finding the UUID for `example.atlassian.net` (see [jira-ops instruction](../instructions/jira-ops.instructions.md#cloudid-discovery-mandatory)).

```
getJiraIssue(cloudId: "<UUID for example.atlassian.net>", issueIdOrKey: "{JIRA_ID}")
```

Returns full issue details including `issuetype.name`.

### Type Mapping

| issuetype.name | Route To | Notes |
|----------------|----------|-------|
| Epic | `dev-coordinator` | Dev-coordinator handles Epic Planning |
| Story | `dev-coordinator` | Standard implementation |
| Task | `dev-coordinator` | Standard implementation |
| Bug | `bugfix` | Bug investigation workflow |
| Sub-task | `dev-coordinator` | Treat as Task |

---

## Handoff Button Labels

Use exact labels from agent handoffs:

| Target Agent | Button Label |
|--------------|--------------|
| bugfix | "Bug investigation" |
| dev-coordinator | "Feature implementation" |
| dev-coordinator (PR Review) | "Address PR review" |
| feature-planner | "Feature planning" |
| git-ops | "Git operations" |
| analyzer | "Analyze artifacts" |
| jira-manager | "JIRA operations" |
| sre | "SRE operations" |

The structured routing header already carries the agent, handoff button, category, and confidence. The markdown body should add context and next action only.

---

## Output Templates

### High Confidence (≥80%)

```markdown
**Context gathered**:
- {key info 1}
- {key info 2}

👇 **Click "{button_label}" button below to proceed**
```

### Medium Confidence (50-79%)

```markdown
**Why this route fits**: {why this choice}

Is this correct? Or would you prefer:
- `{alternative 1}` — {reason}
- `{alternative 2}` — {reason}
```

### Low Confidence (<50%)

```markdown
❓ **Multiple possibilities detected**

Based on your input, here are the best matches:

| # | Agent | Handoff Button | Confidence | Best for |
|---|-------|----------------|------------|----------|
| 1 | {agent1} | {button_label1} | {score1}% | {description1} |
| 2 | {agent2} | {button_label2} | {score2}% | {description2} |
| 3 | {agent3} | {button_label3} | {score3}% | {description3} |

Which would you like? Or describe your need in more detail.

💡 **Tip**: For unclear requests, I'll use `analyzer` to help understand the context first.
```

### Input Analysis Table

```markdown
| Source | Content | Signals |
|--------|---------|---------|
| User text | {input} | {keywords found} |
| Attached files | {list} | {file types} |
| Current file | {path} | {relevant?} |
| JIRA Issue | {id} | issuetype: {type} |
```

### Handoff Context Template

```markdown
## Routed Request

**From**: /start (router)
**Confidence**: {score}%
**Detected category**: {category}

**User input**: {original request}

**Attached context**:
{files, JIRA IDs, URLs found}
```

---

## Epic Handling

**Skill**: [epic-story-workflow](../skills/epic-story-workflow/SKILL.md)

### Key Rules

1. Epics cannot be implemented directly — only Stories can
2. If Epic has no Stories → route to `feature-planner`
3. Pass full `epic_context` to `dev-coordinator`

### Epic Output Format

```markdown
**Epic**: {epic_id} - {epic_title}
**Stories**: {n} total ({m} to implement)

| # | Story | Status |
|---|-------|--------|
| 1 | {story_id} | {status} |

👇 **Click "Feature implementation" button below to start**
```

---

## Confidence Calculation

```
Base confidence = keyword matches × 20%
+ file type bonus (if applicable)
+ JIRA context bonus (if applicable)
+ explicit intent bonus (+30% if user says "I want to...")
```

### File Type Bonuses

| File Pattern | Bonus | Route Hint |
|--------------|-------|------------|
| `.conf`, `.config` | +20% | analyzer |
| `.log`, stack trace | +20% | bugfix/analyzer |
| Screenshot (`.png`, `.jpg`) | +10% | analyzer |
| `.spec.md` | +20% | feature-planner |

---

## Common Mistakes

| Mistake | Correct Approach |
|---------|------------------|
| Assume APP2-* is Story | APP2 can be Epic, Story, Task, Bug — always verify |
| Route Epic directly | Resolve to first unfinished Story |
| Write "switch to agent" | End response — buttons appear automatically |
| Write `/task jira=...` | Just show summary — user clicks handoff button |
