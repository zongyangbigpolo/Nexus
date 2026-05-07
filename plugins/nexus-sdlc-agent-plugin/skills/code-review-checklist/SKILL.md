---
name: code-review-checklist
description: Comprehensive code review checklist for pull requests. Covers code quality, security, testing, performance, and maintainability. Adapts to repository tech stack from AGENTS.md.
trigger: |
  Activate when the user mentions:
  - Code review or PR review
  - Review checklist or quality checklist
  - Pull request feedback
  - Code quality assessment
---

# Purpose

This skill provides a structured, comprehensive code review process that adapts to the repository's technology stack. It ensures consistent review quality across all PRs.

# Prerequisites

Before using this skill:
1. Read the repository's `AGENTS.md` to understand the tech stack
2. Identify the programming language(s) and frameworks in use
3. Review any project-specific coding standards in `.github/instructions/`

# Review Categories

## 1. Code Correctness

### Functionality
- [ ] Code implements the requirements as specified in JIRA/spec
- [ ] All acceptance criteria are met
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive and appropriate
- [ ] No obvious logic errors or bugs

### Data Handling
- [ ] Input validation is present and correct
- [ ] Null/undefined checks where needed
- [ ] Data transformations are correct
- [ ] No data loss or corruption possibilities

## 2. Code Quality

### Readability
- [ ] Code is self-documenting with clear naming
- [ ] Complex logic has explanatory comments
- [ ] Functions/methods have single responsibility
- [ ] No deeply nested code (max 3-4 levels)
- [ ] Consistent formatting and style

### Maintainability
- [ ] DRY principle followed (no unnecessary duplication)
- [ ] SOLID principles applied where appropriate
- [ ] Dependencies are injected, not hardcoded
- [ ] Configuration is externalized appropriately
- [ ] No magic numbers/strings (use constants)

### Design Patterns
- [ ] Appropriate patterns used for the context
- [ ] Consistent with existing codebase patterns
- [ ] No anti-patterns introduced
- [ ] Abstractions are at the right level

## 3. Security

### Authentication & Authorization
- [ ] Auth checks present where required
- [ ] Principle of least privilege followed
- [ ] No hardcoded credentials or secrets
- [ ] Sensitive data not logged

### Input Security
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection where applicable
- [ ] Path traversal prevention
- [ ] Input sanitization for user data

### Data Protection
- [ ] Sensitive data encrypted at rest/transit
- [ ] PII handling follows regulations
- [ ] Secrets managed via secure storage
- [ ] No sensitive data in URLs or logs

## 4. Testing

> 📖 For detailed test strategy guidance, see [test-strategy skill](../test-strategy/SKILL.md).

### Unit Tests
- [ ] New functionality has unit tests
- [ ] Tests cover happy path and error cases
- [ ] Edge cases are tested
- [ ] Tests are independent and repeatable
- [ ] Test names clearly describe what's tested

### API Tests (if applicable)
- [ ] API endpoints have integration tests
- [ ] Success and error responses tested
- [ ] Authentication scenarios covered

### Test Quality
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] No test interdependencies
- [ ] Mocks/stubs used appropriately
- [ ] Test data is meaningful and realistic

### Coverage
- [ ] New code meets coverage targets (see AGENTS.md)
- [ ] No decrease in overall coverage
- [ ] Critical paths have test coverage

## 5. Performance

### Efficiency
- [ ] No N+1 query problems
- [ ] Appropriate use of caching
- [ ] No unnecessary loops or iterations
- [ ] Lazy loading where appropriate
- [ ] Pagination for large data sets

### Resource Management
- [ ] Database connections properly managed
- [ ] File handles closed properly
- [ ] Memory leaks prevented
- [ ] Async operations used where beneficial

### Scalability
- [ ] Code handles concurrent access correctly
- [ ] No blocking operations in hot paths
- [ ] Resource limits considered

## 5.5. File Size & Complexity

Apply rules from [source-code-size](../../instructions/source-code-size.instructions.md):

- [ ] No source file exceeds **300 lines** / **30KB**
- [ ] No function/method exceeds **50 lines**
- [ ] Nesting depth ≤4 levels
- [ ] If exceeded → request file breakdown before approval
- [ ] Cyclomatic complexity is reasonable
- [ ] Single Responsibility Principle followed

## 6. API Design (if applicable)

### REST/HTTP APIs
- [ ] Correct HTTP methods used
- [ ] Appropriate status codes returned
- [ ] Consistent URL naming conventions
- [ ] Request/response schemas documented
- [ ] Versioning strategy followed

### Error Responses
- [ ] Error responses are informative
- [ ] No sensitive info in error messages
- [ ] Consistent error format

## 7. Documentation

### Code Documentation
- [ ] Public APIs documented
- [ ] Complex algorithms explained
- [ ] Non-obvious decisions documented
- [ ] README updated if needed

### Change Documentation
- [ ] PR description explains changes
- [ ] Breaking changes documented
- [ ] Migration steps provided if needed

## 8. DevOps & Deployment

### Configuration
- [ ] Environment-specific config handled correctly
- [ ] Feature flags used for risky changes
- [ ] No environment-specific hardcoding

### Observability
- [ ] Appropriate logging added
- [ ] Log levels used correctly
- [ ] Metrics/telemetry for key operations
- [ ] No excessive logging

### Backwards Compatibility
- [ ] API changes are backwards compatible
- [ ] Database changes are backwards compatible
- [ ] Rollback plan exists for risky changes

# Output Format

After review, provide:

```markdown
## Code Review Summary

**PR**: {PR_LINK}
**Reviewer**: developer (AI)
**Date**: {DATE}

### Overall Assessment
{PASS | NEEDS_CHANGES | REJECT}

### Findings

#### Critical Issues (Must Fix)
- {Issue description + file:line + recommendation}

#### Suggestions (Should Consider)
- {Suggestion + rationale}

#### Positive Highlights
- {Good practices observed}

### Checklist Results
- Code Correctness: ✅/⚠️/❌
- Code Quality: ✅/⚠️/❌
- Security: ✅/⚠️/❌
- Testing: ✅/⚠️/❌
- Performance: ✅/⚠️/❌
- Documentation: ✅/⚠️/❌

### Coverage Impact
- Coverage before: X%
- Coverage after: Y%
- New code coverage: Z%

### Recommended Actions
1. {Action item}
2. {Action item}
```

# Security Constraints

Follow [security-and-secrets](../../instructions/security-and-secrets.instructions.md):
- Never include actual secrets in review comments
- Mask sensitive data if referencing it
- Flag security issues with appropriate severity

# Stack-Specific Checks

**Important**: Stack-specific checks are NOT included here. 

The agent must:
1. Read repository's `AGENTS.md` for stack information
2. Apply stack-appropriate checks based on discovered context
3. Follow patterns found in existing codebase

# Error Handling

- If AGENTS.md not found: Use language-agnostic checks only
- If file cannot be read: Report and continue with available files
- If review scope unclear: Ask for clarification
