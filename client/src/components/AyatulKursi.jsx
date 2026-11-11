import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { KURSI_LINES, baseLetters } from '../data.js';
import { useReciter } from '../ReciterContext.jsx';
import { useLang } from '../i18n.jsx';
import { getAyatulKursi } from '../api.js';
import ReciterSelect from './ReciterSelect.jsx';
import ErrorBox from './ErrorBox.jsx';

export default function AyatulKursi() {
  const { reciter } = useReciter();
  const { t, lang } = useLang();
  const audioRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setInfo(null); setError(null); setActive(-1); setPlaying(false);
    getAyatulKursi(reciter.id)
      .then((d) => { if (!off) setInfo(d); })
      .catch((e) => { if (!off) setError(e); });
    return () => { off = true; audioRef.current?.pause(); };
  }, [reciter.id, tick]);

  // If our line-by-line text ever differs from the official text, show the official text instead.
  const verified = info ? baseLetters(KURSI_LINES.join('')) === baseLetters(info.arabic) : false;
  const lines = useMemo(() => (info ? (verified ? KURSI_LINES : [info.arabic]) : []), [info, verified]);

  const cumulative = useMemo(() => {
    const w = lines.map((l) => baseLetters(l).length);
    const total = w.reduce((a, b) => a + b, 0) || 1;
    let run = 0;
    return w.map((x) => (run += x) / total);
  }, [lines]);

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const idx = cumulative.findIndex((c) => a.currentTime / a.duration <= c);
    setActive(idx === -1 ? lines.length - 1 : idx);
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setError({ code: 'audio' })); else a.pause();
  };

  const restart = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0; setActive(0);
    a.play().catch(() => {});
  };

  const translation = info ? (lang === 'ur' ? info.urdu : info.english) : '';

  return (
    <section className="panel kursi" aria-labelledby="kursi-title">
      <Link to="/" className="back">{t('back_home')}</Link>
      <h1 id="kursi-title" className="section-title" lang="ar">آيَةُ ٱلْكُرْسِيِّ</h1>
      <p className="section-sub">{t('kursi_title')} · {t('kursi_sub')}</p>

      <ReciterSelect />

      <div className="kursi-card">
        <ErrorBox error={error} onRetry={() => setTick((x) => x + 1)} />
        {!info && !error && <p className="loading">{t('loading')}</p>}
        {info && (
          <>
            <div className="kursi-lines" lang="ar" dir="rtl">
              {lines.map((l, i) => (
                <p key={i} className={`kursi-line ${i === active ? 'on' : ''}`}>{l}</p>
              ))}
            </div>
            {translation && (
              <p className="trans" lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'}>{translation}</p>
            )}
            {info.audio ? (
              <>
                <audio
                  ref={audioRef}
                  src={info.audio}
                  preload="auto"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={onTime}
                  onEnded={() => { setPlaying(false); setActive(-1); }}
                />
                <div className="btn-row">
                  <button className="btn primary" onClick={toggle}>{playing ? t('pause') : t('kursi_play')}</button>
                  <button className="btn" onClick={restart}>{t('kursi_restart')}</button>
                </div>
                <p className="hint">{t('kursi_hint')}</p>
              </>
            ) : (
              <p className="error">{t('no_audio')}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
