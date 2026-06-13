/* FILE: portfolio/js/theme.js */

/* ============================================================
   theme.js — Theme switcher
   Applies data-theme to <html>, persists to localStorage,
   and updates canvas orb colors for background.js
   ============================================================ */

const THEMES = [
  { id: 'midnight', label: 'Midnight', orb: [255, 255, 255] },
  { id: 'ocean',    label: 'Ocean',    orb: [56,  189, 248] },
  { id: 'forest',   label: 'Forest',   orb: [74,  222, 128] },
  { id: 'dusk',     label: 'Dusk',     orb: [167, 139, 250] },
  { id: 'ember',    label: 'Ember',    orb: [251, 146, 60]  },
];

const STORAGE_KEY = 'cjl-portfolio-theme';

// Expose current orb color for background.js to read
window.themeOrbColor = [255, 255, 255];

// ── APPLY THEME ──
function applyTheme(themeId, save = true) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', theme.id);
  window.themeOrbColor = theme.orb;
  if (save) localStorage.setItem(STORAGE_KEY, theme.id);

  // Update active state on buttons
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme.id);
  });
}

// ── INIT ──
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'midnight';
  applyTheme(saved, false);
}

// ── BUILD UI ──
function buildThemeSwitcher() {
  const html = `
    <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Change theme">
      <div class="theme-toggle-icon"></div>
    </button>
    <div class="theme-panel" id="theme-panel">
      <p class="theme-panel-label">Color Theme</p>
      <div class="theme-options">
        ${THEMES.map(t => `
          <button class="theme-option" data-theme="${t.id}">
            <span class="theme-swatch theme-swatch-${t.id}"></span>
            ${t.label}
            <span class="theme-check">✓</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  // Toggle panel
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const panel     = document.getElementById('theme-panel');

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== toggleBtn) {
      panel.classList.remove('open');
    }
  });

  // Theme selection
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      panel.classList.remove('open');
    });
  });

  // Apply saved active state
  const saved = localStorage.getItem(STORAGE_KEY) || 'midnight';
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === saved);
  });
}

// ── RUN ──
initTheme();
document.addEventListener('DOMContentLoaded', buildThemeSwitcher);