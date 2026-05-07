---
name: jenkins-ci
description: >
  Jenkins CI knowledge for icaclientmac. Covers pipeline structure, build triggers,
  Artifactory publishing, and CI failure diagnosis.
trigger: |
  Activate when the user mentions:
  - Jenkins, CI/CD, or build pipeline
  - Artifactory or build artifacts
  - CI build failure or pipeline debugging
  - Build.sh or automated builds
---

# Purpose

Provide knowledge about the icaclientmac Jenkins CI pipeline for build automation, artifact publishing, and CI failure diagnosis.

# Pipeline Overview

```
Trigger (PR/merge/manual)
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Checkout    │────►│  Pod Install │────►│  Build       │────►│  Test        │
│  (Git + P4)  │     │              │     │  (Build.sh)  │     │  (XCTest)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
                                          ┌──────────────┐     ┌──────┴───────┐
                                          │  Publish     │◄────│  SonarQube   │
                                          │  (Artifactory)│     │  (Quality)   │
                                          └──────────────┘     └──────────────┘
```

# Build Script

The project uses `Build.sh` as the primary build entry point:

```bash
./Build.sh
```

This script typically:
1. Sets up build environment variables
2. Runs `pod install` if needed
3. Invokes `xcodebuild` with the correct scheme, configuration, and signing
4. Packages the build output (`.app`, `.pkg`, or `.dmg`)

# Artifactory

Build artifacts are published to Artifactory:
- Release builds go to the release repository
- CI builds go to the snapshot repository
- Dependencies may also be fetched from Artifactory (Perforce native libs)

# CI Failure Diagnosis

## Common CI failures

| Failure | Cause | Fix |
|---------|-------|-----|
| Pod install fails | Repo out of date | Add `pod repo update` step |
| Signing error | Missing certificates on CI | Check CI machine's Keychain |
| Perforce sync fail | P4 credentials expired | Refresh P4 token |
| Test timeout | Flaky test on CI | Increase timeout or fix async test |
| SonarQube fail | Quality gate not met | Fix code smells / coverage |
| Architecture error | Missing arm64 slice | Ensure Universal Binary build |

## Reading CI logs

1. Check the **Console Output** for the failed stage
2. Look for `** BUILD FAILED **` or `** TEST FAILED **` markers
3. Search for `error:` lines — these are the root causes
4. Check exit codes — non-zero indicates failure

# Best Practices

- Keep `Build.sh` as the single source of truth for build commands
- Pin CocoaPods version in CI to match local development
- Cache `Pods/` directory in CI for faster builds
- Run tests in parallel when test targets are independent
- Archive xcresult bundles as CI artifacts for post-failure analysis
