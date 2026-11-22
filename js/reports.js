// ==========================================
// TAB 10: BRANDED PDF ENGINE, CHARTS & 10 REPORTS
// ==========================================
function openBrandedPdfPrintWindow(reportTitle, dateRangeText, bodyHtml) {
  const cfg = state.settings || {};
  const logoHtml = cfg.logoDataUrl
    ? `<img src="${cfg.logoDataUrl}" style="width:65px;height:65px;object-fit:contain;border-radius:10px;" />`
    : `<div style="width:55px;height:55px;border-radius:12px;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">RT</div>`;

  const win = window.open('', '_blank');
  if (!win) return showToast('Popup blocked! Browser mein popups allow karein.');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(reportTitle)} — ${escapeHtml(cfg.academyName)}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 28px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 14px; margin-bottom: 20px; }
        .brand-left { display: flex; align-items: center; gap: 14px; }
        .brand-title { font-size: 20px; font-weight: 800; color: #1e1b4b; margin: 0; }
        .brand-sub { font-size: 12px; color: #475569; margin: 3px 0 0 0; }
        .rep-box { text-align: right; }
        .rep-title { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0; text-transform: uppercase; }
        .rep-date { font-size: 11px; color: #64748b; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 11px; }
        .summary-grid { display: flex; gap: 12px; margin-bottom: 16px; }
        .summary-card { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom:15px;text-align:right;">
        <button onclick="window.print()" style="background:#4f46e5;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:700;cursor:pointer;">🖨️ Save as PDF / Print</button>
      </div>
      <div class="header">
        <div class="brand-left">
          ${logoHtml}
          <div>
            <h1 class="brand-title">${escapeHtml(cfg.academyName || 'Raza Tutors — Online Quran Academy')}</h1>
            <p class="brand-sub">📞 Phone / WhatsApp: ${escapeHtml(cfg.phone || '+92 370 4161579')} | ✉️ Email: ${escapeHtml(cfg.email || 'muhammad.zohaib.748@nayapay')}</p>
          </div>
        </div>
        <div class="rep-box">
          <p class="rep-title">${escapeHtml(reportTitle)}</p>
          <p class="rep-date">${escapeHtml(dateRangeText)}</p>
        </div>
      </div>
      ${bodyHtml}
    </body>
    </html>
  `);
  win.document.close();
}

function renderChartsAndReports() {
  const ctxFin = document.getElementById('chartFinancials');
  const ctxCourse = document.getElementById('chartCourses');
  if (!ctxFin || !ctxCourse || typeof Chart === 'undefined') return;

  const months = Array.from(new Set([
    ...Object.keys(state.fees || {}),
    ...Object.keys(state.snapshots || {}),
    '2026-09', '2026-10', '2026-11'
  ])).sort().slice(-6);

  const incomeData = months.map(m => {
    if (state.snapshots && state.snapshots[m]) return state.snapshots[m].collected;
    return getMonthMetrics(m).collected;
  });
  const outflowData = months.map(m => {
    if (state.snapshots && state.snapshots[m]) return (state.snapshots[m].salaries || 0) + (state.snapshots[m].expenses || 0);
    const met = getMonthMetrics(m);
    return met.monthSalaries + met.monthExpenses;
  });

  if (chartFinInstance) chartFinInstance.destroy();
  chartFinInstance = new Chart(ctxFin, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Collected Fees', data: incomeData, backgroundColor: '#10b981' },
        { label: 'Expenses + Salaries', data: outflowData, backgroundColor: '#f43f5e' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const courseCounts = {};
  state.students.forEach(s => {
    const k = `${s.subjects || 'Quran'} (${s.currency || 'PKR'})`;
    courseCounts[k] = (courseCounts[k] || 0) + 1;
  });

  if (chartCourseInstance) chartCourseInstance.destroy();
  chartCourseInstance = new Chart(ctxCourse, {
    type: 'doughnut',
    data: {
      labels: Object.keys(courseCounts),
      datasets: [{ data: Object.values(courseCounts), backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  generateSelectedReportHtml(false);
}

function generateSelectedReportHtml(openPdf = false) {
  const type = document.getElementById('repTypeSelect').value;
  const fromDate = document.getElementById('repFromDate').value || '2026-11-01';
  const toDate = document.getElementById('repToDate').value || '2026-11-30';
  const monthKey = document.getElementById('repMonthInput').value || '2026-11';
  const m = getMonthMetrics(monthKey);
  const monthFees = state.fees[monthKey] || {};

  let title = '';
  let html = '';

  if (type === '1') {
    title = `1. Executive Financial Summary (${monthKey})`;
    html = `
      <table class="w-full text-left border-collapse">
        <thead><tr><th>Metric</th><th>Month / Scope</th><th>Amount / Value</th></tr></thead>
        <tbody>
          <tr><td>Total Active Students</td><td>${monthKey}</td><td>${m.activeCount} Students</td></tr>
          <tr><td>Current Month Fees Collected</td><td>${monthKey}</td><td>Rs ${m.collected.toLocaleString()}</td></tr>
          <tr><td>Pending Fees (Unpaid)</td><td>${monthKey}</td><td>Rs ${m.pending.toLocaleString()} (${m.unpaidCount} students)</td></tr>
          <tr><td>Teachers Salaries Paid</td><td>${monthKey}</td><td>Rs ${m.monthSalaries.toLocaleString()}</td></tr>
          <tr><td>Academy Operational Expenses</td><td>${monthKey}</td><td>Rs ${m.monthExpenses.toLocaleString()}</td></tr>
          <tr><td><strong>Current Month Net Profit</strong></td><td><strong>${monthKey}</strong></td><td><strong>Rs ${m.netProfit.toLocaleString()}</strong></td></tr>
          <tr><td><strong>Cumulative Net Profit (All Snapshots + Current)</strong></td><td><strong>All Time</strong></td><td><strong>Rs ${m.snapNetTotal.toLocaleString()}</strong></td></tr>
        </tbody>
      </table>`;
  } else if (type === '2') {
    title = `2. Paid Students Fee Collection Report (${monthKey})`;
    const paidList = state.students.filter(s => monthFees[s.id] && monthFees[s.id].status === 'Paid');
    html = `<table><thead><tr><th>Roll No</th><th>Student</th><th>Course</th><th>Paid Date</th><th>Amount</th></tr></thead><tbody>` +
      (paidList.length === 0 ? '<tr><td colspan="5">No paid records found for this month.</td></tr>' : paidList.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.subjects)}</td><td>${escapeHtml(monthFees[s.id].date)}</td><td>${escapeHtml(s.currency || 'PKR')} ${Number(s.monthlyFee).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '3') {
    title = `3. Fee Defaulters & Pending Dues Report (${monthKey})`;
    const unpaidList = state.students.filter(s => s.status === 'Active' && (!monthFees[s.id] || monthFees[s.id].status !== 'Paid'));
    html = `<table><thead><tr><th>Roll No</th><th>Student</th><th>Phone</th><th>Country</th><th>Pending Fee</th></tr></thead><tbody>` +
      (unpaidList.length === 0 ? '<tr><td colspan="5">All active students have paid!</td></tr>' : unpaidList.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.notes || 'Pakistan')}</td><td>${escapeHtml(s.currency || 'PKR')} ${Number(s.monthlyFee).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '4') {
    title = `4. Academy Expense Ledger (${fromDate} to ${toDate})`;
    const exps = (state.expenses || []).filter(x => x.date >= fromDate && x.date <= toDate);
    html = `<table><thead><tr><th>Date</th><th>Expense Title</th><th>Category</th><th>Amount (PKR)</th></tr></thead><tbody>` +
      (exps.length === 0 ? '<tr><td colspan="4">No expenses in this date range.</td></tr>' : exps.map(x => `<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.category)}</td><td>Rs ${Number(x.amount).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '5') {
    title = `5. Teachers Salary & Payout Report (${monthKey})`;
    const sals = (state.salaries || []).filter(x => x.month === monthKey);
    html = `<table><thead><tr><th>Teacher Name</th><th>Phone</th><th>Classes / Hours</th><th>Status</th><th>Salary</th></tr></thead><tbody>` +
      (sals.length === 0 ? '<tr><td colspan="5">No teacher salaries recorded for this month.</td></tr>' : sals.map(x => `<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.classes)}</td><td>${escapeHtml(x.status)}</td><td>Rs ${Number(x.amount).toLocaleString()}</td></tr>`).join('')) +
      `</tbody></table>`;
  } else if (type === '6') {
    title = `6. Student Attendance Summary (${fromDate} to ${toDate})`;
    html = `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Batch</th><th>Attendance Rate in Range</th></tr></thead><tbody>` +
      state.students.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.className)}</td><td>${getStudentAttendanceStats(s.id, fromDate, toDate)}</td></tr>`).join('') +
      `</tbody></table>`;
  } else if (type === '7') {
    title = `7. Daily Sabaq, Kalma & Dua Progress (${fromDate} to ${toDate})`;
    const logs = (state.sabaqLogs || []).filter(l => l.date >= fromDate && l.date <= toDate);
    html = `<table><thead><tr><th>Date</th><th>Student</th><th>Category</th><th>Lesson</th><th>Performance</th></tr></thead><tbody>` +
      (logs.length === 0 ? '<tr><td colspan="5">No sabaq logs in this date range.</td></tr>' : logs.map(l => {
        const stu = state.students.find(s => s.id === l.studentId);
        return `<tr><td>${escapeHtml(l.date)}</td><td>${escapeHtml(stu ? stu.name : 'Student')}</td><td>${escapeHtml(l.category || 'Sabaq')}</td><td>${escapeHtml(l.sabaq)}</td><td>${escapeHtml(l.rating)}</td></tr>`;
      }).join('')) + `</tbody></table>`;
  } else if (type === '8') {
    title = `8. Country & Currency Revenue Breakdown`;
    const byCurr = {};
    state.students.filter(s => s.status === 'Active').forEach(s => {
      const c = s.currency || 'PKR';
      if (!byCurr[c]) byCurr[c] = { count: 0, total: 0 };
      byCurr[c].count++;
      byCurr[c].total += Number(s.monthlyFee) || 0;
    });
    html = `<table><thead><tr><th>Currency</th><th>Active Students</th><th>Total Monthly Billing</th></tr></thead><tbody>` +
      Object.keys(byCurr).map(c => `<tr><td>${escapeHtml(c)}</td><td>${byCurr[c].count}</td><td>${escapeHtml(c)} ${byCurr[c].total.toLocaleString()}</td></tr>`).join('') +
      `</tbody></table>`;
  } else if (type === '9') {
    title = `9. Course & Batch Enrollment Report`;
    html = `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Batch</th><th>Course</th><th>Class Time</th></tr></thead><tbody>` +
      state.students.map(s => `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.className)}</td><td>${escapeHtml(s.subjects)}</td><td>${escapeHtml(s.classTime || '—')}</td></tr>`).join('') +
      `</tbody></table>`;
  } else {
    title = `10. Historical Monthly Financial Snapshots`;
    const keys = Object.keys(state.snapshots || {}).sort().reverse();
    html = `<table><thead><tr><th>Month</th><th>Active Students</th><th>Collected</th><th>Salaries + Expenses</th><th>Net Profit</th></tr></thead><tbody>` +
      (keys.length === 0 ? '<tr><td colspan="5">No snapshots saved yet. Click Save Monthly Snapshot in Fees or Expenses tab.</td></tr>' : keys.map(k => {
        const sn = state.snapshots[k];
        return `<tr><td>${escapeHtml(k)}</td><td>${sn.activeStudents || 0}</td><td>Rs ${Number(sn.collected).toLocaleString()}</td><td>Rs ${Number((sn.salaries || 0) + (sn.expenses || 0)).toLocaleString()}</td><td>Rs ${Number(sn.netProfit).toLocaleString()}</td></tr>`;
      }).join('')) + `</tbody></table>`;
  }

  document.getElementById('reportPreviewContainer').innerHTML = `<h4 class="font-bold text-slate-900 mb-2">${escapeHtml(title)}</h4>` + html;
  if (openPdf) openBrandedPdfPrintWindow(title, `Date Range: ${fromDate} to ${toDate} | Month: ${monthKey}`, html);
}

document.getElementById('btnPreviewReport').addEventListener('click', () => generateSelectedReportHtml(false));
document.getElementById('btnPrintPdfReport').addEventListener('click', () => generateSelectedReportHtml(true));
