/* FILE: portfolio/js/admin.js */

/* ============================================================
   admin.js
   - Listens for /#admin hash
   - Shows PIN pad (4-digit code)
   - Loads data.json into editable form fields
   - Saves changes via Netlify serverless function
   ============================================================ */

// ── CONFIG ──
// Change this PIN to whatever you want (4 digits recommended)
const ADMIN_PIN = '1234';

// ── STATE ──
let currentPin   = '';
let currentData  = null;

// ── ELEMENTS ──
const pinOverlay  = document.getElementById('admin-pin-overlay');
const adminPanel  = document.getElementById('admin-panel');
const pinDots     = document.querySelectorAll('.pin-dot');
const pinError    = document.getElementById('pin-error');
const adminStatus = document.getElementById('admin-status');

// ── HASH WATCHER ──
function checkHash() {
  if (window.location.hash === '#admin') {
    document.body.style.overflow = 'hidden';
    pinOverlay.classList.add('open');
    currentPin = '';
    updateDots();
    pinError.textContent = '';
  }
}

window.addEventListener('hashchange', checkHash);
checkHash(); // run on page load too

// ── PIN PAD ──
document.querySelectorAll('.pin-btn[data-digit]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentPin.length >= 4) return;
    currentPin += btn.dataset.digit;
    updateDots();
    if (currentPin.length === 4) checkPin();
  });
});

document.getElementById('pin-del-btn').addEventListener('click', () => {
  currentPin = currentPin.slice(0, -1);
  updateDots();
  pinError.textContent = '';
});

function updateDots() {
  pinDots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < currentPin.length);
  });
}

function checkPin() {
  if (currentPin === ADMIN_PIN) {
    pinOverlay.classList.remove('open');
    openAdmin();
  } else {
    pinError.textContent = 'Incorrect PIN — try again.';
    currentPin = '';
    updateDots();
    // Shake dots
    pinDots.forEach(d => {
      d.style.borderColor = '#ff6b6b';
      setTimeout(() => d.style.borderColor = '', 600);
    });
  }
}

// ── OPEN ADMIN PANEL ──
async function openAdmin() {
  adminPanel.classList.add('open');
  setStatus('Loading content…');

  try {
    const res = await fetch('/data.json?v=' + Date.now());
    currentData = await res.json();

    // Build ALL section forms immediately so collectData() can read every field
    buildForms(currentData);
    setStatus('');
  } catch (e) {
    setStatus('Failed to load data.json — is the file in your repo root?', true);
    console.error(e);
  }
}

// ── CLOSE ──
document.getElementById('admin-close-btn').addEventListener('click', () => {
  adminPanel.classList.remove('open');
  document.body.style.overflow = '';
  history.pushState('', document.title, window.location.pathname);
});

// ── TABS ──
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('section-' + tab.dataset.tab).classList.add('active');
  });
});

// ── BUILD FORMS ──
function buildForms(data) {
  buildHeroForm(data.hero);
  buildAboutForm(data.about);
  buildProjectsForm(data.projects);
  buildGalleryForm(data.gallery);
  buildContactForm(data.contact);
}

// HERO
function buildHeroForm(h) {
  const el = document.getElementById('section-hero');
  el.innerHTML = `
    <h2 class="admin-section-title">Hero</h2>
    ${field('Eyebrow text',  'hero-eyebrow',    h.eyebrow)}
    ${field('First name',    'hero-firstName',   h.firstName)}
    ${field('Last name',     'hero-lastName',    h.lastName)}
    ${field('Subtitle',      'hero-subtitle',    h.subtitle)}
    ${field('Location line', 'hero-location',    h.location)}
  `;
}

// ABOUT
function buildAboutForm(a) {
  const el = document.getElementById('section-about');
  el.innerHTML = `
    <h2 class="admin-section-title">About</h2>
    ${field('Heading (use \\n for line break)', 'about-heading', a.heading)}
    ${field('Bio paragraph 1 (HTML allowed)',   'about-bio1',    a.bio1,  'textarea')}
    ${field('Bio paragraph 2 (HTML allowed)',   'about-bio2',    a.bio2,  'textarea')}
    <div class="admin-field">
      <label>Skills</label>
      <div class="skills-admin-list" id="skills-list">
        ${a.skills.map((s, i) => skillRow(s, i)).join('')}
      </div>
      <button class="admin-add-btn" onclick="addSkill()">+ Add Skill</button>
    </div>
  `;
  bindRemoveSkill();
}

function skillRow(value, i) {
  return `
    <div class="skill-admin-row">
      <input type="text" class="skill-input" value="${escHtml(value)}" placeholder="Skill name">
      <button class="admin-remove-btn" data-index="${i}">✕</button>
    </div>
  `;
}

function addSkill() {
  const list = document.getElementById('skills-list');
  const i    = list.querySelectorAll('.skill-admin-row').length;
  list.insertAdjacentHTML('beforeend', skillRow('', i));
  bindRemoveSkill();
}

function bindRemoveSkill() {
  document.querySelectorAll('#skills-list .admin-remove-btn').forEach(btn => {
    btn.onclick = () => { btn.closest('.skill-admin-row').remove(); };
  });
}

// PROJECTS
function buildProjectsForm(projects) {
  const el = document.getElementById('section-projects');
  el.innerHTML = `
    <h2 class="admin-section-title">Projects</h2>
    <div class="admin-card-group" id="projects-list">
      ${projects.map((p, i) => projectCard(p, i)).join('')}
    </div>
    <button class="admin-add-btn" style="margin-top:1rem" onclick="addProject()">+ Add Project</button>
  `;
  bindCardToggle();
}

function projectCard(p, i) {
  return `
    <div class="admin-card" data-index="${i}">
      <div class="admin-card-header">
        <span class="admin-card-label">Project ${p.num || (i+1)}</span>
        <span class="admin-card-toggle">▾</span>
      </div>
      <div class="admin-card-body">
        ${field('Number (e.g. 001)',  `p${i}-num`,      p.num)}
        ${field('Status label',       `p${i}-status`,   p.status)}
        <div class="admin-field">
          <label>Completed?</label>
          <input type="checkbox" id="p${i}-done" ${p.statusDone ? 'checked' : ''} style="width:auto;margin-top:4px">
        </div>
        ${field('Codename / Redacted text', `p${i}-codename`, p.codename)}
        ${field('Project type',             `p${i}-type`,     p.type)}
        ${field('Hint line',                `p${i}-hint`,     p.hint)}
        <div class="admin-field">
          <label>Tech Stack</label>
          <div id="stack-${i}">
            ${p.stack.map((s, j) => stackRow(i, j, s)).join('')}
          </div>
          <button class="admin-add-btn" onclick="addStack(${i})">+ Add Tech</button>
        </div>
      </div>
    </div>
  `;
}

function stackRow(pi, si, s) {
  return `
    <div class="stack-admin-row" data-pi="${pi}" data-si="${si}">
      <input type="text"   class="stack-name" value="${escHtml(s.name)}" placeholder="Tech name">
      <input type="number" class="stack-pct"  value="${s.pct}" min="0" max="100" placeholder="%">
      <button class="admin-remove-btn" onclick="this.closest('.stack-admin-row').remove()">✕</button>
    </div>
  `;
}

function addStack(pi) {
  document.getElementById(`stack-${pi}`)
    .insertAdjacentHTML('beforeend', stackRow(pi, Date.now(), { name: '', pct: 50 }));
}

function addProject() {
  const list  = document.getElementById('projects-list');
  const i     = list.querySelectorAll('.admin-card').length;
  const blank = { num: `00${i+1}`, status: 'In Progress', statusDone: false,
                  codename: '████████', type: 'Project Type', hint: '💡 Hint: ...', stack: [] };
  list.insertAdjacentHTML('beforeend', projectCard(blank, i));
  bindCardToggle();
}

// GALLERY
function buildGalleryForm(gallery) {
  const el = document.getElementById('section-gallery');
  el.innerHTML = `
    <h2 class="admin-section-title">Gallery</h2>
    <div class="admin-card-group" id="gallery-list">
      ${gallery.map((g, i) => galleryCard(g, i)).join('')}
    </div>
    <button class="admin-add-btn" style="margin-top:1rem" onclick="addGalleryItem()">+ Add Photo</button>
  `;
  bindCardToggle();
}

function galleryCard(g, i) {
  return `
    <div class="admin-card" data-index="${i}">
      <div class="admin-card-header">
        <span class="admin-card-label">Photo ${i+1} — ${g.category}</span>
        <span class="admin-card-toggle">▾</span>
      </div>
      <div class="admin-card-body">
        ${field('Category (Org Life / Thesis / Events / Academics / Friends)', `g${i}-category`, g.category)}
        ${field('Caption',       `g${i}-caption`, g.caption)}
        ${field('Image path (e.g. assets/photo.jpg or full URL)', `g${i}-src`, g.src)}
      </div>
    </div>
  `;
}

function addGalleryItem() {
  const list = document.getElementById('gallery-list');
  const i    = list.querySelectorAll('.admin-card').length;
  list.insertAdjacentHTML('beforeend', galleryCard({ category: 'Events', caption: '', src: '' }, i));
  bindCardToggle();
}

// CONTACT
function buildContactForm(c) {
  const el = document.getElementById('section-contact');
  el.innerHTML = `
    <h2 class="admin-section-title">Contact</h2>
    ${field('Email address', 'contact-email',    c.email)}
    ${field('LinkedIn URL',  'contact-linkedin', c.linkedin)}
    ${field('GitHub URL',    'contact-github',   c.github)}
    ${field('Resume URL',    'contact-resume',   c.resume)}
  `;
}

// ── CARD COLLAPSE TOGGLE ──
function bindCardToggle() {
  document.querySelectorAll('.admin-card-header').forEach(header => {
    header.onclick = () => header.closest('.admin-card').classList.toggle('collapsed');
  });
}

// ── COLLECT FORM DATA ──
function collectData() {
  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  // Hero
  const hero = {
    eyebrow:   val('hero-eyebrow'),
    firstName: val('hero-firstName'),
    lastName:  val('hero-lastName'),
    subtitle:  val('hero-subtitle'),
    location:  val('hero-location'),
  };

  // About
  const skills = Array.from(document.querySelectorAll('.skill-input'))
    .map(i => i.value.trim()).filter(Boolean);
  const about = {
    heading: val('about-heading'),
    bio1:    val('about-bio1'),
    bio2:    val('about-bio2'),
    skills,
  };

  // Projects
  const projects = Array.from(document.querySelectorAll('#projects-list .admin-card')).map(card => {
    const i     = card.dataset.index;
    const stack = Array.from(card.querySelectorAll('.stack-admin-row')).map(row => ({
      name: row.querySelector('.stack-name').value.trim(),
      pct:  parseInt(row.querySelector('.stack-pct').value) || 0,
    }));
    return {
      num:        val(`p${i}-num`),
      status:     val(`p${i}-status`),
      statusDone: document.getElementById(`p${i}-done`)?.checked || false,
      codename:   val(`p${i}-codename`),
      type:       val(`p${i}-type`),
      hint:       val(`p${i}-hint`),
      stack,
    };
  });

  // Gallery
  const gallery = Array.from(document.querySelectorAll('#gallery-list .admin-card')).map(card => {
    const i = card.dataset.index;
    return {
      category: val(`g${i}-category`),
      caption:  val(`g${i}-caption`),
      src:      val(`g${i}-src`),
    };
  });

  // Contact
  const contact = {
    email:    val('contact-email'),
    linkedin: val('contact-linkedin'),
    github:   val('contact-github'),
    resume:   val('contact-resume'),
  };

  return { hero, about, projects, gallery, contact };
}

// ── SAVE ──
document.getElementById('admin-save-btn').addEventListener('click', async () => {
  const btn = document.getElementById('admin-save-btn');
  btn.disabled = true;
  setStatus('Saving…');

  const data = collectData();

  // Guard: make sure we actually have content before sending
  if (!data.hero.firstName && !data.contact.email) {
    setStatus('Nothing to save — open each tab first.', true);
    btn.disabled = false;
    return;
  }

  try {
    const body = JSON.stringify(data);
    console.log('Sending to save-content:', body); // helpful for debugging

    const res = await fetch('/.netlify/functions/save-content', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const responseText = await res.text();
    console.log('save-content raw response:', responseText);

    let json;
    try { json = JSON.parse(responseText); } catch { json = { error: responseText }; }

    if (res.ok) {
      setStatus('Saved! Site will update in ~30s.', false, true);
      currentData = data;
    } else {
      console.error('save-content error response:', json);
      setStatus(json.error || 'Save failed — check console.', true);
    }
  } catch (e) {
    setStatus('Network error — check console.', true);
    console.error(e);
  } finally {
    btn.disabled = false;
  }
});

// ── HELPERS ──
function field(label, id, value, type = 'input') {
  const val = escHtml(value || '');
  return `
    <div class="admin-field">
      <label for="${id}">${label}</label>
      ${type === 'textarea'
        ? `<textarea id="${id}" rows="3">${val}</textarea>`
        : `<input type="text" id="${id}" value="${val}">`}
    </div>
  `;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setStatus(msg, isError = false, isSuccess = false) {
  adminStatus.textContent = msg;
  adminStatus.className   = 'admin-status' +
    (isError ? ' error' : '') + (isSuccess ? ' success' : '');
}

function id(sel) { return document.getElementById(sel); }