// ==========================================
// INDEXEDDB DATABASE ENGINE & IMAGE COMPRESSOR
// ==========================================
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetState() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get('main_state');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSaveState(data) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(data, 'main_state');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function compressImageFile(file, maxWidth = 800, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(String(ev.target.result));
      img.src = String(ev.target.result);
    };
    reader.readAsDataURL(file);
  });
}

function normalizeLoadedState(rawObj) {
  return {
    students: Array.isArray(rawObj.students) ? rawObj.students : [],
    fees: rawObj.fees || {},
    attendance: rawObj.attendance || {},
    marks: Array.isArray(rawObj.marks) ? rawObj.marks : [],
    sabaqLogs: Array.isArray(rawObj.sabaqLogs) ? rawObj.sabaqLogs : [],
    demos: Array.isArray(rawObj.demos) ? rawObj.demos : [],
    salaries: Array.isArray(rawObj.salaries) ? rawObj.salaries : [],
    expenses: Array.isArray(rawObj.expenses) ? rawObj.expenses : [],
    snapshots: rawObj.snapshots || {},
    settings: {
      academyName: (rawObj.settings && rawObj.settings.academyName) || 'Raza Tutors — Online Quran Academy',
      phone: (rawObj.settings && rawObj.settings.phone) || '+92 370 4161579',
      email: (rawObj.settings && rawObj.settings.email) || 'muhammad.zohaib.748@nayapay',
      logoDataUrl: (rawObj.settings && rawObj.settings.logoDataUrl) || '',
      financialPin: (rawObj.settings && rawObj.settings.financialPin) || '1234'
    }
  };
}

async function saveState() {
  try {
    await idbSaveState(state);
  } catch (e) {
    showToast('Error saving data to IndexedDB!');
  }
}

function getLocalStorageStats() {
  const serialized = JSON.stringify(state);
  const sizeKB = Math.round((serialized.length * 2) / 1024);
  const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;

  let photoCount = 0;
  (state.sabaqLogs || []).forEach(l => {
    photoCount += getSabaqImages(l).length;
  });
  Object.values(state.fees || {}).forEach(mObj => {
    Object.values(mObj || {}).forEach(rec => {
      if (rec && rec.proofImage) photoCount++;
    });
  });
  if (state.settings && state.settings.logoDataUrl) photoCount++;
  return { sizeLabel, photoCount };
}
