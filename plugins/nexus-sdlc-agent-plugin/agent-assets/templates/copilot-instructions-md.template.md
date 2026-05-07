# copilot-instructions.md Template

Template for `.github/copilot-instructions.md` — the primary VS Code Copilot instructions file.

Keep this file **short**. It should point to `AGENTS.md` and `ARCHITECTURE.md` for details, not duplicate them.

---

## Template

```markdown
# GitHub Copilot Instructions for {Service Name}

## Primary Instructions

Read and follow the guidelines in `AGENTS.md` at the repository root for:
- Service overview and tech stack
- Coding patterns and conventions
- Authentication handling
- Caching guidelines
- Common pitfalls to avoid

## Architecture

For system diagrams, component details, data stores, deployment, and security considerations, see [ARCHITECTURE.md](../ARCHITECTURE.md).

## Quick Reminders

- {Key convention 1 — e.g., async pattern}
- {Key convention 2 — e.g., how to get tenant context}
- {Key convention 3 — e.g., cache key format}
- Never log sensitive data (crypto keys, tokens)
- Follow [API guidelines]({link}) for new APIs
```

---

## Usage Notes

- The "Quick Reminders" should be 3-5 most-frequently-needed conventions — details live in AGENTS.md
- VS Code loads this file automatically for all Copilot interactions in the repo
- This file is loaded **in addition to** AGENTS.md (both are used by Copilot)
