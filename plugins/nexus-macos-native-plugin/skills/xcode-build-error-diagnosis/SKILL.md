---
name: xcode-build-error-diagnosis
description: >
  Diagnose and fix Xcode build errors for icaclientmac. Classifies errors by category
  (compiler, linker, signing, dependency, bridging) and provides targeted fix steps.
trigger: |
  Activate when the user mentions:
  - Build error, compile error, or linker error
  - "undefined symbol" or "module not found"
  - Xcode build failure diagnosis
  - Header not found or bridging header issues
---

# Purpose

Classify and resolve Xcode build errors in the icaclientmac project. This skill provides a systematic error diagnosis workflow.

# Diagnosis Workflow

1. **Capture** — get the full build log or error output
2. **Classify** — identify the error category
3. **Analyze** — find root cause within the category
4. **Fix** — provide specific, actionable fix steps

# Error Categories

## 1. Compiler Errors

### Syntax / Type Errors
**Pattern**: `error: <description>` with file:line reference
**Fix**: Read the source file, understand the type system, fix the code.

### Missing Import
**Pattern**: `error: module '<Name>' not found` or `'<Header>.h' file not found`
**Fixes**:
- For framework imports: add framework to "Link Binary With Libraries"
- For Pod imports: run `pod install` and build with `.xcworkspace`
- For local headers: check header search paths in target build settings

### Swift/ObjC Bridging
**Pattern**: `error: use of undeclared identifier` when calling ObjC from Swift or vice versa
**Fixes**:
- Ensure `<Target>-Bridging-Header.h` imports the ObjC header
- For Swift → ObjC: ensure `@objc` attribute and `public` access
- For ObjC → Swift: `#import "<Target>-Swift.h"` (auto-generated)

## 2. Linker Errors

### Undefined Symbol
**Pattern**: `ld: undefined symbol: _OBJC_CLASS_$_<ClassName>`
**Fixes**:
- Missing source file in target membership — add `.m` file to "Compile Sources"
- Missing framework — add to "Link Binary With Libraries"
- Missing Perforce native lib — sync P4 workspace

### Duplicate Symbol
**Pattern**: `ld: duplicate symbol _<symbol> in`
**Fixes**:
- Same `.m` file in multiple targets — remove from one
- Static library containing same symbol — use `-force_load` selectively
- Category collision — rename category method

### Architecture Mismatch
**Pattern**: `ld: building for 'macOS-arm64' but attempting to link with file built for 'macOS-x86_64'`
**Fixes**:
- Rebuild the dependency for Universal Binary
- Check `ARCHS` and `VALID_ARCHS` build settings
- For native Perforce libs: ensure both slices are available

## 3. Signing Errors

**Pattern**: `error: <target> has conflicting provisioning settings`
**Fixes**:
- For local development: set `CODE_SIGN_IDENTITY="-"` and `CODE_SIGNING_REQUIRED=NO`
- Check team and signing certificate in Xcode project settings

## 4. Dependency Errors

### CocoaPods
**Pattern**: `error: The sandbox is not in sync with the Podfile.lock`
**Fix**: `pod install`

**Pattern**: `error: module '<PodName>' not found`
**Fix**: `pod install --repo-update` and ensure building with `.xcworkspace`

### Perforce Native Libraries
**Pattern**: Linker errors referencing ICA stack symbols
**Fix**: Sync Perforce workspace — these libraries are not in the GitHub repo

## 5. Resource / Configuration Errors

### Info.plist
**Pattern**: `error: The data couldn't be read because it isn't in the correct format`
**Fix**: Validate plist XML syntax

### Build Settings Conflict
**Pattern**: warnings about overridden build settings
**Fix**: Check target vs project level settings, resolve to one source of truth

# Escalation

If the error does not match any known category:
1. Capture the full error output
2. Search the Xcode project for related configuration
3. Check Xcode release notes for known issues with Xcode 16.2
4. Suggest filing a build infrastructure issue with the error details
