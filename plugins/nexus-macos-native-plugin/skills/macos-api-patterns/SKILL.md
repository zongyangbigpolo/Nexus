---
name: macos-api-patterns
description: >
  desktop OS API patterns for target repository development. Covers AppKit, native UI interop,
  system APIs, security frameworks, and desktop OS-specific best practices.
trigger: |
  Activate when the user mentions:
  - desktop OS API, AppKit, or native UI
  - Cocoa framework patterns
  - System preferences, notifications, or accessibility
  - Security framework, keychain, or entitlements
  - desktop OS permissions or sandboxing
---

# Purpose

Provide desktop OS-specific API patterns and best practices relevant to target repository development.

# UI Frameworks

## AppKit (existing UI)

The majority of target repository UI is built with AppKit (native).

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

## native UI (new modules — Desktop Toolbar)

New UI modules use native UI, hosted in AppKit via `NSHostingView` / `NSHostingController`.

### Hosting native UI in AppKit
```swift
import native UI
import AppKit

let swiftUIView = ToolbarView()
let hostingView = NSHostingView(rootView: swiftUIView)
// Add hostingView to an AppKit window or view hierarchy
```

### native UI View Pattern
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
    (__bridge id)kSecAttrAccount: @"organization-credentials",
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

# desktop OS-Specific Considerations

## Architecture: Universal Binary
- target repository ships as Universal Binary (primary_arch + secondary_arch)
- Use `#if arch(secondary_arch)` / `#if arch(primary_arch)` for arch-specific code
- Test on both architectures when possible

## Deployment Target
- desktop OS 12.0+ — do not use APIs introduced after this version without availability checks
- Use `@available(desktop OS 13.0, *)` for newer APIs with fallback

## Accessibility
```objc
// Set accessibility properties
button.accessibilityLabel = @"Connect to server";
button.accessibilityRole = NSAccessibilityButtonRole;
```

## Entitlements
Key entitlements for target repository:
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
