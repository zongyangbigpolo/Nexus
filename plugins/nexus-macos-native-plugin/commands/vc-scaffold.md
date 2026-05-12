---
name: vc-scaffold
description: Scaffold a new extension channel implementation with boilerplate code and tests.
agent: vc-developer
---

# extension channel Scaffold

Generate the directory structure, boilerplate code, and test stubs for a new extension channel.

## channel Name

${input:vcName:extension channel name (e.g., FIDO2, EUEM, MultiTouch, SENS)}

## Direction

${input:direction:Data flow direction — client-to-server, server-to-client, bidirectional (default: bidirectional)}

---

## What happens

1. **Analyze existing channels** — scan project for channel implementation patterns
2. **Generate scaffold** — create header/implementation files following project conventions
3. **Wire registration** — add channel to the client's channel registration system
4. **Create test stubs** — generate XCTest class with mock framework setup
5. **Update build** — ensure new files are added to the native build tool project

---

**channel Name**: ${input:vcName}
**Direction**: ${input:direction}
