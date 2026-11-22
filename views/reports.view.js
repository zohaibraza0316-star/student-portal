mountView(`
  <!-- TAB 10: 10 DETAILED PDF REPORTS & OFFLINE CHARTS ANALYTICS CENTER -->
  <section id="viewReports" class="hidden space-y-5">
    <!-- Offline Canvas Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-800 uppercase mb-3">📈 Monthly Earnings vs Expenses &amp; Salaries (Offline Canvas)</h3>
        <div class="h-64 relative">
          <canvas id="chartFinancials" class="w-full h-full"></canvas>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-800 uppercase mb-3">🌍 Students by Course &amp; Currency (Offline Canvas)</h3>
        <div class="h-64 relative">
          <canvas id="chartCourses" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- 10 Detailed PDF Reports Generator -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 class="text-base font-extrabold text-slate-900">🖨️ 10 Detailed Official Academy PDF Reports (Day-by-Day &amp; Branded)</h3>
          <p class="text-xs text-slate-500">Har PDF report mein aapka IndexedDB Logo, Academy Header, detailed summaries, aur Attendance Report mein har student ki 1–31 din ki poori detail aayegi.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2">
          <label class="block text-xs font-semibold text-slate-600">Select Report Type (1 to 10)</label>
          <select id="repTypeSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white font-semibold">
            <option value="1">1. Executive Financial Summary (Detailed P&amp;L + Currency)</option>
            <option value="2">2. Monthly Fee Collection (Paid Students Detailed)</option>
            <option value="3">3. Fee Defaulters &amp; Pending Dues Report</option>
            <option value="4">4. Date-Range Expense Ledger (Category Totals)</option>
            <option value="5">5. Teachers Salary &amp; Payout Report</option>
            <option value="6">6. Detailed Day-by-Day Attendance Register (1–31 Days)</option>
            <option value="7">7. Daily Sabaq, Kalma &amp; Dua Detailed Progress</option>
            <option value="8">8. Country &amp; Currency Revenue Breakdown</option>
            <option value="9">9. Course &amp; Batch Enrollment Analytics</option>
            <option value="10">10. Historical Monthly Snapshots &amp; Growth</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Billing / Attendance Month</label>
          <input id="repMonthInput" type="month" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">From Date (Range Reports)</label>
          <input id="repFromDate" type="date" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">To Date (Range Reports)</label>
          <input id="repToDate" type="date" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600">Filter Student (Optional)</label>
          <select id="repStudentFilter" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="ALL">All Students</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Attendance Detail Mode (Report #6)</label>
          <select id="repAttModeSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="monthly_grid">Monthly Calendar Register (Day 1 to 31)</option>
            <option value="date_range">Custom Date Range Day-by-Day Grid</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button id="btnPreviewReport" type="button" class="flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            👁️ Preview
          </button>
          <button id="btnPrintPdfReport" type="button" class="flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition">
            📥 Print PDF
          </button>
        </div>
      </div>

      <div id="reportPreviewContainer" class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-x-auto"></div>
    </div>
  </section>
`);
