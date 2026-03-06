/* ═══════════════════════════════════════════════════
   SCRAPER PAGE — Main scraping interface
   ═══════════════════════════════════════════════════ */

const PRESETS = [
  { name: 'Facebook',    icon: 'f',  url: 'https://www.facebook.com/[page]/photos', selector: 'img[src*="fbcdn"]',           notes: 'Public pages. Go to Photos tab.' },
  { name: 'Instagram',   icon: 'in', url: 'https://www.instagram.com/[username]/',  selector: 'img._aagt',                   notes: 'Public profiles. Set delay 2s+.' },
  { name: 'Twitter / X', icon: 'x',  url: 'https://twitter.com/[user]/media',       selector: 'img[src*="media"]',           notes: 'Use /media tab URL.' },
  { name: 'Pinterest',   icon: 'p',  url: 'https://www.pinterest.com/[user]/[board]/', selector: 'img.GrowthUnauthPinImage', notes: 'Public boards.' },
  { name: 'Flickr',      icon: 'fl', url: 'https://www.flickr.com/photos/[user]/',  selector: 'img.photo-list-photo-img',    notes: 'Excellent photo structure.' },
  { name: 'Tumblr',      icon: 't',  url: 'https://[blog].tumblr.com',              selector: 'img.photo-img',               notes: 'Photo-type posts.' },
  { name: 'Reddit',      icon: 'r',  url: 'https://www.reddit.com/r/[subreddit]/',  selector: 'img.media-element',           notes: 'Gallery posts.' },
  { name: 'Squarespace', icon: 'sq', url: 'https://[site].squarespace.com',         selector: 'img.loaded',                  notes: 'Gallery & portfolio pages.' },
  { name: 'WordPress',   icon: 'wp', url: 'https://[site].com',                     selector: 'img.wp-post-image',           notes: 'Most client sites. Depth 1.' },
  { name: 'Wix',         icon: 'wx', url: 'https://[site].wixsite.com/[name]',      selector: 'img.WixExpIm',                notes: 'Enable JS mode for full results.' },
  { name: 'Shopify',     icon: 'sh', url: 'https://[store].myshopify.com',          selector: 'img.product__image',          notes: 'Product & collection pages.' },
  { name: 'Custom URL',  icon: '+',  url: '',                                        selector: '',                            notes: 'Any custom URL.' },
];

let activePreset = -1;

function selectPreset(i) {
  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
  const items = document.querySelectorAll('.preset-item');
  if (items[i]) items[i].classList.add('active');
  activePreset = i;
  const p = PRESETS[i];
  if (p.url) document.getElementById('urlInput').value = p.url;
  if (p.selector) document.getElementById('selectorInput').value = p.selector;
  window.ActivityLog.addLog('PRESET', `Preset loaded: ${p.name} -- ${p.notes}`, 'lvl-preset');
}

function buildPresets(container) {
  container.innerHTML = '';
  PRESETS.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'preset-item';
    el.style.animationDelay = (i * 0.05) + 's';
    el.dataset.index = i;
    el.innerHTML = `<div class="preset-icon">${p.icon}</div><span class="preset-name">${p.name}</span>`;
    el.addEventListener('click', () => selectPreset(i));
    container.appendChild(el);
  });
}

function toggleCT(el) {
  el.classList.toggle('on');
  el.querySelector('.chk').textContent = el.classList.contains('on') ? '\u2713' : '';
}

function toggleFlag(el) { el.classList.toggle('on'); }

function toggleCookiesPanel() {
  const on = document.getElementById('flagCookies').classList.contains('on');
  document.getElementById('cookiesPanel').style.display = on ? 'block' : 'none';
}

function toggleSpoofPanel() {
  const on = document.getElementById('flagSpoofUA').classList.contains('on');
  document.getElementById('spoofPanel').style.display = on ? 'block' : 'none';
}

function switchCookieFields() {
  const p = document.getElementById('cookiePlatform').value;
  document.querySelectorAll('.cookie-fields').forEach(f => f.style.display = 'none');
  const el = document.getElementById('cookieFields-' + p);
  if (el) el.style.display = 'block';
}

function addCustomRow() {
  const container = document.getElementById('customCookieRows');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'cookie-field-row custom-row';
  row.innerHTML = `
    <input class="inp" style="width:120px;flex-shrink:0;font-size:11px" placeholder="cookie name" spellcheck="false">
    <span style="color:var(--text-dim);padding:0 6px;font-size:13px;align-self:center">=</span>
    <input class="inp" style="flex:1;font-size:11px" placeholder="cookie value" spellcheck="false">
    <button class="remove-custom-row" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;padding:0 4px;align-self:center">&times;</button>`;
  row.querySelector('.remove-custom-row').addEventListener('click', () => {
    const rows = container.querySelectorAll('.custom-row');
    if (rows.length > 1) row.remove();
  });
  container.appendChild(row);
}

function buildCookieString() {
  const p = document.getElementById('cookiePlatform')?.value;
  const pairs = [];
  if (p === 'custom') {
    document.querySelectorAll('#customCookieRows .custom-row').forEach(row => {
      const inputs = row.querySelectorAll('input');
      const k = inputs[0].value.trim();
      const v = inputs[1].value.trim();
      if (k && v) pairs.push(`${k}=${v}`);
    });
  } else {
    document.querySelectorAll(`#cookieFields-${p} .cookie-val`).forEach(inp => {
      const v = inp.value.trim();
      if (v) pairs.push(`${inp.dataset.key}=${v}`);
    });
  }
  return pairs.join('; ');
}

const COOKIE_GUIDES = {
  facebook: `<div style="font-size:11px;color:var(--text-sec);line-height:1.8"><div style="color:var(--text-pri);font-weight:700;margin-bottom:10px">How to find each value in Chrome</div><div style="background:var(--bg-input);border-radius:6px;padding:12px;margin-bottom:12px"><div>1. Go to <strong>facebook.com</strong> in Chrome while logged in</div><div>2. Press <strong>F12</strong> to open DevTools</div><div>3. Click the <strong>Application</strong> tab at the top</div><div>4. Expand <strong>Cookies</strong> &rarr; click <strong>https://www.facebook.com</strong></div><div>5. Copy each cookie's <strong>Value</strong> column</div></div><div style="color:var(--warning);font-size:10px">Keep these values private &mdash; they act like a temporary password.</div></div>`,
  instagram: `<div style="font-size:11px;color:var(--text-sec);line-height:1.8"><div style="color:var(--text-pri);font-weight:700;margin-bottom:10px">How to find each value in Chrome</div><div style="background:var(--bg-input);border-radius:6px;padding:12px"><div>1. Go to <strong>instagram.com</strong> in Chrome while logged in</div><div>2. Press <strong>F12</strong> &rarr; <strong>Application</strong> tab</div><div>3. <strong>Cookies &rarr; https://www.instagram.com</strong></div><div>4. Find and copy each value</div><div style="margin-top:10px;color:var(--warning)">Set Delay to 2+ seconds.</div></div></div>`,
  twitter: `<div style="font-size:11px;color:var(--text-sec);line-height:1.8"><div style="color:var(--text-pri);font-weight:700;margin-bottom:10px">How to find each value in Chrome</div><div style="background:var(--bg-input);border-radius:6px;padding:12px"><div>1. Go to <strong>twitter.com</strong> while logged in</div><div>2. Press <strong>F12</strong> &rarr; <strong>Application</strong> tab</div><div>3. <strong>Cookies &rarr; https://twitter.com</strong></div><div>4. Copy each value</div></div></div>`,
  custom: `<div style="font-size:11px;color:var(--text-sec);line-height:1.8"><div style="background:var(--bg-input);border-radius:6px;padding:12px"><div>1. Open the target site in Chrome and log in</div><div>2. Press <strong>F12</strong> &rarr; <strong>Application</strong> tab</div><div>3. Expand <strong>Cookies</strong> &rarr; click your site's domain</div><div>4. Copy relevant session/auth cookies</div></div></div>`
};

function showCookieGuide() {
  const p = document.getElementById('cookiePlatform')?.value || 'custom';
  document.getElementById('cookieGuideContent').innerHTML = COOKIE_GUIDES[p] || COOKIE_GUIDES.custom;
  document.getElementById('cookieGuideModal').style.display = 'flex';
}

function hideCookieGuide() {
  document.getElementById('cookieGuideModal').style.display = 'none';
}

function getConfig() {
  const ct = t => document.querySelector(`.ct-item[data-type="${t}"]`)?.classList.contains('on');
  return {
    url:          document.getElementById('urlInput')?.value.trim(),
    dateFrom:     document.getElementById('dateFrom')?.value.trim(),
    dateTo:       document.getElementById('dateTo')?.value.trim(),
    selector:     document.getElementById('selectorInput')?.value.trim(),
    outputDir:    document.getElementById('outputDir')?.value.trim(),
    maxDepth:     parseInt(document.getElementById('maxDepth')?.value) || 0,
    delay:        parseFloat(document.getElementById('delay')?.value) || 0.5,
    maxFiles:     parseInt(document.getElementById('maxFiles')?.value) || 200,
    timeout:      parseInt(document.getElementById('timeout')?.value) || 10,
    followLinks:  document.getElementById('flagFollowLinks')?.classList.contains('on'),
    respectRobots:document.getElementById('flagRobots')?.classList.contains('on'),
    jsMode:       document.getElementById('flagJS')?.classList.contains('on'),
    deduplicate:  document.getElementById('flagDedup')?.classList.contains('on'),
    preserveDir:  document.getElementById('flagStructure')?.classList.contains('on'),
    metadata:     document.getElementById('flagMeta')?.classList.contains('on'),
    typeImages:   ct('images'),
    typeVideos:   ct('videos'),
    typeDocs:     ct('docs'),
    typeAudio:    ct('audio'),
    typeHtml:     ct('html'),
    typeCssJs:    ct('cssjs'),
    typeFonts:    ct('fonts'),
    typeAll:      ct('all'),
    useCookies:   document.getElementById('flagCookies')?.classList.contains('on'),
    enableBrowserSpoofing: document.getElementById('flagSpoofUA')?.classList.contains('on'),
    browserSpoofProfile: document.getElementById('browserSpoofProfile')?.value,
    cookies:      buildCookieString(),
  };
}

/* ── Scraping controls ── */
let paused = false;
let elapsedTimer = null;
let elapsed = 0;

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

function setStatus(txt, active = false, error = false) {
  const statusTxt = document.getElementById('statusTxt');
  const dot = document.getElementById('statusDot');
  if (statusTxt) statusTxt.textContent = txt;
  if (dot) dot.className = 'status-dot' + (active ? ' active' : '') + (error ? ' error' : '');
}

function updateStats({ found = 0, downloaded = 0, errors = 0, totalBytes = 0, pct = 0 } = {}) {
  const el = id => document.getElementById(id);
  if (el('statFound')) el('statFound').textContent = found;
  if (el('statDL'))    el('statDL').textContent = downloaded;
  if (el('statErr'))   el('statErr').textContent = errors;
  if (el('statSize'))  el('statSize').textContent = formatBytes(totalBytes);
  if (el('progFill'))  el('progFill').style.width = pct + '%';
}

async function startScrape() {
  const { addLog } = window.ActivityLog;
  const cfg = getConfig();
  if (!cfg.url || cfg.url.length < 4) { addLog('ERR', 'Please enter a valid URL.', 'lvl-err'); return; }
  if (!cfg.outputDir) { addLog('ERR', 'Please set an output directory.', 'lvl-err'); return; }

  window.ResultsTable.clearResults();
  document.getElementById('scrapeBtn').disabled = true;
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('stopBtn').disabled = false;
  setStatus('SCANNING', true);
  updateStats();

  elapsed = 0;
  elapsedTimer = setInterval(() => {
    elapsed++;
    const m = String(Math.floor(elapsed/60)).padStart(2, '0');
    const s = String(elapsed%60).padStart(2, '0');
    const el = document.getElementById('statElapsed');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);

  addLog('START', `Starting scrape: ${cfg.url}`, 'lvl-start');
  await window.romAPI.startScrape(cfg);
}

function pauseScrape() {
  const { addLog } = window.ActivityLog;
  paused = !paused;
  window.romAPI.pauseScrape();
  const btn = document.getElementById('pauseBtn');
  if (btn) btn.textContent = paused ? 'RESUME' : 'PAUSE';
  setStatus(paused ? 'PAUSED' : 'SCANNING', !paused);
  addLog('INFO', paused ? 'Scrape paused.' : 'Scrape resumed.', 'lvl-info');
}

function stopScrape() {
  window.romAPI.stopScrape();
  finishUp(true);
}

function finishUp(stopped = false) {
  clearInterval(elapsedTimer);
  paused = false;
  const el = id => document.getElementById(id);
  if (el('scrapeBtn')) el('scrapeBtn').disabled = false;
  if (el('pauseBtn'))  { el('pauseBtn').disabled = true; el('pauseBtn').textContent = 'PAUSE'; }
  if (el('stopBtn'))   el('stopBtn').disabled = true;
  setStatus(stopped ? 'STOPPED' : 'DONE');
}

async function browseDir() {
  const dir = await window.romAPI.browseDirectory();
  if (dir) document.getElementById('outputDir').value = dir;
}

function openOutputFolder() {
  const dir = document.getElementById('outputDir')?.value;
  if (dir) window.romAPI.openFolder(dir);
}

/* ── Render ── */
function render(container) {
  container.innerHTML = `
<div class="page-enter" style="flex:1;display:grid;grid-template-columns:190px 1fr 1fr;overflow:hidden;">

  <!-- LEFT — Presets -->
  <div style="background:var(--bg-panel);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;">
    <div style="padding:14px 14px 10px;font-size:9px;letter-spacing:3px;color:var(--accent);text-transform:uppercase;font-weight:700;border-bottom:1px solid var(--border);flex-shrink:0;font-family:var(--font-mono);">Platform Presets</div>
    <div style="overflow-y:auto;flex:1;" id="presetList"></div>
    <div style="padding:10px 12px;border-top:1px solid var(--border);font-size:8px;color:var(--text-dim);letter-spacing:1px;line-height:1.7;text-align:center;flex-shrink:0;font-family:var(--font-mono);" id="sbFooter">ROM SCRAPER v1.0.8<br>&copy; 2026 All rights reserved</div>
  </div>

  <!-- CENTER — Config -->
  <div style="border-right:1px solid var(--border);overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;">

    <!-- URL Card -->
    <div class="card">
      <div class="card-hdr">Target URL</div>
      <label class="field-lbl">URL or Domain</label>
      <div class="url-wrap">
        <input class="inp url-inp" id="urlInput" type="url" placeholder="https://example.com/gallery  or  facebook.com/page/photos">
      </div>
      <div class="date-row">
        <div><label class="field-lbl">Date From</label><input class="inp" id="dateFrom" type="text" placeholder="2024  or  2024-01-15"></div>
        <div class="date-arrow">&rarr;</div>
        <div><label class="field-lbl">Date To</label><input class="inp" id="dateTo" type="text" placeholder="2026  or  2026-12-31"></div>
      </div>
      <div style="margin-top:11px">
        <label class="field-lbl">CSS Selector <span style="color:var(--text-dim)">(optional)</span></label>
        <input class="inp" id="selectorInput" type="text" placeholder="img.gallery-photo  or  leave blank for all">
      </div>
    </div>

    <!-- Content Types -->
    <div class="card">
      <div class="card-hdr">Content Types</div>
      <div class="ct-grid" id="ctGrid">
        <div class="ct-item on" data-type="images"><div class="chk">&check;</div>Images &mdash; JPG, PNG, WEBP, GIF, SVG</div>
        <div class="ct-item" data-type="videos"><div class="chk"></div>Videos &mdash; MP4, MOV, WEBM, AVI</div>
        <div class="ct-item" data-type="docs"><div class="chk"></div>Documents &mdash; PDF, DOCX, XLSX</div>
        <div class="ct-item" data-type="audio"><div class="chk"></div>Audio &mdash; MP3, WAV, OGG, FLAC</div>
        <div class="ct-item" data-type="html"><div class="chk"></div>HTML Source Pages</div>
        <div class="ct-item" data-type="cssjs"><div class="chk"></div>CSS &amp; JavaScript Assets</div>
        <div class="ct-item" data-type="fonts"><div class="chk"></div>Fonts &mdash; WOFF, WOFF2, TTF, OTF</div>
        <div class="ct-item" data-type="all"><div class="chk"></div>All Files (wildcard)</div>
      </div>
    </div>

    <!-- Crawl Options -->
    <div class="card">
      <div class="card-hdr">Crawl Options</div>
      <div class="opts-grid">
        <div class="spin-grp"><label class="field-lbl">Crawl Depth</label><input class="spin-inp" id="maxDepth" type="number" value="0" min="0" max="5"></div>
        <div class="spin-grp"><label class="field-lbl">Delay (sec)</label><input class="spin-inp" id="delay" type="number" value="0.5" min="0" max="30" step="0.1"></div>
        <div class="spin-grp"><label class="field-lbl">Max Files</label><input class="spin-inp" id="maxFiles" type="number" value="200" min="1" max="10000"></div>
        <div class="spin-grp"><label class="field-lbl">Timeout (sec)</label><input class="spin-inp" id="timeout" type="number" value="10" min="5" max="60"></div>
      </div>
      <div class="flags-grid">
        <div class="flag-item" id="flagFollowLinks"><div class="toggle"></div><span>Follow same-domain links</span></div>
        <div class="flag-item on" id="flagRobots"><div class="toggle"></div><span>Respect robots.txt</span></div>
        <div class="flag-item" id="flagJS"><div class="toggle"></div><span>JS rendering mode</span></div>
        <div class="flag-item on" id="flagDedup"><div class="toggle"></div><span>Deduplicate files</span></div>
        <div class="flag-item on" id="flagStructure"><div class="toggle"></div><span>Preserve directory structure</span></div>
        <div class="flag-item" id="flagMeta"><div class="toggle"></div><span>Save metadata sidecar</span></div>
      </div>
    </div>

    <!-- Output -->
    <div class="card">
      <div class="card-hdr">Output</div>
      <label class="field-lbl">Save Directory</label>
      <div class="out-row">
        <input class="inp" id="outputDir" type="text" placeholder="C:\\Users\\YourName\\Downloads\\rom_scraper">
        <button class="btn btn-secondary" id="browseDirBtn">BROWSE</button>
      </div>
      <div style="margin-top:10px">
        <label class="field-lbl">Filename Pattern <span style="color:var(--text-dim)">(blank = originals)</span></label>
        <input class="inp" id="filenamePattern" type="text" placeholder="{domain}_{date}_{index}{ext}">
      </div>
    </div>

    <!-- Session Cookies -->
    <div class="card">
      <div class="card-hdr">Session Cookies <span style="color:var(--text-dim);font-size:9px;letter-spacing:1px;font-weight:400">&mdash; FOR SOCIAL MEDIA &amp; PRIVATE SITES</span></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <div class="flag-item" id="flagCookies" style="flex-shrink:0"><div class="toggle"></div><span>Use session cookies</span></div>
        <div class="flag-item" id="flagSpoofUA" style="flex-shrink:0"><div class="toggle"></div><span>Enable browser spoofing</span></div>
        <div style="font-size:10px;color:var(--text-dim);line-height:1.5">Scrape as a logged-in user</div>
      </div>
      <div id="spoofPanel" style="display:none;margin-bottom:12px">
        <label class="field-lbl">Spoofed Browser Profile</label>
        <select class="inp" id="browserSpoofProfile" style="cursor:pointer;background:var(--bg-input)">
          <option value="chrome_windows">Chrome (Windows)</option>
          <option value="edge_windows">Edge (Windows)</option>
          <option value="firefox_windows">Firefox (Windows)</option>
          <option value="chrome_mac">Chrome (macOS)</option>
          <option value="safari_mac">Safari (macOS)</option>
          <option value="mobile_safari_iphone">Safari (iPhone)</option>
        </select>
      </div>
      <div id="cookiesPanel" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div><label class="field-lbl">Platform</label><select class="inp" id="cookiePlatform" style="cursor:pointer;background:var(--bg-input)"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="twitter">Twitter / X</option><option value="custom">Custom / Other</option></select></div>
          <div><label class="field-lbl">Step-by-step</label><button class="btn btn-secondary" style="width:100%;font-size:9px;padding:8px" id="cookieGuideBtn">HOW TO GET COOKIES</button></div>
        </div>
        <div id="cookieFields-facebook" class="cookie-fields">
          <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;margin-bottom:8px;font-family:var(--font-mono)">PASTE FROM: Chrome &rarr; F12 &rarr; Application &rarr; Cookies</div>
          <div class="cookie-field-row"><span class="cookie-key">c_user</span><input class="inp cookie-val" data-key="c_user" placeholder="Your Facebook user ID" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">xs</span><input class="inp cookie-val" data-key="xs" placeholder="Session token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">datr</span><input class="inp cookie-val" data-key="datr" placeholder="Device token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">fr</span><input class="inp cookie-val" data-key="fr" placeholder="Tracking token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">sb</span><input class="inp cookie-val" data-key="sb" placeholder="Browser token (optional)" spellcheck="false"></div>
        </div>
        <div id="cookieFields-instagram" class="cookie-fields" style="display:none">
          <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;margin-bottom:8px;font-family:var(--font-mono)">PASTE FROM: Chrome &rarr; F12 &rarr; Application &rarr; Cookies</div>
          <div class="cookie-field-row"><span class="cookie-key">sessionid</span><input class="inp cookie-val" data-key="sessionid" placeholder="Your session ID" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">csrftoken</span><input class="inp cookie-val" data-key="csrftoken" placeholder="CSRF token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">ds_user_id</span><input class="inp cookie-val" data-key="ds_user_id" placeholder="Your user ID" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">ig_did</span><input class="inp cookie-val" data-key="ig_did" placeholder="Device ID (optional)" spellcheck="false"></div>
        </div>
        <div id="cookieFields-twitter" class="cookie-fields" style="display:none">
          <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;margin-bottom:8px;font-family:var(--font-mono)">PASTE FROM: Chrome &rarr; F12 &rarr; Application &rarr; Cookies</div>
          <div class="cookie-field-row"><span class="cookie-key">auth_token</span><input class="inp cookie-val" data-key="auth_token" placeholder="Auth token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">ct0</span><input class="inp cookie-val" data-key="ct0" placeholder="CSRF token" spellcheck="false"></div>
          <div class="cookie-field-row"><span class="cookie-key">twid</span><input class="inp cookie-val" data-key="twid" placeholder="User ID" spellcheck="false"></div>
        </div>
        <div id="cookieFields-custom" class="cookie-fields" style="display:none">
          <div style="font-size:9px;color:var(--text-dim);letter-spacing:1px;margin-bottom:8px;font-family:var(--font-mono)">ADD CUSTOM COOKIE KEY/VALUE PAIRS</div>
          <div id="customCookieRows">
            <div class="cookie-field-row custom-row">
              <input class="inp" style="width:120px;flex-shrink:0;font-size:11px" placeholder="cookie name" spellcheck="false">
              <span style="color:var(--text-dim);padding:0 6px;font-size:13px;align-self:center">=</span>
              <input class="inp" style="flex:1;font-size:11px" placeholder="cookie value" spellcheck="false">
              <button class="remove-custom-row" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;padding:0 4px;align-self:center">&times;</button>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="addCustomCookieBtn" style="margin-top:8px">+ ADD ANOTHER COOKIE</button>
        </div>
        <div id="cookieStatus" style="margin-top:8px;font-size:10px;line-height:1.6"></div>
      </div>
    </div>

    <!-- Cookie Guide Modal -->
    <div id="cookieGuideModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:var(--bg-card);border:1px solid var(--border-lt);border-radius:10px;padding:24px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-size:10px;letter-spacing:3px;color:var(--accent);font-weight:700;text-transform:uppercase;font-family:var(--font-mono)">How to Copy Your Cookies</div>
          <button id="closeCookieGuide" style="background:none;border:none;color:var(--text-sec);font-size:18px;cursor:pointer;padding:0 4px">&times;</button>
        </div>
        <div id="cookieGuideContent"></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <button class="btn btn-primary" id="scrapeBtn">START SCRAPE</button>
      <button class="btn btn-secondary" id="pauseBtn" disabled>PAUSE</button>
      <button class="btn btn-danger" id="stopBtn" disabled>STOP</button>
    </div>
    <div style="height:6px"></div>
  </div>

  <!-- RIGHT — Results + Log -->
  <div style="display:flex;flex-direction:column;overflow:hidden;">
    <div style="flex:1;display:flex;flex-direction:column;border-bottom:1px solid var(--border);overflow:hidden;">
      <div class="panel-hdr">
        <div class="panel-title">Results</div>
        <div class="panel-actions">
          <button class="panel-btn" id="exportCsvBtn">CSV</button>
          <button class="panel-btn" id="exportJsonBtn">JSON</button>
          <button class="panel-btn" id="clearResultsBtn">CLEAR</button>
        </div>
      </div>
      <div class="results-table">
        <table><thead><tr>
          <th style="width:26px">&bull;</th><th>Filename</th><th style="width:55px">Type</th>
          <th style="width:65px">Size</th><th style="width:85px">Date</th><th>Source URL</th>
        </tr></thead><tbody id="resultsBody"></tbody></table>
      </div>
    </div>
    <div style="height:210px;display:flex;flex-direction:column;overflow:hidden;">
      <div class="panel-hdr">
        <div class="panel-title">Activity Log</div>
        <div class="panel-actions">
          <button class="panel-btn" id="clearLogBtn">CLEAR</button>
          <button class="panel-btn" id="saveLogBtn">SAVE LOG</button>
        </div>
      </div>
      <div class="log-body" id="logBody"></div>
    </div>
  </div>
</div>`;

  // Bind events
  buildPresets(document.getElementById('presetList'));

  // Content type toggles
  document.querySelectorAll('.ct-item').forEach(el => {
    el.addEventListener('click', () => toggleCT(el));
  });

  // Flag toggles
  document.querySelectorAll('.flag-item').forEach(el => {
    el.addEventListener('click', () => {
      toggleFlag(el);
      if (el.id === 'flagCookies') toggleCookiesPanel();
      if (el.id === 'flagSpoofUA') toggleSpoofPanel();
    });
  });

  // Cookie platform switching
  document.getElementById('cookiePlatform')?.addEventListener('change', switchCookieFields);

  // Buttons
  document.getElementById('browseDirBtn')?.addEventListener('click', browseDir);
  document.getElementById('scrapeBtn')?.addEventListener('click', startScrape);
  document.getElementById('pauseBtn')?.addEventListener('click', pauseScrape);
  document.getElementById('stopBtn')?.addEventListener('click', stopScrape);
  document.getElementById('exportCsvBtn')?.addEventListener('click', window.ResultsTable.exportCSV);
  document.getElementById('exportJsonBtn')?.addEventListener('click', window.ResultsTable.exportJSON);
  document.getElementById('clearResultsBtn')?.addEventListener('click', window.ResultsTable.clearResults);
  document.getElementById('clearLogBtn')?.addEventListener('click', window.ActivityLog.clearLog);
  document.getElementById('saveLogBtn')?.addEventListener('click', window.ActivityLog.saveLog);
  document.getElementById('cookieGuideBtn')?.addEventListener('click', showCookieGuide);
  document.getElementById('closeCookieGuide')?.addEventListener('click', hideCookieGuide);
  document.getElementById('addCustomCookieBtn')?.addEventListener('click', addCustomRow);

  // First custom row remove button
  document.querySelector('.remove-custom-row')?.addEventListener('click', function() {
    const rows = document.querySelectorAll('#customCookieRows .custom-row');
    if (rows.length > 1) this.closest('.custom-row').remove();
  });
}

window.ScraperPage = { render, getConfig, finishUp, setStatus, updateStats, formatBytes, openOutputFolder, selectPreset };
