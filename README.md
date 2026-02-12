# DigiBouquet

A fully client-side web app where anyone can create, customize, and share digital flower bouquets. No accounts, no backend, no database — just flowers, love, and a shareable link.

**Live:** [https://dev-arctik.github.io/digital-bouquet/](https://dev-arctik.github.io/digital-bouquet/)

## How It Works

1. **Pick Flowers** — Choose from 9 hand-drawn watercolor flowers (up to 6 total)
2. **Arrange** — Drag flowers on a canvas, add greenery backgrounds, attach a personal note
3. **Share** — Get a unique URL that encodes your entire bouquet, or save it as an image

No sign-up required. Bouquets are encoded directly into the URL using compression, so anyone with the link sees your creation instantly.

## Features

- **Drag-and-drop canvas** — Free-form flower arrangement with layering controls
- **Greenery backgrounds** — Bush, monstera, sprigs, or none
- **Personal notes** — Attach a short message (100 words max) with a draggable note card
- **Shareable links** — Entire bouquet compressed into a URL parameter via lz-string
- **Save as image** — Download your bouquet as a PNG
- **Garden collection** — Save bouquets locally and revisit them anytime
- **Edit saved bouquets** — Reopen and modify bouquets from your garden
- **Fully responsive** — Works on desktop and mobile
- **Zero backend** — Everything runs in the browser; localStorage for persistence

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite) |
| Language | TypeScript (strict) |
| State | Redux Toolkit + redux-persist |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Drag & Drop | @dnd-kit/core |
| URL Encoding | lz-string |
| Image Export | html-to-image |
| Icons | Lucide React |
| Deployment | GitHub Pages |

## Local Development

```bash
# clone the repo
git clone https://github.com/dev-arctik/digital-bouquet.git
cd digital-bouquet

# install dependencies
npm install

# start dev server
npm run dev

# build for production
npm run build

# preview production build locally
npm run preview
```

## Project Structure

```
src/
├── app/            # Redux store, hooks
├── features/
│   ├── builder/    # 3-step bouquet wizard (pick, arrange, preview)
│   ├── garden/     # Saved bouquets collection
│   └── share/      # URL encoding/decoding, image export, share actions
├── pages/          # Route-level page components
├── components/     # Shared UI (Layout, Modal, Toast, ErrorBoundary)
├── assets/         # Flower & greenery watercolor PNGs
├── data/           # Flower metadata & constants
├── styles/         # Tailwind config & custom CSS
├── types/          # Shared TypeScript interfaces
└── main.tsx        # App entry point
```

## Design

Minimalist, monochrome UI — color comes only from the flower and greenery illustrations. Warm cream background (`#F0EBDA`), sharp corners, no shadows, monospace typography for UI elements, with DM Sans for note cards.

Inspired by [digibouquet.vercel.app](https://digibouquet.vercel.app/).

## License

MIT
