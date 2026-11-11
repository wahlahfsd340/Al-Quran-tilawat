import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BISMILLAH, arabicDigits } from '../data.js';
import { useReciter } from '../ReciterContext.jsx';
import { useLang } from '../i18n.jsx';
import { getSurah } from '../api.js';
import ReciterSelect from './ReciterSelect.jsx';
import ErrorBox from './ErrorBox.jsx';

// The first verse of most surahs starts with the Bismillah (4 words). Show it separately.
function verseText(surahNo, ayah) {
  if (ayah.n !== 1 || surahNo === 1 || surahNo === 9) return ayah.text;
  return ayah.text.trim().split(/\s+/).slice(4).join(' ');
}

export default function SurahReader() {
  const { n: surahParam } = useParams();
  const surahNo = Number(surahParam);
  const [search] = useSearchParams();
  const ayahParam = Number(search.get('ayah')) || 0;
  const { reciter } = useReciter();
  const { t, n, lang } = useLang();
  const audioRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState('idle'); // idle | audio | text | both
  const [idx, setIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setData(null); setError(null); setNotice(''); setMode('idle'); setIdx(-1); setPlaying(false);
    window.scrollTo({ top: 0 });
    getSurah(surahNo, reciter.id)
      .then((d) => {
        if (off) return;
        setData(d);
        if (ayahParam >= 1 && ayahParam <= d.numberOfAyahs) { setMode('both'); setIdx(ayahParam - 1); }
      })
      .catch((e) => { if (!off) setError(e); });
    return () => { off = true; audioRef.current?.pause(); };
  }, [surahNo, reciter.id, ayahParam, tick]);

  const playAt = (i) => {
    if (!data) return;
    if (i >= data.ayahs.length) { setPlaying(false); setIdx(-1); return; }
    const a = audioRef.current;
    if (!data.ayahs[i].audio) { setNotice(t('no_audio')); return; }
    setNotice('');
    setIdx(i);
    a.src = data.ayahs[i].audio;
    a.play().catch(() => setNotice(t('err_audio')));
  };

  const start = (m) => {
    setNotice('');
    if (m === 'text') { audioRef.current?.pause(); setMode('text'); setIdx(-1); return; }
    if (!data.hasAudio) { setMode(m === 'both' ? 'text' : 'idle'); setNotice(t('no_audio')); return; }
    setMode(m);
    playAt(idx >= 0 ? idx : 0);
  };

  const pauseResume = () => {
    const a = audioRef.current;
    if (!a.src || idx < 0) return playAt(Math.max(idx, 0));
    if (a.paused) a.play().catch(() => setNotice(t('err_audio'))); else a.pause();
  };

  useEffect(() => {
    if (mode === 'both' && idx >= 0) {
      document.getElementById(`ayah-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [idx, mode]);

  const showText = mode === 'text' || mode === 'both';
  const audioOn = mode === 'audio' || mode === 'both';

  return (
    <article className="reader">
      <Link to="/" className="back">{t('back_home')}</Link>
      <ErrorBox error={error} onRetry={() => setTick((x) => x + 1)} />
      {!data && !error && <p className="loading">{t('loading')}</p>}

      {data && (
        <>
          <header className="reader-head">
            <h1 className="surah-ar" lang="ar">{data.name}</h1>
            {lang === 'en' && (
              <p className="surah-en">{data.number}. {data.englishName} <span>({data.englishNameTranslation})</span></p>
            )}
            <p className="meta">
              {t('verses', { n: n(data.numberOfAyahs) })} · {data.revelationType === 'Meccan' ? t('makki') : t('madani')}
            </p>
          </header>

          <ReciterSelect />

          <div className="mode-row" role="group">
            <button className={`btn ${mode === 'audio' ? 'primary' : ''}`} onClick={() => start('audio')}>{t('mode_listen')}</button>
            <button className={`btn ${mode === 'text' ? 'primary' : ''}`} onClick={() => start('text')}>{t('mode_read')}</button>
            <button className={`btn ${mode === 'both' ? 'primary' : ''}`} onClick={() => start('both')}>{t('mode_both')}</button>
          </div>

          {notice && <p className="error">{notice}</p>}

          {audioOn && (
            <div className="player">
              <button className="btn" onClick={() => playAt(Math.max(0, idx - 1))} disabled={idx <= 0}>{t('prev_verse')}</button>
              <button className="btn primary" onClick={pauseResume}>{playing ? t('pause') : t('play')}</button>
              <button className="btn" onClick={() => playAt(idx + 1)} disabled={idx < 0 || idx >= data.ayahs.length - 1}>{t('next_verse')}</button>
              <span className="now">{idx >= 0 ? t('verse_n', { a: n(data.ayahs[idx].n), b: n(data.numberOfAyahs) }) : ''}</span>
            </div>
          )}

          <audio
            ref={audioRef}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => playAt(idx + 1)}
          />

          {mode === 'idle' && !notice && <p className="hint center">{t('hint_idle')}</p>}
          {mode === 'audio' && <p className="hint center">{t('hint_listen')}</p>}

          {showText && (
            <div className="ayahs">
              {data.number !== 1 && data.number !== 9 && (
                <p className="bismillah small" lang="ar" dir="rtl">{BISMILLAH}</p>
              )}
              {data.ayahs.map((a, i) => (
                <section
                  key={a.n}
                  id={`ayah-${i}`}
                  className={`ayah ${mode === 'both' && i === idx ? 'on' : ''}`}
                  onClick={() => mode === 'both' && data.hasAudio && playAt(i)}
                >
                  <p className="ayah-ar" lang="ar" dir="rtl">
                    {verseText(data.number, a)} <span className="end">﴿{arabicDigits(a.n)}﴾</span>
                  </p>
                  {(lang === 'ur' ? a.urdu : a.english) && (
                    <p className="trans" lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'}>{lang === 'ur' ? a.urdu : a.english}</p>
                  )}
                </section>
              ))}
            </div>
          )}

          <nav className="surah-nav">
            {surahNo > 1 ? <Link className="btn" to={`/surah/${surahNo - 1}`}>{t('prev_surah')}</Link> : <span />}
            {surahNo < 114 ? <Link className="btn" to={`/surah/${surahNo + 1}`}>{t('next_surah')}</Link> : <span />}
          </nav>
        </>
      )}
    </article>
  );
}
