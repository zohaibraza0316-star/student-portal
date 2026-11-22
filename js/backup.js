// ==========================================
// JSON BACKUP, RESTORE (WITH CONFIRM POPUP) & CSV EXPORT
// ==========================================
document.getElementById('btnBackupJson').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `raza_tutors_indexeddb_backup_${getTodayDateStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full IndexedDB Backup Downloaded!');
});

document.getElementById('inputRestoreJson').addEventListener('change', (e) => {
  const input = e.target;
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const imported = JSON.parse(String(ev.target.result));
      if (imported && Array.isArray(imported.students)) {
        const ok = await showConfirmModal({
          title: 'Restore Backup File?',
          message: `Is backup mein ${imported.students.length} students hain. Restore karne se mojooda IndexedDB data is backup se replace ho jayega. Kya aap jari rakhna chahte hain?`,
          confirmText: 'Haan, Restore Karein',
          variant: 'primary'
        });
        if (!ok) {
          input.value = '';
          return;
        }
        state = normalizeLoadedState(imported);
        await saveState();
        renderAll();
        showToast('Backup successfully restored into IndexedDB!');
      } else {
        showToast('Invalid backup JSON file.');
      }
    } catch (err) {
      showToast('Failed to parse backup file.');
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
});

document.getElementById('btnExportCsv').addEventListener('click', () => {
  const monthKey = document.getElementById('feeMonthInput').value || getCurrentMonthStr();
  const headers = ['Roll No', 'Name', 'Country', 'Batch', 'Course', 'Phone', 'Currency', 'Fee', `Status (${monthKey})`];
  const rows = state.students.map(s => [
    s.rollNo,
    s.name,
    s.notes || '',
    s.className || '',
    s.subjects || '',
    s.phone || '',
    s.currency || 'PKR',
    s.monthlyFee || 0,
    (state.fees[monthKey] && state.fees[monthKey][s.id]) ? state.fees[monthKey][s.id].status : 'Pending'
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `raza_tutors_${monthKey}.csv`;
  a.click();
});
