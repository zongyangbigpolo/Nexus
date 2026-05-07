# AGENTS.md

nexus-macos-native-plugin provides icaclientmac-specific development workflows: Xcode build orchestration, ObjC/Swift coding guidance, Virtual Channel development, test execution, and CI pipeline knowledge. It complements nexus-sdlc-agent-plugin by providing native macOS development expertise.

## Project Overview

**Tech Stack**: Objective-C, Swift, C, Xcode 16.2, CocoaPods 1.13.0, XCTest, OCMock, OHHTTPStubs, Jenkins
**Architecture**: Agent plugin with Xcode-focused build/test agents, VC development specialist, and domain-specific skills
**Target Project**: [icaclientmac](https://github.com/csg-citrix-hdx/icaclientmac) — Citrix Workspace app for macOS

This plugin requires the icaclientmac repository to be cloned and accessible. Skills reference project-specific conventions (schemes, targets, directory structure) that must be verified against the project's own AGENTS.md.

## Development

### Build & Run

```bash
# No build step — this is a Copilot asset plugin
# Reload VS Code after editing any asset files
```

### Code Conventions

- Follow the ObjC/Swift coding conventions instruction when generating or reviewing code
- Use the `CTX` prefix for all ObjC types (classes, protocols, enums)
- Prefer Swift for new UI modules; keep ObjC for ICA stack integration
- Verify all skill content against the actual icaclientmac project — skills encode known-good patterns but the project evolves

### Testing

**Framework**: Manual skill validation and workflow smoke testing
**Run tests**: Invoke `/xcode-build`, `/xcode-test`, `/vc-scaffold` in VS Code and verify output
**Coverage**: Ensure generated code compiles and tests pass in the icaclientmac project

## Copilot Assets

| Asset Type | Current Inventory | Notes |
| ---------- | ----------------- | ----- |
| Agents | 2 | `build-engineer`, `vc-developer` |
| Commands | 3 | `/xcode-build`, `/xcode-test`, `/vc-scaffold` |
| Skills | 13 | P1: 5 (build, test, error diagnosis, interop, test patterns), P2: 5 (VC SDK, VC scaffold, macOS API, CocoaPods, Jenkins), P3: 3 (crash log, SonarQube, design doc) |
| Instructions | 1 | `objc-swift-coding-conventions` |

## Asset Relationship Summary

```text
/xcode-build, /xcode-test -> build-engineer
/vc-scaffold -> vc-developer

build-engineer uses:
  xcode-build, xcode-test-runner, xcode-build-error-diagnosis,
  objc-swift-interop, xctest-patterns, cocoapods-management, jenkins-ci

vc-developer uses:
  virtual-channel-sdk, virtual-channel-scaffold, macos-api-patterns,
  objc-swift-interop, xctest-patterns

Both agents load:
  objc-swift-coding-conventions.instructions.md
```

## Asset Catalog

### Slash Commands (`commands/`)

| Prompt | Description | Agent |
| ------ | ----------- | ----- |
| `/xcode-build` | Build the icaclientmac project — full, incremental, or specific target | `build-engineer` |
| `/xcode-test` | Run XCTest tests — all tests, specific class, or specific method | `build-engineer` |
| `/vc-scaffold` | Scaffold a new Virtual Channel with boilerplate code and tests | `vc-developer` |

### Custom Agents (`agents/`)

| Agent | Description |
| ----- | ----------- |
| `build-engineer` | Xcode build and test orchestration — invokes xcodebuild, diagnoses errors, manages CocoaPods, guides CI |
| `vc-developer` | Virtual Channel development specialist — scaffolds VCs, implements SDK patterns, manages interop |

### Agent Skills (`skills/`)

| Skill | Priority | Purpose |
| ----- | -------- | ------- |
| `xcode-build` | P1 | xcodebuild command construction, scheme selection, build settings |
| `xcode-test-runner` | P1 | XCTest execution, xcresult parsing, coverage reporting |
| `xcode-build-error-diagnosis` | P1 | Build error classification and targeted fix suggestions |
| `objc-swift-interop` | P1 | ObjC ↔ Swift bridging, nullability, module maps |
| `xctest-patterns` | P1 | OCMock, OHHTTPStubs, async testing, test organization |
| `virtual-channel-sdk` | P2 | VC lifecycle, data handling, protocol registration |
| `virtual-channel-scaffold` | P2 | VC boilerplate generation with header, impl, and tests |
| `macos-api-patterns` | P2 | AppKit, SwiftUI hosting, system APIs, Keychain, entitlements |
| `cocoapods-management` | P2 | Pod install, update, troubleshooting (Sentry, OCMock, etc.) |
| `jenkins-ci` | P2 | CI pipeline structure, Build.sh, Artifactory, failure diagnosis |
| `crash-log-analysis` | P3 | macOS crash report parsing, symbolication, root cause analysis |
| `sonarqube-quality` | P3 | Quality gates, code smells, coverage analysis |
| `hdx-design-document` | P3 | Design document template for Docs/ directory |

### Instruction Files (`instructions/`)

| Instruction | Purpose | Activation |
| ----------- | ------- | ---------- |
| `objc-swift-coding-conventions` | Naming, formatting, memory management, and interop conventions | Applied to `**/*.{m,h,mm,swift}` |

## Where Things Live

```text
agents/                  # Build engineer and VC developer agents
commands/                # /xcode-build, /xcode-test, /vc-scaffold
skills/                  # 13 domain-specific skills
instructions/            # ObjC/Swift coding conventions
.github/plugin/          # Plugin registration metadata
.mcp.json                # MCP server configuration (GitHub)
```

## External Dependencies

- GitHub MCP: repository search, file access, PR operations
- icaclientmac repository: must be cloned locally for build/test operations
- Xcode 16.2: required for xcodebuild commands
- CocoaPods 1.13.0: required for dependency management
- Jenkins: CI pipeline (accessed via browser, not MCP)
