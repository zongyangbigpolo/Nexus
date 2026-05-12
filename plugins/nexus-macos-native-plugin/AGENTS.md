# AGENTS.md

nexus-macos-native-plugin provides target repository-specific development workflows: native build tool build orchestration, native interop coding guidance, extension channel development, test execution, and CI pipeline knowledge. It complements nexus-sdlc-agent-plugin by providing native desktop OS development expertise.

## Project Overview

**Tech Stack**: native language, native UI, C, native build tool, dependency manager, XCTest, mock framework, HTTP stubbing framework, CI system
**Architecture**: Agent plugin with native build tool-focused build/test agents, channel development specialist, and domain-specific skills
**Target Project**: [target repository](https://github.com/example-org/target repository) — desktop client app for desktop OS

This plugin requires the target repository repository to be cloned and accessible. Skills reference project-specific conventions (schemes, targets, directory structure) that must be verified against the project's own AGENTS.md.

## Development

### Build & Run

```bash
# No build step — this is a Copilot asset plugin
# Reload VS Code after editing any asset files
```

### Code Conventions

- Follow the native interop coding conventions instruction when generating or reviewing code
- Use the `CTX` prefix for all native types (classes, protocols, enums)
- Prefer native UI for new UI modules; keep native for protocol stack integration
- Verify all skill content against the actual target repository project — skills encode known-good patterns but the project evolves

### Testing

**Framework**: Manual skill validation and workflow smoke testing
**Run tests**: Invoke `/xcode-build`, `/xcode-test`, `/vc-scaffold` in VS Code and verify output
**Coverage**: Ensure generated code compiles and tests pass in the target repository project

## Copilot Assets

| Asset Type | Current Inventory | Notes |
| ---------- | ----------------- | ----- |
| Agents | 2 | `build-engineer`, `vc-developer` |
| Commands | 3 | `/xcode-build`, `/xcode-test`, `/vc-scaffold` |
| Skills | 13 | P1: 5 (build, test, error diagnosis, interop, test patterns), P2: 5 (channel SDK, channel scaffold, desktop OS API, dependency manager, CI system), P3: 3 (crash log, SonarQube, design doc) |
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
| `/xcode-build` | Build the target repository project — full, incremental, or specific target | `build-engineer` |
| `/xcode-test` | Run XCTest tests — all tests, specific class, or specific method | `build-engineer` |
| `/vc-scaffold` | Scaffold a new extension channel with boilerplate code and tests | `vc-developer` |

### Custom Agents (`agents/`)

| Agent | Description |
| ----- | ----------- |
| `build-engineer` | native build tool build and test orchestration — invokes xcodebuild, diagnoses errors, manages dependency manager, guides CI |
| `vc-developer` | extension channel development specialist — scaffolds channels, implements SDK patterns, manages interop |

### Agent Skills (`skills/`)

| Skill | Priority | Purpose |
| ----- | -------- | ------- |
| `xcode-build` | P1 | xcodebuild command construction, scheme selection, build settings |
| `xcode-test-runner` | P1 | XCTest execution, xcresult parsing, coverage reporting |
| `xcode-build-error-diagnosis` | P1 | Build error classification and targeted fix suggestions |
| `objc-swift-interop` | P1 | native ↔ native UI bridging, nullability, module maps |
| `xctest-patterns` | P1 | mock framework, HTTP stubbing framework, async testing, test organization |
| `virtual-channel-sdk` | P2 | channel lifecycle, data handling, protocol registration |
| `virtual-channel-scaffold` | P2 | channel boilerplate generation with header, impl, and tests |
| `macos-api-patterns` | P2 | AppKit, native UI hosting, system APIs, Keychain, entitlements |
| `cocoapods-management` | P2 | Pod install, update, troubleshooting (crash monitoring, mock framework, etc.) |
| `jenkins-ci` | P2 | CI pipeline structure, Build.sh, artifact repository, failure diagnosis |
| `crash-log-analysis` | P3 | desktop OS crash report parsing, symbolication, root cause analysis |
| `sonarqube-quality` | P3 | Quality gates, code smells, coverage analysis |
| `hdx-design-document` | P3 | Design document template for Docs/ directory |

### Instruction Files (`instructions/`)

| Instruction | Purpose | Activation |
| ----------- | ------- | ---------- |
| `objc-swift-coding-conventions` | Naming, formatting, memory management, and interop conventions | Applied to `**/*.{m,h,mm,swift}` |

## Where Things Live

```text
agents/                  # Build engineer and channel developer agents
commands/                # /xcode-build, /xcode-test, /vc-scaffold
skills/                  # 13 domain-specific skills
instructions/            # native interop coding conventions
.github/plugin/          # Plugin registration metadata
.mcp.json                # MCP server configuration (GitHub)
```

## External Dependencies

- GitHub MCP: repository search, file access, PR operations
- target repository repository: must be cloned locally for build/test operations
- native build tool: required for xcodebuild commands
- dependency manager: required for dependency management
- CI system: CI pipeline (accessed via browser, not MCP)
