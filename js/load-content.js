/* FILE: portfolio/js/load-content.js */

/* ============================================================
   load-content.js
   Fetches data.json and renders all site content dynamically.
   ============================================================ */

async function loadContent() {
  let data;
  try {
    const res = await fetch('/data.json?v=' + Date.now());
    data = await res.json();
  } catch (e) {
    console.error('Could not load data.json:', e);
    return;
  }

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
  setText('#hero .hero-eyebrow',      h.eyebrow);
  setText('#hero .hero-name .line-1', h.firstName);
  setText('#hero .hero-name .line-2', h.lastName);

  const titleEl = document.querySelector('#hero .hero-title');
  if (titleEl) titleEl.innerHTML = `<span>${h.subtitle}</span><br>${h.location}`;

  // Profile image
  const img         = document.getElementById('hero-profile-img');
  const placeholder = document.getElementById('hero-profile-placeholder');
  const frame       = h.profileFrame || 'circle';

  if (img) {
    img.className = `hero-profile-img frame-${frame}`;
    if (h.profileImage) {
      img.src             = h.profileImage;
      img.style.display   = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      img.style.display   = 'none';
      if (placeholder) {
        placeholder.className    = `hero-profile-placeholder frame-${frame}`;
        placeholder.style.display = 'block';
      }
    }
  }
}

// ── ABOUT ──
function renderAbout(a) {
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) headingEl.innerHTML = a.heading.replace('\n', '<br>');

  const bioEls = document.querySelectorAll('.about-text');
  if (bioEls[0]) bioEls[0].innerHTML = a.bio1;
  if (bioEls[1]) bioEls[1].innerHTML = a.bio2;

  const grid = document.querySelector('.skills-grid');
  if (grid) {
    grid.innerHTML = a.skills
      .map(s => `<div class="skill-tag">${s}</div>`)
      .join('');
  }
}

// ── PROJECTS ──
function renderProjects(projects) {
  const grid = document.querySelector('.project-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <div class="project-card reveal">
      <div class="project-card-top">
        <p class="project-num">${p.num}</p>
        <span class="project-status ${p.statusDone ? 'project-status--done' : ''}">${p.status}</span>
      </div>
      <h3 class="project-title">Project <span class="project-redacted">${p.codename}</span></h3>
      <p class="project-type">${p.type}</p>
      <div class="project-stack">
        ${p.stack.map(s => `
          <div class="stack-item">
            <div class="stack-label">
              <span>${s.name}</span>
              <span class="stack-pct">${s.pct}%</span>
            </div>
            <div class="stack-bar">
              <div class="stack-fill" data-width="${s.pct}"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <p class="project-hint">${p.hint}</p>
    </div>
  `).join('');
}

// ── GALLERY ──
function renderGallery(items) {
  const grid = document.querySelector('.masonry-grid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <div class="masonry-item reveal"
         data-category="${item.category}"
         data-caption="${item.caption}"
         data-src="${item.src}">
      ${item.src
        ? `<img src="${item.src}" alt="${item.caption}">`
        : `<div class="photo-placeholder"></div>`}
      <div class="masonry-overlay">
        <p class="masonry-caption">${item.caption}</p>
        <span class="masonry-tag">${item.category}</span>
      </div>
    </div>
  `).join('');
}

// ── CONTACT ──
function renderContact(c) {
  const emailEl = document.querySelector('.contact-email');
  if (emailEl) {
    emailEl.href        = `mailto:${c.email}`;
    emailEl.textContent = c.email;
  }

  const links = document.querySelectorAll('.footer-links a');
  const map   = ['linkedin', 'github', 'resume'];
  links.forEach((a, i) => { if (map[i]) a.href = c[map[i]]; });

  // Build QR from saved contact QR URL (admin-managed). If missing, use default placeholder.
  try { if (typeof buildQR === 'function') buildQR(c.qrUrl || 'https://yourportfolio.com'); } catch (e) { /* ignore */ }
}

// ── HELPERS ──
function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initStackBars() {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stack-fill').forEach(fill => {
          setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 300);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.project-card').forEach(card => barObserver.observe(card));
}

loadContent();