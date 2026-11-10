const USERS_KEY = 'sms_portal_users_v1';
const SESSION_KEY = 'sms_portal_active_user';

function getUsers() {
  try {
    const list = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    return list.map((u, index) => ({
      ...u,
      role: u.role || (index === 0 ? 'Super Admin' : 'Staff / Teacher'),
      status: u.status || 'Active',
      createdAt: u.createdAt || '2026-11-08'
    }));
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function showAlert(msg, isError = true) {
  const alertBox = document.getElementById('authAlert');
  if (!alertBox) return;
  alertBox.textContent = msg;
  alertBox.className = `mx-6 mt-4 p-3 rounded-lg text-xs font-medium border ${
    isError
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }`;
  alertBox.classList.remove('hidden');
}

if (document.getElementById('loginForm')) {
  // Agar pehle se login hai to seedha index.html par bhej do
  if (localStorage.getItem(SESSION_KEY)) {
    window.location.href = 'index.html';
  }

  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabSignupBtn = document.getElementById('tabSignupBtn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authAlert = document.getElementById('authAlert');

  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.className = 'py-2 rounded-lg text-sm font-semibold tab-btn-active transition';
    tabSignupBtn.className = 'py-2 rounded-lg text-sm font-semibold tab-btn-inactive transition';
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    authAlert.classList.add('hidden');
  });

  tabSignupBtn.addEventListener('click', () => {
    tabSignupBtn.className = 'py-2 rounded-lg text-sm font-semibold tab-btn-active transition';
    tabLoginBtn.className = 'py-2 rounded-lg text-sm font-semibold tab-btn-inactive transition';
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authAlert.classList.add('hidden');
  });

  document.getElementById('toggleLoginPass').addEventListener('click', function () {
    const passInput = document.getElementById('loginPassword');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      this.textContent = 'Hide';
    } else {
      passInput.type = 'password';
      this.textContent = 'Show';
    }
  });

  // Create Account Submit
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (password !== confirm) {
      showAlert('Passwords match nahi kar rahe! Dobara check karein.', true);
      return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      showAlert('Is Email/Username par pehle se account bana hua hai!', true);
      return;
    }

    const isFirstUser = users.length === 0;
    const today = new Date().toISOString().slice(0, 10);

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      role: isFirstUser ? 'Super Admin' : 'Staff / Teacher',
      status: 'Active',
      createdAt: today
    };

    users.push(newUser);
    saveUsers(users);

    showAlert('Account ban gaya hai! Ab aap Login kar sakte hain.', false);
    signupForm.reset();
    setTimeout(() => tabLoginBtn.click(), 1000);
  });

  // Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const matched = users.find(u => u.email === email && u.password === password);

    if (!matched) {
      showAlert('Email/Username ya Password ghalat hai!', true);
      return;
    }

    if (matched.status === 'Blocked') {
      showAlert('Aapka account Admin ne Block kar diya hai!', true);
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role
    }));
    window.location.href = 'index.html';
  });
}