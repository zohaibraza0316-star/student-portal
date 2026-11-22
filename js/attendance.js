// ==========================================
// TAB 6: DAILY ATTENDANCE
// ==========================================
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

document.getElementById('attendanceDateInput').addEventListener('change', renderAll);

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
