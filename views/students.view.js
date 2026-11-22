mountView(`
  <!-- TAB 1: STUDENTS DIRECTORY (WITH DETAILED FILTERS & PAGINATION) -->
  <section id="viewStudents" class="space-y-4">
    <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-sm font-bold text-slate-800 uppercase">Detailed Student Filters</h3>
        <button id="btnResetStudentFilters" type="button" class="text-xs font-semibold text-indigo-600 hover:underline">Reset Filters</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        <input id="searchStudentsInput" type="text" placeholder="Search Name, Roll, Phone, Country..." class="lg:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm" />
        <select id="filterClassSelect" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
          <option value="ALL">All Batches</option>
        </select>
        <select id="filterCourseSelect" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
          <option value="ALL">All Courses</option>
        </select>
        <select id="filterCurrencySelect" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
          <option value="ALL">All Currencies</option>
          <option value="PKR">PKR</option>
          <option value="AED">AED</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
        <select id="filterStatusSelect" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
          <option value="ALL">All Status</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <th class="py-3.5 px-4">Roll No</th>
              <th class="py-3.5 px-4">Student &amp; Country</th>
              <th class="py-3.5 px-4">Batch &amp; Course</th>
              <th class="py-3.5 px-4">Phone / WhatsApp</th>
              <th class="py-3.5 px-4 text-right">Monthly Fee</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="studentsTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
      <div id="studentsEmptyState" class="hidden py-12 text-center">
        <p class="text-slate-600 font-medium">No students match your current filter.</p>
      </div>

      <!-- Pagination Footer -->
      <div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-slate-600 font-medium">Rows per page:</span>
          <select id="studentsPageSizeSelect" class="px-2 py-1 rounded border border-slate-300 bg-white font-semibold">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span id="studentsPaginationInfo" class="text-slate-500 ml-2">Showing 0 of 0</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btnStudentsPrevPage" type="button" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40">Prev</button>
          <span id="studentsPageIndicator" class="px-2.5 font-bold text-slate-800">Page 1 / 1</span>
          <button id="btnStudentsNextPage" type="button" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  </section>
`);
