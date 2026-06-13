# Frontend Skeleton

## Current Stack

- Static HTML/CSS/JavaScript.
- Local data in `data/companies.json` with large fallback embedded in `index.html`.
- Local user state in browser `localStorage`.
- Local server through `start-server.cmd`.

## Navigation Model

Top-level horizontal navigation:
- 首页
- 搜索公司
- 资格学习
- 就活学习
- 我的页面

Each top-level page should have a clear job:
- 首页: recent large job events, high-level time awareness, quick add/follow-up.
- 搜索公司: discover candidates and add external companies.
- 资格学习: decide what qualifications to study by career/category and date.
- 就活学习: practice tests and prepare reverse questions.
- 我的页面: manage personal companies, schedules, deadlines, notes, files, and certificates.

## Visual Language

- Practical student productivity tool.
- Dense enough for repeated use, but not spreadsheet-like.
- Use color to signal status and urgency.
- Avoid marketing hero sections, oversized cards, or decorative-only backgrounds.
- Keep cards at small radii and restrained elevation.

## Layout Rules

- Desktop My Page calendar and schedule: 6:4 ratio.
- Mobile: one-column layout.
- Long lists should use filters, tags, accordions, pagination, or load-more.
- Right-side panels must be scrollable when content overflows.
- Do not put cards inside cards unless it is a true repeated item or modal.

## Component Ownership

- `index.html`: page structure and stable DOM IDs.
- `styles.css`: design tokens, layout, responsive rules, component styling.
- `app.js`: data constants, render functions, event handlers, localStorage integration.
- `data/companies.json`: company data only.
- `scripts/`: one-off data processing and import helpers.

## Naming Rules

- DOM IDs should describe product concepts, not implementation experiments.
- CSS classes should be reusable only when the visual pattern is truly reused.
- User-facing Japanese job-hunting terms should stay consistent:
  - エントリー
  - 説明会
  - 面接
  - 内定
  - 締め切り
  - 口コミ
  - 外国人採用

## i18n Direction

MVP can keep mixed Chinese UI guidance and Japanese job-hunting terms. If the product grows, move user-facing strings into a message map before adding more languages.

## Acceptance Checks

- First screen renders without blank areas.
- Navigation switches pages.
- My Page calendar does not visually overwhelm the schedule column.
- Job Learning shows practice tools instead of passive long reading blocks.
- Company Search detail panel can scroll.
- Text does not overlap at common desktop and mobile widths.
