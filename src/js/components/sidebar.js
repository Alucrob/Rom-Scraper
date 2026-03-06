/* ═══════════════════════════════════════════════════
   SIDEBAR — Icon-based navigation
   ═══════════════════════════════════════════════════ */

const NAV_ITEMS = [
  {
    id: 'scraper',
    label: 'Scraper',
    icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  },
  {
    id: 'instructions',
    label: 'Guide',
    icon: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  },
];

function renderSidebar(container, activePage, onNavigate) {
  container.innerHTML = '';

  NAV_ITEMS.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (activePage === item.id ? ' active' : '');
    btn.innerHTML = item.icon;
    btn.title = item.label;
    btn.addEventListener('click', () => onNavigate(item.id));
    container.appendChild(btn);
  });

  // Spacer
  const spacer = document.createElement('div');
  spacer.className = 'nav-spacer';
  container.appendChild(spacer);

  // Version label
  const label = document.createElement('div');
  label.className = 'nav-label';
  label.id = 'navVersionLabel';
  label.textContent = 'v1.0.8';
  container.appendChild(label);
}

window.Sidebar = { render: renderSidebar, NAV_ITEMS };
