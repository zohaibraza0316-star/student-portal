// ==========================================
// 100% OFFLINE PWA MANAGER & SERVICE WORKER CONTROLLER
// ==========================================
let deferredPwaPrompt = null;

function updateOnlineStatusUI() {
  const isOnline = navigator.onLine;
  const badge = document.getElementById('pwaStatusBadge');
  if (badge) {
    if (isOnline) {
      badge.textContent = '🟢 Online';
      badge.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else {
      badge.textContent = '🟠 Offline Ready';
      badge.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300';
    }
  }
  const diagNet = document.getElementById('diagNetworkStatus');
  if (diagNet) {
    diagNet.textContent = isOnline ? '🟢 Connected (Online)' : '🟠 Offline (Working Locally)';
  }
}

window.addEventListener('online', () => {
  updateOnlineStatusUI();
  if (typeof showToast === 'function') showToast('Internet wapis aa gaya — Online mode active!');
});

window.addEventListener('offline', () => {
  updateOnlineStatusUI();
  if (typeof showToast === 'function') showToast('Offline Mode Active — Sara data IndexedDB mein safe hai!');
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const installBtn = document.getElementById('btnInstallPwa');
  if (installBtn) installBtn.classList.remove('hidden');
});

const btnInstallPwa = document.getElementById('btnInstallPwa');
if (btnInstallPwa) {
  btnInstallPwa.addEventListener('click', async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const choice = await deferredPwaPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      btnInstallPwa.classList.add('hidden');
      if (typeof showToast === 'function') showToast('Raza Tutors App successfully install ho gayi!');
    }
    deferredPwaPrompt = null;
  });
}

async function checkOfflineDiagnostics() {
  updateOnlineStatusUI();
  const swEl = document.getElementById('diagSwStatus');
  const cacheEl = document.getElementById('diagCachedFiles');
  const storageEl = document.getElementById('diagStorageUsage');

  if (swEl) {
    if (!('serviceWorker' in navigator)) {
      swEl.textContent = 'Not Supported';
    } else if (window.location.protocol === 'file:') {
      swEl.textContent = 'Local File Mode (Host on HTTPS/GitHub for SW)';
    } else {
      const reg = await navigator.serviceWorker.getRegistration('./');
      swEl.textContent = (reg && reg.active) ? '✅ Active & Offline Protected' : '⏳ Installing...';
    }
  }

  if (cacheEl && 'caches' in window) {
    try {
      const names = await caches.keys();
      let totalFiles = 0;
      for (const n of names) {
        const c = await caches.open(n);
        const keys = await c.keys();
        totalFiles += keys.length;
      }
      cacheEl.textContent = totalFiles > 0 ? `✅ ${totalFiles} files cached` : '0 files (Open online once)';
    } catch (e) {
      cacheEl.textContent = 'Unavailable';
    }
  }

  if (storageEl && typeof getLocalStorageStats === 'function') {
    const stats = getLocalStorageStats();
    storageEl.textContent = `${stats.sizeLabel} (${stats.photoCount} photos)`;
  }
}

async function registerOfflineServiceWorker() {
  updateOnlineStatusUI();
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol === 'file:') return;

  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          checkOfflineDiagnostics();
          if (typeof showToast === 'function') showToast('Offline PWA Cache Ready (100% Offline Enabled)!');
        }
      });
    });
    checkOfflineDiagnostics();
  } catch (err) {
    console.warn('SW registration skipped:', err);
  }
}

registerOfflineServiceWorker();
