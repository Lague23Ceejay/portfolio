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
function renderAbout(a) {
  if (!a) return;
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) headingEl.innerHTML = (a.heading || '').replace(/\n/g, '<br>');
  
  const bioEls = document.querySelectorAll('.about-text');
  if (bioEls && bioEls[0]) bioEls[0].innerHTML = a.bio1 || '';
  if (bioEls && bioEls[1]) bioEls[1].innerHTML = a.bio2 || '';
  
  const grid = document.querySelector('.skills-grid');
  if (grid && Array.isArray(a.skills)) {
    grid.innerHTML = a.skills.map(s => `<div class="skill-tag">${s}</div>`).join('');
  }
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
