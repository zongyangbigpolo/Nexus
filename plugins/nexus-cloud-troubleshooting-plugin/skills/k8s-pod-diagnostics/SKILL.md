---
name: k8s-pod-diagnostics
description: Kubernetes pod-level troubleshooting — inspect pod status, events, logs, resource usage, probe health, and container exit codes. Provides systematic diagnosis for CrashLoopBackOff, ImagePullBackOff, Pending, OOMKilled, and other common pod failure modes.
---

# K8s Pod Diagnostics Skill

Systematic pod-level troubleshooting for any Kubernetes cluster.

## When to Use

- Pod in CrashLoopBackOff, Pending, Error, ImagePullBackOff, or Unknown state
- OOMKilled containers
- Readiness/liveness probe failures
- Init container failures
- Resource quota or limit issues

---

## Phase PD-1: Pod Status Assessment

```bash
# Get pod status
kubectl get pod <pod> -n <ns> -o wide

# Detailed pod description (events, conditions, container statuses)
kubectl describe pod <pod> -n <ns>

# JSON output for programmatic analysis
kubectl get pod <pod> -n <ns> -o json | jq '{
  phase: .status.phase,
  conditions: .status.conditions,
  containerStatuses: .status.containerStatuses,
  initContainerStatuses: .status.initContainerStatuses
}'
```

## Phase PD-2: Container Log Collection

```bash
# Current container logs
kubectl logs <pod> -n <ns> --tail=200

# Previous crashed container logs
kubectl logs <pod> -n <ns> --previous --tail=200

# Specific container (multi-container pods)
kubectl logs <pod> -n <ns> -c <container> --tail=200

# All containers
kubectl logs <pod> -n <ns> --all-containers --tail=50
```

## Phase PD-3: Exit Code Analysis

| Exit Code | Signal | Meaning | Common Cause |
|-----------|--------|---------|--------------|
| 0 | — | Success | Expected for Jobs; wrong for long-running services |
| 1 | — | Application error | Unhandled exception, bad config, missing dependency |
| 2 | — | Shell misuse | Wrong entrypoint/command |
| 126 | — | Permission denied | File not executable |
| 127 | — | Command not found | Wrong image or entrypoint path |
| 137 | SIGKILL | OOMKilled or external kill | Memory limit too low or memory leak |
| 139 | SIGSEGV | Segfault | Application bug (native code) |
| 143 | SIGTERM | Graceful shutdown | Normal during rollouts; check preStop hooks |

## Phase PD-4: Resource Analysis

```bash
# Pod resource usage
kubectl top pod <pod> -n <ns>

# Resource requests and limits
kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[*].resources}' | jq .

# Check if pod was OOMKilled
kubectl get pod <pod> -n <ns> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'

# Node resource availability
kubectl describe node <node> | grep -A10 "Allocated resources"
```

## Phase PD-5: Probe Diagnostics

```bash
# Get probe configuration
kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[0].readinessProbe}' | jq .
kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[0].livenessProbe}' | jq .
kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[0].startupProbe}' | jq .

# Check events for probe failures
kubectl get events -n <ns> --field-selector involvedObject.name=<pod>,reason=Unhealthy
```

| Probe Type | Failure Effect | Common Fix |
|------------|---------------|------------|
| Startup | Container killed, restart | Increase `failureThreshold` or `initialDelaySeconds` |
| Liveness | Container killed, restart | Fix health endpoint, increase timeout |
| Readiness | Removed from Service endpoints | Fix ready check, check dependencies |

## Phase PD-6: Common Failure Patterns

### CrashLoopBackOff
1. Check exit code (PD-3)
2. Check previous logs (PD-2)
3. Check resource limits vs usage (PD-4)
4. Check probes (PD-5)
5. Check configmaps/secrets mounted correctly

### ImagePullBackOff
1. Verify image exists: `kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[0].image}'`
2. Check image pull secrets: `kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.imagePullSecrets}'`
3. Verify registry access from node
4. Check for typos in image tag

### Pending
1. Check events: `kubectl describe pod <pod> -n <ns>` → Events section
2. Check resource availability: `kubectl describe nodes | grep -A5 "Allocated resources"`
3. Check node selectors/affinity: `kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.nodeSelector}'`
4. Check PVC binding: `kubectl get pvc -n <ns>`
5. Check taints/tolerations
