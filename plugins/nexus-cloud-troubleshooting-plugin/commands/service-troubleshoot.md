---
name: service-troubleshoot
description: Troubleshoot Kubernetes microservice failures using logs, metrics, dependency tracing, and container diagnostics
agent: service-troubleshoot
argument-hint: "service=<name> namespace=<ns> [or] 'pod X is CrashLooping' [or] txid=<correlation-id>"
---

# Service Troubleshooter

Diagnose microservice issues in Kubernetes: crash loops, high latency, error spikes, connectivity failures, resource exhaustion, and more.

## Usage

**Interactive** — agent asks for service details:
```
/service-troubleshoot
```

**With parameters**:
```
/service-troubleshoot service=api-gateway namespace=backend cluster=prod-east
```

**With correlation ID**:
```
/service-troubleshoot txid=abc123-def456-789 service=payment-service
```

**Describe the issue**:
```
/service-troubleshoot api-gateway pods keep crashing in prod namespace
/service-troubleshoot High latency on checkout-service since 3am
/service-troubleshoot 5xx errors spiking on user-service
/service-troubleshoot DNS resolution failing for redis.cache.svc
/service-troubleshoot ImagePullBackOff on deployment web-frontend
```

## What It Helps With

| Issue Category | Examples |
|----------------|----------|
| **CrashLoopBackOff** | Pods restarting, OOM kills, failed probes, init container failures |
| **High Latency** | Slow responses, connection timeouts, upstream delays |
| **Error Spikes** | 5xx increase, exception patterns, failed health checks |
| **Connectivity** | Connection refused, DNS failures, service mesh issues |
| **Resource Exhaustion** | CPU throttling, memory pressure, disk full, PID exhaustion |
| **Image/Config** | ImagePullBackOff, missing ConfigMaps/Secrets, volume mount failures |
| **Scaling** | HPA not scaling, pending pods, insufficient resources |

## Investigation Flow

```
Context → Issue Classification → Dependency Analysis → Log Analysis → Metrics → Root Cause → Resolution
```

**Requires**: kubectl access or Splunk/Loki/Grafana MCP for log and metric queries.
