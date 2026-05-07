---
name: xcode-build
description: Build the icaclientmac Xcode project — full build, incremental build, or specific target.
agent: build-engineer
---

# Xcode Build

Build the icaclientmac project using xcodebuild.

## Target

${input:target:Scheme or target (default: ICAClientUniversalBinary, or specify a scheme/target)}

## Build Type

${input:buildType:Build type — full, incremental, clean (default: incremental)}

---

## What happens

1. **Discover project** — locate `.xcodeproj`/`.xcworkspace`, validate `Podfile.lock`
2. **Construct xcodebuild command** — scheme, destination, build settings
3. **Execute build** — run and capture output
4. **Diagnose errors** — if build fails, classify errors and suggest fixes

---

**Target**: ${input:target}
**Build Type**: ${input:buildType}
