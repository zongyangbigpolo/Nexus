---
name: xcode-test
description: Run XCTest tests for icaclientmac — all tests, specific test class, or test method.
agent: build-engineer
---

# Xcode Test

Run unit tests for the icaclientmac project.

## Test Scope

${input:scope:Test scope — all, ClassName, ClassName/testMethod (default: all)}

## Destination

${input:destination:Destination platform (default: platform=macOS)}

---

## What happens

1. **Determine test scope** — all tests, specific class, or specific method
2. **Construct xcodebuild test command** — scheme, destination, test flags
3. **Execute tests** — run via `xcodebuild test` and capture xcresult
4. **Parse results** — extract failures, durations, and code coverage
5. **Report** — structured test results with failure details and fix suggestions

---

**Scope**: ${input:scope}
**Destination**: ${input:destination}
