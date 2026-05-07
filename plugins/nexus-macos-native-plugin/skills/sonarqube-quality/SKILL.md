---
name: sonarqube-quality
description: >
  SonarQube code quality guidance for icaclientmac. Covers quality gates,
  code smells, coverage thresholds, and issue resolution.
trigger: |
  Activate when the user mentions:
  - SonarQube, code quality, or quality gate
  - Code smells or technical debt
  - Coverage threshold or coverage report
  - Static analysis results
---

# Purpose

Help developers understand and resolve SonarQube findings for the icaclientmac project.

# Quality Gate

Typical quality gate conditions:
- **Coverage**: new code must meet minimum coverage threshold
- **Duplications**: duplicated lines must be below threshold
- **Bugs**: zero new bugs
- **Vulnerabilities**: zero new security vulnerabilities
- **Code Smells**: within acceptable threshold for new code

# Common Code Smells in ObjC/Swift

| Smell | Example | Fix |
|-------|---------|-----|
| Long method | Method > 50 lines | Extract helper methods |
| Complex conditional | Nested if/switch > 3 levels | Extract to named methods |
| Duplicate code | Copy-pasted blocks | Extract to shared utility |
| God class | Class > 500 lines | Split by responsibility |
| Magic numbers | `if (state == 3)` | Use named constants / enums |
| Unused import | `#import` not referenced | Remove the import |
| Missing null check | Dereference without nil check | Add nil guard |

# Coverage Analysis

## Generating coverage for SonarQube
```bash
xcodebuild test \
  -workspace ICAClientUniversalBinary.xcworkspace \
  -scheme <TEST_SCHEME> \
  -destination 'platform=macOS' \
  -enableCodeCoverage YES \
  -resultBundlePath ./TestResults.xcresult

# Convert xcresult to SonarQube format
xcrun xccov view --report --json ./TestResults.xcresult > coverage.json
```

## Improving coverage
1. Focus on business logic methods, not getters/setters
2. Test error paths and edge cases
3. Use OCMock to test code paths that depend on external state
4. Add tests for newly written code before committing

# Resolving SonarQube Issues

## Priority order
1. **Blockers/Critical** — security vulnerabilities, bugs likely to cause crashes
2. **Major** — bugs that affect functionality
3. **Minor** — code smells, maintainability issues
4. **Info** — style suggestions

## Suppressing false positives
If a finding is a false positive:
1. Verify it's genuinely incorrect
2. Mark as "Won't Fix" with explanation in SonarQube
3. Do NOT suppress in source code unless team convention allows it
