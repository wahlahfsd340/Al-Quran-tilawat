import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSurahs } from '../useSurahs.js';
import { useLang } from '../i18n.jsx';

export default function VersePicker() {
  const { t, n, lang } = useLang();
  const { surahs } = useSurahs();
  const nav = useNavigate();
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const current = surahs.find((s) => s.number === surah);
  const count = current ? current.numberOfAyahs : 7;

  const go = (e) => {
    e.preventDefault();
    nav(`/surah/${surah}?ayah=${Math.min(ayah, count)}`);
  };

  return (
    <section className="verses" aria-labelledby="verses-title">
      <h2 id="verses-title" className="section-title">{t('verse_title')}</h2>
      <p className="section-sub">{t('verse_sub')}</p>

      <Link to="/ayat-ul-kursi" className="kursi-link">
        <span className="kl-title" lang="ar">آيَةُ ٱلْكُرْسِيِّ</span>
        <span className="kl-name">{t('kursi_title')}</span>
        <span className="kl-sub">{t('kursi_sub')}</span>
      </Link>

      <p className="or">{t('or_choose')}</p>
      <form className="picker" onSubmit={go}>
        <label>{t('surah_label')}
          <select value={surah} onChange={(e) => { setSurah(Number(e.target.value)); setAyah(1); }} disabled={!surahs.length}>
            {surahs.length === 0 && <option value={1}>{t('loading')}</option>}
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>{n(s.number)}. {lang === 'ur' ? s.name : s.englishName}</option>
            ))}
          </select>
        </label>
        <label>{t('ayah_label')}
          <select value={Math.min(ayah, count)} onChange={(e) => setAyah(Number(e.target.value))}>
            {Array.from({ length: count }, (_, i) => i + 1).map((a) => (
              <option key={a} value={a}>{n(a)}</option>
            ))}
          </select>
        </label>
        <button className="btn primary">{t('go')}</button>
      </form>
    </section>
  );
}
