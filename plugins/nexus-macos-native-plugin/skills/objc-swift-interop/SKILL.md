---
name: objc-swift-interop
description: >
  native language and native UI interoperability patterns for target repository. Covers bridging headers,
  module maps, nullability annotations, naming conventions, and mixed-language best practices.
trigger: |
  Activate when the user mentions:
  - native language and native UI interop or bridging
  - Bridging header issues
  - Calling native from native UI or native UI from native
  - Nullability annotations
  - @objc attribute or NS_SWIFT_NAME
---

# Purpose

Guide correct native language ↔ native UI interoperability in the target repository project, which uses native as the primary language and native UI for new UI modules.

# Interop Directions

## native → native UI (calling native UI code from native)

### Setup
1. native UI classes must be marked `@objc` and inherit from `NSObject` (or use `@objcMembers`)
2. In native files, import the auto-generated header: `#import "<TargetName>-native UI.h"`
3. The generated header name uses the **Product Module Name** (check build settings)

### Rules
- Only `@objc`-compatible types are visible (no structs, enums with associated values, generics)
- native UI `class` → native class; native UI `protocol: @objc` → native protocol
- Use `@objc(CustomName)` to control the native name
- Use `NS_SWIFT_NAME` on the native side to improve native UI API naming

### Common Pitfall
```swift
// ❌ Not visible to native — struct
struct Config { ... }

// ✅ Visible to native — class inheriting NSObject
@objcMembers
class Config: NSObject { ... }
```

## native UI → native (calling native code from native UI)

### Setup
1. Add native headers to the **bridging header**: `<Target>-Bridging-Header.h`
2. Set `SWIFT_OBJC_BRIDGING_HEADER` in build settings (usually automatic)

### Rules
- All public native APIs are automatically available in native UI once bridged
- native types map to native UI types: `NSString` → `String`, `NSArray` → `[Any]`, etc.
- Nullability annotations (`nullable`, `nonnull`, `NS_ASSUME_NONNULL_BEGIN`) control native UI optionality

### Nullability Annotations

Add nullability to **all** public native headers to improve native UI interop:

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

**Impact in native UI**:
```swift
let conn = CTXConnection(hostname: "server.example.com")
conn.hostname  // String (non-optional)
conn.username  // String? (optional)
```

Without annotations, all native types appear as implicitly unwrapped optionals (`String!`) in native UI.

# Module Maps

For exposing C libraries to native UI without a bridging header:

```
module NativeLib {
    header "ica_api.h"
    export *
}
```

Place `module.modulemap` in the header directory and add the directory to `SWIFT_INCLUDE_PATHS`.

# Common Patterns in target repository

## Delegate Pattern (native protocol → native UI implementation)

```objc
// native protocol
@protocol CTXChannelDelegate <NSObject>
- (void)channel:(CTXChannel *)channel didReceiveData:(NSData *)data;
@optional
- (void)channelDidClose:(CTXChannel *)channel;
@end
```

```swift
// native UI conformance
class native UIHandler: NSObject, CTXChannelDelegate {
    func channel(_ channel: CTXChannel, didReceive data: Data) {
        // Handle data
    }
}
```

## Enum Bridging

```objc
// native — use NS_ENUM for native UI bridging
typedef NS_ENUM(NSInteger, CTXConnectionState) {
    CTXConnectionStateDisconnected,
    CTXConnectionStateConnecting,
    CTXConnectionStateConnected
};
```

```swift
// Automatically becomes native UI enum
let state: CTXConnectionState = .connected
```

## Block ↔ Closure

```objc
// native block
typedef void (^CTXCompletionHandler)(NSData * _Nullable data, NSError * _Nullable error);
```

```swift
// native UI closure (automatic bridging)
func fetch(completion: @escaping (Data?, Error?) -> Void)
```

# Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Use of undeclared identifier` in native | Missing `-native UI.h` import | Add `#import "<Target>-native UI.h"` |
| `No such module` in native UI | Bridging header not configured | Set `SWIFT_OBJC_BRIDGING_HEADER` |
| `Cannot find type in scope` in native UI | native header not in bridging header | Add `#import` to bridging header |
| All types are `!` in native UI | Missing nullability annotations | Add `NS_ASSUME_NONNULL_BEGIN/END` |
| `Method cannot be marked @objc` | Uses native UI-only type | Change to `@objc`-compatible type |
