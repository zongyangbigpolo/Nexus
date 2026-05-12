---
name: xcode-test-runner
description: >
  XCTest execution skill for target repository. Handles test invocation via xcodebuild,
  xcresult parsing, coverage reporting, and failure analysis.
trigger: |
  Activate when the user mentions:
  - Running tests or test execution
  - XCTest, unit tests, or test failures
  - Code coverage or xcresult
  - Test-specific build issues
---

# Purpose

Execute and analyze XCTest test runs for the target repository project. Handles test scope selection, xcodebuild test invocation, xcresult parsing, and failure diagnosis.

# Prerequisites

1. Read `AGENTS.md` for test target names and conventions
2. Ensure the project builds successfully before running tests
3. Check that mock framework and HTTP stubbing framework pods are installed

# Test Execution Commands

## Run All Tests

```bash
xcodebuild test \
  -workspace SampleApp.xcworkspace \
  -scheme <TEST_SCHEME> \
  -destination 'platform=desktop OS' \
  -UseNewBuildSystem=NO \
  -resultBundlePath ./TestResults.xcresult \
  | tee test.log
```

## Run Specific Test Class

```bash
xcodebuild test \
  -workspace SampleApp.xcworkspace \
  -scheme <TEST_SCHEME> \
  -destination 'platform=desktop OS' \
  -UseNewBuildSystem=NO \
  -only-testing:<TEST_TARGET>/<TestClassName> \
  -resultBundlePath ./TestResults.xcresult
```

## Run Specific Test Method

```bash
xcodebuild test \
  -workspace SampleApp.xcworkspace \
  -scheme <TEST_SCHEME> \
  -destination 'platform=desktop OS' \
  -UseNewBuildSystem=NO \
  -only-testing:<TEST_TARGET>/<TestClassName>/<testMethodName> \
  -resultBundlePath ./TestResults.xcresult
```

## Run Using Shell Script

The project may include a test runner script:
```bash
./RunUnitTests.sh
```

# xcresult Parsing

## View test summary
```bash
xcrun xcresulttool get --format json --path ./TestResults.xcresult
```

## Extract failures
```bash
xcrun xcresulttool get --format json --path ./TestResults.xcresult \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
# Parse test action results for failures
"
```

## Code coverage report
```bash
xcrun xccov view --report --json ./TestResults.xcresult
```

# Failure Analysis

## Common failure categories

| Category | Pattern | Typical Fix |
|----------|---------|-------------|
| Test timeout | `Test timed out after` | Increase timeout or fix async wait |
| Assertion failure | `XCTAssert*` failed | Fix expected vs actual values |
| Mock setup | `mock framework` unexpected invocation | Update mock expectations |
| Network stub | `HTTP stubbing framework` no match | Add stub for the request URL |
| Setup crash | `setUp()` or `tearDown()` crash | Fix test fixture initialization |
| Missing dependency | Module not found in test target | Add to test target's dependencies |

## Diagnosing flaky tests

1. Run the test in isolation: `-only-testing:` flag
2. Run multiple times: add `-test-iterations 5 -retry-tests-on-failure`
3. Check for shared mutable state between tests
4. Look for timing-dependent assertions (use expectations with timeout)

# Test Organization

Expected test structure in target repository:

```
<TestTarget>/
├── <Feature>Tests/
│   ├── <Feature>Tests.m          # native test class
│   └── <Feature>Tests.swift      # native UI test class
├── Mocks/
│   └── Mock<Protocol>.m          # mock framework-based mocks
└── Stubs/
    └── <API>Stubs.m              # HTTP stubbing framework configurations
```

# Coverage Requirements

- Check project `AGENTS.md` for specific coverage thresholds
- Focus coverage on business logic, not UI or boilerplate
- Ensure new code has corresponding tests
