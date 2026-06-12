/* FILE: portfolio/js/admin.js */

/* ============================================================
   admin.js — Admin panel
   Features: PIN gate, Hero/About/Projects/Gallery/Contact editors,
             Profile image upload, PIN change with SHA-256 hashing
   ============================================================ */

// ── FALLBACK PIN (used only if no hash stored in data.json yet) ──
const DEFAULT_PIN = '1234';

// ── STATE ──
let currentPin    = '';
let currentData   = null;
let storedPinHash = '';

// ── ELEMENTS ──
const pinOverlay  = document.getElementById('admin-pin-overlay');
const adminPanel  = document.getElementById('admin-panel');
const pinDots     = document.querySelectorAll('.pin-dot');
const pinError    = document.getElementById('pin-error');
const adminStatus = document.getElementById('admin-status');

// ── SHA-256 HASH ──
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str + 'cjl-salt'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── LOAD PIN HASH from data.json on page load ──
async function loadPinHash() {
  try {
    const res  = await fetch('/data.json?v=' + Date.now());
    const data = await res.json();
    storedPinHash = data._pin || await sha256(DEFAULT_PIN);
  } catch {
    storedPinHash = await sha256(DEFAULT_PIN);
  }
}
loadPinHash();

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
checkHash();

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
  pinDots.forEach((dot, i) => dot.classList.toggle('filled', i < currentPin.length));
}

async function checkPin() {
  const entered = await sha256(currentPin);
  if (entered === storedPinHash) {
    pinOverlay.classList.remove('open');
    openAdmin();
  } else {
    pinError.textContent = 'Incorrect PIN — try again.';
    currentPin = '';
    updateDots();
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
    const res   = await fetch('/data.json?v=' + Date.now());
    currentData = await res.json();
    buildForms(currentData);
    setStatus('');
  } catch (e) {
    setStatus('Failed to load data.json', true);
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

// ── BUILD ALL FORMS ──
function buildForms(data) {
  buildHeroForm(data.hero);
  buildAboutForm(data.about);
  buildProjectsForm(data.projects);
  buildGalleryForm(data.gallery);
  buildContactForm(data.contact);
  buildSettingsForm();
}

// ── HERO ──
function buildHeroForm(h) {
  document.getElementById('section-hero').innerHTML = `
    <h2 class="admin-section-title">Hero</h2>
    <div class="admin-field">
      <label>Profile Photo</label>
      <div class="img-upload-area" id="upload-area-profile">
        <input type="file" id="file-input-profile" accept="image/*">
        <div class="img-upload-icon">🖼️</div>
        <p class="img-upload-label">Click or drag to upload</p>
        <p class="img-upload-sub">JPG, PNG, WEBP — max 32MB</p>
      </div>
      <div class="img-preview-wrap" id="preview-wrap-profile" style="display:none">
        <img class="img-preview" id="img-preview-profile" src="" alt="Profile preview">
        <button class="img-preview-remove" onclick="removeProfileImage()">✕ Remove</button>
      </div>
      <p class="img-upload-status" id="upload-status-profile"></p>
      <input type="hidden" id="hero-profileImage" value="${escHtml(h.profileImage || '')}">
    </div>
    <div class="admin-field">
      <label>Photo Frame Shape</label>
      <div class="frame-toggle">
        <button class="frame-btn ${h.profileFrame !== 'square' ? 'active' : ''}" onclick="setFrame('circle')" id="frame-circle">
          <span class="frame-preview frame-preview-circle"></span>Circle
        </button>
        <button class="frame-btn ${h.profileFrame === 'square' ? 'active' : ''}" onclick="setFrame('square')" id="frame-square">
          <span class="frame-preview frame-preview-square"></span>Square
        </button>
      </div>
      <input type="hidden" id="hero-profileFrame" value="${h.profileFrame || 'circle'}">
    </div>
    ${field('Eyebrow text',  'hero-eyebrow',   h.eyebrow)}
    ${field('First name',    'hero-firstName',  h.firstName)}
    ${field('Last name',     'hero-lastName',   h.lastName)}
    ${field('Subtitle',      'hero-subtitle',   h.subtitle)}
    ${field('Location line', 'hero-location',   h.location)}
  `;
  bindProfileImageUpload(h.profileImage);
}

function setFrame(shape) {
  document.getElementById('hero-profileFrame').value = shape;
  document.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('frame-' + shape).classList.add('active');
}

function bindProfileImageUpload(existingSrc) {
  if (existingSrc) showImagePreview('profile', existingSrc);
  const fileInput = document.getElementById('file-input-profile');
  const area      = document.getElementById('upload-area-profile');
  if (!fileInput || !area) return;
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleImageUpload('profile', e.target.files[0]);
  });
  area.addEventListener('dragover',  e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleImageUpload('profile', f);
  });
}

function removeProfileImage() {
  document.getElementById('hero-profileImage').value             = '';
  document.getElementById('preview-wrap-profile').style.display = 'none';
  document.getElementById('upload-area-profile').style.display  = 'flex';
  document.getElementById('file-input-profile').value           = '';
  setUploadStatus('profile', '');
}

// ── ABOUT ──
function buildAboutForm(a) {
  document.getElementById('section-about').innerHTML = `
    <h2 class="admin-section-title">About</h2>
    ${field('Heading (use \\n for line break)', 'about-heading', a.heading)}
    ${field('Bio paragraph 1 (HTML allowed)',   'about-bio1',    a.bio1, 'textarea')}
    ${field('Bio paragraph 2 (HTML allowed)',   'about-bio2',    a.bio2, 'textarea')}
    <div class="admin-field">
      <label>Skills</label>
      <div class="skills-admin-list" id="skills-list">
        ${a.skills.map((s, i) => skillRow(s, i)).join('')}
      </div>
      <button class="admin-add-btn" onclick="addSkill()">+ Add Skill</button>
    </div>`;
  bindRemoveSkill();
}

function skillRow(value, i) {
  return `<div class="skill-admin-row">
    <input type="text" class="skill-input" value="${escHtml(value)}" placeholder="Skill name">
    <button class="admin-remove-btn" data-index="${i}">✕</button>
  </div>`;
}

function addSkill() {
  const list = document.getElementById('skills-list');
  list.insertAdjacentHTML('beforeend', skillRow('', list.querySelectorAll('.skill-admin-row').length));
  bindRemoveSkill();
}

function bindRemoveSkill() {
  document.querySelectorAll('#skills-list .admin-remove-btn').forEach(btn => {
    btn.onclick = () => btn.closest('.skill-admin-row').remove();
  });
}

// ── PROJECTS ──
function buildProjectsForm(projects) {
  document.getElementById('section-projects').innerHTML = `
    <h2 class="admin-section-title">Projects</h2>
    <div class="admin-card-group" id="projects-list">
      ${projects.map((p, i) => projectCard(p, i)).join('')}
    </div>
    <button class="admin-add-btn" style="margin-top:1rem" onclick="addProject()">+ Add Project</button>`;
  bindCardToggle();
}

function projectCard(p, i) {
  return `<div class="admin-card" data-index="${i}">
    <div class="admin-card-header">
      <span class="admin-card-label">Project ${p.num || (i+1)}</span>
      <span class="admin-card-toggle">▾</span>
    </div>
    <div class="admin-card-body">
      ${field('Number', `p${i}-num`, p.num)}
      ${field('Status label', `p${i}-status`, p.status)}
      <div class="admin-field">
        <label>Completed?</label>
        <input type="checkbox" id="p${i}-done" ${p.statusDone ? 'checked' : ''} style="width:auto;margin-top:4px">
      </div>
      ${field('Codename / Redacted text', `p${i}-codename`, p.codename)}
      ${field('Project type', `p${i}-type`, p.type)}
      ${field('Hint line', `p${i}-hint`, p.hint)}
      <div class="admin-field">
        <label>Tech Stack</label>
        <div id="stack-${i}">${p.stack.map((s, j) => stackRow(i, j, s)).join('')}</div>
        <button class="admin-add-btn" onclick="addStack(${i})">+ Add Tech</button>
      </div>
    </div>
  </div>`;
}

function stackRow(pi, si, s) {
  return `<div class="stack-admin-row" data-pi="${pi}" data-si="${si}">
    <input type="text"   class="stack-name" value="${escHtml(s.name)}" placeholder="Tech name">
    <input type="number" class="stack-pct"  value="${s.pct}" min="0" max="100" placeholder="%">
    <button class="admin-remove-btn" onclick="this.closest('.stack-admin-row').remove()">✕</button>
  </div>`;
}

function addStack(pi) {
  document.getElementById('stack-' + pi)
    .insertAdjacentHTML('beforeend', stackRow(pi, Date.now(), { name: '', pct: 50 }));
}

function addProject() {
  const list = document.getElementById('projects-list');
  const i    = list.querySelectorAll('.admin-card').length;
  list.insertAdjacentHTML('beforeend', projectCard(
    { num: '00'+(i+1), status: 'In Progress', statusDone: false,
      codename: '████████', type: 'Project Type', hint: '💡 Hint: ...', stack: [] }, i));
  bindCardToggle();
}

// ── GALLERY ──
function buildGalleryForm(gallery) {
  document.getElementById('section-gallery').innerHTML = `
    <h2 class="admin-section-title">Gallery</h2>
    <div class="admin-card-group" id="gallery-list">
      ${gallery.map((g, i) => galleryCard(g, i)).join('')}
    </div>
    <button class="admin-add-btn" style="margin-top:1rem" onclick="addGalleryItem()">+ Add Photo</button>`;
  bindCardToggle();
  gallery.forEach((g, i) => bindGalleryImageUpload(i, g.src));
}

function galleryCard(g, i) {
  return `<div class="admin-card" data-index="${i}">
    <div class="admin-card-header">
      <span class="admin-card-label">Photo ${i+1} — ${g.category || 'Uncategorized'}</span>
      <span class="admin-card-toggle">▾</span>
    </div>
    <div class="admin-card-body">
      ${field('Category', 'g'+i+'-category', g.category)}
      ${field('Caption',  'g'+i+'-caption',  g.caption)}
      <div class="admin-field">
        <label>Photo</label>
        <div class="img-upload-area" id="upload-area-${i}">
          <input type="file" id="file-input-${i}" accept="image/*">
          <div class="img-upload-icon">📷</div>
          <p class="img-upload-label">Click or drag to upload</p>
          <p class="img-upload-sub">JPG, PNG, WEBP — max 32MB</p>
        </div>
        <div class="img-preview-wrap" id="preview-wrap-${i}" style="display:none">
          <img class="img-preview" id="img-preview-${i}" src="" alt="Preview">
          <button class="img-preview-remove" onclick="removeGalleryImage(${i})">✕ Remove</button>
        </div>
        <p class="img-upload-status" id="upload-status-${i}"></p>
        <input type="hidden" id="g${i}-src" value="${escHtml(g.src)}">
      </div>
    </div>
  </div>`;
}

function bindGalleryImageUpload(i, existingSrc) {
  if (existingSrc) showImagePreview(i, existingSrc);
  const fileInput = document.getElementById('file-input-' + i);
  const area      = document.getElementById('upload-area-' + i);
  if (!fileInput || !area) return;
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleImageUpload(i, e.target.files[0]);
  });
  area.addEventListener('dragover',  e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleImageUpload(i, f);
  });
}

function removeGalleryImage(i) {
  document.getElementById('g'+i+'-src').value                = '';
  document.getElementById('preview-wrap-'+i).style.display  = 'none';
  document.getElementById('upload-area-'+i).style.display   = 'flex';
  document.getElementById('file-input-'+i).value            = '';
  setUploadStatus(i, '');
}

function addGalleryItem() {
  const list = document.getElementById('gallery-list');
  const i    = list.querySelectorAll('.admin-card').length;
  list.insertAdjacentHTML('beforeend', galleryCard({ category: 'Events', caption: '', src: '' }, i));
  bindCardToggle();
  bindGalleryImageUpload(i, '');
}

// ── CONTACT ──
function buildContactForm(c) {
  document.getElementById('section-contact').innerHTML = `
    <h2 class="admin-section-title">Contact</h2>
    ${field('Email address', 'contact-email',    c.email)}
    ${field('LinkedIn URL',  'contact-linkedin', c.linkedin)}
    ${field('GitHub URL',    'contact-github',   c.github)}
    ${field('Resume URL',    'contact-resume',   c.resume)}`;
}

// ── SETTINGS ──
function buildSettingsForm() {
  document.getElementById('section-settings').innerHTML = `
    <h2 class="admin-section-title">Settings</h2>
    <div class="pin-change-box">
      <p class="pin-change-desc">Change your admin PIN. You'll need your current PIN to confirm.</p>
      ${field('Current PIN', 'pin-current', '')}
      ${field('New PIN (4 digits)', 'pin-new', '')}
      ${field('Confirm New PIN', 'pin-confirm', '')}
      <p class="pin-change-status" id="pin-change-status"></p>
      <button class="admin-save-btn" onclick="changePin()" style="margin-top:0.5rem">Update PIN</button>
    </div>`;

  // Set password type on PIN inputs
  ['pin-current','pin-new','pin-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.type = 'password'; el.maxLength = 4; el.inputMode = 'numeric'; el.value = ''; }
  });
}

async function changePin() {
  const cur  = document.getElementById('pin-current').value.trim();
  const nw   = document.getElementById('pin-new').value.trim();
  const conf = document.getElementById('pin-confirm').value.trim();
  const st   = document.getElementById('pin-change-status');

  const msg = (m, ok) => { st.textContent = m; st.className = 'pin-change-status ' + (ok ? 'success' : 'error'); };

  if (!cur || !nw || !conf)           return msg('Please fill in all fields.', false);
  if (!/^\d{4}$/.test(nw))           return msg('New PIN must be exactly 4 digits.', false);
  if (nw !== conf)                    return msg('New PINs do not match.', false);
  if (await sha256(cur) !== storedPinHash) return msg('Current PIN is incorrect.', false);

  msg('Saving…', true);
  const newHash  = await sha256(nw);
  const saveData = { ...currentData, _pin: newHash };

  try {
    const text = await (await fetch('/api/save-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData),
    })).text();
    const json = (() => { try { return JSON.parse(text); } catch { return { error: text }; } })();

    if (json.ok) {
      storedPinHash    = newHash;
      currentData._pin = newHash;
      msg('✓ PIN updated successfully!', true);
      ['pin-current','pin-new','pin-confirm'].forEach(id => { document.getElementById(id).value = ''; });
    } else {
      msg(json.error || 'Failed to save.', false);
    }
  } catch (e) { msg('Network error.', false); console.error(e); }
}

// ── IMAGE UPLOAD ──
async function handleImageUpload(key, file) {
  setUploadStatus(key, 'Uploading…', 'uploading');
  try {
    const raw = (await fileToBase64(file)).split(',')[1];
    const res = await fetch('/api/save-content?action=upload-image', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: raw, fileName: file.name }),
    });
    const json = await res.json();
    if (res.ok && json.url) {
      const srcId = key === 'profile' ? 'hero-profileImage' : 'g'+key+'-src';
      const el    = document.getElementById(srcId);
      if (el) el.value = json.url;
      showImagePreview(key, json.url);
      setUploadStatus(key, '✓ Uploaded!', 'done');
    } else {
      setUploadStatus(key, json.error || 'Upload failed', 'error');
    }
  } catch (e) { setUploadStatus(key, 'Error: ' + e.message, 'error'); }
}

function showImagePreview(key, src) {
  const isProfile   = key === 'profile';
  const previewWrap = document.getElementById(isProfile ? 'preview-wrap-profile'   : 'preview-wrap-'+key);
  const previewImg  = document.getElementById(isProfile ? 'img-preview-profile'    : 'img-preview-'+key);
  const area        = document.getElementById(isProfile ? 'upload-area-profile'    : 'upload-area-'+key);
  if (!previewWrap || !previewImg) return;
  previewImg.src             = src;
  previewWrap.style.display  = 'block';
  if (area) area.style.display = 'none';
}

function setUploadStatus(key, msg, type = '') {
  const isProfile = key === 'profile';
  const el = document.getElementById(isProfile ? 'upload-status-profile' : 'upload-status-'+key);
  if (!el) return;
  el.textContent = msg;
  el.className   = 'img-upload-status' + (type ? ' ' + type : '');
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── CARD TOGGLE ──
function bindCardToggle() {
  document.querySelectorAll('.admin-card-header').forEach(h => {
    h.onclick = () => h.closest('.admin-card').classList.toggle('collapsed');
  });
}

// ── COLLECT DATA ──
function collectData() {
  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const hero = {
    eyebrow: val('hero-eyebrow'), firstName: val('hero-firstName'),
    lastName: val('hero-lastName'), subtitle: val('hero-subtitle'),
    location: val('hero-location'), profileImage: val('hero-profileImage'),
    profileFrame: val('hero-profileFrame') || 'circle',
  };

  const skills = Array.from(document.querySelectorAll('.skill-input')).map(i => i.value.trim()).filter(Boolean);
  const about  = { heading: val('about-heading'), bio1: val('about-bio1'), bio2: val('about-bio2'), skills };

  const projects = Array.from(document.querySelectorAll('#projects-list .admin-card')).map(card => {
    const i = card.dataset.index;
    return {
      num: val('p'+i+'-num'), status: val('p'+i+'-status'),
      statusDone: document.getElementById('p'+i+'-done')?.checked || false,
      codename: val('p'+i+'-codename'), type: val('p'+i+'-type'), hint: val('p'+i+'-hint'),
      stack: Array.from(card.querySelectorAll('.stack-admin-row')).map(row => ({
        name: row.querySelector('.stack-name').value.trim(),
        pct:  parseInt(row.querySelector('.stack-pct').value) || 0,
      })),
    };
  });

  const gallery = Array.from(document.querySelectorAll('#gallery-list .admin-card')).map(card => {
    const i = card.dataset.index;
    return { category: val('g'+i+'-category'), caption: val('g'+i+'-caption'), src: val('g'+i+'-src') };
  });

  const contact = {
    email: val('contact-email'), linkedin: val('contact-linkedin'),
    github: val('contact-github'), resume: val('contact-resume'),
  };

  return { _pin: currentData?._pin || '', hero, about, projects, gallery, contact };
}

// ── SAVE ──
document.getElementById('admin-save-btn').addEventListener('click', async () => {
  const btn = document.getElementById('admin-save-btn');
  btn.disabled = true;
  setStatus('Saving…');
  try {
    const text = await (await fetch('/api/save-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectData()),
    })).text();
    const json = (() => { try { return JSON.parse(text); } catch { return { error: text }; } })();
    if (json.ok) { setStatus('Saved! Site will update in ~30s.', false, true); }
    else         { setStatus(json.error || 'Save failed.', true); console.error(json); }
  } catch (e) { setStatus('Network error.', true); console.error(e); }
  finally { btn.disabled = false; }
});

// ── HELPERS ──
function field(label, id, value, type = 'input') {
  const v = escHtml(value || '');
  return `<div class="admin-field">
    <label for="${id}">${label}</label>
    ${type === 'textarea' ? `<textarea id="${id}" rows="3">${v}</textarea>` : `<input type="text" id="${id}" value="${v}">`}
  </div>`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function setStatus(msg, isError = false, isSuccess = false) {
  adminStatus.textContent = msg;
  adminStatus.className   = 'admin-status' + (isError ? ' error' : '') + (isSuccess ? ' success' : '');
}