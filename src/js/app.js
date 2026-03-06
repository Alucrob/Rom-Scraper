/* ═══════════════════════════════════════════════════
   APP.JS — Root controller, sidebar nav, page routing
   ═══════════════════════════════════════════════════ */

let currentPage = 'scraper';
let appVersion = '1.0.8';

const pages = {
  scraper:      window.ScraperPage,
  settings:     window.SettingsPage,
  instructions: window.InstructionsPage,
};

function navigateTo(pageId) {
  if (!pages[pageId]) return;
  currentPage = pageId;

  // Update sidebar
  const sidebar = document.getElementById('navSidebar');
  if (sidebar) window.Sidebar.render(sidebar, currentPage, navigateTo);

  // Render page
  const root = document.getElementById('pageRoot');
  if (root) pages[pageId].render(root);
}

/* ── IPC Event Wiring ── */
function wireIPC() {
  window.romAPI.onLog(({ level, msg }) => {
    window.ActivityLog.addLog(level, msg, window.ActivityLog.LVL_MAP[level] || 'lvl-info');
  });

  window.romAPI.onResult(row => {
    window.ResultsTable.addResult(row);
  });

  window.romAPI.onProgress(({ pct, found, downloaded, errors, totalBytes }) => {
    window.ScraperPage.updateStats({ found, downloaded, errors, totalBytes, pct });
  });

  window.romAPI.onComplete(({ downloaded, errors }) => {
    window.ScraperPage.finishUp(false);
    window.ActivityLog.addLog('DONE', `Complete -- ${downloaded} downloaded, ${errors} errors.`, 'lvl-done');
    const fill = document.getElementById('progFill');
    if (fill) fill.style.width = '100%';
  });

  // ROMAGENT events
  if (window.romAPI.onAgentLog) {
    window.romAPI.onAgentLog(({ msg }) => {
      window.ActivityLog.addLog('AGENT', msg, 'lvl-agent');
    });
  }
}

/* ── Init ── */
async function initApp() {
  // Get version
  if (window.romAPI && window.romAPI.getVersion) {
    try { appVersion = await window.romAPI.getVersion(); } catch {}
  }

  // Update titlebar version
  const tbVer = document.getElementById('tbVersion');
  if (tbVer) tbVer.textContent = 'v' + appVersion + ' -- AFJORD';

  // Load stealth defaults
  if (window.romAPI && window.romAPI.getStealthConfig) {
    try {
      window._stealthDefaults = await window.romAPI.getStealthConfig();
    } catch {}
  }

  // Render sidebar + default page
  const sidebar = document.getElementById('navSidebar');
  if (sidebar) window.Sidebar.render(sidebar, currentPage, navigateTo);

  // Update sidebar version label
  const navLabel = document.getElementById('navVersionLabel');
  if (navLabel) navLabel.textContent = 'v' + appVersion;

  navigateTo('scraper');

  // Wire IPC events
  wireIPC();

  // Initial log
  window.ActivityLog.addLog('INFO', `ROM Scraper v${appVersion} ready. Select a preset or enter a URL.`, 'lvl-info');
}

// Boot
initApp();
