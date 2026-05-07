---
name: prompt-techniques
description: Prompt engineering techniques catalog — technique selection, prompt patterns, agentic patterns, optimization methodology, multi-turn design, RAG guidance, model-aware tuning.
---

# Prompt Engineering Techniques

Reference skill for writing, reviewing, and optimizing prompts. Load when creating or improving prompts and agent instructions.

## Technique Selection Matrix

| Task / Problem | Technique | When to Apply | Key Rule |
|----------------|-----------|---------------|----------|
| Complex reasoning, multi-step logic | **Chain-of-Thought (CoT)** | Model makes logical errors or skips steps | Add "Think step by step" or explicit reasoning scaffold |
| Model doesn't match output format | **Few-shot examples** (2–5) | Zero-shot produces wrong structure | Minimal, representative examples; no secrets/PII |
| Simple factual or well-defined task | **Zero-shot** | Task is unambiguous | Keep prompt short; add constraints only |
| Agent needs consistent persona | **Role prompting** | System-level persona required | Define role in first 1–2 lines; keep stable |
| Preventing unwanted behaviors | **Constraint-based / negative prompting** | Risk of hallucination, scope creep | Explicit MUST NOT / NEVER rules; critical constraints first |
| Task has >3 sub-tasks or branches | **Decomposition** | Single prompt too complex | Split into sequential steps with clear handoff |
| Need higher reliability | **Self-consistency** | Single-pass accuracy insufficient | Multiple completions, consensus answer |
| Output consumed by automation | **Structured output + schema** | JSON/YAML must be parseable | Schema with required fields; repair loop on failure |
| Long context with buried details | **Context curation** | Relevant info diluted by noise | Summarize, reorder (important first), extract |
| Model must verify its own work | **Self-verification / reflection** | High-stakes output | Add "Review your answer for errors" step |

## Prompt Patterns Catalog

Advanced patterns for designing new prompts:

| Pattern | Purpose | When to Use | Example |
|---------|---------|-------------|---------|
| **Cognitive Verifier** | Model asks clarifying questions before answering | Ambiguous input; high cost of wrong assumption | "Before answering, list what you need to know and ask" |
| **Template / Fill-in-the-Blank** | Enforce consistent output structure | Repeated tasks needing identical format | Provide template with `{placeholders}` to fill |
| **Flipped Interaction** | Model interviews the user | Requirements gathering; discovery phase | "Ask me questions one at a time until you have enough context" |
| **Audience Adaptation** | Adjust detail level and vocabulary | Multiple audiences for same content | "Explain as if the reader is a {junior dev / architect / PM}" |
| **Persona Switching** | Dynamic role changes within workflow | Multi-phase tasks needing different expertise | "Phase 1: Act as security reviewer. Phase 2: Act as developer." |
| **Chain of Density** | Iteratively compress while preserving detail | Summarization tasks | "Rewrite in fewer words, keeping all key facts. Repeat 3 times." |
| **Guardrail Sandwich** | Constraints at start AND end of prompt | Critical safety/format rules that must not be skipped | Put MUST NOT rules in preamble and repeat before output instruction |

## Prompt Construction Best Practices

1. **Instruction ordering**: Critical constraints at beginning AND end (primacy + recency effect).
2. **Be specific, not verbose**: "List exactly 3 risks" > "Please think about risks".
3. **Use delimiters**: Separate instructions from data with `---`, XML tags, or headers.
4. **One task per prompt**: Multiple tasks → split or add explicit routing.
5. **Define output first**: State expected format before describing the task.
6. **Explicit negatives**: "Do X" AND "Never Y" — be explicit about both.
7. **Repeat key rules**: Security/format constraints benefit from being stated twice.

## Prompt Quality Checklist

- [ ] Single clear task per prompt
- [ ] Role defined in 1–2 lines (if needed)
- [ ] Constraints ordered: critical first, repeated at end
- [ ] Input boundaries: authoritative vs untrusted
- [ ] Examples: minimal (2–3), representative, no secrets
- [ ] Output format: explicitly specified with example structure
- [ ] Failure mode: defined behavior when context is missing
- [ ] Token budget: estimated and reasonable
- [ ] Tested: at least 3 golden inputs produce expected output

## Prompt Optimization Methodology

1. **Baseline**: Run 5–10 inputs, score outputs (pass/fail + quality 1–5).
2. **Categorize failures**: wrong format, missing info, hallucination, instruction violation.
3. **Targeted fix** (one change per iteration):
   - Wrong format → explicit format spec or few-shot example
   - Missing info → add context or decompose task
   - Hallucination → grounding constraint + self-verification
   - Instruction violation → move constraint higher, repeat, add negative rule
4. **Re-evaluate**: Same inputs + 2–3 new edge cases.
5. **Stop**: All golden tests pass; no regressions; token count reasonable.

> **Anti-pattern**: Overfitting to eval set. Reserve 20% as hold-out.

## RAG / Retrieval-Augmented Prompting

When prompts work with retrieved context (search results, file contents, API responses):

### Context Formatting
- **Separate retrieved content from instructions** using clear delimiters (`---`, `<context>` tags).
- **Label each source** — file path, search query, API endpoint — so the model can attribute.
- **Order by relevance**: most relevant chunks first; model attends more to the start.
- **Truncate, don't dump**: include only relevant sections; summarize long files.

### Handling Contradictions
- If sources contradict: state both, flag the conflict, let the user decide.
- If context is missing: state what's missing and what assumption you're using.
- Never invent facts to fill gaps — prefer "I don't have enough context" over hallucination.

### Grounding Constraints
- "Base your answer ONLY on the provided context."
- "If the answer is not in the context, say so explicitly."
- "Quote the relevant section when making claims."

## Multi-turn Conversation Design

### Context Window Management

| Strategy | When | How |
|----------|------|-----|
| **Progressive disclosure** | Complex workflow with phases | Context for current phase only; load on demand |
| **Summarization gates** | Conversation exceeds ~50% window | Summarize completed work before continuing |
| **Anchor repetition** | Critical rules must persist | Repeat key constraints in agent definition |
| **State handoff** | Handing off between agents | Pass structured state, not raw history |

### Anti-patterns
- Dumping entire files when only a section is relevant.
- Assuming model remembers details from 10+ turns ago.
- Not re-stating constraints after long conversations.
- Mixing unrelated tasks in one conversation thread.

## Model-Aware Optimization

**Default**: Provider-agnostic prompts. **Optimize**: Tune for specific model only when default fails.

### Provider-Agnostic Defaults
- Clear, imperative instructions ("Do X", "Never Y")
- Structured output with explicit format specification
- Constraints as enumerated rules (MUST/MUST NOT)
- Examples with clear input→output mapping
- Explicit error/fallback behavior

### Model-Specific Tuning (only when needed)

| Aspect | GPT-4 / o-series | Claude | Gemini |
|--------|------------------|--------|--------|
| System message | Strong adherence; put core rules there | Strong; benefits from XML tags | Supported; keep concise |
| Reasoning | o-series has built-in CoT | Extended thinking mode | Thinking in 2.5 Flash/Pro |
| Structured output | Native JSON mode / Structured Outputs API | Prefers XML/markdown structure | JSON mode available |
| Long context | 128K; can lose middle details | 200K; strong recall | 1M+; good for large codebases |
| Tool calling | Parallel; strict schema | Sequential; strong multi-step | Parallel supported |

> **Rule**: Document model-specific tuning as comments, not primary instructions. Keeps prompts portable.

## Agentic Patterns

Patterns for designing multi-step, tool-using agents:

| Pattern | Structure | When to Use | Key Rule |
|---------|-----------|-------------|----------|
| **ReAct** | Reason → Act → Observe → repeat | Tool-using agents; iterative tasks | Explicit observation step after each action |
| **Plan-and-Execute** | Plan all steps → execute sequentially | Multi-step tasks with known structure | Plan upfront; re-plan on failure |
| **Reflection** | Generate → Critique → Revise | High-stakes output; self-improvement | Separate critic role from generator |
| **Tool-Augmented Reasoning** | Reason → select tool → use result → reason | Agents needing external data | Define tool contract; handle tool errors |
| **Orchestrator-Worker** | Router distributes to specialized agents | Complex workflows with multiple domains | Clear routing rules; structured handoff state |
| **Iterative Refinement** | Draft → evaluate → refine → repeat | Quality-sensitive tasks (writing, code) | Define stopping criteria; cap iterations |

> **Integration**: These patterns compose — e.g., ReAct + Reflection for self-correcting agents.
