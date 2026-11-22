mountView(`
  <!-- TAB 6: DAILY ATTENDANCE -->
  <section id="viewAttendance" class="hidden space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label for="attendanceDateInput" class="block text-xs font-semibold text-slate-500 uppercase">Attendance Date</label>
          <input id="attendanceDateInput" type="date" value="2026-11-10" class="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div id="attendanceDailySummary" class="text-xs sm:text-sm text-slate-600 font-medium pt-4">
          Present: 0 | Absent: 0 | Leave: 0
        </div>
      </div>
      <button id="btnMarkAllPresent" type="button" class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
        Mark All Present
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Roll No</th>
              <th class="py-3 px-4">Student Name</th>
              <th class="py-3 px-4">Batch</th>
              <th class="py-3 px-4 text-center">Overall Attendance</th>
              <th class="py-3 px-4 text-right">Mark Status</th>
            </tr>
          </thead>
          <tbody id="attendanceTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
    </div>
  </section>
`);
