---
name: splunk-connectivity-test
description: Test Splunk MCP connectivity by running search queries. Prompts for region selection and validates query execution capability before diagnostic work.
---

# Splunk Connectivity Test Skill

## When to Use

- Before running any Splunk queries for troubleshooting
- User reports inability to retrieve logs
- Verifying MCP server configuration
- Validating Splunk access

## Region Selection

Ask which Splunk instance to test:

- **US/AP** (Americas, Asia-Pacific) -> Use `mcp_splunk-sys_*` tools
- **EU** (Europe) -> Use `mcp_splunk-eu_*` tools
- **BOTH** -> Test both systems sequentially

## Quick Connectivity Test

### Test US/AP System (splunk-sys)

```typescript
// Step 1: Run a simple search to verify query execution
mcp_splunk-sys_run_splunk_query({
  query: '| metadata type=sources index=* | head 3',
  earliest_time: "-5m",
  latest_time: "now",
  row_limit: 3
})

// Step 2: Verify system health
mcp_splunk-sys_get_splunk_info()

// Step 3: Confirm index access
mcp_splunk-sys_get_indexes({ row_limit: 10 })

// Step 4: Test user authentication
mcp_splunk-sys_get_user_info()
```

### Test EU System (splunk-eu)

```typescript
// Step 1: Run a simple search to verify query execution
mcp_splunk-eu_run_splunk_query({
  query: '| metadata type=sources index=* | head 3',
  earliest_time: "-5m",
  latest_time: "now",
  row_limit: 3
})

// Step 2: Verify system health
mcp_splunk-eu_get_splunk_info()

// Step 3: Confirm index access
mcp_splunk-eu_get_indexes({ row_limit: 10 })

// Step 4: Test user authentication
mcp_splunk-eu_get_user_info()
```

## Expected Results

- **Success**: Query returns data (or empty result set), system operational
- **Failure**: Error message, timeout, or authentication failure
- **Partial**: Query succeeds but other operations fail (proceed with caution)

## Result Report

```markdown
## Splunk Connectivity Report

| System | Status | Details |
|--------|--------|---------|
| splunk-sys (US/AP) | OK/FAIL | {detail} |
| splunk-eu (EU) | OK/FAIL | {detail} |

### Tests Performed
| # | Test | splunk-sys | splunk-eu |
|---|------|-----------|----------|
| 1 | Query execution | {result} | {result} |
| 2 | System info | {result} | {result} |
| 3 | Index listing | {result} | {result} |
| 4 | User auth | {result} | {result} |
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MCP tool not available | Ensure Splunk MCP server is configured in `.mcp.json` or workspace settings |
| Authentication failure | Refresh Splunk token or check API credentials |
| Timeout | Splunk instance may be under heavy load; retry after a few minutes |
| No indexes visible | Check Splunk role/permissions for the authenticated user |
