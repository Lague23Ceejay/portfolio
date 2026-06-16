/* FILE: portfolio/js/admin.js — PART 1 OF 4 */
(function() {
    'use strict';

    const PIN_KEY = '_pin';
    const SAVE_URL = '/api/save-content';
    const MAX_ATTEMPTS = 5;

    let data = {};
    let pinBuffer = '';
    let attempts = 0;
    let activeTab = 'hero';

    // ── Browser-Native Hashing Utility ──
    async function sha256(message) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ── HTML Text Sanitizer (Prevents UI breaking / XSS) ──
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadData().then(() => {
            buildPinOverlay();
            buildAdminPanel();
            handleAdminHash(window.location.hash);
        });
    });

    window.addEventListener('hashchange', () => handleAdminHash(window.location.hash));

    async function loadData() {
        try {
            const res = await fetch('data.json?t=' + Date.now());
            data = await res.json();
        } catch (e) {
            console.error('admin: failed to load data.json', e);
            data = {};
        }
    }

    function updateDots() {
        const dots = document.querySelectorAll('#admin-pin-overlay .pin-dot');
        dots.forEach((d, i) => d.classList.toggle('filled', i < pinBuffer.length));
    }
/* FILE: portfolio/js/admin.js — PART 2 OF 4 */
    function buildPinOverlay() {
        const overlay = document.getElementById('admin-pin-overlay');
        if (!overlay) return;
        const navLogo = document.querySelector('.nav-logo');
        if (navLogo) {
            navLogo.style.cursor = 'pointer';
            navLogo.addEventListener('click', () => {
                window.location.hash = 'admin';
            });
        }
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
        const stored = data[PIN_KEY] || '';
        const errorEl = document.getElementById('pin-error');
        sha256(pinBuffer).then(hash => {
            const match = !stored || hash === stored || pinBuffer === stored;
            if (match) {
                document.getElementById('admin-pin-overlay').classList.remove('open');
                document.getElementById('admin-pin-overlay').style.display = 'none';
                document.getElementById('admin-panel').classList.add('open');
                document.getElementById('admin-panel').style.display = 'flex';
                renderActiveSection();
                if (window.location.hash !== '#admin') {
                    history.replaceState(null, '', '#admin');
                }
            } else {
                attempts++;
                if (errorEl) errorEl.textContent = attempts >= MAX_ATTEMPTS ? 'Too many attempts. Locked.' : `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempt(s) left.`;
                pinBuffer = '';
                updateDots();
                if (attempts >= MAX_ATTEMPTS) {
                    document.querySelectorAll('#admin-pin-overlay .pin-btn').forEach(b => b.disabled = true);
                }
            }
        });
    }

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
            document.getElementById('admin-panel').classList.remove('open');
            document.getElementById('admin-panel').style.display = 'none';
            if (window.location.hash === '#admin') {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        });
    }

    function handleAdminHash(hash) {
        const overlay = document.getElementById('admin-pin-overlay');
        const panel = document.getElementById('admin-panel');
        if (hash === '#admin') {
            if (overlay) {
                overlay.classList.add('open');
                overlay.style.display = 'flex';
            }
            if (panel) {
                panel.classList.remove('open');
                panel.style.display = 'none';
            }
            pinBuffer = '';
            updateDots();
            const err = document.getElementById('pin-error');
            if (err) err.textContent = '';
        } else {
            if (overlay) {
                overlay.classList.remove('open');
                overlay.style.display = 'none';
            }
            if (panel) {
                panel.classList.remove('open');
                panel.style.display = 'none';
            }
        }
    }

    function renderActiveSection() {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(`section-${activeTab}`);
        if (!el) return;
        el.classList.add('active');
        if (activeTab === 'hero') renderHeroSection(el);
        else if (activeTab === 'about') renderAboutSection(el);
        else if (activeTab === 'projects') renderProjectsSection(el);
        else if (activeTab === 'gallery') renderGallerySection(el);
        else if (activeTab === 'contact') renderContactSection(el);
        else if (activeTab === 'settings') renderSettingsSection(el);
    }
/* FILE: portfolio/js/admin.js — PART 3 OF 4 */
    function renderHeroSection(el) {
        const h = data.hero || {};
        el.innerHTML = `
          <h3 class="admin-section-title">Hero Configuration</h3>
          <label class="admin-label">Eyebrow Notification Text</label>
          <input class="admin-input" id="a-eyebrow" value="${esc(h.eyebrow || '')}"/>
          <label class="admin-label">First Name</label>
          <input class="admin-input" id="a-firstName" value="${esc(h.firstName || '')}"/>
          <label class="admin-label">Last Name / Suffix</label>
          <input class="admin-input" id="a-lastName" value="${esc(h.lastName || '')}"/>
          <label class="admin-label">Degree Subtitle Title</label>
          <input class="admin-input" id="a-subtitle" value="${esc(h.subtitle || '')}"/>
          <label class="admin-label">Work / Location Tagline</label>
          <input class="admin-input" id="a-location" value="${esc(h.location || '')}"/>
          <label class="admin-label">Profile Image URL Path</label>
          <input class="admin-input" id="a-profileImage" value="${esc(h.profileImage || '')}"/>
          <label class="admin-label">Profile Crop Frame</label>
          <select class="admin-select" id="a-profileFrame">
            <option value="circle" ${h.profileFrame === 'circle' ? 'selected' : ''}>Circular Mask</option>
            <option value="square" ${h.profileFrame === 'square' ? 'selected' : ''}>Square Soft Border</option>
          </select>
        `;
        ['eyebrow', 'firstName', 'lastName', 'subtitle', 'location', 'profileImage', 'profileFrame'].forEach(k => {
            const inp = el.querySelector(`#a-${k}`);
            if (inp) {
                inp.addEventListener('change', e => {
                    data.hero = data.hero || {};
                    data.hero[k] = e.target.value;
                });
            }
        });
    }

    function renderAboutSection(el) {
        const a = data.about || {};
        el.innerHTML = `
          <h3 class="admin-section-title">About Layout</h3>
          <label class="admin-label">Visual Heading (Use \\n for design linebreaks)</label>
          <input class="admin-input" id="a-heading" value="${esc((a.heading||'').replace(/\n/g,'\\n'))}"/>
          <label class="admin-label">Bio Introduction Paragraph 1 (HTML allowed)</label>
          <textarea class="admin-textarea" id="a-bio1" rows="4">${esc(a.bio1||'')}</textarea>
          <label class="admin-label">Bio Details Paragraph 2 (HTML allowed)</label>
          <textarea class="admin-textarea" id="a-bio2" rows="4">${esc(a.bio2||'')}</textarea>
          <label class="admin-label">Core Competencies / Skills (One item per text line)</label>
          <textarea class="admin-textarea" id="a-skills" rows="6">${(a.skills||[]).join('\n')}</textarea>
        `;
        el.querySelector('#a-heading').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.heading = e.target.value.replace(/\\n/g, '\n');
        });
        el.querySelector('#a-bio1').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.bio1 = e.target.value;
        });
        el.querySelector('#a-bio2').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.bio2 = e.target.value;
        });
        el.querySelector('#a-skills').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.skills = e.target.value.split('\n').filter(Boolean);
        });
    }

    function renderProjectsSection(el) {
        data.projects = data.projects || [];
        let html = `<h3 class="admin-section-title">Manage Tech Portfolio Work</h3>`;
        data.projects.forEach((p, idx) => {
            html += `
            <div style="border: 1px solid rgba(255,255,255,0.1); padding:1rem; margin-bottom:1rem; position:relative;">
              <button style="position:absolute; right:1rem; top:1rem; background:#ff6b6b; border:none; color:white; padding:2px 8px; cursor:pointer;" onclick="window.__adminRemoveProj(${idx})">Delete</button>
              <label class="admin-label">Project Index ID</label>
              <input class="admin-input" value="${esc(p.num)}" onchange="window.__adminUpdateProj(${idx}, 'num', this.value)"/>
              <label class="admin-label">System Architecture Type</label>
              <input class="admin-input" value="${esc(p.type)}" onchange="window.__adminUpdateProj(${idx}, 'type', this.value)"/>
              <label class="admin-label">Operational Status Text</label>
              <input class="admin-input" value="${esc(p.status)}" onchange="window.__adminUpdateProj(${idx}, 'status', this.value)"/>
              <label class="admin-label">Highlight Finished Theme (Completed Indicator Flag)</label>
              <select class="admin-select" onchange="window.__adminUpdateProj(${idx}, 'statusDone', this.value === 'true')">
                <option value="false" ${!p.statusDone ? 'selected' : ''}>Active Work in Progress</option>
                <option value="true" ${p.statusDone ? 'selected' : ''}>Production Complete</option>
              </select>
              <label class="admin-label">Context Hint / Card Description</label>
              <input class="admin-input" value="${esc(p.hint)}" onchange="window.__adminUpdateProj(${idx}, 'hint', this.value)"/>
              <label class="admin-label">Technology Stack Matrix (Format Name:Percentage, item per line, e.g. React:85)</label>
              <textarea class="admin-textarea" rows="3" onchange="window.__adminUpdateProjStack(${idx}, this.value)">${(p.stack || []).map(s => `${s.name}:${s.pct}`).join('\n')}</textarea>
            </div>`;
        });
        html += `<button class="admin-save-btn" style="background:transparent; color:#fff; border:1px dashed #555; width:100%;" id="add-proj-btn">+ Add New Project Space</button>`;
        el.innerHTML = html;
        el.querySelector('#add-proj-btn').addEventListener('click', () => {
            data.projects.push({
                num: "00" + (data.projects.length + 1),
                status: "In Progress",
                statusDone: false,
                type: "New System",
                hint: "💡 Hint: Update details.",
                stack: []
            });
            renderProjectsSection(el);
        });
    }

    window.__adminUpdateProj = (idx, field, val) => {
        data.projects[idx][field] = val;
    };
    window.__adminUpdateProjStack = (idx, val) => {
        data.projects[idx].stack = val.split('\n').filter(Boolean).map(line => {
            const parts = line.split(':');
            return {
                name: parts[0] ? parts[0].trim() : 'Tech',
                pct: parts[1] ? parseInt(parts[1], 10) || 50 : 50
            };
        });
    };
    window.__adminRemoveProj = (idx) => {
        data.projects.splice(idx, 1);
        renderProjectsSection(document.getElementById('section-projects'));
    };
/* FILE: portfolio/js/admin.js — PART 4 OF 4 */
    function renderGallerySection(el) {
        data.gallery = data.gallery || [];
        let html = `<h3 class="admin-section-title">Visual Archive & Journey Gallery</h3>`;
        data.gallery.forEach((g, idx) => {
            html += `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; border-bottom:1px solid #222; padding-bottom:0.5rem; margin-bottom:0.5rem;"> 
              <input class="admin-input" placeholder="Category Type" value="${esc(g.category)}" onchange="window.__adminUpdateGal(${idx}, 'category', this.value)"/> 
              <input class="admin-input" placeholder="Image File Path/URL" value="${esc(g.src)}" onchange="window.__adminUpdateGal(${idx}, 'src', this.value)"/> 
              <input class="admin-input" style="grid-column: span 2;" placeholder="Captions description text..." value="${esc(g.caption)}" onchange="window.__adminUpdateGal(${idx}, 'caption', this.value)"/> 
            </div>`;
        });
        el.innerHTML = html;
    }
    window.__adminUpdateGal = (idx, field, val) => {
        data.gallery[idx][field] = val;
    };

    function renderContactSection(el) {
        const c = data.contact || {};
        el.innerHTML = `
          <h3 class="admin-section-title">Contact & Professional Anchors</h3> 
          <label class="admin-label">Public Access Communication Email</label> 
          <input class="admin-input" id="c-email" value="${esc(c.email || '')}"/> 
          <label class="admin-label">LinkedIn Profile URL</label> 
          <input class="admin-input" id="c-linkedin" value="${esc(c.linkedin || '')}"/> 
          <label class="admin-label">GitHub Account Reference Link</label> 
          <input class="admin-input" id="c-github" value="${esc(c.github || '')}"/> 
          <label class="admin-label">Cloud Resume / Portfolio Asset URL</label> 
          <input class="admin-input" id="c-resume" value="${esc(c.resume || '')}"/> 
          <label class="admin-label">Live Site QR Target URL Destination</label> 
          <input class="admin-input" id="c-qrUrl" value="${esc(c.qrUrl || '')}"/>
        `;
        ['email', 'linkedin', 'github', 'resume', 'qrUrl'].forEach(k => {
            const inp = el.querySelector(`#c-${k}`);
            if (inp) {
                inp.addEventListener('change', e => {
                    data.contact = data.contact || {};
                    data.contact[k] = e.target.value;
                });
            }
        });
    }

    function renderSettingsSection(el) {
        el.innerHTML = `
          <h3 class="admin-section-title">Security & Credentials Panel</h3> 
          <label class="admin-label">Update Pin-Pad Protection Code (4 Digits Only)</label> 
          <input class="admin-input" type="password" maxlength="4" placeholder="Enter new numerical pin" id="set-pin-input"/>
        `;
        const pinInp = el.querySelector('#set-pin-input');
        if (pinInp) {
            pinInp.addEventListener('change', e => {
                if (e.target.value.length === 4 && /^\d+$/.test(e.target.value)) {
                    sha256(e.target.value).then(hash => {
                        data[PIN_KEY] = hash;
                    });
                }
            });
        }
    }

    async function saveData() {
        const btn = document.getElementById('admin-save-btn');
        const status = document.getElementById('admin-status');
        btn.disabled = true;
        status.textContent = 'Syncing data...';
        status.className = 'admin-status';
        try {
            const res = await fetch(SAVE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.ok) {
                status.textContent = 'Data successfully committed to GitHub repository!';
                status.className = 'admin-status success';
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            } else {
                throw new Error(result.error || 'Server rejected changes');
            }
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
            status.className = 'admin-status error';
            btn.disabled = false;
        }
    }
})();
