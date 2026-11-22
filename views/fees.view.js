mountView(`
  <!-- TAB 4: MONTHLY FEES -->
  <section id="viewFees" class="hidden space-y-4">
    <div id="adminFeeProofQueueBox" class="hidden bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-xs space-y-3">
      <h3 class="text-sm font-bold text-amber-900 uppercase">🔔 Uploaded Fee Screenshots Waiting Approval</h3>
      <div id="feeProofQueueList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label for="feeMonthInput" class="block text-xs font-semibold text-slate-500 uppercase">Billing Month</label>
          <input id="feeMonthInput" type="month" class="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label for="filterFeeStatusSelect" class="block text-xs font-semibold text-slate-500 uppercase">Payment Filter</label>
          <select id="filterFeeStatusSelect" class="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white">
            <option value="ALL">All Students</option>
            <option value="Paid">Approved / Paid</option>
            <option value="Under Review">Screenshot Uploaded</option>
            <option value="Pending">Pending (Unpaid)</option>
          </select>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button id="btnSaveMonthlySnapshot" type="button" class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
          📸 Save Monthly Snapshot
        </button>
        <button id="btnMarkAllFeesPaid" type="button" class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
          Mark All Active Paid
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Roll No</th>
              <th class="py-3 px-4">Student Name</th>
              <th class="py-3 px-4">Batch &amp; Course</th>
              <th class="py-3 px-4 text-right">Fee</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4">Screenshot / Date</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="feesTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
    </div>
  </section>
`);
