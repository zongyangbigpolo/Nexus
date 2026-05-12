---
name: virtual-channel-sdk
description: >
  extension channel SDK patterns for target repository. Covers channel lifecycle, data handling,
  protocol registration, and bidirectional communication patterns.
trigger: |
  Activate when the user mentions:
  - extension channel development or channel SDK
  - integration channel implementation
  - Channel open, close, or data transfer
  - channel protocol or channel registration
---

# Purpose

Guide developers through implementing extension channels in target repository. extension channels provide bidirectional communication between the protocol client and Organization server-side components.

# channel Architecture Overview

```
┌─────────────────────┐          protocol Protocol          ┌─────────────────────┐
│   desktop OS Client      │ ◄══════════════════════════════►│   Organization Server     │
│                     │                                 │                     │
│  ┌───────────────┐  │     extension channel Data        │  ┌───────────────┐  │
│  │ channel Module     │◄─┼─────────────────────────────────┼─►│ Server channel     │  │
│  │ (Client-side) │  │                                 │  │ (Server-side) │  │
│  └───────────────┘  │                                 │  └───────────────┘  │
└─────────────────────┘                                 └─────────────────────┘
```

# channel Lifecycle

1. **Registration** — channel module registers with the protocol client during initialization
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
    // Send data to server via channel API
}

@end
```

# Data Flow Patterns

## Client → Server (outbound)
Used when the client initiates data transfer (e.g., FIDO2 authentication response, input events).

## Server → Client (inbound)
Used when the server pushes data to the client (e.g., sensor data requests, UI update commands).

## Bidirectional
Most channels use bidirectional communication with a request-response or event-driven pattern.

# Known extension channels in target repository

| channel Name | Purpose | Direction |
|---------|---------|-----------|
| FIDO2 | WebAuthn/FIDO2 authentication | Bidirectional |
| EUEM | End User Experience Monitoring | Client → Server |
| MultiTouch | Touch/trackpad events | Client → Server |
| SENS | System Event Notification | Bidirectional |

> **Note**: Discover actual channel implementations by searching for files matching `*Channel.m` or `*Channel.h` in the project.

# Testing channels

1. Mock the channel protocol for unit tests
2. Test lifecycle methods: `channelDidOpen`, `channelDidClose`
3. Test data parsing with known byte sequences
4. Test error handling for malformed data
5. Test state management (open/close transitions)

# Integration Points

- channels register with the protocol client's channel manager during app initialization
- Channel data is multiplexed over the protocol protocol connection
- channels should handle channel close gracefully (session disconnect, network loss)
- channels must be thread-safe — data callbacks may arrive on background threads
