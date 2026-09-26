/* =========================================================
   VIEW — Dashboard
   Overview stats + team cards grid
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.dashboard = function () {

  const { esc, money } = ISPL.utils;
  const S = ISPL.state;
  const { data } = S;

  /* -------- Top-line stats -------- */
  const total     = data.players.length;
  const retained  = data.players.filter(p => p.status === 'retained').length;
  const sold      = data.players.filter(p => p.status === 'sold').length;
  const available = data.players.filter(p => p.status === 'available').length;
  const unsold    = data.players.filter(p => p.status === 'unsold').length;

  const totalSpent = data.teams.reduce((sum, t) => sum + S.teamSpent(t.id), 0);

  return `
  <div class="section-head">
    <h2>Dashboard <span class="count">${data.teams.length} Teams</span></h2>
  </div>

  <div class="stats">
    <div class="stat" style="--c:#60a5fa"><div class="v">${data.teams.length}</div><div class="k">Teams</div></div>
    <div class="stat" style="--c:#a78bfa"><div class="v">${total}</div><div class="k">Total Players</div></div>
    <div class="stat" style="--c:#34d399"><div class="v">${retained}</div><div class="k">Retained</div></div>
    <div class="stat" style="--c:#fbbf24"><div class="v">${sold}</div><div class="k">Sold</div></div>
    <div class="stat" style="--c:#38bdf8"><div class="v">${available}</div><div class="k">Available</div></div>
    <div class="stat" style="--c:#f87171"><div class="v">${unsold}</div><div class="k">Unsold</div></div>
    <div class="stat" style="--c:#f59e0b"><div class="v">${money(totalSpent)}</div><div class="k">Total Spent</div></div>
  </div>

  <div class="section-head">
    <h2>Team Overview</h2>
    <button class="btn sm ghost" onclick="ISPL.app.go('teams')">Manage Teams →</button>
  </div>

  ${data.teams.length
    ? `<div class="team-grid">${data.teams.map(teamCard).join('')}</div>`
    : `<div class="empty">
         <div class="big">🏏</div>
         <b>No teams yet</b>
         <p style="margin-top:6px;font-size:13px">Create your first team from the Teams tab.</p>
       </div>`}
  `;
};

/* -------- One team card (dashboard version, read-only) -------- */
function teamCard(t) {
  const { esc, money } = ISPL.utils;
  const S = ISPL.state;

  const left  = S.teamLeft(t.id);
  const pct   = t.purse > 0 ? Math.max(0, Math.min(100, (left / t.purse) * 100)) : 0;
  const squad = S.teamPlayers(t.id).length;

  return `
  <div class="team-card"
       style="--c1:${t.primary};--c2:${t.secondary};--c3:${t.accent}"
       onclick="ISPL.app.go('teams')">
    <div class="tc-top">
      <div class="tc-inner">
        <div class="tc-badge">${esc(t.short)}</div>
        <div>
          <div class="tc-name">${esc(t.name)}</div>
          <div class="tc-sub">SQUAD ${squad}</div>
        </div>
      </div>
    </div>
    <div class="tc-body">
      <div class="tc-meta">
        <span>Purse Left</span>
        <b style="color:var(--gold)">${money(left)}</b>
      </div>
      <div class="purse-bar"><div class="purse-fill" style="width:${pct}%"></div></div>
      <div class="tc-meta">
        <span>Spent ${money(S.teamSpent(t.id))}</span>
        <span>Total ${money(t.purse)}</span>
      </div>
    </div>
  </div>`;
}