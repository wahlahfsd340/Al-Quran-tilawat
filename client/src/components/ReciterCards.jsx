import { RECITERS } from '../data.js';
import { useReciter } from '../ReciterContext.jsx';
import { useLang } from '../i18n.jsx';

export default function ReciterCards() {
  const { reciter, setId } = useReciter();
  const { t, lang } = useLang();
  return (
    <section className="reciters" aria-labelledby="reciters-title">
      <h2 id="reciters-title" className="section-title">{t('reciters_title')}</h2>
      <p className="section-sub">{t('reciters_sub')}</p>
      <ul className="reciter-grid">
        {RECITERS.map((r) => {
          const on = r.id === reciter.id;
          return (
            <li key={r.id}>
              <button className={`reciter-card ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setId(r.id)}>
                <span className="r-name">{r.name[lang]}</span>
                <span className="r-place">{r.place[lang]}</span>
                {on && <span className="r-badge">{t('selected')}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
