/* FILE: portfolio/js/nav.js */

/* ============================================================
   nav.js — Hamburger menu toggle (mobile)
   ============================================================ */

const toggle   = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close drawer when any nav link is tapped
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});