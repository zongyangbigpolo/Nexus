# AGENTS.md Template

Minimal required structure for `AGENTS.md` files. Must conform to https://agents.md.

Use this template to **create new** or **augment existing** AGENTS.md files.

---

## Required Sections (Minimum)

```markdown
# AGENTS.md

{One paragraph: what this repo does and its primary purpose.}

## Project Overview

**Tech Stack**: {Language}, {Framework}, {Database if any}
**Architecture**: {e.g., Microservice, Monolith, MFE}

> **Deep architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system diagrams, component details, data stores, deployment, and security considerations.

## Development

### Build & Run
```bash
{install command}
{build command}
{run command}
{test command}
```

### Code Conventions
- {Key convention 1}
- {Key convention 2}

### Testing
**Framework**: {e.g., Jest, xUnit, pytest}
**Run tests**: `{test command}`
**Coverage requirement**: {e.g., 80% for new code}

**Test patterns**:
- {Where tests live: e.g., `*.spec.ts` next to source}
- {Naming convention: e.g., `describe('ComponentName', () => ...)`}
- {Key pattern: e.g., mock external dependencies, use fixtures}
```

---

## Optional Sections

Add these only if relevant to your project:

### Key Components (if complex structure)
```markdown
**Key Components**:
- `{folder/}` — {description}
```

### Prerequisites (if non-obvious)
```markdown
### Prerequisites
- {Tool} version {X.X}
```

### Copilot Assets (if using shared agents)
```markdown
## Copilot Assets
| Prompt | Description |
|--------|-------------|
| `/{name}` | {purpose} |
```

### External Dependencies (if integrating with services)
```markdown
## External Dependencies
- {Service}: {purpose}
```

### API Surface (if service exposes or consumes APIs)

Documents how this service integrates with other services. Discovered by scanning controller routes (exposed) and HTTP/gRPC clients (consumed).

```markdown
## API Surface

### Exposed APIs

| Endpoint | Method | Auth | Callers |
|----------|--------|------|---------|
| `{/path}` | {GET/POST/...} | {Auth type} | {Service(s) that call this} |

### Consumed APIs

| Service | Client Class | Endpoints Called | Auth |
|---------|--------------|-----------------|------|
| {Service name} | `{ClientClass}` | `{/path}` | {Auth type} |
```

**Discovery hints for agents**:
- **Exposed**: Scan controller/handler route attributes (`[Route]`, `[HttpGet]`, gRPC service definitions)
- **Consumed**: Scan `HttpClient`/`IHttpClientFactory` registrations, gRPC client stubs, service client classes
- **Cross-repo callers**: Search other workspace repos for references to this service's endpoints

### Architecture Reference (recommended)

If you want a dedicated section beyond the Project Overview callout, add additional context about your architecture documentation.

`ARCHITECTURE.md` follows the [architecture.md](https://architecture.md/) standard and contains:
- Project structure and directory layout
- High-level system diagram (C4/Mermaid)
- Core components with technologies and responsibilities
- Data stores and external integrations
- Deployment & infrastructure (cloud, CI/CD, monitoring)
- Security considerations (auth, encryption)
- Development environment setup

Generate with: `@architect mode=system topic="Generate ARCHITECTURE.md"` or via `/agentsmd` (auto-detects missing file).

### Team & Ownership (optional)
```markdown
## Team & Ownership
- **Team**: {name}
- **JIRA**: {project key}
```

---

## Section Checklist

| Section | Required | When to Add |
|---------|----------|-------------|
| Project Overview | ✅ | Always |
| Development | ✅ | Always |
| Code Conventions | ✅ | Always |
| Testing | ✅ | Always |
| Architecture Reference | ❌ | Optional dedicated section (link to ARCHITECTURE.md) |
| Key Components | ❌ | Complex folder structure |
| Prerequisites | ❌ | Non-standard tools |
| Copilot Assets | ❌ | Using shared Copilot plugin assets |
| External Dependencies | ❌ | External API integrations |
| API Surface | ❌ | Service exposes or consumes APIs |
| Team & Ownership | ❌ | Team visibility needed |

## Usage

### New AGENTS.md

1. Copy the **Required Sections** block into your repo's `AGENTS.md`
2. Replace all `{...}` placeholders with project-specific details
3. Add any **Optional Sections** that apply; remove ones that don't

### Existing AGENTS.md

1. Run `/agentsmd` in Copilot Chat to check alignment
2. Update sections as needed to match template structure

> Keep overall structure aligned with https://agents.md so shared tools can read it.
