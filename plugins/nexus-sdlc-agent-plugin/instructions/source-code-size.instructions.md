---
name: source-code-size
description: File size and complexity constraints for source code. Enforces maintainability limits.
applyTo: "**/*.{cs,ts,tsx,js,jsx,py,go,java,swift,kt,rs,cpp,c,h,hpp}"
---

# Source Code Size Constraints

## Mandatory Limits

All constraints apply independently — a file violating **any** limit must be refactored.

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| **Lines per file** | ≤300 lines | Maintainability, readability |
| **File size** | ≤30KB | Context window, review efficiency |
| **Function/method length** | ≤50 lines | Single responsibility, testability |
| **Class length** | ≤500 lines | Cohesion, modularity |
| **Nesting depth** | ≤4 levels | Readability, complexity |

## What Counts

- **Lines**: All non-blank, non-comment lines
- **File size**: Raw file size in bytes
- **Function length**: Lines from signature to closing brace (including internal comments)

## When Limits Are Exceeded

### If file exceeds 300 lines or 30KB

**Before proceeding with any changes**:

1. **Identify split candidates**:
   - Logical groupings of functionality
   - Classes/modules that can be extracted
   - Utility functions that belong elsewhere

2. **Propose breakdown**:
   ```markdown
   | Current File | Lines | Split Into | Rationale |
   |--------------|-------|------------|-----------|
   | UserService.cs | 450 | UserService.cs, UserValidator.cs, UserMapper.cs | Separate validation and mapping |
   ```

3. **Get approval** before splitting

4. **Split the file** following these patterns:
   - One class per file (for OOP languages)
   - Group related functions (for functional style)
   - Keep public API in main file, extract helpers

### If function exceeds 50 lines

1. **Extract helper functions** for:
   - Repeated logic
   - Distinct steps in a workflow
   - Complex conditionals

2. **Use meaningful names** that describe what the extracted function does

3. **Keep nesting shallow** — prefer early returns

## Exceptions

These files may exceed limits with justification:

| File Type | Allowed Exception | Justification Required |
|-----------|-------------------|----------------------|
| Generated code | Any size | Mark as generated, don't modify |
| Data files (constants, configs) | >300 lines | Document purpose |
| Test files | >300 lines | Group by feature under test |
| Migration files | >50 line functions | Database migrations often atomic |

## Validation Checklist

Before committing changes:

- [ ] All modified files ≤300 lines
- [ ] All modified files ≤30KB  
- [ ] All new/modified functions ≤50 lines
- [ ] Nesting depth ≤4 levels
- [ ] If exceeded: split completed OR exception documented

