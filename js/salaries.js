// ==========================================
// TAB 7: TEACHERS SALARY & PAYOUTS
// ==========================================
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

document.getElementById('btnAddSalary').addEventListener('click', () => {
  const name = document.getElementById('salTeacherName').value.trim();
  const phone = document.getElementById('salTeacherPhone').value.trim();
  const month = document.getElementById('salMonth').value || getCurrentMonthStr();
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

document.getElementById('salariesTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const item = state.salaries.find(x => x.id === id);
  if (!item) return;

  if (action === 'toggle-sal-status') {
    const nextStatus = item.status === 'Paid' ? 'Pending' : 'Paid';
    const ok = await showConfirmModal({
      title: `Mark Salary ${nextStatus}?`,
      message: `Kya aap ${item.name} (${item.month}) ki salary "${nextStatus}" mark karna chahte hain?`,
      confirmText: `Haan, ${nextStatus} Karein`,
      variant: nextStatus === 'Paid' ? 'success' : 'danger'
    });
    if (!ok) return;
    item.status = nextStatus;
  } else if (action === 'delete-sal') {
    const ok = await showConfirmModal({
      title: 'Delete Salary Record?',
      message: `Kya aap ${item.name} (${item.month}) ka salary record delete karna chahte hain?`,
      confirmText: 'Haan, Delete Karein',
      variant: 'danger'
    });
    if (!ok) return;
    state.salaries = state.salaries.filter(x => x.id !== id);
  } else if (action === 'wa-sal-slip') {
    openWhatsAppChat(item.phone, `*SALARY SLIP (${item.month})*\nTeacher: ${item.name}\nAmount: Rs ${Number(item.amount).toLocaleString()}\nStatus: ${item.status}`);
    return;
  }
  await saveState();
  renderAll();
});
