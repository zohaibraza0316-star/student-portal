mountView(`
  <!-- TAB 2: SABAQ & TIMETABLE -->
  <section id="viewSabaq" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Class Timetable &amp; Live Links</h2>
      <div id="timetableCardsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1"></div>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Record Daily Sabaq, Kalma, Dua &amp; Screenshot</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-600">Date</label>
          <input id="sabaqDateInput" type="date" value="2026-11-10" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Select Student *</label>
          <select id="sabaqStudentSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"></select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Category</label>
          <select id="sabaqCategorySelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="Quran Sabaq / Lesson">Quran Sabaq / Lesson</option>
            <option value="Kalma Memorization">Kalma Memorization</option>
            <option value="Islamic Dua">Islamic Dua</option>
            <option value="Islamic Information">Islamic Information</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Aaj ka Sabaq / Details *</label>
          <input id="sabaqNewInput" type="text" placeholder="e.g. Surah Yaseen 1-10 / 3rd Kalma" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Sabqi / Manzil / Remarks</label>
          <input id="sabaqRevisionInput" type="text" placeholder="e.g. Para 1" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Upload Screenshot (IndexedDB)</label>
          <input id="sabaqProofFile" type="file" accept="image/*" class="mt-1 w-full text-xs text-slate-500 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Performance</label>
          <select id="sabaqRatingSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="MashaAllah Excellent">MashaAllah Excellent</option>
            <option value="Good Tajweed & Fluency">Good Tajweed &amp; Fluency</option>
            <option value="Needs Practice">Needs Practice</option>
          </select>
        </div>
        <div class="flex items-end">
          <button id="btnAddSabaqRecord" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            + Save Sabaq
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <h3 class="text-sm font-bold text-slate-800 uppercase">Sabaq Logs</h3>
        <button id="btnSendWeeklyReport" type="button" class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
          📲 Send Weekly Report on WhatsApp
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Date &amp; Category</th>
              <th class="py-3 px-4">Student</th>
              <th class="py-3 px-4">Lesson Details</th>
              <th class="py-3 px-4">Sabqi / Remarks</th>
              <th class="py-3 px-4 text-center">Screenshot</th>
              <th class="py-3 px-4 text-center">Performance</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody id="sabaqTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
      <div id="sabaqEmptyState" class="hidden py-8 text-center text-slate-500 text-sm">No sabaq logs recorded yet.</div>
    </div>
  </section>
`);
