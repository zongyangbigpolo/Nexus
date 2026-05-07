---
name: copilot-asset-validation
description: Validate Copilot assets against VS Code docs — file locations, naming, frontmatter, links, cascades.
---

# Copilot Asset Validation Skill

Validates Copilot assets against VS Code documentation and repository conventions.

**Reference**: https://code.visualstudio.com/docs/copilot/copilot-customization

---

## When to Use

⚠️ **MANDATORY** — Run validation after:
- Creating new asset (CREATE mode)
- Modifying existing asset (REVIEW mode)
- Renaming or moving asset
- Any change to asset frontmatter

---

## Validation Scope

### Direct Assets
Assets explicitly changed by user request.

### Related Assets (CASCADE CHECK)
Assets that reference or are referenced by direct assets:

| If Changed | Check These Related Assets |
|------------|---------------------------|
| Agent name | All prompts with `agent:` pointing to it |
| Agent file moved/renamed | All prompts, playbooks, skills referencing it |
| Prompt name | help.md entries |
| Skill name | All agents/playbooks linking to skill |
| Instruction name | All agents/skills referencing instruction |
| Playbook name | Agent's conditional load reference |
| Handoff target | Source agent's handoffs list |

---

## Validation Rules

### 1. File Location Rules

| Asset Type | Required Location | Extension |
|------------|-------------------|-----------|
| Agent | `agents/` | `.agent.md` |
| Prompt | `commands/` | `.md` |
| Instruction | `instructions/` | `.instructions.md` |
| Skill | `skills/<name>/` | `SKILL.md` |
| Playbook | `agent-assets/` | `.playbook.md` |

### 2. Naming Rules

- **File names**: kebab-case (`my-agent.agent.md`)
- **`name:` field**: kebab-case, matches filename stem
- **Skill folders**: kebab-case, matches skill name

### 3. Frontmatter Rules

| Asset | Required Fields | Optional Fields | Notes |
|-------|----------------|-----------------|-------|
| Agent | `name` (kebab), `description`, `tools` | `handoffs`, `argument-hint`, `sampleRequest`, `iconPath`, `responseFormat`, `welcome` | `tools` can be empty `[]` |
| Prompt | `name` (kebab), `description` | `agent`, `argument-hint` | ⚠️ `mode:` is DEPRECATED → use `agent:` |
| Instruction | `description` | `name`, `applyTo` (glob) | `applyTo` enables auto-apply |
| Skill | `name` (kebab), `description` | — | — |

### 4. Link Validation Rules

All markdown links must resolve to existing files.

| From Location | To Instructions | To Playbooks | To Skills |
|---------------|-----------------|--------------|-----------|
| `agents/*.md` | `../instructions/` | `../agent-assets/` | `../skills/<name>/` |
| `commands/*.md` | `../instructions/` | `../agent-assets/` | `../skills/<name>/` |
| `skills/<name>/SKILL.md` | `../../instructions/` | `../../agent-assets/` | `../<other-skill>/` |
| `agent-assets/*.md` | `../instructions/` | (same folder) | `../skills/<name>/` |
| `agent-assets/<folder>/*.md` | `../../instructions/` | `../` | `../../skills/<name>/` |

**Common errors**:
- ❌ `../agent-assets/` from skills (should be `../../agent-assets/`)
- ❌ `skill-name/SKILL.md` from skills (should be `../skill-name/SKILL.md`)

### 5. Reference Integrity Rules

#### Prompt → Agent
If prompt has `agent: X`, then `agents/X.agent.md` must exist.

#### Agent → Playbook
If agent links to a playbook, the referenced file must exist under agent-assets.

#### Agent → Skill
If agent links to a skill, the referenced folder and SKILL.md must exist under skills.

#### Agent Handoffs
Each `handoffs[].agent` value must match an existing agent's `name:` field.

### 6. Discoverability Rules

#### AGENTS.md Sync
All assets must be listed in root `AGENTS.md`:
- Agents in Agents table
- Prompts in Prompts table
- Skills in Skills table
- Playbooks in Playbooks section

#### help.md Sync
- All prompts listed in appropriate category
- All agents listed in Agents table

---

## Validation Workflow

### Step 1: Identify Changed Assets
List all files modified in current session.

### Step 2: Identify Related Assets (CASCADE CHECK)
For each changed asset, find assets that reference it and assets it references. See cascade table above.

### Step 3: Run Validation Checks
For each asset (direct + related), check: File location, Extension, Naming, Frontmatter, Deprecated attrs, Links valid, References valid, AGENTS.md listed, help.md listed.

### Step 4: Fix Issues
List issues with file paths → Propose fixes → Apply (with approval) → Re-run validation.

### Step 5: Final Report
Summary table (Direct/Related assets: Checked, Passed, Failed) + Issues Fixed + Remaining Issues.

---

## 7. Relationship Integrity Rules

Validate that all cross-asset references form a consistent graph.

### 7.1 Handoff Target Validation

For each agent's `handoffs[].agent` value:
- Target agent file `agents/{name}.agent.md` MUST exist
- Target agent's `name:` field MUST match the handoff target value
- Report: orphaned handoff targets (pointing to non-existent agents)

### 7.2 Skill Consumer Validation

For each skill referenced in agent/playbook markdown links:
- Folder `skills/{name}/` MUST exist
- `SKILL.md` MUST exist inside that folder
- Report: orphaned skill references (skill folder deleted but agents still link to it)

### 7.3 Orphaned Asset Detection

| Asset Type | Orphaned When |
|------------|---------------|
| Skill | No agent, playbook, or prompt links to it |
| Playbook | No agent references it |
| Instruction (on-demand) | No agent or skill references it |

Report orphaned assets as warnings (not errors) — they may be intentionally standalone.

### 7.4 Bidirectional Handoff Consistency

For key handoff pairs, verify return path exists:

| Forward | Expected Return |
|---------|-----------------|
| dev-coordinator → developer | developer → dev-coordinator |
| bugfix → dev-coordinator | dev-coordinator has no mandatory return |
| developer → security-engineer | security-engineer → developer |

### 7.5 Handoff Protocol Compliance

Verify handoff prompts follow [handoff-protocol](../../instructions/handoff-protocol.instructions.md):
- Contains action description (not empty or generic)
- Does not duplicate receiving agent's full workflow

### 7.6 Contract Section Validation

For agents with `## Input Contract` or `## Output Contract` sections:
- Input Contract fields should match what the source agent actually provides in its handoff prompt
- Output Contract fields should match what the receiving agent expects
- Report mismatches as warnings

---

## Error Recovery

| Error | Action |
|-------|--------|
| Broken link found | Search for correct target, propose fix |
| Missing asset reference | Ask user: create asset or remove reference? |
| Duplicate name | Rename one, update all references |
| Deprecated `mode:` attr | Replace with `agent:` |
| Asset not in AGENTS.md | Add entry to appropriate table |
| Asset not in help.md | Add entry to appropriate section |
| Orphaned handoff target | Remove handoff or create missing agent |
| Orphaned skill (no consumers) | Warn — verify if intentionally standalone |
| Handoff protocol violation | Fix prompt text to include required fields |
