/* FILE: portfolio/js/load-content.js — PART 1 OF 3 (CORE INITIALIZATION) */
async function loadContent() {
  let data;
  try {
    const res = await fetch('/data.json?v=' + Date.now());
    data = await res.json();
  } catch (e) { 
    console.error('Could not load data.json:', e); 
    return; 
  }

  // Execute structural component builders
  renderHero(data.hero);
  renderAbout(data.about);
  renderProjects(data.projects);
  renderGallery(data.gallery);
  renderContact(data.contact);
  
  // Initialize presentation behaviors cleanly post-render
  if (typeof initReveal === 'function') initReveal();
  if (typeof initOverallBars === 'function') initOverallBars();

    // Add this line at the bottom of your loadContent() routine:
  initGlobalFloatingLightbox();
  initProjectExpansionLightbox(); // REGISTER PROJECT HOVER/EXPANSION ENGAGEMENT MATRICES
}

// ── Calibrated Hero Rendering Engine ──
function renderHero(hero) {
  if (!hero) return;

  // 1. Target and inject the eyebrow layout string natively
  const eyebrowEl = document.querySelector('.hero-eyebrow');
  if (eyebrowEl && hero.eyebrow !== undefined) eyebrowEl.textContent = hero.eyebrow;

  // 2. Target your exact two-line name splits row elements (Line 1 and Line 2)
  const line1El = document.querySelector('.hero-name .line-1');
  if (line1El && hero.firstName !== undefined) line1El.textContent = hero.firstName;

  const line2El = document.querySelector('.hero-name .line-2');
  if (line2El && hero.lastName !== undefined) line2El.textContent = hero.lastName;

  // 3. Target your exact structural subtitle paragraph tag name
  const titleEl = document.querySelector('.hero-title');
  if (titleEl && hero.subtitle !== undefined) titleEl.textContent = hero.subtitle;

  // 4. Target your profile photo element and fallback placeholder box layout
  const profileImgEl = document.getElementById('hero-profile-img');
  const placeholderBoxEl = document.getElementById('hero-profile-placeholder');

  if (profileImgEl && placeholderBoxEl) {
    if (hero.profileImage && hero.profileImage.trim() !== "") {
      profileImgEl.src = hero.profileImage;
      profileImgEl.style.display = 'block';
      placeholderBoxEl.style.display = 'none';
    } else {
      profileImgEl.src = "";
      profileImgEl.style.display = 'none';
      placeholderBoxEl.style.display = 'block';
    }
  }

  // 5. Dynamically handle circle vs square visual crop masks on your image components on page load
  const profileContainerNode = document.querySelector('.hero-profile img') || profileImgEl;
  const placeholderContainerNode = placeholderBoxEl;
  
  if (hero.profileFrame && hero.profileFrame === 'square') {
    if (profileContainerNode) {
      profileContainerNode.classList.remove('frame-circle');
      profileContainerNode.style.borderRadius = '12px';
    }
    if (placeholderContainerNode) {
      placeholderContainerNode.classList.remove('frame-circle');
      placeholderContainerNode.style.borderRadius = '12px';
    }
  } else {
    if (profileContainerNode) {
      profileContainerNode.classList.add('frame-circle');
      profileContainerNode.style.borderRadius = '50%';
    }
    if (placeholderContainerNode) {
      placeholderContainerNode.classList.add('frame-circle');
      placeholderContainerNode.style.borderRadius = '50%';
    }
  }
}

// ── About Section Rendering Engine ──
/* FILE: portfolio/js/load-content.js — REVISED ABOUT SECTION 3D INTERACTIVE ENGINE */
function renderAbout(a) {
  if (!a) return;
  
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) headingEl.innerHTML = (a.heading || '').replace(/\n/g, '<br>');
  
  const bioEls = document.querySelectorAll('.about-text');
  if (bioEls && bioEls[0]) bioEls[0].innerHTML = a.bio1 || '';
  if (bioEls && bioEls[1]) bioEls[1].innerHTML = a.bio2 || '';
  
  const deckContainer = document.getElementById('about-card-swap-deck');
  if (!deckContainer) return;

  const skillsList = Array.isArray(a.skills) && a.skills.length > 0 ? a.skills : [];
  deckContainer.innerHTML = '';
  if (skillsList.length === 0) return;

  // ── HIGH-FIDELITY VECTOR LOGO DICTIONARY ──
  // Translates text keyword entries into crisp inline SVG graphic items natively
  const vectorCatalog = {
    react: `<svg width="42" height="42" viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://w3.org" style="color:#61dafb;"><circle cx="0" cy="0" r="2.05" fill="currentColor"/><g stroke="currentColor" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`,
    js: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#f7df1e" xmlns="http://w3.org"><path d="M0 0h24v24H0z" fill="none"/><path d="M1.5 1.5h21v21h-21zm17.3 15.2c-.3-.7-.9-1.2-1.7-1.4-.4-.1-.9-.2-1.3-.2-.5 0-.9.1-1.2.3-.3.2-.4.4-.4.8 0 .3.1.5.3.7.3.2.7.3 1.2.4l1.1.2c1 .2 1.8.6 2.3 1.2.5.6.7 1.3.7 2.2 0 1-.3 1.8-1 2.4s-1.6.9-2.8.9c-1.2 0-2.2-.4-2.9-1.2-.7-.7-1-1.7-1-2.9h2.6c0 .7.2 1.3.6 1.6.4.3.9.5 1.6.5.6 0 1.1-.1 1.4-.4.3-.2.4-.6.4-1 0-.3-.1-.6-.3-.8s-.7-.3-1.3-.5l-1.1-.2c-1.1-.2-1.9-.6-2.4-1.2-.5-.6-.7-1.4-.7-2.3 0-1 .3-1.8 1-2.4.7-.6 1.6-.9 2.7-.9 1 0 1.9.3 2.5.8.6.6.9 1.3 1.1 2.3zm-7.6-3.7v8.9h-2.6v-1.4c-.4.5-1 1-1.6 1.3-.6.3-1.3.4-2 .4-1.1 0-2-.3-2.6-1-.6-.6-1-1.5-1-2.6V13h2.6v5c0 .6.1 1.1.4 1.3.3.3.7.4 1.2.4.5 0 .9-.1 1.2-.4.3-.3.4-.7.4-1.4V13z"/></svg>`,
    javascript: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#f7df1e" xmlns="http://w3.org"><path d="M0 0h24v24H0z" fill="none"/><path d="M1.5 1.5h21v21h-21zm17.3 15.2c-.3-.7-.9-1.2-1.7-1.4-.4-.1-.9-.2-1.3-.2-.5 0-.9.1-1.2.3-.3.2-.4.4-.4.8 0 .3.1.5.3.7.3.2.7.3 1.2.4l1.1.2c1 .2 1.8.6 2.3 1.2.5.6.7 1.3.7 2.2 0 1-.3 1.8-1 2.4s-1.6.9-2.8.9c-1.2 0-2.2-.4-2.9-1.2-.7-.7-1-1.7-1-2.9h2.6c0 .7.2 1.3.6 1.6.4.3.9.5 1.6.5.6 0 1.1-.1 1.4-.4.3-.2.4-.6.4-1 0-.3-.1-.6-.3-.8s-.7-.3-1.3-.5l-1.1-.2c-1.1-.2-1.9-.6-2.4-1.2-.5-.6-.7-1.4-.7-2.3 0-1 .3-1.8 1-2.4.7-.6 1.6-.9 2.7-.9 1 0 1.9.3 2.5.8.6.6.9 1.3 1.1 2.3zm-7.6-3.7v8.9h-2.6v-1.4c-.4.5-1 1-1.6 1.3-.6.3-1.3.4-2 .4-1.1 0-2-.3-2.6-1-.6-.6-1-1.5-1-2.6V13h2.6v5c0 .6.1 1.1.4 1.3.3.3.7.4 1.2.4.5 0 .9-.1 1.2-.4.3-.3.4-.7.4-1.4V13z"/></svg>`,
    nodejs: `<svg width="40" height="40" viewBox="0 0 24 24" fill="#3c873a" xmlns="http://w3.org"><path d="M12 2L2 7.5v11L12 22l10-5.5v-11L12 2zm-1 16.52l-5-2.77v-4.14l5 2.77v4.14zm0-5.2l-5-2.77 5-2.77 5 2.77-5 2.77zm6 2.43l-5 2.77v-4.14l5-2.77v-4.14z"/></svg>`,
    node: `<svg width="40" height="40" viewBox="0 0 24 24" fill="#3c873a" xmlns="http://w3.org"><path d="M12 2L2 7.5v11L12 22l10-5.5v-11L12 2zm-1 16.52l-5-2.77v-4.14l5 2.77v4.14zm0-5.2l-5-2.77 5-2.77 5 2.77-5 2.77zm6 2.43l-5 2.77v-4.14l5-2.77v-4.14z"/></svg>`,
    css: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#264de4" xmlns="http://w3.org"><path d="M1.5 2l1.9 17.1L12 22l8.6-2.9L22.5 2H1.5zm16.5 6.3h-7.6v2.4h7.3l-.5 4.9-3.7 1.2-3.7-1.2-.2-2.1h2.4l.1 1 1.4.4 1.4-.4.2-1.9H6.4l-.4-5.3h12.3l-.3 2.4z"/></svg>`,
    html: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#e34f26" xmlns="http://w3.org"><path d="M1.5 2l1.9 17.1L12 22l8.6-2.9L22.5 2H1.5zm17 5.2l-.3 3H7.8l.2 2.6h10.4l-.9 9-5.5 1.8-5.5-1.8-.4-3.7h2.5l.2 1.8 3.2 1 3.2-1 .4-3.7H5.1L4.3 5.2h14.2z"/></svg>`,
    vercel: `<svg width="36" height="36" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://w3.org"><path d="M12 2L2 20h20L12 2z"/></svg>`,
    github: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://w3.org"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    typescript: `<svg width="36" height="36" viewBox="0 0 24 24" fill="#3178c6" xmlns="http://w3.org"><path d="M0 0h24v24H0z" fill="none"/><path d="M1.5 1.5h21v21h-21zm15.6 11.2c0-1.8-1.5-2.4-3.4-2.8-.9-.2-1.7-.4-1.7-.9 0-.4.3-.6.9-.6.7 0 1.2.3 1.5.8l2.1-1.3c-.6-1.1-1.7-1.8-3.4-1.8-2.1 0-3.8 1.2-3.8 3.3 0 1.8 1.4 2.4 3.4 2.8.9.2 1.8.5 1.8 1 0 .5-.5.7-1.1.7-.9 0-1.6-.4-2.1-1.1l-2 1.3c.7 1.3 2.1 2.1 4 2.1 2.3 0 4.1-1.2 4.1-3.6zM6.9 7.4h6.3V5.2H4.4v2.2h2.5v11.1h2.5V7.4z"/></svg>`
  };

  const cardDistance = 60;
  const verticalDistance = 70;
  const skewAmount = 6;
  const delayInterval = 5000;
  
  const config = {
    ease: 'elastic.out(0.6, 0.9)',
    durDrop: 2, durMove: 2, durReturn: 2,
    promoteOverlap: 0.9, returnDelay: 0.05
  };

  let cardElementsArray = [];
  let orderTrackingArray = [];

  skillsList.forEach((skillLine, i) => {
    const parts = skillLine.split(':');
    const name = parts[0] ? parts[0].trim() : skillLine;
    const subtitle = parts[1] ? parts[1].trim() : 'Core Stack';
    const iconKey = parts[2] ? parts[2].trim().toLowerCase() : '';

    const vectorMarkup = vectorCatalog[iconKey] || '';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'swap-card-node';
    cardDiv.innerHTML = `
      ${vectorMarkup ? `<div class="swap-card-icon" style="margin-bottom:1rem; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${vectorMarkup}</div>` : ''}
      <p class="swap-card-title">${name}</p>
      <p class="swap-card-subtitle">${subtitle}</p>
      <span class="swap-card-hint">Click to Cycle</span>
    `;
    
    deckContainer.appendChild(cardDiv);
    cardElementsArray.push(cardDiv);
    orderTrackingArray.push(i);
  });

  const totalCards = cardElementsArray.length;
  const makeSlot = (i, total) => ({
    x: i * cardDistance, y: -i * verticalDistance, z: -i * cardDistance * 1.5, zIndex: total - i
  });

  const placeNow = (el, slot, skew) => {
    const animator = window.gsap || gsap;
    if (animator && typeof animator.set === 'function') {
      animator.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
        opacity: slot.zIndex < (totalCards - 3) ? 0 : 1
      });
    }
  };
  cardElementsArray.forEach((el, i) => { placeNow(el, makeSlot(i, totalCards), skewAmount); });

  let masterIntervalTimer;
  let activeTimeline = null;

  const runCardSwapCycle = () => {
    if (orderTrackingArray.length < 2) return;
    const [frontIndex, ...remainingIndices] = orderTrackingArray;
    const elFront = cardElementsArray[frontIndex];
    
    // SWAPPED: Using window.gsap scope directly to integrate seamlessly with the local core engine
    const tl = window.gsap.timeline();
    activeTimeline = tl;

    tl.to(elFront, { y: '+=500', opacity: 0, duration: config.durDrop, ease: config.ease });
    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    
    remainingIndices.forEach((idx, i) => {
      const el = cardElementsArray[idx];
      const slot = makeSlot(i, totalCards);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, {
        x: slot.x, y: slot.y, z: slot.z,
        opacity: slot.zIndex < (totalCards - 3) ? 0 : 1,
        duration: config.durMove, ease: config.ease
      }, `promote+=${i * 0.15}`);
    });

    const backSlot = makeSlot(totalCards - 1, totalCards);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    tl.call(() => { gsap.set(elFront, { zIndex: backSlot.zIndex }); }, null, 'return');
    tl.to(elFront, {
      x: backSlot.x, y: backSlot.y, z: backSlot.z,
      opacity: backSlot.zIndex < (totalCards - 3) ? 0 : 1,
      duration: config.durReturn, ease: config.ease
    }, 'return');

    tl.call(() => { orderTrackingArray = [...remainingIndices, frontIndex]; });
  };

  masterIntervalTimer = window.setInterval(runCardSwapCycle, delayInterval);

  deckContainer.addEventListener('mouseenter', () => { if (activeTimeline) activeTimeline.pause(); clearInterval(masterIntervalTimer); });
  deckContainer.addEventListener('mouseleave', () => { if (activeTimeline) activeTimeline.play(); masterIntervalTimer = window.setInterval(runCardSwapCycle, delayInterval); });

  deckContainer.addEventListener('click', (e) => {
    const clickedCard = e.target.closest('.swap-card-node');
    if (!clickedCard) return;
    const topCardIndex = orderTrackingArray[0];
    if (cardElementsArray[topCardIndex] === clickedCard) {
      if (activeTimeline && typeof activeTimeline.isActive === 'function' && activeTimeline.isActive()) activeTimeline.progress(1);
      runCardSwapCycle();
    }
  });
}
/* FILE: portfolio/js/load-content.js — PART 2 OF 2 */
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
            <div class="stack-bar" style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; position:relative; display:block;">
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

/* FILE: portfolio/js/load-content.js — UNIVERSAL LIGHTBOX INTERACTION MATRIX */

function initGlobalFloatingLightbox() {
  // 1. Build the dynamic native overlay template structural markup if not already present
  if (!document.getElementById('global-floating-lightbox')) {
    const overlayDiv = document.createElement('div');
    overlayDiv.id = 'global-floating-lightbox';
    overlayDiv.className = 'global-floating-overlay';
    overlayDiv.innerHTML = `
      <div class="floating-frame-inner">
        <button class="floating-frame-close" aria-label="Close view">✕</button>
        <img class="floating-asset-img" src="" alt="Expanded view"/>
        <p class="floating-frame-caption"></p>
      </div>
    `;
    document.body.appendChild(overlayDiv);

    // Close Actions Binder: Triggers when clicking outside the frame or on the "✕" button
    overlayDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('global-floating-overlay') || e.target.classList.contains('floating-frame-close')) {
        overlayDiv.classList.remove('active');
        document.body.style.overflow = ''; // Restore page scroll metrics
      }
    });
  }

  const lightbox = document.getElementById('global-floating-lightbox');
  const lightboxImg = lightbox.querySelector('.floating-asset-img');
  const lightboxCap = lightbox.querySelector('.floating-frame-caption');

  // Helper routine to open the modal cleanly
  const launchLightbox = (src, captionText) => {
    if (!src) return;
    lightboxImg.src = src;
    lightboxCap.textContent = captionText || '';
    lightboxCap.style.display = captionText ? 'block' : 'none';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Freeze background scrolling
  };

  // 2. BIND TO HERO PROFILE PICTURE CLICK
  const heroProfileNode = document.querySelector('.hero-profile');
  if (heroProfileNode) {
    heroProfileNode.addEventListener('click', () => {
      const activeImg = document.getElementById('hero-profile-img');
      // Extract the high-res binary base64 or source url stream
      if (activeImg && activeImg.src && activeImg.style.display !== 'none') {
        launchLightbox(activeImg.src, "Profile Avatar — Christian John K. Lague");
      }
    });
  }

  // 3. BIND TO GALLERY IMAGES MASONRY GRID CLICK
  const masonryContainer = document.querySelector('.masonry-grid');
  if (masonryContainer) {
    // Elegant event delegation to map dynamic asynchronous gallery cells cleanly
    masonryContainer.addEventListener('click', (e) => {
      const targetCard = e.target.closest('.masonry-item');
      if (targetCard) {
        const imgSrc = targetCard.dataset.src;
        const imgCaption = targetCard.dataset.caption;
        if (imgSrc) {
          launchLightbox(imgSrc, imgCaption);
        }
      }
    });
  }
}

// Update the primary initialization core inside loadContent() to include this pipeline
// Make sure you append "initGlobalFloatingLightbox();" inside your loadContent() function, right under initOverallBars();


/* FILE: portfolio/js/load-content.js — PROJECT DYNAMIC CARD OVERLAY CORE */

function initProjectExpansionLightbox() {
  // 1. Compile the master placeholder project modal frame structure if missing from the DOM
  if (!document.getElementById('project-floating-lightbox')) {
    const overlayDiv = document.createElement('div');
    overlayDiv.id = 'project-floating-lightbox';
    overlayDiv.className = 'project-floating-overlay';
    overlayDiv.innerHTML = `
      <div class="project-expanded-frame">
        <button class="project-expanded-close" aria-label="Close project view">✕</button>
        <div class="project-expanded-injected-content"></div>
      </div>
    `;
    document.body.appendChild(overlayDiv);

    // Click outside handler: Closes viewport instantly when hitting background blur mask layer
    overlayDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('project-floating-overlay') || e.target.classList.contains('project-expanded-close')) {
        overlayDiv.classList.remove('active');
        document.body.style.overflow = ''; // Restore site scroll tracks
      }
    });
  }

  const overlay = document.getElementById('project-floating-lightbox');
  const targetInjectedSlot = overlay.querySelector('.project-expanded-injected-content');

  // 2. Event Delegation: Catch click actions across dynamic project grid items natively
  const projectGridContainer = document.querySelector('.project-grid');
  if (projectGridContainer) {
    projectGridContainer.addEventListener('click', (e) => {
      // Find the closest parent project card node item
      const clickedCard = e.target.closest('.project-card');
      if (!clickedCard) return;

      // Extract raw element markup strings cleanly
      const clonedMarkup = clickedCard.innerHTML;
      
      // Inject clone content parameters directly inside our floating target viewport slots
      targetInjectedSlot.innerHTML = clonedMarkup;
      
      // Force trigger animations for progress fills once inside modal layouts
      const fills = targetInjectedSlot.querySelectorAll('.stack-fill');
      fills.forEach(f => {
        const widthVal = f.dataset.width || 0;
        f.style.width = '0%';
        setTimeout(() => { f.style.width = widthVal + '%'; }, 150);
      });

      // Clear layout note details inside presentation layers to optimize typography sizing ratios
      const layoutNote = targetInjectedSlot.querySelector('.project-hint');
      if (layoutNote) layoutNote.style.marginTop = '1.25rem';

      // Open the container overlay gracefully
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock homepage body scroll metrics
    });
  }
}

document.addEventListener('DOMContentLoaded', loadContent);

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'); // FIX: Corrected raw trailing quote character crash typo
}
