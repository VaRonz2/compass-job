# ComPASS Milestones

## M0: Stabilize Current Prototype

Goal: keep the current static web app reliable while scope changes continue.

Exit criteria:
- `index.html`, `styles.css`, and `app.js` load with matching cache versions.
- `node --check app.js` passes.
- `http://localhost:5173/` returns 200 through the local server.
- Browser check confirms no current-version console errors.
- My Page and Job Learning reflect the latest product decisions.

Verification:
- Run `node --check app.js`.
- Start with `start-server.cmd`.
- Open `http://localhost:5173/`.
- Check My Page, Job Learning, Company Search, and Qualification Learning.

## M1: Personal Job-Hunting Command Center

Goal: make My Page the most useful part of the app.

Scope:
- Improve monthly calendar event density and readability.
- Add clearer event types and color coding.
- Make company stage board directly actionable.
- Let users add deadlines from company cards into the calendar.
- Keep `締め切り` focused on user-selected companies.

Exit criteria:
- A user can manage a complete monthly job-hunting schedule from My Page.
- No duplicate or confusing dashboard blocks.
- Calendar and schedule layout stays around 6:4 on desktop and one column on mobile.

## M2: Company Page Repositioning

Goal: turn company search into a decision support and import page, not just a giant list.

Scope:
- Keep compact filters.
- Prioritize custom add, source links, deadlines, foreigner support indicators, and notes.
- Add clearer labels for candidate/sample/unverified data.
- Consider "add from URL/manual paste" flow later.

Exit criteria:
- Users understand that built-in companies are candidates unless verified.
- Users can quickly add external companies from Mynavi, Rikunabi, Indeed, LinkedIn, or official pages.
- Company details explain business content in Japanese.

## M3: Qualification Learning Rework

Goal: make qualifications discoverable by career goal and category.

Scope:
- Tag system: A tags for job/career direction, B tags for language, IT, business, finance, service, etc.
- Show qualifications after tag selection.
- Keep all qualifications available through "全て".
- Calendar remains visible and useful.

Exit criteria:
- Users can answer "what qualification should I take for this industry?"
- Cards are not a long unfiltered wall.
- Status colors are clear: available, unavailable, past, urgent.

## M4: Job Learning as Practice Tool

Goal: make Job Learning feel useful through active practice.

Scope:
- Improve question generator UX.
- Add category scoring/history locally.
- Keep reverse questions with answer drafts.
- Add curated external links for official/test-prep resources.
- Consider 投稿 only after moderation and data rules exist.

Exit criteria:
- User can practice, reveal answers, and track weak areas.
- Page is not just static reading.

## M5: Data Reliability Upgrade

Goal: separate real verified information from placeholders.

Scope:
- Add clear data status for each company field.
- Store source URL, source type, checked date, and confidence.
- Add scripts for controlled imports from public/open sources.
- Avoid storing third-party review body text.

Exit criteria:
- Company data can be audited.
- UI never presents candidate data as confirmed.

## M6: Backend and iOS Readiness

Goal: prepare shared data sync for future web and iOS.

Scope:
- Choose backend approach, likely Supabase or small API + database.
- Define user accounts, applications, schedules, companies, files, and notes schema.
- Move from localStorage-only to account-backed sync.
- Keep local backup/export.

Exit criteria:
- Web and future iOS can share the same API.
- User data ownership and privacy rules are documented and testable.
