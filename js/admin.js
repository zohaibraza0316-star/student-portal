// ==========================================
// TAB 11: ADMIN BRANDING, OFFLINE HEALTH & STAFF USERS
// ==========================================
document.getElementById('btnSaveBranding').addEventListener('click', async () => {
  const name = document.getElementById('brandNameInput').value.trim() || 'Raza Tutors — Online Quran Academy';
  const phone = document.getElementById('brandPhoneInput').value.trim() || '+92 370 4161579';
  const email = document.getElementById('brandEmailInput').value.trim() || 'muhammad.zohaib.748@nayapay';
  const pin = document.getElementById('brandFinPinInput').value.trim() || '1234';
  const logoInput = document.getElementById('brandLogoInput');
  const file = logoInput && logoInput.files && logoInput.files[0];

  let logoUrl = (state.settings && state.settings.logoDataUrl) || '';
  if (file) {
    logoUrl = await compressImageFile(file, 300, 0.85);
  }

  state.settings = {
    academyName: name,
    phone,
    email,
    financialPin: pin,
    logoDataUrl: logoUrl
  };
  await saveState();
  renderAll();
  showToast('Logo, Header Details & Financial PIN saved in IndexedDB!');
});

const btnCheckOfflineHealth = document.getElementById('btnCheckOfflineHealth');
if (btnCheckOfflineHealth) {
  btnCheckOfflineHealth.addEventListener('click', () => {
    if (typeof checkOfflineDiagnostics === 'function') checkOfflineDiagnostics();
    showToast('Offline & IndexedDB status updated!');
  });
}

const btnRefreshOfflineCache = document.getElementById('btnRefreshOfflineCache');
if (btnRefreshOfflineCache) {
  btnRefreshOfflineCache.addEventListener('click', async () => {
    if (!navigator.onLine) return showToast('Internet connect karein cache refresh karne ke liye!');
    const ok = await showConfirmModal({
      title: 'Refresh Offline Cache?',
      message: 'Kya aap offline cache clear karke fresh files download karna chahte hain? (Aapka IndexedDB data bilkul safe rahega)',
      confirmText: 'Haan, Refresh Karein',
      variant: 'primary'
    });
    if (!ok) return;
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      showToast('Offline Cache cleared! Reloading fresh files...');
      setTimeout(() => window.location.reload(), 700);
    } catch (e) {
      showToast('Cache refresh error.');
    }
  });
}

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;
  const users = getRegisteredUsers();
  const badge = document.getElementById('adminTotalUsersBadge');
  if (badge) badge.textContent = `Total Accounts: ${users.length}`;

  tbody.innerHTML = users.map((u, i) => {
    const isBlocked = u.status === 'Blocked';
    return `
      <tr>
        <td class="py-2.5 px-4 font-semibold">${escapeHtml(u.name)}</td>
        <td class="py-2.5 px-4">${escapeHtml(u.email)}</td>
        <td class="py-2.5 px-4 font-mono text-xs">${escapeHtml(u.password)}</td>
        <td class="py-2.5 px-4">${escapeHtml(u.role || 'Admin')}</td>
        <td class="py-2.5 px-4 text-center">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${isBlocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}">${escapeHtml(u.status || 'Active')}</span>
        </td>
        <td class="py-2.5 px-4 text-right space-x-2">
          ${i === 0 ? '<span class="text-xs text-slate-400 italic">Owner</span>' : `
            <button type="button" data-toggle-user="${escapeHtml(u.id)}" class="text-xs text-amber-700 font-bold hover:underline">${isBlocked ? 'Unblock' : 'Block'}</button>
            <button type="button" data-del-user="${escapeHtml(u.id)}" class="text-xs text-rose-600 font-bold hover:underline">Delete</button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

const btnAdminCreateUser = document.getElementById('btnAdminCreateUser');
if (btnAdminCreateUser) {
  btnAdminCreateUser.addEventListener('click', () => {
    const name = document.getElementById('adminNewUserName').value.trim();
    const email = document.getElementById('adminNewUserEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminNewUserPass').value.trim();
    const role = document.getElementById('adminNewUserRole').value;
    if (!name || !email || !password) return showToast('Naam, Username aur Password teeno likhein!');

    const users = getRegisteredUsers();
    if (users.find(u => u.email === email)) return showToast('Ye username pehle se mojood hai!');

    users.push({
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      role,
      status: 'Active',
      createdAt: getTodayDateStr()
    });
    saveRegisteredUsers(users);
    document.getElementById('adminNewUserName').value = '';
    document.getElementById('adminNewUserEmail').value = '';
    document.getElementById('adminNewUserPass').value = '';
    renderAdminUsersTable();
    showToast('Staff account created!');
  });
}

const adminUsersTableBody = document.getElementById('adminUsersTableBody');
if (adminUsersTableBody) {
  adminUsersTableBody.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('button[data-del-user]');
    if (delBtn) {
      const id = delBtn.getAttribute('data-del-user');
      const target = getRegisteredUsers().find(u => u.id === id);
      const ok = await showConfirmModal({
        title: 'Delete Staff Account?',
        message: `Kya aap "${target ? target.name : 'this user'}" ka login account permanently delete karna chahte hain?`,
        confirmText: 'Haan, Delete Karein',
        variant: 'danger'
      });
      if (!ok) return;
      saveRegisteredUsers(getRegisteredUsers().filter(u => u.id !== id));
      renderAdminUsersTable();
      showToast('Account deleted!');
      return;
    }
    const togBtn = e.target.closest('button[data-toggle-user]');
    if (togBtn) {
      const id = togBtn.getAttribute('data-toggle-user');
      const target = getRegisteredUsers().find(u => u.id === id);
      const nextSt = target && target.status === 'Blocked' ? 'Active' : 'Blocked';
      const ok = await showConfirmModal({
        title: nextSt === 'Blocked' ? 'Block Staff Account?' : 'Unblock Staff Account?',
        message: `Kya aap "${target ? target.name : 'this user'}" ko ${nextSt === 'Blocked' ? 'Block' : 'Unblock'} karna chahte hain?`,
        confirmText: nextSt === 'Blocked' ? 'Haan, Block Karein' : 'Haan, Unblock Karein',
        variant: nextSt === 'Blocked' ? 'danger' : 'success'
      });
      if (!ok) return;
      const users = getRegisteredUsers().map(u => u.id === id ? { ...u, status: nextSt } : u);
      saveRegisteredUsers(users);
      renderAdminUsersTable();
      showToast('Account status updated!');
    }
  });
}
