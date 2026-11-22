mountView(`
  <!-- TAB 5: EXPENSES & MONTHLY SNAPSHOTS -->
  <section id="viewExpenses" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-sm font-bold text-slate-800 uppercase">Record Academy Expense (Internet, Marketing, Software, Misc)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-600">Date *</label>
          <input id="expDateInput" type="date" value="2026-11-10" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Expense Title *</label>
          <input id="expTitleInput" type="text" placeholder="e.g. PTCL Fiber Internet Bill" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Category</label>
          <select id="expCategoryInput" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="Internet & Utilities">Internet &amp; Utilities</option>
            <option value="Marketing / Ads">Marketing / Ads</option>
            <option value="Software / Hosting">Software / Hosting</option>
            <option value="Equipment / Hardware">Equipment / Hardware</option>
            <option value="Other Expense">Other Expense</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600">Amount (PKR) *</label>
          <input id="expAmountInput" type="number" min="0" placeholder="4500" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div class="flex items-end">
          <button id="btnAddExpense" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition">
            + Add Expense
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-800 uppercase">Expense Ledger</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Title &amp; Category</th>
                <th class="py-3 px-4 text-right">Amount</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="expensesTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-800 uppercase">Saved Monthly Financial Snapshots</h3>
          <button id="btnTakeSnapshotNow" type="button" class="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
            + Save Current Month Snapshot
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th class="py-3 px-4">Month</th>
                <th class="py-3 px-4 text-right">Collected</th>
                <th class="py-3 px-4 text-right">Sal + Exp</th>
                <th class="py-3 px-4 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody id="snapshotsTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
`);
