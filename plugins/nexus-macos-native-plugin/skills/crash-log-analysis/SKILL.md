---
name: crash-log-analysis
description: >
  Crash log analysis for icaclientmac. Parse macOS crash reports, symbolicate stack traces,
  identify root causes, and suggest fixes.
trigger: |
  Activate when the user mentions:
  - Crash log, crash report, or .crash file
  - EXC_BAD_ACCESS, SIGABRT, or SIGSEGV
  - Symbolication or stack trace analysis
  - Sentry crash or crash reporting
---

# Purpose

Analyze macOS crash logs from icaclientmac to identify root causes and suggest fixes.

# Crash Report Structure

A macOS crash report contains:
1. **Header** — process name, bundle ID, version, OS version
2. **Exception Information** — exception type, signal, faulting thread
3. **Thread Backtraces** — stack frames for all threads
4. **Binary Images** — loaded libraries and their addresses

# Common Exception Types

| Exception | Signal | Common Cause |
|-----------|--------|-------------|
| `EXC_BAD_ACCESS` | `SIGSEGV` / `SIGBUS` | Accessing deallocated memory, null pointer dereference |
| `EXC_CRASH` | `SIGABRT` | Assertion failure, uncaught exception, `abort()` |
| `EXC_BREAKPOINT` | `SIGTRAP` | Swift runtime error, force-unwrap nil, precondition failure |
| `EXC_BAD_INSTRUCTION` | `SIGILL` | Invalid CPU instruction (corrupt binary) |
| `EXC_RESOURCE` | — | Resource limit exceeded (memory, CPU) |

# Symbolication

## Using atos
```bash
atos -arch x86_64 -o ICAClientUniversalBinary.app.dSYM/Contents/Resources/DWARF/ICAClientUniversalBinary -l 0x100000000 0x<address>
```

## Using Xcode
1. Open Xcode → Window → Devices and Simulators → View Device Logs
2. Import the .crash file
3. Xcode symbolicates automatically if dSYM is available

# Analysis Workflow

1. **Identify the crashing thread** — marked as "Crashed" in the report
2. **Read the exception type** — guides the category of bug
3. **Examine the top frames** — find the first frame in project code (not system frameworks)
4. **Check the faulting address** — `0x0` suggests null pointer; small values suggest use-after-free
5. **Look for patterns** — same crash across multiple reports suggests a systemic issue

# Sentry Integration

icaclientmac uses Sentry for crash reporting:
- Crashes are automatically uploaded with symbolicated stack traces
- Sentry groups similar crashes into issues
- Check Sentry dashboard for crash frequency and affected versions

# Common icaclientmac Crash Patterns

| Pattern | Stack Hint | Likely Cause | Fix |
|---------|-----------|-------------|-----|
| VC data callback crash | `didReceiveData:` | Data received after channel close | Check `isOpen` before processing |
| UI thread assertion | `__NSCFString` / Main Thread | Background thread UI update | Dispatch to main queue |
| ObjC message to dealloc'd | `objc_msgSend` + zombie | Weak reference not zeroed | Use `weak` property, check nil |
| Swift force-unwrap | `Swift runtime` | `nil` on force-unwrap `!` | Use `guard let` / `if let` |
