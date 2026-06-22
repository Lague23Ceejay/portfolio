/* FILE: portfolio/js/admin.js — ADMIN DASHBOARD ENGINE */
/* FILE: portfolio/js/admin.js — PART 1 OF 5 (AUTHENTICATION + SECTION RENDERING) */
(function() {
    'use strict';

    const PIN_KEY = '_pin';
    const SAVE_URL = '/api/save-content';
    const MAX_ATTEMPTS = 5;

    let data = {};
    let pinBuffer = '';
    let attempts = 0;
    let activeTab = 'hero';


    // ── Browser-native SHA-256 helper for PIN hashing ──
    async function sha256(message) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ── HTML escape helper to protect dashboard markup from injected text ──
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'); // FIX: Safely handles single-quote syntax escaping
    }

    // ── Auto-expand textarea height for a better editor experience ──
    function autoResizeTextarea(el) {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
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
        if (saveBtn) saveBtn.addEventListener('click', () => saveData());
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

        if (activeTab === 'contact' && typeof window.__adminRefreshQRMatrix === 'function') {
            window.__adminRefreshQRMatrix();
        }
    }

/* FILE: portfolio/js/admin.js — PART 2 OF 3 (WORKSPACE LAYOUT MODULES) */
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
          
          <label class="admin-label">Bio Introduction Paragraph 1 (Rich Text Editor)</label>
          <div class="rte-toolbar" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <button class="rte-btn" type="button" data-cmd="bold" style="font-weight:bold; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">B</button>
            <button class="rte-btn" type="button" data-cmd="italic" style="font-style:italic; background:#222; border:1px solid #444; color:#fff; padding:2px 12px; cursor:pointer;">I</button>
            <button class="rte-btn" type="button" data-cmd="underline" style="text-decoration:underline; background:#222; border:1px solid #444; color:#fff; padding:2px 12px; cursor:pointer;">U</button>
          </div>
          <div class="admin-textarea" id="a-bio1-editor" contenteditable="true" style="min-height:100px; height:auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.65rem 0.85rem; margin-bottom:1rem; outline:none; transition:border-color 0.2s; word-break:break-word;">${a.bio1 || ''}</div>
          
          <label class="admin-label">Bio Details Paragraph 2 (Rich Text Editor)</label>
          <div class="rte-toolbar" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <button class="rte-btn" type="button" data-cmd="bold" style="font-weight:bold; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">B</button>
            <button class="rte-btn" type="button" data-cmd="italic" style="font-style:italic; background:#222; border:1px solid #444; color:#fff; padding:2px 12px; cursor:pointer;">I</button>
            <button class="rte-btn" type="button" data-cmd="underline" style="text-decoration:underline; background:#222; border:1px solid #444; color:#fff; padding:2px 12px; cursor:pointer;">U</button>
          </div>
          <div class="admin-textarea" id="a-bio2-editor" contenteditable="true" style="min-height:100px; height:auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.65rem 0.85rem; margin-bottom:1rem; outline:none; transition:border-color 0.2s; word-break:break-word;">${a.bio2 || ''}</div>
          
          <label class="admin-label">Core Competencies / Skills (Auto-expands as you type, one per line)</label>
          <textarea class="admin-textarea" id="a-skills" rows="3" style="overflow:hidden; resize:none; transition:height 0.1s ease-out; display:block;">${(a.skills||[]).join('\n')}</textarea>
        `;

        // FIX: Re-nested inner logic modules safely inside function boundary wrappers
        function toggleStyleCommand(cmd) {
            document.execCommand(cmd, false, null);
        }

        function handleRTEKeydown(e) {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                const key = e.key.toLowerCase();
                if (key === 'b') { e.preventDefault(); toggleStyleCommand('bold'); }
                if (key === 'i') { e.preventDefault(); toggleStyleCommand('italic'); }
                if (key === 'u') { e.preventDefault(); toggleStyleCommand('underline'); }
            }
        }

        el.querySelectorAll('.rte-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleStyleCommand(btn.dataset.cmd);
            });
        });

        const b1 = el.querySelector('#a-bio1-editor');
        if (b1) {
            b1.addEventListener('keydown', handleRTEKeydown);
            b1.addEventListener('input', () => { data.about = data.about || {}; data.about.bio1 = b1.innerHTML; });
            b1.addEventListener('focus', () => b1.style.borderColor = 'var(--accent)');
            b1.addEventListener('blur', () => b1.style.borderColor = 'rgba(255,255,255,0.1)');
        }

        const b2 = el.querySelector('#a-bio2-editor');
        if (b2) {
            b2.addEventListener('keydown', handleRTEKeydown);
            b2.addEventListener('input', () => { data.about = data.about || {}; data.about.bio2 = b2.innerHTML; });
            b2.addEventListener('focus', () => b2.style.borderColor = 'var(--accent)');
            b2.addEventListener('blur', () => b2.style.borderColor = 'rgba(255,255,255,0.1)');
        }

        el.querySelector('#a-heading').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.heading = e.target.value.replace(/\\n/g, '\n');
        });

        const skillsTextarea = el.querySelector('#a-skills');
        if (skillsTextarea) {
            setTimeout(() => { autoResizeTextarea(skillsTextarea); }, 50);
            skillsTextarea.addEventListener('focus', () => autoResizeTextarea(skillsTextarea));
            skillsTextarea.addEventListener('input', () => autoResizeTextarea(skillsTextarea));
            skillsTextarea.addEventListener('change', e => {
                data.about = data.about || {};
                data.about.skills = e.target.value.split('\n').filter(Boolean);
            });
        }
    }

/* FILE: portfolio/js/admin.js — PART 3a OF 5 */
    function renderHeroSection(el) {
        const h = data.hero || {};
        const frame = h.profileFrame || 'circle';
        
        // Setup structural mask previews to reflect crop parameters on the fly
        const borderRadiusStyle = frame === 'circle' ? 'border-radius: 50%;' : 'border-radius: 8px;';

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
          
          <!-- DYNAMIC HERO AVATAR FILE PICKER MODULE -->
          <label class="admin-label">Profile Image Asset (Click below to Upload Image)</label>
          <div style="display:flex; gap:1.25rem; align-items:center; margin-bottom:1rem; background:rgba(255,255,255,0.02); padding:1rem; border:1px solid rgba(255,255,255,0.05);">
            <input type="file" accept="image/*" style="display:none;" id="hero-file-picker" onchange="window.__adminProcessHeroAvatarUpload(this)"/>
            <button class="admin-close-btn" type="button" style="margin:0;" onclick="document.getElementById('hero-file-picker').click()">📁 Choose Profile Photo</button>
            
            <div id="hero-avatar-preview-frame" style="width:65px; height:65px; background:#111; border:1px solid #333; overflow:hidden; display:flex; align-items:center; justify-content:center; ${borderRadiusStyle}">
              ${h.profileImage ? `<img src="${h.profileImage}" style="width:100%; height:100%; object-fit:cover;"/>` : `<span style="font-size:0.55rem; color:#555; text-align:center;">No Image</span>`}
            </div>
          </div>

          <label class="admin-label">Profile Crop Frame</label>
          <select class="admin-select" id="a-profileFrame">
            <option value="circle" ${h.profileFrame === 'circle' ? 'selected' : ''}>Circular Mask</option>
            <option value="square" ${h.profileFrame === 'square' ? 'selected' : ''}>Square Soft Border</option>
          </select>
        `;

        // Native client side binary data encoder callback mapping stream
        window.__adminProcessHeroAvatarUpload = (inputEl) => {
            const file = inputEl.files[0];
            if (!file) return;

            const reader = new FileReader();
            const previewBox = document.getElementById('hero-avatar-preview-frame');
            if (previewBox) previewBox.innerHTML = `<span style="font-size:0.5rem; color:var(--accent);">Reading...</span>`;

            reader.onload = function(event) {
                const base64DataUrl = event.target.result;
                data.hero = data.hero || {};
                data.hero.profileImage = base64DataUrl; // Store string directly to state matrix
                if (previewBox) {
                    previewBox.innerHTML = `<img src="${base64DataUrl}" style="width:100%; height:100%; object-fit:cover;"/>`;
                }
            };
            reader.readAsDataURL(file);
        };

        ['eyebrow', 'firstName', 'lastName', 'subtitle', 'location', 'profileFrame'].forEach(k => {
            const inp = el.querySelector(`#a-${k}`);
            if (inp) {
                inp.addEventListener('change', e => {
                    data.hero = data.hero || {};
                    data.hero[k] = e.target.value;
                    
                    // Live check: immediately transform frame preview shape shapes on option change
                    if (k === 'profileFrame') {
                        const previewBox = document.getElementById('hero-avatar-preview-frame');
                        if (previewBox) {
                            previewBox.style.borderRadius = e.target.value === 'circle' ? '50%' : '8px';
                        }
                    }
                });
            }
        });
    }
/* FILE: portfolio/js/admin.js — PART 3b OF 5 */
    function renderAboutSection(el) {
        const a = data.about || {};
        el.innerHTML = `
          <h3 class="admin-section-title">About Layout</h3>
          <label class="admin-label">Visual Heading (Use \\n for design linebreaks)</label>
          <input class="admin-input" id="a-heading" value="${esc((a.heading||'').replace(/\n/g,'\\n'))}"/>
          
          <label class="admin-label">Bio Introduction Paragraph 1 (Rich Text Editor)</label>
          <div class="rte-toolbar" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <button class="rte-btn" type="button" data-cmd="bold" style="font-weight:bold; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">B</button>
            <button class="rte-btn" type="button" data-cmd="italic" style="font-style:italic; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">I</button>
            <button class="rte-btn" type="button" data-cmd="underline" style="text-decoration:underline; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">U</button>
          </div>
          <div class="admin-textarea" id="a-bio1-editor" contenteditable="true" style="min-height:100px; height:auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.65rem 0.85rem; margin-bottom:1rem; outline:none; transition:border-color 0.2s; word-break:break-word;">${a.bio1 || ''}</div>
          
          <label class="admin-label">Bio Details Paragraph 2 (Rich Text Editor)</label>
          <div class="rte-toolbar" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <button class="rte-btn" type="button" data-cmd="bold" style="font-weight:bold; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">B</button>
            <button class="rte-btn" type="button" data-cmd="italic" style="font-style:italic; background:#222; border:1px solid #444; color:#fff; padding:2px 12px; cursor:pointer;">I</button>
            <button class="rte-btn" type="button" data-cmd="underline" style="text-decoration:underline; background:#222; border:1px solid #444; color:#fff; padding:4px 12px; cursor:pointer;">U</button>
          </div>
          <div class="admin-textarea" id="a-bio2-editor" contenteditable="true" style="min-height:100px; height:auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.65rem 0.85rem; margin-bottom:1rem; outline:none; transition:border-color 0.2s; word-break:break-word;">${a.bio2 || ''}</div>
          
          <label class="admin-label">Core Competencies / Skills (One per line)</label>
          <textarea class="admin-textarea" id="a-skills" rows="3" style="display:block;">${(a.skills||[]).join('\n')}</textarea>
        `;

        function toggleStyleCommand(cmd) {
            document.execCommand(cmd, false, null);
        }

        function handleRTEKeydown(e) {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                const key = e.key.toLowerCase();
                if (key === 'b') { e.preventDefault(); toggleStyleCommand('bold'); }
                if (key === 'i') { e.preventDefault(); toggleStyleCommand('italic'); }
                if (key === 'u') { e.preventDefault(); toggleStyleCommand('underline'); }
            }
        }

        el.querySelectorAll('.rte-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleStyleCommand(btn.dataset.cmd);
            });
        });

        const b1 = el.querySelector('#a-bio1-editor');
        if (b1) {
            b1.addEventListener('keydown', handleRTEKeydown);
            b1.addEventListener('input', () => { data.about = data.about || {}; data.about.bio1 = b1.innerHTML; });
            b1.addEventListener('focus', () => b1.style.borderColor = 'var(--accent)');
            b1.addEventListener('blur', () => b1.style.borderColor = 'rgba(255,255,255,0.1)');
        }

        const b2 = el.querySelector('#a-bio2-editor');
        if (b2) {
            b2.addEventListener('keydown', handleRTEKeydown);
            b2.addEventListener('input', () => { data.about = data.about || {}; data.about.bio2 = b2.innerHTML; });
            b2.addEventListener('focus', () => b2.style.borderColor = 'var(--accent)');
            b2.addEventListener('blur', () => b2.style.borderColor = 'rgba(255,255,255,0.1)');
        }

        el.querySelector('#a-heading').addEventListener('input', e => {
            data.about = data.about || {};
            data.about.heading = e.target.value.replace(/\\n/g, '\n');
        });

        const skillsTextarea = el.querySelector('#a-skills');
        if (skillsTextarea) {
            skillsTextarea.addEventListener('change', e => {
                data.about = data.about || {};
                data.about.skills = e.target.value.split('\n').filter(Boolean);
            });
        }
    }
/* FILE: portfolio/js/admin.js — REVISED PART 4a OF 5 (MULTI-COLOR SEGMENT ENGINE) */
    function renderProjectsSection(el) {
        data.projects = data.projects || [];
        let html = `<h3 class="admin-section-title">Manage Tech Portfolio Work</h3>`;
        
        // Consistent, high-fidelity technical brand color palette arrays
        const colorPalette = ['#61dafb', '#41b883', '#3c873a', '#3178c6', '#f5820b', '#007acc', '#f1e05a', '#663399'];

        data.projects.forEach((p, projIdx) => {
            const stacks = Array.isArray(p.stack) ? p.stack : [];
            
            // Calculate total aggregate weight units to calibrate segment widths
            const totalWeight = stacks.reduce((sum, s) => sum + (parseInt(s.pct, 10) || 0), 0);
            const overallPct = stacks.length > 0 ? Math.round(totalWeight / stacks.length) : 0;

            html += `
            <div style="border: 1px solid rgba(255,255,255,0.1); padding:1.25rem; margin-bottom:1.5rem; position:relative; background:rgba(0,0,0,0.15);">
              <button style="position:absolute; right:1rem; top:1rem; background:#ff6b6b; border:none; color:white; padding:4px 10px; cursor:pointer; font-size:0.75rem; border-radius:2px;" onclick="window.__adminRemoveProj(${projIdx})">Delete Project</button>
              
              <label class="admin-label">Project Index ID</label>
              <input class="admin-input" value="${esc(p.num)}" onchange="window.__adminUpdateProj(${projIdx}, 'num', this.value)"/>
              
              <label class="admin-label">System Architecture Type</label>
              <input class="admin-input" value="${esc(p.type)}" onchange="window.__adminUpdateProj(${projIdx}, 'type', this.value)"/>
              
              <label class="admin-label">Operational Status Text</label>
              <input class="admin-input" value="${esc(p.status)}" onchange="window.__adminUpdateProj(${projIdx}, 'status', this.value)"/>
              
              <label class="admin-label">Highlight Finished Theme</label>
              <select class="admin-select" onchange="window.__adminUpdateProj(${projIdx}, 'statusDone', this.value === 'true')">
                <option value="false" ${!p.statusDone ? 'selected' : ''}>Active Work in Progress</option>
                <option value="true" ${p.statusDone ? 'selected' : ''}>Production Complete</option>
              </select>
              
              <label class="admin-label">Context Hint / Card Description</label>
              <input class="admin-input" value="${esc(p.hint)}" onchange="window.__adminUpdateProj(${projIdx}, 'hint', this.value)"/>
              
              <!-- DYNAMIC MULTI-COLOR STACKED REALTIME PROGRESS BAR -->
              <div style="margin-top:1.5rem; background:rgba(255,255,255,0.02); padding:1rem; border:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <span class="admin-label" style="margin:0; font-weight:600; color:var(--white);">Dynamic Tech Stack Distribution</span>
                  <span id="proj-${projIdx}-overall-pct" style="font-family:monospace; font-weight:bold; color:var(--accent); font-size:1.1rem;">${overallPct}%</span>
                </div>
                
                <!-- Master flex track container holds segmented slices -->
                <div id="proj-${projIdx}-master-track" style="width:100%; height:12px; background:rgba(255,255,255,0.08); border-radius:6px; display:flex; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.3);">
                  ${stacks.map((s, stackIdx) => {
                      const segmentColor = colorPalette[stackIdx % colorPalette.length];
                      const sliceWidth = totalWeight > 0 ? ((s.pct || 0) / totalWeight) * 100 : 0;
                      return `<div id="p-${projIdx}-slice-${stackIdx}" style="width:${sliceWidth}%; height:100%; background:${segmentColor}; transition:width 0.1s ease-out;"></div>`;
                  }).join('')}
                </div>
              </div>

              <!-- FIELD INPUTS AND SLIDERS -->
              <label class="admin-label" style="margin-top:1.5rem; display:block; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.25rem;">Technology Stack Progress Matrix</label>
              <div id="project-${projIdx}-stack-container" style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.75rem;">
                ${stacks.map((s, stackIdx) => {
                    const assignedColor = colorPalette[stackIdx % colorPalette.length];
                    return `
                    <div class="stack-row-item" data-proj="${projIdx}" style="display:flex; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.01); padding:0.5rem; border:1px solid rgba(255,255,255,0.04); border-left:4px solid ${assignedColor};">
                      <input class="admin-input" type="text" placeholder="Tech Name" value="${esc(s.name)}" style="margin-bottom:0; flex:1;" onchange="window.__adminUpdateSliderItem(${projIdx}, ${stackIdx}, 'name', this.value)"/>
                      
                      <div style="flex:2; display:flex; align-items:center; gap:0.5rem;">
                        <input class="admin-stack-slider" type="range" min="1" max="100" data-proj="${projIdx}" data-stack="${stackIdx}" value="${s.pct || 50}" style="flex:1; cursor:pointer; accent-color:${assignedColor};" oninput="window.__adminRecalculateRealtimeSlices(this, ${projIdx}, ${stackIdx})"/>
                        <span id="p-${projIdx}-s-${stackIdx}-val" style="font-family:monospace; font-size:0.8rem; min-width:40px; text-align:right; color:${assignedColor}; font-weight:bold;">${s.pct || 50}%</span>
                      </div>
                      
                      <button type="button" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; padding:4px; font-weight:bold;" onclick="window.__adminRemoveSliderItem(${projIdx}, ${stackIdx})">✕</button>
                    </div>`;
                }).join('')}
              </div>
              <button class="admin-close-btn" type="button" style="margin-top:0.75rem; width:auto; font-size:0.75rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);" onclick="window.__adminAddSliderItem(${projIdx})">+ Add Technology Item</button>
            </div>`;
        });
        
        html += `<button class="admin-save-btn" style="background:transparent; color:#fff; border:1px dashed #555; width:100%; margin-top:0.5rem;" id="add-proj-btn">+ Add New Project Space</button>`;
        el.innerHTML = html;
        
        el.querySelector('#add-proj-btn').addEventListener('click', () => {
            data.projects.push({ num: "00" + (data.projects.length + 1), status: "In Progress", statusDone: false, type: "New System", hint: "💡 Hint: Update details.", stack: [] });
            renderProjectsSection(el);
        });
    }

    // ── Realtime Fluid Segment Width Recalculator ──
    window.__adminRecalculateRealtimeSlices = (sliderEl, projIdx, stackIdx) => {
        const val = parseInt(sliderEl.value, 10) || 1;
        
        // 1. Instantly update numerical labels on active lines
        const rowValIndicator = document.getElementById(`p-${projIdx}-s-${stackIdx}-val`);
        if (rowValIndicator) rowValIndicator.textContent = val + '%';
        
        // 2. Commit states locally 
        if (data.projects[projIdx] && data.projects[projIdx].stack[stackIdx]) {
            data.projects[projIdx].stack[stackIdx].pct = val;
        }

        // 3. Scan all siblings in the container to aggregate total weights
        const cardSection = sliderEl.closest('div[style*="position:relative"]');
        if (cardSection) {
            const allSliders = cardSection.querySelectorAll('.admin-stack-slider');
            
            let totalWeight = 0;
            allSliders.forEach(s => totalWeight += (parseInt(s.value, 10) || 1));
            
            const overallAverage = allSliders.length > 0 ? Math.round(totalWeight / allSliders.length) : 0;
            
            // 4. Update the aggregate display badge percentage number text
            const averageBadge = document.getElementById(`proj-${projIdx}-overall-pct`);
            if (averageBadge) averageBadge.textContent = overallAverage + '%';

            // 5. Shift widths smoothly across slices in the bar segment layout tracks
            allSliders.forEach(s => {
                const sIdx = s.dataset.stack;
                const currentVal = parseInt(s.value, 10) || 1;
                const sliceDiv = document.getElementById(`p-${projIdx}-slice-${sIdx}`);
                if (sliceDiv) {
                    const recalculatedWidth = (currentVal / totalWeight) * 100;
                    sliceDiv.style.width = recalculatedWidth + '%';
                }
            });
        }
    };
    window.__adminUpdateSliderItem = (projIdx, stackIdx, field, val) => {
        if (data.projects[projIdx] && data.projects[projIdx].stack[stackIdx]) {
            data.projects[projIdx].stack[stackIdx][field] = val;
        }
    };

    window.__adminAddSliderItem = (projIdx) => {
        if (data.projects[projIdx]) {
            data.projects[projIdx].stack = data.projects[projIdx].stack || [];
            data.projects[projIdx].stack.push({ name: "New Tech", pct: 50 });
            
            // Targets your correct feature container viewport ID to trigger instantaneous redraw loops
            const targetPane = document.getElementById('section-projects');
            if (targetPane) {
                renderProjectsSection(targetPane);
            }
        }
    };

    window.__adminRemoveSliderItem = (projIdx, stackIdx) => {
        if (data.projects[projIdx] && data.projects[projIdx].stack) {
            data.projects[projIdx].stack.splice(stackIdx, 1);
            
            // Targets your correct feature container viewport ID to trigger instantaneous redraw loops
            const targetPane = document.getElementById('section-projects');
            if (targetPane) {
                renderProjectsSection(targetPane);
            }
        }
    };
/* FILE: portfolio/js/admin.js — PART 4b OF 5 */
    function renderGallerySection(el) {
        data.gallery = data.gallery || [];
        const currentCategories = Array.from(new Set(data.gallery.map(g => g.category).filter(Boolean)));
        if (currentCategories.length === 0) { currentCategories.push("Org Life", "Thesis", "Events", "Academics", "Friends"); }

        let html = `
          <h3 class="admin-section-title">Visual Archive & Journey Gallery</h3>
          <div style="background:rgba(255,255,255,0.02); padding:1rem; border:1px solid #222; margin-bottom:1.5rem;">
            <label class="admin-label" style="margin-top:0;">Manage Filter Categories Matrix</label>
            <div id="category-badge-list" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
              ${currentCategories.map(cat => `
                <span style="background:#222; padding:4px 10px; font-size:0.75rem; border:1px solid #444; display:inline-flex; align-items:center; gap:0.5rem;">
                  ${esc(cat)}
                  <b style="color:#ff6b6b; cursor:pointer;" onclick="window.__adminPurgeCategory('${esc(cat)}')">✕</b>
                </span>
              `).join('')}
            </div>
            <div style="display:flex; gap:0.5rem;">
              <input class="admin-input" type="text" id="new-category-input" placeholder="Create new filter tag..." style="margin-bottom:0;"/>
              <button class="admin-save-btn" type="button" id="add-category-btn" style="white-space:nowrap;">Add Tag</button>
            </div>
          </div>
          <label class="admin-label">Image Grid Items Vault</label>
        `;

        data.gallery.forEach((g, idx) => {
            html += `
            <div style="border: 1px solid #222; background:rgba(0,0,0,0.2); padding:1rem; margin-bottom:1rem; display:grid; grid-template-columns: 1fr; gap:0.5rem; position:relative;">
              <button style="position:absolute; right:1rem; top:1rem; background:#ff6b6b; border:none; color:white; padding:2px 8px; cursor:pointer; z-index:5;" onclick="window.__adminRemoveGal(${idx})">Remove Photo</button>
              <label class="admin-label">Category Alignment</label>
              <select class="admin-select" style="margin-bottom:0.25rem;" onchange="window.__adminUpdateGal(${idx}, 'category', this.value)">
                ${currentCategories.map(cat => `<option value="${esc(cat)}" ${g.category === cat ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
              </select>
              <label class="admin-label">Visual Asset File (Click below to Upload Image)</label>
              <div style="display:flex; gap:1rem; align-items:center;">
                <input type="file" accept="image/*" style="display:none;" id="file-uploader-${idx}" onchange="window.__adminProcessPhotoUpload(${idx}, this)"/>
                <button class="admin-close-btn" type="button" style="margin:0;" onclick="document.getElementById('file-uploader-${idx}').click()">📁 Choose Image File</button>
                <div id="preview-frame-${idx}" style="width:50px; height:50px; background:#111; border:1px solid #333; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                  ${g.src ? `<img src="${g.src}" style="width:100%; height:100%; object-fit:cover;"/>` : `<span style="font-size:0.5rem; color:#444;">No file</span>`}
                </div>
              </div>
              <label class="admin-label">Captions Description Text</label>
              <input class="admin-input" style="margin-bottom:0;" placeholder="Enter narrative descriptions..." value="${esc(g.caption)}" onchange="window.__adminUpdateGal(${idx}, 'caption', this.value)"/>
            </div>`;
        });

        html += `<button class="admin-save-btn" style="background:transparent; color:#fff; border:1px dashed #555; width:100%; margin-top:0.5rem;" id="add-photo-btn">+ Add New Photo Card Space</button>`;
        el.innerHTML = html;

        el.querySelector('#add-category-btn').addEventListener('click', () => {
            const inp = el.querySelector('#new-category-input');
            const val = inp.value.trim();
            if (val) {
                data.gallery.push({ category: val, caption: "", src: "" });
                renderGallerySection(el);
            }
        });

        el.querySelector('#add-photo-btn').addEventListener('click', () => {
            const fallbackCat = currentCategories || "Org Life";
            data.gallery.push({ category: fallbackCat, caption: "", src: "" });
            renderGallerySection(el);
        });
    }

    window.__adminUpdateGal = (idx, field, val) => { data.gallery[idx][field] = val; };
    window.__adminRemoveGal = (idx) => { data.gallery.splice(idx, 1); renderGallerySection(document.getElementById('section-gallery')); };
    window.__adminPurgeCategory = (categoryName) => {
        data.gallery = data.gallery.filter(g => g.category !== categoryName);
        renderGallerySection(document.getElementById('section-gallery'));
    };

    window.__adminProcessPhotoUpload = (idx, inputElement) => {
        const file = inputElement.files;
        if (!file) return;
        const reader = new FileReader();
        const previewFrame = document.getElementById(`preview-frame-${idx}`);
        if (previewFrame) previewFrame.innerHTML = `<span style="font-size:0.5rem; color:var(--accent);">Reading...</span>`;
        reader.onload = function(event) {
            const base64DataUrl = event.target.result;
            data.gallery[idx].src = base64DataUrl;
            if (previewFrame) {
                previewFrame.innerHTML = `<img src="${base64DataUrl}" style="width:100%; height:100%; object-fit:cover;"/>`;
            }
        };
        reader.readAsDataURL(file);
    };
/* FILE: portfolio/js/admin.js — PART 4c OF 5 (STABLE SYSTEM PAINTER) */
    function renderContactSection(el) {
        const c = data.contact || {};
        const liveTargetUrl = c.qrUrl || window.location.origin;

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
          <input class="admin-input" id="c-qrUrl" value="${esc(liveTargetUrl)}"/>
          
          <div style="margin-top:2rem; padding:1.5rem; border:1px dashed rgba(255,255,255,0.15); background:rgba(255,255,255,0.01); display:flex; flex-direction:column; align-items:center; gap:1.25rem;">
             <p class="admin-label" style="margin:0; width:100%; text-align:left;">Marketing Tool: Download Shareable Portfolio QR Code</p>
             <div id="admin-qr-preview" style="padding:1.5rem; background:#ffffff; border-radius:4px; display:inline-block; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
                <canvas id="native-qr-canvas" width="260" height="260" style="display:block; width:260px; height:260px;"></canvas>
             </div>
             <button class="admin-save-btn" type="button" id="admin-download-qr-btn" style="width:100%; margin:0;">📥 Download High-Res QR Code PNG</button>
          </div>
        `;

        window.__adminRefreshQRMatrix = () => {
            const canvas = document.getElementById('native-qr-canvas');
            const urlInput = document.getElementById('c-qrUrl');
            if (!canvas || typeof QRCodeLib === 'undefined') return;

            const ctx = canvas.getContext('2d');
            const textToEncode = urlInput ? urlInput.value.trim() : liveTargetUrl;

            // Generate verified industry-compliant data streams natively from local code bounds
            var qrEngine = new QRCodeLib.QRCode(3, 1); // Version 3 handles urls cleanly
            qrEngine.addData(textToEncode);
            qrEngine.make();

            // Clear space and paint background white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const count = qrEngine.getModuleCount();
            const scale = Math.floor((canvas.width - 20) / count);
            const offset = Math.floor((canvas.width - (count * scale)) / 2);

            // Paint mathematically valid patterns onto the screen
            ctx.fillStyle = '#000000';
            for (var r = 0; r < count; r++) {
                for (var c = 0; c < count; c++) {
                    if (qrEngine.isDark(r, c)) {
                        ctx.fillRect(offset + (c * scale), offset + (r * scale), scale, scale);
                    }
                }
            }
        };

        const downloadBtn = el.querySelector('#admin-download-qr-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const canvas = document.getElementById('native-qr-canvas');
                if (!canvas) { alert('Canvas rendering target not initialized.'); return; }
                
                const dataUrlStream = canvas.toDataURL('image/png');
                const proxyLinkAnchor = document.createElement('a');
                proxyLinkAnchor.href = dataUrlStream;
                proxyLinkAnchor.download = `portfolio-marketing-qr.png`;
                document.body.appendChild(proxyLinkAnchor);
                proxyLinkAnchor.click();
                document.body.removeChild(proxyLinkAnchor);
            });
        }

        ['email', 'linkedin', 'github', 'resume', 'qrUrl'].forEach(k => {
            const inp = el.querySelector(`#c-${k}`);
            if (inp) {
                inp.addEventListener('change', e => {
                    data.contact = data.contact || {};
                    data.contact[k] = e.target.value;
                    if (k === 'qrUrl' && typeof window.__adminRefreshQRMatrix === 'function') {
                        window.__adminRefreshQRMatrix();
                    }
                });
            }
        });
    }
/* FILE: portfolio/js/admin.js — PART 5 OF 5 */
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.ok) {
                status.textContent = 'Data successfully committed to GitHub repository!';
                status.className = 'admin-status success';
                setTimeout(() => { window.location.reload(); }, 1200);
            } else {
                throw new Error(result.error || 'Server rejected changes');
            }
        } catch (err) {
            status.textContent = 'Error: ' + err.message;
            status.className = 'admin-status error';
            btn.disabled = false;
        }
    }

    window.__adminUpdateProj = (idx, field, val) => { data.projects[idx][field] = val; };

    window.__adminRemoveProj = (idx) => {
        data.projects.splice(idx, 1);
        renderProjectsSection(document.getElementById('section-projects'));
    };
})();
