(function updateHeaderMetrics() {
  function set() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--site-header-height', `${height}px`);
    document.documentElement.style.setProperty('--catalog-sticky-top', `${height}px`);
    if (typeof window.updateGlorisHeroViewport === 'function') {
      window.updateGlorisHeroViewport();
    }
  }

  set();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', set);
  }

  window.addEventListener('resize', set, { passive: true });

  const header = document.querySelector('.site-header');
  if (header && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(set).observe(header);
  }
})();
