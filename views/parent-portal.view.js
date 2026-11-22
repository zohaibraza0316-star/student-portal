mountView(`
  <!-- TAB 8: STUDENT REPORT & PAYMENT PROOF MANAGER (WITH DATE RANGE & PDF) -->
  <section id="viewParentPortal" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Offline IndexedDB Student Report &amp; Proof Manager</span>
          <h2 class="text-lg font-bold text-slate-900 mt-1">Student Date-Range Progress Report &amp; Payment Proof</h2>
          <p class="text-xs text-slate-500">Select any student and date range to attach fee screenshots or generate a branded PDF Report Card for parents.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-slate-600">Select Student</label>
          <select id="parentPortalStudentSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"></select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">From Date</label>
          <input id="parentFromDate" type="date" value="2026-11-01" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">To Date</label>
          <input id="parentToDate" type="date" value="2026-11-30" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button id="btnParentSearchRoll" type="button" class="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
          🔍 Load Student Report &amp; Fee Box
        </button>
        <button id="btnDownloadStudentPdfReport" type="button" class="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
          📄 Generate Branded PDF Report for Parent
        </button>
      </div>

      <div id="parentReportResult" class="pt-3"></div>
    </div>
  </section>
`);
