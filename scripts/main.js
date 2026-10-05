// main.js - shared scripts for the Colortime site

// Basic consent mode: no Google script or request until analytics is accepted.
(function () {
  const measurementId = 'G-88DDP4S0WZ';
  const consentKey = 'colortime.analytics-consent.v1';
  let analyticsStarted = false;

  function readConsent() {
    try {
      return localStorage.getItem(consentKey);
    } catch (_) {
      return null;
    }
  }

  function loadAnalytics() {
    if (analyticsStarted || document.getElementById('colortime-ga4')) return;
    analyticsStarted = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.id = 'colortime-ga4';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function stopAnalytics() {
    window['ga-disable-' + measurementId] = true;
    // Remove GA cookies at host and parent-domain scope when consent is withdrawn.
    const domains = location.hostname.split('.');
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) return;
      const expired = name + '=; Max-Age=0; path=/';
      document.cookie = expired;
      for (let i = 0; i < domains.length - 1; i++) {
        document.cookie = expired + '; domain=' + domains.slice(i).join('.');
      }
    });
  }

  function initCookieConsent() {
    if (document.getElementById('cookie-banner')) return;
    const banner = document.createElement('section');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.innerHTML = `
      <div class="cookie-banner__text">
        <h2 id="cookie-banner-title">Uw cookievoorkeuren</h2>
        <p>Met uw toestemming gebruiken we Google Analytics om het gebruik van onze website te meten. Hiervoor worden analytische cookies geplaatst en gegevens met Google gedeeld. U kunt weigeren en de website gewoon gebruiken. Uw keuze wordt op dit apparaat bewaard en kan via Cookievoorkeuren worden gewijzigd.</p>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" data-consent="denied">Weigeren</button>
        <button type="button" data-consent="accepted">Accepteren</button>
      </div>
    `;
    const preferences = document.createElement('button');
    preferences.type = 'button';
    preferences.className = 'cookie-preferences';
    preferences.textContent = 'Cookievoorkeuren';
    preferences.setAttribute('aria-controls', 'cookie-banner');
    preferences.addEventListener('click', () => {
      banner.hidden = false;
      banner.querySelector('button').focus();
    });
    (document.querySelector('.site-footer') || document.body).appendChild(preferences);
    document.body.appendChild(banner);

    banner.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => {
        const consent = button.dataset.consent;
        try {
          localStorage.setItem(consentKey, consent);
        } catch (_) {
          // Storage can be unavailable; the choice still applies to this page.
        }
        banner.hidden = true;
        preferences.focus({ preventScroll: true });
        if (consent === 'accepted') {
          loadAnalytics();
        } else {
          stopAnalytics();
          // Unload an already running Google script without sending denied pings.
          if (analyticsStarted) location.reload();
        }
      });
    });

    const savedConsent = readConsent();
    banner.hidden = savedConsent === 'accepted' || savedConsent === 'denied';
    if (savedConsent === 'accepted') loadAnalytics();
    else stopAnalytics();

    window.addEventListener('storage', (event) => {
      if (event.key !== consentKey && event.key !== null) return;
      if (readConsent() === 'accepted') {
        banner.hidden = true;
        loadAnalytics();
      } else {
        stopAnalytics();
        if (analyticsStarted) location.reload();
        else banner.hidden = readConsent() === 'denied';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent, { once: true });
  } else {
    initCookieConsent();
  }
})();

// One delegated listener also covers the floating CTA and future shared partials.
(function () {
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = target?.closest('a, button');
    if (!link) return;

    // Read the existing consent state without modifying its lifecycle.
    try {
      if (localStorage.getItem('colortime.analytics-consent.v1') !== 'accepted') return;
    } catch (_) {
      return;
    }
    if (typeof window.gtag !== 'function' ||
        window['ga-disable-G-88DDP4S0WZ'] !== false ||
        !document.getElementById('colortime-ga4')) return;

    const href = (link.getAttribute('href') || '').trim();
    const isPhone = /^tel:/i.test(href);
    const isEmail = /^mailto:/i.test(href);
    const isWhatsApp = /^https:\/\/wa\.me\//i.test(href);
    const text = (link.textContent || '').replace(/\s+/g, ' ').trim();
    const subject = isEmail ? new URLSearchParams(href.split('?')[1] || '').get('subject') : null;
    const isQuote = link.dataset.analyticsEvent === 'quote_click' ||
      /^(?:\.\/)?offerte\.html(?:[?#]|$)/i.test(href) ||
      /\bvraag\s+(?:een\s+)?offerte\b/i.test(text) ||
      /\bofferte\b/i.test(subject || '');

    let eventName;
    // Use fixed labels: visible contact text can contain a phone number or email.
    let safeText;
    if (isQuote) {
      eventName = 'quote_click';
      safeText = 'Vraag offerte';
    } else if (isWhatsApp) {
      eventName = 'whatsapp_click';
      safeText = 'WhatsApp';
    } else if (isPhone) {
      eventName = 'phone_click';
      safeText = 'Bellen';
    } else if (isEmail) {
      eventName = 'email_click';
      safeText = 'E-mail';
    } else {
      return;
    }

    const parameters = { link_text: safeText, page_path: location.pathname };
    if (isPhone) parameters.link_url = 'tel:';
    else if (isEmail) parameters.link_url = 'mailto:';
    window.gtag('event', eventName, parameters);
  });
})();

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
    '.work-story',
    '.solo-card',
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
      element.matches('.gallery .project, .work-story, .solo-card, .why-cards .card, .services__right li, .sc-item, .footer-col, .contact-card, .over-ons li');

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
  cta.href = 'offerte.html';
  cta.className = 'floating-cta';
  cta.textContent = 'Vraag offerte';
  document.body.appendChild(cta);
  initMobileContactBar();
  initQuoteForm();
});

function initMobileContactBar() {
  if (document.querySelector('.mobile-contact-bar')) return;
  const bar = document.createElement('nav');
  bar.className = 'mobile-contact-bar';
  bar.setAttribute('aria-label', 'Snel contact');
  bar.innerHTML = `
    <a href="tel:+32486667706">Bellen</a>
    <a href="https://wa.me/32486667706?text=Hallo%2C%20ik%20zou%20graag%20informatie%20ontvangen%20over%20schilderwerken." target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a href="offerte.html" data-analytics-event="quote_click">Offerte</a>
  `;
  document.body.appendChild(bar);
  document.body.classList.add('has-mobile-contact-bar');
}

function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const status = document.getElementById('quote-form-status');
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button.textContent;
  let sending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form));
    const workType = payload.work_type;
    sending = true;
    button.disabled = true;
    button.textContent = 'Aanvraag verzenden…';
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'sending';
    status.textContent = 'Uw aanvraag wordt verzonden. Even geduld.';
    let succeeded = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission rejected');
      succeeded = true;
    } catch (_) {
      status.dataset.state = 'error';
      status.textContent = 'We konden de verzending niet bevestigen. Uw gegevens blijven ingevuld. Controleer uw verbinding en probeer opnieuw, of neem contact op via WhatsApp, e-mail of telefoon.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = buttonText;
      form.removeAttribute('aria-busy');
    }
    if (succeeded) {
      status.dataset.state = 'success';
      status.textContent = 'Bedankt! Uw offerteaanvraag is succesvol verstuurd. Colortime neemt persoonlijk contact met u op.';
      form.reset();
      // Only confirmed submissions count; never include user-entered text in GA4.
      try {
        if (localStorage.getItem('colortime.analytics-consent.v1') === 'accepted' &&
            typeof window.gtag === 'function' &&
            window['ga-disable-G-88DDP4S0WZ'] === false &&
            document.getElementById('colortime-ga4')) {
          const parameters = { page_path: location.pathname };
          const allowedTypes = ['Binnenschilderwerken', 'Buitenschilderwerken', 'Behangwerken', 'Houtwerk', 'Andere'];
          if (allowedTypes.includes(workType)) parameters.type_werk = workType;
          window.gtag('event', 'quote_submit', parameters);
        }
      } catch (_) {
        // A tracking/storage failure must not change a successful submission.
      }
    }
    status.focus();
  });
  // Keep the existing no-JS safeguard; errors are shown on this page with JS.
  form.querySelector('fieldset').disabled = false;
}

// lightbox functionality (used on homepage and works pages)
(function () {
  const thumbs = Array.from(document.querySelectorAll('.showcase .sc-item img, .gallery .project img, .works-flow img, .solo-projects__grid img'));
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
