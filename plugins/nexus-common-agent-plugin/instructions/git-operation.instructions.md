---
name: git-operation
description: Branch naming and commit message conventions. Attach via "Add Context > Instructions" when working with Git.
applyTo: "**/*"
---

# Git Operation Conventions

Static rules for branch names and commit messages. For step-by-step workflows, see [git-workflow](../skills/git-workflow/SKILL.md) skill.

## Branch Naming

### Format
```
feature/{JIRA-ID}-PascalCaseBranchName
bugfix/{JIRA-ID}-PascalCaseBranchName
```

### Rules
- **Prefix**: `feature/` for Stories, `bugfix/` for Bugs
- **JIRA-ID**: Ticket identifier (e.g., `APP-12345`, `ENG-1514`)
- **Separator**: Single hyphen `-` after JIRA-ID
- **Name**: PascalCase, derived from JIRA title (3-5 words max)
- **User override**: Honor explicit user request for branch type

### Examples
| ✅ Valid | ❌ Invalid |
|----------|-----------|
| `feature/APP-12345-EnableBrowserPolicies` | `APP-12345-EnableBrowserPolicies` (no prefix) |
| `bugfix/AAUTH-5193-FixAppProtection` | `feature/APP-12345-enable-browser` (not PascalCase) |
| `feature/ENG-1514-AddTunnelExclusion` | `feature/SPA12345-Enable` (no hyphen after ID) |

---

## Commit Message

### Format
```
{JIRA-ID} {Description at least 10 chars}
```

### Rules
1. JIRA-ID at beginning
2. Single space after JIRA-ID
3. Description ≥10 characters
4. Present tense ("Add feature" not "Added feature")
5. JIRA ID **must match** branch JIRA ID

### Regex Pattern
```regex
^(APP|APP2|WSSUCE|WSSHELP|CTXBV|ENG|ATH|CC|CCOPS|CCUI|CINC|CINF|COUT|LUI|UNICON|CGS|CGSHELP|SPAHELP|DPS|RDXDEV|AAUTH|AAUTHHELP)-\d{1,}\s+.{10,}
```

See [jira-ops](jira-ops.instructions.md) for full project code reference.

### Examples
| ✅ Valid | ❌ Invalid |
|----------|-----------|
| `APP-12345 Enable browser policies` | `APP-12345Enable browser` (no space) |
| `ENG-1514 Add tunnel exclusion feature` | `Enable browser policies` (no JIRA-ID) |
| `AAUTH-5193 Fix app protection validation` | `APP-12345 Fix` (too short) |

---

## AI-Generated Marker

Append ` [AI-Generated]` for AI-generated code:
```
APP-12345 Implement authentication endpoint [AI-Generated]
```

---

## Best Practices

### Branch
- ✅ Create from latest `master`
- ✅ Delete after merge
- ✅ `feature/` for enhancements, `bugfix/` for defects
- ❌ Never merge directly to `master` — always PR

### Commit
- ✅ JIRA ID must match branch JIRA ID
- ✅ Atomic commits (one logical change)
- ❌ Never use placeholder `APP-00000` on named branch

---

## Related

- [git-workflow](../skills/git-workflow/SKILL.md) — Step-by-step procedures
- [code-submission](../skills/code-submission/SKILL.md) — PR creation
