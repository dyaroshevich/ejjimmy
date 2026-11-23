// F3b: sigenergy, calc, line -> de/fr/ja/ko
// Usage: node scripts/i18n-f3b.mjs
import fs from 'node:fs';

const T = {
  sigenergy: {
    badge: { de: 'Premium-Solartechnik', fr: 'Technologie solaire premium', ja: 'プレミアム太陽光技術', ko: '프리미엄 태양광 기술' },
    titleB: { de: 'Weltweit erstes 5-in-One', fr: 'Premier 5-en-Un mondial', ja: '世界初5-in-One', ko: '세계 최초 5-in-One' },
    subA: { de: 'Revolutionäres KI-Hybrid-All-in-one-System', fr: 'Système révolutionnaire IA-hybride tout-en-un', ja: '革新的AIハイブリッド・オールインワン', ko: '혁신적 AI 하이브리드 올인원 시스템' },
    subB: { de: 'Premium-Design, Spitzenleistung, Sicherheit auf Weltniveau', fr: 'Design premium, efficacité max, sécurité mondiale', ja: 'プレミアムデザイン、最高効率、世界レベルの安全', ko: '프리미엄 디자인, 최고 효율, 세계적 안전' },
    f1t: { de: 'KI-Energiemanagement', fr: "Gestion d'énergie IA", ja: 'AIエネルギーマネジメント', ko: 'AI 에너지 관리' },
    f1d: { de: 'Smarte Verbrauchsanalyse in Echtzeit für max. Ersparnis', fr: 'Analyse intelligente en temps réel pour un max d’économies', ja: '使用量をリアルタイム分析、最大節約', ko: '실시간 사용량 스마트 분석으로 최대 절약' },
    f2t: { de: 'Modularer Akku', fr: 'Batterie modulaire', ja: 'モジュラーバッテリー', ko: '모듈형 배터리' },
    f2d: { de: 'Erweiterbar von 5kWh bis 48kWh pro Stapel', fr: 'Extensible de 5kWh à 48kWh par bloc', ja: '1スタック5kWh〜48kWhに拡張可', ko: '스택당 5kWh~48kWh 확장' },
    f3t: { de: 'Eingebautes EV-Ladegerät', fr: 'Chargeur EV intégré', ja: 'EV充電器内蔵', ko: '내장 EV 충전기' },
    f3d: { de: '100% sauberes EV-Laden ohne Neuverkabelung', fr: 'Recharge EV 100% propre, sans recâblage', ja: '配線工事不要で100%クリーン充電', ko: '배선 없이 100% 청정 충전' },
    f4t: { de: 'Maximale Sicherheit', fr: 'Sécurité maximale', ja: '最高の安全性', ko: '최고 안전' },
    f4d: { de: 'Hohe Standards mit Auto-Feuerlöschung', fr: 'Hauts standards, extinction auto intégrée', ja: '高安全基準＋自動消火内蔵', ko: '높은 기준＋자동 소화 내장' },
    cta: { de: 'Premium-Pakete ansehen', fr: 'Voir les packs premium', ja: 'プレミアムパッケージを見る', ko: '프리미엄 패키지 보기' },
    hotInverter: { de: 'Smarter Wechselrichter', fr: 'Onduleur intelligent', ja: 'スマートインバーター', ko: '스마트 인버터' },
    hotBattery: { de: 'Akkumodul', fr: 'Module batterie', ja: 'バッテリーモジュール', ko: '배터리 모듈' },
    hotEv: { de: 'EV-Ladegerät', fr: 'Chargeur EV', ja: 'EV充電器', ko: 'EV 충전기' },
    m1label: { de: 'Umschaltzeit', fr: 'Temps de bascule', ja: '切替時間', ko: '절체 시간' },
    m1sub: { de: 'Schnellstes Backup', fr: 'Secours le plus rapide', ja: '最速バックアップ', ko: '가장 빠른 백업' },
    m2label: { de: 'Wirkungsgrad', fr: 'Rendement', ja: '変換効率', ko: '효율' },
    m2sub: { de: 'Spitzenleistung', fr: 'Performance de pointe', ja: 'ピーク性能', ko: '피크 성능' },
    m3label: { de: 'Produktgarantie', fr: 'Garantie produit', ja: '製品保証', ko: '제품 보증' },
    m3sub: { de: 'Lange Garantie', fr: 'Garantie longue', ja: '長期保証', ko: '장기 보증' },
    m4label: { de: 'Smarte Steuerung', fr: 'Contrôle intelligent', ja: 'スマート制御', ko: '스마트 제어' },
    m4sub: { de: 'Zukunftssicher', fr: "Prêt pour l'avenir", ja: '未来対応', ko: '미래 대응' },
    m3value: { de: '10 J.', fr: '10 ans', ja: '10年', ko: '10년' },
  },
  calc: {
    stepBuilding: { de: 'Gebäudetyp', fr: 'Type de bâtiment', ja: '建物タイプ', ko: '건물 유형' },
    stepBuildingSub: { de: 'Wo montieren?', fr: 'Où installer ?', ja: 'どこに設置？', ko: '어디에 설치할까요?' },
    stepBill: { de: 'Monatsstromrechnung', fr: 'Facture mensuelle', ja: '月々の電気代', ko: '월 전기료' },
    stepBillSub: { de: 'Wie hoch ca. Ihre Rechnung?', fr: 'À combien s’élève-t-elle ?', ja: '平均いくらくらい？', ko: '평균 얼마나 나오나요?' },
    stepRoof: { de: 'Dachtyp', fr: 'Type de toit', ja: '屋根タイプ', ko: '지붕 유형' },
    stepRoofSub: { de: 'Wie ist Ihr Dach?', fr: 'Comment est votre toit ?', ja: '屋根の形状は？', ko: '지붕 모양은?' },
    stepLoc: { de: 'Montageort', fr: "Zone d'installation", ja: '設置地域', ko: '설치 지역' },
    stepLocSub: { de: 'In welcher Provinz?', fr: 'Dans quelle province ?', ja: 'どの県？', ko: '어느 주에 있나요?' },
    moreThan: { de: 'Über 50.000 ฿', fr: 'Plus de 50 000 ฿', ja: '50,000฿以上', ko: '50,000฿ 초과' },
    analyzing: { de: 'Analysiere...', fr: 'Analyse...', ja: '分析中…', ko: '분석 중…' },
    analyzingSub: { de: 'KI findet Ihre optimale Amortisation', fr: "L'IA trouve votre retour optimal", ja: 'AIが最適な回収を算出中', ko: 'AI가 최적 회수를 계산 중' },
    bldRes: { de: 'Wohnhaus', fr: 'Maison', ja: '住宅', ko: '주택' },
    bldResD: { de: 'Haus / Villa', fr: 'Maison / villa', ja: '戸建て/ヴィラ', ko: '단독/빌라' },
    bldCom: { de: 'Laden / Büro', fr: 'Boutique / bureau', ja: '店舗/オフィス', ko: '상점/사무실' },
    bldComD: { de: 'Gewerbe / Büro', fr: 'Commerce / bureau', ja: '商業ビル/事務所', ko: '상가/사무실' },
    bldInd: { de: 'Fabrik / Lager', fr: 'Usine / entrepôt', ja: '工場/倉庫', ko: '공장/창고' },
    bldIndD: { de: 'Industrie / Lager', fr: 'Industrie / stockage', ja: '工場/倉庫', ko: '공장/창고' },
    roofConcrete: { de: 'Betondach', fr: 'Toit béton', ja: 'コンクリート屋根', ko: '콘크리트 지붕' },
    roofConcreteD: { de: 'Ziegel / Beton', fr: 'Tuiles / dalle', ja: '瓦/コンクリート', ko: '기와/콘크리트' },
    roofMetal: { de: 'Blechdach', fr: 'Toit tôle', ja: '金属屋根', ko: '금속 지붕' },
    roofMetalD: { de: 'Stahl / Blech', fr: 'Acier / tôle', ja: '鉄板/ガルバ', ko: '철판/함석' },
    roofGround: { de: 'Freifläche', fr: 'Au sol', ja: '地上設置', ko: '지상 설치' },
    roofGroundD: { de: 'Freifläche ums Haus', fr: 'Espace libre', ja: '建物周辺の空地', ko: '건물 주변 공터' },
    locKrabi: { de: 'Provinz Krabi', fr: 'Province de Krabi', ja: 'クラビ県', ko: '끄라비주' },
    locKrabiD: { de: 'Regionen in Krabi', fr: 'Zones à Krabi', ja: 'クラビ県内', ko: '끄라비주 내' },
    locPhuket: { de: 'Provinz Phuket', fr: 'Province de Phuket', ja: 'プーケット県', ko: '푸껫주' },
    locPhuketD: { de: 'Regionen in Phuket', fr: 'Zones à Phuket', ja: 'プーケット県内', ko: '푸껫주 내' },
    locOther: { de: 'Andere Regionen', fr: 'Autres zones', ja: 'その他地域', ko: '기타 지역' },
    locOtherD: { de: 'Andere Thai-Provinzen', fr: 'Autres provinces thaïes', ja: 'タイの他県', ko: '태국 타 지역' },
  },
  line: {
    hello: { de: 'Hallo, {name}', fr: 'Bonjour, {name}', ja: 'こんにちは、{name}さん', ko: '안녕하세요, {name}님' },
    connectLine: { de: 'LINE verbinden', fr: 'Connecter LINE', ja: 'LINE連携', ko: 'LINE 연결' },
    loginLine: { de: 'Mit LINE anmelden', fr: 'Se connecter avec LINE', ja: 'LINEログイン', ko: 'LINE 로그인' },
  },
};
const LOCALES = ['de', 'fr', 'ja', 'ko'];
for (const loc of LOCALES) {
  const p = 'messages/' + loc + '.json';
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const ns of Object.keys(T)) {
    m[ns] = m[ns] || {};
    for (const k of Object.keys(T[ns])) m[ns][k] = T[ns][k][loc];
  }
  fs.writeFileSync(p, JSON.stringify(m, null, 1) + '\n');
}
console.log('F3B-OK');
