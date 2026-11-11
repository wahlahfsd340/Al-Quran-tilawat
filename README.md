# Quran Pak Tilawat

A frontend-only React and Vite app. Surah text, translations, and recitations load
directly from the public [Al Quran Cloud API](https://alquran.cloud/api); no app
server, database, or environment secrets are required.

## Run locally

1. Install Node.js 18 or newer.
2. From the project folder run `npm install --prefix client`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite (usually http://localhost:5173).

## Deploy on Netlify

The included `netlify.toml` configures the `client` folder as the site base,
builds with `npm run build`, and publishes `client/dist`.

1. Push this project to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and select
   the GitHub repository.
3. Deploy with the detected settings from `netlify.toml`; no backend service or
   environment variables are needed.

The browser needs an internet connection to retrieve Quran content from the
public API. If data cannot be reached, use the on-page retry button and check
the connection.

## Scope

The website's Quran reading, reciter selection, translations, and audio work
without the old Express/MongoDB server. Login, user management, message storage,
and the owner panel are not part of this static frontend.

Before sharing the site publicly, ask a qualified qari or scholar to review the
Arabic text and recitations.
