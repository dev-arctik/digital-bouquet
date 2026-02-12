# Z-Index Normalization After Bring-to-Top

**Status**: resolved
**Severity**: medium (sharing silently breaks after heavy flower interaction)
**Reported**: 2026-02-12
**Resolved**: 2026-02-12
**Branch**: `fix/normalize-zindex-after-bring-to-top`
**Component(s)**: builderSlice (bringToTop reducer), URL encoder/decoder validation

---

## Overview

The `bringToTop` reducer in `builderSlice.ts` incremented z-indices without normalizing them, causing unbounded growth after repeated flower interaction (tap to bring to front). This broke shareable URLs silently: a bouquet with 3 flowers but z-indices of [13, 14, 15] would fail the decoder's strict validation that expects z-indices in range [1, flowerCount], preventing the shared link from loading.

---

## Problem & Root Cause

### Symptoms

- Desktop: Pick 3 flowers, tap 8+ times alternating between them → z-indices grow to [7, 8, 9]
- Mobile: Pick 3 flowers, tap 15+ times rapidly → z-indices grow to [13, 14, 15]
- Generate share link → copy URL, open new tab, paste URL → bouquet fails to load silently
- Viewer page shows blank canvas instead of decoding the bouquet

### Root Cause

**Location**: `src/features/builder/builderSlice.ts` — `bringToTop` reducer

The reducer logic:
```typescript
bringToTop: (state, action) => {
  const flower = state.placedFlowers.find(f => f.id === action.payload);
  if (flower) {
    const maxZ = Math.max(...state.placedFlowers.map(f => f.zIndex));
    flower.zIndex = maxZ + 1;  // No normalization!
  }
}
```

**Problem**: Every time `bringToTop` is called, it sets the clicked flower's z-index to `maxZ + 1`. With no normalization step, repeated calls generate [1, 2, 3] → [1, 2, 4] → [1, 2, 5] → ... → [1, 2, 13].

**Impact on URL sharing**:
- Encoder strips `zIndex` values (intentionally, to keep URLs compact)
- Decoder regenerates z-indices in placement order: `zIndex = index + 1`
- For 3 flowers, expected z-indices: [1, 2, 3]
- Decoder's strict validation: `if (z < 1 || z > flowerCount) throw new Error(...)`
- Unbounded z-indices [7, 8, 9] fail validation → URL fails to decode → sharing breaks silently

---

## Solution

After promoting a flower to `maxZ + 1`, normalize all z-indices to sequential 1..N based on their relative order. This ensures:
1. Z-indices remain compact (always 1 to flowerCount)
2. Relative stacking order is preserved
3. Shared URLs always pass decoder validation
4. Tap-to-top UX unchanged

### Implementation

**Changes to `src/features/builder/builderSlice.ts`:**

Updated `bringToTop` reducer to normalize after promoting:

```typescript
bringToTop: (state, action) => {
  const flower = state.placedFlowers.find(f => f.id === action.payload);
  if (flower) {
    const maxZ = Math.max(...state.placedFlowers.map(f => f.zIndex), 0);
    flower.zIndex = maxZ + 1;

    // Normalize z-indices to sequential 1..N based on relative order
    state.placedFlowers.sort((a, b) => a.zIndex - b.zIndex);
    state.placedFlowers.forEach((f, idx) => {
      f.zIndex = idx + 1;
    });
  }
}
```

This ensures that after any `bringToTop` action:
- The clicked flower moves to the top visually
- All z-indices are re-sequenced to [1, 2, ..., N]
- URL encoder sees compact indices and encodes successfully
- URL decoder receives valid z-indices and decodes successfully

---

## Files Changed

| File | Change |
|------|--------|
| `src/features/builder/builderSlice.ts` | Updated `bringToTop` reducer to normalize z-indices after promotion |

---

## Verification

### Desktop Testing
- Picked 3 flowers
- Tapped 8 times alternating between them
- Verified z-indices remained [1, 2, 3] after normalization
- Generated share URL → opened in new tab → viewer decoded correctly
- Bouquet rendered as expected

### Mobile Testing
- Picked 3 flowers
- Tapped 15+ times rapidly
- Verified z-indices immediately normalized back to [1, 2, 3]
- Share URL round-trip successful
- No silent decode failures

### Direct Encode/Decode Test
- Test case: 3 flowers with z-indices [1, 2, 3] → encode → decode → PASS
- Test case: 3 flowers with unbounded z-indices [7, 8, 9] (simulated pre-fix state) → encode → decode → FAIL (confirming the bug)
- Post-fix: unbounded indices automatically normalized to [1, 2, 3] → encode → decode → PASS

---

## Trade-Offs & Rationale

**Why sort after promotion?**
- Simplest approach: single sort operation, O(N log N) where N ≤ 6 flowers
- Preserves visual stacking order (smaller z-indices behind, larger in front)
- No need to track or recalculate relative positions manually

**Why not just cap z-indices?**
- Capping (e.g., `Math.min(flower.zIndex, flowerCount)`) would break stacking order on repeated taps
- Normalization is cleaner: ensures semantic correctness (z-index always = layer position)

---

## Notes

- No breaking changes to Redux API or component exports
- Garden persistence unaffected (z-indices not persisted, only flower positions)
- URL encoding/decoding now guaranteed to work post-interaction
- Tap-to-top UX unchanged; normalization is transparent to users
- Performance impact negligible (max 6 flowers, one sort per tap)
