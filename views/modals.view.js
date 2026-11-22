mountModals(`
  <!-- SCREENSHOT PREVIEW MODAL -->
  <div id="screenshotModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
    <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <h3 id="screenshotModalTitle" class="text-base font-bold text-slate-900">Verification Image</h3>
        <button id="btnCloseScreenshotModal" type="button" class="text-slate-400 hover:text-slate-600 text-xl font-bold px-2">&times;</button>
      </div>
      <div class="max-h-[65vh] overflow-y-auto text-center bg-slate-100 rounded-xl p-2">
        <img id="screenshotModalImg" src="" alt="Proof" class="max-w-full mx-auto rounded-lg" />
      </div>
      <p id="screenshotModalNote" class="text-xs text-slate-600 font-medium"></p>
      <div id="screenshotModalAdminBtns" class="flex justify-end gap-2 pt-2 border-t border-slate-200">
        <button id="btnRejectProofModal" type="button" class="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700">Reject</button>
        <button id="btnApproveProofModal" type="button" class="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white">✅ Approve &amp; Mark Paid</button>
      </div>
    </div>
  </div>

  <!-- ADD / EDIT STUDENT MODAL -->
  <div id="studentModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 id="studentModalTitle" class="text-lg font-bold text-slate-900">Add New Student</h3>
        <button id="btnCloseStudentModal" type="button" class="text-slate-400 hover:text-slate-600 text-xl font-bold px-2">&times;</button>
      </div>

      <form id="studentForm" class="space-y-3.5 mt-4">
        <input id="studentIdInput" type="hidden" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Roll No *</label>
            <input id="studentRollInput" type="text" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Student Full Name *</label>
            <input id="studentNameInput" type="text" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Father / Guardian Name</label>
            <input id="studentFatherInput" type="text" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Phone / WhatsApp *</label>
            <input id="studentPhoneInput" type="text" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Batch *</label>
            <select id="studentClassInput" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
              <option value="Beginner / Starter">Beginner / Starter</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced Tajweed">Advanced Tajweed</option>
              <option value="Hifz-ul-Quran">Hifz-ul-Quran</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Quran Course *</label>
            <select id="studentSubjectsInput" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
              <option value="Quran with Tajweed">Quran with Tajweed</option>
              <option value="Madni Qaida">Madni Qaida</option>
              <option value="Nazra Quran">Nazra Quran</option>
              <option value="Memorization (Hifz)">Memorization (Hifz)</option>
              <option value="Islamic Dua & Namaz">Islamic Dua &amp; Namaz</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Class Timing (PKT)</label>
            <input id="studentClassTimeInput" type="text" placeholder="05:00 PM PKT" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Teams / Zoom Link</label>
            <input id="studentMeetingLinkInput" type="text" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Currency</label>
            <select id="studentCurrencyInput" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
              <option value="PKR">PKR (Rs)</option>
              <option value="AED">AED (Dirham)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Monthly Fee *</label>
            <input id="studentFeeInput" type="number" min="0" required class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Admission Date</label>
            <input id="studentJoinDateInput" type="date" value="2026-11-01" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Status</label>
            <select id="studentStatusInput" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Country / City</label>
            <input id="studentNotesInput" type="text" placeholder="Dubai UAE / France" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button id="btnCancelStudentModal" type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white">Save Student</button>
        </div>
      </form>
    </div>
  </div>

  <!-- FEE RECEIPT MODAL -->
  <div id="receiptModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 class="text-base font-bold text-slate-900">Student Fee Slip</h3>
        <button id="btnCloseReceiptModal" type="button" class="text-slate-400 hover:text-slate-600 text-xl font-bold px-2">&times;</button>
      </div>
      <div id="receiptContent" class="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm"></div>
      <div class="flex justify-end gap-2">
        <button id="btnCopyReceiptText" type="button" class="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white">Send on WhatsApp</button>
        <button id="btnDismissReceiptModal" type="button" class="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">Close</button>
      </div>
    </div>
  </div>
`);
