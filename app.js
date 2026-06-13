let companies = [];

function normalizeLoadedCompany(company) {
  const normalized = { ...company };
  normalized.tags = Array.isArray(normalized.tags) ? normalized.tags : [];
  normalized.roles = Array.isArray(normalized.roles) ? normalized.roles : ["Role TBD"];
  normalized.notes = Array.isArray(normalized.notes) ? normalized.notes : ["Details TBD."];
  normalized.statuses = Array.isArray(normalized.statuses) ? normalized.statuses : ["recruiting"];
  normalized.education = Array.isArray(normalized.education) ? normalized.education : ["undergrad", "grad"];
  normalized.sourceName = normalized.sourceName || "Source TBD";
  normalized.sourceType = normalized.sourceType || "sample";
  normalized.sourceUrl = normalized.sourceUrl || "";
  normalized.applyUrl = normalized.applyUrl || "";
  normalized.reviewSource = normalized.reviewSource || "Review source TBD";
  normalized.lastChecked = normalized.lastChecked || "Unverified";
  normalized.confidence = normalized.confidence || "Needs verification";
  normalized.history = Array.isArray(normalized.history) ? normalized.history : [];

  if (!Array.isArray(normalized.foreignHiringRecords)) {
    const history = normalized.history.length
      ? normalized.history.slice(-3)
      : [
          { year: new Date().getFullYear() - 2, foreignRatio: normalized.foreignRatio ?? null, rating: normalized.rating ?? 0 },
          { year: new Date().getFullYear() - 1, foreignRatio: normalized.foreignRatio ?? null, rating: normalized.rating ?? 0 },
          { year: new Date().getFullYear(), foreignRatio: normalized.foreignRatio ?? null, rating: normalized.rating ?? 0 },
        ];
    normalized.foreignHiringRecords = history.map((item) => ({
      year: item.year,
      ratio: item.foreignRatio ?? null,
      metric: "Foreign hiring / employee ratio",
      status: item.foreignRatio === null || item.foreignRatio === undefined ? "unknown" : "sample",
      sourceName:
        item.foreignRatio === null || item.foreignRatio === undefined
          ? "Not disclosed on official recruitment page"
          : "Sample data, pending official verification",
      sourceUrl: normalized.sourceUrl,
      checkedAt: normalized.lastChecked,
      note:
        item.foreignRatio === null || item.foreignRatio === undefined
          ? "Foreign hiring ratio was not found on the official recruitment page."
          : "Prototype placeholder. Prefer company career pages, IR, integrated reports, or hiring pages for real data.",
    }));
  }

  if (!normalized.reviewSummary) {
    normalized.reviewSummary = {
      rating: normalized.rating || 0,
      maxRating: 5,
      reviewCount: null,
      sourceName: normalized.reviewSource,
      sourceUrl: "",
      lastChecked: normalized.lastChecked,
      status: "summary-only",
      tags: normalized.tags.slice(0, 3),
      rawReviewsStored: false,
      note: "Shows only rating summaries, tags, and source links. Does not store or republish third-party review text.",
    };
  }

  return normalized;
}

async function loadCompanies() {
  let inlineData = Array.isArray(window.COMPASS_COMPANY_DATA) ? window.COMPASS_COMPANY_DATA : [];
  if (!inlineData.length) {
    try {
      const fallbackText = document.querySelector("#companyDataFallback")?.textContent || "";
      inlineData = fallbackText ? JSON.parse(fallbackText) : [];
    } catch (error) {
      console.warn("Failed to parse embedded company fallback", error);
    }
  }
  if (inlineData.length) {
    companies = inlineData.map(normalizeLoadedCompany);
    return;
  }

  try {
    const response = await fetch("data/companies.json?v=33");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    companies = data.map(normalizeLoadedCompany);
  } catch (error) {
    showToast("无法读取公司库。请确认用 http://localhost:5173/ 打开页面。");
    console.error("Failed to load companies and inline fallback", error);
  }
}

const educationLabels = {
  undergrad: "学部",
  grad: "大学院",
  language: "語学学校",
};

const statusLabels = {
  recruiting: "新卒採用中",
  internship: "インターン募集中",
  candidate: "確認前候補",
  yearRound: "通年採用",
};

const jlptRank = {
  N3: 1,
  N2: 2,
  N1: 3,
  Business: 4,
};

const applicationStatuses = [
  { value: "watching", label: "関心あり" },
  { value: "preparing", label: "ES準備" },
  { value: "applied", label: "エントリー" },
  { value: "briefing", label: "説明会参加" },
  { value: "interview", label: "面接中" },
  { value: "waiting", label: "結果待ち" },
  { value: "offer", label: "内定" },
  { value: "closed", label: "保留 / 終了" },
];

const myBoardStages = [
  { id: "candidate", title: "候选 / 准备", statuses: ["watching", "preparing", "closed"] },
  { id: "applied", title: "エントリー", statuses: ["applied"] },
  { id: "briefing", title: "说明会", statuses: ["briefing"] },
  { id: "interview", title: "面试", statuses: ["interview"] },
  { id: "waiting", title: "等待结果", statuses: ["waiting"] },
  { id: "offer", title: "内定", statuses: ["offer"] },
];

const myQuickStatuses = [
  { value: "applied", label: "エントリー" },
  { value: "briefing", label: "说明会" },
  { value: "interview", label: "面试" },
  { value: "waiting", label: "等待" },
  { value: "offer", label: "内定" },
];

const fileStorageLimit = 1800 * 1024;
const companyPageSize = 80;

const industryLabels = {
  IT: "IT・Web",
  Retail: "小売・サービス",
  Manufacturing: "メーカー",
  Consulting: "コンサルティング",
  Finance: "金融",
  Game: "ゲーム・コンテンツ",
  Telecom: "通信",
  Semiconductor: "半導体・電子部品",
  Chemical: "化学・素材",
  Healthcare: "医療・医療機器",
  Pharma: "医薬品",
  Energy: "エネルギー・インフラ",
  Logistics: "物流・交通",
  RealEstate: "不動産",
  Construction: "建設・土木",
  Food: "食品・飲料",
  Advertising: "広告・メディア",
  Education: "教育・EdTech",
  Hospitality: "ホテル・旅行",
  Trading: "商社",
  Airline: "航空・空港",
  Shipping: "海運・港湾",
  AutomotiveParts: "自動車部品",
  Robotics: "ロボット・FA",
  Aerospace: "航空宇宙",
  SteelMetal: "鉄鋼・金属",
  Textile: "繊維・素材",
  Apparel: "アパレル・ファッション",
  Beauty: "化粧品・日用品",
  Sports: "スポーツ・フィットネス",
  Entertainment: "エンタメ・音楽",
  HR: "人材・HR",
  LegalIP: "法務・知財",
  Agriculture: "農業・食品テック",
  Security: "警備・防災",
  Environment: "環境・水処理",
  BPO: "BPO・バックオフィス",
  Furniture: "家具・空間デザイン",
  EngineeringService: "技術サービス",
  CareService: "介護・福祉",
  RailwayRealEstate: "鉄道・沿線開発",
};

const regionLabels = {
  Tokyo: "東京都",
  Osaka: "大阪府",
  Aichi: "愛知県",
  Fukuoka: "福岡県",
  Kanagawa: "神奈川県",
  Chiba: "千葉県",
  Saitama: "埼玉県",
  Kyoto: "京都府",
  Hyogo: "兵庫県",
  Hokkaido: "北海道",
  Miyagi: "宮城県",
  Hiroshima: "広島県",
  Shizuoka: "静岡県",
  Ibaraki: "茨城県",
  Nagano: "長野県",
  Gifu: "岐阜県",
  Okayama: "岡山県",
  Yamanashi: "山梨県",
  Gunma: "群馬県",
  Fukui: "福井県",
  Niigata: "新潟県",
  Saga: "佐賀県",
  Remote: "リモート",
  Unverified: "所在地要確認",
};

const roleLabels = {
  "Backend Engineer": "バックエンドエンジニア",
  "Frontend Engineer": "フロントエンドエンジニア",
  "Software Engineer": "ソフトウェアエンジニア",
  "Software engineer": "ソフトウェアエンジニア",
  Engineer: "エンジニア",
  "System Engineer": "システムエンジニア",
  "IT Engineer": "ITエンジニア",
  "Network Engineer": "ネットワークエンジニア",
  "Network engineer": "ネットワークエンジニア",
  "Infrastructure Engineer": "インフラエンジニア",
  "Security Engineer": "セキュリティエンジニア",
  "ML Engineer": "機械学習エンジニア",
  "Embedded engineer": "組込みエンジニア",
  "Mechanical engineer": "機械エンジニア",
  "Process engineer": "プロセスエンジニア",
  "Field service engineer": "フィールドサービスエンジニア",
  "Water treatment engineer": "水処理エンジニア",
  "FA engineer": "FAエンジニア",
  "Product engineer": "製品エンジニア",
  "Data Analyst": "データアナリスト",
  "Data Scientist": "データサイエンティスト",
  "Data operations": "データオペレーション",
  "Research analyst": "リサーチアナリスト",
  "Research support": "研究サポート",
  "Product Manager": "プロダクトマネージャー",
  "Product Planner": "商品企画",
  "Product Planning": "商品企画",
  "Product Analyst": "プロダクトアナリスト",
  "Product planning": "商品企画",
  "Product support": "商品サポート",
  "Business Planning": "事業企画",
  "Business planning": "事業企画",
  "Business development": "事業開発",
  "Business Development": "事業開発",
  "Development planning": "開発企画",
  "Corporate planning": "経営企画",
  "Corporate Staff": "コーポレート職",
  "Back office operations": "バックオフィス",
  "Technical Staff": "技術職",
  "Technical support": "技術サポート",
  "Technical sales": "技術営業",
  "R&D": "研究開発",
  Research: "研究職",
  "R&D Engineer": "研究開発エンジニア",
  "Production Engineering": "生産技術",
  "Production Management": "生産管理",
  "Production management": "生産管理",
  "Quality assurance": "品質保証",
  "Quality control": "品質管理",
  "Global Planning": "グローバル企画",
  "Global Business": "海外事業",
  "Global business": "海外事業",
  "Global sales": "海外営業",
  "Global Sales": "海外営業",
  "Overseas sales": "海外営業",
  "Overseas business": "海外事業",
  "International logistics": "国際物流",
  "Trade operations": "貿易実務",
  "Global customer service": "グローバルカスタマーサービス",
  "Bilingual support": "バイリンガルサポート",
  "Foreign resident support": "外国人生活サポート",
  Sales: "営業",
  "Corporate sales": "法人営業",
  "Cloud sales": "クラウド営業",
  "Materials sales": "素材営業",
  "Sustainability sales": "サステナビリティ営業",
  Marketing: "マーケティング",
  "Digital marketing": "デジタルマーケティング",
  "Brand marketing": "ブランドマーケティング",
  "Sports marketing": "スポーツマーケティング",
  "Business Generalist": "総合職",
  Generalist: "総合職",
  "総合職": "総合職",
  Consultant: "コンサルタント",
  "Business consultant": "ビジネスコンサルタント",
  "Business Consultant": "ビジネスコンサルタント",
  "Technology Consultant": "テクノロジーコンサルタント",
  "IT Consultant": "ITコンサルタント",
  "DX Consultant": "DXコンサルタント",
  "DX consultant": "DXコンサルタント",
  "System Consulting": "システムコンサルティング",
  "Customer success": "カスタマーサクセス",
  "Customer Success": "カスタマーサクセス",
  "Customer support": "カスタマーサポート",
  Operations: "オペレーション",
  "Operations planning": "オペレーション企画",
  "Service planning": "サービス企画",
  "Store Management": "店舗運営",
  "Store planning": "店舗企画",
  Merchandising: "マーチャンダイジング",
  "Global Supply Chain": "グローバルサプライチェーン",
  "Supply chain": "サプライチェーン",
  "Game Planner": "ゲームプランナー",
  "Game planner": "ゲームプランナー",
  "3D Artist": "3Dアーティスト",
  "Server Engineer": "サーバーエンジニア",
  "UX Researcher": "UXリサーチャー",
  "App Engineer": "アプリエンジニア",
  "Risk Analyst": "リスクアナリスト",
  "Risk support": "リスク管理サポート",
  "IT Strategy": "IT戦略",
  "IT Planning": "IT企画",
  "Global Banking": "グローバルバンキング",
  "Media planning": "メディア企画",
  "Content planning": "コンテンツ企画",
  "Event planning": "イベント企画",
  "Learning service planning": "教育サービス企画",
  "Hotel operations": "ホテル運営",
  "Guest relations": "ゲストリレーション",
  "Ground staff": "グランドスタッフ",
  "Airport operations": "空港オペレーション",
  "Station/service planning": "駅・サービス企画",
  "Station operations": "駅運営",
  "Area development": "沿線開発",
  "EC operations": "EC運営",
  "Contact center planning": "コンタクトセンター企画",
  "Property management": "不動産管理",
  "Project management": "プロジェクトマネジメント",
  "Project coordination": "プロジェクト調整",
  "Design support": "デザインサポート",
  "Space design support": "空間デザインサポート",
  "Legal assistant": "法務アシスタント",
  "Patent support": "特許サポート",
  "IP research": "知財調査",
  "Clinical development support": "臨床開発サポート",
  "Clinical support": "臨床サポート",
  "Career advisor": "キャリアアドバイザー",
  "Food tech planning": "食品テック企画",
  "Plant planning": "プラント企画",
  "Store planning": "店舗企画",
  "Retail planning": "小売企画",
  "Account planner": "アカウントプランナー",
  "Rights management": "権利管理",
  "Risk operations": "リスク管理オペレーション",
  "Care operations": "介護オペレーション",
};

const tagLabels = {
  candidate: "候補",
  verify: "要確認",
  "needs verification": "要確認",
  "2027 grad": "2027年卒",
  "2027卒": "2027年卒",
  "new graduate": "新卒採用",
  internship: "インターン",
  telecom: "通信",
  network: "ネットワーク",
  "digital infrastructure": "デジタルインフラ",
  semiconductor: "半導体",
  electronics: "電子部品",
  engineering: "技術職",
  materials: "素材",
  quality: "品質",
  "global business": "海外事業",
  pharma: "医薬品",
  "life science": "ライフサイエンス",
  global: "グローバル",
  "medical device": "医療機器",
  healthcare: "ヘルスケア",
  energy: "エネルギー",
  infrastructure: "インフラ",
  sustainability: "サステナビリティ",
  logistics: "物流",
  transport: "交通",
  operations: "オペレーション",
  "real estate": "不動産",
  development: "開発",
  planning: "企画",
  construction: "建設",
  project: "プロジェクト",
  food: "食品",
  brand: "ブランド",
  media: "メディア",
  marketing: "マーケティング",
  creative: "クリエイティブ",
  education: "教育",
  edtech: "EdTech",
  content: "コンテンツ",
  hospitality: "ホスピタリティ",
  inbound: "インバウンド",
  service: "サービス",
  trading: "商社",
  "global sales": "海外営業",
  "business development": "事業開発",
  retail: "小売",
  finance: "金融",
  risk: "リスク管理",
  consulting: "コンサル",
  "corporate sales": "法人営業",
  manufacturing: "メーカー",
  manufacturer: "メーカー",
  production: "生産",
  sales: "営業",
  it: "IT",
  IT: "IT",
  saas: "SaaS",
  SaaS: "SaaS",
  product: "プロダクト",
  game: "ゲーム",
  technology: "技術",
  digital: "デジタル",
  airport: "空港",
  shipping: "海運",
  trade: "貿易",
  automotive: "自動車",
  robotics: "ロボット",
  automation: "自動化",
  aerospace: "航空宇宙",
  steel: "鉄鋼",
  textile: "繊維",
  fashion: "ファッション",
  cosmetics: "化粧品",
  sports: "スポーツ",
  events: "イベント",
  hr: "人材",
  career: "キャリア",
  legal: "法務",
  patent: "特許",
  ip: "知財",
  agriculture: "農業",
  "food tech": "食品テック",
  security: "警備",
  safety: "安全",
  environment: "環境",
  water: "水処理",
  bpo: "BPO",
  support: "サポート",
  workspace: "ワークスペース",
  design: "デザイン",
  dispatch: "技術派遣",
  technical: "技術",
  care: "介護",
  community: "地域",
  railway: "鉄道",
  "area development": "沿線開発",
  payment: "決済",
  leisure: "レジャー",
  dx: "DX",
  case: "ケース面接",
  ec: "EC",
  store: "店舗",
  data: "データ",
  portfolio: "作品集",
  "case interview": "ケース面接",
  "global firm": "外資・グローバル",
  "global IT": "グローバルIT",
  ICT: "ICT",
  "social infrastructure": "社会インフラ",
  SIer: "SIer",
  FinTech: "FinTech",
  AI: "AI",
  "NTT DATA系": "NTT DATA系",
  "IT商社": "IT商社",
  "通信インフラ": "通信インフラ",
  "通年受付": "通年受付",
  "外資IT": "外資IT",
  英语可: "英語可",
  技术面试: "技術面接",
  长期实习: "長期インターン",
  英语公用语: "英語公用語",
  大规模採用: "大規模採用",
  文理均可: "文理不問",
  海外业务: "海外事業",
  全球业务: "海外事業",
  语言学校可关注: "語学学校生も確認可",
  理工优势: "理系歓迎",
  研究开发: "研究開発",
  案例面试: "ケース面接",
  第二新卒: "第二新卒",
  成长快: "成長環境",
  Web产品: "Webプロダクト",
  实习优先: "インターン優先",
  远程混合: "リモート併用",
  远程: "リモート",
  稳定: "安定性",
  商务日语: "ビジネス日本語",
  内容行业: "コンテンツ業界",
  技术美术: "テクニカルアート",
  机器学习: "機械学習",
  地方机会: "地方勤務",
  客户对应: "顧客対応",
};

const homeStages = [
  {
    id: "prepare",
    title: "职业测试",
    subtitle: "性格 / 方向 / 强项",
    page: "jobLearning",
    action: "开始做题",
    summary: "先用性格测试和职业方向题确认自己适合的行业，再决定要投哪些公司。",
  },
  {
    id: "search",
    title: "公司整理",
    subtitle: "外部网站 / 自定义添加",
    page: "search",
    action: "添加公司",
    summary: "把マイナビ、リクナビ、Indeed、官网看到的公司放进 ComPASS，统一管理締切和进度。",
  },
  {
    id: "interview",
    title: "面试准备",
    subtitle: "SPI / ES / 逆问题",
    page: "jobLearning",
    action: "练面试",
    summary: "已有投递、说明会或面试后，重点准备 SPI、ES、逆问题和自己的回答材料。",
  },
  {
    id: "offer",
    title: "内定",
    subtitle: "Offer / 入社",
    page: "myPage",
    action: "看我的页面",
    summary: "到内定阶段就保持简单：确认条件、签证材料和入社日。",
  },
];

const briefingEvents = [
  {
    title: "マイナビ インターンシップ＆キャリア発見EXPO",
    date: "2026-06-14",
    time: "12:00-17:00",
    place: "東京ビッグサイト",
    target: "2028卒 / インターン・キャリア",
    sourceName: "マイナビ公式イベント",
    url: "https://job.mynavi.jp/conts/event/2028/10561/index.html",
  },
  {
    title: "マイナビ インターンシップ＆キャリア発見EXPO",
    date: "2026-07-12",
    time: "12:00-17:00",
    place: "東京ビッグサイト",
    target: "2028卒 / 夏インターン",
    sourceName: "マイナビ公式イベント",
    url: "https://job.mynavi.jp/conts/event/2028/10562/index.html",
  },
  {
    title: "外国人留学生向け就職イベント",
    date: "2026-07-18",
    time: "日程要確認",
    place: "東京 / オンライン",
    target: "留学生 / 既卒可の企業も確認",
    sourceName: "JASSO・大学キャリアセンター等で確認",
    url: "https://www.jasso.go.jp/ryugaku/after_study_j/job/",
  },
  {
    title: "リクナビ 合同企業説明会",
    date: "2026-07-25",
    time: "日程要確認",
    place: "首都圏 / オンライン",
    target: "新卒 / インターン",
    sourceName: "リクナビ公式イベントで確認",
    url: "https://job.rikunabi.com/",
  },
];

const industryGuides = [
  { name: "IT / Web", note: "工程师、产品、DX；重视作品集、Coding Test、IT Passport / FE。", industry: "IT" },
  { name: "咨询", note: "逻辑表达、案例面试、日英双语；TOEIC、BJT、统计检定加分。", industry: "Consulting" },
  { name: "制造业", note: "海外业务、生产管理、技术职；日语沟通和长期稳定性很重要。", industry: "Manufacturing" },
  { name: "金融", note: "细心、合规、数字敏感度；TOEIC、簿记、FP、统计检定常见。", industry: "Finance" },
  { name: "零售 / 服务", note: "现场沟通、客户应对、多语言优势；BJT、JLPT、服务礼仪有帮助。", industry: "Retail" },
  { name: "游戏 / 内容", note: "作品集、热情、用户理解；日语表达和项目经验比证书更关键。", industry: "Game" },
];

const certificates = {
  jlpt: {
    name: "JLPT N1 / N2",
    category: "语言",
    difficulty: "中级-难",
    mode: "线下纸笔",
    schedule: "日本国内通常每年 2 次，7 月和 12 月考试；报名窗口以 JEES / JLPT 官网最新公告为准。",
    bestFor: "证明基础日语读解和语法，适合大多数日企新卒岗位。",
    industries: ["全行业", "日企综合职", "服务"],
    status: "urgent",
    sourceName: "JLPT 官方网站",
    sourceUrl: "https://www.jlpt.jp/",
  },
  bjt: {
    name: "BJT 商务日语能力测试",
    category: "语言",
    difficulty: "中级",
    mode: "CBT 会场",
    schedule: "CBT 形式，通常可在考试中心按开放席位预约；适合想证明商务沟通能力的学生。",
    bestFor: "面试、客户沟通、咨询、销售、综合职。",
    industries: ["服务", "咨询", "商社", "航空"],
    status: "open",
    sourceName: "BJT 官方网站",
    sourceUrl: "https://www.kanken.or.jp/bjt/",
  },
  jtest: {
    name: "J.TEST 实用日本语检定",
    category: "语言",
    difficulty: "基础-中级",
    mode: "线下会场",
    schedule: "一年多次实施，报名期间和会场以 J.TEST 官方公告为准。",
    bestFor: "想补充 JLPT 以外日语证明、说明商务沟通能力的学生。",
    industries: ["服务", "制造", "BPO"],
    status: "notOpen",
    sourceName: "J.TEST 官方网站",
    sourceUrl: "https://j-test.jp/",
  },
  toeic: {
    name: "TOEIC L&R",
    category: "语言",
    difficulty: "基础-中级",
    mode: "线下会场",
    schedule: "日本公开考试一年多次，报名和考试日程需以 IIBC 官方页面为准。",
    bestFor: "外资、咨询、金融、制造业海外业务。",
    industries: ["外资", "商社", "金融", "制造"],
    status: "open",
    sourceName: "TOEIC Japan 官方网站",
    sourceUrl: "https://www.iibc-global.org/toeic/test/lr.html",
  },
  eiken: {
    name: "実用英語技能検定 EIKEN",
    category: "语言",
    difficulty: "基础-中级",
    mode: "线下 / CBT",
    schedule: "传统考试和 S-CBT 并行，报名期间以日本英检协会官方页面为准。",
    bestFor: "想用日本企业熟悉的英语证明补充 TOEIC 的学生。",
    industries: ["教育", "服务", "航空"],
    status: "open",
    sourceName: "日本英検协会",
    sourceUrl: "https://www.eiken.or.jp/eiken/",
  },
  toefl: {
    name: "TOEFL iBT",
    category: "语言",
    difficulty: "中级-难",
    mode: "线上 / 线下",
    schedule: "可选择考点或 Home Edition，具体可选日期以 ETS / 日本官方入口为准。",
    bestFor: "外资、研究型岗位、大学院背景说明、海外业务。",
    industries: ["外资", "研究", "教育"],
    status: "open",
    sourceName: "TOEFL iBT Japan",
    sourceUrl: "https://www.toefl-ibt.jp/",
  },
  ielts: {
    name: "IELTS",
    category: "语言",
    difficulty: "中级-难",
    mode: "线上 / 线下",
    schedule: "纸笔和电脑考试并行，报名与会场以 IELTS Japan 官方页面为准。",
    bestFor: "外资、海外业务、研究岗位、英语书面表达证明。",
    industries: ["外资", "教育", "商社"],
    status: "open",
    sourceName: "IELTS Japan",
    sourceUrl: "https://www.eiken.or.jp/ielts/",
  },
  itpass: {
    name: "IT Passport",
    category: "IT",
    difficulty: "入门",
    mode: "CBT 会场",
    schedule: "CBT 形式，考场有空位时可预约；报名、变更和取消规则看 IPA 官方页面。",
    bestFor: "非工程专业转 IT、咨询、企划、DX 岗位入门。",
    industries: ["IT", "咨询", "企划", "DX"],
    status: "open",
    sourceName: "IPA IT Passport",
    sourceUrl: "https://www3.jitec.ipa.go.jp/JitesCbt/",
  },
  sg: {
    name: "情報セキュリティマネジメント SG",
    category: "IT",
    difficulty: "基础",
    mode: "CBT 会场",
    schedule: "CBT 形式，通常可在开放期间预约；实施细节以 IPA 官方页面为准。",
    bestFor: "IT 利用部门、后台运营、风险管理、信息安全基础证明。",
    industries: ["IT", "BPO", "金融", "安防"],
    status: "open",
    sourceName: "IPA 情報セキュリティマネジメント",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/sg.html",
  },
  fe: {
    name: "基本情報技術者 FE",
    category: "IT",
    difficulty: "中级",
    mode: "CBT 会场",
    schedule: "CBT 形式，具体考试期间和预约入口以 IPA 官方页面为准。",
    bestFor: "工程师、SE、数据、IT 咨询基础能力证明。",
    industries: ["IT", "SIer", "通信", "机器人"],
    status: "open",
    sourceName: "IPA 基本情報技術者試験",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/fe.html",
  },
  ap: {
    name: "応用情報技術者 AP",
    category: "IT",
    difficulty: "难",
    mode: "线下纸笔",
    schedule: "通常春期 / 秋期考试，报名时间以 IPA 官方公告为准。",
    bestFor: "想进入 SIer、IT 咨询、技术综合职的高阶证明。",
    industries: ["IT", "咨询", "通信"],
    status: "notOpen",
    sourceName: "IPA 応用情報技術者試験",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/ap.html",
  },
  sc: {
    name: "情報処理安全確保支援士 SC",
    category: "IT",
    difficulty: "难关",
    mode: "线下纸笔",
    schedule: "通常春期 / 秋期考试，报名和注册制度以 IPA 官方页面为准。",
    bestFor: "安全工程师、SOC、风险管理、信息安全顾问。",
    industries: ["IT", "金融", "安防"],
    status: "notOpen",
    sourceName: "IPA 登録セキスペ",
    sourceUrl: "https://www.ipa.go.jp/jinzai/riss/seido/index.html",
  },
  db: {
    name: "データベーススペシャリスト DB",
    category: "IT",
    difficulty: "难",
    mode: "线下纸笔",
    schedule: "高度情報処理試験，通常按 IPA 年度考试公告实施。",
    bestFor: "数据库、后端、数据平台、SIer 技术职。",
    industries: ["IT", "数据", "SIer"],
    status: "notOpen",
    sourceName: "IPA データベーススペシャリスト",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/db.html",
  },
  nw: {
    name: "ネットワークスペシャリスト NW",
    category: "IT",
    difficulty: "难",
    mode: "线下纸笔",
    schedule: "高度情報処理試験，通常按 IPA 年度考试公告实施。",
    bestFor: "通信、网络、基础设施工程师。",
    industries: ["通信", "IT", "基础设施"],
    status: "notOpen",
    sourceName: "IPA ネットワークスペシャリスト",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/nw.html",
  },
  pm: {
    name: "プロジェクトマネージャ PM",
    category: "IT",
    difficulty: "难关",
    mode: "线下纸笔",
    schedule: "高度情報処理試験，报名与考试日以 IPA 年度公告为准。",
    bestFor: "IT PM、咨询、SIer、项目推进岗位。",
    industries: ["IT", "咨询", "工程服务"],
    status: "notOpen",
    sourceName: "IPA プロジェクトマネージャ",
    sourceUrl: "https://www.ipa.go.jp/shiken/kubun/pm.html",
  },
  aws: {
    name: "AWS Cloud Practitioner / SAA",
    category: "云",
    difficulty: "基础-中级",
    mode: "线上监考 / 考点",
    schedule: "随时预约为主；考试语言、考点和线上监考规则以 AWS Certification 官方页面为准。",
    bestFor: "云、后端、SRE、数据平台相关岗位。",
    industries: ["IT", "云", "数据"],
    status: "open",
    sourceName: "AWS Certification",
    sourceUrl: "https://aws.amazon.com/certification/",
  },
  azure: {
    name: "Microsoft Azure Fundamentals AZ-900",
    category: "云",
    difficulty: "入门",
    mode: "线上监考 / 考点",
    schedule: "通过 Microsoft / Pearson VUE 预约，考试语言和可选日期以官方页面为准。",
    bestFor: "云入门、IT 咨询、企业系统、DX 企划。",
    industries: ["IT", "咨询", "DX"],
    status: "open",
    sourceName: "Microsoft Learn",
    sourceUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
  },
  gcp: {
    name: "Google Cloud Digital Leader / ACE",
    category: "云",
    difficulty: "基础-中级",
    mode: "线上监考 / 考点",
    schedule: "可在线预约，具体考试形式、语言和日期以 Google Cloud 官方认证页面为准。",
    bestFor: "云、数据分析、Web 服务、DX 岗位。",
    industries: ["IT", "数据", "广告"],
    status: "open",
    sourceName: "Google Cloud Certifications",
    sourceUrl: "https://cloud.google.com/learn/certification",
  },
  linux: {
    name: "LinuC / LPIC",
    category: "IT",
    difficulty: "基础-中级",
    mode: "CBT 会场",
    schedule: "CBT 预约制，级别和会场以 LPI-Japan / Pearson VUE 等官方入口为准。",
    bestFor: "基础设施、服务器、SRE、运维岗位。",
    industries: ["IT", "通信", "安防"],
    status: "open",
    sourceName: "LPI-Japan LinuC",
    sourceUrl: "https://linuc.org/",
  },
  java: {
    name: "Oracle Certified Java Programmer",
    category: "IT",
    difficulty: "中级",
    mode: "线上监考 / 考点",
    schedule: "Oracle / Pearson VUE 预约制，版本和考试号以 Oracle 官方页面为准。",
    bestFor: "Java 后端、SIer、业务系统开发岗位。",
    industries: ["IT", "SIer"],
    status: "open",
    sourceName: "Oracle University",
    sourceUrl: "https://education.oracle.com/java",
  },
  python3: {
    name: "Python 3 エンジニア認定",
    category: "IT",
    difficulty: "基础-中级",
    mode: "CBT 会场",
    schedule: "CBT 预约制，报名、会场和科目以 Python エンジニア育成推進協会为准。",
    bestFor: "数据、自动化、后端、AI 入门证明。",
    industries: ["IT", "数据", "AI"],
    status: "open",
    sourceName: "Python エンジニア認定試験",
    sourceUrl: "https://www.pythonic-exam.com/exam",
  },
  stats: {
    name: "統計検定 2級",
    category: "数据",
    difficulty: "中级",
    mode: "CBT 会场",
    schedule: "CBT 形式为主，预约、会场和考试范围以统计质保证推进协会官方页面为准。",
    bestFor: "数据分析、市场分析、金融、咨询。",
    industries: ["数据", "金融", "咨询", "广告"],
    status: "open",
    sourceName: "統計検定 官方网站",
    sourceUrl: "https://www.toukei-kentei.jp/",
  },
  ds: {
    name: "データサイエンティスト検定",
    category: "数据",
    difficulty: "基础-中级",
    mode: "CBT 会场",
    schedule: "通常按考试回次开放报名，实施期间以数据科学家协会公告为准。",
    bestFor: "数据分析、DX、产品分析、市场分析岗位。",
    industries: ["数据", "IT", "广告", "金融"],
    status: "notOpen",
    sourceName: "データサイエンティスト協会",
    sourceUrl: "https://www.datascientist.or.jp/dskentei/",
  },
  gkentei: {
    name: "G検定",
    category: "AI",
    difficulty: "基础-中级",
    mode: "线上",
    schedule: "线上考试，报名和考试回次以 JDLA 官方页面为准。",
    bestFor: "AI 入门、企划、咨询、数据相关岗位。",
    industries: ["AI", "IT", "咨询", "企划"],
    status: "notOpen",
    sourceName: "JDLA G検定",
    sourceUrl: "https://www.jdla.org/certificate/general/",
  },
  ekentei: {
    name: "E資格",
    category: "AI",
    difficulty: "难",
    mode: "线下 / CBT",
    schedule: "需确认 JDLA 认定课程和考试回次，报名以官方页面为准。",
    bestFor: "机器学习工程师、AI 研究开发岗位。",
    industries: ["AI", "IT", "研究开发"],
    status: "notOpen",
    sourceName: "JDLA E資格",
    sourceUrl: "https://www.jdla.org/certificate/engineer/",
  },
  mos: {
    name: "MOS Excel / PowerPoint",
    category: "办公",
    difficulty: "入门",
    mode: "随时 / 全国一斉",
    schedule: "随时考试和全国一斉考试并行，报名方式以 MOS 公式网站为准。",
    bestFor: "综合职、事务、企划、销售支持、零售管理。",
    industries: ["全行业", "事务", "企划"],
    status: "open",
    sourceName: "MOS 公式サイト",
    sourceUrl: "https://mos.odyssey-com.co.jp/",
  },
  bookkeeping: {
    name: "日商簿記 3級 / 2級",
    category: "商业",
    difficulty: "基础-中级",
    mode: "网络考试 / 线下统考",
    schedule: "统考和网络考试并行，级别、会场和报名方式以日本商工会议所官方页面为准。",
    bestFor: "金融、会计、经营企划、综合职、零售管理。",
    industries: ["金融", "会计", "零售", "企划"],
    status: "open",
    sourceName: "日本商工会议所 簿記",
    sourceUrl: "https://www.kentei.ne.jp/bookkeeping",
  },
  fp: {
    name: "FP 技能検定 3級 / 2級",
    category: "金融",
    difficulty: "基础-中级",
    mode: "线下 / CBT",
    schedule: "考试日程、申请期间和 CBT 对象级别以日本 FP 协会官方页面为准。",
    bestFor: "金融、保险、不动产、个人理财相关岗位。",
    industries: ["金融", "保险", "不动产"],
    status: "notOpen",
    sourceName: "日本 FP 协会",
    sourceUrl: "https://www.jafp.or.jp/exam/",
  },
  securities: {
    name: "証券外務員 一種 / 二種",
    category: "金融",
    difficulty: "中级",
    mode: "CBT 会场",
    schedule: "通常由所属金融机构或协会指定入口预约，规则以日本证券业协会说明为准。",
    bestFor: "证券、银行、资产管理、金融销售岗位。",
    industries: ["金融", "证券", "银行"],
    status: "notOpen",
    sourceName: "日本証券業協会",
    sourceUrl: "https://www.jsda.or.jp/",
  },
  businessLaw: {
    name: "ビジネス実務法務検定",
    category: "法务",
    difficulty: "基础-中级",
    mode: "IBT / CBT",
    schedule: "通常按回次开放 IBT / CBT 报名，考试日程以东京商工会议所官方页面为准。",
    bestFor: "法务、总务、风险管理、综合职。",
    industries: ["法务", "金融", "商社", "HR"],
    status: "notOpen",
    sourceName: "東京商工会議所",
    sourceUrl: "https://kentei.tokyo-cci.or.jp/houmu/",
  },
  ip: {
    name: "知的財産管理技能検定",
    category: "法务",
    difficulty: "中级",
    mode: "线下 / CBT",
    schedule: "通常一年多次，报名与考试日以知的财产教育协会官方公告为准。",
    bestFor: "法务、专利、内容产业、制造业企划。",
    industries: ["法务", "制造", "娱乐", "游戏"],
    status: "notOpen",
    sourceName: "知的財産教育協会",
    sourceUrl: "https://www.kentei-info-ip-edu.org/",
  },
  trade: {
    name: "貿易実務検定",
    category: "贸易",
    difficulty: "基础-中级",
    mode: "线上 / 会场",
    schedule: "级别不同考试回次不同，报名和考试形式以官方页面为准。",
    bestFor: "商社、物流、海外营业、国际业务。",
    industries: ["商社", "物流", "制造", "海运"],
    status: "notOpen",
    sourceName: "貿易実務検定協会",
    sourceUrl: "https://www.boujitsu.com/",
  },
  customs: {
    name: "通関士",
    category: "贸易",
    difficulty: "难",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名和考试日以税关官方公告为准。",
    bestFor: "物流、海运、贸易、报关相关岗位。",
    industries: ["物流", "海运", "商社"],
    status: "notOpen",
    sourceName: "税関 通関士試験",
    sourceUrl: "https://www.customs.go.jp/tsukanshi/",
  },
  secretary: {
    name: "秘書検定 2級",
    category: "商务礼仪",
    difficulty: "基础",
    mode: "线下 / CBT",
    schedule: "级别和方式不同，报名回次以实务技能检定协会官方页面为准。",
    bestFor: "综合职、事务、秘书、接待、日企商务礼仪证明。",
    industries: ["全行业", "服务", "事务"],
    status: "open",
    sourceName: "実務技能検定協会",
    sourceUrl: "https://jitsumu-kentei.jp/HS/index",
  },
  mentalHealth: {
    name: "メンタルヘルス・マネジメント検定",
    category: "HR",
    difficulty: "基础-中级",
    mode: "线下 / CBT",
    schedule: "通常按回次报名，级别和实施方式以大阪商工会议所官方页面为准。",
    bestFor: "HR、管理部、综合职、组织管理相关岗位。",
    industries: ["HR", "管理部", "服务"],
    status: "notOpen",
    sourceName: "メンタルヘルス・マネジメント検定",
    sourceUrl: "https://www.mental-health.ne.jp/",
  },
  careerConsultant: {
    name: "キャリアコンサルタント",
    category: "HR",
    difficulty: "难",
    mode: "线下国家资格",
    schedule: "通常一年多次，需满足受验资格；报名以考试机构官方公告为准。",
    bestFor: "人材、教育、职业支援、学校就业支援岗位。",
    industries: ["HR", "教育", "服务"],
    status: "notOpen",
    sourceName: "キャリアコンサルティング協議会",
    sourceUrl: "https://www.career-shiken.org/",
  },
  takken: {
    name: "宅地建物取引士",
    category: "不动产",
    difficulty: "难",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名期间和考试日以不动产适正交易推进机构公告为准。",
    bestFor: "不动产、住宅、金融、物业管理。",
    industries: ["不动产", "金融", "铁路沿线开发"],
    status: "notOpen",
    sourceName: "不動産適正取引推進機構",
    sourceUrl: "https://www.retio.or.jp/exam/",
  },
  chintai: {
    name: "賃貸不動産経営管理士",
    category: "不动产",
    difficulty: "中级",
    mode: "线下国家资格",
    schedule: "通常每年 1 次，报名期间和考试日以官方公告为准。",
    bestFor: "租赁管理、不动产运营、物业管理。",
    industries: ["不动产", "铁路沿线开发"],
    status: "notOpen",
    sourceName: "賃貸不動産経営管理士",
    sourceUrl: "https://www.chintaikanrishi.jp/",
  },
  kanri: {
    name: "管理業務主任者",
    category: "不动产",
    difficulty: "中级-难",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名与考试日以管理业协会官方公告为准。",
    bestFor: "公寓管理、物业、不动产管理公司。",
    industries: ["不动产", "物业管理"],
    status: "notOpen",
    sourceName: "マンション管理業協会",
    sourceUrl: "https://www.kanrikyo.or.jp/kanri/siken.html",
  },
  qc: {
    name: "QC 検定 3級 / 2級",
    category: "制造",
    difficulty: "基础-中级",
    mode: "线下",
    schedule: "通常一年 2 次左右，报名和考试日以品质管理检定官方页面为准。",
    bestFor: "制造业、品质保证、生产管理、供应链。",
    industries: ["制造", "汽车", "食品", "化学"],
    status: "notOpen",
    sourceName: "QC 検定 官方网站",
    sourceUrl: "https://webdesk.jsa.or.jp/common/W10K0500/index/qc/qc",
  },
  hazardous: {
    name: "危険物取扱者 乙4",
    category: "制造・安全",
    difficulty: "基础-中级",
    mode: "线下 / 电子申请",
    schedule: "各都道府县实施日不同，电子申请和考试日以消防试验研究中心为准。",
    bestFor: "化学、能源、制造、设施管理、物流。",
    industries: ["化学", "能源", "制造", "物流"],
    status: "open",
    sourceName: "消防試験研究センター",
    sourceUrl: "https://www.shoubo-shiken.or.jp/kikenbutsu/",
  },
  fireEquipment: {
    name: "消防設備士",
    category: "制造・安全",
    difficulty: "中级",
    mode: "线下 / 电子申请",
    schedule: "各地考试日不同，报名和考试日以消防试验研究中心公告为准。",
    bestFor: "建筑、设施管理、防灾、安防岗位。",
    industries: ["建设", "安防", "设施"],
    status: "open",
    sourceName: "消防試験研究センター",
    sourceUrl: "https://www.shoubo-shiken.or.jp/shoubou/",
  },
  electrician2: {
    name: "第二種電気工事士",
    category: "制造・设备",
    difficulty: "中级",
    mode: "线下笔试+技能",
    schedule: "通常上期 / 下期实施，报名和考试日以电气技术者试验中心为准。",
    bestFor: "设备、施工管理、设施维护、制造现场。",
    industries: ["建设", "制造", "能源"],
    status: "notOpen",
    sourceName: "電気技術者試験センター",
    sourceUrl: "https://www.shiken.or.jp/",
  },
  cad: {
    name: "CAD利用技術者試験",
    category: "设计・制造",
    difficulty: "基础-中级",
    mode: "CBT / 线下",
    schedule: "级别不同实施方式不同，报名以计算机教育振兴协会官方页面为准。",
    bestFor: "机械设计、建筑、制造技术、空间设计。",
    industries: ["制造", "建设", "家具"],
    status: "open",
    sourceName: "ACSP CAD利用技術者",
    sourceUrl: "https://www.acsp.jp/cad/",
  },
  color: {
    name: "色彩検定",
    category: "设计",
    difficulty: "入门-中级",
    mode: "线下 / CBT",
    schedule: "通常按夏期、冬期等回次实施，报名以色彩检定协会官方页面为准。",
    bestFor: "服装、美容、广告、设计、商品企划。",
    industries: ["服装", "美容", "广告", "设计"],
    status: "notOpen",
    sourceName: "色彩検定協会",
    sourceUrl: "https://www.aft.or.jp/",
  },
  webDesign: {
    name: "Webデザイン技能検定",
    category: "设计・Web",
    difficulty: "基础-中级",
    mode: "线下",
    schedule: "通常按回次实施，报名和考试日以互联网技能认定普及协会官方页面为准。",
    bestFor: "Web 设计、UI、前端、内容制作。",
    industries: ["IT", "广告", "媒体"],
    status: "notOpen",
    sourceName: "Webデザイン技能検定",
    sourceUrl: "https://www.webdesign.gr.jp/",
  },
  adobe: {
    name: "Adobe Certified Professional",
    category: "设计",
    difficulty: "基础",
    mode: "CBT 会场",
    schedule: "通过 Certiport 预约，科目、会场和日期以官方页面为准。",
    bestFor: "设计、广告、视频、内容行业作品集补强。",
    industries: ["广告", "媒体", "游戏", "设计"],
    status: "open",
    sourceName: "Adobe Certified Professional",
    sourceUrl: "https://certiport.pearsonvue.com/Certifications/Adobe/Certified-Professional/Overview",
  },
  retailSales: {
    name: "販売士 / リテールマーケティング",
    category: "零售",
    difficulty: "基础-中级",
    mode: "网络考试 / 会场",
    schedule: "级别和方式不同，报名以日本商工会议所官方页面为准。",
    bestFor: "零售、店铺运营、MD、销售企划。",
    industries: ["零售", "服装", "美容", "食品"],
    status: "open",
    sourceName: "日本商工会议所 販売士",
    sourceUrl: "https://www.kentei.ne.jp/retailsales",
  },
  service: {
    name: "サービス接遇検定",
    category: "服务",
    difficulty: "入门-基础",
    mode: "线下",
    schedule: "通常一年多次，报名和级别以实务技能检定协会官方页面为准。",
    bestFor: "酒店、航空、零售、服务、客户对应岗位。",
    industries: ["服务", "航空", "酒店", "零售"],
    status: "notOpen",
    sourceName: "実務技能検定協会",
    sourceUrl: "https://jitsumu-kentei.jp/SV/index",
  },
  hotel: {
    name: "ホテルビジネス実務検定",
    category: "酒店",
    difficulty: "基础",
    mode: "线下 / CBT",
    schedule: "报名和考试日以酒店实务技能认定协会官方页面为准。",
    bestFor: "酒店、旅游、接待、前台运营岗位。",
    industries: ["酒店", "旅游", "服务"],
    status: "notOpen",
    sourceName: "ホテルビジネス実務検定",
    sourceUrl: "https://www.jec-jp.org/hotel/",
  },
  travelDomestic: {
    name: "国内旅行業務取扱管理者",
    category: "旅游",
    difficulty: "中级",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名和考试日以全国旅行业协会官方页面为准。",
    bestFor: "旅行、航空、酒店、入境旅游相关岗位。",
    industries: ["旅游", "航空", "酒店"],
    status: "notOpen",
    sourceName: "全国旅行業協会",
    sourceUrl: "https://www.anta.or.jp/exam/",
  },
  travelGeneral: {
    name: "総合旅行業務取扱管理者",
    category: "旅游",
    difficulty: "难",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名和考试日以日本旅行业协会官方页面为准。",
    bestFor: "旅行、航空、海外旅游、入境业务。",
    industries: ["旅游", "航空", "商社"],
    status: "notOpen",
    sourceName: "日本旅行業協会",
    sourceUrl: "https://www.jata-net.or.jp/seminar/exam/",
  },
  medicalOffice: {
    name: "医療事務技能審査",
    category: "医疗",
    difficulty: "基础",
    mode: "线下 / 在宅考试",
    schedule: "报名、考试方式和会场以日本医疗教育财团官方页面为准。",
    bestFor: "医疗事务、医院受付、医疗服务岗位。",
    industries: ["医疗", "服务"],
    status: "open",
    sourceName: "日本医療教育財団",
    sourceUrl: "https://www.jme.or.jp/exam/mo/",
  },
  careWorker: {
    name: "介護福祉士",
    category: "介护",
    difficulty: "中级",
    mode: "线下国家考试",
    schedule: "通常每年 1 次，报名和考试日以社会福祉振兴・试验中心为准。",
    bestFor: "介护、福祉服务、护理设施运营岗位。",
    industries: ["介护", "福祉"],
    status: "notOpen",
    sourceName: "社会福祉振興・試験センター",
    sourceUrl: "https://www.sssc.or.jp/kaigo/",
  },
  foodHygiene: {
    name: "食品衛生責任者",
    category: "食品",
    difficulty: "入门",
    mode: "线下 / 部分线上",
    schedule: "各地实施方式不同，报名和受讲日以所在地食品卫生协会公告为准。",
    bestFor: "食品、餐饮、零售、店铺运营。",
    industries: ["食品", "零售", "服务"],
    status: "open",
    sourceName: "東京都食品衛生協会",
    sourceUrl: "https://www.toshoku.or.jp/",
  },
  salesforce: {
    name: "Salesforce Administrator",
    category: "SaaS",
    difficulty: "中级",
    mode: "线上监考 / 考点",
    schedule: "通过 Salesforce 认证入口预约，考试形式和日期以官方页面为准。",
    bestFor: "SaaS、CRM、客户成功、业务系统岗位。",
    industries: ["SaaS", "IT", "销售", "BPO"],
    status: "open",
    sourceName: "Salesforce Credentials",
    sourceUrl: "https://trailhead.salesforce.com/credentials/administratoroverview",
  },
  googleAnalytics: {
    name: "Google Analytics / Skillshop",
    category: "营销",
    difficulty: "入门",
    mode: "线上",
    schedule: "线上学习与认证为主，开放情况以 Google Skillshop 官方页面为准。",
    bestFor: "广告、媒体、EC、市场分析、产品运营。",
    industries: ["广告", "媒体", "EC", "产品"],
    status: "open",
    sourceName: "Google Skillshop",
    sourceUrl: "https://skillshop.withgoogle.com/",
  },
  googleAds: {
    name: "Google Ads 認定資格",
    category: "营销",
    difficulty: "入门-基础",
    mode: "线上",
    schedule: "线上学习与认证为主，考试开放情况以 Google Skillshop 官方页面为准。",
    bestFor: "广告运营、数字营销、媒体、EC、市场分析岗位。",
    industries: ["广告", "媒体", "EC", "营销"],
    status: "open",
    sourceName: "Google Skillshop",
    sourceUrl: "https://skillshop.withgoogle.com/",
  },
  bookkeeping1: {
    name: "日商簿記 1級",
    category: "商业",
    difficulty: "难关",
    mode: "线下统考",
    schedule: "通常按日本商工会议所统一考试日程实施，报名窗口以官方页面为准。",
    bestFor: "会计、财务、经营企划、希望强力证明会计能力的学生。",
    industries: ["会计", "金融", "企划"],
    status: "notOpen",
    sourceName: "日本商工会议所 簿記",
    sourceUrl: "https://www.kentei.ne.jp/bookkeeping",
  },
  bizAccounting: {
    name: "ビジネス会計検定",
    category: "商业",
    difficulty: "基础-中级",
    mode: "线下 / CBT",
    schedule: "通常按回次实施，报名和考试日以大阪商工会议所官方页面为准。",
    bestFor: "读懂财报、经营企划、金融、咨询、综合职。",
    industries: ["金融", "咨询", "企划"],
    status: "notOpen",
    sourceName: "ビジネス会計検定",
    sourceUrl: "https://www.b-accounting.jp/",
  },
  salary: {
    name: "給与計算実務能力検定",
    category: "HR",
    difficulty: "基础-中级",
    mode: "线下 / CBT",
    schedule: "级别和考试日以实务能力开发支援协会官方公告为准。",
    bestFor: "HR、劳务、总务、后台运营。",
    industries: ["HR", "BPO", "管理部"],
    status: "notOpen",
    sourceName: "給与計算実務能力検定",
    sourceUrl: "https://jitsumu-up.jp/",
  },
  myNumber: {
    name: "マイナンバー実務検定",
    category: "法务",
    difficulty: "基础",
    mode: "CBT / 线上",
    schedule: "报名和考试方式以全日本情报学习振兴协会官方页面为准。",
    bestFor: "HR、总务、BPO、个人信息处理岗位。",
    industries: ["HR", "BPO", "法务"],
    status: "open",
    sourceName: "全日本情報学習振興協会",
    sourceUrl: "https://www.joho-gakushu.or.jp/my-number/",
  },
  privacy: {
    name: "個人情報保護士",
    category: "法务",
    difficulty: "中级",
    mode: "CBT / 线上",
    schedule: "考试方式和报名窗口以全日本情报学习振兴协会官方页面为准。",
    bestFor: "法务、总务、信息管理、BPO、风险管理岗位。",
    industries: ["法务", "BPO", "IT"],
    status: "open",
    sourceName: "全日本情報学習振興協会",
    sourceUrl: "https://www.joho-gakushu.or.jp/piip/",
  },
  eco: {
    name: "eco検定",
    category: "环境",
    difficulty: "基础",
    mode: "IBT / CBT",
    schedule: "通常按回次开放 IBT / CBT，报名以东京商工会议所官方页面为准。",
    bestFor: "环境、能源、制造、ESG、可持续发展相关岗位。",
    industries: ["环境", "能源", "制造"],
    status: "notOpen",
    sourceName: "東京商工会議所 eco検定",
    sourceUrl: "https://kentei.tokyo-cci.or.jp/eco/",
  },
  sustainability: {
    name: "サステナビリティ検定",
    category: "环境",
    difficulty: "基础-中级",
    mode: "线上 / CBT",
    schedule: "考试方式和回次以主办方官方公告为准。",
    bestFor: "ESG、CSR、环境、经营企划、咨询。",
    industries: ["环境", "咨询", "企划"],
    status: "notOpen",
    sourceName: "サステナビリティ検定",
    sourceUrl: "https://www.susken.org/",
  },
  welding: {
    name: "溶接技能者評価試験",
    category: "制造・设备",
    difficulty: "中级",
    mode: "线下实技",
    schedule: "评价试验日程和会场以日本溶接协会官方页面为准。",
    bestFor: "制造现场、机械、钢铁、施工、设备维护。",
    industries: ["制造", "钢铁", "建设"],
    status: "notOpen",
    sourceName: "日本溶接協会",
    sourceUrl: "https://www.jwes.or.jp/",
  },
  machineMaintenance: {
    name: "機械保全技能士",
    category: "制造・设备",
    difficulty: "中级-难",
    mode: "线下学科+实技",
    schedule: "国家技能检定，报名和考试日以职业能力开发协会公告为准。",
    bestFor: "制造现场、设备保全、生产技术、机械维护。",
    industries: ["制造", "设备", "汽车"],
    status: "notOpen",
    sourceName: "中央職業能力開発協会",
    sourceUrl: "https://www.javada.or.jp/",
  },
  forklift: {
    name: "フォークリフト運転技能講習",
    category: "物流・安全",
    difficulty: "入门",
    mode: "线下讲习",
    schedule: "各培训机构日程不同，需按所在地和课程确认报名。",
    bestFor: "物流、仓库、制造现场、港湾相关岗位。",
    industries: ["物流", "制造", "海运"],
    status: "open",
    sourceName: "厚生労働省 技能講習制度",
    sourceUrl: "https://www.mhlw.go.jp/",
  },
  sanitaryManager: {
    name: "衛生管理者",
    category: "安全・管理",
    difficulty: "中级",
    mode: "线下国家考试",
    schedule: "各安全卫生技术中心实施，报名和考试日以官方页面为准。",
    bestFor: "总务、工厂管理、HR、安全卫生管理。",
    industries: ["制造", "HR", "建设"],
    status: "notOpen",
    sourceName: "安全衛生技術試験協会",
    sourceUrl: "https://www.exam.or.jp/",
  },
  constructionMgmt: {
    name: "施工管理技士補 / 技士",
    category: "建设",
    difficulty: "中级-难",
    mode: "线下国家考试",
    schedule: "土木、建築、電気等类别不同，报名和考试日以各实施机构公告为准。",
    bestFor: "建设、施工管理、设备工程、基础设施。",
    industries: ["建设", "设备", "能源"],
    status: "notOpen",
    sourceName: "建設業振興基金",
    sourceUrl: "https://www.fcip-shiken.jp/",
  },
  architect2: {
    name: "二級建築士",
    category: "建设",
    difficulty: "难",
    mode: "线下国家考试",
    schedule: "通常每年 1 回，报名、学科、设计制图考试以建築技術教育普及センター为准。",
    bestFor: "建筑设计、空间设计、施工、不动产开发。",
    industries: ["建设", "家具", "不动产"],
    status: "notOpen",
    sourceName: "建築技術教育普及センター",
    sourceUrl: "https://www.jaeic.or.jp/",
  },
  interior: {
    name: "インテリアコーディネーター",
    category: "设计・建筑",
    difficulty: "中级",
    mode: "线下 / CBT",
    schedule: "通常按年度实施，报名和考试方式以インテリア産業協会公告为准。",
    bestFor: "家具、住宅、空间设计、零售展示企划。",
    industries: ["家具", "不动产", "零售"],
    status: "notOpen",
    sourceName: "インテリア産業協会",
    sourceUrl: "https://www.interior.or.jp/examination/ic/",
  },
  kitchen: {
    name: "キッチンスペシャリスト",
    category: "设计・建筑",
    difficulty: "中级",
    mode: "线下",
    schedule: "报名和考试日以インテリア産業協会官方公告为准。",
    bestFor: "住宅设备、家具、空间设计、厨房相关商品企划。",
    industries: ["家具", "住宅", "零售"],
    status: "notOpen",
    sourceName: "インテリア産業協会",
    sourceUrl: "https://www.interior.or.jp/examination/ks/",
  },
  driving: {
    name: "普通自動車運転免許",
    category: "交通・物流",
    difficulty: "基础",
    mode: "线下教习 / 考试",
    schedule: "教习所和考试场日程不同，以所在地公安委员会和教习所为准。",
    bestFor: "物流、外勤营业、设施管理、地方勤務岗位。",
    industries: ["物流", "销售", "地方勤務"],
    status: "open",
    sourceName: "各都道府県公安委員会",
    sourceUrl: "https://www.npa.go.jp/",
  },
  bicycleMechanic: {
    name: "自転車安全整備士",
    category: "交通・零售",
    difficulty: "中级",
    mode: "线下",
    schedule: "报名和考试日以日本交通管理技術協会公告为准。",
    bestFor: "零售、体育用品、自行车、维修服务。",
    industries: ["零售", "体育", "服务"],
    status: "notOpen",
    sourceName: "日本交通管理技術協会",
    sourceUrl: "https://www.tmt.or.jp/",
  },
  registeredSeller: {
    name: "登録販売者",
    category: "医疗・零售",
    difficulty: "中级",
    mode: "线下都道府县考试",
    schedule: "各都道府县报名和考试日不同，以所在地公告为准。",
    bestFor: "药妆、零售、医疗服务、店铺运营。",
    industries: ["医疗", "零售", "美容"],
    status: "notOpen",
    sourceName: "各都道府県 登録販売者試験",
    sourceUrl: "https://www.mhlw.go.jp/",
  },
  childcare: {
    name: "保育士",
    category: "教育・福祉",
    difficulty: "中级-难",
    mode: "线下国家考试",
    schedule: "通常前期/后期实施，报名和考试日以全国保育士養成協議会为准。",
    bestFor: "保育、教育、儿童服务、福祉相关岗位。",
    industries: ["教育", "福祉", "服务"],
    status: "notOpen",
    sourceName: "全国保育士養成協議会",
    sourceUrl: "https://www.hoyokyo.or.jp/exam/",
  },
  animalCare: {
    name: "愛玩動物飼養管理士",
    category: "服务・专业",
    difficulty: "基础-中级",
    mode: "通信学习 / 考试",
    schedule: "报名、教材学习和考试日以日本愛玩動物協会官方页面为准。",
    bestFor: "宠物、服务、零售、动物相关商品企划。",
    industries: ["服务", "零售"],
    status: "notOpen",
    sourceName: "日本愛玩動物協会",
    sourceUrl: "https://www.jpc.or.jp/",
  },
  restaurantService: {
    name: "レストランサービス技能検定",
    category: "服务",
    difficulty: "中级",
    mode: "线下学科+实技",
    schedule: "报名和考试日以日本ホテル・レストランサービス技能協会公告为准。",
    bestFor: "酒店、餐饮、接待、服务管理。",
    industries: ["酒店", "服务", "食品"],
    status: "notOpen",
    sourceName: "HRS 技能検定",
    sourceUrl: "https://www.hrs.or.jp/",
  },
  sommelier: {
    name: "J.S.A. ソムリエ / ワインエキスパート",
    category: "服务・食品",
    difficulty: "中级-难",
    mode: "线下 / CBT",
    schedule: "报名和考试方式以日本ソムリエ協会官方公告为准。",
    bestFor: "酒店、餐饮、食品、奢侈品零售。",
    industries: ["酒店", "食品", "零售"],
    status: "notOpen",
    sourceName: "日本ソムリエ協会",
    sourceUrl: "https://www.sommelier.jp/",
  },
  event: {
    name: "イベント検定",
    category: "娱乐・活动",
    difficulty: "基础",
    mode: "线上 / CBT",
    schedule: "考试和报名方式以日本イベント産業振興協会公告为准。",
    bestFor: "活动、娱乐、体育、广告、媒体运营。",
    industries: ["娱乐", "体育", "广告"],
    status: "notOpen",
    sourceName: "日本イベント産業振興協会",
    sourceUrl: "https://www.jace.or.jp/",
  },
  drone: {
    name: "無人航空機操縦者技能証明",
    category: "航空・技术",
    difficulty: "中级",
    mode: "学科+实地",
    schedule: "国家资格制度，讲习、考试和申请以国土交通省/指定机构公告为准。",
    bestFor: "物流、测量、建设、农业、影像制作相关岗位。",
    industries: ["航空", "物流", "建设", "农业"],
    status: "notOpen",
    sourceName: "国土交通省 無人航空機",
    sourceUrl: "https://www.mlit.go.jp/koku/koku_tk10_000003.html",
  },
  hsk: {
    name: "HSK / 中国語検定",
    category: "语言",
    difficulty: "基础-难",
    mode: "线下 / CBT",
    schedule: "考试回次、报名和会场以 HSK 日本实施委员会或中国语检定协会公告为准。",
    bestFor: "中国业务、商社、制造业海外营业、旅游服务。",
    industries: ["商社", "制造", "旅游"],
    status: "notOpen",
    sourceName: "HSK 日本実施委員会",
    sourceUrl: "https://www.hskj.jp/",
  },
};

const certificateRankings = {
  IT: ["fe", "aws", "python3", "sg", "itpass"],
  Consulting: ["toeic", "bjt", "stats", "itpass", "bookkeeping"],
  Finance: ["bookkeeping", "fp", "securities", "toeic", "stats"],
  Manufacturing: ["qc", "toeic", "hazardous", "cad", "jlpt"],
  Retail: ["retailSales", "bjt", "bookkeeping", "mos", "jlpt"],
  Game: ["fe", "adobe", "webDesign", "gkentei", "toeic"],
  Telecom: ["nw", "fe", "sg", "toeic", "aws"],
  Semiconductor: ["qc", "fe", "toeic", "cad", "jlpt"],
  Chemical: ["qc", "hazardous", "toeic", "stats", "jlpt"],
  Healthcare: ["jlpt", "medicalOffice", "toeic", "bjt", "mos"],
  Pharma: ["toeic", "stats", "jlpt", "itpass", "bjt"],
  Energy: ["hazardous", "electrician2", "qc", "toeic", "itpass"],
  Logistics: ["trade", "customs", "toeic", "bjt", "itpass"],
  RealEstate: ["takken", "fp", "chintai", "bookkeeping", "jlpt"],
  Construction: ["electrician2", "fireEquipment", "cad", "qc", "toeic"],
  Food: ["foodHygiene", "qc", "retailSales", "bookkeeping", "bjt"],
  Advertising: ["googleAnalytics", "stats", "adobe", "toeic", "mos"],
  Education: ["jlpt", "bjt", "eiken", "toeic", "mos"],
  Hospitality: ["service", "hotel", "bjt", "jlpt", "toeic"],
  Trading: ["trade", "toeic", "bjt", "bookkeeping", "jlpt"],
  Airline: ["toeic", "bjt", "service", "travelGeneral", "jlpt"],
  Shipping: ["customs", "trade", "toeic", "jlpt", "bookkeeping"],
  AutomotiveParts: ["qc", "cad", "toeic", "fe", "jlpt"],
  Robotics: ["fe", "cad", "python3", "qc", "aws"],
  Aerospace: ["qc", "cad", "toeic", "fe", "jlpt"],
  SteelMetal: ["qc", "hazardous", "toeic", "cad", "bookkeeping"],
  Textile: ["qc", "color", "toeic", "bjt", "mos"],
  Apparel: ["color", "retailSales", "bjt", "mos", "bookkeeping"],
  Beauty: ["color", "retailSales", "bjt", "mos", "jlpt"],
  Sports: ["bjt", "googleAnalytics", "retailSales", "toeic", "itpass"],
  Entertainment: ["ip", "adobe", "webDesign", "toeic", "jlpt"],
  HR: ["mentalHealth", "secretary", "bjt", "jlpt", "careerConsultant"],
  LegalIP: ["ip", "businessLaw", "toeic", "jlpt", "itpass"],
  Agriculture: ["foodHygiene", "qc", "toeic", "itpass", "bookkeeping"],
  Security: ["sg", "sc", "fireEquipment", "itpass", "fe"],
  Environment: ["qc", "hazardous", "toeic", "itpass", "stats"],
  BPO: ["bjt", "mos", "itpass", "salesforce", "secretary"],
  Furniture: ["cad", "color", "toeic", "bjt", "bookkeeping"],
  EngineeringService: ["fe", "qc", "cad", "toeic", "electrician2"],
  CareService: ["careWorker", "jlpt", "bjt", "medicalOffice", "service"],
  RailwayRealEstate: ["takken", "fp", "bjt", "jlpt", "chintai"],
};

const certificateEvents = [
  {
    date: "2026-06-01",
    certId: "toeic",
    type: "报名",
    title: "TOEIC L&R 第 384 回报名截止",
    note: "公开考试日程和締切需以 IIBC 官方页面为准。",
    sourceUrl: certificates.toeic.sourceUrl,
  },
  {
    date: "2026-06-14",
    certId: "bookkeeping",
    type: "考试",
    title: "日商簿記 统一考试",
    note: "级别、会场和网络考试规则以日本商工会议所公告为准。",
    sourceUrl: certificates.bookkeeping.sourceUrl,
  },
  {
    date: "2026-06-14",
    certId: "fp",
    type: "考试",
    title: "FP 技能检定相关考试日",
    note: "申请期间、CBT 对象级别和考试日以日本 FP 协会官方页面为准。",
    sourceUrl: certificates.fp.sourceUrl,
  },
  {
    date: "2026-06-18",
    certId: "toeic",
    type: "考试",
    title: "TOEIC L&R 公开考试",
    note: "考场和准考证信息以 IIBC 官方页面为准。",
    sourceUrl: certificates.toeic.sourceUrl,
  },
  {
    date: "2026-06-21",
    certId: "mos",
    type: "考试",
    title: "MOS 全国一斉考试",
    note: "随时考试和全国一斉考试并行，具体场次以 MOS 官方页面为准。",
    sourceUrl: certificates.mos.sourceUrl,
  },
  {
    date: "2026-06-30",
    certId: "jlpt",
    type: "准备",
    title: "JLPT 7 月考试最后冲刺",
    note: "日本国内通常 7 月和 12 月考试，报名窗口以 JLPT / JEES 公告为准。",
    sourceUrl: certificates.jlpt.sourceUrl,
  },
  {
    date: "2026-06-30",
    certId: "itpass",
    type: "预约",
    title: "IT Passport CBT 可预约",
    note: "CBT 考场有空位时可预约，具体席位以 IPA CBT 页面为准。",
    sourceUrl: certificates.itpass.sourceUrl,
  },
  {
    date: "2026-06-08",
    certId: "sg",
    type: "预约",
    title: "情報セキュリティマネジメント CBT 可预约",
    note: "CBT 席位、考试期间和预约规则以 IPA 官方页面为准。",
    sourceUrl: certificates.sg.sourceUrl,
  },
  {
    date: "2026-06-10",
    certId: "hazardous",
    type: "报名",
    title: "危険物取扱者 电子申请确认",
    note: "各都道府县考试日不同，请按所在地确认电子申请期间。",
    sourceUrl: certificates.hazardous.sourceUrl,
  },
  {
    date: "2026-06-12",
    certId: "aws",
    type: "预约",
    title: "AWS Certification 可预约",
    note: "线上监考和考点考试均需以 AWS 官方可选日期为准。",
    sourceUrl: certificates.aws.sourceUrl,
  },
  {
    date: "2026-06-16",
    certId: "stats",
    type: "预约",
    title: "統計検定 CBT 可预约",
    note: "CBT 会场和科目开放情况以統計検定官方页面为准。",
    sourceUrl: certificates.stats.sourceUrl,
  },
  {
    date: "2026-06-20",
    certId: "bookkeeping",
    type: "预约",
    title: "日商簿記 网络考试席位确认",
    note: "网络考试与统一考试并行，级别和会场以官方页面为准。",
    sourceUrl: certificates.bookkeeping.sourceUrl,
  },
  {
    date: "2026-06-23",
    certId: "googleAnalytics",
    type: "线上",
    title: "Google Skillshop 自学认证",
    note: "线上学习与认证开放情况以 Skillshop 官方页面为准。",
    sourceUrl: certificates.googleAnalytics.sourceUrl,
  },
  {
    date: "2026-06-24",
    certId: "salesforce",
    type: "预约",
    title: "Salesforce Administrator 预约确认",
    note: "线上监考和考点考试的可选日期以 Salesforce 官方入口为准。",
    sourceUrl: certificates.salesforce.sourceUrl,
  },
  {
    date: "2026-06-25",
    certId: "mos",
    type: "考试",
    title: "MOS 随时考试 / 全国一斉考试确认",
    note: "具体科目、会场和场次以 MOS 官方页面为准。",
    sourceUrl: certificates.mos.sourceUrl,
  },
  {
    date: "2026-06-27",
    certId: "foodHygiene",
    type: "报名",
    title: "食品衛生責任者 受讲日确认",
    note: "各地实施方式不同，线上/线下受讲日以所在地公告为准。",
    sourceUrl: certificates.foodHygiene.sourceUrl,
  },
];

const certificateStatusOverrides = {
  jlpt: "urgent",
  toeic: "closed",
  fp: "closed",
  ap: "notOpen",
  qc: "notOpen",
};

const certificateStatusLabels = {
  open: "可报名 / 可预约",
  notOpen: "暂未开放",
  closed: "今年已过",
  urgent: "临近考试",
};

const certificateCareerFilters = [
  { value: "all", label: "全部职业", keywords: [] },
  { value: "engineer", label: "IT工程师 / SE", keywords: ["IT", "SIer", "通信", "云", "基础设施", "SaaS", "机器人"] },
  { value: "data", label: "数据 / AI", keywords: ["数据", "AI", "统计", "研究", "广告", "金融"] },
  { value: "business", label: "综合职 / 企划", keywords: ["全行业", "日企综合职", "企划", "DX", "产品", "管理部"] },
  { value: "consulting", label: "咨询 / 商社", keywords: ["咨询", "商社", "外资", "海外", "物流", "海运"] },
  { value: "finance", label: "金融 / 会计", keywords: ["金融", "会计", "保险", "证券", "银行", "不动产"] },
  { value: "marketing", label: "广告 / 媒体 / EC", keywords: ["广告", "媒体", "EC", "营销", "游戏", "设计"] },
  { value: "manufacturing", label: "制造 / 技术职", keywords: ["制造", "汽车", "化学", "设备", "钢铁", "建设", "能源"] },
  { value: "legalHr", label: "法务 / HR / 后台", keywords: ["法务", "HR", "BPO", "安防", "管理部"] },
  { value: "service", label: "接客 / 旅游 / 航空", keywords: ["服务", "航空", "酒店", "旅游", "零售", "食品"] },
  { value: "healthcare", label: "医疗 / 福祉", keywords: ["医疗", "介护", "福祉", "美容"] },
  { value: "realEstate", label: "建设 / 不动产", keywords: ["建设", "不动产", "住宅", "家具", "铁路沿线开发"] },
  { value: "environment", label: "环境 / 能源", keywords: ["环境", "能源", "农业", "水处理"] },
];

const studyResources = [
  {
    title: "JASSO 外国人留学生就业指南",
    category: "ES / 面试 / 留学生就职",
    note: "先用它建立日本新卒就活全流程，适合留学生从零开始。",
    url: "https://www.jasso.go.jp/ryugaku/after_study_j/job/guide.html",
  },
  {
    title: "JLPT 官方例题",
    category: "日语证书",
    note: "用官方题型确认 N1 / N2 的弱项，再决定是否需要报名。",
    url: "https://www.jlpt.jp/samples/forlearners.html",
  },
  {
    title: "BJT 官方样题",
    category: "商务日语",
    note: "适合练面试、邮件、会议等商务场景判断题。",
    url: "https://www.kanken.or.jp/bjt/english/about/sample.html",
  },
  {
    title: "IPA 试验问题",
    category: "IT / FE / AP",
    note: "IT Passport、FE、AP 都应优先刷官方公开题和 syllabus。",
    url: "https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html",
  },
  {
    title: "AWS Skill Builder",
    category: "云 / 基础架构",
    note: "备考 AWS Cloud Practitioner 和 SAA 前先补云服务概念。",
    url: "https://skillbuilder.aws/",
  },
  {
    title: "AtCoder",
    category: "编程测试",
    note: "工程师岗准备 coding test，可从 ABC A/B/C 题开始。",
    url: "https://atcoder.jp/",
  },
];

const interviewQuestions = [
  {
    question: "1分程度で自己紹介をしてください。",
    intent: "確認表达是否清楚、经历主线是否和岗位有关。",
    goal: "用“所属 / 研究或专业 / 代表经历 / 応募理由”四段结束，控制在 45-60 秒。",
    example: "私は〇〇大学で経営を学び、留学生向けイベント運営で30名の集客を担当しました。本日は貴社の海外展開職で活かせる調整力を中心にお話しします。",
  },
  {
    question: "なぜ日本で就職したいですか。",
    intent: "确认长期意愿、文化适应和签证风险。",
    goal: "回答落在职业目标、行业机会、在日经验和持续学习，不要只说喜欢日本文化。",
    example: "日本市场在〇〇领域有长期积累，我在留学期间也适应了团队协作和商务日语环境，希望在这里长期积累专业性。",
  },
  {
    question: "なぜ当社を志望していますか。",
    intent: "看你是否研究过业务、岗位和公司价值观。",
    goal: "把公司业务特点、岗位要求、自己的经历、入社后贡献连在一起。",
    example: "貴社の〇〇事業は海外顧客との接点が多く、私の中国語・日本語での調整経験を活かして顧客理解と提案に貢献できます。",
  },
  {
    question: "学生時代に最も力を入れたことは何ですか。",
    intent: "通过真实经历判断行动力、团队协作和复盘能力。",
    goal: "用 STAR：目标、困难、行动、结果、学到什么。最好带数字。",
    example: "目标是把参加率从〇%提高到〇%。原因分析后，我把告知渠道分成SNS和课堂说明，结果参加人数增加到〇人。",
  },
  {
    question: "あなたの強みと弱みを教えてください。",
    intent: "确认自我认知是否真实，弱项是否可控。",
    goal: "强项给证据，弱项给改善动作，不要把弱项包装成空话。",
    example: "強みは調整力です。弱みは完璧を求めて初動が遅くなる点で、現在は締切を分けて早めに共有するようにしています。",
  },
  {
    question: "入社後に挑戦したいことは何ですか。",
    intent: "判断岗位理解、成长方向和配属匹配。",
    goal: "说清短期能学习/执行什么，中长期想承担什么价值。",
    example: "まずは商品・顧客理解を徹底し、将来的には海外顧客向けの提案や改善プロジェクトを任される人材になりたいです。",
  },
  {
    question: "周囲と意見が対立した時、どう対応しましたか。",
    intent: "看协作方式、冲突处理和是否能用事实沟通。",
    goal: "不要说“我会忍耐”。讲清你如何整理双方目的、找共同目标、提出替代方案。",
    example: "意見を人ではなく論点に分け、期限・品質・負担の3点で比較して合意案を作りました。",
  },
  {
    question: "最近気になっている業界ニュースはありますか。",
    intent: "判断你是否真正关注行业，而不是只背公司官网。",
    goal: "准备 1 条行业新闻，用“事实、影响、自己观点、和公司关联”四步回答。",
    example: "生成AIによる業務効率化に注目しています。単なる自動化ではなく、顧客対応品質の標準化にもつながると考えています。",
  },
];

const reverseQuestions = [
  {
    question: "入社1年目に最も期待される成果や行動は何ですか。",
    intent: "拿到真实评价标准。",
    goal: "表现出你愿意尽快适应并主动补足能力。",
  },
  {
    question: "外国籍社員の配属、研修、在留資格手続きではどのようなサポートがありますか。",
    intent: "确认支援制度，也让公司知道你会认真规划在留资格。",
    goal: "问得自然，不要只围绕福利，要连接长期稳定入职。",
  },
  {
    question: "この職種で現在最も解決したい業務課題は何ですか。",
    intent: "了解岗位真实需求。",
    goal: "后续感谢邮件或二面里可以把自己的经验重新对齐这个课题。",
  },
  {
    question: "活躍している新人に共通する行動習慣はありますか。",
    intent: "判断公司文化和成长方式。",
    goal: "把面试结束前的印象拉回“我会成为这样的新人”。",
  },
  {
    question: "入社前までに補強しておくべき知識や資格はありますか。",
    intent: "得到准备清单。",
    goal: "展示学习意愿，也给自己拿到证书和项目准备方向。",
  },
  {
    question: "配属後、最初の3か月はどのように仕事を覚えていきますか。",
    intent: "确认新人培训方式和自学节奏。",
    goal: "了解是否有 OJT、导师、轮岗或现场学习，同时体现你会主动做准备。",
  },
  {
    question: "留学生出身の社員が活躍している部署や職種にはどのような特徴がありますか。",
    intent: "看公司是否真的有外国籍员工活跃场景。",
    goal: "不要只问人数；重点问能力如何被使用、需要补哪些差距。",
  },
];

const jobFlowSteps = [
  {
    title: "準備：自己分析",
    timing: "大学3年/修士1年 夏-冬",
    note: "整理经历、价值观、强弱项，至少做出自己PR、ガクチカ、志望軸三套素材。",
    actions: ["列出10段经历", "每段写目标・困难・行动・结果", "提炼3个选社轴"],
    source: "参考：リクナビ / JASSO",
  },
  {
    title: "業界・企業研究",
    timing: "随时开始，3月前完成第一轮",
    note: "比较行业盈利方式、岗位内容、选考方式和留学生适配度，不要只看公司名气。",
    actions: ["按行业做A/B/C清单", "确认ビザ支援和外国籍社員事例", "记录说明会问题"],
    source: "参考：JASSO 留学生就活指南",
  },
  {
    title: "広報解禁・エントリー",
    timing: "3月起",
    note: "日本新卒採用通常3月开始企业说明会和広報活动，先投目标企业，再补充安全网公司。",
    actions: ["注册採用ページ", "参加说明会", "管理締切和Webテスト日程"],
    source: "参考：厚労省 / 政府採用日程",
  },
  {
    title: "ES・履歴書提出",
    timing: "3-5月集中",
    note: "每家公司至少改志望動機和入社後貢献。留学生要把语言、跨文化、在日适应力写成岗位价值。",
    actions: ["准备日文履历", "检查敬语和西暦/和暦", "让学校キャリアセンター看一次"],
    source: "参考：JASSO / キャリアセンター",
  },
  {
    title: "Webテスト対策",
    timing: "提交前4-6周开始",
    note: "SPI以能力検査和性格検査为主。能力题要练速度，性格题要保持和面试内容一致。",
    actions: ["言語每天10题", "非言語每天15题", "错题按割合・速度・集合分类"],
    source: "参考：SPI3 公式",
  },
  {
    title: "面接・GD",
    timing: "6月前后进入高峰",
    note: "政府日程通常以6月作为选考活动开始节点。准备1分钟自我介绍、深挖问题、逆質問和小组讨论角色。",
    actions: ["录音练习60秒", "准备5个追问素材", "逆質問按岗位/培养/签证分组"],
    source: "参考：厚労省 / 就活媒体",
  },
  {
    title: "内々定・内定・在留資格",
    timing: "10月正式内定前后",
    note: "确认雇用条件、入社日、勤務地、在留資格变更材料和毕业证明。拿到内定后仍要保存所有文件。",
    actions: ["确认労働条件", "准备卒業見込証明書", "整理签证材料清单"],
    source: "参考：政府採用日程 / 入管手续",
  },
];

const testPrepItems = [
  {
    title: "SPI 言語：語句関係",
    note: "考同义、反义、包含、用途、原因结果。留学生先练题干速度和常见汉字词。",
    examples: ["例题：『医師：病院』と同じ関係は？ A 教師：学校 / B 野菜：市場 / C 時計：時間"],
    answer: "A。前者是在后者工作的职业。",
  },
  {
    title: "SPI 非言語：割合",
    note: "常见于销售、人数、价格变化。先记住“比べる基準是谁”。",
    examples: ["例题：定価8,000円の商品を15%引きで売ると価格はいくら？"],
    answer: "6,800円。8,000 × 0.85。",
  },
  {
    title: "SPI 非言語：速度",
    note: "距离、时间、速度的单位统一最重要。分数计算时不要急着心算。",
    examples: ["例题：時速60kmで90分走ると何km進む？"],
    answer: "90km。90分=1.5時間，60×1.5。",
  },
  {
    title: "SPI 非言語：集合",
    note: "适合用表格或文氏图。题目长时先标出总数、重复人数和未参加人数。",
    examples: ["例题：30人中、英語ができる人18人、中国語ができる人12人、両方できる人5人。どちらかできる人は？"],
    answer: "25人。18+12-5。",
  },
  {
    title: "性格検査：一致性",
    note: "不要为了“看起来优秀”乱选。面试里说重视团队合作，性格题却极端个人主义，会有违和感。",
    examples: ["练习：给自己写3个关键词：責任感 / 協調性 / 学習意欲。答题时保持这个人物像。"],
    answer: "没有唯一答案，重点是诚实、一贯、和岗位相容。",
  },
  {
    title: "玉手箱 / GAB：图表读取",
    note: "大企业和咨询常见。先看表头、单位、前年比，再计算。",
    examples: ["练习：看到売上表时，先圈出单位是円、千円还是百万円，再算增长率。"],
    answer: "目标是减少读错单位造成的失分。",
  },
  {
    title: "Coding Test：工程师岗",
    note: "准备数组、字符串、哈希、排序、二分、BFS/DFS。比刷难题更重要的是能解释思路。",
    examples: ["练习：给定数组 [2,7,11,15] 和 target=9，找两个数下标。"],
    answer: "用哈希表记录已出现数字，当前数 x 查 target-x。",
  },
];

const practiceCategories = [
  { value: "all", label: "全部题型" },
  { value: "SPI言語", label: "SPI 言語" },
  { value: "SPI非言語", label: "SPI 非言語" },
  { value: "玉手箱計数", label: "玉手箱 計数" },
  { value: "GAB/CAB論理", label: "GAB/CAB 論理" },
  { value: "性格検査", label: "性格検査" },
  { value: "Coding Test", label: "Coding Test" },
];

function rotateList(items, seed) {
  if (!items.length) return [];
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
  });
}

function buildPracticeQuestions() {
  const questions = [];
  const addQuestion = ({ category, subcategory, title, question, choices = [], answer, explanation, difficulty = "標準" }) => {
    questions.push({
      id: `Q${String(questions.length + 1).padStart(3, "0")}`,
      category,
      subcategory,
      title,
      question,
      choices,
      answer,
      explanation,
      difficulty,
      sourceType: "原创题型参考",
    });
  };

  const relationItems = [
    { pair: "医師：病院", correct: "教師：学校", distractors: ["野菜：市場", "時計：時間", "鍵：扉"], relation: "前者が後者で働く" },
    { pair: "種：植物", correct: "卵：鳥", distractors: ["水：川", "机：椅子", "本：図書館"], relation: "前者が成長して後者になる" },
    { pair: "包丁：料理", correct: "ペン：記入", distractors: ["駅：電車", "砂糖：甘い", "窓：光"], relation: "前者は後者のための道具" },
    { pair: "原因：結果", correct: "準備：成功", distractors: ["質問：沈黙", "会社：社員", "春：夏"], relation: "前者が後者につながる" },
    { pair: "地図：場所", correct: "履歴書：経歴", distractors: ["電話：音", "財布：硬貨", "雨：傘"], relation: "前者は後者を示す情報" },
    { pair: "駅員：駅", correct: "店員：店舗", distractors: ["学生：本", "商品：価格", "説明：理解"], relation: "前者が後者で働く人" },
    { pair: "予算：支出", correct: "予定：行動", distractors: ["画面：文字", "机：床", "切符：旅行"], relation: "前者が後者を管理する基準" },
    { pair: "面接：選考", correct: "講義：授業", distractors: ["企業：商品", "港：船", "資格：勉強"], relation: "前者は後者の一部" },
  ];

  for (let i = 0; i < 40; i += 1) {
    const item = relationItems[i % relationItems.length];
    const choices = rotateList([item.correct, ...item.distractors], i);
    addQuestion({
      category: "SPI言語",
      subcategory: "語句関係",
      title: `語句関係 ${i + 1}`,
      question: `「${item.pair}」と同じ関係になるものを選んでください。`,
      choices,
      answer: item.correct,
      explanation: `関係は「${item.relation}」。単語の意味より、2語のつながり方を見るのがコツです。`,
      difficulty: i % 5 === 0 ? "やや難" : "標準",
    });
  }

  const vocabItems = [
    { word: "慎重", correct: "注意深い", distractors: ["素早い", "新しい", "にぎやか"], hint: "軽率に進めない様子" },
    { word: "妥当", correct: "無理がなく適切", distractors: ["非常に珍しい", "長く続く", "強く反対する"], hint: "判断や条件がちょうどよいこと" },
    { word: "円滑", correct: "物事が滞りなく進む", distractors: ["意見が分かれる", "費用が増える", "形が丸い"], hint: "コミュニケーションや進行に使う" },
    { word: "簡潔", correct: "短く要点がまとまっている", distractors: ["複雑で長い", "感情的である", "古くからある"], hint: "ESや面接回答でも大事" },
    { word: "顕著", correct: "はっきり目立つ", distractors: ["完全に隠れる", "少し遅れる", "同じ形になる"], hint: "変化や特徴が明確なこと" },
    { word: "緻密", correct: "細かい点まで丁寧", distractors: ["大まかで雑", "偶然に頼る", "急いで終える"], hint: "分析や設計に使いやすい語" },
    { word: "柔軟", correct: "状況に合わせて変えられる", distractors: ["必ず同じ方法にする", "すぐ忘れる", "数量が少ない"], hint: "留学生の強みにしやすい語" },
    { word: "推進", correct: "物事を前に進める", distractors: ["記録を消す", "場所を移す", "価値を下げる"], hint: "プロジェクトや改革に使う" },
  ];

  for (let i = 0; i < 40; i += 1) {
    const item = vocabItems[i % vocabItems.length];
    const choices = rotateList([item.correct, ...item.distractors], i + 2);
    addQuestion({
      category: "SPI言語",
      subcategory: "語句意味",
      title: `語句意味 ${i + 1}`,
      question: `「${item.word}」の意味として最も近いものを選んでください。`,
      choices,
      answer: item.correct,
      explanation: `${item.hint}。SPI言語は、漢字から大意を推測してから選択肢を消すと速くなります。`,
      difficulty: i % 6 === 0 ? "基礎" : "標準",
    });
  }

  for (let i = 0; i < 32; i += 1) {
    const price = (42 + i) * 200;
    const discount = [5, 10, 15, 20, 25][i % 5];
    const result = price * (100 - discount) / 100;
    addQuestion({
      category: "SPI非言語",
      subcategory: "割合",
      title: `割合 ${i + 1}`,
      question: `定価${formatNumber(price)}円の商品を${discount}%引きで販売した。販売価格はいくらですか。`,
      choices: rotateList([`${formatNumber(result)}円`, `${formatNumber(price - discount)}円`, `${formatNumber(price * discount / 100)}円`, `${formatNumber(price * (100 + discount) / 100)}円`], i),
      answer: `${formatNumber(result)}円`,
      explanation: `値引き後は定価の${100 - discount}%なので、${formatNumber(price)}×${100 - discount}/100で計算します。`,
    });
  }

  for (let i = 0; i < 32; i += 1) {
    const speed = [40, 48, 56, 64, 72, 80, 88, 96][i % 8];
    const minutes = [30, 45, 60, 75, 90, 120][i % 6];
    const result = speed * minutes / 60;
    addQuestion({
      category: "SPI非言語",
      subcategory: "速度算",
      title: `速度算 ${i + 1}`,
      question: `時速${speed}kmで${minutes}分進むと、距離は何kmですか。`,
      choices: rotateList([`${formatNumber(result, 1)}km`, `${formatNumber(speed + minutes, 1)}km`, `${formatNumber(speed * minutes, 1)}km`, `${formatNumber(speed / minutes, 1)}km`], i + 1),
      answer: `${formatNumber(result, 1)}km`,
      explanation: `${minutes}分を${formatNumber(minutes / 60, 2)}時間に直し、速度×時間で求めます。`,
    });
  }

  for (let i = 0; i < 32; i += 1) {
    const total = 60 + (i % 12) * 3;
    const english = 24 + (i % 9);
    const chinese = 18 + (i % 8);
    const both = 6 + (i % 6);
    const either = english + chinese - both;
    const neither = total - either;
    addQuestion({
      category: "SPI非言語",
      subcategory: "集合",
      title: `集合 ${i + 1}`,
      question: `${total}人のうち、英語ができる人は${english}人、中国語ができる人は${chinese}人、両方できる人は${both}人です。どちらもできない人は何人ですか。`,
      choices: rotateList([`${neither}人`, `${either}人`, `${english + chinese}人`, `${both}人`], i + 3),
      answer: `${neither}人`,
      explanation: `どちらかできる人は${english}+${chinese}-${both}=${either}人。全体から引いて${neither}人です。`,
    });
  }

  for (let i = 0; i < 32; i += 1) {
    const cost = (18 + i) * 400;
    const rate = [10, 20, 25, 30][i % 4];
    const selling = cost * (100 + rate) / 100;
    addQuestion({
      category: "SPI非言語",
      subcategory: "損益算",
      title: `損益算 ${i + 1}`,
      question: `原価${formatNumber(cost)}円の商品に${rate}%の利益をのせて売る。売価はいくらですか。`,
      choices: rotateList([`${formatNumber(selling)}円`, `${formatNumber(cost * rate / 100)}円`, `${formatNumber(cost - cost * rate / 100)}円`, `${formatNumber(cost + rate)}円`], i + 4),
      answer: `${formatNumber(selling)}円`,
      explanation: `売価は原価×(1+利益率)。${formatNumber(cost)}×${100 + rate}/100です。`,
    });
  }

  for (let i = 0; i < 32; i += 1) {
    const a = 66 + (i % 9);
    const b = 70 + (i % 8);
    const c = 74 + (i % 7);
    const targetAvg = 75 + (i % 5);
    const fourth = targetAvg * 4 - a - b - c;
    addQuestion({
      category: "SPI非言語",
      subcategory: "平均",
      title: `平均 ${i + 1}`,
      question: `4回のテスト平均を${targetAvg}点にしたい。最初の3回が${a}点、${b}点、${c}点の場合、4回目は何点必要ですか。`,
      choices: rotateList([`${fourth}点`, `${targetAvg}点`, `${Math.round((a + b + c) / 3)}点`, `${fourth + 5}点`], i + 5),
      answer: `${fourth}点`,
      explanation: `必要な合計は${targetAvg}×4=${targetAvg * 4}点。そこから3回分を引きます。`,
    });
  }

  for (let i = 0; i < 30; i += 1) {
    const a = 3 + (i % 7);
    const x = 8 + (i % 13);
    const b = 12 + (i % 9) * 2;
    const c = a * x + b;
    addQuestion({
      category: "玉手箱計数",
      subcategory: "四則逆算",
      title: `四則逆算 ${i + 1}`,
      question: `${a}x + ${b} = ${c} のとき、xはいくつですか。`,
      choices: rotateList([String(x), String(x + 2), String(Math.max(1, x - 3)), String(a + b)], i),
      answer: String(x),
      explanation: `先に${c}-${b}=${a * x}、次に${a * x}÷${a}=${x}です。`,
    });
  }

  const regions = ["東京", "大阪", "福岡", "札幌"];
  for (let i = 0; i < 30; i += 1) {
    const values = regions.map((region, index) => ({
      region,
      sales: 120 + index * 35 + (i % 6) * 8 + i,
    }));
    const top = values.reduce((best, item) => (item.sales > best.sales ? item : best), values[0]);
    const tableText = values.map((item) => `${item.region}:${item.sales}百万円`).join(" / ");
    addQuestion({
      category: "玉手箱計数",
      subcategory: "表の読み取り",
      title: `表読み取り ${i + 1}`,
      question: `売上表「${tableText}」。売上が最も高い地域はどこですか。`,
      choices: rotateList(regions, i + 1),
      answer: top.region,
      explanation: `単位はすべて百万円なので、そのまま最大値を比較します。最大は${top.sales}百万円です。`,
    });
  }

  for (let i = 0; i < 30; i += 1) {
    const last = (42 + i) * 100;
    const rate = [5, 8, 10, 12, 15, 20][i % 6];
    const current = last * (100 + rate) / 100;
    addQuestion({
      category: "玉手箱計数",
      subcategory: "増減率",
      title: `増減率 ${i + 1}`,
      question: `前年売上が${formatNumber(last)}万円、今年売上が${formatNumber(current)}万円です。前年比の増加率は何%ですか。`,
      choices: rotateList([`${rate}%`, `${rate + 5}%`, `${Math.max(1, rate - 3)}%`, `${100 + rate}%`], i + 2),
      answer: `${rate}%`,
      explanation: `(今年-前年)÷前年×100。基準は必ず前年です。`,
    });
  }

  const peopleSets = [
    ["佐藤", "李", "田中", "王"],
    ["山田", "陳", "鈴木", "金"],
    ["高橋", "林", "中村", "趙"],
  ];
  for (let i = 0; i < 30; i += 1) {
    const [a, b, c, d] = peopleSets[i % peopleSets.length];
    const order = [d, a, b, c];
    addQuestion({
      category: "GAB/CAB論理",
      subcategory: "順序推理",
      title: `順序推理 ${i + 1}`,
      question: `${a}は${b}より前、${c}は${b}より後、${d}は${a}より前に発表した。最も早く発表した人は誰ですか。`,
      choices: rotateList([d, a, b, c], i),
      answer: d,
      explanation: `条件を並べると ${order.join(" → ")}。順序問題は矢印で書くと速く解けます。`,
      difficulty: i % 4 === 0 ? "やや難" : "標準",
    });
  }

  const logicSets = [
    { a: "留学生", b: "日本語学習者", c: "面接参加者" },
    { a: "営業職志望者", b: "企業研究をする人", c: "説明会参加者" },
    { a: "IT資格保有者", b: "基礎知識がある人", c: "開発職応募者" },
  ];
  for (let i = 0; i < 30; i += 1) {
    const item = logicSets[i % logicSets.length];
    const correct = `一部の${item.c}は${item.b}である`;
    addQuestion({
      category: "GAB/CAB論理",
      subcategory: "命題",
      title: `命題 ${i + 1}`,
      question: `すべての${item.a}は${item.b}である。一部の${item.c}は${item.a}である。このとき必ず正しいものはどれですか。`,
      choices: rotateList([correct, `すべての${item.c}は${item.b}である`, `${item.b}は全員${item.a}である`, `${item.c}と${item.b}は関係がない`], i + 1),
      answer: correct,
      explanation: `「一部の${item.c}」が${item.a}なら、その人たちは必ず${item.b}でもあります。`,
    });
  }

  const personalityScenarios = [
    "チームの締切が近いが、資料の品質にまだ不安がある。",
    "説明会で想定外の質問を受け、すぐ答えられない。",
    "先輩から自分と違う進め方を提案された。",
    "複数の会社の締切が同じ週に重なった。",
    "グループワークで発言が少ないメンバーがいる。",
    "新しいアルバイト先でルールがまだ理解できていない。",
    "面接前に企業研究が足りないと気づいた。",
    "日本語での説明が相手に伝わっていないと感じた。",
  ];
  const personalityOptions = [
    "A. まず期限を守る方法を決め、必要な品質ラインを確認する",
    "B. 完璧になるまで一人で直し続ける",
    "C. 状況を共有し、優先順位を相談する",
    "D. 自分の担当外なので待つ",
  ];
  for (let i = 0; i < 40; i += 1) {
    const scenario = personalityScenarios[i % personalityScenarios.length];
    addQuestion({
      category: "性格検査",
      subcategory: "行動選択",
      title: `行動選択 ${i + 1}`,
      question: `${scenario} あなたに最も近い行動を選んでください。`,
      choices: rotateList(personalityOptions, i),
      answer: "唯一の正解はありません。",
      explanation: "性格検査では“優秀そうな選択”より、一貫した人物像が大事です。面接で語る強みと矛盾しない選択を意識してください。",
      difficulty: "自己分析",
    });
  }

  const personalityStatements = [
    "初対面の人にも自分から話しかけることが多い。",
    "細かい確認をしてから行動する方だ。",
    "競争よりもチーム全体の成果を重視する。",
    "予定変更があっても比較的すぐ切り替えられる。",
    "数字や根拠を見て判断することが多い。",
    "相手の意見を聞いたうえで自分の意見を伝えたい。",
    "新しい環境では早めにルールを覚えようとする。",
    "難しい課題ほど、分解して進めると安心する。",
  ];
  for (let i = 0; i < 40; i += 1) {
    const statement = personalityStatements[i % personalityStatements.length];
    addQuestion({
      category: "性格検査",
      subcategory: "自己評価",
      title: `自己評価 ${i + 1}`,
      question: `次の文はあなたにどの程度当てはまりますか。「${statement}」`,
      choices: ["非常に当てはまる", "やや当てはまる", "どちらともいえない", "あまり当てはまらない", "全く当てはまらない"],
      answer: "唯一の正解はありません。",
      explanation: "極端な回答が多すぎると人物像が不自然になります。自分の強み、弱み、志望職種との相性を考えて選びます。",
      difficulty: "自己分析",
    });
  }

  const codingTemplates = [
    {
      title: "Two Sum",
      build: (i) => {
        const target = 9 + (i % 5);
        const nums = [2 + (i % 3), target - (2 + (i % 3)), 11, 15];
        return {
          question: `配列 [${nums.join(", ")}] から、合計が${target}になる2つの数を探す。効率のよい方針は？`,
          answer: "ハッシュ表で見た数を記録し、各要素について target - x が既にあるか確認する。",
          explanation: "二重ループより、ハッシュ表を使うと平均O(n)で探せます。",
        };
      },
    },
    {
      title: "文字頻度",
      build: () => ({
        question: "文字列の中で最も多く出現する文字を返すには、どのデータ構造が使いやすいですか。",
        answer: "Map / 連想配列",
        explanation: "文字をキー、出現回数を値として数えると実装しやすいです。",
      }),
    },
    {
      title: "二分探索",
      build: (i) => ({
        question: `昇順配列から値${20 + i}を探す。線形探索より速くする前提条件は何ですか。`,
        answer: "配列がソート済みであること。",
        explanation: "二分探索は中央を見て探索範囲を半分にするため、順序が必要です。",
      }),
    },
    {
      title: "スタック",
      build: () => ({
        question: "括弧列が正しいかを判定する時、どのデータ構造を使うとよいですか。",
        answer: "スタック",
        explanation: "開き括弧を積み、閉じ括弧が来たら直前の開き括弧と対応するか確認します。",
      }),
    },
    {
      title: "BFS",
      build: () => ({
        question: "迷路でスタートからゴールまでの最短手数を求めたい。重みが同じ場合に使いやすい探索は？",
        answer: "BFS（幅優先探索）",
        explanation: "同じコストの移動なら、近い層から順に見るBFSが最短距離に向いています。",
      }),
    },
    {
      title: "計算量",
      build: () => ({
        question: "配列を1回だけ左から右に走査する処理の時間計算量は何ですか。",
        answer: "O(n)",
        explanation: "要素数nに比例して処理回数が増えるためO(n)です。",
      }),
    },
  ];
  for (let i = 0; i < 30; i += 1) {
    const template = codingTemplates[i % codingTemplates.length];
    const built = template.build(i);
    addQuestion({
      category: "Coding Test",
      subcategory: template.title,
      title: `${template.title} ${i + 1}`,
      question: built.question,
      choices: [],
      answer: built.answer,
      explanation: built.explanation,
      difficulty: i % 6 === 0 ? "基礎" : "標準",
    });
  }

  return questions.slice(0, 500);
}

const practiceQuestions = buildPracticeQuestions();

const practiceSites = [
  {
    name: "SPI3 公式",
    type: "官方说明",
    url: "https://www.spi.recruit.co.jp/",
    note: "确认 SPI 的能力検査、性格検査、实施形式和基本结构。",
    use: "先看考试构成，不把它当刷题站。",
  },
  {
    name: "リクナビ 就活準備",
    type: "就活媒体",
    url: "https://job.rikunabi.com/contents/",
    note: "适合看自我分析、ES、面试、Webテスト准备流程。",
    use: "用来补流程和面试准备，不要只刷题。",
  },
  {
    name: "マイナビ 学生の窓口",
    type: "学习文章",
    url: "https://gakumado.mynavi.jp/",
    note: "可搜索 SPI、玉手箱、面试、逆質問等就活文章。",
    use: "用关键词搜索题型和解法。",
  },
  {
    name: "JASSO 留学生就職支援",
    type: "留学生向け",
    url: "https://www.jasso.go.jp/ryugaku/after_study_j/job/",
    note: "面向外国人留学生的日本就职信息、活动和注意点。",
    use: "确认留学生特有的在留资格、学校支援和求职资源。",
  },
  {
    name: "One Career 就活対策",
    type: "选考经验",
    url: "https://www.onecareer.jp/",
    note: "可以查企业选考流程、ES、面试经验和Web测试类型。",
    use: "查公司前先确认是否需要登录和信息来源可信度。",
  },
  {
    name: "外資就活ドットコム",
    type: "高难度选考",
    url: "https://gaishishukatsu.com/",
    note: "咨询、外资、金融、综合商社等高难度选考经验较多。",
    use: "适合准备ケース面接、GD、外资Webテスト。",
  },
];

const storageKeys = {
  favorites: "findjobjp:favorites",
  progress: "findjobjp:progress",
  memos: "findjobjp:memos",
  customCompanies: "findjobjp:custom-companies",
  esDraft: "findjobjp:es-draft",
  studyingCertificates: "findjobjp:studying-certificates",
  myProfile: "compass:my-profile",
  ownedCertificates: "compass:owned-certificates",
  fileLibrary: "compass:file-library",
  companyFollowups: "compass:company-followups",
  mySchedules: "compass:my-schedules",
  interviewAnswers: "compass:interview-answers",
};

const defaultOpenCertificateGroups = new Set(["语言", "IT"]);

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("浏览器阻止了本地保存");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayIndustry(industry) {
  return industryLabels[industry] || industry;
}

function displayRegion(region) {
  return regionLabels[region] || region;
}

function displayRole(role) {
  if (roleLabels[role]) return roleLabels[role];
  const lower = String(role).toLowerCase();
  const labels = [];
  if (/global|overseas|international|trade/.test(lower)) labels.push("海外");
  if (/digital|dx|it|web|cloud/.test(lower)) labels.push("デジタル");
  if (/data|analyst|analytics|ml|ai/.test(lower)) labels.push("データ");
  if (/engineer|engineering|developer|se|embedded|software|frontend|backend|server|network|infrastructure/.test(lower)) labels.push("エンジニア");
  else if (/consult|advisory|advisor/.test(lower)) labels.push("コンサルタント");
  else if (/sales|banking|markets|securities/.test(lower)) labels.push("営業");
  else if (/planning|planner|producer|product|business|development/.test(lower)) labels.push("企画");
  else if (/marketing|brand|media/.test(lower)) labels.push("マーケティング");
  else if (/operation|operations|support|customer|service|success/.test(lower)) labels.push("オペレーション");
  else if (/research|r&d/.test(lower)) labels.push("研究開発");
  else if (/design|designer|artist|creative/.test(lower)) labels.push("デザイン");
  else if (/quality|production|process|plant/.test(lower)) labels.push("生産・品質");
  else if (/tax|assurance|legal|patent|ip|risk|claims|actuary/.test(lower)) labels.push("専門職");
  else if (/store|retail|merchandising/.test(lower)) labels.push("店舗・MD");
  else if (/hotel|guest|ground|airport|travel|inbound/.test(lower)) labels.push("接客・観光");
  if (labels.length) return [...new Set(labels)].join("・");
  if (/[a-z]/i.test(String(role))) return "職種要確認";
  return role;
}

function displayTag(tag) {
  if (tagLabels[tag]) return tagLabels[tag];
  const lower = String(tag).toLowerCase();
  if (/engineer|engineering|technical|technology/.test(lower)) return "技術";
  if (/consult|case/.test(lower)) return "コンサル";
  if (/sales|business/.test(lower)) return "ビジネス";
  if (/global|overseas|international|trade/.test(lower)) return "海外";
  if (/data|ai|ml/.test(lower)) return "データ";
  if (/operation|support|service/.test(lower)) return "オペレーション";
  if (/product|planning/.test(lower)) return "企画";
  if (/[a-z]/i.test(String(tag))) return "要確認";
  return tag;
}

function displayCompanyName(company) {
  return company.jpName || company.name;
}

function displayRoles(company) {
  return company.roles.map(displayRole).join(" / ");
}

function displayCompanyDescription(company) {
  return company.jpDescription || company.description;
}

function displaySourceName(company) {
  if (company.sourceType === "sample") return "候補データ（公式採用ページ確認前）";
  if (company.sourceType === "manual") return "手動入力";
  const raw = company.sourceName || "";
  if (/candidate expansion data|official recruiting page link needs verification/i.test(raw)) {
    return "候補拡張データ（公式採用ページリンク確認前）";
  }
  if (/公司官方|官方|公式|official|freshers|new graduates|募集要項|採用/i.test(raw)) {
    return `${displayCompanyName(company)} 公式採用ページ`;
  }
  if (/地方企业样例数据|样例|sample/i.test(raw)) return "地方企業候補データ（確認前）";
  return raw || "情報源未確認";
}

function displayConfidence(company) {
  if (company.sourceType === "sample") return "募集状況・締切・外国人採用比率・口コミは今後公式情報で確認が必要です。";
  const raw = company.confidence || "";
  if (/candidate data|verify official recruiting status/i.test(raw)) {
    return "公式採用ページで募集状況・締切・応募条件の確認が必要です。";
  }
  if (/高可信|已确认官方|官方入口|官方募集|公式採用/i.test(raw)) {
    return "公式採用ページを確認済み。外国人採用比率は未公開の場合があります。";
  }
  if (/中可信/.test(raw)) return "公式情報または就活媒体で追加確認が必要です。";
  if (/需人工确认/.test(raw)) return "手動確認が必要です。";
  return raw || "確認状況未設定";
}

function displayReviewSourceName(review) {
  const raw = review?.sourceName || "";
  if (/review source placeholder|rating summary pending/i.test(raw)) return "口コミ評価ソース確認前";
  if (/评分摘要待接入|评价来源待接入|评分待接入/.test(raw)) return "口コミ評価ソース確認前";
  return raw || "口コミ評価ソース未設定";
}

function displayReviewNote(review) {
  const raw = review?.note || "";
  if (/prototype review score/i.test(raw)) {
    return "現在の口コミ点数はプロトタイプ用の仮データです。公開評価ソースで確認後に更新します。";
  }
  if (/stores only rating summaries/i.test(raw)) {
    return "評価点・タグ・参照リンクのみを保存し、第三者サイトの口コミ本文は転載しません。";
  }
  if (/仅展示|仅保存/.test(raw)) {
    return "評価点・タグ・参照リンクのみを保存し、第三者サイトの口コミ本文は転載しません。";
  }
  return raw;
}

function displayForeignRecordSource(record) {
  const raw = record?.sourceName || "";
  if (record?.status === "sample") return "サンプル値（確認前）";
  if (/示例数据|待官方资料确认/.test(raw)) return "公式資料確認前";
  if (/公式採用ページでは未公開/.test(raw)) return "公式採用ページでは未公開";
  return raw || "情報源未確認";
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function currentDateStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function calendarDaysForMonth(year, month) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const gridStart = new Date(year, month, 1 - monthStart.getDay());
  const gridEnd = new Date(year, month, monthEnd.getDate() + (6 - monthEnd.getDay()));
  const dayCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      key: dateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

function latestForeignRecord(company) {
  return company.foreignHiringRecords?.at(-1) || {
    year: "未确认",
    ratio: null,
    status: "unknown",
    sourceName: "未公开",
  };
}

function ratioText(company) {
  const record = latestForeignRecord(company);
  return record.ratio === null || record.ratio === undefined ? "未公開" : `${record.ratio}%`;
}

function ratioNumber(company) {
  const record = latestForeignRecord(company);
  return Number.isFinite(record.ratio) ? record.ratio : 0;
}

function ratioStatusText(company) {
  const status = latestForeignRecord(company).status;
  if (status === "official") return "公式公開";
  if (status === "estimated") return "推定値";
  if (status === "sample") return "確認前";
  return "未公開";
}

function ratingNumber(company) {
  return company.reviewSummary?.rating ?? company.rating ?? 0;
}

function ratingText(company) {
  const rating = ratingNumber(company);
  return rating ? rating.toFixed(1) : "未接続";
}

function studentFitScore(company) {
  let score = 34;
  if (company.visaSupport) score += 18;
  if (["N3", "N2"].includes(company.jlpt)) score += 12;
  if (company.jlpt === "N1") score += 8;
  if (company.jlpt === "Business") score += 4;
  if (ratioNumber(company) >= 20) score += 16;
  else if (ratioNumber(company) >= 10) score += 10;
  else if (ratioNumber(company) > 0) score += 5;
  if (company.education.includes("language")) score += 10;
  if (company.statuses.includes("internship")) score += 6;
  if (company.statuses.includes("yearRound")) score += 5;
  if (company.sourceType === "official") score += 6;
  if (daysUntil(company.deadline) >= 14) score += 4;
  return Math.min(100, score);
}

function studentFitLabel(score) {
  if (score >= 82) return "高相性";
  if (score >= 68) return "相性あり";
  if (score >= 52) return "挑戦可";
  return "要確認";
}

function selectionFlow(company) {
  const flow = ["企業研究"];
  if (company.statuses.includes("internship")) flow.push("インターン / 説明会");
  else flow.push("説明会");
  flow.push("ES / 履歴書");
  if (["IT", "Game"].includes(company.industry)) flow.push("Webテスト / コーディング");
  else if (["Telecom", "Semiconductor"].includes(company.industry)) flow.push("Webテスト / 技術面接");
  else if (company.industry === "Consulting") flow.push("Webテスト / ケース面接");
  else if (["Manufacturing", "Chemical", "Energy", "Construction", "AutomotiveParts", "Robotics", "Aerospace", "SteelMetal", "Environment", "Security", "EngineeringService"].includes(company.industry)) flow.push("SPI / 技術理解");
  else flow.push("SPI / Webテスト");
  flow.push("面接");
  flow.push("内定");
  return flow;
}

const state = {
  page: "home",
  education: "all",
  view: "all",
  selectedId: "",
  favorites: new Set(readStorage(storageKeys.favorites, [])),
  studyingCertificates: new Set(readStorage(storageKeys.studyingCertificates, [])),
  applications: readStorage(storageKeys.progress, {}),
  memos: readStorage(storageKeys.memos, {}),
  customCompanies: readStorage(storageKeys.customCompanies, []),
  myProfile: readStorage(storageKeys.myProfile, {
    startDate: "",
    targetDate: "",
    resumeName: "",
    resumeNote: "",
  }),
  ownedCertificates: readStorage(storageKeys.ownedCertificates, []),
  fileLibrary: readStorage(storageKeys.fileLibrary, []),
  companyFollowups: readStorage(storageKeys.companyFollowups, []),
  mySchedules: readStorage(storageKeys.mySchedules, []),
  interviewAnswers: readStorage(storageKeys.interviewAnswers, {}),
  practiceCategory: "all",
  currentPracticeQuestionId: "",
  practiceAnswerVisible: false,
  certificateCareerFilter: "all",
  certificateCategoryFilter: "all",
  editingCompanyId: null,
  visibleCompanyCount: companyPageSize,
};

function getAllCompanies() {
  return [...companies, ...state.customCompanies.map(normalizeCompany)];
}

function splitList(value) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function setCheckedValues(name, values) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function saveCustomCompanies() {
  writeStorage(storageKeys.customCompanies, state.customCompanies);
}

function isCustomCompany(id) {
  return state.customCompanies.some((company) => company.id === id);
}

function buildCustomCompanyFromForm() {
  const fields = elements.companyFields;
  const id = fields.id.value || `custom-${slugify(fields.name.value) || Date.now()}-${Date.now()}`;
  const ratioValue = fields.ratio.value === "" ? null : Number(fields.ratio.value);
  const ratingValue = fields.rating.value === "" ? 0 : Number(fields.rating.value);
  const roles = splitList(fields.roles.value);
  const tags = splitList(fields.tags.value);
  const notes = splitList(fields.notes.value);
  const statuses = getCheckedValues("companyStatus");
  const education = getCheckedValues("companyEducation");
  const sourceName = fields.sourceName.value.trim() || "手动录入";
  const lastChecked = currentDateStamp();
  const ratioStatus = ratioValue === null ? "unknown" : fields.ratioStatus.value;

  return {
    id,
    name: fields.name.value.trim(),
    industry: fields.industry.value,
    region: fields.region.value,
    size: fields.size.value.trim() || "未確認",
    statuses: statuses.length ? statuses : ["recruiting"],
    education: education.length ? education : ["undergrad", "grad"],
    roles: roles.length ? roles : ["職種要確認"],
    jlpt: fields.jlpt.value,
    foreignRatio: ratioValue ?? 0,
    rating: ratingValue,
    visaSupport: fields.visa.checked,
    deadline: fields.deadline.value,
    match: 70,
    tags,
    description: fields.description.value.trim() || "手動で追加した会社です。事業内容や職種の詳細を後で補足してください。",
    notes: notes.length ? notes : ["ユーザーが手動入力した情報です。公式情報源を補足してください。"],
    sourceName,
    sourceType: "manual",
    sourceUrl: fields.sourceUrl.value.trim(),
    applyUrl: fields.applyUrl.value.trim(),
    reviewSource: fields.reviewSource.value.trim() || "口コミ評価ソース確認前",
    lastChecked,
    confidence: ratioStatus === "official" ? "ユーザー入力：公式公開" : "ユーザー入力：要確認",
    history: [
      { year: new Date().getFullYear() - 2, foreignRatio: ratioValue ?? 0, rating: ratingValue },
      { year: new Date().getFullYear() - 1, foreignRatio: ratioValue ?? 0, rating: ratingValue },
      { year: new Date().getFullYear(), foreignRatio: ratioValue ?? 0, rating: ratingValue },
    ],
    foreignHiringRecords: [
      new Date().getFullYear() - 2,
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
    ].map((year) => ({
      year,
      ratio: ratioValue,
      metric: "外国人採用/社員比例",
      status: ratioStatus,
      sourceName,
      sourceUrl: fields.sourceUrl.value.trim(),
      checkedAt: lastChecked,
      note: ratioStatus === "official" ? "ユーザーが公式公開データとして登録。" : "ユーザー入力データです。情報源の追加確認をおすすめします。",
    })),
    reviewSummary: {
      rating: ratingValue,
      maxRating: 5,
      reviewCount: null,
      sourceName: fields.reviewSource.value.trim() || "口コミ評価ソース確認前",
      sourceUrl: "",
      lastChecked,
      status: "summary-only",
      tags: tags.slice(0, 3),
      rawReviewsStored: false,
      note: "手動入力の評価サマリーです。第三者サイトの口コミ本文は保存・転載しません。",
    },
  };
}

function resetCompanyForm() {
  elements.companyForm.reset();
  elements.companyFields.id.value = "";
  elements.companyFields.deadline.value = currentDateStamp();
  elements.companyFields.ratioStatus.value = "unknown";
  setCheckedValues("companyStatus", ["recruiting"]);
  setCheckedValues("companyEducation", ["undergrad", "grad"]);
  elements.deleteCompanyButton.hidden = true;
}

function fillCompanyForm(company) {
  resetCompanyForm();
  const fields = elements.companyFields;
  fields.id.value = company.id;
  fields.name.value = company.name;
  fields.industry.value = company.industry;
  fields.region.value = company.region;
  fields.size.value = company.size;
  fields.jlpt.value = company.jlpt;
  fields.deadline.value = company.deadline;
  fields.roles.value = company.roles.join(", ");
  fields.tags.value = company.tags.join(", ");
  fields.ratio.value = latestForeignRecord(company).ratio ?? "";
  fields.ratioStatus.value = latestForeignRecord(company).status || "unknown";
  fields.rating.value = ratingNumber(company) || "";
  fields.reviewSource.value = company.reviewSummary?.sourceName || company.reviewSource || "";
  fields.description.value = company.description;
  fields.notes.value = company.notes.join("\n");
  fields.sourceName.value = company.sourceName;
  fields.sourceUrl.value = company.sourceUrl || "";
  fields.applyUrl.value = company.applyUrl || "";
  fields.visa.checked = company.visaSupport;
  setCheckedValues("companyStatus", company.statuses);
  setCheckedValues("companyEducation", company.education);
  elements.deleteCompanyButton.hidden = !isCustomCompany(company.id);
}

function openCompanyModal(company = null) {
  state.editingCompanyId = company?.id || null;
  if (company) {
    fillCompanyForm(company);
    document.querySelector("#companyModalTitle").textContent = isCustomCompany(company.id) ? "企業情報を編集" : "自分用にコピーして編集";
    if (!isCustomCompany(company.id)) {
      elements.companyFields.id.value = "";
      elements.deleteCompanyButton.hidden = true;
    }
  } else {
    resetCompanyForm();
    document.querySelector("#companyModalTitle").textContent = "会社を追加";
  }
  elements.companyModal.classList.add("visible");
  elements.companyModal.setAttribute("aria-hidden", "false");
  elements.companyFields.name.focus();
}

function closeCompanyModal() {
  elements.companyModal.classList.remove("visible");
  elements.companyModal.setAttribute("aria-hidden", "true");
  state.editingCompanyId = null;
}

function upsertCustomCompany(company) {
  const existingIndex = state.customCompanies.findIndex((item) => item.id === company.id);
  if (existingIndex >= 0) {
    state.customCompanies[existingIndex] = company;
  } else {
    state.customCompanies.push(company);
  }
  saveCustomCompanies();
}

function normalizeCompany(company) {
  const normalized = { ...company };
  if (!Array.isArray(normalized.tags)) normalized.tags = [];
  if (!Array.isArray(normalized.roles)) normalized.roles = ["職種要確認"];
  if (!Array.isArray(normalized.notes)) normalized.notes = ["情報を後で補足してください。"];
  if (!Array.isArray(normalized.statuses)) normalized.statuses = ["recruiting"];
  if (!Array.isArray(normalized.education)) normalized.education = ["undergrad", "grad"];
  if (!Array.isArray(normalized.foreignHiringRecords)) {
    const ratio = Number.isFinite(normalized.foreignRatio) ? normalized.foreignRatio : null;
    normalized.foreignHiringRecords = [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()].map((year) => ({
      year,
      ratio,
      metric: "外国人採用/社員比例",
      status: ratio === null ? "unknown" : "sample",
      sourceName: normalized.sourceName || "手動入力",
      sourceUrl: normalized.sourceUrl || "",
      checkedAt: normalized.lastChecked || currentDateStamp(),
      note: "旧形式データから自動補完しました。",
    }));
  }
  if (!normalized.reviewSummary) {
    normalized.reviewSummary = {
      rating: normalized.rating || 0,
      maxRating: 5,
      reviewCount: null,
      sourceName: normalized.reviewSource || "口コミ評価ソース確認前",
      sourceUrl: "",
      lastChecked: normalized.lastChecked || currentDateStamp(),
      status: "summary-only",
      tags: normalized.tags.slice(0, 3),
      rawReviewsStored: false,
      note: "旧形式データから自動補完しました。",
    };
  }
  return normalized;
}

const elements = {
  mainNavButtons: [...document.querySelectorAll("[data-page]")],
  pageLinks: [...document.querySelectorAll("[data-page-link]")],
  pageViews: [...document.querySelectorAll("[data-page-view]")],
  statusChecks: [...document.querySelectorAll('input[name="status"]')],
  educationButtons: [...document.querySelectorAll("[data-education]")],
  industrySelect: document.querySelector("#industrySelect"),
  regionSelect: document.querySelector("#regionSelect"),
  jlptSelect: document.querySelector("#jlptSelect"),
  ratioRange: document.querySelector("#ratioRange"),
  ratioOutput: document.querySelector("#ratioOutput"),
  visaSwitch: document.querySelector("#visaSwitch"),
  searchInput: document.querySelector("#searchInput"),
  tabs: [...document.querySelectorAll("[data-view]")],
  sortSelect: document.querySelector("#sortSelect"),
  companyList: document.querySelector("#companyList"),
  loadMoreCompaniesButton: document.querySelector("#loadMoreCompaniesButton"),
  resultCount: document.querySelector("#resultCount"),
  detailPanel: document.querySelector("#detailPanel"),
  trendChart: document.querySelector("#trendChart"),
  progressPanel: document.querySelector("#progressPanel"),
  pipelineList: document.querySelector("#pipelineList"),
  deadlineList: document.querySelector("#deadlineList"),
  dashboardFreshnessList: document.querySelector("#dashboardFreshnessList"),
  homeDeadlineList: document.querySelector("#homeDeadlineList"),
  homeCompanyPill: document.querySelector("#homeCompanyPill"),
  progressStageList: document.querySelector("#progressStageList"),
  currentStageLabel: document.querySelector("#currentStageLabel"),
  currentStageSummary: document.querySelector("#currentStageSummary"),
  currentStageAction: document.querySelector("#currentStageAction"),
  currentTodoList: document.querySelector("#currentTodoList"),
  homeAddCompanyButton: document.querySelector("#homeAddCompanyButton"),
  industryGuideList: document.querySelector("#industryGuideList"),
  homeTimelineSummary: document.querySelector("#homeTimelineSummary"),
  homeDeadlineStrip: document.querySelector("#homeDeadlineStrip"),
  homeFreshnessList: document.querySelector("#homeFreshnessList"),
  homeFollowupForm: document.querySelector("#homeFollowupForm"),
  homeFollowupList: document.querySelector("#homeFollowupList"),
  followupCompanyInput: document.querySelector("#followupCompanyInput"),
  followupUrlInput: document.querySelector("#followupUrlInput"),
  followupAddressInput: document.querySelector("#followupAddressInput"),
  followupRoleInput: document.querySelector("#followupRoleInput"),
  followupTimeInput: document.querySelector("#followupTimeInput"),
  followupNoteInput: document.querySelector("#followupNoteInput"),
  lastSyncLabel: document.querySelector("#lastSyncLabel"),
  toolkitTabs: [...document.querySelectorAll("[data-toolkit-view]")],
  toolkitViews: {
    certificates: document.querySelector("#certificatesView"),
    interview: document.querySelector("#interviewView"),
    es: document.querySelector("#esView"),
    flow: document.querySelector("#flowView"),
  },
  certIndustrySelect: document.querySelector("#certIndustrySelect"),
  certRankingList: document.querySelector("#certRankingList"),
  certScheduleList: document.querySelector("#certScheduleList"),
  studyResourceList: document.querySelector("#studyResourceList"),
  certificateCatalogList: document.querySelector("#certificateCatalogList"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  qualificationCalendar: document.querySelector("#qualificationCalendar"),
  calendarEventList: document.querySelector("#calendarEventList"),
  practiceSiteList: document.querySelector("#practiceSiteList"),
  quizCategorySelect: document.querySelector("#quizCategorySelect"),
  quizRandomButton: document.querySelector("#quizRandomButton"),
  quizRevealButton: document.querySelector("#quizRevealButton"),
  quizStats: document.querySelector("#quizStats"),
  quizCard: document.querySelector("#quizCard"),
  commonQuestionList: document.querySelector("#commonQuestionList"),
  reverseQuestionList: document.querySelector("#reverseQuestionList"),
  esInput: document.querySelector("#esInput"),
  analyzeEsButton: document.querySelector("#analyzeEsButton"),
  esAnalysisPanel: document.querySelector("#esAnalysisPanel"),
  jobFlowList: document.querySelector("#jobFlowList"),
  testPrepList: document.querySelector("#testPrepList"),
  myCompanyList: document.querySelector("#myCompanyList"),
  myCertificateList: document.querySelector("#myCertificateList"),
  myEntryCount: document.querySelector("#myEntryCount"),
  myBriefingCount: document.querySelector("#myBriefingCount"),
  myInterviewCount: document.querySelector("#myInterviewCount"),
  myOfferCount: document.querySelector("#myOfferCount"),
  jobStartDateInput: document.querySelector("#jobStartDateInput"),
  jobTargetDateInput: document.querySelector("#jobTargetDateInput"),
  jobTimelineSummary: document.querySelector("#jobTimelineSummary"),
  fileLibraryInput: document.querySelector("#fileLibraryInput"),
  fileLibraryList: document.querySelector("#fileLibraryList"),
  resumeNameInput: document.querySelector("#resumeNameInput"),
  resumeNoteInput: document.querySelector("#resumeNoteInput"),
  ownedCertForm: document.querySelector("#ownedCertForm"),
  ownedCertNameInput: document.querySelector("#ownedCertNameInput"),
  ownedCertDateInput: document.querySelector("#ownedCertDateInput"),
  ownedCertificateList: document.querySelector("#ownedCertificateList"),
  myCalendarMonthLabel: document.querySelector("#myCalendarMonthLabel"),
  myScheduleCalendar: document.querySelector("#myScheduleCalendar"),
  scheduleForm: document.querySelector("#scheduleForm"),
  scheduleTitleInput: document.querySelector("#scheduleTitleInput"),
  scheduleCompanyInput: document.querySelector("#scheduleCompanyInput"),
  scheduleTypeInput: document.querySelector("#scheduleTypeInput"),
  scheduleDateTimeInput: document.querySelector("#scheduleDateTimeInput"),
  scheduleNoteInput: document.querySelector("#scheduleNoteInput"),
  myScheduleList: document.querySelector("#myScheduleList"),
  companyStageBoard: document.querySelector("#companyStageBoard"),
  companyMemoBoard: document.querySelector("#companyMemoBoard"),
  stats: {
    companyTotal: document.querySelector("#statCompanyTotal"),
    companyFiltered: document.querySelector("#statCompanyFiltered"),
    companyShown: document.querySelector("#statCompanyShown"),
    recruiting: document.querySelector("#statRecruiting"),
    internship: document.querySelector("#statInternship"),
    ratio: document.querySelector("#statRatio"),
    rating: document.querySelector("#statRating"),
    freshnessRisk: document.querySelector("#statFreshnessRisk"),
    favorites: document.querySelector("#statFavorites"),
    homeCompanyCount: document.querySelector("#homeCompanyCount"),
    homeCertificateCount: document.querySelector("#homeCertificateCount"),
    homeDeadlineCount: document.querySelector("#homeDeadlineCount"),
    homeFreshnessCount: document.querySelector("#homeFreshnessCount"),
  },
  resetFilters: document.querySelector("#resetFilters"),
  exportButton: document.querySelector("#exportButton"),
  downloadCsvButton: document.querySelector("#downloadCsvButton"),
  backupButton: document.querySelector("#backupButton"),
  restoreInput: document.querySelector("#restoreInput"),
  addCompanyButton: document.querySelector("#addCompanyButton"),
  companyModal: document.querySelector("#companyModal"),
  closeCompanyModal: document.querySelector("#closeCompanyModal"),
  companyForm: document.querySelector("#companyForm"),
  cancelCompanyForm: document.querySelector("#cancelCompanyForm"),
  deleteCompanyButton: document.querySelector("#deleteCompanyButton"),
  companyFields: {
    id: document.querySelector("#companyIdInput"),
    name: document.querySelector("#companyNameInput"),
    industry: document.querySelector("#companyIndustryInput"),
    region: document.querySelector("#companyRegionInput"),
    size: document.querySelector("#companySizeInput"),
    jlpt: document.querySelector("#companyJlptInput"),
    deadline: document.querySelector("#companyDeadlineInput"),
    roles: document.querySelector("#companyRolesInput"),
    tags: document.querySelector("#companyTagsInput"),
    ratio: document.querySelector("#companyRatioInput"),
    ratioStatus: document.querySelector("#companyRatioStatusInput"),
    rating: document.querySelector("#companyRatingInput"),
    reviewSource: document.querySelector("#companyReviewSourceInput"),
    description: document.querySelector("#companyDescriptionInput"),
    notes: document.querySelector("#companyNotesInput"),
    sourceName: document.querySelector("#companySourceNameInput"),
    sourceUrl: document.querySelector("#companySourceUrlInput"),
    applyUrl: document.querySelector("#companyApplyUrlInput"),
    visa: document.querySelector("#companyVisaInput"),
  },
  toast: document.querySelector("#toast"),
};

function getActiveStatuses() {
  return elements.statusChecks
    .filter((item) => item.checked)
    .map((item) => item.value);
}

function passesJlpt(company, required) {
  if (required === "all") return true;
  if (required === "Business") return company.jlpt === "Business";
  return jlptRank[company.jlpt] >= jlptRank[required];
}

function daysUntil(dateText) {
  if (!parseDateOnly(dateText)) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = new Date(`${dateText}T00:00:00+09:00`);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const sourceFreshnessPolicy = {
  reviewAfterDays: 21,
  staleAfterDays: 45,
  nearDeadlineDays: 30,
  urgentDeadlineDays: 14,
};

const severityRank = {
  ok: 0,
  caution: 1,
  warning: 2,
  danger: 3,
};

function parseDateOnly(value) {
  if (!value || /unverified|未確認|未設定/i.test(String(value))) return null;
  const text = String(value).trim();
  const isoDate = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = isoDate ? new Date(`${isoDate}T00:00:00+09:00`) : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSinceDate(value) {
  const date = parseDateOnly(value);
  if (!date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function hasVerificationSignal(value) {
  return /needs?\s+(official\s+)?(verification|verify|confirmation)|verify official|candidate data|candidate expansion|placeholder|sample|tbd|確認前|未確認|要確認|確認が必要|確認待|候補|サンプル|仮データ|手動入力|待接入|需人工确认/i.test(
    String(value || ""),
  );
}

function sourceFreshnessStatus(company) {
  const reasons = [];
  const deadlineDays = daysUntil(company.deadline);
  const checkedAge = daysSinceDate(company.lastChecked);
  const latestRecord = latestForeignRecord(company);
  const hasDeadline = deadlineDays !== null;
  const nearDeadline = hasDeadline && deadlineDays >= 0 && deadlineDays <= sourceFreshnessPolicy.nearDeadlineDays;
  const urgentDeadline = hasDeadline && deadlineDays >= 0 && deadlineDays <= sourceFreshnessPolicy.urgentDeadlineDays;
  let severity = "ok";

  const raise = (nextSeverity, reason) => {
    if (reason && !reasons.includes(reason)) reasons.push(reason);
    if (severityRank[nextSeverity] > severityRank[severity]) severity = nextSeverity;
  };

  if (checkedAge === null) {
    raise("danger", "最終確認日が読めないため、現在の募集状況を信用しないでください。");
  } else if (checkedAge > sourceFreshnessPolicy.staleAfterDays) {
    raise("warning", `最終確認から ${checkedAge} 日経過しています。`);
  } else if (checkedAge > sourceFreshnessPolicy.reviewAfterDays) {
    raise(nearDeadline ? "warning" : "caution", `最終確認から ${checkedAge} 日経過しています。`);
  }

  if (company.sourceType === "sample") {
    raise("warning", "候補・サンプルデータのため、公式採用ページで裏取りが必要です。");
  }

  if (company.sourceType === "manual" && hasVerificationSignal(company.confidence)) {
    raise("warning", "手動入力データに要確認フラグがあります。");
  }

  if (hasVerificationSignal(company.sourceName) || hasVerificationSignal(company.confidence)) {
    raise("warning", "情報源または確認メモに「要確認」のサインがあります。");
  }

  if (!company.sourceUrl) {
    raise("warning", "情報源URLが未接続です。");
  }

  if (!company.applyUrl) {
    raise("caution", "応募入口URLが未接続です。");
  }

  if (["sample", "unknown"].includes(latestRecord.status)) {
    raise("caution", "外国人採用データが確認前または未公開です。");
  }

  if (hasVerificationSignal(company.reviewSource) || hasVerificationSignal(company.reviewSummary?.sourceName)) {
    raise("caution", "口コミ評価ソースが確認前です。");
  }

  if (nearDeadline && severity !== "ok") {
    raise(
      urgentDeadline ? "danger" : "warning",
      `締切まで ${deadlineDays} 日です。応募前に締切・応募条件・対象卒年を必ず再確認してください。`,
    );
  }

  const label =
    severity === "danger"
      ? "締切前に要再確認"
      : severity === "warning"
        ? "要再確認"
        : severity === "caution"
          ? "一部要確認"
          : "情報源確認済み";
  const headline =
    severity === "danger"
      ? "この募集情報は締切前に必ず再確認"
      : severity === "warning"
        ? "公式情報で再確認が必要"
        : severity === "caution"
          ? "一部データは確認前"
          : "情報源チェック済み";

  return {
    checkedAge,
    deadlineDays,
    headline,
    label,
    nearDeadline,
    nearDeadlineRisk: nearDeadline && severity !== "ok",
    reasons,
    severity,
    summary: reasons[0] || "最終確認日・情報源・締切に大きな警告はありません。",
  };
}

function sourceFreshnessItems(sourceCompanies = getAllCompanies()) {
  return sourceCompanies
    .map((company) => ({ company, freshness: sourceFreshnessStatus(company) }))
    .filter((item) => item.freshness.severity !== "ok")
    .sort((a, b) => {
      if (a.freshness.nearDeadlineRisk !== b.freshness.nearDeadlineRisk) {
        return a.freshness.nearDeadlineRisk ? -1 : 1;
      }
      if (severityRank[b.freshness.severity] !== severityRank[a.freshness.severity]) {
        return severityRank[b.freshness.severity] - severityRank[a.freshness.severity];
      }
      return a.freshness.deadlineDays - b.freshness.deadlineDays;
    });
}

function renderFreshnessBadge(freshness) {
  return `<span class="badge freshness-badge freshness-${freshness.severity}">${escapeHtml(freshness.label)}</span>`;
}

function renderFreshnessAlert(freshness, compact = false) {
  if (freshness.severity === "ok") return "";
  const visibleReasons = freshness.reasons.slice(0, compact ? 1 : 3);
  return `
    <div class="freshness-alert freshness-${freshness.severity}">
      <strong>${escapeHtml(freshness.headline)}</strong>
      <span>${escapeHtml(visibleReasons.join(" / "))}</span>
    </div>
  `;
}

function renderFreshnessPanel(company) {
  const freshness = sourceFreshnessStatus(company);
  const reasonItems = freshness.reasons.length
    ? freshness.reasons
        .slice(0, 5)
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("")
    : "<li>最終確認日・情報源・締切に大きな警告はありません。</li>";
  return `
    <div class="freshness-panel freshness-${freshness.severity}">
      <div>
        <span>情報鮮度チェック</span>
        <strong>${escapeHtml(freshness.headline)}</strong>
      </div>
      <p>${escapeHtml(
        freshness.severity === "ok"
          ? "この表示だけで応募判断を完結せず、応募直前には公式採用ページを確認してください。"
          : "この情報をそのまま信用せず、公式採用ページで締切・募集職種・応募条件を確認してから行動してください。",
      )}</p>
      <ul>${reasonItems}</ul>
    </div>
  `;
}

function getFilteredCompanies() {
  const statuses = getActiveStatuses();
  const industry = elements.industrySelect.value;
  const region = elements.regionSelect.value;
  const jlpt = elements.jlptSelect.value;
  const minRatio = Number(elements.ratioRange.value);
  const needsVisa = elements.visaSwitch.checked;
  const keyword = elements.searchInput.value.trim().toLowerCase();

  let filtered = getAllCompanies().filter((company) => {
    const statusMatch =
      statuses.length === 0 ||
      statuses.some((status) => company.statuses.includes(status));
    const educationMatch =
      state.education === "all" || company.education.includes(state.education);
    const industryMatch = industry === "all" || company.industry === industry;
    const regionMatch = region === "all" || company.region === region;
    const jlptMatch = passesJlpt(company, jlpt);
    const ratioMatch = ratioNumber(company) >= minRatio;
    const visaMatch = !needsVisa || company.visaSupport;
    const keywordMatch =
      keyword.length === 0 ||
      [
        company.name,
        company.jpName,
        displayCompanyName(company),
        company.industry,
        displayIndustry(company.industry),
        company.region,
        displayRegion(company.region),
        company.description,
        company.jpDescription,
        displayCompanyDescription(company),
        ...company.roles,
        ...company.roles.map(displayRole),
        ...company.tags,
        ...company.tags.map(displayTag),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return (
      statusMatch &&
      educationMatch &&
      industryMatch &&
      regionMatch &&
      jlptMatch &&
      ratioMatch &&
      visaMatch &&
      keywordMatch
    );
  });

  if (state.view === "internship") {
    filtered = filtered.filter((company) => company.statuses.includes("internship"));
  }
  if (state.view === "highRatio") {
    filtered = filtered.filter((company) => ratioNumber(company) >= 20);
  }
  if (state.view === "deadline") {
    filtered = filtered.filter((company) => daysUntil(company.deadline) <= 25);
  }
  if (state.view === "favorites") {
    filtered = filtered.filter((company) => state.favorites.has(company.id));
  }

  filtered.sort((a, b) => {
    if (elements.sortSelect.value === "rating") return ratingNumber(b) - ratingNumber(a);
    if (elements.sortSelect.value === "ratio") return ratioNumber(b) - ratioNumber(a);
    if (elements.sortSelect.value === "deadline") return daysUntil(a.deadline) - daysUntil(b.deadline);
    return b.match - a.match;
  });

  return filtered;
}

function renderStats(filtered) {
  const count = filtered.length;
  const recruiting = filtered.filter((company) => company.statuses.includes("recruiting")).length;
  const internship = filtered.filter((company) => company.statuses.includes("internship")).length;
  const favorites = favoriteCompanies();
  const myCounts = myApplicationCounts(favorites);
  const homeBriefingCount =
    (myCounts.briefing || 0) +
    state.mySchedules.filter((item) => item.type === "说明会").length +
    state.companyFollowups.filter((item) => /说明会|説明会/.test(`${item.role || ""} ${item.note || ""}`)).length;
  const homeInterviewCount =
    (myCounts.interview || 0) + state.mySchedules.filter((item) => item.type === "面试").length;
  const avgRatio = count
    ? Math.round(filtered.reduce((sum, company) => sum + ratioNumber(company), 0) / count)
    : 0;
  const avgRating = count
    ? (filtered.reduce((sum, company) => sum + ratingNumber(company), 0) / count).toFixed(1)
    : "0.0";
  const filteredFreshnessRisk = sourceFreshnessItems(filtered).length;
  const allFreshnessRisk = sourceFreshnessItems().length;

  elements.stats.recruiting.textContent = recruiting;
  elements.stats.companyTotal.textContent = getAllCompanies().length;
  elements.stats.companyFiltered.textContent = count;
  elements.stats.companyShown.textContent = `まず ${Math.min(count, state.visibleCompanyCount)} 社を表示`;
  elements.stats.internship.textContent = internship;
  elements.stats.ratio.textContent = `${avgRatio}%`;
  elements.stats.rating.textContent = avgRating;
  elements.stats.freshnessRisk.textContent = filteredFreshnessRisk;
  elements.stats.favorites.textContent = state.favorites.size;
  elements.stats.homeCompanyCount.textContent = state.customCompanies.length + state.favorites.size + state.companyFollowups.length;
  elements.stats.recruiting.textContent = myCounts.applied || 0;
  elements.stats.favorites.textContent = homeBriefingCount + homeInterviewCount;
  elements.stats.homeCertificateCount.textContent = state.studyingCertificates.size;
  elements.stats.homeFreshnessCount.textContent = allFreshnessRisk;
  elements.resultCount.textContent = `${count}社を表示中 / 全${getAllCompanies().length}社`;
}

function urgentCompanyItems(sourceCompanies = getAllCompanies()) {
  return sourceCompanies
    .filter((company) => company.statuses.some((status) => ["recruiting", "internship", "candidate", "yearRound"].includes(status)))
    .map((company) => ({ ...company, days: daysUntil(company.deadline) }))
    .filter((company) => company.days >= 0 && company.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);
}

function renderDeadlineList(target, sourceCompanies = getAllCompanies()) {
  const urgentCompanies = urgentCompanyItems(sourceCompanies);
  if ((target === elements.homeDeadlineList || !target) && elements.stats.homeDeadlineCount) {
    elements.stats.homeDeadlineCount.textContent = urgentCompanyItems().length;
  }
  if (!target) return;
  target.innerHTML =
    urgentCompanies.length > 0
      ? urgentCompanies
          .map(
            (company) => `
              <button class="deadline-item" type="button" data-dashboard-company="${company.id}">
                <span>${escapeHtml(company.name)}</span>
                <strong>${company.days}天</strong>
              </button>
            `,
          )
          .join("")
      : '<div class="mini-empty">30天内没有截止提醒</div>';
}

function renderFreshnessWarningList(target, sourceCompanies = getAllCompanies(), limit = 5) {
  if (!target) return;
  const items = sourceFreshnessItems(sourceCompanies).slice(0, limit);
  target.innerHTML = items.length
    ? items
        .map(({ company, freshness }) => {
          const deadlineText =
            freshness.deadlineDays < 0
              ? "締切済み"
              : freshness.deadlineDays <= sourceFreshnessPolicy.nearDeadlineDays
                ? `締切まで ${freshness.deadlineDays} 日`
                : `締切 ${company.deadline}`;
          return `
            <button class="freshness-warning-item freshness-${freshness.severity}" type="button" data-dashboard-company="${company.id}">
              <div>
                <strong>${escapeHtml(displayCompanyName(company))}</strong>
                <span>${escapeHtml(freshness.summary)}</span>
              </div>
              <small>${escapeHtml(deadlineText)}</small>
            </button>
          `;
        })
        .join("")
    : '<div class="mini-empty">再確認が必要な会社はありません。ただし応募直前は公式ページを見てください。</div>';
}

function favoriteCompanies() {
  return getAllCompanies().filter((company) => state.favorites.has(company.id));
}

function homeProgressSnapshot() {
  const favorites = favoriteCompanies();
  const statusCounts = applicationStatuses.reduce((acc, status) => {
    acc[status.value] = favorites.filter((company) => (state.applications[company.id] || "watching") === status.value).length;
    return acc;
  }, {});
  const activeSelectionCount =
    (statusCounts.applied || 0) +
    (statusCounts.briefing || 0) +
    (statusCounts.interview || 0) +
    (statusCounts.waiting || 0) +
    (statusCounts.offer || 0);
  const activeStageId =
    statusCounts.offer > 0
      ? "offer"
      : (statusCounts.interview || 0) > 0 || (statusCounts.waiting || 0) > 0 || activeSelectionCount > 0
        ? "interview"
        : favorites.length > 0
          ? "search"
          : "prepare";
  const briefingCount =
    (statusCounts.briefing || 0) +
    state.mySchedules.filter((item) => item.type === "说明会").length +
    state.companyFollowups.filter((item) => /说明会|説明会/.test(`${item.role || ""} ${item.note || ""}`)).length;

  return {
    favorites,
    statusCounts,
    activeStageId,
    activeStageIndex: homeStages.findIndex((stage) => stage.id === activeStageId),
    openCompanies: getAllCompanies().filter((company) => company.statuses.includes("recruiting")).length,
    urgentCompanies: urgentCompanyItems(),
    briefingCount,
    interviewCount: statusCounts.interview || 0,
    offerCount: statusCounts.offer || 0,
  };
}

function stageCount(stage, snapshot) {
  if (stage.id === "prepare") return practiceQuestions.filter((question) => question.category === "性格検査").length;
  if (stage.id === "search") return snapshot.favorites.length + state.customCompanies.length + state.companyFollowups.length;
  if (stage.id === "interview") {
    return (
      (snapshot.statusCounts.applied || 0) +
      (snapshot.statusCounts.briefing || 0) +
      (snapshot.statusCounts.interview || 0) +
      (snapshot.statusCounts.waiting || 0)
    );
  }
  if (stage.id === "offer") return snapshot.statusCounts.offer || 0;
  return 0;
}

function renderHomeProgress() {
  const snapshot = homeProgressSnapshot();
  const activeStage = homeStages[snapshot.activeStageIndex] || homeStages[0];
  const since = daysSince(state.myProfile.startDate);
  const remaining = daysToTarget(state.myProfile.targetDate);

  elements.currentStageLabel.textContent = "准备 / 动作";
  elements.currentStageSummary.textContent = activeStage.summary;
  elements.currentStageAction.textContent = activeStage.action;
  elements.currentStageAction.dataset.homeGo = activeStage.page;
  elements.homeCompanyPill.textContent = `会社DB ${getAllCompanies().length} 社 / 自分の予定 ${state.companyFollowups.length} 件`;

  elements.progressStageList.innerHTML = homeStages
    .map((stage, index) => {
      const done = index < snapshot.activeStageIndex;
      const active = stage.id === activeStage.id;
      const count = stageCount(stage, snapshot);
      return `
        <button class="stage-card ${done ? "done" : ""} ${active ? "active" : ""}" type="button" data-home-go="${stage.page}">
          <span class="stage-index">${index + 1}</span>
          <strong>${stage.title}</strong>
          <small>${stage.subtitle}</small>
          <em>${count}</em>
        </button>
      `;
    })
    .join("");

  const events = briefingEvents
    .map((event) => ({
      ...event,
      days: daysUntil(event.date),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  elements.currentTodoList.innerHTML = events.length
    ? `
      <div class="briefing-list">
        ${events
          .slice(0, 4)
          .map((event) => {
            const dayLabel = event.days === null ? "日程要確認" : event.days >= 0 ? `あと ${event.days} 日` : `終了 ${Math.abs(event.days)} 日前`;
            return `
              <article class="briefing-event-item ${event.days !== null && event.days < 0 ? "past" : ""}">
                <time>${escapeHtml(event.date)}</time>
                <div>
                  <strong>${escapeHtml(event.title)}</strong>
                  <span>${escapeHtml(event.time)} / ${escapeHtml(event.place)}</span>
                  <small>${escapeHtml(event.target)} · ${escapeHtml(dayLabel)}</small>
                  <a class="mini-link" href="${escapeHtml(event.url)}" target="_blank" rel="noreferrer">${escapeHtml(event.sourceName)}</a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `
    : '<div class="mini-empty">近期没有大型说明会。可以先在我的页面添加自己的安排。</div>';

  elements.homeTimelineSummary.innerHTML = `
    <article>
      <span>开始找工作</span>
      <strong>${formatDateForSummary(state.myProfile.startDate)}</strong>
      <small>${since === null ? "在我的页面设置开始日期" : `截至目前 ${since} 天`}</small>
    </article>
    <article>
      <span>目标日期</span>
      <strong>${formatDateForSummary(state.myProfile.targetDate)}</strong>
      <small>${remaining === null ? "设置目标后显示倒计时" : remaining >= 0 ? `距离目标日期还有 ${remaining} 天` : `已超过目标日期 ${Math.abs(remaining)} 天`}</small>
    </article>
    <article>
      <span>当前进度</span>
      <strong>${activeStage.id === "offer" ? "内定" : activeStage.title}</strong>
      <small>${snapshot.statusCounts.applied || 0} 个エントリー / ${snapshot.briefingCount} 个说明会 / ${snapshot.interviewCount} 个面试</small>
    </article>
  `;

  elements.homeDeadlineStrip.innerHTML = snapshot.urgentCompanies.length
    ? snapshot.urgentCompanies
        .slice(0, 4)
        .map((company) => {
          const freshness = sourceFreshnessStatus(company);
          const daysText = Number.isFinite(company.days) ? `${company.days}天` : "要確認";
          return `
            <button class="deadline-chip ${freshness.nearDeadlineRisk ? "risk" : ""}" type="button" data-dashboard-company="${company.id}" title="${escapeHtml(freshness.summary)}">
              <span>${escapeHtml(displayCompanyName(company))}</span>
              <strong>${daysText}</strong>
              ${freshness.nearDeadlineRisk ? "<small>要確認</small>" : ""}
            </button>
          `;
        })
        .join("")
    : '<div class="mini-empty">30天内没有截止提醒</div>';

  renderFreshnessWarningList(elements.homeFreshnessList, getAllCompanies(), 4);
  renderCompanyFollowups();
}

function renderHomeTimeline(snapshot) {
  const since = daysSince(state.myProfile.startDate);
  const remaining = daysToTarget(state.myProfile.targetDate);
  const nextUrgent = snapshot.urgentCompanies[0];
  const nextFreshnessRisk = sourceFreshnessItems()[0];
  elements.homeTimelineSummary.innerHTML = `
    <article>
      <span>开始找工作</span>
      <strong>${formatDateForSummary(state.myProfile.startDate)}</strong>
      <small>${since === null ? "在我的页面设置开始日期" : `已进行 ${since} 天`}</small>
    </article>
    <article>
      <span>目标日期</span>
      <strong>${formatDateForSummary(state.myProfile.targetDate)}</strong>
      <small>${remaining === null ? "设置目标后显示倒计时" : remaining >= 0 ? `剩余 ${remaining} 天` : `已超过 ${Math.abs(remaining)} 天`}</small>
    </article>
    <article>
      <span>下一件事</span>
      <strong>${nextFreshnessRisk ? escapeHtml(displayCompanyName(nextFreshnessRisk.company)) : nextUrgent ? escapeHtml(displayCompanyName(nextUrgent)) : "暂无紧急截止"}</strong>
      <small>${
        nextFreshnessRisk
          ? escapeHtml(nextFreshnessRisk.freshness.nearDeadlineRisk ? "先确认官网，再投递" : "先补一次信息源确认")
          : nextUrgent
            ? `还有 ${nextUrgent.days} 天截止`
            : "添加公司后自动提醒"
      }</small>
    </article>
  `;
  elements.homeDeadlineStrip.innerHTML = snapshot.urgentCompanies.length
    ? snapshot.urgentCompanies
        .slice(0, 3)
        .map(
          (company) => {
            const freshness = sourceFreshnessStatus(company);
            return `
            <button class="deadline-chip ${freshness.nearDeadlineRisk ? "risk" : ""}" type="button" data-dashboard-company="${company.id}" title="${escapeHtml(freshness.summary)}">
              <span>${escapeHtml(displayCompanyName(company))}</span>
              <strong>${company.days}天</strong>
              ${freshness.nearDeadlineRisk ? "<small>要確認</small>" : ""}
            </button>
          `;
          },
        )
        .join("")
    : '<div class="mini-empty">30天内没有截止提醒</div>';
  renderFreshnessWarningList(elements.homeFreshnessList, getAllCompanies(), 4);
}

function normalizeUrl(value) {
  const url = value.trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function followupTimeLabel(value) {
  if (!value) return "时间未设置";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderCompanyFollowups() {
  const items = [...state.companyFollowups].sort((a, b) => {
    if (!a.time && !b.time) return b.createdAt.localeCompare(a.createdAt);
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  elements.homeFollowupList.innerHTML = items.length
    ? items
        .slice(0, 8)
        .map(
          (item) => `
            <article class="followup-item">
              <div class="followup-main">
                <strong>${escapeHtml(item.company)}</strong>
                <span>${escapeHtml(item.role || "职务未设置")} / ${escapeHtml(followupTimeLabel(item.time))}</span>
                <small>${escapeHtml(item.address || "地址未设置")}</small>
                ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
              </div>
              <div class="item-actions">
                ${item.url ? `<a class="mini-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">官网</a>` : ""}
                <button class="mini-button" type="button" data-delete-followup="${item.id}">删除</button>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="mini-empty">还没有公司跟进。可以添加说明会、面试、ES 截止或想联系的公司。</div>';
}

function renderCertificateToolkit() {
  const industry = elements.certIndustrySelect.value;
  const ranking = certificateRankings[industry] || certificateRankings.IT;
  elements.certRankingList.innerHTML = ranking
    .map((key, index) => {
      const cert = certificates[key];
      if (!cert) return "";
      const studying = state.studyingCertificates.has(key);
      return `
        <article class="rank-item">
          <span>${index + 1}</span>
          <div>
            <strong>${cert.name}</strong>
            <small>${cert.bestFor}</small>
            <div class="cert-meta-row">
              <span>${escapeHtml(cert.difficulty || "难度待确认")}</span>
              <span>${escapeHtml(cert.mode || "形式待确认")}</span>
            </div>
            <div class="item-actions">
              <a class="mini-link" href="${cert.sourceUrl}" target="_blank" rel="noreferrer">官网</a>
              <button class="mini-button ${studying ? "active" : ""}" type="button" data-certificate-id="${key}">
                ${studying ? "学习中" : "加入学习"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  elements.certScheduleList.innerHTML = Object.values(certificates)
    .map(
      (cert) => `
        <a class="schedule-item" href="${cert.sourceUrl}" target="_blank" rel="noreferrer">
          <strong>${cert.name}</strong>
          <span>${cert.schedule}</span>
          <small>${cert.category || "资格"} / ${cert.mode || "形式待确认"} / ${cert.sourceName}</small>
        </a>
      `,
    )
    .join("");

  elements.studyResourceList.innerHTML = studyResources
    .map(
      (resource) => `
        <a class="resource-item" href="${resource.url}" target="_blank" rel="noreferrer">
          <strong>${resource.title}</strong>
          <span>${resource.category}</span>
          <small>${resource.note}</small>
        </a>
      `,
    )
    .join("");
}

function renderCertificateCatalog() {
  const entries = Object.entries(certificates);
  const categoryFilters = [
    { value: "all", label: "全部资格" },
    ...[...new Set(entries.map(([, cert]) => cert.category || "其他"))].map((category) => ({
      value: category,
      label: category,
    })),
  ];
  const activeCareer = certificateCareerFilters.find((item) => item.value === state.certificateCareerFilter) || certificateCareerFilters[0];
  const filteredEntries = entries.filter(([key, cert]) => {
    const status = certificateStatusOverrides[key] || cert.status || "notOpen";
    const categoryMatched = state.certificateCategoryFilter === "all" || (cert.category || "其他") === state.certificateCategoryFilter;
    const careerMatched =
      activeCareer.value === "all" ||
      (cert.industries || []).some((industry) => activeCareer.keywords.some((keyword) => industry.includes(keyword) || keyword.includes(industry)));
    return categoryMatched && careerMatched && !!status;
  });
  const orderedEntries = [...filteredEntries].sort(([aKey, aCert], [bKey, bCert]) => {
    const priority = { open: 0, urgent: 1, notOpen: 2, closed: 3 };
    const aStatus = certificateStatusOverrides[aKey] || aCert.status || "notOpen";
    const bStatus = certificateStatusOverrides[bKey] || bCert.status || "notOpen";
    const statusDiff = (priority[aStatus] ?? 9) - (priority[bStatus] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return aCert.name.localeCompare(bCert.name, "ja");
  });
  const statusCounts = filteredEntries.reduce(
    (acc, [key, cert]) => {
      const status = certificateStatusOverrides[key] || cert.status || "notOpen";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { open: 0, urgent: 0, notOpen: 0, closed: 0 },
  );

  const renderFilterTag = (item, activeValue, dataName, count = null) => `
    <button class="certificate-filter-tag ${item.value === activeValue ? "selected" : ""}" type="button" ${dataName}="${escapeHtml(item.value)}">
      <span>${escapeHtml(item.label)}</span>
      ${count === null ? "" : `<small>${count}</small>`}
    </button>
  `;

  const careerTags = certificateCareerFilters
    .map((item) => {
      const count =
        item.value === "all"
          ? entries.length
          : entries.filter(([, cert]) =>
              (cert.industries || []).some((industry) => item.keywords.some((keyword) => industry.includes(keyword) || keyword.includes(industry))),
            ).length;
      return renderFilterTag(item, state.certificateCareerFilter, "data-certificate-career", count);
    })
    .join("");

  const categoryTags = categoryFilters
    .map((item) => {
      const count = item.value === "all" ? entries.length : entries.filter(([, cert]) => (cert.category || "其他") === item.value).length;
      return renderFilterTag(item, state.certificateCategoryFilter, "data-certificate-category", count);
    })
    .join("");

  const resultHtml = orderedEntries.length
    ? orderedEntries
        .map(([key, cert]) => {
          const status = certificateStatusOverrides[key] || cert.status || "notOpen";
          const studying = state.studyingCertificates.has(key);
          return `
            <article class="certificate-result-card cert-${status}">
              <div class="certificate-result-main">
                <div class="certificate-card-head">
                  <div>
                    <strong>${escapeHtml(cert.name)}</strong>
                    <p>${escapeHtml(cert.bestFor)}</p>
                  </div>
                  <span>${certificateStatusLabels[status]}</span>
                </div>
                <div class="cert-meta-row">
                  <span>${escapeHtml(cert.category || "资格")}</span>
                  <span>${escapeHtml(cert.difficulty || "难度待确认")}</span>
                  <span>${escapeHtml(cert.mode || "形式待确认")}</span>
                </div>
                <div class="certificate-detail-grid">
                  <p><span>报名 / 考试：</span>${escapeHtml(cert.schedule)}</p>
                  <p><span>适合方向：</span>${escapeHtml((cert.industries || ["全行业"]).join(" / "))}</p>
                </div>
              </div>
              <div class="item-actions certificate-result-actions">
                <a class="mini-link" href="${cert.sourceUrl}" target="_blank" rel="noreferrer">官网</a>
                <button class="mini-button ${studying ? "active" : ""}" type="button" data-certificate-id="${key}">
                  ${studying ? "学习中" : "加入学习"}
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="mini-empty">这个组合下暂时没有资格。可以切回“全部职业”或“全部资格”。</div>';

  elements.certificateCatalogList.innerHTML = `
    <section class="certificate-filter-panel">
      <div class="certificate-filter-row">
        <div class="certificate-tag-heading">
          <strong>A类：职业方向</strong>
          <small>${activeCareer.label}</small>
        </div>
        <div class="certificate-filter-tags">${careerTags}</div>
      </div>
      <div class="certificate-filter-row">
        <div class="certificate-tag-heading">
          <strong>B类：资格领域</strong>
          <small>${state.certificateCategoryFilter === "all" ? "全部资格" : state.certificateCategoryFilter}</small>
        </div>
        <div class="certificate-filter-tags">${categoryTags}</div>
      </div>
    </section>
    <section class="certificate-result-panel">
      <div class="certificate-result-summary">
        <strong>${orderedEntries.length} 个资格</strong>
        <span>可报名 ${statusCounts.open || 0}</span>
        <span>临近 ${statusCounts.urgent || 0}</span>
        <span>未开放 ${statusCounts.notOpen || 0}</span>
        <span>已过 ${statusCounts.closed || 0}</span>
      </div>
      <div class="certificate-result-list">${resultHtml}</div>
    </section>
  `;
}

function renderQualificationCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEvents = certificateEvents.filter((event) => event.date.startsWith(monthKey));
  const eventsByDay = monthEvents.reduce((map, event) => {
    map[event.date] = map[event.date] || [];
    map[event.date].push(event);
    return map;
  }, {});
  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  elements.calendarMonthLabel.textContent = `${year}年${month + 1}月`;
  const days = calendarDaysForMonth(year, month).map((dayInfo) => {
    const dayEvents = eventsByDay[dayInfo.key] || [];
    const isToday = dayInfo.key === dateKey(today);
    return `
      <div class="calendar-cell ${dayInfo.inMonth ? "" : "outside-month"} ${isToday ? "today" : ""} ${dayEvents.length ? "has-event" : ""}">
        <strong>${dayInfo.day}</strong>
        ${dayEvents
          .slice(0, 2)
          .map((event) => `<span class="calendar-chip ${["考试", "线上"].includes(event.type) ? "exam" : ""}">${event.type}</span>`)
          .join("")}
      </div>
    `;
  }).join("");

  elements.qualificationCalendar.innerHTML = `
    ${weekdayLabels.map((label) => `<div class="calendar-weekday">${label}</div>`).join("")}
    ${days}
  `;

  elements.calendarEventList.innerHTML = monthEvents.length
    ? monthEvents
        .map((event) => {
          const cert = certificates[event.certId];
          return `
            <a class="calendar-event" href="${event.sourceUrl}" target="_blank" rel="noreferrer">
              <time>${Number(event.date.slice(-2))}日</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.type} / ${cert?.name || "资格"}</span>
                <small>${event.note}</small>
              </div>
            </a>
          `;
        })
        .join("")
    : '<div class="mini-empty">这个月还没有登记资格事件</div>';
}

function interviewAnswerKey(scope, index) {
  return `${scope}-${index}`;
}

function renderQuestionList(target, questions, scope) {
  if (!target) return;
  target.innerHTML = questions
    .map(
      (item, index) => {
        const answerKey = interviewAnswerKey(scope, index);
        const savedAnswer = state.interviewAnswers[answerKey] || "";
        return `
        <details class="qa-item qa-collapse">
          <summary>
            <strong>${escapeHtml(item.question)}</strong>
            ${savedAnswer ? "<small>已填写</small>" : "<small>点击填写</small>"}
          </summary>
          <div class="qa-collapse-body">
            <textarea class="answer-textarea" rows="4" data-interview-answer="${answerKey}" placeholder="ここに自分の回答を書いてください">${escapeHtml(savedAnswer)}</textarea>
            <p><span>为什么问：</span>${escapeHtml(item.intent)}</p>
            <p><span>回答目的：</span>${escapeHtml(item.goal)}</p>
            ${item.example ? `<p><span>回答骨架：</span>${escapeHtml(item.example)}</p>` : ""}
          </div>
        </details>
      `;
      },
    )
    .join("");
}

function renderInterviewToolkit() {
  renderQuestionList(elements.commonQuestionList, interviewQuestions, "common");
  renderQuestionList(elements.reverseQuestionList, reverseQuestions, "reverse");
}

function renderPracticeSites() {
  if (!elements.practiceSiteList) return;
  elements.practiceSiteList.innerHTML = practiceSites
    .map(
      (site) => `
        <a class="practice-site-card" href="${site.url}" target="_blank" rel="noopener noreferrer">
          <div>
            <strong>${site.name}</strong>
            <span>${site.type}</span>
          </div>
          <p>${site.note}</p>
          <small>${site.use}</small>
        </a>
      `,
    )
    .join("");
}

function getPracticePool() {
  if (state.practiceCategory === "all") return practiceQuestions;
  return practiceQuestions.filter((question) => question.category === state.practiceCategory);
}

function ensurePracticeQuestion() {
  const pool = getPracticePool();
  if (!pool.length) {
    state.currentPracticeQuestionId = "";
    return null;
  }
  const current = pool.find((question) => question.id === state.currentPracticeQuestionId);
  if (current) return current;
  state.currentPracticeQuestionId = pool[0].id;
  state.practiceAnswerVisible = false;
  return pool[0];
}

function renderPracticeCategorySelect() {
  if (!elements.quizCategorySelect) return;
  elements.quizCategorySelect.innerHTML = practiceCategories
    .map((category) => {
      const count =
        category.value === "all"
          ? practiceQuestions.length
          : practiceQuestions.filter((question) => question.category === category.value).length;
      return `<option value="${category.value}">${category.label}（${count}）</option>`;
    })
    .join("");
  elements.quizCategorySelect.value = state.practiceCategory;
}

function renderPracticeQuiz() {
  if (!elements.quizCard || !elements.quizStats) return;
  renderPracticeCategorySelect();
  const pool = getPracticePool();
  const question = ensurePracticeQuestion();
  if (!question) {
    elements.quizStats.innerHTML = "";
    elements.quizCard.innerHTML = '<div class="mini-empty">这个分类暂时没有题目</div>';
    return;
  }

  const categoryLabel = practiceCategories.find((item) => item.value === state.practiceCategory)?.label || "全部题型";
  const choicesHtml = question.choices?.length
    ? `<ol class="quiz-choice-list">${question.choices.map((choice) => `<li>${escapeHtml(choice)}</li>`).join("")}</ol>`
    : "";

  elements.quizStats.innerHTML = `
    <span>全${practiceQuestions.length}题</span>
    <span>${escapeHtml(categoryLabel)}：${pool.length}题</span>
    <span>${escapeHtml(question.id)} / ${escapeHtml(question.difficulty)}</span>
  `;
  elements.quizCard.innerHTML = `
    <article>
      <div class="quiz-card-head">
        <span>${escapeHtml(question.category)}</span>
        <span>${escapeHtml(question.subcategory)}</span>
        <span>${escapeHtml(question.sourceType)}</span>
      </div>
      <strong>${escapeHtml(question.title)}</strong>
      <p>${escapeHtml(question.question)}</p>
      ${choicesHtml}
      <div class="quiz-answer ${state.practiceAnswerVisible ? "visible" : ""}">
        <strong>答案 / 回答方針</strong>
        <p>${escapeHtml(question.answer)}</p>
        <small>${escapeHtml(question.explanation)}</small>
      </div>
    </article>
  `;
  if (elements.quizRevealButton) {
    elements.quizRevealButton.textContent = state.practiceAnswerVisible ? "隐藏答案" : "显示答案";
  }
}

function pickRandomPracticeQuestion() {
  const pool = getPracticePool();
  if (!pool.length) return;
  const question = pool[Math.floor(Math.random() * pool.length)];
  state.currentPracticeQuestionId = question.id;
  state.practiceAnswerVisible = false;
  renderPracticeQuiz();
}

function renderFlowToolkit() {
  renderPracticeSites();
  renderPracticeQuiz();
  if (elements.jobFlowList) {
    elements.jobFlowList.innerHTML = jobFlowSteps
      .map(
        (step, index) => `
          <article class="flow-step">
            <span>${index + 1}</span>
            <div>
              <strong>${step.title}</strong>
              <em class="flow-step-meta">${step.timing}</em>
              <small>${step.note}</small>
              <div class="flow-actions">
              ${(step.actions || []).map((action) => `<b>${action}</b>`).join("")}
              </div>
              <em class="source-pill">${step.source}</em>
            </div>
          </article>
        `,
      )
      .join("");
  }

  if (elements.testPrepList) {
    elements.testPrepList.innerHTML = testPrepItems
      .map(
        (item) => `
          <article class="test-item">
            <strong>${item.title}</strong>
            <small>${item.note}</small>
            <div class="practice-list">
              ${(item.examples || []).map((example) => `<p>${example}</p>`).join("")}
              <p><span>答案 / 思路：</span>${item.answer}</p>
            </div>
          </article>
        `,
      )
      .join("");
  }
}

function dateKeyFromValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function scheduleTypeClass(type) {
  if (type === "面试") return "interview";
  if (type === "ES截止") return "deadline";
  if (type === "Web测试") return "test";
  if (type === "说明会") return "briefing";
  return "followup";
}

function buildMyScheduleEvents(favoriteCompanies) {
  const manualEvents = state.mySchedules.map((item) => ({
    id: item.id,
    date: dateKeyFromValue(item.time),
    time: item.time,
    title: item.title,
    company: item.company,
    type: item.type || "其他",
    note: item.note || "",
    source: "manual",
  }));

  const followupEvents = state.companyFollowups
    .filter((item) => item.time)
    .map((item) => ({
      id: item.id,
      date: dateKeyFromValue(item.time),
      time: item.time,
      title: item.note?.split("\n")[0] || "公司跟进",
      company: item.company,
      type: "跟进",
      note: [item.role, item.address, item.note].filter(Boolean).join(" / "),
      source: "followup",
    }));

  const deadlineEvents = favoriteCompanies.map((company) => ({
    id: company.id,
    date: company.deadline,
    time: `${company.deadline}T23:59`,
    title: "応募 / ES 截止",
    company: displayCompanyName(company),
    type: "ES截止",
    note: `${displayIndustry(company.industry)} / ${applicationStatuses.find((status) => status.value === (state.applications[company.id] || "watching"))?.label || "关注中"}`,
    source: "deadline",
  }));

  return [...manualEvents, ...followupEvents, ...deadlineEvents]
    .filter((event) => event.date)
    .sort((a, b) => new Date(a.time || `${a.date}T23:59`).getTime() - new Date(b.time || `${b.date}T23:59`).getTime());
}

function renderMyScheduleCalendar(favoriteCompanies) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const allEvents = buildMyScheduleEvents(favoriteCompanies);
  const monthEvents = allEvents.filter((event) => event.date.startsWith(monthKey));
  const eventsByDay = allEvents.reduce((map, event) => {
    map[event.date] = map[event.date] || [];
    map[event.date].push(event);
    return map;
  }, {});

  elements.myCalendarMonthLabel.textContent = `${year}年${month + 1}月`;
  const days = calendarDaysForMonth(year, month).map((dayInfo) => {
    const dayEvents = eventsByDay[dayInfo.key] || [];
    const isToday = dayInfo.key === dateKey(today);
    return `
      <div class="my-calendar-cell ${dayInfo.inMonth ? "" : "outside-month"} ${isToday ? "today" : ""} ${dayEvents.length ? "has-event" : ""}">
        <strong>${dayInfo.day}</strong>
        ${dayEvents
          .slice(0, 3)
          .map((event) => `<span class="my-calendar-chip ${scheduleTypeClass(event.type)}">${escapeHtml(event.type)}</span>`)
          .join("")}
      </div>
    `;
  }).join("");

  elements.myScheduleCalendar.innerHTML = `
    ${weekdayLabels.map((label) => `<div class="my-calendar-weekday">${label}</div>`).join("")}
    ${days}
  `;

  elements.myScheduleList.innerHTML = monthEvents.length
    ? monthEvents
        .map((event) => `
          <article class="my-schedule-item ${scheduleTypeClass(event.type)}">
            <time>${escapeHtml(followupTimeLabel(event.time || `${event.date}T23:59`))}</time>
            <div>
              <strong>${escapeHtml(event.title)}</strong>
              <span>${escapeHtml(event.type)}${event.company ? ` / ${escapeHtml(event.company)}` : ""}</span>
              ${event.note ? `<small>${escapeHtml(event.note)}</small>` : ""}
            </div>
            ${event.source === "manual" ? `<button class="mini-button" type="button" data-delete-schedule="${event.id}">删除</button>` : ""}
          </article>
        `)
        .join("")
    : '<div class="mini-empty">这个月还没有安排。可以添加说明会、面试或 ES 截止。</div>';
}

function renderMyPage() {
  const favoriteCompanies = favoriteCompaniesForMyPage();
  const counts = myApplicationCounts(favoriteCompanies);
  elements.myEntryCount.textContent = counts.applied;
  elements.myBriefingCount.textContent = counts.briefing;
  elements.myInterviewCount.textContent = counts.interview;
  elements.myOfferCount.textContent = counts.offer;
  renderTimelineSummary(favoriteCompanies);
  renderOwnedCertificates();
  renderMyScheduleCalendar(favoriteCompanies);
  renderCompanyStageBoard(favoriteCompanies);

  if (elements.myCompanyList) {
    elements.myCompanyList.innerHTML = favoriteCompanies.length
    ? favoriteCompanies
        .map((company) => {
          const savedStatus = state.applications[company.id] || "watching";
          const statusLabel = applicationStatuses.find((status) => status.value === savedStatus)?.label || "关注中";
          const deadline = deadlineLabel(company);
          const freshness = sourceFreshnessStatus(company);
          return `
            <article class="my-company-source-item ${freshness.nearDeadlineRisk ? "near-deadline-risk" : ""}">
              <div>
                <strong>${escapeHtml(displayCompanyName(company))}</strong>
                <span>${displayIndustry(company.industry)} / ${displayRegion(company.region)} / ${statusLabel}</span>
                <small class="${deadline.warning ? "warning-text" : ""}">${deadline.text}</small>
                ${
                  freshness.severity === "ok"
                    ? ""
                    : `<small class="freshness-small freshness-${freshness.severity}">${escapeHtml(freshness.label)}：${escapeHtml(freshness.summary)}</small>`
                }
              </div>
              <div class="source-actions compact-source-actions">
                <a class="mini-link" href="${company.sourceUrl || company.applyUrl || "#"}" target="_blank" rel="noreferrer">官网</a>
                ${
                  company.reviewSummary?.sourceUrl
                    ? `<a class="mini-link" href="${company.reviewSummary.sourceUrl}" target="_blank" rel="noreferrer">评价 ${ratingText(company)}</a>`
                    : `<span class="badge blue">评价 ${ratingText(company)}</span>`
                }
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="mini-empty">还没有选择公司。去“搜索公司”点星标加入。</div>';
  }

  const studying = [...state.studyingCertificates];
  elements.myCertificateList.innerHTML = studying.length
    ? studying
        .map((key) => {
          const cert = certificates[key];
          return `
            <article class="my-list-item">
              <div>
                <strong>${cert.name}</strong>
                <span>${cert.bestFor}</span>
              </div>
              <button class="mini-button active" type="button" data-certificate-id="${key}">学习中</button>
            </article>
          `;
        })
        .join("")
    : '<div class="mini-empty">还没有加入资格。去“资格学习”选择目标资格。</div>';
}

function favoriteCompaniesForMyPage() {
  return getAllCompanies().filter((company) => state.favorites.has(company.id));
}

function myApplicationCounts(favoriteCompanies) {
  return favoriteCompanies.reduce(
    (counts, company) => {
      const status = state.applications[company.id] || "watching";
      if (counts[status] !== undefined) counts[status] += 1;
      return counts;
    },
    { applied: 0, briefing: 0, interview: 0, waiting: 0, offer: 0 },
  );
}

function formatDateForSummary(value) {
  if (!value) return "未设置";
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return "未设置";
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function daysSince(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysToTarget(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function renderTimelineSummary(favoriteCompanies) {
  const since = daysSince(state.myProfile.startDate);
  const remaining = daysToTarget(state.myProfile.targetDate);
  const sinceText = since === null ? "开始日期未设置" : `截至目前 ${since} 天`;
  const remainingText =
    remaining === null
      ? "目标日期未设置"
      : remaining >= 0
        ? `距离目标日期还有 ${remaining} 天`
        : `已超过目标日期 ${Math.abs(remaining)} 天`;
  elements.jobTimelineSummary.innerHTML = `
    <div>
      <span>开始</span>
      <strong>${formatDateForSummary(state.myProfile.startDate)}</strong>
    </div>
    <div>
      <span>${sinceText}</span>
      <strong>${remainingText}</strong>
    </div>
    <div>
      <span>当前候选</span>
      <strong>${favoriteCompanies.length} 家公司</strong>
    </div>
  `;
}

function renderFileLibrary() {
  if (!elements.fileLibraryList) return;
  elements.fileLibraryList.innerHTML = state.fileLibrary.length
    ? state.fileLibrary
        .map(
          (file) => `
            <article class="file-item">
              <div>
                <strong>${escapeHtml(file.name)}</strong>
                <span>${escapeHtml(file.type || "文件")} / ${formatFileSize(file.size)} / ${escapeHtml(file.addedAt)}</span>
              </div>
              <div class="item-actions">
                ${
                  file.dataUrl
                    ? `<a class="mini-link" href="${file.dataUrl}" download="${escapeHtml(file.name)}">下载</a>`
                    : '<span class="badge yellow">仅保存信息</span>'
                }
                <button class="mini-button" type="button" data-remove-file="${file.id}">删除</button>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="mini-empty">还没有文件。可以添加履历书、ES、成绩单、资格证明等。</div>';
}

function formatFileSize(size) {
  if (!Number.isFinite(size)) return "未知大小";
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function renderOwnedCertificates() {
  elements.ownedCertificateList.innerHTML = state.ownedCertificates.length
    ? state.ownedCertificates
        .map(
          (cert) => `
            <article class="my-list-item">
              <div>
                <strong>${escapeHtml(cert.name)}</strong>
                <span>${cert.date ? `${escapeHtml(cert.date)} 取得 / 予定` : "日期未设置"}</span>
              </div>
              <button class="mini-button" type="button" data-remove-owned-cert="${cert.id}">删除</button>
            </article>
          `,
        )
        .join("")
    : '<div class="mini-empty">还没有添加已持有证书。</div>';
}

function renderCompanyStageBoard(favoriteCompanies) {
  elements.companyStageBoard.innerHTML = myBoardStages
    .map((stage) => {
      const companiesInStage = favoriteCompanies.filter((company) =>
        stage.statuses.includes(state.applications[company.id] || "watching"),
      );
      return `
        <section class="company-stage-column">
          <div class="company-stage-head">
            <strong>${stage.title}</strong>
            <span>${companiesInStage.length}</span>
          </div>
          <div class="stage-company-list">
            ${
              companiesInStage.length
                ? companiesInStage.map((company) => renderStageCompanyCard(company)).join("")
                : '<div class="mini-empty">暂无</div>'
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderStageCompanyCard(company) {
  const current = state.applications[company.id] || "watching";
  const nextAction = nextActionForCompany(company, current);
  const freshness = sourceFreshnessStatus(company);
  return `
    <article class="stage-company-card ${freshness.nearDeadlineRisk ? "near-deadline-risk" : ""}">
      <div>
        <strong>${escapeHtml(displayCompanyName(company))}</strong>
        <span>${displayIndustry(company.industry)} / 評価 ${ratingText(company)}</span>
        <small>${escapeHtml(nextAction)}</small>
        ${
          freshness.severity === "ok"
            ? ""
            : `<small class="freshness-small freshness-${freshness.severity}">${escapeHtml(freshness.label)}：${escapeHtml(freshness.summary)}</small>`
        }
      </div>
      <div class="quick-status-row" aria-label="${escapeHtml(displayCompanyName(company))} 快捷归类">
        ${myQuickStatuses
          .map(
            (status) => `
              <button class="quick-status-button ${current === status.value ? "active" : ""}" type="button" data-my-company-status-button="${company.id}" data-status="${status.value}">
                ${status.label}
              </button>
            `,
          )
          .join("")}
      </div>
      <select data-my-company-status="${company.id}" aria-label="${escapeHtml(displayCompanyName(company))} 进度">
        ${applicationStatuses
          .map((status) => `<option value="${status.value}" ${current === status.value ? "selected" : ""}>${status.label}</option>`)
          .join("")}
      </select>
    </article>
  `;
}

function nextActionForCompany(company, status) {
  const freshness = sourceFreshnessStatus(company);
  if (freshness.nearDeadlineRisk) return `下一步：先确认官网締切和応募条件 / ${freshness.label}`;
  if (freshness.severity === "warning" || freshness.severity === "danger") return `下一步：先补官网来源确认 / ${freshness.label}`;
  if (status === "watching") return `下一步：确认官网和応募条件 / ${deadlineLabel(company).text}`;
  if (status === "preparing") return "下一步：完成 ES / 履历书版本";
  if (status === "applied") return "下一步：等待说明会或一次筛选结果";
  if (status === "briefing") return "下一步：整理说明会笔记，准备 ES";
  if (status === "interview") return "下一步：准备面试问题和逆问题";
  if (status === "waiting") return "下一步：等待结果，记录复盘";
  if (status === "offer") return "下一步：比较条件和签证流程";
  return "下一步：决定是否继续跟进";
}

function renderCompanyMemoBoard(favoriteCompanies) {
  if (!elements.companyMemoBoard) return;
  elements.companyMemoBoard.innerHTML = favoriteCompanies.length
    ? favoriteCompanies
        .map(
          (company) => `
            <article class="memo-item">
              <div class="memo-item-head">
                <strong>${escapeHtml(displayCompanyName(company))}</strong>
                <span>${displayIndustry(company.industry)} / ${displayRegion(company.region)}</span>
              </div>
              <textarea data-my-company-memo="${company.id}" rows="4" placeholder="写一下对这家公司感兴趣的点、说明会发现、面试感受、风险点">${escapeHtml(state.memos[company.id] || "")}</textarea>
              <button class="secondary-button" type="button" data-save-my-memo="${company.id}">保存记事</button>
            </article>
          `,
        )
        .join("")
    : '<div class="mini-empty">收藏公司后，这里会出现每家公司专用记事板。</div>';
}

function scoreEsText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      score: 0,
      summary: "先贴入 ES 文本，我会从结构、证据、公司匹配和留学生优势四个角度检查。",
      wins: [],
      fixes: ["至少准备 300-600 字版本：结论、背景、行动、结果、入社后贡献。"],
      deepQuestions: [],
    };
  }

  const checks = [
    {
      ok: trimmed.length >= 260,
      label: "内容量足够",
      fix: "内容偏短。建议补充背景、具体行动和结果，避免只写结论。",
      points: 12,
    },
    {
      ok: /志望|応募|貴社|御社|事業|職種|業界|入社|サービス|プロダクト/.test(trimmed),
      label: "有公司 / 岗位匹配",
      fix: "公司匹配还不够。加入该公司的业务、岗位职责、产品或客户课题。",
      points: 16,
    },
    {
      ok: /課題|問題|目標|目的|背景|困難|なぜ|原因/.test(trimmed),
      label: "写出了课题或目标",
      fix: "补一句当时的课题：为什么这件事难，目标是什么。",
      points: 12,
    },
    {
      ok: /行動|工夫|改善|提案|実行|分析|協力|リード|学習|調整/.test(trimmed),
      label: "写出了自己的行动",
      fix: "行动还不够具体。写你本人做了什么，而不是团队整体做了什么。",
      points: 16,
    },
    {
      ok: /\d|％|%|人|ヶ月|週間|点|位|件|倍|回/.test(trimmed),
      label: "有数字结果",
      fix: "加入数字：人数、期间、改善率、成绩、销售额、处理件数都可以。",
      points: 14,
    },
    {
      ok: /結果|成果|達成|改善|獲得|合格|向上|削減|増加|成功|学び/.test(trimmed),
      label: "有结果或学び",
      fix: "补结果和学到的东西。没有漂亮结果也可以写复盘和下一步改善。",
      points: 12,
    },
    {
      ok: /留学|異文化|多国籍|中国語|英語|日本語|海外|ビザ|在留|グローバル/.test(trimmed),
      label: "使用了留学生优势",
      fix: "加入留学生差异化优势：跨文化、语言、海外视点、适应力或在日学习经历。",
      points: 8,
    },
    {
      ok: /貢献|活か|挑戦|成長|実現|価値|将来|キャリア|入社後/.test(trimmed),
      label: "连接到入社后贡献",
      fix: "最后补一句入社后如何贡献，和岗位要求连起来。",
      points: 10,
    },
  ];

  const vagueWords = ["頑張", "成長したい", "魅力を感じ", "コミュニケーション能力", "貢献したい", "興味があります"];
  const vagueHits = vagueWords.filter((word) => trimmed.includes(word));
  let score = checks.reduce((sum, check) => sum + (check.ok ? check.points : 0), 0);
  score = Math.max(0, Math.min(100, score - vagueHits.length * 4));

  const wins = checks.filter((check) => check.ok).map((check) => check.label);
  const fixes = checks.filter((check) => !check.ok).map((check) => check.fix);
  if (vagueHits.length) {
    fixes.push(`这些表达容易显得空泛：${vagueHits.join("、")}。每个词后面补一个真实例子。`);
  }

  const deepQuestions = [
    "这段经历里，只有你本人做过、别人没做的行动是什么？",
    "如果面试官追问“为什么这样做”，你能说出判断依据吗？",
    "结果有没有数字、对比对象或第三方评价可以证明？",
    "这家公司为什么会需要这段经验？能不能换成它的业务关键词？",
    "作为留学生，你的语言、文化、适应力优势是否被自然地写出来了？",
  ];

  return {
    score,
    summary:
      score >= 78
        ? "基础已经不错，下一步重点是把公司匹配和数字证据再压实。"
        : score >= 52
          ? "有可用素材，但还需要补行动细节、结果和入社后贡献。"
          : "现在更像素材草稿，需要先补 STAR 结构和公司匹配。",
    wins,
    fixes,
    deepQuestions,
  };
}

function renderEsAnalysis(result = scoreEsText(elements.esInput?.value || "")) {
  if (!elements.esAnalysisPanel) return;
  const winHtml = result.wins.length
    ? result.wins.map((item) => `<li>${item}</li>`).join("")
    : "<li>等待输入文本后分析。</li>";
  const fixHtml = result.fixes.map((item) => `<li>${item}</li>`).join("");
  const questionHtml = result.deepQuestions.map((item) => `<li>${item}</li>`).join("");

  elements.esAnalysisPanel.innerHTML = `
    <div class="analysis-score">
      <strong>${result.score}</strong>
      <span>ES 完成度</span>
    </div>
    <p>${result.summary}</p>
    <div class="analysis-block good">
      <strong>已经有的优点</strong>
      <ul>${winHtml}</ul>
    </div>
    <div class="analysis-block">
      <strong>优先改进</strong>
      <ul>${fixHtml}</ul>
    </div>
    <div class="analysis-block">
      <strong>面试官可能深挖</strong>
      <ul>${questionHtml}</ul>
    </div>
  `;
}

function renderToolkit() {
  renderCertificateToolkit();
  renderCertificateCatalog();
  renderQualificationCalendar();
  renderInterviewToolkit();
  renderFlowToolkit();
  if (elements.esAnalysisPanel) renderEsAnalysis();
}

function setActivePage(page) {
  state.page = page;
  elements.mainNavButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  elements.pageViews.forEach((view) => {
    view.classList.toggle("active", view.dataset.pageView === page);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderDashboard() {
  const pipelineRows = applicationStatuses.map((status) => {
    const count = getAllCompanies().filter((company) => {
      const savedStatus = state.applications[company.id] || "watching";
      return savedStatus === status.value && state.favorites.has(company.id);
    }).length;
    return { ...status, count };
  });

  if (elements.pipelineList) {
    elements.pipelineList.innerHTML = pipelineRows
      .map(
        (row) => `
          <div class="pipeline-row">
            <span>${row.label}</span>
            <strong>${row.count}</strong>
          </div>
        `,
      )
      .join("");
  }

  renderDeadlineList(elements.deadlineList, favoriteCompaniesForMyPage());
  renderDeadlineList(elements.homeDeadlineList);
  renderFreshnessWarningList(elements.dashboardFreshnessList, getAllCompanies(), 6);
}

function statusBadges(company) {
  return company.statuses
    .map((status) => {
      const badgeClass = status === "internship" ? "blue" : status === "candidate" ? "yellow" : "green";
      return `<span class="badge ${badgeClass}">${statusLabels[status]}</span>`;
    })
    .join("");
}

function sourceBadge(company) {
  const badgeClass = company.sourceType === "official" ? "green" : company.sourceType === "platform" ? "blue" : "yellow";
  const label =
    company.sourceType === "official"
      ? "公式情報"
      : company.sourceType === "platform"
        ? "就活媒体"
        : company.sourceType === "manual"
          ? "手動入力"
          : "確認前";
  return `<span class="badge ${badgeClass}">${label}</span>`;
}

function deadlineLabel(company) {
  const days = daysUntil(company.deadline);
  if (days === null) return { text: "締切要確認", warning: true };
  if (days < 0) return { text: "締切済み", warning: true };
  if (days <= 14) return { text: `あと ${days} 日`, warning: true };
  return { text: `締切 ${company.deadline}`, warning: false };
}

function renderCompanyList(filtered) {
  if (filtered.length === 0) {
    const message =
      state.view === "favorites"
        ? "まだ候補企業がありません。外部サイトで見つけた会社を追加するか、企業一覧で星を押すとここに表示されます。"
        : "条件に合う企業がありません。地域、日本語要件、外国人比率を少し広げてみてください。";
    elements.companyList.innerHTML = `<div class="empty-state">${message}</div>`;
    elements.detailPanel.innerHTML = "";
    elements.progressPanel.innerHTML = "";
    elements.trendChart.innerHTML = "";
    if (elements.loadMoreCompaniesButton) {
      elements.loadMoreCompaniesButton.hidden = true;
    }
    return;
  }

  state.visibleCompanyCount = Math.min(state.visibleCompanyCount, Math.max(filtered.length, companyPageSize));
  const visibleCompanies = filtered.slice(0, state.visibleCompanyCount);

  if (!filtered.some((company) => company.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
  }

  elements.companyList.innerHTML = visibleCompanies
    .map((company) => {
      const deadline = deadlineLabel(company);
      const freshness = sourceFreshnessStatus(company);
      const favorite = state.favorites.has(company.id);
      const currentStatus = state.applications[company.id] || "watching";
      const currentStatusLabel = applicationStatuses.find((status) => status.value === currentStatus)?.label || "関心あり";
      const fitScore = studentFitScore(company);
      const internshipOpen = company.statuses.includes("internship") ? "あり" : "要確認";
      const recruitingOpen = company.statuses.includes("recruiting") || company.statuses.includes("yearRound") ? "募集中" : "候補";
      return `
        <article class="company-card decision-card ${company.id === state.selectedId ? "active" : ""} ${freshness.nearDeadlineRisk ? "near-deadline-risk" : ""}" data-company-id="${company.id}">
          <div class="company-main">
            <div class="company-title-row">
              <div>
                <h2>${escapeHtml(displayCompanyName(company))}</h2>
                <div class="company-meta">
                  <span>${displayIndustry(company.industry)}</span>
                  <span>·</span>
                  <span>${displayRegion(company.region)}</span>
                  <span>·</span>
                  <span>${displayRoles(company)}</span>
                </div>
              </div>
              <button class="favorite-button ${favorite ? "active" : ""}" type="button" data-favorite-id="${company.id}" title="候補に追加" aria-label="${escapeHtml(displayCompanyName(company))}を候補に追加">★</button>
            </div>
            <p class="company-desc">${escapeHtml(displayCompanyDescription(company))}</p>
            <div class="decision-signal-grid">
              <span><b>${escapeHtml(recruitingOpen)}</b><small>募集状態</small></span>
              <span><b>${escapeHtml(internshipOpen)}</b><small>インターン</small></span>
              <span><b>${ratioText(company)}</b><small>外国人比率</small></span>
              <span><b>${ratingText(company)}</b><small>口コミ</small></span>
              <span><b>${escapeHtml(currentStatusLabel)}</b><small>自分の状態</small></span>
            </div>
            <div class="badge-row compact-badges">
              ${statusBadges(company)}
              ${sourceBadge(company)}
              ${renderFreshnessBadge(freshness)}
              <span class="badge fit-badge">留学生相性 ${fitScore}</span>
            </div>
            ${renderFreshnessAlert(freshness, true)}
          </div>
          <div class="company-decision-actions">
            <strong>${deadline.text}</strong>
            <span>${escapeHtml(displaySourceName(company))}</span>
            <div class="item-actions">
              <button class="mini-button" type="button" data-quick-company-status="${company.id}" data-status="applied">エントリー</button>
              <button class="mini-button" type="button" data-quick-company-status="${company.id}" data-status="briefing">説明会</button>
              <button class="mini-button" type="button" data-quick-company-status="${company.id}" data-status="interview">面接</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (elements.loadMoreCompaniesButton) {
    const hiddenCount = filtered.length - visibleCompanies.length;
    elements.loadMoreCompaniesButton.hidden = hiddenCount <= 0;
    elements.loadMoreCompaniesButton.textContent = hiddenCount > 0 ? `さらに表示（残り ${hiddenCount} 社）` : "さらに表示";
  }
}

function renderDetail(company) {
  const education = company.education.map((item) => educationLabels[item]).join(" / ");
  const review = company.reviewSummary;
  const fitScore = studentFitScore(company);
  const freshness = sourceFreshnessStatus(company);
  const flow = selectionFlow(company);
  const foreignRows = company.foreignHiringRecords
    .map(
      (record) => `
        <div class="data-row">
          <span>${record.year}</span>
          <strong>${record.ratio === null || record.ratio === undefined ? "未公開" : `${record.ratio}%`}</strong>
          <small>${escapeHtml(displayForeignRecordSource(record))}</small>
        </div>
      `,
    )
    .join("");
  const sourceLink = company.sourceUrl
    ? `<a class="link-button" href="${escapeHtml(company.sourceUrl)}" target="_blank" rel="noopener">情報源を見る</a>`
    : `<button class="link-button muted" type="button" disabled>情報源未接続</button>`;
  const applyLink = company.applyUrl
    ? `<a class="link-button primary-link" href="${escapeHtml(company.applyUrl)}" target="_blank" rel="noopener">応募入口</a>`
    : `<button class="link-button primary-link muted" type="button" disabled>応募入口待接入</button>`;

  elements.detailPanel.innerHTML = `
    <div class="detail-top decision-detail-top">
      <div>
        <h2>${escapeHtml(displayCompanyName(company))}</h2>
        <div class="detail-sub">${displayIndustry(company.industry)} · ${displayRegion(company.region)} · ${displayRoles(company)}</div>
        <div class="detail-actions">
          <button class="link-button" type="button" data-edit-company="${company.id}">
            ${isCustomCompany(company.id) ? "企業情報を編集" : "コピーして編集"}
          </button>
          ${sourceLink}
          ${applyLink}
        </div>
      </div>
      <div class="detail-score">
        <strong>${fitScore}</strong>
        <span>留学生相性</span>
      </div>
    </div>

    <div class="detail-grid decision-detail-grid">
      <div class="detail-metric"><span>募集状態</span><strong>${company.statuses.includes("recruiting") || company.statuses.includes("yearRound") ? "募集中" : "候補"}</strong></div>
      <div class="detail-metric"><span>インターン</span><strong>${company.statuses.includes("internship") ? "あり" : "要確認"}</strong></div>
      <div class="detail-metric"><span>外国人比率</span><strong>${ratioText(company)}</strong></div>
      <div class="detail-metric"><span>口コミ</span><strong>${ratingText(company)} / 5</strong></div>
      <div class="detail-metric"><span>対象学歴</span><strong>${education}</strong></div>
      <div class="detail-metric freshness-${freshness.severity}"><span>情報鮮度</span><strong>${escapeHtml(freshness.label)}</strong></div>
    </div>

    <div class="data-block">
      <div class="section-title">事業内容</div>
      <p class="data-note">${escapeHtml(displayCompanyDescription(company))}</p>
    </div>

    <div class="data-block">
      <div class="section-title">応募前チェック</div>
      <div class="decision-check-list">
        <span>${company.visaSupport ? "ビザ支援あり" : "ビザ支援要確認"}</span>
        <span>日本語要件 ${escapeHtml(company.jlpt)}</span>
        <span>締切 ${escapeHtml(company.deadline)}</span>
        <span>${escapeHtml(ratioStatusText(company))}</span>
      </div>
      ${renderFreshnessAlert(freshness, false)}
    </div>

    <div class="data-block">
      <div class="section-title">直近3年の外国人データ</div>
      <div class="data-table">${foreignRows}</div>
      <p class="data-note">確認前サンプル値は公式情報接続後に更新します。未公開データは推測で置き換えません。</p>
    </div>

    <div class="data-block">
      <div class="section-title">選考の見通し</div>
      <div class="selection-flow">
        ${flow.map((step, index) => `<span>${index + 1}. ${escapeHtml(step)}</span>`).join("")}
      </div>
    </div>

    <div class="data-block">
      <div class="section-title">口コミ評価サマリー</div>
      <div class="review-summary">
        <strong>${ratingText(company)} / ${review.maxRating}</strong>
        <span>${escapeHtml(displayReviewSourceName(review))}</span>
      </div>
      <p class="data-note">${escapeHtml(displayReviewNote(review))}</p>
    </div>
  `;
}

function renderProgress(company) {
  const currentStatus = state.applications[company.id] || "watching";
  const memo = state.memos[company.id] || "";
  elements.progressPanel.innerHTML = `
    <div class="section-title">自分の応募進捗</div>
    <label class="field-label" for="applicationStatus">状態</label>
    <select id="applicationStatus" data-application-company="${company.id}">
      ${applicationStatuses
        .map(
          (status) =>
            `<option value="${status.value}" ${status.value === currentStatus ? "selected" : ""}>${status.label}</option>`,
        )
        .join("")}
    </select>
    <label class="field-label" for="applicationMemo">メモ</label>
    <textarea id="applicationMemo" data-memo-company="${company.id}" rows="4" placeholder="例：6/10 までに ES を書き、技術・人文知識・国際業務ビザの支援有無を確認">${escapeHtml(memo)}</textarea>
    <button class="secondary-button" type="button" data-save-memo="${company.id}">メモを保存</button>
  `;
}

function renderTrend(company) {
  const rating = ratingNumber(company);
  elements.trendChart.innerHTML = company.foreignHiringRecords
    .map((item) => {
      const ratio = Number.isFinite(item.ratio) ? item.ratio : 0;
      const ratioHeight = Math.max(8, ratio * 2.6);
      const ratingHeight = Math.max(8, rating * 24);
      const ratioLabel = Number.isFinite(item.ratio) ? `${item.ratio}%` : "未公開";
      return `
        <div class="trend-year">
          <div class="bar-pair" title="${item.year}: 外国人比率${ratioLabel}, 口コミ${ratingText(company)}">
            <div class="bar foreign" style="height:${ratioHeight}px"></div>
            <div class="bar rating" style="height:${ratingHeight}px"></div>
          </div>
          <span>${item.year}</span>
        </div>
      `;
    })
    .join("");
}

function render() {
  elements.ratioOutput.textContent = `${elements.ratioRange.value}%+`;
  elements.lastSyncLabel.textContent = `最后打开 ${new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })}`;
  const filtered = getFilteredCompanies();
  renderStats(filtered);
  renderHomeProgress();
  renderToolkit();
  renderDashboard();
  renderMyPage();
  renderCompanyList(filtered);
  const selected = filtered.find((company) => company.id === state.selectedId);
  if (selected) {
    renderDetail(selected);
    renderProgress(selected);
    renderTrend(selected);
  }
}

function resetVisibleCompanyCount() {
  state.visibleCompanyCount = companyPageSize;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2400);
}

elements.mainNavButtons.forEach((button) => {
  button.addEventListener("click", () => setActivePage(button.dataset.page));
});

elements.pageLinks.forEach((button) => {
  button.addEventListener("click", () => setActivePage(button.dataset.pageLink));
});

elements.homeAddCompanyButton?.addEventListener("click", () => {
  setActivePage("search");
  openCompanyModal();
});

elements.homeFollowupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const company = elements.followupCompanyInput.value.trim();
  if (!company) {
    showToast("请输入公司名");
    return;
  }
  state.companyFollowups.unshift({
    id: `followup-${Date.now()}`,
    company,
    url: normalizeUrl(elements.followupUrlInput.value),
    address: elements.followupAddressInput.value.trim(),
    role: elements.followupRoleInput.value.trim(),
    time: elements.followupTimeInput.value,
    note: elements.followupNoteInput.value.trim(),
    createdAt: new Date().toISOString(),
  });
  state.companyFollowups = state.companyFollowups.slice(0, 30);
  writeStorage(storageKeys.companyFollowups, state.companyFollowups);
  elements.homeFollowupForm.reset();
  render();
  showToast("公司跟进已添加");
});

elements.scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.scheduleTitleInput.value.trim();
  const time = elements.scheduleDateTimeInput.value;
  if (!title || !time) {
    showToast("请填写安排标题和时间");
    return;
  }
  state.mySchedules.unshift({
    id: `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    company: elements.scheduleCompanyInput.value.trim(),
    type: elements.scheduleTypeInput.value,
    time,
    note: elements.scheduleNoteInput.value.trim(),
    createdAt: new Date().toISOString(),
  });
  state.mySchedules = state.mySchedules.slice(0, 120);
  writeStorage(storageKeys.mySchedules, state.mySchedules);
  elements.scheduleForm.reset();
  render();
  showToast("安排已加入月历");
});

document.addEventListener("click", (event) => {
  const pageTarget = event.target.closest("[data-home-go]");
  if (pageTarget) {
    setActivePage(pageTarget.dataset.homeGo);
    return;
  }

  const industryTarget = event.target.closest("[data-home-industry]");
  if (industryTarget) {
    elements.industrySelect.value = industryTarget.dataset.homeIndustry;
    state.view = "all";
    resetVisibleCompanyCount();
    elements.tabs.forEach((button) => {
      button.classList.toggle("active", button.dataset.view === "all");
    });
    render();
    setActivePage("search");
  }
});

elements.statusChecks.forEach((input) =>
  input.addEventListener("change", () => {
    resetVisibleCompanyCount();
    render();
  }),
);
elements.educationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.education = button.dataset.education;
    resetVisibleCompanyCount();
    elements.educationButtons.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

elements.tabs.forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    resetVisibleCompanyCount();
    elements.tabs.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

elements.toolkitTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.toolkitView;
    const shouldOpen = !button.classList.contains("active");
    elements.toolkitTabs.forEach((item) => {
      item.classList.toggle("active", shouldOpen && item === button);
      item.setAttribute("aria-expanded", shouldOpen && item === button ? "true" : "false");
    });
    Object.entries(elements.toolkitViews).forEach(([key, view]) => {
      if (view) view.classList.toggle("active", shouldOpen && key === target);
    });
  });
});

elements.certIndustrySelect.addEventListener("change", renderCertificateToolkit);

elements.quizRandomButton?.addEventListener("click", pickRandomPracticeQuestion);

elements.quizRevealButton?.addEventListener("click", () => {
  state.practiceAnswerVisible = !state.practiceAnswerVisible;
  renderPracticeQuiz();
});

elements.quizCategorySelect?.addEventListener("change", () => {
  state.practiceCategory = elements.quizCategorySelect.value;
  state.currentPracticeQuestionId = "";
  state.practiceAnswerVisible = false;
  renderPracticeQuiz();
});

document.addEventListener("input", (event) => {
  const answerBox = event.target.closest("[data-interview-answer]");
  if (!answerBox) return;
  state.interviewAnswers[answerBox.dataset.interviewAnswer] = answerBox.value;
  writeStorage(storageKeys.interviewAnswers, state.interviewAnswers);
  const qaItem = answerBox.closest(".qa-collapse");
  const status = qaItem?.querySelector("summary small");
  if (status) status.textContent = answerBox.value.trim() ? "已填写" : "点击填写";
});

document.addEventListener("click", (event) => {
  const certificateButton = event.target.closest("[data-certificate-id]");
  if (certificateButton) {
    const id = certificateButton.dataset.certificateId;
    if (state.studyingCertificates.has(id)) {
      state.studyingCertificates.delete(id);
      showToast("已从学习中移除");
    } else {
      state.studyingCertificates.add(id);
      showToast("已加入学习中");
    }
    writeStorage(storageKeys.studyingCertificates, [...state.studyingCertificates]);
    render();
    return;
  }

  const certificateCareerButton = event.target.closest("[data-certificate-career]");
  if (certificateCareerButton) {
    state.certificateCareerFilter = certificateCareerButton.dataset.certificateCareer;
    renderCertificateCatalog();
    return;
  }

  const certificateCategoryButton = event.target.closest("[data-certificate-category]");
  if (certificateCategoryButton) {
    state.certificateCategoryFilter = certificateCategoryButton.dataset.certificateCategory;
    renderCertificateCatalog();
    return;
  }

  const removeFileButton = event.target.closest("[data-remove-file]");
  if (removeFileButton) {
    state.fileLibrary = state.fileLibrary.filter((file) => file.id !== removeFileButton.dataset.removeFile);
    writeStorage(storageKeys.fileLibrary, state.fileLibrary);
    render();
    showToast("文件已删除");
    return;
  }

  const removeOwnedCertButton = event.target.closest("[data-remove-owned-cert]");
  if (removeOwnedCertButton) {
    state.ownedCertificates = state.ownedCertificates.filter((cert) => cert.id !== removeOwnedCertButton.dataset.removeOwnedCert);
    writeStorage(storageKeys.ownedCertificates, state.ownedCertificates);
    render();
    showToast("证书已删除");
    return;
  }

  const saveMyMemoButton = event.target.closest("[data-save-my-memo]");
  if (saveMyMemoButton) {
    const companyId = saveMyMemoButton.dataset.saveMyMemo;
    const textarea = elements.companyMemoBoard?.querySelector(`[data-my-company-memo="${companyId}"]`);
    if (!textarea) return;
    state.memos[companyId] = textarea.value.trim();
    state.favorites.add(companyId);
    writeStorage(storageKeys.memos, state.memos);
    writeStorage(storageKeys.favorites, [...state.favorites]);
    render();
    showToast("公司记事已保存");
    return;
  }

  const quickStatusButton = event.target.closest("[data-my-company-status-button]");
  if (quickStatusButton) {
    const companyId = quickStatusButton.dataset.myCompanyStatusButton;
    state.applications[companyId] = quickStatusButton.dataset.status;
    state.favorites.add(companyId);
    writeStorage(storageKeys.progress, state.applications);
    writeStorage(storageKeys.favorites, [...state.favorites]);
    render();
    showToast("已一键归类公司");
    return;
  }

  const deleteFollowupButton = event.target.closest("[data-delete-followup]");
  if (deleteFollowupButton) {
    state.companyFollowups = state.companyFollowups.filter((item) => item.id !== deleteFollowupButton.dataset.deleteFollowup);
    writeStorage(storageKeys.companyFollowups, state.companyFollowups);
    render();
    showToast("跟进记录已删除");
    return;
  }

  const deleteScheduleButton = event.target.closest("[data-delete-schedule]");
  if (deleteScheduleButton) {
    state.mySchedules = state.mySchedules.filter((item) => item.id !== deleteScheduleButton.dataset.deleteSchedule);
    writeStorage(storageKeys.mySchedules, state.mySchedules);
    render();
    showToast("安排已删除");
  }
});

if (elements.esInput) {
  elements.esInput.value = readStorage(storageKeys.esDraft, "");
  elements.esInput.addEventListener("input", () => {
    writeStorage(storageKeys.esDraft, elements.esInput.value);
  });
}

if (elements.jobStartDateInput) elements.jobStartDateInput.value = state.myProfile.startDate || "";
if (elements.jobTargetDateInput) elements.jobTargetDateInput.value = state.myProfile.targetDate || "";
if (elements.resumeNameInput) elements.resumeNameInput.value = state.myProfile.resumeName || "";
if (elements.resumeNoteInput) elements.resumeNoteInput.value = state.myProfile.resumeNote || "";

function saveMyProfile() {
  writeStorage(storageKeys.myProfile, state.myProfile);
}

elements.jobStartDateInput?.addEventListener("change", () => {
  state.myProfile.startDate = elements.jobStartDateInput.value;
  saveMyProfile();
  render();
});

elements.jobTargetDateInput?.addEventListener("change", () => {
  state.myProfile.targetDate = elements.jobTargetDateInput.value;
  saveMyProfile();
  render();
});

elements.resumeNameInput?.addEventListener("input", () => {
  state.myProfile.resumeName = elements.resumeNameInput.value.trim();
  saveMyProfile();
});

elements.resumeNoteInput?.addEventListener("input", () => {
  state.myProfile.resumeNote = elements.resumeNoteInput.value;
  saveMyProfile();
});

elements.ownedCertForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.ownedCertNameInput.value.trim();
  if (!name) {
    showToast("请输入证书名");
    return;
  }
  state.ownedCertificates.unshift({
    id: `cert-${Date.now()}`,
    name,
    date: elements.ownedCertDateInput.value,
  });
  writeStorage(storageKeys.ownedCertificates, state.ownedCertificates);
  elements.ownedCertNameInput.value = "";
  elements.ownedCertDateInput.value = "";
  render();
  showToast("证书已添加");
});

elements.fileLibraryInput?.addEventListener("change", async (event) => {
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  const added = [];
  for (const file of files) {
    const record = {
      id: `file-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      addedAt: new Date().toLocaleDateString("zh-CN"),
      dataUrl: "",
    };
    if (file.size <= fileStorageLimit) {
      record.dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result || "")));
        reader.addEventListener("error", () => resolve(""));
        reader.readAsDataURL(file);
      });
    }
    added.push(record);
  }
  state.fileLibrary = [...added, ...state.fileLibrary].slice(0, 24);
  writeStorage(storageKeys.fileLibrary, state.fileLibrary);
  event.target.value = "";
  render();
  showToast(`${added.length}个文件已加入文件库`);
});

elements.analyzeEsButton?.addEventListener("click", () => {
  const result = scoreEsText(elements.esInput?.value || "");
  renderEsAnalysis(result);
  showToast("ES 深挖完成");
});

[
  elements.industrySelect,
  elements.regionSelect,
  elements.jlptSelect,
  elements.ratioRange,
  elements.visaSwitch,
  elements.searchInput,
  elements.sortSelect,
].forEach((element) => {
  const updateFilters = () => {
    resetVisibleCompanyCount();
    render();
  };
  element.addEventListener("input", updateFilters);
  element.addEventListener("change", updateFilters);
});

elements.loadMoreCompaniesButton?.addEventListener("click", () => {
  state.visibleCompanyCount += companyPageSize;
  render();
});

elements.companyList.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    event.stopPropagation();
    const id = favoriteButton.dataset.favoriteId;
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast("已从候选清单移除");
    } else {
      state.favorites.add(id);
      showToast("已加入候选清单");
    }
    writeStorage(storageKeys.favorites, [...state.favorites]);
    render();
    return;
  }

  const quickStatusButton = event.target.closest("[data-quick-company-status]");
  if (quickStatusButton) {
    event.stopPropagation();
    const companyId = quickStatusButton.dataset.quickCompanyStatus;
    state.applications[companyId] = quickStatusButton.dataset.status;
    state.favorites.add(companyId);
    writeStorage(storageKeys.progress, state.applications);
    writeStorage(storageKeys.favorites, [...state.favorites]);
    render();
    showToast("已加入我的页面并更新进度");
    return;
  }

  const card = event.target.closest("[data-company-id]");
  if (!card) return;
  state.selectedId = card.dataset.companyId;
  render();
});

elements.resetFilters.addEventListener("click", () => {
  elements.statusChecks.forEach((input) => {
    input.checked = ["recruiting", "internship", "candidate"].includes(input.value);
  });
  state.education = "all";
  state.view = "all";
  elements.educationButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.education === "all");
  });
  elements.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === "all");
  });
  elements.industrySelect.value = "all";
  elements.regionSelect.value = "all";
  elements.jlptSelect.value = "all";
  elements.ratioRange.value = "0";
  elements.visaSwitch.checked = false;
  elements.searchInput.value = "";
  elements.sortSelect.value = "match";
  resetVisibleCompanyCount();
  render();
});

elements.exportButton.addEventListener("click", () => {
  const filtered = getFilteredCompanies();
  const favorites = filtered.filter((company) => state.favorites.has(company.id));
  const target = favorites.length > 0 ? favorites : filtered.slice(0, 5);
  const lines = target.map(
    (company) => {
      const freshness = sourceFreshnessStatus(company);
      return `${displayCompanyName(company)}, ${displayIndustry(company.industry)}, ${displayRegion(company.region)}, 外国人比率${ratioText(company)} (${ratioStatusText(company)}), 口コミ${ratingText(company)}, 締切${company.deadline}, 情報鮮度:${freshness.label} (${freshness.summary})`;
    },
  );
  navigator.clipboard
    ?.writeText(lines.join("\n"))
    .then(() => showToast(`${target.length}社をクリップボードにコピーしました`))
    .catch(() => showToast("このブラウザでは自動コピーできません。CSV出力を利用してください。"));
});

elements.addCompanyButton.addEventListener("click", () => {
  openCompanyModal();
});

elements.closeCompanyModal.addEventListener("click", closeCompanyModal);
elements.cancelCompanyForm.addEventListener("click", closeCompanyModal);
elements.companyModal.addEventListener("click", (event) => {
  if (event.target === elements.companyModal) closeCompanyModal();
});

elements.detailPanel.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-company]");
  if (!editButton) return;
  const company = getAllCompanies().find((item) => item.id === editButton.dataset.editCompany);
  if (company) openCompanyModal(company);
});

elements.companyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const company = buildCustomCompanyFromForm();
  if (!company.name || !company.deadline) {
    showToast("会社名と応募締切を入力してください");
    return;
  }
  upsertCustomCompany(company);
  state.selectedId = company.id;
  state.view = "all";
  state.favorites.add(company.id);
  writeStorage(storageKeys.favorites, [...state.favorites]);
  elements.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === "all");
  });
  closeCompanyModal();
  showToast("会社情報を保存しました");
  render();
});

elements.deleteCompanyButton.addEventListener("click", () => {
  const companyId = elements.companyFields.id.value;
  if (!isCustomCompany(companyId)) return;
  if (!window.confirm("この自分で追加した会社を削除しますか？候補、応募進捗、メモも一緒に削除されます。")) return;
  state.customCompanies = state.customCompanies.filter((company) => company.id !== companyId);
  state.favorites.delete(companyId);
  delete state.applications[companyId];
  delete state.memos[companyId];
  saveCustomCompanies();
  writeStorage(storageKeys.favorites, [...state.favorites]);
  writeStorage(storageKeys.progress, state.applications);
  writeStorage(storageKeys.memos, state.memos);
  state.selectedId = getAllCompanies()[0]?.id || "";
  closeCompanyModal();
  showToast("自分で追加した会社を削除しました");
  render();
});

elements.downloadCsvButton.addEventListener("click", () => {
  const filtered = getFilteredCompanies();
  const favorites = filtered.filter((company) => state.favorites.has(company.id));
  const target = favorites.length > 0 ? favorites : filtered;
  const header = [
    "会社名",
    "業界",
    "地域",
    "職種",
    "日本語要件",
    "外国人比率",
    "比率状態",
    "口コミ",
    "口コミ評価ソース",
    "ビザ支援",
    "締切日",
    "情報鮮度",
    "再確認理由",
    "応募状態",
    "情報源",
    "最終確認",
    "メモ",
  ];
  const rows = target.map((company) => {
    const freshness = sourceFreshnessStatus(company);
    return [
      displayCompanyName(company),
      displayIndustry(company.industry),
      displayRegion(company.region),
      displayRoles(company),
      company.jlpt,
      ratioText(company),
      ratioStatusText(company),
      ratingText(company),
      displayReviewSourceName(company.reviewSummary),
      company.visaSupport ? "あり" : "要確認",
      company.deadline,
      freshness.label,
      freshness.reasons.join(" / "),
      applicationStatuses.find((status) => status.value === (state.applications[company.id] || "watching"))?.label || "関心あり",
      displaySourceName(company),
      company.lastChecked,
      state.memos[company.id] || "",
    ];
  });
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  downloadTextFile(`compass-${currentDateStamp()}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
  showToast(`${target.length}社を CSV として出力しました`);
});

elements.backupButton.addEventListener("click", () => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customCompanies: state.customCompanies,
    favorites: [...state.favorites],
    applications: state.applications,
    memos: state.memos,
    myProfile: state.myProfile,
    ownedCertificates: state.ownedCertificates,
    fileLibrary: state.fileLibrary,
    companyFollowups: state.companyFollowups,
    mySchedules: state.mySchedules,
  };
  downloadTextFile(
    `compass-backup-${currentDateStamp()}.json`,
    JSON.stringify(backup, null, 2),
    "application/json;charset=utf-8",
  );
  showToast("本地数据备份已下载");
});

elements.restoreInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.favorites) || typeof backup.applications !== "object" || typeof backup.memos !== "object") {
      throw new Error("Invalid backup");
    }
    state.customCompanies = Array.isArray(backup.customCompanies) ? backup.customCompanies : state.customCompanies;
    state.favorites = new Set(backup.favorites.filter((id) => getAllCompanies().some((company) => company.id === id)));
    state.applications = backup.applications;
    state.memos = backup.memos;
    state.myProfile = backup.myProfile || state.myProfile;
    state.ownedCertificates = Array.isArray(backup.ownedCertificates) ? backup.ownedCertificates : state.ownedCertificates;
    state.fileLibrary = Array.isArray(backup.fileLibrary) ? backup.fileLibrary : state.fileLibrary;
    state.companyFollowups = Array.isArray(backup.companyFollowups) ? backup.companyFollowups : state.companyFollowups;
    state.mySchedules = Array.isArray(backup.mySchedules) ? backup.mySchedules : state.mySchedules;
    if (elements.jobStartDateInput) elements.jobStartDateInput.value = state.myProfile.startDate || "";
    if (elements.jobTargetDateInput) elements.jobTargetDateInput.value = state.myProfile.targetDate || "";
    if (elements.resumeNameInput) elements.resumeNameInput.value = state.myProfile.resumeName || "";
    if (elements.resumeNoteInput) elements.resumeNoteInput.value = state.myProfile.resumeNote || "";
    writeStorage(storageKeys.customCompanies, state.customCompanies);
    writeStorage(storageKeys.favorites, [...state.favorites]);
    writeStorage(storageKeys.progress, state.applications);
    writeStorage(storageKeys.memos, state.memos);
    writeStorage(storageKeys.myProfile, state.myProfile);
    writeStorage(storageKeys.ownedCertificates, state.ownedCertificates);
    writeStorage(storageKeys.fileLibrary, state.fileLibrary);
    writeStorage(storageKeys.companyFollowups, state.companyFollowups);
    writeStorage(storageKeys.mySchedules, state.mySchedules);
    showToast("备份已恢复");
    render();
  } catch {
    showToast("备份文件格式不正确");
  } finally {
    event.target.value = "";
  }
});

function openCompanyFromDashboard(companyId) {
  state.selectedId = companyId;
  state.view = "all";
  elements.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === "all");
  });
  render();
  setActivePage("search");
  document.querySelector(`[data-company-id="${state.selectedId}"]`)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

elements.deadlineList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-dashboard-company]");
  if (!item) return;
  openCompanyFromDashboard(item.dataset.dashboardCompany);
});

[elements.homeDeadlineList, elements.homeDeadlineStrip, elements.homeFreshnessList, elements.dashboardFreshnessList, elements.myCompanyList]
  .filter(Boolean)
  .forEach((list) => {
  list.addEventListener("click", (event) => {
    const item = event.target.closest("[data-dashboard-company]");
    if (!item) return;
    openCompanyFromDashboard(item.dataset.dashboardCompany);
  });
  });

elements.progressPanel.addEventListener("change", (event) => {
  const statusSelect = event.target.closest("[data-application-company]");
  if (!statusSelect) return;
  const companyId = statusSelect.dataset.applicationCompany;
  state.applications[companyId] = statusSelect.value;
  state.favorites.add(companyId);
  writeStorage(storageKeys.progress, state.applications);
  writeStorage(storageKeys.favorites, [...state.favorites]);
  showToast("応募进度已保存");
  render();
});

elements.companyStageBoard.addEventListener("change", (event) => {
  const statusSelect = event.target.closest("[data-my-company-status]");
  if (!statusSelect) return;
  const companyId = statusSelect.dataset.myCompanyStatus;
  state.applications[companyId] = statusSelect.value;
  state.favorites.add(companyId);
  writeStorage(storageKeys.progress, state.applications);
  writeStorage(storageKeys.favorites, [...state.favorites]);
  render();
  showToast("公司阶段已更新");
});

elements.progressPanel.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save-memo]");
  if (!saveButton) return;
  const companyId = saveButton.dataset.saveMemo;
  const textarea = elements.progressPanel.querySelector(`[data-memo-company="${companyId}"]`);
  state.memos[companyId] = textarea.value.trim();
  state.favorites.add(companyId);
  writeStorage(storageKeys.memos, state.memos);
  writeStorage(storageKeys.favorites, [...state.favorites]);
  showToast("备注已保存");
  render();
});

loadCompanies().then(() => {
  state.selectedId = getAllCompanies()[0]?.id || "";
  render();
});
