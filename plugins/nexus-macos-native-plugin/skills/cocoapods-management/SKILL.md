---
name: cocoapods-management
description: >
  CocoaPods dependency management for icaclientmac. Covers pod install, update,
  Podfile configuration, and common dependency issues.
trigger: |
  Activate when the user mentions:
  - CocoaPods, Podfile, or pod install
  - Dependency management or third-party libraries
  - Sentry, OCMock, or OHHTTPStubs integration
  - Module not found after pod changes
---

# Purpose

Manage CocoaPods dependencies in the icaclientmac project. The project uses CocoaPods 1.13.0 for third-party library management.

# Known Dependencies

| Pod | Purpose | Target |
|-----|---------|--------|
| Sentry | Crash reporting and error tracking | Main app |
| OCMock | ObjC mocking framework | Test target |
| OHHTTPStubs | HTTP request stubbing | Test target |
| CWAMacPreferences | Shared preferences framework | Main app |

# Common Commands

## Install pods (after cloning or modifying Podfile)
```bash
pod install --repo-update
```

## Update a specific pod
```bash
pod update <PodName>
```

## Check outdated pods
```bash
pod outdated
```

## Verify installation
```bash
pod install --verbose
```

# Rules

1. **Always use `.xcworkspace`** after `pod install` — never open `.xcodeproj` directly
2. **Commit `Podfile.lock`** — it pins exact versions for reproducible builds
3. **Do not commit `Pods/`** unless the team convention requires it (check `.gitignore`)
4. **Run `pod install`** when:
   - Checking out a branch with Podfile changes
   - Seeing "sandbox not in sync" errors
   - Adding or removing a dependency

# Troubleshooting

## "The sandbox is not in sync with the Podfile.lock"
```bash
pod install
```

## "Unable to find a specification for `PodName`"
```bash
pod repo update
pod install
```

## "Module 'PodName' not found" in Xcode
1. Ensure you opened `.xcworkspace` (not `.xcodeproj`)
2. Run `pod install`
3. Clean build folder: Product > Clean Build Folder
4. Restart Xcode

## Xcode version mismatch warning
If CocoaPods warns about Xcode version:
```bash
sudo xcode-select -s /Applications/Xcode16.2.app/Contents/Developer
pod install
```
