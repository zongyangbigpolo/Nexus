---
name: network-connectivity-diagnostics
description: Kubernetes and cloud networking troubleshooting — DNS resolution, service mesh, ingress controllers, network policies, CNI plugins, load balancers, and inter-service connectivity. Works with any CNI, service mesh, or ingress controller.
---

# Network Connectivity Diagnostics Skill

Systematic network troubleshooting for Kubernetes and cloud environments.

## When to Use

- Service-to-service connectivity failures
- DNS resolution issues
- Ingress/load balancer routing problems
- Network policy blocking traffic
- Service mesh (Istio, Linkerd) issues
- CNI plugin failures
- Cloud load balancer health check failures

---

## Phase NC-1: DNS Resolution

### CoreDNS Health
```bash
# CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide

# CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=50

# CoreDNS config
kubectl get configmap coredns -n kube-system -o yaml
```

### DNS Resolution Test
```bash
# Test from inside the cluster
kubectl run dnstest --rm -i --restart=Never --image=busybox:1.36 -- nslookup <service>.<namespace>.svc.cluster.local

# Test external DNS
kubectl run dnstest --rm -i --restart=Never --image=busybox:1.36 -- nslookup google.com

# Check resolv.conf in a pod
kubectl exec <pod> -n <ns> -- cat /etc/resolv.conf
```

### Common DNS Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| NXDOMAIN for svc | Service doesn't exist or wrong namespace | Check `kubectl get svc -n <ns>` |
| Timeout | CoreDNS down or overloaded | Check CoreDNS pods, scale if needed |
| External DNS fails | Missing upstream server or network policy | Check CoreDNS `forward` config |

## Phase NC-2: Service Endpoint Verification

```bash
# Service exists and has endpoints
kubectl get svc <service> -n <ns>
kubectl get endpoints <service> -n <ns>

# If no endpoints:
# 1. Check selector matches pod labels
kubectl get svc <service> -n <ns> -o jsonpath='{.spec.selector}' | jq .
kubectl get pods -n <ns> -l <key>=<value>

# 2. Check pod readiness
kubectl get pods -n <ns> -l <key>=<value> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'
```

## Phase NC-3: Network Policy Analysis

```bash
# List network policies
kubectl get networkpolicies -n <ns>

# Describe a policy
kubectl describe networkpolicy <name> -n <ns>

# Check if policies are blocking traffic
# Look for: ingress/egress rules, podSelector, namespaceSelector
kubectl get networkpolicy -n <ns> -o yaml
```

### Policy Debugging Tips
- Default deny policies block ALL traffic not explicitly allowed
- Check both source namespace AND destination namespace policies
- Labels must match EXACTLY (including namespace labels)

## Phase NC-4: Ingress Controller Diagnostics

### Nginx Ingress
```bash
# Controller pods
kubectl get pods -n ingress-nginx

# Ingress resources
kubectl get ingress --all-namespaces

# Ingress details
kubectl describe ingress <name> -n <ns>

# Nginx config test
kubectl exec -n ingress-nginx <controller-pod> -- nginx -T | grep -A10 "server_name <host>"

# Controller logs
kubectl logs -n ingress-nginx <controller-pod> --tail=50
```

### Traefik
```bash
kubectl get pods -n traefik
kubectl get ingressroute --all-namespaces
kubectl logs -n traefik <traefik-pod> --tail=50
```

### Common Ingress Issues

| HTTP Code | Likely Cause | Check |
|-----------|-------------|-------|
| 404 | Wrong host/path or no matching rule | Ingress rules and host header |
| 502 | Backend pods not ready | Endpoints, pod health |
| 503 | No backends available | Service selector, pod count |
| SSL error | Certificate issue | TLS secret, cert expiry |

## Phase NC-5: Service Mesh Diagnostics

### Istio
```bash
# Proxy status
istioctl proxy-status
istioctl proxy-config cluster <pod>.<ns>

# mTLS check
istioctl authn tls-check <pod>.<ns>

# Envoy config dump
istioctl proxy-config all <pod>.<ns>

# Sidecar injection check
kubectl get namespace <ns> -o jsonpath='{.metadata.labels.istio-injection}'
```

### Linkerd
```bash
# Check proxy status
linkerd check --proxy -n <ns>

# Traffic stats
linkerd stat deploy -n <ns>

# Routes
linkerd routes deploy/<service> -n <ns>
```

## Phase NC-6: Cloud Load Balancer

### AWS
```bash
# Target group health
aws elbv2 describe-target-health --target-group-arn <arn>

# Load balancer status
aws elbv2 describe-load-balancers --names <name>
```

### Azure
```bash
# Health probe status
az network lb probe show -g <rg> --lb-name <lb> -n <probe>

# Backend pool health
az network lb address-pool show -g <rg> --lb-name <lb> -n <pool>
```

### GCP
```bash
# Backend health
gcloud compute backend-services get-health <service> --global

# Forwarding rules
gcloud compute forwarding-rules describe <rule> --global
```

## Phase NC-7: Connectivity Test

```bash
# Test from inside the cluster
kubectl run nettest --rm -i --restart=Never --image=nicolaka/netshoot -- bash -c '
  # TCP connectivity
  nc -zv <host> <port>
  
  # HTTP check
  curl -sI http://<service>.<ns>.svc:<port>/health
  
  # Traceroute
  traceroute <host>
  
  # DNS + latency
  dig <service>.<ns>.svc.cluster.local
'
```
