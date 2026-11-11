import { useLang } from '../i18n.jsx';

export default function ErrorBox({ error, onRetry }) {
  const { t, tErr } = useLang();
  if (!error) return null;
  const showDetail = error.detail && ['load_failed', 'generic'].includes(error.code);
  return (
    <div className="error" role="alert">
      <p>{tErr(error)}</p>
      {showDetail && <p className="detail" dir="ltr">{error.detail}</p>}
      {onRetry && <button className="btn small" onClick={onRetry}>{t('retry')}</button>}
    </div>
  );
}
