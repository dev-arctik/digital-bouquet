# Digital Bouquet

## Project Overview

A fully client-side React web app where anyone can create, customize, and share digital flower bouquets. No accounts, no backend, no database. Users pick flowers from a grid, drag-arrange them on a canvas with greenery backgrounds, attach a small note, and share via a URL that encodes the entire bouquet. Bouquets can be saved locally as a "garden" collection and downloaded as images.

Inspired by [digibouquet.vercel.app](https://digibouquet.vercel.app/) — reimagined with drag-and-drop arrangement, image download, and a personal garden.

Detailed planning docs live in `docs/planning/project-overview.md`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18+ (Vite) |
| Language | TypeScript (strict) |
| State Management | Redux Toolkit + redux-persist |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Drag & Drop | @dnd-kit/core |
| URL Encoding | lz-string |
| Image Export | html-to-image |
| Sharing | Web Share API (fallback: clipboard) |
| Fonts | Monospace UI (Courier Prime / IBM Plex Mono) + DM Sans (notes) + Pinyon Script (logo) |
| UUID | crypto.randomUUID() (built-in browser API) |
| Deployment | Vercel |
| Package Manager | npm |

---

## User Flow (3-Step Wizard)

```
Landing Page → Step 1 (Pick Flowers) → Step 2 (Arrange + Note) → Step 3 (Preview & Share)
                                                                         ↓
                                                                   Viewer Page (/view?d=...)
                                                                   Garden Page (/garden)
```

1. **Landing**: Tagline + "Start Creating" button + conditional "My Collection" button (hidden if garden empty)
2. **Step 1**: 3x3 grid of 9 flowers, click to add to cart (max 6), cart sidebar with +/- controls
3. **Step 2**: Greenery dropdown (500x500 centered) + Canvas (800x600) with flowers placed randomly, drag to reposition, flower z-index controls (Bring to Front / Send to Back) on selected flower, "Add Note" / "Edit Note" modal (100 words max, DM Sans), note card (200px wide) always on top, also draggable
4. **Step 3**: Read-only preview, Back / Save to Garden / Share / Save as Photo buttons (with loading/feedback), non-editable link field, unsaved-work confirmation on Create New / Go to Garden

---

## Route Structure

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing — tagline + CTAs |
| `/build` | BuilderPage | 3-step wizard (step managed in Redux) |
| `/garden` | GardenPage | Scrollable grid of saved bouquets, hover preview, click opens modal |
| `/view?d=<data>` | ViewerPage | Shared bouquet (decoded from URL), Save as Photo, Save to Garden |

---

## Redux State

```typescript
interface BuilderState {
  step: 1 | 2 | 3;
  cart: CartFlower[];
  placedFlowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  editingBouquetId: string | null;  // garden bouquet being edited (null = new)
  canvasWidth: number;       // 800
  canvasHeight: number;      // 600
}

interface GardenState {
  bouquets: Bouquet[];
}

interface RootState {
  builder: BuilderState;    // active wizard session (NOT persisted)
  garden: GardenState;      // saved bouquets (persisted via redux-persist)
}
```

Only `garden` is persisted to localStorage. `builder` resets on new bouquet.
`beforeunload` for browser navigation. In-app: modal with Save & Leave / Leave Without Saving / Cancel. If user leaves without saving, builder state is discarded entirely.

---

## Key Types

```typescript
type FlowerType =
  | 'rose' | 'tulip' | 'sunflower'
  | 'lily' | 'daisy' | 'peony'
  | 'orchid' | 'carnation' | 'dahlia';

interface FlowerMeta {
  type: FlowerType;
  name: string;              // display name (e.g., "Rose")
  asset: string;             // path to flower PNG
}

interface CartFlower {
  type: FlowerType;
  count: number;             // how many picked (1-6 total across all types)
}

interface PlacedFlower {
  id: string;                // crypto.randomUUID()
  type: FlowerType;
  x: number;
  y: number;
  zIndex: number;            // layering order (higher = in front)
}

interface Note {
  text: string;              // max 100 words
  fontFamily: string;        // currently only "DM Sans"
  x: number;
  y: number;
}

type GreeneryType = 'bush' | 'monstera' | 'sprigs' | 'none';

interface Bouquet {
  id: string;                // crypto.randomUUID()
  flowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  canvasWidth: number;       // 800
  canvasHeight: number;      // 600
  createdAt: string;         // ISO date
}
```

---

## Project Structure

```
src/
├── app/
│   ├── store.ts                 # Redux store with redux-persist (garden only)
│   └── hooks.ts                 # useAppSelector, useAppDispatch
├── features/
│   ├── builder/
│   │   ├── builderSlice.ts      # Wizard state: step, cart, placedFlowers, note, greenery, canvas
│   │   ├── FlowerGrid.tsx       # 3x3 flower selection grid
│   │   ├── FlowerTile.tsx       # Individual flower tile (click to add)
│   │   ├── Cart.tsx             # Sidebar cart with +/- controls
│   │   ├── BouquetCanvas.tsx    # Drag-and-drop arrangement canvas (800x600)
│   │   ├── FlowerControls.tsx   # Bring to Front / Send to Back (swap adjacent, disable at limits)
│   │   ├── GreenerySelector.tsx # Greenery style dropdown
│   │   ├── PlacementEngine.ts   # Random initial placement (overlapping OK)
│   │   ├── NoteModal.tsx        # Note editor modal (textarea, 100 words, Done/Cancel/Delete)
│   │   ├── NoteCard.tsx         # Draggable note card on canvas
│   │   └── BouquetPreview.tsx   # Read-only preview (step 3 + viewer)
│   ├── garden/
│   │   ├── gardenSlice.ts       # Saved bouquets (persisted)
│   │   ├── GardenGrid.tsx       # Scrollable grid of thumbnails
│   │   ├── BouquetCard.tsx      # Thumbnail with hover preview icon
│   │   └── PreviewModal.tsx     # Full preview modal (Edit, Photo, Share, Delete)
│   └── share/
│       ├── encoder.ts           # Bouquet → strip IDs/dimensions → compress → URL param
│       ├── decoder.ts           # URL param → decompress → validate → regenerate IDs → Bouquet
│       ├── ShareActions.tsx     # Share / Save as Photo / Copy Link buttons
│       └── imageExport.ts      # html-to-image toPng() wrapper
├── pages/
│   ├── HomePage.tsx
│   ├── BuilderPage.tsx          # Wizard container (steps 1-3)
│   ├── ViewerPage.tsx           # Shared link viewer
│   └── GardenPage.tsx           # My Collection
├── components/
│   ├── Layout.tsx               # App shell + navbar ("DigiBouquet" logo → home, garden icon → garden)
│   ├── ErrorBoundary.tsx        # Wraps key routes for crash recovery
│   ├── Toast.tsx                # Success/error feedback notifications
│   ├── StepNavigation.tsx       # BACK / NEXT buttons
│   └── Modal.tsx                # Reusable modal (notes, confirmations, garden preview)
├── data/
│   └── flowers.ts               # 9 flower types: name, asset path (FlowerMeta[])
├── assets/
│   ├── flowers/                 # 9 watercolor-style flower PNGs (transparent bg)
│   └── greenery/                # Greenery background PNGs (bush, monstera, sprigs)
├── styles/
│   └── index.css                # Tailwind base + monospace UI font + DM Sans (notes) + Pinyon Script (logo)
├── utils/
│   └── compression.ts           # Thin lz-string wrapper (compress/decompress), called by encoder/decoder
├── types/
│   └── index.ts                 # All shared TypeScript types
└── main.tsx
```

---

## Design Aesthetic

Minimalist, monochrome UI inspired by [digibouquet.vercel.app](https://digibouquet.vercel.app/). Color comes only from flower/greenery illustrations.

- **Background**: Warm cream `#F0EBDA` — flat solid, all pages, no gradients
- **UI Font**: Monospace (e.g., Courier Prime / IBM Plex Mono), ALL UPPERCASE + letter-spacing for headings/buttons
- **Logo**: "DigiBouquet" in Pinyon Script (calligraphic Google Font) — just styled text, no image
- **Text colors**: Black (`#000`) headings/labels, gray (`#999`) subtitles, light gray (`#AAA`) footer
- **Buttons**: Sharp corners (NO border-radius). Primary = solid black / white text, Secondary = 2px black outline / transparent, Tertiary = underlined text, Disabled = `#B8B8C4`
- **No box shadows, no gradients** — flat design throughout
- **Flowers**: Hand-drawn watercolor-style PNGs, ink outlines, transparent bg, standard size (~80x80)
- **Greenery**: 500x500px watercolor foliage, centered on canvas, always behind flowers (z-index 0)
- **Note card**: 200px wide, white bg (`#FFF`), thin black border, sharp corners, DM Sans font, always on top
- **Canvas**: 800x600 (4:3), cream background (`#F0EBDA`), exports cleanly as image
- **Garden thumbnails**: Miniature CSS-scaled full canvas (greenery + flowers, no note), sharp corners
- **Modals**: Centered overlay with backdrop blur
- **Mobile**: Responsive — canvas scales, grid wraps, modals go full-screen

---

## Development Rules

- **No backend.** URL is the database for sharing. localStorage for the garden.
- **Redux Toolkit** for all shared state. No prop drilling.
- **redux-persist** for `garden` slice only. `builder` is ephemeral.
- **TypeScript strict** — no `any`, interfaces for all data shapes.
- **Tailwind** for styling. Inline styles only for dynamic canvas positions/transforms.
- **Small components** — split at ~80 lines. Extract hooks for complex logic.
- **Feature folders**: `builder/`, `garden/`, `share/` under `src/features/`.
- Flower assets in `src/assets/flowers/` — 9 PNGs, watercolor style, standard size.
- Greenery assets in `src/assets/greenery/` — 500x500px foliage PNGs, centered on canvas.
- **No flower delete** on canvas. Go BACK to step 1 to change selection. BACK from step 2 resets placedFlowers but preserves note text. BACK from step 3 preserves everything.
- **Z-index layering**: Greenery (0) < Flowers (1 to N, sequential) < Note (N+1). Swap-based controls, disable at limits.
- **Validation**: Strict schema on URL-decoded data. Flower IDs + canvas dimensions stripped from URL, regenerated on decode. See overview doc for full rules.
- **Unsaved work**: `beforeunload` for browser nav. In-app: modal with Save & Leave / Leave Without Saving / Cancel.
- **Loading/feedback**: All async actions (Save as Photo, Share, Save to Garden) show spinners and toasts.
- **Error boundaries**: Wrap BuilderPage, ViewerPage, GardenPage for crash recovery.
- **Fonts**: Monospace (Courier Prime / IBM Plex Mono) for all UI text. DM Sans for note card only. Pinyon Script for "DigiBouquet" logo. All with CSS fallbacks.
- **UUID**: Use `crypto.randomUUID()` — no extra dependency.
- **@dnd-kit/core** with `useDraggable` for free-form canvas positioning. Do NOT use `@dnd-kit/sortable`.
- **html-to-image** `toPng()` for Save as Photo. All assets must be local (no external URLs).
- Canvas is fixed 800x600 (4:3). Scales with CSS `transform` on mobile.
- Test URL encoding/decoding with max bouquets (6 flowers + 100-word note).
- Builder is a single page (`/build`) with internal step state (1-3) in Redux.
- Note text always rendered as plain text (never `dangerouslySetInnerHTML`).

---

## Agents & Skills

| Name | Type | Model | Purpose |
|---|---|---|---|
| `development-expert` | Agent | inherit (Opus) | All coding — React, Redux, TypeScript, folder structure |
| `document-wizard` | Agent | haiku | Planning docs, issues, feature flows, docs organization |
| `/review-docs` | Skill | inherit | Review docs for completeness, vulnerabilities, better approaches |
| `/review-code` | Skill | inherit | Code review + bug hunting |

## Docs Structure

```
docs/
├── planning/       # Feature specs before coding
├── feature_flow/   # Architecture docs for implemented features
├── issues/         # Active bugs
└── resolved/       # Fixed bugs (moved from issues/)
```
