// ==========================================
// TAB 2: SABAQ & TIMETABLE
// ==========================================
function renderSabaqAndTimetable() {
  const select = document.getElementById('sabaqStudentSelect');
  if (!select) return;
  select.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} - ${escapeHtml(s.name)} (${escapeHtml(s.subjects)})</option>`).join('');

  const grid = document.getElementById('timetableCardsGrid');
  if (grid) {
    grid.innerHTML = state.students.filter(s => s.status === 'Active').map(s => `
      <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-bold text-slate-900 text-sm">${escapeHtml(s.name)} <span class="text-xs text-indigo-600">(${escapeHtml(s.rollNo)})</span></div>
            <div class="text-xs text-slate-500">${escapeHtml(s.className)} • ${escapeHtml(s.subjects)}</div>
          </div>
          <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">⏰ ${escapeHtml(s.classTime || 'Not Set')}</span>
        </div>
        <div class="flex items-center gap-1.5 pt-1">
          ${s.meetingLink ? `<a href="${escapeHtml(s.meetingLink)}" target="_blank" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white">Join Class</a>` : ''}
          <button type="button" data-action="wa-class-invite" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Send Class Reminder on WA</button>
        </div>
      </div>
    `).join('');
  }

  const tbody = document.getElementById('sabaqTableBody');
  const empty = document.getElementById('sabaqEmptyState');
  if (!state.sabaqLogs || state.sabaqLogs.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = state.sabaqLogs.map(item => {
    const stu = state.students.find(s => s.id === item.studentId);
    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4">
          <div class="text-xs font-semibold text-slate-700">${escapeHtml(item.date)}</div>
          <div class="text-[11px] text-indigo-600 font-bold">${escapeHtml(item.category || 'Quran Sabaq')}</div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(stu ? `${stu.name} (${stu.rollNo})` : 'Removed')}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${escapeHtml(item.sabaq)}</td>
        <td class="py-3 px-4 text-slate-600 text-xs">${escapeHtml(item.revision || '—')}</td>
        <td class="py-3 px-4 text-center">
          ${item.proofImage ? `<button type="button" data-action="view-sabaq-proof" data-id="${escapeHtml(item.id)}" class="text-xs font-bold text-indigo-600 underline">🖼️ View Proof</button>` : '<span class="text-xs text-slate-400">—</span>'}
        </td>
        <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${escapeHtml(item.rating)}</span></td>
        <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
          <button type="button" data-action="wa-sabaq-report" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">WA Report</button>
          <button type="button" data-action="delete-sabaq" data-id="${escapeHtml(item.id)}" class="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

const timetableCardsGrid = document.getElementById('timetableCardsGrid');
if (timetableCardsGrid) {
  timetableCardsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="wa-class-invite"]');
    if (!btn) return;
    const stu = state.students.find(s => s.id === btn.getAttribute('data-id'));
    if (!stu) return;
    const linkPart = stu.meetingLink ? `\nClass Link: ${stu.meetingLink}` : '';
    const msg = `*CLASS REMINDER — ${state.settings.academyName}*\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}*\nCourse: ${stu.subjects}\nClass Time: *${stu.classTime || 'Now'}*${linkPart}\n\nClass ka waqt ho gaya hai, meherbani farma kar class join kar lein. JazakAllah!`;
    openWhatsAppChat(stu.phone, msg);
  });
}

const btnSendWeeklyReport = document.getElementById('btnSendWeeklyReport');
if (btnSendWeeklyReport) {
  btnSendWeeklyReport.addEventListener('click', () => {
    const studentId = document.getElementById('sabaqStudentSelect').value;
    const stu = state.students.find(s => s.id === studentId);
    if (!stu) return showToast('Pehle student select karein!');
    const studentLogs = (state.sabaqLogs || []).filter(x => x.studentId === studentId).slice(0, 7);
    const logText = studentLogs.map(l => `- ${l.date} [${l.category || 'Sabaq'}]: ${l.sabaq} (${l.rating})`).join('\n');
    const reportMsg = `*${state.settings.academyName} — WEEKLY PROGRESS REPORT*\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}* (${stu.rollNo})\nCourse: ${stu.subjects}\n\nRecent Lessons:\n${logText || 'No logs recorded yet.'}\n\nJazakAllah Khair!`;
    openWhatsAppChat(stu.phone, reportMsg);
  });
}

document.getElementById('btnAddSabaqRecord').addEventListener('click', async () => {
  const date = document.getElementById('sabaqDateInput').value || '2026-11-10';
  const studentId = document.getElementById('sabaqStudentSelect').value;
  const category = document.getElementById('sabaqCategorySelect').value;
  const sabaq = document.getElementById('sabaqNewInput').value.trim();
  const revision = document.getElementById('sabaqRevisionInput').value.trim();
  const rating = document.getElementById('sabaqRatingSelect').value;
  const fileInput = document.getElementById('sabaqProofFile');
  const file = fileInput && fileInput.files && fileInput.files[0];

  if (!studentId || !sabaq) return showToast('Student chunein aur Sabaq ki details likhein!');

  let imgData = '';
  if (file) {
    imgData = await compressImageFile(file, 700, 0.75);
  }

  state.sabaqLogs.unshift({
    id: 'sbq_' + Date.now(),
    date,
    studentId,
    category,
    sabaq,
    revision,
    rating,
    proofImage: imgData
  });

  document.getElementById('sabaqNewInput').value = '';
  document.getElementById('sabaqRevisionInput').value = '';
  if (fileInput) fileInput.value = '';
  await saveState();
  renderSabaqAndTimetable();
  showToast('Sabaq aur Screenshot IndexedDB mein save ho gaya!');
});

document.getElementById('sabaqTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const item = (state.sabaqLogs || []).find(x => x.id === id);
  if (!item) return;

  if (action === 'delete-sabaq') {
    state.sabaqLogs = state.sabaqLogs.filter(x => x.id !== id);
    saveState();
    renderSabaqAndTimetable();
    showToast('Sabaq record deleted.');
  } else if (action === 'view-sabaq-proof') {
    document.getElementById('screenshotModalTitle').textContent = `${item.category || 'Sabaq'} Screenshot`;
    document.getElementById('screenshotModalImg').src = item.proofImage;
    document.getElementById('screenshotModalNote').textContent = `${item.date} — ${item.sabaq}`;
    document.getElementById('screenshotModalAdminBtns').classList.add('hidden');
    document.getElementById('screenshotModal').classList.remove('hidden');
  } else if (action === 'wa-sabaq-report') {
    const stu = state.students.find(s => s.id === item.studentId);
    if (stu) {
      openWhatsAppChat(
        stu.phone,
        `*${state.settings.academyName} — ${item.category || 'DAILY SABAQ'} REPORT* (${item.date})\nAssalam-o-Alaikum!\n\nStudent: *${stu.name}* (${stu.rollNo})\nLesson: *${item.sabaq}*\nSabqi / Remarks: ${item.revision || '—'}\nPerformance: *${item.rating}*\n\nJazakAllah Khair!`
      );
    }
  }
});
