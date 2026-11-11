import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider, useLang } from './i18n.jsx';
import { ReciterProvider } from './ReciterContext.jsx';
import Ambient from './components/Ambient.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import SurahReader from './components/SurahReader.jsx';
import AyatulKursi from './components/AyatulKursi.jsx';
import Footer from './components/Footer.jsx';

function Shell() {
  const { t } = useLang();
  useEffect(() => { document.title = t('brand'); }, [t]);
  return (
    <>
      <Ambient />
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surah/:n" element={<SurahReader />} />
          <Route path="/ayat-ul-kursi" element={<AyatulKursi />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <ReciterProvider>
        <Shell />
      </ReciterProvider>
    </LangProvider>
  );
}
