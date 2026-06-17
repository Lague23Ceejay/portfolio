# Portfolio Website & CMS Dashboard

A modular single-page portfolio built with semantic HTML, modern CSS variables, and native vanilla JavaScript, backed by an integrated administrative content management workflow.

## Overview

This project organizes styles and behavior by feature components so each section remains fully isolated, responsive, and easy to maintain.

## File Structure

```text
├── api/
│   └── save-content.js     # Vercel serverless saving checkpoint pipeline
├── css/
│   ├── themes.css          # Master palette definition arrays (Midnight, Ocean, etc.)
│   ├── base.css            # Root configurations, responsive breakpoints, global resets
│   ├── nav.css             # Navigation menus and mobile drawer tracking
│   ├── hero.css            # Header intro profile framing assets
│   ├── about.css           # Grid layouts and technical skill tags
│   ├── projects.css        # Interactive progress trackers and stack matrices
│   ├── gallery.css         # Journey masonry grids and fluid modal lightboxes
│   ├── contact.css         # Communication anchors and custom QR layout wrappers
│   ├── admin.css           # Hidden pin-pad overlay system and layout dashboard
│   ├── footer.css          # Baseline copyright notices and links
│   ├── theme-switcher.css  # Floating palette interface settings
│   └── theme-overrides.css # High-priority paint bindings (Loaded last)
├── js/
│   ├── theme.js            # Persistent local storage theme assignment module
│   ├── nav.js              # Mobile burger interaction triggers
│   ├── background.js       # Dynamic multi-orb HTML5 canvas graphic driver
│   ├── load-content.js     # Asynchronous file data injector & observer loops
│   ├── admin.js            # Secure pin authentication & UI workspace generator
│   └── gallery.js          # Modal lightbox image controllers
├── index.html              # Core single-page layout document structure
├── data.json               # Local operational storage state database file
├── vercel.json             # Dynamic proxy rerouting routing manifest
└── package.json            # Development tools dependency configuration manifest
```

## Key Features

- **Animated Canvas Background** (`js/background.js`): Uses a low-overhead, screen-blending script that reads theme properties dynamically to animate glowing vector entities.
- **Dynamic Palette Theme Engine** (`js/theme.js`): Switches variable profiles instantly on demand (Midnight, Ocean, Forest, Dusk, Ember) and retains selections via localized browser states.
- **Asynchronous Content Loader** (`js/load-content.js`): Queries, computes structural parameters, and renders card progress indicators dynamically while preserving viewport performance via Intersection Observers.
- **PIN-Gated Administrative Dashboard** (`js/admin.js`): Implements a 4-digit PIN pad overlay featuring client-side SHA-256 WebCrypto data processing.
- **Automated Upstream Commit Engine** (`api/save-content.js`): Converts adjustments to base64 formatting streams and writes files back into production automatically via GitHub repositories API loops.

## Deployment & Production Hosting

This workspace is fully optimized to compile natively inside the Vercel edge framework:
- Local script components communicate changes straight to `/api/save-content`.
- Production rewrite constraints are dynamically orchestrated by `vercel.json`.

---

### ⚡ Operational Run Script Notes

**Before Coding:**      `git pull origin main`  
**After Coding:**       `git add .` → `git commit -m "update"` → `git push`  
**Content Modifications:** ALWAYS apply edits through the authenticated `#admin` dashboard UI loop only.

---

### Local Runway Scripts

To activate the dynamic runtime simulator environment locally on your terminal window, use this approach:

```powershell
npm run start-local
structural changes out live to production, use npm run deploy.
```

Once running, navigate your target web client straight into these endpoints:
- **Site URL:** http://localhost:3000
- **Admin CMS URL:** http://localhost:3000/#admin
