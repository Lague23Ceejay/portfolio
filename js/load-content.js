/* FILE: portfolio/js/load-content.js — PART 1 OF 2 */
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
  
  // Initialize presentation behaviors cleanly post-render
  initReveal();
  initOverallBars();
}

/* FILE: portfolio/js/load-content.js — ULTRA-SAFE HERO INJECTOR ENGINE */
function renderHero(hero) {
  if (!hero) return;

  // 1. Map text fields safely only if elements exist in HTML
  const eyebrowEl = document.querySelector('.hero-eyebrow');
  if (eyebrowEl && hero.eyebrow !== undefined) eyebrowEl.textContent = hero.eyebrow;

  const firstNameEl = document.querySelector('.first-name');
  if (firstNameEl && hero.firstName !== undefined) firstNameEl.textContent = hero.firstName;

  const lastNameEl = document.querySelector('.last-name');
  if (lastNameEl && hero.lastName !== undefined) lastNameEl.textContent = hero.lastName;

  const subtitleEl = document.querySelector('.hero-subtitle');
  if (subtitleEl && hero.subtitle !== undefined) subtitleEl.textContent = hero.subtitle;

  const locationEl = document.querySelector('.hero-location');
  if (locationEl && hero.location !== undefined) locationEl.textContent = hero.location;

  // 2. ULTRA-SAFE AVATAR MAPPING LAYER (Completely immune to undefined display crashes)
  const avatarImageEl = document.querySelector('.hero-avatar-img');
  const avatarWrapperEl = document.querySelector('.hero-avatar-wrapper');
  
  if (avatarImageEl) {
    if (hero.profileImage && hero.profileImage.trim() !== "") {
      avatarImageEl.src = hero.profileImage;
      avatarImageEl.style.display = 'block';
    } else {
      // Safely handle empty placeholder state assets without throwing runtime exceptions
      avatarImageEl.src = "";
      avatarImageEl.style.display = 'none';
    }
  }

  if (avatarWrapperEl && hero.profileFrame) {
    if (hero.profileFrame === 'circle') {
      avatarWrapperEl.style.borderRadius = '50%';
    } else {
      avatarWrapperEl.style.borderRadius = '12px';
    }
  }
}


function renderAbout(a) {
  if (!a) return;
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) headingEl.innerHTML = (a.heading || '').replace(/\n/g, '<br>');
  
  const bioEls = document.querySelectorAll('.about-text');
  // FIX: Fixed array syntax references to correctly target individual paragraphs
  if (bioEls && bioEls[0]) bioEls[0].innerHTML = a.bio1 || '';
  if (bioEls && bioEls[1]) bioEls[1].innerHTML = a.bio2 || '';
  
  const grid = document.querySelector('.skills-grid');
  if (grid && Array.isArray(a.skills)) {
    grid.innerHTML = a.skills.map(s => `<div class="skill-tag">${s}</div>`).join('');
  }
}

function calcOverall(stack) {
  if (!stack || !stack.length) return 0;
  return stack.reduce((sum, s) => sum + (s.pct || 0), 0) / stack.length;
}
/* FILE: portfolio/js/load-content.js — PART 2 OF 2 */
/* FILE: portfolio/js/load-content.js — REMAINING PROGRESS RECONSTRUCTION FIX */
function renderProjects(projects) {
  const grid = document.querySelector('.project-grid');
  if (!grid || !Array.isArray(projects)) return;

  const colorPalette = ['#61dafb', '#41b883', '#3c873a', '#3178c6', '#f5820b', '#007acc', '#f1e05a', '#663399'];

  grid.innerHTML = projects.map((p, projIdx) => {
    const stack = Array.isArray(p.stack) ? p.stack : [];
    
    const totalWeight = stack.reduce((sum, s) => sum + (parseInt(s.pct, 10) || 0), 0);
    const overallPct = stack.length > 0 ? Math.round(totalWeight / stack.length) : 0;

    const stackedProgressBarHTML = stack.map((s, stackIdx) => {
        const segmentColor = colorPalette[stackIdx % colorPalette.length];
        const sliceWidth = totalWeight > 0 ? ((parseInt(s.pct, 10) || 0) / totalWeight) * 100 : 0;
        return `<div style="width:${sliceWidth}%; height:100%; background:${segmentColor}; transition:width 0.3s ease;"></div>`;
    }).join('');

    const individualStackLinesHTML = stack.map((s, stackIdx) => {
        const assignedColor = colorPalette[stackIdx % colorPalette.length];
        const displayPct = parseInt(s.pct, 10) || 0;
        
        return `
          <div class="stack-item" style="border-left:3px solid ${assignedColor}; padding-left:0.65rem; margin-bottom:0.85rem; background:rgba(255,255,255,0.01); padding-top:0.25rem; padding-bottom:0.25rem;">
            <div class="stack-label" style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.35rem;">
              <span style="color:#e0e0e0; font-weight:500; letter-spacing:0.02em;">${esc(s.name)}</span>
              <span style="color:${assignedColor}; font-family:monospace; font-weight:bold; font-size:0.85rem;">${displayPct}%</span>
            </div>
            <!-- Visible Track Bar Layout -->
            <div class="stack-bar" style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; position:relative; display:block;">
              <!-- Force direct immediate width assignment to avoid getting blocked by lazy-loading scripts -->
              <div class="stack-fill" data-width="${displayPct}" style="width:${displayPct}%; height:100%; background:${assignedColor}; border-radius:3px; display:block; transition:width 0.5s ease-out;"></div>
            </div>
          </div>`;
    }).join('');

    return `
      <div class="project-card reveal">
        <div class="project-card-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <p class="project-num" style="margin:0; font-family:monospace; font-weight:bold; color:rgba(255,255,255,0.4);">${p.num || ''}</p>
          <span class="project-status ${p.statusDone ? 'project-status--done' : ''}" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; padding:2px 8px; border-radius:3px;">${p.status || ''}</span>
        </div>
        <p class="project-type" style="font-size:1.1rem; font-weight:600; margin:0 0 1rem 0; color:#fff;">${p.type || ''}</p>
        
        <!-- MASTER MULTI-COLOR STACKED BAR -->
        <div class="project-overall" style="margin-bottom:1.5rem; background:rgba(255,255,255,0.01); padding:0.75rem; border:1px solid rgba(255,255,255,0.03); border-radius:4px;">
          <div class="project-overall-header" style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.8rem;">
            <span class="project-overall-label" style="color:rgba(255,255,255,0.6);">Overall Completion Vector</span>
            <span class="project-overall-pct" style="font-weight:bold; color:#fff; font-family:monospace;">${overallPct}%</span>
          </div>
          <div class="project-overall-track" style="width:100%; height:10px; background:rgba(255,255,255,0.06); border-radius:5px; display:flex; overflow:hidden;">
             ${stackedProgressBarHTML}
          </div>
        </div>
        
        <!-- LIST INDIVIDUAL VISIBLE ITEMS -->
        <div class="project-stack" style="margin-bottom:1rem; display:flex; flex-direction:column;">${individualStackLinesHTML}</div>
        <p class="project-hint" style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin:0; font-style:italic;">${p.hint || ''}</p>
      </div>`;
  }).join('');
}
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

function renderContact(c) {
  if (!c) return;
  const emailEl = document.querySelector('.contact-email');
  if (emailEl && c.email) {
    emailEl.href = `mailto:${c.email}`; 
    emailEl.textContent = c.email;
  }
  
  const links = document.querySelectorAll('.footer-links a');
  ['linkedin','github','resume'].forEach((k, i) => { 
    if (links[i] && c[k]) links[i].href = c[k]; 
  });
}



function setText(selector, text) {
  const el = document.querySelector(selector); 
  if (el) el.textContent = text || '';
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

function initOverallBars() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const overall = e.target.querySelector('.project-overall-fill');
        if (overall) {
          setTimeout(() => { overall.style.width = overall.dataset.width + '%'; }, 200);
        }
        e.target.querySelectorAll('.stack-fill').forEach(f => {
          setTimeout(() => { f.style.width = (f.dataset.width || 0) + '%'; }, 350);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.project-card').forEach(c => obs.observe(c));
}

document.addEventListener('DOMContentLoaded', loadContent);

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
