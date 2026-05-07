---
name: virtual-channel-sdk
description: >
  ICA Virtual Channel SDK patterns for icaclientmac. Covers VC lifecycle, data handling,
  protocol registration, and bidirectional communication patterns.
trigger: |
  Activate when the user mentions:
  - Virtual Channel development or VC SDK
  - ICA channel implementation
  - Channel open, close, or data transfer
  - VC protocol or channel registration
---

# Purpose

Guide developers through implementing ICA Virtual Channels in icaclientmac. Virtual Channels provide bidirectional communication between the ICA client and Citrix server-side components.

# VC Architecture Overview

```
┌─────────────────────┐          ICA Protocol          ┌─────────────────────┐
│   macOS Client      │ ◄══════════════════════════════►│   Citrix Server     │
│                     │                                 │                     │
│  ┌───────────────┐  │     Virtual Channel Data        │  ┌───────────────┐  │
│  │ VC Module     │◄─┼─────────────────────────────────┼─►│ Server VC     │  │
│  │ (Client-side) │  │                                 │  │ (Server-side) │  │
│  └───────────────┘  │                                 │  └───────────────┘  │
└─────────────────────┘                                 └─────────────────────┘
```

# VC Lifecycle

1. **Registration** — VC module registers with the ICA client during initialization
2. **Channel Open** — server opens the channel after session establishment
3. **Data Exchange** — client and server exchange data packets
4. **Channel Close** — channel closes when session ends or explicitly closed

# Implementation Pattern

## Header File (.h)

```objc
#import <Foundation/Foundation.h>
#import "CTXVirtualChannelProtocol.h"

NS_ASSUME_NONNULL_BEGIN

@interface CTX<Name>Channel : NSObject <CTXVirtualChannelProtocol>

@property (nonatomic, readonly) NSString *channelName;
@property (nonatomic, readonly, getter=isOpen) BOOL open;

- (instancetype)init;
- (void)sendData:(NSData *)data;

@end

NS_ASSUME_NONNULL_END
```

## Implementation File (.m)

```objc
#import "CTX<Name>Channel.h"

static NSString * const kChannelName = @"CTX<NAME>";

@interface CTX<Name>Channel ()
@property (nonatomic, readwrite, getter=isOpen) BOOL open;
@end

@implementation CTX<Name>Channel

#pragma mark - Lifecycle

- (instancetype)init {
    self = [super init];
    if (self) {
        _channelName = kChannelName;
        _open = NO;
    }
    return self;
}

#pragma mark - CTXVirtualChannelProtocol

- (void)channelDidOpen {
    self.open = YES;
    // Initialize channel state
}

- (void)channelDidClose {
    self.open = NO;
    // Clean up channel state
}

- (void)didReceiveData:(NSData *)data {
    if (!self.isOpen) return;
    // Parse and handle incoming data from server
}

#pragma mark - Public Methods

- (void)sendData:(NSData *)data {
    if (!self.isOpen) return;
    // Send data to server via VC API
}

@end
```

# Data Flow Patterns

## Client → Server (outbound)
Used when the client initiates data transfer (e.g., FIDO2 authentication response, input events).

## Server → Client (inbound)
Used when the server pushes data to the client (e.g., sensor data requests, UI update commands).

## Bidirectional
Most VCs use bidirectional communication with a request-response or event-driven pattern.

# Known Virtual Channels in icaclientmac

| VC Name | Purpose | Direction |
|---------|---------|-----------|
| FIDO2 | WebAuthn/FIDO2 authentication | Bidirectional |
| EUEM | End User Experience Monitoring | Client → Server |
| MultiTouch | Touch/trackpad events | Client → Server |
| SENS | System Event Notification | Bidirectional |

> **Note**: Discover actual VC implementations by searching for files matching `*Channel.m` or `*Channel.h` in the project.

# Testing VCs

1. Mock the channel protocol for unit tests
2. Test lifecycle methods: `channelDidOpen`, `channelDidClose`
3. Test data parsing with known byte sequences
4. Test error handling for malformed data
5. Test state management (open/close transitions)

# Integration Points

- VCs register with the ICA client's channel manager during app initialization
- Channel data is multiplexed over the ICA protocol connection
- VCs should handle channel close gracefully (session disconnect, network loss)
- VCs must be thread-safe — data callbacks may arrive on background threads
