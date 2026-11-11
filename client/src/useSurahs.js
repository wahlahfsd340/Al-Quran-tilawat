import { useEffect, useState } from 'react';
import { getSurahs } from './api.js';

export function useSurahs() {
  const [surahs, setSurahs] = useState([]);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    getSurahs()
      .then((d) => { if (!off) { setSurahs(d); setError(null); } })
      .catch((e) => { if (!off) setError(e); });
    return () => { off = true; };
  }, [tick]);

  return { surahs, error, retry: () => { setError(null); setTick((x) => x + 1); } };
}
