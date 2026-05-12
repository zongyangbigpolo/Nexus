---
name: virtual-channel-scaffold
description: >
  Scaffold generator for new extension channel implementations.
  Generates boilerplate header, implementation, and test files.
trigger: |
  Activate when the user mentions:
  - Creating a new virtual channel
  - channel scaffold or boilerplate
  - New channel implementation from scratch
---

# Purpose

Generate the complete file set for a new extension channel in target repository, following project conventions.

# Scaffold Output

For a new channel named `<Name>`, generate these files:

## 1. Header — `CTX<Name>Channel.h`

```objc
//
//  CTX<Name>Channel.h
//  SampleApp
//
//  Copyright © 2026 Cloud Software Group, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CTXVirtualChannelProtocol.h"

NS_ASSUME_NONNULL_BEGIN

/// extension channel implementation for <description>.
/// Direction: <client-to-server | server-to-client | bidirectional>
@interface CTX<Name>Channel : NSObject <CTXVirtualChannelProtocol>

@property (nonatomic, readonly) NSString *channelName;
@property (nonatomic, readonly, getter=isOpen) BOOL open;
@property (nonatomic, weak, nullable) id<<Name>ChannelDelegate> delegate;

- (instancetype)init;
- (BOOL)sendData:(NSData *)data error:(NSError **)error;

@end

@protocol <Name>ChannelDelegate <NSObject>
- (void)channel:(CTX<Name>Channel *)channel didReceiveData:(NSData *)data;
@optional
- (void)channelDidOpen:(CTX<Name>Channel *)channel;
- (void)channelDidClose:(CTX<Name>Channel *)channel;
@end

NS_ASSUME_NONNULL_END
```

## 2. Implementation — `CTX<Name>Channel.m`

```objc
//
//  CTX<Name>Channel.m
//  SampleApp
//
//  Copyright © 2026 Cloud Software Group, Inc. All rights reserved.
//

#import "CTX<Name>Channel.h"

static NSString * const kChannelName = @"CTX<NAME_UPPER>";

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
    if ([self.delegate respondsToSelector:@selector(channelDidOpen:)]) {
        [self.delegate channelDidOpen:self];
    }
}

- (void)channelDidClose {
    self.open = NO;
    if ([self.delegate respondsToSelector:@selector(channelDidClose:)]) {
        [self.delegate channelDidClose:self];
    }
}

- (void)didReceiveData:(NSData *)data {
    if (!self.isOpen) return;
    [self.delegate channel:self didReceiveData:data];
}

#pragma mark - Public Methods

- (BOOL)sendData:(NSData *)data error:(NSError **)error {
    if (!self.isOpen) {
        if (error) {
            *error = [NSError errorWithDomain:@"CTX<Name>ChannelErrorDomain"
                                         code:-1
                                     userInfo:@{NSLocalizedDescriptionKey: @"Channel is not open"}];
        }
        return NO;
    }
    // TODO: Send data via channel API
    return YES;
}

@end
```

## 3. Test — `CTX<Name>ChannelTests.m`

```objc
//
//  CTX<Name>ChannelTests.m
//  SampleAppTests
//
//  Copyright © 2026 Cloud Software Group, Inc. All rights reserved.
//

#import <XCTest/XCTest.h>
#import <mock framework/mock framework.h>
#import "CTX<Name>Channel.h"

@interface CTX<Name>ChannelTests : XCTestCase
@property (nonatomic, strong) CTX<Name>Channel *sut;
@property (nonatomic, strong) id mockDelegate;
@end

@implementation CTX<Name>ChannelTests

- (void)setUp {
    [super setUp];
    self.sut = [[CTX<Name>Channel alloc] init];
    self.mockDelegate = OCMProtocolMock(@protocol(<Name>ChannelDelegate));
    self.sut.delegate = self.mockDelegate;
}

- (void)tearDown {
    self.sut = nil;
    self.mockDelegate = nil;
    [super tearDown];
}

#pragma mark - Lifecycle Tests

- (void)testChannelNameIsCorrect {
    XCTAssertEqualObjects(self.sut.channelName, @"CTX<NAME_UPPER>");
}

- (void)testInitialStateIsClosed {
    XCTAssertFalse(self.sut.isOpen);
}

- (void)testChannelDidOpenSetsOpenState {
    [self.sut channelDidOpen];
    XCTAssertTrue(self.sut.isOpen);
}

- (void)testChannelDidCloseSetsClosedState {
    [self.sut channelDidOpen];
    [self.sut channelDidClose];
    XCTAssertFalse(self.sut.isOpen);
}

#pragma mark - Data Tests

- (void)testReceiveDataNotifiesDelegate {
    [self.sut channelDidOpen];
    NSData *testData = [@"test" dataUsingEncoding:NSUTF8StringEncoding];

    [self.sut didReceiveData:testData];

    OCMVerify([self.mockDelegate channel:self.sut didReceiveData:testData]);
}

- (void)testReceiveDataWhileClosedIsIgnored {
    NSData *testData = [@"test" dataUsingEncoding:NSUTF8StringEncoding];

    [self.sut didReceiveData:testData];

    OCMVerify(never(), [self.mockDelegate channel:OCMOCK_ANY didReceiveData:OCMOCK_ANY]);
}

- (void)testSendDataWhileClosedReturnsError {
    NSData *testData = [@"test" dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;

    BOOL result = [self.sut sendData:testData error:&error];

    XCTAssertFalse(result);
    XCTAssertNotNil(error);
}

@end
```

# Post-Scaffold Steps

After generating files:

1. **Add to native build tool project** — drag files into the correct group in the project navigator
2. **Register channel** — add to the protocol client's channel registry initialization code
3. **Target membership** — ensure `.m` files are in the correct build target
4. **Test target** — ensure test files are in the test target only
5. **Verify build** — run incremental build to confirm compilation
