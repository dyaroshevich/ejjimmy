// F3: sofin, sigenergy, calc, line, chat -> de/fr/ja/ko
// Usage: node scripts/i18n-f3.mjs
import fs from 'node:fs';

const T = {
  sofin: {
    badge: { de: 'SOFIN Investitions-Ökosystem', fr: "Écosystème d'investissement SOFIN", ja: 'SOFIN投資エコシステム', ko: 'SOFIN 투자 생태계' },
    titleA: { de: 'In Solar investieren', fr: 'Investir dans le solaire', ja: 'ソーラーに投資', ko: '태양광에 투자' },
    titleB: { de: 'mit Energie verdienen', fr: "gagner grâce à l'énergie", ja: 'エネルギーで稼ぐ', ko: '에너지로 수익' },
    sub: { de: 'Sichere, stabile Clean-Energy-Investments mit nachhaltiger Rendite', fr: 'Investissement propre, sûr et stable, à rendement durable', ja: '安全・安定なクリーンエネルギー投資で持続的リターン', ko: '안전·안정적인 청정에너지 투자로 지속 수익' },
    mechTitle: { de: '10/90/85 Kapitalschutz', fr: 'Protection du capital 10/90/85', ja: '10/90/85資金保護', ko: '10/90/85 자본 보호' },
    mechSub: { de: 'Minimiert Risiko, stärkt Vertrauen', fr: 'Pensé pour réduire le risque et rassurer', ja: 'リスク低減・投資家安心の設計', ko: '리스크를 낮추고 신뢰를 높이는 설계' },
    ownerLabel: { de: 'Eigentümeranteil', fr: 'Part du propriétaire', ja: 'オーナー持分', ko: '소유자 지분' },
    ownerDesc: { de: 'Startkapital des Projekteigentümers', fr: 'Capital initial du porteur de projet', ja: '事業オーナーの初期資本', ko: '사업 소유자의 초기 자본' },
    investLabel: { de: 'Investition', fr: 'Investissement', ja: '投資', ko: '투자' },
    protectSub: { de: 'Sachwert-gesicherter Kapitalschutz', fr: 'Capital garanti par des actifs', ja: '資産担保の資金保護', ko: '자산 담보 자본 보호' },
    safeBadge: { de: 'Sicher & stabil', fr: 'Sûr et stable', ja: '安全・安定', ko: '안전·안정' },
    assetLabel: { de: 'Sachwerte', fr: 'Actifs', ja: '資産', ko: '자산' },
    assetDesc: { de: 'Besichert durch Tier-1-Module in Ihrem Eigentum', fr: 'Garanti par des panneaux Tier 1 que vous possédez', ja: 'お客様所有のTier1パネルが担保', ko: '직접 소유한 Tier 1 패널이 담보' },
    reserveLabel: { de: 'Reserve', fr: 'Réserve', ja: '予備金', ko: '예비금' },
    reserveDesc: { de: 'Notfallreserve für Risiko und Liquidität', fr: 'Réserve d’urgence pour risque et liquidité', ja: 'リスク・流動性のための緊急予備金', ko: '리스크·유동성 대비 긴급 예비금' },
    b1t: { de: 'Portfolio verfolgen', fr: 'Suivez votre portefeuille', ja: 'ポートフォリオ追跡', ko: '포트폴리오 추적' },
    b1d: { de: 'Renditen in Echtzeit im Dashboard', fr: 'Rendements en temps réel dans votre tableau de bord', ja: '個人ダッシュボードでリアルタイム収益', ko: '개인 대시보드에서 실시간 수익' },
    b2t: { de: 'Projekte überwachen', fr: 'Suivez les projets', ja: '案件モニター', ko: '프로젝트 모니터링' },
    b2d: { de: 'Transparente Montage- und Zahlungstracking', fr: 'Suivi transparent pose et paiements', ja: '設置・支払いを透明追跡', ko: '설치·결제 투명 추적' },
    b3t: { de: 'Höchste Sicherheit', fr: 'Sécurité maximale', ja: '最高セキュリティ', ko: '최고 보안' },
    b3d: { de: 'Sicherheit nach Weltstandard für alle Daten', fr: 'Sécurité aux standards mondiaux pour vos données', ja: '世界標準のセキュリティで全データを保護', ko: '세계 표준 보안으로 데이터 보호' },
    stdLabel: { de: 'Weltstandard', fr: 'Standard mondial', ja: '世界標準', ko: '세계 표준' },
    cta: { de: 'Sicher investieren', fr: 'Investir en sécurité', ja: '安全に投資開始', ko: '안전하게 투자 시작' },
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
console.log('F3A-OK');
