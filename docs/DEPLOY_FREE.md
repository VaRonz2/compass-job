# Free Static Deployment

This project can be shared for free as a static website because user data is saved in the visitor's browser through localStorage. No server, login, or database is required for the current MVP.

## Recommended Route

Use:

```text
GitHub repository
+
Cloudflare Pages
+
local browser storage
```

Monthly server cost: `0`.

## Files To Upload

Upload the project root to GitHub, including:

- `index.html`
- `styles.css`
- `app.js`
- `assets/`
- `data/`
- `docs/`
- `README.md`
- `PROJECT_MEMORY.md`

Do not upload:

- `node_modules/`
- `.env`
- `output/`
- local temporary files

The `.gitignore` file already excludes common generated and local files.

## Cloudflare Pages Settings

When creating the Cloudflare Pages project:

```text
Framework preset: None
Build command: leave empty
Build output directory: /
```

After deployment, Cloudflare will provide a URL like:

```text
https://your-project.pages.dev
```

Share that URL with users.

## Important User Notice

Because this MVP stores data locally in each user's browser, users must understand:

- Data does not automatically sync across devices.
- Clearing browser data may delete their ComPASS data.
- They should use `备份数据` regularly.
- They can restore with `恢复备份`.

Suggested notice:

```text
当前版本的数据保存在你的浏览器本地，不会上传到服务器。换电脑、换浏览器或清除浏览器数据后可能丢失，请定期使用“备份数据”保存备份文件。
```

## Quick Smoke Test After Deploy

Open the deployed URL and check:

- Home page loads.
- Company data loads.
- My Page opens.
- Add a schedule.
- Use backup download.
- Refresh page and confirm data remains.

## Later Upgrade Path

Only add a server when the product needs:

- login
- cross-device sync
- iOS app sync
- public posting
- cloud file storage
- push notifications
- automated company/event data updates

