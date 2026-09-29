/* =========================================================
   VIEW — Players
   Full player list + search/filter + create/edit/delete
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.players = (function () {

  const { $, $$, esc, money, flag } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  const filters = { q: '', role: '', status: '', country: '' };

  const ROLE_COLOR = {
    'Batter':        '#60a5fa',
    'Bowler':        '#f87171',
    'All-Rounder':   '#a78bfa',
    'Wicket-Keeper': '#34d399'
  };

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    const list = filtered();

    return `
    <div class="section-head">
      <h2>Players <span class="count">${list.length} / ${S.data.players.length}</span></h2>
      <button class="btn primary" onclick="ISPL.views.players.open()">＋ Create Player Profile</button>
    </div>

    <div class="filters">
      <input type="search" data-filter="q" placeholder="🔍 Search player name..." value="${esc(filters.q)}">

      <select data-filter="role">
        <option value="">All Roles</option>
        ${ISPL.config.ROLES.map(r =>
          `<option ${filters.role === r ? 'selected' : ''}>${r}</option>`
        ).join('')}
      </select>

      <select data-filter="status">
        <option value="">All Status</option>
        <option value="available" ${filters.status === 'available' ? 'selected' : ''}>Available</option>
        <option value="retained"  ${filters.status === 'retained'  ? 'selected' : ''}>Retained</option>
        <option value="sold"      ${filters.status === 'sold'      ? 'selected' : ''}>Sold</option>
        <option value="unsold"    ${filters.status === 'unsold'    ? 'selected' : ''}>Unsold</option>
      </select>

      <select data-filter="country">
        <option value="">All Countries</option>
        ${ISPL.config.COUNTRIES.map(c =>
          `<option value="${c.name}" ${filters.country === c.name ? 'selected' : ''}>${c.flag} ${c.name}</option>`
        ).join('')}
      </select>

      <button class="btn sm ghost" onclick="ISPL.views.players.clearFilters()">Clear</button>
    </div>

    <div id="playersGrid">
      ${gridHTML(list)}
    </div>`;
  }

  function gridHTML(list) {
    if (!list.length) {
      return `<div class="empty">
        <div class="big">🔍</div>
        <b>No players found</b>
        <p style="margin-top:6px;font-size:13px">Try changing filters or create a new player profile.</p>
      </div>`;
    }
    return `<div class="player-grid">${list.map(card).join('')}</div>`;
  }

  /* =========================================================
     CARD
     ========================================================= */
  function card(p) {
    const rc   = ROLE_COLOR[p.role] || '#60a5fa';
    const team = p.teamId ? S.team(p.teamId) : null;

    const badge = {
      available: 'b-available',
      retained:  'b-retained',
      sold:      'b-sold',
      unsold:    'b-unsold'
    }[p.status];

    const label = {
      available: 'Available',
      retained:  'Retained',
      sold:      'Sold',
      unsold:    'Unsold'
    }[p.status];

    /* Bowl style shown only for bowlers */
    const showBowl = p.role === 'Bowler' && p.bowlStyle && p.bowlStyle !== '—';
    const bowlText = showBowl ? ` · ${p.bowlStyle}` : '';

    return `
    <div class="p-card" style="--rc:${rc}">
      <div class="p-head">
        <div>
          <div class="p-name">${esc(p.name)}</div>
          <div class="p-info" style="margin-top:5px">
            <span>${flag(p.country)} ${esc(p.country)}</span>
            <span>${p.age} yrs</span>
          </div>
        </div>
        <span class="p-role role-${p.role.replace(/\s/g, '-')}">${p.role}</span>
      </div>

      ${showBowl ? `<div class="p-info"><span>🎯 ${esc(p.bowlStyle)}</span></div>` : ''}

      <div class="p-info">
        ${team ? `<span>🏏 ${esc(team.short)}</span>` : ''}
        ${p.price ? `<span>💰 ${money(p.price)}</span>` : ''}
      </div>

      <div class="p-foot">
        <div class="p-price">${money(p.basePrice)}<small>Base Price</small></div>
        <span class="badge ${badge}">${label}</span>
      </div>

      <div class="p-actions">
        <button class="btn sm" style="flex:1" onclick="ISPL.views.players.open('${p.id}')">✎ Edit</button>
        <button class="btn sm red" onclick="ISPL.views.players.remove('${p.id}')">🗑</button>
      </div>
    </div>`;
  }

  /* =========================================================
     FILTERS
     ========================================================= */
  function filtered() {
    return S.data.players.filter(p => {
      if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.role    && p.role    !== filters.role)    return false;
      if (filters.status  && p.status  !== filters.status)  return false;
      if (filters.country && p.country !== filters.country) return false;
      return true;
    });
  }

  function setFilter(key, val) {
    filters[key] = val;
    refreshGrid();
  }

  function clearFilters() {
    Object.keys(filters).forEach(k => { filters[k] = ''; });
    refreshGrid();
    $$('[data-filter]').forEach(el => { el.value = ''; });
  }

  function refreshGrid() {
    const grid = $('#playersGrid');
    if (!grid) return;

    const list = filtered();
    const counter = document.querySelector('.section-head .count');
    if (counter) counter.textContent = `${list.length} / ${S.data.players.length}`;

    grid.innerHTML = gridHTML(list);
  }

  function wireFilters() {
    $$('[data-filter]').forEach(el => {
      el.oninput  = () => setFilter(el.dataset.filter, el.value);
      el.onchange = () => setFilter(el.dataset.filter, el.value);
    });
  }

  /* =========================================================
     CREATE / EDIT
     ========================================================= */
  function open(playerId) {
    const p      = playerId ? S.player(playerId) : null;
    const isEdit = !!p;

    const d = p || {
      name: '',
      role: 'Batter',
      country: 'India',
      age: 25,
      basePrice: 20,
      bowlStyle: '—'
    };

    UI.openModal(isEdit ? 'Edit Player Profile' : 'Create Player Profile', `
      <label>Player Name
        <input id="p_name" value="${esc(d.name)}" placeholder="e.g. Arjun Rathore">
      </label>

      <div class="field-row">
        <label>Role
          <select id="p_role">
            ${ISPL.config.ROLES.map(r =>
              `<option ${d.role === r ? 'selected' : ''}>${r}</option>`
            ).join('')}
          </select>
        </label>
        <label>Country
          <select id="p_country">
            ${ISPL.config.COUNTRIES.map(c =>
              `<option value="${c.name}" ${d.country === c.name ? 'selected' : ''}>${c.flag} ${c.name}</option>`
            ).join('')}
          </select>
        </label>
      </div>

      <div id="bowlRow" style="display:none">
        <label>Bowling Style
          <select id="p_bowl">
            ${ISPL.config.BOWL_STYLES.map(s =>
              `<option ${d.bowlStyle === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </label>
      </div>

      <div class="field-row">
        <label>Age
          <input type="number" id="p_age" value="${d.age}" min="15" max="50">
        </label>
        <label>Base Price (Lakhs)
          <input type="number" id="p_base" value="${d.basePrice}" min="0" step="5">
        </label>
      </div>

      <div class="modal-actions">
        <button class="btn ghost" data-close>Cancel</button>
        <button class="btn primary" id="saveP">${isEdit ? 'Save Changes' : 'Create Player'}</button>
      </div>
    `, root => {

      /* Show/hide bowl style row based on role */
      const roleSel  = $('#p_role', root);
      const bowlRow  = $('#bowlRow', root);

      const toggleBowl = () => {
        bowlRow.style.display = roleSel.value === 'Bowler' ? 'block' : 'none';
      };
      roleSel.onchange = toggleBowl;
      toggleBowl();

      $('#saveP', root).onclick = () => {
        const name = $('#p_name', root).value.trim();
        if (!name) return UI.toast('Please enter a player name', 'err');

        const role = roleSel.value;
        const info = {
          name,
          role,
          country:   $('#p_country', root).value,
          age:       Math.max(15, Number($('#p_age',  root).value) || 25),
          basePrice: Math.max(0,  Number($('#p_base', root).value) || 0),
          bowlStyle: role === 'Bowler' ? $('#p_bowl', root).value : '—'
        };

        if (isEdit) {
          S.updatePlayer(playerId, info);
          UI.toast('Player updated', 'ok');
        } else {
          S.addPlayer(info);
          UI.toast('Player profile created', 'ok');
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
  function remove(playerId) {
    const p = S.player(playerId);
    if (!p) return;
    if (!UI.confirm(`Delete "${p.name}"?`)) return;

    S.deletePlayer(playerId);
    S.save();
    UI.toast('Player deleted', 'ok');
    ISPL.app.render();
  }

  /* =========================================================
     PUBLIC
     ========================================================= */
  return { render, open, remove, wireFilters, setFilter, clearFilters };
})();
