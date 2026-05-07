---
name: ascii-diagrams
description: Use pure ASCII characters for text diagrams. No Unicode box-drawing symbols.
applyTo: "**"
---

# ASCII Diagram Rules

## Use pure ASCII only

When generating text-based diagrams (architecture, flowcharts, sequence, handoff graphs), use **only pure ASCII characters**.

### Allowed characters

| Purpose | Characters |
|---------|-----------|
| Corners | `+` |
| Horizontal lines | `-` |
| Vertical lines | `|` |
| Arrows right/left | `>`, `<` |
| Arrows down/up | `v`, `^` |
| Text | Any printable ASCII |

### Forbidden characters

Do **NOT** use Unicode box-drawing or arrow symbols:
`┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │ ═ ║ ╔ ╗ ╚ ╝ ► ◄ ▼ ▲ ───► ◄─── ╌ ╎`

### Why

Unicode box-drawing characters render with inconsistent widths across fonts, terminals, Confluence, and other tools — causing diagrams to misalign.

### Example

Good:
```
+-------------+         +-----------------+
|  architect  |-------->|   spec-author   |
+-------------+         +-----------------+
      |                        |
      v                        v
+-------------+         +-----------------+
|  azure-ops  |<--------|   developer     |
+-------------+         +-----------------+
```

Bad:
```
┌─────────────┐         ┌─────────────────┐
│  architect  │────────►│   spec-author   │
└─────────────┘         └─────────────────┘
```
