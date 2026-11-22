// ==========================================
// TAB 4: MONTHLY FEES, SCREENSHOT QUEUE & MODALS
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

// Receipt Modal Close & Filter Listeners
const btnCloseReceiptModal = document.getElementById('btnCloseReceiptModal');
if (btnCloseReceiptModal) btnCloseReceiptModal.addEventListener('click', () => document.getElementById('receiptModal').classList.add('hidden'));
const btnDismissReceiptModal = document.getElementById('btnDismissReceiptModal');
if (btnDismissReceiptModal) btnDismissReceiptModal.addEventListener('click', () => document.getElementById('receiptModal').classList.add('hidden'));
const btnCopyReceiptText = document.getElementById('btnCopyReceiptText');
if (btnCopyReceiptText) btnCopyReceiptText.addEventListener('click', () => openWhatsAppChat(currentReceiptPhone, currentReceiptText));

document.getElementById('feeMonthInput').addEventListener('change', renderAll);
document.getElementById('filterFeeStatusSelect').addEventListener('change', renderFeesTable);
