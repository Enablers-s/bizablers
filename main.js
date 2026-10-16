// Bizablers site: mobile menu, reveal-on-scroll, and the enquiry form (opens an email draft; no backend yet).
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  // Addresses of Enabler-S and the sister brand sites (each brand is its own repo and Vercel project).
  // The HTML links point at the live sites; when the page is opened from disk or localhost they are
  // switched to the side-by-side local folders instead. To move a brand to its own domain, change LIVE
  // here and the matching href in index.html.
  const LIVE = {
    enabler: 'https://enabler-s.vercel.app/',
    bizablers: 'https://bizablers.vercel.app/',
    finablers: 'https://finablers.vercel.app/',
    trustablers: 'https://trustablers.vercel.app/',
    brandora: 'https://brandora-s.vercel.app/',
    movera: 'https://moveraglobal.com/',
  };
  const LOCAL = {
    enabler: '../webpage1/index.html',
    bizablers: '../bizablers/index.html',
    finablers: '../finablers/index.html',
    trustablers: '../trustablers/index.html',
    brandora: '../brandora/index.html',
    movera: 'https://moveraglobal.com/',
  };
  const isLocal = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  const SITES = isLocal ? LOCAL : LIVE;
  document.querySelectorAll('[data-link]').forEach((a) => { if (SITES[a.dataset.link]) a.href = SITES[a.dataset.link]; });
  const $ = (id) => document.getElementById(id);

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const menu = $('menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });

  // Reveal cards as they scroll into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  // Enquiry form → pre-filled email to the Enabler-S inbox
  const form = $('form');
  const status = $('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) {
      status.textContent = 'Please add your name and a valid email.';
      return;
    }
    const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nNeed: ${d.need}\n\n${d.message || ''}`;
    window.location.href = `mailto:Hello@enabler-s.com?subject=${encodeURIComponent('Bizablers enquiry: ' + d.need)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app with the enquiry filled in…';
  });

  $('year').textContent = new Date().getFullYear();
})();
