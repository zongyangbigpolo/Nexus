# Mac Agent Harness Eval

To get started, set the appropriate environment variables for your provider (for example, `AZURE_API_KEY` for Azure OpenAI or `OPENAI_API_KEY` for the OpenAI provider), along with any other required keys for the providers you selected.

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