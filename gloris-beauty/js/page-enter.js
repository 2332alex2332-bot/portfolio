(function () {
  'use strict';

  const STAGGER_MS = 55;
  const VIEWPORT_RATIO = 0.9;

  let observer = null;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function revealElement(el) {
    if (!el || el.dataset.revealDone === '1') return;
    el.dataset.revealDone = '1';

    if (el.classList.contains('works-gallery__item--enter')) {
      el.classList.add('is-visible');
      return;
    }

    el.classList.add('visible');
  }

  function scheduleReveal(el, delay) {
    if (prefersReducedMotion()) {
      revealElement(el);
      return;
    }

    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`);
      el.style.setProperty('--works-enter-delay', `${delay}ms`);
    }

    window.setTimeout(() => revealElement(el), delay);
  }

  function ensureObserver() {
    if (observer) return observer;

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -24px 0px',
    });

    return observer;
  }

  function collectTargets(root) {
    return [...root.querySelectorAll(
      '.reveal:not(.visible), .works-gallery__item--enter:not(.is-visible)'
    )].filter((el) => el.dataset.revealDone !== '1');
  }

  function initPageEnter(root = document) {
    const items = collectTargets(root);
    if (!items.length) return;

    const io = ensureObserver();
    let aboveFoldIndex = 0;

    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * VIEWPORT_RATIO && rect.bottom > 0;

      if (inView) {
        scheduleReveal(el, aboveFoldIndex * STAGGER_MS);
        aboveFoldIndex += 1;
        return;
      }

      io.observe(el);
    });
  }

  function markContentReady() {
    document.documentElement.classList.remove('is-booting');
    document.documentElement.classList.add('is-content-ready');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => initPageEnter());
    });
  }

  window.initPageEnter = initPageEnter;
  window.markGlorisContentReady = markContentReady;
  window.observeReveal = initPageEnter;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markContentReady);
  } else {
    markContentReady();
  }
})();
