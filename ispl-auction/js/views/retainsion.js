/* =========================================================
   VIEW — Retention
   Pick up to 5 players per team at their base price
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.retention = (function () {

  const { esc, money } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  /* Which team is currently selected — persists across re-renders */
  let currentTeamId = null;

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    const { data } = S;

    if (!data.teams.length) {
      return `<div class="empty">
        <div class="big">🏏</div>
        <b>No teams yet</b>
        <p style="margin-top:6px;font-size:13px">Create a team first from the Teams tab.</p>
      </div>`;
    }

    /* Default to first team if current is missing/deleted */
    if (!currentTeamId || !S.team(currentTeamId)) {
      currentTeamId = data.teams[0].id;
    }

    const t        = S.team(currentTeamId);
    const retained = S.retainedOf(t.id);
    const pool     = S.availablePlayers();
    const maxRet   = ISPL.config.MAX_RETENTIONS;

    return `
    <div class="section-head">
      <h2>Retention List
        <span class="count">Max ${maxRet} per team</span>
      </h2>
    </div>

    <!-- Team picker chips -->
    <div class="chip-row">
      ${data.teams.map(tm => chip(tm)).join('')}
    </div>

    <div class="ret-layout">

      <!-- LEFT: current team's retained slots -->
      <div class="panel" style="border-color:${t.accent}55">
        <h3>
          <span style="display:flex;align-items:center;gap:9px">
            <span style="width:12px;height:12px;border-radius:50%;
                         background:linear-gradient(135deg,${t.primary},${t.secondary});
                         border:1px solid ${t.accent}"></span>
            ${esc(t.name)} — Retained
          </span>
          <span class="count">${retained.length}/${maxRet}</span>
        </h3>

        ${slotsHTML(retained, maxRet)}

        <div style="margin-top:14px;padding-top:13px;border-top:1px solid var(--line);
                    display:flex;justify-content:space-between;font-size:12.5px;font-weight:800">
          <span style="color:var(--muted)">Purse Left</span>
          <span style="color:var(--gold)">${money(S.teamLeft(t.id))}</span>
        </div>
      </div>

      <!-- RIGHT: available players to retain -->
      <div class="panel">
        <h3>Available Players <span class="count">${pool.length}</span></h3>
        <div style="max-height:520px;overflow-y:auto;padding-right:4px">
          ${pool.length ? pool.map(p => poolRow(p, retained.length >= maxRet)).join('')
            : `<div class="empty" style="padding:30px">
                 <div class="big">✅</div>
                 <b>No available players</b>
               </div>`}
        </div>
      </div>

    </div>`;
  }

  /* -------- Team picker chip -------- */
  function chip(tm) {
    const active = tm.id === currentTeamId;
    const style  = active
      ? `--c1:${tm.primary};--c2:${tm.secondary};--c3:${tm.accent};
         background:linear-gradient(135deg,${tm.primary},${tm.secondary})`
      : `--c1:${tm.primary};--c2:${tm.secondary};--c3:${tm.accent}`;

    return `
      <button class="chip ${active ? 'active' : ''}" style="${style}"
              onclick="ISPL.views.retention.selectTeam('${tm.id}')">
        <span class="dot"></span>
        ${esc(tm.name)}
        <b style="opacity:.75">${S.retainedOf(tm.id).length}/${ISPL.config.MAX_RETENTIONS}</b>
      </button>`;
  }

  /* -------- 5 slots (filled or empty) -------- */
  function slotsHTML(retained, maxRet) {
    let html = '';
    for (let i = 0; i < maxRet; i++) {
      const p = retained[i];

      if (p) {
        html += `
          <div class="slot filled">
            <div class="num">${i + 1}</div>
            <div class="txt">
              <b>${esc(p.name)}</b>
              <span>${p.role} · ${money(p.price || p.basePrice)}</span>
            </div>
            <button class="btn sm red"
                    onclick="ISPL.views.retention.release('${p.id}')">Release</button>
          </div>`;
      } else {
        html += `
          <div class="slot">
            <div class="num">${i + 1}</div>
            <div class="txt">
              <b style="color:#4a5776">Empty Slot</b>
              <span>Pick a player from the right →</span>
            </div>
          </div>`;
      }
    }
    return html;
  }

  /* -------- One available player row -------- */
  function poolRow(p, disableRetain) {
    return `
      <div class="auc-item">
        <div class="av">${esc(p.name.charAt(0))}</div>
        <div style="flex:1;min-width:0">
          <div class="nm">${esc(p.name)}</div>
          <div class="mt">${p.role} · ${p.country} · ${money(p.basePrice)}</div>
        </div>
        <button class="btn sm primary"
                ${disableRetain ? 'disabled' : ''}
                onclick="ISPL.views.retention.retain('${p.id}')">
          Retain
        </button>
      </div>`;
  }

  /* =========================================================
     ACTIONS
     ========================================================= */
  function selectTeam(teamId) {
    currentTeamId = teamId;
    ISPL.app.render();
  }

  function retain(playerId) {
    const res = S.retain(playerId, currentTeamId);
    if (!res.ok) return UI.toast(res.msg, 'err');

    const p = S.player(playerId);
    const t = S.team(currentTeamId);

    S.save();
    UI.toast(`${p.name} retained by ${t.short} for ${money(p.price)}`, 'ok');
    ISPL.app.render();
  }

  function release(playerId) {
    const p = S.player(playerId);
    if (!p) return;

    S.release(playerId);
    S.save();
    UI.toast(`${p.name} released`, 'ok');
    ISPL.app.render();
  }

  /* =========================================================
     PUBLIC
     ========================================================= */
  return { render, selectTeam, retain, release };
})();