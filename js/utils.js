// ==========================================
// SHARED HELPERS, DATE UTILS, CONFIRM POPUP & GALLERY MODAL
// ==========================================
function formatMoney(amount, currency = 'Rs') {
  if (!isFinancialUnlocked) return '<span class="fin-masked">••••••</span>';
  return `${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}`;
}

function showToast(msg) {
  const toast = document.getElementById('toastBanner');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTodayDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getCurrentMonthStr() {
  return getTodayDateStr().slice(0, 7);
}

function getMonthStartDateStr(monthKey) {
  const mk = monthKey || getCurrentMonthStr();
  return `${mk}-01`;
}

function getMonthEndDateStr(monthKey) {
  const mk = monthKey || getCurrentMonthStr();
  const [y, m] = mk.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${mk}-${String(lastDay).padStart(2, '0')}`;
}

function getWeekdayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

function formatReadableDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr || '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDatesInMonth(monthKey) {
  const [yStr, mStr] = (monthKey || getCurrentMonthStr()).split('-');
  const y = Number(yStr) || new Date().getFullYear();
  const m = Number(mStr) || (new Date().getMonth() + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const dates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push({
      day,
      key: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }
  return dates;
}

function getDatesInRange(fromDate, toDate) {
  const start = new Date(fromDate + 'T00:00:00');
  const end = new Date(toDate + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
  const list = [];
  const cur = new Date(start);
  let safety = 0;
  while (cur <= end && safety < 93) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    list.push({
      day: `${cur.getDate()}/${cur.getMonth() + 1}`,
      weekday: getWeekdayShort(key),
      key
    });
    cur.setDate(cur.getDate() + 1);
    safety++;
  }
  return list;
}

// Backward-compatible helper for Sabaq multi-screenshots
function getSabaqImages(item) {
  if (!item) return [];
  if (Array.isArray(item.proofImages) && item.proofImages.length > 0) return item.proofImages;
  if (item.proofImage) return [item.proofImage];
  return [];
}

function formatWhatsAppNumber(phone) {
  let cleaned = String(phone || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  else if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  else if (cleaned.startsWith('03') && cleaned.length === 11) cleaned = '92' + cleaned.substring(1);
  return cleaned;
}

function openWhatsAppChat(phone, messageText) {
  const num = formatWhatsAppNumber(phone);
  if (!num) return showToast('Student ka phone number theek nahi hai!');
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(messageText || '')}`, '_blank');
}

function getMonthMetrics(monthKey) {
  const activeStudents = state.students.filter(s => s.status === 'Active');
  const monthFees = state.fees[monthKey] || {};
  let collected = 0;
  let pending = 0;
  let unpaidCount = 0;
  let proofCount = 0;

  activeStudents.forEach(s => {
    const feeAmt = Number(s.monthlyFee) || 0;
    const rec = monthFees[s.id];
    if (rec && rec.status === 'Paid') {
      collected += feeAmt;
    } else {
      pending += feeAmt;
      unpaidCount++;
      if (rec && rec.status === 'Under Review') proofCount++;
    }
  });

  const monthSalaries = (state.salaries || [])
    .filter(x => x.month === monthKey && x.status === 'Paid')
    .reduce((sum, x) => sum + (Number(x.amount) || 0), 0);

  const monthExpenses = (state.expenses || [])
    .filter(x => (x.date || '').startsWith(monthKey))
    .reduce((sum, x) => sum + (Number(x.amount) || 0), 0);

  const netProfit = collected - monthSalaries - monthExpenses;

  let snapCollectedTotal = collected;
  let snapNetTotal = netProfit;
  Object.keys(state.snapshots || {}).forEach(k => {
    if (k !== monthKey) {
      snapCollectedTotal += Number(state.snapshots[k].collected) || 0;
      snapNetTotal += Number(state.snapshots[k].netProfit) || 0;
    }
  });

  return {
    collected,
    pending,
    unpaidCount,
    proofCount,
    monthSalaries,
    monthExpenses,
    netProfit,
    activeCount: activeStudents.length,
    snapCollectedTotal,
    snapNetTotal
  };
}

function getStudentAttendanceStats(studentId, fromDate = null, toDate = null) {
  const dates = Object.keys(state.attendance).filter(d => (!fromDate || d >= fromDate) && (!toDate || d <= toDate));
  let totalMarked = 0, presentDays = 0;
  dates.forEach(d => {
    const st = state.attendance[d] && state.attendance[d][studentId];
    if (st) {
      totalMarked++;
      if (st === 'Present') presentDays++;
    }
  });
  if (totalMarked === 0) return '100% (0/0)';
  return `${Math.round((presentDays / totalMarked) * 100)}% (${presentDays}/${totalMarked})`;
}

// ==========================================
// GLOBAL CUSTOM CONFIRMATION POPUP ENGINE
// ==========================================
let activeConfirmResolver = null;

function resolveConfirmModal(result) {
  const modal = document.getElementById('confirmActionModal');
  if (modal) modal.classList.add('hidden');
  if (typeof activeConfirmResolver === 'function') {
    const res = activeConfirmResolver;
    activeConfirmResolver = null;
    res(Boolean(result));
  }
}

function showConfirmModal(options = {}) {
  const modal = document.getElementById('confirmActionModal');
  if (!modal) {
    return Promise.resolve(window.confirm(options.message || 'Kya aap confirm karte hain?'));
  }

  const titleEl = document.getElementById('confirmModalTitle');
  const msgEl = document.getElementById('confirmModalMessage');
  const iconEl = document.getElementById('confirmModalIcon');
  const okBtn = document.getElementById('btnConfirmModalOk');
  const cancelBtn = document.getElementById('btnConfirmModalCancel');

  const variant = options.variant || 'danger'; // 'danger' | 'success' | 'primary'
  if (titleEl) titleEl.textContent = options.title || 'Confirm Karein';
  if (msgEl) msgEl.textContent = options.message || 'Kya aap waqai ye action perform karna chahte hain?';
  if (cancelBtn) cancelBtn.textContent = options.cancelText || 'Nahi (Cancel)';
  if (okBtn) okBtn.textContent = options.confirmText || 'Haan, Confirm';

  if (variant === 'success') {
    if (iconEl) {
      iconEl.textContent = '✅';
      iconEl.className = 'w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold shrink-0';
    }
    if (okBtn) okBtn.className = 'px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm';
  } else if (variant === 'primary') {
    if (iconEl) {
      iconEl.textContent = '❓';
      iconEl.className = 'w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0';
    }
    if (okBtn) okBtn.className = 'px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm';
  } else {
    if (iconEl) {
      iconEl.textContent = '⚠️';
      iconEl.className = 'w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold shrink-0';
    }
    if (okBtn) okBtn.className = 'px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm';
  }

  modal.classList.remove('hidden');
  return new Promise((resolve) => {
    activeConfirmResolver = resolve;
  });
}

const btnConfirmModalOk = document.getElementById('btnConfirmModalOk');
if (btnConfirmModalOk) btnConfirmModalOk.addEventListener('click', () => resolveConfirmModal(true));
const btnConfirmModalCancel = document.getElementById('btnConfirmModalCancel');
if (btnConfirmModalCancel) btnConfirmModalCancel.addEventListener('click', () => resolveConfirmModal(false));

// ==========================================
// MULTI-IMAGE GALLERY MODAL ENGINE
// ==========================================
function renderActiveGallerySlide() {
  if (!activeGalleryImages.length) return;
  const imgSrc = activeGalleryImages[activeGalleryIndex];
  const imgEl = document.getElementById('screenshotModalImg');
  const dlBtn = document.getElementById('btnDownloadModalImg');
  const counterEl = document.getElementById('screenshotGalleryCounter');
  const prevBtn = document.getElementById('btnGalleryPrev');
  const nextBtn = document.getElementById('btnGalleryNext');
  const thumbsBox = document.getElementById('screenshotGalleryThumbs');

  if (imgEl) imgEl.src = imgSrc;
  if (dlBtn) {
    dlBtn.href = imgSrc;
    dlBtn.download = `raza_tutors_proof_${activeGalleryIndex + 1}.jpg`;
  }

  const isMulti = activeGalleryImages.length > 1;
  if (counterEl) {
    counterEl.textContent = `${activeGalleryIndex + 1} / ${activeGalleryImages.length}`;
    counterEl.classList.toggle('hidden', !isMulti);
  }
  if (prevBtn) prevBtn.classList.toggle('hidden', !isMulti);
  if (nextBtn) nextBtn.classList.toggle('hidden', !isMulti);

  if (thumbsBox) {
    thumbsBox.classList.toggle('hidden', !isMulti);
    if (isMulti) {
      thumbsBox.innerHTML = activeGalleryImages.map((src, i) => `
        <button type="button" data-gallery-idx="${i}" class="p-0.5 rounded-lg border-2 ${i === activeGalleryIndex ? 'border-indigo-600' : 'border-slate-200'}">
          <img src="${src}" alt="Thumb ${i + 1}" class="w-12 h-12 object-cover rounded" />
        </button>
      `).join('');
    }
  }
}

function openImageGalleryModal(images, title, note, showAdminBtns = false) {
  if (!Array.isArray(images) || images.length === 0) return showToast('No screenshot available.');
  activeGalleryImages = images;
  activeGalleryIndex = 0;
  document.getElementById('screenshotModalTitle').textContent = title || 'Screenshot Preview';
  document.getElementById('screenshotModalNote').textContent = note || '';
  document.getElementById('screenshotModalAdminBtns').classList.toggle('hidden', !showAdminBtns);
  renderActiveGallerySlide();
  document.getElementById('screenshotModal').classList.remove('hidden');
}

const btnGalleryPrev = document.getElementById('btnGalleryPrev');
if (btnGalleryPrev) {
  btnGalleryPrev.addEventListener('click', () => {
    if (!activeGalleryImages.length) return;
    activeGalleryIndex = (activeGalleryIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
    renderActiveGallerySlide();
  });
}
const btnGalleryNext = document.getElementById('btnGalleryNext');
if (btnGalleryNext) {
  btnGalleryNext.addEventListener('click', () => {
    if (!activeGalleryImages.length) return;
    activeGalleryIndex = (activeGalleryIndex + 1) % activeGalleryImages.length;
    renderActiveGallerySlide();
  });
}
const screenshotGalleryThumbs = document.getElementById('screenshotGalleryThumbs');
if (screenshotGalleryThumbs) {
  screenshotGalleryThumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-gallery-idx]');
    if (!btn) return;
    activeGalleryIndex = Number(btn.getAttribute('data-gallery-idx')) || 0;
    renderActiveGallerySlide();
  });
}
