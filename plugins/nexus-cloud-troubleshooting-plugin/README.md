# Cloud Troubleshooting Plugin

`cloud-troubleshooting-plugin` packages operational troubleshooting workflows for Kubernetes clusters, Docker containers, and cloud infrastructure. Its assets focus on incident triage, log and metric correlation, infrastructure diagnostics, and alert-driven root cause analysis across any cloud provider.

## What This Plugin Provides

- Troubleshooting commands: `/sre`, `/cloud-alert-triage`, `/service-troubleshoot`, `/cloud-infra-troubleshoot`
- Operational agents: `sre`, `cloud-alert-triage`, `service-troubleshoot`, `cloud-infra-troubleshoot`
- Troubleshooting skill library for Kubernetes, Docker, Prometheus, Loki, Splunk, networking, and cloud provider diagnostics
- Investigation playbooks and report templates under `agent-assets/`

## When To Install It

Install this plugin when you need:
- Kubernetes cluster diagnostics and SRE operations
- Production alert triage from PagerDuty, Grafana, or Splunk
- Microservice failure investigation (crash loops, latency, error spikes)
- Cloud infrastructure troubleshooting (nodes, networking, storage, Docker)
- Multi-cloud health status checking (AWS, Azure, GCP)

## Install From Source

1. Open the Command Palette.
2. Run `Chat: Install Plugin From Source`.
3. Select `plugins/nexus-cloud-troubleshooting-plugin`.
4. Reload VS Code.

## Typical Flows

```text
/sre -> cluster connect -> diagnostics -> investigation report
/cloud-alert-triage -> alert parsing -> evidence collection -> RCA report
/service-troubleshoot -> context gathering -> logs/metrics/deps -> root cause
/cloud-infra-troubleshoot -> cluster health -> network/storage -> remediation
```

## Plugin Layout

```text
agent-assets/            # Investigation playbooks and report templates
agents/                  # Troubleshooting agents (*.agent.md)
commands/                # Slash-command definitions
skills/                  # Troubleshooting skills (<skill>/SKILL.md)
.github/plugin/          # Plugin manifest
.mcp.json                # Plugin-local MCP manifest
AGENTS.md                # Full asset catalog and maintenance guidance
README.md                # This file
```

## Related Documentation

- See `AGENTS.md` for the full asset inventory and operating rules.
- See `../../.github/copilot-instructions.md` for shared repository-level Copilot guidance.
- Install the common plugin if you also need shared JIRA, Git, or Azure helpers.
