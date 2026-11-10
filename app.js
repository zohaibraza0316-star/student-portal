const USERS_KEY = 'sms_portal_users_v1';
const SESSION_KEY = 'sms_portal_active_user';
const LEGACY_STORAGE_KEY = 'sms_portal_data_v2';
const THEME_KEY = 'sms_portal_dark_mode';

const IDB_NAME = 'RazaTutorsEnterpriseDB';
const IDB_VERSION = 1;
const IDB_STORE = 'portalState';

const NAYAPAY_DETAILS = {
  nayapayId: 'muhammad.zohaib.748@nayapay',
  accountNumber: '03704161579',
  iban: 'PK87NAYA1234503704161579'
};

let currentLoggedInUser = null;
let isFinancialUnlocked = false;
let activeProofModalContext = null;
let studentsCurrentPage = 1;
let studentsPageSize = 10;
let chartFinInstance = null;
let chartCourseInstance = null;
let currentReceiptPhone = '';
let currentReceiptText = '';

// Apply saved Dark Mode on startup
if (localStorage.getItem(THEME_KEY) === 'true') {
  document.body.classList.add('dark-mode');
}

// Verify Login Session
const activeUserRaw = localStorage.getItem(SESSION_KEY);
if (!activeUserRaw) {
  window.location.href = 'login.html';
} else {
  try {
    currentLoggedInUser = JSON.parse(activeUserRaw);
    const nameEl = document.getElementById('loggedInUserName');
    const roleEl = document.getElementById('loggedInUserRole');
    if (nameEl && currentLoggedInUser.name) nameEl.textContent = currentLoggedInUser.name;
    if (roleEl) roleEl.textContent = currentLoggedInUser.role || 'Super Admin';
    if (currentLoggedInUser.role && currentLoggedInUser.role !== 'Super Admin') {
      const adminTabBtn = document.getElementById('tabBtnAdmin');
      if (adminTabBtn) adminTabBtn.classList.add('hidden');
    }
  } catch (e) {}
}

// Collapsible Slider Sidebar Toggle
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
if (btnToggleSidebar) {
  btnToggleSidebar.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
  });
}

// Dark Mode Toggle
const btnDarkModeToggle = document.getElementById('btnDarkModeToggle');
if (btnDarkModeToggle) {
  const updateDarkBtnLabel = () => {
    const isDark = document.body.classList.contains('dark-mode');
    btnDarkModeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  };
  updateDarkBtnLabel();
  btnDarkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('dark-mode'));
    updateDarkBtnLabel();
  });
}

// Logout Button
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  });
}

// ==========================================
// INDEXEDDB DATABASE ENGINE (UNLIMITED STORAGE)
// ==========================================
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetState() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get('main_state');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSaveState(data) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(data, 'main_state');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// Compress image before saving to IndexedDB
function compressImageFile(file, maxWidth = 700, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(String(ev.target.result));
      img.src = String(ev.target.result);
    };
    reader.readAsDataURL(file);
  });
}

const defaultSampleData = {
  students: [
    {
      id: 'stu_1794119921897',
      rollNo: 'ST-101',
      name: 'Muhammad Awais',
      fatherName: '',
      phone: '+971529019247',
      className: 'Beginner / Starter',
      subjects: 'Quran with Tajweed',
      classTime: '08:00 PM PKT',
      meetingLink: '',
      currency: 'AED',
      monthlyFee: 5000,
      joinDate: '2026-10-26',
      status: 'Active',
      notes: 'Dubai'
    },
    {
      id: 'stu_1794120117424',
      rollNo: 'ST-102',
      name: 'Hafsa Zubair',
      fatherName: 'Muhammad Zubair',
      phone: '+33669788400',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '09:00 PM PKT',
      meetingLink: '',
      currency: 'EUR',
      monthlyFee: 6000,
      joinDate: '2026-10-25',
      status: 'Active',
      notes: 'France'
    },
    {
      id: 'stu_1794120311852',
      rollNo: 'ST-103',
      name: 'Uzair',
      fatherName: 'Muhammad Zubair',
      phone: '+33669788400',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '09:30 PM PKT',
      meetingLink: '',
      currency: 'EUR',
      monthlyFee: 6000,
      joinDate: '2026-10-25',
      status: 'Active',
      notes: 'France'
    },
    {
      id: 'stu_1794120504309',
      rollNo: 'ST-104',
      name: 'Hafsa Fatima',
      fatherName: 'Gulam Rasool',
      phone: '03239348517',
      className: 'Intermediate',
      subjects: 'Quran with Tajweed',
      classTime: '05:00 PM PKT',
      meetingLink: '',
      currency: 'PKR',
      monthlyFee: 2500,
      joinDate: '2026-11-02',
      status: 'Active',
      notes: 'Lahore Pakistan'
    },
    {
      id: 'stu_1794120788229',
      rollNo: 'ST-105',
      name: 'Aisha Khalid',
      fatherName: 'Khalid Ghumman',
      phone: '03311276782',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '06:00 PM PKT',
      meetingLink: '',
      currency: 'PKR',
      monthlyFee: 2500,
      joinDate: '2026-10-31',
      status: 'Active',
      notes: 'Hyderabad Pakistan'
    }
  ],
  fees: {
    '2026-11': {
      stu_1794119921897: { status: 'Paid', date: '2026-11-07' },
      stu_1794120117424: { status: 'Pending', date: '' }
    }
  },
  attendance: {
    '2026-11-07': {
      stu_1794119921897: 'Leave',
      stu_1794120117424: 'Leave'
    }
  },
  marks: [],
  sabaqLogs: [],
  demos: [],
  salaries: [],
  expenses: [],
  snapshots: {},
  settings: {
    academyName: 'Raza Tutors — Online Quran Academy',
    phone: '+92 370 4161579',
    email: 'muhammad.zohaib.748@nayapay',
    logoDataUrl: '',
    financialPin: '1234'
  }
};

let state = JSON.parse(JSON.stringify(defaultSampleData));

function normalizeLoadedState(rawObj) {
  return {
    students: Array.isArray(rawObj.students) ? rawObj.students : [],
    fees: rawObj.fees || {},
    attendance: rawObj.attendance || {},
    marks: Array.isArray(rawObj.marks) ? rawObj.marks : [],
    sabaqLogs: Array.isArray(rawObj.sabaqLogs) ? rawObj.sabaqLogs : [],
    demos: Array.isArray(rawObj.demos) ? rawObj.demos : [],
    salaries: Array.isArray(rawObj.salaries) ? rawObj.salaries : [],
    expenses: Array.isArray(rawObj.expenses) ? rawObj.expenses : [],
    snapshots: rawObj.snapshots || {},
    settings: {
      academyName: (rawObj.settings && rawObj.settings.academyName) || 'Raza Tutors — Online Quran Academy',
      phone: (rawObj.settings && rawObj.settings.phone) || '+92 370 4161579',
      email: (rawObj.settings && rawObj.settings.email) || 'muhammad.zohaib.748@nayapay',
      logoDataUrl: (rawObj.settings && rawObj.settings.logoDataUrl) || '',
      financialPin: (rawObj.settings && rawObj.settings.financialPin) || '1234'
    }
  };
}

async function saveState() {
  try {
    await idbSaveState(state);
  } catch (e) {
    showToast('Error saving data to IndexedDB!');
  }
}

// ==========================================
// FINANCIAL PRIVACY LOCK & HELPERS
// ==========================================
function formatMoney(amount, currency = 'Rs') {
  if (!isFinancialUnlocked) return '<span class="fin-masked">••••••</span>';
  return `${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}`;
}

const btnToggleFinLock = document.getElementById('btnToggleFinLock');
if (btnToggleFinLock) {
  btnToggleFinLock.addEventListener('click', () => {
    if (isFinancialUnlocked) {
      isFinancialUnlocked = false;
      btnToggleFinLock.innerHTML = '<span>🔒 Unlock Financials</span>';
      btnToggleFinLock.className = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition';
      renderAll();
      showToast('Financial figures hidden!');
    } else {
      const pin = prompt('Financial figures dekhne ke liye Admin PIN lagayein (Default: 1234):');
      if (pin === null) return;
      const savedPin = (state.settings && state.settings.financialPin) || '1234';
      if (pin.trim() === savedPin) {
        isFinancialUnlocked = true;
        btnToggleFinLock.innerHTML = '<span>🙈 Hide Financials</span>';
        btnToggleFinLock.className = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition';
        renderAll();
        showToast('Financials unlocked!');
      } else {
        showToast('Ghalat Financial PIN!');
      }
    }
  });
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

// Monthly Metrics + Snapshot Calculation
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

  // Calculate Cumulative (All Saved Past Snapshots + Current Selected Month)
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

function applyBrandingUI() {
  const cfg = state.settings || {};
  const sideName = document.getElementById('sidebarAcademyName');
  const topTitle = document.getElementById('topBarTitle');
  const topContacts = document.getElementById('topBarContacts');
  if (sideName) sideName.textContent = cfg.academyName || 'Raza Tutors';
  if (topTitle) topTitle.textContent = cfg.academyName || 'Raza Tutors Portal';
  if (topContacts) topContacts.textContent = `📞 ${cfg.phone || '+92 370 4161579'} • ✉️ ${cfg.email || 'muhammad.zohaib.748@nayapay'}`;

  const logoImg = document.getElementById('sidebarBrandLogo');
  const defaultIcon = document.getElementById('sidebarDefaultIcon');
  if (logoImg && defaultIcon) {
    if (cfg.logoDataUrl) {
      logoImg.src = cfg.logoDataUrl;
      logoImg.classList.remove('hidden');
      defaultIcon.classList.add('hidden');
    } else {
      logoImg.classList.add('hidden');
      defaultIcon.classList.remove('hidden');
    }
  }

  const bName = document.getElementById('brandNameInput');
  const bPhone = document.getElementById('brandPhoneInput');
  const bEmail = document.getElementById('brandEmailInput');
  const bPin = document.getElementById('brandFinPinInput');
  if (bName) bName.value = cfg.academyName || '';
  if (bPhone) bPhone.value = cfg.phone || '';
  if (bEmail) bEmail.value = cfg.email || '';
  if (bPin) bPin.value = cfg.financialPin || '1234';
}

function renderAll() {
  applyBrandingUI();
  updateFilterDropdowns();
  renderSummaryStats();
  renderStudentsTable();
  renderSabaqAndTimetable();
  renderDemosTable();
  renderFeesTable();
  renderExpensesAndSnapshots();
  renderAttendanceTable();
  renderSalariesTable();
  renderMarksSection();
  renderAdminUsersTable();
  populateParentStudentDropdown();
}

function updateFilterDropdowns() {
  const batchSelect = document.getElementById('filterClassSelect');
  const courseSelect = document.getElementById('filterCourseSelect');
  if (!batchSelect || !courseSelect) return;

  const curBatch = batchSelect.value;
  const curCourse = courseSelect.value;

  const batches = Array.from(new Set(state.students.map(s => (s.className || '').trim()).filter(Boolean)));
  const courses = Array.from(new Set(state.students.map(s => (s.subjects || '').trim()).filter(Boolean)));

  batchSelect.innerHTML = '<option value="ALL">All Batches</option>' + batches.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  courseSelect.innerHTML = '<option value="ALL">All Courses</option>' + courses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  if (batches.includes(curBatch)) batchSelect.value = curBatch;
  if (courses.includes(curCourse)) courseSelect.value = curCourse;
}

function renderSummaryStats() {
  const total = state.students.length;
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  const m = getMonthMetrics(monthKey);

  document.getElementById('statTotalStudents').textContent = String(total);
  document.getElementById('statActiveBreakdown').textContent = `${m.activeCount} Active / ${total - m.activeCount} Inactive`;

  document.getElementById('statFeesCollected').innerHTML = formatMoney(m.collected, 'Rs');
  document.getElementById('statFeeMonthLabel').innerHTML = `Month (${monthKey}) | Total w/ Snapshots: ${formatMoney(m.snapCollectedTotal, 'Rs')}`;
  document.getElementById('statFeesPending').innerHTML = formatMoney(m.pending, 'Rs');
  document.getElementById('statUnpaidCount').textContent = `${m.unpaidCount} pending (${m.proofCount} proofs)`;

  document.getElementById('statTotalOutflow').innerHTML = formatMoney(m.monthSalaries + m.monthExpenses, 'Rs');
  document.getElementById('statOutflowSub').textContent = `Sal + Exp (${monthKey})`;
  document.getElementById('statNetProfit').innerHTML = formatMoney(m.netProfit, 'Rs');

  const navBadge = document.getElementById('navBadgePendingProofs');
  if (navBadge) {
    navBadge.textContent = String(m.proofCount);
    navBadge.classList.toggle('hidden', m.proofCount === 0);
  }

  const dateKey = document.getElementById('attendanceDateInput').value || '2026-11-10';
  const dayAtt = state.attendance[dateKey] || {};
  let presentCount = 0;
  state.students.filter(s => s.status === 'Active').forEach(s => {
    if (dayAtt[s.id] === 'Present') presentCount++;
  });
  const rate = m.activeCount > 0 ? Math.round((presentCount / m.activeCount) * 100) : 0;
  document.getElementById('statAttendanceRate').textContent = `Attendance (${dateKey}): ${rate}%`;
}

// ==========================================
// TAB 1: STUDENTS DIRECTORY & PAGINATION
// ==========================================
function renderStudentsTable() {
  const query = (document.getElementById('searchStudentsInput').value || '').trim().toLowerCase();
  const classFilter = document.getElementById('filterClassSelect').value;
  const courseFilter = document.getElementById('filterCourseSelect').value;
  const currFilter = document.getElementById('filterCurrencySelect').value;
  const statusFilter = document.getElementById('filterStatusSelect').value;

  const filtered = state.students.filter(s => {
    const matchesQuery = !query ||
      (s.name || '').toLowerCase().includes(query) ||
      (s.rollNo || '').toLowerCase().includes(query) ||
      (s.notes || '').toLowerCase().includes(query) ||
      (s.phone || '').toLowerCase().includes(query);
    const matchesClass = classFilter === 'ALL' || s.className === classFilter;
    const matchesCourse = courseFilter === 'ALL' || s.subjects === courseFilter;
    const matchesCurr = currFilter === 'ALL' || (s.currency || 'PKR') === currFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesQuery && matchesClass && matchesCourse && matchesCurr && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / studentsPageSize));
  if (studentsCurrentPage > totalPages) studentsCurrentPage = totalPages;
  const startIdx = (studentsCurrentPage - 1) * studentsPageSize;
  const pageItems = filtered.slice(startIdx, startIdx + studentsPageSize);

  document.getElementById('studentsPaginationInfo').textContent =
    totalItems === 0 ? 'Showing 0 of 0' : `Showing ${startIdx + 1}–${Math.min(startIdx + studentsPageSize, totalItems)} of ${totalItems}`;
  document.getElementById('studentsPageIndicator').textContent = `Page ${studentsCurrentPage} / ${totalPages}`;
  document.getElementById('btnStudentsPrevPage').disabled = studentsCurrentPage <= 1;
  document.getElementById('btnStudentsNextPage').disabled = studentsCurrentPage >= totalPages;

  const tbody = document.getElementById('studentsTableBody');
  const empty = document.getElementById('studentsEmptyState');

  if (pageItems.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = pageItems.map(s => {
    const badgeClass = s.status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
    const curr = s.currency || 'PKR';
    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-bold text-indigo-600 whitespace-nowrap">${escapeHtml(s.rollNo)}</td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-900">${escapeHtml(s.name)}</div>
          <div class="text-xs text-slate-500">🌍 ${escapeHtml(s.notes || 'Pakistan')}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-800">${escapeHtml(s.className)}</div>
          <div class="text-xs text-indigo-600 font-semibold">${escapeHtml(s.subjects)}</div>
          ${s.classTime ? `<div class="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">⏰ ${escapeHtml(s.classTime)}</div>` : ''}
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <div class="text-slate-700 font-medium">${escapeHtml(s.phone)}</div>
          <button type="button" data-action="wa-chat" data-id="${escapeHtml(s.id)}" class="mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">WhatsApp Chat</button>
        </td>
        <td class="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">${formatMoney(s.monthlyFee, curr)}</td>
        <td class="py-3 px-4 text-center">
          <span class="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${badgeClass}">${escapeHtml(s.status)}</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
          <button type="button" data-action="edit-student" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Edit</button>
          <button type="button" data-action="delete-student" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('studentsPageSizeSelect').addEventListener('change', (e) => {
  studentsPageSize = Number(e.target.value) || 10;
  studentsCurrentPage = 1;
  renderStudentsTable();
});
document.getElementById('btnStudentsPrevPage').addEventListener('click', () => {
  if (studentsCurrentPage > 1) {
    studentsCurrentPage--;
    renderStudentsTable();
  }
});
document.getElementById('btnStudentsNextPage').addEventListener('click', () => {
  studentsCurrentPage++;
  renderStudentsTable();
});
document.getElementById('btnResetStudentFilters').addEventListener('click', () => {
  document.getElementById('searchStudentsInput').value = '';
  document.getElementById('filterClassSelect').value = 'ALL';
  document.getElementById('filterCourseSelect').value = 'ALL';
  document.getElementById('filterCurrencySelect').value = 'ALL';
  document.getElementById('filterStatusSelect').value = 'ALL';
  studentsCurrentPage = 1;
  renderStudentsTable();
});

['searchStudentsInput', 'filterClassSelect', 'filterCourseSelect', 'filterCurrencySelect', 'filterStatusSelect'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    studentsCurrentPage = 1;
    renderStudentsTable();
  });
});

// ==========================================
// TAB 2: SABAQ & TIMETABLE
// ==========================================
function renderSabaqAndTimetable() {
  const select = document.getElementById('sabaqStudentSelect');
  if (!select) return;
  select.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} - ${escapeHtml(s.name)} (${escapeHtml(s.subjects)})</option>`).join('');

  const grid = document.getElementById('timetableCardsGrid');
  if (grid) {
    grid.innerHTML = state.students.filter(s => s.status === 'Active').map(s => `
      <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-bold text-slate-900 text-sm">${escapeHtml(s.name)} <span class="text-xs text-indigo-600">(${escapeHtml(s.rollNo)})</span></div>
            <div class="text-xs text-slate-500">${escapeHtml(s.className)} • ${escapeHtml(s.subjects)}</div>
          </div>
          <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">⏰ ${escapeHtml(s.classTime || 'Not Set')}</span>
        </div>
        <div class="flex items-center gap-1.5 pt-1">
          ${s.meetingLink ? `<a href="${escapeHtml(s.meetingLink)}" target="_blank" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white">Join Class</a>` : ''}
          <button type="button" data-action="wa-class-invite" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Send Class Reminder on WA</button>
        </div>
      </div>
    `).join('');
  }

  const tbody = document.getElementById('sabaqTableBody');
  const empty = document.getElementById('sabaqEmptyState');
  if (!state.sabaqLogs || state.sabaqLogs.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = state.sabaqLogs.map(item => {
    const stu = state.students.find(s => s.id === item.studentId);
    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4">
          <div class="text-xs font-semibold text-slate-700">${escapeHtml(item.date)}</div>
          <div class="text-[11px] text-indigo-600 font-bold">${escapeHtml(item.category || 'Quran Sabaq')}</div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(stu ? `${stu.name} (${stu.rollNo})` : 'Removed')}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${escapeHtml(item.sabaq)}</td>
        <td class="py-3 px-4 text-slate-600 text-xs">${escapeHtml(item.revision || '—')}</td>
        <td class="py-3 px-4 text-center">
          ${item.proofImage ? `<button type="button" data-action="view-sabaq-proof" data-id="${escapeHtml(item.id)}" class="text-xs font-bold text-indigo-600 underline">🖼️ View Proof</button>` : '<span class="text-xs text-slate-400">—</span>'}
        </td>
        <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${escapeHtml(item.rating)}</span></td>
        <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
          <button type="button" data-action="wa-sabaq-report" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">WA Report</button>
          <button type="button" data-action="delete-sabaq" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

const timetableCardsGrid = document.getElementById('timetableCardsGrid');
if (timetableCardsGrid) {
  timetableCardsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="wa-class-invite"]');
    if (!btn) return;
    const stu = state.students.find(s => s.id === btn.getAttribute('data-id'));
    if (!stu) return;
    const linkPart = stu.meetingLink ? `\nClass Link: ${stu.meetingLink}` : '';
    const msg = `*CLASS REMINDER — ${state.settings.academyName}*\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}*\nCourse: ${stu.subjects}\nClass Time: *${stu.classTime || 'Now'}*${linkPart}\n\nClass ka waqt ho gaya hai, meherbani farma kar class join kar lein. JazakAllah!`;
    openWhatsAppChat(stu.phone, msg);
  });
}

const btnSendWeeklyReport = document.getElementById('btnSendWeeklyReport');
if (btnSendWeeklyReport) {
  btnSendWeeklyReport.addEventListener('click', () => {
    const studentId = document.getElementById('sabaqStudentSelect').value;
    const stu = state.students.find(s => s.id === studentId);
    if (!stu) return showToast('Pehle student select karein!');
    const studentLogs = (state.sabaqLogs || []).filter(x => x.studentId === studentId).slice(0, 7);
    const logText = studentLogs.map(l => `- ${l.date} [${l.category || 'Sabaq'}]: ${l.sabaq} (${l.rating})`).join('\n');
    const reportMsg = `*${state.settings.academyName} — WEEKLY PROGRESS REPORT*\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}* (${stu.rollNo})\nCourse: ${stu.subjects}\n\nRecent Lessons:\n${logText || 'No logs recorded yet.'}\n\nJazakAllah Khair!`;
    openWhatsAppChat(stu.phone, reportMsg);
  });
}

document.getElementById('btnAddSabaqRecord').addEventListener('click', async () => {
  const date = document.getElementById('sabaqDateInput').value || '2026-11-10';
  const studentId = document.getElementById('sabaqStudentSelect').value;
  const category = document.getElementById('sabaqCategorySelect').value;
  const sabaq = document.getElementById('sabaqNewInput').value.trim();
  const revision = document.getElementById('sabaqRevisionInput').value.trim();
  const rating = document.getElementById('sabaqRatingSelect').value;
  const fileInput = document.getElementById('sabaqProofFile');
  const file = fileInput && fileInput.files && fileInput.files[0];

  if (!studentId || !sabaq) return showToast('Student chunein aur Sabaq ki details likhein!');

  let imgData = '';
  if (file) {
    imgData = await compressImageFile(file, 700, 0.75);
  }

  state.sabaqLogs.unshift({
    id: 'sbq_' + Date.now(),
    date,
    studentId,
    category,
    sabaq,
    revision,
    rating,
    proofImage: imgData
  });

  document.getElementById('sabaqNewInput').value = '';
  document.getElementById('sabaqRevisionInput').value = '';
  if (fileInput) fileInput.value = '';
  await saveState();
  renderSabaqAndTimetable();
  showToast('Sabaq aur Screenshot IndexedDB mein save ho gaya!');
});

document.getElementById('sabaqTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const item = (state.sabaqLogs || []).find(x => x.id === id);
  if (!item) return;

  if (action === 'delete-sabaq') {
    state.sabaqLogs = state.sabaqLogs.filter(x => x.id !== id);
    saveState();
    renderSabaqAndTimetable();
    showToast('Sabaq record deleted.');
  } else if (action === 'view-sabaq-proof') {
    document.getElementById('screenshotModalTitle').textContent = `${item.category || 'Sabaq'} Screenshot`;
    document.getElementById('screenshotModalImg').src = item.proofImage;
    document.getElementById('screenshotModalNote').textContent = `${item.date} — ${item.sabaq}`;
    document.getElementById('screenshotModalAdminBtns').classList.add('hidden');
    document.getElementById('screenshotModal').classList.remove('hidden');
  } else if (action === 'wa-sabaq-report') {
    const stu = state.students.find(s => s.id === item.studentId);
    if (stu) {
      openWhatsAppChat(
        stu.phone,
        `*${state.settings.academyName} — ${item.category || 'DAILY SABAQ'} REPORT* (${item.date})\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}* (${stu.rollNo})\nLesson: *${item.sabaq}*\nSabqi / Remarks: ${item.revision || '—'}\nPerformance: *${item.rating}*\n\nJazakAllah Khair!`
      );
    }
  }
});

// ==========================================
// TAB 5: EXPENSES & MONTHLY SNAPSHOTS
// ==========================================
function renderExpensesAndSnapshots() {
  const expBody = document.getElementById('expensesTableBody');
  if (expBody) {
    const list = state.expenses || [];
    expBody.innerHTML = list.length === 0
      ? '<tr><td colspan="4" class="py-6 text-center text-slate-400 text-xs">No expenses recorded yet.</td></tr>'
      : list.map(x => `
        <tr>
          <td class="py-2.5 px-4 text-xs text-slate-600">${escapeHtml(x.date)}</td>
          <td class="py-2.5 px-4">
            <div class="font-semibold text-slate-900 text-xs">${escapeHtml(x.title)}</div>
            <div class="text-[11px] text-slate-500">${escapeHtml(x.category)}</div>
          </td>
          <td class="py-2.5 px-4 text-right font-bold text-rose-600 text-xs">${formatMoney(x.amount, 'Rs')}</td>
          <td class="py-2.5 px-4 text-right">
            <button type="button" data-action="del-exp" data-id="${escapeHtml(x.id)}" class="text-xs text-rose-600 font-semibold hover:underline">Delete</button>
          </td>
        </tr>
      `).join('');
  }

  const snapBody = document.getElementById('snapshotsTableBody');
  if (snapBody) {
    const keys = Object.keys(state.snapshots || {}).sort().reverse();
    snapBody.innerHTML = keys.length === 0
      ? '<tr><td colspan="4" class="py-6 text-center text-slate-400 text-xs">No monthly snapshots saved yet.</td></tr>'
      : keys.map(k => {
        const sn = state.snapshots[k];
        return `
          <tr>
            <td class="py-2.5 px-4 font-bold text-indigo-600 text-xs">${escapeHtml(k)}</td>
            <td class="py-2.5 px-4 text-right font-semibold text-emerald-600 text-xs">${formatMoney(sn.collected, 'Rs')}</td>
            <td class="py-2.5 px-4 text-right font-semibold text-rose-600 text-xs">${formatMoney((sn.salaries || 0) + (sn.expenses || 0), 'Rs')}</td>
            <td class="py-2.5 px-4 text-right font-extrabold text-slate-900 text-xs">${formatMoney(sn.netProfit, 'Rs')}</td>
          </tr>
        `;
      }).join('');
  }
}

document.getElementById('btnAddExpense').addEventListener('click', () => {
  const date = document.getElementById('expDateInput').value || '2026-11-10';
  const title = document.getElementById('expTitleInput').value.trim();
  const category = document.getElementById('expCategoryInput').value;
  const amount = Number(document.getElementById('expAmountInput').value) || 0;
  if (!title || !amount) return showToast('Expense Title aur Amount likhein!');
  state.expenses.unshift({ id: 'exp_' + Date.now(), date, title, category, amount });
  document.getElementById('expTitleInput').value = '';
  document.getElementById('expAmountInput').value = '';
  saveState();
  renderAll();
  showToast('Expense added to IndexedDB!');
});

document.getElementById('expensesTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="del-exp"]');
  if (!btn) return;
  state.expenses = state.expenses.filter(x => x.id !== btn.getAttribute('data-id'));
  saveState();
  renderAll();
  showToast('Expense deleted.');
});

function saveSnapshotForCurrentMonth() {
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  const m = getMonthMetrics(monthKey);
  if (!state.snapshots) state.snapshots = {};
  state.snapshots[monthKey] = {
    month: monthKey,
    collected: m.collected,
    pending: m.pending,
    salaries: m.monthSalaries,
    expenses: m.monthExpenses,
    netProfit: m.netProfit,
    activeStudents: m.activeCount,
    savedAt: new Date().toISOString().slice(0, 10)
  };
  saveState();
  renderAll();
  showToast(`Monthly Snapshot (${monthKey}) saved in IndexedDB!`);
}

document.getElementById('btnSaveMonthlySnapshot').addEventListener('click', saveSnapshotForCurrentMonth);
document.getElementById('btnTakeSnapshotNow').addEventListener('click', saveSnapshotForCurrentMonth);

// ==========================================
// TAB 3 & 7: DEMOS & TEACHERS SALARIES
// ==========================================
function renderDemosTable() {
  const tbody = document.getElementById('demosTableBody');
  if (!tbody) return;
  const list = state.demos || [];
  tbody.innerHTML = list.length === 0
    ? '<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">No demo classes scheduled yet.</td></tr>'
    : list.map(d => `
      <tr>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(d.name)}</td>
        <td class="py-3 px-4 text-slate-700">${escapeHtml(d.phone)}</td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(d.course || '—')}</td>
        <td class="py-3 px-4 text-xs font-semibold text-indigo-600">${escapeHtml(d.dateTime || '—')}</td>
        <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">${escapeHtml(d.status)}</span></td>
        <td class="py-3 px-4 text-right space-x-1">
          <button type="button" data-action="wa-demo-msg" data-id="${escapeHtml(d.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">WA Invite</button>
          <button type="button" data-action="convert-demo" data-id="${escapeHtml(d.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">Enroll</button>
          <button type="button" data-action="delete-demo" data-id="${escapeHtml(d.id)}" class="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Delete</button>
        </td>
      </tr>
    `).join('');
}

function renderSalariesTable() {
  const tbody = document.getElementById('salariesTableBody');
  if (!tbody) return;
  const list = state.salaries || [];
  tbody.innerHTML = list.length === 0
    ? '<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">No teacher salary records added yet.</td></tr>'
    : list.map(item => {
      const isPaid = item.status === 'Paid';
      return `
        <tr>
          <td class="py-3 px-4"><div class="font-semibold text-slate-900">${escapeHtml(item.name)}</div><div class="text-xs text-slate-500">${escapeHtml(item.phone || '')}</div></td>
          <td class="py-3 px-4 text-slate-700">${escapeHtml(item.month)}</td>
          <td class="py-3 px-4 text-slate-600">${escapeHtml(item.classes || '—')}</td>
          <td class="py-3 px-4 text-right font-bold text-slate-900">${formatMoney(item.amount, 'Rs')}</td>
          <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${escapeHtml(item.status)}</span></td>
          <td class="py-3 px-4 text-right space-x-1">
            <button type="button" data-action="toggle-sal-status" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white">${isPaid ? 'Mark Pending' : 'Mark Paid'}</button>
            <button type="button" data-action="wa-sal-slip" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">WA Slip</button>
            <button type="button" data-action="delete-sal" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
}

// ==========================================
// TAB 4: MONTHLY FEES & SCREENSHOT QUEUE
// ==========================================
function renderFeesTable() {
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  const statusFilter = document.getElementById('filterFeeStatusSelect').value;
  if (!state.fees[monthKey]) state.fees[monthKey] = {};
  const monthFees = state.fees[monthKey];

  const queueBox = document.getElementById('adminFeeProofQueueBox');
  const queueList = document.getElementById('feeProofQueueList');
  const pendingProofStudents = state.students.filter(s => monthFees[s.id] && monthFees[s.id].status === 'Under Review');

  if (queueBox && queueList) {
    if (pendingProofStudents.length === 0) {
      queueBox.classList.add('hidden');
    } else {
      queueBox.classList.remove('hidden');
      queueList.innerHTML = pendingProofStudents.map(s => {
        const rec = monthFees[s.id];
        return `
          <div class="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between gap-3">
            <div>
              <div class="font-bold text-slate-900 text-sm">${escapeHtml(s.name)} (${escapeHtml(s.rollNo)})</div>
              <div class="text-xs text-slate-500">Uploaded: ${escapeHtml(rec.submittedAt || 'Today')} ${rec.note ? `• Note: ${escapeHtml(rec.note)}` : ''}</div>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" data-action="view-proof" data-id="${escapeHtml(s.id)}" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white">🖼️ View Screenshot</button>
              <button type="button" data-action="approve-fee" data-id="${escapeHtml(s.id)}" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white">✅ Approve</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const rows = state.students.filter(s => {
    const rec = monthFees[s.id] || { status: 'Pending', date: '' };
    return statusFilter === 'ALL' || rec.status === statusFilter;
  });

  const tbody = document.getElementById('feesTableBody');
  tbody.innerHTML = rows.map(s => {
    const rec = monthFees[s.id] || { status: 'Pending', date: '' };
    const isPaid = rec.status === 'Paid';
    const isReview = rec.status === 'Under Review';
    const curr = s.currency || 'PKR';
    return `
      <tr>
        <td class="py-3 px-4 font-semibold text-slate-700">${escapeHtml(s.rollNo)}</td>
        <td class="py-3 px-4"><div class="font-semibold text-slate-900">${escapeHtml(s.name)}</div><div class="text-xs text-slate-500">${escapeHtml(s.phone)}</div></td>
        <td class="py-3 px-4"><div class="font-medium text-slate-800">${escapeHtml(s.className)}</div><div class="text-xs text-slate-500">${escapeHtml(s.subjects)}</div></td>
        <td class="py-3 px-4 text-right font-bold text-slate-900">${formatMoney(s.monthlyFee, curr)}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full ${isPaid ? 'bg-emerald-50 text-emerald-700' : isReview ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}">
            ${isPaid ? 'Approved / Paid' : isReview ? '⏳ Screenshot Sent' : 'Pending'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-500">
          ${rec.proofImage ? `<button type="button" data-action="view-proof" data-id="${escapeHtml(s.id)}" class="text-indigo-600 font-bold underline">🖼️ View Screenshot</button>` : escapeHtml(rec.date || '—')}
        </td>
        <td class="py-3 px-4 text-right space-x-1">
          <button type="button" data-action="toggle-fee" data-id="${escapeHtml(s.id)}" class="px-3 py-1 rounded-md text-xs font-semibold ${isPaid ? 'bg-amber-100 text-amber-800' : 'bg-emerald-600 text-white'}">${isPaid ? 'Mark Pending' : '✅ Approve'}</button>
          <button type="button" data-action="wa-fee-msg" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">${isPaid ? 'WA Receipt' : 'WA Reminder'}</button>
          <button type="button" data-action="fee-slip" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">PDF Slip</button>
        </td>
      </tr>
    `;
  }).join('');
}

const feeProofQueueList = document.getElementById('feeProofQueueList');
if (feeProofQueueList) {
  feeProofQueueList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
    if (action === 'view-proof') {
      openProofModal(id);
    } else if (action === 'approve-fee') {
      state.fees[monthKey][id] = {
        ...state.fees[monthKey][id],
        status: 'Paid',
        date: new Date().toISOString().slice(0, 10)
      };
      saveState();
      renderAll();
      showToast('Fee Approved & Marked Paid!');
    }
  });
}

document.getElementById('btnMarkAllFeesPaid').addEventListener('click', () => {
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  if (!state.fees[monthKey]) state.fees[monthKey] = {};
  const today = new Date().toISOString().slice(0, 10);
  state.students.filter(s => s.status === 'Active').forEach(s => {
    state.fees[monthKey][s.id] = { ...(state.fees[monthKey][s.id] || {}), status: 'Paid', date: today };
  });
  saveState();
  renderAll();
  showToast(`All active students marked Paid for ${monthKey}!`);
});

// ==========================================
// TAB 6 & 9: ATTENDANCE & EVALUATIONS
// ==========================================
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

function renderAttendanceTable() {
  const dateKey = document.getElementById('attendanceDateInput').value || '2026-11-10';
  if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
  const dayAtt = state.attendance[dateKey];

  let p = 0, a = 0, l = 0;
  state.students.forEach(s => {
    const st = dayAtt[s.id];
    if (st === 'Present') p++;
    else if (st === 'Absent') a++;
    else if (st === 'Leave') l++;
  });
  document.getElementById('attendanceDailySummary').textContent = `Present: ${p} | Absent: ${a} | Leave: ${l}`;

  document.getElementById('attendanceTableBody').innerHTML = state.students.map(s => {
    const st = dayAtt[s.id] || 'Not Marked';
    return `
      <tr>
        <td class="py-3 px-4 font-semibold text-slate-700">${escapeHtml(s.rollNo)}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(s.name)}</td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(s.className)}</td>
        <td class="py-3 px-4 text-center text-xs font-medium text-slate-600">${getStudentAttendanceStats(s.id)}</td>
        <td class="py-3 px-4 text-right space-x-1">
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Present" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">Present</button>
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Absent" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}">Absent</button>
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Leave" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Leave' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}">Leave</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderMarksSection() {
  const select = document.getElementById('markStudentSelect');
  if (select) select.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} - ${escapeHtml(s.name)}</option>`).join('');
  const tbody = document.getElementById('marksTableBody');
  const empty = document.getElementById('marksEmptyState');
  if (!state.marks || state.marks.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = state.marks.map(m => {
    const stu = state.students.find(s => s.id === m.studentId);
    const pct = m.total > 0 ? Math.round((m.obtained / m.total) * 100) : 0;
    return `
      <tr>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(stu ? `${stu.rollNo} - ${stu.name}` : 'Removed')}</td>
        <td class="py-3 px-4 text-slate-700">${escapeHtml(m.testTitle)}</td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(m.subject)}</td>
        <td class="py-3 px-4 text-right font-semibold text-slate-900">${m.obtained} / ${m.total}</td>
        <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">${pct}%</span></td>
        <td class="py-3 px-4 text-right"><button type="button" data-action="delete-mark" data-id="${escapeHtml(m.id)}" class="px-2.5 py-1 rounded-md text-xs bg-rose-50 text-rose-700">Delete</button></td>
      </tr>
    `;
  }).join('');
}

document.getElementById('marksTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete-mark"]');
  if (!btn) return;
  state.marks = state.marks.filter(m => m.id !== btn.getAttribute('data-id'));
  saveState();
  renderMarksSection();
  showToast('Evaluation deleted.');
});

// ==========================================
// TAB 8: STUDENT REPORT & PROOF MANAGER
// ==========================================
function populateParentStudentDropdown() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} — ${escapeHtml(s.name)} (${escapeHtml(s.notes || 'Pakistan')})</option>`).join('');
  if (cur) sel.value = cur;
}

function renderStudentDateRangeReport() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const stuId = sel.value;
  const fromDate = document.getElementById('parentFromDate').value || '2026-11-01';
  const toDate = document.getElementById('parentToDate').value || '2026-11-30';
  const box = document.getElementById('parentReportResult');
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;

  const monthKey = fromDate.slice(0, 7) || '2026-11';
  if (!state.fees[monthKey]) state.fees[monthKey] = {};
  const feeRec = state.fees[monthKey][stu.id] || { status: 'Pending', date: '' };
  const isPaid = feeRec.status === 'Paid';
  const curr = stu.currency || 'PKR';

  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);

  box.innerHTML = `
    <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-900">${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})</h3>
          <p class="text-xs text-slate-500">${escapeHtml(stu.className)} • ${escapeHtml(stu.subjects)} • Range: ${escapeHtml(fromDate)} to ${escapeHtml(toDate)}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          Fee (${monthKey}): ${escapeHtml(feeRec.status)} (${curr} ${Number(stu.monthlyFee).toLocaleString()})
        </span>
      </div>

      <!-- NayaPay & Screenshot Box -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
        <div class="text-xs font-bold text-indigo-700 uppercase">💳 NayaPay Account Slip &amp; Screenshot Storage (IndexedDB)</div>
        <div class="text-xs text-slate-600">NayaPay ID: <strong>${NAYAPAY_DETAILS.nayapayId}</strong> | Acc: <strong>${NAYAPAY_DETAILS.accountNumber}</strong> | IBAN: <strong>${NAYAPAY_DETAILS.iban}</strong></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <input id="parentProofFileInput" type="file" accept="image/*" class="text-xs text-slate-600 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold" />
          <input id="parentProofNoteInput" type="text" placeholder="Transaction Note / Reference" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs" />
        </div>
        <button type="button" id="btnSubmitParentProof" class="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">💾 Save Payment Screenshot to IndexedDB</button>
        ${feeRec.proofImage ? `<div class="pt-2"><img src="${feeRec.proofImage}" class="max-h-40 rounded-lg border border-slate-300" /></div>` : ''}
      </div>

      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Attendance (${fromDate} to ${toDate})</span>
          <p class="text-lg font-bold text-indigo-600 mt-1">${getStudentAttendanceStats(stu.id, fromDate, toDate)}</p>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Lessons Logged in Range</span>
          <p class="text-lg font-bold text-emerald-600 mt-1">${rangeSabaq.length} Lessons</p>
        </div>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase mb-2">Lessons &amp; Sabaq Logs (${fromDate} – ${toDate})</h4>
        ${rangeSabaq.length === 0 ? '<p class="text-xs text-slate-400">No lessons recorded in this date range.</p>' : `
          <div class="space-y-1.5">
            ${rangeSabaq.map(l => `
              <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between text-xs">
                <span><strong>${escapeHtml(l.date)} [${escapeHtml(l.category || 'Sabaq')}]:</strong> ${escapeHtml(l.sabaq)} (${escapeHtml(l.revision || '—')})</span>
                <span class="font-bold text-emerald-700">${escapeHtml(l.rating)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('btnSubmitParentProof').addEventListener('click', async () => {
    const fileInput = document.getElementById('parentProofFileInput');
    const noteInput = document.getElementById('parentProofNoteInput');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return showToast('Pehle screenshot image select karein!');
    const compressed = await compressImageFile(file, 700, 0.78);
    state.fees[monthKey][stu.id] = {
      status: 'Under Review',
      date: '',
      proofImage: compressed,
      note: (noteInput.value || '').trim(),
      submittedAt: new Date().toISOString().slice(0, 10)
    };
    await saveState();
    renderAll();
    renderStudentDateRangeReport();
    showToast('Screenshot IndexedDB mein save ho gaya!');
  });
}

document.getElementById('btnParentSearchRoll').addEventListener('click', renderStudentDateRangeReport);

// ==========================================
// BRANDED PDF GENERATOR (WITH CUSTOM LOGO)
// ==========================================
function openBrandedPdfPrintWindow(reportTitle, dateRangeText, bodyHtml) {
  const cfg = state.settings || {};
  const logoHtml = cfg.logoDataUrl
    ? `<img src="${cfg.logoDataUrl}" style="width:65px;height:65px;object-fit:contain;border-radius:10px;" />`
    : `<div style="width:55px;height:55px;border-radius:12px;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">RT</div>`;

  const win = window.open('', '_blank');
  if (!win) return showToast('Popup blocked! Browser mein popups allow karein.');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(reportTitle)} — ${escapeHtml(cfg.academyName)}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 28px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 14px; margin-bottom: 20px; }
        .brand-left { display: flex; align-items: center; gap: 14px; }
        .brand-title { font-size: 20px; font-weight: 800; color: #1e1b4b; margin: 0; }
        .brand-sub { font-size: 12px; color: #475569; margin: 3px 0 0 0; }
        .rep-box { text-align: right; }
        .rep-title { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0; text-transform: uppercase; }
        .rep-date { font-size: 11px; color: #64748b; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 11px; }
        .summary-grid { display: flex; gap: 12px; margin-bottom: 16px; }
        .summary-card { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom:15px;text-align:right;">
        <button onclick="window.print()" style="background:#4f46e5;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:700;cursor:pointer;">🖨️ Save as PDF / Print</button>
      </div>
      <div class="header">
        <div class="brand-left">
          ${logoHtml}
          <div>
            <h1 class="brand-title">${escapeHtml(cfg.academyName || 'Raza Tutors — Online Quran Academy')}</h1>
            <p class="brand-sub">📞 Phone / WhatsApp: ${escapeHtml(cfg.phone || '+92 370 4161579')} | ✉️ Email: ${escapeHtml(cfg.email || 'muhammad.zohaib.748@nayapay')}</p>
          </div>
        </div>
        <div class="rep-box">
          <p class="rep-title">${escapeHtml(reportTitle)}</p>
          <p class="rep-date">${escapeHtml(dateRangeText)}</p>
        </div>
      </div>
      ${bodyHtml}
    </body>
    </html>
  `);
  win.document.close();
}

document.getElementById('btnDownloadStudentPdfReport').addEventListener('click', () => {
  const stuId = document.getElementById('parentPortalStudentSelect').value;
  const fromDate = document.getElementById('parentFromDate').value || '2026-11-01';
  const toDate = document.getElementById('parentToDate').value || '2026-11-30';
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;
  const monthKey = fromDate.slice(0, 7) || '2026-11';
  const feeRec = (state.fees[monthKey] && state.fees[monthKey][stu.id]) || { status: 'Pending', date: '—' };
  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);

  const html = `
    <div class="summary-grid">
      <div class="summary-card"><strong>Student:</strong> ${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})<br><strong>Course:</strong> ${escapeHtml(stu.subjects)}</div>
      <div class="summary-card"><strong>Attendance:</strong> ${getStudentAttendanceStats(stu.id, fromDate, toDate)}<br><strong>Batch:</strong> ${escapeHtml(stu.className)}</div>
      <div class="summary-card"><strong>Monthly Fee (${monthKey}):</strong> ${escapeHtml(stu.currency || 'PKR')} ${Number(stu.monthlyFee).toLocaleString()}<br><strong>Status:</strong> ${escapeHtml(feeRec.status)}</div>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Category</th><th>Lesson / Sabaq Details</th><th>Sabqi / Revision</th><th>Performance</th></tr></thead>
      <tbody>
        ${rangeSabaq.length === 0 ? '<tr><td colspan="5">No lessons logged in this date range.</td></tr>' : rangeSabaq.map(l => `
          <tr>
            <td>${escapeHtml(l.date)}</td>
            <td>${escapeHtml(l.category || 'Quran Sabaq')}</td>
            <td>${escapeHtml(l.sabaq)}</td>
            <td>${escapeHtml(l.revision || '—')}</td>
            <td>${escapeHtml(l.rating)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  openBrandedPdfPrintWindow(`Student Progress & Fee Report`, `Period: ${fromDate} to ${toDate}`, html);
});

// ==========================================
// TAB 10: 10 PDF REPORTS & CHARTS ENGINE
// ==========================================
function renderChartsAndReports() {
  const ctxFin = document.getElementById('chartFinancials');
  const ctxCourse = document.getElementById('chartCourses');
  if (!ctxFin || !ctxCourse || typeof Chart === 'undefined') return;

  const months = Array.from(new Set([
    ...Object.keys(state.fees || {}),
    ...Object.keys(state.snapshots || {}),
    '2026-09', '2026-10', '2026-11'
  ])).sort().slice(-6);

  const incomeData = months.map(m => {
    if (state.snapshots && state.snapshots[m]) return state.snapshots[m].collected;
    return getMonthMetrics(m).collected;
  });
  const outflowData = months.map(m => {
    if (state.snapshots && state.snapshots[m]) return (state.snapshots[m].salaries || 0) + (state.snapshots[m].expenses || 0);
    const met = getMonthMetrics(m);
    return met.monthSalaries + met.monthExpenses;
  });

  if (chartFinInstance) chartFinInstance.destroy();
  chartFinInstance = new Chart(ctxFin, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Collected Fees', data: incomeData, backgroundColor: '#10b981' },
        { label: 'Expenses + Salaries', data: outflowData, backgroundColor: '#f43f5e' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const courseCounts = {};
  state.students.forEach(s => {
    const k = `${s.subjects || 'Quran'} (${s.currency || 'PKR'})`;
    courseCounts[k] = (courseCounts[k] || 0) + 1;
  });

  if (chartCourseInstance) chartCourseInstance.destroy();
  chartCourseInstance = new Chart(ctxCourse, {
    type: 'doughnut',
    data: {
      labels: Object.keys(courseCounts),
      datasets: [{ data: Object.values(courseCounts), backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  generateSelectedReportHtml(false);
}

function generateSelectedReportHtml(openPdf = false) {
  const type = document.getElementById('repTypeSelect').value;
  const fromDate = document.getElementById('repFromDate').value || '2026-11-01';
  const toDate = document.getElementById('repToDate').value || '2026-11-30';
  const monthKey = document.getElementById('repMonthInput').value || '2026-11';
  const m = getMonthMetrics(monthKey);
  const monthFees = state.fees[monthKey] || {};

  let title = '';
  let html = '';

  if (type === '1') {
    title = `1. Executive Financial Summary (${monthKey})`;
    html = `
      <table class="w-full text-left border-collapse">
        <thead><tr><th>Metric</th><th>Month / Scope</th><th>Amount / Value</th></tr></thead>
        <tbody>
          <tr><td>Total Active Students</td><td>${monthKey}</td><td>${m.activeCount} Students</td></tr>
          <tr><td>Current Month Fees Collected</td><td>${monthKey}</td><td>Rs ${m.collected.toLocaleString()}</td></tr>
          <tr><td>Pending Fees (Unpaid)</td><td>${monthKey}</td><td>Rs ${m.pending.toLocaleString()} (${m.unpaidCount} students)</td></tr>
          <tr><td>Teachers Salaries Paid</td><td>${monthKey}</td><td>Rs ${m.monthSalaries.toLocaleString()}</td></tr>
          <tr><td>Academy Operational Expenses</td><td>${monthKey}</td><td>Rs ${m.monthExpenses.toLocaleString()}</td></tr>
          <tr><td><strong>Current Month Net Profit</strong></td><td><strong>${monthKey}</strong></td><td><strong>Rs ${m.netProfit.toLocaleString()}</strong></td></tr>
          <tr><td><strong>Cumulative Net Profit (All Snapshots + Current)</strong></td><td><strong>All Time</strong></td><td><strong>Rs ${m.snapNetTotal.toLocaleString()}</strong></td></tr>
        </tbody>
      </table>`;
  } else if (type === '2') {
    title = `2. Paid Students Fee Collection Report (${monthKey})`;
    const paidList = state.students.filter(s => monthFees[s.id] && monthFees[s.id].status === 'Paid');
    html = `<table><thead><tr><th>Roll No</th><th>Student</th><th>Course</th><th>Paid Date</th><th>Amount</th></tr></thead><tbody>` +
      (paidList.length === 0 ? '<tr><td colspan="5">No paid records found for this month.</td></tr>' : paidList.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.subjects)}</td><td>${escapeHtml(monthFees[s.id].date)}</td><td>${escapeHtml(s.currency || 'PKR')} ${Number(s.monthlyFee).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '3') {
    title = `3. Fee Defaulters & Pending Dues Report (${monthKey})`;
    const unpaidList = state.students.filter(s => s.status === 'Active' && (!monthFees[s.id] || monthFees[s.id].status !== 'Paid'));
    html = `<table><thead><tr><th>Roll No</th><th>Student</th><th>Phone</th><th>Country</th><th>Pending Fee</th></tr></thead><tbody>` +
      (unpaidList.length === 0 ? '<tr><td colspan="5">All active students have paid!</td></tr>' : unpaidList.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.notes || 'Pakistan')}</td><td>${escapeHtml(s.currency || 'PKR')} ${Number(s.monthlyFee).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '4') {
    title = `4. Academy Expense Ledger (${fromDate} to ${toDate})`;
    const exps = (state.expenses || []).filter(x => x.date >= fromDate && x.date <= toDate);
    html = `<table><thead><tr><th>Date</th><th>Expense Title</th><th>Category</th><th>Amount (PKR)</th></tr></thead><tbody>` +
      (exps.length === 0 ? '<tr><td colspan="4">No expenses in this date range.</td></tr>' : exps.map(x => `<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.category)}</td><td>Rs ${Number(x.amount).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '5') {
    title = `5. Teachers Salary & Payout Report (${monthKey})`;
    const sals = (state.salaries || []).filter(x => x.month === monthKey);
    html = `<table><thead><tr><th>Teacher Name</th><th>Phone</th><th>Classes / Hours</th><th>Status</th><th>Salary</th></tr></thead><tbody>` +
      (sals.length === 0 ? '<tr><td colspan="5">No teacher salaries recorded for this month.</td></tr>' : sals.map(x => `<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.classes)}</td><td>${escapeHtml(x.status)}</td><td>Rs ${Number(x.amount).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '6') {
    title = `6. Student Attendance Summary (${fromDate} to ${toDate})`;
    html = `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Batch</th><th>Attendance Rate in Range</th></tr></thead><tbody>` +
      state.students.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.className)}</td><td>${getStudentAttendanceStats(s.id, fromDate, toDate)}</td></tr>`).join('') +
      `</tbody></table>`;
  } else if (type === '7') {
    title = `7. Daily Sabaq, Kalma & Dua Progress (${fromDate} to ${toDate})`;
    const logs = (state.sabaqLogs || []).filter(l => l.date >= fromDate && l.date <= toDate);
    html = `<table><thead><tr><th>Date</th><th>Student</th><th>Category</th><th>Lesson</th><th>Performance</th></tr></thead><tbody>` +
      (logs.length === 0 ? '<tr><td colspan="5">No sabaq logs in this date range.</td></tr>' : logs.map(l => {
        const stu = state.students.find(s => s.id === l.studentId);
        return `<tr><td>${escapeHtml(l.date)}</td><td>${escapeHtml(stu ? stu.name : 'Student')}</td><td>${escapeHtml(l.category || 'Sabaq')}</td><td>${escapeHtml(l.sabaq)}</td><td>${escapeHtml(l.rating)}</td></tr>`;
      }).join('')) + `</tbody></table>`;
  } else if (type === '8') {
    title = `8. Country & Currency Revenue Breakdown`;
    const byCurr = {};
    state.students.filter(s => s.status === 'Active').forEach(s => {
      const c = s.currency || 'PKR';
      if (!byCurr[c]) byCurr[c] = { count: 0, total: 0 };
      byCurr[c].count++;
      byCurr[c].total += Number(s.monthlyFee) || 0;
    });
    html = `<table><thead><tr><th>Currency</th><th>Active Students</th><th>Total Monthly Billing</th></tr></thead><tbody>` +
      Object.keys(byCurr).map(c => `<tr><td>${escapeHtml(c)}</td><td>${byCurr[c].count}</td><td>${escapeHtml(c)} ${byCurr[c].total.toLocaleString()}</td></tr>`).join('') +
      `</tbody></table>`;
  } else if (type === '9') {
    title = `9. Course & Batch Enrollment Report`;
    html = `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Batch</th><th>Course</th><th>Class Time</th></tr></thead><tbody>` +
      state.students.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.className)}</td><td>${escapeHtml(s.subjects)}</td><td>${escapeHtml(s.classTime || '—')}</td></tr>`).join('') +
      `</tbody></table>`;
  } else {
    title = `10. Historical Monthly Financial Snapshots`;
    const keys = Object.keys(state.snapshots || {}).sort().reverse();
    html = `<table><thead><tr><th>Month</th><th>Active Students</th><th>Collected</th><th>Salaries + Expenses</th><th>Net Profit</th></tr></thead><tbody>` +
      (keys.length === 0 ? '<tr><td colspan="5">No snapshots saved yet. Click Save Monthly Snapshot in Fees or Expenses tab.</td></tr>' : keys.map(k => {
        const sn = state.snapshots[k];
        return `<tr><td>${escapeHtml(k)}</td><td>${sn.activeStudents || 0}</td><td>Rs ${Number(sn.collected).toLocaleString()}</td><td>Rs ${Number((sn.salaries || 0) + (sn.expenses || 0)).toLocaleString()}</td><td>Rs ${Number(sn.netProfit).toLocaleString()}</td></tr>`;
      }).join('')) + `</tbody></table>`;
  }

  document.getElementById('reportPreviewContainer').innerHTML = `<h4 class="font-bold text-slate-900 mb-2">${escapeHtml(title)}</h4>` + html;
  if (openPdf) openBrandedPdfPrintWindow(title, `Date Range: ${fromDate} to ${toDate} | Month: ${monthKey}`, html);
}

document.getElementById('btnPreviewReport').addEventListener('click', () => generateSelectedReportHtml(false));
document.getElementById('btnPrintPdfReport').addEventListener('click', () => generateSelectedReportHtml(true));

// ==========================================
// TAB 11: ADMIN BRANDING, LOGO & STAFF USERS
// ==========================================
document.getElementById('btnSaveBranding').addEventListener('click', async () => {
  const name = document.getElementById('brandNameInput').value.trim() || 'Raza Tutors — Online Quran Academy';
  const phone = document.getElementById('brandPhoneInput').value.trim() || '+92 370 4161579';
  const email = document.getElementById('brandEmailInput').value.trim() || 'muhammad.zohaib.748@nayapay';
  const pin = document.getElementById('brandFinPinInput').value.trim() || '1234';
  const logoInput = document.getElementById('brandLogoInput');
  const file = logoInput && logoInput.files && logoInput.files[0];

  let logoUrl = (state.settings && state.settings.logoDataUrl) || '';
  if (file) {
    logoUrl = await compressImageFile(file, 300, 0.85);
  }

  state.settings = {
    academyName: name,
    phone,
    email,
    financialPin: pin,
    logoDataUrl: logoUrl
  };
  await saveState();
  renderAll();
  showToast('Logo, Header Details & Financial PIN saved in IndexedDB!');
});

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;
  const users = getRegisteredUsers();
  const badge = document.getElementById('adminTotalUsersBadge');
  if (badge) badge.textContent = `Total Accounts: ${users.length}`;

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td class="py-2.5 px-4 font-semibold">${escapeHtml(u.name)}</td>
      <td class="py-2.5 px-4">${escapeHtml(u.email)}</td>
      <td class="py-2.5 px-4 font-mono text-xs">${escapeHtml(u.password)}</td>
      <td class="py-2.5 px-4">${escapeHtml(u.role || 'Admin')}</td>
      <td class="py-2.5 px-4 text-center">${escapeHtml(u.status || 'Active')}</td>
      <td class="py-2.5 px-4 text-right">
        ${i === 0 ? '<span class="text-xs text-slate-400 italic">Owner</span>' : `<button type="button" data-del-user="${escapeHtml(u.id)}" class="text-xs text-rose-600 font-bold hover:underline">Delete</button>`}
      </td>
    </tr>
  `).join('');
}

const btnAdminCreateUser = document.getElementById('btnAdminCreateUser');
if (btnAdminCreateUser) {
  btnAdminCreateUser.addEventListener('click', () => {
    const name = document.getElementById('adminNewUserName').value.trim();
    const email = document.getElementById('adminNewUserEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminNewUserPass').value.trim();
    const role = document.getElementById('adminNewUserRole').value;
    if (!name || !email || !password) return showToast('Naam, Username aur Password teeno likhein!');

    const users = getRegisteredUsers();
    if (users.find(u => u.email === email)) return showToast('Ye username pehle se mojood hai!');

    users.push({
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      role,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 10)
    });
    saveRegisteredUsers(users);
    document.getElementById('adminNewUserName').value = '';
    document.getElementById('adminNewUserEmail').value = '';
    document.getElementById('adminNewUserPass').value = '';
    renderAdminUsersTable();
    showToast('Staff account created!');
  });
}

const adminUsersTableBody = document.getElementById('adminUsersTableBody');
if (adminUsersTableBody) {
  adminUsersTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-del-user]');
    if (!btn) return;
    const id = btn.getAttribute('data-del-user');
    const users = getRegisteredUsers().filter(u => u.id !== id);
    saveRegisteredUsers(users);
    renderAdminUsersTable();
    showToast('Account deleted!');
  });
}

// ==========================================
// NAVIGATION TABS & MODALS
// ==========================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('tab-btn-active');
      b.classList.add('tab-btn-inactive');
    });
    btn.classList.add('tab-btn-active');
    btn.classList.remove('tab-btn-inactive');

    document.getElementById('viewStudents').classList.toggle('hidden', tab !== 'students');
    document.getElementById('viewSabaq').classList.toggle('hidden', tab !== 'sabaq');
    document.getElementById('viewDemos').classList.toggle('hidden', tab !== 'demos');
    document.getElementById('viewFees').classList.toggle('hidden', tab !== 'fees');
    document.getElementById('viewExpenses').classList.toggle('hidden', tab !== 'expenses');
    document.getElementById('viewAttendance').classList.toggle('hidden', tab !== 'attendance');
    document.getElementById('viewSalaries').classList.toggle('hidden', tab !== 'salaries');
    document.getElementById('viewParentPortal').classList.toggle('hidden', tab !== 'parentview');
    document.getElementById('viewMarks').classList.toggle('hidden', tab !== 'marks');
    document.getElementById('viewReports').classList.toggle('hidden', tab !== 'reports');
    document.getElementById('viewAdmin').classList.toggle('hidden', tab !== 'admin');

    if (tab === 'reports') renderChartsAndReports();
    if (tab === 'parentview') renderStudentDateRangeReport();
  });
});

function openStudentModal(studentId) {
  const modal = document.getElementById('studentModal');
  if (studentId) {
    const s = state.students.find(item => item.id === studentId);
    if (!s) return;
    document.getElementById('studentModalTitle').textContent = 'Edit Student Details';
    document.getElementById('studentIdInput').value = s.id;
    document.getElementById('studentRollInput').value = s.rollNo;
    document.getElementById('studentNameInput').value = s.name;
    document.getElementById('studentFatherInput').value = s.fatherName || '';
    document.getElementById('studentPhoneInput').value = s.phone || '';
    document.getElementById('studentClassInput').value = s.className || 'Beginner / Starter';
    document.getElementById('studentSubjectsInput').value = s.subjects || 'Quran with Tajweed';
    document.getElementById('studentClassTimeInput').value = s.classTime || '';
    document.getElementById('studentMeetingLinkInput').value = s.meetingLink || '';
    document.getElementById('studentCurrencyInput').value = s.currency || 'PKR';
    document.getElementById('studentFeeInput').value = s.monthlyFee || 0;
    document.getElementById('studentJoinDateInput').value = s.joinDate || '2026-11-01';
    document.getElementById('studentStatusInput').value = s.status || 'Active';
    document.getElementById('studentNotesInput').value = s.notes || '';
  } else {
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentIdInput').value = '';
    document.getElementById('studentRollInput').value = `ST-${101 + state.students.length}`;
  }
  modal.classList.remove('hidden');
}

document.getElementById('btnAddStudentTop').addEventListener('click', () => openStudentModal(null));
document.getElementById('btnCloseStudentModal').addEventListener('click', () => document.getElementById('studentModal').classList.add('hidden'));
document.getElementById('btnCancelStudentModal').addEventListener('click', () => document.getElementById('studentModal').classList.add('hidden'));

document.getElementById('studentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const existingId = document.getElementById('studentIdInput').value;
  const studentObj = {
    id: existingId || ('stu_' + Date.now()),
    rollNo: document.getElementById('studentRollInput').value.trim(),
    name: document.getElementById('studentNameInput').value.trim(),
    fatherName: document.getElementById('studentFatherInput').value.trim(),
    phone: document.getElementById('studentPhoneInput').value.trim(),
    className: document.getElementById('studentClassInput').value,
    subjects: document.getElementById('studentSubjectsInput').value,
    classTime: document.getElementById('studentClassTimeInput').value.trim(),
    meetingLink: document.getElementById('studentMeetingLinkInput').value.trim(),
    currency: document.getElementById('studentCurrencyInput').value,
    monthlyFee: Number(document.getElementById('studentFeeInput').value) || 0,
    joinDate: document.getElementById('studentJoinDateInput').value,
    status: document.getElementById('studentStatusInput').value,
    notes: document.getElementById('studentNotesInput').value.trim()
  };

  if (existingId) {
    const idx = state.students.findIndex(s => s.id === existingId);
    if (idx !== -1) state.students[idx] = studentObj;
  } else {
    state.students.push(studentObj);
  }
  saveState();
  document.getElementById('studentModal').classList.add('hidden');
  renderAll();
  showToast('Student saved to IndexedDB!');
});

document.getElementById('studentsTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  if (action === 'edit-student') openStudentModal(id);
  else if (action === 'delete-student') {
    if (!confirm('Kya aap waqai is student ka record delete karna chahte hain?')) return;
    state.students = state.students.filter(s => s.id !== id);
    saveState();
    renderAll();
    showToast('Student deleted.');
  } else if (action === 'wa-chat') {
    const stu = state.students.find(s => s.id === id);
    if (stu) openWhatsAppChat(stu.phone, `Assalam-o-Alaikum ${stu.name}! (${state.settings.academyName})`);
  }
});

function openProofModal(studentId) {
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  const stu = state.students.find(s => s.id === studentId);
  const rec = state.fees[monthKey] && state.fees[monthKey][studentId];
  if (!stu || !rec || !rec.proofImage) return showToast('No screenshot found.');
  activeProofModalContext = { studentId, monthKey };
  document.getElementById('screenshotModalTitle').textContent = `${stu.name} — Fee Proof (${monthKey})`;
  document.getElementById('screenshotModalImg').src = rec.proofImage;
  document.getElementById('screenshotModalNote').textContent = `Note: ${rec.note || 'None'}`;
  document.getElementById('screenshotModalAdminBtns').classList.remove('hidden');
  document.getElementById('screenshotModal').classList.remove('hidden');
}

document.getElementById('btnCloseScreenshotModal').addEventListener('click', () => document.getElementById('screenshotModal').classList.add('hidden'));
document.getElementById('btnApproveProofModal').addEventListener('click', () => {
  if (!activeProofModalContext) return;
  const { studentId, monthKey } = activeProofModalContext;
  state.fees[monthKey][studentId] = { ...state.fees[monthKey][studentId], status: 'Paid', date: new Date().toISOString().slice(0, 10) };
  saveState();
  renderAll();
  document.getElementById('screenshotModal').classList.add('hidden');
  showToast('Fee Approved!');
});
document.getElementById('btnRejectProofModal').addEventListener('click', () => {
  if (!activeProofModalContext) return;
  const { studentId, monthKey } = activeProofModalContext;
  state.fees[monthKey][studentId] = { status: 'Pending', date: '' };
  saveState();
  renderAll();
  document.getElementById('screenshotModal').classList.add('hidden');
  showToast('Proof rejected and marked Pending.');
});

document.getElementById('feesTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  if (!state.fees[monthKey]) state.fees[monthKey] = {};

  if (action === 'view-proof') openProofModal(id);
  else if (action === 'toggle-fee') {
    const cur = state.fees[monthKey][id] || { status: 'Pending', date: '' };
    state.fees[monthKey][id] = cur.status === 'Paid' ? { status: 'Pending', date: '' } : { ...cur, status: 'Paid', date: new Date().toISOString().slice(0, 10) };
    saveState();
    renderAll();
  } else if (action === 'wa-fee-msg') {
    const stu = state.students.find(s => s.id === id);
    if (!stu) return;
    const rec = state.fees[monthKey][id] || { status: 'Pending', date: '' };
    const curr = stu.currency || 'PKR';
    const msg = rec.status === 'Paid'
      ? `*${state.settings.academyName} — FEE RECEIPT*\nStudent: *${stu.name}* (${stu.rollNo})\nMonth: ${monthKey}\nAmount: *${curr} ${Number(stu.monthlyFee).toLocaleString()}*\nStatus: *APPROVED & PAID* (${rec.date})\n\nJazakAllah Khair!`
      : `*${state.settings.academyName} — FEE REMINDER (${monthKey})*\nStudent: *${stu.name}* (${stu.rollNo})\nFee: *${curr} ${Number(stu.monthlyFee).toLocaleString()}*\n\nNayaPay ID: ${NAYAPAY_DETAILS.nayapayId}\nAccount: ${NAYAPAY_DETAILS.accountNumber}\nIBAN: ${NAYAPAY_DETAILS.iban}`;
    openWhatsAppChat(stu.phone, msg);
  } else if (action === 'fee-slip') {
    const stu = state.students.find(s => s.id === id);
    if (!stu) return;
    const rec = state.fees[monthKey][id] || { status: 'Pending', date: '—' };
    openBrandedPdfPrintWindow(`Official Fee Invoice (${monthKey})`, `Student: ${stu.name} (${stu.rollNo})`, `
      <table>
        <tr><th>Student Name</th><td>${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})</td></tr>
        <tr><th>Course & Batch</th><td>${escapeHtml(stu.subjects)} (${escapeHtml(stu.className)})</td></tr>
        <tr><th>Billing Month</th><td>${escapeHtml(monthKey)}</td></tr>
        <tr><th>Fee Amount</th><td><strong>${escapeHtml(stu.currency || 'PKR')} ${Number(stu.monthlyFee).toLocaleString()}</strong></td></tr>
        <tr><th>Payment Status</th><td><strong>${escapeHtml(rec.status)}</strong> (${escapeHtml(rec.date || 'Unpaid')})</td></tr>
        <tr><th>NayaPay Transfer Details</th><td>ID: ${NAYAPAY_DETAILS.nayapayId} | Acc: ${NAYAPAY_DETAILS.accountNumber} | IBAN: ${NAYAPAY_DETAILS.iban}</td></tr>
      </table>
    `);
  }
});

// Receipt Modal Close Listeners
const btnCloseReceiptModal = document.getElementById('btnCloseReceiptModal');
if (btnCloseReceiptModal) btnCloseReceiptModal.addEventListener('click', () => document.getElementById('receiptModal').classList.add('hidden'));
const btnDismissReceiptModal = document.getElementById('btnDismissReceiptModal');
if (btnDismissReceiptModal) btnDismissReceiptModal.addEventListener('click', () => document.getElementById('receiptModal').classList.add('hidden'));
const btnCopyReceiptText = document.getElementById('btnCopyReceiptText');
if (btnCopyReceiptText) btnCopyReceiptText.addEventListener('click', () => openWhatsAppChat(currentReceiptPhone, currentReceiptText));

document.getElementById('attendanceDateInput').addEventListener('change', renderAll);
document.getElementById('feeMonthInput').addEventListener('change', renderAll);
document.getElementById('filterFeeStatusSelect').addEventListener('change', renderFeesTable);

document.getElementById('btnMarkAllPresent').addEventListener('click', () => {
  const dateKey = document.getElementById('attendanceDateInput').value || '2026-11-10';
  if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
  state.students.filter(s => s.status === 'Active').forEach(s => { state.attendance[dateKey][s.id] = 'Present'; });
  saveState();
  renderAll();
  showToast(`All active students marked Present for ${dateKey}!`);
});

document.getElementById('attendanceTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="mark-att"]');
  if (!btn) return;
  const dateKey = document.getElementById('attendanceDateInput').value || '2026-11-10';
  if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
  state.attendance[dateKey][btn.getAttribute('data-id')] = btn.getAttribute('data-status');
  saveState();
  renderAll();
});

document.getElementById('btnAddDemo').addEventListener('click', () => {
  const name = document.getElementById('demoStudentName').value.trim();
  const phone = document.getElementById('demoPhone').value.trim();
  const course = document.getElementById('demoCourse').value.trim();
  const dateTime = document.getElementById('demoDateTime').value.trim();
  const status = document.getElementById('demoStatus').value;
  if (!name || !phone) return showToast('Enter Name & Phone!');
  state.demos.unshift({ id: 'dm_' + Date.now(), name, phone, course, dateTime, status });
  document.getElementById('demoStudentName').value = '';
  document.getElementById('demoPhone').value = '';
  document.getElementById('demoCourse').value = '';
  document.getElementById('demoDateTime').value = '';
  saveState();
  renderDemosTable();
  showToast('Trial class added!');
});

document.getElementById('demosTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const d = state.demos.find(x => x.id === id);
  if (!d) return;
  if (action === 'delete-demo') state.demos = state.demos.filter(x => x.id !== id);
  else if (action === 'wa-demo-msg') openWhatsAppChat(d.phone, `Assalam-o-Alaikum ${d.name}! Your trial class at ${state.settings.academyName} is scheduled for ${d.dateTime}.`);
  else if (action === 'convert-demo') {
    state.students.push({
      id: 'stu_' + Date.now(),
      rollNo: `ST-${101 + state.students.length}`,
      name: d.name,
      fatherName: '',
      phone: d.phone,
      className: 'Beginner / Starter',
      subjects: d.course || 'Quran with Tajweed',
      classTime: d.dateTime || '',
      meetingLink: '',
      currency: 'PKR',
      monthlyFee: 3000,
      joinDate: '2026-11-10',
      status: 'Active',
      notes: ''
    });
    d.status = 'Converted (Enrolled)';
    showToast(`${d.name} enrolled as Active Student!`);
  }
  saveState();
  renderAll();
});

document.getElementById('btnAddSalary').addEventListener('click', () => {
  const name = document.getElementById('salTeacherName').value.trim();
  const phone = document.getElementById('salTeacherPhone').value.trim();
  const month = document.getElementById('salMonth').value || '2026-11';
  const classes = document.getElementById('salClasses').value.trim();
  const amount = Number(document.getElementById('salAmount').value) || 0;
  if (!name || !amount) return showToast('Enter Teacher Name & Salary!');
  state.salaries.unshift({ id: 'sal_' + Date.now(), name, phone, month, classes, amount, status: 'Pending' });
  document.getElementById('salTeacherName').value = '';
  document.getElementById('salTeacherPhone').value = '';
  document.getElementById('salClasses').value = '';
  document.getElementById('salAmount').value = '';
  saveState();
  renderAll();
  showToast('Salary record saved!');
});

document.getElementById('salariesTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const item = state.salaries.find(x => x.id === id);
  if (!item) return;
  if (action === 'toggle-sal-status') item.status = item.status === 'Paid' ? 'Pending' : 'Paid';
  else if (action === 'delete-sal') state.salaries = state.salaries.filter(x => x.id !== id);
  else if (action === 'wa-sal-slip') openWhatsAppChat(item.phone, `*SALARY SLIP (${item.month})*\nTeacher: ${item.name}\nAmount: Rs ${Number(item.amount).toLocaleString()}\nStatus: ${item.status}`);
  saveState();
  renderAll();
});

document.getElementById('btnAddMarkRecord').addEventListener('click', () => {
  const studentId = document.getElementById('markStudentSelect').value;
  const testTitle = document.getElementById('markTestTitle').value.trim();
  const subject = document.getElementById('markSubject').value.trim();
  const obtained = Number(document.getElementById('markObtained').value);
  const total = Number(document.getElementById('markTotal').value) || 50;
  if (!studentId || !testTitle || isNaN(obtained)) return showToast('Fill test details!');
  state.marks.unshift({ id: 'mk_' + Date.now(), studentId, testTitle, subject, obtained, total });
  document.getElementById('markTestTitle').value = '';
  document.getElementById('markObtained').value = '';
  saveState();
  renderMarksSection();
  showToast('Evaluation saved!');
});

// ==========================================
// BACKUP, OLD BACKUP RESTORE & CSV EXPORT
// ==========================================
document.getElementById('btnBackupJson').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `raza_tutors_indexeddb_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full IndexedDB Backup Downloaded!');
});

document.getElementById('inputRestoreJson').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const imported = JSON.parse(String(ev.target.result));
      if (imported && Array.isArray(imported.students)) {
        state = normalizeLoadedState(imported);
        await saveState();
        renderAll();
        showToast('Old Backup successfully restored into IndexedDB!');
      } else {
        showToast('Invalid backup JSON file.');
      }
    } catch (err) {
      showToast('Failed to parse backup file.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('btnExportCsv').addEventListener('click', () => {
  const monthKey = document.getElementById('feeMonthInput').value || '2026-11';
  const headers = ['Roll No', 'Name', 'Country', 'Batch', 'Course', 'Phone', 'Currency', 'Fee', `Status (${monthKey})`];
  const rows = state.students.map(s => [
    s.rollNo,
    s.name,
    s.notes || '',
    s.className || '',
    s.subjects || '',
    s.phone || '',
    s.currency || 'PKR',
    s.monthlyFee || 0,
    (state.fees[monthKey] && state.fees[monthKey][s.id]) ? state.fees[monthKey][s.id].status : 'Pending'
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `raza_tutors_${monthKey}.csv`;
  a.click();
});

// ==========================================
// INITIALIZE PORTAL & AUTO-MIGRATE OLD DATA
// ==========================================
(async function initPortal() {
  try {
    const idbData = await idbGetState();
    if (idbData && Array.isArray(idbData.students)) {
      state = normalizeLoadedState(idbData);
    } else {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem('sms_portal_data_v3');
      if (legacyRaw) {
        state = normalizeLoadedState(JSON.parse(legacyRaw));
        await saveState();
        showToast('Purana data IndexedDB mein shift ho gaya!');
      } else {
        await saveState();
      }
    }
  } catch (e) {}
  renderAll();
})();