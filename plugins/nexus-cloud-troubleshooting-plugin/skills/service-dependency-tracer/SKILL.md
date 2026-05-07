---
name: service-dependency-tracer
description: Trace K8s service dependency chains to find the true root failure. When service A is crashing or unhealthy, it may be because dependent service B is down. This skill inspects deployment manifests for initContainer/readiness dependencies and environment variable service references, checks health of dependent services, and recursively traces to the leaf/base service that is the actual root failure.
---

# Service Dependency Tracer Skill

Prevent false root cause assignment by tracing to the actual failing service.

> **Core problem**: A CrashLoop or restart alert on service A is often caused by service B (a dependency of A) being down. If the investigation stops at service A, the remediation will be wrong.
>
> **Key principle**: Always trace to the **leaf service** (the service with no healthy upstream it depends on). Investigate THAT service. Service A's restart is a symptom — NOT the root cause.

---

## Phase SD-1: Locate Deployment Manifest

Find the Kubernetes manifest for the failing service:

### SD-1a. From the cluster (preferred)

```bash
# Get the deployment for the failing pod
kubectl get deployment -n <namespace> -o wide

# Get full deployment YAML
kubectl get deployment <deployment-name> -n <namespace> -o yaml > /tmp/sd_deployment.yaml

# Or for StatefulSet/DaemonSet
kubectl get statefulset <name> -n <namespace> -o yaml > /tmp/sd_deployment.yaml
```

### SD-1b. From a GitOps repository (alternative)

If using GitOps (ArgoCD, Flux, Helm), look for manifests in the deployment repository:
- Helm charts: `charts/<service>/templates/deployment.yaml`
- Kustomize: `overlays/<env>/<service>/deployment.yaml`
- Raw manifests: `manifests/<namespace>/<service>/deployment.yaml`

### SD-1c. Derive service name from pod

Strip ReplicaSet hash and random suffix from pod name:
- `api-gateway-7d9f8b-abc12` -> `api-gateway`
- `payment-service-abc12-xyz` -> `payment-service`

---

## Phase SD-2: Extract initContainer Dependencies

`initContainers` run before the main container. Services using `k8s-wait` or similar patterns declare upstream dependencies — the main container won't start until all init containers succeed.

### SD-2a. Parse initContainers

Look for these patterns in the deployment YAML:

| Pattern | Example | Dependency |
|---------|---------|-----------|
| `k8s-wait-for` image | `args: ["service/redis", "service/postgres"]` | `redis`, `postgres` |
| `busybox` with `nslookup` | `until nslookup myservice; do sleep 2; done` | `myservice` |
| `busybox`/`alpine` with `nc` | `until nc -z postgres 5432; do sleep 2; done` | `postgres` |
| `init-db` / `db-migration` | Any migration init container | Database service |
| `wait-for-service` | Check args for service names | Named service |

### SD-2b. Common dependency patterns

```bash
# Quick extraction from deployment YAML
kubectl get deployment <name> -n <ns> -o jsonpath='{.spec.template.spec.initContainers[*].name}'
kubectl get deployment <name> -n <ns> -o jsonpath='{.spec.template.spec.initContainers[*].args}'
```

---

## Phase SD-3: Extract Environment Variable Service References

Service dependencies also appear as environment variables pointing to upstream endpoint URLs.

### SD-3a. Look for URL/host env vars

```bash
# Extract all env vars from main container
kubectl get deployment <name> -n <ns> -o jsonpath='{.spec.template.spec.containers[0].env[*]}' | jq .
```

**Dependency indicators** (env var name contains):
- `*_URL`, `*_HOST`, `*_ENDPOINT`, `*_ADDR`
- `*_SERVICE_HOST`, `*_SERVICE_PORT` (K8s service discovery)
- `DATABASE_URL`, `REDIS_URL`, `KAFKA_BROKERS`, `RABBITMQ_HOST`

Extract hostname from URL values:
- `http://user-service:8080/api` -> `user-service`
- `redis://redis-master:6379` -> `redis-master`
- `postgres://db-primary:5432/mydb` -> `db-primary`

---

## Phase SD-4: Check Health of Dependencies

For each identified dependency, check its health:

```bash
# Check if the dependent service has healthy endpoints
kubectl get endpoints <service> -n <namespace>

# Check pod status
kubectl get pods -l app=<service> -n <namespace>

# Check recent restarts
kubectl get pods -l app=<service> -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'
```

### Health classification

| Status | Meaning | Action |
|--------|---------|--------|
| Running, 0 recent restarts | Healthy | Not the root cause |
| Running, high restarts | Unstable | Possible cascading failure |
| CrashLoopBackOff | Failing | Potential root cause — recurse |
| No endpoints | Down | Likely root cause |
| Pending | Can't start | Check its own dependencies |

---

## Phase SD-5: Recursive Trace

If a dependency is also failing, repeat SD-1 through SD-4 for that service. Continue until you find a service that:
1. Has no dependencies that are failing, OR
2. Is a leaf infrastructure service (database, cache, message broker)

This is the **root cause service**.

### Output: serviceDependencyContext

```json
{
  "alertedService": "<original service>",
  "dependencyChain": [
    {"service": "api-gateway", "status": "CrashLoop", "dependsOn": ["auth-service", "user-service"]},
    {"service": "auth-service", "status": "CrashLoop", "dependsOn": ["redis-master"]},
    {"service": "redis-master", "status": "Down (0 endpoints)", "dependsOn": []}
  ],
  "rootCauseService": "redis-master",
  "rootCauseStatus": "Down (0 endpoints)",
  "recommendation": "Investigate redis-master first — api-gateway and auth-service failures are cascading symptoms"
}
```
