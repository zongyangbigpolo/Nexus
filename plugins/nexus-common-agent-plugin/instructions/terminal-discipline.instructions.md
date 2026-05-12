---
name: terminal-discipline
description: Rules for managing terminals and long-running processes. Attach via "Add Context > Instructions" when running servers or simulators.
applyTo: "**/*"
---

# Terminal discipline

## Long-running processes
Treat commands like `dotnet run`, `npm start`, simulators, and local servers as long-running processes.
- Never run ad-hoc commands in the same terminal running a server.
- Never stop/interrupt a server terminal unless explicitly requested.

## Multi-terminal workflow
- Use a dedicated terminal for each long-running process.
- Use a separate terminal for verification/health checks, curl requests, logs, and one-off commands.

## VS Code terminal management
- If you need additional terminals, create them via VS Code (`workbench.action.terminal.new`).
- Prefer naming terminals by purpose (example: `APP-Proxy-Server`, `FFS-Simulator`, `Verification-Terminal`).

## Safety
- Avoid `Ctrl+C` in server terminals.
- Avoid kill/stop commands unless explicitly approved.
