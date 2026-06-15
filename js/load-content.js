/* FILE: portfolio/js/load-content.js */

async function loadContent() {
  let data;
  try {
    const res = await fetch('/data.json?v=' + Date.now());
    data = await res.json();
  } catch (e) { console.error('Could not load data.json:', e); return; }

  renderHero(data.hero);
  renderAbout(data.about);
  renderProjects(data.projects);
  renderGallery(data.gallery);
  renderContact(data.contact);
  initReveal();
  initStackBars();
}

// ── HERO ──
function renderHero(h) {
  if (!h) return;
  setText('#hero .hero-eyebrow',      h.eyebrow);
  setText('#hero .hero-name .line-1', h.firstName);
  setText('#hero .hero-name .line-2', h.lastName);
  const titleEl = document.querySelector('#hero .hero-title');
  if (titleEl) titleEl.innerHTML = `<span>${h.subtitle}</span><br>${h.location || ''}`;

  const img         = document.getElementById('hero-profile-img');
  const placeholder = document.getElementById('hero-profile-placeholder');
  const frame       = h.profileFrame || 'circle';
  if (img) {
    img.className = `hero-profile-img frame-${frame}`;
    if (h.profileImage) {
      img.src = h.profileImage; img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      img.style.display = 'none';
      if (placeholder) {
        placeholder.className     = `hero-profile-placeholder frame-${frame}`;
        placeholder.style.display = 'block';
      }
    }
  }
}

// ── ABOUT ──
function renderAbout(a) {
  if (!a) return;
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) headingEl.innerHTML = (a.heading || '').replace(/\n/g, '<br>');
  const bioEls = document.querySelectorAll('.about-text');
  if (bioEls[0]) bioEls[0].innerHTML = a.bio1 || '';
  if (bioEls[1]) bioEls[1].innerHTML = a.bio2 || '';
  const grid = document.querySelector('.skills-grid');
  if (grid && Array.isArray(a.skills)) {
    grid.innerHTML = a.skills.map(s => `<div class="skill-tag">${s}</div>`).join('');
  }
}

// ── PROJECTS ──
function renderProjects(projects) {
  const grid = document.querySelector('.project-grid');
  if (!grid || !Array.isArray(projects)) return;

  grid.innerHTML = projects.map(p => `
    <div class="project-card reveal">
      <div class="project-card-top">
        <p class="project-num">${p.num || ''}</p>
        <span class="project-status ${p.statusDone ? 'project-status--done' : ''}">${p.status || ''}</span>
      </div>
      <h3 class="project-title">Project <span class="project-redacted">${p.codename || '████████'}</span></h3>
      <p class="project-type">${p.type || ''}</p>
      <div class="project-stack">
        ${(p.stack || []).map(s => `
          <div class="stack-item">
            <div class="stack-label">
              <span>${s.name}</span>
              <span class="stack-pct">${s.pct}%</span>
            </div>
            <div class="stack-bar">
              <div class="stack-fill" data-width="${s.pct}"></div>
            </div>
          </div>`).join('')}
      </div>
      <p class="project-hint">${p.hint || ''}</p>
    </div>`).join('');
}

// ── GALLERY ──
function renderGallery(items) {
  const grid = document.querySelector('.masonry-grid');
  if (!grid || !Array.isArray(items)) return;

  grid.innerHTML = items.map(item => `
    <div class="masonry-item reveal"
         data-category="${item.category || ''}"
         data-caption="${item.caption || ''}"
         data-src="${item.src || ''}">
      ${item.src
        ? `<img src="${item.src}" alt="${item.caption || ''}" loading="lazy">`
        : `<div class="photo-placeholder"></div>`}
      <div class="masonry-overlay">
        <p class="masonry-caption">${item.caption || ''}</p>
        <span class="masonry-tag">${item.category || ''}</span>
      </div>
    </div>`).join('');
}

// ── CONTACT ──
function renderContact(c) {
  if (!c) return;
  const emailEl = document.querySelector('.contact-email');
  if (emailEl && c.email) {
    emailEl.href = `mailto:${c.email}`; emailEl.textContent = c.email;
  }
  const links = document.querySelectorAll('.footer-links a');
  ['linkedin','github','resume'].forEach((k,i) => { if (links[i] && c[k]) links[i].href = c[k]; });

  // Auto-generate QR from admin-managed URL
  const url      = c.qrUrl || 'https://yourportfolio.vercel.app';
  const qrEl     = document.getElementById('qrcode');
  const sublabel = document.getElementById('qr-sublabel');
  if (qrEl && typeof QRCode !== 'undefined') {
    qrEl.innerHTML = '';
    new QRCode(qrEl, {
      text: url, width: 160, height: 160,
      colorDark: '#0a0a0a', colorLight: '#f5f5f3',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
  if (sublabel) sublabel.textContent = url.replace(/^https?:\/\//, '');
}

// ── HELPERS ──
function setText(selector, text) {
  const el = document.querySelector(selector); if (el) el.textContent = text || '';
}

function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initStackBars() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stack-fill').forEach(f => {
          setTimeout(() => { f.style.width = (f.dataset.width || 0) + '%'; }, 300);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.project-card').forEach(c => obs.observe(c));
}

document.addEventListener('DOMContentLoaded', loadContent);