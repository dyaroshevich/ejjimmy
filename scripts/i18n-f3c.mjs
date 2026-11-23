// F3c: chat namespace -> de/fr/ja/ko
// Usage: node scripts/i18n-f3c.mjs
import fs from 'node:fs';

const T = {
  chat: {
    typing: { de: 'Tippt…', fr: 'Écrit…', ja: '入力中…', ko: '입력 중…' },
    tabSavings: { de: 'Gespart/Mo', fr: 'Économisé/mois', ja: '月削減', ko: '월 절약' },
    tabPayback: { de: 'Amortisation', fr: 'Retour', ja: '回収', ko: '회수' },
    tabOverview: { de: '25-Jahre-Blick', fr: 'Vue 25 ans', ja: '25年ビュー', ko: '25년 보기' },
    saveMax: { de: 'Max. Stromersparnis', fr: 'Économies max', ja: '最大削減額', ko: '최대 절약액' },
    perMonth: { de: '/Monat', fr: '/mois', ja: '/月', ko: '/월' },
    coffeeEq: { de: 'Das sind {n} Gratis-Kaffees im Monat!', fr: 'Soit {n} cafés offerts par mois !', ja: '毎月コーヒー{n}杯分！', ko: '매달 커피 {n}잔 공짜!' },
    paybackTime: { de: 'Geschätzte Amortisation', fr: 'Retour estimé', ja: '推定回収期間', ko: '예상 회수 기간' },
    yearsUnit: { de: 'J.', fr: 'ans', ja: '年', ko: '년' },
    freeAfter: { de: 'Danach gratis Strom lebenslang', fr: 'Ensuite, électricité gratuite à vie', ja: '以降は寿命まで電気代ゼロ', ko: '이후 평생 전기 무료' },
    longSave: { de: 'Langfrist-Ersparnis (25 J.)', fr: 'Économies long terme (25 ans)', ja: '長期削減（25年）', ko: '장기 절약(25년)' },
    million: { de: 'Mio.', fr: 'M', ja: '百万', ko: '백만' },
    homeValueUp: { de: 'Steigert Ihren Hauswert massiv', fr: 'Valorise énormément votre maison', ja: '家の価値を大幅アップ', ko: '집값 대폭 상승' },
    sysSize: { de: 'Anlagengröße', fr: 'Taille du système', ja: 'システム規模', ko: '시스템 규모' },
    equipment: { de: 'Ausrüstung', fr: 'Matériel', ja: '機器', ko: '장비' },
    tierPremium: { de: 'Premium', fr: 'Premium', ja: 'プレミアム', ko: '프리미엄' },
    tierSaver: { de: 'Sparer', fr: 'Éco', ja: 'エコノミー', ko: '이코노미' },
    bookSurvey: { de: 'Gratis-Besichtigung buchen', fr: 'Visite gratuite', ja: '無料現地調査を予約', ko: '무료 현장 실측 예약' },
    saved: { de: 'Gespeichert', fr: 'Enregistré', ja: '保存済み', ko: '저장됨' },
    saveLine: { de: 'In LINE speichern', fr: 'Enregistrer dans LINE', ja: 'LINEに保存', ko: 'LINE에 저장' },
    consultEng: { de: 'Ingenieur sprechen', fr: 'Parler à un ingénieur', ja: 'エンジニアに相談', ko: '엔지니어 상담' },
    analyzing: { de: 'Analysiere...', fr: 'Analyse...', ja: '分析中…', ko: '분석 중…' },
    openProposal: { de: 'Ihr Angebot öffnen', fr: 'Ouvrir votre offre', ja: '特別提案を開く', ko: '특별 제안 열기' },
    recalc: { de: 'Neu berechnen', fr: 'Recalculer', ja: '再計算', ko: '다시 계산' },
    welcomeTag: { de: 'Willkommen bei TAWAN POWER', fr: 'Bienvenue chez TAWAN POWER', ja: 'TAWAN POWERへようこそ', ko: 'TAWAN POWER에 오신 것을 환영' },
    welcomeTitle: { de: 'Wie können wir helfen?', fr: 'Comment aider ?', ja: '何をお手伝い？', ko: '무엇을 도와드릴까요?' },
    wizTitle: { de: 'Sparrechner', fr: "Calculateur d'économies", ja: '節約シミュレーター', ko: '절약 계산기' },
    wizDesc: { de: 'Präzise Flächen- & Amortisationsanalyse', fr: 'Analyse précise surface & retour', ja: '面積・回収の精密分析', ko: '면적·회수 정밀 분석' },
    catTitle: { de: 'Katalog', fr: 'Catalogue', ja: 'カタログ', ko: '카탈로그' },
    catDesc: { de: 'Beste Tier-1-Sets', fr: 'Meilleurs kits Tier 1', ja: '最高Tier1セット', ko: '최고 Tier 1 세트' },
    procTitle: { de: 'Montageschritte', fr: 'Étapes de pose', ja: '設置手順', ko: '설치 절차' },
    procDesc: { de: 'Vom Start bis Netzanschluss', fr: 'Du début au raccordement', ja: '着工から連系まで', ko: '착공부터 계통 연결까지' },
    faqTitle: { de: 'Solar-Infos', fr: 'Infos solaires', ja: 'ソーラー情報', ko: '태양광 정보' },
    faqDesc: { de: 'Grundlagen & FAQ', fr: 'Bases & FAQ', ja: '基礎＆FAQ', ko: '기초·FAQ' },
    errInvalid: { de: 'Bitte gültigen Wert eingeben (über 0)', fr: 'Valeur valide svp (supérieure à 0)', ja: '有効な値を入力（0超）', ko: '유효값 입력(0 초과)' },
    greetHome: { de: 'Willkommen! Solar für „Haus oder Villa“ gewünscht? 🏠\n\nIch bewerte Ihre Ersparnis und empfehle sofort das passende System. Wo starten wir?', fr: 'Bienvenue ! Du solaire pour votre « maison ou villa » ? 🏠\n\nJ’évalue vos économies et recommande le bon système. Par où commencer ?', ja: 'ようこそ！ご自宅・ヴィラ向け太陽光にご興味？🏠\n\n節約額を査定し最適システムを即提案。どこから始める？', ko: '환영합니다! 주택·빌라용 태양광 관심 있으세요? 🏠\n\n절약액 평가하고 딱 맞는 시스템 바로 추천. 어디서 시작할까요?' },
    greetBiz: { de: 'Hallo! Für „Firmen und Hotels“ ist Solar das klügste Investment 🏨\n\nIch rechne ROI und Amortisation transparent vor. Worum geht’s?', fr: 'Bonjour ! Pour « pros et hôtels », le solaire est le meilleur investissement 🏨\n\nJe calcule ROI et retour en toute clarté. Que voulez-vous savoir ?', ja: 'こんにちは！事業・ホテル向け太陽光は最高の投資🏨\n\nROIと回収を明確に試算。何を知りたい？', ko: '안녕하세요! 사업·호텔용 태양광은 최고의 투자🏨\n\nROI·회수를 명확히 계산. 무엇이 궁금하세요?' },
    greetDefault: { de: 'Hallo! Willkommen bei TAWAN POWER ☀️\n\nIch helfe Ihnen zur lohnendsten Solarlösung.\nWählen Sie unten ein „Thema“ oder „tippen Sie Ihre Frage“.', fr: 'Bonjour ! Bienvenue chez TAWAN POWER ☀️\n\nJe vous aide vers la solution solaire la plus rentable.\nChoisissez un « sujet » ou « tapez votre question ».', ja: 'こんにちは！TAWAN POWERへようこそ☀️\n\n最もお得な太陽光をご提案。\n下の「トピック」選択か「質問入力」で。', ko: '안녕하세요! TAWAN POWER에 오신 것을 환영☀️\n\n가장 알뜰한 태양광을 찾아드립니다.\n아래 «주제» 선택 또는 «질문 입력».' },
    openerA: { de: 'Hallo!', fr: 'Bonjour !', ja: 'こんにちは！', ko: '안녕하세요!' },
    openerB: { de: 'Willkommen!', fr: 'Bienvenue !', ja: 'ようこそ！', ko: '환영합니다!' },
    helloName: { de: 'Hallo, {name}!', fr: 'Bonjour, {name} !', ja: 'こんにちは、{name}さん！', ko: '안녕하세요, {name}님!' },
    welcomeName: { de: 'Hallo, {name}! Willkommen!', fr: 'Bonjour, {name} ! Bienvenue !', ja: 'こんにちは、{name}さん！ようこそ！', ko: '안녕하세요, {name}님! 환영합니다!' },
    voiceUnsupported: { de: 'Sorry, Ihr Browser kann keine Spracheingabe. Bitte tippen 🎤', fr: 'Désolé, pas de saisie vocale ici. Tapez plutôt 🎤', ja: 'お使いのブラウザは音声入力不可。文字入力で🎤', ko: '죄송, 브라우저가 음성 입력 미지원. 타이핑으로🎤' },
    voiceErr: { de: 'Sorry, keine Spracheingabe möglich', fr: 'Désolé, pas de saisie vocale', ja: '音声入力は利用不可', ko: '음성 입력 불가' },
    listening: { de: 'Höre zu... 🎤\nLos, z. B. „Ich will Solar aufs Dach“', fr: 'J’écoute... 🎤\nAllez-y, p. ex. « je veux du solaire sur mon toit »', ja: '聞き取り中…🎤\nどうぞ、例「屋根に太陽光を」', ko: '듣는 중…🎤\n말씀하세요, 예 “지붕에 태양광”' },
    voiceNoHear: { de: 'Nicht verstanden. Tippen oder Mikro erneut 🎤', fr: 'Pas compris. Tapez ou retouchez le micro 🎤', ja: '聞き取れず。文字入力かマイク再タップ🎤', ko: '못 알아들었어요. 타이핑이나 마이크 재터치🎤' },
    quickCatalog: { de: 'Zeigen Sie mir die Details', fr: 'Montrez-moi les détails', ja: '機器の詳細を見せて', ko: '장비 상세 보여주세요' },
    quickSteps: { de: 'Wie läuft die Montage?', fr: 'Quelles sont les étapes de pose ?', ja: '設置手順は？', ko: '설치 절차는?' },
    newCustomer: { de: 'Neukunde (aus Chat)', fr: 'Nouveau client (via chat)', ja: '新規顧客（チャット経由）', ko: '신규 고객(채팅 경유)' },
    quoteFail: { de: 'Angebot gerade nicht abrufbar', fr: "Devis indisponible pour l'instant", ja: '提案を今開けません', ko: '제안을 지금 열 수 없어요' },
    surveyMsg: { de: 'Ich möchte eine Gratis-Besichtigung buchen', fr: 'Je veux une visite gratuite', ja: '無料現地調査を予約したい', ko: '무료 현장 실측 예약 원해요' },
    savedToast: { de: 'In LINE gespeichert', fr: 'Enregistré dans LINE', ja: 'LINEに保存済み', ko: 'LINE에 저장됨' },
    consultMsg: { de: 'Ich möchte tiefe Ingenieur-Beratung', fr: 'Consultation experte approfondie svp', ja: 'エンジニアの詳細相談希望', ko: '엔지니어 심층 상담 원해요' },
    assessedMsg: { de: 'Erstbewertung fertig! Hier die Übersicht:', fr: 'Pré-évaluation terminée ! Voici l’aperçu :', ja: '事前査定完了！概要はこちら：', ko: '사전 평가 완료! 개요입니다:' },
    quickConsult: { de: 'Ich will direkt mit Menschen sprechen', fr: 'Je veux parler à un humain', ja: '担当者と直接話したい', ko: '담당자와 직접 통화 원해요' },
    quickConsultLabel: { de: 'Projekt besprechen / Ingenieure treffen', fr: 'Discuter projet / voir ingénieurs', ja: '案件相談/エンジニア面談', ko: '프로젝트 상담/엔지니어 미팅' },
    inputPh: { de: 'Fragen oder zum Sprechen tippen…', fr: 'Demandez ou touchez pour parler…', ja: '質問またはタップで発話…', ko: '질문 또는 눌러서 말하기…' },
    aiFooter: { de: 'KI- & Support-Team', fr: 'Équipe IA & support', ja: 'AI＆サポート', ko: 'AI·지원팀' },
    errGeneric: { de: 'Sorry, Fehler. Nochmal versuchen', fr: 'Désolé, erreur. Réessayez', ja: 'すみません、エラー。再試行を', ko: '죄송, 오류. 다시 시도' },
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
console.log('F3C-OK');
