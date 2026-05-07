---
name: repository-context-discovery
description: Discover repository context by reading AGENTS.md and scanning project structure. Essential first step before any code-related work.
---

# Repository Context Discovery Skill

## Purpose

Systematically gather repository context before any code-related work:
1. Read AGENTS.md for documented conventions
2. Scan project files for technology stack
3. Examine existing code patterns
4. Output structured context summary

## When to Use

| Agent | Trigger |
|-------|---------|
| developer | Before implementing any feature |
| bugfix | Before investigating any bug |
| architect | Before creating architecture docs |
| spec-author | When creating specs for existing codebase |
| code-review | Before reviewing PR |

## Execution Steps

### Step 1: Read Root AGENTS.md

**Location**: Repository root (`./AGENTS.md`)

**Extract**:

| Section | Information |
|---------|-------------|
| Project Overview | Name, purpose, business domain |
| Tech Stack | Languages, frameworks, databases |
| Architecture | Style (monolith/microservices), layers |
| Code Organization | Folder structure, naming conventions |
| Build & Test | Commands, coverage targets |
| Dependencies | External services, libraries |
| Sub-projects | Links to nested AGENTS.md files |

**If AGENTS.md missing or incomplete** → proceed to Step 2.

### Step 2: Scan Project Files

Detect technology stack from project files:

| File | Indicates |
|------|-----------|
| `*.csproj`, `*.sln` | .NET / C# |
| `package.json` | Node.js / JavaScript / TypeScript |
| `tsconfig.json` | TypeScript |
| `jsconfig.json` | JavaScript | 
| `requirements.txt`, `pyproject.toml` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle` | Java |
| `Dockerfile` | Containerized |
| `terraform/*.tf` | Infrastructure as Code |

### Step 3: Examine Configuration Files

| File | Extract |
|------|---------|
| `tsconfig.json` | TypeScript config, strict mode |
| `jsconfig.json` | JavaScript config, strict mode |
| `appsettings.json` | .NET configuration structure |
| `.eslintrc*` | Linting rules, code style |
| `.prettierrc` | Formatting rules |
| `jest.config.*` | Test framework config |
| `docker-compose.yml` | Service dependencies |

### Step 4: Analyze Existing Code Patterns

**Sample existing files to discover**:

| Pattern | How to Discover |
|---------|-----------------|
| Naming conventions | Read 2-3 existing files of same type |
| Folder structure | List directories, identify layers |
| Test patterns | Read existing test files |
| Error handling | Search for try/catch, error classes |
| Logging | Search for logger usage |
| DI patterns | Look for constructors, service registration |

### Step 5: Check Sub-project AGENTS.md

If root AGENTS.md references sub-projects:
```
./services/api/AGENTS.md
./packages/shared/AGENTS.md
```
Read relevant sub-project AGENTS.md for component-specific context.

## Output Format

```markdown
## Repository Context Summary

### Project
- **Name**: {project name}
- **Domain**: {business domain}
- **Type**: {monolith / microservices / library}

### Technology Stack
| Layer | Technology |
|-------|------------|
| Language | {C#, TypeScript, JavaScript,Python, etc.} |
| Framework | {ASP.NET Core, Express, FastAPI, etc.} |
| Database | {SQL Server, PostgreSQL, MongoDB, etc.} |
| Testing | {xUnit, Jest, pytest, etc.} |
| CI/CD | {GitHub Actions, Azure DevOps, etc.} |

### Code Organization
```
src/
├── Controllers/     # API endpoints
├── Services/        # Business logic
├── Repositories/    # Data access
└── Models/          # Domain models
```

### Conventions
| Convention | Pattern |
|------------|---------|
| Class naming | PascalCase |
| File naming | {pattern} |
| Test naming | {pattern} |
| Branch naming | {pattern} |

### Build & Test
| Command | Purpose |
|---------|---------|
| `{build cmd}` | Build project |
| `{test cmd}` | Run tests |
| `{lint cmd}` | Check code style |

### Key Dependencies
| Dependency | Purpose |
|------------|---------|
| {name} | {what it does} |

### Notes
- {any special considerations}
- {gotchas or warnings}
```

## Stack-Specific Patterns

### .NET / C#
```csharp
// Look for:
// - Program.cs / Startup.cs for DI setup
// - appsettings.json structure
// - Controllers/ Services/ Repositories/ pattern
// - xUnit / NUnit / MSTest for testing
```

### TypeScript / JavaScript /Node.js
```typescript
// Look for:
// - src/ structure
// - tsconfig.json for strict mode
// - Jest / Mocha / Vitest for testing
// - ESLint / Prettier config
```

### Python
```python
# Look for:
# - src/ or package structure
# - pyproject.toml / setup.py
# - pytest for testing
# - Black / Ruff for formatting
```

### Go
```go
// Look for:
// - cmd/ pkg/ internal/ structure
// - go.mod dependencies
// - *_test.go files
// - Standard library patterns
```

## Error Handling

| Error | Action |
|-------|--------|
| No AGENTS.md | Proceed with file scanning |
| No project files | Ask user for technology stack |
| Multiple stacks | Identify primary, note others |
| Conflicting info | Ask user to clarify |

## Integration with Agents

### Developer Agent
```markdown
Use [repository-context-discovery](../repository-context-discovery/SKILL.md) 
in Phase 0 before any implementation.
```

### Bugfix Agent
```markdown
Use [repository-context-discovery](../repository-context-discovery/SKILL.md) 
to understand codebase structure before investigation.
```

### Architect Agent
```markdown
Use [repository-context-discovery](../repository-context-discovery/SKILL.md) 
to understand existing architecture before proposing changes.
```
