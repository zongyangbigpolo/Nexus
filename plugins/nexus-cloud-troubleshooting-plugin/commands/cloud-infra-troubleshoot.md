---
name: cloud-infra-troubleshoot
description: Troubleshoot Kubernetes cluster, Docker, cloud provider, and networking infrastructure issues
agent: cloud-infra-troubleshoot
argument-hint: "'node NotReady' [or] 'PVC pending' [or] 'ingress 502 errors' [or] cluster=<name>"
---

# Cloud Infrastructure Troubleshooter

Diagnose infrastructure-level issues across Kubernetes clusters, Docker environments, cloud provider resources, and networking layers.

## Usage

**Interactive** — agent asks for context:
```
/cloud-infra-troubleshoot
```

**With parameters**:
```
/cloud-infra-troubleshoot cluster=prod-east cloud=aws
```

**Describe the issue**:
```
/cloud-infra-troubleshoot 3 nodes showing NotReady in production cluster
/cloud-infra-troubleshoot High memory pressure on worker nodes
/cloud-infra-troubleshoot PVC stuck in Pending state for statefulset
/cloud-infra-troubleshoot Ingress returning 502 for all backends
/cloud-infra-troubleshoot CoreDNS pods failing in kube-system
/cloud-infra-troubleshoot etcd leader elections happening too frequently
/cloud-infra-troubleshoot Docker daemon unresponsive on node-3
/cloud-infra-troubleshoot Load balancer health checks failing
```

## What It Helps With

| Layer | Issues |
|-------|--------|
| **Kubernetes Nodes** | NotReady, SchedulingDisabled, pressure conditions, kubelet issues |
| **Control Plane** | API server, etcd, scheduler, controller-manager health |
| **Networking** | DNS resolution, ingress controllers, service mesh, CNI, network policies |
| **Storage** | PV/PVC issues, CSI driver failures, storage class problems |
| **Docker/Container Runtime** | containerd/CRI-O issues, image pull failures, runtime crashes |
| **Cloud Provider** | VM health, managed Kubernetes control plane, cloud networking, LB health |
| **Resource Capacity** | CPU/memory/disk pressure, IPAM exhaustion, quota limits |

## Investigation Flow

```
Context → Cluster Health → Workload Impact → Network Check → Cloud Status → Log/Metric Analysis → Root Cause
```

**Requires**: kubectl access and/or Grafana/Prometheus for metric queries.
