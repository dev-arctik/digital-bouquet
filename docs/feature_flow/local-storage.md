# Feature Flow: Local Storage & Data Persistence

## Overview
Digital Bouquet has no backend. All persistent user data lives in the browser's localStorage via redux-persist. Only saved bouquets (garden) are persisted. Active wizard sessions (builder) are ephemeral and reset on page refresh or navigation.

## Persistent vs Ephemeral State

```
Redux State Tree
├── builder: BuilderState     ❌ NOT persisted — resets on refresh
└── garden: GardenState        ✅ PERSISTED to localStorage
```

**Builder** (ephemeral wizard session):
- Active step, flower cart, placed flowers, note, greenery selection
- Resets on `resetBuilder()` or page refresh
- Unsaved work warnings prevent accidental loss

**Garden** (persistent collection):
- Array of saved bouquets
- Survives page refresh, browser restart, and navigation
- Backed by localStorage key: `persist:garden`

---

## Technical Flow

### App Initialization

```
Browser loads → React renders → Redux Provider wraps app
                                      ↓
                              PersistGate waits
                                      ↓
                        redux-persist reads localStorage
                                      ↓
                        Rehydrates garden slice
                                      ↓
                        Garden data available ✅
                                      ↓
                        App renders with saved bouquets
```

File: `src/main.tsx`

Component tree:
```jsx
<StrictMode>
  <Provider store={store}>                // Redux
    <PersistGate loading={null} persistor={persistor}>  // Blocks render until garden loads
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
</StrictMode>
```

PersistGate ensures garden data is available before any component tries to read it. No loading state needed in components.

---

## Redux Store Setup

File: `src/app/store.ts`

### Persistence Config

```typescript
const gardenPersistConfig = {
  key: 'garden',              // localStorage key: 'persist:garden'
  storage,                    // redux-persist/lib/storage (wraps localStorage)
};
```

**Only the garden slice is wrapped**:
```typescript
const rootReducer = combineReducers({
  builder: builderReducer,                                 // ❌ NOT persisted
  garden: persistReducer(gardenPersistConfig, gardenReducer),  // ✅ PERSISTED
});
```

**Middleware config**:
```typescript
serializableCheck: {
  ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
}
```
Prevents Redux DevTools warnings about redux-persist's internal actions.

### What's Actually Stored

localStorage key: `persist:garden`

Value structure:
```json
{
  "bouquets": "[{\"id\":\"abc-123\",\"flowers\":[...],\"note\":{...},\"greenery\":\"bush\",\"canvasWidth\":800,\"canvasHeight\":600,\"createdAt\":\"2026-02-12T10:30:00.000Z\"},...]",
  "_persist": "{\"version\":-1,\"rehydrated\":true}"
}
```

Each bouquet contains:
- `id` — UUID, stable across edits
- `flowers` — array of PlacedFlower (id, type, x, y, zIndex)
- `note` — Note object or null (text, fontFamily, x, y)
- `greenery` — GreeneryType ('bush' | 'monstera' | 'sprigs' | 'none')
- `canvasWidth` / `canvasHeight` — fixed at 800x600
- `createdAt` — ISO timestamp, preserved across edits

---

## Garden Slice: State & Actions

File: `src/features/garden/gardenSlice.ts`

### State Shape
```typescript
interface GardenState {
  bouquets: Bouquet[];  // Array of saved bouquets
}
```

### Actions

#### 1. `saveBouquet(bouquet: Bouquet)`

**Logic**:
1. Search for existing bouquet with same `id`
2. If found → update in place BUT preserve original `createdAt`
3. If not found → push as new entry

**Use cases**:
- Save new bouquet from Step3
- Save edited bouquet (same ID, keeps original creation date)
- Save shared bouquet from ViewerPage (new ID, new date)

**Code**:
```typescript
const existingIndex = state.bouquets.findIndex((b) => b.id === incoming.id);

if (existingIndex !== -1) {
  // Edit: preserve original date
  state.bouquets[existingIndex] = {
    ...incoming,
    createdAt: state.bouquets[existingIndex]?.createdAt ?? incoming.createdAt,
  };
} else {
  // New: push with current date
  state.bouquets.push(incoming);
}
```

#### 2. `deleteBouquet(id: string)`

**Logic**: Filter out bouquet by ID

**Use cases**: Garden preview modal "Delete" button

**Code**:
```typescript
state.bouquets = state.bouquets.filter((b) => b.id !== action.payload);
```

### Selectors (Memoized)

#### `selectAllBouquets`
Returns all bouquets sorted newest-first by `createdAt`. Memoized to avoid new array on every render (only recomputes if bouquets array reference changes).

#### `selectGardenIsEmpty`
Returns `bouquets.length === 0`. Used to conditionally show/hide "My Collection" buttons across the app.

#### `selectBouquetById(id)`
Curried selector: `(id) => (state) => Bouquet | undefined`. Used for edit flow and Step3 refresh recovery.

---

## Builder Slice: Lifecycle

File: `src/features/builder/builderSlice.ts`

### Key State Fields

```typescript
interface BuilderState {
  step: 1 | 2 | 3;
  cart: CartFlower[];
  placedFlowers: PlacedFlower[];
  note: Note | null;
  greenery: GreeneryType;
  editingBouquetId: string | null;   // If editing garden bouquet
  canvasWidth: number;                // 800
  canvasHeight: number;               // 600
  isSavedToGarden: boolean;           // Suppresses beforeunload if true
}
```

### Lifecycle Reducers

#### 1. `resetBuilder()`
Full wipe to `initialState` with fresh random greenery. Called on:
- "Create New" button (Step3)
- "Leave Without Saving" (UnsavedWorkModal)
- Navigation to `/build/pick` after saving

#### 2. `goBackToStep1()`
Partial reset:
- Preserves: `cart`, `note.text`, `note.fontFamily`
- Resets: `placedFlowers` (cleared), `note.x/y` (back to default position)
- Use case: BACK button from Step2 → return to flower selection, keep cart + note text

#### 3. `loadBouquetForEditing(bouquet: Bouquet)`
Populates builder from garden bouquet:
- Sets all fields from bouquet (flowers, note, greenery, canvas dimensions)
- Derives `cart` by counting flower types in `bouquet.flowers`
- Sets `editingBouquetId` to track which garden bouquet is being modified
- Jumps to step 2 (arrangement page)

#### 4. `markSaved()`
Sets `isSavedToGarden = true`. Called after successful `saveBouquet()`. Suppresses `beforeunload` warning in BuilderPage.

---

## Storage Quota Management

File: `src/utils/storage.ts`

### `hasStorageRoom(estimatedBytes = 50_000)`

**Purpose**: Pre-check before every save to avoid localStorage quota exceeded errors.

**Algorithm**:
1. Iterate all localStorage keys
2. Sum `key.length + value.length` (characters, not bytes)
3. Check: `(used + estimate) * 2 < 5_000_000`
4. Return `false` if over quota or on any exception

**Browser limits**: ~5MB localStorage (~5,242,880 characters). Typical bouquet: 2-5KB JSON.

**Called from**:
- `Step3.tsx` → before `saveBouquet()`
- `ViewerPage.tsx` → before `saveBouquet()`

**On failure**: Shows toast "STORAGE IS FULL. TRY DELETING OLD BOUQUETS FIRST." — save aborted.

**Code**:
```typescript
try {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += key.length + (localStorage.getItem(key)?.length ?? 0);
    }
  }
  return (used + estimatedBytes) * 2 < 5_000_000;
} catch {
  return false;  // Private browsing or disabled localStorage
}
```

---

## Save Flow

### Step3: Save New or Edited Bouquet

File: `src/features/builder/Step3.tsx`

**Flow**:
```
User clicks "Save to Garden"
    ↓
hasStorageRoom() check
    ↓ (if false)
Toast: "STORAGE IS FULL"
    ↓ (if true)
dispatch(saveBouquet(bouquet))
    ↓
dispatch(markSaved())
    ↓
setSearchParams({ saved: bouquet.id })  // Persist ID in URL for refresh recovery
    ↓
Toast: "BOUQUET SAVED TO GARDEN!"
    ↓
redux-persist → writes to localStorage
```

**Bouquet ID generation**:
```typescript
// Stable ID across BACK+NEXT cycles (generated once per mount)
const [bouquetId] = useState(
  () => gardenBouquet?.id ?? builder.editingBouquetId ?? crypto.randomUUID()
);
```

**Refresh recovery**:
After save, URL has `?saved=<bouquetId>`. On refresh:
1. Builder state is wiped (ephemeral)
2. Step3 reads `?saved` param
3. Fetches bouquet from garden by ID
4. Renders from garden data instead of builder state

### ViewerPage: Save Shared Bouquet

File: `src/pages/ViewerPage.tsx`

**Flow**:
```
User clicks "Save to Garden"
    ↓
hasStorageRoom() check
    ↓ (if false)
Toast: "STORAGE IS FULL"
    ↓ (if true)
dispatch(saveBouquet(bouquet))  // Decoded bouquet with fresh ID
    ↓
setJustSaved(true)  // Local flag to show "Already Saved" state
    ↓
Toast: "BOUQUET SAVED TO GARDEN!"
    ↓
redux-persist → writes to localStorage
```

**Duplicate detection**:
ViewerPage checks if bouquet already exists in garden using `bouquetsMatch()`:
```typescript
const bouquetsMatch = (a: Bouquet, b: Bouquet): boolean => {
  if (a.greenery !== b.greenery) return false;
  if (a.flowers.length !== b.flowers.length) return false;
  if ((a.note?.text ?? '') !== (b.note?.text ?? '')) return false;

  // Compare flowers by type + position (order-independent, IDs ignored)
  const key = (f) => `${f.type}:${f.x}:${f.y}`;
  const aKeys = new Set(a.flowers.map(key));
  return b.flowers.every((f) => aKeys.has(key(f)));
};
```

IDs are ignored because they're regenerated on URL decode. Comparison is purely content-based (greenery, flower count, positions, note text).

---

## Load Flow

### Garden Load on App Start

```
App mounts → PersistGate
                ↓
          redux-persist reads localStorage['persist:garden']
                ↓
          JSON.parse(bouquets string)
                ↓
          Rehydrates garden slice with parsed array
                ↓
          GardenPage/HomePage/BuilderPage can now read garden.bouquets
```

### Edit Flow: Garden → Builder

```
GardenPage: User clicks "Edit" in preview modal
    ↓
dispatch(loadBouquetForEditing(bouquet))
    ↓
builderSlice: Sets editingBouquetId, populates flowers/note/greenery/cart, jumps to step 2
    ↓
navigate('/build/arrange')
    ↓
Step2: Renders with loaded bouquet state
    ↓
User makes changes → NEXT to Step3
    ↓
Step3: Generates stable ID from editingBouquetId
    ↓
Save: saveBouquet() finds existing by ID → updates in place with original createdAt
```

---

## Delete Flow

```
GardenPage: User clicks "Delete" in preview modal
    ↓
dispatch(deleteBouquet(id))
    ↓
gardenSlice: Filters out bouquet
    ↓
redux-persist → writes updated array to localStorage
    ↓
GardenPage re-renders with bouquet removed
```

---

## Unsaved Work Protection

### Browser Navigation (beforeunload)

File: `src/pages/BuilderPage.tsx`

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!builder.isSavedToGarden && builder.placedFlowers.length > 0) {
      e.preventDefault();
      return (e.returnValue = ''); // Modern browsers require this
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [builder.isSavedToGarden, builder.placedFlowers.length]);
```

Triggers only if:
- Bouquet has flowers AND
- `isSavedToGarden === false`

### In-App Navigation (UnsavedWorkModal)

File: `src/features/builder/UnsavedWorkModal.tsx`

Shown when user clicks:
- "Create New" (Step3)
- "Go to Garden" (Step3)

Options:
1. **Save & Leave** → `saveBouquet()` + `resetBuilder()` + navigate
2. **Leave Without Saving** → `resetBuilder()` + navigate (all work discarded)
3. **Cancel** → close modal, stay on page

---

## Key Files

| File | Role |
|------|------|
| `src/app/store.ts` | Redux store config, persistence setup, exports `AppRootState` type |
| `src/main.tsx` | App entry point, PersistGate wraps app |
| `src/features/garden/gardenSlice.ts` | Garden state + actions (saveBouquet, deleteBouquet) + selectors |
| `src/features/builder/builderSlice.ts` | Builder state + lifecycle reducers (resetBuilder, loadBouquetForEditing, markSaved) |
| `src/utils/storage.ts` | Storage quota helper (hasStorageRoom) |
| `src/features/builder/Step3.tsx` | Save flow for new/edited bouquets, refresh recovery |
| `src/pages/ViewerPage.tsx` | Save flow for shared bouquets, duplicate detection |
| `src/pages/GardenPage.tsx` | Garden display, edit/delete triggers |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  SAVE FLOW (Step3 / ViewerPage)                                 │
└─────────────────────────────────────────────────────────────────┘

User clicks "Save to Garden"
    ↓
hasStorageRoom() check  [src/utils/storage.ts]
    ↓ (if quota exceeded)
Toast: "STORAGE IS FULL"
    ↓ (if space available)
dispatch(saveBouquet(bouquet))  [gardenSlice.ts]
    ↓
Garden slice: upsert bouquet by ID
    ↓
redux-persist middleware
    ↓
localStorage.setItem('persist:garden', JSON.stringify(state))
    ↓
Toast: "BOUQUET SAVED TO GARDEN!"


┌─────────────────────────────────────────────────────────────────┐
│  LOAD FLOW (App initialization)                                 │
└─────────────────────────────────────────────────────────────────┘

React renders <PersistGate>  [src/main.tsx]
    ↓
redux-persist reads localStorage['persist:garden']
    ↓
JSON.parse(bouquets array)
    ↓
Dispatches REHYDRATE action
    ↓
gardenSlice receives hydrated state
    ↓
PersistGate unblocks render
    ↓
App renders with garden.bouquets available


┌─────────────────────────────────────────────────────────────────┐
│  EDIT FLOW (Garden → Builder → Save)                            │
└─────────────────────────────────────────────────────────────────┘

GardenPage: Click "Edit"
    ↓
dispatch(loadBouquetForEditing(bouquet))  [builderSlice.ts]
    ↓
Builder state populated, editingBouquetId set
    ↓
navigate('/build/arrange')
    ↓
Step2: Render with loaded data
    ↓
User modifies → NEXT to Step3
    ↓
Step3: Generate stable ID from editingBouquetId
    ↓
Save: saveBouquet() updates existing entry (same ID, preserves createdAt)


┌─────────────────────────────────────────────────────────────────┐
│  DELETE FLOW (Garden)                                            │
└─────────────────────────────────────────────────────────────────┘

GardenPage modal: Click "Delete"
    ↓
dispatch(deleteBouquet(id))  [gardenSlice.ts]
    ↓
Garden slice: filter out bouquet
    ↓
redux-persist → writes to localStorage
    ↓
GardenPage re-renders without deleted bouquet
```

---

## Common Issues & Debugging

### 1. Bouquet not saved after refresh
**Symptoms**: User saves bouquet, refreshes, bouquet is gone.

**Checks**:
- Is `isSavedToGarden` set to `true` after save? (Check Redux DevTools)
- Is `saveBouquet()` dispatched? (Check Redux DevTools action log)
- Is localStorage quota exceeded? (Check browser console for quota errors)
- Is localStorage disabled? (Private browsing in some browsers)
- Check localStorage in DevTools → Application → Local Storage → `persist:garden`

### 2. Duplicate bouquets appearing after save
**Symptoms**: Same bouquet appears twice in garden.

**Root cause**: `saveBouquet()` not finding existing entry by ID.

**Checks**:
- Is `editingBouquetId` set correctly in builder slice?
- Is Step3 generating a new UUID instead of reusing `editingBouquetId`?
- Check `bouquetId` generation logic in Step3

### 3. Garden shows old version of edited bouquet
**Symptoms**: User edits bouquet, saves, but garden still shows old version.

**Root cause**: `saveBouquet()` creating new entry instead of updating existing.

**Checks**:
- Is `editingBouquetId` preserved through edit flow?
- Is ID stable across BACK+NEXT in Step3?
- Check Redux DevTools: does saved bouquet have same ID as original?

### 4. "STORAGE IS FULL" error on first save
**Symptoms**: Fresh browser, first bouquet, quota error appears.

**Root cause**: `hasStorageRoom()` failing due to other sites' localStorage usage or wrong threshold.

**Checks**:
- Check `localStorage.length` in console
- Check total localStorage size (iterate keys, sum lengths)
- Verify threshold: `(used + 50_000) * 2 < 5_000_000`

### 5. Garden empty after switching browsers/devices
**Symptoms**: User created bouquets on Chrome, none visible on Firefox.

**Expected behavior**: localStorage is scoped to origin AND browser. Data does NOT sync across browsers or devices. This is working as designed.

**User education**: Garden is local to this browser. To save permanently or share across devices, use "Save as Photo" or "Share" link.

---

## Notes

- **No sync**: localStorage does NOT sync across browsers, devices, or incognito/private mode sessions. Each browser instance has its own garden.
- **Quota**: ~5MB limit is a soft guideline. Safari iOS caps at 2.5MB in some cases. Always use `hasStorageRoom()` before writes.
- **Sharing vs Saving**: URL sharing encodes bouquet in the link (no localStorage needed). Garden is for personal local collection only.
- **Builder is ephemeral**: Refreshing Step1/2/3 wipes unsaved work. Only garden survives refresh.
- **IDs are stable within edits**: Once saved, bouquet ID never changes even through multiple edits. This ensures `saveBouquet()` updates the same entry.
- **createdAt is preserved**: Editing a bouquet keeps the original creation timestamp. Useful for "Recently Created" sorting.
- **PersistGate blocks render**: App won't display until garden rehydrates. On slow devices, users may see a brief blank screen. This is intentional to prevent flicker.
