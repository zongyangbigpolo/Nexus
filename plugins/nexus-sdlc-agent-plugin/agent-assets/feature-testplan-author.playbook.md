# feature-testplan-author Playbook

Operational details for the `feature-testplan-author` custom agent.

**Source of truth**: [feature-testplan-author.agent.md](../agents/feature-testplan-author.agent.md)

---

## Quick Reference

| Need | Section |
|------|---------|
| Test case format & examples | [Test Case Format](#test-case-format) |
| Section templates | [Section Writing Templates](#section-writing-templates) |
| Confluence update mechanics | [Confluence Update Mechanics](#confluence-update-mechanics) |
| Citrix doc reference links | [Citrix Documentation Reference](#citrix-documentation-reference) |
| Non-functional criteria | [Non-Functional Test Criteria](#non-functional-test-criteria) |
| Priority definitions | [Priority Definitions](#priority-definitions) |

---

## Test Case Format

### Table Format (per section)

Use Confluence-compatible Markdown tables:

```markdown
| TC-ID | Title | Priority | Preconditions | Steps | Expected Result |
|-------|-------|----------|---------------|-------|-----------------|
| FUNC-CORE-001 | User launches web app via CWA | P0 | User authenticated, app published, Gateway reachable | 1. Open CWA 2. Click published web app | App opens in managed Chrome with SSO; policies enforced |
```

### Given/When/Then Format (for complex cases)

Use sparingly — only when preconditions and multi-step behavior genuinely need extra clarity:

```markdown
**TC-ID**: FUNC-CORE-002  
**Title**: SSO with SAML authentication to SaaS app  
**Priority**: P0

**Given**:
- User has valid AD credentials
- SaaS app configured with SAML SSO in SPA admin console

**When**:
- User authenticates via StoreFront and clicks the SaaS app

**Then**:
- App opens without re-authentication; security policies (clipboard, download) enforced
```

### Step Conciseness Rules

**This test plan will be executed by another agent** — keep steps minimal and action-oriented.

- **Maximum 3–5 steps per test case** — never exceed 7
- **Write at the WHAT level**, not HOW level:
  - ✅ "Configure SAML SSO for the app"
  - ❌ "1. Open admin console 2. Navigate to Apps 3. Click Add 4. Select SAML 5. Enter IdP URL 6. Upload cert 7. Map attributes 8. Save 9. Publish"
- **Omit obvious/implicit actions**: login, navigation to well-known pages, waiting for page loads
- **Combine related micro-steps** into one logical action
- **If a test genuinely needs >7 steps**, split into separate test cases
- **Preconditions absorb setup** — move environment/config setup to preconditions, not steps

### Test Case ID Convention

| Prefix | Section |
|--------|---------|
| `FUNC-CORE-nnn` | Functional — Core Flows |
| `FUNC-ADMIN-nnn` | Functional — Admin & Configuration |
| `FUNC-EDGE-nnn` | Functional — Edge & Negative Cases |
| `INTG-nnn` | Integration Tests |
| `NFR-PERF-nnn` | Non-Functional — Performance |
| `NFR-SEC-nnn` | Non-Functional — Security |
| `NFR-REL-nnn` | Non-Functional — Reliability |
| `NFR-SCALE-nnn` | Non-Functional — Scalability |
| `NFR-COMPAT-nnn` | Non-Functional — Compatibility |
| `REG-nnn` | Regression Impact |

---

## Priority Definitions

| Priority | Meaning | Example |
|----------|---------|---------|
| P0 | **Blocker** — Must pass before any release. Core functionality. | User cannot authenticate; app fails to launch |
| P1 | **Critical** — Must pass for GA. Major feature broken. | SSO fails for specific IdP; policy not enforced |
| P2 | **Important** — Should pass. Reduced functionality or UX. | Slow app enumeration; minor UI glitch in admin console |
| P3 | **Nice-to-have** — Low impact. Cosmetic or rare edge case. | Tooltip text incorrect; uncommon browser/OS combo |

**Distribution target**: ~20% P0, ~30% P1, ~35% P2, ~15% P3

---

## Section Writing Templates

### Section 1: Metadata & Overview

```markdown
# Test Plan: <Feature Name>

**AI-Generated Test Plan — <date>**

| Field | Value |
|-------|-------|
| Feature | <Feature name> |
| Specification | [Link to spec](<spec URL>) |
| JIRA Reference | <JIRA ID or "N/A"> |
| Author | AI-Generated (feature-testplan-author agent) |
| Date | <date> |
| Status | Draft |

## Objective
<1-2 sentences: what this test plan validates>

## Scope

### In Scope
- <Bullet list of features/components being tested>

### Out of Scope
- <Bullet list of explicitly excluded items>

## Assumptions
- <Conditions assumed true during testing>

## References
- [Citrix SPA Hybrid Documentation](https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid)
- [NetScaler Gateway Documentation](https://docs.netscaler.com/en-us/netscaler-gateway/current-release/about-citrix-gateway.html)
- <Additional relevant links>
```

### Section 2: Test Strategy

```markdown
## Test Strategy

### Test Approach
<Brief description of testing approach: manual, automated, hybrid>

### Test Levels
| Level | Description | Tools/Method |
|-------|-------------|-------------|
| Unit | Component-level validation | <framework> |
| Integration | Cross-component interaction | <method> |
| System | End-to-end user workflows | <method> |
| Non-Functional | Performance, security, reliability | <tools> |

### Entry Criteria
- Feature spec is approved and stable
- Test environment is provisioned with required components
- NetScaler Gateway, StoreFront, Cloud Connector deployed and configured
- Test accounts and policies created

### Exit Criteria
- All P0 and P1 test cases pass
- No open P0/P1 defects
- P2 defects triaged and accepted or deferred
- Non-functional benchmarks met

### Test Environments
| Environment | Components | Purpose |
|-------------|------------|---------|
| <env name> | <components> | <purpose> |

### Test Data Requirements
- <List required test data: users, apps, policies, certificates>
```

### Sections 3–5: Functional Test Cases

Each functional section uses the table format and is organized by feature area:

```markdown
## Functional Tests — <Sub-category>

### <Feature Area 1>

| TC-ID | Title | Priority | Preconditions | Steps | Expected Result |
|-------|-------|----------|---------------|-------|-----------------|
| ... | ... | ... | ... | ... | ... |

### <Feature Area 2>
...
```

**Guidelines for functional test generation:**
- Cover **happy path** first (P0/P1)
- Then **alternate flows** (P1/P2)
- Then **error/edge cases** (P2/P3)
- Group by feature area or user workflow
- One test case = one verifiable scenario (avoid compound tests)
- **3–5 steps max per test case** — move setup to preconditions, write WHAT not HOW
- Prefer table format; use Given/When/Then only when genuinely needed for clarity

### Section 6: Integration Tests

```markdown
## Integration Tests

### <Component A> ↔ <Component B>

| TC-ID | Title | Priority | Preconditions | Steps | Expected Result |
|-------|-------|----------|---------------|-------|-----------------|
| INTG-001 | ... | ... | ... | ... | ... |
```

**Common integration pairs to consider:**
- NetScaler Gateway ↔ StoreFront
- Cloud Connector ↔ Citrix Cloud (SPA service)
- NetScaler Gateway ↔ Authentication servers (LDAP, RADIUS, SAML IdP)
- CSA Client ↔ NetScaler Gateway
- Chrome Browser ↔ Chrome Enterprise Premium ↔ NetScaler Gateway
- SPA Admin Console ↔ Cloud Connector (policy sync)
- StoreFront ↔ App enumeration service
- Device Posture service ↔ Access policy engine

### Section 7: Non-Functional Tests

```markdown
## Non-Functional Tests

### Performance
| TC-ID | Title | Priority | Metric | Target | Steps | Expected Result |
|-------|-------|----------|--------|--------|-------|-----------------|
| NFR-PERF-001 | App launch latency | P1 | Time to interactive | < X seconds | ... | ... |

### Security
| TC-ID | Title | Priority | Threat | Steps | Expected Result |
|-------|-------|----------|--------|-------|-----------------|
| NFR-SEC-001 | Unauthorized access blocked | P0 | Auth bypass | ... | ... |

### Reliability
...

### Scalability
...

### Compatibility
| TC-ID | Title | Priority | Platform | Steps | Expected Result |
|-------|-------|----------|----------|-------|-----------------|
| NFR-COMPAT-001 | Chrome on Windows 11 | P1 | Win11 + Chrome 120+ | ... | ... |
```

### Section 8: Regression Impact

```markdown
## Regression Impact

### Risk Assessment
| Area | Risk Level | Reason |
|------|-----------|---------|
| <existing feature> | High/Medium/Low | <why this feature might break> |

### Recommended Regression Suite Additions
- <Test cases to add to existing regression suites>

### Existing Flows to Retest
- <List of existing workflows that may be impacted>
```

---

## Confluence Update Mechanics

### 🛡️ Write Scope Guardrail

The agent operates with **two distinct Confluence pages**:

| Page | Access | Purpose |
|------|--------|---------|
| **Spec source page** | **READ-ONLY** | Feature specification input — never modify |
| **Output page** | **READ-WRITE** | Test plan destination — the only page the agent writes to |

**Rules:**
- ✅ Read the spec page as many times as needed
- ❌ NEVER update, comment on, or modify the spec page via Confluence API
- ❌ NEVER write to any Confluence page other than the designated output page

### Content Mode (Overwrite vs Amend)

Before writing, the agent checks whether the output page has existing content:

| Mode | When | Behavior |
|------|------|----------|
| **Overwrite** | User chose overwrite, or page is empty | Clear page body and write test plan fresh |
| **Amend** | User chose amend (default if page has content) | Preserve all existing content and append below |

In **Amend** mode, the push phase must read and include the full existing body.
In **Overwrite** mode, the first push replaces the page body entirely.

### Technical Behavior — Why Local-First?

Confluence API **replaces the full page body** on each update. This means every update requires sending the **complete page content** (existing + new). If you omit previously written sections, they will be deleted.

**The Problem**: With 8 per-section updates, cumulative LLM output grows to ~125 KB. By section 5 (~18 KB body + new content), output regularly exceeds token limits and the agent stalls.

**The Solution — Local-First Generation + Batched Push**:
1. Generate all 8 sections to a local temp file (each append is ~3-5 KB, no Confluence calls)
2. Push to Confluence in 2–3 batched updates instead of 8 individual ones
3. Total LLM output drops from ~125 KB to ~50 KB
4. Generation phase **never stalls** because each step is a small local file operation

### Local-First Generation Strategy

**Phase 2A — Generate to Local File**

Create a temp file and append each section:

```
1. CREATE temp file: /tmp/testplan-<feature-slug>.md
2. For each section (1 through 8):
   a. GENERATE the section content (tables, test cases, etc.)
   b. APPEND to the temp file (use terminal: echo/cat >> or replace_string_in_file)
   c. MOVE to next section immediately — no Confluence calls
3. All 8 sections now exist in the local file
```

**Implementation details:**
- Use `create_file` to create the temp file with Section 1 content
- For subsequent sections, use terminal commands to append:
  ```bash
  cat >> /tmp/testplan-<slug>.md << 'SECTION_END'
  <section content here>
  SECTION_END
  ```
- Alternatively, use `replace_string_in_file` to append before an end marker
- Each generation step produces only ~3-5 KB of new content — fast and reliable
- The agent's creative work (test case generation) happens here, fully decoupled from Confluence

**Phase 2B — Batched Confluence Push**

After all sections are generated locally, push to Confluence in 2-3 batches:

| Batch | Sections | Content Source | Confluence Operation |
|-------|----------|---------------|---------------------|
| 1 | 1–4 | Read from local file | **Overwrite**: write directly. **Amend**: read existing page + prepend existing content. |
| 2 | 5–6 | Read from local file | Read existing page (sections 1–4) → append sections 5–6 → update |
| 3 | 7–8 | Read from local file | Read existing page (sections 1–6) → append sections 7–8 → update |

**Push batch mechanics:**
```
1. READ sections for this batch from the local temp file
2. READ current Confluence page content via getConfluencePage (contentFormat: "markdown")
3. CONCATENATE: existing_confluence_body + "\n\n" + batch_sections_from_file
4. SUBMIT via updateConfluencePage (contentFormat: "markdown", include versionMessage)
5. VERIFY by re-reading the page — check all expected sections are present
```

### ⚠️ CRITICAL: Preventing Stuck Pushes

**Mandatory Rules for Push Phase:**
- ✅ **ALWAYS use `contentFormat: "markdown"`** for both reads and writes — it is far more compact than ADF
- ✅ **Read batch content from the local file** — do not regenerate from memory
- ✅ **Treat existing Confluence content as an opaque blob** — copy it verbatim, never regenerate
- ✅ **Use `versionMessage`** on each update (e.g., "Added Sections 1-4: Metadata through Admin & Config")
- ❌ **NEVER regenerate previous sections** from memory — always read from file/API
- ❌ **NEVER paraphrase, summarize, or shorten existing page content** to fit
- ❌ **NEVER use ADF format** — always use markdown

**If a batch push fails (body too large):** Split batch into individual section pushes. If still too large, sub-chunk sections by feature area (max 5 test cases per sub-chunk). Thresholds: >25 KB body → split batch; >10 test cases → split section.

### Legacy: Pass-Through Pattern (Fallback)

If file system is unavailable: per-section Confluence read → store existing body verbatim → append new section → update (markdown format) → verify. ⚠️ Stalls after 3-4 sections — prefer local-first.

### Append-Only Content Strategy

In Amend mode: never delete/overwrite human-authored content; append new sections labeled "AI-Generated Test Plan — <date>". If content appears incorrect, add a correction note without removing the original.

### Troubleshooting: Generation or Push Issues

If the agent encounters problems during local generation or Confluence push:

| Symptom | Cause | Fix |
|---------|-------|-----|
| Agent stalls during Confluence push | LLM output token limit hit — existing page body + new batch too large | Split the batch into smaller sub-batches (e.g., push 2 sections instead of 3) |
| Agent stalls during section generation | Section has too many test cases being generated at once | Cap at 8-10 test cases per section; split large sections by feature area |
| Previous sections vanish after push | Agent regenerated content instead of reading from file/API | Re-read Confluence page; restore from version history; read content from local file |
| Push API returns error | Body too large or malformed markdown | Switch to smaller sub-batches; verify markdown is valid; check for unclosed tables |
| Verification shows missing content | Partial write due to size | Re-read, identify missing sections, push only the missing content |

### Content Verification

After any Confluence update, **ALWAYS verify**: Fetch updated page → confirm ALL expected sections present with real content (not placeholders) → if anything missing, re-read and re-update immediately.

---

## Non-Functional Test Criteria

### Performance Benchmarks (SPA Hybrid typical targets)

| Metric | Target | Notes |
|--------|--------|-------|
| App launch time (web) | < 5 seconds | From click to interactive |
| Authentication latency | < 3 seconds | Including MFA if configured |
| App enumeration | < 2 seconds | StoreFront response time |
| Policy sync (Cloud Connector) | < 60 seconds | Config propagation delay |
| CSA client connection setup | < 10 seconds | TCP/UDP tunnel establishment |
| Concurrent user sessions | Per deployment sizing | Depends on NetScaler model |

### Security Test Categories

| Category | What to Test |
|----------|-------------|
| Authentication bypass | Attempt access without valid credentials; expired tokens; replay attacks |
| Authorization enforcement | Access apps outside policy scope; escalate privileges; cross-tenant access |
| Data leakage prevention | Clipboard copy, screenshot, download, print restrictions per policy |
| Session security | Session hijacking, session timeout enforcement, concurrent session limits |
| Certificate validation | Expired certs, self-signed certs, cert pinning bypass |
| Injection / input validation | Admin console input fields, API parameters |
| Network security | Split tunneling behavior, DNS leak, traffic inspection |

### Reliability Test Categories

| Category | What to Test |
|----------|-------------|
| Cloud Connector failover | Connector goes offline; cached policies used; reconnection behavior |
| NetScaler Gateway HA | Primary gateway failure; failover to secondary; session persistence |
| StoreFront failover | Primary StoreFront unavailable; server group behavior |
| Network interruption | Intermittent connectivity; VPN reconnection; partial packet loss |
| Graceful degradation | Citrix Cloud unavailable; on-prem-only operation mode |

---

## Citrix Documentation Reference

### Always Fetch (Baseline)

| URL | Purpose |
|-----|---------|
| `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid` | SPA Hybrid overview, components, architecture, limitations |
| `https://docs.netscaler.com/en-us/netscaler-gateway/current-release/about-citrix-gateway.html` | NetScaler Gateway architecture, user connection flows |

### Conditional Fetch (Based on Feature Scope)

| Feature Area | URL |
|-------------|-----|
| Authentication | `https://docs.netscaler.com/en-us/netscaler-gateway/current-release/authentication-authorization` |
| StoreFront | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-storefront-config` |
| NetScaler Config | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-netscaler-configuration` |
| Cloud Connector | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-cloud-connector-configuration` |
| Chrome / CEP | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-cep-spa-integration` |
| Device Posture | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-device-posture` |
| Troubleshooting | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-troubleshoot-triage` |
| System Requirements | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-system-requirements` |
| What's New | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-whats-new` |
| Known Issues | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-known-issues` |
| End User Flow | `https://docs.citrix.com/en-us/citrix-secure-private-access/hybrid/spa-hybrid-end-user-flow` |

---

## SPA Hybrid Component Awareness

When generating test cases, the agent must reason about these component interactions:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Citrix Cloud (Control Plane)               │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ SPA Admin Console│  │ Citrix Monitor  │  │ Policy Engine │  │
│  └────────┬─────────┘  └────────┬────────┘  └───────┬───────┘  │
│           │                     │                    │          │
└───────────┼─────────────────────┼────────────────────┼──────────┘
            │ Config sync         │ Telemetry          │ Policies
            ▼                     ▼                    ▼
┌───────────────────────────────────────────────────────────────┐
│                    On-Premises (Data Plane)                    │
│  ┌─────────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │ Cloud Connector │  │  StoreFront   │  │NetScaler Gateway│ │
│  │ (policy cache)  │  │ (app store)   │  │ (auth + VPN)   │  │
│  └─────────────────┘  └───────────────┘  └───┬────────────┘  │
│                                               │               │
└───────────────────────────────────────────────┼───────────────┘
                                                │
            ┌───────────────────────────────────┤
            ▼                                   ▼
    ┌───────────────┐                   ┌───────────────┐
    │  CSA Client   │                   │Chrome + CEP   │
    │ (TCP/UDP apps)│                   │(Web/SaaS apps)│
    └───────────────┘                   └───────────────┘
```

### Key Interaction Patterns to Test

1. **Policy sync flow**: Admin creates policy → Cloud → Cloud Connector → cached → enforced at Gateway
2. **App launch flow**: User → StoreFront → app enumerated → Gateway → app opened in Chrome/CSA
3. **Auth flow**: User → Gateway → auth server (LDAP/RADIUS/SAML) → session created → token issued
4. **Failover flow**: Primary component fails → secondary takes over → session persistence
5. **Offline flow**: Cloud unavailable → Cloud Connector uses cached config → limited but functional
