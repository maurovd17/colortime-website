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

function initRevealOnScroll() {
  const selectors = [
    'main > section',
    'main > h1',
    '.gallery .project',
    '.why-cards .card',
    '.services__right li',
    '.sc-item',
    '.footer-col',
    '.contact-card',
    '.contact-photo',
    '.contact-form-section',
    '.over-ons p',
    '.over-ons li'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach((element, index) => {
    if (!element.hasAttribute('data-reveal')) {
      element.setAttribute('data-reveal', '');
    }

    const isCardLike =
      element.matches('.gallery .project, .why-cards .card, .services__right li, .sc-item, .footer-col, .contact-card, .over-ons li');

    if (isCardLike) {
      element.dataset.reveal = 'zoom';
    }

    if (element.matches('.services__left, .over-ons p:nth-of-type(odd), .contact-card:first-child')) {
      element.dataset.reveal = 'left';
    }

    if (element.matches('.services__right, .contact-card:last-child, .contact-photo')) {
      element.dataset.reveal = 'right';
    }

    const group = element.parentElement;
    const siblingIndex = group ? Array.from(group.children).indexOf(element) : index;
    const staggerIndex = siblingIndex >= 0 ? siblingIndex : index;
    element.style.setProperty('--reveal-delay', `${Math.min(staggerIndex * 0.08, 0.32)}s`);
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!revealItems.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px'
  });

  revealItems.forEach((item) => observer.observe(item));
}

function initHeroParallax() {
  const hero = document.querySelector('.hero--immersive');
  const layers = document.querySelectorAll('[data-parallax]');
  if (!hero || !layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    const insideHero = event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!insideHero) return;

    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    layers.forEach((layer) => {
      const speed = Number(layer.dataset.speed || 0.1);
      const moveX = x * speed * 32;
      const moveY = y * speed * 24;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });
}

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

function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('[data-before-after]');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const range = slider.querySelector('.before-after__range');
    const after = slider.querySelector('.before-after__after');
    const handle = slider.querySelector('.before-after__handle');
    if (!range || !after || !handle) return;

    const update = () => {
      const value = `${range.value}%`;
      after.style.width = value;
      handle.style.left = value;
    };

    range.addEventListener('input', update);
    update();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveLink();
  initReviewSlider();
  initBeforeAfterSliders();
  initRevealOnScroll();
  initHeroParallax();

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
  let lbImg;
  let lbClose;
  let lbPrev;
  let lbNext;
  let lbCounter;

  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.innerHTML = `
      <button class="btn close" id="lbClose" aria-label="Sluiten">&times;</button>
      <button class="btn prev" id="lbPrev" aria-label="Vorige">&#8249;</button>
      <img id="lbImage" alt="" />
      <button class="btn next" id="lbNext" aria-label="Volgende">&#8250;</button>
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
  const getSrc = (el) => el.getAttribute('data-large') || el.getAttribute('src');

  function openAt(i) {
    idx = (i + thumbs.length) % thumbs.length;
    lbImg.src = getSrc(thumbs[idx]);
    lbImg.alt = thumbs[idx].alt || '';
    lbCounter.textContent = `${idx + 1} / ${thumbs.length}`;
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

  function next() {
    openAt(idx + 1);
  }

  function prev() {
    openAt(idx - 1);
  }

  thumbs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (event) => {
      if (event.currentTarget.closest('a')) event.preventDefault();
      openAt(i);
    });
  });

  lbClose.addEventListener('click', close);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  lb.addEventListener('click', (event) => {
    if (event.target === lb) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lb.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') prev();
  });
})();
