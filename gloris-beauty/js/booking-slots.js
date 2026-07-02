/* GLORIS BEAUTY — сетка слотов и проверка доступности */

const BOOKING_HOURS = { start: 10 * 60, end: 21 * 60, step: 30 };
const BOOKED_SLOTS_KEY = 'gloris-booked-slots';
const BOOKINGS_KEY = 'gloris-bookings';

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function resolveMasterId(masterLabel) {
  if (!masterLabel || masterLabel === 'Любой свободный мастер') return 'any';
  const short = masterLabel.split(' —')[0].trim().replace(/\.$/, '');
  if (typeof MASTERS_DATA !== 'undefined') {
    const found = MASTERS_DATA.find(m =>
      m.bookingKey === short
      || m.displayName === short
      || m.displayName.startsWith(short)
      || masterLabel.includes(m.bookingKey)
    );
    if (found) return found.bookingKey;
  }
  return short;
}

function resolveMasterIdsFromNames(names) {
  return (names || []).map(name => resolveMasterId(name));
}

function getServiceAddress(venueId) {
  if (typeof SERVICE_VENUES !== 'undefined' && SERVICE_VENUES[venueId]) {
    return SERVICE_VENUES[venueId].addressFull;
  }
  return venueId === 'medical' ? 'пр-т XXX, д. 26' : 'ул. XXX, д. 27';
}

function loadBookedSlots() {
  try {
    const raw = localStorage.getItem(BOOKED_SLOTS_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookedSlots(slots) {
  try {
    localStorage.setItem(BOOKED_SLOTS_KEY, JSON.stringify(slots));
  } catch { /* ignore */ }
}

function slotsOverlap(startA, durationA, startB, durationB) {
  const endA = startA + durationA;
  const endB = startB + durationB;
  return startA < endB && endA > startB;
}

function isMasterFree(masterId, date, startMin, durationMin, booked) {
  const endMin = startMin + durationMin;
  if (startMin < BOOKING_HOURS.start || endMin > BOOKING_HOURS.end) return false;

  return !booked.some(b => {
    if (b.date !== date) return false;
    const sameMaster = b.masterId === masterId
      || b.masterId === 'any'
      || masterId === 'any';
    if (!sameMaster) return false;
    return slotsOverlap(startMin, durationMin, timeToMinutes(b.time), b.duration);
  });
}

function getAvailableStartTimes(masterId, date, durationMin) {
  const duration = Math.max(durationMin || BOOKING_HOURS.step, BOOKING_HOURS.step);
  const booked = loadBookedSlots();
  const times = [];

  for (let m = BOOKING_HOURS.start; m + duration <= BOOKING_HOURS.end; m += BOOKING_HOURS.step) {
    if (isMasterFree(masterId, date, m, duration, booked)) {
      times.push(minutesToTime(m));
    }
  }
  return times;
}

function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch { /* ignore */ }
}

function bookVisitSlots(visits) {
  const booked = loadBookedSlots();
  const bookings = loadBookings();

  visits.forEach(visit => {
    if (!visit.date || !visit.time || !visit.duration) return;
    const endTime = minutesToTime(timeToMinutes(visit.time) + visit.duration);

    booked.push({
      masterId: visit.masterId,
      venueId: visit.venueId,
      address: visit.address,
      date: visit.date,
      time: visit.time,
      duration: visit.duration,
      bookedAt: Date.now(),
    });

    bookings.push({
      masterLabel: visit.masterLabel || visit.masterId,
      masterId: visit.masterId,
      venueId: visit.venueId,
      address: visit.address,
      date: visit.date,
      startTime: visit.time,
      endTime,
      duration: visit.duration,
      bookedAt: Date.now(),
    });
  });

  saveBookedSlots(booked);
  saveBookings(bookings);
}
