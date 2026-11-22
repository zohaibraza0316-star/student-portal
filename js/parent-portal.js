// ==========================================
// TAB 8: STUDENT REPORT & PAYMENT PROOF MANAGER (DATE-WISE ATTENDANCE TABLE + MULTI-PHOTOS)
// ==========================================
let parentAttListFilter = 'ALL'; // 'ALL' | 'MARKED' | 'ABSENT_LEAVE'

function populateParentStudentDropdown() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} — ${escapeHtml(s.name)} (${escapeHtml(s.notes || 'Pakistan')})</option>`).join('');
  if (cur && state.students.some(s => s.id === cur)) sel.value = cur;
}

function getStudentDailyAttendanceInRange(studentId, fromDate, toDate) {
  const days = getDatesInRange(fromDate, toDate);
  let p = 0, a = 0, l = 0;
  const details = days.map(d => {
    const st = (state.attendance[d.key] && state.attendance[d.key][studentId]) || '';
    if (st === 'Present') p++;
    else if (st === 'Absent') a++;
    else if (st === 'Leave') l++;
    return { date: d.key, label: d.day, weekday: d.weekday, status: st };
  });
  const marked = p + a + l;
  const pct = marked > 0 ? Math.round((p / marked) * 100) : 100;
  return { details, p, a, l, marked, pct };
}

function formatAttStatusBadgeHtml(status) {
  if (status === 'Present') {
    return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✅ Present (Hazir)</span>';
  }
  if (status === 'Absent') {
    return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">❌ Absent (Ghair Hazir)</span>';
  }
  if (status === 'Leave') {
    return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">🟡 Leave (Chutti)</span>';
  }
  return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">— Not Marked</span>';
}

function renderStudentDateRangeReport() {
  const sel = document.getElementById('parentPortalStudentSelect');
  if (!sel) return;
  const stuId = sel.value;
  const fromDate = document.getElementById('parentFromDate').value || getMonthStartDateStr();
  const toDate = document.getElementById('parentToDate').value || getMonthEndDateStr();
  const box = document.getElementById('parentReportResult');
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;

  const monthKey = fromDate.slice(0, 7) || getCurrentMonthStr();
  if (!state.fees[monthKey]) state.fees[monthKey] = {};
  const feeRec = state.fees[monthKey][stu.id] || { status: 'Pending', date: '' };
  const isPaid = feeRec.status === 'Paid';
  const curr = stu.currency || 'PKR';

  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);
  const att = getStudentDailyAttendanceInRange(stu.id, fromDate, toDate);

  const visibleAttRows = att.details.filter(d => {
    if (parentAttListFilter === 'MARKED') return Boolean(d.status);
    if (parentAttListFilter === 'ABSENT_LEAVE') return d.status === 'Absent' || d.status === 'Leave';
    return true;
  });

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

      <!-- Attendance & Sabaq KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Attendance Rate</span>
          <p class="text-lg font-bold text-indigo-600 mt-1">${att.pct}% (${att.p}/${att.marked})</p>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Hazir / Ghair Hazir / Chutti</span>
          <p class="text-sm font-bold text-slate-800 mt-2">✅ ${att.p} &nbsp; ❌ ${att.a} &nbsp; 🟡 ${att.l}</p>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Lessons Logged</span>
          <p class="text-lg font-bold text-emerald-600 mt-1">${rangeSabaq.length} Lessons</p>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200">
          <span class="text-xs text-slate-500">Sabaq Proofs</span>
          <p class="text-lg font-bold text-sky-600 mt-1">${rangeSabaq.reduce((s, l) => s + getSabaqImages(l).length, 0)} Photos</p>
        </div>
      </div>

      <!-- FULL DATE-WISE ATTENDANCE TABLE (Har Din ki Hazri Detail) -->
      <div class="rounded-xl bg-white border border-slate-200 overflow-hidden">
        <div class="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 class="text-xs font-bold text-slate-800 uppercase">📅 Date-Wise Attendance Record (${escapeHtml(fromDate)} to ${escapeHtml(toDate)})</h4>
            <p class="text-[11px] text-slate-500">Har din ka alag record: Student kis tarikh ko Hazir, Ghair Hazir ya Chutti par tha</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" data-att-filter="ALL" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${parentAttListFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">All Days (${att.details.length})</button>
            <button type="button" data-att-filter="MARKED" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${parentAttListFilter === 'MARKED' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}">Marked Only (${att.marked})</button>
            <button type="button" data-att-filter="ABSENT_LEAVE" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${parentAttListFilter === 'ABSENT_LEAVE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}">Absent / Leave (${att.a + att.l})</button>
          </div>
        </div>
        <div class="overflow-x-auto max-h-[340px] overflow-y-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase sticky top-0">
                <th class="py-2.5 px-4">#</th>
                <th class="py-2.5 px-4">Date</th>
                <th class="py-2.5 px-4">Day</th>
                <th class="py-2.5 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-xs">
              ${visibleAttRows.length === 0
                ? '<tr><td colspan="4" class="py-6 text-center text-slate-400">Is filter mein koi attendance entry nahi mili.</td></tr>'
                : visibleAttRows.map((d, idx) => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-2 px-4 text-slate-400 font-semibold">${idx + 1}</td>
                    <td class="py-2 px-4 font-bold text-slate-800">${escapeHtml(d.date)}</td>
                    <td class="py-2 px-4 text-slate-600 font-medium">${escapeHtml(d.weekday)}</td>
                    <td class="py-2 px-4 text-right">${formatAttStatusBadgeHtml(d.status)}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sabaq & Multiple Screenshots -->
      <div>
        <h4 class="text-xs font-bold text-slate-700 uppercase mb-2">📖 Lessons &amp; Sabaq Logs (${fromDate} – ${toDate})</h4>
        ${rangeSabaq.length === 0 ? '<p class="text-xs text-slate-400">No lessons recorded in this date range.</p>' : `
          <div class="space-y-2">
            ${rangeSabaq.map(l => {
              const imgs = getSabaqImages(l);
              return `
                <div class="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                  <div class="flex flex-wrap justify-between gap-2 text-xs">
                    <span><strong>${escapeHtml(l.date)} [${escapeHtml(l.category || 'Sabaq')}]:</strong> ${escapeHtml(l.sabaq)} (${escapeHtml(l.revision || '—')})</span>
                    <span class="font-bold text-emerald-700">${escapeHtml(l.rating)}</span>
                  </div>
                  ${imgs.length > 0 ? `
                    <div class="flex flex-wrap gap-1.5">
                      ${imgs.map((src, i) => `<button type="button" data-parent-sabaq-id="${escapeHtml(l.id)}" data-img-idx="${i}" class="p-0.5 rounded border border-slate-200 hover:border-indigo-500"><img src="${src}" class="w-12 h-12 object-cover rounded" /></button>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Filter buttons for Date-Wise Attendance Table
  box.querySelectorAll('button[data-att-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      parentAttListFilter = btn.getAttribute('data-att-filter') || 'ALL';
      renderStudentDateRangeReport();
    });
  });

  // Click handler for parent sabaq thumbnails
  box.querySelectorAll('button[data-parent-sabaq-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const log = state.sabaqLogs.find(x => x.id === btn.getAttribute('data-parent-sabaq-id'));
      if (!log) return;
      const imgs = getSabaqImages(log);
      openImageGalleryModal(imgs, `${stu.name} — ${log.category || 'Sabaq'} (${log.date})`, log.sabaq, false);
      activeGalleryIndex = Number(btn.getAttribute('data-img-idx')) || 0;
      renderActiveGallerySlide();
    });
  });

  document.getElementById('btnSubmitParentProof').addEventListener('click', async () => {
    const fileInput = document.getElementById('parentProofFileInput');
    const noteInput = document.getElementById('parentProofNoteInput');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return showToast('Pehle screenshot image select karein!');
    const compressed = await compressImageFile(file, 800, 0.78);
    state.fees[monthKey][stu.id] = {
      status: 'Under Review',
      date: '',
      proofImage: compressed,
      note: (noteInput.value || '').trim(),
      submittedAt: getTodayDateStr()
    };
    await saveState();
    renderAll();
    renderStudentDateRangeReport();
    showToast('Screenshot IndexedDB mein save ho gaya!');
  });
}

document.getElementById('btnParentSearchRoll').addEventListener('click', renderStudentDateRangeReport);
['parentPortalStudentSelect', 'parentFromDate', 'parentToDate'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', renderStudentDateRangeReport);
});

document.getElementById('btnDownloadStudentPdfReport').addEventListener('click', () => {
  const stuId = document.getElementById('parentPortalStudentSelect').value;
  const fromDate = document.getElementById('parentFromDate').value || getMonthStartDateStr();
  const toDate = document.getElementById('parentToDate').value || getMonthEndDateStr();
  const stu = state.students.find(s => s.id === stuId);
  if (!stu) return;
  const monthKey = fromDate.slice(0, 7) || getCurrentMonthStr();
  const feeRec = (state.fees[monthKey] && state.fees[monthKey][stu.id]) || { status: 'Pending', date: '—' };
  const rangeSabaq = (state.sabaqLogs || []).filter(l => l.studentId === stu.id && l.date >= fromDate && l.date <= toDate);
  const att = getStudentDailyAttendanceInRange(stu.id, fromDate, toDate);

  // Two-column compact Date-Wise Attendance Table for clean printable PDF
  const half = Math.ceil(att.details.length / 2);
  let attRowsPdf = '';
  for (let i = 0; i < half; i++) {
    const left = att.details[i];
    const right = att.details[i + half];
    const fmt = (st) => st === 'Present'
      ? '<span class="att-pill-p">Present (Hazir)</span>'
      : st === 'Absent'
        ? '<span class="att-pill-a">Absent (Ghair Hazir)</span>'
        : st === 'Leave'
          ? '<span class="att-pill-l">Leave (Chutti)</span>'
          : '<span style="color:#94a3b8;">— Not Marked</span>';
    attRowsPdf += `
      <tr>
        <td><strong>${escapeHtml(left.date)}</strong></td>
        <td>${escapeHtml(left.weekday)}</td>
        <td>${fmt(left.status)}</td>
        ${right ? `<td><strong>${escapeHtml(right.date)}</strong></td><td>${escapeHtml(right.weekday)}</td><td>${fmt(right.status)}</td>` : '<td></td><td></td><td></td>'}
      </tr>
    `;
  }

  const html = `
    <div class="summary-grid">
      <div class="summary-card"><strong>Student:</strong> ${escapeHtml(stu.name)} (${escapeHtml(stu.rollNo)})<br><strong>Father:</strong> ${escapeHtml(stu.fatherName || '—')}<br><strong>Course:</strong> ${escapeHtml(stu.subjects)}</div>
      <div class="summary-card"><strong>Attendance:</strong> ${att.pct}% (${att.p} Present / ${att.a} Absent / ${att.l} Leave)<br><strong>Batch:</strong> ${escapeHtml(stu.className)}<br><strong>Class Time:</strong> ${escapeHtml(stu.classTime || '—')}</div>
      <div class="summary-card"><strong>Monthly Fee (${monthKey}):</strong> ${escapeHtml(stu.currency || 'PKR')} ${Number(stu.monthlyFee).toLocaleString()}<br><strong>Status:</strong> ${escapeHtml(feeRec.status)}<br><strong>Paid Date:</strong> ${escapeHtml(feeRec.date || '—')}</div>
    </div>
    <h3 style="font-size:13px;margin:14px 0 6px 0;color:#1e1b4b;">Date-Wise Attendance Detail (${escapeHtml(fromDate)} to ${escapeHtml(toDate)})</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Day</th><th>Status</th>
          <th>Date</th><th>Day</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${attRowsPdf || '<tr><td colspan="6">No dates in selected range.</td></tr>'}</tbody>
    </table>
    <h3 style="font-size:13px;margin:14px 0 6px 0;color:#1e1b4b;">Lessons, Sabaq &amp; Progress Logs</h3>
    <table>
      <thead><tr><th>Date</th><th>Category</th><th>Lesson / Sabaq Details</th><th>Sabqi / Revision</th><th>Performance</th><th>Photos</th></tr></thead>
      <tbody>
        ${rangeSabaq.length === 0 ? '<tr><td colspan="6">No lessons logged in this date range.</td></tr>' : rangeSabaq.map(l => {
          const imgs = getSabaqImages(l);
          return `
            <tr>
              <td>${escapeHtml(l.date)}</td>
              <td>${escapeHtml(l.category || 'Quran Sabaq')}</td>
              <td>${escapeHtml(l.sabaq)}</td>
              <td>${escapeHtml(l.revision || '—')}</td>
              <td>${escapeHtml(l.rating)}</td>
              <td>${imgs.length > 0 ? imgs.map(src => `<img src="${src}" style="width:42px;height:42px;object-fit:cover;border-radius:4px;margin:1px;border:1px solid #cbd5e1;" />`).join('') : '—'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  openBrandedPdfPrintWindow(`Student Detailed Date-Wise Attendance & Progress Report`, `Period: ${fromDate} to ${toDate}`, html, false);
});
