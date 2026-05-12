# nexus-macos-native-plugin

Native desktop OS workflow plugin for a target repository. Provides build orchestration, interoperability guidance, integration scaffolding, and CI workflow knowledge.

## Quick Start

1. Install this plugin from source in VS Code
2. Ensure the target repository is cloned locally
3. Use `/xcode-build` to build, `/xcode-test` to run tests, `/vc-scaffold` to create extension channels

## Commands

| Command | Description |
|---------|-------------|
| `/xcode-build` | Build the project (full, incremental, or specific target) |
| `/xcode-test` | Run tests (all, class, or method) |
| `/vc-scaffold` | Generate integration channel boilerplate |

## Agents

| Agent | Specialty |
|-------|-----------|
| `build-engineer` | Build/test orchestration, error diagnosis, dependency management, CI |
| `vc-developer` | Integration channel development, SDK patterns, scaffolding |

## Skills (13)

**P1 — Build & Test**: xcode-build, xcode-test-runner, xcode-build-error-diagnosis, objc-swift-interop, xctest-patterns

**P2 — channel & CI**: virtual-channel-sdk, virtual-channel-scaffold, macos-api-patterns, cocoapods-management, jenkins-ci

**P3 — Diagnostics**: crash-log-analysis, sonarqube-quality, hdx-design-document

## Prerequisites

- native build tool
- dependency manager (the dependency manager installer)
- Target repository cloned locally
