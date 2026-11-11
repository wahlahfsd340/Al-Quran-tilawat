import { BISMILLAH } from '../data.js';
import { useLang } from '../i18n.jsx';
import ReciterCards from './ReciterCards.jsx';
import VersePicker from './VersePicker.jsx';
import SurahList from './SurahList.jsx';

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <header className="hero">
        <p className="bismillah" lang="ar" dir="rtl">{BISMILLAH}</p>
        <h1>{t('hero_title')}</h1>
        <p className="hero-sub">{t('hero_sub')}</p>
      </header>
      <ReciterCards />
      <VersePicker />
      <SurahList />
    </>
  );
}
