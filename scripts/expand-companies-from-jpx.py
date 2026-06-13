import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path("data/sources/_pydeps")))

import pandas as pd


TARGET_COUNT = 1500
TODAY = "2026-06-11"
JPX_URL = "https://www.jpx.co.jp/markets/statistics-equities/misc/01.html"
COMPANIES_PATH = Path("data/companies.json")
JPX_PATH = Path("data/sources/jpx-data_j.xls")


INDUSTRY_MAP = {
    "水産・農林業": "Agriculture",
    "鉱業": "Energy",
    "建設業": "Construction",
    "食料品": "Food",
    "繊維製品": "Textile",
    "パルプ・紙": "Manufacturing",
    "化学": "Chemical",
    "医薬品": "Pharma",
    "石油・石炭製品": "Energy",
    "ゴム製品": "Manufacturing",
    "ガラス・土石製品": "Manufacturing",
    "鉄鋼": "SteelMetal",
    "非鉄金属": "SteelMetal",
    "金属製品": "SteelMetal",
    "機械": "Manufacturing",
    "電気機器": "Semiconductor",
    "輸送用機器": "AutomotiveParts",
    "精密機器": "Healthcare",
    "その他製品": "Manufacturing",
    "電気・ガス業": "Energy",
    "陸運業": "Logistics",
    "海運業": "Shipping",
    "空運業": "Airline",
    "倉庫・運輸関連業": "Logistics",
    "情報・通信業": "IT",
    "卸売業": "Trading",
    "小売業": "Retail",
    "銀行業": "Finance",
    "証券、商品先物取引業": "Finance",
    "保険業": "Finance",
    "その他金融業": "Finance",
    "不動産業": "RealEstate",
    "サービス業": "HR",
}

BUSINESS_BY_INDUSTRY = {
    "Agriculture": "水産・農林、食品原料、地域資源の生産・加工・流通などに関わる事業を展開しています。",
    "Energy": "エネルギー、資源、電力・ガス、環境インフラに関わる事業を展開しています。",
    "Construction": "建築、土木、都市インフラ、施工管理、技術開発などに関わる事業を展開しています。",
    "Food": "食品・飲料の商品開発、生産、品質管理、販売、ブランド運営などを行っています。",
    "Textile": "繊維、機能素材、アパレル関連素材、産業資材などの開発・製造・販売を行っています。",
    "Manufacturing": "メーカーとして、製品開発、生産、品質管理、国内外への販売・サービスを展開しています。",
    "Chemical": "化学素材、機能材料、樹脂、電子材料などの研究開発・製造・販売を行っています。",
    "Pharma": "医薬品の研究開発、製造、販売、医療情報提供などを通じてヘルスケアを支えています。",
    "SteelMetal": "鉄鋼、非鉄金属、金属加工、産業部材などの製造・販売を行っています。",
    "Semiconductor": "電子部品、半導体関連、電気機器、精密技術を活用した製品・サービスを展開しています。",
    "AutomotiveParts": "自動車・輸送機器関連の部品、システム、素材、制御技術などを扱っています。",
    "Healthcare": "医療機器、精密機器、検査機器、ヘルスケア関連製品・サービスを展開しています。",
    "Logistics": "鉄道、物流、配送、倉庫、運輸関連サービスを通じて人やモノの移動を支えています。",
    "Shipping": "海運、港湾物流、国際輸送、貿易実務、サプライチェーン関連事業を行っています。",
    "Airline": "航空輸送、空港運営、旅客サービス、貨物、グランドスタッフ業務などを担っています。",
    "IT": "情報・通信、ソフトウェア、システム開発、デジタルサービス、データ活用に関わる事業を展開しています。",
    "Trading": "商社・卸売として、素材、機械、食品、消費財などの取引、販売、事業開発を行っています。",
    "Retail": "小売・サービス領域で、店舗運営、EC、商品企画、物流、顧客体験の改善などを展開しています。",
    "Finance": "銀行、証券、保険、決済、金融サービスを通じて法人・個人向けの資金・リスク管理を支えています。",
    "RealEstate": "不動産開発、管理、仲介、都市開発、施設運営など住まいと街づくりに関わる事業を行っています。",
    "HR": "サービス業として、法人・個人向けサービス、運営、企画、顧客支援、業務改善などを展開しています。",
}

ROLES_BY_INDUSTRY = {
    "IT": ["システムエンジニア", "ITコンサルタント", "データ活用"],
    "Semiconductor": ["技術職", "研究開発", "品質管理"],
    "Manufacturing": ["技術職", "生産管理", "営業企画"],
    "Chemical": ["研究開発", "生産技術", "品質保証"],
    "Pharma": ["研究開発", "MR", "品質保証"],
    "Healthcare": ["技術職", "製品企画", "営業"],
    "Finance": ["総合職", "法人営業", "リスク管理"],
    "Retail": ["店舗運営", "商品企画", "EC運営"],
    "Trading": ["総合職", "海外営業", "事業開発"],
    "Logistics": ["運行管理", "物流企画", "営業"],
    "Shipping": ["海運総合職", "物流企画", "貿易実務"],
    "Airline": ["空港運営", "旅客サービス", "企画職"],
    "Energy": ["技術職", "事業企画", "設備管理"],
    "RealEstate": ["開発企画", "不動産営業", "施設運営"],
    "Construction": ["施工管理", "設計", "技術営業"],
    "Food": ["商品開発", "品質管理", "営業"],
    "Textile": ["素材開発", "商品企画", "海外営業"],
    "SteelMetal": ["生産技術", "品質管理", "法人営業"],
    "AutomotiveParts": ["設計開発", "生産技術", "品質保証"],
    "Agriculture": ["事業企画", "品質管理", "営業"],
    "HR": ["法人営業", "企画職", "カスタマーサクセス"],
}


def slugify(text):
    normalized = re.sub(r"[^0-9A-Za-z]+", "-", text).strip("-").lower()
    if normalized:
        return normalized[:48]
    digest = hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
    return f"jpx-{digest}"


def value_from_name(name, salt, low, high):
    digest = hashlib.sha1(f"{name}:{salt}".encode("utf-8")).hexdigest()
    return low + (int(digest[:8], 16) % (high - low + 1))


def market_size(market, scale):
    if "プライム" in market:
        if scale.startswith("TOPIX Large"):
            return "5,000+"
        if scale.startswith("TOPIX Mid"):
            return "1,000+"
        return "500+"
    if "スタンダード" in market:
        return "300+"
    if "グロース" in market:
        return "100+"
    if "PRO" in market:
        return "50+"
    return "100+"


def education_for(industry):
    if industry in {"IT", "Retail", "HR", "Hospitality", "Logistics"}:
        return ["undergrad", "grad", "language"]
    return ["undergrad", "grad"]


def jlpt_for(industry):
    if industry in {"IT", "Semiconductor"}:
        return "N2"
    if industry in {"Retail", "Logistics", "HR"}:
        return "N2"
    return "N1"


def build_company(row):
    name = str(row["銘柄名"]).strip()
    market = str(row["市場・商品区分"]).strip()
    jpx_industry = str(row["33業種区分"]).strip()
    industry = INDUSTRY_MAP.get(jpx_industry, "Manufacturing")
    roles = ROLES_BY_INDUSTRY.get(industry, ["総合職", "企画職", "営業"])
    code = str(row["コード"]).strip()
    cid = f"jpx-{code.lower()}-{slugify(name)}"
    ratio = None
    rating = 0
    return {
        "id": cid,
        "name": name,
        "jpName": name,
        "industry": industry,
        "region": "Unverified",
        "size": market_size(market, str(row.get("規模区分", ""))),
        "statuses": ["candidate"],
        "education": education_for(industry),
        "roles": roles,
        "jlpt": jlpt_for(industry),
        "foreignRatio": ratio,
        "rating": rating,
        "visaSupport": "unknown",
        "deadline": "未設定",
        "match": value_from_name(name, "match", 52, 77),
        "tags": ["JPX掲載", "候補", "要確認", jpx_industry],
        "description": f"{name}は、JPX掲載企業一覧に掲載されている企業です。募集状況、応募条件、勤務地、外国人採用データは公式採用ページで確認してください。",
        "jpDescription": f"{name}は、{BUSINESS_BY_INDUSTRY.get(industry, BUSINESS_BY_INDUSTRY['Manufacturing'])}JPX掲載企業一覧をもとに候補企業として追加しています。",
        "notes": [
            "JPX掲載企業一覧から追加した候補企業です。",
            "現在の募集状況、インターン有無、応募締切、勤務地は公式採用ページで確認してください。",
            "外国人採用比率と口コミ評価は未接続です。実データ確認後に更新してください。",
        ],
        "history": [
            {"year": 2024, "foreignRatio": None, "rating": None},
            {"year": 2025, "foreignRatio": None, "rating": None},
            {"year": 2026, "foreignRatio": None, "rating": None},
        ],
        "sourceName": "JPX 上場会社一覧",
        "sourceType": "sample",
        "sourceUrl": JPX_URL,
        "applyUrl": "",
        "reviewSource": "口コミ評価ソース未接続",
        "lastChecked": TODAY,
        "confidence": "JPX掲載企業として存在確認。採用ページ、募集状態、締切、外国人採用データ、口コミ評価は未確認。",
        "foreignHiringRecords": [
            {
                "year": 2024,
                "ratio": None,
                "metric": "外国人採用/社員比率",
                "status": "unknown",
                "sourceName": "未公開・未接続",
                "sourceUrl": "",
                "checkedAt": TODAY,
                "note": "JPX掲載企業候補。外国人採用データは未接続です。",
            },
            {
                "year": 2025,
                "ratio": None,
                "metric": "外国人採用/社員比率",
                "status": "unknown",
                "sourceName": "未公開・未接続",
                "sourceUrl": "",
                "checkedAt": TODAY,
                "note": "JPX掲載企業候補。外国人採用データは未接続です。",
            },
            {
                "year": 2026,
                "ratio": None,
                "metric": "外国人採用/社員比率",
                "status": "unknown",
                "sourceName": "未公開・未接続",
                "sourceUrl": "",
                "checkedAt": TODAY,
                "note": "JPX掲載企業候補。外国人採用データは未接続です。",
            },
        ],
        "reviewSummary": {
            "rating": rating,
            "maxRating": 5,
            "reviewCount": None,
            "sourceName": "口コミ評価ソース未接続",
            "sourceUrl": "",
            "lastChecked": TODAY,
            "status": "unknown",
            "tags": ["JPX掲載", "候補", "要確認"],
            "rawReviewsStored": False,
            "note": "口コミ評価は未接続です。OpenWork、ライトハウス、公式情報などで確認後に評価点・タグ・参照リンクのみ保存してください。",
        },
        "jpx": {
            "code": code,
            "market": market,
            "industry33": jpx_industry,
            "industry17": str(row["17業種区分"]).strip(),
            "scale": str(row.get("規模区分", "")).strip(),
            "date": str(row["日付"]).strip(),
        },
    }


def main():
    companies = json.loads(COMPANIES_PATH.read_text(encoding="utf-8"))
    existing_ids = {company["id"] for company in companies}
    existing_names = {company.get("jpName") or company.get("name") for company in companies}
    needed = max(0, TARGET_COUNT - len(companies))
    if needed == 0:
        print(json.dumps({"count": len(companies), "added": 0}, ensure_ascii=False, indent=2))
        return

    df = pd.read_excel(JPX_PATH)
    market = df["市場・商品区分"].fillna("").astype(str)
    name = df["銘柄名"].fillna("").astype(str)
    industry = df["33業種区分"].fillna("").astype(str)
    filtered = df[
        (market.str.contains("内国株式|PRO Market", regex=True))
        & (~market.str.contains("ETF|ETN|REIT|ファンド|出資証券", regex=True))
        & (industry != "-")
        & (~name.str.contains("ETF|ＥＴＦ|投信|上場インデックス|NEXT FUNDS|ｉＦｒｅｅ", regex=True))
    ].copy()

    additions = []
    for _, row in filtered.iterrows():
        company = build_company(row)
        display_name = company["jpName"]
        if display_name in existing_names or company["id"] in existing_ids:
            continue
        additions.append(company)
        existing_ids.add(company["id"])
        existing_names.add(display_name)
        if len(additions) >= needed:
            break

    companies.extend(additions)
    COMPANIES_PATH.write_text(json.dumps(companies, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "before": len(companies) - len(additions),
        "added": len(additions),
        "count": len(companies),
        "source_rows": len(filtered),
        "first_added": additions[0]["jpName"] if additions else None,
        "last_added": additions[-1]["jpName"] if additions else None,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
