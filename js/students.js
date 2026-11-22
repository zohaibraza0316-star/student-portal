// ==========================================
// TAB 1: STUDENTS DIRECTORY, PAGINATION & MODAL
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
    document.getElementById('studentJoinDateInput').value = s.joinDate || getTodayDateStr();
    document.getElementById('studentStatusInput').value = s.status || 'Active';
    document.getElementById('studentNotesInput').value = s.notes || '';
  } else {
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentIdInput').value = '';
    document.getElementById('studentRollInput').value = `ST-${101 + state.students.length}`;
    document.getElementById('studentJoinDateInput').value = getTodayDateStr();
  }
  modal.classList.remove('hidden');
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
    joinDate: document.getElementById('studentJoinDateInput').value || getTodayDateStr(),
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

document.getElementById('studentsTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const stu = state.students.find(s => s.id === id);

  if (action === 'edit-student') openStudentModal(id);
  else if (action === 'delete-student') {
    const ok = await showConfirmModal({
      title: 'Delete Student Record?',
      message: `Kya aap waqai "${stu ? stu.name + ' (' + stu.rollNo + ')' : 'this student'}" ko permanently delete karna chahte hain?`,
      confirmText: 'Haan, Delete Karein',
      variant: 'danger'
    });
    if (!ok) return;
    state.students = state.students.filter(s => s.id !== id);
    await saveState();
    renderAll();
    showToast('Student deleted.');
  } else if (action === 'wa-chat') {
    if (stu) openWhatsAppChat(stu.phone, `Assalam-o-Alaikum ${stu.name}! (${state.settings.academyName})`);
  }
});
