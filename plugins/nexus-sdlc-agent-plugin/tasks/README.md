# Task Files Directory

This directory contains task files created by `dev-coordinator` during development workflows.

## Lifecycle

1. **Created**: When dev-coordinator starts working on a Story/Bug
2. **Updated**: Developer updates progress during implementation
3. **Added as comment**: Content added to JIRA ticket as comment upon completion
4. **Deleted**: From repository after comment added (not committed to history)

## File Format

Files are named: `{JIRA_ID}-task.md`

Example: `SPAOP-12345-task.md`

## Contents

Each task file contains:
- Story/Bug context from JIRA
- Parent Epic/CTXENG context
- Implementation plan with steps
- Progress log
- Files modified
- Notes and risks

## Note

Task files should NOT be committed to version control. They are:
- Created on feature branches
- Added as JIRA comment before PR
- Deleted from branch before merge

If you see task files in this directory on master branch, they should be cleaned up.
