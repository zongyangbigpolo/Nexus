---
name: loki-log-analyzer
description: Analyze application and infrastructure logs via Grafana Loki — build LogQL queries, identify error patterns, correlate log events with timeline, trace requests across services. Works with any Loki datasource.
---

# Loki Log Analyzer Skill

Systematic log analysis via Grafana Loki for incident investigation.

## When to Use

- Investigating errors or exceptions in application logs
- Correlating log events with a specific time window or alert
- Tracing requests across multiple services
- Analyzing error frequency, patterns, and first occurrence
- Checking deployment or config change logs

---

## Phase LL-1: Datasource Discovery

Find available Loki datasources:

```
grafana/list_datasources
```

Select the Loki datasource for the target cluster/environment.

## Phase LL-2: Label Discovery

```
grafana/list_loki_label_names:
  datasourceUid: <uid>

grafana/list_loki_label_values:
  datasourceUid: <uid>
  labelName: "namespace"
```

Common label names: `namespace`, `app`, `pod`, `container`, `node_name`, `cluster`, `job`, `stream`

## Phase LL-3: Error Pattern Search

### Basic error search
```logql
{namespace="<ns>", app="<service>"} |= "error"
```

### Structured log parsing
```logql
{namespace="<ns>", app="<service>"} | json | level="error"

{namespace="<ns>", app="<service>"} | logfmt | level="error"
```

### Exception/panic search
```logql
{namespace="<ns>", app="<service>"} |~ "(?i)(exception|panic|fatal|stack.?trace|segfault)"
```

### Specific error code
```logql
{namespace="<ns>", app="<service>"} | json | status_code >= 500
```

Execute via:
```
grafana/query_loki_logs:
  datasourceUid: <uid>
  logQL: '<query>'
  startRfc3339: <start>
  endRfc3339: <end>
  limit: 100
```

## Phase LL-4: Error Frequency Analysis

```logql
# Error rate over time
sum(rate({namespace="<ns>", app="<service>"} |= "error" [5m]))

# Error count by level
sum by (level) (count_over_time({namespace="<ns>", app="<service>"} | json [1h]))

# Top error messages
{namespace="<ns>", app="<service>"} | json | level="error" | line_format "{{.msg}}"
```

Use Loki patterns for automatic grouping:
```
grafana/query_loki_patterns:
  datasourceUid: <uid>
  logQL: '{namespace="<ns>", app="<service>"} |= "error"'
  startRfc3339: <start>
  endRfc3339: <end>
```

## Phase LL-5: Request Tracing

Trace a specific request across services using correlation ID:

```logql
# Search across all services in namespace
{namespace="<ns>"} |= "<correlation-id>"

# Search across all namespaces (broad, use sparingly)
{cluster="<cluster>"} |= "<correlation-id>"
```

Build a timeline from results: sort by timestamp, identify the request path through services.

## Phase LL-6: Infrastructure Log Analysis

### Kubernetes events
```logql
{namespace="kube-system", app="eventrouter"} |= "<pod-name>"
{namespace="kube-system"} |~ "OOMKill|Evict|FailedScheduling|BackOff"
```

### Node-level logs
```logql
{job="systemd-journal", node_name="<node>"} |= "kubelet"
{job="systemd-journal", node_name="<node>"} |~ "OOM|oom_kill|Out of memory"
```

### Container runtime logs
```logql
{job="systemd-journal", node_name="<node>"} |= "containerd"
```

## Phase LL-7: Time Window Analysis

When investigating an incident, analyze logs across three time windows:

| Window | Period | Purpose |
|--------|--------|---------|
| Pre-incident | firedAt - 30min to firedAt | What changed before the issue |
| Incident | firedAt to resolvedAt | What happened during the issue |
| Post-recovery | resolvedAt to resolvedAt + 15min | Confirm recovery is stable |
