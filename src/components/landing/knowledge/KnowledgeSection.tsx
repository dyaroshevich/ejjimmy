import { getTranslations } from 'next-intl/server';
import KnowledgeTabs from './KnowledgeTabs';

export default async function KnowledgeSection() {
  const t = await getTranslations('knowledge');

  return (
    <section className="block" id="knowledge">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h2 id="knowledge-title">
            <span>{t('titleA')}</span><span className="grad">{t('titleB')}</span>
          </h2>
        </div>
        <KnowledgeTabs labelledBy="knowledge-title" />
      </div>
    </section>
  );
}
