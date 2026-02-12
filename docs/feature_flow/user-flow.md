# Feature Flow: User Navigation & State Management

## Overview
Digital Bouquet is a client-side React app with a 5-page structure: landing, 3-step builder wizard, garden collection, and viewer. All navigation is handled via React Router v6, with Redux managing ephemeral builder state and persisted garden state.

---

## Visual Flow Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            HomePage (/)                                       │
│                                                                               │
│  [Start Creating] ───────────────────────┐                                   │
│  [My Collection] (if garden not empty) ──┼─────────┐                         │
│                                           │         │                         │
└───────────────────────────────────────────┼─────────┼─────────────────────────┘
                                            │         │
                     ┌──────────────────────┘         └──────────┐
                     │                                           │
                     ▼                                           ▼
        ┌──────────────────────────┐              ┌──────────────────────────┐
        │   Step 1: Pick Flowers   │              │   GardenPage (/garden)   │
        │    (/build/pick)          │              │                          │
        │                           │              │  [Edit] ──────────┐      │
        │  [NEXT] ─────────────┐    │              │  [Delete]         │      │
        └──────────────────────┼────┘              │  [Photo]          │      │
                               │                   │  [Share]          │      │
                               ▼                   └───────────────────┼──────┘
        ┌──────────────────────────┐                                  │
        │  Step 2: Arrange Bouquet │◄─────────────────────────────────┘
        │   (/build/arrange)        │
        │                           │
        │  [BACK] ──────────────┐   │
        │  [NEXT] ───────────┐  │   │
        └────────────────────┼──┼───┘
                             │  │
                   ┌─────────┘  └──────────┐
                   │                       │
        goBackToStep1()              (proceed)
        - resets placedFlowers             │
        - keeps cart + note text           │
                   │                       │
                   └───┐                   ▼
                       │    ┌──────────────────────────┐
                       │    │  Step 3: Preview & Share │
                       │    │   (/build/preview)        │
                       │    │                           │
                       │    │  [BACK] ──────────────────┼──────┐
                       │    │  [Save to Garden]         │      │
                       │    │  [Share]                  │      │
                       │    │  [Photo]                  │      │
                       └────┤  [Create New]             │      │
                            │  [View Garden]            │      │
                            └───────────┬───────────────┘      │
                                        │                      │
                            ┌───────────┘                      │
                            │   Unsaved work modal?            │
                            │   - Save & Leave                 │
                            │   - Leave Without Saving         │
                            │   - Cancel                       │
                            │                                  │
                            ▼                                  │
                   resetBuilder() + navigate              (direct nav)
                                                               │
                                                               ▼
                                                        (arranges flowers)
                                                               │
                                                   (no modal — changes kept)

┌──────────────────────────────────────────────────────────────────────────────┐
│                     ViewerPage (/view?d=<data>)                               │
│                                                                               │
│  Decoded shared bouquet                                                      │
│  [Create Your Own] (prompts save if not saved)                               │
│  [Save to Garden]                                                            │
│  [Save as Photo]                                                             │
│  [About Me]                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Application Bootstrap

### Entry Point: `src/main.tsx`
Wraps the entire app in the following provider hierarchy (innermost to outermost):

1. **React.StrictMode** — development checks
2. **Redux Provider** — global state via `store` from `src/app/store.ts`
3. **PersistGate** — blocks render until garden state rehydrates from localStorage
4. **BrowserRouter** — routing context (reads `import.meta.env.BASE_URL` for deployment)
5. **ToastProvider** — global toast notification context (from `src/components/Toast.tsx`)

All pages render after PersistGate confirms garden data is loaded.

---

## Route Configuration

### Routes: `src/App.tsx`
Every route is wrapped in `<Layout />` (navbar + footer shell) and `<ErrorBoundary />` for crash recovery.

| Route              | Component      | Description                                   | Guard                               |
|--------------------|----------------|-----------------------------------------------|-------------------------------------|
| `/`                | HomePage       | Landing with CTAs                             | None                                |
| `/build`           | BuilderPage    | Wizard shell (renders nested routes)          | None                                |
| `/build/pick`      | Step1          | Flower selection grid + cart                  | None                                |
| `/build/arrange`   | Step2          | Canvas arrangement                            | Redirects to `/` if no flowers      |
| `/build/preview`   | Step3          | Preview + share/save actions                  | Redirects to `/` if no flowers      |
| `/garden`          | GardenPage     | Saved bouquets collection                     | None                                |
| `/view?d=<data>`   | ViewerPage     | Shared bouquet decoded from URL               | None (shows error if invalid data)  |
| `/about`           | AboutPage      | About the creator                             | None                                |

**Builder Index Route:** `/build` redirects to `/build/pick` via `<Navigate to="pick" replace />`

---

## Page-by-Page Flow

### 1. HomePage (`src/pages/HomePage.tsx`)

**Purpose:** Landing page with CTAs to start creating or view garden.

**State Dependencies:**
- Reads `selectGardenIsEmpty` from Redux to conditionally show "My Collection" button

**User Actions:**
- **"Start Creating"** → navigates to `/build/pick`
- **"My Collection"** (only visible if garden has bouquets) → navigates to `/garden`

**Visual Details:**
- Decorative flower images hidden on mobile (`sm:block`) to avoid CTA overlap
- Logo in Pinyon Script font
- Step preview flow (Pick → Arrange → Share)
- Warm rose-toned buttons

---

### 2. BuilderPage (`src/pages/BuilderPage.tsx`)

**Purpose:** Shell container for the 3-step wizard. Manages unsaved-work protection via `beforeunload`.

**State Dependencies:**
- `hasPlacedFlowers` — checks `builder.placedFlowers.length > 0`
- `isSaved` — checks `builder.isSavedToGarden`

**Behavior:**
- Registers `beforeunload` listener when `hasPlacedFlowers && !isSaved` → browser shows confirmation dialog on refresh/close
- Renders `<Outlet />` for nested routes (Step1, Step2, Step3)

**Notes:**
- Browser-level navigation protection only (tab close, refresh, back button)
- In-app navigation uses custom modal (handled in Step3)

---

### 3. Step 1 — Pick Flowers (`src/features/builder/Step1.tsx`)

**Purpose:** Flower selection via 3x3 grid + cart sidebar.

**State Dependencies:**
- `builder.cart` — array of `{ type: FlowerType, count: number }`

**User Actions:**
- Click flower tile → dispatches `addToCart(type)` (max 6 flowers total)
- Cart: `+` increments, `-` decrements via `incrementCartItem` / `decrementCartItem`
- **NEXT** (enabled when `cart.length > 0`) → navigates to `/build/arrange`

**Notes:**
- No BACK button (first step)
- Subtitle dynamically updates when 6 flowers selected

**Key Components:**
- `FlowerGrid` — 3x3 grid of flower tiles
- `Cart` — sidebar with +/- controls + NEXT button

---

### 4. Step 2 — Arrange Bouquet (`src/features/builder/Step2.tsx`)

**Purpose:** Drag-and-drop canvas with greenery selector and note editor.

**State Dependencies:**
- `builder.cart` — source for initial placement
- `builder.placedFlowers` — canvas flower positions
- `builder.note` — note text + position
- `builder.greenery` — background foliage type

**Guard:**
- On mount, checks if `cart.length === 0 && placedFlowers.length === 0`
- If true, redirects to `/` with `replace: true` (prevents direct URL access without flowers)

**Initial Placement:**
- On mount, if `placedFlowers.length === 0`, calls `generatePlacements(cart)` from `PlacementEngine`
- Generates fan-pattern positions
- Dispatches `setPlacedFlowers(placements)` to populate canvas

**User Actions:**
- Drag flowers → dispatches `updateFlowerPosition({ id, x, y })`
- Click flower → dispatches `bringToTop(id)` to move to front layer
- **Greenery dropdown** → dispatches `setGreenery(type)`
- **Add/Edit Note** → opens `NoteModal` → dispatches `setNote({ text, fontFamily, x, y })`
- Drag note card → dispatches `updateNotePosition({ x, y })`
- **BACK** → dispatches `goBackToStep1()` + navigates to `/build/pick`
- **NEXT** → navigates to `/build/preview`

**goBackToStep1() Behavior:**
- Resets `placedFlowers` to `[]`
- Keeps `cart` + note text intact
- Resets note position to default (`DEFAULT_NOTE_POSITION`)
- User can re-pick flowers or proceed to Step 2 again with same cart

**Key Components:**
- `BouquetCanvas` — drag-and-drop via @dnd-kit
- `GreenerySelector` — dropdown for background foliage
- `NoteModal` — textarea editor (100 words max)
- `NoteCard` — draggable note card rendered on canvas
- `PlacementEngine.ts` — generates random fan-pattern positions

---

### 5. Step 3 — Preview & Share (`src/features/builder/Step3.tsx`)

**Purpose:** Read-only preview with save/share/export actions. Handles unsaved-work warnings for in-app navigation.

**State Dependencies:**
- `builder.placedFlowers`, `builder.note`, `builder.greenery` — bouquet content
- `builder.editingBouquetId` — if editing existing bouquet (non-null)
- `builder.isSavedToGarden` — Redux flag for save status
- `searchParams.get('saved')` — URL param for recovery after refresh
- `gardenBouquets` — check if bouquet exists in garden

**Guard:**
- On mount, checks if `placedFlowers.length === 0 && !gardenBouquet`
- If true, redirects to `/` with `replace: true`

**Recovery from Refresh:**
- If URL contains `?saved=<id>`, loads bouquet from garden instead of redirecting
- Allows user to refresh Step 3 without losing state

**Stable IDs:**
- Generates `bouquetId` and `createdAt` once per mount using `useState(() => ...)`
- Prevents ID regeneration on BACK → NEXT (stable across re-renders)

**Derived State:**
- `isSaved = isSavedInRedux || !!gardenBouquet` — true if saved this session OR recovered from garden

**User Actions:**
- **BACK** → direct navigation to `/build/arrange` (no modal, changes preserved)
- **Save to Garden** → dispatches `saveBouquet(bouquet)` + `markSaved()` + sets URL param `?saved=<id>` → toast
- **Share** → calls `generateShareLink(bouquet)` → tries native Web Share API → falls back to clipboard
- **Save as Photo** → exports via `html-to-image` (from `imageExport.ts`)
- **Create New** → if saved, resets builder + navigates to `/build/pick`; else shows unsaved modal
- **View Garden** → if saved, resets builder + navigates to `/garden`; else shows unsaved modal

**Unsaved Work Modal** (shown when `leaveTarget !== null`):
- Triggered by "Create New" or "View Garden" when `!isSaved`
- Options:
  - **Save & Leave** → saves to garden, then navigates
  - **Leave Without Saving** → navigates immediately (builder state lost)
  - **Cancel** → closes modal, stays on preview

**Key Components:**
- `BouquetPreview` — read-only canvas (from `src/features/builder/BouquetPreview.tsx`)
- `ShareActions` — share/photo/save buttons (from `src/features/share/ShareActions.tsx`)
- `UnsavedWorkModal` — custom modal for in-app navigation warnings

**Notes:**
- Responsive scaling: canvas scales to fit mobile screens via CSS transform
- Storage check: `hasStorageRoom()` before save (LocalStorage quota limit)

---

### 6. GardenPage (`src/pages/GardenPage.tsx`)

**Purpose:** Displays saved bouquets in a scrollable grid.

**State Dependencies:**
- `selectAllBouquets` — sorted newest-first from `garden.bouquets`
- `selectGardenIsEmpty` — boolean check for empty state

**User Actions:**
- Click bouquet thumbnail → opens `PreviewModal` with actions:
  - **Edit** → dispatches `loadBouquetForEditing(bouquet)` + navigates to `/build/arrange`
  - **Photo** → exports via `exportAsImage()`
  - **Share** → generates share link via `generateShareLink()`
  - **Delete** → dispatches `deleteBouquet(id)` + toast confirmation
- **Create a Bouquet** (empty state CTA) → navigates to `/build`
- **Back to Home** → navigates to `/`

**loadBouquetForEditing() Behavior:**
- Sets `editingBouquetId = bouquet.id`
- Populates `placedFlowers`, `note`, `greenery`, `canvasWidth`, `canvasHeight`
- Derives `cart` from `placedFlowers` by counting each flower type
- Sets `step = 2` → user lands on `/build/arrange` directly

**Key Components:**
- `GardenGrid` — responsive grid layout
- `PreviewModal` — modal with full-size preview + actions

---

### 7. ViewerPage (`src/pages/ViewerPage.tsx`)

**Purpose:** Displays a shared bouquet decoded from the URL query param.

**State Machine:**
- `'loading'` → shows "Unwrapping your bouquet..." (400ms delay)
- `'error'` → shows "This bouquet link seems to be broken" + CTA to create own
- `'success'` → renders bouquet preview with actions

**State Dependencies:**
- `searchParams.get('d')` — compressed bouquet data
- `gardenBouquets` — check if bouquet already exists via `bouquetsMatch()`

**Decoder Flow:**
- Reads `?d=<data>` → calls `decodeBouquet(data)` after 400ms loading delay
- Returns `Bouquet | null` (null = invalid data)
- Regenerates flower IDs via `crypto.randomUUID()` (IDs stripped from URL for compression)

**Content Matching:**
- `bouquetsMatch(a, b)` compares greenery, flower count, flower positions (type+x+y), note text
- Ignores IDs (which are regenerated on decode)
- Used to check if bouquet already exists in garden

**Derived State:**
- `isSaved = justSaved || alreadyInGarden` — true if saved this session OR was already in garden on load

**User Actions:**
- **Create Your Own** → if saved, navigates to `/`; else shows leave modal
- **Save to Garden** → dispatches `saveBouquet(bouquet)` → sets `justSaved = true` → toast
- **Save as Photo** → exports via `exportAsImage()` (can also be done from leave modal)
- **About Me** → navigates to `/about`

**Leave Modal** (shown when "Create Your Own" clicked while unsaved):
- Prompt: "Someone made this bouquet for you. Won't you like to save it?"
- Options:
  - **Save to Garden** → saves, then button changes to "View Garden"
  - **Save as Photo** → exports image, closes modal
  - **No, I don't want to save** → navigates to `/` immediately

**Notes:**
- Heading: "You are special to me" (warm, personal tone for shared bouquets)
- After saving, "Save to Garden" button changes to "View Garden"

---

## Navigation Guards & State Protection

### 1. Route Guards (Direct URL Access)
- **Step2 (`/build/arrange`)** → redirects to `/` if `cart.length === 0 && placedFlowers.length === 0`
- **Step3 (`/build/preview`)** → redirects to `/` if `placedFlowers.length === 0 && !gardenBouquet`

### 2. Unsaved Work Protection

#### Browser Navigation (BuilderPage)
- Registers `beforeunload` event listener when `hasPlacedFlowers && !isSaved`
- Shows browser default confirmation dialog on:
  - Tab close
  - Refresh
  - Back button
  - External navigation

#### In-App Navigation (Step3, ViewerPage)
- **Step3:** Shows `UnsavedWorkModal` when clicking "Create New" or "View Garden" if `!isSaved`
- **ViewerPage:** Shows leave modal when clicking "Create Your Own" if `!isSaved`
- **Step2 → Step1 (BACK):** No modal (changes intentionally discarded via `goBackToStep1()`)
- **Step3 → Step2 (BACK):** No modal (changes preserved, direct navigation)

### 3. Recovery After Refresh

#### Step3 Recovery
- If URL contains `?saved=<id>`, loads bouquet from garden instead of redirecting to `/`
- Allows user to refresh Step 3 without losing state
- Set via `setSearchParams({ saved: bouquet.id })` after save

---

## Builder State Lifecycle

### New Bouquet Flow
```
HomePage → Step1 (pick) → Step2 (arrange) → Step3 (preview) → saveBouquet() → markSaved()
                                                               ↓
                                                    setSearchParams({ saved: id })
```

### Edit Existing Bouquet Flow
```
GardenPage → [Edit] → loadBouquetForEditing() → Step2 (arrange) → Step3 (preview) → saveBouquet() (updates existing)
                                                                                      ↓
                                                                          setSearchParams({ saved: id })
```

### BACK to Step1 Flow
```
Step2 → [BACK] → goBackToStep1() → Step1
                     ↓
              Resets:
              - placedFlowers = []
              - note.x/y = DEFAULT_NOTE_POSITION
              Keeps:
              - cart (flower selection)
              - note.text + note.fontFamily
```

### Unsaved Work → Leave Without Saving
```
Step3 → [Create New] → UnsavedWorkModal → [Leave Without Saving] → resetBuilder() → Step1
                                                                       ↓
                                                            All builder state cleared
```

---

## Redux Slices

### Builder Slice (`src/features/builder/builderSlice.ts`)
**NOT persisted** — resets on page refresh.

| State Field         | Type                | Purpose                                    |
|---------------------|---------------------|--------------------------------------------|
| `step`              | `1 \| 2 \| 3`       | Current wizard step (NOT used for routing) |
| `cart`              | `CartFlower[]`      | Selected flowers before placement          |
| `placedFlowers`     | `PlacedFlower[]`    | Canvas flower positions (id, type, x, y, z)|
| `note`              | `Note \| null`      | Note text + position + font                |
| `greenery`          | `GreeneryType`      | Background foliage style                   |
| `editingBouquetId`  | `string \| null`    | Garden bouquet being edited (null = new)   |
| `canvasWidth`       | `number`            | 800 (fixed)                                |
| `canvasHeight`      | `number`            | 600 (fixed)                                |
| `isSavedToGarden`   | `boolean`           | Flag for unsaved work protection           |

**Key Reducers:**
- `addToCart(type)` — add flower to cart (max 6 total)
- `incrementCartItem(type)` / `decrementCartItem(type)` — +/- controls
- `setPlacedFlowers(placements)` — replace all canvas flowers
- `updateFlowerPosition({ id, x, y })` — update flower position after drag
- `bringToTop(id)` — move flower to top z-index layer
- `setNote(note)` / `updateNotePosition({ x, y })` — note management
- `setGreenery(type)` — change background foliage
- `loadBouquetForEditing(bouquet)` — populate builder from garden bouquet
- `goBackToStep1()` — reset placedFlowers, keep cart + note text
- `resetBuilder()` — full reset (new bouquet)
- `markSaved()` — set `isSavedToGarden = true`

### Garden Slice (`src/features/garden/gardenSlice.ts`)
**Persisted** via redux-persist to localStorage.

| State Field | Type       | Purpose                        |
|-------------|------------|--------------------------------|
| `bouquets`  | `Bouquet[]`| Array of saved bouquets        |

**Key Reducers:**
- `saveBouquet(bouquet)` — add or update bouquet (checks `editingBouquetId`)
- `deleteBouquet(id)` — remove bouquet by ID

**Selectors:**
- `selectAllBouquets` — returns `bouquets` sorted newest-first
- `selectGardenIsEmpty` — returns `bouquets.length === 0`

---

## Key Files Reference

| File                                              | Role                                          |
|---------------------------------------------------|-----------------------------------------------|
| `src/main.tsx`                                    | App entry point (Redux + routing + persist)   |
| `src/App.tsx`                                     | Route configuration + Layout + ErrorBoundary  |
| `src/app/store.ts`                                | Redux store setup + redux-persist config      |
| `src/types/index.ts`                              | All TypeScript interfaces                     |
| `src/data/flowers.ts`                             | Constants (CANVAS_WIDTH, MAX_FLOWERS, etc.)   |
| `src/pages/HomePage.tsx`                          | Landing page                                  |
| `src/pages/BuilderPage.tsx`                       | Wizard shell + beforeunload protection        |
| `src/features/builder/Step1.tsx`                  | Flower selection grid + cart                  |
| `src/features/builder/Step2.tsx`                  | Canvas arrangement + greenery + note          |
| `src/features/builder/Step3.tsx`                  | Preview + share/save + unsaved modal          |
| `src/pages/GardenPage.tsx`                        | Saved bouquets grid                           |
| `src/pages/ViewerPage.tsx`                        | Shared bouquet viewer                         |
| `src/features/builder/builderSlice.ts`            | Builder Redux slice (ephemeral)               |
| `src/features/garden/gardenSlice.ts`              | Garden Redux slice (persisted)                |
| `src/features/builder/PlacementEngine.ts`         | Random flower positioning logic               |
| `src/features/share/encoder.ts`                   | Bouquet → URL compression                     |
| `src/features/share/decoder.ts`                   | URL → Bouquet decompression + validation      |
| `src/features/share/imageExport.ts`               | html-to-image wrapper for Save as Photo       |
| `src/features/builder/BouquetPreview.tsx`         | Read-only canvas preview component            |
| `src/features/builder/UnsavedWorkModal.tsx`       | In-app unsaved work warning modal             |
| `src/components/Layout.tsx`                       | Navbar + footer shell                         |
| `src/components/ErrorBoundary.tsx`                | Crash recovery wrapper                        |
| `src/components/Toast.tsx`                        | Global toast notification provider            |
| `src/utils/storage.ts`                            | LocalStorage quota check (`hasStorageRoom`)   |

---

## Design & UX Notes

### Routing Philosophy
- **URL = Step** — each wizard step has a distinct URL for:
  - Direct linking (e.g., share `/build/arrange` link for debug)
  - Browser back button support
  - Refresh recovery (via guards + URL params)

### Unsaved Work Philosophy
- **Browser navigation** (refresh/close) → browser-level `beforeunload` dialog
- **In-app navigation** (Create New, View Garden) → custom modal with Save & Leave / Leave Without Saving / Cancel
- **BACK buttons** → no modal (changes intentionally kept or discarded based on context)

### State Persistence
- **Ephemeral:** Builder state resets on refresh (intentional — keeps app stateless)
- **Persistent:** Garden bouquets survive refresh (localStorage via redux-persist)
- **Recovery:** Step3 uses `?saved=<id>` URL param to recover after save + refresh

### Responsive Scaling
- Canvas is fixed 800x600 (4:3 ratio)
- Preview scales via CSS `transform: scale(${scale})` to fit mobile screens
- Scale calculated from `Math.min(1, availableWidth / 800, availableHeight / 600)`

### Error Handling
- **Invalid share link** → ViewerPage shows error state with CTA to create own
- **Direct URL access without flowers** → Step2/Step3 redirect to `/` with `replace: true`
- **Storage quota full** → Toast error, user must delete old bouquets
- **Export failure** → Toast error, suggests screenshot as fallback

---

## Common Developer Tasks

### Adding a New Step to Builder
1. Create new step component in `src/features/builder/`
2. Add route to `src/App.tsx` under `/build` parent
3. Update `builderSlice.ts` `step` type if needed (currently `1 | 2 | 3`)
4. Add navigation logic in previous step

### Modifying Navigation Guards
- Edit `useEffect` hooks in `Step2.tsx` / `Step3.tsx` for route guards
- Edit `BuilderPage.tsx` for `beforeunload` logic
- Edit `handleLeaveAttempt()` in `Step3.tsx` for unsaved modal logic

### Changing Persistence Behavior
- Edit `src/app/store.ts` `persistConfig` to add/remove slices from whitelist
- Currently only `garden` is persisted; `builder` is intentionally ephemeral

### Debugging State Issues
- Use Redux DevTools to inspect `builder` and `garden` slices
- Check `?saved=<id>` URL param in Step3 for recovery state
- Check `isSavedToGarden` flag in builder slice for unsaved work protection
- Check `editingBouquetId` to distinguish new vs. edit flow

### Testing User Flows
- **New bouquet:** Start → Pick → Arrange → Preview → Save → Refresh Step3 (should recover via `?saved=<id>`)
- **Edit bouquet:** Garden → Edit → Arrange → Preview → Save (should update existing)
- **Unsaved work:** Arrange → Preview → Create New (should show modal)
- **BACK from Step2:** Arrange → BACK → Pick (should reset placedFlowers, keep cart)
- **Share link:** Step3 → Share → Open in incognito (should decode correctly)
