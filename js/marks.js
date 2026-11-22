// ==========================================
// TAB 9: TESTS & RECITATION EVALUATIONS
// ==========================================
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

document.getElementById('marksTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="delete-mark"]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const item = (state.marks || []).find(m => m.id === id);
  const ok = await showConfirmModal({
    title: 'Delete Test Evaluation?',
    message: `Kya aap "${item ? item.testTitle : 'this test result'}" delete karna chahte hain?`,
    confirmText: 'Haan, Delete Karein',
    variant: 'danger'
  });
  if (!ok) return;
  state.marks = state.marks.filter(m => m.id !== id);
  await saveState();
  renderMarksSection();
  showToast('Evaluation deleted.');
});
