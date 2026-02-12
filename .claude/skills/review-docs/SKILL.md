---
name: review-docs
description: Reviews planning docs, feature specs, and issue reports for completeness, codebase accuracy, security, edge cases, and agent readiness BEFORE code is written. Tailored for the Digital Bouquet client-side React app (TypeScript, Redux Toolkit, @dnd-kit, lz-string, html-to-image).
argument-hint: [doc-file-path]
context: fork
agent: Plan
allowed-tools: Read, Grep, Glob, Bash(ls/git log/git diff/git show/wc), WebSearch, context7
user-invocable: true
---

# Digital Bouquet Document Review

Review technical documents — feature specs, planning docs, issue reports — before handing them to a development agent. Verify every claim against the actual codebase, assess security for client-side architecture, predict bugs, and ensure the document is agent-ready. Tailored for the Digital Bouquet project.

**Target document**: `$ARGUMENTS`

---

## Phase 0: Discover Project Context

Before reviewing, understand the project:

1. Read `CLAUDE.md` (and any `.claude/CLAUDE.md`) for architecture, conventions, and the complete tech stack.
2. Read `package.json` for dependencies (React, RTK, @dnd-kit, lz-string, html-to-image).
3. Read `tsconfig.json` for TypeScript strict config.
4. Check linter configs (`.eslintrc*`, `.prettierrc*`) to know what's already enforced.
5. Note key constraint: **fully client-side** — no backend, no database. URL is the database for sharing. localStorage for the garden.
6. Carry this context into every subsequent phase.

---

## Phase 1: Read & Understand the Document

Read the entire document. Identify:
- **Document type**: feature spec, flow doc, issue report, planning doc
- **Feature being described**: the core functionality
- **Target agent**: which agent will consume this doc
- **All technical claims**: file paths, component names, Redux state shapes, encoding behavior
- **User journey**: the complete flow from start to finish

---

## Phase 2: Codebase Verification

For every technical claim in the document, verify against actual code:

**File Paths** — Verify every mentioned path exists using Glob or Read. Flag moved or missing files.

**Component Behavior** — For claims about how components work, read the actual component. Check Redux state shape matches `builderSlice.ts` and `gardenSlice.ts`.

**Type Definitions** — Verify referenced types exist in `types/index.ts`. Check FlowerType, PlacedFlower, Bouquet, etc.

**Dependencies** — Check libraries/versions against `package.json`. Verify @dnd-kit usage matches `useDraggable` (not `useSortable`).

**Feature Feasibility** — Check if proposed changes conflict with existing code. Verify the 3-step wizard flow. Check canvas dimensions (800x600). Verify encoding/decoding behavior.

---

## Phase 3: Code Quality Review

Read each file the document references or proposes to modify:

- Flag code smells: components >80 lines, prop drilling, missing error handling
- Note if existing code contradicts the document's assumptions
- Check for TODO/FIXME comments that might affect the feature
- Check `git log` for recently changed files that might have diverged

---

## Phase 4: Completeness Check

**User Flow & Requirements**
- Complete user journey step by step? All user actions and system responses?
- Success AND failure paths documented?
- Edge cases identified? (0 flowers, max 6 flowers, 100-word note limit, empty garden)
- All 3 wizard steps accounted for?
- Viewer page behavior defined?
- Garden interactions specified?

**Technical Specifications**
- Redux state changes specified? (which slice, which action, state shape)
- Component tree described? (parent/child relationships)
- URL encoding/decoding behavior specified?
- @dnd-kit interaction model described?
- Image export behavior specified?

**Architecture & Design**
- Folder/file structure follows CLAUDE.md? (features/builder, features/garden, features/share)
- Component splitting respected? (~80 lines max)
- State management correct? (builder NOT persisted, garden IS persisted)
- Loading states, error states, empty states covered?

**Missing Considerations**
- Accessibility (a11y) — keyboard navigation for drag-and-drop, screen readers
- Mobile/responsive behavior — canvas scaling, touch events
- Browser compatibility — Web Share API, clipboard API, crypto.randomUUID()

---

## Phase 5: Security Deep Dive

### Client-Side Security (No Backend)

**URL Encoding Security** — URL-decoded data validated with strict schema? Flower IDs stripped and regenerated? Canvas dimensions stripped? Could malicious compressed data crash the app or trigger XSS?

**lz-string Compression** — Decompression of untrusted data safe? Could crafted input cause excessive memory usage (decompression bomb)? Size limits on URL params?

**localStorage** — Data validated when read back from redux-persist? Could corrupted garden data crash the app? Quota exceeded handling? Browser private mode?

**XSS Prevention** — Note text ALWAYS rendered as plain text (never `dangerouslySetInnerHTML`)? User-generated content escaped? No `eval()` or `Function()` on URL data?

**Input Validation** — Note text max 100 words enforced? Cart max 6 flowers enforced? Flower type restricted to valid FlowerType enum?

**Prototype Pollution** — JSON.parse on URL-decoded data without validation?

### Domain-Specific: URL/Data Sharing

- Share link size limits (browser URL length ~2000-8000 chars)?
- No sensitive data embedded in URLs?
- Schema versioning for forward compatibility?

---

## Phase 6: Bug Prediction

Predict likely implementation bugs:

- **Z-index conflicts** — flower layering, greenery always behind, note always on top
- **Drag positioning** — flowers outside canvas bounds, negative coordinates
- **URL encoding** — max bouquet (6 flowers + 100-word note) exceeding URL length
- **Redux state reset** — BACK from step 2 resets placedFlowers but preserves note text
- **Garden edit flow** — editingBouquetId lifecycle, stale data when editing
- **Image export** — fonts not loaded when toPng() runs, assets missing in export
- **beforeunload** — unsaved work warning logic
- **Web Share API** — unavailable on desktop, clipboard fallback
- **redux-persist rehydration** — timing issues, schema migration after updates
- **Canvas scaling** — CSS transform on mobile affecting drag coordinates

---

## Phase 7: Edge Cases

Check if these scenarios are addressed:

1. **0 flowers selected** — what happens if user reaches step 2 with empty cart?
2. **Max flowers (6)** — can user bypass the limit? What if they try?
3. **100-word note limit** — what counts as a word? Whitespace handling? Paste-in text?
4. **Empty garden** — "My Collection" button hidden? What does garden page show?
5. **Corrupted share URL** — invalid compressed data, tampered params, truncated URL
6. **Browser back/forward** — does it interact with the wizard step state?
7. **Multiple tabs** — localStorage changes in one tab affecting another?
8. **Very long flower names** — do they overflow in the UI?
9. **Mobile touch** — drag-and-drop with touch events?
10. **Image export with many elements** — performance with 6 flowers + greenery + note?

---

## Phase 8: Agent Readiness

Evaluate if an agent can implement from this doc without ambiguity:

- Are instructions specific and unambiguous?
- Could two different developers interpret this differently?
- Are there implicit assumptions that should be explicit?
- Is the order of implementation clear?
- Are acceptance criteria defined?
- Are there references to existing code patterns to follow?
- Is the scope clearly bounded? (what's in vs out)

**Ambiguity Analysis:**

| Ambiguous Text | Interpretation A | Interpretation B | Risk |
|---|---|---|---|

---

## Phase 9: Context7 Library Verification

Use context7 to verify referenced library APIs are current:

- @dnd-kit useDraggable API and patterns
- lz-string compress/decompress API
- html-to-image toPng() API
- Redux Toolkit createSlice, createSelector patterns
- Do NOT flag based on training data — verify with context7 first

---

## Output Format

Structure the review with ALL sections below. Every section is mandatory.

---

### 1. Executive Summary

```
FINDINGS: X total — P0: N | P1: N | P2: N | P3: N
VERDICT: [READY / REVISE / REWRITE]

TOP 3 MUST-FIX:
1. [F-XX] <most critical>
2. [F-XX] <second critical>
3. [F-XX] <third critical>
```

### 2. Document Overview

| Field | Value |
|---|---|
| **Document** | [filename] |
| **Feature** | [identified feature] |
| **Tech Stack** | React 18+ / TypeScript / Redux Toolkit / Tailwind / @dnd-kit / lz-string / html-to-image |
| **Document Type** | [type] |
| **Target Agent** | [agent] |
| **Key Constraint** | Fully client-side — no backend |

### 3. Scoring

| Dimension | Score | Weight | Notes |
|---|---|---|---|
| Completeness | X/10 | 1.0x | |
| Technical Accuracy | X/10 | **1.5x** | |
| Security Coverage | X/10 | **1.5x** | |
| Edge Case Coverage | X/10 | 1.0x | |
| Clarity & Readability | X/10 | 1.0x | |
| Agent Readiness | X/10 | 1.0x | |
| **Weighted Overall** | **X/10** | | |

Formula: `(C×1 + TA×1.5 + SC×1.5 + EC×1 + CR×1 + AR×1) / 7`

### 4. What the Document Does Well
### 5. All Findings (F-XX, P0→P3)
### 6. Codebase Verification Results (Verified / Failed / Outdated)
### 7. Code Quality Issues in Referenced Files
### 8. Agent Readiness Assessment + Ambiguity Analysis
### 9. Quick Wins
### 10. Copy-Paste-Ready Additions
### 11. Bug Prediction
### 12. Final Verdict (score, recommendation, summary)

---

## Rules

1. **Always discover project context first** — read CLAUDE.md, package.json, tsconfig.json.
2. **Always verify against the codebase** — never assume a claim is correct.
3. **Read actual code** — don't just check if a file exists.
4. **Be specific** — file paths, line numbers, function names.
5. **Prioritize by severity** — P0 first, P3 last.
6. **Provide copy-paste-ready additions** — not vague advice.
7. **Adapt security checks** — focus on client-side: URL encoding, localStorage, compression, no backend.
8. **Verify with context7** — don't flag library APIs based on training data.
9. **Never modify the document** — only review and report.
10. **Scale to project stage** — client-side hobby project, not enterprise.
11. **Be constructive** — improve the doc, not criticize the author.
12. **Think like an attacker** (URL injection), **think like a user** (mobile, drag UX), **think like a junior dev** (clarity).
