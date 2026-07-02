/* Лайтбокс для фотогалереи «Наши работы» */

function initWorksGallery() {
  const grids = document.querySelectorAll('[data-works-gallery]');
  if (!grids.length || typeof WORKS_GALLERY === 'undefined') return;

  const items = WORKS_GALLERY;
  let lightbox = document.getElementById('works-lightbox');
  if (lightbox && lightbox.querySelector('.works-lightbox__stage')) {
    lightbox.remove();
    lightbox = null;
  }
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'works-lightbox';
    lightbox.className = 'works-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="works-lightbox__backdrop" data-works-close tabindex="-1"></div>
      <div class="works-lightbox__panel" role="dialog" aria-modal="true" aria-label="Просмотр фото">
        <button type="button" class="works-lightbox__close" data-works-close aria-label="Закрыть">×</button>
        <button type="button" class="works-lightbox__nav works-lightbox__nav--prev" data-works-prev aria-label="Предыдущее фото">‹</button>
        <figure class="works-lightbox__figure">
          <img class="works-lightbox__img" src="" alt="">
          <figcaption class="works-lightbox__counter"></figcaption>
        </figure>
        <button type="button" class="works-lightbox__nav works-lightbox__nav--next" data-works-next aria-label="Следующее фото">›</button>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const imgEl = lightbox.querySelector('.works-lightbox__img');
  const counterEl = lightbox.querySelector('.works-lightbox__counter');
  let currentIndex = 0;
  let lastFocus = null;

  function getWorksLimit(grid) {
    return Math.min(Number(grid.dataset.worksLimit) || items.length, items.length);
  }

  function createGalleryItem(item, index, { entering = false, stagger = 0 } = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = entering
      ? 'works-gallery__item works-gallery__item--enter'
      : 'works-gallery__item reveal visible';
    button.dataset.worksIndex = String(index);
    button.setAttribute('aria-label', `Открыть фото ${index + 1}`);

    if (entering) {
      button.style.setProperty('--works-enter-delay', `${stagger * 70}ms`);
    }

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.width = 280;
    img.height = 280;
    button.appendChild(img);
    return button;
  }

  function animateEnteringItems(grid) {
    const entering = grid.querySelectorAll('.works-gallery__item--enter:not(.is-visible)');
    if (!entering.length) return;

    requestAnimationFrame(() => {
      entering.forEach((el) => el.classList.add('is-visible'));
    });
  }

  function renderGrid(grid, previousCount = 0) {
    const limit = getWorksLimit(grid);

    if (previousCount === 0) {
      grid.replaceChildren();
      for (let i = 0; i < limit; i += 1) {
        grid.appendChild(createGalleryItem(items[i], i));
      }
    } else if (limit > previousCount) {
      for (let i = previousCount; i < limit; i += 1) {
        grid.appendChild(createGalleryItem(items[i], i, { entering: true, stagger: i - previousCount }));
      }
      animateEnteringItems(grid);
    }

    syncWorksMoreButton(grid);
    return limit;
  }

  function syncWorksMoreButton(grid) {
    const wrap = grid.closest('.lo-works-gallery')?.querySelector('[data-works-more-wrap]');
    if (!wrap) return;

    const limit = getWorksLimit(grid);
    const shouldHide = limit >= items.length;

    if (shouldHide) {
      wrap.classList.add('works-gallery-cta--hide');
      window.setTimeout(() => {
        if (getWorksLimit(grid) >= items.length) {
          wrap.hidden = true;
        }
      }, 320);
      return;
    }

    wrap.hidden = false;
    wrap.classList.remove('works-gallery-cta--hide');
  }

  function initWorksLoadMore(grid, getRenderedCount, setRenderedCount) {
    const btn = grid.closest('.lo-works-gallery')?.querySelector('[data-works-more]');
    if (!btn || !grid.dataset.worksLimit) return;

    const step = Number(grid.dataset.worksStep) || 6;

    btn.addEventListener('click', () => {
      const previousCount = getRenderedCount();
      const nextLimit = Math.min(previousCount + step, items.length);
      grid.dataset.worksLimit = String(nextLimit);
      const rendered = renderGrid(grid, previousCount);
      setRenderedCount(rendered);
    });
  }

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    counterEl.textContent = `${currentIndex + 1} / ${items.length}`;
    lightbox.hidden = false;
    document.body.classList.add('works-lightbox-open');
    lightbox.querySelector('.works-lightbox__close').focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove('works-lightbox-open');
    imgEl.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  function step(delta) {
    show(currentIndex + delta);
  }

  grids.forEach((grid) => {
    let renderedCount = renderGrid(grid, 0);
    initWorksLoadMore(
      grid,
      () => renderedCount,
      (count) => {
        renderedCount = count;
      }
    );
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-works-index]');
    if (!trigger || !trigger.closest('[data-works-gallery]')) return;
    lastFocus = trigger;
    show(Number(trigger.dataset.worksIndex));
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target.closest('[data-works-close]')) close();
    if (e.target.closest('[data-works-prev]')) step(-1);
    if (e.target.closest('[data-works-next]')) step(1);
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

document.addEventListener('DOMContentLoaded', initWorksGallery);
