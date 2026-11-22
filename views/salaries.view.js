mountView(`
  <!-- TAB 7: TEACHERS SALARY -->
  <section id="viewSalaries" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Teacher's Monthly Salary &amp; Payout Tracker</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-600">Teacher Name *</label>
          <input id="salTeacherName" type="text" placeholder="e.g. Qari Usman" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Phone / WhatsApp</label>
          <input id="salTeacherPhone" type="text" placeholder="0300-1234567" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Month</label>
          <input id="salMonth" type="month" value="2026-11" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Total Classes / Hours</label>
          <input id="salClasses" type="text" placeholder="45 Classes" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Salary Amount (Rs) *</label>
          <input id="salAmount" type="number" min="0" placeholder="15000" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div class="flex items-end">
          <button id="btnAddSalary" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            + Add Record
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Teacher Name</th>
              <th class="py-3 px-4">Month</th>
              <th class="py-3 px-4">Classes / Hours</th>
              <th class="py-3 px-4 text-right">Salary (PKR)</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="salariesTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
    </div>
  </section>
`);
