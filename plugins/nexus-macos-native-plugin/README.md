# nexus-macos-native-plugin

Native macOS development plugin for the [icaclientmac](https://github.com/csg-citrix-hdx/icaclientmac) project. Provides Xcode build orchestration, ObjC/Swift development guidance, Virtual Channel scaffolding, and CI pipeline knowledge.

## Quick Start

1. Install this plugin from source in VS Code
2. Ensure icaclientmac is cloned locally
3. Use `/xcode-build` to build, `/xcode-test` to run tests, `/vc-scaffold` to create Virtual Channels

## Commands

| Command | Description |
|---------|-------------|
| `/xcode-build` | Build the project (full, incremental, or specific target) |
| `/xcode-test` | Run XCTest tests (all, class, or method) |
| `/vc-scaffold` | Generate Virtual Channel boilerplate |

## Agents

| Agent | Specialty |
|-------|-----------|
| `build-engineer` | Xcode build/test orchestration, error diagnosis, CocoaPods, CI |
| `vc-developer` | Virtual Channel development, SDK patterns, scaffolding |

## Skills (13)

**P1 — Build & Test**: xcode-build, xcode-test-runner, xcode-build-error-diagnosis, objc-swift-interop, xctest-patterns

**P2 — VC & CI**: virtual-channel-sdk, virtual-channel-scaffold, macos-api-patterns, cocoapods-management, jenkins-ci

**P3 — Diagnostics**: crash-log-analysis, sonarqube-quality, hdx-design-document

## Prerequisites

- Xcode 16.2
- CocoaPods 1.13.0 (`gem install cocoapods`)
- icaclientmac repo cloned locally
