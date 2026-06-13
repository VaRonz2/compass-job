# ComPASS MVP

## Product Thesis

The first valuable version is not a giant job board. It is a practical job-hunting cockpit for international students in Japan: collect companies, track dates, study qualifications, practice tests, and prepare interview materials.

## Must Have

- Top navigation: 首页, 搜索公司, 资格学习, 就活学习, 我的页面.
- Company discovery page with Japanese company names, Japanese business descriptions, filters, status, review summary, foreign hiring data status, source freshness, and detail view.
- Custom company entry so users can add companies found on Mynavi, Rikunabi, Indeed, LinkedIn, school pages, or official company sites.
- My Page with:
  - top counters for current entry, briefing, interview, and offer
  - monthly calendar
  - schedule form for briefing, interview, ES deadline, web test, follow-up, and other events
  - deadline section inside the calendar/schedule area
  - owned certificates
  - company stage board
  - local backup and restore
- Qualification learning page with category tags or grouped overview, status indicators, monthly calendar, recommended top qualifications, and official/self-study links.
- Job learning page with external practice resources, 500 self-built practice questions, random question generation, answer reveal, and reverse questions with user-written answers.
- Local storage persistence for MVP data.

## Nice Later

- Real user accounts and cross-device sync.
- iOS app connected to the same backend.
- Real event feed from official job fair and seminar pages.
- User投稿 for senpai advice, interview reports, and ES examples.
- AI ES analysis through an API with privacy settings.
- Push notifications for deadlines and interviews.
- School-specific or region-specific job fair feeds.
- Mentor/community functions.

## Not Now

- Paid subscriptions.
- Public user profiles.
- Full review scraping.
- Automated applications to companies.
- Employer-side dashboard.
- Complex recommendation AI before reliable user data exists.

## Key Assumptions

- Users already search for companies on major platforms, so ComPASS should prioritize organizing and preparation over being a complete job board.
- Deadline and event management is more immediately useful than showing a huge company count.
- The built-in company database is useful for discovery, but trust depends on source labels and freshness.
- International students need Japanese-language company/business information but may prefer Chinese UI guidance.

## Biggest Risks

- Company and event data can become stale quickly.
- Foreign hiring ratio is often not publicly available, so fake precision would damage trust.
- Too many cards can make the product feel like a cluttered dashboard.
- Local storage can be lost unless users back up data.
- Adding iOS too early may split focus before the core web flow is polished.

## Validation Tasks

- Ask 3-5 international students how they currently manage companies and deadlines.
- Watch one student add companies from Mynavi or Indeed into ComPASS.
- Confirm whether the calendar/deadline area is easier than a spreadsheet.
- Test whether 500-question practice is perceived as useful or needs scoring/history.
- Validate whether qualification recommendations should be industry-first, job-type-first, or both.

## Acceptance Checks

- User can add a custom company and see it in My Page.
- User can add a schedule and see it in the monthly calendar and monthly list.
- User can favorite a company and see its deadline under `締め切り`.
- User can use the random question tool without page errors.
- User can back up and restore local data.
- Page works from `http://localhost:5173/` with no current-console errors.
