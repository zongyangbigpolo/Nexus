---
name: xcode-build
description: >
  native build tool build skill for target repository. Encapsulates xcodebuild command construction,
  scheme/target selection, build settings, and output parsing.
trigger: |
  Activate when the user mentions:
  - Building the project or xcodebuild
  - Compile errors or build failures
  - native build tool schemes, targets, or build settings
  - Clean build or incremental build
---

# Purpose

Construct and execute `xcodebuild` commands for the target repository project. This skill handles scheme selection, build settings, destination configuration, and output interpretation.

# Prerequisites

Before using this skill:
1. Read the repository's `AGENTS.md` to discover:
   - native build tool project file path (`SampleApp.xcodeproj`)
   - Available schemes and targets
   - Required build settings
2. Check if a `.xcworkspace` exists (dependency manager generates one)
3. Verify `Podfile.lock` is up to date

# Project Defaults

These are the known defaults for target repository. **Always verify against current AGENTS.md**.

| Setting | Default Value |
|---------|--------------|
| Project | `SampleApp.xcodeproj` |
| Workspace | `SampleApp.xcworkspace` (if dependency manager active) |
| Build system | Legacy (`-UseNewBuildSystem=NO`) |
| SDK | `macosx` |
| Architectures | `primary_arch secondary_arch` (Universal Binary) |
| Deployment target | desktop OS 12.0 |
| native build tool version | 16.2 |

# Build Commands

## Full Clean Build

```bash
xcodebuild clean build \
  -workspace SampleApp.xcworkspace \
  -scheme <SCHEME_NAME> \
  -destination 'platform=desktop OS' \
  -UseNewBuildSystem=NO \
  ARCHS="primary_arch secondary_arch" \
  | tee build.log
```

## Incremental Build

```bash
xcodebuild build \
  -workspace SampleApp.xcworkspace \
  -scheme <SCHEME_NAME> \
  -destination 'platform=desktop OS' \
  -UseNewBuildSystem=NO \
  | tee build.log
```

## Build Specific Target

```bash
xcodebuild build \
  -workspace SampleApp.xcworkspace \
  -target <TARGET_NAME> \
  -destination 'platform=desktop OS' \
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
| `ARCHS` | Target architectures | `"primary_arch secondary_arch"` |
| `MACOSX_DEPLOYMENT_TARGET` | Minimum desktop OS version | `12.0` |
| `CODE_SIGN_IDENTITY` | Signing identity | `"-"` for local |
| `CONFIGURATION` | Build configuration | `Debug` or `Release` |
| `DERIVED_DATA_PATH` | Custom derived data | `./DerivedData` |
| `GCC_PREPROCESSOR_DEFINITIONS` | Macro definitions | `DEBUG=1` |

# Troubleshooting

## dependency manager out of sync
If build fails with "module not found" for a Pod dependency:
```bash
pod install --repo-update
```
Then rebuild using the `.xcworkspace` (not `.xcodeproj`).

## external source depot native libs missing
If linker fails with undefined symbols from native protocol libraries:
- These libraries come from external source depot, not GitHub
- Ensure the external source depot workspace is synced and lib paths are correct in build settings

## Universal Binary issues
If architecture-specific build fails:
- Check that all targets support both `primary_arch` and `secondary_arch`
- Some C libraries may need conditional compilation for ARM
