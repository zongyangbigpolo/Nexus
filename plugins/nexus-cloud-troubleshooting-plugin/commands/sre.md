---
name: sre
description: Connect to Kubernetes clusters and collect diagnostic data for incident investigation
agent: sre
---

# SRE Operations

Connect to Kubernetes clusters (AKS, EKS, GKE, or any kubeconfig-based cluster) and collect logs/diagnostics for investigation.

## Inputs

- **Cluster**: ${input:cluster:}
  - Cluster name or kubeconfig context
- **Environment**: ${input:env:dev}
  - `dev` = Development cluster
  - `stg` = Staging cluster
  - `prod` = Production cluster (read-only, requires confirmation)
- **Action**: ${input:action:connect}
  - `connect` = Connect to cluster and show status
  - `logs` = Collect logs from a service
  - `investigate` = Full diagnostic investigation
- **Namespace** (optional): ${input:namespace:}
  - Target namespace (default: all)
- **Service** (for logs): ${input:service:}
  - Service or pod name
- **JIRA** (optional): ${input:jiraId:}
  - Related JIRA ticket for context

---

## Quick Examples

### Connect to a dev cluster
```
/sre cluster=my-dev-cluster env=dev
```

### Collect logs from a service in staging
```
/sre cluster=staging-cluster env=stg action=logs namespace=default service=api-gateway
```

### Full investigation for a production incident
```
/sre cluster=prod-cluster env=prod action=investigate namespace=backend jiraId=OPS-12345
```

**Notes**: Production clusters require explicit confirmation. All operations are read-only. Requires kubectl and cloud CLI tools (az/aws/gcloud) for managed clusters.
