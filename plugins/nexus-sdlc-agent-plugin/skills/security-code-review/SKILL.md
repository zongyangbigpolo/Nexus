---
name: security-code-review
description: Deep security code review skill. Analyzes code for vulnerabilities using OWASP, CWE, and language-specific security patterns.
---

# Security Code Review Skill

## When to Use
- Pull request security review
- Pre-release security audit
- Code security assessment
- After security incident (similar code patterns)
- Compliance verification (ASVS)

## Prerequisites
- Access to code files or PR diff
- Understanding of application context (from AGENTS.md)
- Knowledge of data classification

## Workflow

### Step 1: Identify Security-Critical Code

**Priority targets** (analyze first):
- Authentication/authorization logic
- Session management
- Cryptographic operations
- Input handling (user data, files, URLs)
- Database queries
- External API calls
- File operations
- Serialization/deserialization
- Logging (for sensitive data leaks)

### Step 2: Language-Specific Checks

#### .NET / C#

| Vulnerability | Pattern | Fix |
|---------------|---------|-----|
| SQL Injection | `string.Format()` in SQL, string concatenation | Use parameterized queries, EF Core |
| XSS | `Html.Raw()`, missing encoding | Use `HtmlEncoder`, Razor auto-encoding |
| Path Traversal | `Path.Combine()` with user input | Validate path, use allowlist |
| Insecure Deserialization | `BinaryFormatter`, `JavaScriptSerializer` | Use `System.Text.Json` with type validation |
| CSRF | Missing `[ValidateAntiForgeryToken]` | Add attribute, use `asp-antiforgery` |
| Hardcoded Secrets | Strings in code | Use `IConfiguration`, Key Vault |
| Weak Crypto | MD5, SHA1, DES | Use SHA256+, AES-GCM |

```csharp
// ❌ Vulnerable: SQL Injection
var query = $"SELECT * FROM Users WHERE Name = '{userInput}'";

// ✅ Secure: Parameterized query
var user = await context.Users
    .Where(u => u.Name == userInput)
    .FirstOrDefaultAsync();
```

#### TypeScript / JavaScript

| Vulnerability | Pattern | Fix |
|---------------|---------|-----|
| XSS | `innerHTML`, `dangerouslySetInnerHTML` | Use `textContent`, DOMPurify |
| Prototype Pollution | `Object.assign()` with user data | Use `Object.create(null)`, validation |
| Command Injection | `exec()` with user input | Use `execFile()`, parameterize |
| Path Traversal | `path.join()` without validation | Validate, resolve and check |
| SSRF | `fetch()` with user URL | URL allowlist, validation |
| eval() | Any use of `eval()` | Avoid completely |
| Regex DoS | Nested quantifiers | Use safe-regex, RE2 |

```typescript
// ❌ Vulnerable: XSS
element.innerHTML = userInput;

// ✅ Secure: Text content
element.textContent = userInput;
// Or with sanitization
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### Python

| Vulnerability | Pattern | Fix |
|---------------|---------|-----|
| SQL Injection | f-strings in SQL | Use parameterized queries |
| Command Injection | `os.system()`, `subprocess.call(shell=True)` | Use `subprocess.run()` with list args |
| Pickle Deserialization | `pickle.loads()` with untrusted data | Use JSON, validate |
| SSTI | User input in template | Sanitize, use auto-escaping |
| Path Traversal | `open()` with user input | Use `os.path.realpath()`, validate |
| YAML Deserialization | `yaml.load()` | Use `yaml.safe_load()` |

```python
# ❌ Vulnerable: SQL Injection
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# ✅ Secure: Parameterized
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))
```

#### Go

| Vulnerability | Pattern | Fix |
|---------------|---------|-----|
| SQL Injection | `fmt.Sprintf()` in SQL | Use `db.Query()` with args |
| Command Injection | `exec.Command()` without validation | Validate, avoid shell |
| Path Traversal | `filepath.Join()` without validation | Use `filepath.Clean()`, validate |
| SSRF | `http.Get()` with user URL | URL validation, allowlist |
| Race Conditions | Shared state without sync | Use mutex, channels |

```go
// ❌ Vulnerable: SQL Injection
query := fmt.Sprintf("SELECT * FROM users WHERE name = '%s'", userInput)

// ✅ Secure: Parameterized
rows, err := db.Query("SELECT * FROM users WHERE name = $1", userInput)
```

### Step 3: OWASP Top 10 Checklist

| # | Category | What to Check |
|---|----------|---------------|
| A01 | Broken Access Control | AuthZ checks, IDOR, path traversal, CORS |
| A02 | Cryptographic Failures | Weak crypto, hardcoded keys, missing encryption |
| A03 | Injection | SQLi, XSS, command injection, LDAP, XXE |
| A04 | Insecure Design | Missing threat model, trust boundaries |
| A05 | Security Misconfiguration | Debug enabled, default creds, verbose errors |
| A06 | Vulnerable Components | Outdated dependencies, known CVEs |
| A07 | Auth Failures | Weak passwords, missing MFA, session issues |
| A08 | Software/Data Integrity | Insecure deserialization, unsigned updates |
| A09 | Logging Failures | Missing logs, sensitive data logged |
| A10 | SSRF | Unvalidated URLs, internal access |

### Step 4: Finding Template

```markdown
## [SEVERITY] Finding: {Title}

**CWE**: CWE-{XXX} - {Name}
**OWASP**: {A01-A10 Category}
**Location**: `{file}:{line}`
**Confidence**: {High/Medium/Low}

### Vulnerable Code
```{language}
{code snippet with issue highlighted}
```

### Attack Scenario
{How an attacker could exploit this}

### Impact
- **Confidentiality**: {impact}
- **Integrity**: {impact}
- **Availability**: {impact}

### Remediation
```{language}
{fixed code}
```

### References
- {CWE link}
- {OWASP link}
- {Language-specific guidance}
```

### Step 5: Report Summary

```markdown
## Security Code Review Summary

**Scope**: {files/PR reviewed}
**Date**: {date}
**Reviewer**: security-engineer

### Statistics
| Severity | Count |
|----------|-------|
| Critical | {n} |
| High | {n} |
| Medium | {n} |
| Low | {n} |

### Findings Overview
| # | Severity | Finding | Location | Status |
|---|----------|---------|----------|--------|
| 1 | Critical | {title} | {file:line} | Open |

### Recommendations
1. {Priority action}
2. {Next action}
```

## Common False Positives

| Pattern | Why False Positive | Verification |
|---------|-------------------|--------------|
| Sanitized input used in query | Input already validated | Trace data flow |
| Test/mock credentials | In test code only | Check file location |
| Encoded output | Already HTML-encoded | Check output context |
| Internal API call | Not user-controlled | Verify call source |

## Integration Points

- Use with [code-review-checklist](../code-review-checklist/SKILL.md) for full review
- Escalate architectural issues to `architect` (security specialization)
- Create tickets via `jira-manager` for each finding
