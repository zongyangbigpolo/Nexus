# architect Playbook — Cloud/Platform Specialization

Operational details for the **Cloud/Platform Architect** specialization of the `architect` agent.

**Source of truth**: [architect.agent.md](../../agents/architect.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [architect.agent.md](../../agents/architect.agent.md) |
| Azure Ops Agent | [azure-ops.agent.md](../../agents/azure-ops.agent.md) |
| Azure Cost Skill | [azure-cost-analysis](../../skills/azure-cost-analysis/SKILL.md) |
| Azure Audit Skill | [azure-resource-audit](../../skills/azure-resource-audit/SKILL.md) |

---

## Role Definition

### Cloud Architect Scope
- Design cloud-native architectures
- Landing zone and network design
- Identity and access management
- Kubernetes and PaaS selection
- Cost optimization and FinOps
- Disaster recovery and resiliency

### Platform Architect Scope
- Internal developer platform design
- CI/CD pipeline architecture
- Runtime environment (containers, serverless)
- Observability stack (metrics, logs, traces)
- Shared services and platform capabilities
- Developer experience optimization

---

## Core Frameworks

### AWS Well-Architected Framework (Pillars)

| Pillar | Focus Areas |
|--------|-------------|
| Operational Excellence | Runbooks, IaC, observability, continuous improvement |
| Security | IAM, detection, infrastructure protection, data protection |
| Reliability | Foundations, change management, failure management |
| Performance Efficiency | Selection, review, monitoring, trade-offs |
| Cost Optimization | Expenditure awareness, cost-effective resources |
| Sustainability | Environmental impact, resource efficiency |

### Azure Well-Architected Framework (Pillars)

| Pillar | Focus Areas |
|--------|-------------|
| Reliability | Resiliency, availability, recovery |
| Security | Identity, network, data, application |
| Cost Optimization | Cost modeling, monitoring, optimization |
| Operational Excellence | DevOps, monitoring, automation |
| Performance Efficiency | Scalability, performance testing |

### Google Cloud Architecture Framework

| Pillar | Focus Areas |
|--------|-------------|
| System Design | Compute, storage, networking decisions |
| Operational Excellence | Monitoring, incident response |
| Security, Privacy, Compliance | IAM, data protection |
| Reliability | SLOs, DR, fault tolerance |
| Cost Optimization | Resource sizing, commitment |
| Performance Optimization | Latency, throughput |

---

## Landing Zone Design

### Azure Landing Zone Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Management Groups                             │
├────────────────┬──────────────────┬─────────────────────────────┤
│   Platform     │   Landing Zones  │   Sandbox                   │
├────────────────┼──────────────────┼─────────────────────────────┤
│ • Management   │ • Production     │ • Dev/Test                  │
│ • Identity     │ • Non-Production │ • Innovation                │
│ • Connectivity │                  │                             │
└────────────────┴──────────────────┴─────────────────────────────┘
```

### Landing Zone Checklist

| Category | Items |
|----------|-------|
| Identity | Azure AD tenant, PIM, emergency access accounts |
| Management | Log Analytics, Azure Monitor, Update Management |
| Connectivity | Hub-spoke/Virtual WAN, ExpressRoute/VPN, DNS |
| Security | Azure Policy, Defender for Cloud, Key Vault |
| Governance | Naming conventions, tagging, RBAC, cost management |

### Network Topology Patterns

**Hub-Spoke**:
```
                    ┌─────────────┐
                    │   Hub VNet  │
                    │ • Firewall  │
                    │ • VPN GW    │
                    │ • Bastion   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Spoke 1  │    │ Spoke 2  │    │ Spoke 3  │
    │ (Prod)   │    │ (Dev)    │    │ (Shared) │
    └──────────┘    └──────────┘    └──────────┘
```

**Virtual WAN**:
- Multi-region hub-spoke at scale
- Managed routing
- Branch connectivity (SD-WAN)

---

## Kubernetes Architecture

### Cluster Design Decisions

| Decision | Options | Considerations |
|----------|---------|----------------|
| Cluster per env | Single multi-tenant vs multiple | Isolation vs cost |
| Node pools | System vs user, GPU, spot | Workload requirements |
| Networking | Kubenet vs Azure CNI | IP planning, features |
| Ingress | NGINX, Application Gateway, Traefik | Features, cost |
| Service mesh | Istio, Linkerd, none | Complexity vs features |

### Cluster Architecture Template

```markdown
## Kubernetes Cluster Design: {Name}

### Cluster Strategy
- **Approach**: {Single multi-tenant / Cluster per environment / Cluster per team}
- **Regions**: {Primary: X, DR: Y}
- **Version Policy**: {N-1, auto-upgrade}

### Node Pool Design
| Pool | Purpose | VM Size | Min/Max | Taints |
|------|---------|---------|---------|--------|
| system | Platform workloads | Standard_D4s_v3 | 3/5 | CriticalAddonsOnly |
| general | Application workloads | Standard_D8s_v3 | 3/20 | none |
| spot | Batch/dev workloads | Standard_D8s_v3 | 0/10 | kubernetes.azure.com/scalesetpriority=spot |

### Networking
- **CNI**: {Kubenet / Azure CNI / Azure CNI Overlay}
- **Pod CIDR**: {X.X.X.X/16}
- **Service CIDR**: {X.X.X.X/16}
- **Ingress**: {NGINX / Application Gateway Ingress Controller}
- **Egress**: {NAT Gateway / Azure Firewall}

### Security
- **RBAC**: Azure AD integration, namespace-scoped roles
- **Network Policies**: {Calico / Azure Network Policies}
- **Pod Security**: {Pod Security Admission / Gatekeeper}
- **Secrets**: {Azure Key Vault CSI driver}
- **Image Scanning**: {Defender for Containers}

### Observability
- **Metrics**: Azure Monitor / Prometheus + Grafana
- **Logs**: Container Insights / Loki
- **Traces**: Application Insights / Jaeger
```

---

## Platform Engineering

### Internal Developer Platform (IDP) Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Experience Layer                    │
│  • Portal (Backstage)  • CLI  • IDE Extensions  • Documentation │
├─────────────────────────────────────────────────────────────────┤
│                    Platform Orchestration Layer                  │
│  • GitOps (ArgoCD/Flux)  • Infrastructure Automation (Terraform)│
│  • Secret Management  • Policy Enforcement (OPA/Gatekeeper)     │
├─────────────────────────────────────────────────────────────────┤
│                    Platform Capabilities Layer                   │
│  • Container Runtime (K8s)  • CI/CD (GitHub Actions/ADO)        │
│  • Observability  • Service Mesh  • API Gateway                 │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                          │
│  • Cloud Provider (Azure/AWS/GCP)  • Networking  • Storage      │
└─────────────────────────────────────────────────────────────────┘
```

### Golden Paths

Define golden paths for common scenarios:

| Scenario | Golden Path |
|----------|-------------|
| New microservice | Template → GitHub repo → CI/CD → Deploy to K8s |
| New API | OpenAPI spec → Code generation → Gateway registration |
| New database | Request form → Provisioning → Connection string in Key Vault |
| New environment | Landing zone → RBAC → Networking → Monitoring |

### Platform Team Topologies

| Model | Description | When to Use |
|-------|-------------|-------------|
| Enabling | Help teams adopt platform capabilities | Early stages, high variation |
| Platform | Provide self-service capabilities | Mature platform, standardization |
| Stream-aligned | Embedded in product teams | Critical products, custom needs |

---

## CI/CD Architecture

### Pipeline Patterns

**Trunk-Based Development**:
```
main ────●────●────●────●────●───► production
         │         │
         └─feature──┘ (short-lived)
```

**GitFlow**:
```
main ─────────────●─────────────●───► production
                  │             │
develop ──●───●───┴─────●───●───┴────►
          └─feature─┘   └─feature─┘
```

### Pipeline Design Template

```yaml
# Example pipeline stages
stages:
  - name: build
    jobs:
      - compile
      - unit-test
      - static-analysis
      - dependency-scan
  
  - name: package
    jobs:
      - container-build
      - container-scan
      - push-to-registry
  
  - name: deploy-dev
    environment: development
    jobs:
      - deploy
      - smoke-test
  
  - name: deploy-staging
    environment: staging
    approval: automatic
    jobs:
      - deploy
      - integration-test
      - performance-test
  
  - name: deploy-prod
    environment: production
    approval: manual
    jobs:
      - deploy-canary
      - verify-canary
      - promote-or-rollback
```

---

## Observability Architecture

### Three Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                        Observability                             │
├──────────────────┬──────────────────┬───────────────────────────┤
│      Metrics     │       Logs       │        Traces             │
├──────────────────┼──────────────────┼───────────────────────────┤
│ • Prometheus     │ • Loki           │ • Jaeger                  │
│ • Azure Monitor  │ • Elasticsearch  │ • Zipkin                  │
│ • Datadog        │ • Splunk         │ • Application Insights    │
├──────────────────┼──────────────────┼───────────────────────────┤
│ Dashboards       │ Log aggregation  │ Distributed tracing       │
│ Alerting         │ Search/Query     │ Service dependency maps   │
│ SLI/SLO tracking │ Correlation      │ Latency analysis          │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### SLI/SLO Framework

| Service | SLI | SLO | Error Budget |
|---------|-----|-----|--------------|
| API Gateway | Request success rate | 99.9% | 0.1% (43 min/month) |
| API Gateway | p99 latency | <500ms | - |
| Database | Availability | 99.95% | 0.05% (22 min/month) |
| Async Processing | Processing success | 99.5% | 0.5% |

---

## Cost Optimization

### FinOps Practices

| Practice | Implementation |
|----------|----------------|
| Showback/Chargeback | Tag-based cost allocation |
| Right-sizing | Regular review of resource utilization |
| Reserved capacity | Commit for predictable workloads |
| Spot/Preemptible | Batch processing, dev/test |
| Autoscaling | Match capacity to demand |
| Idle resource cleanup | Automated shutdown, TTL |

### Cost Optimization Checklist

- [ ] Resource tagging for cost allocation
- [ ] Reserved instances for baseline workloads
- [ ] Spot instances for interruptible workloads
- [ ] Autoscaling configured for variable workloads
- [ ] Dev/test environments shutdown off-hours
- [ ] Storage lifecycle policies configured
- [ ] Right-sizing recommendations reviewed monthly
- [ ] Unused resources identified and removed
- [ ] Cost anomaly alerts configured

---

## Disaster Recovery

### DR Strategies

| Strategy | RTO | RPO | Cost | Use Case |
|----------|-----|-----|------|----------|
| Backup & Restore | Hours | Hours | Low | Non-critical |
| Pilot Light | Minutes-Hours | Minutes | Medium | Important |
| Warm Standby | Minutes | Near-zero | High | Critical |
| Active-Active | Near-zero | Near-zero | Highest | Mission-critical |

### DR Architecture Template

```markdown
## Disaster Recovery Design: {System}

### Business Requirements
- **RTO**: {X hours}
- **RPO**: {X minutes}
- **Criticality**: {Tier 1/2/3}

### DR Strategy
- **Approach**: {Pilot Light / Warm Standby / Active-Active}
- **Primary Region**: {Region}
- **DR Region**: {Region}

### Replication
| Component | Method | Frequency |
|-----------|--------|-----------|
| Database | {Geo-replication} | {Async/Sync} |
| Storage | {GRS/GZRS} | {Automatic} |
| Configuration | {Git-based IaC} | {On change} |

### Failover Process
1. {Step 1: Detection}
2. {Step 2: Decision}
3. {Step 3: DNS/Traffic switch}
4. {Step 4: Verification}

### Testing Schedule
- **Table-top exercise**: Quarterly
- **Partial failover**: Semi-annually
- **Full failover**: Annually
```

---

## Checklists

### Cloud Architecture Review

- [ ] Well-Architected Framework pillars addressed
- [ ] Multi-region/availability zone strategy defined
- [ ] Network topology designed (hub-spoke/mesh)
- [ ] Identity and access management designed
- [ ] Data residency and sovereignty considered
- [ ] Cost estimate with optimization recommendations
- [ ] Disaster recovery strategy defined
- [ ] Security controls mapped
- [ ] Observability strategy defined
- [ ] Scaling strategy documented

### Platform Architecture Review

- [ ] Developer experience considered
- [ ] Self-service capabilities identified
- [ ] Golden paths defined
- [ ] CI/CD pipeline architecture designed
- [ ] GitOps strategy defined
- [ ] Secret management approach defined
- [ ] Policy enforcement mechanisms defined
- [ ] Observability stack selected
- [ ] Platform team model defined
- [ ] Migration/adoption plan created
