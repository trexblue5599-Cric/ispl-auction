/* =========================================================
   APP — router, navigation, init, global actions
   Loaded last. Wires everything together.
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
    if (!TABS.some(t => t.id === tabId)) return;
    currentTab = tabId;
    render();
  }

  function render() {
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
        ISPL.views.players.wireFilters();
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

  function launch() {
    document.getElementById('launcher').classList.add('hide');
    document.getElementById('app').classList.add('on');
    render();
  }

  function setupResponsiveNav() {
    const mq = window.matchMedia('(max-width: 760px)');
    const bottomNav = document.getElementById('bottomNav');

    const apply = () => bottomNav.classList.toggle('on', mq.matches);
    mq.addEventListener('change', apply);
    apply();
  }

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

  return {
    go,
    render,
    launch,
    get tab() { return currentTab; }
  };
})();