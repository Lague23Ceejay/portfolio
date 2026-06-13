/* FILE: portfolio/js/qrcode.js */

/* ============================================================
   qrcode.js — QR code generation
   Depends on: qrcode.min.js (loaded before this file in index.html)
   ============================================================ */

function buildQR(url) {
  const el = document.getElementById('qrcode');
  el.innerHTML = '';
  new QRCode(el, {
    text:         url,
    width:        160,
    height:       160,
    colorDark:    '#0a0a0a',
    colorLight:   '#f5f5f3',
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function updateQR() {
  const val = document.getElementById('portfolio-url').value.trim();
  if (val) buildQR(val);
}

// Generate placeholder QR on page load
// Generate placeholder QR on page load (will be overridden by load-content if data provides a URL)
buildQR('https://yourportfolio.com');

// Attach Enter handler only if the input exists (admin workflows may remove it for visitors)
const _pq = document.getElementById('portfolio-url');
if (_pq) {
  _pq.addEventListener('keydown', e => { if (e.key === 'Enter') updateQR(); });
}