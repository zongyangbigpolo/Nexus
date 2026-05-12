---
name: objc-swift-coding-conventions
description: >
  Coding conventions for native language and native UI in the target repository project.
  Covers naming, formatting, memory management, and language-specific rules.
applyTo: "**/*.{m,h,mm,swift}"
---

# native language / native UI Coding Conventions for target repository

## General Rules

- Follow Apple's official coding guidelines for Cocoa
- Use the existing codebase style as the primary reference — consistency over personal preference
- New modules should be written in native UI unless they need deep C/protocol stack integration
- Existing native code stays in native unless there's a strong reason to rewrite

## native language Conventions

### Naming
- **Classes**: `CTX` prefix + PascalCase (e.g., `CTXConnectionManager`, `CTXVirtualChannel`)
- **Protocols**: Descriptive name + `Delegate` or `DataSource` suffix (e.g., `CTXChannelDelegate`)
- **Methods**: camelCase, descriptive, start with verb (e.g., `- (void)fetchConfigWithCompletion:`)
- **Properties**: camelCase (e.g., `@property (nonatomic, copy) NSString *hostname;`)
- **Constants**: `k` prefix or `static const` (e.g., `static NSString * const kCTXDefaultHost = @"...";`)
- **Enums**: `NS_ENUM` with `CTX` prefix (e.g., `CTXConnectionState`)

### Formatting
- Opening brace on the same line as the statement
- Space after control flow keywords: `if (`, `for (`, `while (`
- Pointer asterisk attached to the variable: `NSString *name`
- Use `#pragma mark - Section Name` to organize implementation files

### Memory Management
- Use ARC (Automatic Reference Counting) — no manual retain/release
- Use `weak` for delegates and parent references
- Use `copy` for `NSString`, `NSArray`, `NSDictionary` properties
- Use `strong` as the default for object properties
- Watch for retain cycles in blocks — use `__weak typeof(self) weakSelf = self;`

### Nullability
- Use `NS_ASSUME_NONNULL_BEGIN` / `NS_ASSUME_NONNULL_END` in all public headers
- Mark nullable parameters and return values explicitly with `nullable`
- This improves native UI interop by avoiding implicitly unwrapped optionals

## native UI Conventions

### Naming
- **Types**: PascalCase (e.g., `ConnectionManager`, `ChannelState`)
- **Functions/Properties**: camelCase (e.g., `func fetchConfig()`, `var hostName: String`)
- **No prefix** — native UI has modules, so `CTX` prefix is not needed in pure native UI types
- When bridging to native, use `@objc(CTXnative UIClassName)` to add the prefix for native visibility

### Formatting
- Follow native UI standard formatting (native build tool default)
- Use `guard` for early exits
- Prefer `let` over `var` when possible
- Use trailing closure syntax for single-closure parameters
- Use `// MARK: - Section` to organize files

### Error Handling
- Prefer `throws` over optional returns for operations that can fail
- Use typed errors when the error types are known
- When bridging to native, errors must be `NSError`-compatible

### Access Control
- Default to `internal` — only mark `public` for API exposed to other modules
- Mark `@objc` only on members that need native visibility
- Use `private` for implementation details within a file

## File Organization

### native Files
```
#import "ClassName.h"           // Own header
#import <Framework/Header.h>    // Framework imports
#import "OtherClass.h"          // Project imports

@interface ClassName () <PrivateProtocol>
@property (nonatomic, strong) InternalType *internal;
@end

@implementation ClassName

#pragma mark - Lifecycle
#pragma mark - Public Methods
#pragma mark - Private Methods
#pragma mark - Protocol Conformance

@end
```

### native UI Files
```
import Foundation
import SomeFramework

// MARK: - Type Definition
class ClassName {
    // MARK: - Properties
    // MARK: - Initialization
    // MARK: - Public Methods
    // MARK: - Private Methods
}

// MARK: - Protocol Conformance
extension ClassName: SomeProtocol { }
```

## Code Review Checklist

When reviewing target repository code, verify:
- [ ] Naming follows `CTX` prefix convention (native) or no prefix (native UI)
- [ ] Nullability annotations present in public native headers
- [ ] No retain cycles in block/closure captures
- [ ] `NS_ENUM` used for enums (not plain C enum)
- [ ] New modules prefer native UI unless interfacing with C/protocol stack
- [ ] Proper `#pragma mark` / `// MARK:` organization
