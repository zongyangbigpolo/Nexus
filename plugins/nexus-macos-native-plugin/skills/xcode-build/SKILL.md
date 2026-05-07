---
name: xcode-build
description: >
  Xcode build skill for icaclientmac. Encapsulates xcodebuild command construction,
  scheme/target selection, build settings, and output parsing.
trigger: |
  Activate when the user mentions:
  - Building the project or xcodebuild
  - Compile errors or build failures
  - Xcode schemes, targets, or build settings
  - Clean build or incremental build
---

# Purpose

Construct and execute `xcodebuild` commands for the icaclientmac project. This skill handles scheme selection, build settings, destination configuration, and output interpretation.

# Prerequisites

Before using this skill:
1. Read the repository's `AGENTS.md` to discover:
   - Xcode project file path (`ICAClientUniversalBinary.xcodeproj`)
   - Available schemes and targets
   - Required build settings
2. Check if a `.xcworkspace` exists (CocoaPods generates one)
3. Verify `Podfile.lock` is up to date

# Project Defaults

These are the known defaults for icaclientmac. **Always verify against current AGENTS.md**.

| Setting | Default Value |
|---------|--------------|
| Project | `ICAClientUniversalBinary.xcodeproj` |
| Workspace | `ICAClientUniversalBinary.xcworkspace` (if CocoaPods active) |
| Build system | Legacy (`-UseNewBuildSystem=NO`) |
| SDK | `macosx` |
| Architectures | `x86_64 arm64` (Universal Binary) |
| Deployment target | macOS 12.0 |
| Xcode version | 16.2 |

# Build Commands

## Full Clean Build

```bash
xcodebuild clean build \
  -workspace ICAClientUniversalBinary.xcworkspace \
  -scheme <SCHEME_NAME> \
  -destination 'platform=macOS' \
  -UseNewBuildSystem=NO \
  ARCHS="x86_64 arm64" \
  | tee build.log
```

## Incremental Build

```bash
xcodebuild build \
  -workspace ICAClientUniversalBinary.xcworkspace \
  -scheme <SCHEME_NAME> \
  -destination 'platform=macOS' \
  -UseNewBuildSystem=NO \
  | tee build.log
```

## Build Specific Target

```bash
xcodebuild build \
  -workspace ICAClientUniversalBinary.xcworkspace \
  -target <TARGET_NAME> \
  -destination 'platform=macOS' \
  -UseNewBuildSystem=NO
```

# Output Parsing

## Success indicators
- `** BUILD SUCCEEDED **` in output
- Exit code 0

## Failure indicators
- `** BUILD FAILED **` in output
- Non-zero exit code
- Lines matching: `error:`, `fatal error:`, `ld: `

## Extracting errors
Parse build log for lines containing `error:` and group by:
1. **Compiler errors** — syntax, type mismatch, missing imports
2. **Linker errors** — undefined symbols, duplicate symbols, missing frameworks
3. **Signing errors** — code signing identity, provisioning
4. **Dependency errors** — missing pods, header not found

# Common Build Settings

| Setting | Purpose | Example |
|---------|---------|---------|
| `ARCHS` | Target architectures | `"x86_64 arm64"` |
| `MACOSX_DEPLOYMENT_TARGET` | Minimum macOS version | `12.0` |
| `CODE_SIGN_IDENTITY` | Signing identity | `"-"` for local |
| `CONFIGURATION` | Build configuration | `Debug` or `Release` |
| `DERIVED_DATA_PATH` | Custom derived data | `./DerivedData` |
| `GCC_PREPROCESSOR_DEFINITIONS` | Macro definitions | `DEBUG=1` |

# Troubleshooting

## CocoaPods out of sync
If build fails with "module not found" for a Pod dependency:
```bash
pod install --repo-update
```
Then rebuild using the `.xcworkspace` (not `.xcodeproj`).

## Perforce native libs missing
If linker fails with undefined symbols from native ICA libraries:
- These libraries come from Perforce, not GitHub
- Ensure the Perforce workspace is synced and lib paths are correct in build settings

## Universal Binary issues
If architecture-specific build fails:
- Check that all targets support both `x86_64` and `arm64`
- Some C libraries may need conditional compilation for ARM
