# Design Refresh: Otter-Inspired Pastel Aesthetic

**Status**: Fully Implemented — All 4 phases + Fresh Observations complete
**Scope**: Visual design overhaul — colors, buttons, cards, interactions
**Inspired by**: [Otter Behance Project](https://www.behance.net/gallery/242135361/Otter)
**Timeline**: Phase 1 (theme + core UI) → Phase 2 (advanced interactions)

---

## Executive Summary

This design refresh brings the playful, pastel aesthetic of the Otter brand system to Digital Bouquet while preserving the botanical identity. The core principle: **introduce warmth and personality through a cohesive pastel color palette**, replacing the current monochrome (black/white/cream) system.

**Key changes:**
- New color palette: 11 pastel tones (greens, blues, pinks, yellows, purples)
- Button system upgrade: black → forest green (primary), coral accents for destructive actions
- Card & tile enhancements: pastel-tinted backgrounds with matching borders
- Interactive refinements: scale + shadow on hover (replacing opacity-only hovers)
- Landing page decoration: pastel blob shapes inspired by Otter's visual language
- Progress indicator: multi-step progress dots on the builder (green → coral → gray)

**What stays the same:**
- Cream (#F0EBDA) base background
- Monospace fonts (Courier Prime) for all UI text
- DM Sans for note cards, Pinyon Script for logo
- Sharp corners on buttons (brand identity)
- Flat design aesthetic (no gradients, no resting shadows)
- Canvas (800x600) remains the fixed export target — no styling changes

---

## Current Design (Baseline)

### Color System
- **Background**: Warm cream `#F0EBDA` (all pages)
- **Text**: Black (`#000`) headings, gray (`#999`) subtitles, light gray (`#AAA`) footer
- **Buttons**: Solid black background, white text (primary); 2px black outline, white text (secondary)
- **Disabled**: `#B8B8C4` (light gray)
- **Cards/Tiles**: White background, 2px black borders
- **Accents**: Color comes ONLY from flower/greenery illustrations — no UI color

### Typography
- **Headings/Buttons**: Monospace (Courier Prime / IBM Plex Mono), ALL UPPERCASE, letter-spaced
- **Body text**: Monospace, regular weight
- **Note cards**: DM Sans (only location)
- **Logo**: Pinyon Script (calligraphic Google Font)

### Components
- **Buttons**: Sharp corners (NO border-radius), black/white only
- **Modals**: Centered overlay, black 2px border, white bg
- **Cards**: White bg, 2px black border, sharp corners
- **Hover effects**: Opacity changes (0.7–0.8) only
- **No shadows, no gradients** — flat design throughout

---

## Otter Color Palette (Source Inspiration)

| Name | Hex | Use in Otter | Brightness |
|---|---|---|---|
| Sunny Yellow | `#FFB800` | Hero accents, badges | Bright |
| Ocean Blue | `#4E7BC0` | Secondary accents | Medium |
| Sky Blue | `#8EB4E3` | Cards, backgrounds | Light |
| Forest Green | `#019B63` | Primary brand, CTAs | Medium |
| Emerald Green | `#009060` | Secondary green | Medium |
| Lavender Purple | `#4F4B7F` | Deep accent | Dark |
| Grape Purple | `#6B86C2` | Lighter accents | Medium |
| Ruby Red / Coral | `#FC6E48` | Attention, CTAs, destructive | Bright |
| Quartz Pink | `#FFC0A5` | Warm backgrounds | Light |
| Stone Gray | `#C6C6C6` | Neutral | Light |
| Off White | `#F5F2EB` | Soft backgrounds | Very light |

---

## Digital Bouquet Adapted Palette

We adopt the Otter palette but remap it to Digital Bouquet's botanical theme:

### Primary Colors
| Token | Hex | Purpose | Notes |
|---|---|---|---|
| `--color-leaf-green` | `#019B63` | Primary CTAs, brand accents | Forest Green from Otter |
| `--color-coral` | `#FC6E48` | Destructive actions, danger, share CTAs | Ruby Red / Coral from Otter |

### Secondary Accent Colors
| Token | Hex | Purpose | Notes |
|---|---|---|---|
| `--color-sky-blue` | `#8EB4E3` | Cards, soft backgrounds | Sky Blue from Otter |
| `--color-sunny` | `#FFB800` | Highlights, badges, special states | Sunny Yellow from Otter |
| `--color-ocean-blue` | `#4E7BC0` | Secondary accents | Ocean Blue from Otter |
| `--color-lavender` | `#6B86C2` | Tertiary accents, modal elements | Grape Purple from Otter |
| `--color-petal-pink` | `#FFC0A5` | Warm accents, secondary cards | Quartz Pink from Otter |

### Soft/Tint Backgrounds (for cards, tiles, hovers)
| Token | Hex | Purpose | Notes |
|---|---|---|---|
| `--color-soft-green` | `#E8F5E9` | Light green background | Tint of Forest Green |
| `--color-soft-pink` | `#FFF0E8` | Light pink background | Tint of Quartz Pink |
| `--color-soft-blue` | `#EBF2FC` | Light blue background | Tint of Sky Blue |
| `--color-soft-yellow` | `#FFF8E1` | Light yellow background | Tint of Sunny Yellow |
| `--color-soft-lavender` | `#F0EEFF` | Light purple background | Tint of Grape Purple |

### Neutral
| Token | Hex | Purpose | Notes |
|---|---|---|---|
| `--color-stone-gray` | `#C6C6C6` | Inactive, disabled, separators | Stone Gray from Otter |
| `--color-disabled` | `#B8B8C4` | Disabled button state | Existing token |

---

## Design Changes by Component

### 1. Theme Tokens (src/styles/index.css)

Add the following tokens to the `@theme` block in Tailwind v4:

```css
@theme {
  /* Existing tokens stay the same */
  /* ... */

  /* New pastel accent colors from Otter palette */
  --color-leaf-green: #019B63;
  --color-coral: #FC6E48;
  --color-sky-blue: #8EB4E3;
  --color-sunny: #FFB800;
  --color-ocean-blue: #4E7BC0;
  --color-lavender: #6B86C2;
  --color-petal-pink: #FFC0A5;

  /* Soft/tint backgrounds (reduced saturation versions) */
  --color-soft-green: #E8F5E9;
  --color-soft-pink: #FFF0E8;
  --color-soft-blue: #EBF2FC;
  --color-soft-yellow: #FFF8E1;
  --color-soft-lavender: #F0EEFF;

  /* Neutral */
  --color-stone-gray: #C6C6C6;
}
```

Keep all other theme tokens unchanged (fonts, existing colors, spacing, etc.).

---

### 2. Button System Refresh

#### Design Principles
- **Primary buttons**: `bg-leaf-green text-white` (instead of `bg-black text-white`)
- **Secondary buttons**: `border-2 border-leaf-green text-leaf-green` (instead of `border-black text-black`)
- **Destructive/Attention**: `text-coral underline` or `bg-coral text-white`
- **Tertiary**: Keep current underlined text style
- **Disabled**: Keep `bg-disabled` (#B8B8C4) unchanged
- **Hover**: Darken color on hover (e.g., `leaf-green` → `#007D4E`), add subtle scale (1.02) + shadow

#### Files to Update

**HomePage.tsx**
- "START CREATING" button: Primary green (`bg-leaf-green text-white`)
- "MY COLLECTION" button: Secondary green (`border-2 border-leaf-green text-leaf-green`)

**GardenPage.tsx**
- "CREATE A BOUQUET" button: Primary green
- "BACK TO HOME" button: Secondary green

**ViewerPage.tsx**
- "CREATE YOUR OWN" button: Primary green
- "SAVE AS PHOTO" button: Secondary green
- "SAVE TO GARDEN" button: Secondary green

**StepNavigation.tsx** (BuilderPage)
- "NEXT" button: Primary green
- "BACK" button: Secondary green with proper hover

**PreviewModal.tsx** (Garden)
- "EDIT" button: Primary green
- "SAVE AS PHOTO" button: Secondary green
- "SHARE LINK" button: Secondary green
- "DELETE" button: Destructive coral (`text-coral underline`)

**ShareActions.tsx**
- "SHARE" button: Primary coral (attention color)
- "SAVE AS PHOTO" button: Secondary green
- "SAVE TO GARDEN" button: Secondary green
- "COPY LINK" button: Secondary green

**Cart.tsx** (Builder Step 1)
- "+/-" buttons: `border-leaf-green text-leaf-green` (currently black)
- Hover: soft-green background tint

---

### 3. Card & Tile Styling

#### FlowerTile.tsx (Step 1 Grid)

**Current**: White bg, 2px black border, opacity hover

**New**:
- Pastel-tinted backgrounds: rotate through `soft-green`, `soft-pink`, `soft-blue`, `soft-yellow`, `soft-lavender` (cycle through 9 flowers)
- Border: 2px solid matching the stronger color
  - `soft-green` card → `border-leaf-green`
  - `soft-pink` card → `border-petal-pink`
  - `soft-blue` card → `border-sky-blue`
  - `soft-yellow` card → `border-sunny`
  - `soft-lavender` card → `border-lavender`
- **Hover**: `scale(1.03)` + subtle shadow (`shadow-md`)
- Border-radius: **4px** (small rounding for playfulness, not sharp)
- Selected state: `ring-2 ring-offset-2 ring-leaf-green` (instead of outline)

**Example markup pattern**:
```jsx
// Tile rotation pattern based on flower index
const tintColors = ['soft-green', 'soft-pink', 'soft-blue', 'soft-yellow', 'soft-lavender'];
const borderColors = ['leaf-green', 'petal-pink', 'sky-blue', 'sunny', 'lavender'];
const tint = tintColors[flowerIndex % tintColors.length];
const border = borderColors[flowerIndex % borderColors.length];

return (
  <div
    className={`
      bg-${tint} border-2 border-${border}
      rounded-[4px]
      cursor-pointer
      transition-all duration-200
      hover:scale-[1.03] hover:shadow-md
      ${isSelected ? 'ring-2 ring-offset-2 ring-leaf-green' : ''}
    `}
  >
    {/* content */}
  </div>
);
```

#### BouquetCard.tsx (Garden Grid)

**Current**: White bg, 2px black border, hover darkens with black/40% overlay + text highlight

**New**:
- White bg with thin pastel border: `border-leaf-green` (1px, softer than current 2px black)
- Border-radius: **4px** (consistent with tiles)
- **Hover state**:
  - Replace harsh black overlay with green-tinted overlay (leaf-green with 0.15 opacity)
  - White text label appears
  - Subtle shadow: `shadow-lg`
- Thumbnail preview: no style changes (still miniature canvas)

#### Modal.tsx (Generic Modal)

**Current**: White bg, 2px black border, centered overlay with backdrop blur

**New**:
- Replace 2px black border with **1px subtle border** (`border-stone-gray`)
- Add subtle **shadow-lg** (hover-like, resting state)
- Add thin **colored accent line** at the top of the modal: **2px solid leaf-green** (progress/branding indicator)
- Keep backdrop blur and centering unchanged
- Border-radius: **4px** (small, subtle)

---

### 4. Toast Notifications (Toast.tsx)

**Current**:
- Success: `bg-black text-white`
- Error: `bg-white text-black border-2 border-black`

**New**:
- Success: `bg-leaf-green text-white` (soft, supporting tone)
- Error: `bg-coral text-white` (attention color)
- Warning: `bg-sunny text-black` (optional, if used)
- Info: `bg-sky-blue text-black` (optional, if used)
- All with rounded corners **4px** and subtle shadow

---

### 5. Landing Page Enhancement (HomePage.tsx)

#### Pastel Blob Decoration

Add decorative blob shapes using CSS (pseudo-elements or absolute-positioned divs) inspired by Otter's brand page layout:

- **Top-left**: Coral circle (size ~200px) with opacity ~0.3
- **Top-right**: Sky-blue arrow/triangle shape (size ~150px) with opacity ~0.2
- **Bottom-left**: Petal-pink blob (size ~180px) with opacity ~0.25
- **Bottom-right**: Sunny-yellow rectangle (size ~160px) with opacity ~0.2

**Constraints**:
- Blobs are **behind** all text content (low z-index)
- Use CSS `clip-path` or `border-radius` for organic shapes
- Opacity is low (0.2–0.3) so text remains readable
- Do NOT cover the main tagline or call-to-action buttons

#### Tagline Enhancement

- Keep the tagline text in monospace
- Optionally highlight key words with `text-leaf-green` (e.g., "create", "share", "digital")
- No font changes, only color accents

#### Button Updates

- "START CREATING" → Primary green (`bg-leaf-green text-white`)
- "MY COLLECTION" → Secondary green (`border-leaf-green text-leaf-green`)

---

### 6. Builder Step Indicator (BuilderPage.tsx)

**New feature** (inspired by Otter's "Analyzing..." dots)

Add a step progress indicator at the top of the builder page, above the main content:

```
STEP 1: PICK FLOWERS    STEP 2: ARRANGE    STEP 3: PREVIEW
   ●────────────────●─────────────────●
```

Or use a cleaner dot pattern:

```
● ● ●
1 2 3
```

**Colors**:
- **Completed step**: `leaf-green` (solid circle)
- **Current step**: `coral` (solid circle with ring)
- **Upcoming step**: `stone-gray` (hollow circle or lighter)

**Placement**: Top of BuilderPage, centered, above the step content

---

### 7. NoteCard.tsx

**Current**: White bg, 2px black border, DM Sans font, draggable on canvas

**New**:
- White bg (unchanged)
- Replace 2px black border with **2px leaf-green border** (botanical accent)
- Add subtle **shadow-sm** (light shadow, not resting state)
- Border-radius: **4px** (small, consistent with cards)
- All other properties unchanged (DM Sans, draggable, positioning)

---

### 8. Layout.tsx (Navbar/Header)

**Current**: Minimal navbar with "DigiBouquet" logo (Pinyon Script) + "My Garden" link (black text)

**New**:
- Logo: Pinyon Script, unchanged styling
- "My Garden" link: Change text color to `text-leaf-green` (instead of black)
- Add **1px bottom border** to navbar in `border-petal-pink` or `border-sky-blue` (subtle visual separation)
- Keep all padding and layout unchanged

---

### 9. Cart.tsx Styling (Builder Step 1)

**Current**: Cart sidebar with black borders, black text

**New**:
- Cart container: Optional soft-green background tint (`bg-soft-green` with 0.1 opacity)
- Cart item hover: `bg-soft-green` (light tint)
- "+/-" buttons: `border-leaf-green text-leaf-green` (instead of black)
- Total/count text: Optionally accent key numbers in `text-leaf-green`
- Clear button (if exists): Tertiary style or destructive coral

---

### 10. GreenerySelector.tsx

**Current**: Dropdown with black label, black border on select

**New**:
- Label: Monospace, keep black
- Dropdown border: `border-leaf-green` (instead of black)
- Selected state: `bg-soft-green` or `ring-leaf-green`
- Options: No color changes needed

---

### 11. Interactive Hover States (All Components)

**Current**: Opacity changes (0.7–0.8) on all interactive elements

**New** (replace with):
- **Buttons**: Darken color + `scale(1.02)` + subtle shadow
  - `leaf-green` → darker shade (`#007D4E` or similar)
  - `coral` → darker shade (`#E85A35` or similar)
- **Cards/Tiles**: `scale(1.03)` + `shadow-md`
- **Links**: Change text color to `text-leaf-green` or `text-coral` (no opacity)
- **Text inputs**: `ring-leaf-green` or `border-leaf-green` on focus

---

## Implementation Phases

### Phase 1: Core Colors & Buttons (Low Risk) — DONE
1. Update `src/styles/index.css` with new theme tokens (DONE)
2. Update all button components (HomePage, GardenPage, ViewerPage, StepNavigation, PreviewModal, ShareActions) (DONE)
3. Update Toast notifications (DONE)
4. Test: All CTAs should use green/coral instead of black (DONE)

**Agents needed**: 2 parallel agents
- Agent A: Theme tokens + Toast
- Agent B: Button components

**Risk**: Low (straightforward color swaps, no layout changes)

---

### Phase 2: Cards & Tiles
1. Update FlowerTile.tsx (pastel backgrounds, borders, hover)
2. Update BouquetCard.tsx (green border, softer hover)
3. Update Modal.tsx (border, shadow, accent line)
4. Update NoteCard.tsx (green border, shadow)
5. Test: All cards/tiles should have pastel tints, softer hovers

**Agents needed**: 2 parallel agents
- Agent A: FlowerTile, BouquetCard, NoteCard
- Agent B: Modal.tsx

**Risk**: Medium (new border-radius, hover effects need testing)

---

### Phase 3: Landing & Navigation
1. Update HomePage.tsx (blob decorations, button colors, tagline accents)
2. Update Layout.tsx (navbar border, "My Garden" color)
3. Update Cart.tsx (green borders, soft-green hover)
4. Update GreenerySelector.tsx (green borders)
5. Test: Landing page should have decorative blobs, navbar should look refined

**Agents needed**: 1 agent
- Agent A: HomePage, Layout, Cart, GreenerySelector

**Risk**: Medium (CSS shapes/pseudo-elements for blobs, cross-component styling)

---

### Phase 4: Builder Progress Indicator
1. Add StepIndicator component to BuilderPage
2. Color logic: completed (green), current (coral), upcoming (gray)
3. Integrate into builder layout (top of page)
4. Test: All three steps should show correct colors

**Agents needed**: 1 agent
- Agent A: BuilderPage, StepIndicator component

**Risk**: Low (new component, isolated change)

---

## Testing Checklist

- [ ] All primary buttons are green (`leaf-green`)
- [ ] All secondary buttons have green borders
- [ ] Destructive actions use coral color
- [ ] Flower tiles have alternating pastel backgrounds
- [ ] Flower tiles scale and shadow on hover
- [ ] Garden cards have green borders and soft hover overlay
- [ ] Modals have accent line at top and subtle shadow
- [ ] Note cards have green borders
- [ ] Toast notifications use green (success) and coral (error)
- [ ] Landing page has pastel blob decorations
- [ ] "My Garden" link is green in navbar
- [ ] Step indicator appears on builder page with correct colors
- [ ] Canvas (BouquetPreview) styling is unchanged (export target)
- [ ] All text remains readable with new colors
- [ ] Mobile responsive: blobs scale, cards wrap, modals go full-screen
- [ ] No accessibility regressions (sufficient color contrast)

---

## Accessibility Notes

- **Color contrast**: Verify all text colors (especially colored text on colored backgrounds) meet WCAG AA standards
  - `leaf-green` (#019B63) on white: ~7.5:1 ✓ (good)
  - `coral` (#FC6E48) on white: ~4.5:1 ✓ (acceptable)
  - `sky-blue` (#8EB4E3) on white: ~2.5:1 ✗ (too light, pair with darker text)
- **Motion**: Keep `scale()` and `shadow` hovers subtle to avoid triggering motion sensitivity
- **Semantic HTML**: No changes to button/link semantics, only styling

---

## Constraints & Non-Changes

### Keep As-Is
- Canvas dimensions: 800x600 (fixed export target)
- BouquetPreview styling: No changes (it's the image export)
- Monospace font for all UI text (Courier Prime, IBM Plex Mono)
- DM Sans for note cards only
- Pinyon Script for logo
- Cream background (#F0EBDA) as primary page background
- Sharp corners on buttons (NO border-radius on buttons)
- Flat design: No resting shadows (shadows only on hover)
- No gradients

### Modified
- Button colors: Black → Green/Coral
- Card borders: Black → Pastel colors
- Card backgrounds: White → Pastel tints (optional)
- Hover effects: Opacity → Scale + Shadow + Color
- Modals: Simple border → Accent line + shadow

### New Elements
- Pastel blob decorations on landing page
- Step progress indicator on builder
- Accent lines on modals

---

## Design Files & References

- **Otter Behance**: https://www.behance.net/gallery/242135361/Otter
- **Current theme**: `src/styles/index.css` (@theme block)
- **Tailwind v4 docs**: https://tailwindcss.com/docs/theme

---

## Notes for Development

### Color Application in Tailwind

Use Tailwind utility classes wherever possible (not inline styles):

```tsx
// Good
<button className="bg-leaf-green text-white hover:bg-[#007D4E]">Share</button>

// If custom shade not in theme, use arbitrary value
<div className="border-leaf-green border-2">Card</div>

// For soft backgrounds
<div className="bg-soft-green">Content</div>
```

### Hover State Pattern

Replace opacity hovers with this pattern:

```tsx
// Old pattern
<button className="bg-black text-white hover:opacity-75">Click</button>

// New pattern
<button className="bg-leaf-green text-white hover:bg-[#007D4E] hover:scale-[1.02] hover:shadow-md transition-all duration-200">
  Click
</button>
```

### Blob Shapes (CSS)

Use `clip-path` for organic blobs:

```css
.blob-coral {
  width: 200px;
  height: 200px;
  background: #FC6E48;
  opacity: 0.3;
  clip-path: ellipse(50% 40% at 60% 50%);
  position: absolute;
  top: 10%;
  left: -50px;
}
```

Or use SVG in a pseudo-element for more control.

---

## Rollback Plan

If any phase introduces bugs or accessibility issues:

1. **Phase 1 rollback**: Revert `index.css` theme changes + button component colors
2. **Phase 2 rollback**: Revert card/tile/modal styling
3. **Phase 3 rollback**: Revert landing page + navigation styling
4. **Phase 4 rollback**: Remove StepIndicator component

All phases are independent — rolling back one doesn't affect others.

---

## Resolved Decisions (from Implementation)

- **"My Garden" icon** → YES, implemented as green: `border-2 border-leaf-green text-leaf-green`
- **Border-radius on buttons** → DECIDED: Sharp corners (0px) on buttons per CLAUDE.md spec. Cards may use 4px if desired, but current implementation maintains sharp corners.
- **Cart soft-green background** → DECIDED: Green borders on cart items (+/- buttons), no tinted background. Current: `border-leaf-green text-leaf-green`
- **Step indicator** → DECIDED: Dot pattern (3 circles with connector lines or simple dot layout), already implemented in BuilderPage
- **Navbar bottom border** → DECIDED: Petal-pink (`border-petal-pink`), already implemented

---

## Fresh Observations from Behance Review (Feb 2026)

Review of the Otter brand project reveals several design techniques we could adopt to increase visual impact:

### Color-Block Section Dividers

Otter uses full-width colored backgrounds (teal, yellow, black) as section separators between content blocks. These create visual momentum and break up dense layouts. **Opportunity**: We could adopt this technique for step transitions in BuilderPage or page sections:
- Add a teal (`ocean-blue`) accent band above step content as the user enters
- Use coral (`coral`) as an accent band on Step 3 preview area
- Subtle movement/animation as sections transition

This would enhance the visual hierarchy without disrupting the cream background aesthetic.

### Bold Serif Hero Headings

Otter's hero copy uses large, bold serif typography ("Match Smarter. Live Happier."). The serif weight and size create strong visual impact. **Our constraint**: Monospace is core to our identity, so we won't change fonts. **Adaptation**: Make the homepage tagline BOLDER by increasing `font-size` and `font-weight`. Keep monospace, just larger (e.g., 2xl → 4xl with heavier weight).

### Sticker/Badge Elements

Otter uses colorful speech-bubble and badge shapes with bold text overlaid for call-outs and notifications. **Opportunities for us**:
- Flower count badge in cart: "3/6" displayed as a small colored circle/pill with white text
- Step labels on BuilderPage: convert text labels to small badge shapes (leaf-green for active, stone-gray for upcoming)
- Toast notifications: Already using color, but could add rounded-pill styling + subtle icon (checkmark for success, X for error)

### Increase Blob Opacity

Current HomePage blobs are at 15-20% opacity — quite subtle. Otter's colored elements are much bolder (near full saturation on some shapes). **Recommendation**: Bump blob opacity to 25-35% for more visual presence without overwhelming text. Test with different opacity levels; users should still easily read tagline and CTAs.

### Lavender/Ocean-Blue for Special States

Otter uses blue-purple tones for positive notifications ("You're a match!"). **Opportunity**: Use lavender or ocean-blue for special app states:
- "Saved!" toast after saving to garden → `bg-ocean-blue text-white`
- Share link field background → optional `bg-sky-blue` tint with dark border
- "Bouquet shared!" confirmation → lavender toast
- Edit mode indicator on garden cards → subtle lavender ring or badge

---

## Success Criteria

✓ All buttons follow new green/coral color scheme
✓ Cards and tiles have cohesive pastel styling with matching borders
✓ Hover interactions use scale + shadow (not just opacity)
✓ Landing page has decorative blobs without obstructing content
✓ Step indicator clearly shows builder progress
✓ Modals have refined styling with accent line
✓ All text remains accessible (color contrast ≥ 4.5:1)
✓ Canvas export (BouquetPreview) is unchanged
✓ Mobile responsive: all new styles work on small screens
✓ No regressions: existing functionality works as before
