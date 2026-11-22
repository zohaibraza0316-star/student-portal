mountView(`
  <!-- TAB 9: EVALUATIONS -->
  <section id="viewMarks" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Record Quran Test / Recitation Evaluation</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label for="markStudentSelect" class="block text-xs font-medium text-slate-600">Select Student</label>
          <select id="markStudentSelect" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"></select>
        </div>
        <div>
          <label for="markTestTitle" class="block text-xs font-medium text-slate-600">Test Title</label>
          <input id="markTestTitle" type="text" placeholder="Monthly Tajweed Test" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label for="markSubject" class="block text-xs font-medium text-slate-600">Category</label>
          <input id="markSubject" type="text" placeholder="Surah Mulk" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label for="markObtained" class="block text-xs font-medium text-slate-600">Obtained</label>
            <input id="markObtained" type="number" min="0" placeholder="45" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label for="markTotal" class="block text-xs font-medium text-slate-600">Total</label>
            <input id="markTotal" type="number" min="1" value="50" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>
        <div class="flex items-end">
          <button id="btnAddMarkRecord" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            + Save Evaluation
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Student</th>
              <th class="py-3 px-4">Test Title</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4 text-right">Marks</th>
              <th class="py-3 px-4 text-center">Grade</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody id="marksTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
      <div id="marksEmptyState" class="hidden py-10 text-center text-slate-500 text-sm">No test results added yet.</div>
    </div>
  </section>
`);
