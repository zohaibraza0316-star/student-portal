// ==========================================
// TAB 3: TRIAL / DEMO CLASSES
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

document.getElementById('demosTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const d = state.demos.find(x => x.id === id);
  if (!d) return;

  if (action === 'delete-demo') {
    const ok = await showConfirmModal({
      title: 'Delete Trial / Demo Class?',
      message: `Kya aap "${d.name}" ki demo class entry delete karna chahte hain?`,
      confirmText: 'Haan, Delete Karein',
      variant: 'danger'
    });
    if (!ok) return;
    state.demos = state.demos.filter(x => x.id !== id);
  } else if (action === 'wa-demo-msg') {
    openWhatsAppChat(d.phone, `Assalam-o-Alaikum ${d.name}! Your trial class at ${state.settings.academyName} is scheduled for ${d.dateTime}.`);
    return;
  } else if (action === 'convert-demo') {
    const ok = await showConfirmModal({
      title: 'Enroll Demo Student?',
      message: `Kya aap "${d.name}" ko Active Student ke taur par Students Directory mein enroll karna chahte hain?`,
      confirmText: 'Haan, Enroll Karein',
      variant: 'success'
    });
    if (!ok) return;
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
      joinDate: getTodayDateStr(),
      status: 'Active',
      notes: ''
    });
    d.status = 'Converted (Enrolled)';
    showToast(`${d.name} enrolled as Active Student!`);
  }
  await saveState();
  renderAll();
});
