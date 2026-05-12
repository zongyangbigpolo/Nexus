# Cloud Alert Triage Playbook

Reference material for the [cloud-alert-triage agent](../agents/cloud-alert-triage.agent.md).

## Table of Contents
- [Alert Source Parsing](#alert-source-parsing)
- [Investigation Report Template](#investigation-report-template)
- [Severity Classification](#severity-classification)
- [Common Alert Patterns](#common-alert-patterns)

---

## Alert Source Parsing

### PagerDuty URL

```
https://<org>.pagerduty.com/incidents/<incident-id>
```

API call to fetch incident:
```
GET https://api.pagerduty.com/incidents/{id}
Authorization: Token token=$PD_API_KEY

GET https://api.pagerduty.com/incidents/{id}/alerts
```

Extract: `alertName`, `severity`, `cluster`, `namespace`, `pod`, `region`, `firedAt`, `workload_type` from labels.

### Grafana Alert URL

```
https://<org>.grafana.net/alerting/grafana/<uid>/view
https://<org>.grafana.net/alerting/list
```

Query `ALERTS{alertname="<name>"}` to extract full label set and determine `firedAt` from Prometheus series timestamps.

### Splunk Alert URL

```
https://observability.example.com/app/<app>/@go?sid=scheduler_<encoded-sid>
```

Parse SID to extract `firedAt`, `appName`, Splunk instance. Look up saved search to get SPL query, then query events.

---

## Investigation Report Template

```markdown
## Alert Triage Report: {alertName}

**Date**: {timestamp}
**Severity**: {Critical/High/Medium/Low}
**Source**: {PagerDuty/Grafana/Splunk}
**Status**: {Resolved/Ongoing/Intermittent}

### Alert Context
| Field | Value |
|-------|-------|
| Alert Name | {alertName} |
| Cluster | {cluster} |
| Namespace | {namespace} |
| Service/Pod | {service or pod name} |
| Region | {region} |
| Fired At | {firedAt} UTC |
| Duration | {duration} |

### Summary
{1-3 sentence summary of the issue}

### Evidence

#### Metrics
| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| {metric} | {value} | {threshold} | {above/below/normal} |

#### Logs
| Time | Source | Level | Message |
|------|--------|-------|---------|
| {time} | {service} | Error/Warn | {message} |

#### Events
| Time | Type | Source | Message |
|------|------|--------|---------|
| {time} | Warning | {source} | {message} |

### Root Cause
{Root cause with evidence references}

### Impact
- **Services affected**: {list}
- **User impact**: {description}
- **Duration**: {start} to {end or ongoing}

### Actions
| Priority | Action | Owner |
|----------|--------|-------|
| Immediate | {action} | {team/person} |
| Short-term | {action} | {team/person} |
| Long-term | {action} | {team/person} |

### Cloud Health
{Cloud provider status for the affected region — from cloud-health-checker skill}
```

---

## Severity Classification

| Severity | Criteria | Response |
|----------|----------|----------|
| **Critical** | Service down, data loss risk, all users affected | Immediate investigation, page on-call |
| **High** | Degraded performance, partial outage, many users affected | Investigate within 15 min |
| **Medium** | Increased error rate, intermittent failures, some users | Investigate within 1h |
| **Low** | Warning threshold, potential issue, no user impact yet | Review in next maintenance window |

---

## Common Alert Patterns

### High Memory / OOM
- Check: Pod memory usage vs limits
- Check: Node memory pressure
- Check: Memory leak patterns in metrics (steadily increasing)
- Action: Increase limits, fix leak, or add HPA

### High CPU / Throttling
- Check: Pod CPU usage vs limits/requests
- Check: Node CPU pressure
- Check: Burst patterns vs sustained
- Action: Increase limits, optimize code, scale out

### Pod Restart / CrashLoop
- Check: Exit code (137=OOM, 1=app error, 143=SIGTERM)
- Check: Previous container logs
- Check: Recent deployment or config change
- Action: Fix root cause (OOM/bug/config), rollback if needed

### Error Rate Spike
- Check: HTTP status code distribution (4xx vs 5xx)
- Check: Recent deployments or config changes
- Check: Upstream dependency health
- Action: Rollback if deploy-correlated, fix upstream if dependency

### Latency Increase
- Check: p50/p95/p99 trends
- Check: Resource utilization
- Check: Database/cache response times
- Check: Network latency between services
- Action: Scale, optimize queries, add caching

### Node NotReady
- Check: Cloud provider instance status
- Check: kubelet health
- Check: Disk/memory/PID pressure conditions
- Action: Drain and replace node, or resolve pressure condition
