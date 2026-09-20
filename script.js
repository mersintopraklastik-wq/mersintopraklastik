(() => {
  'use strict';
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
    }));
  }

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, {threshold: .08});
    reveal.forEach(el => ro.observe(el));
  }

  document.querySelectorAll('.track-cta').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.dataset.cta || 'cta';
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'cta_click', cta_type:type});
      if (typeof window.gtag === 'function') window.gtag('event','cta_click',{cta_type:type});
    }, {passive:true});
  });
})();
