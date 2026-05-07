---
name: test-strategy
description: Define testing strategy for features. Recommends unit tests and API/integration tests with coverage targets. Stack-agnostic — relies on repository AGENTS.md for specific frameworks.
trigger: |
  Activate when the user mentions:
  - Test strategy or testing approach
  - What tests to write
  - Test coverage planning
  - Unit vs integration testing
---

# Purpose

This skill helps define the right testing strategy for a feature or change. It recommends appropriate test types and coverage targets based on the change scope.

**Scope**: Unit tests and API/integration tests only. E2E testing is out of scope (infrastructure not available).

**Stack-Agnostic**: This skill does NOT provide language-specific code. Discover test frameworks from repository's `AGENTS.md`.

# Prerequisites

Before using this skill:
1. Read the repository's `AGENTS.md` to understand:
   - Test frameworks in use
   - Test folder structure
   - Coverage requirements
2. Review existing test patterns in the codebase
3. Understand feature requirements (from JIRA or spec)

# Test Strategy Principles

```
    /----------------\
   / API/Integration  \    <- API boundaries, service interactions
  /--------------------\
 /      Unit Tests      \  <- Many, fast, isolated, high coverage
/------------------------\
```

**Balance**: Many unit tests (fast, isolated) → fewer integration/API tests (slower, broader scope)

# Test Type Decision Matrix

| Scenario | Primary Test Type | Notes |
|----------|------------------|-------|
| Pure business logic | Unit | Fast, isolated, high coverage |
| Data transformations | Unit | Cover edge cases thoroughly |
| Utility functions | Unit | Input/output validation |
| API endpoints | API/Integration | Test request/response, auth, validation |
| Database operations | Integration | Test queries, transactions |
| External service calls | Unit (mocked) | Mock external dependencies |
| Security features | API/Integration | Auth, authorization, input validation |

# Strategy Definition Process

## Step 1: Analyze the Change

Identify:
- **Type of change**: New feature / Bug fix / Refactor
- **Components affected**: API / Service / Repository / Utility
- **Risk level**: High (auth, data) / Medium / Low
- **Existing test coverage**: Check current coverage metrics

## Step 2: Determine Test Types Needed

### Unit Tests — ALWAYS Required

Purpose: Verify isolated logic works correctly

When to write:
- All new functions/methods with logic
- All bug fixes (prevent regression)
- All refactored code
- All utility/helper functions

**Coverage Targets**:
- New code: 80%+ line coverage
- Critical paths: 90%+ coverage
- Overall: No decrease from baseline

### API/Integration Tests — For API Changes

Purpose: Verify API contracts and component interactions

When to write:
- New API endpoints
- Modified API behavior
- Authentication/authorization changes
- Database operations (CRUD)
- Service-to-service communication

**Coverage Targets**:
- All API endpoints tested
- Success and error paths covered
- Auth scenarios verified

## Step 3: Define Test Scenarios

### Unit Test Scenarios

For each function/method, define:

| Scenario | Input | Expected Output | Priority |
|----------|-------|-----------------|----------|
| Happy path | Valid input | Expected result | High |
| Empty/null input | null/empty | Graceful handling | High |
| Invalid input | Bad data | Error/exception | High |
| Boundary values | Min/max | Correct behavior | Medium |
| Edge cases | Special cases | Defined behavior | Medium |

### API Test Scenarios

For each endpoint, define:

| Scenario | Method | Expected Status | Priority |
|----------|--------|-----------------|----------|
| Success | POST/GET/etc | 200/201 | High |
| Validation error | POST invalid | 400 | High |
| Unauthorized | No/bad token | 401 | High |
| Forbidden | Wrong role | 403 | Medium |
| Not found | Bad ID | 404 | Medium |
| Server error | Force error | 500 | Low |

# Coverage Guidelines

## Measuring Coverage

- Use repository's coverage tool (from AGENTS.md)
- Run coverage report after writing tests
- Focus on line coverage and branch coverage

## Coverage Targets

| Code Type | Minimum Coverage | Target Coverage |
|-----------|-----------------|-----------------|
| New business logic | 80% | 90% |
| New API handlers | 70% | 85% |
| Bug fixes | 100% of fix | 100% |
| Utilities/helpers | 90% | 95% |

## Coverage Report in PR

Include in PR description:
```
## Test Coverage

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Line Coverage | X% | Y% | +Z% |
| Branch Coverage | X% | Y% | +Z% |

New code coverage: XX%
```

# Output Format

After analysis, provide:

```markdown
## Test Strategy for {FEATURE_NAME}

**JIRA**: {JIRA_ID}
**Components**: {affected components}
**Risk Level**: {High/Medium/Low}

### Test Distribution

| Test Type | Count | Coverage Target |
|-----------|-------|-----------------|
| Unit | {N} | 80%+ |
| API/Integration | {N} | Critical paths |

### Unit Test Plan

| Component | Method/Function | Scenarios | Priority |
|-----------|-----------------|-----------|----------|
| {component} | {method} | {N} | High |

### API Test Plan

| Endpoint | Method | Scenarios | Priority |
|----------|--------|-----------|----------|
| {path} | {verb} | {N} | High |

### Coverage Goals

- New code: {target}%
- Critical paths: 90%+
- No decrease in overall coverage

### Test Data Requirements

- {fixtures needed}
- {mock data needed}
```

# Test Quality Guidelines

## Good Tests Are:

- **Fast**: Unit tests run in milliseconds
- **Isolated**: No dependencies between tests
- **Repeatable**: Same result every time
- **Self-validating**: Clear pass/fail
- **Timely**: Written with the code

## Test Naming

Use descriptive names that explain:
- What is being tested
- Under what conditions
- What the expected outcome is

## Avoid:

- Testing implementation details (test behavior)
- Over-mocking (test real behavior where possible)
- Flaky tests (fix or remove immediately)
- Test interdependencies
- Excessive setup/teardown

# Error Handling

- If AGENTS.md not found: Ask user for test framework info
- If existing tests not found: Start with unit tests for new code
- If requirements unclear: Ask for clarification before proceeding
- If coverage tool unknown: Ask user to specify
