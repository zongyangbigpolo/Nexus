---
name: objc-swift-interop
description: >
  Objective-C and Swift interoperability patterns for icaclientmac. Covers bridging headers,
  module maps, nullability annotations, naming conventions, and mixed-language best practices.
trigger: |
  Activate when the user mentions:
  - Objective-C and Swift interop or bridging
  - Bridging header issues
  - Calling ObjC from Swift or Swift from ObjC
  - Nullability annotations
  - @objc attribute or NS_SWIFT_NAME
---

# Purpose

Guide correct Objective-C ↔ Swift interoperability in the icaclientmac project, which uses ObjC as the primary language and Swift for new UI modules.

# Interop Directions

## ObjC → Swift (calling Swift code from ObjC)

### Setup
1. Swift classes must be marked `@objc` and inherit from `NSObject` (or use `@objcMembers`)
2. In ObjC files, import the auto-generated header: `#import "<TargetName>-Swift.h"`
3. The generated header name uses the **Product Module Name** (check build settings)

### Rules
- Only `@objc`-compatible types are visible (no structs, enums with associated values, generics)
- Swift `class` → ObjC class; Swift `protocol: @objc` → ObjC protocol
- Use `@objc(CustomName)` to control the ObjC name
- Use `NS_SWIFT_NAME` on the ObjC side to improve Swift API naming

### Common Pitfall
```swift
// ❌ Not visible to ObjC — struct
struct Config { ... }

// ✅ Visible to ObjC — class inheriting NSObject
@objcMembers
class Config: NSObject { ... }
```

## Swift → ObjC (calling ObjC code from Swift)

### Setup
1. Add ObjC headers to the **bridging header**: `<Target>-Bridging-Header.h`
2. Set `SWIFT_OBJC_BRIDGING_HEADER` in build settings (usually automatic)

### Rules
- All public ObjC APIs are automatically available in Swift once bridged
- ObjC types map to Swift types: `NSString` → `String`, `NSArray` → `[Any]`, etc.
- Nullability annotations (`nullable`, `nonnull`, `NS_ASSUME_NONNULL_BEGIN`) control Swift optionality

### Nullability Annotations

Add nullability to **all** public ObjC headers to improve Swift interop:

```objc
NS_ASSUME_NONNULL_BEGIN

@interface CTXConnection : NSObject

@property (nonatomic, copy) NSString *hostname;
@property (nonatomic, copy, nullable) NSString *username;

- (instancetype)initWithHostname:(NSString *)hostname;
- (nullable NSData *)fetchDataWithError:(NSError **)error;

@end

NS_ASSUME_NONNULL_END
```

**Impact in Swift**:
```swift
let conn = CTXConnection(hostname: "server.example.com")
conn.hostname  // String (non-optional)
conn.username  // String? (optional)
```

Without annotations, all ObjC types appear as implicitly unwrapped optionals (`String!`) in Swift.

# Module Maps

For exposing C libraries to Swift without a bridging header:

```
module ICANativeLib {
    header "ica_api.h"
    export *
}
```

Place `module.modulemap` in the header directory and add the directory to `SWIFT_INCLUDE_PATHS`.

# Common Patterns in icaclientmac

## Delegate Pattern (ObjC protocol → Swift implementation)

```objc
// ObjC protocol
@protocol CTXChannelDelegate <NSObject>
- (void)channel:(CTXChannel *)channel didReceiveData:(NSData *)data;
@optional
- (void)channelDidClose:(CTXChannel *)channel;
@end
```

```swift
// Swift conformance
class SwiftHandler: NSObject, CTXChannelDelegate {
    func channel(_ channel: CTXChannel, didReceive data: Data) {
        // Handle data
    }
}
```

## Enum Bridging

```objc
// ObjC — use NS_ENUM for Swift bridging
typedef NS_ENUM(NSInteger, CTXConnectionState) {
    CTXConnectionStateDisconnected,
    CTXConnectionStateConnecting,
    CTXConnectionStateConnected
};
```

```swift
// Automatically becomes Swift enum
let state: CTXConnectionState = .connected
```

## Block ↔ Closure

```objc
// ObjC block
typedef void (^CTXCompletionHandler)(NSData * _Nullable data, NSError * _Nullable error);
```

```swift
// Swift closure (automatic bridging)
func fetch(completion: @escaping (Data?, Error?) -> Void)
```

# Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Use of undeclared identifier` in ObjC | Missing `-Swift.h` import | Add `#import "<Target>-Swift.h"` |
| `No such module` in Swift | Bridging header not configured | Set `SWIFT_OBJC_BRIDGING_HEADER` |
| `Cannot find type in scope` in Swift | ObjC header not in bridging header | Add `#import` to bridging header |
| All types are `!` in Swift | Missing nullability annotations | Add `NS_ASSUME_NONNULL_BEGIN/END` |
| `Method cannot be marked @objc` | Uses Swift-only type | Change to `@objc`-compatible type |
