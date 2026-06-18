# ComPASS 我的求职指南针

这是一个无依赖的静态网页初版，面向在日本找工作的留学生，覆盖本科、大学院、语言学校毕业生的公司筛选、收藏和応募进度管理场景。

## 打开方式

推荐启动本地服务器后打开：

```powershell
cd E:\findjobJP
.\start-server.cmd
```

然后访问：

```text
http://localhost:5173
```

说明：现在公司数据放在 `data/companies.json`。浏览器直接打开 `index.html` 时，部分浏览器会阻止读取本地 JSON，所以推荐使用本地服务器。

如果运行 `.\start-server.ps1` 时看到 `PSSecurityException`，这是 Windows PowerShell 执行策略拦截脚本。直接运行 `.\start-server.cmd` 即可，不需要修改系统策略。

## 免费发布给别人使用

当前版本是静态网页，用户数据保存在各自浏览器本地，因此可以免费部署，不需要服务器和数据库。

推荐路线：

```text
GitHub 仓库
+
Cloudflare Pages
+
本地浏览器保存数据
```

Cloudflare Pages 设置：

```text
Framework preset: None
Build command: 留空
Build output directory: /
```

部署后把 Cloudflare Pages 生成的网址发给别人即可。详细步骤见：

- `docs/DEPLOY_FREE.md`

使用前需要提醒用户：

> 当前版本的数据保存在你的浏览器本地，不会上传到服务器。换电脑、换浏览器或清除浏览器数据后可能丢失，请定期使用“备份数据”保存备份文件。

## 当前功能

- 公司库工作台：首页就是筛选和公司列表，不做营销落地页
- 按募集状态筛选：新卒採用、实习、候选需确认、通年採用
- 按学历、行业、地区、日语要求、签证支援、外国人採用比例筛选
- 支持公司名、职位、关键词搜索
- 支持按推荐度、口碑、外国人比例、截止日期排序
- 展示公司详情、近年外国人採用比例和口碑趋势
- 可收藏候选公司，并在浏览器本地保存
- 可记录每家公司的応募进度和备注
- 首页看板展示收藏公司的応募状态统计
- 首页展示 30 天内临近截止的公司
- 支持下载当前候选/筛选结果为 CSV
- 支持备份和恢复本地收藏、応募进度、备注
- 支持在网页内添加公司、复制示例公司为自定义公司、编辑/删除自定义公司
- 新增“就活学习中心”：证书排行、报名/考试时间、推荐自学网站
- 新增面试准备：常问问题、逆问题、面试官提问意图、回答目的
- 新增 ES 深度挖掘：本地规则分析 ES，提示结构、证据、公司匹配和改进点
- 新增求职流程、SPI、性格测试和 coding test 准备清单
- 预留信息来源、可信度、最后确认时间、応募入口字段
- 可复制候选清单

## 数据替换位置

公司数据在 `data/companies.json`。当前公司库为约 1540 家，其中一部分为 `candidate` / `sample` 候选扩展数据，需要继续确认官网募集状态、截止日期和真实数据来源。后续继续扩展时，直接往这个 JSON 数组里追加公司对象，建议保留这些字段：

```js
{
  name: "公司名",
  industry: "行业",
  region: "地区",
  statuses: ["recruiting", "internship"],
  education: ["undergrad", "grad", "language"],
  roles: ["职位"],
  jlpt: "N2",
  foreignRatio: 20, // 展示用汇总值，真实版以 foreignHiringRecords 为准
  rating: 3.8, // 展示用汇总值，真实版以 reviewSummary 为准
  visaSupport: true,
  deadline: "2026-07-01",
  sourceName: "公司官方採用页",
  sourceType: "official",
  sourceUrl: "https://...",
  applyUrl: "https://...",
  reviewSource: "OpenWork / Glassdoor",
  lastChecked: "2026-06-05",
  confidence: "高可信来源",
  foreignHiringRecords: [
    {
      year: 2026,
      ratio: 20,
      status: "official",
      sourceName: "公司官方统合报告",
      sourceUrl: "https://...",
      checkedAt: "2026-06-05"
    }
  ],
  reviewSummary: {
    rating: 3.8,
    maxRating: 5,
    reviewCount: 1200,
    sourceName: "OpenWork",
    sourceUrl: "https://...",
    tags: ["成长快", "国际化", "节奏快"],
    rawReviewsStored: false
  }
}
```

### 数据原则

- 外国人採用比例优先使用公司官网、IR、统合报告、採用页面等官方来源。
- 如果公司没有公开近三年比例，字段使用 `ratio: null`，页面显示“未公开”。
- `status` 建议使用 `official`、`estimated`、`sample`、`unknown`，避免把示例数据当成真实数据。
- 评价只保存评分摘要、评论数量、来源链接和我们自己整理的标签。
- 不保存、不转载 OpenWork、転職会議、Glassdoor、Lighthouse 等第三方网站的评论正文。

## 网页和 iOS 互通设计

后续做正式版时，网页和 iOS App 应该共用同一个后端。推荐结构：

```text
Web App / iOS App
       ↓
API / Supabase
       ↓
companies, job_posts, reviews, favorites, applications, users
```

这样网页收藏、iOS 收藏、応募进度、截止提醒都能同步。当前静态版用 `localStorage` 保存收藏和进度，等接后端时可以把这些本地字段迁移到用户账号下。

## 本地数据

当前版本不需要服务器，收藏、応募状态、备注和自定义公司保存在浏览器 `localStorage`。如果换浏览器或清除浏览器数据，这些本地数据会丢失；可以使用页面上的“备份数据”下载 JSON 文件，再用“恢复备份”导入。

## 建议的数据表

- `companies`：公司基础信息、行业、地区、签证支援、外国人採用比例
- `job_posts`：招聘类型、岗位、截止日期、応募链接、最后确认时间
- `source_checks`：来源 URL、来源类型、抓取/人工确认时间、可信度
- `reviews`：评分、评论数量、来源平台、更新时间
- `favorites`：用户收藏的公司
- `applications`：用户応募状态、备注、提醒时间

## 后续建议

- 招聘数据：接入公司官网、MyNavi、Rikunabi、Wantedly、LinkedIn 等来源。
- 外国人比例：优先使用企业公开的统合报告、採用页面、厚生劳动省相关公开数据或问卷数据。
- 口碑数据：可聚合 OpenWork、転職会議、Glassdoor 等评分，并保留来源和更新时间。
- 用户侧功能：加入账号、收藏夹、応募进度、ES 截止提醒、签证支援标记确认。
- ES 功能：当前是浏览器本地规则分析，不会上传文本；正式版可接入登录账号和 AI API。

## 第一批官方入口确认

以下公司已在内置数据中补入官方採用/募集页面入口；外国人採用比例若未在官方採用页面公开，则显示“未公开”：

- Sony Group
- Fujitsu
- SoftBank
- SB C&S
- NTT DATA NJK
- Cisco Japan
- Cybozu
- 日本コムシス
- SCSK
- KDDI
- Nomura Research Institute (NRI)
- EY Japan
- PwC Japan
- ABeam Consulting
- Japan Tata Consultancy Services
- Hitachi
- NEC
- CyberAgent
- DeNA
- MUFG Bank

下一步建议逐个补充：応募締切、岗位详情、是否明确签证支援、IR/统合报告中的外国籍社員信息。

## 就活学习中心数据来源

证书和学习资源入口优先放官方或公共机构链接。考试日期、报名窗口、CBT 可预约时间会变动，页面上只写准备方向和官方入口，正式使用前需要以官网最新公告为准。

- JLPT: https://www.jlpt.jp/
- BJT: https://www.kanken.or.jp/bjt/
- IPA IT Passport / FE / AP: https://www.ipa.go.jp/shiken/
- TOEIC Japan: https://www.iibc-global.org/toeic/test/lr.html
- 日商簿記: https://www.kentei.ne.jp/bookkeeping
- 日本 FP 协会: https://www.jafp.or.jp/exam/
- QC 検定: https://webdesk.jsa.or.jp/common/W10K0500/index/qc/qc
- JASSO 外国人留学生就业指南: https://www.jasso.go.jp/ryugaku/after_study_j/job/guide.html
