// ==========================================
// BRANDING, KPI SUMMARY & GLOBAL RENDERER
// ==========================================
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

function updateFilterDropdowns() {
  const batchSelect = document.getElementById('filterClassSelect');
  const courseSelect = document.getElementById('filterCourseSelect');
  const attBatch = document.getElementById('attBatchFilter');
  const repStudent = document.getElementById('repStudentFilter');
  const sabaqFilterStu = document.getElementById('filterSabaqStudent');

  const batches = Array.from(new Set(state.students.map(s => (s.className || '').trim()).filter(Boolean)));
  const courses = Array.from(new Set(state.students.map(s => (s.subjects || '').trim()).filter(Boolean)));

  if (batchSelect) {
    const cur = batchSelect.value;
    batchSelect.innerHTML = '<option value="ALL">All Batches</option>' + batches.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (batches.includes(cur)) batchSelect.value = cur;
  }
  if (courseSelect) {
    const cur = courseSelect.value;
    courseSelect.innerHTML = '<option value="ALL">All Courses</option>' + courses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (courses.includes(cur)) courseSelect.value = cur;
  }
  if (attBatch) {
    const cur = attBatch.value;
    attBatch.innerHTML = '<option value="ALL">All Batches</option>' + batches.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (batches.includes(cur)) attBatch.value = cur;
  }
  const studentOptions = '<option value="ALL">All Students</option>' + state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} — ${escapeHtml(s.name)}</option>`).join('');
  if (repStudent) {
    const cur = repStudent.value;
    repStudent.innerHTML = studentOptions;
    if (cur && state.students.some(s => s.id === cur)) repStudent.value = cur;
  }
  if (sabaqFilterStu) {
    const cur = sabaqFilterStu.value;
    sabaqFilterStu.innerHTML = studentOptions;
    if (cur && state.students.some(s => s.id === cur)) sabaqFilterStu.value = cur;
  }
}

function renderSummaryStats() {
  const total = state.students.length;
  const monthKey = document.getElementById('feeMonthInput').value || getCurrentMonthStr();
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

  const dateKey = document.getElementById('attendanceDateInput').value || getTodayDateStr();
  const dayAtt = state.attendance[dateKey] || {};
  let presentCount = 0;
  state.students.filter(s => s.status === 'Active').forEach(s => {
    if (dayAtt[s.id] === 'Present') presentCount++;
  });
  const rate = m.activeCount > 0 ? Math.round((presentCount / m.activeCount) * 100) : 0;
  document.getElementById('statAttendanceRate').textContent = `Attendance (${dateKey}): ${rate}%`;
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
