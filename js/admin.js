// admin.js
// PIN-gated admin panel.
// TRIGGER: click the .nav-logo ("CJL") to open the PIN overlay.

(function () {
  'use strict';

  const PIN_KEY      = '_pin';
  const SAVE_URL     = '/api/save-content';
  const MAX_ATTEMPTS = 5;

  const STACK_PALETTE = [
    '#5DCAA5',
    '#7F77DD',
    '#85B7EB',
    '#EF9F27',
    '#ED93B1',
  ];

  let data      = {};
  let pinBuffer = '';
  let attempts  = 0;
  let activeTab = 'hero';

  // ── Boot ─────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    loadData().then(() => {
      wireTrigger();
      buildPinOverlay();
      buildAdminPanel();
    });
  });

  async function loadData() {
    try {
      const res = await fetch('data.json');
      data = await res.json();
    } catch (e) {
      console.error('admin: failed to load data.json', e);
      data = {};
    }
  }

  // ── Trigger: click nav logo ───────────────────────────────────────────────

  function wireTrigger() {
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => {
        const overlay = document.getElementById('admin-pin-overlay');
        if (overlay) overlay.style.display = 'flex';
        // reset pin buffer on each open
        pinBuffer = '';
        updateDots();
        const err = document.getElementById('pin-error');
        if (err) err.textContent = '';
      });
    }
  }

  // ── PIN overlay ──────────────────────────────────────────────────────────

  function updateDots() {
    const dots = document.querySelectorAll('#admin-pin-overlay .pin-dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < pinBuffer.length));
  }

  function buildPinOverlay() {
    const overlay = document.getElementById('admin-pin-overlay');
    if (!overlay) return;

    overlay.querySelectorAll('.pin-btn[data-digit]').forEach(b => {
      b.addEventListener('click', () => handleDigit(b.dataset.digit));
    });

    const delBtn = document.getElementById('pin-del-btn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        pinBuffer = pinBuffer.slice(0, -1);
        const err = document.getElementById('pin-error');
        if (err) err.textContent = '';
        updateDots();
      });
    }
  }

  function handleDigit(d) {
    if (attempts >= MAX_ATTEMPTS) return;
    if (pinBuffer.length >= 4) return;
    pinBuffer += d;
    updateDots();
    if (pinBuffer.length === 4) verifyPin();
  }

  function verifyPin() {
    const stored  = data[PIN_KEY] || '';
    const errorEl = document.getElementById('pin-error');

    // support both plain PIN (first-time, no PIN set) and SHA-256 hash
    sha256(pinBuffer).then(hash => {
      const match = !stored || hash === stored || pinBuffer === stored;
      if (match) {
        document.getElementById('admin-pin-overlay').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        renderActiveSection();
      } else {
        attempts++;
        if (errorEl) errorEl.textContent = attempts >= MAX_ATTEMPTS
          ? 'Too many attempts. Reload the page.'
          : `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempt(s) left.`;
        pinBuffer = '';
        updateDots();
        if (attempts >= MAX_ATTEMPTS) {
          document.querySelectorAll('#admin-pin-overlay .pin-btn')
            .forEach(b => b.disabled = true);
        }
      }
    });
  }

  // ── Admin panel shell ────────────────────────────────────────────────────

  function buildAdminPanel() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderActiveSection();
      });
    });

    const saveBtn = document.getElementById('admin-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveData);

    const closeBtn = document.getElementById('admin-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      document.getElementById('admin-panel').style.display = 'none';
    });
  }

  function renderActiveSection() {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`section-${activeTab}`);
    if (!el) return;
    el.classList.add('active');
    ({
      hero:     renderHeroSection,
      about:    renderAboutSection,
      projects: renderProjectsSection,
      gallery:  renderGallerySection,
      contact:  renderContactSection,
      settings: renderSettingsSection,
    }[activeTab] || (() => {}))(el);
  }

  // ── Section: Hero ────────────────────────────────────────────────────────

  function renderHeroSection(el) {
    const h = data.hero || {};
    el.innerHTML = `
      <h3 class="admin-section-title">Hero</h3>
      <label class="admin-label">Eyebrow text</label>
      <input class="admin-input" id="a-eyebrow" value="${esc(h.eyebrow || '')}"/>
      <label class="admin-label">First name</label>
      <input class="admin-input" id="a-firstName" value="${esc(h.firstName || '')}"/>
      <label class="admin-label">Last name / suffix</label>
      <input class="admin-input" id="a-lastName" value="${esc(h.lastName || '')}"/>
      <label class="admin-label">Subtitle</label>
      <input class="admin-input" id="a-subtitle" value="${esc(h.subtitle || '')}"/>
      <label class="admin-label">Location / tagline</label>
      <input class="admin-input" id="a-location" value="${esc(h.location || '')}"/>
      <label class="admin-label">Profile image URL</label>
      <input class="admin-input" id="a-profileImage" value="${esc(h.profileImage || '')}"/>
    `;
    ['eyebrow','firstName','lastName','subtitle','location','profileImage'].forEach(k => {
      const inp = el.querySelector(`#a-${k}`);
      if (inp) inp.addEventListener('input', e => {
        data.hero = data.hero || {};
        data.hero[k] = e.target.value;
      });
    });
  }

  // ── Section: About ───────────────────────────────────────────────────────

  function renderAboutSection(el) {
    const a = data.about || {};
    el.innerHTML = `
      <h3 class="admin-section-title">About</h3>
      <label class="admin-label">Heading (use \\n for line break)</label>
      <input class="admin-input" id="a-aHeading" value="${esc((a.heading||'').replace(/\n/g,'\\n'))}"/>
      <label class="admin-label">Bio paragraph 1 (HTML ok)</label>
      <textarea class="admin-textarea" id="a-bio1">${esc(a.bio1||'')}</textarea>
      <label class="admin-label">Bio paragraph 2 (HTML ok)</label>
      <textarea class="admin-textarea" id="a-bio2">${esc(a.bio2||'')}</textarea>
      <label class="admin-label">Skills (one per line)</label>
      <textarea class="admin-textarea" id="a-skills">${(a.skills||[]).join('\n')}</textarea>
    `;
    el.querySelector('#a-aHeading').addEventListener('input', e => {
      data.about = data.about || {};
      data.about.heading = e.target.value.replace(/\\n/g, '\n');
    });
    el.querySelector('#a-bio1').addEventListener('input', e => {
      data.about = data.about || {}; data.about.bio1 = e.target.value;
    });
    el.querySelector('#a-bio2').addEventListener('input', e => {
      data.about = data.about || {}; data.about.bio2 = e.target.value;
    });
    el.querySelector('#a-skills').addEventListener('input', e => {
      data.about = data.about || {};
      data.about.skills = e.target.value.split('\n').filter(Boolean);
    });
  }

  // ── Section: Projects ────────────────────────────────────────────────────

  function renderProjectsSection(el) {
    data.projects = data.projects || [];
    el.innerHTML = `
      <h3 class="admin-section-title">Projects</h3>
      <div id="proj-list"></div>
      <button class="admin-btn-add" id="add-project-btn">+ Add project</button>
    `;
    el.querySelector('#add-project-btn').addEventListener('click', () => {
      data.projects.push({
        num: String(data.projects.length + 1).padStart(3, '0'),
        status: 'In Progress', statusDone: false,
        codename: '████████', type: 'Project',
        hint: '', stack: [{ name: 'Tech', pct: 0 }]
      });
      renderProjectsSection(el);
    });
    buildProjectList(el.querySelector('#proj-list'), el);
  }

  function buildProjectList(container, parentEl) {
    container.innerHTML = '';
    (data.projects || []).forEach((proj, pi) => {
      const card = document.createElement('div');
      card.className = 'admin-proj-card';
      card.innerHTML = projectCardHTML(proj, pi);
      container.appendChild(card);
      wireProjectCard(card, pi, parentEl);
    });
  }

  function buildCodenamePreview(codename, stack) {
    const chars   = (codename || '████').split('');
    const segSize = Math.ceil(chars.length / Math.max(stack.length, 1));
    return chars.map((ch, i) => {
      const si      = Math.min(Math.floor(i / segSize), stack.length - 1);
      const color   = STACK_PALETTE[si % STACK_PALETTE.length];
      const pct     = stack[si] ? (stack[si].pct || 0) : 0;
      const opacity = (0.20 + (pct / 100) * 0.80).toFixed(2);
      return `<span style="display:inline-block;border-radius:3px;padding:0 1px;background:${color};opacity:${opacity};color:${color};font-family:monospace;font-size:1.3rem;">${ch}</span>`;
    }).join('');
  }

  function projectCardHTML(proj, pi) {
    const stack   = Array.isArray(proj.stack) ? proj.stack : [];
    const overall = stack.length
      ? (stack.reduce((s, x) => s + (x.pct || 0), 0) / stack.length).toFixed(2)
      : '0.00';

    const stackRows = stack.map((s, si) => `
      <div class="admin-stack-row">
        <div class="admin-stack-header">
          <input class="admin-input admin-stack-name" data-pi="${pi}" data-si="${si}"
            value="${esc(s.name || '')}" placeholder="Tech name"/>
          <button class="admin-stack-remove" data-pi="${pi}" data-si="${si}">✕</button>
        </div>
        <div class="admin-stack-slider-row">
          <div class="admin-stack-color-dot" style="background:${STACK_PALETTE[si % STACK_PALETTE.length]};width:10px;height:10px;border-radius:50%;flex-shrink:0;"></div>
          <input type="range" class="admin-stack-slider" min="0" max="100" step="1"
            value="${s.pct || 0}" data-pi="${pi}" data-si="${si}" style="flex:1;"/>
          <span class="admin-stack-pct-label" id="spct-${pi}-${si}">${Number(s.pct||0).toFixed(1)}%</span>
        </div>
      </div>`).join('');

    return `
      <div class="admin-proj-top" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <span class="admin-proj-num" style="font-size:0.75rem;opacity:0.5;">${proj.num || ''}</span>
        <button class="admin-proj-remove" data-pi="${pi}">Delete project</button>
      </div>

      <label class="admin-label">Codename (shown as redacted blocks)</label>
      <input class="admin-input admin-codename-input" data-pi="${pi}" value="${esc(proj.codename || '')}"/>
      <div class="admin-codename-preview" id="cdprev-${pi}" style="margin:0.5rem 0 1rem;min-height:2rem;">${buildCodenamePreview(proj.codename || '', stack)}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
        <div>
          <label class="admin-label">Project type</label>
          <input class="admin-input admin-proj-type" data-pi="${pi}" value="${esc(proj.type || '')}"/>
        </div>
        <div>
          <label class="admin-label">Status label</label>
          <input class="admin-input admin-proj-status" data-pi="${pi}" value="${esc(proj.status || '')}"/>
        </div>
      </div>

      <label class="admin-label" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
        <input type="checkbox" class="admin-proj-done" data-pi="${pi}" ${proj.statusDone ? 'checked' : ''}/>
        Mark as completed
      </label>

      <label class="admin-label">Hint text</label>
      <input class="admin-input admin-proj-hint" data-pi="${pi}" value="${esc(proj.hint || '')}" style="margin-bottom:1rem;"/>

      <label class="admin-label">Tech stack &amp; progress</label>
      <p style="font-size:0.78rem;margin:0 0 0.75rem;">
        Overall: <strong id="overall-${pi}">${overall}%</strong>
      </p>
      <div id="slist-${pi}">${stackRows}</div>
      <button class="admin-btn-add admin-add-stack" data-pi="${pi}" style="margin-top:0.5rem;">+ Add tech</button>
    `;
  }

  function wireProjectCard(card, pi, parentEl) {
    card.querySelector('.admin-proj-remove').addEventListener('click', () => {
      if (confirm('Delete this project?')) {
        data.projects.splice(pi, 1);
        renderProjectsSection(parentEl);
      }
    });

    card.querySelector('.admin-codename-input').addEventListener('input', e => {
      data.projects[pi].codename = e.target.value;
      refreshCodenamePreview(pi);
      liveRefreshProjects();
    });

    card.querySelector('.admin-proj-type').addEventListener('input', e => {
      data.projects[pi].type = e.target.value;
    });
    card.querySelector('.admin-proj-status').addEventListener('input', e => {
      data.projects[pi].status = e.target.value;
    });
    card.querySelector('.admin-proj-done').addEventListener('change', e => {
      data.projects[pi].statusDone = e.target.checked;
    });
    card.querySelector('.admin-proj-hint').addEventListener('input', e => {
      data.projects[pi].hint = e.target.value;
    });

    card.querySelectorAll('.admin-stack-name').forEach(inp => {
      inp.addEventListener('input', e => {
        const si = +e.target.dataset.si;
        data.projects[pi].stack[si].name = e.target.value;
        refreshCodenamePreview(pi);
        liveRefreshProjects();
      });
    });

    card.querySelectorAll('.admin-stack-slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const si  = +e.target.dataset.si;
        const val = +e.target.value;
        data.projects[pi].stack[si].pct = val;
        const lbl = document.getElementById(`spct-${pi}-${si}`);
        if (lbl) lbl.textContent = val.toFixed(1) + '%';
        refreshOverall(pi);
        refreshCodenamePreview(pi);
        liveRefreshProjects();
      });
    });

    card.querySelectorAll('.admin-stack-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const si = +e.target.dataset.si;
        data.projects[pi].stack.splice(si, 1);
        renderProjectsSection(parentEl);
      });
    });

    card.querySelector('.admin-add-stack').addEventListener('click', () => {
      if ((data.projects[pi].stack || []).length >= STACK_PALETTE.length) return;
      data.projects[pi].stack.push({ name: '', pct: 0 });
      renderProjectsSection(parentEl);
    });
  }

  function refreshOverall(pi) {
    const stack = data.projects[pi].stack || [];
    const avg   = stack.length
      ? stack.reduce((s, x) => s + (x.pct || 0), 0) / stack.length
      : 0;
    const el = document.getElementById(`overall-${pi}`);
    if (el) el.textContent = avg.toFixed(2) + '%';
  }

  function refreshCodenamePreview(pi) {
    const proj = data.projects[pi];
    const el   = document.getElementById(`cdprev-${pi}`);
    if (el) el.innerHTML = buildCodenamePreview(proj.codename || '', proj.stack || []);
  }

  function liveRefreshProjects() {
    if (window._renderProjects) window._renderProjects(data.projects);
  }

  // ── Section: Gallery ─────────────────────────────────────────────────────

  function renderGallerySection(el) {
    const gallery = data.gallery || [];
    el.innerHTML = `<h3 class="admin-section-title">Gallery</h3>` +
      gallery.map((item, i) => `
        <div class="admin-gallery-item" style="margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:1px solid var(--color-border);">
          <label class="admin-label">Item ${i + 1} — Category</label>
          <select class="admin-select admin-gal-cat" data-i="${i}">
            ${['Org Life','Thesis','Events','Academics','Friends'].map(c =>
              `<option ${c===item.category?'selected':''}>${c}</option>`).join('')}
          </select>
          <label class="admin-label">Caption</label>
          <input class="admin-input admin-gal-cap" data-i="${i}" value="${esc(item.caption||'')}"/>
          <label class="admin-label">Image URL or base64</label>
          <input class="admin-input admin-gal-src" data-i="${i}" value="${esc(item.src||'')}"/>
        </div>`).join('') +
      `<button class="admin-btn-add" id="add-gallery-btn">+ Add photo</button>`;

    el.querySelectorAll('.admin-gal-cat').forEach(s => s.addEventListener('change', e => {
      data.gallery[+e.target.dataset.i].category = e.target.value;
    }));
    el.querySelectorAll('.admin-gal-cap').forEach(s => s.addEventListener('input', e => {
      data.gallery[+e.target.dataset.i].caption = e.target.value;
    }));
    el.querySelectorAll('.admin-gal-src').forEach(s => s.addEventListener('input', e => {
      data.gallery[+e.target.dataset.i].src = e.target.value;
    }));
    el.querySelector('#add-gallery-btn').addEventListener('click', () => {
      data.gallery = data.gallery || [];
      data.gallery.push({ category: 'Events', caption: '', src: '' });
      renderGallerySection(el);
    });
  }

  // ── Section: Contact ─────────────────────────────────────────────────────

  function renderContactSection(el) {
    const c = data.contact || {};
    el.innerHTML = `
      <h3 class="admin-section-title">Contact</h3>
      <label class="admin-label">Email</label>
      <input class="admin-input" id="a-email" value="${esc(c.email||'')}"/>
      <label class="admin-label">LinkedIn URL</label>
      <input class="admin-input" id="a-linkedin" value="${esc(c.linkedin||'')}"/>
      <label class="admin-label">GitHub URL</label>
      <input class="admin-input" id="a-github" value="${esc(c.github||'')}"/>
      <label class="admin-label">Resume URL</label>
      <input class="admin-input" id="a-resume" value="${esc(c.resume||'')}"/>
      <label class="admin-label">QR code URL</label>
      <input class="admin-input" id="a-qrUrl" value="${esc(c.qrUrl||'')}"/>
    `;
    ['email','linkedin','github','resume','qrUrl'].forEach(k => {
      const inp = el.querySelector(`#a-${k}`);
      if (inp) inp.addEventListener('input', e => {
        data.contact = data.contact || {};
        data.contact[k] = e.target.value;
      });
    });
  }

  // ── Section: Settings ────────────────────────────────────────────────────

  function renderSettingsSection(el) {
    el.innerHTML = `
      <h3 class="admin-section-title">Settings</h3>
      <label class="admin-label">Change PIN (4 digits)</label>
      <input class="admin-input" id="a-newPin" type="password" maxlength="4" placeholder="Enter new PIN"/>
      <button class="admin-btn-add" id="set-pin-btn" style="margin-top:0.5rem;">Set PIN</button>
      <p style="font-size:0.78rem;margin-top:0.5rem;color:var(--color-muted);" id="pin-set-msg"></p>
    `;
    el.querySelector('#set-pin-btn').addEventListener('click', async () => {
      const val = el.querySelector('#a-newPin').value;
      if (!/^\d{4}$/.test(val)) {
        el.querySelector('#pin-set-msg').textContent = 'PIN must be exactly 4 digits.';
        return;
      }
      data[PIN_KEY] = await sha256(val);
      el.querySelector('#pin-set-msg').textContent = 'PIN updated. Click Save Changes to persist.';
    });
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function saveData() {
    const statusEl = document.getElementById('admin-status');
    if (statusEl) statusEl.textContent = 'Saving…';
    try {
      const res = await fetch(SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      if (statusEl) statusEl.textContent = 'Saved ✓';
      if (window._loadContent) window._loadContent(data);
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Save failed — check console';
      console.error(e);
    }
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
  }

  // ── Utilities ────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/"/g,'&quot;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  async function sha256(message) {
    const msgBuf  = new TextEncoder().encode(message);
    const hashBuf = await crypto.subtle.digest('SHA-256', msgBuf);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

})();