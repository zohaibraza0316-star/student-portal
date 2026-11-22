// ==========================================
// TAB 2: SABAQ & TIMETABLE (BULLETPROOF MULTI-SCREENSHOT & FILTERS)
// ==========================================
function renderPendingSabaqPreviews() {
  const box = document.getElementById('sabaqPendingPreviewBox');
  const list = document.getElementById('sabaqPendingPreviewList');
  const badge = document.getElementById('sabaqSelectedCountBadge');
  if (!box || !list) return;

  if (badge) {
    badge.textContent = `${pendingSabaqImages.length} photo${pendingSabaqImages.length === 1 ? '' : 's'} selected`;
    badge.classList.toggle('hidden', pendingSabaqImages.length === 0);
  }

  if (pendingSabaqImages.length === 0) {
    box.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  box.classList.remove('hidden');
  list.innerHTML = pendingSabaqImages.map((src, idx) => `
    <div class="relative inline-block">
      <img src="${src}" alt="Preview ${idx + 1}" class="w-16 h-16 object-cover rounded-lg border border-slate-300" />
      <button type="button" data-remove-pending-img="${idx}" class="absolute top-0 right-0 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold" title="Remove Photo">×</button>
    </div>
  `).join('');
}

async function processMultipleSabaqFiles(fileList) {
  const files = Array.from(fileList || []).filter(f => f && (!f.type || f.type.startsWith('image/')));
  if (!files.length) return;
  const saveBtn = document.getElementById('btnAddSabaqRecord');
  isCompressingSabaqPhotos = true;
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Compressing...';
  }
  showToast(`Processing ${files.length} screenshot(s)...`);
  try {
    for (const file of files) {
      const compressed = await compressImageFile(file, 800, 0.76);
      pendingSabaqImages.push(compressed);
    }
    renderPendingSabaqPreviews();
    showToast(`Total ${pendingSabaqImages.length} screenshot(s) ready! Aur photos add kar sakte hain ya Save karein.`);
  } finally {
    isCompressingSabaqPhotos = false;
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '+ Save Sabaq';
    }
  }
}

function renderSabaqAndTimetable() {
  const select = document.getElementById('sabaqStudentSelect');
  if (!select) return;
  const prevSel = select.value;
  select.innerHTML = state.students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.rollNo)} - ${escapeHtml(s.name)} (${escapeHtml(s.subjects)})</option>`).join('');
  if (prevSel && state.students.some(s => s.id === prevSel)) select.value = prevSel;

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

  // Filter Sabaq Logs
  const stuFilter = (document.getElementById('filterSabaqStudent') || {}).value || 'ALL';
  const catFilter = (document.getElementById('filterSabaqCategory') || {}).value || 'ALL';
  const q = ((document.getElementById('searchSabaqInput') || {}).value || '').trim().toLowerCase();

  const filteredLogs = (state.sabaqLogs || []).filter(item => {
    const okStu = stuFilter === 'ALL' || item.studentId === stuFilter;
    const okCat = catFilter === 'ALL' || (item.category || 'Quran Sabaq / Lesson') === catFilter;
    const okQ = !q ||
      (item.sabaq || '').toLowerCase().includes(q) ||
      (item.revision || '').toLowerCase().includes(q) ||
      (item.date || '').includes(q);
    return okStu && okCat && okQ;
  });

  const tbody = document.getElementById('sabaqTableBody');
  const empty = document.getElementById('sabaqEmptyState');
  if (filteredLogs.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = filteredLogs.map(item => {
    const stu = state.students.find(s => s.id === item.studentId);
    const imgs = getSabaqImages(item);
    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4">
          <div class="text-xs font-semibold text-slate-700">${escapeHtml(item.date)}</div>
          <div class="text-[11px] text-indigo-600 font-bold">${escapeHtml(item.category || 'Quran Sabaq')}</div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(stu ? `${stu.name} (${stu.rollNo})` : 'Removed')}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${escapeHtml(item.sabaq)}</td>
        <td class="py-3 px-4 text-slate-600 text-xs">${escapeHtml(item.revision || '—')}</td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            ${imgs.length > 0
              ? `<button type="button" data-action="view-sabaq-proof" data-id="${escapeHtml(item.id)}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">🖼️ ${imgs.length} Photo${imgs.length > 1 ? 's' : ''}</button>`
              : ''}
            <button type="button" data-action="add-more-sabaq-photos" data-id="${escapeHtml(item.id)}" class="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200" title="Add More Screenshots">+ Photo</button>
          </div>
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

// Multi-File Selection Listener
const sabaqProofFileInput = document.getElementById('sabaqProofFile');
if (sabaqProofFileInput) {
  sabaqProofFileInput.addEventListener('change', async (e) => {
    await processMultipleSabaqFiles(e.target.files);
    sabaqProofFileInput.value = '';
  });
}

// Drag & Drop support on Dropzone
const sabaqDropzone = document.getElementById('sabaqDropzone');
if (sabaqDropzone) {
  ['dragenter', 'dragover'].forEach(evt => {
    sabaqDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      sabaqDropzone.classList.add('dropzone-active');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    sabaqDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      sabaqDropzone.classList.remove('dropzone-active');
    });
  });
  sabaqDropzone.addEventListener('drop', async (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      await processMultipleSabaqFiles(e.dataTransfer.files);
    }
  });
}

// "+ Add More Photos" button in preview strip
const btnAddAnotherSabaqPhoto = document.getElementById('btnAddAnotherSabaqPhoto');
if (btnAddAnotherSabaqPhoto && sabaqProofFileInput) {
  btnAddAnotherSabaqPhoto.addEventListener('click', () => sabaqProofFileInput.click());
}

// Add More Photos to an EXISTING saved Sabaq record
const sabaqAddMoreExistingFile = document.getElementById('sabaqAddMoreExistingFile');
if (sabaqAddMoreExistingFile) {
  sabaqAddMoreExistingFile.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f && (!f.type || f.type.startsWith('image/')));
    if (!files.length || !activeExistingSabaqPhotoId) return;
    const item = (state.sabaqLogs || []).find(x => x.id === activeExistingSabaqPhotoId);
    if (!item) return;

    showToast(`Adding ${files.length} photo(s)...`);
    const existing = getSabaqImages(item);
    for (const file of files) {
      existing.push(await compressImageFile(file, 800, 0.76));
    }
    item.proofImages = existing;
    item.proofImage = existing[0] || '';
    sabaqAddMoreExistingFile.value = '';
    activeExistingSabaqPhotoId = null;
    await saveState();
    renderSabaqAndTimetable();
    showToast(`Total ${existing.length} photo(s) saved in this Sabaq log!`);
  });
}

const sabaqPendingPreviewList = document.getElementById('sabaqPendingPreviewList');
if (sabaqPendingPreviewList) {
  sabaqPendingPreviewList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-remove-pending-img]');
    if (!btn) return;
    const idx = Number(btn.getAttribute('data-remove-pending-img'));
    pendingSabaqImages.splice(idx, 1);
    renderPendingSabaqPreviews();
  });
}

const btnClearSabaqPendingImgs = document.getElementById('btnClearSabaqPendingImgs');
if (btnClearSabaqPendingImgs) {
  btnClearSabaqPendingImgs.addEventListener('click', async () => {
    const ok = await showConfirmModal({
      title: 'Clear All Selected Photos?',
      message: `Kya aap saari ${pendingSabaqImages.length} selected screenshot(s) remove karna chahte hain?`,
      confirmText: 'Haan, Clear Karein',
      variant: 'danger'
    });
    if (!ok) return;
    pendingSabaqImages = [];
    renderPendingSabaqPreviews();
  });
}

['filterSabaqStudent', 'filterSabaqCategory', 'searchSabaqInput'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', renderSabaqAndTimetable);
});

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
  if (isCompressingSabaqPhotos) return showToast('Photos compress ho rahi hain, 1 second wait karein...');
  const date = document.getElementById('sabaqDateInput').value || getTodayDateStr();
  const studentId = document.getElementById('sabaqStudentSelect').value;
  const category = document.getElementById('sabaqCategorySelect').value;
  const sabaq = document.getElementById('sabaqNewInput').value.trim();
  const revision = document.getElementById('sabaqRevisionInput').value.trim();
  const rating = document.getElementById('sabaqRatingSelect').value;

  if (!studentId || !sabaq) return showToast('Student chunein aur Sabaq ki details likhein!');

  const savedImages = [...pendingSabaqImages];
  state.sabaqLogs.unshift({
    id: 'sbq_' + Date.now(),
    date,
    studentId,
    category,
    sabaq,
    revision,
    rating,
    proofImage: savedImages[0] || '',
    proofImages: savedImages
  });

  document.getElementById('sabaqNewInput').value = '';
  document.getElementById('sabaqRevisionInput').value = '';
  pendingSabaqImages = [];
  renderPendingSabaqPreviews();
  await saveState();
  renderSabaqAndTimetable();
  showToast(`Sabaq aur ${savedImages.length} screenshot(s) IndexedDB mein save ho gaye!`);
});

document.getElementById('sabaqTableBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const item = (state.sabaqLogs || []).find(x => x.id === id);
  if (!item) return;

  if (action === 'delete-sabaq') {
    const ok = await showConfirmModal({
      title: 'Delete Sabaq Record?',
      message: `Kya aap "${item.sabaq}" (${item.date}) ka record aur us ki photos delete karna chahte hain?`,
      confirmText: 'Haan, Delete Karein',
      variant: 'danger'
    });
    if (!ok) return;
    state.sabaqLogs = state.sabaqLogs.filter(x => x.id !== id);
    await saveState();
    renderSabaqAndTimetable();
    showToast('Sabaq record deleted.');
  } else if (action === 'add-more-sabaq-photos') {
    activeExistingSabaqPhotoId = id;
    if (sabaqAddMoreExistingFile) sabaqAddMoreExistingFile.click();
  } else if (action === 'view-sabaq-proof') {
    const imgs = getSabaqImages(item);
    openImageGalleryModal(
      imgs,
      `${item.category || 'Sabaq'} Screenshots (${imgs.length})`,
      `${item.date} — ${item.sabaq}${item.revision ? ' | ' + item.revision : ''}`,
      false
    );
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
