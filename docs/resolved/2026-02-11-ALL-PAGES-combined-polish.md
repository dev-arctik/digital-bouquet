# ALL-PAGES: Combined UX Polish — Home, Step 1, Step 2, Step 3, Garden

**ID**: ALL-PAGES
**Status**: resolved
**Severity**: medium
**Reported**: 2026-02-11
**Resolved**: 2026-02-11
**Scope**: All pages — full review polish pass

---

## HOME-001: Landing Page — Font Readability + Missing Context

### H1. "DigiBouquet" Logo Font Not Readable
The Pinyon Script calligraphic font used for the large "DigiBouquet" heading is decorative but hard to read. Switch to a font that's still elegant/romantic but actually readable at a glance.

**Resolution:** Changed logo from `font-logo` (Pinyon Script) to `font-note` (DM Sans) in HomePage.tsx

**Files Changed**:
- `src/pages/HomePage.tsx` — Updated H1 styling from `font-logo` to `font-note`

### H2. No Explanation of What "DigiBouquet" Means
Add a subtitle like "Your Digital Bouquet" or "Digital Bouquet Maker" near the logo so first-time visitors understand the product.

**Resolution:** Added subtitle "Your Digital Bouquet Maker" below the logo

**Files Changed**:
- `src/pages/HomePage.tsx` — Added subtitle text

### H3. No Step Preview / How-It-Works on Landing
Add a horizontal step flow between the tagline and CTA:
```
Pick Flowers  →  Arrange a Bouquet  →  Share the Special Link
```

**Resolution:** Added step flow `Pick Flowers → Arrange a Bouquet → Share the Special Link`

**Files Changed**:
- `src/pages/HomePage.tsx` — Added step flow section

---

## STEP1-001: Pick Flowers — Layout, Font, Navbar Shadow

### S1-1. NEXT Button Takes Full Row — Should Be in Cart Column
Move NEXT button below the "0/6 Flowers" counter inside the "Your Bouquet" cart column instead of spanning full width.

**Resolution:** Moved NEXT button into Cart.tsx via `onNext` and `hasFlowers` props; removed StepNavigation from Step1

**Files Changed**:
- `src/features/builder/Step1.tsx` — Removed StepNavigation component call
- `src/features/builder/Cart.tsx` — Added `onNext` and `hasFlowers` props, integrated NEXT button below counter

### S1-2. "Your Bouquet" Font Not Readable
Switch `font-logo` (Pinyon Script) on cart heading to a readable font (DM Sans or similar).

**Resolution:** Changed cart heading from `font-logo` to `font-note`

**Files Changed**:
- `src/features/builder/Cart.tsx` — Updated heading font class

### S1-3. Center the Whole Layout After NEXT Moves
Once the NEXT button moves into the cart column, the grid + cart layout can be centered on the screen.

**Resolution:** Centered layout with `items-center justify-center`

**Files Changed**:
- `src/features/builder/Step1.tsx` — Added centering classes to layout wrapper

### S1-4. Navbar Shadow Feels Off
Remove `shadow-sm` from the navbar, keep just `border-b border-rose-light`.

**Resolution:** Removed `shadow-sm` from navbar in Layout.tsx, kept `border-b border-rose-light`

**Files Changed**:
- `src/components/Layout.tsx` — Removed shadow-sm class from navbar

### S1-5. Helper Text Should Update When Cart Is Full
When cart reaches 6/6, change subtitle to something like "You've chosen 6 flowers — press Next to create your bouquet!"

**Resolution:** Added dynamic helper text at 6/6: "You've chosen 6 flowers — press Next to arrange your bouquet!"

**Files Changed**:
- `src/features/builder/Step1.tsx` — Added conditional text rendering based on cart count

### S1-6. "Pick Your Flowers" Heading Font Not Readable
Change `font-logo` (Pinyon Script) on the page heading to `font-note` (DM Sans) with `font-bold` — matching the home page "DigiBouquet" style. Apply same change to Step 2 and Step 3 headings for consistency.

**Resolution:** Changed heading from `font-logo` to `font-note text-4xl sm:text-5xl font-bold`; also applied to Step 2 and Step 3 headings

**Files Changed**:
- `src/features/builder/Step1.tsx` — Updated heading font class and sizing
- `src/features/builder/Step2.tsx` — Applied same changes to Step 2 heading
- `src/features/builder/Step3.tsx` — Applied same changes to Step 3 heading

### S1-7. Content Not Vertically Centered on Screen
The heading + grid + cart block should be vertically centered in the viewport (accounting for navbar height). Add `min-h-[calc(100vh-64px)]` to fill the available space below the navbar.

**Resolution:** Added `min-h-[calc(100vh-64px)]` for vertical centering

**Files Changed**:
- `src/features/builder/Step1.tsx` — Added min-height class to content wrapper

---

## STEP2-001: Arrange Page — Canvas, Greenery, Note, Step Indicator

### S2-1. Remove Step Progress Indicator
Remove the step dots at the top (PICK FLOWERS → ARRANGE → PREVIEW) from BuilderPage. The page title is enough context.

**Resolution:** Removed entire StepIndicator component, STEPS constant, and STEP_BY_PATH mapping from BuilderPage.tsx

**Files Changed**:
- `src/pages/BuilderPage.tsx` — Removed StepIndicator component and related constants

### S2-2. Canvas Background Should Be Whitish
Canvas uses `bg-cream` (same as page). Change to white (`#FFFFFF` or `#FEFEFE`) so it stands out.

**Resolution:** Canvas background changed from `bg-cream` to `bg-white` with `backgroundColor: '#FFFFFF'`

**Files Changed**:
- `src/features/builder/BouquetCanvas.tsx` — Updated inline background color and class

### S2-3. Canvas Not Centered on the Page
The canvas is left-aligned. It should be horizontally centered.

**Resolution:** Fixed by adding `display: 'flex'`, `justifyContent: 'center'` on wrapper and `transformOrigin: 'top center'` on canvas

**Files Changed**:
- `src/features/builder/BouquetCanvas.tsx` — Added flex centering styles to wrapper

### S2-4. Greenery Dropdown Looks Like a Text Field
Add a dropdown chevron icon (▼) or style with `appearance: auto` / custom chevron so users know it's a dropdown.

**Resolution:** Rewrote GreenerySelector as a custom dropdown (not native `<select>`) with button trigger + dropdown menu, styled to match "Add a Custom Note" button, opens upward (`bottom-full`)

**Files Changed**:
- `src/features/builder/GreenerySelector.tsx` — Complete rewrite as custom dropdown with button trigger

### S2-5. Default Greenery Should Not Be "None"
Default to a random greenery type (bush/monstera/sprigs) on initial placement so the bouquet looks nice from the start.

**Resolution:** Default greenery changed from `'none'` to random via `pickRandomGreenery()` in builderSlice.ts

**Files Changed**:
- `src/features/builder/builderSlice.ts` — Added `pickRandomGreenery()` function and updated initial state

### S2-6. "Add Note" Button Placement Is Awkward
Move "Add Note" to its own row between the canvas and BACK/NEXT buttons. Label it "Add a Custom Note".

**Resolution:** Moved greenery dropdown + note button to same row below canvas: `<div className="flex items-center gap-3">`

**Files Changed**:
- `src/features/builder/Step2.tsx` — Reorganized layout to place controls in row below canvas

### S2-7. Note Card Design Too Plain — Needs a Loving/Beautiful Look
The note card on the canvas is a plain white rectangle. Make it feel warm and romantic — think soft paper texture, decorative border, maybe slight rotation, handwriting-style feel, subtle shadow, or a tiny heart/flower accent. Should feel like a real handwritten note tucked into a bouquet. This applies to BOTH the draggable NoteCard on canvas AND the static note in BouquetPreview.

**Resolution:** Note card styled with warm parchment `bg-[#FFF8F0]`, `border-[#E8C4B8]`, `shadow-lg`, slight rotation (`rotate(-1.5deg)`), italic DM Sans in warm brown `text-[#5C4033]`

**Files Changed**:
- `src/features/builder/NoteCard.tsx` — Updated note card styling with warm colors, rotation, shadow
- `src/features/builder/BouquetPreview.tsx` — Applied matching note styling to preview

**Additional Fixes Applied**:
- **Flower entrance animation**: Flowers start at canvas center, animate outward to random positions with 0.6s ease-out transition. Only on mount (not during manual drags) — controlled by `hasAnimated` + `isEntering` two-phase state in DraggableFlower.tsx
- **PlacementEngine rewritten**: Changed from random scatter to circular fan pattern (270° arc, -135° to +135°, alternating radii for natural look)
- **Note modal portal**: Uses `createPortal(... , document.body)` to cover entire viewport including navbar; overlay lightened to `bg-black/30 backdrop-blur-sm`
- **Note card refinements**: Removed ❀ flower accent; increased note text from `text-sm` to `text-base`, added `text-justify`; reduced max note words from 100 to 50; made note card width dynamic via `getNoteWidth()` — sqrt scaling from 200px base to 280px max

**Files Changed** (additional):
- `src/features/builder/DraggableFlower.tsx` — Added entrance animation with two-phase state
- `src/features/builder/PlacementEngine.ts` — Rewrote placement logic to circular fan pattern
- `src/features/builder/NoteModal.tsx` — Added createPortal for full-screen coverage

---

## STEP3-001: Preview Page — Button Layout, Link Field, Save as Photo

### S3-1. Remove the Share Link Text Field
The URL text field is clutter. Users share via the SHARE button. Remove it entirely.

**Resolution:** Removed share link text field

**Files Changed**:
- `src/features/builder/Step3.tsx` — Removed text field for share link

### S3-2. Remove "Go to Garden" — Replace with Dynamic "View Garden" After Save
- Before save: `[Save to Garden]` button (outlined)
- After save: Button changes to `[View Garden]` (same style, navigates to /garden)
- Remove the standalone "Go to Garden" text link

**Resolution:** "Save to Garden" toggles to "View Garden" after save (clickable, navigates to /garden); removed standalone "Go to Garden" text link

**Files Changed**:
- `src/features/builder/Step3.tsx` — Updated button logic to show View Garden after save
- `src/features/share/ShareActions.tsx` — Added conditional button text and navigation

### S3-3. Promote "Back" and "Create New" to Outlined Buttons
Currently tiny underlined text links. Make them outlined buttons (same style as Save as Photo / Save to Garden) in a row below the save actions:
```
[████ SHARE YOUR BOUQUET ████]       ← Primary (coral, full width)
[Save as Photo]  [Save to Garden]    ← Secondary (outlined)
[Back]           [Create New]        ← Tertiary (outlined, same style)
```

**Resolution:** Back and Create New promoted to outlined buttons in a row below save actions

**Files Changed**:
- `src/features/builder/Step3.tsx` — Converted text links to outlined button components, arranged in layout

### S3-4. Save as Photo — Transparent PNG Export
1. Export with **transparent background** (no cream fill) — flowers + greenery + note only
2. Use a nice filename like `my-bouquet.png`
3. PNG with alpha channel

**Resolution:** Added `backgroundColor: 'transparent'` for transparent PNG export; filename changed to `my-bouquet.png`

**Files Changed**:
- `src/features/share/imageExport.ts` — Updated toPng() call with transparent background option
- `src/features/builder/Step3.tsx` — Updated filename in download logic

---

## GARDEN-001: Garden Page — Modal Centering, Button Order, Backdrop

### G1. Preview Modal Not Centered on Screen
Modal appears top-aligned. Should be centered both horizontally and vertically.

**Resolution:** Modal centering fixed by using `createPortal(... , document.body)` in Modal.tsx with flex centering

**Files Changed**:
- `src/components/Modal.tsx` — Updated to use createPortal with centered flex container

### G2. Modal Button Order Should Be: Edit → Share → Save as Photo → Delete
**Current**: Edit → Save as Photo → Share Link → Delete
**Desired**: Edit → Share Link → Save as Photo → Delete

**Resolution:** Button order changed to Edit → Share Link → Save as Photo → Delete

**Files Changed**:
- `src/features/garden/PreviewModal.tsx` — Reordered button rendering

### G3. Save as Photo — Same Transparent PNG Fix
Same fix as S3-4 — transparent background, nice filename.

**Resolution:** Same transparent PNG fix as S3-4 applied to garden export

**Files Changed**:
- `src/features/share/imageExport.ts` — (already updated for S3-4)
- `src/features/garden/PreviewModal.tsx` — Ensured consistent filename usage

### G4. Modal Backdrop Should Blur and Darken the ENTIRE Screen
Backdrop should cover everything including the navbar. Full-screen blur + dark overlay.

**Resolution:** Modal backdrop now covers entire screen via portal to body; `bg-black/30 backdrop-blur-sm`

**Files Changed**:
- `src/components/Modal.tsx` — Updated backdrop styling for full-screen coverage
- Garden grid alignment fixed: changed from CSS grid to `flex flex-wrap justify-center` so cards center properly

**Files Changed** (additional):
- `src/features/garden/GardenGrid.tsx` — Changed layout from grid to flex for proper centering

---

## Cross-Cutting Additions

**Icon Integration**: Added Lucide React icons to all buttons across the app for consistency:
- Sparkles (Start Creating)
- BookOpen (My Collection)
- Sprout (My Garden navbar)
- ArrowLeft/ArrowRight (Back/Next)
- StickyNote/PenLine (Add/Edit Note)
- Share2 (Share)
- Camera (Save as Photo)
- Flower2 (Save to Garden)
- Eye (View Garden)
- Plus (Create New)
- Pencil (Edit)
- Trash2 (Delete)

**Cart Item Spacing**: Cart item gap tightened from `gap-3` to `gap-1`

---

## Verification

**Status**: All issues resolved and verified
**Test Date**: 2026-02-11
**Notes**:
- Thumbnail background improved with canvas bg whitening (S2-2)
- All pages fit within 1280x720 viewport
- UX polish improvements complete across all pages
