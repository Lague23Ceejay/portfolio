# Christian John K. Lague Portfolio & CMS Dashboard

A responsive single-page portfolio with a secure PIN-gated admin dashboard, modular section CSS, animated canvas visuals, and GitHub-backed JSON persistence.

## Overview

This project is built with semantic HTML, modular CSS, and native JavaScript. Public page content is sourced from `data.json`, while the admin dashboard allows authenticated content editing, image uploads, project stack management, and QR generation.

## File Structure

```text
├── api/
│   └── save-content.js     # Vercel serverless endpoint that commits updated data.json to GitHub
├── css/
│   ├── themes.css          # Theme variable palettes and color profile definitions
│   ├── base.css            # Global layout, reset rules, responsive breakpoints
│   ├── nav.css             # Site navigation styling and mobile drawer behavior
│   ├── hero.css            # Hero section profile image and intro styles
│   ├── about.css           # About section layout and skills grid styling
│   ├── projects.css        # Project card and progress bar design
│   ├── gallery.css         # Filterable gallery grid, lightbox, and responsive masonry
│   ├── contact.css         # Contact section layout and QR presentation styles
│   ├── admin.css           # Admin panel UI, PIN overlay, tabs, and editor controls
│   ├── footer.css          # Footer branding, links, and copyright layout
│   ├── theme-switcher.css  # Floating theme selection interface styles
│   └── theme-overrides.css # High-priority style overrides loading after base themes
├── js/
│   ├── theme.js            # Theme selection, persistence, and CSS variable switching
│   ├── nav.js              # Mobile nav toggle and anchor link behavior
│   ├── background.js       # Animated canvas background engine and particle atmosphere
│   ├── load-content.js     # Data loader and render engine for public page sections
│   ├── admin.js            # PIN login, admin dashboard rendering, and content binding
│   └── gallery.js          # Gallery filtering and lightbox controls
├── index.html              # Single-page application shell with hero, about, projects, gallery, contact, admin
├── data.json               # Local site state and editable portfolio/content configuration
├── vercel.json             # Vercel routing, rewrites, and deployment behavior
└── package.json            # Project scripts and development dependency manifest
```

## Key Features

- **Animated Canvas Background** (`js/background.js`): Renders a responsive, theme-tinted animated atmosphere with orbs, particle drift, aurora bands, and pointer highlight effects.
- **Theme Engine** (`js/theme.js`): Applies multiple palette themes through CSS variables and preserves the chosen theme in local storage.
- **Content-Driven Public Page** (`js/load-content.js`): Loads `data.json` and renders the hero, about, projects, gallery, and contact sections dynamically.
- **PIN-Gated Admin Dashboard** (`js/admin.js`): Opens through `#admin`, authenticates with a 4-digit PIN, and provides live editing for hero, about, projects, gallery, contact, and settings.
- **Admin Media & Gallery Uploads**: Supports profile image uploads, gallery image file uploads, category management, and live preview in the admin panel.
- **QR Generator** (`js/admin.js`): Builds a download-ready QR code from the contact URL target.
- **GitHub Persistence** (`api/save-content.js`): Saves dashboard edits into `data.json` by committing via the GitHub API from the serverless endpoint.

## Deployment & Hosting

The workspace is designed for Vercel deployment with proper environment variable support:
- `npm run start-local` runs the project locally with Vercel dev (environment variables are automatically loaded from `.vercel/.env.local` or Vercel dashboard secrets).
- `npm run deploy` publishes the current branch to production with production environment variables.
- `vercel.json` contains rewrite and routing config for the serverless save endpoint.

### Environment Variables

The admin dashboard saves are powered by environment variables set in Vercel:
- **`GITHUB_TOKEN`** — Personal access token with `repo` scope for GitHub API authentication.
- **`GITHUB_OWNER`** — GitHub account/organization name (defaults to `Lague23Ceejay`).
- **`GITHUB_REPO`** — Repository name (defaults to `portfolio`).
- **`GITHUB_BRANCH`** — Target branch for commits (defaults to `main`).

Both local dev (via `.vercel/.env.local`) and production (via Vercel dashboard secrets) are fully functional. The endpoint uses Octokit for secure, rate-limit-aware GitHub API interactions.

---

### Local Development

```powershell
npm install
npm run start-local
```

Then visit:
- **Site:** `http://localhost:3000`
- **Admin:** `http://localhost:3000/#admin`

---

### Status & Known Issues

**✅ Working:**
- Hero, About, Projects, Gallery, Contact sections edit and save to GitHub
- Profile image uploads (base64 encoding)
- Gallery image uploads and category filtering
- Theme switching and persistence
- PIN-protected admin dashboard
- Environment variables work across local and production environments

**⚠️ In Progress:**
- QR code generation in admin panel (currently under debugging; SVG-based implementation needs refinement)

---

### Workflow Notes

- Use the admin dashboard to edit website content and media.
- `data.json` is the single source of live page state for the public site.
- Content saved through the admin UI is persisted via `api/save-content.js` to GitHub using Octokit.
- Verify environment variables are set before deploying (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`).
- Keep the repo in sync with `git pull origin main` before editing and `git push` after changes.

