import { RECITERS } from '../data.js';
import { useReciter } from '../ReciterContext.jsx';
import { useLang } from '../i18n.jsx';

export default function ReciterSelect() {
  const { reciter, setId } = useReciter();
  const { t, lang } = useLang();
  return (
    <div className="reciter">
      <label htmlFor="reciter-select">{t('reciter_pick')}</label>
      <select id="reciter-select" value={reciter.id} onChange={(e) => setId(e.target.value)}>
        {RECITERS.map((r) => (
          <option key={r.id} value={r.id}>{r.name[lang]}</option>
        ))}
      </select>
      <p className="reciter-now">{t('reciter_label')}: <strong>{reciter.name}</strong> <span>({reciter.place})</span></p>
    </div>
  );
}
