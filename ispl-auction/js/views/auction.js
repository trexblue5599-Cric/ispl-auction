/* =========================================================
   VIEW — Auction
   Pool on the left, live bidding stage on the right
   ========================================================= */

ISPL.views = ISPL.views || {};

ISPL.views.auction = (function () {

  const { esc, money } = ISPL.utils;
  const S  = ISPL.state;
  const UI = ISPL.ui;

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    const a         = S.data.auction;
    const cur       = a.playerId ? S.player(a.playerId) : null;
    const available = S.availablePlayers();

    /* No player selected → show empty stage */
    if (!cur) {
      return `
      <div class="section-head">
        <h2>Auction Room <span class="count">${available.length} in pool</span></h2>
      </div>

      <div class="auc-layout">
        ${poolPanel(null, available)}

        <div class="stage">
          <div class="stage-inner">
            <div class="empty" style="padding:40px 10px">
              <div class="big">🔨</div>
              <b style="font-size:17px">Select a player to begin bidding</b>
              <p style="margin-top:8px;font-size:13px;color:var(--muted)">
                Pick someone from the Auction Pool on the left.
              </p>
            </div>
          </div>
        </div>
      </div>`;
    }

    /* Active lot */
    const bidder = a.bidderId ? S.team(a.bidderId) : null;

    return `
    <div class="section-head">
      <h2>Auction Room <span class="count">${available.length} in pool</span></h2>
      <button class="btn sm ghost" onclick="ISPL.views.auction.cancel()">✕ Cancel Lot</button>
    </div>

    <div class="auc-layout">
      ${poolPanel(cur.id, available)}

      <div class="stage">
        <div class="stage-inner">

          <!-- Player header -->
          <div class="pname">${esc(cur.name)}</div>
          <div class="pmeta">${cur.role} · ${cur.country} · ${cur.age} yrs</div>

          <!-- Current bid display -->
          <div class="bidbox">
            <div class="lbl">Current Bid</div>
            <div class="amt">${money(a.bid || cur.basePrice)}</div>
            <div class="whos">
              ${bidder
                ? `Highest: <span style="color:${bidder.accent}">${esc(bidder.name)}</span>`
                : 'No bids yet — base price'}
            </div>
          </div>

          <!-- Increment pills -->
          <div class="inc-row">
            <span style="font-size:11px;font-weight:800;color:var(--muted);
                         align-self:center;letter-spacing:.6px">INCREMENT</span>
            ${ISPL.config.BID_INCREMENTS.map(i => `
              <button class="inc ${a.increment === i ? 'on' : ''}"
                      onclick="ISPL.views.auction.setInc(${i})">+${i} L</button>
            `).join('')}
          </div>

          <!-- Team bid buttons -->
          <div class="bid-teams">
            ${S.data.teams.map(t => bidButton(t, a, cur)).join('')}
          </div>

          <!-- SOLD / UNSOLD -->
          <div class="hammer-row">
            <button class="btn gold"
                    ${bidder ? '' : 'disabled'}
                    onclick="ISPL.views.auction.sold()">🔨 SOLD</button>
            <button class="btn red"
                    onclick="ISPL.views.auction.unsold()">UNSOLD</button>
          </div>

        </div>
      </div>
    </div>`;
  }

  /* =========================================================
     SUB-RENDERERS
     ========================================================= */

  /* Left panel — the pool of available players */
  function poolPanel(currentId, available) {
    return `
    <div class="panel">
      <h3>Auction Pool <span class="count">${available.length}</span></h3>
      <div class="auc-list">
        ${available.length
          ? available.map(p => `
            <button class="auc-item ${currentId === p.id ? 'sel' : ''}"
                    onclick="ISPL.views.auction.pick('${p.id}')">
              <div class="av">${esc(p.name.charAt(0))}</div>
              <div style="flex:1;min-width:0">
                <div class="nm">${esc(p.name)}</div>
                <div class="mt">${p.role} · ${p.country} · Base ${money(p.basePrice)}</div>
              </div>
            </button>`).join('')
          : `<div class="empty" style="padding:30px">
               <div class="big">🎉</div>
               <b>All players processed</b>
             </div>`}
      </div>
    </div>`;
  }

  /* One team bid button — disabled if purse too low or already highest bidder */
  function bidButton(t, a, cur) {
    const left    = S.teamLeft(t.id);
    const nextBid = a.bidderId ? a.bid + a.increment : (a.bid || cur.basePrice);
    const canBid  = left >= nextBid && a.bidderId !== t.id;

    return `
      <button class="bid-team"
              style="--c1:${t.primary};--c2:${t.secondary}"
              ${canBid ? '' : 'disabled'}
              onclick="ISPL.views.auction.bid('${t.id}')">
        <div class="bt-in">
          <b>${esc(t.short)} — ${esc(t.name)}</b>
          <span>${money(left)} left · bid ${money(nextBid)}</span>
        </div>
      </button>`;
  }

  /* =========================================================
     ACTIONS
     ========================================================= */

  /* Select a player from the pool */
  function pick(playerId) {
    const p = S.player(playerId);
    if (!p) return;

    S.setAuction(playerId, p.basePrice, S.data.auction.increment);
    S.save();
    ISPL.app.render();
  }

  /* Change bid increment */
  function setInc(v) {
    S.setIncrement(v);
    S.save();
    ISPL.app.render();
  }

  /* Place a bid for a team */
  function bid(teamId) {
    const res = S.updateBid(teamId);
    if (!res.ok) return UI.toast(res.msg, 'err');

    S.save();
    ISPL.app.render();
  }

  /* Hammer — SOLD */
  function sold() {
    const res = S.sellCurrent();
    if (!res.ok) return UI.toast(res.msg, 'err');

    S.save();
    UI.toast(`SOLD! ${res.info.player} → ${res.info.team} for ${money(res.info.price)}`, 'ok');
    ISPL.app.render();
  }

  /* Hammer — UNSOLD */
  function unsold() {
    const res = S.markUnsold();
    if (!res.ok) return UI.toast(res.msg, 'err');

    S.save();
    UI.toast(`${res.info.player} goes UNSOLD`, 'err');
    ISPL.app.render();
  }

  /* Deselect current lot */
  function cancel() {
    S.clearAuction();
    S.save();
    ISPL.app.render();
  }

  /* =========================================================
     PUBLIC
     ========================================================= */
  return { render, pick, setInc, bid, sold, unsold, cancel };
})();