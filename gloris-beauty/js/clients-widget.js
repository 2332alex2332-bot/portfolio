/* CLIENTS — визуальный виджет (без реальной записи) */

(function () {
  const SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const WEEKDAYS_RU = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  const DAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  let state = {
    screen: 'menu',
    calMonth: new Date().getMonth(),
    calYear: new Date().getFullYear(),
    calDay: new Date().getDate(),
    serviceSection: null,
    serviceSearch: '',
  };

  let root = null;
  let panel = null;

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function formatDuration(min) {
    if (!min) return '';
    if (min >= 60) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return m ? `${h} ч ${m} мин` : `${h} ч`;
    }
    return `${min} мин`;
  }

  function formatPrice(item) {
    if (!item) return '';
    const p = item.price;
    const max = item.priceMax;
    const from = item.from ? 'от ' : '';
    if (max && max !== p) return `${from}${p.toLocaleString('ru-RU')} – ${max.toLocaleString('ru-RU')} ₽`;
    return `${from}${p.toLocaleString('ru-RU')} ₽`;
  }

  function getSlotsLabel() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `Ближайшее время для записи ${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}:`;
  }

  function getSections() {
    if (typeof CATALOG_SECTIONS === 'undefined') return [];
    const venue = document.body.dataset.catalogVenue || 'salon';
    if (typeof SERVICE_VENUES !== 'undefined') {
      const ids = SERVICE_VENUES[venue]?.sectionIds || [];
      return CATALOG_SECTIONS.filter(s => ids.includes(s.id));
    }
    return CATALOG_SECTIONS;
  }

  function getSalonAddress() {
    if (typeof SERVICE_VENUES !== 'undefined') {
      const venue = document.body.dataset.catalogVenue || 'salon';
      return SERVICE_VENUES[venue]?.addressFull || 'ул. XXX, д. 27';
    }
    return 'ул. XXX, д. 27';
  }

  function promoBlock() {
    return `
      <div class="yc-widget-promos" aria-hidden="true">
        <div class="yc-widget-promo">🎁 АКЦИЯ! каждый 5 массаж в ПОДАРОК!</div>
        <div class="yc-widget-promo-pct">%</div>
      </div>
    `;
  }

  function footerBlock() {
    return `<div class="yc-widget-footer">Работает на <span class="yc-widget-footer-brand">clients</span></div>`;
  }

  function headerBlock(compact) {
    const addr = getSalonAddress();
    if (compact) {
      return `
        <div class="yc-widget-topbar">
          <button type="button" class="yc-widget-back" data-yc-go="menu" aria-label="Назад">‹</button>
          <div class="yc-widget-topbar-info">
            <p class="yc-widget-salon">Глорис бьюти</p>
            <p class="yc-widget-addr">${esc(addr)}</p>
          </div>
          <span style="width:32px" aria-hidden="true"></span>
        </div>
      `;
    }
    return `
      <div class="yc-widget-header">
        <div class="yc-widget-logo">GLORIS<br>BEAUTY</div>
        <p class="yc-widget-salon">Глорис бьюти ▾</p>
        <p class="yc-widget-addr">${esc(addr)}</p>
      </div>
    `;
  }

  function renderMenu() {
    return `
      ${headerBlock(false)}
      ${promoBlock()}
      <div class="yc-widget-menu">
        <button type="button" class="yc-widget-menu-item" data-yc-go="masters">
          <span class="yc-widget-menu-icon">👥</span>
          <span class="yc-widget-menu-label">Выбрать специалиста</span>
          <span class="yc-widget-menu-chevron">›</span>
        </button>
        <button type="button" class="yc-widget-menu-item" data-yc-go="datetime">
          <span class="yc-widget-menu-icon">📅</span>
          <span class="yc-widget-menu-label">Выбрать дату и время</span>
          <span class="yc-widget-menu-chevron">›</span>
        </button>
        <button type="button" class="yc-widget-menu-item" data-yc-go="services">
          <span class="yc-widget-menu-icon">☰</span>
          <span class="yc-widget-menu-label">Выбрать услуги</span>
          <span class="yc-widget-menu-chevron">›</span>
        </button>
      </div>
      ${footerBlock()}
    `;
  }

  function renderMasterCard(m, isAny) {
    const slots = SLOTS.map(t => `<span class="yc-widget-slot">${t}</span>`).join('')
      + '<span class="yc-widget-slot yc-widget-slot--more">Другое в…</span>';
    if (isAny) {
      return `
        <div class="yc-widget-master">
          <div class="yc-widget-master-head">
            <div class="yc-widget-master-photo yc-widget-master-photo--any">👥</div>
            <div class="yc-widget-master-info">
              <span class="yc-widget-master-name">Любой специалист</span>
            </div>
            <span class="yc-widget-master-radio" aria-hidden="true"></span>
          </div>
          <p class="yc-widget-slots-label">${getSlotsLabel()}</p>
          <div class="yc-widget-slots">${slots}</div>
        </div>
      `;
    }
    const photo = m.photo
      ? `<img class="yc-widget-master-photo" src="${esc(m.photo)}" alt="" width="48" height="48" loading="lazy">`
      : '<div class="yc-widget-master-photo yc-widget-master-photo--any">👤</div>';
    return `
      <div class="yc-widget-master">
        <div class="yc-widget-master-head">
          ${photo}
          <div class="yc-widget-master-info">
            <span class="yc-widget-master-name">${esc(m.displayName)}</span>
            <span class="yc-widget-master-role">${esc(m.specialty)}</span>
            <span class="yc-widget-master-stars">★★★★★ <span>${esc(m.reviewsLabel)}</span></span>
          </div>
          <span class="yc-widget-master-radio" aria-hidden="true"></span>
        </div>
        <p class="yc-widget-slots-label">${getSlotsLabel()}</p>
        <div class="yc-widget-slots">${slots}</div>
      </div>
    `;
  }

  function renderMasters() {
    const masters = typeof MASTERS_DATA !== 'undefined' ? MASTERS_DATA.slice(0, 8) : [];
    const cards = renderMasterCard(null, true) + masters.map(m => renderMasterCard(m)).join('');
    return `
      ${headerBlock(true)}
      <h2 class="yc-widget-title">Выбрать специалиста</h2>
      ${promoBlock()}
      ${cards}
      ${footerBlock()}
    `;
  }

  function renderCalendar() {
    const year = state.calYear;
    const month = state.calMonth;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7;
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    let cells = '';
    for (let i = 0; i < startOffset; i++) {
      cells += '<span class="yc-widget-cal-day is-muted" aria-hidden="true"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isPast = isCurrentMonth && d < today.getDate();
      const isSel = d === state.calDay && isCurrentMonth;
      cells += `<button type="button" class="yc-widget-cal-day${isPast ? ' is-muted' : ''}${isSel ? ' is-selected' : ''}" data-yc-day="${d}">${d}</button>`;
    }

    const nextD = new Date(year, month, state.calDay + 1);
    const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const nearestLabel = `${dayNames[nextD.getDay()]}, ${nextD.getDate()} ${MONTHS_SHORT[nextD.getMonth()]}`;

    return `
      ${headerBlock(true)}
      <div class="yc-widget-cal">
        <div class="yc-widget-cal-nav">
          <button type="button" data-yc-cal="-1" aria-label="Предыдущий месяц">‹</button>
          <span>${MONTHS_RU[month]} ${year}</span>
          <button type="button" data-yc-cal="1" aria-label="Следующий месяц">›</button>
        </div>
        <div class="yc-widget-cal-weekdays">${WEEKDAYS_RU.map(w => `<span>${w}</span>`).join('')}</div>
        <div class="yc-widget-cal-grid">${cells}</div>
        <div class="yc-widget-cal-empty">
          <div class="yc-widget-cal-empty-icon">📅</div>
          <h4>В этот день нет свободного времени</h4>
          <p>Ближайшая доступная дата:</p>
          <p>${nearestLabel}</p>
          <button type="button" class="yc-widget-cal-cta">Перейти к ближайшей дате</button>
        </div>
      </div>
      ${footerBlock()}
    `;
  }

  function renderServices() {
    const sections = getSections();
    if (!state.serviceSection && sections.length) {
      state.serviceSection = sections[0].id;
    }

    const tabs = sections.map(sec => `
      <button type="button" class="yc-widget-tab${state.serviceSection === sec.id ? ' is-active' : ''}" data-yc-section="${sec.id}">
        ${esc(sec.title)}
      </button>
    `).join('');

    const active = sections.find(s => s.id === state.serviceSection);
    let items = [];
    if (active) {
      active.groups.forEach(g => {
        g.items.forEach(item => items.push({ ...item, groupTitle: g.title }));
      });
    }
    const q = state.serviceSearch.toLowerCase().trim();
    if (q) items = items.filter(i => i.name.toLowerCase().includes(q));

    const rows = items.map(item => `
      <div class="yc-widget-service">
        <div class="yc-widget-service-body">
          <span class="yc-widget-service-name">${esc(item.name)}</span>
          ${item.duration ? `<span class="yc-widget-service-dur">${formatDuration(item.duration)}</span>` : ''}
          <span class="yc-widget-service-price">${formatPrice(item)}</span>
        </div>
        <span class="yc-widget-service-check" aria-hidden="true"></span>
      </div>
    `).join('');

    return `
      ${headerBlock(true)}
      <h2 class="yc-widget-title">Выбрать услуги</h2>
      ${promoBlock()}
      <label class="yc-widget-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" id="yc-widget-service-search" placeholder="Найти" value="${esc(state.serviceSearch)}" autocomplete="off">
      </label>
      <div class="yc-widget-tabs">${tabs}</div>
      ${active ? `<h3 class="yc-widget-section-title">${esc(active.title)}</h3>` : ''}
      ${rows || '<p style="padding:1rem;color:#8e8e93;font-size:0.85rem">Ничего не найдено</p>'}
      ${footerBlock()}
    `;
  }

  function render() {
    if (!panel) return;
    let html = '';
    switch (state.screen) {
      case 'masters': html = renderMasters(); break;
      case 'datetime': html = renderCalendar(); break;
      case 'services': html = renderServices(); break;
      default: html = renderMenu(); state.screen = 'menu';
    }
    panel.querySelector('.yc-widget-scroll').innerHTML = html;
    bindPanelEvents();
  }

  function bindPanelEvents() {
    panel.querySelectorAll('[data-yc-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.screen = btn.dataset.ycGo;
        render();
      });
    });

    panel.querySelectorAll('[data-yc-cal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = Number(btn.dataset.ycCal);
        state.calMonth += delta;
        if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
        if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
        render();
      });
    });

    panel.querySelectorAll('[data-yc-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.calDay = Number(btn.dataset.ycDay);
        render();
      });
    });

    panel.querySelectorAll('[data-yc-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.serviceSection = btn.dataset.ycSection;
        render();
      });
    });

    const search = panel.querySelector('#yc-widget-service-search');
    search?.addEventListener('input', (e) => {
      state.serviceSearch = e.target.value;
      render();
      const inp = panel.querySelector('#yc-widget-service-search');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    });

    panel.querySelector('.yc-widget-cal-cta')?.addEventListener('click', () => {
      state.calDay += 1;
      render();
    });
  }

  function openWidget(screen) {
    if (typeof window.closeSideMenu === 'function') {
      window.closeSideMenu();
    }
    if (screen) state.screen = screen;
    root.classList.add('is-open');
    document.body.classList.add('yc-widget-body-open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = 'hidden';
    render();
  }

  function closeWidget() {
    root.classList.remove('is-open');
    document.body.classList.remove('yc-widget-body-open');
    document.body.style.overflow = '';
    state.screen = 'menu';
  }

  function buildDom() {
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'yc-widget-fab yc-widget-open';
    fab.textContent = 'Записаться';
    fab.setAttribute('aria-label', 'Записаться онлайн');
    document.body.appendChild(fab);

    root = document.createElement('div');
    root.id = 'yc-widget-root';
    root.className = 'yc-widget-root';
    root.innerHTML = `
      <button type="button" class="yc-widget-backdrop" aria-label="Закрыть"></button>
      <button type="button" class="yc-widget-close" aria-label="Закрыть">×</button>
      <div class="yc-widget-panel">
        <div class="yc-widget-scroll"></div>
      </div>
    `;
    document.body.appendChild(root);

    panel = root.querySelector('.yc-widget-panel');

    root.querySelector('.yc-widget-backdrop').addEventListener('click', closeWidget);
    root.querySelector('.yc-widget-close').addEventListener('click', closeWidget);

    document.querySelectorAll('.yc-widget-open').forEach(btn => {
      btn.addEventListener('click', () => openWidget('menu'));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) closeWidget();
    });
  }

  window.openYcWidget = openWidget;
  window.closeYcWidget = closeWidget;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDom);
  } else {
    buildDom();
  }
})();
