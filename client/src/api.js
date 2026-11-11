const API_BASE = (import.meta.env.VITE_QURAN_API_BASE || 'https://api.alquran.cloud/v1').replace(/\/+$/, '');
const editions = new Map();

export class ApiError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

async function loadEdition(path) {
  const cached = editions.get(path);
  if (cached) return cached;

  const request = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new ApiError('load_failed', `Quran API returned HTTP ${response.status} for ${path}`);
      }

      const payload = await response.json();
      if (payload.code !== 200 || payload.data == null) {
        throw new ApiError('load_failed', `Quran API returned an invalid response for ${path}`);
      }
      return payload.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const detail = error.name === 'AbortError'
        ? `Quran API request timed out for ${path}`
        : error.message;
      throw new ApiError('network', detail);
    } finally {
      window.clearTimeout(timeout);
    }
  })();

  editions.set(path, request);
  try {
    return await request;
  } catch (error) {
    editions.delete(path);
    throw error;
  }
}

function optional(promise) {
  return promise.then((data) => data, () => null);
}

export function getSurahs() {
  return loadEdition('/surah');
}

export async function getSurah(number, reciter) {
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    throw new ApiError('load_failed', `Invalid surah number: ${number}`);
  }

  const [arabic, urdu, english, audio] = await Promise.all([
    loadEdition(`/surah/${number}/quran-uthmani`),
    optional(loadEdition(`/surah/${number}/ur.jalandhry`)),
    optional(loadEdition(`/surah/${number}/en.sahih`)),
    optional(loadEdition(`/surah/${number}/${encodeURIComponent(reciter)}`)),
  ]);
  if (!Array.isArray(arabic.ayahs)) {
    throw new ApiError('load_failed', 'The Quran API did not return Arabic verses.');
  }

  return {
    number: arabic.number,
    name: arabic.name,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    revelationType: arabic.revelationType,
    numberOfAyahs: arabic.numberOfAyahs,
    hasAudio: Boolean(audio),
    ayahs: arabic.ayahs.map((ayah) => {
      const matchingAyah = (edition) => edition?.ayahs?.find(
        (item) => item.numberInSurah === ayah.numberInSurah,
      );
      return {
        n: ayah.numberInSurah,
        text: ayah.text,
        urdu: matchingAyah(urdu)?.text || '',
        english: matchingAyah(english)?.text || '',
        audio: matchingAyah(audio)?.audio || null,
      };
    }),
  };
}

export async function getAyatulKursi(reciter) {
  const [arabic, urdu, english, audio] = await Promise.all([
    loadEdition('/ayah/2:255/quran-uthmani'),
    optional(loadEdition('/ayah/2:255/ur.jalandhry')),
    optional(loadEdition('/ayah/2:255/en.sahih')),
    optional(loadEdition(`/ayah/2:255/${encodeURIComponent(reciter)}`)),
  ]);

  if (!arabic.text) {
    throw new ApiError('load_failed', 'The Quran API did not return Ayat-ul-Kursi.');
  }
  return {
    arabic: arabic.text,
    urdu: urdu?.text || '',
    english: english?.text || '',
    audio: audio?.audio || null,
  };
}
