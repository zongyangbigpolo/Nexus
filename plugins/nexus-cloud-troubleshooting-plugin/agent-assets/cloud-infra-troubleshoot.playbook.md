# Cloud Infrastructure Troubleshoot Playbook

Reference material for the [cloud-infra-troubleshoot agent](../agents/cloud-infra-troubleshoot.agent.md).

## Table of Contents
- [Investigation Report Template](#investigation-report-template)
- [Kubernetes Diagnostics Reference](#kubernetes-diagnostics-reference)
- [Docker/Container Runtime Reference](#dockercontainer-runtime-reference)
- [Cloud Provider Reference](#cloud-provider-reference)
- [Networking Reference](#networking-reference)
- [Storage Reference](#storage-reference)

---

## Investigation Report Template

```markdown
## Infrastructure Investigation: {cluster} ({cloud}/{region})

**Date**: {timestamp}
**JIRA**: {jiraId or "N/A"}
**Cloud Provider**: {AWS/Azure/GCP/on-prem}
**Cluster**: {cluster}
**Kubernetes Version**: {version}

### Issue Summary
{1-3 sentence description of the infrastructure issue}

### Cluster Health
| Node | Status | Roles | CPU | Memory | Disk | Conditions |
|------|--------|-------|-----|--------|------|------------|
| {node} | {status} | {roles} | {%} | {%} | {%} | {conditions} |

### Affected Workloads
| Namespace | Resource | Name | Status | Impact |
|-----------|----------|------|--------|--------|
| {ns} | {Deployment/StatefulSet/DaemonSet} | {name} | {status} | {description} |

### Evidence
| # | Source | Check | Finding |
|---|--------|-------|---------|
| 1 | {kubectl/metrics/logs/cloud} | {what was checked} | {result} |

### Root Cause
{Root cause analysis with evidence}

### Remediation
| Priority | Action | Risk | Impact |
|----------|--------|------|--------|
| Immediate | {action} | {Low/Med/High} | {what changes} |
| Long-term | {action} | {Low/Med/High} | {prevention} |

### Cloud Provider Status
{Cloud provider health for affected region and services}
```

---

## Kubernetes Diagnostics Reference

### Cluster-Wide Health Checks

```bash
# Overall cluster status
kubectl cluster-info
kubectl get componentstatuses  # Deprecated in newer Kubernetes but still useful
kubectl get nodes -o wide

# Node conditions
kubectl describe nodes | grep -A5 "Conditions:"

# Resource pressure
kubectl top nodes
kubectl describe nodes | grep -E "cpu|memory|ephemeral-storage|hugepages" | head -20

# System pods health
kubectl get pods -n kube-system -o wide
kubectl get events -n kube-system --sort-by='.lastTimestamp' | tail -20

# Cluster-wide warning events
kubectl get events --all-namespaces --field-selector type=Warning --sort-by='.lastTimestamp' | tail -30
```

### Node Diagnostics

```bash
# Node details
kubectl describe node <node-name>

# Node resource allocation
kubectl describe node <node-name> | grep -A10 "Allocated resources"

# Pods on a node
kubectl get pods --all-namespaces --field-selector spec.nodeName=<node-name>

# Node conditions detail
kubectl get node <node-name> -o jsonpath='{.status.conditions}' | jq .

# Taints
kubectl get node <node-name> -o jsonpath='{.spec.taints}' | jq .
```

### Pod Diagnostics

```bash
# Pod details
kubectl describe pod <pod> -n <ns>

# Container logs
kubectl logs <pod> -n <ns> --tail=100
kubectl logs <pod> -n <ns> --previous  # Previous crash
kubectl logs <pod> -n <ns> -c <container>  # Specific container

# Resource usage
kubectl top pod <pod> -n <ns>

# Pod events
kubectl get events -n <ns> --field-selector involvedObject.name=<pod> --sort-by='.lastTimestamp'
```

---

## Docker/Container Runtime Reference

### Docker Diagnostics

```bash
# Docker daemon status
systemctl status docker
docker info
docker version

# Container list and status
docker ps -a
docker inspect <container-id>

# Container logs
docker logs <container-id> --tail 100
docker logs <container-id> --since 1h

# Resource usage
docker stats --no-stream

# Disk usage
docker system df
docker system df -v
```

### containerd Diagnostics

```bash
# containerd status
systemctl status containerd
crictl info

# Container/pod list
crictl ps -a
crictl pods

# Container logs
crictl logs <container-id> --tail 100

# Image list
crictl images
```

---

## Cloud Provider Reference

### AWS (EKS)

| Resource | Check Command |
|----------|--------------|
| EKS cluster | `aws eks describe-cluster --name <cluster>` |
| Node group | `aws eks describe-nodegroup --cluster-name <cluster> --nodegroup-name <ng>` |
| EC2 instances | `aws ec2 describe-instance-status --instance-ids <id>` |
| Load balancers | `aws elbv2 describe-target-health --target-group-arn <arn>` |
| VPC/Subnets | `aws ec2 describe-subnets --filters Name=vpc-id,Values=<vpc>` |

### Azure (AKS)

| Resource | Check Command |
|----------|--------------|
| AKS cluster | `az aks show -g <rg> -n <cluster>` |
| Node pool | `az aks nodepool show -g <rg> --cluster-name <cluster> -n <pool>` |
| VM status | `az vm list -g <node-rg> --show-details` |
| Load balancer | `az network lb show -g <rg> -n <lb>` |
| NSG rules | `az network nsg rule list -g <rg> --nsg-name <nsg>` |

### GCP (GKE)

| Resource | Check Command |
|----------|--------------|
| GKE cluster | `gcloud container clusters describe <cluster> --region <region>` |
| Node pool | `gcloud container node-pools describe <pool> --cluster <cluster> --region <region>` |
| VM instances | `gcloud compute instances describe <instance> --zone <zone>` |
| Load balancer | `gcloud compute forwarding-rules describe <rule> --region <region>` |
| Firewall rules | `gcloud compute firewall-rules list --filter="network:<vpc>"` |

---

## Networking Reference

### DNS Diagnostics

```bash
# CoreDNS health
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=50

# Test DNS resolution
kubectl run dnstest --rm -i --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default.svc
kubectl run dnstest --rm -i --restart=Never --image=busybox:1.36 -- nslookup <service>.<namespace>.svc

# CoreDNS config
kubectl get configmap coredns -n kube-system -o yaml
```

### Ingress Diagnostics

```bash
# Ingress controller health
kubectl get pods -n ingress-nginx  # or the relevant namespace
kubectl get ingress --all-namespaces

# Ingress details
kubectl describe ingress <name> -n <ns>

# Backend status (nginx)
kubectl exec -it -n ingress-nginx <controller-pod> -- /nginx-ingress-controller --check-backend
```

### Service Mesh (Istio)

```bash
# Proxy status
istioctl proxy-status
istioctl proxy-config cluster <pod> -n <ns>

# mTLS status
istioctl authn tls-check <pod>.<ns>
```

---

## Storage Reference

```bash
# PV/PVC status
kubectl get pv
kubectl get pvc --all-namespaces
kubectl describe pvc <name> -n <ns>

# Storage classes
kubectl get storageclass

# CSI driver health
kubectl get csidrivers
kubectl get pods -n kube-system -l app=csi-provisioner
```

| PVC Status | Meaning | Action |
|------------|---------|--------|
| Bound | Healthy | None |
| Pending | Waiting for PV | Check storage class, capacity, zone |
| Lost | PV deleted | Recreate PV or restore from backup |
