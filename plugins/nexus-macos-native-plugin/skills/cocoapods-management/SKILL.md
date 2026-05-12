---
name: cocoapods-management
description: >
  dependency manager dependency management for target repository. Covers pod install, update,
  Podfile configuration, and common dependency issues.
trigger: |
  Activate when the user mentions:
  - dependency manager, Podfile, or pod install
  - Dependency management or third-party libraries
  - crash monitoring, mock framework, or HTTP stubbing framework integration
  - Module not found after pod changes
---

# Purpose

Manage dependency manager dependencies in the target repository project. The project uses dependency manager for third-party library management.

# Known Dependencies

| Pod | Purpose | Target |
|-----|---------|--------|
| crash monitoring | Crash reporting and error tracking | Main app |
| mock framework | native mocking framework | Test target |
| HTTP stubbing framework | HTTP request stubbing | Test target |
| preferences framework | Shared preferences framework | Main app |

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

## "Module 'PodName' not found" in native build tool
1. Ensure you opened `.xcworkspace` (not `.xcodeproj`)
2. Run `pod install`
3. Clean build folder: Product > Clean Build Folder
4. Restart native build tool

## native build tool version mismatch warning
If dependency manager warns about native build tool version:
```bash
sudo xcode-select -s /Applications/native build tool16.2.app/Contents/Developer
pod install
```
