/* FILE: portfolio/js/gallery.js */

/* ============================================================
   gallery.js — Filter tabs + lightbox for the Gallery section
   ============================================================ */

// ── FILTER TABS ──
const filterBtns = document.querySelectorAll('.filter-btn');
const masonryItems = document.querySelectorAll('.masonry-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    masonryItems.forEach(item => {
      const tag = item.dataset.category;
      if (filter === 'all' || tag === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ── LIGHTBOX ──
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxTag     = document.getElementById('lightbox-tag');
const lightboxClose   = document.getElementById('lightbox-close');

masonryItems.forEach(item => {
  item.addEventListener('click', () => {
    const src     = item.dataset.src;
    const caption = item.dataset.caption;
    const tag     = item.dataset.category;

    // Show image if src is provided, otherwise show placeholder text
    if (src) {
      lightboxImg.src = src;
      lightboxImg.style.display = 'block';
      lightboxImg.nextElementSibling.style.display = 'none';
    } else {
      lightboxImg.style.display = 'none';
      lightboxImg.nextElementSibling.style.display = 'flex';
    }

    lightboxCaption.textContent = caption || '';
    lightboxTag.textContent     = tag     || '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// Close on X button
lightboxClose.addEventListener('click', closeLightbox);

// Close on backdrop click
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}