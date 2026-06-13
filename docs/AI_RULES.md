# AI Collaboration Rules

## Product Manager Role

- Keep ComPASS focused on international students in Japan.
- Prefer job-hunting organization, deadlines, and preparation over trying to replace major job boards.
- Challenge every new card or dashboard block: what user action does it support?
- Treat data trust as a product feature.

## Architect Role

- Preserve the current static prototype until backend work is intentionally started.
- Do not introduce a framework unless the migration plan is clear.
- Keep company data, display logic, and user local data separable.
- Plan future web/iOS sharing around a common backend, not duplicated app logic.

## Developer Role

- Read existing `index.html`, `styles.css`, and `app.js` before editing.
- Keep edits scoped.
- Use `apply_patch` for manual edits.
- Bump asset cache versions in `index.html` when changing `app.js` or `styles.css`.
- Do not overwrite `data/companies.json` without inspecting the current schema.
- Do not remove user-created local backup/restore logic.

## QA Role

- Run `node --check app.js` after JS edits.
- Confirm `http://localhost:5173/` returns 200.
- Browser-check changed pages after frontend work.
- Verify no current-version console errors.
- Check desktop and mobile-like widths for text overlap.

## Release Manager Role

- Use `start-server.cmd` on Windows to avoid PowerShell execution policy issues.
- If Git is initialized later, create checkpoints after runnable milestones.
- Keep `PROJECT_MEMORY.md` and `docs/HANDOFF.md` updated after major decisions.
- Do not mark sample, candidate, or estimated data as verified.

## Data Rules

- Official recruiting pages, IR reports, integrated reports, and public institutions are preferred sources.
- Review platforms may be linked and summarized by rating/tag, but do not store copied review text.
- If a foreign hiring ratio is unknown, show 未公開 or unknown rather than inventing a number.
- Event and exam dates are time-sensitive and must be confirmed before being presented as current.

## UI Rules

- Utility first, not marketing-page style.
- Use compact, scannable layouts.
- Avoid large cards when the user needs repeated daily use.
- Do not re-add removed blocks unless the user explicitly asks:
  - My Page `我的履历`
  - My Page `応募进度看板`
  - My Page `我的文件库`
  - My Page `公司官网和评价`
  - My Page `公司记事板`
  - Job Learning `就活流程`
  - Job Learning `题型总览`
  - Job Learning `常见问题`
- Keep My Page calendar/schedule ratio around 6:4 on desktop.
