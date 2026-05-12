# feature-planner Playbook

This document contains detailed reference material for the `feature-planner` agent.

> **Shared templates**: For common JIRA templates (project mapping, AC format, sizing),
> see [jira-common playbook](jira-common.playbook.md).

**Source of truth**: The agent file ([feature-planner.agent.md](../agents/feature-planner.agent.md)) defines:
- Role and objective
- Execution workflow (phases)
- Constraints and error recovery
- Handoff definitions

This playbook provides **operational details only**: examples, templates, mappings, and checklists.

---

## Quick Reference

| Need | Section |
|------|---------|
| JIRA project mapping | [JIRA Project & Component Mapping](#jira-project--component-mapping) |
| Story sizing | [Story Sizing Guidelines](#story-sizing-guidelines) |
| Acceptance criteria format | [Acceptance Criteria Format](#acceptance-criteria-format) |
| Story categories checklist | [Common Story Categories](#common-story-categories) |
| Full quality checklist | [Quality Checklist](#quality-checklist-before-finalizing) |
| ENG/Epic/Story examples | [Examples](#example-ctxeng-output) |

---

## Incremental Mode Checklist

- Ask for the exact Confluence section link.
- Extract deltas (APIs, DB, config, UI, migration, telemetry, security).
- Identify affected component(s).
- Search for existing Epic(s) first; create Epic only if missing.
- Create only the missing Stories.

**JQL for finding existing Epics**:
```
project = APP2 AND type = Epic AND summary ~ "[Component]" AND status != Done
```

## Acceptance Criteria Format

Use a short, testable checklist. Preferred format:

```
Given [context/precondition]
When [action]
Then [expected outcome]

✅ [Specific condition 1]
✅ [Specific condition 2]
✅ [Unit tests added with >80% coverage]
✅ [Integration test added]
✅ [Code reviewed and approved]
✅ [Documentation updated]
```

**Example**:
```
Given an authenticated user with admin role
When they call GET /api/v1/gateways/regions
Then they receive a 200 response with JSON array of regions

✅ Response includes region, endpoint, health, lastChecked
✅ Handles empty results (no gateways) with 200 and empty array
✅ Returns 401 for unauthenticated requests
✅ Unit tests cover success and error cases
✅ Swagger documentation updated
```

## Story Writing Checklist

Each Story should include:
- What to change (files/modules/components)
- API contracts (if relevant)
- Data model changes (if relevant)
- Risk/edge cases
- Validation steps

**Story Characteristics**:
- ✅ **Small & Focused**: Completable in 1-3 days
- ✅ **Testable**: Clear acceptance criteria
- ✅ **Independent**: Minimal dependencies on other stories (where possible)
- ✅ **Valuable**: Delivers a discrete piece of functionality

**Summary Guidelines**:
- Start with action verb: "Implement", "Add", "Update", "Fix", "Create"
- ✅ **Good**: "Implement multi-region gateway discovery API"
- ❌ **Bad**: "Work on gateway stuff"

---

## JIRA Project & Component Mapping

> **Note**: This section contains **APP-specific** mappings as a reference example.
> For other repositories, check the repository's `AGENTS.md` for project/component mappings,
> or ask the user if not documented.

Use this table to determine the correct JIRA project and component for each Epic/Story:

| Component/Service | JIRA Project | Component Name | Team |
|-------------------|--------------|----------------|------|
| **APP Proxy Service** | `APP2` | `APP Proxy Service` | APP Hybrid Team |
| **APP Plugin** (Broker) | `APP2` | `Broker - Runtime` | APP Hybrid Team |
| **APP Admin UI** | `APP2` | `Console - UI` | APP UI Team |
| **APP Micro Frontend (MFE)** | `APP2` | `Console - UI` | APP UI Team |
| **APP Config Service** | `APP` | `GW Core` | APP Service Team |
| **CEP Integration Service** | `APP` | `CEP Integration Service` | APP Service Team |
| **Gateway Core** | `APP` | `GW Core` | APP Service Team |

**Default Investment Type**: `CTXBV Linked Feature`

**Component Auto-Detection Examples**:
- File path `src/Organization.Spa.Web.Api.SpaProxyService/...` → APP Proxy Service → APP2
- Section heading "Admin UI Changes" → APP Admin UI → APP2, Console - UI
- Service name "CEP Integration Service" → CEP Integration Service → APP
- File path `src/Broker/Runtime/...` → APP Plugin (Broker) → APP2, Broker - Runtime

---

## Story Sizing Guidelines

Use Fibonacci scale for story points:

| Points | Effort | Complexity | Uncertainty |
|--------|--------|------------|-------------|
| **1** | < 1 day | Simple, well-understood | Very low |
| **2** | 1-2 days | Straightforward with minor unknowns | Low |
| **3** | 2-3 days | Moderate complexity | Medium |
| **5** | 3-5 days | Complex or multiple unknowns | Medium-High |
| **8** | > 5 days | Very complex, needs breakdown | High |

**Rule**: If a Story is estimated at 8+ points, break it down into smaller Stories.

**Estimation Tips**:
- Estimate based on development time (coding + unit testing)
- Don't include code review or QA time in points
- When in doubt, round up or split the Story

---

## Common Story Categories

Ensure these categories are covered when breaking down a feature:

### Backend Development
- [ ] API endpoint implementation
- [ ] Business logic/service layer
- [ ] Data access layer/repository
- [ ] Database migrations
- [ ] Background jobs/workers
- [ ] Event handlers

### Frontend Development  
- [ ] UI components
- [ ] State management
- [ ] API integration
- [ ] Form validation
- [ ] Routing
- [ ] Accessibility (ARIA, keyboard navigation)

### Testing
- [ ] Unit tests (per component)
- [ ] Integration tests (API contracts)
- [ ] Performance tests
- [ ] Security tests

### Infrastructure & DevOps
- [ ] Configuration changes
- [ ] Feature flags
- [ ] Deployment scripts
- [ ] Database migration scripts
- [ ] Monitoring/alerting setup
- [ ] Health checks

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture decision records (ADRs)
- [ ] Runbook updates
- [ ] README updates
- [ ] User-facing documentation

### Security & Compliance
- [ ] Threat model review
- [ ] Security testing
- [ ] PII/data protection
- [ ] Authentication/authorization
- [ ] Audit logging

---

## Example: ENG Output

When creating a ENG (feature-level) ticket, use this format:

**Required Fields**:
- **Project**: `ENG`
- **Issue Type**: `ENG`
- **Summary**: `[Feature Name]`
- **Description**: Business value, objectives, affected components, success criteria
- **Link to Confluence specification**
- **Labels**: `feature`, `AI-Generated`, component tags
- **Components**: List all affected components
- **Fix Version**: Target release version
- **Priority**: Based on business priority

**Template**:
```
ENG-XXXXX: [Feature Name]
Target: Q2 2026 Release
Owner: Engineering Manager - APP Team

Description:
[Feature description and business value]

Affected Components:
- APP Proxy Service
- APP Plugin (Broker)
- APP Admin UI

Epic Breakdown:
1. APP2-XXX: APP Proxy Service - [Feature Name] (X stories, Y points)
2. APP2-XXX: APP Plugin - [Feature Name] (X stories, Y points)
3. APP2-XXX: APP Admin UI - [Feature Name] (X stories, Y points)

Success Criteria:
- [ ] All stories completed and merged
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security review completed
```

---

## Example: Epic Output

**Required Fields**:
- **Project**: Use correct project based on component (see mapping)
- **Issue Type**: `Epic`
- **Epic Name**: `[Component] - [Feature Name]`
- **Summary**: Same as Epic Name
- **Description**: Component-specific changes, technical design, APIs/DB changes
- **Epic Link**: Link to ENG
- **Components**: Select the appropriate component
- **Assignee**: Component tech lead or team lead
- **Labels**: `AI-Generated`, component-specific tags
- **Story Points**: Estimated total effort (sum of stories)

**Before Creating**: Print confirmation:
```
Creating Epic:
  Project: [APP2/APP/etc - based on component mapping]
  Title: [Component] - [Feature Name]
  Component: [Specific component name]
  Parent: [ENG ticket ID] - [ENG title]
```

---

## Example: Story Output

**Template**:
```
APP2-XXX: Implement Gateway API for [Feature]

Description:
Implement the REST API endpoint for [specific functionality].
Files: Controllers/GatewayController.cs, Services/GatewayDiscoveryService.cs

Acceptance Criteria:
- [ ] GET /api/v1/resource returns expected response
- [ ] POST /api/v1/resource creates new resource
- [ ] Unit tests cover happy path and error cases
- [ ] API documentation updated

Technical Notes:
- Follow existing controller patterns
- Use dependency injection for service dependencies
- Add OpenAPI annotations for Swagger docs

Story Points: 3
Component: APP Proxy Service
Labels: AI-Generated, api
```

**Before Creating**: Print confirmation:
```
Creating Story:
  Project: [Same as Epic]
  Title: [Action-oriented summary]
  Component: [Same as Epic component]
  Epic Link: [Epic ticket ID] - [Epic title]
```

---

## Example: Complete JIRA Hierarchy with Dependencies

```
ENG-1234: APP Gateway Failover & Multi-Region Support
|
+-- Epic: APP2-567: APP Proxy Service - Gateway Failover
    |
    | Execution Order (based on dependencies):
    | 1. APP2-569 (DB Migration) --> APP2-568 (API)
    | 2. APP2-570 (Health Check) --> APP2-568 (API)
    | 3. APP2-568 (API) --> APP2-571 (Orchestration)
    | 4. APP2-571 --> APP2-572 (Circuit Breaker), APP2-573 (Integration)
    | 5. APP2-572, APP2-573 --> APP2-574 (Config)
    |
    +-- Story: APP2-568: Implement Gateway Discovery API (3 pts)
    |         blocked by: APP2-569, APP2-570
    +-- Story: APP2-569: Add Database Migration for Gateway Regions (2 pts)
    |         blocks: APP2-568
    +-- Story: APP2-570: Implement Health Check Service (3 pts)
    |         blocks: APP2-568
    +-- Story: APP2-571: Build Failover Orchestration Logic (5 pts)
    |         blocked by: APP2-568
    +-- Story: APP2-572: Add Circuit Breaker Pattern (3 pts)
    |         blocked by: APP2-571
    +-- Story: APP2-573: Add Integration Tests for Failover (3 pts)
    |         blocked by: APP2-571
    +-- Story: APP2-574: Update Configuration Schema (2 pts)
              blocked by: APP2-572, APP2-573
│
├── Epic: APP2-600: APP Plugin - Multi-Region Discovery
│   ├── Story: APP2-601: Add Region Discovery Client (3 pts)
│   │         blocks: APP2-602
│   ├── Story: APP2-602: Implement Gateway Selection Logic (3 pts)
│   │         blocked by: APP2-601, blocks: APP2-603
│   ├── Story: APP2-603: Add Unit Tests for Region Selection (2 pts)
│   │         blocked by: APP2-602
│   └── Story: APP2-604: Update Plugin Configuration (1 pt)
│             blocked by: APP2-602
│
└── Epic: APP2-650: APP Admin UI - Region Management
    ├── Story: APP2-651: Create Region Configuration Page (5 pts)
    │         blocks: APP2-652, APP2-653
    ├── Story: APP2-652: Add Gateway Health Status Widget (3 pts)
    │         blocked by: APP2-651
    ├── Story: APP2-653: Implement Region CRUD Operations (3 pts)
    │         blocked by: APP2-651
    └── Story: APP2-654: Add Tests for Region UI (2 pts)
            blocked by: APP2-652, APP2-653
```

**Cross-Epic Dependencies** (if applicable):
```
APP2-602 (Plugin - Gateway Selection) 
    is blocked by: APP2-568 (Proxy - Gateway API)
    
APP2-652 (UI - Health Widget)
    is blocked by: APP2-570 (Proxy - Health Check Service)
```

---

## Example: Incremental Story Creation

**Scenario**: Feature spec was updated with a new "Rate Limiting" section. User provides link: `https://example.atlassian.net/wiki/spaces/~user/pages/123456#RateLimiting`

**Workflow**:

1. **Parse Section**: Read "Rate Limiting" section from Confluence
   - Extracted: Add rate limiting middleware, new config settings, update API responses
   
2. **Identify Component**: "APP Proxy Service"

3. **Map to JIRA Project**: `APP2`

4. **Search for Existing Epic**:
   ```
   JQL: project = APP2 AND type = Epic AND summary ~ "APP Proxy Service" AND status != Done
   ```
   - Found: `APP2-567: APP Proxy Service - Gateway Failover`

5. **Create New Stories** (linked to APP2-567):
   ```
   APP2-575: Add Rate Limiting Middleware to Settings API
   - Labels: AI-Generated, api, performance
   - Story Points: 3
   - Epic Link: APP2-567
   
   APP2-576: Add Rate Limit Configuration to appsettings.json
   - Labels: AI-Generated, configuration
   - Story Points: 1
   - Epic Link: APP2-567
   
   APP2-577: Update API Responses to Include Rate Limit Headers
   - Labels: AI-Generated, api
   - Story Points: 2
   - Epic Link: APP2-567
   
   APP2-578: Add Integration Tests for Rate Limiting
   - Labels: AI-Generated, testing
   - Story Points: 3
   - Epic Link: APP2-567
   ```

---

## Quality Checklist (Before Finalizing)

**ENG**:
- ✅ Complete description with business value
- ✅ Links to Confluence spec
- ✅ All affected components listed
- ✅ Target release specified

**Epics**:
- ✅ One Epic per affected component
- ✅ All Epics linked to ENG
- ✅ Technical design summary included
- ✅ Assigned to component owners

**Stories**:
- ✅ All implementation work captured
- ✅ Each Story has clear acceptance criteria
- ✅ Story points estimated
- ✅ Dependencies identified and linked
- ✅ Stories are right-sized (1-3 day effort)
- ✅ Test scenarios included
- ✅ No orphaned or unlinked Stories

**Coverage Check**:
- ✅ All API changes have Stories
- ✅ All database changes have Stories
- ✅ All UI changes have Stories
- ✅ Security requirements addressed
- ✅ Testing Stories included
- ✅ Documentation Stories included
- ✅ Deployment/DevOps Stories included

---

## Success Criteria

The JIRA structure is complete when:
- ✅ **Traceability**: Every line in the spec maps to at least one Story
- ✅ **Clarity**: Engineers can pick up any Story and start working immediately
- ✅ **Testability**: Every Story has measurable acceptance criteria
- ✅ **Completeness**: All aspects covered (dev, test, docs, deployment)
- ✅ **Balanced**: No single Epic has >50% of total story points
- ✅ **Dependencies**: All blocking relationships documented
- ✅ **Ownership**: Every Epic/Story has an assignee or team

---

## Post-Creation Tasks

After creating all JIRAs:
1. **Review with Tech Leads**: Validate breakdown and estimates
2. **Sequence Work**: Order Stories in Epics by dependency and priority
3. **Assign to Sprint**: Add Stories to upcoming sprints based on capacity
4. **Notify Teams**: Share ENG link with all affected teams
5. **Track Progress**: Monitor Epic/Story completion in dashboards