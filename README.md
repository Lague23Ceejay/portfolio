# Portfolio Website

A modular single-page portfolio built with HTML, CSS, and vanilla JavaScript.

## Project Overview

This portfolio is structured by feature rather than by page, with separate CSS and JS modules for each major section. The goal is a clean, maintainable project where styles and behavior are isolated by component.

## File Structure

- `index.html` — main page layout and content.
- `css/` — styling modules for each section:
  - `base.css` — global layout, typography, responsive base styles, and utility classes.
  - `nav.css` — navigation bar styling and hamburger menu appearance.
  - `hero.css` — hero section styles and text-gradient effects.
  - `about.css` — about section layout and text styles.
  - `projects.css` — project cards and grid layout.
  - `contact.css` — contact section, email link, QR code panel, and related form elements.
  - `footer.css` — footer styling.
- `js/` — interaction modules:
  - `Nav.js` — mobile hamburger toggle and nav link closing behavior.
  - `background.js` — animated canvas background with moving orbs, particles, and mouse spotlight.
  - `qrcode.js` — generates and updates the QR code from the input URL.
  - `reveal.js` — scroll-triggered fade-up animation for revealed elements.

## Modular Code Breakdown

### HTML (`index.html`)

The page is composed of section blocks:
- `#hero` — landing message, call-to-action buttons.
- `#about` — profile summary and skills.
- `#projects` — work examples displayed as cards.
- `#contact` — contact CTA, email link, and QR code widget.
- `footer` — copyright and quick links.

Individual sections use semantic IDs and classes to connect with style and script modules.

### CSS Modules

Each CSS file targets a specific component:

- `base.css`
  - Defines base typography, colors, spacing, grid behavior, and responsive adjustments.
  - Contains shared utility rules like `.reveal.visible` and mobile layout breakpoints.

- `nav.css`
  - Styles the top navigation bar and mobile hamburger button.
  - Uses `.nav-toggle.open` to animate the burger into an X when open.

- `hero.css`
  - Controls the hero section typographic layout.
  - Applies gradient text using `background-clip: text` with `-webkit-background-clip` fallback.

- `about.css`, `projects.css`, `footer.css`
  - Keep those sections separated so layout and spacing changes remain isolated.

- `contact.css`
  - Styles the contact section and QR widget.
  - Includes the QR container, corner accents, and input panel.

### JavaScript Modules

- `Nav.js`
  - Toggles the mobile menu state by adding/removing the `open` class on both the button and the nav list.
  - Closes the menu automatically when a nav link is clicked.

- `background.js`
  - Draws a full-screen animated background on the `#bg-canvas` element.
  - Uses requestAnimationFrame for smooth animation.
  - Includes responsive particle count adjustments for mobile.

- `qrcode.js`
  - Uses the QRCode library to render a QR code inside `#qrcode`.
  - Reads the value from `#portfolio-url` and regenerates the code.
  - Initializes a default placeholder QR on page load.

- `reveal.js`
  - Uses Intersection Observer to add the `.visible` class to `.reveal` elements when they enter the viewport.
  - Triggers staggered fade-up animations.

## How to Use

1. Open `index.html` in a browser.
2. The nav and page animation scripts are loaded automatically at the end of the document.
3. The QR code generator updates when you enter a URL and click `Generate QR`.

## Notes

- The project is built with plain HTML/CSS/JS and does not require a build step.
- Styles are kept modular, so changes in one section will not unintentionally affect other sections.
- Scripts are organized as separate modules by feature to make the code easy to maintain.

## Recommended Improvements

- Add a small build or lint step if the project expands further.
- Move inline button handlers to JS entirely for cleaner separation of concerns.
- Expand accessibility with improved labels and keyboard support for the nav toggle.
