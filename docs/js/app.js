/* =========================================================
   APP — router, navigation, init, global actions
   ========================================================= */

ISPL.app = (function () {

  const { $, $$ } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teams',     label: 'Teams',     icon: '🏏' },
    { id: 'players',   label: 'Players',   icon: '👥' },
    { id: 'retention', label: 'Retention', icon: '🔒' },
    { id: 'auction',   label: 'Auction',   icon: '🔨' }
  ];

  let currentTab = 'dashboard';

  /* =========================================================
     NAVIGATION
     ========================================================= */
  function buildNav() {
    const topNav    = document.getElementById('tabs');
    const bottomNav = document.getElementById('bottomNav');

    topNav.innerHTML = TABS.map(t =>
      `<button class="tab" data-tab="${t.id}">${t.label}</button>`
    ).join('');

    bottomNav.innerHTML = TABS.map(t =>
      `<button class="bn" data-tab="${t.id}">
         <span class="ic">${t.icon}</span>${t.label}
       </button>`
    ).join('');

    $$('[data-tab]').forEach(btn => {
      btn.onclick = () => go(btn.dataset.tab);
    });
  }

  function go(tabId) {
    if (!TABS.some(t => t.id === tabId) && tabId !== 'squad') return;
    currentTab = tabId;
    render();
  }

  /* Squad is a detail page — not shown in the nav, but routed like a tab */
  function goSquad(teamId) {
    S.setSquadTeam(teamId);
    currentTab = 'squad';
    render();
  }

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    /* Highlight active tab in both navs (squad → highlight dashboard) */
    const navHighlight = currentTab === 'squad' ? 'dashboard' : currentTab;
    $$('[data-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === navHighlight);
    });

    const view = document.getElementById('view');

    switch (currentTab) {
      case 'dashboard':
        view.innerHTML = ISPL.views.dashboard();
        break;

      case 'teams':
        view.innerHTML = ISPL.views.teams.render();
        break;

      case 'players':
        view.innerHTML = ISPL.views.players.render();
        ISPL.views.players.wireFilters();
        break;

      case 'retention':
        view.innerHTML = ISPL.views.retention.render();
        break;

      case 'auction':
        view.innerHTML = ISPL.views.auction.render();
        break;

      case 'squad':
        view.innerHTML = ISPL.views.squad.render();
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================
     GLOBAL ACTIONS
     ========================================================= */
  function exportData() {
    const json = S.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ispl-auction-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
    UI.toast('Data exported', 'ok');
  }

  function resetAll() {
    const ok = UI.confirm(
      'Reset everything back to default teams and players?\n\nThis cannot be undone.'
    );
    if (!ok) return;

    S.reset();
    currentTab = 'dashboard';
    render();
    UI.toast('Auction reset to defaults', 'ok');
  }

  /* =========================================================
     LAUNCHER
     ========================================================= */
  function launch() {
    document.getElementById('launcher').classList.add('hide');
    document.getElementById('app').classList.add('on');
    render();
  }

  /* =========================================================
     RESPONSIVE NAV
     ========================================================= */
  function setupResponsiveNav() {
    const mq = window.matchMedia('(max-width: 760px)');
    const bottomNav = document.getElementById('bottomNav');

    const apply = () => bottomNav.classList.toggle('on', mq.matches);
    mq.addEventListener('change', apply);
    apply();
  }

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    S.load();
    S.save();

    buildNav();

    document.getElementById('launchBtn').onclick = launch;

    $$('[data-notready]').forEach(b => {
      b.onclick = () => UI.toast(
        `${b.dataset.notready} download coming soon — use "Open in Browser" for now.`,
        'err'
      );
    });

    $('[data-action="export"]').onclick = exportData;
    $('[data-action="reset"]').onclick  = resetAll;

    setupResponsiveNav();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* =========================================================
     PUBLIC API
     ========================================================= */
  return {
    go,
    goSquad,
    render,
    launch,
    get tab() { return currentTab; }
  };
})();
