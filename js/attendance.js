// ==========================================
// TAB 6: DAILY ATTENDANCE (AUTO TODAY DATE + FILTERS + CONFIRM POPUP)
// ==========================================
function renderAttendanceTable() {
  const dateInput = document.getElementById('attendanceDateInput');
  const todayStr = getTodayDateStr();
  if (dateInput && !dateInput.value) dateInput.value = todayStr;
  const dateKey = (dateInput && dateInput.value) || todayStr;

  const todayLbl = document.getElementById('attendanceTodayLabel');
  if (todayLbl) {
    todayLbl.textContent = dateKey === todayStr
      ? `📅 Aaj ki Date: ${formatReadableDate(dateKey)} (Today)`
      : `Selected Date: ${formatReadableDate(dateKey)}`;
  }

  const batchFilter = (document.getElementById('attBatchFilter') || {}).value || 'ALL';
  const searchQ = ((document.getElementById('attSearchInput') || {}).value || '').trim().toLowerCase();

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

  const filtered = state.students.filter(s => {
    const okBatch = batchFilter === 'ALL' || s.className === batchFilter;
    const okQ = !searchQ || (s.name || '').toLowerCase().includes(searchQ) || (s.rollNo || '').toLowerCase().includes(searchQ);
    return okBatch && okQ;
  });

  document.getElementById('attendanceTableBody').innerHTML = filtered.map(s => {
    const st = dayAtt[s.id] || 'Not Marked';
    return `
      <tr>
        <td class="py-3 px-4 font-semibold text-slate-700">${escapeHtml(s.rollNo)}</td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-900">${escapeHtml(s.name)}</div>
          <div class="text-[11px] text-slate-500">${escapeHtml(s.subjects)} ${s.classTime ? '• ' + escapeHtml(s.classTime) : ''}</div>
        </td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(s.className)}</td>
        <td class="py-3 px-4 text-center text-xs font-medium text-slate-600">${getStudentAttendanceStats(s.id)}</td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Present" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">Present</button>
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Absent" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}">Absent</button>
          <button type="button" data-action="mark-att" data-id="${escapeHtml(s.id)}" data-status="Leave" class="px-3 py-1 rounded-md text-xs font-semibold ${st === 'Leave' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}">Leave</button>
          ${st === 'Absent' ? `<button type="button" data-action="wa-absent-alert" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">📲 WA Alert</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('attendanceDateInput').addEventListener('change', renderAll);

const btnAttJumpToday = document.getElementById('btnAttJumpToday');
if (btnAttJumpToday) {
  btnAttJumpToday.addEventListener('click', () => {
    const today = getTodayDateStr();
    document.getElementById('attendanceDateInput').value = today;
    renderAll();
    showToast(`Attendance date set to Today (${formatReadableDate(today)})!`);
  });
}

const attBatchFilter = document.getElementById('attBatchFilter');
if (attBatchFilter) attBatchFilter.addEventListener('change', renderAttendanceTable);
const attSearchInput = document.getElementById('attSearchInput');
if (attSearchInput) attSearchInput.addEventListener('input', renderAttendanceTable);

const btnOpenMonthlyAttReport = document.getElementById('btnOpenMonthlyAttReport');
if (btnOpenMonthlyAttReport) {
  btnOpenMonthlyAttReport.addEventListener('click', () => {
    const dateKey = document.getElementById('attendanceDateInput').value || getTodayDateStr();
    const repType = document.getElementById('repTypeSelect');
    const repMonth = document.getElementById('repMonthInput');
    if (repType) repType.value = '6';
    if (repMonth) repMonth.value = dateKey.slice(0, 7);
    const repTabBtn = document.querySelector('.tab-btn[data-tab="reports"]');
    if (repTabBtn) repTabBtn.click();
  });
}

document.getElementById('btnMarkAllPresent').addEventListener('click', async () => {
  const dateKey = document.getElementById('attendanceDateInput').value || getTodayDateStr();
  const activeCount = state.students.filter(s => s.status === 'Active').length;
  const ok = await showConfirmModal({
    title: 'Mark All Present?',
    message: `Kya aap ${dateKey} ke liye tamaam ${activeCount} active students ko Present mark karna chahte hain?`,
    confirmText: 'Haan, Mark All Present',
    variant: 'success'
  });
  if (!ok) return;
  if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
  state.students.filter(s => s.status === 'Active').forEach(s => { state.attendance[dateKey][s.id] = 'Present'; });
  await saveState();
  renderAll();
  showToast(`All active students marked Present for ${dateKey}!`);
});

document.getElementById('attendanceTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const dateKey = document.getElementById('attendanceDateInput').value || getTodayDateStr();

  if (action === 'mark-att') {
    if (!state.attendance[dateKey]) state.attendance[dateKey] = {};
    state.attendance[dateKey][id] = btn.getAttribute('data-status');
    saveState();
    renderAll();
  } else if (action === 'wa-absent-alert') {
    const stu = state.students.find(s => s.id === id);
    if (!stu) return;
    const msg = `*ATTENDANCE NOTICE — ${state.settings.academyName}*\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}* (${stu.rollNo})\nDate: *${dateKey}*\nStatus: *ABSENT*\n\nAaj student class mein hazir nahi hua. Meherbani farma kar wajah se aagah karein. JazakAllah!`;
    openWhatsAppChat(stu.phone, msg);
  }
});
