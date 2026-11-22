// ==========================================
// STARTUP, SHELL CONTROLS, NAVIGATION & INIT
// ==========================================

// Apply saved Dark Mode on startup
if (localStorage.getItem(THEME_KEY) === 'true') {
  document.body.classList.add('dark-mode');
}

// Smart Today Date Defaults
(function setSmartDefaultDates() {
  const today = getTodayDateStr();
  const month = getCurrentMonthStr();
  const firstOfMonth = `${month}-01`;
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const lastOfMonth = `${month}-${String(lastDay).padStart(2, '0')}`;

  const dateMap = {
    attendanceDateInput: today,
    sabaqDateInput: today,
    expDateInput: today,
    studentJoinDateInput: today,
    feeMonthInput: month,
    salMonth: month,
    repMonthInput: month,
    repFromDate: firstOfMonth,
    repToDate: lastOfMonth,
    parentFromDate: firstOfMonth,
    parentToDate: lastOfMonth
  };
  Object.keys(dateMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = dateMap[id];
  });
})();

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

// Collapsible Sidebar & Mobile Drawer Toggle
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');
if (btnToggleSidebar) {
  btnToggleSidebar.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      document.body.classList.toggle('mobile-sidebar-open');
    } else {
      document.body.classList.toggle('sidebar-collapsed');
    }
  });
}
if (mobileSidebarBackdrop) {
  mobileSidebarBackdrop.addEventListener('click', () => {
    document.body.classList.remove('mobile-sidebar-open');
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
    if (!document.getElementById('viewReports').classList.contains('hidden')) {
      renderChartsAndReports();
    }
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

// Financial Privacy Lock Toggle
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

// Close Modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['screenshotModal', 'studentModal', 'receiptModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    document.body.classList.remove('mobile-sidebar-open');
  }
});

// Navigation Tabs Switching
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

    document.body.classList.remove('mobile-sidebar-open');

    if (tab === 'reports') renderChartsAndReports();
    if (tab === 'parentview') renderStudentDateRangeReport();
    if (tab === 'admin' && typeof checkOfflineDiagnostics === 'function') checkOfflineDiagnostics();
  });
});

// Initialize Portal & Auto-Migrate Old localStorage Data
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
  if (typeof checkOfflineDiagnostics === 'function') checkOfflineDiagnostics();
})();
