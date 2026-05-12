# SRE Playbook

Reference material for the [sre agent](../agents/sre.agent.md).

## Table of Contents
- [Investigation Report Template](#investigation-report-template)
- [Cluster Connection Reference](#cluster-connection-reference)
- [Diagnostic Scenarios](#diagnostic-scenarios)
- [Handoff Decision Matrix](#handoff-decision-matrix)

---

## Investigation Report Template

Use this template after collecting diagnostic data:

```markdown
## Cluster Investigation: {cluster} ({env})

**Date**: {timestamp}
**JIRA**: {jiraId or "N/A"}
**Cluster**: {cluster-name}
**Provider**: {AKS/EKS/GKE/on-prem}
**Region**: {region}
**Namespace**: {namespace or "cluster-wide"}

### Cluster Health
| Node | Status | Roles | CPU | Memory | Disk | Kubernetes Version |
|------|--------|-------|-----|--------|------|-------------|
| {node} | Ready/NotReady | control-plane/worker | {%} | {%} | {%} | {version} |

### Pod Status
| Pod | Namespace | Status | Restarts | Age | Node |
|-----|-----------|--------|----------|-----|------|
| {pod} | {ns} | Running/CrashLoop/Pending | {n} | {age} | {node} |

### Recent Events (Last 1h)
| Time | Namespace | Type | Reason | Object | Message |
|------|-----------|------|--------|--------|---------|
| {time} | {ns} | Warning/Normal | {reason} | {kind/name} | {msg} |

### Resource Usage
| Namespace | Pod | CPU Request | CPU Limit | CPU Used | Mem Request | Mem Limit | Mem Used |
|-----------|-----|-------------|-----------|----------|-------------|-----------|----------|
| {ns} | {pod} | {req} | {lim} | {used} | {req} | {lim} | {used} |

### Errors Found
| Service | Namespace | Count | Sample Message | First Seen | Last Seen |
|---------|-----------|-------|----------------|------------|-----------|
| {svc} | {ns} | {n} | {msg} | {time} | {time} |

### Recommendations
- {recommendation 1}
- {recommendation 2}
```

---

## Cluster Connection Reference

### AKS (Azure Kubernetes Service)
```bash
az login
az account set --subscription <subscription-id>
az aks get-credentials --resource-group <rg> --name <cluster>
kubelogin convert-kubeconfig -l azurecli  # If AAD-enabled
```

### EKS (Amazon Elastic Kubernetes Service)
```bash
aws sso login --profile <profile>
aws eks update-kubeconfig --name <cluster> --region <region>
```

### GKE (Google Kubernetes Engine)
```bash
gcloud auth login
gcloud container clusters get-credentials <cluster> --region <region> --project <project>
```

### Generic kubeconfig
```bash
kubectl config use-context <context-name>
kubectl config current-context
```

---

## Diagnostic Scenarios

### Scenario: Pod CrashLoopBackOff

1. Get pod status and events: `kubectl describe pod <pod> -n <ns>`
2. Check previous container logs: `kubectl logs <pod> -n <ns> --previous`
3. Check current logs: `kubectl logs <pod> -n <ns> --tail=100`
4. Inspect resource limits: `kubectl get pod <pod> -n <ns> -o yaml | grep -A5 resources`
5. Common causes: OOM kill, failing health checks, missing config/secrets, init container failure

### Scenario: Service Not Responding

1. Verify pod is running: `kubectl get pods -l app=<service> -n <ns>`
2. Check service endpoints: `kubectl get endpoints <service> -n <ns>`
3. Test DNS resolution: `kubectl run tmp --rm -i --restart=Never --image=busybox -- nslookup <service>.<ns>.svc`
4. Check network policies: `kubectl get networkpolicies -n <ns>`
5. Check ingress: `kubectl describe ingress -n <ns>`

### Scenario: High Latency

1. Check resource usage: `kubectl top pods -n <ns> --sort-by=cpu`
2. Look for CPU throttling:  `kubectl get events -n <ns> --field-selector reason=Throttled`
3. Check node resource pressure: `kubectl describe nodes | grep -A5 Conditions`
4. Review HPA status: `kubectl get hpa -n <ns>`
5. Check dependent service health

### Scenario: Node NotReady

1. Check node status: `kubectl get nodes -o wide`
2. Describe the node: `kubectl describe node <node-name>`
3. Check kubelet logs (if accessible): `journalctl -u kubelet --since "1h ago"`
4. Check node conditions: pressure, disk, memory, PID
5. Check cloud provider instance status

### Scenario: Persistent Volume Issues

1. Check PVC status: `kubectl get pvc -n <ns>`
2. Check PV status: `kubectl get pv`
3. Describe PVC: `kubectl describe pvc <name> -n <ns>`
4. Check storage class: `kubectl get storageclass`
5. Check CSI driver pods: `kubectl get pods -n kube-system -l app=csi-*`

---

## Handoff Decision Matrix

| Finding | Next Action |
|---------|-------------|
| Application code bug suspected | -> `developer` agent for fix |
| Infrastructure scaling needed | -> Cloud provider console or IaC |
| Service dependency failure | -> `service-troubleshoot` agent |
| Alert-triggered investigation | -> `cloud-alert-triage` agent |
| Need ticket update | -> `jira-manager` with findings |
| Complex log pattern analysis | -> `analyzer` for MECE analysis |
