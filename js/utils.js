// ==========================================
// SHARED HELPERS, METRICS & WHATSAPP UTILS
// ==========================================
function formatMoney(amount, currency = 'Rs') {
  if (!isFinancialUnlocked) return '<span class="fin-masked">••••••</span>';
  return `${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}`;
}

function showToast(msg) {
  const toast = document.getElementById('toastBanner');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatWhatsAppNumber(phone) {
  let cleaned = String(phone || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  else if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  else if (cleaned.startsWith('03') && cleaned.length === 11) cleaned = '92' + cleaned.substring(1);
  return cleaned;
}

function openWhatsAppChat(phone, messageText) {
  const num = formatWhatsAppNumber(phone);
  if (!num) return showToast('Student ka phone number theek nahi hai!');
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(messageText || '')}`, '_blank');
}

function getMonthMetrics(monthKey) {
  const activeStudents = state.students.filter(s => s.status === 'Active');
  const monthFees = state.fees[monthKey] || {};
  let collected = 0;
  let pending = 0;
  let unpaidCount = 0;
  let proofCount = 0;

  activeStudents.forEach(s => {
    const feeAmt = Number(s.monthlyFee) || 0;
    const rec = monthFees[s.id];
    if (rec && rec.status === 'Paid') {
      collected += feeAmt;
    } else {
      pending += feeAmt;
      unpaidCount++;
      if (rec && rec.status === 'Under Review') proofCount++;
    }
  });

  const monthSalaries = (state.salaries || [])
    .filter(x => x.month === monthKey && x.status === 'Paid')
    .reduce((sum, x) => sum + (Number(x.amount) || 0), 0);

  const monthExpenses = (state.expenses || [])
    .filter(x => (x.date || '').startsWith(monthKey))
    .reduce((sum, x) => sum + (Number(x.amount) || 0), 0);

  const netProfit = collected - monthSalaries - monthExpenses;

  let snapCollectedTotal = collected;
  let snapNetTotal = netProfit;
  Object.keys(state.snapshots || {}).forEach(k => {
    if (k !== monthKey) {
      snapCollectedTotal += Number(state.snapshots[k].collected) || 0;
      snapNetTotal += Number(state.snapshots[k].netProfit) || 0;
    }
  });

  return {
    collected,
    pending,
    unpaidCount,
    proofCount,
    monthSalaries,
    monthExpenses,
    netProfit,
    activeCount: activeStudents.length,
    snapCollectedTotal,
    snapNetTotal
  };
}

function getStudentAttendanceStats(studentId, fromDate = null, toDate = null) {
  const dates = Object.keys(state.attendance).filter(d => (!fromDate || d >= fromDate) && (!toDate || d <= toDate));
  let totalMarked = 0, presentDays = 0;
  dates.forEach(d => {
    const st = state.attendance[d] && state.attendance[d][studentId];
    if (st) {
      totalMarked++;
      if (st === 'Present') presentDays++;
    }
  });
  if (totalMarked === 0) return '100% (0/0)';
  return `${Math.round((presentDays / totalMarked) * 100)}% (${presentDays}/${totalMarked})`;
}
