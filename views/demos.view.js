mountView(`
  <!-- TAB 3: DEMO CLASSES -->
  <section id="viewDemos" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Trial / Demo Class Tracker</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-600">Student Name *</label>
          <input id="demoStudentName" type="text" placeholder="e.g. Zainab Ali" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Phone / WhatsApp *</label>
          <input id="demoPhone" type="text" placeholder="+44... / 0300..." class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Course &amp; Country</label>
          <input id="demoCourse" type="text" placeholder="Tajweed (UK)" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Trial Date &amp; Time</label>
          <input id="demoDateTime" type="text" placeholder="Today 7:00 PM PKT" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Status</label>
          <select id="demoStatus" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="Scheduled">Scheduled</option>
            <option value="Trial Taken - Follow Up">Trial Taken - Follow Up</option>
            <option value="Converted (Enrolled)">Converted (Enrolled)</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
        <div class="flex items-end">
          <button id="btnAddDemo" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            + Add Trial
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Student Name</th>
              <th class="py-3 px-4">Phone / WhatsApp</th>
              <th class="py-3 px-4">Course &amp; Country</th>
              <th class="py-3 px-4">Trial Time</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="demosTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
    </div>
  </section>
`);
