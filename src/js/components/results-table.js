/* ═══════════════════════════════════════════════════
   RESULTS TABLE — Sortable, with export actions
   ═══════════════════════════════════════════════════ */

let resultRows = [];

function addResult(row) {
  const body = document.getElementById('resultsBody');
  if (!body) return;

  const { escHtml } = window.ActivityLog;
  const statusIcon = row.status === 'ok' ? '<span class="td-status-ok">&#10003;</span>'
    : row.status === 'error' ? '<span class="td-status-err">&#10007;</span>'
    : '<span class="td-status-dl">&#9676;</span>';

  const existing = body.querySelector(`tr[data-url="${CSS.escape(row.url)}"]`);
  if (existing && row.status !== 'downloading') {
    existing.querySelector('td:first-child').innerHTML = statusIcon;
    existing.querySelector('.td-fn').textContent = row.filename;
    existing.querySelector('.td-type').textContent = row.type;
    existing.cells[3].textContent = row.size;
    existing.cells[4].textContent = row.date;
    return;
  }

  const tr = document.createElement('tr');
  tr.dataset.url = row.url;
  tr.innerHTML = `
    <td>${statusIcon}</td>
    <td class="td-fn">${escHtml(row.filename)}</td>
    <td class="td-type">${escHtml(row.type)}</td>
    <td>${escHtml(row.size)}</td>
    <td>${escHtml(row.date)}</td>
    <td class="td-url" title="${escHtml(row.url)}">${escHtml(row.url)}</td>`;
  tr.addEventListener('click', () => {
    body.querySelectorAll('tr').forEach(r => r.classList.remove('sel'));
    tr.classList.add('sel');
  });
  body.insertBefore(tr, body.firstChild);

  if (row.status !== 'downloading') resultRows.push(row);
}

function clearResults() {
  const body = document.getElementById('resultsBody');
  if (body) body.innerHTML = '';
  resultRows = [];
}

async function exportCSV() {
  const rows = await window.romAPI.getResults();
  if (!rows.length) { window.ActivityLog.addLog('WARN', 'No results to export yet.', 'lvl-warn'); return; }
  const header = 'Filename,Type,Size,Date,Source URL\n';
  const csv = header + rows.map(r => `"${r.filename}","${r.type}","${r.size}","${r.date}","${r.url}"`).join('\n');
  const ok = await window.romAPI.exportCsv(csv);
  if (ok) window.ActivityLog.addLog('OK', 'Results exported to CSV.', 'lvl-ok');
}

async function exportJSON() {
  const rows = await window.romAPI.getResults();
  if (!rows.length) { window.ActivityLog.addLog('WARN', 'No results to export yet.', 'lvl-warn'); return; }
  const ok = await window.romAPI.exportJson(JSON.stringify(rows, null, 2));
  if (ok) window.ActivityLog.addLog('OK', 'Results exported to JSON.', 'lvl-ok');
}

window.ResultsTable = { addResult, clearResults, exportCSV, exportJSON };
