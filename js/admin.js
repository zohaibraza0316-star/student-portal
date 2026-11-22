// ==========================================
// TAB 11: ADMIN BRANDING, LOGO & STAFF USERS
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

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td class="py-2.5 px-4 font-semibold">${escapeHtml(u.name)}</td>
      <td class="py-2.5 px-4">${escapeHtml(u.email)}</td>
      <td class="py-2.5 px-4 font-mono text-xs">${escapeHtml(u.password)}</td>
      <td class="py-2.5 px-4">${escapeHtml(u.role || 'Admin')}</td>
      <td class="py-2.5 px-4 text-center">${escapeHtml(u.status || 'Active')}</td>
      <td class="py-2.5 px-4 text-right">
        ${i === 0 ? '<span class="text-xs text-slate-400 italic">Owner</span>' : `<button type="button" data-del-user="${escapeHtml(u.id)}" class="text-xs text-rose-600 font-bold hover:underline">Delete</button>`}
      </td>
    </tr>
  `).join('');
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
      createdAt: new Date().toISOString().slice(0, 10)
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
  adminUsersTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-del-user]');
    if (!btn) return;
    const id = btn.getAttribute('data-del-user');
    const users = getRegisteredUsers().filter(u => u.id !== id);
    saveRegisteredUsers(users);
    renderAdminUsersTable();
    showToast('Account deleted!');
  });
}
