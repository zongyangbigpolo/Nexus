# Service Troubleshoot Playbook

Reference material for the [service-troubleshoot agent](../agents/service-troubleshoot.agent.md).

## Table of Contents
- [Investigation Report Template](#investigation-report-template)
- [Log Query Patterns](#log-query-patterns)
- [Metric Query Patterns](#metric-query-patterns)
- [Common Microservice Issues](#common-microservice-issues)

---

## Investigation Report Template

```markdown
## Service Investigation: {service} ({namespace}/{cluster})

**Date**: {timestamp}
**JIRA**: {jiraId or "N/A"}
**Environment**: {production/staging/dev}
**Cluster**: {cluster}
**Namespace**: {namespace}

### Context
| Field | Value |
|-------|-------|
| Service | {service} |
| Namespace | {namespace} |
| Cluster | {cluster} |
| Correlation ID | {txid or N/A} |
| Time Window | {start} to {end} UTC |
| Issue Category | {crash/latency/error/connectivity/resource} |

### Issue Summary
{1-3 sentence description of the problem}

### Pod Status
| Pod | Status | Restarts | Ready | Age | Node |
|-----|--------|----------|-------|-----|------|
| {pod} | {status} | {n} | {ready} | {age} | {node} |

### Dependencies
| Service | Status | Latency | Error Rate |
|---------|--------|---------|------------|
| {dep-svc} | Healthy/Degraded/Down | {ms} | {%} |

### Log Evidence
| # | Time | Source | Level | Message |
|---|------|--------|-------|---------|
| 1 | {time} | {service} | {level} | {message} |

### Metric Evidence
| Metric | Current | Baseline | Delta |
|--------|---------|----------|-------|
| Error rate | {val} | {baseline} | {+/-}% |
| p95 latency | {val} | {baseline} | {+/-}ms |
| CPU usage | {val} | {baseline} | {+/-}% |
| Memory usage | {val} | {baseline} | {+/-}MB |

### Root Cause
{Root cause with evidence references}

### Fix Plan
| Priority | Action | Details |
|----------|--------|---------|
| Immediate | {mitigation} | {how} |
| Root fix | {permanent fix} | {what to change and where} |
| Prevention | {future prevention} | {alerts, tests, limits} |

### Impact
{Scope: single service / dependent services / end users}
```

---

## Log Query Patterns

### Splunk Queries

```splunk
# Find errors for a service
index=<env>_<index> ServiceName="<service>" Level="Error"
| head 50

# Trace a request by correlation ID
index=<env>_<index> "<correlation-id>"
| sort _time

# Error rate over time
index=<env>_<index> ServiceName="<service>" Level="Error"
| timechart span=5m count

# Top error messages
index=<env>_<index> ServiceName="<service>" Level="Error"
| stats count by ExceptionMessage
| sort -count
| head 10

# Recent deployments (from events)
index=<env>_<index> "deployment" ("rolled out" OR "scaled" OR "created")
| sort -_time
| head 20
```

### Loki Queries (via Grafana)

```logql
# Errors for a service
{namespace="<ns>", app="<service>"} |= "error" | logfmt

# Specific exception
{namespace="<ns>", app="<service>"} |~ "Exception|Panic|Fatal"

# Request trace
{namespace="<ns>"} |= "<correlation-id>"

# Error rate
sum(rate({namespace="<ns>", app="<service>"} |= "error" [5m]))
```

---

## Metric Query Patterns

### Prometheus Queries (via Grafana)

```promql
# HTTP error rate (5xx)
sum(rate(http_requests_total{namespace="<ns>", service="<svc>", code=~"5.."}[5m]))
/ sum(rate(http_requests_total{namespace="<ns>", service="<svc>"}[5m]))

# HTTP latency p95
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{namespace="<ns>", service="<svc>"}[5m])) by (le))

# Pod CPU usage
sum(rate(container_cpu_usage_seconds_total{namespace="<ns>", pod=~"<svc>.*"}[5m])) by (pod)

# Pod memory usage
sum(container_memory_working_set_bytes{namespace="<ns>", pod=~"<svc>.*"}) by (pod)

# Pod restart count
sum(kube_pod_container_status_restarts_total{namespace="<ns>", pod=~"<svc>.*"}) by (pod)

# Incoming request rate
sum(rate(http_requests_total{namespace="<ns>", service="<svc>"}[5m]))
```

---

## Common Microservice Issues

### CrashLoopBackOff

| Exit Code | Meaning | Common Cause |
|-----------|---------|--------------|
| 0 | Success | Container completed (wrong for long-running) |
| 1 | Application error | Unhandled exception, missing config |
| 137 | SIGKILL (OOMKilled) | Memory limit too low or memory leak |
| 143 | SIGTERM | Graceful shutdown (normal during rollout) |
| 255 | Unknown | Runtime error, binary not found |

### Connection Failures

| Symptom | Likely Cause | Check |
|---------|-------------|-------|
| Connection refused | Service not running | `kubectl get endpoints` |
| Connection timeout | Network policy blocking | `kubectl get networkpolicies` |
| DNS resolution failure | CoreDNS issue | `kubectl get pods -n kube-system -l k8s-app=kube-dns` |
| TLS handshake failure | Certificate expired/mismatch | Check cert expiry, CA trust |

### Resource Exhaustion

| Resource | Symptom | Mitigation |
|----------|---------|-----------|
| CPU | Throttling, slow responses | Increase limits, optimize, scale out |
| Memory | OOMKilled, swap usage | Increase limits, fix leak |
| Disk | Eviction, log rotation failure | Clean up, increase PV size |
| File descriptors | "Too many open files" | Increase ulimits, fix connection leak |
| Connections | Connection pool exhaustion | Tune pool settings, fix leaks |
