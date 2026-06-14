// load-content.js
// Fetches data.json and renders all site content dynamically.

const STACK_PALETTE = [
  '#5DCAA5', // teal   — stack[0]
  '#7F77DD', // purple — stack[1]
  '#85B7EB', // blue   — stack[2]
  '#EF9F27', // amber  — stack[3]
  '#ED93B1', // pink   — stack[4]
];

async function loadContent() {
  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    console.error('Failed to load data.json', e);
    return;
  }

  renderHero(data.hero);
  renderAbout(data.about);
  renderProjects(data.projects);
  renderGallery(data.gallery);
  renderContact(data.contact);

  // expose for admin live-refresh
  window._renderProjects = renderProjects;
  window._loadContent = function(d) {
    renderHero(d.hero);
    renderAbout(d.about);
    renderProjects(d.projects);
    renderGallery(d.gallery);
    renderContact(d.contact);
  };
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function renderHero(h) {
  if (!h) return;

  const eyebrow = document.querySelector('.hero-eyebrow');
  const line1   = document.querySelector('.hero-name .line-1');
  const line2   = document.querySelector('.hero-name .line-2');
  const title   = document.querySelector('.hero-title');

  if (eyebrow) eyebrow.textContent = h.eyebrow || '';
  if (line1)   line1.textContent   = h.firstName || '';
  if (line2)   line2.textContent   = h.lastName  || '';
  if (title)   title.textContent   = h.subtitle  || '';

  const img         = document.getElementById('hero-profile-img');
  const placeholder = document.getElementById('hero-profile-placeholder');

  if (h.profileImage) {
    if (img) { img.src = h.profileImage; img.style.display = ''; }
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (img) img.style.display = 'none';
    if (placeholder) placeholder.style.display = '';
  }
}

// ─── About ───────────────────────────────────────────────────────────────────

function renderAbout(a) {
  if (!a) return;

  const heading = document.querySelector('.about-heading');
  const texts   = document.querySelectorAll('.about-text');
  const grid    = document.querySelector('.skills-grid');

  if (heading) heading.innerHTML = (a.heading || '').replace(/\n/g, '<br>');
  if (texts[0]) texts[0].innerHTML = a.bio1 || '';
  if (texts[1]) texts[1].innerHTML = a.bio2 || '';

  if (grid && Array.isArray(a.skills)) {
    grid.innerHTML = a.skills
      .map(s => `<span class="skill-tag">${s}</span>`)
      .join('');
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────

function calcOverall(stack) {
  if (!stack || !stack.length) return 0;
  return stack.reduce((acc, s) => acc + (s.pct || 0), 0) / stack.length;
}

function buildCodename(codename, stack) {
  const chars   = (codename || '████').split('');
  const segSize = Math.ceil(chars.length / Math.max(stack.length, 1));

  return chars.map((ch, i) => {
    const si      = Math.min(Math.floor(i / segSize), stack.length - 1);
    const color   = STACK_PALETTE[si % STACK_PALETTE.length];
    const pct     = stack[si] ? (stack[si].pct || 0) : 0;
    const opacity = (0.20 + (pct / 100) * 0.80).toFixed(2);
    const label   = stack[si] ? `${stack[si].name}: ${pct}%` : '';
    return `<span class="redact-block" style="background:${color};opacity:${opacity};color:${color};" title="${label}">${ch}</span>`;
  }).join('');
}

function buildStackBars(stack) {
  return stack.map((s, i) => {
    const color = STACK_PALETTE[i % STACK_PALETTE.length];
    return `
      <div class="stack-row">
        <span class="stack-label">${s.name}</span>
        <div class="stack-bar-bg">
          <div class="stack-bar-fill" style="width:${s.pct || 0}%;background:${color};"></div>
        </div>
        <span class="stack-pct">${Number(s.pct || 0).toFixed(1)}%</span>
      </div>`;
  }).join('');
}

function renderProjects(projects) {
  const grid = document.querySelector('.project-grid');
  if (!grid || !Array.isArray(projects)) return;

  grid.innerHTML = projects.map(p => {
    const stack   = Array.isArray(p.stack) ? p.stack : [];
    const overall = calcOverall(stack);

    const statusClass = p.statusDone ? 'status-done' : 'status-wip';
    const codenameHTML = buildCodename(p.codename, stack);
    const barsHTML     = buildStackBars(stack);

    return `
      <div class="project-card reveal">
        <div class="project-card-top">
          <span class="project-num">${p.num || ''}</span>
          <div class="project-meta">
            <span class="project-type">${p.type || ''}</span>
            <span class="project-status ${statusClass}">
              <span class="status-dot"></span>${p.status || ''}
            </span>
          </div>
        </div>
        <div class="project-codename">${codenameHTML}</div>
        <p class="project-overall">
          Overall progress: <span class="project-overall-pct">${overall.toFixed(2)}%</span>
        </p>
        <p class="project-hint">${p.hint || ''}</p>
        <div class="project-stack">${barsHTML}</div>
      </div>`;
  }).join('');
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function renderGallery(gallery) {
  const grid = document.querySelector('.masonry-grid');
  if (!grid || !Array.isArray(gallery)) return;

  grid.innerHTML = gallery.map((item, idx) => `
    <div class="masonry-item reveal" data-category="${item.category || ''}" data-index="${idx}">
      ${item.src
        ? `<img src="${item.src}" alt="${item.caption || ''}" loading="lazy"/>`
        : `<div class="gallery-placeholder"></div>`}
      <div class="masonry-info">
        <p class="masonry-caption">${item.caption || ''}</p>
        <span class="masonry-tag">${item.category || ''}</span>
      </div>
    </div>`).join('');
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function renderContact(c) {
  if (!c) return;

  const emailEl = document.querySelector('.contact-email');
  if (emailEl && c.email) {
    emailEl.href        = `mailto:${c.email}`;
    emailEl.textContent = c.email;
  }

  const links = document.querySelectorAll('.footer-links a');
  const map   = ['linkedin', 'github', 'resume'];
  links.forEach((a, i) => { if (c[map[i]]) a.href = c[map[i]]; });

  if (c.qrUrl && window.generateQR) window.generateQR(c.qrUrl);
}

// ─── Boot ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', loadContent);