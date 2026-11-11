import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { Cache, Stat } from './models/Cache.js';
import mountExtra from './routes_extra.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const API = 'https://api.alquran.cloud/v1';

// Older Node versions have no built-in fetch, so fall back to node-fetch.
const doFetch = globalThis.fetch || (await import('node-fetch')).default;

const RECITERS = [
  'ar.alafasy', 'ar.abdulbasitmurattal', 'ar.husary', 'ar.minshawi',
  'ar.abdurrahmaansudais', 'ar.saoodshuraym', 'ar.mahermuaiqly',
  'ar.hudhaify', 'ar.shaatree', 'ar.ahmedajamy',
];

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// ---- Cache: memory first, then MongoDB if connected ----
const memory = new Map();
let dbReady = false;

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => { dbReady = true; console.log('MongoDB connected'); })
    .catch((e) => console.warn('MongoDB not connected, using memory cache only:', e.message));
}

// One request to the Quran API with timeout and retries
async function upstream(urlPath, tries = 3) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await doFetch(`${API}${urlPath}`, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${urlPath}`);
      const j = await r.json();
      if (j.code !== 200) throw new Error(`API code ${j.code} for ${urlPath}`);
      return j.data;
    } catch (e) {
      clearTimeout(timer);
      last = e.name === 'AbortError' ? new Error(`Timeout for ${urlPath}`) : e;
      console.warn(`[upstream] try ${i + 1}/${tries} failed: ${last.message}`);
      await new Promise((res) => setTimeout(res, 600 * (i + 1)));
    }
  }
  throw last;
}

// loader returns { data, complete }. Only complete results are cached.
async function cached(key, loader) {
  if (memory.has(key)) return memory.get(key);
  if (dbReady) {
    const hit = await Cache.findOne({ key }).lean().catch(() => null);
    if (hit) { memory.set(key, hit.data); return hit.data; }
  }
  const { data, complete } = await loader();
  if (complete) {
    memory.set(key, data);
    if (dbReady) Cache.updateOne({ key }, { key, data, createdAt: new Date() }, { upsert: true }).catch(() => {});
  }
  return data;
}

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error('[api error]', e.message);
    res.status(502).json({ code: 'load_failed', error: 'Could not load the data.', detail: e.message });
  });

const bad = (res, msg) => res.status(400).json({ code: 'bad_request', error: msg });

// ---- Routes ----
app.get('/api/health', wrap(async (_req, res) => {
  const out = { node: process.version, database: dbReady, upstream: 'ok' };
  try { await upstream('/surah/1/ar.alafasy', 1); } catch (e) { out.upstream = e.message; }
  res.json(out);
}));

app.get('/api/surahs', wrap(async (_req, res) => {
  const data = await cached('surahs', async () => ({ data: await upstream('/surah'), complete: true }));
  res.json(data);
}));

app.get('/api/surah/:n/:reciter', wrap(async (req, res) => {
  const n = Number(req.params.n);
  const { reciter } = req.params;
  if (!Number.isInteger(n) || n < 1 || n > 114 || !RECITERS.includes(reciter)) return bad(res, 'Invalid surah or reciter');

  const out = await cached(`surah2:${n}:${reciter}`, async () => {
    const ids = ['quran-uthmani', 'ur.jalandhry', 'en.sahih', reciter];
    const results = await Promise.allSettled(ids.map((id) => upstream(`/surah/${n}/${id}`)));
    const [ar, ur, en, au] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
    if (!ar) throw new Error(results[0].reason?.message || 'Quran text unavailable');
    const complete = Boolean(ur && en && au);
    return {
      complete,
      data: {
        number: ar.number,
        name: ar.name,
        englishName: ar.englishName,
        englishNameTranslation: ar.englishNameTranslation,
        revelationType: ar.revelationType,
        numberOfAyahs: ar.numberOfAyahs,
        hasAudio: Boolean(au),
        ayahs: ar.ayahs.map((a, i) => ({
          n: a.numberInSurah,
          text: a.text,
          urdu: ur?.ayahs?.[i]?.text || '',
          english: en?.ayahs?.[i]?.text || '',
          audio: au?.ayahs?.[i]?.audio || null,
        })),
      },
    };
  });
  res.json(out);
}));

app.get('/api/ayat-ul-kursi/:reciter', wrap(async (req, res) => {
  const { reciter } = req.params;
  if (!RECITERS.includes(reciter)) return bad(res, 'Invalid reciter');
  const out = await cached(`kursi2:${reciter}`, async () => {
    const ids = ['quran-uthmani', 'ur.jalandhry', 'en.sahih', reciter];
    const results = await Promise.allSettled(ids.map((id) => upstream(`/ayah/2:255/${id}`)));
    const [ar, ur, en, au] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));
    if (!ar) throw new Error(results[0].reason?.message || 'Quran text unavailable');
    return {
      complete: Boolean(ur && en && au),
      data: { arabic: ar.text, urdu: ur?.text || '', english: en?.text || '', audio: au?.audio || null },
    };
  });
  res.json(out);
}));

app.post('/api/visit', wrap(async (_req, res) => {
  if (!dbReady) return res.json({ count: null });
  const s = await Stat.findOneAndUpdate({ name: 'visits' }, { $inc: { count: 1 } }, { upsert: true, new: true });
  res.json({ count: s.count });
}));

mountExtra(app, () => dbReady);

// ---- Serve the React build (production) ----
const dist = path.join(__dirname, '../client/dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ code: 'generic', error: 'Server error.' });
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}  (Node ${process.version})`));
