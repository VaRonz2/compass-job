const fs = require("fs");

const dataPath = "data/companies.json";
const today = "2026-06-16";
const eventUrl = "https://tir-navicenter.metro.tokyo.lg.jp/student/foreigner-events/2026-06-16/";
const sourceName = "東京外国人材採用ナビセンター 2026/6 外国人材向けオンライン合同企業説明会";

const templates = {
  IT: {
    roles: ["システムエンジニア", "ITサポート", "プロジェクト推進"],
    description: "ソフトウェア開発、業務システム、インフラ、データ活用などを通じて企業のDXや業務改善を支援する企業です。",
    tags: ["外国人材向け説明会", "IT", "要公式確認"],
  },
  Consulting: {
    roles: ["リサーチャー", "コンサルタント", "データ分析"],
    description: "調査、分析、業務支援、マーケティングなどを通じて企業や行政の意思決定を支援する企業です。",
    tags: ["外国人材向け説明会", "調査分析", "要公式確認"],
  },
  Manufacturing: {
    roles: ["技術職", "生産管理", "品質管理"],
    description: "製品の開発、生産、品質管理、国内外への販売を行うメーカー系企業です。",
    tags: ["外国人材向け説明会", "メーカー", "要公式確認"],
  },
  Retail: {
    roles: ["販売職", "店舗運営", "商品企画"],
    description: "小売、店舗運営、商品企画、顧客対応を通じて生活者向けサービスを提供する企業です。",
    tags: ["外国人材向け説明会", "小売", "要公式確認"],
  },
  Food: {
    roles: ["店舗運営", "接客", "商品・サービス企画"],
    description: "外食、食品、店舗運営、接客サービスを通じて食の体験を提供する企業です。",
    tags: ["外国人材向け説明会", "外食", "要公式確認"],
  },
  Construction: {
    roles: ["施工管理", "設計補助", "設備管理"],
    description: "建設、設備、インフラ、空間づくりに関わる施工管理や技術サービスを展開する企業です。",
    tags: ["外国人材向け説明会", "建設", "要公式確認"],
  },
  Service: {
    roles: ["営業", "カスタマーサポート", "運営管理"],
    description: "法人・個人向けサービス、顧客対応、運営支援などを通じて現場の課題解決を支える企業です。",
    tags: ["外国人材向け説明会", "サービス", "要公式確認"],
  },
  Trading: {
    roles: ["総合職", "海外営業", "貿易実務"],
    description: "国内外の商材を扱い、営業、調達、貿易、事業開発などを展開する商社系企業です。",
    tags: ["外国人材向け説明会", "商社", "要公式確認"],
  },
  Logistics: {
    roles: ["物流管理", "オペレーション", "貿易事務"],
    description: "物流、倉庫、輸送、貿易関連業務を通じてサプライチェーンを支える企業です。",
    tags: ["外国人材向け説明会", "物流", "要公式確認"],
  },
};

const eventCompanies = [
  { id: "tokyo-foreign-202606-chimney", name: "Chimney", jpName: "チムニー株式会社", industry: "Food", region: "Tokyo", size: "1,000+" },
  { id: "tokyo-foreign-202606-avc", name: "AVC", jpName: "株式会社映像センター", industry: "Service", region: "Tokyo", size: "300+", roles: ["映像・音響サポート", "営業", "イベント運営"], description: "映像、音響、イベント機材、運営サポートなどを通じて展示会やイベントを支える企業です。", tags: ["外国人材向け説明会", "映像音響", "イベント", "要公式確認"] },
  { id: "tokyo-foreign-202606-r2-hd", name: "Junkan Shigen Holdings", jpName: "循環資源ホールディングス株式会社", industry: "Environment", region: "Tokyo", size: "300+", roles: ["資源循環", "設備管理", "営業"], description: "資源循環、環境関連サービス、エネルギー・リサイクル領域の事業を展開する企業です。", tags: ["外国人材向け説明会", "環境", "資源循環", "要公式確認"] },
  { id: "tokyo-foreign-202606-atona", name: "Atona", jpName: "株式会社Atona", industry: "Hospitality", region: "Tokyo", size: "300+", roles: ["ホテル運営", "接客", "企画運営"], description: "宿泊、飲食、観光サービス領域で施設運営や顧客体験づくりに関わる企業です。", tags: ["外国人材向け説明会", "宿泊", "観光", "要公式確認"] },
  { id: "tokyo-foreign-202606-nakano-seika", name: "Nakano Seika", jpName: "中野製菓株式会社", industry: "Food", region: "Tokyo", size: "300+", roles: ["製造", "品質管理", "商品開発"], description: "菓子・食品の製造、品質管理、商品開発、販売を行う食品メーカーです。", tags: ["外国人材向け説明会", "食品メーカー", "要公式確認"] },
  { id: "tokyo-foreign-202606-fenwal", name: "Nihon Fenwal", jpName: "日本フェンオール株式会社", industry: "Manufacturing", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-nikkon-hd", name: "Nikkon Holdings", jpName: "ニッコンホールディングス株式会社", industry: "Logistics", region: "Tokyo", size: "5,000+" },
  { id: "tokyo-foreign-202606-posmedia", name: "Posmedia", jpName: "株式会社ポスメディア", industry: "Service", region: "Tokyo", size: "300+", roles: ["販促支援", "営業", "オペレーション"], description: "販売促進、マーケティング支援、キャンペーン運営などを行うサービス企業です。", tags: ["外国人材向け説明会", "販促支援", "要公式確認"] },
  { id: "tokyo-foreign-202606-obara-kensetsu", name: "Obara Kensetsu", jpName: "小原建設株式会社", industry: "Construction", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-takumino", name: "TAKUMINO Holdings", jpName: "TAKUMINOホールディングス株式会社", industry: "Construction", region: "Tokyo", size: "1,000+" },
  { id: "tokyo-foreign-202606-hyperion", name: "Hyperion", jpName: "株式会社ハイペリオン", industry: "Service", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-nihon-energy", name: "Nihon Energy", jpName: "株式会社日本エネルギー", industry: "Energy", region: "Tokyo", size: "300+", roles: ["営業", "設備サポート", "エネルギー関連業務"], description: "エネルギー関連サービス、設備、法人・個人向けサポートを展開する企業です。", tags: ["外国人材向け説明会", "エネルギー", "要公式確認"] },
  { id: "tokyo-foreign-202606-best-logicom", name: "Best Logicom", jpName: "ベストロジコム株式会社", industry: "Logistics", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-kyowa-seikan", name: "Kyowa Seikan", jpName: "協和製凾株式会社", industry: "Manufacturing", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-globeship-sodexo", name: "Globeship Sodexo Corporate Services", jpName: "グローブシップ・ソデクソ・コーポレートサービス株式会社", industry: "Service", region: "Tokyo", size: "300+", roles: ["ファシリティ管理", "総務サービス", "運営管理"], description: "オフィス、施設、総務関連サービスの運営管理を支援するファシリティサービス企業です。", tags: ["外国人材向け説明会", "ファシリティ", "要公式確認"] },
  { id: "tokyo-foreign-202606-makino", name: "Makino", jpName: "株式会社マキノ", industry: "Service", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-gracecommunication", name: "Grace Communication", jpName: "株式会社グレースコミュニケーション", industry: "Service", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-tokyo-shokusai", name: "Tokyo Shokusai", jpName: "東京食彩株式会社", industry: "Food", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-nrc", name: "Nippon Research Center", jpName: "株式会社日本リサーチセンター", industry: "Consulting", region: "Tokyo", size: "300+", roles: ["リサーチャー", "データ分析", "マーケティング調査"], description: "マーケティングリサーチ、世論調査、データ分析を通じて企業や社会の意思決定を支援する調査会社です。", tags: ["外国人材向け説明会", "リサーチ", "データ分析", "要公式確認"] },
  { id: "tokyo-foreign-202606-resource-creation", name: "Resource Creation", jpName: "株式会社リソースクリエイション", industry: "Service", region: "Tokyo", size: "300+", roles: ["採用支援", "営業", "マーケティング"], description: "採用支援、広報、マーケティング領域で企業の人材獲得や情報発信を支援する企業です。", tags: ["外国人材向け説明会", "採用支援", "要公式確認"] },
  { id: "tokyo-foreign-202606-meisen-network", name: "Meisen Network", jpName: "株式会社名川ネットワーク", industry: "IT", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-hihatu", name: "Hihatu", jpName: "日発株式会社", industry: "IT", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-slab", name: "S-Lab", jpName: "株式会社エスラボ", industry: "IT", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-fujinet", name: "Fujinet Japan", jpName: "株式会社フジネットジャパン", industry: "IT", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-enway", name: "Enway", jpName: "株式会社エンウェイ", industry: "IT", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-takazono", name: "Takazono", jpName: "株式会社タカゾノ", industry: "Manufacturing", region: "Tokyo", size: "1,000+" },
  { id: "tokyo-foreign-202606-goal-connect", name: "Goal connect", jpName: "Goal connect株式会社", industry: "Service", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-takachiho-chemical", name: "Takachiho Chemical Industrial", jpName: "高千穂化学工業株式会社", industry: "Manufacturing", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-asahi-concrete", name: "Asahi Concrete Works", jpName: "旭コンクリート工業株式会社", industry: "Manufacturing", region: "Tokyo", size: "300+" },
  { id: "tokyo-foreign-202606-zenet", name: "ZENET", jpName: "株式会社ゼネット", industry: "IT", region: "Tokyo", size: "300+" },
];

function buildRecord(record, index) {
  const template = templates[record.industry] || templates.Service;
  const roles = record.roles || template.roles;
  const tags = record.tags || template.tags;
  const ratio = null;
  const description = record.description || template.description;

  return {
    id: record.id,
    name: record.name,
    jpName: record.jpName,
    industry: record.industry,
    region: record.region,
    size: record.size || "300+",
    statuses: ["recruiting", "briefing"],
    education: ["undergrad", "grad", "language"],
    roles,
    jlpt: record.jlpt || "N2",
    foreignRatio: ratio,
    rating: 0,
    visaSupport: "likely",
    deadline: "2026-06-18",
    match: 84 - (index % 12),
    tags,
    description,
    jpDescription: description,
    notes: [
      "2026年6月16日-18日の東京都主催・外国人材向けオンライン合同企業説明会の出展企業として確認。",
      "説明会はオンライン開催です。参加登録、対象条件、各社募集職種は主催ページまたは企業説明会で確認してください。",
      "外国人採用比率と口コミ評価は未接続です。実データ確認後に更新してください。",
    ],
    history: [2024, 2025, 2026].map((year) => ({ year, foreignRatio: ratio, rating: null })),
    sourceName,
    sourceType: "event",
    sourceUrl: eventUrl,
    applyUrl: eventUrl,
    reviewSource: "口コミ評価ソース未接続",
    lastChecked: today,
    confidence: "公開イベントページで出展確認。詳細な採用条件・外国人採用比率・口コミ評価は未確認。",
    foreignHiringRecords: [2024, 2025, 2026].map((year) => ({
      year,
      ratio,
      metric: "外国人採用/社員比率",
      status: "unknown",
      sourceName: "未公開・未接続",
      sourceUrl: "",
      checkedAt: today,
      note: "外国人材向け説明会の出展企業として確認。外国人採用比率は未接続です。",
    })),
    reviewSummary: {
      rating: 0,
      maxRating: 5,
      reviewCount: null,
      sourceName: "口コミ評価ソース未接続",
      sourceUrl: "",
      lastChecked: today,
      status: "unknown",
      tags: tags.slice(0, 3),
      rawReviewsStored: false,
      note: "口コミ評価は未接続です。OpenWork、ライトハウス、公式情報などで確認後に評価点・タグ・参照リンクのみ保存してください。",
    },
  };
}

const original = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const withoutPreviousSync = original.filter((company) => !String(company.id).startsWith("tokyo-foreign-202606-"));
const known = new Set(withoutPreviousSync.flatMap((company) => [company.id, company.name, company.jpName].filter(Boolean)));

const records = [];
for (const [index, company] of eventCompanies.entries()) {
  if (known.has(company.id) || known.has(company.name) || known.has(company.jpName)) continue;
  records.push(buildRecord(company, index));
}

const next = [...records, ...withoutPreviousSync];
fs.writeFileSync(dataPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ removed: original.length - withoutPreviousSync.length, added: records.length, total: next.length }, null, 2));
