---
name: confluence-publish-report
description: Publish a Jira completion report table to Confluence. Resolves the space numeric ID, names the page as <requestor>_<PI>_<reportDate>_Jira_progress_report, creates or updates the page, and returns the published page URL.
agent: jira-github-report-analyzer
argument-hint: "requestor=himanshu.parihar pi=PI-2602 reportDate=2026-03-05 spaceKey=DOCS parentPageId=1094516746"
---

Publish the Jira completion report to Confluence.

## Inputs
- **Requestor** (the person running this report — included in page body): ${input:requestor}
- **PI** (Program Increment, e.g. `PI-2602`): ${input:pi}
- **Report date** (default: today, format `YYYY-MM-DD`): ${input:reportDate}
- **Report table** (markdown table from previous step): ${input:reportTable}
- **Summary bullet points**: ${input:summaryBullets}
- **Report period** (e.g. `February 5 – February 19, 2026`): ${input:reportPeriod}
- **Confluence space key** (e.g. `DOCS`): ${input:spaceKey:DOCS}
- **Parent page ID** (optional): ${input:parentPageId}
- **cloudId** (required — resolved by agent via `list_accessible_resources` before calling this prompt): ${input:cloudId}

## Instructions

### 1. Resolve numeric space ID
If `spaceKey` is a string (not numeric), call `getConfluenceSpaces` with `cloudId: <cloudId>, keys: [spaceKey]` and extract the numeric `id` field.
Use that numeric ID as `spaceId` in all subsequent calls.

### 2. Build page title
Format: `<requestor>_<PI>_<reportDate>_Jira_progress_report`
Example: `himanshu.parihar_PI-2602_2026-03-05_Jira_progress_report`

Use `reportDate` for the date portion. If not provided, use today's date.

### 3. Compose page body (markdown)
```
## Jira Completion Report

**Period:** <reportPeriod>
**PI:** <pi>
**Requestor:** <requestor>
**Report Date:** <reportDate>

---

## Summary

<summaryBullets>

---

## Completed Jira Items

<reportTable>

*Engineers with no completed issues in this period: <none list>*
```

### 4. Create or update the page
First check if a page with the same title already exists in the space:
- Search for an existing page via `searchConfluenceUsingCql` with `cloudId: <cloudId>` and CQL `title = "<page-title>" AND space = "<spaceKey>"`.
- If a page **exists**:
  - Fetch the current page via `getConfluencePage` with `cloudId: <cloudId>, pageId: <existing-page-id>` to obtain the current `version.number`.
  - Call `updateConfluencePage` with `cloudId: <cloudId>`, the existing page ID, the new body, and `version: <current-version + 1>`.
- If **no page exists**: call `createConfluencePage` with:
  - `cloudId`: resolved cloudId
  - `spaceId`: resolved numeric space ID
  - `parentId`: parentPageId (if provided)
  - `title`: page title from step 2
  - `body`: composed markdown from step 3
  - `contentFormat`: `markdown`

### 5. Return result
Output the published page URL in the format:
`https://example.atlassian.net/wiki/spaces/<spaceKey>/pages/<pageId>/<page-title-slug>`

### Error handling
- If `spaceKey` cannot be resolved to a numeric ID, report the error and ask the user to provide the numeric space ID directly.
- If `cloudId` is unknown, ask the user before proceeding.
- If `parentPageId` is provided but invalid, attempt creation at the space root and warn the user.
