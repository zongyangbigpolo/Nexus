---
name: vc-scaffold
description: Scaffold a new ICA Virtual Channel implementation with boilerplate code and tests.
agent: vc-developer
---

# Virtual Channel Scaffold

Generate the directory structure, boilerplate code, and test stubs for a new ICA Virtual Channel.

## VC Name

${input:vcName:Virtual Channel name (e.g., FIDO2, EUEM, MultiTouch, SENS)}

## Direction

${input:direction:Data flow direction — client-to-server, server-to-client, bidirectional (default: bidirectional)}

---

## What happens

1. **Analyze existing VCs** — scan project for VC implementation patterns
2. **Generate scaffold** — create header/implementation files following project conventions
3. **Wire registration** — add VC to the client's channel registration system
4. **Create test stubs** — generate XCTest class with OCMock setup
5. **Update build** — ensure new files are added to the Xcode project

---

**VC Name**: ${input:vcName}
**Direction**: ${input:direction}
