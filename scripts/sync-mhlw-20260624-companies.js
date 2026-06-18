const fs = require("fs");

const dataPath = "data/companies.json";
const today = "2026-06-18";
const eventUrl = "https://jsite.mhlw.go.jp/tokyo-foreigner/news_topics/kigyou_minasama/mense/202601_1_sankakigyou.html";
const flyerUrl = "https://jsite.mhlw.go.jp/tokyo-foreigner/content/contents/002634395.pdf";
const sourceName = "東京外国人雇用サービスセンター 2026/6/24 特定技能マッチングイベント";

const templates = {
  Care: {
    industry: "Healthcare",
    roles: ["介護職", "施設運営", "生活支援"],
    description: "介護施設、生活支援、ケアサービスなどを通じて高齢者や利用者の暮らしを支える企業です。",
    tags: ["特定技能", "介護", "6/24面接会", "要公式確認"],
  },
  Aviation: {
    industry: "Logistics",
    roles: ["空港地上支援", "航空関連サービス", "オペレーション"],
    description: "空港、航空関連サービス、地上支援、物流オペレーションなどを展開する企業です。",
    tags: ["特定技能", "航空", "6/24面接会", "要公式確認"],
  },
  AutoMaintenance: {
    industry: "Retail",
    roles: ["自動車整備", "店舗運営", "カー用品販売"],
    description: "自動車用品販売、整備、店舗運営、顧客対応などを行う企業です。",
    tags: ["特定技能", "自動車整備", "6/24面接会", "要公式確認"],
  },
  Cleaning: {
    industry: "Service",
    roles: ["ビルクリーニング", "施設管理", "清掃サービス"],
    description: "ホテル、オフィス、商業施設などの清掃・施設管理サービスを提供する企業です。",
    tags: ["特定技能", "ビルクリーニング", "6/24面接会", "要公式確認"],
  },
  Construction: {
    industry: "Construction",
    roles: ["建設作業", "施工管理補助", "現場サポート"],
    description: "建設、土木、設備、現場施工に関わるサービスを展開する企業です。",
    tags: ["特定技能", "建設", "6/24面接会", "要公式確認"],
  },
  FoodManufacturing: {
    industry: "Food",
    roles: ["食品製造", "品質管理", "生産管理"],
    description: "食品、惣菜、菓子などの製造、品質管理、生産管理を行う企業です。",
    tags: ["特定技能", "飲食料品製造", "6/24面接会", "要公式確認"],
  },
};

const eventCompanies = [
  { id: "mhlw-20260624-gakken-cocofump", name: "Gakken Cocofump", jpName: "株式会社学研ココファン", category: "Care", size: "1,000+" },
  { id: "mhlw-20260624-medical-care-service", name: "Medical Care Service", jpName: "メディカル・ケア・サービス株式会社", category: "Care", size: "5,000+" },
  { id: "mhlw-20260624-konoike-sky-support", name: "Konoike Sky Support", jpName: "コウノイケ・スカイサポート株式会社", category: "Aviation", size: "300+" },
  { id: "mhlw-20260624-sanko-air-seltec", name: "Sanko Air Seltec", jpName: "サンコー・エア・セルテック株式会社", category: "Aviation", size: "1,000+" },
  { id: "mhlw-20260624-haneda-airport-service", name: "Haneda Airport Service", jpName: "羽田空港サービス株式会社", category: "Aviation", size: "1,000+" },
  { id: "mhlw-20260624-east-tokyo-yellowhat", name: "East Tokyo Yellow Hat", jpName: "株式会社東東京イエローハット", category: "AutoMaintenance", size: "300+" },
  { id: "mhlw-20260624-super-hotel-clean", name: "Super Hotel Clean", jpName: "株式会社スーパーホテルクリーン", category: "Cleaning", size: "300+" },
  { id: "mhlw-20260624-seishin-service", name: "Seishin Service", jpName: "西新サービス株式会社", category: "Cleaning", size: "300+" },
  { id: "mhlw-20260624-taihei-building-service-tokyo", name: "Taihei Building Service Tokyo", jpName: "太平ビルサービス株式会社 東京支店", category: "Cleaning", size: "10,000+" },
  { id: "mhlw-20260624-sagami-kaihatsu", name: "Sagami Kaihatsu", jpName: "相模開発株式会社", category: "Construction", size: "300+" },
  { id: "mhlw-20260624-gff", name: "GFF", jpName: "株式会社GFF", category: "FoodManufacturing", size: "1,000+" },
  { id: "mhlw-20260624-be-fresh", name: "Be-fresh", jpName: "株式会社Be-fresh", category: "FoodManufacturing", size: "300+" },
  { id: "mhlw-20260624-monteur", name: "Monteur", jpName: "株式会社モンテール", category: "FoodManufacturing", size: "1,000+" },
];

function buildRecord(record, index) {
  const template = templates[record.category];
  return {
    id: record.id,
    name: record.name,
    jpName: record.jpName,
    industry: template.industry,
    region: "Tokyo",
    size: record.size,
    statuses: ["recruiting", "briefing"],
    education: ["language", "undergrad", "grad"],
    roles: template.roles,
    jlpt: "N3",
    foreignRatio: null,
    rating: 0,
    visaSupport: "likely",
    deadline: "2026-06-24",
    match: 78 - (index % 8),
    tags: template.tags,
    description: template.description,
    jpDescription: template.description,
    notes: [
      "2026年6月24日の東京外国人雇用サービスセンター主催・特定技能マッチングイベント参加企業として確認。",
      "同日は外国人留学生大卒等合同就職面接会と同時開催。入場予約、対象条件、求人内容は主催ページとPDFで確認してください。",
      "特定技能分野の企業です。新卒総合職ではない可能性があるため、在留資格、職種、雇用条件を必ず確認してください。",
    ],
    history: [2024, 2025, 2026].map((year) => ({ year, foreignRatio: null, rating: null })),
    sourceName,
    sourceType: "event",
    sourceUrl: eventUrl,
    applyUrl: eventUrl,
    reviewSource: "口コミ評価ソース未接続",
    lastChecked: today,
    confidence: "MHLW/東京外国人雇用サービスセンター公開PDFで参加企業名を確認。求人条件・外国人採用比率・口コミ評価は未接続。",
    foreignHiringRecords: [2024, 2025, 2026].map((year) => ({
      year,
      ratio: null,
      metric: "外国人採用/社員比率",
      status: "unknown",
      sourceName: "未公開・未接続",
      sourceUrl: "",
      checkedAt: today,
      note: "特定技能マッチングイベント参加企業として確認。外国人採用比率は未接続です。",
    })),
    reviewSummary: {
      rating: 0,
      maxRating: 5,
      reviewCount: null,
      sourceName: "口コミ評価ソース未接続",
      sourceUrl: "",
      lastChecked: today,
      status: "unknown",
      tags: template.tags.slice(0, 3),
      rawReviewsStored: false,
      note: "口コミ評価は未接続です。OpenWork、ライトハウス、公式情報などで確認後に評価点・タグ・参照リンクのみ保存してください。",
    },
    eventMeta: {
      eventDate: "2026-06-24",
      eventTitle: "外国人留学生大卒等合同就職面接会 同時開催 特定技能マッチングイベント",
      eventPlace: "東京体育館メインアリーナ",
      sourcePdf: flyerUrl,
    },
  };
}

const original = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const withoutPreviousSync = original.filter((company) => !String(company.id).startsWith("mhlw-20260624-"));
const known = new Set(withoutPreviousSync.flatMap((company) => [company.id, company.name, company.jpName].filter(Boolean)));
const records = [];

for (const [index, company] of eventCompanies.entries()) {
  if (known.has(company.id) || known.has(company.name) || known.has(company.jpName)) continue;
  records.push(buildRecord(company, index));
}

const next = [...records, ...withoutPreviousSync];
fs.writeFileSync(dataPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ removed: original.length - withoutPreviousSync.length, added: records.length, total: next.length }, null, 2));
