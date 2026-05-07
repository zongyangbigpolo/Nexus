---
name: splunk-query-builder
description: Generate ad-hoc Splunk queries for cloud service troubleshooting — schema catalog, statistical commands, time-series patterns, summarization templates, and log analysis.
---

# Skill: Splunk Query Builder

## Purpose

Enable the agent to generate **Splunk queries** for troubleshooting cloud services using knowledge of SPL syntax, statistical commands, and common log analysis patterns.

## When to Use

- User asks for metrics, stats, or summaries for a time period
- User requests a custom Splunk query
- User needs error rate, latency, traffic volume, or impact analysis
- User asks "how many", "what percentage", "show me trends", "compare", "top N"
- User needs cross-service correlation or aggregated views
- User wants anomaly or spike detection

## Prerequisites

- Service name and/or identifiers (when filtering)
- Target environment and index name
- Time interval (e.g., "last 1 hour", "last 24 hours")
- Splunk MCP tool access (`mcp_splunk-sys_run_splunk_query` or `mcp_splunk-eu_run_splunk_query`)

## Splunk MCP Tool Selection

| Region | Tool |
|--------|------|
| **US/AP** | `mcp_splunk-sys_run_splunk_query` |
| **EU** | `mcp_splunk-eu_run_splunk_query` |

### Standard Tool Parameters

```yaml
query: string           # SPL query (required)
earliest_time: string   # Start time (default: "-24h")
latest_time: string     # End time (default: "now")
row_limit: integer      # Max results (10-100 recommended)
```

---

## Time Interval Reference

Map natural language time references to SPL parameters:

| User Says | `earliest_time` | `latest_time` | Recommended `span` |
|-----------|-----------------|---------------|---------------------|
| last 15 minutes | `-15m` | `now` | `1m` |
| last 30 minutes | `-30m` | `now` | `1m` |
| last hour | `-1h` | `now` | `5m` |
| last 4 hours | `-4h` | `now` | `10m` |
| last 24 hours | `-24h` | `now` | `1h` |
| last 7 days | `-7d` | `now` | `1d` |
| specific range | ISO8601 start | ISO8601 end | auto |

---

## Common Query Patterns

### Error Rate Analysis

```splunk
# Error count over time
index=<index> Level="Error"
| timechart span=5m count as errors

# Error rate as percentage
index=<index> ServiceName="<service>"
| timechart span=5m count(eval(Level="Error")) as errors, count as total
| eval error_rate=round(errors/total*100, 2)

# Top error messages
index=<index> Level="Error" ServiceName="<service>"
| stats count by ExceptionMessage
| sort -count
| head 10
```

### Latency Analysis

```splunk
# Average and percentile latency
index=<index> ServiceName="<service>" Duration>0
| stats avg(Duration) as avg_ms, p50(Duration) as p50, p95(Duration) as p95, p99(Duration) as p99

# Latency over time
index=<index> ServiceName="<service>" Duration>0
| timechart span=5m avg(Duration) as avg_ms, p95(Duration) as p95_ms

# Slow requests
index=<index> ServiceName="<service>" Duration>1000
| table _time, RequestPath, Duration, StatusCode
| sort -Duration
| head 20
```

### HTTP Status Code Analysis

```splunk
# Status code distribution
index=<index> ServiceName="<service>" StatusCode>0
| stats count by StatusCode
| sort -count

# 5xx errors over time
index=<index> ServiceName="<service>" StatusCode>=500
| timechart span=5m count by StatusCode

# 4xx vs 5xx breakdown
index=<index> ServiceName="<service>" StatusCode>=400
| eval status_class=case(StatusCode>=500, "5xx", StatusCode>=400, "4xx")
| timechart span=5m count by status_class
```

### Service Health

```splunk
# Service availability (by host/pod)
index=<index> ServiceName="<service>"
| stats count, dc(host) as unique_hosts, earliest(_time) as first_seen, latest(_time) as last_seen by host
| sort -count

# Pod restart detection (based on reporting gaps)
index=<index> ServiceName="<service>"
| timechart span=1m count by host
| foreach * [eval <<FIELD>>=if(<<FIELD>>==0, "gap", "ok")]
```

### Traffic Volume

```splunk
# Request volume over time
index=<index> ServiceName="<service>"
| timechart span=5m count as requests

# Top endpoints by traffic
index=<index> ServiceName="<service>"
| stats count by RequestPath
| sort -count
| head 10

# Traffic by region or source
index=<index> ServiceName="<service>"
| stats count by Region
| sort -count
```

### Cross-Service Correlation

```splunk
# Trace a request across services by correlation ID
index=<index> "<correlation-id>"
| sort _time
| table _time, ServiceName, host, Level, Message

# Compare error rates across services
index=<index> Level="Error"
| timechart span=5m count by ServiceName

# Service response time comparison
index=<index> Duration>0
| stats avg(Duration) as avg_ms, count as requests by ServiceName
| sort -avg_ms
```

### Anomaly Detection

```splunk
# Detect error spikes (events exceeding 3 standard deviations)
index=<index> ServiceName="<service>" Level="Error"
| timechart span=5m count as errors
| eventstats avg(errors) as avg_errors, stdev(errors) as stdev_errors
| eval upper_bound=avg_errors + (3 * stdev_errors)
| eval is_anomaly=if(errors > upper_bound, "YES", "NO")
| where is_anomaly="YES"

# Rare error messages (new errors)
index=<index> ServiceName="<service>" Level="Error"
| rare ExceptionMessage limit=10
```

---

## Tips for Building Queries

1. Always specify `index=` to avoid scanning all indexes
2. Use `earliest_time` and `latest_time` params instead of SPL `earliest=` / `latest=` 
3. Limit results with `head` or `row_limit` to avoid timeouts
4. Use `stats` instead of `search` + `dedup` for better performance
