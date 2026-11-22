mountView(`
  <!-- TAB 11: ADMIN PANEL (OFFLINE PWA HEALTH, BRANDING LOGO, PIN, STAFF ACCOUNTS) -->
  <section id="viewAdmin" class="hidden space-y-5">

    <!-- Offline PWA & IndexedDB Health Box -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase">📶 100% Offline PWA &amp; Local Storage Diagnostics</h2>
          <p class="text-xs text-slate-500">Zero external CDN dependencies — poora portal internet ke baghair bhi full speed aur design ke saath chalta hai.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btnCheckOfflineHealth" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
            🔍 Check Status
          </button>
          <button id="btnRefreshOfflineCache" type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            🔄 Refresh Offline Cache
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-slate-500 font-semibold">Network Status</div>
          <div id="diagNetworkStatus" class="text-sm font-bold text-emerald-600 mt-1">Checking...</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-slate-500 font-semibold">Service Worker</div>
          <div id="diagSwStatus" class="text-sm font-bold text-indigo-600 mt-1">Checking...</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-slate-500 font-semibold">Offline Cached Files</div>
          <div id="diagCachedFiles" class="text-sm font-bold text-slate-900 mt-1">0 files</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-slate-500 font-semibold">IndexedDB Data &amp; Photos</div>
          <div id="diagStorageUsage" class="text-sm font-bold text-slate-900 mt-1">Calculating...</div>
        </div>
      </div>
    </div>

    <!-- Branding & Financial PIN Setup -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      <h2 class="text-sm font-bold text-slate-800 uppercase">🎨 Academy Logo, Header Details &amp; Financial Password Setup (Saved in IndexedDB)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600">Academy Name</label>
          <input id="brandNameInput" type="text" placeholder="Raza Tutors — Online Quran Academy" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Official Phone / WhatsApp</label>
          <input id="brandPhoneInput" type="text" placeholder="+92 370 4161579" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Official Email</label>
          <input id="brandEmailInput" type="text" placeholder="muhammad.zohaib.748@nayapay" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Upload Academy Logo (For Sidebar &amp; PDFs)</label>
          <input id="brandLogoInput" type="file" accept="image/*" class="mt-1 w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600">Financial Lock Password / PIN *</label>
          <input id="brandFinPinInput" type="text" placeholder="Default: 1234" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono" />
        </div>
        <div class="flex items-end">
          <button id="btnSaveBranding" type="button" class="w-full px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition">
            💾 Save Logo, Header &amp; PIN
          </button>
        </div>
      </div>
    </div>

    <!-- Staff Accounts -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-bold text-slate-800 uppercase">Teacher &amp; Staff Login Accounts</h2>
        <span id="adminTotalUsersBadge" class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Total Accounts: 1</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        <input id="adminNewUserName" type="text" placeholder="Full Name" class="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <input id="adminNewUserEmail" type="text" placeholder="Username / Email" class="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <input id="adminNewUserPass" type="text" placeholder="Password" class="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <select id="adminNewUserRole" class="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white">
          <option value="Staff / Teacher">Staff / Teacher</option>
          <option value="Super Admin">Super Admin</option>
        </select>
        <button id="btnAdminCreateUser" type="button" class="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
          + Create Account
        </button>
      </div>

      <div class="overflow-x-auto pt-3">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Name</th>
              <th class="py-3 px-4">Username</th>
              <th class="py-3 px-4">Password</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="adminUsersTableBody" class="divide-y divide-slate-200 text-sm"></tbody>
        </table>
      </div>
    </div>
  </section>
`);
