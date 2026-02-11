# Feature: Project Overview — Digital Bouquet

## Overview
A fully client-side web app where anyone can create, customize, and share beautiful digital flower bouquets. No accounts, no backend, no database. Users pick flowers, drag-arrange them on a canvas with greenery backgrounds, attach a small note, and share via a URL that encodes the entire bouquet state. Bouquets can be saved locally as a personal garden collection and downloaded as images.

Inspired by [digibouquet.vercel.app](https://digibouquet.vercel.app/) — reimagined with drag-and-drop arrangement, image download, and a personal garden collection.

## User Story
As a user, I want to pick flowers, arrange them into a bouquet by dragging them where I want, write a small note, and share it with someone via a link or download it as a photo — all without creating an account.

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18+** | Rich ecosystem, great for interactive UIs, team familiarity |
| Build Tool | **Vite** | Fast HMR, modern ESM-first bundling, zero-config TypeScript |
| Language | **TypeScript** | Strict typing prevents bugs, self-documenting code |
| State Management | **Redux Toolkit** | Multi-step wizard state + garden persistence with redux-persist |
| Styling | **Tailwind CSS** | Utility-first, fast prototyping, consistent design system |
| Routing | **React Router v6** | Standard for React SPAs, supports query params for sharing |
| URL Encoding | **lz-string** | Compresses JSON to URL-safe strings, no backend needed |
| Persistence | **redux-persist + localStorage** | Saves garden bouquets across browser sessions |
| Drag & Drop | **@dnd-kit/core** | Free-form positioning via `useDraggable` + transform tracking |
| Image Export | **html-to-image** | Lightweight DOM-to-PNG via `toPng()`, supports font embedding |
| Sharing | **Web Share API** | Native device share sheet (WhatsApp, Messages, etc.) |
| Fonts | **Monospace UI** (Courier Prime / IBM Plex Mono) + **DM Sans** (notes) + **Pinyon Script** (logo) | Monospace for typewriter aesthetic; DM Sans for warmer note card text; Pinyon Script for calligraphic "DigiBouquet" logo |
| Deployment | **Vercel** | Free tier, instant deploys, perfect for static React apps |
| Package Manager | **npm** | Standard, reliable |
| UUID | **crypto.randomUUID()** | Built-in browser API, no extra dependency |

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| Next.js | Adds SSR complexity — we don't need a server. Only benefit would be OG meta tags for link previews. |
| Vue 3 + Pinia | Good framework but would require learning new ecosystem. No significant advantage. |
| Svelte | Smaller bundle, but smaller ecosystem. Fewer drag-and-drop / image export libraries. |
| Zustand | Simpler but redux-persist integration with RTK is more mature. RTK slices fit the wizard state well. |
| react-dnd | Older, heavier. @dnd-kit is newer, lighter, better documented. |
| @dnd-kit/sortable | Designed for list reordering, NOT free-form canvas positioning. We need `@dnd-kit/core` with `useDraggable`. |
| html2canvas | Older, heavier. html-to-image is lighter and sufficient for local assets with positioned elements. |
| uuid npm package | `crypto.randomUUID()` is built-in to modern browsers, no extra dependency needed. |

---

## Core User Flow

```
┌─────────────────────────────────────────┐
│           LANDING PAGE                  │
│                                         │
│   "A digital bouquet for your           │
│    loved ones"                          │
│                                         │
│   [Start Creating Your Bouquet]         │
│   [My Collection]  ← hidden if         │
│                      garden is empty    │
└──────────────┬──────────────────────────┘
               │ click "Start Creating"
               ▼
┌─────────────────────────────────────────┐
│      STEP 1: PICK FLOWERS              │
│                                         │
│  ┌─────────────────────┐  ┌──────────┐ │
│  │  3x3 Grid (9 types) │  │  CART    │ │
│  │                      │  │          │ │
│  │  [🌹] [🌻] [🌷]    │  │ Rose x2  │ │
│  │  [🌺] [🌸] [🌼]    │  │ Lily x1  │ │
│  │  [💐] [🌿] [🌾]    │  │          │ │
│  │                      │  │ Total: 3 │ │
│  │  click = +1 to cart  │  │ Max: 6   │ │
│  └─────────────────────┘  │ [- / +]  │ │
│                            └──────────┘ │
│                                         │
│            [NEXT →]                     │
│   (enabled when cart has 1-6 flowers)   │
└──────────────┬──────────────────────────┘
               │ NEXT
               ▼
┌─────────────────────────────────────────┐
│      STEP 2: ARRANGE YOUR BOUQUET      │
│                                         │
│  [Greenery: ▼ dropdown selector]        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Canvas (800x600, 4:3)         │    │
│  │                                 │    │
│  │  Greenery background layer      │    │
│  │                                 │    │
│  │  Flowers placed randomly        │    │
│  │  (overlapping OK)               │    │
│  │                                 │    │
│  │  User can DRAG each flower      │    │
│  │  Selected flower shows controls:│    │
│  │  [↑ Front] [↓ Back]           │    │
│  │                                 │    │
│  │  Note card also draggable       │    │
│  │  after being added              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [← BACK]  [Add Note]  [NEXT →]        │
│                                         │
│  ("Add Note" becomes "Edit Note"        │
│   after a note is attached)             │
└──────────────┬──────────────────────────┘
               │                 │
               │ click "Add Note"│
               │ or "Edit Note"  │
               │                 ▼
               │  ┌───────────────────────┐
               │  │   NOTE MODAL          │
               │  │                       │
               │  │   [textarea]          │
               │  │   100 words max       │
               │  │   "23 / 100 words"    │
               │  │                       │
               │  │   Font: DM Sans       │
               │  │   (more fonts later)  │
               │  │                       │
               │  │   [Done] [Cancel]     │
               │  │   [Delete Note]       │
               │  │   (Delete only shows  │
               │  │    when editing)      │
               │  └───────────────────────┘
               │  (note appears on canvas,
               │   draggable to any position)
               │
               │ NEXT
               ▼
┌─────────────────────────────────────────┐
│      STEP 3: PREVIEW & SHARE           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   Final bouquet preview         │    │
│  │   (flowers + note + greenery    │    │
│  │    as arranged — read-only)     │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [← Back]  [Save to Garden]            │
│  [📤 Share] [📷 Save as Photo]         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ https://app.com/view?d=abc...   │    │
│  │ (non-editable link field)       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Create New]  [Go to Garden]           │
└─────────────────────────────────────────┘


========== SHARED LINK (viewer) ==========

┌─────────────────────────────────────────┐
│      VIEWER PAGE (/view?d=...)          │
│                                         │
│  "Someone made this bouquet for you!"   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   Bouquet rendered exactly as   │    │
│  │   the creator arranged it       │    │
│  │   (flowers + note + greenery)   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [📷 Save as Photo] [🌿 Save to Garden]│
│                                         │
│  [Create Your Own Bouquet →]            │
└─────────────────────────────────────────┘


========== MY GARDEN (collection) ==========

┌─────────────────────────────────────────┐
│      MY GARDEN (/garden)                │
│                                         │
│  Scrollable grid of saved bouquets      │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │        │ │        │ │        │      │
│  │ thumb  │ │ thumb  │ │ thumb  │      │
│  │(flowers│ │        │ │        │      │
│  │ only,  │ │        │ │        │      │
│  │ no note│ │ hover: │ │        │      │
│  │ shown) │ │ 👁 icon│ │        │      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  On hover → preview icon appears        │
│  On click → opens PREVIEW MODAL:        │
│                                         │
│  ┌───────────────────────────────┐      │
│  │  Full bouquet preview         │      │
│  │  (with note this time)        │      │
│  │                               │      │
│  │  [✏️ Edit] [📷 Photo] [📤 Share]│   │
│  │  [🗑️ Delete]                  │      │
│  └───────────────────────────────┘      │
│                                         │
│  [← Back to Home]                       │
└─────────────────────────────────────────┘
```

---

## Detailed Page Specs

### Navigation Bar (all pages)

- **"DigiBouquet"** logo on the left (Pinyon Script font, smaller than landing page) — clickable, navigates to home (`/`)
- **Garden icon** on the right — navigates to `/garden` (only shown if garden has bouquets)
- Minimal, doesn't compete with content

### Landing Page (`/`)

**Layout**: Centered, minimal, elegant
- Warm cream/beige background
- **"DigiBouquet"** logo at top — rendered in Pinyon Script (calligraphic Google Font), large on landing page, smaller in navbar on other pages
- Cute tagline: something like *"A digital bouquet for your loved ones"* or *"Handpick flowers. Arrange with love. Share forever."*
- **"Start Creating Your Bouquet"** button — always visible, primary CTA
- **"My Collection"** button — only visible if `garden` slice in Redux has at least 1 saved bouquet. Hidden otherwise.

### Step 1 — Pick Flowers (`/build`)

**Layout**: Flower grid on the left/center, cart panel on the right side

**Flower Grid**:
- 3x3 grid = 9 flower types
- Each flower shown as a card/tile with the flower illustration
- Click a flower tile → adds 1 to the cart
- If already at max 6 total, clicking does nothing (or shows a subtle "max reached" feedback)

**Cart Panel** (sidebar on the right):
- Lists each selected flower type with its count
- Each item has **+** and **-** buttons to adjust quantity
- Shows total count (e.g., "3 / 6 flowers")
- Minus reduces count; at 0 the flower is removed from cart

**NEXT button**:
- Enabled when cart has at least 1 flower (max 6)
- Disabled when cart is empty
- No BACK button on step 1 — the **navbar** handles navigation: clickable app title/logo → home (`/`), garden icon → garden (`/garden`). Browser back button also works.

**Flower Types** (9 total):

| Flower | Asset Name |
|---|---|
| Rose | `rose.png` |
| Tulip | `tulip.png` |
| Sunflower | `sunflower.png` |
| Lily | `lily.png` |
| Daisy | `daisy.png` |
| Peony | `peony.png` |
| Orchid | `orchid.png` |
| Carnation | `carnation.png` |
| Dahlia | `dahlia.png` |

Each flower is a watercolor/hand-drawn style PNG with transparent background. All flowers are rendered at a **standard size** on the canvas (e.g., 80x80px — exact size to be decided during implementation based on what looks good at 800x600 canvas).

### Step 2 — Arrange Your Bouquet (`/build` step 2)

**Canvas**:
- Fixed aspect ratio **4:3**, height **600px**, width **800px**
- On mobile: scales down proportionally to fit viewport width (CSS `transform: scale()`)
- Cream/beige background color (so image export looks good)

**Greenery**:
- A **dropdown selector** at the top of the canvas area
- Options: **None** (default), Bush, Monstera, Sprigs. Default is `'none'` — no greenery background, letting users be creative with arrangement.
- User picks a greenery style — the greenery image renders as a background layer behind all flowers
- Greenery assets stored in `src/assets/greenery/` (e.g., `bush.png`, `monstera.png`, `sprigs.png`)
- All greenery assets are **500x500px**, rendered **centered** on the 800x600 canvas (positioned at x:150, y:50)
- Greenery sits at z-index 0 — always behind everything

**Initial Arrangement**:
- When entering this step, selected flowers are placed on the canvas in random positions
- **Overlapping is allowed** — flowers can be placed on top of each other
- Each flower is rendered at the standard size

**Flower Controls** (appear when a flower is clicked/selected):
- **Bring to Front** — swaps z-index with the flower one layer above. Disabled when flower is already at the highest z-index among flowers.
- **Send to Back** — swaps z-index with the flower one layer below. Disabled when flower is already at the lowest z-index among flowers.
- Controls appear as a small floating toolbar near the selected flower
- **No delete** — once flowers are placed, they stay. User can go BACK to step 1 to change flower selection.

**Z-Index Layering**:
- **Greenery** = always at the back (z-index 0). Never changes.
- **Flowers** = z-index 1 through N (where N = number of placed flowers). Each flower gets a unique sequential z-index on initial placement. Bring to Front / Send to Back swap with the adjacent flower's z-index.
- **Note** = always on top of everything (z-index N + 1). Never changes relative to flowers.
- This means: greenery < all flowers < note. Within flowers, user controls the layering order.

**Drag & Drop** (using `@dnd-kit/core`):
- Each flower uses `useDraggable` hook
- On drag, flower follows the pointer via `transform` (translate3d)
- On `onDragEnd`, the flower's x/y position in Redux is updated by adding the transform delta
- Smooth, responsive dragging on both mouse and touch
- Note card is also draggable using the same mechanism
- **Flowers cannot be dragged outside the canvas** — clamp x/y to canvas bounds on every drag end
- **Mobile touch**: **tap** = select flower (shows z-index controls), **press and drag** = move flower. Tap elsewhere on canvas = deselect.

**Add Note / Edit Note Button**:
- Initially shows **"Add Note"**
- After a note is attached, button changes to **"Edit Note"**
- Only **one note** per bouquet
- Clicking opens a **modal dialog**:
  - Textarea for the note message
  - **100 word maximum** — show live word count (e.g., "23 / 100 words")
  - Font: **DM Sans** (only font for now, more added later)
  - Buttons:
    - **"Done"** — saves the note and closes modal
    - **"Cancel"** — discards changes and closes modal
    - **"Delete Note"** — removes the note entirely (only shown when editing an existing note)
- After attaching, the note appears on the canvas as a small card (**200px wide**, height auto based on content/font size — exact height to be tested during coding)
- **Default note position**: bottom-center of canvas — `(300, 480)` on the 800x600 canvas. This avoids overlapping the greenery (centered at x:150, y:50) and sits below most flower arrangements.
- The note card is **draggable** — user positions it wherever they want
- Note always renders on top of all flowers (highest z-index)

**Navigation**:
- **"BACK"** → returns to flower selection (cart state preserved). Going back **resets placedFlowers** — cart is the source of truth for flower selection. User re-arranges on re-entry to step 2. **Note is preserved** (text and font kept, position reset to default on re-entry) — rewriting a note is frustrating for users.
- **"NEXT"** → advances to step 3 (preview). Does NOT save to garden — that happens in step 3.

### Step 3 — Preview & Share (`/build` step 3)

**Layout**: Final bouquet preview at top, action buttons and link field below

**Preview**:
- Shows the bouquet exactly as the user arranged it (flowers + note + greenery in their final positions)
- Read-only — no more dragging
- This is what the recipient will see

**Action Buttons**:
1. **Back** — returns to step 2 with all state preserved (placedFlowers, note, greenery unchanged). User continues editing where they left off.
2. **Save to Garden** — saves the bouquet to Redux `garden` slice (persisted to localStorage). This is the ONLY place saving happens.
3. **Share** — triggers the **Web Share API** (`navigator.share()`). Opens device's native share sheet. Falls back to copying link to clipboard if Web Share API is not supported.
4. **Save as Photo** — captures the bouquet canvas as a PNG and triggers download via `html-to-image`'s `toPng()`.

**Link Display**:
- Below the action buttons, a **non-editable text field** displays the full shareable URL
- The URL is generated automatically when reaching step 3
- User can manually select and copy from this field as an alternative to the Share button

**Secondary Navigation**:
- "Create New" → resets builder state, goes back to step 1. If unsaved, shows the unsaved-work modal (Save & Leave / Leave Without Saving / Cancel).
- "Go to Garden" → navigates to `/garden`. Same unsaved-work modal if not saved.

**Loading & Feedback**:
- "Save as Photo" shows a **loading spinner** on the button while `toPng()` processes. On failure, show toast: *"Couldn't save the image. Try taking a screenshot instead."*
- "Share" shows brief loading during `navigator.share()`. On clipboard fallback, show toast: *"Link copied!"*
- "Save to Garden" changes to *"Saved!"* (disabled) after successful save to prevent double-saves. If `editingBouquetId` is set, updates the existing bouquet (preserves original `createdAt`); otherwise creates a new one with `createdAt = now`.

### Viewer Page (`/view?d=<data>`)

**Who sees this**: Anyone who opens a shared link

**Layout**:
- Sweet heading: *"Someone made this bouquet for you!"*
- Bouquet rendered exactly as the creator arranged it (decoded from URL)
- Note displayed in its positioned location with the chosen font
- Greenery background displayed

**Actions for the viewer**:
1. **Save as Photo** — download the bouquet as an image
2. **Save to Garden** — adds this bouquet to the viewer's own local garden collection

**CTA at bottom**:
- "Create Your Own Bouquet" → links to `/` (landing page)

**Loading State**:
- While decoding + validating URL data, show a loading spinner with *"Unwrapping your bouquet..."* or similar

**Error State**:
- If the URL data is corrupted/invalid/fails validation → friendly error message: *"This bouquet link seems to be broken."* with a CTA to create their own

**Action Feedback**:
- "Save as Photo" shows loading spinner while processing, toast on failure
- "Save to Garden" changes to "Saved!" after success. If localStorage is full, show toast: *"Storage is full. Try deleting some bouquets from your garden."*

### My Garden (`/garden`)

**Who sees this**: The user (their local collection)

**Layout**: Scrollable grid of saved bouquet thumbnails, sorted by `createdAt` (newest first)

**Thumbnails**:
- Each cell renders the **full canvas shrunk down** using CSS `transform: scale()` on the `BouquetPreview` component — greenery + flowers are shown, just the **note is NOT shown** (keeps thumbnails clean)
- **No images are saved** in localStorage — thumbnails are always re-rendered from bouquet data
- **Lazy rendering**: Thumbnails render on scroll into view using `IntersectionObserver`. Each `BouquetCard` observes its own visibility — renders a placeholder (cream box) until visible, then renders the full CSS-scaled `BouquetPreview`. This avoids rendering all bouquets at once on large gardens. No extra library needed — browser-native API.

**Grid Behavior**:
- **On hover** → a preview eye icon appears over the thumbnail
- **On click** → opens a **preview modal**

**Preview Modal** contains:
- Full-size bouquet preview (flowers + note + greenery — note IS shown here)
- Action buttons:
  - **Edit** — loads the bouquet back into the builder (step 2) with all positions/note/greenery preserved. Also populates the `cart` by deriving `CartFlower[]` from the bouquet's `PlacedFlower[]` (count each FlowerType), so BACK to step 1 shows the correct flower selection. Sets `editingBouquetId` in builder state to this bouquet's id, so "Save to Garden" on step 3 updates the same bouquet instead of creating a duplicate.
  - **Save as Photo** — download as image
  - **Share Link** — generates link + copies to clipboard
  - **Delete** — removes from garden (with confirmation dialog)
- Close button (X) or click outside to dismiss

**Empty State**:
- If garden is empty, this page shows a message like *"Your garden is empty"* with a CTA to create a bouquet

**Navigation**:
- "Back to Home" → returns to landing page

---

## Key Types

```typescript
type FlowerType =
  | 'rose' | 'tulip' | 'sunflower'
  | 'lily' | 'daisy' | 'peony'
  | 'orchid' | 'carnation' | 'dahlia';

// flower metadata for the catalog
interface FlowerMeta {
  type: FlowerType;
  name: string;              // display name (e.g., "Rose")
  asset: string;             // path to flower PNG in src/assets/flowers/
}

// flower in the cart (step 1)
interface CartFlower {
  type: FlowerType;
  count: number;             // how many picked (1-6 total across all types)
}

// flower placed on the canvas (step 2)
interface PlacedFlower {
  id: string;                // unique instance id (crypto.randomUUID())
  type: FlowerType;
  x: number;                 // position on canvas (pixels)
  y: number;
  zIndex: number;            // layering order (higher = in front)
}

interface Note {
  text: string;              // max 100 words
  fontFamily: string;        // font name (currently only "DM Sans")
  x: number;                 // position on canvas
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

## Redux State Shape

```typescript
interface BuilderState {
  step: 1 | 2 | 3;                    // current wizard step
  cart: CartFlower[];                   // step 1: selected flowers
  placedFlowers: PlacedFlower[];        // step 2: arranged on canvas
  note: Note | null;                    // step 2: attached note
  greenery: GreeneryType;              // selected greenery style
  editingBouquetId: string | null;     // id of garden bouquet being edited (null = new)
  canvasWidth: number;                 // 800
  canvasHeight: number;                // 600
}

interface GardenState {
  bouquets: Bouquet[];                  // saved bouquets (persisted to localStorage)
}

interface RootState {
  builder: BuilderState;               // active builder session (NOT persisted)
  garden: GardenState;                 // saved collection (persisted via redux-persist)
}
```

Only `garden` is persisted to localStorage via redux-persist. The `builder` state resets when the user starts a new bouquet.

**Unsaved work warning**:
- **Browser navigation** (refresh, close tab): `beforeunload` confirmation dialog when `placedFlowers` has items.
- **In-app navigation** ("Create New", "Go to Garden", navbar links while in builder): Show a modal: *"Your bouquet hasn't been saved. Save to garden before leaving?"* with **Save & Leave** / **Leave Without Saving** / **Cancel** buttons. If user picks "Leave Without Saving", discard the builder state entirely. No partial saves.

---

## Route Structure

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing — tagline + "Start Creating" + conditional "My Collection" |
| `/build` | BuilderPage | Multi-step wizard (steps 1 → 2 → 3), step managed in Redux |
| `/garden` | GardenPage | Scrollable grid of saved bouquets with hover preview + modal |
| `/view?d=<data>` | ViewerPage | Shared bouquet viewer — decoded from URL |

---

## URL Encoding Strategy

No backend — the URL IS the database for shared bouquets:

```
Bouquet object (flowers positions + note + greenery + canvas size)
    ↓ strip fields not needed for sharing:
    │   - Bouquet.id, Bouquet.createdAt
    │   - Bouquet.canvasWidth, Bouquet.canvasHeight (always 800x600)
    │   - PlacedFlower.id (regenerated on decode)
    ↓ JSON.stringify()
    ↓ lz-string compressToEncodedURIComponent()
    ↓
https://our-app.vercel.app/view?d=<compressed_data>
    ↓
Viewer page: decompressFromEncodedURIComponent()
    ↓ JSON.parse()
    ↓ VALIDATE with strict schema (see Validation section)
    ↓ Regenerate missing fields:
    │   - PlacedFlower.id = crypto.randomUUID() per flower
    │   - canvasWidth = 800, canvasHeight = 600
    │   - Bouquet.id = crypto.randomUUID()
    │   - createdAt = new Date().toISOString()
    ↓ render bouquet read-only
```

The URL encodes: flower types, positions (x, y), z-indices, note text, note font, note position, greenery type. Canvas dimensions and IDs are NOT encoded (constants / regenerated on decode).

URL length target: under ~2000 chars for max bouquet (6 flowers + 100-word note).

---

## Validation (URL-Decoded Data)

When decoding a shared URL, the data MUST be validated strictly before rendering. This prevents XSS, DoS, and data corruption.

**Validation rules** (applied after `JSON.parse()`):

| Field | Rule |
|---|---|
| `flowers` | Must be an array. Min length: **1**. Max length: **6**. Reject if outside range. |
| `flowers[].type` | Must be one of the 9 valid `FlowerType` values. Reject unknown types. |
| `flowers[].x` | Must be a number between **0** and **800** (canvas width). |
| `flowers[].y` | Must be a number between **0** and **600** (canvas height). |
| `flowers[].zIndex` | Must be an integer between **1** and **N** (where N = flowers.length). |
| `note` | Must be `null` or an object. |
| `note.text` | Must be a string. Max **100 words** (split by spaces, count). Max **1000 characters** (hard limit). Strip HTML tags. |
| `note.fontFamily` | Must be one of the **allowed font list** (currently: `"DM Sans"`). Reject unknown fonts. |
| `note.x` | Must be a number between 0 and 800. |
| `note.y` | Must be a number between 0 and 600. |
| `greenery` | Must be one of: `'bush'`, `'monstera'`, `'sprigs'`, `'none'`. |

**Not in URL** (regenerated on decode): `flowers[].id`, `canvasWidth`, `canvasHeight`, `Bouquet.id`, `Bouquet.createdAt`.

**Implementation**:
- `src/utils/compression.ts` — thin wrapper around lz-string: `compress(data: string): string` and `decompress(data: string): string | null`. Called by encoder/decoder.
- `src/features/share/encoder.ts` — strips non-URL fields from Bouquet, JSON.stringify, calls compress, returns URL-safe string.
- `src/features/share/decoder.ts` — calls decompress, JSON.parse, validates with strict schema, regenerates missing fields (IDs, canvas dimensions), returns Bouquet or null.
- Write a `validateBouquetData(data: unknown): Bouquet | null` function in decoder.ts. Use manual type guards (no need for Zod given the simple schema).

**On validation failure**: Show a friendly error page — *"This bouquet link seems to be broken. Want to create your own?"* with a CTA to the landing page.

**Note text sanitization**: Always render note text as plain text (never `dangerouslySetInnerHTML`). React's default JSX escaping handles XSS prevention for text content.

---

## Drag & Drop Implementation (@dnd-kit/core)

Pattern for free-form canvas positioning (NOT sortable lists):

```
DndContext (wraps the canvas)
    ├── Draggable flowers (useDraggable per flower)
    │   - Each flower has position: absolute, left: x, top: y
    │   - During drag: transform = translate3d(deltaX, deltaY, 0)
    │   - On dragEnd: newX = flower.x + delta.x, newY = flower.y + delta.y
    │   - Dispatch updateFlowerPosition({ id, x: newX, y: newY }) to Redux
    │
    └── Draggable note card (useDraggable)
        - Same pattern as flowers
        - Dispatch updateNotePosition({ x: newX, y: newY }) to Redux
```

**Do NOT use**: `@dnd-kit/sortable` (that's for reordering lists), `useDroppable` (we don't have drop zones — the entire canvas is the drop area).

**Clamp positions**: After drag, clamp x/y so flowers and note card don't go outside canvas bounds (0 to canvasWidth - elementSize, 0 to canvasHeight - elementSize). Flowers cannot leave the canvas.

---

## Image Export (html-to-image)

"Save as Photo" using `html-to-image`'s `toPng()`:

```typescript
import { toPng } from 'html-to-image';

// canvasRef points to the bouquet canvas DOM element
const dataUrl = await toPng(canvasRef.current, { cacheBust: true });
const link = document.createElement('a');
link.download = `bouquet-${Date.now()}.png`;
link.href = dataUrl;
link.click();
```

**Important**:
- Canvas element MUST have a solid background color (cream/beige) so exported image isn't transparent
- All flower PNGs must be bundled locally (imported via Vite) — NOT loaded from external URLs, to avoid CORS issues
- Test early in Phase 3 with a prototype canvas containing positioned elements
- If `toPng()` fails, show a user-friendly message: *"Couldn't save the image. Try taking a screenshot instead."*

Works on: step 3 preview, viewer page, and garden preview modal.

---

## Web Share API

"Share" button uses the native device share sheet:

```typescript
const shareableLink = generateShareLink(bouquet);

if (navigator.share) {
  await navigator.share({
    title: 'A bouquet for you!',
    text: 'Someone made a digital bouquet for you',
    url: shareableLink,
  });
} else {
  // fallback: copy link to clipboard
  await navigator.clipboard.writeText(shareableLink);
  // show "Link copied!" toast
}
```

This opens WhatsApp, Messages, Twitter, email — whatever the device supports. On desktop browsers that don't support Web Share API, falls back to clipboard copy with a confirmation toast.

---

## Design Aesthetic

> **Note**: The original monochrome design below has been updated with an Otter-inspired pastel palette. See `docs/planning/otter-design-refresh.md` for the full design refresh spec. The primary CTA color is now leaf-green (#019B63) instead of black, with coral (#FC6E48) for destructive/attention actions. The cream background (#F0EBDA) and monospace typography remain unchanged.

Matching the visual language of [digibouquet.vercel.app](https://digibouquet.vercel.app/) — minimalist, monochrome UI where color comes only from the watercolor flower illustrations.

### Color Palette

| Element | Color |
|---|---|
| Page background | `#F0EBDA` (warm cream with subtle yellow-green undertone) |
| Primary text (headings, buttons, labels) | `#000000` (black) |
| Subtitle / helper text | `#999999` (medium gray) |
| Footer text | `#AAAAAA` (light gray) |
| Primary button background | `#000000` (black) |
| Primary button text | `#FFFFFF` (white) |
| Secondary button background | transparent |
| Secondary button border | `#000000` (2px solid) |
| Disabled button background | `#B8B8C4` (grayish lavender) |
| Card / note background | `#FFFFFF` (white) |
| Card / note border | `#000000` (thin) |

### Typography

- **UI font**: Monospace typeface (e.g., `Courier Prime` or `IBM Plex Mono`) — used for ALL headings, buttons, labels, and body text
- **Text transform**: ALL UPPERCASE with widened letter-spacing (`2-4px`) for headings and button labels
- **Logo**: "DigiBouquet" rendered in a calligraphic/script Google Font (e.g., `Pinyon Script`). Just styled text, no image/SVG needed.
- **Note card text**: DM Sans — contrasts the monospace UI with a warmer feel for handwritten notes

### Button Styles

Three-tier hierarchy, all with **sharp corners (no border-radius)**:
- **Primary**: Solid black background, white text, monospace uppercase with letter-spacing
- **Secondary**: Transparent background, 2px solid black border, black text, monospace uppercase
- **Tertiary**: Just underlined text, no border or background, monospace uppercase
- **Disabled**: Grayish lavender background (`#B8B8C4`), white text

### Design Principles

1. **Minimalism** — clean, no clutter, liberal white space
2. **Monochrome UI** — black, white, and cream only for interface elements. Color comes entirely from flower/greenery illustrations.
3. **No border-radius** — everything is sharp rectangles (buttons, cards, tooltips, tags)
4. **No box shadows, no gradients** — flat design throughout
5. **Monospace typography** — typewriter/letterpress aesthetic that contrasts with the organic watercolor flowers
6. **Uppercase + letter-spacing** — all UI labels and headings use this treatment
7. **Centered layout** — content flows down the center of the page
8. **Organic meets structured** — watercolor flowers paired with rigid, structured typography

### Visual Elements

- **Background**: Flat solid `#F0EBDA` on all pages, no gradients
- **Flowers**: Hand-drawn watercolor-style illustrations, ink outlines with color washes, transparent PNG
- **Greenery**: 500x500px watercolor foliage, centered on canvas, always behind flowers (z-index 0)
- **Note card**: 200px wide, white background, thin black border, sharp corners, DM Sans font, always on top (highest z-index), draggable
- **Canvas**: 800x600 (4:3), cream background (`#F0EBDA`), exports cleanly as image
- **Garden thumbnails**: Miniature CSS-scaled full canvas (greenery + flowers, no note), sharp corners
- **Modals**: Centered overlay with backdrop blur
- **Mobile**: Responsive — canvas scales with CSS transform, grid wraps, modals go full-screen

---

## Implementation Phases

### Phase 1 — Foundation
- [ ] Vite + React + TypeScript + Tailwind + Redux Toolkit + React Router setup
- [ ] Redux store with `builder` and `garden` slices
- [ ] redux-persist configured for `garden` slice only
- [ ] App shell with Layout, routing
- [ ] Error boundaries wrapping key routes (BuilderPage, ViewerPage, GardenPage)
- [ ] Landing page with conditional "My Collection" button
- [ ] StepNavigation component (BACK / NEXT)
- [ ] Reusable Modal component (used for note editor, confirmations, garden preview)
- [ ] Reusable Toast component (used for success/error feedback)

### Phase 2 — Flower Selection (Step 1)
- [ ] Flower catalog data (9 types with asset paths)
- [ ] Source/create flower illustration assets (9 watercolor PNGs)
- [ ] FlowerGrid (3x3) with FlowerTile components
- [ ] Cart sidebar with +/- controls and count display
- [ ] Max 6 flower validation
- [ ] NEXT button enable/disable logic

### Phase 3 — Arrangement (Step 2)
- [ ] Canvas component (800x600, 4:3, cream background)
- [ ] Greenery assets (500x500, centered) + dropdown selector
- [ ] Random initial placement algorithm (sequential z-indices 1 to N)
- [ ] @dnd-kit/core setup — useDraggable per flower + note
- [ ] Position clamping within canvas bounds (flowers cannot leave canvas)
- [ ] Flower selection + z-index controls (Bring to Front, Send to Back — swap with adjacent, disable at limits)
- [ ] Mobile touch: tap = select, press+drag = move, tap canvas = deselect
- [ ] "Add Note" / "Edit Note" button + NoteModal (textarea, 100 word limit, Done/Cancel/Delete Note)
- [ ] NoteCard rendering on canvas (200px wide, draggable, always on top)
- [ ] `beforeunload` warning when unsaved work exists
- [ ] BACK navigation (resets placedFlowers, cart preserved) / NEXT navigation
- [ ] **Test html-to-image early** with a prototype canvas

### Phase 4 — Preview & Share (Step 3)
- [ ] Read-only bouquet preview (same canvas rendering, no drag)
- [ ] URL encoding with lz-string (encoder.ts) — strips IDs + canvas dimensions
- [ ] Non-editable link text field displaying the full URL
- [ ] "Save to Garden" action (uses `editingBouquetId` to update or create)
- [ ] "Save to Garden" button feedback (changes to "Saved!", disabled after save)
- [ ] "Share" with Web Share API + clipboard fallback + toast feedback
- [ ] "Save as Photo" with html-to-image + loading spinner + error toast
- [ ] "Create New" / "Go to Garden" with unsaved-work confirmation modal
- [ ] localStorage quota exceeded error handling on save

### Phase 5 — Viewer Page
- [ ] URL decoding (decoder.ts) — decompress, validate, regenerate IDs + canvas dimensions
- [ ] Strict validation (validateBouquetData function)
- [ ] Loading state while decoding (*"Unwrapping your bouquet..."*)
- [ ] Read-only bouquet rendering from validated data
- [ ] "Save as Photo" button + loading spinner + error toast
- [ ] "Save to Garden" button + "Saved!" feedback + localStorage quota handling
- [ ] "Create Your Own" CTA
- [ ] Error state for invalid/corrupted links

### Phase 6 — Garden Page
- [ ] Scrollable grid of bouquet thumbnails (CSS-scaled BouquetPreview, no note), sorted by `createdAt` (newest first)
- [ ] Lazy thumbnail rendering with `IntersectionObserver` (placeholder until visible)
- [ ] Hover effect with preview icon
- [ ] Preview modal with full bouquet view (with note)
- [ ] Modal actions: Edit, Save as Photo, Share Link, Delete
- [ ] Edit sets `editingBouquetId` and loads bouquet into builder step 2
- [ ] Delete with confirmation dialog
- [ ] Empty state (*"Your garden is empty"* + CTA)
- [ ] Loading/error states for image export and share actions

### Phase 7 — Polish
- [ ] Smooth drag-and-drop animations
- [ ] Step transition animations
- [ ] Mobile/touch optimization (canvas scaling, stacked layouts, tap vs drag)
- [ ] OG meta tags (static)
- [ ] Final design pass — spacing, typography, colors, hover states
- [ ] Verify all loading spinners, toasts, and error states are working across all pages

---

## Edge Cases
- URL too long for 6 flowers + 100-word note (test lz-string output length)
- Corrupted/tampered URL data on viewer page (strict validation rejects it)
- Malicious URL with oversized payload (validation caps at 6 flowers, 1000 char note)
- XSS attempt in note text (React JSX escaping prevents it, never use dangerouslySetInnerHTML)
- Prototype pollution in JSON.parse (validation function checks exact shape, rejects unknown keys)
- localStorage full (warn user when saving to garden, catch quota exceeded error)
- Google Font fails to load (monospace UI font + DM Sans — add CSS fallbacks: monospace for UI, sans-serif for notes)
- Word count at exactly 100 (block further input, don't truncate mid-word)
- Canvas dimensions differ between creator and viewer screens (fixed 800x600, scale with CSS transform on small screens)
- Web Share API not supported (fallback to clipboard copy with toast notification)
- html-to-image fails on certain browsers (show friendly "take a screenshot" message)
- All 6 flowers are the same type (arrangement should still spread them out)
- User refreshes browser on step 2 (beforeunload warning, builder state lost if they proceed)
- Viewer tries to "Save to Garden" with a full localStorage (handle quota exceeded gracefully)
- Note positioned outside canvas after a drag bug (clamp on every drag end)
- User clicks "Create New" on step 3 without saving (in-app confirmation modal)
- Editing a garden bouquet and saving overwrites the original (tracked via editingBouquetId)
- Viewer saves same shared bouquet twice (creates two entries — acceptable, no dedup needed)
- "Save as Photo" takes too long on low-end device (loading spinner on button, timeout after 10s with error toast)
- Error boundary catches render crash in canvas (shows fallback UI instead of white screen)

## Resolved Questions
- **Flower meanings**: Not displayed. Removed from types. Keep it simple.
- **Flower sizes**: All flowers same standard size (exact px decided during coding).
- **Note editing**: "Edit Note" button when note exists. Modal has Done/Cancel/Delete Note.
- **Save timing**: Save to Garden happens on Step 3 only (not Step 2).
- **Canvas size**: 800x600 (4:3 ratio), scales with CSS transform on mobile.
- **Fonts**: Monospace (Courier Prime / IBM Plex Mono) for all UI. DM Sans for note card text only. Font picker for notes can be added later.
- **UUID**: `crypto.randomUUID()` — no extra dependency.
- **Drag library**: @dnd-kit/core with useDraggable (free-form positioning, not sortable).
- **Image export**: html-to-image (`toPng()`).
- **Thumbnails**: Re-render at small scale, no note shown, no images saved in localStorage.
- **Accessibility**: Mouse/touch only (no keyboard drag). Mobile-friendly from the start.
- **Greenery**: 500x500px assets, centered on canvas (x:150, y:50), always behind flowers (z-index 0).
- **Unsaved work**: `beforeunload` for browser navigation + in-app confirmation modal for "Create New" / "Go to Garden".
- **No flower delete**: Flowers cannot be removed from canvas. Go BACK to step 1 to change selection.
- **BACK from step 2**: Resets placedFlowers. Cart is source of truth. Note text preserved, position reset on re-entry.
- **Z-index layering**: Greenery (0) < Flowers (1 to N, sequential) < Note (N+1). Bring to Front / Send to Back swaps with adjacent flower. Buttons disable at limits.
- **Garden edit tracking**: `editingBouquetId` in BuilderState. Edit also populates cart from PlacedFlower[]. Save to Garden updates existing bouquet if editing, creates new if not.
- **Garden thumbnails**: Full canvas shrunk (greenery + flowers). Note not shown.
- **Step 1 navigation**: No BACK button. Navbar has clickable title → home, garden icon → garden. Browser back works.
- **Unsaved work modal**: "Save to garden before leaving?" — Save & Leave / Leave Without Saving / Cancel. No partial saves.
- **URL optimization**: Flower IDs, canvasWidth, canvasHeight stripped from URL. Regenerated on decode.
- **Note dimensions**: 200px wide, height auto. Always on top of all flowers.
- **Mobile touch**: Tap = select (show controls), press+drag = move, tap canvas = deselect.
- **Error boundaries**: Wrap BuilderPage, ViewerPage, GardenPage with error boundaries for crash recovery.
- **Loading/feedback**: All async actions (Save as Photo, Share, Save to Garden) show loading spinners and success/error toasts.
- **compression.ts**: Thin lz-string wrapper in `src/utils/`. Called by encoder.ts and decoder.ts.

- **Note default position**: Bottom-center of canvas `(300, 480)`. Avoids greenery overlap, visible immediately.
- **BACK from step 3**: Preserves all state (placedFlowers, note, greenery unchanged). User continues editing.
- **Greenery default**: `'none'` — no greenery by default, letting users be creative. Dropdown options: None, Bush, Monstera, Sprigs.
- **App name / logo**: "DigiBouquet" rendered in Pinyon Script (calligraphic Google Font). Just styled text, no image/SVG.
- **createdAt on garden edit**: Preserved (keeps original date). Helps with sorting garden by newest first.
- **Progressive thumbnails**: Lazy rendering via `IntersectionObserver`. Placeholder until scrolled into view. No extra library.

## Open Questions
- Where do we source the 9 flower illustrations + greenery assets? (hand-draw, AI-generate, open-source?)
