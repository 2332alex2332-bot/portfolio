(function initHeroViewport() {
  'use strict';

  const MOBILE_MQ = window.matchMedia('(max-width: 1024px)');

  function isHome() {
    return document.body.dataset.page === 'home';
  }

  function getViewportHeight() {
    if (window.visualViewport && window.visualViewport.height > 0) {
      return Math.round(window.visualViewport.height);
    }
    return Math.round(window.innerHeight);
  }

  function getHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (header) {
      return Math.ceil(header.getBoundingClientRect().height);
    }

    const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-header-height');
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? 0 : Math.ceil(parsed);
  }

  function setMobileTypography(stageH) {
    const root = document.documentElement;
    const title = stageH < 560 ? '2.2rem'
      : stageH < 620 ? '2.5rem'
      : stageH < 700 ? '2.8rem'
      : stageH < 780 ? '3.05rem'
      : stageH < 860 ? '3.25rem'
      : '3.45rem';
    const lead = stageH < 560 ? '0.8125rem'
      : stageH < 700 ? '0.875rem'
      : '0.9375rem';
    const blockShift = Math.round(stageH * 0.09);
    const actionsGap = stageH < 620 ? '10px' : '12px';

    root.style.setProperty('--hero-title-size', title);
    root.style.setProperty('--hero-lead-size', lead);
    root.style.setProperty('--hero-block-shift', `${blockShift}px`);
    root.style.setProperty('--hero-actions-gap', actionsGap);
  }

  function clearMobileTypography() {
    const root = document.documentElement;
    root.style.removeProperty('--hero-title-size');
    root.style.removeProperty('--hero-lead-size');
    root.style.removeProperty('--hero-block-shift');
    root.style.removeProperty('--hero-actions-gap');
  }

  function fitHeroCopy() {
    const heroText = document.querySelector('body[data-page="home"] .hero-text');
    const heroCopy = document.querySelector('body[data-page="home"] .hero-copy');
    if (!heroText || !heroCopy) return;

    heroCopy.style.setProperty('--hero-copy-scale', '1');
    if (!MOBILE_MQ.matches) return;

    const styles = getComputedStyle(heroText);
    const padTop = parseFloat(styles.paddingTop) || 0;
    const padBottom = parseFloat(styles.paddingBottom) || 0;
    const available = heroText.clientHeight - padTop - padBottom;
    const needed = heroCopy.scrollHeight;

    if (available > 0 && needed > available + 1) {
      const scale = Math.max(0.76, Math.min(1, (available - 2) / needed));
      heroCopy.style.setProperty('--hero-copy-scale', scale.toFixed(4));
    }
  }

  function updateHeroViewport() {
    if (!isHome()) return;

    const root = document.documentElement;
    const viewportH = getViewportHeight();
    const headerH = getHeaderHeight();
    const stageH = Math.max(280, viewportH - headerH);

    root.style.setProperty('--app-viewport-height', `${viewportH}px`);
    root.style.setProperty('--hero-stage-height', `${stageH}px`);

    if (MOBILE_MQ.matches) {
      setMobileTypography(stageH);
      root.classList.add('is-hero-mobile-fit');
    } else {
      clearMobileTypography();
      root.classList.remove('is-hero-mobile-fit');
      const heroCopy = document.querySelector('body[data-page="home"] .hero-copy');
      if (heroCopy) heroCopy.style.removeProperty('--hero-copy-scale');
    }

    requestAnimationFrame(fitHeroCopy);
  }

  function init() {
    if (!isHome()) return;

    updateHeroViewport();

    window.addEventListener('resize', updateHeroViewport, { passive: true });
    window.addEventListener('orientationchange', () => {
      window.setTimeout(updateHeroViewport, 120);
    }, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeroViewport, { passive: true });
      window.visualViewport.addEventListener('scroll', updateHeroViewport, { passive: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateHeroViewport);
    }

    const header = document.querySelector('.site-header');
    if (header && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateHeroViewport).observe(header);
    }

    const heroText = document.querySelector('body[data-page="home"] .hero-text');
    if (heroText && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateHeroViewport).observe(heroText);
    }

    if (typeof MOBILE_MQ.addEventListener === 'function') {
      MOBILE_MQ.addEventListener('change', updateHeroViewport);
    } else if (typeof MOBILE_MQ.addListener === 'function') {
      MOBILE_MQ.addListener(updateHeroViewport);
    }
  }

  window.updateGlorisHeroViewport = updateHeroViewport;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
