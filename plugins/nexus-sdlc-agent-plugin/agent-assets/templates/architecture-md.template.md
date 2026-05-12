# Architecture Overview

> Based on the [architecture.md](https://architecture.md/) standard.
> Generated and validated by the `architect` agent (system specialization).

<!-- AGENT INSTRUCTIONS:
  - This is a TEMPLATE. Replace all [bracketed placeholders] with real values.
  - Delete sections that don't apply (e.g., no Frontend → remove 4.1).
  - Keep ASCII-only diagrams (no Unicode box-drawing).
  - If ARCHITECTURE.md already exists, AUGMENT — preserve existing content, add missing sections.
  - After filling, remove all HTML comments.
-->

This document provides a comprehensive understanding of the codebase's architecture,
enabling efficient navigation and effective contribution. Update as the codebase evolves.

---

## 1. Overview

<!-- Brief system description: what it does, who uses it, why it exists. -->

**System**: [Project name — one-line description of what the system does]

**Stakeholders**: [Teams/roles that own or consume this system]

### Quality Attributes (NFRs)

<!-- List the top 3-5 architecture-driving quality attributes. -->

| Attribute | Target | Notes |
|-----------|--------|-------|
| Availability | [e.g., 99.9%] | [e.g., Multi-region, health checks] |
| Scalability | [e.g., 10k RPS] | [e.g., Horizontal pod autoscaling] |
| Security | [e.g., Zero-trust] | [e.g., mTLS between services] |
| Performance | [e.g., p99 < 200ms] | [e.g., Caching layer] |

---

## 2. Project Structure

<!-- High-level directory tree. Show 2-3 levels deep. -->

```
[Project Root]/
+-- src/                  # Source code
|   +-- api/              # API endpoints / controllers
|   +-- domain/           # Domain models / business logic
|   +-- infrastructure/   # Data access, external services
|   +-- config/           # Configuration files
+-- tests/                # Unit and integration tests
+-- deploy/               # Deployment configs (Dockerfile, k8s, Terraform)
+-- docs/                 # Documentation
+-- .github/              # CI/CD workflows, Copilot assets
+-- README.md             # Quick start guide
+-- ARCHITECTURE.md       # This document
```

---

## 3. High-Level System Diagram

<!-- C4 Level 1 (System Context) or simple block diagram. ASCII only. -->

```
+--------+       +-------------------+       +-----------+
|  User  |------>|  Application      |------>| Database  |
+--------+       +-------------------+       +-----------+
                        |
                        v
                 +--------------+
                 | External API |
                 +--------------+
```

---

## 4. Core Components

<!-- List each major component/service. Repeat subsections as needed. -->

### 4.1. [Component Name]

| Field | Value |
|-------|-------|
| **Path** | `src/[path]` |
| **Type** | [Frontend / Backend Service / Library / Worker / CLI] |
| **Purpose** | [One-line description] |
| **Technologies** | [e.g., Go 1.22, ASP.NET 8, React 18, Python 3.12] |
| **Deployment** | [e.g., AKS, App Service, Lambda, Static Web App] |

### 4.2. [Component Name]

| Field | Value |
|-------|-------|
| **Path** | `src/[path]` |
| **Type** | [Frontend / Backend Service / Library / Worker / CLI] |
| **Purpose** | [One-line description] |
| **Technologies** | [e.g., ...] |
| **Deployment** | [e.g., ...] |

---

## 5. Data Stores

<!-- Databases, caches, queues, blob storage. -->

| Name | Type | Purpose | Key Entities |
|------|------|---------|--------------|
| [e.g., Primary DB] | [PostgreSQL / CosmosDB / Redis] | [What data it stores] | [users, orders, configs] |
| [e.g., Cache] | [Redis / Memcached] | [Session / query caching] | — |
| [e.g., Queue] | [Kafka / RabbitMQ / Service Bus] | [Async messaging] | — |

---

## 6. External Integrations / APIs

<!-- Third-party services the system depends on. -->

| Service | Purpose | Method |
|---------|---------|--------|
| [e.g., Stripe] | [Payment processing] | [REST API] |
| [e.g., Azure AD] | [Authentication] | [OIDC / OAuth2] |
| [e.g., SendGrid] | [Email notifications] | [SDK] |

---

## 7. Deployment & Infrastructure

| Aspect | Details |
|--------|---------|
| **Cloud Provider** | [e.g., Azure, AWS, GCP, On-premise] |
| **Compute** | [e.g., AKS, ECS, App Service, Lambda] |
| **Networking** | [e.g., VNet, Load Balancer, API Gateway] |
| **IaC** | [e.g., Terraform, Bicep, CloudFormation] |
| **CI/CD** | [e.g., GitHub Actions, Azure DevOps, CI system] |
| **Environments** | [e.g., dev, staging, production] |

---

## 8. Security Considerations

| Aspect | Details |
|--------|---------|
| **Authentication** | [e.g., OAuth2, OIDC, mTLS, API Keys] |
| **Authorization** | [e.g., RBAC, ABAC, ACLs] |
| **Secrets Management** | [e.g., Azure Key Vault, AWS Secrets Manager, env vars] |
| **Data Encryption** | [e.g., TLS 1.3 in transit, AES-256 at rest] |
| **Network Security** | [e.g., NSG, WAF, private endpoints] |
| **Compliance** | [e.g., SOC2, GDPR, HIPAA — if applicable] |

---

## 9. Development & Testing

| Aspect | Details |
|--------|---------|
| **Local Setup** | [Link to README.md or brief steps] |
| **Build Command** | [e.g., `dotnet build`, `npm run build`, `go build`] |
| **Test Command** | [e.g., `dotnet test`, `npm test`, `go test ./...`] |
| **Testing Frameworks** | [e.g., xUnit, Jest, pytest, Go testing] |
| **Code Quality** | [e.g., ESLint, SonarQube, golangci-lint] |
| **Coverage Target** | [e.g., 80% unit, 60% integration] |

---

## 10. Operations

| Aspect | Details |
|--------|---------|
| **Monitoring** | [e.g., Prometheus + Grafana, Azure Monitor, Datadog] |
| **Logging** | [e.g., ELK Stack, Azure Log Analytics, CloudWatch] |
| **Tracing** | [e.g., OpenTelemetry, Jaeger, Application Insights] |
| **Alerting** | [e.g., PagerDuty, OpsGenie, Azure Alerts] |
| **SLOs** | [e.g., 99.9% availability, p99 < 500ms] |

---

## 11. Architecture Decision Records

<!-- Key decisions that shaped this architecture. Link to full ADRs if they exist. -->

| ADR | Date | Decision | Status |
|-----|------|----------|--------|
| [ADR-001] | [YYYY-MM-DD] | [e.g., Choose PostgreSQL over CosmosDB] | [Accepted / Superseded] |
| [ADR-002] | [YYYY-MM-DD] | [e.g., Adopt CQRS for order processing] | [Accepted] |

<!-- Full ADRs: docs/adr/ or use `/architecture task=adr` to generate. -->

---

## 12. Future Considerations / Roadmap

<!-- Known tech debt, planned migrations, upcoming features impacting architecture. -->

- [e.g., Migrate from monolith to microservices]
- [e.g., Add event-driven architecture for real-time updates]
- [e.g., Introduce API versioning]

---

## 13. Project Identification

| Field | Value |
|-------|-------|
| **Project Name** | [Insert Project Name] |
| **Repository** | [Insert Repository URL] |
| **Team** | [Insert Team Name] |
| **Last Updated** | [YYYY-MM-DD] |

---

## 14. Glossary / Acronyms

| Term | Definition |
|------|------------|
| [Acronym] | [Full definition] |
| [Term] | [Explanation] |