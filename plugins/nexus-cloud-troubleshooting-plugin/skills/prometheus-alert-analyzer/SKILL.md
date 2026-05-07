---
name: prometheus-alert-analyzer
description: Analyze Prometheus-based alerts via Grafana — decode alerting rules, query current metric state, evaluate thresholds, check alert history, and correlate with deployments and events. Works with any Prometheus datasource.
---

# Prometheus Alert Analyzer Skill

Systematic analysis of Prometheus alerts and metric anomalies via Grafana.

## When to Use

- Investigating a firing Prometheus alert
- Analyzing metric thresholds and current state
- Correlating metric anomalies with deployments or events
- Understanding alert rules and their PromQL expressions
- Checking alert history and firing patterns

---

## Phase PA-1: Alert Context Extraction

From the alert source (PagerDuty, Grafana URL, or manual input), extract:

| Field | Source | Description |
|-------|--------|-------------|
| `alertName` | Alert labels | The alerting rule name |
| `expr` | Alert rule or source URL | PromQL expression |
| `threshold` | Alert annotations or rule | Threshold value |
| `datasourceUid` | Grafana or alert labels | Prometheus datasource |
| `labels` | Alert body | All labels (cluster, namespace, pod, etc.) |
| `firedAt` | Alert history | When the alert started firing |

## Phase PA-2: Current Metric State

Query the current value of the alert's PromQL expression:

```
grafana/query_prometheus:
  datasourceUid: <uid>
  expr: <the alert's PromQL expression>
  startRfc3339: <1h ago>
  endRfc3339: <now>
  stepSeconds: 60
```

Compare current value to threshold:
- **Above threshold**: Alert still valid, issue ongoing
- **Below threshold**: Alert may have resolved, check history
- **Oscillating**: Intermittent issue, check for flapping

## Phase PA-3: Historical Trend

Query metric over a longer window (6h or 24h) to identify patterns:

```
grafana/query_prometheus:
  datasourceUid: <uid>
  expr: <expression>
  startRfc3339: <24h ago>
  endRfc3339: <now>
  stepSeconds: 300
```

Look for:
- **Sudden spike**: Deployment, traffic surge, or dependency failure
- **Gradual increase**: Resource leak, growing load
- **Periodic pattern**: Cron jobs, batch processing, traffic patterns
- **Flat line at 0**: Service down, metric collection broken

## Phase PA-4: Related Metrics

Query related metrics to build a fuller picture:

### For resource alerts
```promql
# CPU usage
sum(rate(container_cpu_usage_seconds_total{namespace="<ns>", pod=~"<pod>.*"}[5m])) by (pod)

# Memory usage
sum(container_memory_working_set_bytes{namespace="<ns>", pod=~"<pod>.*"}) by (pod)

# Restarts
sum(kube_pod_container_status_restarts_total{namespace="<ns>", pod=~"<pod>.*"}) by (pod)
```

### For error rate alerts
```promql
# Total request rate
sum(rate(http_requests_total{namespace="<ns>", service="<svc>"}[5m]))

# Error rate by status code
sum(rate(http_requests_total{namespace="<ns>", service="<svc>", code=~"5.."}[5m])) by (code)

# Latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{namespace="<ns>", service="<svc>"}[5m])) by (le))
```

### For availability alerts
```promql
# Pod count vs desired
kube_deployment_status_replicas_available{namespace="<ns>", deployment="<deploy>"}
kube_deployment_spec_replicas{namespace="<ns>", deployment="<deploy>"}

# Node readiness
kube_node_status_condition{condition="Ready", status="true"}
```

## Phase PA-5: Deployment Correlation

Check if the alert correlates with a recent deployment:

```promql
# K8s deployment updated
kube_deployment_status_observed_generation{namespace="<ns>", deployment="<deploy>"}

# Deployment condition changes
kube_deployment_status_condition{namespace="<ns>", deployment="<deploy>", condition="Progressing"}
```

Also check Grafana annotations for deployment markers.

## Phase PA-6: Alert Rule Analysis

If the alert seems misconfigured (too sensitive, wrong threshold):

```
grafana/get_alert_group:
  groupName: <group>
```

Check:
- **for** duration: How long must condition hold before firing
- **threshold**: Is it appropriate for this environment
- **labels/annotations**: Are severity and runbook correct
- **evaluation interval**: Too frequent or too infrequent
