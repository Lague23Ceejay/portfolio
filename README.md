# Portfolio Website

A modular single-page portfolio built with HTML, CSS, and vanilla JavaScript.

## Overview

This project organizes styles and behavior by feature (components) so each section is isolated and easy to maintain.

## File structure (high level)

- `index.html` — main page and markup.
- `data.json` — optional content/storage for demos.
- `package.json` — project metadata (if used for tooling).
- `vercel.json` — Vercel deployment config.
- `api/` — serverless endpoint(s); e.g. `save-content.js`.
- `assets/` — static assets (images, icons).
- `css/` — component CSS files:
  - `base.css`, `nav.css`, `hero.css`, `about.css`, `projects.css`, `contact.css`, `footer.css`, `admin.css`, `gallery.css`, `theme-switcher.css`, `themes.css`
- `js/` — interaction modules:
  - `admin.js`, `background.js`, `gallery.js`, `load-content.js`, `nav.js`, `qrcode.js`, `reveal.js`, `theme.js`

## Key features

- Animated canvas background (`js/background.js`).
- Mobile-friendly navigation toggle (`js/nav.js`).
- QR code generator for sharing links (`js/qrcode.js`).
- Scroll reveal animations (`js/reveal.js`).
- Gallery utilities and content loader scripts.
- Simple serverless `api/save-content.js` for form or content saving (used when deployed).

## Usage

1. Open `index.html` in your browser for a local static preview.
2. For a development server, use any static server (Live Server extension, `serve`, or similar). Example with `npm` + `serve`:

```powershell
npm install -g serve
serve . -p 3000
```

3. The QR widget reads the input value and regenerates when you click the generate button.

## Deployment

- This project can be deployed as a static site (Vercel recommended — `vercel` will detect `index.html`).
- Serverless endpoints live under `api/` and will be used by Vercel/other serverless hosts.

## Development notes

- CSS and JS are modular by feature; update the corresponding files under `css/` and `js/` when adding new sections.
- Improve accessibility by adding ARIA attributes to the nav toggle and form elements.

## Git workflow notes

- To iterate on a testing branch:

```powershell
git checkout testing-publish
# make changes
git add .
git commit -m "testing new feature"
git push
```

- Merge back to `main` when ready:

```powershell
git checkout main
git merge testing-publish
git push
```

---

If you'd like, I can also:

- add a short `Contributing` section and code style notes,
- add a minimal `package.json` script for serving locally, or
- run a quick link check to ensure referenced filenames match the repo.

Before coding:     git pull origin main
After coding:      git add . → git commit → git push
Content changes:   always via admin panel only

---

Run the project locally using this command:

- python -m http.server 8000

then open:

- http://127.0.0.1:8000
- http://127.0.0.1:8000/#admin