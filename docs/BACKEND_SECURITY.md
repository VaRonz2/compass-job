# Backend Security Baseline

This project is currently static and localStorage-based. These rules apply before adding accounts, API routes, databases, file upload, AI analysis, 投稿, or iOS sync.

## Security Boundaries

- Public data: verified company summaries, qualification catalog, public event links, general practice questions.
- User-private data: favorites, applications, schedules, notes, files, certificates, ES drafts, interview answers.
- Moderated public data: 投稿, senpai advice, interview reports, and shared ES examples.
- Internal-only data: admin moderation tools, source import logs, API keys, scraping/import jobs.

## Authentication

- Use email/social login or a managed auth provider when backend starts.
- Sessions should expire and be refreshable safely.
- No default admin account.
- Passwords must never be stored directly if custom auth is used.

## Authorization

- Every user-private read/write must verify the current user owns the record.
- Admin-only actions must be server-side enforced.
- 投稿 moderation status must not be client-controlled.
- iOS and web must use the same authorization rules.

## Input Validation

Validate on the server even if the frontend already validates:
- company name length
- URLs
- dates and date ranges
- enum fields like application status and schedule type
- note and memo length
- file type and file size
- pagination limits
- search query length

## File Uploads

If file upload becomes server-backed:
- Limit size and allowed types.
- Store files under user-scoped paths.
- Do not execute or transform uploaded files through shell commands.
- Scan or quarantine risky formats when possible.
- Generate signed URLs rather than public permanent links for private files.

## AI / ES Analysis

- Treat ES drafts as private sensitive user content.
- Do not send ES text to external APIs without clear user consent and privacy notice.
- Do not log raw ES text, tokens, or personal identifiers.
- Provide delete/export options if account sync exists.

## 投稿 and Community Content

-投稿 must have moderation before public display.
- Add report/hide flow.
- Prevent personal information leakage in public examples.
- Do not allow users to publish copied third-party paid content.

## Secrets

- API keys must live in environment variables or provider secret storage.
- Never place secrets in frontend bundles, screenshots, docs, or commits.

## Abuse Controls

Add rate limits for:
- login
- password reset
- search/import
- AI analysis
- 投稿 creation
- file upload

## Audit Logs

Log security-relevant events without storing private content:
- login failures
- permission failures
- admin moderation actions
- file upload/delete
- account export/delete
- source import changes

## Safe API Skeleton Checks

When backend begins, verify:
- unauthenticated users cannot read private schedules
- user A cannot read or modify user B's companies, notes, files, or ES drafts
- invalid dates and oversized text return controlled errors
- injected-looking strings are stored as data, not executed
- private files are not publicly accessible
