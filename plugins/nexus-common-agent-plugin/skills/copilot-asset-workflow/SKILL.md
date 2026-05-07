---
name: copilot-asset-workflow
description: CREATE and REVIEW workflows for Copilot assets — gather requirements, create, analyze, fix.
---

# Copilot Asset Workflow Skill

Workflows for creating and reviewing Copilot assets.

**Validation**: After any workflow, run [copilot-asset-validation](../copilot-asset-validation/SKILL.md).

---

## CREATE Mode

### Step 1: Verify Uniqueness

Check these locations for existing asset with same name:
- `agents/{name}.agent.md`
- `commands/{name}.md`
- `instructions/{name}.instructions.md`
- `skills/{name}/SKILL.md`

**If exists**: Switch to REVIEW mode or ask for different name.

### Step 2: Gather Requirements

Ask: What does it do? When should it activate? Which MCP tools? Related agents for handoffs? External dependencies?

### Step 3: Create Asset

Follow conventions from root `AGENTS.md`:
- **Names**: kebab-case
- **Frontmatter**: Valid YAML with required fields
- **Size limits**: Agents <150 lines, Skills <250 lines
- **Agent structure**: Role, Skills (optional), Objective, Workflow, Constraints, Error Recovery, Handoffs

> **Recommended agent section order**: Frontmatter → Role → Skills (if any) → Objective → Workflow → Constraints → Error Recovery → Handoffs. Following this order improves readability and ensures consistent layer labeling across all agents.

### Step 4: Create Supporting Assets

| If | Then Create |
|----|-------------|
| New agent | Command file in `commands/{name}.md` |
| Agent >100 lines | Playbook in `agent-assets/{name}.playbook.md` |
| Reusable workflow | Skill in `skills/{name}/SKILL.md` |

### Step 5: Update Documentation

Add to `AGENTS.md`:
- Prompts table
- Agents table
- Skills table (if created)
- Playbooks section (if created)

### Step 6: Validate

**→ Run [copilot-asset-validation](../copilot-asset-validation/SKILL.md)**

---

## REVIEW Mode

### Step 1: Read Context

1. Read root `AGENTS.md` for conventions
2. Read target asset(s)
3. Read related assets (playbook, skills, instructions, prompts)

### Step 1.5: Deep Analysis (target=all)

Use tree-walking approach:
1. Start from `/start` → router → all handoff targets
2. Follow: agent → playbook → skills → instructions
3. Check cross-references between assets
4. Verify help.md contains all prompts/agents

### Step 2: Quality Analysis

#### Size Limits
| Asset Type | Max Lines | Action if Exceeded |
|------------|-----------|-------------------|
| Agent | 150 | Move to playbook |
| Playbook | 500 | Split or create skills |
| Skill | 250 | Compress or split |
| Instruction | 100 | Keep minimal |
| Prompt | 50 | Keep minimal |

#### Duplication Check
- Agent duplicates instructions? → Replace with link
- Agent duplicates playbook? → Remove from agent
- Multiple agents share workflow? → Extract to skill

#### Decomposition Check
Evaluate whether an asset should be split into smaller, focused units:

| Signal | Recommendation |
|--------|---------------|
| Agent handles >2 unrelated responsibilities | Split into separate agents with handoffs |
| Agent workflow has >5 phases | Extract phases into skills or sub-agents |
| Agent has >8 handoff targets | May be doing too much — consider narrowing scope |
| Playbook contains reusable generic logic | Extract to skill (shared across agents) |
| Playbook >300 lines with distinct sections | Split into domain-specific playbooks |
| Skill serves multiple unrelated purposes | Split into focused skills |

**Single Responsibility Principle for agents**: Each agent should have one clear role. If you can describe the agent with "and" (e.g., "manages JIRA **and** deploys to Azure"), it likely needs decomposition.

#### Connectivity Check
| From | Should Link To |
|------|---------------|
| Agent | Playbook, Skills, Instructions, Handoffs |
| Prompt | Agent (frontmatter `agent:` field) |
| Playbook | Skills, Instructions |
| Skill | Instructions (if security-related) |

#### Agent Structure Check
- [ ] Role with conditional playbook load
- [ ] Objective (clear success criteria)
- [ ] Execution Workflow (phases)
- [ ] Constraints (Always/Never/When Uncertain)
- [ ] Error Recovery table
- [ ] Handoffs (if applicable)

#### Prompt Quality Check
Evaluate asset as an LLM prompt (all asset types are prompts):
- [ ] **Clarity**: Specific, unambiguous, actionable instructions
- [ ] **Grounding**: References concrete artifacts (files, tools, schemas) not abstractions
- [ ] **Token efficiency**: Compact, no redundancy, optimal information density
- [ ] **Constraint completeness**: Always/Never/When Uncertain fully covered
- [ ] **Output spec**: Clear expected format, schema, or examples
- [ ] **Failure coverage**: Error recovery for realistic scenarios
- [ ] **Technique fit**: Appropriate techniques applied (see [prompt-techniques](../prompt-techniques/SKILL.md))
- [ ] **Injection safety**: Boundary markers, refusal patterns for sensitive operations

### Step 3: Output Analysis

Output: Analysis Summary table (asset, lines, playbook, skills, prompt, issues), Issues by Priority (🔴/🟡/🟢), Fix Plan table.

### Step 4: Apply Fixes

1. Apply in priority order (Critical → Medium → Low)
2. Update AGENTS.md if structure changed
3. **→ Run [copilot-asset-validation](../copilot-asset-validation/SKILL.md)**

---

## Quality Checklist

Before completing any mode:

- [ ] Names are kebab-case
- [ ] Frontmatter is valid YAML
- [ ] No secrets/tokens in content
- [ ] All links resolve to existing files
- [ ] Error Recovery table present (agents)
- [ ] AGENTS.md updated
- [ ] No orphaned assets
- [ ] Prompt quality passed (clarity, grounding, token efficiency)

---

## Integration

Load this skill when user invokes `/copilot-asset` with `mode=create` or `mode=review`.
Always run [copilot-asset-validation](../copilot-asset-validation/SKILL.md) after completing workflow.
