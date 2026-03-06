/* ═══════════════════════════════════════════════════
   SETTINGS PAGE — Dashboard with Stealth Module Cards
   ═══════════════════════════════════════════════════ */

let stealthConfig = null;
let agentMode = false;

function loadStealthConfig() {
  if (stealthConfig) return stealthConfig;
  // Deep-clone the embedded defaults
  stealthConfig = JSON.parse(JSON.stringify(window._stealthDefaults || {}));
  agentMode = stealthConfig.agentMode || false;
  return stealthConfig;
}

function getStealthConfig() {
  return stealthConfig;
}

function setMethodEnabled(methodId, enabled) {
  if (stealthConfig && stealthConfig.methods[methodId]) {
    stealthConfig.methods[methodId].enabled = enabled;
  }
  // Notify main process
  if (window.romAPI && window.romAPI.updateStealthConfig) {
    window.romAPI.updateStealthConfig(stealthConfig);
  }
}

function setAgentMode(enabled) {
  agentMode = enabled;
  if (stealthConfig) stealthConfig.agentMode = enabled;

  // Toggle all module cards disabled state
  document.querySelectorAll('.module-card').forEach(card => {
    if (enabled) {
      card.classList.add('disabled');
    } else {
      card.classList.remove('disabled');
    }
  });

  // Toggle agent banner
  const banner = document.getElementById('agentBanner');
  if (banner) banner.classList.toggle('visible', enabled);

  if (window.romAPI && window.romAPI.updateStealthConfig) {
    window.romAPI.updateStealthConfig(stealthConfig);
  }
}

function renderStealthTab(container) {
  const cfg = loadStealthConfig();
  const methods = cfg.methods || {};

  container.innerHTML = '';

  // Agent mode toggle
  const agentSection = document.createElement('div');
  agentSection.style.cssText = 'margin-bottom:20px;';
  agentSection.innerHTML = `
    <div class="agent-banner ${agentMode ? 'visible' : ''}" id="agentBanner">
      <div class="agent-banner-icon">&#x1F916;</div>
      <div class="agent-banner-text">
        <div class="agent-banner-title">ROMAGENT Active</div>
        <div class="agent-banner-desc">The agent is dynamically controlling all stealth methods. Manual toggles are disabled.</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
      <div class="toggle-wrap ${agentMode ? 'on' : ''}" id="agentModeToggle">
        <div class="toggle ${agentMode ? 'on' : ''}"></div>
        <span style="font-weight:600;letter-spacing:0.5px;">ROMAGENT Mode</span>
      </div>
      <span style="font-size:10px;color:var(--text-dim);">When enabled, the agent dynamically controls all stealth methods</span>
    </div>`;
  container.appendChild(agentSection);

  const agentToggle = agentSection.querySelector('#agentModeToggle');
  agentToggle.addEventListener('click', () => {
    const isOn = agentToggle.classList.toggle('on');
    agentToggle.querySelector('.toggle').classList.toggle('on', isOn);
    setAgentMode(isOn);
  });

  // Module cards grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

  Object.entries(methods).forEach(([id, mod]) => {
    const card = window.ModuleCard.create(
      { id, name: mod.name, desc: mod.desc, icon: mod.icon, enabled: mod.enabled },
      {
        disabled: agentMode,
        onToggle: (methodId, enabled) => setMethodEnabled(methodId, enabled),
        onGear: (methodId) => {
          window.ActivityLog.addLog('INFO', `Opening settings for: ${methods[methodId]?.name || methodId}`, 'lvl-info');
        },
      }
    );
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderGeneralTab(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card">
        <div class="card-hdr">Application</div>
        <div class="flags-grid">
          <div class="flag-item on" id="settAutoUpdate"><div class="toggle"></div><span>Auto-check for updates</span></div>
          <div class="flag-item on" id="settMinimizeTray"><div class="toggle"></div><span>Minimize to system tray</span></div>
          <div class="flag-item" id="settDevTools"><div class="toggle"></div><span>Show DevTools on launch</span></div>
          <div class="flag-item on" id="settSounds"><div class="toggle"></div><span>Play notification sounds</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Default Scraper Settings</div>
        <div class="opts-grid">
          <div class="spin-grp"><label class="field-lbl">Default Depth</label><input class="spin-inp" type="number" value="0" min="0" max="5"></div>
          <div class="spin-grp"><label class="field-lbl">Default Delay</label><input class="spin-inp" type="number" value="0.5" min="0" max="30" step="0.1"></div>
          <div class="spin-grp"><label class="field-lbl">Default Max Files</label><input class="spin-inp" type="number" value="200" min="1" max="10000"></div>
          <div class="spin-grp"><label class="field-lbl">Default Timeout</label><input class="spin-inp" type="number" value="10" min="5" max="60"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Data</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm">CLEAR LOG HISTORY</button>
          <button class="btn btn-secondary btn-sm">RESET ALL SETTINGS</button>
        </div>
      </div>
    </div>`;

  // Bind toggles
  container.querySelectorAll('.flag-item').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('on'));
  });
}

function renderConnectionTab(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card">
        <div class="card-hdr">Proxy Configuration</div>
        <div style="margin-bottom:12px;">
          <div class="flag-item" id="settProxy"><div class="toggle"></div><span>Enable proxy</span></div>
        </div>
        <div id="proxyFields" style="display:flex;flex-direction:column;gap:8px;opacity:0.4;">
          <div><label class="field-lbl">Proxy Type</label>
            <select class="inp" style="cursor:pointer;background:var(--bg-input)">
              <option value="http">HTTP</option>
              <option value="socks5">SOCKS5</option>
              <option value="rotating">Rotating (API)</option>
            </select>
          </div>
          <div><label class="field-lbl">Proxy Host</label><input class="inp" type="text" placeholder="proxy.example.com:8080"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label class="field-lbl">Username</label><input class="inp" type="text" placeholder="(optional)"></div>
            <div><label class="field-lbl">Password</label><input class="inp" type="password" placeholder="(optional)"></div>
          </div>
          <button class="btn btn-secondary btn-sm" style="align-self:flex-start;">TEST CONNECTION</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Captcha Solver API</div>
        <div><label class="field-lbl">Service</label>
          <select class="inp" style="cursor:pointer;background:var(--bg-input)">
            <option value="none">None (disabled)</option>
            <option value="2captcha">2Captcha</option>
            <option value="anticaptcha">Anti-Captcha</option>
          </select>
        </div>
        <div style="margin-top:8px;"><label class="field-lbl">API Key</label><input class="inp" type="password" placeholder="Enter your API key"></div>
      </div>
      <div class="card">
        <div class="card-hdr">Rate Limiting</div>
        <div class="opts-grid" style="grid-template-columns:1fr 1fr;">
          <div class="spin-grp"><label class="field-lbl">Max Concurrent</label><input class="spin-inp" type="number" value="3" min="1" max="20"></div>
          <div class="spin-grp"><label class="field-lbl">Requests/min</label><input class="spin-inp" type="number" value="30" min="1" max="200"></div>
        </div>
      </div>
    </div>`;

  // Proxy toggle
  const proxyToggle = container.querySelector('#settProxy');
  const proxyFields = container.querySelector('#proxyFields');
  if (proxyToggle) {
    proxyToggle.addEventListener('click', () => {
      proxyToggle.classList.toggle('on');
      proxyFields.style.opacity = proxyToggle.classList.contains('on') ? '1' : '0.4';
      proxyFields.style.pointerEvents = proxyToggle.classList.contains('on') ? 'auto' : 'none';
    });
  }
}

function render(container) {
  container.innerHTML = `
<div class="page-enter" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
  <div class="settings-tabs">
    <div class="settings-tab active" data-tab="general">General</div>
    <div class="settings-tab" data-tab="connection">Connection</div>
    <div class="settings-tab" data-tab="stealth">Stealth &amp; Anti-Blocking</div>
  </div>
  <div class="settings-content" id="settingsContent"></div>
</div>`;

  const content = container.querySelector('#settingsContent');
  const tabs = container.querySelectorAll('.settings-tab');

  function switchTab(tabName) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    if (tabName === 'general') renderGeneralTab(content);
    else if (tabName === 'connection') renderConnectionTab(content);
    else if (tabName === 'stealth') renderStealthTab(content);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Default tab
  switchTab('general');
}

window.SettingsPage = { render, getStealthConfig, loadStealthConfig, setAgentMode };
