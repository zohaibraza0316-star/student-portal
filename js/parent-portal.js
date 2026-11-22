// ==========================================
// TAB 8: STUDENT REPORT & PAYMENT PROOF MANAGER
// ==========================================
function populateParentStudentDropdown() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} — ${escapeHtml(s.name)} (${escapeHtml(s.notes || 'Pakistan')})</option>`).join('');
  if (cur) sel.value = cur;
}

function renderStudentDateRangeReport() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const stuId = sel.value;
  const fromDate = document.getElementById('parentFromDate').value || '2026-11-01';
  const toDate = document.getElementById('parentToDate').value || '2026-11-30';
  const box = document.getElementById('parentReportResult');
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;

  const monthKey = fromDate.slice(0, 7) || '2026-11';
  if (!state.fees[monthKey]) state.fees[monthKey] = {};
  const feeRec = state.fees[monthKey][stu.id] || { status: 'Pending', date: '' };
  const isPaid = feeRec.status === 'Paid';
  const curr = stu.currency || 'PKR';

  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);

  box.innerHTML = `
    <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-900">${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})</h3>
          <p class="text-xs text-slate-500">${escapeHtml(stu.className)} • ${escapeHtml(stu.subjects)} • Range: ${escapeHtml(fromDate)} to ${escapeHtml(toDate)}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          Fee (${monthKey}): ${escapeHtml(feeRec.status)} (${curr} ${Number(stu.monthlyFee).toLocaleString()})
        </span>
      </div>

      <!-- NayaPay & Screenshot Box -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
        <div class="text-xs font-bold text-indigo-700 uppercase">💳 NayaPay Account Slip &amp; Screenshot Storage (IndexedDB)</div>
        <div class="text-xs text-slate-600">NayaPay ID: <strong>${NAYAPAY_DETAILS.nayapayId}</strong> | Acc: <strong>${NAYAPAY_DETAILS.accountNumber}</strong> | IBAN: <strong>${NAYAPAY_DETAILS.iban}</strong></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <input id="parentProofFileInput" type="file" accept="image/*" class="text-xs text-slate-600 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold" />
          <input id="parentProofNoteInput" type="text" placeholder="Transaction Note / Reference" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs" />
        </div>
        <button type="button" id="btnSubmitParentProof" class="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">💾 Save Payment Screenshot to IndexedDB</button>
        ${feeRec.proofImage ? `<div class="pt-2"><img src="${feeRec.proofImage}" class="max-h-40 rounded-lg border border-slate-300" /></div>` : ''}
      </div>

      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Attendance (${fromDate} to ${toDate})</span>
          <p class="text-lg font-bold text-indigo-600 mt-1">${getStudentAttendanceStats(stu.id, fromDate, toDate)}</p>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Lessons Logged in Range</span>
          <p class="text-lg font-bold text-emerald-600 mt-1">${rangeSabaq.length} Lessons</p>
        </div>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase mb-2">Lessons &amp; Sabaq Logs (${fromDate} – ${toDate})</h4>
        ${rangeSabaq.length === 0 ? '<p class="text-xs text-slate-400">No lessons recorded in this date range.</p>' : `
          <div class="space-y-1.5">
            ${rangeSabaq.map(l => `
              <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between text-xs">
                <span><strong>${escapeHtml(l.date)} [${escapeHtml(l.category || 'Sabaq')}]:</strong> ${escapeHtml(l.sabaq)} (${escapeHtml(l.revision || '—')})</span>
                <span class="font-bold text-emerald-700">${escapeHtml(l.rating)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('btnSubmitParentProof').addEventListener('click', async () => {
    const fileInput = document.getElementById('parentProofFileInput');
    const noteInput = document.getElementById('parentProofNoteInput');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return showToast('Pehle screenshot image select karein!');
    const compressed = await compressImageFile(file, 700, 0.78);
    state.fees[monthKey][stu.id] = {
      status: 'Under Review',
      date: '',
      proofImage: compressed,
      note: (noteInput.value || '').trim(),
      submittedAt: new Date().toISOString().slice(0, 10)
    };
    await saveState();
    renderAll();
    renderStudentDateRangeReport();
    showToast('Screenshot IndexedDB mein save ho gaya!');
  });
}

document.getElementById('btnParentSearchRoll').addEventListener('click', renderStudentDateRangeReport);

document.getElementById('btnDownloadStudentPdfReport').addEventListener('click', () => {
  const stuId = document.getElementById('parentPortalStudentSelect').value;
  const fromDate = document.getElementById('parentFromDate').value || '2026-11-01';
  const toDate = document.getElementById('parentToDate').value || '2026-11-30';
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;
  const monthKey = fromDate.slice(0, 7) || '2026-11';
  const feeRec = (state.fees[monthKey] && state.fees[monthKey][stu.id]) || { status: 'Pending', date: '—' };
  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);

  const html = `
    <div class="summary-grid">
      <div class="summary-card"><strong>Student:</strong> ${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})<br><strong>Course:</strong> ${escapeHtml(stu.subjects)}</div>
      <div class="summary-card"><strong>Attendance:</strong> ${getStudentAttendanceStats(stu.id, fromDate, toDate)}<br><strong>Batch:</strong> ${escapeHtml(stu.className)}</div>
      <div class="summary-card"><strong>Monthly Fee (${monthKey}):</strong> ${escapeHtml(stu.currency || 'PKR')} ${Number(stu.monthlyFee).toLocaleString()}<br><strong>Status:</strong> ${escapeHtml(feeRec.status)}</div>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Category</th><th>Lesson / Sabaq Details</th><th>Sabqi / Revision</th><th>Performance</th></tr></thead>
      <tbody>
        ${rangeSabaq.length === 0 ? '<tr><td colspan="5">No lessons logged in this date range.</td></tr>' : rangeSabaq.map(l => `
          <tr>
            <td>${escapeHtml(l.date)}</td>
            <td>${escapeHtml(l.category || 'Quran Sabaq')}</td>
            <td>${escapeHtml(l.sabaq)}</td>
            <td>${escapeHtml(l.revision || '—')}</td>
            <td>${escapeHtml(l.rating)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  openBrandedPdfPrintWindow(`Student Progress & Fee Report`, `Period: ${fromDate} to ${toDate}`, html);
});
