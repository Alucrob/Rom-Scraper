/* ═══════════════════════════════════════════════════
   INSTRUCTIONS PAGE — Rich text with collapsible sections
   ═══════════════════════════════════════════════════ */

const SECTIONS = [
  {
    title: 'Getting Started',
    open: true,
    content: `
      <div class="guide-steps">
        <div class="guide-step"><div class="step-num">1</div><div class="step-body"><div class="step-title">Choose a preset or enter a URL</div><div class="step-desc">Click a platform in the Scraper page sidebar to auto-fill settings, or type any URL directly.</div></div></div>
        <div class="guide-step"><div class="step-num">2</div><div class="step-body"><div class="step-title">Set your date range (optional)</div><div class="step-desc">Enter a year like <strong>2024</strong> or a date like <strong>2024-06-15</strong> to filter results.</div></div></div>
        <div class="guide-step"><div class="step-num">3</div><div class="step-body"><div class="step-title">Pick what to download</div><div class="step-desc">Check the content types you need. For gallery migrations, <strong>Images</strong> is usually all you need.</div></div></div>
        <div class="guide-step"><div class="step-num">4</div><div class="step-body"><div class="step-title">Choose your save folder</div><div class="step-desc">Click <strong>BROWSE</strong> to pick the output directory. Create a new folder per client.</div></div></div>
        <div class="guide-step"><div class="step-num">5</div><div class="step-body"><div class="step-title">Hit START SCRAPE</div><div class="step-desc">Watch the results and log. You can pause or stop at any time.</div></div></div>
      </div>`
  },
  {
    title: 'Social Media (Facebook, Instagram)',
    open: false,
    content: `
      <div class="guide-tip tip-purple"><strong>Use Session Cookies</strong> to unlock social media. Facebook and Instagram block scraping by default. Enable cookies in the Session Cookies card, paste your cookies, and it works as if you're logged in.</div>
      <div class="guide-tip tip-blue"><strong>Instagram tip:</strong> Set delay to 2+ seconds. Instagram rate-limits aggressively.</div>
      <div class="guide-tip"><strong>Facebook tip:</strong> Navigate to the page's Photos tab and copy that URL.</div>`
  },
  {
    title: 'Crawl Options Explained',
    open: false,
    content: `
      <div class="guide-setting"><div class="gs-name">Crawl Depth</div><div class="gs-val">0 = single page, 1-2 = full site</div><div class="gs-desc">Controls how many links deep the scraper follows. Higher numbers take much longer.</div></div>
      <div class="guide-setting"><div class="gs-name">Delay (seconds)</div><div class="gs-val">0.5s for most sites, 1-2s for social media</div><div class="gs-desc">Wait time between downloads. Prevents IP blocking.</div></div>
      <div class="guide-setting"><div class="gs-name">Max Files</div><div class="gs-val">Start at 50, increase as needed</div><div class="gs-desc">Hard stop after this many files. Prevents runaway downloads.</div></div>
      <div class="guide-setting"><div class="gs-name">Timeout</div><div class="gs-val">10-15 seconds</div><div class="gs-desc">How long to wait for a slow server before moving on.</div></div>`
  },
  {
    title: 'Stealth & ROMAGENT',
    open: false,
    content: `
      <div class="guide-tip tip-green"><strong>ROMAGENT Mode</strong> dynamically controls the 15 stealth methods. When enabled, the agent observes failures and automatically switches strategies.</div>
      <div class="guide-tip"><strong>Manual Mode:</strong> Toggle individual stealth methods in Settings &rarr; Stealth &amp; Anti-Blocking tab.</div>
      <div class="guide-tip tip-blue"><strong>Recommended for beginners:</strong> Enable ROMAGENT mode and let it handle everything automatically.</div>
      <div class="guide-setting"><div class="gs-name">How ROMAGENT works</div><div class="gs-desc">The agent monitors the activity log in real-time. When a request fails (403, 429, etc.), it automatically cycles to a different stealth method, re-attempts the request, and learns which methods work best for specific domains.</div></div>`
  },
  {
    title: 'Platform Notes',
    open: false,
    content: `
      <div class="platform-card"><div class="pc-name">Facebook</div><div class="pc-note">Blocks scraping by default. Enable Session Cookies. Use the Photos tab URL.</div><div class="pc-tag"><span class="badge purple">NEEDS COOKIES</span> <span class="badge green">PHOTOS TAB</span></div></div>
      <div class="platform-card"><div class="pc-name">Instagram</div><div class="pc-note">Enable Session Cookies. Set delay to 2+ seconds.</div><div class="pc-tag"><span class="badge purple">NEEDS COOKIES</span> <span class="badge blue">DELAY 2s+</span></div></div>
      <div class="platform-card"><div class="pc-name">WordPress</div><div class="pc-note">Most reliable. Enter gallery page URL. Set Crawl Depth to 1.</div><div class="pc-tag"><span class="badge green">RELIABLE</span> <span class="badge blue">DEPTH 1</span></div></div>
      <div class="platform-card"><div class="pc-name">Wix</div><div class="pc-note">Loads images via JS. Enable JS rendering mode or headless browser stealth method.</div><div class="pc-tag"><span class="badge red">NEEDS JS MODE</span></div></div>
      <div class="platform-card"><div class="pc-name">Squarespace</div><div class="pc-note">Works well on public portfolio and gallery pages.</div><div class="pc-tag"><span class="badge green">RELIABLE</span></div></div>
      <div class="platform-card"><div class="pc-name">Shopify</div><div class="pc-note">Use /collections/ or /products/ page URL.</div><div class="pc-tag"><span class="badge green">RELIABLE</span></div></div>`
  },
  {
    title: 'Activity Log Colors',
    open: false,
    content: `
      <div class="guide-tip tip-blue"><strong style="color:var(--info)">SCAN</strong> &mdash; Currently scanning a page for assets</div>
      <div class="guide-tip tip-green"><strong style="color:var(--success)">OK</strong> &mdash; File downloaded successfully</div>
      <div class="guide-tip" style="border-left-color:var(--warning)"><strong style="color:var(--warning)">WARN</strong> &mdash; Skipped or rate limited</div>
      <div class="guide-tip" style="border-left-color:var(--error)"><strong style="color:var(--error)">ERR</strong> &mdash; Failed to download</div>
      <div class="guide-tip" style="border-left-color:var(--agent)"><strong style="color:var(--agent)">AGENT</strong> &mdash; ROMAGENT action or decision</div>`
  },
];

function render(container) {
  container.innerHTML = `
<div class="page-enter" style="flex:1;overflow-y:auto;padding:24px 32px;max-width:800px;margin:0 auto;width:100%;">
  <div style="margin-bottom:24px;">
    <h1 style="font-size:20px;font-weight:700;color:var(--text-pri);margin-bottom:4px;">Instructions &amp; Guide</h1>
    <p style="font-size:12px;color:var(--text-sec);line-height:1.6;">Everything you need to know about using ROM Scraper v1.0.8 "AFJORD"</p>
  </div>
  <div id="guideSections"></div>
</div>`;

  const sectionsContainer = container.querySelector('#guideSections');

  SECTIONS.forEach((section, i) => {
    const el = document.createElement('div');
    el.className = 'guide-section';
    el.style.cssText = 'margin-bottom:8px;animation:fadeUp 0.3s ease both;animation-delay:' + (i * 0.05) + 's;';

    el.innerHTML = `
      <div class="guide-section-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all 200ms;">
        <svg class="guide-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 200ms;flex-shrink:0;${section.open ? 'transform:rotate(90deg);' : ''}"><path d="M9 18l6-6-6-6"/></svg>
        <span style="font-size:13px;font-weight:600;color:var(--text-pri);flex:1;">${section.title}</span>
        <span style="font-size:9px;color:var(--text-dim);letter-spacing:1px;font-family:var(--font-mono);">${i + 1}/${SECTIONS.length}</span>
      </div>
      <div class="guide-section-body" style="padding:16px;border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;background:var(--bg-panel);${section.open ? '' : 'display:none;'}">
        ${section.content}
      </div>`;

    const header = el.querySelector('.guide-section-header');
    const body = el.querySelector('.guide-section-body');
    const chevron = el.querySelector('.guide-chevron');

    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      chevron.style.transform = isOpen ? '' : 'rotate(90deg)';
      header.style.borderRadius = isOpen ? '8px' : '8px 8px 0 0';
    });

    if (section.open) header.style.borderRadius = '8px 8px 0 0';

    sectionsContainer.appendChild(el);
  });
}

// Add guide-specific styles
const guideStyles = document.createElement('style');
guideStyles.textContent = `
.guide-steps { display:flex;flex-direction:column;gap:10px; }
.guide-step { display:flex;gap:10px;padding:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px; }
.step-num { width:24px;height:24px;flex-shrink:0;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#1A1B1E; }
.step-body { flex:1; }
.step-title { font-size:12px;font-weight:600;color:var(--text-pri);margin-bottom:3px; }
.step-desc { font-size:11px;color:var(--text-sec);line-height:1.55; }

.guide-tip { background:var(--bg-card);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:5px;padding:9px 11px;margin-bottom:7px;font-size:11px;line-height:1.65;color:var(--text-sec); }
.guide-tip strong { color:var(--text-pri);font-weight:600; }
.guide-tip.tip-purple { border-left-color:var(--tip); }
.guide-tip.tip-green { border-left-color:var(--success); }
.guide-tip.tip-blue { border-left-color:var(--info); }

.guide-setting { padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
.gs-name { font-size:12px;font-weight:600;color:var(--text-pri); }
.gs-val { font-size:10px;color:var(--accent);letter-spacing:0.5px;margin:2px 0;font-family:var(--font-mono); }
.gs-desc { font-size:11px;color:var(--text-sec);line-height:1.6; }

.platform-card { background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:7px; }
.pc-name { font-size:12px;font-weight:600;color:var(--text-pri);margin-bottom:4px; }
.pc-note { font-size:11px;color:var(--text-sec);line-height:1.55; }
.pc-tag { margin-top:5px; }
`;
document.head.appendChild(guideStyles);

window.InstructionsPage = { render };
