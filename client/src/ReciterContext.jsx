import { createContext, useContext, useState, useEffect } from 'react';
import { RECITERS } from './data.js';
import { useLang } from './i18n.jsx';

const Ctx = createContext(null);

export function ReciterProvider({ children }) {
  const { lang } = useLang();
  const [id, setId] = useState(() => {
    try { return localStorage.getItem('reciter') || RECITERS[0].id; } catch { return RECITERS[0].id; }
  });
  useEffect(() => { try { localStorage.setItem('reciter', id); } catch { /* ignore */ } }, [id]);
  const found = RECITERS.find((r) => r.id === id) || RECITERS[0];
  const reciter = { id: found.id, name: found.name[lang], place: found.place[lang] };
  return <Ctx.Provider value={{ reciter, setId }}>{children}</Ctx.Provider>;
}

export const useReciter = () => useContext(Ctx);
