---
name: xctest-patterns
description: >
  XCTest testing patterns for icaclientmac. Covers OCMock mocking, OHHTTPStubs network stubbing,
  async testing, test organization, and common assertion patterns.
trigger: |
  Activate when the user mentions:
  - Writing tests or test patterns
  - OCMock or mocking in ObjC
  - OHHTTPStubs or network stubbing
  - XCTest expectations or async testing
  - Test fixtures or test organization
---

# Purpose

Provide testing patterns and best practices for writing XCTest tests in the icaclientmac project using OCMock and OHHTTPStubs.

# Test Structure

## Basic ObjC Test Class

```objc
#import <XCTest/XCTest.h>
#import <OCMock/OCMock.h>
#import "ClassUnderTest.h"

@interface ClassUnderTestTests : XCTestCase
@property (nonatomic, strong) ClassUnderTest *sut;  // system under test
@end

@implementation ClassUnderTestTests

- (void)setUp {
    [super setUp];
    self.sut = [[ClassUnderTest alloc] init];
}

- (void)tearDown {
    self.sut = nil;
    [super tearDown];
}

- (void)testSomeBehavior {
    // Arrange
    NSString *input = @"test";

    // Act
    NSString *result = [self.sut processInput:input];

    // Assert
    XCTAssertEqualObjects(result, @"expected");
}

@end
```

## Basic Swift Test Class

```swift
import XCTest
@testable import ICAClientUniversalBinary

final class FeatureTests: XCTestCase {

    var sut: Feature!

    override func setUp() {
        super.setUp()
        sut = Feature()
    }

    override func tearDown() {
        sut = nil
        super.tearDown()
    }

    func testBehavior() {
        // Arrange
        let input = "test"

        // Act
        let result = sut.process(input)

        // Assert
        XCTAssertEqual(result, "expected")
    }
}
```

# OCMock Patterns

## Mock a Protocol

```objc
- (void)testDelegateCallback {
    id mockDelegate = OCMProtocolMock(@protocol(CTXChannelDelegate));
    self.sut.delegate = mockDelegate;

    [self.sut receiveData:testData];

    OCMVerify([mockDelegate channel:self.sut didReceiveData:testData]);
}
```

## Mock a Class

```objc
- (void)testWithMockedDependency {
    id mockService = OCMClassMock([CTXNetworkService class]);
    OCMStub([mockService fetchConfigWithCompletion:([OCMArg invokeBlockWithArgs:mockData, [NSNull null], nil])]);

    self.sut.networkService = mockService;
    [self.sut loadConfig];

    XCTAssertNotNil(self.sut.config);
}
```

## Partial Mock

```objc
- (void)testPartialOverride {
    id partialMock = OCMPartialMock(self.sut);
    OCMStub([partialMock expensiveOperation]).andReturn(@"cached");

    NSString *result = [self.sut processWithCaching];

    XCTAssertEqualObjects(result, @"cached");
}
```

## Verify Call Count

```objc
OCMVerify(times(1), [mockService sendEvent:OCMOCK_ANY]);
OCMVerify(never(), [mockService sendEvent:@"forbidden"]);
```

## Argument Matching

```objc
OCMVerify([mockService sendRequest:[OCMArg checkWithBlock:^BOOL(NSURLRequest *req) {
    return [req.URL.path isEqualToString:@"/api/v1/config"];
}]]);
```

# OHHTTPStubs Patterns

## Stub a GET Request

```objc
#import <OHHTTPStubs/HTTPStubs.h>
#import <OHHTTPStubs/HTTPStubsPathHelpers.h>

- (void)setUp {
    [super setUp];
    [HTTPStubs stubRequestsPassingTest:^BOOL(NSURLRequest *request) {
        return [request.URL.path isEqualToString:@"/api/v1/config"];
    } withStubResponse:^HTTPStubsResponse *(NSURLRequest *request) {
        return [HTTPStubsResponse responseWithFileAtPath:
            OHPathForFile(@"config_response.json", self.class)
            statusCode:200
            headers:@{@"Content-Type": @"application/json"}];
    }];
}

- (void)tearDown {
    [HTTPStubs removeAllStubs];
    [super tearDown];
}
```

## Stub Error Response

```objc
[HTTPStubs stubRequestsPassingTest:^BOOL(NSURLRequest *request) {
    return [request.URL.host isEqualToString:@"api.example.com"];
} withStubResponse:^HTTPStubsResponse *(NSURLRequest *request) {
    NSError *error = [NSError errorWithDomain:NSURLErrorDomain
                                         code:NSURLErrorNotConnectedToInternet
                                     userInfo:nil];
    return [HTTPStubsResponse responseWithError:error];
}];
```

## Simulate Slow Network

```objc
return [[HTTPStubsResponse responseWithData:data statusCode:200 headers:nil]
    requestTime:0.5
    responseTime:2.0];
```

# Async Testing

## XCTestExpectation

```objc
- (void)testAsyncOperation {
    XCTestExpectation *expectation = [self expectationWithDescription:@"Callback received"];

    [self.sut fetchDataWithCompletion:^(NSData *data, NSError *error) {
        XCTAssertNotNil(data);
        XCTAssertNil(error);
        [expectation fulfill];
    }];

    [self waitForExpectationsWithTimeout:5.0 handler:nil];
}
```

## Swift Async/Await (for Swift test targets)

```swift
func testAsyncFetch() async throws {
    let result = try await sut.fetchConfig()
    XCTAssertFalse(result.isEmpty)
}
```

# Best Practices

1. **One assertion per concept** — test one behavior per test method
2. **Arrange-Act-Assert** — clear structure in every test
3. **Clean up mocks** — remove stubs in `tearDown` to prevent cross-contamination
4. **Name tests descriptively** — `testFetchConfig_WhenNetworkError_ReturnsNilWithError`
5. **Avoid testing private methods** — test through public API
6. **Keep tests fast** — mock I/O, avoid real network calls
7. **Use `sut` convention** — name the system under test `sut` for clarity
