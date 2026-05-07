---
name: security-and-secrets
description: Cross-cutting rules for handling secrets/tokens safely in prompts, agents, and terminal commands.
applyTo: "**"
---

# Security and secrets

## Never disclose secrets
Do not paste, print, or log:
- OAuth tokens (`access_token`, bearer tokens), refresh tokens
- `client_secret`, app secrets, API keys
- PATs, passwords, private keys, certificates, or connection strings

If you must reference a secret, refer to it by **variable name** or **file path** only.

## Prefer variables over command-line arguments
- Avoid including secrets on the command line (shell history, process list).
- Prefer environment variables and in-memory variables.
- When providing command examples, use placeholders like `<TOKEN>` and `<CLIENT_SECRET>`.

## Masking
If troubleshooting requires showing a value, mask it and keep it short (example: `***...xyz`).

## Logging hygiene
- Avoid writing tokens/secrets into files unless the user explicitly asks and the file is intended for secret storage.
- If a tool output contains sensitive values, summarize without repeating the secret.
