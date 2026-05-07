---
name: security
description: Deep security analysis of code, infrastructure, configurations, or logs. Uses OWASP, NIST, CIS standards.
agent: security-engineer
---

# Security Analysis

Perform deep security analysis using industry-standard methodologies.

## Target

${input:target:What to analyze? (code, PR, config, logs, infrastructure)}

## Analysis Scope

${input:scope:Focus area (auth, crypto, injection, all)}

## Compliance Framework (optional)

${input:compliance:SOC 2, PCI DSS, HIPAA, or none}

---

**Target**: ${input:target}
**Scope**: ${input:scope}
**Compliance**: ${input:compliance}

## Examples
```
/security target="review staged changes" scope=auth
/security target="src/api/auth/" scope=injection
/security target="infrastructure" compliance="SOC 2"
```
