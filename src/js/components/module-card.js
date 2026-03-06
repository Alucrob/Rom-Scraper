/* ═══════════════════════════════════════════════════
   MODULE CARD — Reusable stealth method card
   ═══════════════════════════════════════════════════ */

/**
 * Creates a stealth module card element.
 * @param {Object} mod - Module config { id, name, desc, icon, enabled }
 * @param {Object} opts - { disabled, onToggle, onGear }
 * @returns {HTMLElement}
 */
function createModuleCard(mod, opts = {}) {
  const card = document.createElement('div');
  card.className = 'module-card' + (mod.enabled ? ' active' : '') + (opts.disabled ? ' disabled' : '');
  card.dataset.moduleId = mod.id;

  card.innerHTML = `
    <div class="module-icon">${mod.icon}</div>
    <div class="module-body">
      <div class="module-name">${mod.name}</div>
      <div class="module-desc">${mod.desc}</div>
    </div>
    <div class="module-actions">
      <button class="gear-btn" title="Configure">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
      <div class="toggle ${mod.enabled ? 'on' : ''}" data-toggle-id="${mod.id}"></div>
    </div>`;

  const toggle = card.querySelector('.toggle');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (opts.disabled) return;
    const isOn = toggle.classList.toggle('on');
    card.classList.toggle('active', isOn);
    if (opts.onToggle) opts.onToggle(mod.id, isOn);
  });

  const gearBtn = card.querySelector('.gear-btn');
  gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (opts.onGear) opts.onGear(mod.id);
  });

  return card;
}

window.ModuleCard = { create: createModuleCard };
