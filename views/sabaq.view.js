mountView(`
  <!-- TAB 2: SABAQ & TIMETABLE (BULLETPROOF MULTIPLE SCREENSHOTS & FILTERS) -->
  <section id="viewSabaq" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-bold text-slate-800 uppercase">Class Timetable &amp; Live Links</h2>
        <span class="text-xs text-slate-500">Click WA button for 1-tap Class Reminder</span>
      </div>
      <div id="timetableCardsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1"></div>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-bold text-slate-800 uppercase">Record Daily Sabaq, Kalma, Dua &amp; Multiple Screenshots</h2>
        <span id="sabaqSelectedCountBadge" class="hidden px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">0 photos selected</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-600">Date</label>
          <input id="sabaqDateInput" type="date" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
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
          <label class="block text-xs font-medium text-slate-600">Performance</label>
          <select id="sabaqRatingSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="MashaAllah Excellent">MashaAllah Excellent</option>
            <option value="Good Tajweed & Fluency">Good Tajweed &amp; Fluency</option>
            <option value="Needs Practice">Needs Practice</option>
          </select>
        </div>
        <div class="sm:col-span-2 flex items-end gap-2">
          <div id="sabaqDropzone" class="flex-1 p-2 rounded-xl border-2 border-slate-300 bg-slate-50 flex flex-wrap items-center justify-between gap-2 transition">
            <div class="text-xs text-slate-600 pl-1">
              <strong class="text-indigo-700">📷 Multiple Screenshots:</strong> Ek saath ya baari-baari photos add karein
            </div>
            <label for="sabaqProofFile" class="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
              + Select Photos (Multiple)
              <input id="sabaqProofFile" type="file" accept="image/*" multiple class="hidden" />
            </label>
          </div>
          <button id="btnAddSabaqRecord" type="button" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
            + Save Sabaq
          </button>
        </div>
      </div>

      <!-- Hidden input for adding extra screenshots to an already saved Sabaq log -->
      <input id="sabaqAddMoreExistingFile" type="file" accept="image/*" multiple class="hidden" />

      <!-- Live Multiple Screenshot Preview Strip -->
      <div id="sabaqPendingPreviewBox" class="hidden p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-700">📷 Selected Screenshots Preview (Ready to Save)</span>
          <div class="flex items-center gap-2">
            <button id="btnAddAnotherSabaqPhoto" type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">
              + Add More Photos
            </button>
            <button id="btnClearSabaqPendingImgs" type="button" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100">
              Clear All
            </button>
          </div>
        </div>
        <div id="sabaqPendingPreviewList" class="flex flex-wrap gap-2"></div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-bold text-slate-800 uppercase">Sabaq Logs</h3>
          <select id="filterSabaqStudent" class="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
            <option value="ALL">All Students</option>
          </select>
          <select id="filterSabaqCategory" class="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
            <option value="ALL">All Categories</option>
            <option value="Quran Sabaq / Lesson">Quran Sabaq / Lesson</option>
            <option value="Kalma Memorization">Kalma Memorization</option>
            <option value="Islamic Dua">Islamic Dua</option>
            <option value="Islamic Information">Islamic Information</option>
          </select>
          <input id="searchSabaqInput" type="text" placeholder="Search lesson..." class="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
        </div>
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
              <th class="py-3 px-4 text-center">Screenshots</th>
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
