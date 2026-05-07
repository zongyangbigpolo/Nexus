---
name: macos-api-patterns
description: >
  macOS API patterns for icaclientmac development. Covers AppKit, SwiftUI interop,
  system APIs, security frameworks, and macOS-specific best practices.
trigger: |
  Activate when the user mentions:
  - macOS API, AppKit, or SwiftUI
  - Cocoa framework patterns
  - System preferences, notifications, or accessibility
  - Security framework, keychain, or entitlements
  - macOS permissions or sandboxing
---

# Purpose

Provide macOS-specific API patterns and best practices relevant to icaclientmac development.

# UI Frameworks

## AppKit (existing UI)

The majority of icaclientmac UI is built with AppKit (ObjC).

### Window Management
```objc
// Create and show a window
NSWindowController *wc = [[NSWindowController alloc]
    initWithWindowNibName:@"ConfigWindow"];
[wc showWindow:nil];
```

### NSViewController Pattern
```objc
@interface CTXSettingsViewController : NSViewController
@end

@implementation CTXSettingsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Setup UI
}

@end
```

## SwiftUI (new modules — Desktop Toolbar)

New UI modules use SwiftUI, hosted in AppKit via `NSHostingView` / `NSHostingController`.

### Hosting SwiftUI in AppKit
```swift
import SwiftUI
import AppKit

let swiftUIView = ToolbarView()
let hostingView = NSHostingView(rootView: swiftUIView)
// Add hostingView to an AppKit window or view hierarchy
```

### SwiftUI View Pattern
```swift
struct ToolbarView: View {
    @StateObject private var viewModel = ToolbarViewModel()

    var body: some View {
        HStack {
            // Toolbar items
        }
        .frame(height: 44)
    }
}
```

# System APIs

## User Notifications
```objc
UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
content.title = @"Connection Status";
content.body = @"Session disconnected";

UNNotificationRequest *request = [UNNotificationRequest
    requestWithIdentifier:@"disconnect"
    content:content
    trigger:nil];

[center addNotificationRequest:request withCompletionHandler:nil];
```

## Keychain Access
```objc
NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: @"citrix-credentials",
    (__bridge id)kSecReturnData: @YES,
    (__bridge id)kSecMatchLimit: (__bridge id)kSecMatchLimitOne
};

CFTypeRef result = NULL;
OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);
```

## Process and Thread Management
```objc
// Dispatch to background
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    // Background work
    dispatch_async(dispatch_get_main_queue(), ^{
        // Update UI on main thread
    });
});
```

## Network Reachability
```objc
#import <SystemConfiguration/SystemConfiguration.h>

SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithName(
    NULL, "server.example.com");
SCNetworkReachabilityFlags flags;
SCNetworkReachabilityGetFlags(reachability, &flags);
BOOL isReachable = (flags & kSCNetworkFlagsReachable) != 0;
CFRelease(reachability);
```

# macOS-Specific Considerations

## Architecture: Universal Binary
- icaclientmac ships as Universal Binary (x86_64 + arm64)
- Use `#if arch(arm64)` / `#if arch(x86_64)` for arch-specific code
- Test on both architectures when possible

## Deployment Target
- macOS 12.0+ — do not use APIs introduced after this version without availability checks
- Use `@available(macOS 13.0, *)` for newer APIs with fallback

## Accessibility
```objc
// Set accessibility properties
button.accessibilityLabel = @"Connect to server";
button.accessibilityRole = NSAccessibilityButtonRole;
```

## Entitlements
Key entitlements for icaclientmac:
- `com.apple.security.network.client` — outbound network connections
- `com.apple.security.device.usb` — USB device access (for FIDO2)
- Hardened Runtime entitlements for Notarization

# Common Patterns

## Delegate Pattern (AppKit standard)
```objc
@protocol CTXConnectionDelegate <NSObject>
- (void)connectionDidEstablish:(CTXConnection *)connection;
- (void)connection:(CTXConnection *)connection didFailWithError:(NSError *)error;
@optional
- (void)connectionDidDisconnect:(CTXConnection *)connection;
@end
```

## KVO (Key-Value Observing)
```objc
[self.connection addObserver:self
                  forKeyPath:@"state"
                     options:NSKeyValueObservingOptionNew
                     context:nil];

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    if ([keyPath isEqualToString:@"state"]) {
        // Handle state change
    }
}
```

## NSNotificationCenter
```objc
[[NSNotificationCenter defaultCenter]
    addObserver:self
    selector:@selector(handleSessionChange:)
    name:@"CTXSessionStateDidChange"
    object:nil];
```
