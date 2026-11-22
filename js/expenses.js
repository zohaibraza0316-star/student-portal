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

async function saveSnapshotForCurrentMonth() {
  const monthKey = document.getElementById('feeMonthInput').value || getCurrentMonthStr();
  const ok = await showConfirmModal({
    title: `Save Monthly Snapshot (${monthKey})?`,
    message: `Kya aap ${monthKey} ke fees, salaries aur expenses ka financial snapshot IndexedDB mein save/update karna chahte hain?`,
    confirmText: 'Haan, Snapshot Save Karein',
    variant: 'primary'
  });
  if (!ok) return;

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
    savedAt: getTodayDateStr()
  };
  await saveState();
  renderAll();
  showToast(`Monthly Snapshot (${monthKey}) saved in IndexedDB!`);
}

document.getElementById('btnAddExpense').addEventListener('click', () => {
  const date = document.getElementById('expDateInput').value || getTodayDateStr();
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

document.getElementById('expensesTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="del-exp"]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const item = (state.expenses || []).find(x => x.id === id);
  const ok = await showConfirmModal({
    title: 'Delete Expense Entry?',
    message: `Kya aap "${item ? item.title : 'this expense'}" ko delete karna chahte hain?`,
    confirmText: 'Haan, Delete Karein',
    variant: 'danger'
  });
  if (!ok) return;
  state.expenses = state.expenses.filter(x => x.id !== id);
  await saveState();
  renderAll();
  showToast('Expense deleted.');
});

document.getElementById('btnSaveMonthlySnapshot').addEventListener('click', saveSnapshotForCurrentMonth);
document.getElementById('btnTakeSnapshotNow').addEventListener('click', saveSnapshotForCurrentMonth);
