# Feature Flow: Shareable URL System

## Overview
Digital Bouquet has no backend or database. Bouquets are shared entirely through URLs by encoding the full bouquet state into a query parameter using lz-string compression. The entire bouquet (flowers, note, greenery, positions) fits into a ~100-400 character URL parameter.

**URL Format**: `/view?d=<compressed-data>`

---

## Technical Flow

```
USER CREATES BOUQUET
        ↓
[BuilderPage Step 3]
        ↓ clicks "Share"
[ShareActions.tsx]
        ↓ calls generateShareLink(bouquet)
[generateShareLink.ts]
        ↓ calls encodeBouquet(bouquet)
[encoder.ts]
        ↓ strips IDs/timestamps, compacts field names
        ↓ JSON.stringify()
        ↓ calls compress(json)
[compression.ts]
        ↓ lz-string.compressToEncodedURIComponent()
        ↓ returns URL-safe base64-like string
        ↓
[generateShareLink.ts]
        ↓ constructs full URL: origin + BASE_URL + /view?d=<compressed>
        ↓
[ShareActions.tsx]
        ↓ navigator.share() OR navigator.clipboard.writeText()
        ↓
USER SHARES URL
        ↓
RECIPIENT OPENS LINK
        ↓
[ViewerPage.tsx]
        ↓ reads ?d=<data> from URL via useSearchParams()
        ↓ calls decodeBouquet(data)
[decoder.ts]
        ↓ calls decompress(data)
[compression.ts]
        ↓ lz-string.decompressFromEncodedURIComponent()
        ↓ returns JSON string or null
        ↓
[decoder.ts]
        ↓ JSON.parse()
        ↓ validateBouquetData() — strict checks on all fields
        ↓ stripHtml() on note text (XSS prevention)
        ↓ regenerate IDs via crypto.randomUUID()
        ↓ rebuild full Bouquet object with hardcoded dimensions
        ↓ returns Bouquet or null
        ↓
[ViewerPage.tsx]
        ↓ renders BouquetPreview with decoded bouquet
        ↓ or shows "Invalid bouquet" error if null
```

---

## Encoding Pipeline (Bouquet → URL)

### Entry Point
**File**: `src/features/share/generateShareLink.ts`

**Function**: `generateShareLink(bouquet: Bouquet): string`

1. Calls `encodeBouquet(bouquet)` to compress the bouquet
2. Constructs full URL: `${origin}${BASE_URL}/view?d=${compressed}`
3. Returns complete shareable URL

### Encoder
**File**: `src/features/share/encoder.ts`

**Function**: `encodeBouquet(bouquet: Bouquet): string`

**Data Transformation**: Strips fields that are regenerated on decode to minimize URL length.

**Stripped Fields**:
- `bouquet.id`
- `bouquet.createdAt`
- `bouquet.canvasWidth`
- `bouquet.canvasHeight`
- `flower.id` (for each flower in the array)

**Compacted Field Names**: Short keys save bytes in the URL.

```typescript
{
  f: [                           // flowers array
    { t: 'rose', x: 100, y: 200, z: 1 },  // t=type, x/y=position, z=zIndex
    { t: 'tulip', x: 300, y: 150, z: 2 },
    ...
  ],
  n: {                           // note (or null)
    t: 'Happy Birthday!',        // t=text
    ff: 'DM Sans',               // ff=fontFamily
    x: 300,
    y: 480
  },
  g: 'bush'                      // greenery type
}
```

**Process**:
1. Map `bouquet.flowers` to compact format (strip `id`, rename fields)
2. Map `bouquet.note` to compact format (or `null` if no note)
3. Include greenery type directly
4. `JSON.stringify()` the compact object
5. Call `compress(json)` to produce final URL parameter

### Compression
**File**: `src/utils/compression.ts`

**Function**: `compress(data: string): string`

Thin wrapper around `lz-string.compressToEncodedURIComponent()`. Returns a URL-safe base64-like string (no special chars that need escaping).

---

## Decoding Pipeline (URL → Bouquet)

### Entry Point
**File**: `src/pages/ViewerPage.tsx`

Reads the `d` query parameter from the URL using `useSearchParams()`, then calls `decodeBouquet(data)`.

### Decoder
**File**: `src/features/share/decoder.ts`

**Function**: `decodeBouquet(data: string): Bouquet | null`

Returns a fully-reconstructed `Bouquet` object or `null` if any step fails.

**Steps**:

1. **Decompress**: `decompress(data)` → returns JSON string or `null`
2. **Parse**: `JSON.parse(decompressed)` (try/catch wrapped)
3. **Validate**: `validateBouquetData(parsed)` performs strict checks
4. **Regenerate**: Rebuild full `Bouquet` with new IDs and hardcoded dimensions
5. **Return**: `Bouquet` or `null` on failure

### Validation Rules
**Function**: `validateBouquetData(parsed: unknown): boolean`

All checks must pass or the entire bouquet is rejected (returns `null`).

#### Flowers Array (`data.f`)
- Must be array with 1-6 items (enforced by `MAX_FLOWERS = 6`)
- Each flower must have:
  - `t` (type): must be in `VALID_FLOWER_TYPES` (rose, tulip, sunflower, lily, daisy, peony, orchid, carnation, dahlia)
  - `x`: number in [0, 800] (canvas width)
  - `y`: number in [0, 600] (canvas height)
  - `z` (zIndex): integer in [1, flowers.length]
- All `z` values must be unique (no two flowers on the same layer)

#### Note (`data.n`)
- Can be `null` (valid)
- If present, must be an object with:
  - `t` (text): string
    - HTML tags stripped via `text.replace(/<[^>]*>/g, '')` (XSS prevention)
    - Max `MAX_NOTE_CHARS = 1000` characters
    - Max `MAX_NOTE_WORDS = 50` words (split on whitespace, filter empty)
  - `ff` (fontFamily): must be in `ALLOWED_FONTS` (currently only `['DM Sans']`)
  - `x`: number in [0, 800]
  - `y`: number in [0, 600]

#### Greenery (`data.g`)
- Must be one of: `'bush'`, `'monstera'`, `'sprigs'`, `'none'`

### Regeneration
After validation passes, the decoder rebuilds a complete `Bouquet` object:

```typescript
{
  id: crypto.randomUUID(),              // new ID
  flowers: validated.f.map(f => ({
    id: crypto.randomUUID(),            // new ID for each flower
    type: f.t as FlowerType,
    x: f.x,
    y: f.y,
    zIndex: f.z,
  })),
  note: validated.n ? {
    text: stripHtml(validated.n.t),     // re-strip HTML just in case
    fontFamily: validated.n.ff,
    x: validated.n.x,
    y: validated.n.y,
  } : null,
  greenery: validated.g as GreeneryType,
  canvasWidth: 800,                     // hardcoded
  canvasHeight: 600,                    // hardcoded
  createdAt: new Date().toISOString(),  // current timestamp
}
```

All stripped fields are restored with fresh values. The bouquet is now identical in structure to one created in the builder.

---

## Share Actions

**File**: `src/features/share/ShareActions.tsx`

Reusable component used by both `BuilderPage` (Step 3) and `ViewerPage`.

### Share Button Flow
**Function**: `handleShare()`

1. Generate link via `generateShareLink(bouquet)`
2. Try native share: `navigator.share({ title, url })` (works on mobile)
3. On desktop (no Web Share API), fallback to `navigator.clipboard.writeText(link)`
4. Catch `AbortError` silently (user cancelled share dialog, not an error)
5. Show toast notification on successful clipboard copy
6. On final failure, show error toast

### Save as Photo
**File**: `src/features/share/imageExport.ts`

**Function**: `exportAsImage(element: HTMLElement): Promise<void>`

Uses `html-to-image.toJpeg()` to rasterize the bouquet preview.

**Key Options**:
- `width: 800, height: 600` — overrides CSS scaling, always exports full resolution
- `style: { transform: 'none' }` — removes any CSS transforms (e.g., scale-down in modals)
- `backgroundColor: '#FFFBF5'` — soft cream background (JPEG needs opaque background)
- `quality: 0.95` — high quality, minimal artifacts
- `cacheBust: true` — prevents stale image artifacts from cached assets

**Process**:
1. Call `toJpeg(element, options)` → returns data URL
2. Create temporary `<a>` element
3. Set `download="my-bouquet.jpg"` and `href=<dataUrl>`
4. Trigger `click()` to download
5. Remove element from DOM

---

## URL Size & Performance

### Typical URL Lengths
- **Empty bouquet** (1 flower, no note): ~80-100 chars
- **Moderate bouquet** (3 flowers, short note): ~150-250 chars
- **Full bouquet** (6 flowers, 50-word note): ~400-600 chars

All well under the browser safe limit of ~2000 characters.

### Why URLs Are Short
- **Stripped fields**: No IDs, no timestamps, no canvas dimensions → saves ~30+ chars per flower
- **Short field names**: `f`, `n`, `t`, `ff`, `g`, `x`, `y`, `z` instead of full words
- **lz-string compression**: Designed for URL parameters, uses base64-like encoding

### Compression Efficiency
JSON before compression (6 flowers + note):
```json
{"f":[{"t":"rose","x":100,"y":200,"z":1},{"t":"tulip","x":300,"y":150,"z":2},...], "n":{"t":"Happy Birthday!","ff":"DM Sans","x":300,"y":480},"g":"bush"}
```
~300-500 chars

After `lz-string` compression: ~150-300 chars (40-50% reduction typical).

---

## Security & Validation

### XSS Prevention
Note text is stripped of HTML tags twice:
1. During validation in `decoder.ts` (before accepting the data)
2. During regeneration (failsafe, just in case)

Regex: `text.replace(/<[^>]*>/g, '')`

Note is always rendered as plain text, never via `dangerouslySetInnerHTML`.

### Type Whitelisting
- Flower types checked against `VALID_FLOWER_TYPES` (9 options)
- Greenery types checked against `VALID_GREENERY_TYPES` (4 options)
- Font families checked against `ALLOWED_FONTS` (1 option: DM Sans)

Any value outside these lists is rejected entirely.

### Coordinate Clamping
All `x/y` values validated as numbers within canvas bounds:
- `x` in [0, 800]
- `y` in [0, 600]

Prevents flowers/notes from appearing off-canvas or causing layout issues.

### Z-Index Uniqueness
All flower z-indices must be unique integers in the range [1, flowers.length]. This ensures no two flowers occupy the same layer, preventing ambiguous layering states.

### Graceful Degradation
Any validation failure returns `null`. The `ViewerPage` shows a friendly error message ("This bouquet link is invalid or corrupted") instead of crashing.

---

## Key Files

| File | Role |
|------|------|
| `src/features/share/generateShareLink.ts` | Entry point: bouquet → full URL |
| `src/features/share/encoder.ts` | Strip fields, compact keys, JSON.stringify |
| `src/features/share/decoder.ts` | Decompress, validate, regenerate IDs/dimensions |
| `src/utils/compression.ts` | lz-string wrapper (compress/decompress) |
| `src/features/share/ShareActions.tsx` | Share button, Web Share API, clipboard fallback |
| `src/features/share/imageExport.ts` | html-to-image JPEG export with full resolution |
| `src/data/flowers.ts` | Constants: CANVAS_WIDTH=800, CANVAS_HEIGHT=600, MAX_FLOWERS=6, MAX_NOTE_WORDS=50, ALLOWED_FONTS |
| `src/pages/ViewerPage.tsx` | Reads `?d=` param, calls decoder, renders preview |

---

## State Shape (Compact Format)

The URL parameter contains this structure (after decompression, before parsing):

```typescript
{
  f: [                           // flowers (1-6)
    { t: string, x: number, y: number, z: number },
    ...
  ],
  n: {                           // note (optional)
    t: string,                   // text (HTML-stripped, max 1000 chars, 50 words)
    ff: string,                  // font family (must be in ALLOWED_FONTS)
    x: number,                   // position (0-800)
    y: number                    // position (0-600)
  } | null,
  g: string                      // greenery type ('bush' | 'monstera' | 'sprigs' | 'none')
}
```

---

## Notes & Gotchas

### IDs Are Not Persistent
Flower and bouquet IDs are regenerated on every decode. Two people opening the same URL will have different IDs in their local state. This is intentional — IDs are only for React keys and local uniqueness, not for tracking identity across shares.

### Canvas Dimensions Are Hardcoded
The decoder always sets `canvasWidth: 800` and `canvasHeight: 600`, even if the original bouquet had different dimensions. This ensures all shared bouquets render consistently. (Currently the app only uses 800x600 everywhere, but this protects against future changes.)

### Timestamps Reset
The `createdAt` field is regenerated to the current time when a bouquet is decoded. The original creation time is not preserved. If timestamp tracking is needed in the future, add a `sharedAt` field that is stripped on encode.

### Z-Index Gaps Are Allowed
Z-indices must be unique integers in [1, N], but gaps are allowed. A bouquet with 3 flowers could have zIndices [1, 3, 5]. The builder normalizes these on "Bring to Front" / "Send to Back" actions, but the URL encoder/decoder does not enforce sequential values.

### Compression Can Fail Silently
If `decompress()` returns `null` (corrupted data), the decoder immediately bails. This could happen if a URL is manually edited or truncated. The viewer page handles this gracefully with an error message.

### Image Export Depends on Local Assets
All flower/greenery images must be local (imported via Vite). External image URLs will fail to export due to CORS restrictions in `html-to-image`. The current asset pipeline ensures all images are bundled.

---

## Debugging Tips

### Test a URL Manually
Open browser console:
```javascript
import { decodeBouquet } from './src/features/share/decoder';
const data = 'N4Ig...'; // paste the ?d= parameter value
console.log(decodeBouquet(data));
```

### Inspect Compressed Data
```javascript
import { decompress } from './src/utils/compression';
const data = 'N4Ig...';
console.log(decompress(data)); // see raw JSON before parsing
```

### Generate Test URLs
```javascript
import { generateShareLink } from './src/features/share/generateShareLink';
const testBouquet = { /* ... */ };
console.log(generateShareLink(testBouquet));
```

### Check Validation Logic
Add logging to `validateBouquetData()` in `decoder.ts` to see which check is failing. Each `return false` can be temporarily changed to `console.error('Failed check: ...')`.

### Test URL Length Limits
Create a max bouquet (6 flowers + 50-word note), encode, measure URL length:
```javascript
const link = generateShareLink(maxBouquet);
console.log(link.length); // should be < 2000
```

---

## Future Enhancements

### Version Field
Add a `v: 1` field to the encoded data. If the schema changes in the future (e.g., new flower properties), the decoder can check the version and handle old URLs gracefully.

### Persistent Timestamps
Add a `sharedAt` or `originalCreatedAt` field that survives encoding/decoding if timestamp tracking is needed.

### Partial Validation
Instead of rejecting the entire bouquet on one bad flower, the decoder could filter out invalid flowers and render the rest. Trade-off: partial bouquets might not match the sender's intent.

### Compression Algorithm
lz-string is fast and works well for short strings, but alternatives like `brotli` (browser-native) or `fflate` might achieve better compression for very large bouquets. Would require benchmarking.

### Shareable Images
Instead of (or in addition to) URL sharing, generate a QR code that encodes the URL and embed it in the exported JPEG. Recipients could scan the QR code to open the bouquet directly.
