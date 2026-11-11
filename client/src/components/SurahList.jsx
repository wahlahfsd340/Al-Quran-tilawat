import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSurahs } from '../useSurahs.js';
import { useLang } from '../i18n.jsx';
import ErrorBox from './ErrorBox.jsx';

const PER_PAGE = 30;

export default function SurahList() {
  const { t, n, lang } = useLang();
  const { surahs, error, retry } = useSurahs();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const topRef = useRef(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return surahs;
    return surahs.filter((x) =>
      String(x.number) === s ||
      x.englishName.toLowerCase().includes(s) ||
      x.englishNameTranslation.toLowerCase().includes(s) ||
      x.name.includes(q.trim())
    );
  }, [surahs, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const go = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="surahs" ref={topRef} aria-labelledby="surahs-title">
      <h2 id="surahs-title" className="section-title">{t('surahs_title')}</h2>
      <p className="section-sub">{t('surahs_sub')}</p>

      <input
        className="search"
        type="search"
        placeholder={t('search_ph')}
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1); }}
        aria-label={t('search_label')}
      />

      <ErrorBox error={error} onRetry={retry} />
      {!surahs.length && !error && <p className="loading">{t('loading')}</p>}
      {surahs.length > 0 && filtered.length === 0 && <p className="loading">{t('none_found')}</p>}

      <ul className="grid">
        {slice.map((s) => (
          <li key={s.number}>
            <Link to={`/surah/${s.number}`} className="surah-card">
              <span className="num"><b>{n(s.number)}</b></span>
              <span className="names">
                {lang === 'ur' ? (
                  <span className="ar-main" lang="ar">{s.name}</span>
                ) : (
                  <>
                    <span className="en">{s.englishName}</span>
                    <span className="meaning">{s.englishNameTranslation}</span>
                  </>
                )}
                <span className="meta">{t('verses', { n: n(s.numberOfAyahs) })} · {s.revelationType === 'Meccan' ? t('makki') : t('madani')}</span>
              </span>
              {lang !== 'ur' && <span className="ar" lang="ar">{s.name}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className="pager" aria-label="Pages">
          <button className="btn" disabled={current === 1} onClick={() => go(current - 1)}>{t('prev_page')}</button>
          <span className="pager-nums">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pnum ${p === current ? 'on' : ''}`}
                aria-current={p === current ? 'page' : undefined}
                onClick={() => go(p)}
              >{n(p)}</button>
            ))}
          </span>
          <button className="btn" disabled={current === pages} onClick={() => go(current + 1)}>{t('next_page')}</button>
        </nav>
      )}
      <p className="hint center">{t('page_of', { a: n(current), b: n(pages) })}</p>
    </section>
  );
}
