const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');

/* ── Auto-updater setup ── */
let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  // Point to your GitHub repo
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Alucrob',
    repo: 'Rom-Scraper',
  });
} catch (e) {
  // electron-updater not available in dev mode — that's fine
  autoUpdater = null;
}


let mainWindow;
let loadingWindow;
let updaterWindow;

/* ══════════════════════════════════════════
   LOADING WINDOW
══════════════════════════════════════════ */
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 500, height: 420,
    frame: false,
    transparent: false,
    resizable: false,
    center: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    show: false,
  });
  loadingWindow.loadFile(path.join(__dirname, 'src', 'loading.html'), { query: { version: app.getVersion() } });
  loadingWindow.once('ready-to-show', () => loadingWindow.show());
}

/* ══════════════════════════════════════════
   UPDATER WINDOW
══════════════════════════════════════════ */
function createUpdaterWindow(currentVersion, updateInfo) {
  updaterWindow = new BrowserWindow({
    width: 480, height: 420,
    frame: false,
    resizable: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'updater-preload.js'),
    },
    show: false,
  });

  updaterWindow.loadFile(path.join(__dirname, 'src', 'updater.html'));

  updaterWindow.once('ready-to-show', () => {
    // Close loading screen, show updater
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close();
      loadingWindow = null;
    }
    updaterWindow.show();

    // Send version info to the updater UI
    updaterWindow.webContents.send('update-status', {
      currentVersion,
      newVersion: updateInfo.version,
      releaseNotes: updateInfo.releaseNotes || updateInfo.releaseName || 'See GitHub for details.',
    });
  });

  updaterWindow.on('closed', () => { updaterWindow = null; });
}

/* ══════════════════════════════════════════
   MAIN APP WINDOW
══════════════════════════════════════════ */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (loadingWindow && !loadingWindow.isDestroyed()) {
        loadingWindow.close();
        loadingWindow = null;
      }
      mainWindow.show();
    }, 3000);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

/* ══════════════════════════════════════════
   AUTO-UPDATER LOGIC
══════════════════════════════════════════ */
function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.on('update-available', (info) => {
    // Show updater window instead of main app
    const currentVersion = app.getVersion();
    createUpdaterWindow(currentVersion, info);
  });

  autoUpdater.on('update-not-available', () => {
    // No update — launch main app normally
    createWindow();
  });

  autoUpdater.on('error', () => {
    // Update check failed (offline, etc.) — launch main app anyway
    createWindow();
  });

  autoUpdater.on('download-progress', (progress) => {
    if (updaterWindow && !updaterWindow.isDestroyed()) {
      updaterWindow.webContents.send('update-progress', {
        percent:     progress.percent,
        transferred: progress.transferred,
        total:       progress.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (updaterWindow && !updaterWindow.isDestroyed()) {
      updaterWindow.webContents.send('update-complete');
    }
  });

  // Check for updates — triggers the chain above
  autoUpdater.checkForUpdates().catch(() => createWindow());
}

/* ══════════════════════════════════════════
   UPDATER IPC
══════════════════════════════════════════ */
ipcMain.on('download-update', () => {
  if (autoUpdater) autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  if (autoUpdater) {
    autoUpdater.autoInstallOnAppQuit = true;
    app.removeAllListeners('window-all-closed');
    if (updaterWindow && !updaterWindow.isDestroyed()) updaterWindow.destroy();
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.destroy();
    autoUpdater.quitAndInstall(false, true);
  }
});

ipcMain.on('skip-update', () => {
  if (updaterWindow && !updaterWindow.isDestroyed()) {
    updaterWindow.close();
  }
  createWindow();
});


app.whenReady().then(() => {
  createLoadingWindow();
  // Check for updates first — updater decides whether to show main app or update window
  setupAutoUpdater();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });

/* ── Window controls ── */
ipcMain.on('win-minimize', () => mainWindow?.minimize());
ipcMain.on('win-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.restore();
  else mainWindow?.maximize();
});
ipcMain.on('win-close', () => mainWindow?.close());

ipcMain.handle('get-version', () => app.getVersion());

/* ── Browse for output directory ── */
ipcMain.handle('browse-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Output Directory'
  });
  return result.canceled ? null : result.filePaths[0];
});

/* ── Open output folder in Explorer ── */
ipcMain.on('open-folder', (event, folderPath) => {
  if (folderPath && fs.existsSync(folderPath)) shell.openPath(folderPath);
});

/* ── Save log ── */
ipcMain.handle('save-log', async (event, logText) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Activity Log',
    defaultPath: `rom_scraper_log_${Date.now()}.txt`,
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });
  if (!result.canceled) { fs.writeFileSync(result.filePath, logText, 'utf8'); return true; }
  return false;
});

/* ── Export CSV ── */
ipcMain.handle('export-csv', async (event, csvData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Results as CSV',
    defaultPath: `rom_scraper_results_${Date.now()}.csv`,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  if (!result.canceled) { fs.writeFileSync(result.filePath, csvData, 'utf8'); return true; }
  return false;
});

/* ── Export JSON ── */
ipcMain.handle('export-json', async (event, jsonData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Results as JSON',
    defaultPath: `rom_scraper_results_${Date.now()}.json`,
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  if (!result.canceled) { fs.writeFileSync(result.filePath, jsonData, 'utf8'); return true; }
  return false;
});

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */

function parseCookieString(raw) {
  if (!raw) return [];
  if (raw.trim().startsWith('[')) {
    try {
      const arr = JSON.parse(raw);
      return arr.map(c => ({ name: c.name, value: String(c.value), domain: c.domain || '' }));
    } catch {}
  }
  return raw.split(';').map(p => {
    const [name, ...rest] = p.trim().split('=');
    return { name: name.trim(), value: rest.join('=').trim(), domain: '' };
  }).filter(c => c.name && c.value);
}

function cookiesToHeader(cookies) {
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 200) || 'file';
}

function getFileExtension(fileUrl) {
  const clean = fileUrl.split('?')[0].split('#')[0];
  const ext = path.extname(clean).toLowerCase().replace('.', '');
  return ext || 'jpg';
}

function guessFileType(ext) {
  const map = {
    jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP', gif: 'GIF',
    svg: 'SVG', avif: 'AVIF', bmp: 'BMP', tiff: 'TIFF',
    mp4: 'MP4', mov: 'MOV', webm: 'WEBM', avi: 'AVI',
    pdf: 'PDF', docx: 'DOCX', xlsx: 'XLSX',
    mp3: 'MP3', wav: 'WAV', ogg: 'OGG',
    html: 'HTML', css: 'CSS', js: 'JS',
    woff: 'WOFF', woff2: 'WOFF2', ttf: 'TTF', otf: 'OTF',
  };
  return map[ext] || (ext ? ext.toUpperCase() : 'FILE');
}

function downloadFile(fileUrl, outputDir, filename, cookieHeader = '') {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(fileUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const filePath = path.join(outputDir, filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(filePath);
    const req = lib.get({
      hostname: parsed.hostname,
      path: parsed.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        try { fs.unlinkSync(filePath); } catch {}
        resolve(downloadFile(res.headers.location, outputDir, filename, cookieHeader));
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(filePath); } catch {}
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        const size = fs.statSync(filePath).size;
        file.close(() => resolve({ filePath, size, date: new Date().toISOString().split('T')[0] }));
      });
    });
    req.on('error', err => { file.close(); try { fs.unlinkSync(filePath); } catch {} reject(err); });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Download timeout')); });
  });
}

function fetchPage(pageUrl, timeoutMs = 10000, cookieHeader = '') {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(pageUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get({
      hostname: parsed.hostname,
      path: parsed.path || '/',
      port: parsed.port,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchPage(res.headers.location, timeoutMs, cookieHeader));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, status: res.statusCode, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractImageUrls(html, baseUrl) {
  const imgs = [];
  const seen = new Set();
  const patterns = [
    /(?:src|data-src|data-lazy-src|data-original)=["']([^"']+\.(jpg|jpeg|png|webp|gif|svg|avif|bmp))(?:\?[^"']*)?["']/gi,
    /url\(["']?([^"')]+\.(jpg|jpeg|png|webp|gif|svg|avif))["']?\)/gi,
    /"(?:url|src|image|photo|thumbnail|uri)":\s*"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp|gif|svg|avif))"/gi,
  ];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(html)) !== null) {
      let imgUrl = m[1];
      if (!imgUrl || imgUrl.startsWith('data:')) continue;
      if (!imgUrl.startsWith('http')) {
        try { imgUrl = new URL(imgUrl, baseUrl).href; } catch { continue; }
      }
      const key = imgUrl.split('?')[0];
      if (!seen.has(key)) { seen.add(key); imgs.push(imgUrl); }
    }
  }
  return imgs;
}

function extractAllUrls(html, baseUrl) {
  const links = new Set();
  const pat = /href=["']([^"'#]+)["']/gi;
  let m;
  while ((m = pat.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href;
      if (new URL(abs).hostname === new URL(baseUrl).hostname) links.add(abs);
    } catch {}
  }
  return [...links];
}

/* ═══════════════════════════════════════════════════
   PUPPETEER ENGINE
═══════════════════════════════════════════════════ */

let puppeteerBrowser = null;

async function launchBrowser(sendLog) {
  if (puppeteerBrowser) return puppeteerBrowser;
  sendLog('INFO', 'Launching headless browser — this takes a few seconds...');
  const puppeteer = require('puppeteer');
  puppeteerBrowser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,900',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  sendLog('INFO', 'Headless browser ready.');
  return puppeteerBrowser;
}

async function closeBrowser() {
  if (puppeteerBrowser) {
    try { await puppeteerBrowser.close(); } catch {}
    puppeteerBrowser = null;
  }
}

async function scrapeWithPuppeteer(pageUrl, cookies, config, outputDir, sendLog, onFileDownloaded) {
  const browser = await launchBrowser(sendLog);
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Inject session cookies
    if (cookies.length > 0) {
      sendLog('INFO', `Injecting ${cookies.length} session cookies...`);
      const domain = new URL(pageUrl).hostname;
      const puppeteerCookies = cookies.map(c => ({
        name: c.name, value: c.value,
        domain: c.domain || domain, path: '/', secure: true, httpOnly: false,
      }));
      await page.setCookie(...puppeteerCookies);
    }

    sendLog('SCAN', `Navigating to: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('checkpoint') || currentUrl.includes('accounts/login')) {
      sendLog('WARN', 'Redirected to login page — cookies may be expired. Copy fresh cookies from Chrome.');
      await page.close();
      return [];
    }

    sendLog('SCAN', 'Page loaded. Scrolling to reveal lazy-loaded images...');
    const scrollPasses = Math.min(Math.ceil(config.maxFiles / 5), 30);
    for (let i = 0; i < scrollPasses; i++) {
      if (!scrapeActive) break;
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await new Promise(r => setTimeout(r, 700));
      if (i % 5 === 0 && i > 0) sendLog('SCAN', `Scrolling... (${i}/${scrollPasses})`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    sendLog('SCAN', 'Extracting image URLs from rendered DOM...');

    const imageUrls = await page.evaluate(() => {
      const urls = new Set();
      document.querySelectorAll('img').forEach(img => {
        [img.src, img.dataset.src, img.dataset.lazySrc, img.dataset.original,
         img.getAttribute('data-src'), img.getAttribute('data-original')]
          .filter(s => s && s.startsWith('http') && !s.startsWith('data:'))
          .forEach(s => urls.add(s));
      });
      document.querySelectorAll('*').forEach(el => {
        try {
          const bg = window.getComputedStyle(el).backgroundImage;
          const m = bg && bg.match(/url\(["']?(https?[^"')]+)["']?\)/);
          if (m && m[1]) urls.add(m[1]);
        } catch {}
      });
      document.querySelectorAll('script').forEach(s => {
        const text = s.textContent || '';
        const matches = text.matchAll(/"(https?:\\?\/\\?\/[^"\\]*(?:scontent|fbcdn|cdninstagram|twimg)[^"\\]*(?:\.jpg|\.jpeg|\.png|\.webp|\.gif)[^"\\]*)"/g);
        for (const m of matches) {
          try {
            const cleaned = m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '');
            if (cleaned.startsWith('http')) urls.add(cleaned);
          } catch {}
        }
      });
      return [...urls];
    });

    sendLog('SCAN', `Found ${imageUrls.length} image URLs. Downloading via browser (bypasses SSL restrictions)...`);

    // ── Download each image THROUGH the browser so Referer/SSL are handled correctly ──
    let fileIndex = 0;
    for (const imgUrl of imageUrls) {
      if (!scrapeActive) break;
      while (scrapePaused) await new Promise(r => setTimeout(r, 500));

      const ext = getFileExtension(imgUrl);
      if (/emoji|1x1|pixel|blank\.|spacer\./i.test(imgUrl)) continue;

      fileIndex++;
      const rawName = path.basename(imgUrl.split('?')[0]) || `file_${fileIndex}.${ext}`;
      const filename = sanitizeFilename(rawName.includes('.') ? rawName : `${rawName}.${ext}`);

      try {
        // Use Puppeteer's built-in fetch — runs inside the browser with correct cookies & Referer
        const buffer = await page.evaluate(async (src) => {
          const resp = await fetch(src, { credentials: 'include' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const ab = await resp.arrayBuffer();
          return Array.from(new Uint8Array(ab));
        }, imgUrl);

        if (!buffer || buffer.length < 3000) continue; // skip tiny tracking pixels

        const filePath = path.join(outputDir, filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, Buffer.from(buffer));

        await onFileDownloaded({ filename, ext, size: buffer.length, url: imgUrl, filePath });

      } catch (err) {
        sendLog('ERR', `Failed: ${filename} — ${err.message}`);
      }

      if (config.delay > 0) await new Promise(r => setTimeout(r, config.delay * 500)); // half delay for browser DLs
    }

    await page.close();
    return []; // downloads already handled above

  } catch (err) {
    sendLog('ERR', `Browser error: ${err.message}`);
    try { await page.close(); } catch {}
    return [];
  }
}

/* ═══════════════════════════════════════════════════
   SCRAPE HANDLER
═══════════════════════════════════════════════════ */

let scrapeActive = false;
let scrapePaused = false;
let scrapeResults = [];

ipcMain.handle('start-scrape', async (event, config) => {
  scrapeActive = true;
  scrapePaused = false;
  scrapeResults = [];
  let found = 0, downloaded = 0, errors = 0, totalBytes = 0, fileIndex = 0;

  const sendLog = (level, msg) => {
    if (mainWindow) mainWindow.webContents.send('log', { level, msg, ts: new Date().toTimeString().split(' ')[0] });
  };
  const sendResult = row => { if (mainWindow) mainWindow.webContents.send('result', row); };
  const sendProgress = pct => {
    if (mainWindow) mainWindow.webContents.send('progress', { pct, found, downloaded, errors, totalBytes });
  };

  const allowedExts = new Set();
  if (config.typeImages) ['jpg','jpeg','png','webp','gif','svg','avif','bmp'].forEach(e => allowedExts.add(e));
  if (config.typeVideos) ['mp4','mov','webm','avi','mkv'].forEach(e => allowedExts.add(e));
  if (config.typeDocs)   ['pdf','docx','doc','xlsx','pptx'].forEach(e => allowedExts.add(e));
  if (config.typeAudio)  ['mp3','wav','ogg','flac','aac'].forEach(e => allowedExts.add(e));
  if (config.typeHtml)   ['html','htm'].forEach(e => allowedExts.add(e));
  if (config.typeCssJs)  ['css','js'].forEach(e => allowedExts.add(e));
  if (config.typeFonts)  ['woff','woff2','ttf','otf','eot'].forEach(e => allowedExts.add(e));
  if (config.typeAll)    allowedExts.clear();

  const outputDir = config.outputDir || require('os').homedir();
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const cookies = config.useCookies ? parseCookieString(config.cookies) : [];
  const cookieHeader = cookiesToHeader(cookies);
  const usePuppeteer = config.useCookies && cookies.length > 0;

  const contentHashes = new Set();

  async function processImageUrls(imgUrls) {
    for (const imgUrl of imgUrls) {
      if (!scrapeActive) return;
      while (scrapePaused) await new Promise(r => setTimeout(r, 500));
      if (downloaded >= config.maxFiles) {
        sendLog('INFO', `Max files limit (${config.maxFiles}) reached`);
        scrapeActive = false;
        return;
      }

      const ext = getFileExtension(imgUrl);
      if (allowedExts.size > 0 && !allowedExts.has(ext)) continue;

      // Skip tracking pixels and icons
      if (/emoji|1x1|pixel|blank\.|spacer\.|icon.*\.(png|gif)$/i.test(imgUrl)) continue;

      found++;
      fileIndex++;
      const rawName = path.basename(imgUrl.split('?')[0]) || `file_${fileIndex}.${ext}`;
      const filename = sanitizeFilename(rawName.includes('.') ? rawName : `${rawName}.${ext}`);
      const fileType = guessFileType(ext);

      sendResult({ status: 'downloading', filename, type: fileType, size: '—', date: '—', url: imgUrl });
      sendProgress(Math.min(99, (downloaded / config.maxFiles) * 100));

      try {
        const result = await downloadFile(imgUrl, outputDir, filename, cookieHeader);

        // Skip tiny files (tracking pixels)
        if (result.size < 3000) {
          try { fs.unlinkSync(result.filePath); } catch {}
          sendLog('SKIP', `Too small (tracking pixel): ${filename}`);
          found--;
          continue;
        }

        if (config.deduplicate) {
          const hash = `${result.size}_${filename}`;
          if (contentHashes.has(hash)) {
            try { fs.unlinkSync(result.filePath); } catch {}
            sendLog('SKIP', `Duplicate: ${filename}`);
            found--;
            continue;
          }
          contentHashes.add(hash);
        }

        downloaded++;
        totalBytes += result.size;
        scrapeResults.push({ filename, type: fileType, size: formatSize(result.size), date: result.date, url: imgUrl });
        sendResult({ status: 'ok', filename, type: fileType, size: formatSize(result.size), date: result.date, url: imgUrl });
        sendLog('OK', `Downloaded: ${filename} (${formatSize(result.size)})`);
        sendProgress(Math.min(99, (downloaded / config.maxFiles) * 100));

      } catch (err) {
        errors++;
        found--;
        sendResult({ status: 'error', filename, type: fileType, size: '—', date: '—', url: imgUrl });
        sendLog('ERR', `Failed: ${filename} — ${err.message}`);
      }

      if (config.delay > 0) await new Promise(r => setTimeout(r, config.delay * 1000));
    }
  }

  async function scrapePage(pageUrl, depth) {
    if (!scrapeActive) return;

    if (usePuppeteer) {
      // Puppeteer handles both discovery AND downloading internally
      await scrapeWithPuppeteer(pageUrl, cookies, config, outputDir, sendLog, async ({ filename, ext, size, url: imgUrl, filePath }) => {
        if (downloaded >= config.maxFiles) { scrapeActive = false; return; }

        const fileType = guessFileType(ext);
        found++;

        if (config.deduplicate) {
          const hash = `${size}_${filename}`;
          if (contentHashes.has(hash)) {
            try { fs.unlinkSync(filePath); } catch {}
            sendLog('SKIP', `Duplicate: ${filename}`);
            found--;
            return;
          }
          contentHashes.add(hash);
        }

        downloaded++;
        totalBytes += size;
        scrapeResults.push({ filename, type: fileType, size: formatSize(size), date: new Date().toISOString().split('T')[0], url: imgUrl });
        sendResult({ status: 'ok', filename, type: fileType, size: formatSize(size), date: new Date().toISOString().split('T')[0], url: imgUrl });
        sendLog('OK', `Downloaded: ${filename} (${formatSize(size)})`);
        sendProgress(Math.min(99, (downloaded / config.maxFiles) * 100));
      });

    } else {
      // Standard HTTP fetch for regular non-social sites
      sendLog('SCAN', `Fetching: ${pageUrl}`);
      let pageData;
      try {
        pageData = await fetchPage(pageUrl, (config.timeout || 10) * 1000, cookieHeader);
      } catch (err) {
        sendLog('ERR', `Failed to fetch: ${pageUrl} — ${err.message}`);
        return;
      }
      if (pageData.status !== 200) {
        sendLog('WARN', `HTTP ${pageData.status}: ${pageUrl}`);
        return;
      }
      const imgUrls = extractImageUrls(pageData.html, pageUrl);
      sendLog('SCAN', `Found ${imgUrls.length} asset URLs on page`);
      await processImageUrls(imgUrls);

      if (config.followLinks && depth < config.maxDepth) {
        const links = extractAllUrls(pageData.html, pageUrl);
        for (const link of links.slice(0, 20)) {
          if (!scrapeActive) return;
          await scrapePage(link, depth + 1);
        }
      }
    }
  }

  try {
    sendLog('START', `ROM Scraper v1.0 starting...`);
    sendLog('INFO', `Target: ${config.url}`);
    sendLog('INFO', `Output: ${outputDir}`);
    sendLog('INFO', `Mode: ${usePuppeteer ? '🌐 Puppeteer headless browser (JS rendering + cookies)' : '⚡ Standard HTTP fetch'}`);
    sendLog('INFO', `Max files: ${config.maxFiles} | Delay: ${config.delay}s | Depth: ${config.maxDepth}`);

    await scrapePage(config.url, 0);

    sendLog('DONE', `Complete. Downloaded: ${downloaded}, Errors: ${errors}, Total: ${formatSize(totalBytes)}`);
    sendProgress(100);
    if (mainWindow) mainWindow.webContents.send('scrape-complete', { downloaded, errors, totalBytes });
  } catch (err) {
    sendLog('ERR', `Scrape failed: ${err.message}`);
    if (mainWindow) mainWindow.webContents.send('scrape-complete', { downloaded, errors, totalBytes });
  }

  await closeBrowser();
  scrapeActive = false;
});

ipcMain.on('pause-scrape', () => { scrapePaused = !scrapePaused; });
ipcMain.on('stop-scrape',  () => { scrapeActive = false; scrapePaused = false; closeBrowser(); });
ipcMain.handle('get-results', () => scrapeResults);
