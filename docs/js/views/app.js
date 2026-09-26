/* =========================================================
   APP — router, navigation, init, global actions
   Loaded last. Wires everything together.
   ========================================================= */

ISPL.app = (function () {

  const { $, $$ } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  /* ---------- Tab registry ---------- */
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

  /* Build top tabs + bottom nav from TABS list */
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

    /* Bind click on every [data-tab] (both navs) */
    $$('[data-tab]').forEach(btn => {
      btn.onclick = () => go(btn.dataset.tab);
    });
  }

  /* Switch tab + re-render */
  function go(tabId) {
    if (!TABS.some(t => t.id === tabId)) return;
    currentTab = tabId;
    render();
  }

  /* =========================================================
     RENDER
     ========================================================= */

  function render() {
    /* Highlight active tab in both navs */
    $$('[data-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === currentTab);
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
        ISPL.views.players.wireFilters();   // bind filter inputs after injection
        break;

      case 'retention':
        view.innerHTML = ISPL.views.retention.render();
        break;

      case 'auction':
        view.innerHTML = ISPL.views.auction.render();
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================
     GLOBAL ACTIONS (Export / Reset in top bar)
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
      'Reset everything back to default 7 teams and 28 players?\n\n' +
      'This cannot be undone.'
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
     MOBILE NAV VISIBILITY
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
    /* 1. Load persisted state */
    S.load();
    S.save();      // ensures a fresh save exists on first visit

    /* 2. Build both navigation bars */
    buildNav();

    /* 3. Wire launcher buttons */
    document.getElementById('launchBtn').onclick = launch;

    $$('[data-notready]').forEach(b => {
      b.onclick = () => UI.toast(
        `${b.dataset.notready} download coming soon — use "Open in Browser" for now.`,
        'err'
      );
    });

    /* 4. Wire top-bar actions */
    $('[data-action="export"]').onclick = exportData;
    $('[data-action="reset"]').onclick  = resetAll;

    /* 5. Mobile nav visibility */
    setupResponsiveNav();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* =========================================================
     PUBLIC API
     ========================================================= */
  return {
    go,
    render,
    launch,
    get tab() { return currentTab; }
  };
})();