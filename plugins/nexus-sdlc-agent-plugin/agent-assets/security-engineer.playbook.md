# security-engineer Playbook

Operational details, security standards, and compliance checklists for the `security-engineer` agent.

**Source of truth**: [security-engineer.agent.md](../agents/security-engineer.agent.md)

---

## Quick Reference

| Resource | Link |
|----------|------|
| Agent | [security-engineer.agent.md](../agents/security-engineer.agent.md) |
| Code Review Skill | [security-code-review](../skills/security-code-review/SKILL.md) |
| Infrastructure Audit Skill | [security-infrastructure-audit](../skills/security-infrastructure-audit/SKILL.md) |
| Threat Modeling Skill | [threat-modeling](../skills/threat-modeling/SKILL.md) |
| Security Instructions | [security-and-secrets](../instructions/security-and-secrets.instructions.md) |

---

## Output Templates

### Security Finding Template

```markdown
## Finding: {Title}

**Severity**: {Critical/High/Medium/Low}
**Category**: {OWASP category}
**CWE**: {CWE-XXX}
**Location**: {file:line or resource}

### Description
{What the vulnerability is}

### Evidence
{Code snippet, config, or proof}

### Impact
{What an attacker could do}

### Remediation
{Specific fix with code example}

### Verification
{How to confirm the fix works}
```

### Security Review PASSED Template

Use when: No Critical/High findings, only Medium/Low or none.

```markdown
## ✅ Security Review PASSED

**Story**: {JIRA_ID}
**Files reviewed**: {count}
**Issues**: {count} Medium (warnings), {count} Low (informational)

**Warnings** (non-blocking):
- {file}: {issue} — consider fixing

**Result**: Code is safe to submit.
```

### Security Review FAILED Template

Use when: Critical or High severity findings exist.

```markdown
## ❌ Security Review FAILED

**Story**: {JIRA_ID}
**Issues found**: {count} Critical, {count} High

### Must Fix Before Submission:

1. **{Finding title}** ({severity})
   - File: {file}:{line}
   - Issue: {description}
   - Fix: {remediation}

2. ...

**Action**: Fix issues and request security review again.
```

### Security Assessment Report Template

For standalone analysis (non-PR mode):

```markdown
## Security Assessment Report

**Target**: {system/application name}
**Scope**: {what was analyzed}
**Date**: {date}
**Analyst**: security-engineer agent

### Executive Summary
{High-level findings for non-technical stakeholders}

### Findings Summary
| # | Title | Severity | Status |
|---|-------|----------|--------|
| 1 | {title} | Critical | Open |
| 2 | {title} | High | Open |

### Detailed Findings
{Use Finding Template for each}

### Remediation Roadmap
| Priority | Finding | Effort | Owner |
|----------|---------|--------|-------|
| 1 | {title} | {hours} | {team} |

### Compliance Status
| Framework | Status | Notes |
|-----------|--------|-------|
| OWASP ASVS | Partial | {gaps} |
```

---

## OWASP Top 10 (2021) Reference

### A01:2021 - Broken Access Control

**Description**: Restrictions on what authenticated users can do are not properly enforced.

**Common Vulnerabilities**:
- IDOR (Insecure Direct Object Reference)
- Path traversal
- Missing function-level access control
- CORS misconfiguration
- Metadata manipulation (JWT, cookies)

**Detection Patterns**:
```
# Code patterns to search
/GetById\(.*id\)/i          # Direct ID access without AuthZ
/path\.join.*req\./i        # Path traversal risk
/cors.*origin.*\*/i         # Permissive CORS
```

**Remediation**:
- Implement RBAC/ABAC consistently
- Deny by default
- Log and alert on access control failures
- Disable directory listing
- Validate JWT claims on every request

---

### A02:2021 - Cryptographic Failures

**Description**: Failures related to cryptography leading to exposure of sensitive data.

**Common Vulnerabilities**:
- Weak algorithms (MD5, SHA1, DES)
- Hardcoded keys/IVs
- Missing encryption (at rest or in transit)
- Weak TLS configuration
- Predictable random values

**Detection Patterns**:
```
# Weak algorithms
/MD5|SHA1|DES|RC4|Blowfish/i
/\.GetMD5|\.CreateMD5/i
/hashlib\.md5|hashlib\.sha1/i

# Hardcoded keys
/key\s*=\s*["'][a-zA-Z0-9+/=]{16,}/i
/iv\s*=\s*["'][a-zA-Z0-9+/=]{16,}/i
/-----BEGIN.*PRIVATE KEY-----/
```

**Cryptographic Standards**:

| Purpose | Recommended | Deprecated |
|---------|-------------|------------|
| Symmetric Encryption | AES-256-GCM | DES, 3DES, RC4, Blowfish |
| Hashing | SHA-256, SHA-384, SHA-512 | MD5, SHA1 |
| Password Storage | Argon2id, bcrypt, scrypt | PBKDF2 (if <100k iterations), MD5, SHA* |
| Key Exchange | ECDH (P-256+), X25519 | DH (<2048 bit) |
| Signatures | ECDSA (P-256+), Ed25519 | RSA (<2048 bit) |
| TLS | TLS 1.3, TLS 1.2 | TLS 1.0, TLS 1.1, SSL |
| Random | CSPRNG (SecureRandom, RNGCryptoServiceProvider) | Random(), Math.random() |

---

### A03:2021 - Injection

**Description**: User-supplied data is not validated, filtered, or sanitized.

**Types**:
- SQL Injection
- NoSQL Injection
- OS Command Injection
- LDAP Injection
- Expression Language Injection
- XSS (Cross-Site Scripting)
- XXE (XML External Entity)

**Detection Patterns**:
```
# SQL Injection
/execute\(.*\+.*\)/i
/query\(.*\$\{/i
/format.*SELECT|INSERT|UPDATE|DELETE/i

# Command Injection
/exec\(|system\(|popen\(/i
/subprocess\.call.*shell=True/i
/Runtime\.getRuntime\(\)\.exec/i

# XSS
/innerHTML|outerHTML/i
/dangerouslySetInnerHTML/i
/document\.write/i
/\.html\(.*\$/i

# XXE
/DOCTYPE.*ENTITY/i
/SYSTEM\s+["']/i
```

**Remediation by Type**:

| Injection Type | Primary Defense | Secondary Defense |
|----------------|-----------------|-------------------|
| SQL | Parameterized queries | Input validation, WAF |
| Command | Avoid shell, use APIs | Input validation, allowlist |
| XSS | Output encoding | CSP, input validation |
| XXE | Disable DTDs | Use JSON instead |
| LDAP | LDAP encoding | Input validation |

---

### A04:2021 - Insecure Design

**Description**: Missing or ineffective security controls in design.

**Key Concerns**:
- Missing threat modeling
- Lack of security requirements
- No secure design patterns
- Missing rate limiting
- No abuse case testing

**Design Review Checklist**:
- [ ] Threat model exists and is current
- [ ] Trust boundaries defined
- [ ] Defense in depth applied
- [ ] Principle of least privilege
- [ ] Fail-secure defaults
- [ ] Separation of duties
- [ ] Rate limiting designed in
- [ ] Abuse cases considered

---

### A05:2021 - Security Misconfiguration

**Description**: Missing appropriate security hardening.

**Common Issues**:
- Default credentials
- Unnecessary features enabled
- Verbose error messages
- Missing security headers
- Outdated software
- Permissive cloud permissions

**Security Headers Checklist**:

| Header | Recommended Value |
|--------|-------------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | Strict policy (no unsafe-inline) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` |
| `X-XSS-Protection` | `0` (use CSP instead) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disable unused features |

---

### A06:2021 - Vulnerable and Outdated Components

**Description**: Using components with known vulnerabilities.

**Detection**:
```bash
# .NET
dotnet list package --vulnerable

# npm
npm audit

# Python
pip-audit
safety check

# Go
go list -m all | nancy sleuth
```

**Dependency Management**:
- [ ] Automated vulnerability scanning in CI/CD
- [ ] SBOMs (Software Bill of Materials) maintained
- [ ] Dependency update policy defined
- [ ] Private package registry for internal packages
- [ ] Lock files committed (package-lock.json, etc.)

---

### A07:2021 - Identification and Authentication Failures

**Description**: Incorrect implementation of authentication.

**Common Issues**:
- Weak password policies
- Missing MFA
- Session fixation
- Credential stuffing vulnerable
- Insecure password recovery

**Authentication Checklist**:
- [ ] MFA available and encouraged
- [ ] Password complexity enforced (12+ chars, complexity)
- [ ] Account lockout after failures
- [ ] Secure password reset flow
- [ ] Session invalidation on logout
- [ ] Session timeout configured
- [ ] Secure cookie attributes (HttpOnly, Secure, SameSite)
- [ ] Credential stuffing protection (rate limiting, CAPTCHA)

---

### A08:2021 - Software and Data Integrity Failures

**Description**: Code and infrastructure without integrity verification.

**Common Issues**:
- Insecure deserialization
- Unsigned software updates
- Untrusted CI/CD pipelines
- No integrity checks on data

**Insecure Deserialization**:

| Language | Dangerous | Safe Alternative |
|----------|-----------|------------------|
| .NET | BinaryFormatter, NetDataContractSerializer | System.Text.Json with TypeNameHandling.None |
| Java | ObjectInputStream (untrusted) | JSON with type validation |
| Python | pickle, yaml.load | json, yaml.safe_load |
| PHP | unserialize (untrusted) | json_decode |

---

### A09:2021 - Security Logging and Monitoring Failures

**Description**: Insufficient logging to detect attacks.

**What to Log**:
- Authentication events (success, failure)
- Authorization failures
- Input validation failures
- Application errors
- High-value transactions

**What NOT to Log**:
- Passwords (even failed)
- Session tokens
- PII (unless required and encrypted)
- Full credit card numbers
- API keys/secrets

**Logging Checklist**:
- [ ] Centralized logging configured
- [ ] Log retention meets compliance (90+ days)
- [ ] Alerting on security events
- [ ] Log integrity protection
- [ ] No sensitive data in logs
- [ ] Correlation IDs for request tracing

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Description**: Web application fetches remote resource without validating user-supplied URL.

**Detection Patterns**:
```
# URL from user input
/fetch\(.*req\./i
/http\.get\(.*input/i
/WebClient.*Download/i
/urllib\.request\.urlopen/i
```

**Remediation**:
- Allowlist permitted URLs/domains
- Deny by default
- Block internal IPs (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
- Disable redirects or validate redirect targets
- Use network segmentation

---

## Compliance Framework Quick Reference

### SOC 2 Type II

| Trust Principle | Key Controls |
|-----------------|--------------|
| **Security** | Access control, encryption, monitoring |
| **Availability** | DR/BC, redundancy, capacity |
| **Processing Integrity** | QA, error handling, data validation |
| **Confidentiality** | Data classification, encryption, access |
| **Privacy** | PII handling, consent, retention |

### PCI DSS 4.0

| Requirement | Summary |
|-------------|---------|
| 1 | Install and maintain network security controls |
| 2 | Apply secure configurations |
| 3 | Protect stored account data |
| 4 | Protect cardholder data with strong cryptography |
| 5 | Protect from malicious software |
| 6 | Develop and maintain secure systems |
| 7 | Restrict access by business need |
| 8 | Identify users and authenticate access |
| 9 | Restrict physical access |
| 10 | Log and monitor all access |
| 11 | Test security regularly |
| 12 | Support information security with policies |

### HIPAA Security Rule

| Safeguard | Requirements |
|-----------|--------------|
| **Administrative** | Risk analysis, workforce training, incident procedures |
| **Physical** | Facility access, workstation security, device controls |
| **Technical** | Access control, audit controls, integrity, transmission security |

---

## Integration with Code Review

When integrated into PR review workflow:

1. **Automated Triggers**:
   - Changes to auth/authz code
   - Changes to crypto/security code
   - Changes to input handling
   - New dependencies added

2. **Review Focus Areas**:
   - New code: Full security review
   - Modified code: Delta review + regression check
   - Dependencies: Vulnerability scan

3. **Sign-off Requirements**:
   - Critical/High findings: Block merge
   - Medium findings: Documented acceptance
   - Low findings: Track for future fix
