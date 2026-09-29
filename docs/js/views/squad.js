/* =========================================================
   VIEW — Squad
   Shows one team's full squad, grouped by category:
   Pacers → Spinners → All-Rounders → Batters → Wicket-Keepers
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.squad = (function () {

  const { esc, money, flag } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  /* Pace / Spin classifiers */
  const PACE_STYLES  = ['Fast', 'Medium'];
  const SPIN_STYLES  = ['Off Spin', 'Leg Spin', 'Left Orthodox', 'Chinaman'];

  const isPacer   = p => p.role === 'Bowler' && PACE_STYLES.includes(p.bowlStyle);
  const isSpinner = p => p.role === 'Bowler' && SPIN_STYLES.includes(p.bowlStyle);

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    const t = S.getSquadTeam();

    if (!t) {
      return `<div class="empty">
        <div class="big">🏏</div>
        <b>No team selected</b>
        <p style="margin-top:6px;font-size:13px">Go back to the Dashboard and tap a team.</p>
        <div style="margin-top:16px">
          <button class="btn primary" onclick="ISPL.app.go('dashboard')">← Back to Dashboard</button>
        </div>
      </div>`;
    }

    const squad = S.teamPlayers(t.id);

    /* Group players */
    const pacers   = squad.filter(isPacer);
    const spinners = squad.filter(isSpinner);
    const ars      = squad.filter(p => p.role === 'All-Rounder');
    const batters  = squad.filter(p => p.role === 'Batter');
    const wks      = squad.filter(p => p.role === 'Wicket-Keeper');

    /* Any bowlers with missing/unknown style — catch them so they don't vanish */
    const otherBowlers = squad.filter(p =>
      p.role === 'Bowler' && !isPacer(p) && !isSpinner(p)
    );

    const left  = S.teamLeft(t.id);
    const spent = S.teamSpent(t.id);

    return `
    <!-- Header -->
    <div class="squad-header"
         style="background:linear-gradient(135deg,${t.primary},${t.secondary})">
      <div class="squad-header-inner">
        <div class="squad-badge" style="border-color:${t.accent}">${esc(t.short)}</div>
        <div style="flex:1;min-width:0">
          <div class="squad-name">${esc(t.name)}</div>
          <div class="squad-sub">${squad.length} players · ${esc(t.short)}</div>
        </div>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="squad-stats">
      <div class="squad-stat"><b>${squad.length}</b><span>Squad</span></div>
      <div class="squad-stat"><b style="color:var(--gold)">${money(left)}</b><span>Purse Left</span></div>
      <div class="squad-stat"><b style="color:#fcd34d">${money(spent)}</b><span>Spent</span></div>
      <div class="squad-stat"><b>${money(t.purse)}</b><span>Total Purse</span></div>
    </div>

    <!-- Back button -->
    <div class="section-head" style="margin-top:8px">
      <h2>Full Squad</h2>
      <button class="btn sm ghost" onclick="ISPL.app.go('dashboard')">← Back to Dashboard</button>
    </div>

    <!-- Categorized lists -->
    ${squad.length === 0
      ? `<div class="empty">
           <div class="big">👥</div>
           <b>No players yet</b>
           <p style="margin-top:6px;font-size:13px">This team hasn't retained or bought any players.</p>
         </div>`
      : `
        ${section('Pacers',          '⚡', pacers)}
        ${section('Spinners',        '🌀', spinners)}
        ${section('All-Rounders',    '🎯', ars)}
        ${section('Batters',         '🏏', batters)}
        ${section('Wicket-Keepers',  '🧤', wks)}
        ${section('Other Bowlers',   '🎳', otherBowlers)}
      `}
    `;
  }

  /* -------- One category section -------- */
  function section(title, emoji, list) {
    if (!list.length) return '';   // hide empty categories

    return `
    <div class="squad-section">
      <div class="squad-section-head">
        <span class="squad-section-icon">${emoji}</span>
        <h3>${title}</h3>
        <span class="count">${list.length}</span>
      </div>
      <div class="squad-players">
        ${list.map(row).join('')}
      </div>
    </div>`;
  }

  /* -------- One player row -------- */
  function row(p) {
    const statusLabel = p.status === 'retained' ? 'Retained' : 'Bought';
    const statusClass = p.status === 'retained' ? 'b-retained' : 'b-sold';
    const bowlTag     = (p.role === 'Bowler' && p.bowlStyle && p.bowlStyle !== '—')
      ? `<span class="squad-bowl">${esc(p.bowlStyle)}</span>`
      : '';

    return `
    <div class="squad-row">
      <div class="squad-flag">${flag(p.country)}</div>
      <div style="flex:1;min-width:0">
        <div class="squad-pname">${esc(p.name)}</div>
        <div class="squad-pmeta">
          ${esc(p.country)} · ${p.age} yrs
          ${bowlTag}
        </div>
      </div>
      <div style="text-align:right">
        <div class="squad-price">${money(p.price || p.basePrice)}</div>
        <span class="badge ${statusClass}">${statusLabel}</span>
      </div>
    </div>`;
  }

  return { render };
})();
