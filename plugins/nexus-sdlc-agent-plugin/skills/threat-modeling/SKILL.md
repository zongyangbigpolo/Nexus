---
name: threat-modeling
description: Generate threat models using STRIDE methodology. Creates data flow diagrams, identifies threats, and recommends mitigations for system components.
---

# Threat Modeling Skill

## When to Use
- New feature or system design
- Security architecture review
- Pre-release security assessment
- Compliance requirements (SOC 2, PCI DSS)
- After significant architecture changes

## Prerequisites
- System architecture documentation
- Data flow understanding
- Component inventory
- Trust boundary identification

## Workflow

### Step 1: Define Scope

Clarify with user:
```markdown
- System/feature name: {name}
- In scope components: {list}
- Out of scope: {list}
- Data classification: {public/internal/confidential/restricted}
```

### Step 2: Create Data Flow Diagram

Generate ASCII DFD showing:
- External entities (users, systems)
- Processes (services, APIs)
- Data stores (databases, caches)
- Data flows (labeled with data type)
- Trust boundaries

**DFD Template**:
```
                    Trust Boundary: External
══════════════════════════════════════════════════════════
    ┌─────────┐                    
    │  User   │                    
    │(Browser)│                    
    └────┬────┘                    
         │ HTTPS                   
         │ (credentials, data)     
══════════════════════════════════════════════════════════
    Trust Boundary: DMZ
         │                         
         ▼                         
    ┌─────────┐                    
    │   WAF   │                    
    │         │                    
    └────┬────┘                    
         │                         
══════════════════════════════════════════════════════════
    Trust Boundary: Application
         │                         
         ▼                         
    ┌──────────────┐     ┌──────────────┐
    │  API Gateway │────►│   Service    │
    │  (AuthN)     │     │              │
    └──────────────┘     └──────┬───────┘
                                │
══════════════════════════════════════════════════════════
    Trust Boundary: Data
                                │
                                ▼
                         ┌──────────────┐
                         │   Database   │
                         │  (PII Data)  │
                         └──────────────┘
```

### Step 3: Enumerate Assets

| Asset | Classification | Location | Description |
|-------|----------------|----------|-------------|
| User credentials | Restricted | Transit, API Gateway | Username/password, tokens |
| PII data | Confidential | Database, Service | Customer personal data |
| Session tokens | Restricted | Browser, API Gateway | JWT tokens |
| API keys | Restricted | Key Vault | Service authentication |

### Step 4: Apply STRIDE per Element

For each element crossing a trust boundary, analyze:

| Element | Threat Category | Questions |
|---------|-----------------|-----------|
| External Entity | Spoofing | Can identity be faked? |
| Process | All STRIDE | Full analysis needed |
| Data Store | Tampering, Info Disclosure, DoS | Data integrity? Access control? |
| Data Flow | Tampering, Info Disclosure | Encryption? Integrity checks? |

### Step 5: Generate Threat Table

For each identified threat:

```markdown
| ID | Element | Threat | Category | Description | Likelihood | Impact | Risk | Mitigation |
|----|---------|--------|----------|-------------|------------|--------|------|------------|
| T001 | API Gateway | Spoofing | S | Attacker uses stolen credentials | Medium | High | High | MFA, token expiry |
| T002 | Data Flow | Tampering | T | MITM attack on data | Low | High | Medium | TLS 1.3, cert pinning |
| T003 | Service | Repudiation | R | User denies transaction | Medium | Medium | Medium | Audit logging |
| T004 | Database | Info Disclosure | I | SQL injection exposes data | Medium | Critical | High | Parameterized queries |
| T005 | API Gateway | DoS | D | Request flooding | Medium | High | High | Rate limiting, WAF |
| T006 | Service | EoP | E | JWT manipulation | Low | Critical | High | Signature validation |
```

### Step 6: Risk Rating

**Likelihood**: Based on attacker capability and opportunity
- High: Common attack, low skill required
- Medium: Known attack vector, moderate skill
- Low: Complex attack, high skill required

**Impact**: Based on business/security consequences
- Critical: System compromise, major data breach
- High: Significant data exposure, service outage
- Medium: Limited data exposure, degraded service
- Low: Minor impact, easily recoverable

**Risk Matrix**:
```
           │ Low      Medium    High
───────────┼─────────────────────────
Critical   │ High     Critical  Critical
High       │ Medium   High      Critical
Medium     │ Low      Medium    High
Low        │ Low      Low       Medium
```

### Step 7: Generate Mitigations

For each High/Critical risk:

```markdown
## Mitigation: {Threat ID}

### Threat
{Description of the threat}

### Recommended Controls
1. **Primary**: {Main mitigation}
2. **Secondary**: {Defense in depth}
3. **Detective**: {How to detect if exploited}

### Implementation
- {Specific technical guidance}
- {Configuration/code example}

### Verification
- {How to test the mitigation}
```

### Step 8: Output Threat Model Document

Combine all sections into final document:

```markdown
# Threat Model: {System Name}

## Document Control
| Field | Value |
|-------|-------|
| Author | {Name} |
| Date | {Date} |
| Version | {Version} |
| Status | {Draft/Review/Approved} |
| Next Review | {Date} |

## Executive Summary
{High-level findings and recommendations}

## Scope
{In scope / out of scope}

## Data Flow Diagram
{DFD from Step 2}

## Assets
{Table from Step 3}

## Threat Analysis
{Table from Step 5}

## Risk Summary
| Risk Level | Count |
|------------|-------|
| Critical | {n} |
| High | {n} |
| Medium | {n} |
| Low | {n} |

## Mitigations
{Details from Step 7}

## Residual Risks
{Accepted risks with justification}

## Action Items
| # | Action | Owner | Priority | Due Date |
|---|--------|-------|----------|----------|

## Appendix
- Related documentation
- References
```

## Quick STRIDE Reference

| Category | Question | Common Mitigations |
|----------|----------|-------------------|
| **Spoofing** | Can someone pretend to be something/someone else? | Authentication, MFA, certificates |
| **Tampering** | Can data be modified? | Integrity checks, signatures, encryption |
| **Repudiation** | Can actions be denied? | Audit logs, digital signatures |
| **Info Disclosure** | Can data be exposed? | Encryption, access control, DLP |
| **Denial of Service** | Can availability be impacted? | Rate limiting, scaling, redundancy |
| **Elevation of Privilege** | Can unauthorized access be gained? | Authorization, least privilege, input validation |

## Integration with Security Playbook

After generating threat model, reference:
- [architect-security playbook](../../agent-assets/architect/architect-security.playbook.md) for control frameworks
- [azure-resource-audit skill](../azure-resource-audit/SKILL.md) for Azure security validation
