# 🀄 Mandarin Flashcards

A sleek, mobile-friendly Mandarin flashcard app with **CSV bulk import**, 3D card
flips, Mandarin text-to-speech, and **zero-cost local storage** — no database, no
account. Deployable free on Vercel.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
PapaParse · Lucide Icons**.

---

## ✨ Features

- **3D flip flashcards** — Hanzi (plus an image if you add one) on the front,
  Pinyin / English on the back.
- **Spaced repetition** — a 5-box Leitner scheduler. "Got It" moves a card up a
  box (1 → 3 → 7 → 21 days); "Needs Review" drops it to box 1 and brings it back
  later in the same session. **Due now** shows only what's ready to review.
- **Mandarin TTS** — tap the speaker to hear `zh-CN` pronunciation (Web Speech API).
- **CSV bulk import** — drag-and-drop a `.csv`, auto-detected column mapping, and a
  live preview before you commit. Numbered pinyin (`ni3 hao3`) auto-converts to `nǐ hǎo`.
- **Full card management** — browse, search, edit, and delete any card.
- **Deck management** — filter by deck, add cards by hand, defaults to 16 starter cards.
- **Session summary** — score and accuracy when a review session finishes.
- **Local-first storage** — everything lives in `localStorage`. Export/restore as JSON or CSV.
- **Light-blue glassmorphism theme** — airy, minimalist, easy on the eyes for long sessions.

---

## 🚀 Run locally

Requires **Node 18+**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build for production:

```bash
npm run build
npm start
```

---

## 📥 CSV format

Headers can be in any order and are matched automatically. Only **Hanzi** (or
**English**) is required.

| Hanzi | Pinyin  | English | Image URL | Deck   |
| ----- | ------- | ------- | --------- | ------ |
| 你好  | ni3 hao3 | Hello   |           | Greetings |

A ready-to-try file lives at [`public/sample-cards.csv`](public/sample-cards.csv).
If a row has no deck, the file name is used as the deck.

---

## ☁️ Deploy to Vercel (free) via GitHub

1. **Create a GitHub repo** and push this project:

   ```bash
   git init
   git add .
   git commit -m "Mandarin flashcards"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. **Import into Vercel**
   - Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
   - Select your repository → **Import**.
   - Framework preset auto-detects **Next.js**. Leave the defaults:
     - Build command: `next build`
     - Output: (managed by Next.js)
   - Click **Deploy**.

3. Vercel builds and gives you a free `*.vercel.app` URL. Every push to `main`
   redeploys automatically.

No environment variables or database are needed — all data stays in the visitor's
browser.

---

## 🗂 Project structure

```
app/
  layout.tsx        Root layout + Google fonts (Inter, Noto Sans SC)
  page.tsx          Main app: state, storage, deck filtering
  globals.css       Tailwind + 3D flip styles
components/
  Flashcard.tsx        3D flip card: Hanzi prompt, image, TTS, back face
  StudyView.tsx        Session queue, progress, grading, session summary
  DeckSelector.tsx     Deck filter pills
  ImportModal.tsx      CSV upload → column mapping → preview → import
  CardFormModal.tsx    Add / edit a single card
  ManageCardsModal.tsx Browse, search, edit and delete cards
  SettingsModal.tsx    Export/restore JSON & CSV, reset
  Modal.tsx            Shared animated modal shell
lib/
  types.ts          Shared types
  storage.ts        localStorage load/save, seeding, card migration
  srs.ts            Leitner scheduling + session queue rules
  defaultData.ts    16 starter cards
  csv.ts            Column auto-detect, row→card, CSV export
  pinyin.ts         Numbered → accented pinyin converter
  speech.ts         Web Speech API (zh-CN) wrapper
public/
  sample-cards.csv  Example import file
```

---

## 🔒 Data & privacy

All decks, cards, and progress are stored only in your browser's `localStorage`
under the key `mandarin-flashcards:v1`. Clearing site data removes them — use
**Settings → Export** to keep a backup.
