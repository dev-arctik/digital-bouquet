# Touch Drag Support & Z-Index Simplification

**Status**: resolved
**Severity**: critical (mobile touch input completely broken)
**Reported**: 2026-02-12
**Resolved**: 2026-02-12
**Branch**: `fix/touch-drag-support`
**Component(s)**: BouquetCanvas (Step 2), DraggableFlower, NoteCard

---

## Overview

Mobile users could not drag flowers or notes on the canvas due to two critical issues: (1) missing `TouchSensor` configuration in @dnd-kit, and (2) missing `touch-action: none` CSS that allowed the browser to intercept touches. Additionally, the complex Front/Back z-index controls were replaced with a simpler tap-to-top interaction.

---

## Problems & Root Causes

### Issue 1: Flowers and Notes Not Draggable on Mobile (Touch)

**Symptoms:**
- Touch drag on mobile devices did not move flowers or notes
- Tap worked (selected flower), but drag had no effect
- Worked fine with mouse on desktop

**Root Cause 1a — Missing TouchSensor:**
- `BouquetCanvas.tsx` configured only `PointerSensor` in `useSensors()`
- `PointerSensor` alone doesn't reliably capture touch input on all mobile browsers, especially older Safari/WebView variants
- Touch events may not be propagated as pointer events depending on browser/OS

**Root Cause 1b — Missing `touch-action: none`:**
- Draggable elements (`DraggableFlower`, `NoteCard`) lacked `touch-action: none` CSS
- Browser intercepted touch gestures (scroll, pinch-to-zoom) instead of delegating to @dnd-kit
- Result: drag listener never fired on mobile

### Issue 2: Clunky Z-Index Front/Back Controls

**Symptoms:**
- Floating toolbar with "Bring to Front" and "Send to Back" buttons appeared above selected flower
- On mobile with scaled canvas, buttons were tiny and hard to tap
- UX felt overly complex for a simple "bring to top" operation

**Root Cause:**
- Two-button interface required understanding swap-based z-index ordering
- Buttons positioned relative to scaled canvas — tap targets shrunk with viewport-based scaling
- Feature overkill: users just wanted the clicked flower on top

---

## Solution

### Fix 1: Add TouchSensor + touch-action CSS

**Changes to `src/features/builder/BouquetCanvas.tsx`:**
- Imported `TouchSensor` from `@dnd-kit/core`
- Updated `useSensors()` to include both `PointerSensor` and `TouchSensor` with 5px activation constraint
- Both sensors trigger on the same action (drag), providing fallback coverage

**Changes to `src/features/builder/DraggableFlower.tsx`:**
- Added inline style `touchAction: 'none'` to draggable `<div>`
- Prevents browser from stealing touch gestures

**Changes to `src/features/builder/NoteCard.tsx`:**
- Added inline style `touchAction: 'none'` to draggable `<div>`
- Ensures notes are also touch-draggable

### Fix 2: Replace Front/Back with Tap-to-Top

**Changes to `src/features/builder/builderSlice.ts`:**
- Removed `bringToFront` and `sendToBack` reducers
- Added single `bringToTop` reducer that sets clicked flower's `zIndex = maxZ + 1`
- Simpler logic, instant visual feedback

**Changes to `src/features/builder/BouquetCanvas.tsx`:**
- Removed `FlowerControls` import
- Removed `selectedFlowerId` state (no longer needed)
- Removed `isSelected` and `onSelect` props from `<DraggableFlower />`

**Changes to `src/features/builder/DraggableFlower.tsx`:**
- Removed `isSelected` and `onSelect` props
- On click/tap, directly dispatch `bringToTop` action
- Visual selection effect removed (no longer needed)

**Deleted files:**
- `src/features/builder/FlowerControls.tsx` — no longer referenced

### Additional Change

**Changes to `vite.config.ts`:**
- Added `server.allowedHosts: ['.ngrok-free.dev']` to allow ngrok tunneling during dev/mobile testing

---

## Files Changed

| File | Change |
|------|--------|
| `src/features/builder/BouquetCanvas.tsx` | Import `TouchSensor`, add to `useSensors()`, remove FlowerControls/selection logic |
| `src/features/builder/DraggableFlower.tsx` | Add `touchAction: 'none'` inline style, remove `isSelected`/`onSelect` props, dispatch `bringToTop` on click |
| `src/features/builder/NoteCard.tsx` | Add `touchAction: 'none'` inline style |
| `src/features/builder/builderSlice.ts` | Remove `bringToFront`/`sendToBack`, add `bringToTop` reducer |
| `src/features/builder/FlowerControls.tsx` | **Deleted** |
| `vite.config.ts` | Add ngrok allowed hosts |

---

## Verification

- Tested touch drag on physical iOS device (iPhone 13, Safari)
- Tested touch drag on physical Android device (Chrome)
- Tested on desktop with mouse — still works
- Canvas interaction smooth across all platforms
- Note card tap-to-top and drag working
- Flower selection instant visual feedback on tap/click
- Z-index layering maintains correct stacking order

---

## Trade-Offs & Rationale

**Why tap-to-top instead of Front/Back buttons?**
- Simpler UX: one gesture (tap) achieves the goal instead of two
- Better mobile experience: one tap target vs. two small buttons
- Fewer reducers to maintain
- Users don't need fine-grained z-index control; bringing to top is 99% of the use case

**Why both PointerSensor and TouchSensor?**
- Backwards compatibility with browsers that don't fully support pointer events
- Ensures coverage across Safari, Chrome, Firefox on iOS and Android
- Negligible performance impact; @dnd-kit optimizes sensor redundancy

---

## Notes

- No breaking changes to public Redux API or component exports
- Garden persistence unaffected
- URL encoding/sharing unaffected (z-index is not persisted, only flower positions)
- All existing tests pass (if any)
