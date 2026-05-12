---
name: crash-log-analysis
description: >
  Crash log analysis for target repository. Parse desktop OS crash reports, symbolicate stack traces,
  identify root causes, and suggest fixes.
trigger: |
  Activate when the user mentions:
  - Crash log, crash report, or .crash file
  - EXC_BAD_ACCESS, SIGABRT, or SIGSEGV
  - Symbolication or stack trace analysis
  - crash monitoring crash or crash reporting
---

# Purpose

Analyze desktop OS crash logs from target repository to identify root causes and suggest fixes.

# Crash Report Structure

A desktop OS crash report contains:
1. **Header** — process name, bundle ID, version, OS version
2. **Exception Information** — exception type, signal, faulting thread
3. **Thread Backtraces** — stack frames for all threads
4. **Binary Images** — loaded libraries and their addresses

# Common Exception Types

| Exception | Signal | Common Cause |
|-----------|--------|-------------|
| `EXC_BAD_ACCESS` | `SIGSEGV` / `SIGBUS` | Accessing deallocated memory, null pointer dereference |
| `EXC_CRASH` | `SIGABRT` | Assertion failure, uncaught exception, `abort()` |
| `EXC_BREAKPOINT` | `SIGTRAP` | native UI runtime error, force-unwrap nil, precondition failure |
| `EXC_BAD_INSTRUCTION` | `SIGILL` | Invalid CPU instruction (corrupt binary) |
| `EXC_RESOURCE` | — | Resource limit exceeded (memory, CPU) |

# Symbolication

## Using atos
```bash
atos -arch primary_arch -o SampleApp.app.dSYM/Contents/Resources/DWARF/SampleApp -l 0x100000000 0x<address>
```

## Using native build tool
1. Open native build tool → Window → Devices and Simulators → View Device Logs
2. Import the .crash file
3. native build tool symbolicates automatically if dSYM is available

# Analysis Workflow

1. **Identify the crashing thread** — marked as "Crashed" in the report
2. **Read the exception type** — guides the category of bug
3. **Examine the top frames** — find the first frame in project code (not system frameworks)
4. **Check the faulting address** — `0x0` suggests null pointer; small values suggest use-after-free
5. **Look for patterns** — same crash across multiple reports suggests a systemic issue

# crash monitoring Integration

target repository uses crash monitoring for crash reporting:
- Crashes are automatically uploaded with symbolicated stack traces
- crash monitoring groups similar crashes into issues
- Check crash monitoring dashboard for crash frequency and affected versions

# Common target repository Crash Patterns

| Pattern | Stack Hint | Likely Cause | Fix |
|---------|-----------|-------------|-----|
| channel data callback crash | `didReceiveData:` | Data received after channel close | Check `isOpen` before processing |
| UI thread assertion | `__NSCFString` / Main Thread | Background thread UI update | Dispatch to main queue |
| native message to dealloc'd | `objc_msgSend` + zombie | Weak reference not zeroed | Use `weak` property, check nil |
| native UI force-unwrap | `native UI runtime` | `nil` on force-unwrap `!` | Use `guard let` / `if let` |
