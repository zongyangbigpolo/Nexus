---
name: copyright-headers
description: Copyright header rules for source code files. Ensures Citrix copyright notice is present and year is current.
applyTo: '**/*.{cs,ts,tsx,js,jsx,py,go,java,swift,kt,rs,cpp,c,h,hpp,sql,ps1,sh,bash}'
---

# Copyright Headers

## Rule: All source code files MUST have Citrix copyright header

### For NEW files

Add copyright header as the **first line** (as a comment):

```
Copyright © {CURRENT_YEAR}. Citrix Systems, Inc. All Rights Reserved. Confidential & Proprietary.
```

**Current year**: Use the current calendar year from the system date context (e.g., 2026). Do not hardcode a specific year in instruction text.

### For EXISTING files

1. **Check line 1** for existing copyright header
2. **If no header exists**: Add the header (same as new file)
3. **If header exists with single year** (e.g., `2024`):
   - If year is current → Do nothing
   - If year is older → Change to range: `2024-{CURRENT_YEAR}`
4. **If header exists with year range** (e.g., `2020-2024`):
   - If end year is current → Do nothing
   - If end year is older → Update end year: `2020-{CURRENT_YEAR}`

### Comment syntax by language

| Language                                                         | Comment Syntax             |
| ---------------------------------------------------------------- | -------------------------- |
| C#, Java, TypeScript, JavaScript, Go, Swift, Kotlin, Rust, C/C++ | `// Copyright © ...`       |
| Python                                                           | `# Copyright © ...`        |
| PowerShell                                                       | `# Copyright © ...`        |
| Shell/Bash                                                       | `# Copyright © ...`        |
| SQL                                                              | `-- Copyright © ...`       |
| HTML/XML                                                         | `<!-- Copyright © ... -->` |
| CSS                                                              | `/* Copyright © ... */`    |

### Decision flowchart

```
Is this a NEW file?
├─► YES: Add "Copyright © {CURRENT_YEAR}. Citrix..."
└─► NO: Check line 1 for copyright
         │
         Does copyright exist?
         ├─► NO: Add "Copyright © {CURRENT_YEAR}. Citrix..."
         └─► YES: Check year
                  │
                  Is year/end-year = {CURRENT_YEAR}?
                  ├─► YES: Do nothing
                  └─► NO: Update to include {CURRENT_YEAR}
                           - Single year (2024) → 2024-{CURRENT_YEAR}
                           - Range (2020-2024) → 2020-{CURRENT_YEAR}
```

### Files to SKIP

Do not add/modify copyright headers in:

- Generated files (`.designer.cs`, `.g.cs`, etc.)
- Third-party/vendor code
- Configuration files (`.json`, `.yaml`, `.xml`)
- Test data files
- Documentation (`.md`)
- Lock files (`package-lock.json`, etc.)
