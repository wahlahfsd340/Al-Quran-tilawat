import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';

export default function Header() {
  const { t, lang, toggle } = useLang();
  return (
    <nav className="topbar" aria-label="Main">
      <Link to="/" className="brand">{t('brand')}</Link>
      <span className="topbar-right">
        <button className="btn small lang" onClick={toggle} lang={lang === 'en' ? 'ur' : 'en'}>
          {lang === 'en' ? 'اردو' : 'English'}
        </button>
      </span>
    </nav>
  );
}
