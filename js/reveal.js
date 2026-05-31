/* FILE: portfolio/js/reveal.js */

/* ============================================================
   reveal.js — Scroll-triggered fade-up animations +
               tech stack bar fill animations
   ============================================================ */

// ── SECTION REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── STACK BAR FILL ──
// Bars animate in when the project card scrolls into view
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stack-fill').forEach(fill => {
        const target = fill.dataset.width;
        // Small delay so it fires after the card fade-in
        setTimeout(() => { fill.style.width = target + '%'; }, 300);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.project-card').forEach(card => barObserver.observe(card));