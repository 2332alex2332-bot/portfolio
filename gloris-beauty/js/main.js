/* ===== GLORIS BEAUTY — общий JavaScript ===== */

const MASTERS = typeof SALON_MASTERS !== 'undefined' ? SALON_MASTERS : [
  'Любой свободный мастер',
  'Алиса Р. — парикмахер',
  'Дарья К. — парикмахер-стилист',
  'Анастасия З. — мастер ногтевого сервиса',
  'Карина Ф. — массажист, косметолог',
  'Надежда В. — косметолог',
];

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
];

const BOOKING_ICONS = {
  user: '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  phone: '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  calendar: '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  service: '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  master: '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
};

function bookingIcon(name) {
  return BOOKING_ICONS[name] || '';
}

let bookingCart = [];
let plannerCart = [];
const CART_STORAGE_KEY = 'gloris-planner-cart';
const VENUE_MASTERS_KEY = 'gloris-venue-masters';
let plannerVenueMasters = {
  salon: 'Любой свободный мастер',
  medical: 'Любой свободный мастер',
};
let bookingVenueMasters = {};
let bookingVisitSchedule = {};

function getItemVenueId(name) {
  const item = findCatalogItem(name);
  return item?.venueId || 'salon';
}

function getCatalogVenue() {
  return document.body.dataset.catalogVenue || 'salon';
}

function getVenueSections() {
  if (typeof CATALOG_SECTIONS === 'undefined') return [];
  const venue = getCatalogVenue();
  if (typeof SERVICE_VENUES === 'undefined') return CATALOG_SECTIONS;
  return CATALOG_SECTIONS.filter(sec => SERVICE_VENUES[venue].sectionIds.includes(sec.id));
}

function loadPlannerCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    plannerCart = parsed.map(item => ({
      ...item,
      venueId: item.venueId || getItemVenueId(item.name),
    }));
  } catch {
    plannerCart = [];
  }
}

function savePlannerCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(plannerCart));
  } catch { /* ignore */ }
}

function groupCartByVenue(cart) {
  const order = ['salon', 'medical'];
  const venueInfo = typeof SERVICE_VENUES !== 'undefined'
    ? SERVICE_VENUES
    : {
        salon: { addressFull: 'ул. Кантемировская, д. 27', tabLabel: 'Немедицинские услуги' },
        medical: { addressFull: 'пр-т Андропова, д. 26', tabLabel: 'Медицинские услуги' },
      };
  const map = new Map();
  cart.forEach(item => {
    const vid = item.venueId || getItemVenueId(item.name);
    if (!map.has(vid)) map.set(vid, []);
    map.get(vid).push(item);
  });
  return order
    .filter(id => map.has(id))
    .map(id => ({
      venueId: id,
      title: venueInfo[id]?.tabLabel || id,
      address: venueInfo[id]?.addressFull || id,
      items: map.get(id),
    }));
}

function loadVenueMasters() {
  try {
    const raw = localStorage.getItem(VENUE_MASTERS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      plannerVenueMasters = { ...plannerVenueMasters, ...parsed };
    }
  } catch { /* ignore */ }
}

function saveVenueMasters() {
  try {
    localStorage.setItem(VENUE_MASTERS_KEY, JSON.stringify(plannerVenueMasters));
  } catch { /* ignore */ }
}

function formatVenueBookingSummary(cart, venueMasters, schedule) {
  return groupCartByVenue(cart).map(group => {
    const totals = accumulateCartTotals(group.items);
    const sched = schedule?.[group.venueId];
    const master = sched?.master || venueMasters[group.venueId] || 'Любой свободный мастер';
    const services = group.items.map(i => i.name).join(', ');
    const chunks = [group.address, services];
    if (totals.duration) chunks.push(formatDuration(totals.duration));
    if (sched?.date && sched?.time) chunks.push(`${sched.date} ${sched.time}`);
    if (master && master !== 'Любой свободный мастер') chunks.push(`мастер: ${master}`);
    return chunks.join(' — ');
  }).join('; ');
}

function formatGroupedServicesText(cart) {
  return groupCartByVenue(cart)
    .map(g => `${g.address}: ${g.items.map(i => i.name).join(', ')}`)
    .join('; ');
}

function formatRub(amount) {
  return amount.toLocaleString('ru-RU') + ' ₽';
}

function findCatalogItem(name, { exactOnly = false } = {}) {
  if (!name || typeof PLANNER_SERVICES === 'undefined') return null;
  const exact = PLANNER_SERVICES.find(s => s.name === name);
  if (exact) return exact;
  if (exactOnly) return null;
  const lower = name.toLowerCase();
  return PLANNER_SERVICES.find(s => {
    const sLower = s.name.toLowerCase();
    return sLower.includes(lower) || lower.includes(sLower);
  }) || null;
}

function formatServicePrice(item) {
  if (!item || item.price === null) return 'по прайсу';
  if (item.priceMax && item.priceMax !== item.price) {
    return `${formatRub(item.price)} – ${formatRub(item.priceMax)}`;
  }
  if (item.from) return 'от ' + formatRub(item.price);
  return formatRub(item.price);
}

function getServicePriceInfo(name) {
  const item = findCatalogItem(name);
  if (!item || item.price === null) {
    return { amount: null, label: 'по прайсу', from: false, oldPrice: null };
  }
  return {
    amount: item.price,
    label: formatServicePrice(item),
    from: !!item.from,
    oldPrice: item.oldPrice || null,
  };
}

function getServiceDuration(name) {
  return findCatalogItem(name)?.duration ?? null;
}

function formatDuration(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

function cartItemFromService(name) {
  const resolved = findServiceOption(name) || name;
  const price = getServicePriceInfo(resolved);
  const item = findCatalogItem(resolved);
  const venueId = item?.venueId || getItemVenueId(resolved);
  return {
    name: resolved,
    ...price,
    duration: item?.duration ?? null,
    masters: item?.masters || [],
    venueId,
    address: typeof getServiceAddress === 'function' ? getServiceAddress(venueId) : venueId,
    masterIds: resolveMasterIdsFromNames(item?.masters),
  };
}

function cartItemFromPlanner(service) {
  const venueId = service.venueId || getItemVenueId(service.name);
  return {
    name: service.name,
    amount: service.price,
    label: formatServicePrice(service),
    from: !!service.from,
    oldPrice: service.oldPrice || null,
    duration: service.duration,
    masters: service.masters || [],
    venueId,
    address: typeof getServiceAddress === 'function' ? getServiceAddress(venueId) : venueId,
    masterIds: resolveMasterIdsFromNames(service.masters),
  };
}

function findServiceOption(name) {
  if (!name) return null;
  const item = findCatalogItem(name);
  return item ? item.name : null;
}

/* ----- Booking calculator ----- */
function initBookingCalculator() {
  const oldSelect = document.getElementById('booking-service');
  if (!oldSelect || document.getElementById('booking-calculator')) return;

  const container = oldSelect.parentElement;
  const label = container.querySelector('label');
  if (label) label.textContent = 'Услуги';

  const calc = document.createElement('div');
  calc.id = 'booking-calculator';
  calc.innerHTML = `
    <div class="booking-add-row">
      <select id="booking-service-pick" class="booking-form-input booking-form-select">
        <option value="">Выберите услугу</option>
      </select>
      <button type="button" id="booking-add-btn" class="booking-add-btn" aria-label="Добавить">+</button>
    </div>
    <div class="booking-cart-wrap">
      <div id="booking-cart" class="booking-cart">
        <p class="booking-cart-empty">Добавьте одну или несколько услуг</p>
      </div>
    </div>
    <div class="shop-cart-totals visit-totals booking-modal-totals">
      <div class="planner-total-row">
        <span>Итого</span>
        <strong id="booking-total" class="booking-total-amount">0 ₽</strong>
      </div>
      <div class="planner-total-row">
        <span>Время</span>
        <strong id="booking-total-duration" class="booking-total-time">0 мин</strong>
      </div>
      <p id="booking-total-note" class="booking-total-note hidden"></p>
    </div>
    <div id="booking-schedule" class="booking-schedule"></div>
  `;

  oldSelect.remove();
  container.appendChild(calc);

  const pick = document.getElementById('booking-service-pick');
  const list = typeof PLANNER_SERVICES !== 'undefined' ? PLANNER_SERVICES : [];
  list.forEach(s => {
    const info = getServicePriceInfo(s.name);
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = info.amount !== null ? `${s.name} — ${info.label}` : `${s.name} — по прайсу`;
    pick.appendChild(opt);
  });

  document.getElementById('booking-add-btn').addEventListener('click', () => {
    const name = pick.value;
    if (!name) return;
    addToBookingCart(name);
    pick.value = '';
  });

}

function addToBookingCart(name) {
  const resolved = findServiceOption(name) || name;
  if (!resolved || bookingCart.some(item => item.name === resolved)) return;
  bookingCart.push(cartItemFromService(resolved));
  renderBookingCart();
}

function removeFromBookingCart(name) {
  bookingCart = bookingCart.filter(item => item.name !== name);
  renderBookingCart();
}

function accumulateCartTotals(cart) {
  let sum = 0;
  let duration = 0;
  let hasVariable = false;
  let hasFrom = false;
  cart.forEach(item => {
    if (item.amount === null) hasVariable = true;
    else sum += item.amount;
    if (item.from) hasFrom = true;
    if (item.duration) duration += item.duration;
  });
  return { sum, duration, hasVariable, hasFrom };
}

function buildVenueGroupHtml(group, options) {
  const venueTotals = accumulateCartTotals(group.items);
  const prefix = venueTotals.hasFrom ? 'от ' : '';
  const priceText = venueTotals.sum > 0 ? prefix + formatRub(venueTotals.sum) : '—';
  const timeText = venueTotals.duration ? formatDuration(venueTotals.duration) : '—';
  const compact = options.compact;

  let metaHtml = '';
  if (options.venueDetails && !options.hideVenueMaster) {
    const mastersMap = options.venueMasters || {};
    const allowed = getMastersForCart(group.items);
    const current = mastersMap[group.venueId] || 'Любой свободный мастер';
    const safeCurrent = allowed.includes(current) ? current : 'Любой свободный мастер';
    const optionsHtml = allowed.map(m => {
      const val = escAttr(m);
      return `<option value="${val}"${m === safeCurrent ? ' selected' : ''}>${m}</option>`;
    }).join('');

    if (compact) {
      metaHtml = `
        <div class="cart-venue-meta cart-venue-meta--compact">
          <label class="cart-venue-master-label">Мастер</label>
          <select class="cart-venue-master booking-field-select" data-venue-id="${group.venueId}">${optionsHtml}</select>
        </div>
      `;
    } else {
      metaHtml = `
        <div class="cart-venue-meta">
          <div class="cart-venue-meta-row"><span>Время</span><strong>${timeText}</strong></div>
          <div class="cart-venue-meta-row"><span>Стоимость</span><strong>${priceText}</strong></div>
          <label class="cart-venue-master-label">Специалист</label>
          <select class="cart-venue-master booking-field-select booking-form-input" data-venue-id="${group.venueId}">${optionsHtml}</select>
        </div>
      `;
    }
  } else if (options.venueDetails && !compact) {
    metaHtml = `
      <div class="cart-venue-meta">
        <div class="cart-venue-meta-row"><span>Время</span><strong>${timeText}</strong></div>
        <div class="cart-venue-meta-row"><span>Стоимость</span><strong>${priceText}</strong></div>
      </div>
    `;
  }

  const headHtml = `<div class="cart-venue-head">
      <span class="cart-venue-addr">${group.address}</span>
      ${compact ? `<span class="cart-venue-summary">${group.items.length} ${pluralServices(group.items.length)} · ${timeText} · ${priceText}</span>` : ''}
    </div>`;

  return `
    <div class="cart-venue-group" data-venue-id="${group.venueId}">
      ${headHtml}
      ${group.items.map(item => buildCartItemHtml(item, options)).join('')}
      ${metaHtml}
    </div>
  `;
}

function pluralServices(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'услуг';
  if (mod10 === 1) return 'услуга';
  if (mod10 >= 2 && mod10 <= 4) return 'услуги';
  return 'услуг';
}

function attachVenueMasterListeners(cartEl, mastersMap, onChange) {
  cartEl.querySelectorAll('.cart-venue-master').forEach(select => {
    select.addEventListener('change', () => {
      const venueId = select.dataset.venueId;
      if (venueId) {
        mastersMap[venueId] = select.value;
        if (onChange) onChange();
      }
    });
  });
}

function buildCartItemHtml(item, options = {}) {
  const priceHtml = item.oldPrice
    ? `<span class="cart-price-old">${formatRub(item.oldPrice)}</span><span class="cart-price-new">${item.label}</span>`
    : `<span class="cart-price">${item.label}</span>`;

  if (options.compact) {
    return `
      <div class="booking-cart-item booking-cart-item--compact booking-cart-item--row">
        <div class="booking-cart-item-main">
          <span class="booking-cart-item-name">${item.name}</span>
        </div>
        <span class="booking-cart-leader" aria-hidden="true"></span>
        <span class="booking-cart-item-side">
          ${priceHtml}
          <button type="button" class="booking-cart-remove" data-name="${item.name.replace(/"/g, '&quot;')}" aria-label="Удалить">×</button>
        </span>
      </div>
    `;
  }

  const durationHtml = item.duration
    ? `<span class="booking-cart-item-duration">${formatDuration(item.duration)}</span>`
    : '';
  const safeName = item.name.replace(/"/g, '&quot;');
  const removeBtn = `<button type="button" class="booking-cart-remove" data-name="${safeName}" aria-label="Удалить">×</button>`;

  if (options.venueDetails) {
    return `
      <div class="booking-cart-item booking-cart-item--row">
        <div class="booking-cart-item-main">
          <span class="booking-cart-item-name">${item.name}</span>
          ${durationHtml ? `<span class="booking-cart-item-duration">${formatDuration(item.duration)}</span>` : ''}
        </div>
        <span class="booking-cart-leader" aria-hidden="true"></span>
        <div class="booking-cart-item-side">
          ${priceHtml}
          ${removeBtn}
        </div>
      </div>
    `;
  }

  const bookBtn = options.onBookSingle
    ? `<button type="button" class="shop-list-action cart-item-book" data-name="${safeName}">Записаться</button>`
    : '';
  const actionsWrap = options.onBookSingle
    ? `<div class="booking-cart-item-actions">${bookBtn}${removeBtn}</div>`
    : removeBtn;

  return `
    <div class="booking-cart-item">
      <div class="booking-cart-item-info">
        <span class="booking-cart-item-name">${item.name}</span>
        <div class="booking-cart-item-prices">${priceHtml}${durationHtml}</div>
      </div>
      ${actionsWrap}
    </div>
  `;
}

function attachCartItemListeners(cartEl, onRemove, onBookSingle) {
  cartEl.querySelectorAll('.booking-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => onRemove(btn.dataset.name));
  });
  if (onBookSingle) {
    cartEl.querySelectorAll('.cart-item-book').forEach(btn => {
      btn.addEventListener('click', () => onBookSingle(btn.dataset.name));
    });
  }
}

function renderCartIntoElement(cart, cartEl, onRemove, options = {}) {
  const emptyMessage = options.emptyMessage || 'Добавьте одну или несколько услуг';
  if (!cartEl) return accumulateCartTotals([]);

  if (cart.length === 0) {
    cartEl.innerHTML = `<p class="booking-cart-empty">${emptyMessage}</p>`;
    return accumulateCartTotals([]);
  }

  const groupByVenue = options.groupByVenue !== false;
  let html;
  if (groupByVenue) {
    html = groupCartByVenue(cart).map(group => buildVenueGroupHtml(group, options)).join('');
  } else {
    html = cart.map(item => buildCartItemHtml(item, options)).join('');
  }

  cartEl.innerHTML = html;
  attachCartItemListeners(cartEl, onRemove, options.onBookSingle);
  if (options.venueDetails) {
    attachVenueMasterListeners(cartEl, options.venueMasters || {}, options.onVenueMasterChange);
  }
  return accumulateCartTotals(cart);
}

function renderCartList(cart, cartEl, onRemove) {
  return renderCartIntoElement(cart, cartEl, onRemove, {
    groupByVenue: true,
    venueDetails: true,
    hideVenueMaster: true,
    venueMasters: bookingVenueMasters,
    onVenueMasterChange: () => {
      bookingVenueMasters = { ...bookingVenueMasters };
      updateBookingMasterFieldVisibility();
      renderBookingSchedule();
    },
  });
}

function renderBookingSchedule() {
  const container = document.getElementById('booking-schedule');
  const form = document.getElementById('booking-form');
  if (!container) return;

  const groups = groupCartByVenue(bookingCart);
  if (!groups.length) {
    container.innerHTML = '';
    form?.classList.remove('has-visit-schedule');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  form?.classList.add('has-visit-schedule');

  container.innerHTML = groups.map(group => {
    const vid = group.venueId;
    if (!bookingVisitSchedule[vid]) {
      bookingVisitSchedule[vid] = { date: today, time: '', master: '' };
    }
    const sched = bookingVisitSchedule[vid];
    const duration = getVisitDuration(group.items);
    const date = sched.date || today;
    const { available, unavailable } = getMastersWithAvailability(group.items, date);

    let currentMaster = sched.master
      || bookingVenueMasters[vid]
      || 'Любой свободный мастер';
    const availableNames = available.map(a => a.master);

    if (currentMaster !== 'Любой свободный мастер' && !availableNames.includes(currentMaster)) {
      currentMaster = available.length ? 'Любой свободный мастер' : '';
    }
    if (!available.length) currentMaster = '';

    sched.master = currentMaster;
    bookingVenueMasters[vid] = currentMaster;

    let times = [];
    if (currentMaster === 'Любой свободный мастер') {
      available.forEach(({ slots }) => times.push(...slots));
      times = [...new Set(times)].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    } else if (currentMaster) {
      times = getAvailableSlotsForMaster(currentMaster, group.items, date);
    }

    const masterOptions = available.length
      ? ['Любой свободный мастер', ...availableNames].map(m => {
          const val = escAttr(m);
          return `<option value="${val}"${m === currentMaster ? ' selected' : ''}>${m}</option>`;
        }).join('')
      : '<option value="" disabled>Нет свободных мастеров</option>';

    const timeSlotsHtml = times.length
      ? times.map(t => {
          const endTime = formatEndTime(t, duration);
          const selected = sched.time === t ? ' selected' : '';
          return `<button type="button" class="time-slot${selected}" data-venue-id="${vid}" data-time="${t}"><span class="time-slot-start">${t}</span><span class="time-slot-end">до ${endTime}</span></button>`;
        }).join('')
      : `<p class="time-slots-empty">${available.length ? 'Нет слотов на выбранную дату' : `Нет мастеров со свободным окном ${formatDuration(duration)} подряд`}</p>`;

    const unavailableHint = unavailable.length && available.length
      ? `<p class="booking-unavailable-hint">Заняты на эту дату: ${unavailable.map(m => m.split(' —')[0]).join(', ')}</p>`
      : '';

    return `
      <div class="booking-visit-schedule" data-venue-id="${vid}">
        <div class="booking-visit-schedule-header">
          <p class="booking-visit-schedule-addr">${group.address}</p>
          <span class="booking-visit-schedule-badge">${formatDuration(duration)} подряд</span>
        </div>
        <div class="booking-form-field">
          <label class="booking-form-label">Мастер</label>
          <select class="booking-form-input booking-form-select booking-visit-master" data-venue-id="${vid}"${!available.length ? ' disabled' : ''}>
            ${masterOptions}
          </select>
        </div>
        <div class="booking-form-field">
          <label class="booking-form-label">Дата визита</label>
          <input type="date" class="booking-form-input booking-visit-date" data-venue-id="${vid}" value="${date}" min="${today}" required>
        </div>
        <div class="booking-form-field">
          <label class="booking-form-label">Время</label>
          <div class="time-slots-grid" data-venue-id="${vid}">${timeSlotsHtml}</div>
        </div>
        ${unavailableHint}
      </div>
    `;
  }).join('');

  container.querySelectorAll('.booking-visit-date').forEach(input => {
    input.addEventListener('change', () => {
      const vid = input.dataset.venueId;
      bookingVisitSchedule[vid] = bookingVisitSchedule[vid] || {};
      bookingVisitSchedule[vid].date = input.value;
      bookingVisitSchedule[vid].time = '';
      renderBookingSchedule();
    });
  });

  container.querySelectorAll('.booking-visit-master').forEach(select => {
    select.addEventListener('change', () => {
      const vid = select.dataset.venueId;
      bookingVisitSchedule[vid] = bookingVisitSchedule[vid] || {};
      bookingVisitSchedule[vid].master = select.value;
      bookingVisitSchedule[vid].time = '';
      bookingVenueMasters[vid] = select.value;
      renderBookingSchedule();
    });
  });

  container.querySelectorAll('.time-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const vid = btn.dataset.venueId;
      bookingVisitSchedule[vid] = bookingVisitSchedule[vid] || {};
      bookingVisitSchedule[vid].time = btn.dataset.time;
      renderBookingSchedule();
    });
  });
}

function collectBookingVisits() {
  return groupCartByVenue(bookingCart).map(group => {
    const vid = group.venueId;
    const sched = bookingVisitSchedule[vid] || {};
    const masterLabel = sched.master
      || bookingVenueMasters[vid]
      || document.getElementById('booking-master')?.value
      || 'Любой свободный мастер';
    return {
      venueId: vid,
      address: group.address,
      date: sched.date,
      time: sched.time,
      duration: getVisitDuration(group.items),
      masterId: resolveMasterId(masterLabel),
      masterLabel,
      items: group.items,
    };
  });
}

function validateBookingSchedule() {
  const visits = collectBookingVisits();
  const missing = visits.filter(v => !v.date || !v.time);
  if (missing.length) return { ok: false, message: 'Выберите дату и время для каждого адреса' };

  for (const visit of visits) {
    if (!visit.masterLabel || visit.masterLabel === '') {
      return { ok: false, message: `Нет свободных мастеров на ${visit.address} — выберите другую дату` };
    }
    const available = getAvailableStartTimesForVisit(
      visit.masterLabel,
      visit.items,
      visit.date
    );
    if (!available.includes(visit.time)) {
      return { ok: false, message: `Слот ${visit.time} на ${visit.address} недоступен — нужно непрерывное окно ${formatDuration(visit.duration)}` };
    }
    if (visit.masterLabel !== 'Любой свободный мастер'
      && !hasContinuousFreeTime(visit.masterLabel, visit.date, visit.time, visit.duration)) {
      return { ok: false, message: `У мастера нет непрерывного окна ${formatDuration(visit.duration)} с ${visit.time}` };
    }
  }
  return { ok: true, visits };
}

function updateBookingMasterFieldVisibility() {
  const field = document.getElementById('booking-master-field')
    || document.getElementById('booking-master')?.closest('.booking-form-field');
  if (!field) return;
  const groups = groupCartByVenue(bookingCart);
  field.hidden = groups.length > 1;
}

function updateBookingTotalsLabels() {
  const multi = groupCartByVenue(bookingCart).length > 1;
  const rows = document.querySelectorAll('#booking-calculator .planner-total-row span');
  if (rows[0]) rows[0].textContent = multi ? 'Итого всего' : 'Итого';
  if (rows[1]) rows[1].textContent = multi ? 'Время всего' : 'Время';
}

function updateBookingCartScroll() {
  const cartEl = document.getElementById('booking-cart');
  const wrap = cartEl?.closest('.booking-cart-wrap');
  if (!cartEl || !wrap) return;
  requestAnimationFrame(() => {
    wrap.classList.toggle('is-scrollable', cartEl.scrollHeight > cartEl.clientHeight + 4);
  });
}

function renderBookingCart() {
  const cartEl = document.getElementById('booking-cart');
  const totalEl = document.getElementById('booking-total');
  const durationEl = document.getElementById('booking-total-duration');
  const noteEl = document.getElementById('booking-total-note');
  if (!cartEl || !totalEl) return;

  const totals = renderCartList(bookingCart, cartEl, removeFromBookingCart);

  if (bookingCart.length === 0) {
    totalEl.textContent = '0 ₽';
    if (durationEl) durationEl.textContent = '0 мин';
    if (noteEl) noteEl.classList.add('hidden');
    renderBookingSchedule();
    updateBookingCartScroll();
    return;
  }

  const prefix = totals.hasFrom ? 'от ' : '';
  totalEl.textContent = totals.sum > 0 ? prefix + formatRub(totals.sum) : '—';
  if (durationEl) durationEl.textContent = formatDuration(totals.duration);
  updateBookingMasterFieldVisibility();
  updateBookingTotalsLabels();
  renderBookingSchedule();
  updateBookingCartScroll();

  if (noteEl) {
    if (groupCartByVenue(bookingCart).length > 1) {
      noteEl.textContent = 'Услуги оказываются по разным адресам — администратор согласует время визитов';
      noteEl.classList.remove('hidden');
    } else if (totals.hasVariable) {
      noteEl.textContent = 'Часть услуг без фиксированной цены — точную сумму уточнит администратор';
      noteEl.classList.remove('hidden');
    } else if (totals.hasFrom) {
      noteEl.textContent = 'Итоговая стоимость может измениться в зависимости от сложности';
      noteEl.classList.remove('hidden');
    } else {
      noteEl.classList.add('hidden');
    }
  }
}

function resetBookingCart() {
  bookingCart = [];
  bookingVisitSchedule = {};
  renderBookingCart();
  const pick = document.getElementById('booking-service-pick');
  if (pick) pick.value = '';
}

function getMastersForCart(cart) {
  if (!cart.length) return MASTERS;
  const names = new Set();
  cart.forEach(item => {
    (item.masters || []).forEach(m => names.add(m));
  });
  if (!names.size) return MASTERS;
  return MASTERS.filter(m => {
    if (m === 'Любой свободный мастер') return true;
    const short = m.split(' —')[0];
    return names.has(short);
  });
}

function updateVisitPanelHint() {
  const hint = document.getElementById('visit-panel-hint');
  const panel = document.getElementById('visit-panel');
  if (!hint || !panel) return;

  const groups = groupCartByVenue(plannerCart);
  const currentVenue = getCatalogVenue();
  const otherVenue = currentVenue === 'medical' ? 'salon' : 'medical';
  const otherLink = otherVenue === 'medical' ? 'services-medical.html' : 'services.html';
  const otherAddr = typeof SERVICE_VENUES !== 'undefined'
    ? SERVICE_VENUES[otherVenue].address
    : (otherVenue === 'medical' ? 'пр-т Андропова, д. 26' : 'ул. Кантемировская, д. 27');

  panel.classList.toggle('has-multi-venue', groups.length > 1);
  panel.classList.toggle('has-items', plannerCart.length > 0);

  if (plannerCart.length === 0) {
    hint.innerHTML = 'Нажмите <strong>+</strong> у услуги. Можно собрать визит на <strong>оба адреса</strong> — переключайте вкладки.';
    hint.classList.remove('hidden');
    return;
  }

  if (groups.length > 1) {
    hint.textContent = 'Два визита — по одному на каждый адрес';
    hint.classList.remove('hidden');
  } else if (!groups.some(g => g.venueId === otherVenue)) {
    hint.innerHTML = `Нужны услуги с другого адреса? <a href="${otherLink}" class="visit-hint-link">${otherAddr} →</a>`;
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }
}

function updateVisitTotalsLabels() {
  const multi = groupCartByVenue(plannerCart).length > 1;
  const priceLabel = document.querySelector('#visit-panel .visit-totals .planner-total-row:first-child span');
  const timeLabel = document.querySelector('#visit-panel .visit-totals .planner-total-row:last-child span');
  if (priceLabel) priceLabel.textContent = multi ? 'Итого всего' : 'Стоимость';
  if (timeLabel) timeLabel.textContent = multi ? 'Время всего' : 'Время визита';
}

function addToPlannerCart(service) {
  if (plannerCart.some(i => i.name === service.name)) return;
  plannerCart.push(cartItemFromPlanner(service));
  syncAllCartViews();
}

function removeFromPlannerCart(name) {
  plannerCart = plannerCart.filter(i => i.name !== name);
  syncAllCartViews();
}

function addServiceToCartByName(name) {
  const service = typeof PLANNER_SERVICES !== 'undefined'
    ? PLANNER_SERVICES.find(s => s.name === name)
    : null;
  if (service) {
    addToPlannerCart(service);
    return;
  }
  const item = findCatalogItem(name);
  if (item && !plannerCart.some(i => i.name === item.name)) {
    plannerCart.push(cartItemFromPlanner(item));
    syncAllCartViews();
  }
}

function toggleServiceInCart(name) {
  if (plannerCart.some(i => i.name === name)) removeFromPlannerCart(name);
  else addServiceToCartByName(name);
}

function syncAllCartViews() {
  renderPlannerCart();
  updateCartBadge();
  updateShopListCartState();
  savePlannerCart();
  saveVenueMasters();
}

function updateCartBadge() {
  const count = plannerCart.length;
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.hidden = count === 0;
  }
  const panel = document.getElementById('visit-panel');
  if (panel) panel.classList.toggle('has-items', count > 0);
}

function updateShopListCartState() {
  document.querySelectorAll('.shop-list-row[data-name]').forEach(row => {
    const inCart = plannerCart.some(i => i.name === row.dataset.name);
    row.classList.toggle('in-cart', inCart);
    const addBtn = row.querySelector('.shop-add-btn');
    if (addBtn) {
      addBtn.classList.toggle('added', inCart);
      addBtn.setAttribute('aria-label', inCart ? 'Убрать из корзины' : 'Добавить в корзину');
    }
  });
}

function renderMasterSelect(selectId, cart) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const allowed = getMastersForCart(cart);
  const prev = select.value;
  select.innerHTML = '';
  allowed.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });
  if ([...select.options].some(o => o.value === prev)) select.value = prev;
}

function renderPlannerCartList(cart, cartEl, onRemove) {
  return renderCartIntoElement(cart, cartEl, onRemove, {
    groupByVenue: true,
    venueDetails: true,
    compact: true,
    venueMasters: plannerVenueMasters,
    onVenueMasterChange: () => saveVenueMasters(),
    emptyMessage: 'Нажмите + у услуги в списке',
  });
}


function renderPlannerCart() {
  const cartEl = document.getElementById('planner-cart');
  const priceEl = document.getElementById('planner-total-price');
  const durationEl = document.getElementById('planner-total-duration');
  const noteEl = document.getElementById('planner-total-note');
  const bookBtn = document.getElementById('planner-book-btn');
  if (!cartEl) return;

  if (plannerCart.length === 0) {
    cartEl.innerHTML = '<p class="booking-cart-empty">Пока пусто — добавьте услуги кнопкой <strong>+</strong></p>';
    if (priceEl) priceEl.textContent = '0 ₽';
    if (durationEl) durationEl.textContent = '0 мин';
    if (noteEl) noteEl.classList.add('hidden');
    if (bookBtn) bookBtn.disabled = true;
    updateVisitPanelHint();
    updateVisitTotalsLabels();
    return;
  }

  const totals = renderPlannerCartList(plannerCart, cartEl, removeFromPlannerCart);
  const prefix = totals.hasFrom ? 'от ' : '';
  if (priceEl) priceEl.textContent = totals.sum > 0 ? prefix + formatRub(totals.sum) : '—';
  if (durationEl) durationEl.textContent = formatDuration(totals.duration);
  if (bookBtn) bookBtn.disabled = false;

  if (noteEl) {
    if (groupCartByVenue(plannerCart).length > 1) {
      noteEl.textContent = 'Услуги оказываются по разным адресам — администратор согласует время визитов';
      noteEl.classList.remove('hidden');
    } else if (totals.hasVariable) {
      noteEl.textContent = 'Часть услуг без фиксированной цены — уточнит администратор';
      noteEl.classList.remove('hidden');
    } else if (totals.hasFrom) {
      noteEl.textContent = 'Стоимость может измениться в зависимости от сложности';
      noteEl.classList.remove('hidden');
    } else {
      noteEl.classList.add('hidden');
    }
  }

  updateVisitPanelHint();
  updateVisitTotalsLabels();
}

function openBookingFromPlanner() {
  if (plannerCart.length === 0) {
    const cartEl = document.getElementById('planner-cart');
    if (cartEl) {
      cartEl.classList.add('booking-cart-error');
      setTimeout(() => cartEl.classList.remove('booking-cart-error'), 1200);
    }
    return;
  }

  bookingCart = plannerCart.map(item => ({ ...item }));
  bookingVenueMasters = { ...plannerVenueMasters };
  bookingVisitSchedule = {};
  openBookingModal(null, null, true);
}

function initVisitPanel() {
  if (!document.getElementById('visit-panel')) return;
  renderPlannerCart();
  updateCartBadge();

  document.getElementById('planner-book-btn')?.addEventListener('click', openBookingFromPlanner);
  document.getElementById('visit-clear-btn')?.addEventListener('click', () => {
    plannerCart = [];
    syncAllCartViews();
  });
}

function initMastersGrid() {
  if (!document.getElementById('masters-list')) return;
  renderMastersList();
}

function isMasterInVenue(master, venue) {
  if (typeof masterWorksAtVenue === 'function') return masterWorksAtVenue(master, venue);
  const salonCats = ['barber', 'hair', 'nails', 'cosmetology', 'sugaring', 'massage'];
  const medicalCats = ['laser', 'apparatus'];
  if (venue === 'medical') return master.categories.some(cat => medicalCats.includes(cat));
  return master.categories.some(cat => salonCats.includes(cat));
}

function getMastersVenueAddress(venueId) {
  if (typeof SERVICE_VENUES !== 'undefined' && SERVICE_VENUES[venueId]) {
    return SERVICE_VENUES[venueId].addressFull;
  }
  return venueId === 'medical' ? 'пр-т Андропова, д. 26' : 'ул. Кантемировская, д. 27';
}

function renderMasterDirectoryItem(m) {
  const badge = m.topMaster ? '<span class="masters-directory__badge">Топ</span>' : '';

  return `
    <li class="masters-directory__item reveal" data-name="${escAttr(m.displayName)}">
      <span class="masters-directory__name">${escAttr(m.displayName)}${badge}</span>
      <span class="masters-directory__role">${escAttr(m.specialty)}</span>
    </li>
  `;
}

function renderMastersList() {
  const list = document.getElementById('masters-list');
  if (!list || typeof MASTERS_DATA === 'undefined') return;

  const masters = [...MASTERS_DATA];
  const salonMasters = masters.filter(m => isMasterInVenue(m, 'salon'));
  const medicalMasters = masters.filter(m => isMasterInVenue(m, 'medical'));
  const blocks = [];

  if (salonMasters.length) {
    blocks.push(`
      <section class="masters-section reveal" data-section="masters-salon">
        <header class="ds-section-header masters-section__head">
          <span class="ds-overline">Основной салон</span>
          <h2 class="ds-title text-h2">Немедицинский салон</h2>
          <p class="ds-lead text-body">${escAttr(getMastersVenueAddress('salon'))}</p>
        </header>
        <ul class="masters-directory content-surface">${salonMasters.map(renderMasterDirectoryItem).join('')}</ul>
      </section>
    `);
  }

  if (medicalMasters.length) {
    blocks.push(`
      <section class="masters-section reveal" data-section="masters-medical">
        <header class="ds-section-header masters-section__head">
          <span class="ds-overline">Медицина</span>
          <h2 class="ds-title text-h2">Медицинский кабинет</h2>
          <p class="ds-lead text-body">${escAttr(getMastersVenueAddress('medical'))}</p>
        </header>
        <ul class="masters-directory content-surface">${medicalMasters.map(renderMasterDirectoryItem).join('')}</ul>
      </section>
    `);
  }

  list.innerHTML = blocks.join('');
  observeReveal();
}

function getServicePageUrl(serviceName) {
  const item = findCatalogItem(serviceName);
  const venueId = item?.venueId || getItemVenueId(item?.name || serviceName);
  const page = venueId === 'medical' ? 'services-medical.html' : 'services.html';
  return `${page}?service=${encodeURIComponent(item?.name || serviceName)}`;
}

function scrollToServiceInCatalog(serviceName, { exactOnly = false } = {}) {
  const item = findCatalogItem(serviceName, { exactOnly });
  const displayName = item ? getServiceDisplayName(item) : serviceName;
  const target = [...document.querySelectorAll('#shop-grid .shop-list-item')].find(
    el => el.dataset.name === displayName
  );
  if (!target) return;
  setShopListItemExpanded(target.querySelector('.shop-list-row'), true);
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initServicesCatalogRender() {
  if (!document.getElementById('shop-grid')) return;
  initShopFilters();

  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const query = params.get('q');
  const hash = window.location.hash.slice(1);
  if (hash && !service && !query && getVenueSections().some(sec => sec.id === hash)) {
    shopFilterState.categories.add(hash);
  }
  if (query && !service) {
    shopFilterState.search = query;
    const input = document.getElementById('shop-search-input');
    if (input) input.value = query;
  } else if (service) {
    const item = findCatalogItem(service, { exactOnly: true });
    const displayName = item ? getServiceDisplayName(item) : service;
    shopFilterState.search = displayName;
    const input = document.getElementById('shop-search-input');
    if (input) input.value = displayName;
  }

  syncShopFilterUI();
  renderShopGrid();

  if (service) {
    requestAnimationFrame(() => scrollToServiceInCatalog(service, { exactOnly: true }));
    return;
  }

  if (hash && shopFilterState.categories.has(hash)) {
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

let shopFilterState = { search: '', categories: new Set() };

function updateMobileFilterBtnBadge(btn, state) {
  if (!btn) return;
  const count = state.categories.size + (state.search?.trim() ? 1 : 0);
  let badge = btn.querySelector('.shop-filters-mobile-btn__badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'shop-filters-mobile-btn__badge';
      btn.appendChild(badge);
    }
    badge.textContent = String(count);
    btn.classList.add('has-active-filters');
  } else {
    badge?.remove();
    btn.classList.remove('has-active-filters');
  }
}

function initMobileFilterSheet({
  key,
  buttonInsertBefore,
  getAppliedState,
  onApply,
  renderChips,
  categoryLabel = 'КАТЕГОРИЯ',
  placement = 'bottom',
}) {
  const insertBeforeEl = document.querySelector(buttonInsertBefore);
  if (!insertBeforeEl) return null;

  const openId = `${key}-filters-open`;
  const sheetId = `${key}-filters-sheet`;
  const toolbarId = `${key}-filters-toolbar`;

  let toolbar = document.getElementById(toolbarId);
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = toolbarId;
    toolbar.className = 'shop-filters-mobile-toolbar reveal';
    insertBeforeEl.parentNode.insertBefore(toolbar, insertBeforeEl);
  }

  let openBtn = document.getElementById(openId);
  if (!openBtn) {
    openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.id = openId;
    openBtn.className = 'shop-filters-mobile-btn';
    openBtn.setAttribute('aria-haspopup', 'dialog');
    openBtn.setAttribute('aria-controls', sheetId);
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.innerHTML = '<i class="fa-solid fa-filter" aria-hidden="true"></i><span>Фильтры</span>';
  }
  toolbar.appendChild(openBtn);

  let sheet = document.getElementById(sheetId);
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = sheetId;
    sheet.className = `shop-filters-sheet${placement === 'top' ? ' shop-filters-sheet--top' : ''}`;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', `${sheetId}-title`);
    sheet.hidden = true;
    sheet.innerHTML = `
      <div class="shop-filters-sheet-backdrop" data-sheet-close tabindex="-1"></div>
      <div class="shop-filters-sheet-panel">
        ${placement === 'bottom' ? '<div class="shop-filters-sheet-handle" aria-hidden="true"></div>' : ''}
        <div class="shop-filters-sheet-header">
          <h2 class="shop-filters-sheet-title" id="${sheetId}-title">Фильтры</h2>
          <button type="button" class="shop-filters-sheet-close" data-sheet-close>Закрыть</button>
        </div>
        <div class="shop-filters-sheet-body">
          <div class="shop-search shop-search--sheet">
            <i class="fa-solid fa-magnifying-glass shop-search-icon" aria-hidden="true"></i>
            <input type="search" id="${key}-search-mobile" class="shop-search-input" placeholder="Поиск..." autocomplete="off">
          </div>
          <div class="shop-filter-group shop-filter-group--sheet">
            <h3 class="shop-filter-label">${categoryLabel}</h3>
            <div id="${key}-category-chips" class="shop-filter-chips-wrap"></div>
          </div>
        </div>
        <div class="shop-filters-sheet-footer">
          <button type="button" class="shop-filters-sheet-apply lo-pill-btn lo-pill-btn--sm" data-sheet-apply>Применить</button>
        </div>
        ${placement === 'top' ? '<div class="shop-filters-sheet-handle shop-filters-sheet-handle--bottom" aria-hidden="true"></div>' : ''}
      </div>
    `;
    document.body.appendChild(sheet);
  }

  const chipsWrap = document.getElementById(`${key}-category-chips`);
  const searchMobile = document.getElementById(`${key}-search-mobile`);
  let pending = { search: '', categories: new Set() };

  const syncPendingFromApplied = () => {
    const applied = getAppliedState();
    pending = {
      search: applied.search,
      categories: new Set(applied.categories),
    };
    if (searchMobile) searchMobile.value = pending.search;
    renderChips(chipsWrap, pending.categories);
  };

  const closeSheet = () => {
    sheet.classList.remove('is-open');
    document.body.classList.remove('shop-filters-sheet-open');
    openBtn.setAttribute('aria-expanded', 'false');
    let finished = false;
    const finishClose = () => {
      if (finished) return;
      finished = true;
      sheet.hidden = true;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
      return;
    }
    const panel = sheet.querySelector('.shop-filters-sheet-panel');
    const onEnd = (e) => {
      if (e.target !== panel) return;
      panel.removeEventListener('transitionend', onEnd);
      finishClose();
    };
    panel?.addEventListener('transitionend', onEnd);
    window.setTimeout(finishClose, 400);
  };

  const openSheet = () => {
    syncPendingFromApplied();
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    document.body.classList.add('shop-filters-sheet-open');
    openBtn.setAttribute('aria-expanded', 'true');
    searchMobile?.focus();
  };

  openBtn.addEventListener('click', openSheet);

  sheet.querySelectorAll('[data-sheet-close]').forEach(el => {
    el.addEventListener('click', closeSheet);
  });

  sheet.querySelector('[data-sheet-apply]')?.addEventListener('click', () => {
    pending.search = searchMobile?.value || '';
    onApply(pending);
    updateMobileFilterBtnBadge(openBtn, getAppliedState());
    closeSheet();
  });

  chipsWrap?.addEventListener('click', (e) => {
    const chip = e.target.closest('.shop-filter-chip');
    if (!chip) return;
    const value = chip.dataset.value;
    if (pending.categories.has(value)) {
      pending.categories.delete(value);
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    } else {
      pending.categories.add(value);
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
    }
  });

  if (!sheet.dataset.escBound) {
    sheet.dataset.escBound = '1';
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
    });
  }

  updateMobileFilterBtnBadge(openBtn, getAppliedState());

  return { syncPendingFromApplied, updateBadge: () => updateMobileFilterBtnBadge(openBtn, getAppliedState()) };
}

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function getAllCatalogItems() {
  if (typeof CATALOG_SECTIONS === 'undefined') return [];
  return getVenueSections().flatMap(sec =>
    sec.groups.flatMap(g => g.items.map(item => ({
      ...item,
      sectionId: sec.id,
      sectionTitle: sec.title,
      venueId: typeof venueIdForSection === 'function' ? venueIdForSection(sec.id) : getItemVenueId(item.name),
      category: item.promo ? 'promo' : (item.category || sec.cat || 'other'),
    })))
  );
}

function getDiscountPercent(item) {
  if (!item.oldPrice || !item.price || item.oldPrice <= item.price) return null;
  return Math.round((1 - item.price / item.oldPrice) * 100);
}

function getServiceDisplayName(item) {
  return String(item.name)
    .replace(/^АКЦИЯ!\s*/i, '')
    .replace(/^Акция!\s*/i, '')
    .replace(/^АКЦИЯ\s+[N№]\d+:\s*/i, '')
    .replace(/^Акция\s+«(.+)»$/i, '$1')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function setShopListItemExpanded(rowBtn, expanded) {
  if (!rowBtn) return;
  const item = rowBtn.closest('.shop-list-item');
  const desc = item?.querySelector('.shop-list-desc');
  const icon = rowBtn.querySelector('.shop-toggle-icon');
  const name = item?.dataset.name || 'услуги';
  const isMaster = rowBtn.classList.contains('master-list-row');
  const showLabel = isMaster ? `Показать о мастере: ${name}` : `Показать описание: ${name}`;
  const hideLabel = isMaster ? `Скрыть описание: ${name}` : `Скрыть описание: ${name}`;

  rowBtn.setAttribute('aria-expanded', String(expanded));
  rowBtn.setAttribute('aria-label', expanded ? hideLabel : showLabel);
  if (icon) icon.textContent = expanded ? '−' : '+';
  if (desc) {
    desc.classList.toggle('is-open', expanded);
    desc.setAttribute('aria-hidden', String(!expanded));
  }
  item?.classList.toggle('is-expanded', expanded);
}

function collapseAllShopListItemsExcept(exceptItem) {
  document.querySelectorAll('#shop-grid .shop-list-item.is-expanded, #masters-list .shop-list-item.is-expanded').forEach(openItem => {
    if (openItem === exceptItem) return;
    setShopListItemExpanded(openItem.querySelector('.shop-list-row'), false);
  });
}

function bindShopListAccordions(root) {
  if (!root) return;
  root.querySelectorAll('.shop-list-item .shop-list-row').forEach(rowBtn => {
    rowBtn.addEventListener('click', () => toggleShopListItem(rowBtn));
  });
}

function toggleShopListItem(rowBtn) {
  const expanded = rowBtn.getAttribute('aria-expanded') === 'true';
  const item = rowBtn.closest('.shop-list-item');

  if (!expanded) {
    collapseAllShopListItemsExcept(item);
    setShopListItemExpanded(rowBtn, true);
  } else {
    setShopListItemExpanded(rowBtn, false);
  }
}

function getServiceLead(item) {
  const name = item.name;
  const n = name.toLowerCase();

  if (item.promo) {
    const displayName = getServiceDisplayName(item);
    return `«${displayName}» — специальное предложение GLORIS BEAUTY. Уточните условия и срок действия у администратора.`;
  }

  const byKeyword = [
    [/стрижка.*детск|детск.*стрижк/i, `«${name}» — бережная детская стрижка в спокойной атмосфере, с учётом возраста и пожеланий родителей.`],
    [/стрижка|подравниван|челк/i, `«${name}» — стрижка с мытьём и укладкой по форме, мастер подберёт длину и контуры под ваш тип волос.`],
    [/укладк|локон|плетен|прическ|гофре|феном|плойк|утюжок/i, `«${name}» — укладка или причёска: мастер создаст аккуратный образ на каждый день или для особого случая.`],
    [/окрашив|мелирован|тонирован|блонд|шатуш|омбре|балаяж|airtouch|растяжк|декапир|биозавивк|завивк/i, `«${name}» — окрашивание или химическая завивка: подбор оттенка, техники и ухода после процедуры.`],
    [/lebel|спа|уход|vitamino|metal detox|счасть/i, `«${name}» — SPA-уход для волос: восстановление, блеск и питание профессиональными японскими составами.`],
    [/бород|усов|камуфляж|седин/i, `«${name}» — уход за бородой и усами: оформление линий, тонирование седины, аккуратный мужской образ.`],
    [/маникюр|педикюр|гель-лак|ногт|френч|покрытие|снятие|выравниван.*ногт|парафин|мозол|натоптыш/i, `«${name}» — маникюр или педикюр: стерильные инструменты, аккуратная обработка и стойкое покрытие по желанию.`],
    [/бров|ресниц|ламинирован/i, `«${name}» — оформление бровей или ресниц: коррекция формы, окрашивание, выразительный и естественный результат.`],
    [/чистк|пилинг|массаж лица|буккальн|гуаша|мезотерап|микроток|карбокси|rf-лифтинг|rf лифтинг|пилинг|уход|маск/i, `«${name}» — косметологическая процедура для лица: очищение, уход или аппаратное воздействие под тип кожи.`],
    [/крио|азот|папиллом|бородав|жировик/i, `«${name}» — процедура с применением жидкого азота или криомассажа, проводится квалифицированным специалистом.`],
    [/прокол|серьг/i, `«${name}» — безопасный прокол ушей и подбор серёг, консультация по уходу после процедуры.`],
    [/биоэпиляци|шугаринг|эпиляци/i, `«${name}» — удаление нежелательных волос: деликатная работа с кожей, рекомендации по уходу после сеанса.`],
    [/анестез|эмла/i, `«${name}» — обезболивающий крем перед эпиляцией для более комфортной процедуры.`],
    [/массаж|лимфодренаж|антицеллюлит|моделирующ/i, `«${name}» — массаж в отдельном кабинете: расслабление мышц, улучшение тонуса и комфорт во время сеанса.`],
    [/лазер|эпиляци.*зон|бикини|подмыш/i, `«${name}» — лазерная эпиляция на медицинском оборудовании: подбор параметров под тип кожи и волос.`],
    [/кавитаци|липолиз|вакуумн|аппаратн|комплекс-/i, `«${name}» — аппаратная косметология: коррекция фигуры и уход за кожей тела на профессиональном оборудовании.`],
    [/мытье|массаж головы/i, `«${name}» — мытьё и массаж кожи головы для расслабления и свежего ощущения.`],
    [/машинк|насадк/i, `«${name}» — стрижка машинкой: ровная длина и чёткий контур по вашему запросу.`],
  ];

  const matched = byKeyword.find(([re]) => re.test(name));
  if (matched) return matched[1];

  const bySection = {
    barbershop: `«${name}» — услуга в мужском зале GLORIS BEAUTY: стрижка, борода и уход с вниманием к деталям.`,
    hair: `«${name}» — процедура для волос в женском зале: стрижка, укладка, окрашивание или уход.`,
    nails: `«${name}» — ногтевой сервис: аккуратная работа мастера и стойкий результат.`,
    cosmetology: `«${name}» — косметологическая услуга: уход за кожей лица и зоны вокруг глаз.`,
    sugaring: `«${name}» — эпиляция или шугаринг с подбором комфортного режима для вашей кожи.`,
    massage: `«${name}» — массаж в отдельном кабинете.`,
    laser: `«${name}» — лазерная эпиляция на медицинском оборудовании: подбор параметров под тип кожи и волос.`,
    apparatus: `«${name}» — аппаратная процедура для тела и лица на профессиональном оборудовании.`,
  };

  return bySection[item.sectionId] || `«${name}» — услуга салона GLORIS BEAUTY. Уточните детали у администратора.`;
}

function getServiceDescription(item) {
  if (item.desc) return item.desc;
  return getServiceLead(item);
}

function getCatalogGroupId(sectionId, groupTitle) {
  if (!groupTitle) return null;
  const slug = groupTitle
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${sectionId}--${slug}`;
}

function enrichCatalogItem(sec, group, item) {
  return {
    ...item,
    sectionId: sec.id,
    sectionTitle: sec.title,
    groupTitle: group.title || null,
    groupId: getCatalogGroupId(sec.id, group.title),
    venueId: typeof venueIdForSection === 'function' ? venueIdForSection(sec.id) : getItemVenueId(item.name),
    category: item.promo ? 'promo' : (item.category || sec.cat || 'other'),
  };
}

function itemMatchesSearch(item, search) {
  if (!search) return true;
  const q = search.toLowerCase();
  return item.name.toLowerCase().includes(q)
    || getServiceDisplayName(item).toLowerCase().includes(q)
    || (item.groupTitle && item.groupTitle.toLowerCase().includes(q));
}

function syncShopSearchInputs() {
  const value = shopFilterState.search;
  const desktop = document.getElementById('shop-search-input');
  const mobile = document.getElementById('shop-search-mobile');
  if (desktop) desktop.value = value;
  if (mobile) mobile.value = value;
}

function getMobileSectionLabel(sec) {
  const short = {
    barbershop: 'Мужской зал',
    hair: 'Волосы',
    nails: 'Ногти',
    cosmetology: 'Косметология',
    sugaring: 'Шугаринг',
    massage: 'Массаж',
    laser: 'Лазер',
    apparatus: 'Аппаратная',
  };
  return short[sec.id] || sec.title;
}

function syncShopMobileTags() {
  const wrap = document.getElementById('shop-mobile-category-chips');
  if (!wrap) return;
  const selected = shopFilterState.categories;
  wrap.querySelectorAll('.shop-filter-chip').forEach(chip => {
    const active = selected.has(chip.dataset.value);
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function updateShopMobileClearBtn() {
  const btn = document.getElementById('shop-mobile-clear');
  if (!btn) return;
  const active = !!shopFilterState.search.trim() || shopFilterState.categories.size > 0;
  btn.hidden = !active;
}

function syncShopFilterUI() {
  syncShopCategoryCheckboxes();
  syncShopMobileTags();
  syncShopSearchInputs();
  updateShopMobileClearBtn();
}

function initShopMobileInlineFilters(sections) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  document.getElementById('shop-filters-toolbar')?.remove();
  document.getElementById('shop-filters-sheet')?.remove();

  let bar = document.getElementById('shop-mobile-filters');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'shop-mobile-filters';
    bar.className = 'shop-mobile-filters reveal';
    bar.setAttribute('aria-label', 'Поиск и категории');
    grid.parentNode.insertBefore(bar, grid);

    bar.addEventListener('input', (e) => {
      if (e.target.id !== 'shop-search-mobile') return;
      shopFilterState.search = e.target.value;
      syncShopSearchInputs();
      updateShopMobileClearBtn();
      renderShopGrid();
    });

    bar.addEventListener('click', (e) => {
      if (e.target.closest('#shop-mobile-clear')) {
        shopFilterState.search = '';
        shopFilterState.categories.clear();
        syncShopFilterUI();
        renderShopGrid();
        return;
      }

      const chip = e.target.closest('#shop-mobile-category-chips .shop-filter-chip');
      if (!chip) return;
      const value = chip.dataset.value;
      if (shopFilterState.categories.has(value)) {
        shopFilterState.categories.delete(value);
      } else {
        shopFilterState.categories.add(value);
      }
      syncShopFilterUI();
      renderShopGrid();
    });
  }

  const selected = shopFilterState.categories;
  bar.innerHTML = `
    <div class="shop-mobile-filters-search">
      <div class="shop-search shop-search--pill">
        <i class="fa-solid fa-magnifying-glass shop-search-icon" aria-hidden="true"></i>
        <input type="search" id="shop-search-mobile" class="shop-search-input" placeholder="Поиск услуг..." autocomplete="off" value="${escAttr(shopFilterState.search)}" enterkeyhint="search">
      </div>
      <button type="button" id="shop-mobile-clear" class="shop-clear-btn shop-mobile-clear"${shopFilterState.search.trim() || selected.size ? '' : ' hidden'}>Сбросить</button>
    </div>
    <div class="shop-mobile-tags-scroll" aria-label="Категории">
      <div class="shop-filter-chips shop-mobile-category-chips" id="shop-mobile-category-chips">
        ${sections.map(sec => `
          <button type="button" class="shop-filter-chip${selected.has(sec.id) ? ' is-active' : ''}" data-value="${sec.id}" aria-pressed="${selected.has(sec.id)}" title="${escAttr(sec.title)}">${getMobileSectionLabel(sec)}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function syncShopCategoryCheckboxes() {
  const container = document.getElementById('shop-category-filters');
  if (!container) return;
  container.querySelectorAll('.shop-cat-check').forEach(c => {
    c.checked = shopFilterState.categories.has(c.value);
  });
}

function renderShopGrid() {
  const grid = document.getElementById('shop-grid');
  const empty = document.getElementById('shop-empty');
  if (!grid) return;

  const search = shopFilterState.search.toLowerCase().trim();
  const hasFilter = search || shopFilterState.categories.size > 0;
  const sections = getVenueSections();

  const filteredSections = sections.map(sec => {
    if (shopFilterState.categories.size > 0 && !shopFilterState.categories.has(sec.id)) {
      return null;
    }
    const groups = sec.groups.map(group => {
      const items = group.items
        .map(item => enrichCatalogItem(sec, group, item))
        .filter(item => itemMatchesSearch(item, search));
      return items.length ? { title: group.title, items } : null;
    }).filter(Boolean);
    return groups.length ? { ...sec, groups } : null;
  }).filter(Boolean);

  const totalItems = filteredSections.reduce(
    (sum, sec) => sum + sec.groups.reduce((gs, g) => gs + g.items.length, 0),
    0
  );
  empty?.classList.toggle('hidden', totalItems > 0);

  const renderRow = (item) => {
    const displayName = getServiceDisplayName(item);
    const badge = item.promo
      ? '<span class="shop-list-badge shop-list-badge--promo">Акция</span>'
      : '';
    const priceHtml = item.oldPrice
      ? `<span class="shop-list-price-old">${formatRub(item.oldPrice)}</span><span class="shop-list-price">${formatServicePrice(item)}</span>`
      : `<span class="shop-list-price">${formatServicePrice(item)}</span>`;
    const description = getServiceDescription(item);

    return `
      <div class="shop-list-item reveal" data-name="${escAttr(displayName)}">
        <button type="button" class="shop-list-row" aria-expanded="false" aria-label="Показать описание: ${escAttr(displayName)}">
          <span class="shop-toggle-icon" aria-hidden="true">+</span>
          <span class="shop-list-name-wrap">
            <span class="shop-list-name">${displayName}</span>
            ${badge}
          </span>
          <span class="shop-list-leader" aria-hidden="true"></span>
          <span class="shop-list-side">
            ${item.duration ? `<span class="shop-list-meta">${formatDuration(item.duration)}</span>` : ''}
            <span class="shop-list-prices">${priceHtml}</span>
          </span>
        </button>
        <div class="shop-list-desc" aria-hidden="true">
          <div class="shop-list-desc-inner">
            <p>${escAttr(description)}</p>
          </div>
        </div>
      </div>
    `;
  };

  grid.innerHTML = filteredSections.map(sec => {
    const groupsHtml = sec.groups.map(group => {
      const groupId = getCatalogGroupId(sec.id, group.title);
      const subgroupTitle = group.title
        ? `<h4 class="shop-list-subgroup-title"${groupId ? ` id="${groupId}"` : ''}>${group.title}</h4>`
        : '';
      return `
        <div class="shop-list-subgroup">
          ${subgroupTitle}
          <div class="shop-list-rows">${group.items.map(renderRow).join('')}</div>
        </div>
      `;
    }).join('');

    return `
      <section class="shop-list-group shop-list-group--${sec.id}${hasFilter ? ' shop-list-group--filtered' : ''} reveal" id="${sec.id}" data-section="${sec.id}">
        <h2 class="shop-list-group-title">${sec.title}</h2>
        ${groupsHtml}
      </section>
    `;
  }).join('');

  bindShopListAccordions(grid);
  document.getElementById('shop-section-nav')?.remove();
  syncShopMobileTags();
  updateShopMobileClearBtn();
  observeReveal();
}

function initShopFilters() {
  const container = document.getElementById('shop-category-filters');
  if (!container || typeof CATALOG_SECTIONS === 'undefined') return;

  const sections = getVenueSections();
  const venueLabel = getCatalogVenue() === 'medical' ? 'Медицина' : 'Салон';

  container.innerHTML = `
    <div class="masters-filter-venue">
      <p class="masters-filter-venue-label">${venueLabel}</p>
      ${sections.map(sec => `
        <label class="shop-checkbox">
          <input type="checkbox" value="${sec.id}" class="shop-cat-check">
          <span class="shop-checkbox-box" aria-hidden="true"></span>
          <span class="shop-checkbox-label">${sec.title}</span>
        </label>
      `).join('')}
    </div>
  `;

  document.getElementById('shop-search-input')?.addEventListener('input', (e) => {
    shopFilterState.search = e.target.value;
    syncShopSearchInputs();
    updateShopMobileClearBtn();
    renderShopGrid();
  });

  container.querySelectorAll('.shop-cat-check').forEach(cb => {
    cb.addEventListener('change', () => {
      shopFilterState.categories.clear();
      container.querySelectorAll('.shop-cat-check:checked').forEach(c => {
        shopFilterState.categories.add(c.value);
      });
      syncShopFilterUI();
      renderShopGrid();
    });
  });

  initShopMobileInlineFilters(sections);

  document.getElementById('shop-clear-filters')?.addEventListener('click', () => {
    shopFilterState.search = '';
    shopFilterState.categories.clear();
    syncShopFilterUI();
    renderShopGrid();
  });
}

/* ----- Service subnav scroll arrows ----- */
function initSubnavScroll() {
  const scroll = document.querySelector('.subnav-scroll');
  const prev = document.querySelector('.subnav-arrow--prev');
  const next = document.querySelector('.subnav-arrow--next');
  if (!scroll || !prev || !next) return;

  function getStep() {
    return Math.max(140, Math.round(scroll.clientWidth * 0.6));
  }

  function updateArrows() {
    const max = scroll.scrollWidth - scroll.clientWidth;
    const canScroll = max > 2;
    prev.disabled = !canScroll || scroll.scrollLeft <= 2;
    next.disabled = !canScroll || scroll.scrollLeft >= max - 2;
  }

  prev.addEventListener('click', () => scroll.scrollBy({ left: -getStep(), behavior: 'smooth' }));
  next.addEventListener('click', () => scroll.scrollBy({ left: getStep(), behavior: 'smooth' }));
  scroll.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

/* ----- Phone mask: +7 (XXX) XXX-XX-XX ----- */
function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  else if (digits.length && digits[0] !== '7') digits = '7' + digits;
  digits = digits.slice(0, 11);

  if (!digits.length) return '';
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function initPhoneMask() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    if (input.dataset.phoneMask) return;
    input.dataset.phoneMask = '1';
    if (!input.placeholder) input.placeholder = '+7 (___) ___-__-__';

    input.addEventListener('input', () => {
      const pos = input.selectionStart || 0;
      const prev = input.value;
      const formatted = formatPhone(prev);
      input.value = formatted;
      const diff = formatted.length - prev.length;
      const newPos = Math.max(0, Math.min(formatted.length, pos + diff));
      input.setSelectionRange(newPos, newPos);
    });

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 ';
    });

    input.addEventListener('blur', () => {
      if (input.value === '+7' || input.value === '+7 ') input.value = '';
    });
  });
}

/* ----- Side menu ----- */
function openSideMenu() {
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('menu-overlay');
  const burger = document.getElementById('burger');
  if (!menu || !overlay) return;
  if (typeof window.closeYcWidget === 'function') {
    window.closeYcWidget();
  }
  menu.classList.add('open');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  document.body.classList.remove('yc-widget-body-open');
  if (burger) burger.setAttribute('aria-expanded', 'true');
}

function closeSideMenu() {
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('menu-overlay');
  const burger = document.getElementById('burger');
  if (!menu || !overlay) return;
  menu.classList.remove('open');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  if (burger) burger.setAttribute('aria-expanded', 'false');
}

window.closeSideMenu = closeSideMenu;

function initMobileHeaderCta() {
  const cta = document.querySelector('.top-nav-cta.yc-widget-open');
  const end = document.querySelector('.top-nav-end');
  if (!cta || !end) return;

  cta.classList.remove('top-nav-cta--mobile-fab');
  if (cta.parentElement !== end) {
    end.appendChild(cta);
  }

  updateSiteHeaderHeight();
}

function initMobileMenu() {
  const burger = document.getElementById('burger');
  const closeBtn = document.getElementById('menu-close');
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('menu-overlay');
  if (!burger || !menu || !overlay) return;

  burger.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeSideMenu();
    else openSideMenu();
  });

  closeBtn?.addEventListener('click', closeSideMenu);
  overlay.addEventListener('click', closeSideMenu);

  document.querySelectorAll('.side-nav-link').forEach(link => {
    link.addEventListener('click', closeSideMenu);
  });

  document.querySelectorAll('.side-menu-book.yc-widget-open').forEach(btn => {
    btn.addEventListener('click', closeSideMenu);
  });
}

/* ----- Scroll reveal ----- */
function observeReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* ----- Booking modal ----- */
function populateBookingSelects() {
  const masterSelect = document.getElementById('booking-master');
  const timeSelect = document.getElementById('booking-time');

  if (masterSelect && masterSelect.options.length <= 1) {
    MASTERS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      masterSelect.appendChild(opt);
    });
  }

  if (timeSelect && timeSelect.options.length <= 1) {
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'Выберите время';
    timeSelect.appendChild(empty);
    TIME_SLOTS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      timeSelect.appendChild(opt);
    });
  }
}

function openBookingModal(service, master, preserveCart) {
  const modal = document.getElementById('booking-modal');
  const form = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  if (!modal) return;

  populateBookingSelects();
  if (!preserveCart) {
    resetBookingCart();
    bookingVenueMasters = {};
    bookingVisitSchedule = {};
  } else {
    if (!Object.keys(bookingVenueMasters).length) {
      bookingVenueMasters = { ...plannerVenueMasters };
    }
    renderBookingCart();
  }

  const plannerMasterVal = preserveCart
    ? getPrimaryVenueMaster(bookingVenueMasters, bookingCart)
    : null;

  if (form) { form.style.display = 'block'; form.reset(); }
  if (success) success.classList.add('hidden');

  if (service) {
    const resolved = findServiceOption(service);
    if (resolved) addToBookingCart(resolved);
    else addToBookingCart(service);
  }

  const bookingMaster = document.getElementById('booking-master');
  if (master && bookingMaster) {
    for (const opt of bookingMaster.options) {
        if (opt.text.includes(master)) {
        bookingMaster.value = opt.value;
          break;
        }
      }
  } else if (plannerMasterVal && bookingMaster) {
    bookingMaster.value = plannerMasterVal;
  }

  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateBookingMasterFieldVisibility();
  renderBookingSchedule();
  updateBookingCartScroll();
}

function getPrimaryVenueMaster(mastersMap, cart) {
  const groups = groupCartByVenue(cart);
  if (groups.length === 1) return mastersMap[groups[0].venueId] || null;
  return null;
}

function closeBookingModal(e) {
  if (e && e.target !== e.currentTarget && e !== undefined) return;
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function submitBooking(e) {
  e.preventDefault();

  if (bookingCart.length === 0) {
    const cartEl = document.getElementById('booking-cart');
    if (cartEl) {
      cartEl.classList.add('booking-cart-error');
      setTimeout(() => cartEl.classList.remove('booking-cart-error'), 1200);
    }
    return;
  }

  const scheduleCheck = validateBookingSchedule();
  if (!scheduleCheck.ok) {
    const noteEl = document.getElementById('booking-total-note');
    if (noteEl) {
      noteEl.textContent = scheduleCheck.message;
      noteEl.classList.remove('hidden');
      setTimeout(() => noteEl.classList.add('hidden'), 2500);
    }
    return;
  }

  bookVisitSlots(scheduleCheck.visits);

  const form = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  if (form) form.style.display = 'none';
  if (success) success.classList.remove('hidden');

  const sum = bookingCart.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalMin = bookingCart.reduce((acc, item) => acc + (item.duration || 0), 0);
  const master = document.getElementById('booking-master')?.value || '';
  const groups = groupCartByVenue(bookingCart);
  const mastersMap = { ...bookingVenueMasters };
  if (groups.length === 1) {
    mastersMap[groups[0].venueId] = master || mastersMap[groups[0].venueId] || 'Любой свободный мастер';
  }
  let successText = success?.querySelector('p');
  if (!successText && success) {
    successText = document.createElement('p');
    successText.className = 'text-gray-500 text-sm mt-2';
    success.appendChild(successText);
  }
  if (successText) {
    const parts = [`Визиты: ${formatVenueBookingSummary(bookingCart, mastersMap, bookingVisitSchedule)}`];
    if (sum > 0) parts.push(`Сумма: ${formatRub(sum)}`);
    if (totalMin > 0) parts.push(`Время: ${formatDuration(totalMin)}`);
    if (groups.length === 1 && master) parts.push(`Мастер: ${master}`);
    parts.push('Мы перезвоним для подтверждения.');
    successText.textContent = parts.join('. ') + '.';
  }

  setTimeout(() => closeBookingModal(), 3500);
}

/* ----- Active nav link ----- */
function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.nav-link, .top-nav-link').forEach(link => {
    if (link.dataset.page === page) link.classList.add('active');
  });
}

/* ----- Escape key ----- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookingModal();
    closeSideMenu();
  }
});

/* ===== УМНЫЕ ВРЕМЕННЫЕ СЛОТЫ ===== */

const BOOKINGS_STORAGE_KEY = 'gloris-bookings';
const WORK_DAY_START = 10 * 60;
const WORK_DAY_END = 21 * 60;

function getVisitDuration(items) {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + (item.duration || 0), 0);
}

function masterLabelsMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const shortA = a.split(' —')[0].trim();
  const shortB = b.split(' —')[0].trim();
  return shortA === shortB;
}

function getMasterBookings(masterLabel, date) {
  const bookings = [];

  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(b => {
          if (b.date === date && masterLabelsMatch(b.masterLabel, masterLabel)) {
            bookings.push({
              startTime: b.startTime,
              endTime: b.endTime,
            });
          }
        });
      }
    }
  } catch { /* ignore */ }

  if (typeof loadBookedSlots === 'function') {
    loadBookedSlots().forEach(b => {
      if (b.date !== date) return;
      const label = b.masterLabel
        || (typeof MASTERS !== 'undefined'
          ? MASTERS.find(m => m.startsWith(b.masterId))
          : null)
        || b.masterId;
      if (!masterLabelsMatch(label, masterLabel) && b.masterId !== 'any') return;
      if (b.masterId === 'any' || masterLabel === 'Любой свободный мастер') return;
      const startMin = timeToMinutes(b.time);
      bookings.push({
        startTime: b.time,
        endTime: minutesToTime(startMin + (b.duration || 0)),
      });
    });
  }

  return bookings;
}

function hasContinuousFreeTime(masterLabel, date, startTime, duration) {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + duration;
  const bookings = getMasterBookings(masterLabel, date);

  for (const booking of bookings) {
    const bStart = timeToMinutes(booking.startTime);
    const bEnd = timeToMinutes(booking.endTime);
    if (startMin < bEnd && endMin > bStart) return false;
  }
  return true;
}

function getMasterFreeWindows(masterLabel, date) {
  const bookings = getMasterBookings(masterLabel, date);
  const sorted = [...bookings].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const windows = [];
  let currentStart = WORK_DAY_START;

  for (const booking of sorted) {
    const bStart = timeToMinutes(booking.startTime);
    const bEnd = timeToMinutes(booking.endTime);
    if (bStart > currentStart) {
      windows.push({ start: currentStart, end: bStart });
    }
    currentStart = Math.max(currentStart, bEnd);
  }

  if (currentStart < WORK_DAY_END) {
    windows.push({ start: currentStart, end: WORK_DAY_END });
  }

  return windows;
}

function getAvailableSlotsForMaster(masterLabel, items, date) {
  const totalDuration = getVisitDuration(items);
  if (!totalDuration || masterLabel === 'Любой свободный мастер') return [];

  const windows = getMasterFreeWindows(masterLabel, date);
  const slots = [];
  const step = Math.max(30, Math.ceil(totalDuration / 30) * 30);

  for (const window of windows) {
    const windowDuration = window.end - window.start;
    if (windowDuration < totalDuration) continue;

    for (let min = window.start; min + totalDuration <= window.end; min += step) {
      const time = minutesToTime(min);
      if (hasContinuousFreeTime(masterLabel, date, time, totalDuration)) {
        slots.push(time);
      }
    }
  }

  return slots;
}

function getMastersWithAvailability(items, date) {
  const masters = getMastersForCart(items).filter(m => m !== 'Любой свободный мастер');
  const available = [];
  const unavailable = [];

  for (const master of masters) {
    const slots = getAvailableSlotsForMaster(master, items, date);
    if (slots.length > 0) {
      available.push({ master, slots });
    } else {
      unavailable.push(master);
    }
  }

  return { available, unavailable };
}

function getAvailableStartTimesForVisit(masterLabel, items, date) {
  const totalDuration = getVisitDuration(items);
  if (!totalDuration) return TIME_SLOTS;

  if (masterLabel === 'Любой свободный мастер') {
    const { available } = getMastersWithAvailability(items, date);
    const union = new Set();
    available.forEach(({ slots }) => slots.forEach(t => union.add(t)));
    return [...union].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }

  return getAvailableSlotsForMaster(masterLabel, items, date);
}

function formatEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60);
  const endMin = totalMinutes % 60;
  return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
}

/* ----- Site header height (sticky offsets) ----- */
function updateSiteHeaderHeight() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const height = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--site-header-height', `${height}px`);
  document.documentElement.style.setProperty('--catalog-sticky-top', `${height}px`);
}

function initSiteHeaderHeight() {
  updateSiteHeaderHeight();
  window.addEventListener('resize', updateSiteHeaderHeight, { passive: true });
  const header = document.querySelector('.site-header');
  if (header && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateSiteHeaderHeight).observe(header);
  }
}

/* ----- Init ----- */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initMobileHeaderCta();
  initSiteHeaderHeight();
  observeReveal();
  setActiveNav();
  initSubnavScroll();
  initServicesCatalogRender();
  initMastersGrid();
});
