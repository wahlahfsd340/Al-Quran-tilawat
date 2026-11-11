import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from './models/User.js';
import { Message } from './models/Message.js';

const OWNER = process.env.OWNER_EMAIL || 'wahlahfsd340@gmail.com';
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mailer =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      })
    : null;

async function notifyOwner(subject, text, replyTo) {
  if (!mailer) return false;
  try {
    await mailer.sendMail({ from: `"Quran Website" <${process.env.GMAIL_USER}>`, to: OWNER, subject, text, replyTo });
    return true;
  } catch (e) {
    console.error('Email failed:', e.message);
    return false;
  }
}

const fail = (res, status, code, error) => res.status(status).json({ code, error });

const hits = new Map();
const limit = (max, ms) => (req, res, next) => {
  const k = `${req.ip}:${req.path}`;
  const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < ms);
  if (arr.length >= max) return fail(res, 429, 'rate_limited', 'Too many attempts.');
  arr.push(now);
  hits.set(k, arr);
  next();
};

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

export default function mountExtra(app, isDbReady) {
  const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  const post = (p, ...fns) => app.post(p, ...fns.map(h));
  const get = (p, ...fns) => app.get(p, ...fns.map(h));

  const needDb = (_req, res, next) => (isDbReady() ? next() : fail(res, 503, 'db_down', 'Database not connected.'));
  const needSecret = (_req, res, next) => (process.env.JWT_SECRET ? next() : fail(res, 503, 'no_secret', 'JWT_SECRET missing.'));

  post('/api/auth/register', limit(8, 60 * 60 * 1000), needDb, needSecret, async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 60) return fail(res, 400, 'name_invalid', 'Invalid name.');
    if (!emailRe.test(email)) return fail(res, 400, 'email_invalid', 'Invalid email.');
    if (password.length < 8) return fail(res, 400, 'pass_short', 'Password too short.');
    if (await User.findOne({ email })) return fail(res, 409, 'email_exists', 'Email already registered.');
    const user = await User.create({
      name, email, passwordHash: await bcrypt.hash(password, 11), loginCount: 1, lastLoginAt: new Date(),
    });
    notifyOwner('New user registered', `Name: ${name}\nEmail: ${email}\nTime: ${new Date().toISOString()}`);
    res.json({ token: sign(user), user: publicUser(user) });
  });

  post('/api/auth/login', limit(15, 15 * 60 * 1000), needDb, needSecret, async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return fail(res, 401, 'bad_credentials', 'Incorrect email or password.');
    }
    user.loginCount += 1;
    user.lastLoginAt = new Date();
    await user.save();
    if (process.env.NOTIFY_ON_LOGIN === 'true') {
      notifyOwner('A user logged in', `Name: ${user.name}\nEmail: ${user.email}\nTime: ${user.lastLoginAt.toISOString()}`);
    }
    res.json({ token: sign(user), user: publicUser(user) });
  });

  get('/api/auth/me', needDb, needSecret, async (req, res) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id);
      if (!user) return fail(res, 401, 'session', 'Please log in again.');
      res.json({ user: publicUser(user) });
    } catch {
      fail(res, 401, 'session', 'Please log in again.');
    }
  });

  post('/api/contact', limit(5, 60 * 60 * 1000), async (req, res) => {
    if (req.body.website) return res.json({ ok: true }); // honeypot for bots
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();
    if (name.length < 2 || name.length > 60) return fail(res, 400, 'name_invalid', 'Invalid name.');
    if (!emailRe.test(email)) return fail(res, 400, 'email_invalid', 'Invalid email.');
    if (message.length < 3 || message.length > 2000) return fail(res, 400, 'message_invalid', 'Invalid message.');

    const emailed = await notifyOwner(`New website message from ${name}`, `Name: ${name}\nEmail: ${email}\n\n${message}`, email);
    let saved = false;
    if (isDbReady()) {
      try { await Message.create({ name, email, message, emailed }); saved = true; } catch (e) { console.error(e.message); }
    }
    if (!emailed && !saved) return fail(res, 503, 'send_failed', 'Message could not be sent.');
    res.json({ ok: true });
  });

  const admin = (req, res, next) => {
    const key = String(req.headers['x-admin-key'] || '');
    const real = process.env.ADMIN_KEY || '';
    const ok = real.length >= 12 && key.length === real.length && crypto.timingSafeEqual(Buffer.from(key), Buffer.from(real));
    return ok ? next() : fail(res, 401, 'admin_bad', 'Incorrect admin key.');
  };

  get('/api/admin/users', limit(30, 15 * 60 * 1000), admin, needDb, async (_req, res) => {
    res.json(await User.find({}, 'name email loginCount lastLoginAt createdAt').sort({ lastLoginAt: -1 }).lean());
  });

  get('/api/admin/messages', limit(30, 15 * 60 * 1000), admin, needDb, async (_req, res) => {
    res.json(await Message.find({}).sort({ createdAt: -1 }).limit(200).lean());
  });
}
