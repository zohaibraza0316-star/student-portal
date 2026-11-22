// ==========================================
// 100% OFFLINE NATIVE HTML5 CANVAS CHARTS (ZERO CDN)
// ==========================================
function setupHiDpiCanvas(canvas) {
  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: 500, height: 256 };
  const w = Math.max(280, Math.floor(rect.width || 500));
  const h = Math.max(220, Math.floor(rect.height || 256));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

function renderOfflineBarChart(canvas, labels, incomeData, outflowData) {
  const { ctx, w, h } = setupHiDpiCanvas(canvas);
  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  ctx.clearRect(0, 0, w, h);

  // Legend
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillRect(14, 10, 12, 12);
  ctx.fillStyle = textColor;
  ctx.fillText('Collected Fees', 32, 20);

  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(135, 10, 12, 12);
  ctx.fillStyle = textColor;
  ctx.fillText('Expenses + Salaries', 153, 20);

  const padL = 56, padR = 16, padT = 36, padB = 34;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = Math.max(1000, ...incomeData, ...outflowData) * 1.15;

  // Horizontal Grid & Y-axis labels
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const y = padT + chartH - (chartH * (i / 4));
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val), padL - 6, y + 3);
  }

  // Bars
  const groupW = chartW / Math.max(1, labels.length);
  const barW = Math.min(24, Math.max(8, (groupW - 14) / 2));

  labels.forEach((lbl, idx) => {
    const cx = padL + groupW * idx + groupW / 2;
    const incH = (Number(incomeData[idx] || 0) / maxVal) * chartH;
    const outH = (Number(outflowData[idx] || 0) / maxVal) * chartH;

    // Income Bar
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx - barW - 2, padT + chartH - incH, barW, incH);

    // Outflow Bar
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx + 2, padT + chartH - outH, barW, outH);

    // Month Label
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(lbl, cx, padT + chartH + 16);
  });
}

function renderOfflineDoughnutChart(canvas, labels, values) {
  const { ctx, w, h } = setupHiDpiCanvas(canvas);
  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#cbd5e1' : '#334155';
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#f43f5e'];

  ctx.clearRect(0, 0, w, h);
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No student data available', w / 2, h / 2);
    return;
  }

  const radius = Math.min(w * 0.25, h * 0.38, 86);
  const cx = Math.min(w * 0.3, radius + 28);
  const cy = h / 2;

  let startAngle = -Math.PI / 2;
  values.forEach((val, idx) => {
    const slice = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fill();
    startAngle += slice;
  });

  // Inner cutout
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.fill();

  // Center Total
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(String(total), cx, cy + 2);
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('Students', cx, cy + 16);

  // Legend on the right
  const legX = cx + radius + 24;
  let legY = Math.max(24, cy - (labels.length * 11));
  ctx.textAlign = 'left';
  labels.forEach((lbl, idx) => {
    const pct = Math.round((values[idx] / total) * 100);
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(legX, legY - 9, 10, 10);
    ctx.fillStyle = textColor;
    ctx.font = '11px system-ui, sans-serif';
    const shortLbl = lbl.length > 26 ? lbl.slice(0, 25) + '…' : lbl;
    ctx.fillText(`${shortLbl}: ${values[idx]} (${pct}%)`, legX + 16, legY);
    legY += 20;
  });
}
