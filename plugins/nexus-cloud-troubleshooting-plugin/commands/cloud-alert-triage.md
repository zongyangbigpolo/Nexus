---
name: cloud-alert-triage
description: Triage production alerts from PagerDuty, Grafana, or Splunk with root cause analysis
agent: cloud-alert-triage
argument-hint: "Paste a PagerDuty URL, Grafana alert URL, Splunk alert URL, or provide alertName=<name> cluster=<cluster>"
---

# Cloud Alert Triage

Parse and investigate production alerts from PagerDuty, Grafana, or Splunk. Produces structured root cause analysis with evidence from metrics, logs, and events.

## Usage

**Paste an alert URL**:
```
/cloud-alert-triage https://myorg.pagerduty.com/incidents/Q1ABC123
/cloud-alert-triage https://myorg.grafana.net/alerting/grafana/abc123/view
/cloud-alert-triage https://observability.example.com/app/search/@go?sid=scheduler_abc123
```

**Manual parameters**:
```
/cloud-alert-triage alertName=HighMemoryUsage cluster=prod-east-1
```

**Describe the alert**:
```
/cloud-alert-triage Pod OOMKilled alerts firing in production namespace backend
/cloud-alert-triage High error rate on api-gateway service since 2am UTC
```

## Supported Alert Sources

| Source | Format | What It Does |
|--------|--------|-------------|
| **PagerDuty** | Incident URL or JSON payload | Fetch incident → extract labels → investigate |
| **Grafana** | Alert URL | Query Prometheus ALERTS{} → extract context → investigate |
| **Splunk** | Alert URL with SID | Parse saved search → fetch events → triage |
| **Manual** | alertName + cluster/namespace | Direct investigation with provided params |

## What It Produces

- Alert summary with severity assessment
- Root cause analysis with evidence
- Impact scope (services, users affected)
- Current status (resolved / ongoing / intermittent)
- Recommended actions (immediate + long-term)

**Requires**: Grafana, Splunk MCP, or PagerDuty API access configured.
