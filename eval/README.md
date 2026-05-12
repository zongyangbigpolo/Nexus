# Agent Harness Eval

To get started, set model configuration in your shell environment or in `providers/.env`. Shell environment variables take precedence over the local `.env` file.

The provider uses an OpenAI-compatible chat completions API selected from environment variables:

```bash
EVAL_PROVIDER=openai          # openai, deepseek, openrouter, gemini, ollama
EVAL_MODEL=gpt-4o
EVAL_API_KEY=<your-key>
EVAL_BASE_URL=<optional-openai-compatible-url>

# Optional separate grader model
GRADER_PROVIDER=openai
GRADER_MODEL=gpt-4o-mini
GRADER_API_KEY=<your-key>
GRADER_BASE_URL=<optional-openai-compatible-url>
```

See `providers/.env.example` for the full template.

The eval suites use `providers/generic-llm-provider.js`. Normal agent execution uses the `EVAL_*` model configuration. Promptfoo `llm-rubric` assertions are routed to the grader path and use `GRADER_*` when configured, otherwise they fall back to `EVAL_*`.

Install promptfoo globally:

```bash
npm install -g promptfoo@latest
```
You can view the results by running `promptfoo view`.

## Install provider project

Navigate to `eval/providers` folder and run `npm install` 

## Running a test suite

Example that runs the test suite for the `agentsmd` prompt:

```bash
promptfoo eval -c tests/agentsmd
```

Use the browser viewer to obtain the last eval result:

```bash
promptfoo view -y
```

## Resources

- https://www.promptfoo.dev