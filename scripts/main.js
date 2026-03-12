// main.js - shared scripts for the Colortime site

function markActiveLink() {
  const current = document.body.dataset.page;
  if (!current) return;
  const link = document.querySelector(`.topnav a[data-nav="${current}"]`);
  if (link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveLink();
  initReviewSlider();

  const topbar = document.querySelector('.topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) topbar.classList.add('sticky');
      else topbar.classList.remove('sticky');
    });
  }

  const cta = document.createElement('a');
  cta.href = 'mailto:colortimevdm@gmail.com?subject=Offerte';
  cta.className = 'floating-cta';
  cta.textContent = 'Vraag offerte';
  document.body.appendChild(cta);
});


// lightbox functionality (used on homepage and works pages)
(function () {
  const thumbs = Array.from(document.querySelectorAll('.showcase .sc-item img, .gallery .project img'));
  if (!thumbs.length) return;

  let lb = document.getElementById('lightbox');
  let lbImg, lbClose, lbPrev, lbNext, lbCounter;

  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.innerHTML = `
      <button class="btn close" id="lbClose" aria-label="Sluiten">✕</button>
      <button class="btn prev"  id="lbPrev"  aria-label="Vorige">‹</button>
      <img id="lbImage" alt="" />
      <button class="btn next"  id="lbNext"  aria-label="Volgende">›</button>
      <div class="counter" id="lbCounter"></div>
    `;
    document.body.appendChild(lb);
  }

  lbImg = lb.querySelector('#lbImage');
  lbClose = lb.querySelector('#lbClose');
  lbPrev = lb.querySelector('#lbPrev');
  lbNext = lb.querySelector('#lbNext');
  lbCounter = lb.querySelector('#lbCounter');

  let idx = 0;
  const getSrc = el => el.getAttribute('data-large') || el.getAttribute('src');

  function openAt(i) {
    idx = (i + thumbs.length) % thumbs.length;
    lbImg.src = getSrc(thumbs[idx]);
    lbImg.alt = thumbs[idx].alt || '';
    lbCounter.textContent = (idx + 1) + ' / ' + thumbs.length;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  function next() { openAt(idx + 1); }
  function prev() { openAt(idx - 1); }

  thumbs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      if (e.currentTarget.closest('a')) e.preventDefault();
      openAt(i);
    });
  });

  lbClose.addEventListener('click', close);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });
})();


// review slider for homepage
function initReviewSlider() {
  const slider = document.querySelector('.review-slider');
  if (!slider) return;
  const track = slider.querySelector('.review-track');
  const cards = slider.querySelectorAll('.review-card');
  let idx = 0;
  function update() {
    track.style.transform = `translateX(-${idx * 100}%)`;
  }
  slider.querySelector('.rev-next')?.addEventListener('click', () => {
    idx = (idx + 1) % cards.length;
    update();
  });
  slider.querySelector('.rev-prev')?.addEventListener('click', () => {
    idx = (idx - 1 + cards.length) % cards.length;
    update();
  });
  setInterval(() => {
    idx = (idx + 1) % cards.length;
    update();
  }, 7000);
}