# Mobile Responsiveness — Comprehensive Audit & Fix

**Status**: resolved
**Severity**: critical (multiple blockers)
**Reported**: 2026-02-12
**Resolved**: 2026-02-12
**Scope**: All pages — HomePage, BuilderPage (Steps 1-3), GardenPage, ViewerPage, modals

---

## Overview

A comprehensive Playwright audit at 390x844 and 320x568 viewports revealed multiple critical mobile responsiveness issues. All have been fixed and verified.

---

## Issues Fixed

### HomePage (`src/pages/HomePage.tsx`, `src/components/Layout.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Hero heading overflows viewport | Critical | `text-8xl` → `text-5xl sm:text-7xl md:text-8xl lg:text-9xl` |
| Decorative flowers overlap content | Major | Added `hidden sm:block` to all flower images |
| Step flow indicator wraps awkwardly | Major | `flex-col sm:flex-row`, added step numbers, arrows hidden on mobile |
| Content not vertically centered | Minor | Replaced `min-h-[80vh]` with `flex-1`, added `flex flex-col` to `<main>` |
| Navbar button wraps at 320px | Minor | `whitespace-nowrap`, "My Garden" → "Garden" on small screens |

### Step 1 — Pick Flowers (`src/features/builder/Step1.tsx`, `FlowerGrid.tsx`, `FlowerTile.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Grid/Cart side-by-side, unusable on mobile | Critical | `flex flex-col md:flex-row`, grid stacks above cart |
| Flower images too small (~60px slivers) | Major | Resolved by layout fix, images `w-20 h-20` on mobile |
| Flower names overlap/truncate | Major | Resolved by layout fix, wider tiles fit labels |

### Step 2 — Arrange (`src/features/builder/BouquetCanvas.tsx`, `FlowerControls.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Canvas small on mobile, hard to interact | Major | Responsive scaling with viewport-based height cap |
| Click-vs-drag bug (all viewports) | Major | Added `PointerSensor` with `distance: 5` activation constraint |
| Z-index controls not visible on mobile | Minor | Rewrote FlowerControls — positions below flower, flips above near bottom, clamps within canvas |

### Step 3 — Preview & Share (`src/features/builder/Step3.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| 800px canvas overflows mobile | Major | Safe initial scale + viewport-based responsive scaling |
| beforeunload fires after saving | Bug | Added `isSavedToGarden` to Redux, check `!isSaved` |
| Page redirects home on refresh after save | Bug | URL-based recovery with `?saved=<id>`, recover from persisted garden |

### Viewer Page (`src/pages/ViewerPage.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Canvas overflows mobile viewport | Major | Same responsive scaling pattern as Step 3 |
| No garden detection for already-saved bouquets | Feature | Content-based `bouquetsMatch()`, shows "View Garden" if already saved |
| UX overhaul | Feature | New heading "You are special to me", "Create Your Own Bouquet" CTA, save-prompt modal with state transitions |

### Garden Page (`src/features/garden/BouquetCard.tsx`, `GardenGrid.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Thumbnails overflow on mobile (fixed pixel width) | Major | Responsive cards — `ResizeObserver` measures width, computes scale dynamically |
| Grid layout not responsive | Major | Changed from `flex flex-wrap` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Notes hidden in thumbnails | Enhancement | Removed `showNote={false}`, notes now visible at larger thumbnail size |

### Share Actions (`src/features/share/ShareActions.tsx`)

| Issue | Severity | Fix |
|-------|----------|-----|
| Share button shouldn't appear on viewer page | Design | Added `hideShareButton` prop for viewer-specific customization |

---

## Files Changed

- `src/pages/HomePage.tsx` — responsive heading, decorative flowers hidden on mobile, step flow vertical stack, flex-1 centering
- `src/pages/BuilderPage.tsx` — beforeunload checks isSaved
- `src/pages/ViewerPage.tsx` — full responsive overhaul, garden detection, save-prompt modal
- `src/components/Layout.tsx` — responsive logo, navbar, flex-col on main
- `src/features/builder/Step1.tsx` — flex-col mobile layout
- `src/features/builder/Step2.tsx` — responsive canvas scaling
- `src/features/builder/Step3.tsx` — responsive scaling, URL-based save recovery
- `src/features/builder/BouquetCanvas.tsx` — PointerSensor fix, mobile canvas height
- `src/features/builder/FlowerTile.tsx` — larger mobile tap targets
- `src/features/builder/FlowerControls.tsx` — complete rewrite for mobile
- `src/features/builder/builderSlice.ts` — added `isSavedToGarden`, `markSaved` reducer
- `src/features/garden/BouquetCard.tsx` — responsive dynamic scaling via ResizeObserver
- `src/features/garden/GardenGrid.tsx` — CSS grid with responsive columns
- `src/features/share/ShareActions.tsx` — `hideShareButton` prop
- `src/types/index.ts` — added `isSavedToGarden` to BuilderState

---

## Verification

Full end-to-end Playwright test at 1440x900 (desktop) and 390x844 (mobile) with clean browser state. All pages, modals, and buttons tested. Zero issues found.

Tested flows:
- Home (empty garden) → Step 1 → Step 2 (with note + greenery) → Step 3 → Save to Garden → Refresh persistence
- Garden page with 1 bouquet + preview modal
- Viewer page: fresh (unsaved), save-prompt modal, post-save state transitions, already-in-garden detection
- Error states: broken share link, empty garden
- Build: clean, no TypeScript errors
