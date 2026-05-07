# architect Playbook — Security Specialization

Operational details for the **Security Architect** specialization of the `architect` agent.

**Source of truth**: [architect.agent.md](../../agents/architect.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [architect.agent.md](../../agents/architect.agent.md) |
| Threat Modeling Skill | [threat-modeling](../../skills/threat-modeling/SKILL.md) |
| Security Instructions | [security-and-secrets](../../instructions/security-and-secrets.instructions.md) |
| Azure Audit Skill | [azure-resource-audit](../../skills/azure-resource-audit/SKILL.md) |

---

## Role Definition

### Security Architect Scope
- Threat modeling and risk assessment
- Security architecture and controls design
- Identity and access management
- Cryptography and key management
- Compliance frameworks and mapping
- Secure SDLC integration
- Security monitoring and detection

---

## Core Frameworks

### STRIDE Threat Model

| Threat | Description | Mitigation Category |
|--------|-------------|---------------------|
| **S**poofing | Pretending to be someone else | Authentication |
| **T**ampering | Modifying data or code | Integrity |
| **R**epudiation | Denying actions | Non-repudiation, Logging |
| **I**nformation Disclosure | Exposing information | Confidentiality |
| **D**enial of Service | Disrupting availability | Availability |
| **E**levation of Privilege | Gaining unauthorized access | Authorization |

### PASTA (Process for Attack Simulation and Threat Analysis)

| Stage | Activities |
|-------|------------|
| 1. Define Objectives | Business objectives, security requirements |
| 2. Define Technical Scope | Components, dependencies, data flows |
| 3. Application Decomposition | Architecture, trust boundaries |
| 4. Threat Analysis | Threat intelligence, attack patterns |
| 5. Vulnerability Analysis | Weaknesses, CVEs |
| 6. Attack Modeling | Attack trees, scenarios |
| 7. Risk & Impact Analysis | Likelihood, impact, prioritization |

### NIST Cybersecurity Framework

| Function | Categories |
|----------|------------|
| Identify | Asset management, risk assessment, governance |
| Protect | Access control, training, data security |
| Detect | Anomalies, monitoring, detection processes |
| Respond | Response planning, communications, mitigation |
| Recover | Recovery planning, improvements |

### Zero Trust Principles

| Principle | Implementation |
|-----------|----------------|
| Verify explicitly | Always authenticate and authorize |
| Least privilege | JIT/JEA, risk-based adaptive policies |
| Assume breach | Segment access, verify E2E, use analytics |

---

## Threat Modeling

### Threat Model Document Template

```markdown
# Threat Model: {System/Feature Name}

## Overview
- **Author**: {Name}
- **Date**: {Date}
- **Version**: {Version}
- **Status**: {Draft/Review/Approved}

## System Description
{Brief description of the system/feature}

## Data Flow Diagram
{Include diagram showing components, data flows, trust boundaries}

## Assets
| Asset | Classification | Description |
|-------|----------------|-------------|
| {Asset 1} | {Confidential/Internal/Public} | {What it is} |

## Trust Boundaries
| Boundary | From | To | Controls |
|----------|------|-----|----------|
| {Boundary 1} | {Zone A} | {Zone B} | {Authentication, encryption} |

## Threat Analysis (STRIDE)

### Component: {Component Name}
| Threat | Description | Likelihood | Impact | Risk | Mitigation |
|--------|-------------|------------|--------|------|------------|
| Spoofing | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |
| Tampering | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |
| Repudiation | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |
| Info Disclosure | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |
| DoS | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |
| EoP | {Scenario} | {H/M/L} | {H/M/L} | {H/M/L} | {Control} |

## Security Requirements
| ID | Requirement | Priority | Control |
|----|-------------|----------|---------|
| SR-001 | {Requirement} | {High/Medium/Low} | {Implementation} |

## Residual Risks
| Risk | Justification | Owner |
|------|---------------|-------|
| {Risk} | {Why accepted} | {Person/Team} |

## Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
```

### Data Flow Diagram (DFD) Notation

```
┌─────────┐     ┌─────────────┐     ┌─────────┐
│ External│     │             │     │ Data    │
│ Entity  │────►│  Process    │────►│ Store   │
│ (Actor) │     │             │     │         │
└─────────┘     └─────────────┘     └─────────┘
    ▲                  │
    │                  ▼
    │           ═══════════════  Trust Boundary
    │
    └─────────── Data Flow (labeled)
```

---

## Security Controls

### Defense in Depth Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Perimeter                                               │
│ • WAF, DDoS protection, Edge security                           │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Network                                                 │
│ • Segmentation, NSGs, Firewall, Private endpoints               │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Identity                                                │
│ • MFA, Conditional Access, PIM, Service principals              │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: Application                                             │
│ • Input validation, AuthN/AuthZ, Secure coding                  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5: Data                                                    │
│ • Encryption at rest/transit, Key management, DLP               │
├─────────────────────────────────────────────────────────────────┤
│ Layer 6: Endpoint                                                │
│ • EDR, Hardening, Patch management                              │
└─────────────────────────────────────────────────────────────────┘
```

### Control Mapping Template

```markdown
## Security Controls Matrix: {System}

| Category | Control | Implementation | Evidence | Status |
|----------|---------|----------------|----------|--------|
| Identity | MFA enforced | Azure AD Conditional Access | Policy screenshot | ✅ |
| Identity | Privileged access | Azure PIM | PIM config | ✅ |
| Network | Segmentation | NSG rules + Private endpoints | ARM templates | ✅ |
| Network | WAF | Azure Front Door WAF | WAF policy | ✅ |
| Data | Encryption at rest | Azure Storage encryption | Storage config | ✅ |
| Data | Encryption in transit | TLS 1.3 | SSL Labs scan | ✅ |
| Data | Key management | Azure Key Vault | Key Vault policy | ✅ |
| Application | Input validation | OWASP guidelines | Code review | 🔄 |
| Application | AuthN/AuthZ | OAuth 2.0 / OIDC | Architecture doc | ✅ |
| Logging | Audit logs | Azure Monitor + Sentinel | Log Analytics | ✅ |
| Logging | SIEM integration | Microsoft Sentinel | Alert rules | ✅ |
```

---

## Identity & Access Management

### IAM Architecture Patterns

**Federated Identity**:
```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   External   │     │  Identity   │     │ Application  │
│   IdP        │◄───►│  Provider   │◄───►│              │
│   (Okta)     │SAML │  (Azure AD) │OIDC │              │
└──────────────┘     └─────────────┘     └──────────────┘
```

**Service-to-Service**:
```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Service A  │     │  Azure AD   │     │  Service B   │
│ (Managed ID) │────►│   OAuth2    │────►│ (App Reg)    │
└──────────────┘     │ client_creds│     └──────────────┘
                     └─────────────┘
```

### IAM Checklist

- [ ] Least privilege principle applied
- [ ] MFA enforced for all users
- [ ] Privileged access through PIM/PAM
- [ ] Service accounts use managed identities
- [ ] API authentication via OAuth 2.0 / OIDC
- [ ] Token lifetime appropriate (short-lived)
- [ ] Refresh token rotation enabled
- [ ] Emergency access accounts configured
- [ ] Access reviews scheduled
- [ ] Separation of duties enforced

---

## Cryptography

### Cryptographic Standards

| Purpose | Algorithm | Key Size | Notes |
|---------|-----------|----------|-------|
| Symmetric encryption | AES-GCM | 256-bit | Preferred for data at rest |
| Asymmetric encryption | RSA | 2048+ bit | For key exchange |
| Digital signatures | ECDSA | P-256+ | Preferred over RSA |
| Hashing | SHA-256+ | - | SHA-1 deprecated |
| Password storage | Argon2id | - | bcrypt acceptable |
| TLS | TLS 1.3 | - | TLS 1.2 minimum |

### Key Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Azure Key Vault                            │
├─────────────────────────────────────────────────────────────────┤
│   Keys          │   Secrets         │   Certificates            │
│   • CMK         │   • Conn strings  │   • TLS certs             │
│   • Signing     │   • API keys      │   • Client certs          │
├─────────────────────────────────────────────────────────────────┤
│   Access Policies / RBAC                                         │
│   • Service principals (managed identity)                        │
│   • Admin access via PIM                                         │
├─────────────────────────────────────────────────────────────────┤
│   Audit & Monitoring                                             │
│   • All operations logged to Log Analytics                       │
│   • Alerts on sensitive operations                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Compliance Frameworks

### Common Frameworks

| Framework | Scope | Key Requirements |
|-----------|-------|------------------|
| SOC 2 | Service organizations | Security, Availability, Processing Integrity, Confidentiality, Privacy |
| PCI DSS | Payment card data | Network security, encryption, access control, monitoring |
| HIPAA | Healthcare data | Privacy rule, security rule, breach notification |
| GDPR | EU personal data | Consent, data subject rights, breach notification |
| ISO 27001 | Information security | ISMS, risk management, controls |
| FedRAMP | US government cloud | NIST 800-53 controls |

### Compliance Mapping Template

```markdown
## Compliance Control Mapping: {Framework}

| Control ID | Requirement | Implementation | Evidence | Gap |
|------------|-------------|----------------|----------|-----|
| {ID} | {Requirement text} | {How implemented} | {Where documented} | {Yes/No} |
```

---

## Secure SDLC Integration

### Security Activities by Phase

| Phase | Activities |
|-------|------------|
| Requirements | Security requirements, abuse cases |
| Design | Threat modeling, security architecture |
| Implementation | Secure coding, static analysis (SAST) |
| Testing | Dynamic testing (DAST), penetration testing |
| Deployment | Configuration review, secrets scanning |
| Operations | Monitoring, vulnerability management |

### Security Gates

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Code   │───►│  Build  │───►│   Test  │───►│ Deploy  │───►│  Prod   │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
 ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐
 │ SAST  │     │ SCA   │     │ DAST  │     │Config │     │Monitor│
 │ Scan  │     │ Scan  │     │ Scan  │     │Review │     │& Hunt │
 └───────┘     └───────┘     └───────┘     └───────┘     └───────┘
```

### Security Tools by Category

| Category | Tools | When |
|----------|-------|------|
| SAST | SonarQube, Checkmarx, Semgrep | Every commit |
| SCA | Dependabot, Snyk, Mend | Every commit |
| Secrets scanning | Gitleaks, truffleHog | Pre-commit, CI |
| DAST | OWASP ZAP, Burp Suite | Pre-release |
| Container scanning | Aqua, Defender | Build time |
| IaC scanning | Checkov, tfsec | Every commit |

---

## Security Monitoring

### Detection Strategy

| Category | Sources | Alerts |
|----------|---------|--------|
| Identity | Azure AD logs, sign-in logs | Failed auth, risky users, MFA bypass |
| Network | NSG flow logs, firewall logs | Unusual traffic, blocked connections |
| Application | App logs, WAF logs | Injection attempts, auth failures |
| Data | Storage logs, DLP | Data exfiltration, unusual access |
| Endpoint | EDR, audit logs | Malware, lateral movement |

### SIEM Rules Template

```markdown
## Security Alert: {Alert Name}

### Description
{What this alert detects}

### Query
```kql
{KQL query for Microsoft Sentinel}
```

### Severity
{High/Medium/Low}

### MITRE ATT&CK
- **Tactic**: {Tactic}
- **Technique**: {Technique ID and name}

### Response Playbook
1. {Step 1}
2. {Step 2}
3. {Step 3}

### False Positive Handling
{How to identify and handle FPs}
```

---

## Checklists

### Security Architecture Review

- [ ] Threat model documented
- [ ] Trust boundaries identified
- [ ] Authentication mechanism appropriate
- [ ] Authorization model defined
- [ ] Data classification completed
- [ ] Encryption requirements met
- [ ] Key management strategy defined
- [ ] Audit logging configured
- [ ] Security monitoring in place
- [ ] Incident response plan documented
- [ ] Compliance requirements mapped
- [ ] Secure SDLC integrated

### Pre-Production Security Review

- [ ] Threat model updated for final design
- [ ] All high/critical vulnerabilities remediated
- [ ] Penetration testing completed
- [ ] Security configurations reviewed
- [ ] Secrets removed from code/config
- [ ] Access controls validated
- [ ] Logging and monitoring verified
- [ ] Security documentation complete
- [ ] Compliance evidence collected
- [ ] Security sign-off obtained
