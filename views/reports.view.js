mountView(`
  <!-- TAB 10: 10 PDF REPORTS & CHARTS ANALYTICS CENTER -->
  <section id="viewReports" class="hidden space-y-5">
    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-800 uppercase mb-3">📈 Monthly Earnings vs Expenses &amp; Salaries</h3>
        <div class="h-64">
          <canvas id="chartFinancials"></canvas>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-800 uppercase mb-3">🌍 Students by Course &amp; Currency</h3>
        <div class="h-64">
          <canvas id="chartCourses"></canvas>
        </div>
      </div>
    </div>

    <!-- 10 PDF Reports Generator with Date Range -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 class="text-base font-extrabold text-slate-900">🖨️ 10 Official Academy PDF Reports (With Custom Logo &amp; Date Range)</h3>
          <p class="text-xs text-slate-500">Har PDF report ke upar aapka IndexedDB Logo, Academy Name, Phone aur Email khud-ba-khud lag kar aayega.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600">From Date</label>
          <input id="repFromDate" type="date" value="2026-11-01" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">To Date</label>
          <input id="repToDate" type="date" value="2026-11-30" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Billing Month</label>
          <input id="repMonthInput" type="month" value="2026-11" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Select Report Type (1 to 10)</label>
          <select id="repTypeSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white font-semibold">
            <option value="1">1. Executive Financial Summary (Income vs Expense)</option>
            <option value="2">2. Monthly Fee Collection (Paid Students)</option>
            <option value="3">3. Fee Defaulters &amp; Pending Dues Report</option>
            <option value="4">4. Date-Range Expense Ledger Report</option>
            <option value="5">5. Teachers Salary &amp; Payout Report</option>
            <option value="6">6. Student Attendance Summary (Date Range)</option>
            <option value="7">7. Daily Sabaq, Kalma &amp; Dua Progress Report</option>
            <option value="8">8. Country &amp; Currency Revenue Breakdown</option>
            <option value="9">9. Course &amp; Batch Enrollment Analytics</option>
            <option value="10">10. Historical Monthly Snapshots Comparison</option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button id="btnPreviewReport" type="button" class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
          👁️ Preview Report Below
        </button>
        <button id="btnPrintPdfReport" type="button" class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition">
          📥 Download / Print Official PDF
        </button>
      </div>

      <div id="reportPreviewContainer" class="p-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-x-auto"></div>
    </div>
  </section>
`);
