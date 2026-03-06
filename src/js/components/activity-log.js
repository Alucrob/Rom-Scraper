/* ═══════════════════════════════════════════════════
   ACTIVITY LOG — Color-coded, ROMAGENT-aware
   ═══════════════════════════════════════════════════ */

const LVL_MAP = {
  START: 'lvl-start', INFO: 'lvl-info', SCAN: 'lvl-scan',
  OK: 'lvl-ok', WARN: 'lvl-warn', ERR: 'lvl-err',
  SKIP: 'lvl-skip', DONE: 'lvl-done', PRESET: 'lvl-preset',
  AGENT: 'lvl-agent',
};

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addLog(level, msg, cls) {
  const ts = new Date().toTimeString().split(' ')[0];
  const body = document.getElementById('logBody');
  if (!body) return;

  const line = document.createElement('div');
  line.className = 'log-line';
  if (level === 'AGENT') line.classList.add('agent-line');

  const resolvedCls = cls || LVL_MAP[level] || 'lvl-info';
  const pad = level.padEnd(6);
  line.innerHTML = `<span class="log-ts">${ts}</span><span class="log-lvl ${resolvedCls}">${pad}</span><span class="log-msg">${escHtml(msg)}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function clearLog() {
  const body = document.getElementById('logBody');
  if (body) body.innerHTML = '';
}

async function saveLog() {
  const lines = [...document.querySelectorAll('.log-line')].map(l => l.textContent).join('\n');
  const ok = await window.romAPI.saveLog(lines);
  if (ok) addLog('OK', 'Log saved successfully.', 'lvl-ok');
}

window.ActivityLog = { addLog, clearLog, saveLog, escHtml, LVL_MAP };
