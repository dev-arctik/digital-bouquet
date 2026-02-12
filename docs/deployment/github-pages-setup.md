# GitHub Pages Deployment Setup

## Overview

DigiBouquet is deployed to GitHub Pages at **https://dev-arctik.github.io/digital-bouquet/**. This document covers the complete deployment configuration, how it works, and how to troubleshoot common issues.

The challenge with GitHub Pages is that it's a **static file host**, not a traditional web server. It doesn't understand client-side routing (React Router), so deploying a single-page application (SPA) requires special configuration to handle:

1. Serving the app from a **subdirectory** (`/digital-bouquet/`) instead of the root
2. Handling direct navigation to routes (e.g., `/build`, `/garden`) that don't exist as physical files
3. Ensuring internal share links include the correct base path

All of this is solved through a combination of Vite configuration, HTML redirects, and React Router setup.

---

## Architecture Overview

```
Push to main
    ↓
GitHub Actions Workflow (deploy.yml)
    ↓
Build: checkout → npm ci → npm run build → dist/
    ↓
Deploy: Upload dist/ → GitHub Pages serves as static site
    ↓
User visits https://dev-arctik.github.io/digital-bouquet/
    ↓
SPA loads with correct routing (React Router handles nav)
```

---

## Component 1: Vite Base Path Configuration

**File**: `vite.config.ts`

Vite needs to know the app is served from a subdirectory, not the root domain. This is configured via the `base` property:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // base path for GitHub Pages — matches the repo name
  base: '/digital-bouquet/',
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

### Why This Matters

Without `base: '/digital-bouquet/'`:
- Vite injects asset paths as `/src/main.tsx`, `/styles/index.css`, etc.
- GitHub Pages serves them from the root: `dev-arctik.github.io/src/main.tsx` — not found, 404

With `base: '/digital-bouquet/'`:
- Vite rewrites asset paths to `/digital-bouquet/src/main.tsx`, `/digital-bouquet/styles/index.css`
- GitHub Pages correctly serves them from the subdirectory

### How to Update If the Repo is Renamed

If the GitHub repo is ever renamed from `digital-bouquet` to something else:

1. Update `base` in `vite.config.ts`:
   ```typescript
   base: '/new-repo-name/',
   ```

2. Update `pathSegmentsToKeep` in `public/404.html` (see Component 3 below) to match the new path depth

3. Rebuild and push — GitHub Actions will auto-deploy with the new configuration

---

## Component 2: React Router Base Path Configuration

**File**: `src/main.tsx`

React Router (via `BrowserRouter`) needs to know the app is not at the root of the domain. This is done via the `basename` prop:

```typescript
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* basename tells React Router where the app lives */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
```

### How It Works

`import.meta.env.BASE_URL` is a Vite variable that:
- In **development**: `/` (app serves from root locally)
- In **production**: `/digital-bouquet/` (matches the `base` config)

React Router uses this to:
- Understand that routes like `/build` are actually `/digital-bouquet/build`
- Generate correct navigation links
- Handle the browser back/forward buttons correctly

### Example Routing Behavior

| Route in Code | Local URL | Production URL |
|---|---|---|
| `/` | `http://localhost:5173/` | `https://dev-arctik.github.io/digital-bouquet/` |
| `/build` | `http://localhost:5173/build` | `https://dev-arctik.github.io/digital-bouquet/build` |
| `/garden` | `http://localhost:5173/garden` | `https://dev-arctik.github.io/digital-bouquet/garden` |
| `/view?d=...` | `http://localhost:5173/view?d=...` | `https://dev-arctik.github.io/digital-bouquet/view?d=...` |

---

## Component 3: GitHub Pages 404 Redirect Handler

**File**: `public/404.html`

GitHub Pages is static — it only serves files that exist. When a user navigates directly to `/digital-bouquet/build/pick` (or refreshes the browser on that route), GitHub can't find a matching file and returns a 404.

The solution is to create a special `404.html` that GitHub Pages serves for any non-existent path, and use a client-side redirect to send the user to `index.html` while preserving the original route.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DigiBouquet</title>
    <!-- GitHub Pages SPA redirect -->
    <!-- When GitHub Pages encounters a route it doesn't know (e.g. /build/pick),
         it serves this 404.html. This script redirects to index.html while
         encoding the original path as a query param, so the SPA can restore it. -->
    <script>
      var pathSegmentsToKeep = 1; // keep '/digital-bouquet' prefix
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

### How It Works

When a user navigates to `/digital-bouquet/build/pick`:

1. GitHub Pages can't find a file at that path
2. It serves `404.html` (special behavior for GitHub Pages)
3. The script inside captures the original path and encodes it:
   - Original: `/digital-bouquet/build/pick`
   - Redirects to: `/digital-bouquet/?/build/pick`
4. The page loads `index.html` with the path as a query parameter
5. A second script in `index.html` (see Component 4) detects this and restores the original path silently

### Key Variables

- **`pathSegmentsToKeep = 1`**: The number of path segments to preserve
  - For GitHub Pages subdirectory deploy: `1` (keeps `/digital-bouquet`)
  - For root domain deploy or custom domain: `0` (no prefix)

- **`~and~`**: Encoded ampersands prevent query string parsing from breaking

### Important Note on `public/` Folder

The `404.html` file is in `public/`, which means:
- During build, `npm run build` copies everything from `public/` into `dist/`
- GitHub Pages then serves `dist/` as the root of the site
- So `public/404.html` becomes `dist/404.html` and is automatically served for 404s

**Do not rename or delete `public/404.html`** — it's critical to the routing setup.

---

## Component 4: SPA Routing Handler in index.html

**File**: `index.html`

The complementary script in `index.html` detects the encoded path and restores it silently:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigiBouquet</title>
    <!-- ... fonts and meta tags ... -->
  </head>
  <body>
    <!-- SPA redirect handler — restores the original path encoded by 404.html -->
    <script>
      (function(l) {
        if (l.search[1] === '/') {
          var decoded = l.search.slice(1).split('&').map(function(s) {
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### How It Works

On page load:

1. Check if the URL contains the encoded path (query starts with `/?/`)
2. If found, decode the path (replace `~and~` back to `&`)
3. Use `history.replaceState()` to silently update the URL bar to the original path
4. React Router (which boots up after this script) sees the correct path and renders the right component

### Why `history.replaceState()`?

- `replaceState` doesn't trigger a new page load or `useEffect` — it's silent
- The URL in the address bar is updated immediately
- The user never sees the redirect or the `/?/` parameter
- React Router then correctly handles the path when it initializes

---

## Component 5: Share Link Base Path Fix

**File**: `src/features/share/generateShareLink.ts`

When users share a bouquet, the app generates a URL encoded with the bouquet data. This URL must include the `/digital-bouquet/` prefix to work correctly.

```typescript
export function generateShareLink(bouquet: Bouquet): string {
  const encoded = encodeBouquet(bouquet);
  // BASE_URL includes trailing slash (e.g. '/digital-bouquet/' or '/')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}/view?d=${encoded}`;
}
```

### Why This Matters

Without the base path fix:
- `window.location.origin` = `https://dev-arctik.github.io`
- Generated URL = `https://dev-arctik.github.io/view?d=...` (wrong — no `/digital-bouquet/`)
- GitHub Pages looks for a `view` file in the root — 404, then redirects to 404.html

With the fix:
- Prepends `import.meta.env.BASE_URL` (which is `/digital-bouquet/`)
- Generated URL = `https://dev-arctik.github.io/digital-bouquet/view?d=...` (correct)
- GitHub Pages serves the correct SPA instance

---

## Component 6: GitHub Actions Deployment Workflow

**File**: `.github/workflows/deploy.yml`

The deployment is fully automated via GitHub Actions. Every push to `main` triggers a build and deploy.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

  # allow manual trigger from Actions tab
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# only one deployment at a time — cancel in-progress if a new push arrives
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
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

1. **Checkout**: Clone the repository code
2. **Setup Node**: Install Node.js v20 and cache npm packages
3. **Install dependencies**: Run `npm ci` (clean install, ensures reproducibility)
4. **Build**: Run `npm run build` (compiles TypeScript, optimizes assets, generates `dist/`)
5. **Setup Pages**: Configures GitHub Pages settings
6. **Upload artifact**: Uploads `dist/` as a build artifact
7. **Deploy**: Deploys the artifact to GitHub Pages

### Deployment Lifecycle

- **Trigger**: Any push to `main` or manual trigger via Actions tab
- **Execution**: Takes approximately 40 seconds
- **Output**: Site available at `https://dev-arctik.github.io/digital-bouquet/`
- **Concurrency**: Only one deployment runs at a time; new pushes cancel in-progress deployments

### GitHub Pages Configuration

The repository's GitHub Pages settings are configured to use GitHub Actions as the source:

```bash
# (This was set up via CLI; normally done in Settings UI)
gh api repos/dev-arctik/digital-bouquet/pages \
  -X POST \
  -f build_type=workflow
```

This tells GitHub Pages to serve content from the artifact uploaded by the workflow, not from a branch.

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] `vite.config.ts` has `base: '/digital-bouquet/'` matching the repo name
- [ ] `public/404.html` exists and has `pathSegmentsToKeep = 1`
- [ ] `index.html` has the redirect handler script before the root `<div>`
- [ ] `src/main.tsx` uses `basename={import.meta.env.BASE_URL}` in BrowserRouter
- [ ] `src/features/share/generateShareLink.ts` prepends the base URL
- [ ] `.github/workflows/deploy.yml` exists and is configured correctly
- [ ] Repository GitHub Pages settings point to GitHub Actions
- [ ] All changes are committed and pushed to `main`

---

## Troubleshooting

### Problem: 404 on Refresh (User refreshes page on `/build` route)

**Symptom**: User navigates to a working route, refreshes the browser, and sees a 404 error page instead of the app.

**Root Cause**: GitHub Pages is a static file host and doesn't have a file at `/digital-bouquet/build`. The `404.html` redirect handler should catch this, but it might not be deployed correctly.

**Solution**:

1. Verify `public/404.html` exists in the repository
2. Verify the file is correctly copied to `dist/404.html` after build:
   ```bash
   npm run build
   ls -la dist/404.html
   ```
3. Check that the latest deploy completed successfully in the Actions tab
4. Clear browser cache (Cmd/Ctrl+Shift+Delete) and reload

---

### Problem: Assets Not Loading (404 on CSS/JS/Images)

**Symptom**: Page loads but styling is missing, or images don't appear. Console shows 404 errors for files like `/_app/index-ABC123.js` or `/src/styles/index-XYZ.css`.

**Root Cause**: Asset paths are not prefixed with `/digital-bouquet/`. Usually caused by `base` config in `vite.config.ts` being incorrect or missing.

**Solution**:

1. Verify `vite.config.ts` has:
   ```typescript
   base: '/digital-bouquet/',
   ```

2. Rebuild and verify assets are prefixed:
   ```bash
   npm run build
   grep -r "digital-bouquet" dist/index.html
   ```
   You should see references like `<script src="/digital-bouquet/_app/...">` and `<link href="/digital-bouquet/...">`.

3. If the build output still doesn't have the prefix, the Vite config wasn't reloaded. Clear any build cache:
   ```bash
   rm -rf dist/
   npm run build
   ```

4. Push the changes and monitor the GitHub Actions deployment

---

### Problem: Share Links Broken (User shares a bouquet, recipient sees 404)

**Symptom**: A share link works initially but fails when shared with others, or the `/view?d=...` route returns a 404.

**Root Cause**: The share link generator is not including the `/digital-bouquet/` base path in the URL.

**Solution**:

1. Verify `src/features/share/generateShareLink.ts` includes:
   ```typescript
   const base = import.meta.env.BASE_URL.replace(/\/$/, '');
   return `${window.location.origin}${base}/view?d=${encoded}`;
   ```

2. Test locally by generating a share link and checking the console (open DevTools, trigger a share, copy the link from the console if visible)

3. The generated link should be: `https://dev-arctik.github.io/digital-bouquet/view?d=...`
   NOT: `https://dev-arctik.github.io/view?d=...`

4. If the share link is still wrong, rebuild and redeploy:
   ```bash
   npm run build
   git add -A
   git commit -m "Fix share link base path"
   git push origin main
   ```

---

### Problem: Routing Loops or Infinite Redirects

**Symptom**: Page keeps redirecting and never fully loads. Browser shows repeated 404.html responses.

**Root Cause**: Mismatch between `pathSegmentsToKeep` in `404.html` and the actual deployment path depth.

**Solution**:

1. Check the app is deployed to `/digital-bouquet/` (exactly one path segment after the domain)

2. Verify `public/404.html` has:
   ```javascript
   var pathSegmentsToKeep = 1; // one segment = /digital-bouquet/
   ```

3. If the repo name is different or you're using a custom domain, recalculate:
   - **Subdirectory (e.g., `/digital-bouquet/`)**: `pathSegmentsToKeep = 1`
   - **Root domain (e.g., `example.com`)**: `pathSegmentsToKeep = 0`
   - **Nested path (e.g., `/org/project/`)**: `pathSegmentsToKeep = 2`

4. Update and redeploy

---

### Problem: Deployment Stuck in Progress

**Symptom**: GitHub Actions shows a deployment in progress that has been running for hours.

**Root Cause**: Usually a long-running build step (e.g., npm install timeout) or a missing concurrent cancel.

**Solution**:

1. Go to `https://github.com/dev-arctik/digital-bouquet/actions`
2. Click the stuck workflow
3. Click "Cancel workflow" to stop it
4. Push a new commit to trigger a fresh build (or manually trigger via "Run workflow")

If builds keep timing out:
1. Check if `package.json` has unnecessary dependencies
2. Verify npm cache is working (the workflow uses `cache: npm`)
3. Consider increasing the concurrency `cancel-in-progress: true` to ensure only one runs

---

### Problem: Changes Not Reflecting After Deploy

**Symptom**: You pushed code 5 minutes ago, but the live site still shows old content.

**Root Cause**: Either the deployment hasn't finished, or you're viewing a cached version.

**Solution**:

1. Check GitHub Actions tab to verify the deploy job completed successfully (green checkmark)

2. Hard refresh the browser to bypass cache:
   - **Mac**: Cmd+Shift+R
   - **Windows/Linux**: Ctrl+Shift+R

3. Check the browser's Application tab (DevTools) and clear all Service Worker cache, IndexedDB, LocalStorage

4. Wait a few minutes — GitHub Pages CDN can take up to 5 minutes to update globally

5. If changes still don't appear, verify the commit was actually pushed:
   ```bash
   git log --oneline origin/main | head -5
   ```

---

### Problem: Custom Domain Not Working

**Symptom**: Set up a custom domain (e.g., `flowers.example.com`) but the app doesn't load.

**Solution**:

1. For a custom domain, the `base` config changes:
   ```typescript
   // In vite.config.ts, if using custom domain:
   base: '/', // NOT '/digital-bouquet/'
   ```

2. Update `public/404.html`:
   ```javascript
   var pathSegmentsToKeep = 0; // no prefix needed for custom domain
   ```

3. Ensure DNS records point to GitHub Pages (see GitHub Pages documentation for DNS setup)

4. In repository Settings > Pages, add the custom domain and verify DNS

5. Rebuild and redeploy

---

## Monitoring and Maintenance

### Check Deployment Status

View recent deployments:

```bash
gh api repos/dev-arctik/digital-bouquet/pages/deployments --paginate
```

View workflow runs:

```bash
gh api repos/dev-arctik/digital-bouquet/actions/runs --paginate
```

### Update Node/Dependencies

GitHub Actions workflow uses Node 20. To update:

1. Check for newer LTS version: https://nodejs.org/
2. Update `.github/workflows/deploy.yml`:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: 20  # change to new LTS
   ```

3. Commit and push — next deploy uses the new version

---

## Key Files Reference

| File | Purpose |
|---|---|
| `vite.config.ts` | Sets `base: '/digital-bouquet/'` for asset path rewriting |
| `src/main.tsx` | Passes `basename={import.meta.env.BASE_URL}` to BrowserRouter |
| `index.html` | Contains SPA redirect handler script (line 18-28) |
| `public/404.html` | GitHub Pages 404 handler that redirects to index.html with path encoding |
| `src/features/share/generateShareLink.ts` | Includes base path in generated share URLs |
| `.github/workflows/deploy.yml` | Automated build and deploy workflow |

---

## Live Environment

- **Live Site**: https://dev-arctik.github.io/digital-bouquet/
- **GitHub Repository**: https://github.com/dev-arctik/digital-bouquet
- **Actions Tab**: https://github.com/dev-arctik/digital-bouquet/actions
- **Pages Settings**: https://github.com/dev-arctik/digital-bouquet/settings/pages
- **Deployment History**: https://github.com/dev-arctik/digital-bouquet/deployments

