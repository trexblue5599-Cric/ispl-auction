/* =========================================================
   VIEW — Teams
   Full team list + create / edit / delete
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.teams = (function () {

  const { $, esc, money } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  /* =========================================================
     RENDER — the teams grid
     ========================================================= */
  function render() {
    const { data } = S;

    return `
    <div class="section-head">
      <h2>Teams <span class="count">${data.teams.length}</span></h2>
      <button class="btn primary" onclick="ISPL.views.teams.open()">＋ New Team</button>
    </div>

    ${data.teams.length
      ? `<div class="team-grid">${data.teams.map(card).join('')}</div>`
      : `<div class="empty">
           <div class="big">🏏</div>
           <b>No teams yet</b>
           <p style="margin-top:6px;font-size:13px">Click "＋ New Team" to get started.</p>
         </div>`}
    `;
  }

  /* -------- One team card with actions -------- */
  function card(t) {
    const left  = S.teamLeft(t.id);
    const pct   = t.purse > 0 ? Math.max(0, Math.min(100, (left / t.purse) * 100)) : 0;
    const squad = S.teamPlayers(t.id).length;
    const ret   = S.retainedOf(t.id).length;
    const buy   = S.boughtOf(t.id).length;

    return `
    <div class="team-card" style="--c1:${t.primary};--c2:${t.secondary};--c3:${t.accent}">
      <div class="tc-top">
        <div class="tc-inner">
          <div class="tc-badge">${esc(t.short)}</div>
          <div>
            <div class="tc-name">${esc(t.name)}</div>
            <div class="tc-sub">PURSE ${money(t.purse)}</div>
          </div>
        </div>
      </div>
      <div class="tc-body">
        <div class="tc-meta">
          <span>Purse Left</span>
          <b style="color:var(--gold)">${money(left)}</b>
        </div>
        <div class="purse-bar"><div class="purse-fill" style="width:${pct}%"></div></div>
        <div class="tc-stats">
          <div class="tc-stat"><b>${squad}</b><span>Squad</span></div>
          <div class="tc-stat"><b style="color:#6ee7b7">${ret}</b><span>Retained</span></div>
          <div class="tc-stat"><b style="color:#fcd34d">${buy}</b><span>Bought</span></div>
        </div>
        <div class="tc-actions">
          <button class="btn sm" onclick="ISPL.views.teams.open('${t.id}')">✎ Edit</button>
          <button class="btn sm red" onclick="ISPL.views.teams.remove('${t.id}')">🗑 Delete</button>
        </div>
      </div>
    </div>`;
  }

  /* =========================================================
     CREATE / EDIT
     ========================================================= */
  function open(teamId) {
    const t      = teamId ? S.team(teamId) : null;
    const isEdit = !!t;

    const d = {
      name:      t ? t.name      : '',
      short:     t ? t.short     : '',
      primary:   t ? t.primary   : '#1e40af',
      secondary: t ? t.secondary : '#0ea5e9',
      accent:    t ? t.accent    : '#fbbf24',
      purse:     t ? t.purse     : ISPL.config.DEFAULT_PURSE
    };

    UI.openModal(isEdit ? 'Edit Team' : 'Create Team', `
      <div class="field-row">
        <label>Team Name
          <input id="f_name" value="${esc(d.name)}" placeholder="Mumbai Mavericks">
        </label>
        <label>Short Code
          <input id="f_short" maxlength="3" value="${esc(d.short)}" placeholder="MM">
        </label>
      </div>

      <div class="field-row-3">
        <label>Primary<input type="color" id="f_c1" value="${d.primary}"></label>
        <label>Secondary<input type="color" id="f_c2" value="${d.secondary}"></label>
        <label>Accent<input type="color" id="f_c3" value="${d.accent}"></label>
      </div>

      <label>Purse (Lakhs — 10000 = 100 Cr)
        <input type="number" id="f_purse" value="${d.purse}" min="0">
      </label>

      <div class="preview" id="cprev"
           style="background:linear-gradient(135deg,${d.primary},${d.secondary});border-color:${d.accent}">
        ${esc(d.short || 'TEAM')} · ${esc(d.name || 'Your Team Name')}
      </div>

      <div class="modal-actions">
        <button class="btn ghost" data-close>Cancel</button>
        <button class="btn primary" id="saveTeam">${isEdit ? 'Save Changes' : 'Create Team'}</button>
      </div>
    `, root => {

      /* Live preview as user types / picks colors */
      const updatePreview = () => {
        const c1 = $('#f_c1', root).value;
        const c2 = $('#f_c2', root).value;
        const c3 = $('#f_c3', root).value;
        const nm = $('#f_name', root).value || 'Your Team Name';
        const sh = ($('#f_short', root).value || 'TEAM').toUpperCase();

        const pv = $('#cprev', root);
        pv.style.background = `linear-gradient(135deg,${c1},${c2})`;
        pv.style.borderColor = c3;
        pv.textContent = `${sh} · ${nm}`;
      };

      ['f_name', 'f_short', 'f_c1', 'f_c2', 'f_c3'].forEach(id => {
        $('#' + id, root).addEventListener('input', updatePreview);
      });

      /* Save */
      $('#saveTeam', root).onclick = () => {
        const name  = $('#f_name', root).value.trim();
        const short = ($('#f_short', root).value.trim() || name.slice(0, 3)).toUpperCase();

        if (!name) return UI.toast('Please enter a team name', 'err');
        if (!short) return UI.toast('Please enter a short code', 'err');

        const info = {
          name,
          short,
          primary:   $('#f_c1', root).value,
          secondary: $('#f_c2', root).value,
          accent:    $('#f_c3', root).value,
          purse:     Math.max(0, Number($('#f_purse', root).value) || 0)
        };

        if (isEdit) {
          S.updateTeam(teamId, info);
          UI.toast('Team updated', 'ok');
        } else {
          S.addTeam(info);
          UI.toast('Team created', 'ok');
        }

        S.save();
        UI.closeModal();
        ISPL.app.render();
      };
    });
  }

  /* =========================================================
     DELETE
     ========================================================= */
  function remove(teamId) {
    const t = S.team(teamId);
    if (!t) return;

    const ok = UI.confirm(
      `Delete "${t.name}"?\n\nTheir players will be released back to the auction pool.`
    );
    if (!ok) return;

    S.deleteTeam(teamId);
    S.save();
    UI.toast('Team deleted', 'ok');
    ISPL.app.render();
  }

  /* =========================================================
     PUBLIC
     ========================================================= */
  return { render, open, remove };
})();