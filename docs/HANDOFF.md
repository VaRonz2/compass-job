# Handoff Notes

## Current Goal

ComPASS is being shaped from a static prototype into a focused job-hunting tool for international students in Japan. The immediate direction is to prioritize personal schedule/deadline management, custom company tracking, qualification learning, and active job-hunting practice.

## Current State

- Project path: `E:\findjobJP`
- Local URL: `http://localhost:5173/`
- Start command: `start-server.cmd`
- Main files:
  - `index.html`
  - `styles.css`
  - `app.js`
  - `data/companies.json`
  - `PROJECT_MEMORY.md`
  - `README.md`

## Latest Product Decisions

- My Page is the main daily-use area.
- Company Search is useful, but users may mostly add companies from Mynavi, Rikunabi, Indeed, LinkedIn, school pages, and company official pages.
- My Page removed:
  - `我的履历`
  - `応募进度看板`
  - `我的文件库`
  - `公司官网和评价`
  - `公司记事板`
- Job Learning removed:
  - `就活流程`
  - `题型总览`
  - `常见问题`
- Job Learning keeps:
  - external practice/study links
  - 500 self-built practice questions
  - reverse questions with user-written answers
- My Page calendar and schedule ratio should stay around 6:4 on desktop.
- Personal `締め切り` should focus on selected/favorite companies.

## Verified Recently

- `node --check app.js` passed after the latest UI cleanup.
- `http://localhost:5173/` returned 200.
- Browser loaded `styles.css?v=37` and `app.js?v=37`.
- Browser check confirmed My Page removed resume/pipeline/file/company-link/memo blocks and calendar ratio was 0.60.
- Browser check confirmed Job Learning only showed:
  - 做题网站 / 学习入口
  - 自建题库训练
  - 逆问题

## Known Risks

- The project is not a Git repository.
- Company data contains candidate/sample fields and must not be treated as fully verified.
- `index.html` is very large because of embedded fallback company data.
- LocalStorage data can be lost if browser data is cleared.
- Real event/exam/recruiting dates require live source verification.

## Useful Commands

```powershell
cd E:\findjobJP
.\start-server.cmd
```

```powershell
node --check app.js
```

```powershell
Invoke-WebRequest -Uri 'http://localhost:5173/' -UseBasicParsing | Select-Object -ExpandProperty StatusCode
```

## Next Actions

1. Improve My Page as the core command center.
2. Rework Company Search around external-company import and decision support.
3. Rework Qualification Learning tag logic into job/career tags plus category tags.
4. Improve Job Learning practice history/scoring.
5. Add real or clearly marked sample large job fair/seminar event cards to the homepage.
6. Decide when to initialize Git and create the first project checkpoint.
7. Plan backend/iOS sync only after the web core loop is stable.

## Do Not Redo Without Asking

- Do not restore the removed My Page resume block.
- Do not restore the removed My Page pipeline board.
- Do not restore the removed My Page file library.
- Do not restore the removed My Page company official/review card.
- Do not restore the removed My Page company memo board.
- Do not restore the removed Job Learning flow/test-overview/common-question cards.
- Do not claim scraped/verified real data unless source and date are recorded.
