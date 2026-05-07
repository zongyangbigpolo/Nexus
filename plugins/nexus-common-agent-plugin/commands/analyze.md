---
name: analyze
description: Analyze any technical input (configs, logs, specs, screenshots) using MECE framework
agent: analyzer
---

# Universal Technical Analysis

Analyze any technical artifacts using structured MECE methodology.

## Inputs

- **Type**: ${input:type:auto}
  - `auto` = auto-detect from input (default)
  - `infra` = infrastructure/configuration analysis
  - `logs` = log/error analysis
  - `security` = security assessment
  - `cost` = cost/resource analysis
  - `code` = code review
- **Focus**: ${input:focus:} (optional specific concern)

---

## Supported Inputs

| Input | Analysis Type |
|-------|--------------|
| Config files (`.conf`, `.xml`) | Infrastructure |
| Log files, stack traces | Root Cause |
| Feature specs, designs | Security |
| Azure resources, costs | Cost |
| Source code | Code Quality |
| Screenshots | Visual |

Attach files, specify type/focus. May route to: `architect`, `bugfix`, `azure-ops`, `developer`.

---

## Usage

```
/analyze type=infra                         # attach config files
/analyze type=logs focus="auth failures"    # attach logs
/analyze type=security                      # attach spec
/analyze type=cost                          # provide subscription
```

After analysis: create JIRAs, publish to Confluence, or request specialist deep-dive.
