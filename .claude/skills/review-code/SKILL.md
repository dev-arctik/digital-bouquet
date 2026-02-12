---
name: review-code
description: Reviews code for architecture, security, clean code, performance, error handling, and best practices. Dual mode — full code review or bug investigation. Tailored for the Digital Bouquet stack (React 18+, TypeScript strict, Redux Toolkit, Tailwind, @dnd-kit, lz-string, html-to-image).
argument-hint: [file-path-or-bug-description]
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Bash(ls/git log/git diff/git show/wc/find), context7
user-invocable: true
---

# Digital Bouquet Code Review

Review code for architecture, security, clean code, performance, error handling, and framework best practices. Dual mode: full code review (default) or bug investigation. Tailored for the Digital Bouquet client-side React app.

**Input**: `$ARGUMENTS`

---

## Mode Detection

- **Code Review Mode** (default) — input is a file path, folder path, or no argument. Runs the full 12-phase audit.
- **Bug Hunt Mode** — input is a natural language bug description or starts with `bug:`. Runs the 5-step investigation.

If ambiguous, default to Code Review Mode.

---

# CODE REVIEW MODE

## Phase 0: Project Intelligence

Build a mental model before reviewing any code.

### Step 1: Discover All Docs

Glob for `**/*.md`. Categorize:

| Category | Examples | Action |
|---|---|---|
| **Must-Read** | CLAUDE.md, .claude/CLAUDE.md | Read fully |
| **High-Value** | docs/planning/*, docs/feature_flow/*, docs/issues/* | Read fully |
| **Scan** | Other .md in src/ | First 50 lines |
| **Skip** | CHANGELOG, LICENSE, node_modules, dist | Ignore |

### Step 2: Read Non-Markdown Intelligence

- `package.json` — dependencies (React, RTK, @dnd-kit, lz-string, html-to-image)
- `tsconfig.json` — TypeScript strict config
- `.eslintrc*`, `.prettierrc*` — linter rules (skip what they enforce)
- `vite.config.*` — build config
- `.gitignore` — generated vs authored

### Step 3: Build Mental Model

Summarize: purpose (client-side bouquet creator), stack (React 18+ Vite TypeScript, Redux Toolkit + redux-persist, Tailwind, @dnd-kit, lz-string, html-to-image), conventions from CLAUDE.md, what's enforced by linters, project stage.

**Key constraint**: No backend. URL is the database for sharing. localStorage for the garden. All client-side.

---

## Phase 1: Codebase Mapping

1. Directory tree — `ls` target path (2 levels deep)
2. Entry points — `main.tsx`, route definitions, store configuration
3. Hot paths — `git log --oneline -20 -- <path>`
4. Uncommitted changes — `git diff --stat`
5. File counts — `wc -l` on key files
6. Key relationships — import flows between features/builder, features/garden, features/share

---

## Phase 2: Architecture & Structure

| Check | What to Look For |
|---|---|
| Feature organization | builder/, garden/, share/ under features/? Components properly grouped? |
| Separation of concerns | UI components separate from state logic? Encoding/decoding isolated? |
| Naming conventions | Files, folders consistent with CLAUDE.md structure? |
| Component size | Any components over ~80 lines that should be split? |
| Module boundaries | Clear boundaries between builder, garden, share? |

---

## Phase 3: Code Quality

| Check | What to Look For |
|---|---|
| DRY violations | Duplicated logic between builder and viewer? |
| Single Responsibility | Components doing too many things? |
| Function length | Functions >50 lines? |
| Naming | Descriptive and consistent? |
| Type safety | Any `any` types? Missing interfaces? Loose typing? TypeScript strict violations? |
| Dead code | Unused imports, unreachable branches, commented-out blocks? |
| Magic values | Hardcoded numbers (canvas dimensions, max flowers, z-index) not as constants? |
| Prop drilling | State passed through 3+ levels instead of using Redux? |

---

## Phase 4: Security Audit

### Client-Side Security (No Backend)

| Category | What to Look For |
|---|---|
| **XSS** | Any `dangerouslySetInnerHTML`? Note text rendered as plain text (never HTML)? |
| **URL encoding** | Is URL-decoded data validated with strict schema? Could malicious compressed data crash the app? |
| **lz-string safety** | Decompression of untrusted data — could it produce huge output? DoS via crafted URLs? |
| **localStorage** | Data validated when read back? Could corrupted garden data crash the app? |
| **Prototype pollution** | JSON parsing without validation? |
| **Input validation** | Note text length-limited (100 words)? Cart max enforced (6 flowers)? |
| **Dependencies** | Known vulnerable packages? |

### Domain-Specific Security

**URL/Data Sharing** — URL encoding security, compression safety, share link size limits, no sensitive data in URLs, schema validation on decode

---

## Phase 5: Performance & Efficiency

| Check | What to Look For |
|---|---|
| Re-renders | @dnd-kit drag events causing unnecessary re-renders? Canvas re-rendering on every drag? |
| Memoization | Expensive computations memoized? Flower list, garden grid, canvas render? |
| html-to-image | toPng() performance? All assets local (no external URLs blocking export)? |
| lz-string | Compression/decompression on every render? Should be computed once? |
| Bundle size | Large deps for small features? Tree-shaking working? |
| Lazy loading | Routes lazy-loaded? Large components code-split? |
| Canvas rendering | 800x600 canvas with CSS transform scaling efficient? |

---

## Phase 6: Error Handling & Resilience

| Check | What to Look For |
|---|---|
| Error boundaries | ErrorBoundary wrapping BuilderPage, ViewerPage, GardenPage? |
| URL decode failures | Graceful handling of invalid/corrupted share URLs? |
| localStorage failures | Quota exceeded? Corrupted data? Browser private mode? |
| Image export failures | html-to-image errors caught? Loading/feedback states? |
| Share API fallback | Web Share API unavailable? Clipboard fallback working? |
| Font loading | What happens if Google Fonts fail to load? CSS fallbacks? |
| User feedback | All async actions show spinners and toasts? |

---

## Phase 7: Dependencies & Configuration

| Check | What to Look For |
|---|---|
| Outdated packages | React, RTK, @dnd-kit, lz-string, html-to-image up to date? |
| Unused dependencies | Listed but never imported? |
| Lock file | package-lock.json committed? |
| Vite config | Proper build optimization? Asset handling? |

---

## Phase 8: Testing Assessment

| Check | What to Look For |
|---|---|
| Test existence | Any tests at all? Test file naming? |
| Critical untested paths | URL encoding/decoding with max bouquets? Drag-and-drop? Image export? |
| Edge cases | 0 flowers, 6 flowers, 100-word note, empty garden, corrupted URL? |

---

## Phase 9: Framework Best Practices

### React + TypeScript

- Hooks rules followed? No conditional hooks, proper dependency arrays?
- Component composition vs prop drilling?
- Key props in lists (flower list, garden grid)?
- useEffect cleanup functions (drag listeners, beforeunload)?
- State colocation — state as close to usage as possible?
- Controlled vs uncontrolled inputs consistent?
- TypeScript strict mode compliance? No `any` escape hatches?

### Redux Toolkit + redux-persist

- Slices properly organized (builder + garden)?
- builder NOT persisted, garden IS persisted — correct?
- Selectors memoized for computed data (createSelector)?
- Action naming — past tense describing what happened?
- No direct state mutation outside RTK?
- editingBouquetId handled correctly for new vs edit flows?

### @dnd-kit

- `useDraggable` used (NOT `useSortable` per CLAUDE.md)?
- Free-form positioning on canvas (x/y coordinates)?
- Drag constraints within canvas bounds?
- Z-index management during drag?
- Note card always on top?

### Tailwind CSS

- Inline styles ONLY for dynamic canvas positions/transforms?
- Tailwind for everything else?
- Responsive breakpoints for mobile?
- Design system consistency (cream bg, sharp corners, monospace UI font)?
- No box shadows, no gradients, no border-radius (per design spec)?

### lz-string + URL Encoding

- Flower IDs stripped before encoding, regenerated on decode?
- Canvas dimensions stripped from URL?
- Strict schema validation on decode?
- Compression/decompression error handling?

### html-to-image

- toPng() with all local assets (no external URLs)?
- Canvas exports cleanly (800x600, cream background)?
- Loading state during export?

---

## Phase 10: Bug Prediction

| Pattern | What to Check |
|---|---|
| **Stale closures** | useEffect/useCallback capturing old Redux state during drag |
| **Z-index conflicts** | Flower layering vs note card vs greenery ordering |
| **URL encoding edge cases** | Max bouquet (6 flowers + 100-word note) exceeding URL length limits |
| **Drag positioning** | Flowers placed outside canvas bounds, negative coordinates |
| **Redux state reset** | BACK from step 2 should reset placedFlowers but preserve note text |
| **Garden edit flow** | editingBouquetId not cleared properly, stale bouquet data |
| **Image export** | Fonts not loaded when toPng() runs, greenery/flowers missing in export |
| **beforeunload** | Unsaved work warning not triggering, or triggering when not needed |
| **Web Share API** | API unavailable on desktop browsers, clipboard fallback fails |
| **redux-persist rehydration** | Garden loads before builder ready, stale garden data after schema change |

---

## Phase 11: Context7 Verification

Before finalizing findings about @dnd-kit, lz-string, html-to-image, Redux Toolkit:

1. Use context7 `resolve-library-id` for each library
2. Use context7 `query-docs` to verify flagged patterns
3. Do NOT flag based on training data — verify first
4. If context7 doesn't have docs, note as "unverified"

---

# BUG HUNT MODE

## Step 1: Understand the Bug

- **Expected behavior** — what should happen
- **Actual behavior** — what actually happens
- **Trigger conditions** — user action, specific data, timing
- **Affected area** — builder wizard, garden, viewer, share, canvas
- **Frequency** — always, sometimes, specific conditions

## Step 2: Identify Suspects

1. Search for related code — Grep/Glob for keywords, component names, Redux actions
2. Check recent changes — `git log --oneline -20`
3. Read CLAUDE.md for architecture context
4. Build suspect list, read each file fully

## Step 3: Trace Data Flow

Follow data through the system:

**Builder flow**: User action → Redux dispatch → builderSlice reducer → selector → component render
**Share flow**: Bouquet state → encoder (strip IDs, compress) → URL param → decoder (decompress, validate, regenerate IDs) → ViewerPage
**Garden flow**: Save → gardenSlice → redux-persist → localStorage → rehydrate on load
**Canvas flow**: placedFlowers state → BouquetCanvas → @dnd-kit useDraggable → position update → Redux dispatch

## Step 4: Narrow the Cause

| # | Culprit | What to Look For |
|---|---|---|
| 1 | **Stale closure** | Drag handler captures old flower positions |
| 2 | **Race condition** | Image export starts before fonts/images loaded |
| 3 | **Type coercion** | String "0" z-index vs number 0, falsy value bugs |
| 4 | **Encoding mismatch** | lz-string compress/decompress asymmetry, URL encoding double-applied |
| 5 | **Timing issue** | Component renders before redux-persist rehydrates garden |
| 6 | **State mutation** | Direct mutation of placedFlowers array instead of RTK dispatch |
| 7 | **Z-index ordering** | Swap-based controls producing wrong order, greenery not at 0 |
| 8 | **Null / undefined** | Missing null check on note (can be null), empty garden |
| 9 | **Canvas bounds** | Flower dragged outside 800x600, negative coordinates |
| 10 | **localStorage** | Quota exceeded, corrupted JSON, schema migration missing |
| 11 | **URL length** | Share URL too long for browser/clipboard, truncated data |
| 12 | **Import / module** | Wrong import path, missing re-export from barrel file |

## Step 5: Recommend Fix

1. **Root cause** — exact file:line, function, what's wrong
2. **Category** — which culprit
3. **Before/After code**
4. **Related risks** — other places with same pattern
5. **Test case** — verification + regression prevention

---

# OUTPUT FORMAT — CODE REVIEW MODE

### 1. Executive Summary

```
PROJECT: Digital Bouquet
HEALTH: [Excellent / Good / Needs Work / Critical]
FINDINGS: X total — P0: N | P1: N | P2: N | P3: N

TOP 3 ISSUES:
1. [F-XX] <most critical>
2. [F-XX] <second>
3. [F-XX] <third>
```

### 2. Project Overview

| Field | Value |
|---|---|
| **Path** | [reviewed path] |
| **Tech Stack** | React 18+ / Vite / TypeScript strict / Redux Toolkit / Tailwind / @dnd-kit / lz-string / html-to-image |
| **File Count** | [count] |
| **LOC** | [approx] |
| **Architecture** | Feature-based (builder, garden, share) |
| **Project Stage** | [MVP / Growing / Mature] |
| **Key Constraint** | Fully client-side — no backend, no database |

### 3. Scoring

| Dimension | Score | Weight | Notes |
|---|---|---|---|
| Architecture & Structure | X/10 | 1.0x | |
| Code Quality | X/10 | **1.5x** | |
| Security | X/10 | **1.5x** | |
| Performance | X/10 | 1.0x | |
| Error Handling | X/10 | 1.0x | |
| Dependencies & Config | X/10 | 0.5x | |
| Testing | X/10 | 1.0x | |
| Framework Best Practices | X/10 | 1.0x | |
| **Weighted Overall** | **X/10** | | |

Formula: `(AS×1 + CQ×1.5 + S×1.5 + P×1 + EH×1 + DC×0.5 + T×1 + FBP×1) / 9`

### 4. What is Done Well
### 5. All Findings (F-XX, P0→P3)
### 6. Architecture Assessment
### 7. Security Findings (Expanded)
### 8. Performance Findings (Expanded)
### 9. Quick Wins
### 10. Before/After Code Examples (3-5)
### 11. Bug Predictions
### 12. Final Verdict (score, health, immediate/short-term/long-term actions)

---

# OUTPUT FORMAT — BUG HUNT MODE

### 1. Bug Summary (expected, actual, trigger, severity)
### 2. Investigation Trail (files explored, verdicts)
### 3. Root Cause (file:line, function, category, explanation)
### 4. Recommended Fix (before/after code)
### 5. Related Risks
### 6. Test Case

---

## Rules

1. **Always discover project context first** — read CLAUDE.md, docs/, package.json, tsconfig.json.
2. **Always read actual code** — never assume or guess.
3. **Be specific** — file:line for every finding.
4. **Prioritize by severity** — P0 first, P3 last.
5. **Show before/after code** — for every fixable issue.
6. **Adapt to DB stack** — React + TypeScript strict + RTK + @dnd-kit + lz-string + html-to-image checks.
7. **Verify with context7** — don't flag library APIs based on training data.
8. **Never modify code** — only review and report.
9. **Scale to project stage** — client-side hobby project, not enterprise.
10. **Be constructive** — acknowledge good work.
11. **Think like an attacker** (URL injection, localStorage abuse), **think like a user** (drag UX, mobile), **think like a maintainer** (type safety, DRY).
12. **Check what's already enforced** — skip linter/CI checks.
13. **Global finding IDs** — unique F-XX throughout.
14. **One finding per issue** — discrete and actionable.
