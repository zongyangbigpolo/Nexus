---
name: test
description: Define testing strategy for a feature or change — test types, coverage targets, and test case recommendations.
agent: developer
argument-hint: "jira=<JIRA-ID> scope=unit|integration|all"
---

Define testing strategy using [test-strategy](../skills/test-strategy/SKILL.md) skill.

## Inputs

- **JIRA ID** (optional): ${input:jira:}
- **Scope**: ${input:scope:all} — `unit`, `integration`, `all`
- **Context**: ${input:context:} — describe the feature or attach files

## Workflow

1. Read repository AGENTS.md for test frameworks and conventions
2. Load [test-strategy](../skills/test-strategy/SKILL.md) skill
3. Analyze feature scope (from JIRA, context, or attached files)
4. Recommend test types, coverage targets, and example test cases
5. Output strategy document with actionable test list

## Examples
```
/test jira=APP-12345 scope=all
/test scope=unit context="New auth middleware"
/test context="Refactored user service"
```

**Note**: E2E tests are out of scope. For full implementation, use `/task`.
