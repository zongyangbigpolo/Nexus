---
name: k8s-cluster-diagnostics
description: Kubernetes cluster-level diagnostics — node health, control plane status, resource pressure, system component health, etcd, scheduling, and cluster-wide event analysis. Works with AKS, EKS, GKE, and self-managed clusters.
---

# Kubernetes Cluster Diagnostics Skill

Systematic cluster-level troubleshooting for any Kubernetes distribution.

## When to Use

- Nodes in NotReady or SchedulingDisabled state
- Control plane issues (API server, etcd, scheduler, controller-manager)
- Cluster-wide resource pressure (CPU, memory, disk, PID)
- System component failures (CoreDNS, kube-proxy, CNI)
- Scheduling failures across multiple pods
- Cluster upgrade or maintenance issues

---

## Phase CD-1: Node Health Assessment

```bash
# Node status overview
kubectl get nodes -o wide

# Node conditions (all nodes)
kubectl describe nodes | grep -B5 -A5 "Conditions:"

# Resource capacity vs allocation
kubectl top nodes

# Detailed node info
kubectl describe node <node-name>
```

### Node Condition Reference

| Condition | Healthy Value | Problem Interpretation |
|-----------|--------------|----------------------|
| Ready | True | If False: kubelet unhealthy, container runtime down |
| MemoryPressure | False | If True: node running low on memory |
| DiskPressure | False | If True: node running low on disk |
| PIDPressure | False | If True: too many processes on node |
| NetworkUnavailable | False | If True: CNI plugin misconfigured |

## Phase CD-2: Control Plane Health

### Managed clusters (AKS/EKS/GKE)
Control plane is managed by cloud provider — check via cloud CLI:

```bash
# AKS
az aks show -g <rg> -n <cluster> --query "powerState"

# EKS
aws eks describe-cluster --name <cluster> --query "cluster.status"

# GKE
gcloud container clusters describe <cluster> --region <region> --format="value(status)"
```

### Self-managed clusters
```bash
# Component status (deprecated but useful)
kubectl get componentstatuses

# API server health
kubectl get --raw /healthz

# etcd health
kubectl get --raw /healthz/etcd

# Controller manager and scheduler (check pods)
kubectl get pods -n kube-system -l component=kube-controller-manager
kubectl get pods -n kube-system -l component=kube-scheduler
```

## Phase CD-3: System Component Health

```bash
# All system pods
kubectl get pods -n kube-system -o wide

# CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30

# kube-proxy
kubectl get pods -n kube-system -l k8s-app=kube-proxy
kubectl get daemonset kube-proxy -n kube-system

# CNI pods (varies by CNI plugin)
kubectl get pods -n kube-system -l app=calico-node      # Calico
kubectl get pods -n kube-system -l app=aws-node          # AWS VPC CNI
kubectl get pods -n kube-system -l app=azure-cni         # Azure CNI
kubectl get pods -n kube-system -l app=cilium            # Cilium
```

## Phase CD-4: Resource Pressure Analysis

```bash
# Node resource summary
kubectl top nodes

# Per-node allocation details
for node in $(kubectl get nodes -o name); do
  echo "=== $node ==="
  kubectl describe $node | grep -A15 "Allocated resources"
done

# Check resource quotas
kubectl get resourcequotas --all-namespaces

# Check limit ranges
kubectl get limitranges --all-namespaces
```

### Pressure Thresholds (defaults)

| Condition | Default Threshold |
|-----------|------------------|
| memory.available | < 100Mi |
| nodefs.available | < 10% |
| nodefs.inodesFree | < 5% |
| imagefs.available | < 15% |
| pid.available | < kernel.pid_max * 5% |

## Phase CD-5: Cluster Events Analysis

```bash
# Warning events cluster-wide (last 1h)
kubectl get events --all-namespaces --field-selector type=Warning --sort-by='.lastTimestamp' | tail -30

# Events by reason
kubectl get events --all-namespaces -o json | jq '[.items[] | select(.type=="Warning")] | group_by(.reason) | map({reason: .[0].reason, count: length}) | sort_by(-.count)'

# Scheduling failures
kubectl get events --all-namespaces --field-selector reason=FailedScheduling --sort-by='.lastTimestamp'
```

## Phase CD-6: Cluster Version and Upgrade Status

```bash
# Cluster version
kubectl version --short

# Node versions (check for skew)
kubectl get nodes -o custom-columns=NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion

# API deprecations (if kubectl plugin available)
kubectl api-versions
```

### Version Skew Policy

| Component | Allowed Skew from API Server |
|-----------|------------------------------|
| kubelet | -2 minor versions |
| kube-proxy | -2 minor versions |
| kubectl | +/- 1 minor version |
