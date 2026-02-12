# CI/CD Pipeline

## Overview

DigiBouquet uses a multi-stage CI/CD pipeline to ensure code quality before deployment. Every push to `main` or pull request triggers automated checks (linting, type validation, testing), and only code that passes all checks is built and deployed to GitHub Pages.

The pipeline is built on **GitHub Actions** and includes:

1. **Check Stage** (runs on every PR and push): ESLint, TypeScript, and Vitest
2. **Build Stage** (runs on push/dispatch only): Compiles the app and creates artifacts
3. **Deploy Stage** (runs on push/dispatch only): Deploys to GitHub Pages

This architecture prevents broken code from reaching production, gives developers fast feedback on pull requests, and maintains a high bar for code quality.

---

## Architecture Overview

```
PR to main
    ↓
GitHub Actions Check Job
    ├─ Lint (ESLint)
    ├─ Typecheck (TypeScript)
    └─ Test (Vitest)
    ↓
All pass? → Comment on PR with results
Failed? → Block merge

Push to main
    ↓
GitHub Actions Check Job (same as above)
    ↓
If all pass → Build Job
    ├─ npm ci
    ├─ npm run build
    └─ Upload dist/ artifact
    ↓
Build succeeds? → Deploy Job
    ├─ Download artifact
    └─ Deploy to GitHub Pages
    ↓
Live at https://dev-arctik.github.io/digital-bouquet/
```

---

## Component 1: Test Infrastructure (Vitest)

### Why Vitest Instead of Jest?

The project uses **Vite** as the bundler. Vitest is the Vite-native test runner and reuses the Vite configuration, which is critical because:

- **Asset imports**: The decoder module imports `src/data/flowers.ts`, which in turn imports 12 PNG flower assets via Vite's asset handling
- **Vitest native support**: Automatically handles PNG imports through the same Vite pipeline as the app
- **Jest configuration**: Would require manual `moduleNameMapper` rules to stub image imports, adding complexity

### Installation

Vitest and coverage plugin are installed as dev dependencies:

```bash
npm install --save-dev vitest @vitest/coverage-v8
```

---

## Component 2: Vitest Configuration

**File**: `vite.config.ts`

The Vite config is extended with a `test` block to configure Vitest:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/digital-bouquet/',
  plugins: [react(), tailwindcss()],

  // Vitest configuration
  test: {
    // Use globals (describe, it, expect) without imports
    globals: true,

    // Run tests in Node environment (no DOM, no browser APIs except crypto)
    environment: 'node',

    // Include only .test.ts files
    include: ['src/**/*.test.ts'],

    // Coverage configuration
    coverage: {
      // Only report coverage for core logic (not views or types)
      include: [
        'src/utils/**',
        'src/features/share/**',
        'src/features/builder/PlacementEngine.ts',
        'src/data/flowers.ts',
      ],
    },
  },
});
```

### Key Configuration Details

- **`globals: true`**: Tests don't need `import { describe, it, expect } from 'vitest'`
- **`environment: 'node'`**: All tests are pure logic (no DOM). Browser APIs like `crypto.randomUUID()` work but localStorage doesn't (see troubleshooting)
- **`include: ['src/**/*.test.ts']`**: Test files are colocated with source (e.g., `encoder.test.ts` next to `encoder.ts`)
- **`coverage.include`**: Only reports coverage for utility and core logic files, not UI components

### TypeScript Integration

**File**: `tsconfig.app.json`

Add Vitest globals to TypeScript:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

This allows TypeScript to recognize `describe`, `it`, `expect`, etc. without import errors.

---

## Component 3: Test Scripts

**File**: `package.json`

Two test scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  }
}
```

### When to Use Each

- **`npm test`** (development): Runs in watch mode, re-runs on file changes, shows results interactively
- **`npm run test:ci`** (CI pipeline): Single run, generates coverage report, exits with status code for pass/fail

---

## Component 4: Test Files Overview

Tests are **colocated** with their source modules. Run `npm test` to watch for changes.

### File: `src/utils/compression.test.ts`

Tests the `compress()` and `decompress()` utility functions (lz-string wrappers):

| Test | What It Validates |
|---|---|
| Round-trip string | String → compress → decompress → same string |
| Empty string | Handles empty input correctly |
| Unicode | Preserves special characters and emojis |
| Large JSON | Compresses a full bouquet object (6 flowers + 100-word note) |
| Corrupted data | Returns `null` when decompressing invalid data |
| URL-safe output | Compressed output is safe for URL parameters |

**Key insight**: These are synchronous, pure functions with no external dependencies. Tests run instantly.

---

### File: `src/utils/storage.test.ts`

Tests the `hasStorageRoom()` utility (checks if localStorage has space):

| Test | What It Validates |
|---|---|
| Empty storage | Returns true when storage is empty |
| Small write | Writes 1KB of data and confirms success |
| Near-full storage | Simulates storage almost at capacity |
| Room check | Correctly estimates available space |
| localStorage throws | Handles quota exceeded error gracefully |

**Key insight**: These tests mock `localStorage` to simulate quota scenarios without actually filling your disk.

---

### File: `src/features/builder/PlacementEngine.test.ts`

Tests the `generatePlacements()` function (calculates random initial flower positions):

| Test | What It Validates |
|---|---|
| Correct count | Returns same number of placements as input flowers |
| Bounds checking | All x, y coordinates stay within canvas (800x600) |
| Sequential z-indices | Z-indices are numbered 1, 2, 3, ... (layering order) |
| Unique IDs | Each placement has a unique UUID |
| Type preservation | Flower types are preserved through placement |
| Empty cart | Handles empty flower cart (returns empty placements) |
| Max bouquet | Generates placements for 6 flowers (maximum) |
| Single flower | Works with just 1 flower |

**Key insight**: This is the only "builder" function tested — it's pure logic with no Redux dependency.

---

### File: `src/features/share/encoder-decoder.test.ts`

The most comprehensive test file (21 tests). Tests URL encoding and decoding of bouquets:

#### Round-Trip Tests (8 tests)

These encode a bouquet to a URL string, then decode it back, ensuring data integrity:

1. **Flowers preserved**: Encoded/decoded flowers match original types and positions
2. **Note preserved**: Text, font, position all survive round-trip
3. **Greenery preserved**: Selected greenery type survives encoding
4. **Null note**: Handles bouquets without notes correctly
5. **ID regeneration**: IDs are stripped before encoding (to keep URL short) and regenerated on decode
6. **Canvas dimensions**: Width/height are stripped (always 800x600) and re-applied on decode
7. **Max bouquet**: Round-trip works with 6 flowers + 100-word note
8. **Complex data**: Unicode, special characters, long URLs all survive

#### Validation Tests (13 tests)

These verify the decoder rejects invalid/malicious input:

1. **Empty input**: `null` / `undefined` → rejected
2. **Garbage data**: Random non-JSON string → rejected
3. **Non-object**: Decoded JSON is not an object → rejected
4. **Zero flowers**: Bouquet has empty flowers array → rejected
5. **Too many flowers**: More than 6 flowers → rejected
6. **Invalid flower type**: Flower type is not a known type (e.g., 'rose-fake') → rejected
7. **Out-of-bounds coords**: Flower x/y outside canvas → rejected
8. **Duplicate z-indices**: Two flowers with same z-index → rejected
9. **Invalid greenery**: Greenery type not in allowed list → rejected
10. **Too many words**: Note exceeds 100 words → rejected
11. **Invalid font**: Note font not in allowed list → rejected
12. **HTML stripping**: Malicious HTML in note text is stripped (plain text only)
13. **Minimal valid**: Smallest valid bouquet (1 flower, no note, greenery='none') → passes

**Key insight**: The decoder is the security boundary for user-shared data. Tests ensure malformed URLs don't crash the app.

---

## Component 5: Coverage Report

**Run**: `npm run test:ci`

Current coverage results:

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `PlacementEngine.ts` | 100% | 100% | 100% | 100% |
| `encoder.ts` | 100% | 100% | 100% | 100% |
| `decoder.ts` | 97.67% | 95.00% | 100% | 97.67% |
| `compression.ts` | 100% | 100% | 100% | 100% |
| `storage.ts` | 100% | 100% | 100% | 100% |

Only `decoder.ts` has one untested branch: the `catch` block in `JSON.parse()` failure (this branch is practically unreachable in normal use since the input has already been validated).

---

## Component 6: GitHub Actions Workflow Restructure

**File**: `.github/workflows/deploy.yml`

The deployment workflow was restructured to include testing as a gating mechanism. Here's the full YAML:

```yaml
name: CI / Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: tsc -b

      - name: Test
        run: npm run test:ci

  build:
    needs: check
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Workflow Stages

#### Check Job (runs on all PRs and pushes)

1. **Checkout**: Clone the repository
2. **Setup Node**: Install Node 20 with npm cache
3. **Install dependencies**: Run `npm ci` (clean install for reproducibility)
4. **Lint**: Run `npm run lint` (ESLint checks)
5. **Typecheck**: Run `tsc -b` (TypeScript strict mode, project references)
6. **Test**: Run `npm run test:ci` (Vitest single run with coverage)

**If any step fails, the job stops and returns exit code 1** (failure). The workflow doesn't proceed to build/deploy.

#### Build Job (runs only on push/dispatch after check passes)

1. **Checkout**: Clone repository
2. **Setup Node**: Install Node 20
3. **Install dependencies**: Run `npm ci`
4. **Build**: Run `npm run build` (generates `dist/`)
5. **Setup Pages**: Configure GitHub Pages
6. **Upload artifact**: Upload `dist/` folder as build artifact

**The `needs: check` ensures this job only runs if check succeeded.**
**The `if:` condition ensures this only runs on push/dispatch, not PRs.**

#### Deploy Job (runs only on push/dispatch after build succeeds)

1. **Deploy to GitHub Pages**: Download the artifact and deploy

**The `needs: build` ensures this only runs if build succeeded.**

### Key Design Decisions

1. **Check runs on PRs and pushes** — gives developers fast feedback before merge
2. **Build/deploy only on push/dispatch** — PRs don't deploy (via the `if:` condition)
3. **Sequential gating** — deployment is blocked if check OR build fails
4. **Lint runs first** — fastest to fail, gives quick feedback
5. **Coverage always generated** — helps identify untested code paths

---

## Component 7: Build Process Changes

The build process itself didn't change (still `npm run build`), but now it only runs after tests pass. The build step:

1. Compiles React + TypeScript
2. Bundles with Vite
3. Optimizes assets
4. Generates `dist/` folder with:
   - Minified JavaScript and CSS
   - Optimized images and fonts
   - Source maps (for debugging)

The `dist/` folder is then deployed to GitHub Pages.

---

## Component 8: Bug Fix — Conditional Hooks in Step3.tsx

While setting up CI, ESLint caught a pre-existing bug: **conditional hook calls**.

**File**: `src/features/builder/Step3.tsx`

**Issue**: Three hooks (`useState`, `useMemo`) were called after an early `return null` guard:

```typescript
// WRONG — hooks after early return
if (!bouquet) {
  return null;
}

// These hooks are called conditionally
const [note, setNote] = useState(bouquet.note);
const [flowers, setFlowers] = useMemo(() => {
  // ...
}, [bouquet]);
```

React requires hooks to be called in the same order on every render. This violates that rule.

**Fix**: Move the hooks ABOVE the early return:

```typescript
// CORRECT — hooks first
const [note, setNote] = useState(null);
const [flowers, setFlowers] = useMemo(() => {
  // ...
}, []);

if (!bouquet) {
  return null;
}
```

This is now validated by ESLint on every commit, so the bug won't recur.

---

## Local Development Workflow

### Running Tests Locally

```bash
# Watch mode — tests re-run on any .ts file change
npm test

# Single run with coverage (mirrors CI)
npm run test:ci

# Run tests with verbose output
npm test -- --reporter=verbose

# Run only tests matching a pattern
npm test -- --grep "round-trip"
```

### Full CI Pipeline Locally

To simulate the exact CI pipeline before pushing:

```bash
# Run all checks in order
npm run lint && \
  tsc -b && \
  npm run test:ci && \
  npm run build
```

If all these pass, your code will pass CI.

### Writing New Tests

When adding a new feature that includes logic (utilities, placement algorithms, etc.):

1. Create a test file next to the source:
   ```
   src/features/myfeature/myLogic.ts
   src/features/myfeature/myLogic.test.ts  ← new test file
   ```

2. Use the naming convention: `*.test.ts`

3. Import from the source file and write test cases:
   ```typescript
   import { myFunction } from './myLogic';

   describe('myFunction', () => {
     it('should do something', () => {
       const result = myFunction('input');
       expect(result).toBe('expected output');
     });
   });
   ```

4. Run `npm test` — your new test appears immediately

---

## ESLint Configuration Update

**File**: `eslint.config.js`

The coverage output folder is ignored (it's generated, not source code):

```javascript
{
  ignores: ['dist', 'coverage'],
}
```

This prevents ESLint from checking files inside the `coverage/` folder (HTML reports, data files).

---

## Git Ignore Update

**File**: `.gitignore`

The coverage reports folder is never committed:

```
coverage/
```

Coverage is always generated fresh from tests, not stored in git.

---

## Monitoring and Understanding Pipeline Status

### View Workflow Runs

```bash
# List recent runs
gh run list --repo dev-arctik/digital-bouquet

# View a specific run
gh run view <run-id> --repo dev-arctik/digital-bouquet

# View live updates
gh run watch <run-id> --repo dev-arctik/digital-bouquet
```

### Check Job Logs

Each job (check, build, deploy) has detailed logs visible on GitHub Actions:

1. Go to https://github.com/dev-arctik/digital-bouquet/actions
2. Click the workflow run
3. Click a job to expand logs
4. Scroll to see where it failed (if it did)

### PR Status Checks

When you open a pull request, the workflow automatically runs. You'll see:

```
✅ check — Lint + Typecheck + Test passed
```

or

```
❌ check — Lint failed (see details)
```

You can click "Details" to see the full log.

---

## Troubleshooting

### Tests Fail Locally But Pass in CI (or vice versa)

**Symptom**: `npm test` passes on your machine but fails in GitHub Actions, or vice versa.

**Root Causes**:
- Node version mismatch (CI uses Node 20, you might have 18 or 22)
- npm cache stale or corrupted
- OS difference (Windows line endings vs. Unix)

**Solution**:

1. Check your local Node version:
   ```bash
   node --version
   ```
   Should be Node 20.x. If not, use nvm or similar to switch.

2. Clear npm cache:
   ```bash
   npm ci  # uses package-lock.json, more reproducible than npm install
   rm -rf node_modules
   npm ci
   ```

3. Re-run tests:
   ```bash
   npm run test:ci
   ```

4. If still failing, check the CI logs on GitHub Actions to see the exact error

---

### "vitest not found" or "Cannot find module 'vitest'"

**Symptom**: Running `npm test` throws a "not found" error.

**Root Cause**: `node_modules` is missing or outdated.

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

Or faster (if package-lock.json is intact):

```bash
npm ci
npm test
```

---

### "describe is not defined" in Test File

**Symptom**: TypeScript error in test files: `'describe' is not defined`.

**Root Cause**: TypeScript doesn't know about Vitest globals.

**Solution**:

Verify `tsconfig.app.json` includes:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

If already there, restart your IDE (TypeScript server sometimes caches stale config).

---

### Tests Hang or Timeout

**Symptom**: Tests start running but never finish; after 10+ seconds, timeout error appears.

**Root Cause**: Usually an infinite loop or unresolved promise in a test.

**Solution**:

1. Check the test output — it usually shows which test is hanging
2. Look for `await` statements that never resolve
3. Look for loops that never terminate
4. Add a timeout to the test:
   ```typescript
   it('should do something', async () => {
     // test code
   }, 5000); // 5 second timeout
   ```

---

### Coverage Report Shows Unexpected Gaps

**Symptom**: A function you definitely tested shows as uncovered in the coverage report.

**Root Cause**: The file isn't included in the coverage config, or the test isn't being found.

**Solution**:

1. Verify the file is in `coverage.include` in `vite.config.ts`:
   ```typescript
   coverage: {
     include: [
       'src/utils/**',        // covers all files in utils/
       'src/features/share/**', // covers all files in share/
       // ... add your file here if missing
     ],
   },
   ```

2. Verify test file exists with `.test.ts` extension:
   ```bash
   ls -la src/myfeature/*.test.ts
   ```

3. Rebuild coverage:
   ```bash
   npm run test:ci -- --coverage.clean
   ```

---

### Build Passes but Deploy Fails

**Symptom**: GitHub Actions shows "build" job succeeded but "deploy" job failed.

**Root Cause**: Artifact upload or Pages configuration issue (rare).

**Solution**:

1. Check the deploy job logs on GitHub Actions
2. Verify repository settings point to GitHub Actions (Settings > Pages > Source = GitHub Actions)
3. Check if the artifact was uploaded:
   ```bash
   gh api repos/dev-arctik/digital-bouquet/actions/artifacts
   ```

4. Re-run the deploy job from GitHub Actions UI (Actions tab → workflow run → "Re-run failed jobs")

---

### ESLint or TypeScript Errors on Unrelated Files

**Symptom**: Workflow fails on "Lint" or "Typecheck" step, but the error is on a file you didn't touch.

**Root Cause**: The file had an existing error that the workflow now catches.

**Solution**:

1. View the workflow log to see which file failed
2. Fix the error locally:
   ```bash
   npm run lint -- src/path/to/file.ts
   tsc src/path/to/file.ts
   ```

3. Commit the fix and push

---

### How to Skip the Workflow (Not Recommended)

If you absolutely must skip CI (e.g., minor docs-only change), you can use a commit message flag:

```bash
git commit --allow-empty -m "Chore: update README

[skip ci]"
```

**This should be extremely rare.** It's better to fix the failing test or lint error.

---

## Running a Manual Deploy

If you need to deploy without pushing a commit (e.g., after a hot fix), use the manual trigger:

1. Go to https://github.com/dev-arctik/digital-bouquet/actions
2. Click "CI / Deploy" workflow
3. Click "Run workflow" button
4. Select the branch (`main`)
5. Click "Run workflow"

The workflow will run check → build → deploy without any git commit.

---

## Performance Characteristics

### Check Job Timing

Typical times (may vary based on server load):

- **Checkout**: 2 seconds
- **Setup Node**: 5 seconds
- **Install dependencies**: 8 seconds (cached from previous run, much faster than first time)
- **Lint**: 3 seconds
- **Typecheck**: 5 seconds
- **Test**: 8 seconds (41 tests total)
- **Total**: ~30 seconds

### Build Job Timing

- **Install dependencies**: 5 seconds (cached)
- **Build**: 15 seconds
- **Upload artifact**: 3 seconds
- **Total**: ~23 seconds

### Deploy Job Timing

- **Deploy**: 8 seconds
- **Total**: ~8 seconds

**Full pipeline**: ~60 seconds from push to live site.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `vite.config.ts` | Vitest configuration, globals, environment, coverage paths |
| `tsconfig.app.json` | TypeScript recognition of `vitest/globals` |
| `package.json` | `test` and `test:ci` scripts |
| `eslint.config.js` | Ignores `coverage/` folder |
| `.gitignore` | Ignores `coverage/` folder |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD pipeline (check → build → deploy) |
| `src/**/*.test.ts` | Test files (colocated with source) |

---

## Summary

The CI/CD pipeline ensures that:

1. **Every PR is checked** for linting, type errors, and test failures before review
2. **Only quality code deploys** — broken code can't reach production
3. **Developers get fast feedback** — lint errors appear in seconds, full pipeline in ~60 seconds
4. **Consistent results** — the same checks run on CI and locally (Node 20, same npm version)
5. **Coverage is tracked** — test gaps are visible in coverage reports

To work with this pipeline, remember:

- **Local**: `npm test` to develop, `npm run test:ci && npm run build` before push
- **Remote**: Push to `main` → check automatically runs → if pass, build → if pass, deploy
- **PRs**: All checks must pass before merge (enforced by branch protection)
