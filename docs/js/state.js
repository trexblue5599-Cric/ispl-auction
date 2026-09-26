/* =========================================================
   STATE — single source of truth for all app data
   - Loads from / saves to localStorage
   - Exposes derived values (teamLeft, retainedOf, etc.)
   - All mutations go through this file
   ========================================================= */

ISPL.state = (function () {

  const { STORAGE_KEY, DEFAULT_TEAMS, DEFAULT_PURSE, buildDefaultPlayers, MAX_RETENTIONS } = ISPL.config;
  const { uid } = ISPL.utils;

  /* The live data object. Never reassigned — only mutated. */
  let data = null;

  /* ---------- Fresh / Load / Save / Reset ---------- */
  function fresh() {
    return {
      teams: DEFAULT_TEAMS.map(t => ({ ...t, purse: DEFAULT_PURSE })),
      players: buildDefaultPlayers(),
      auction: { playerId: null, bid: 0, bidderId: null, increment: 10 }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { data = fresh(); return data; }

      const parsed = JSON.parse(raw);
      if (!parsed.teams || !parsed.players) { data = fresh(); return data; }

      // Repair older saves that might be missing fields
      if (!parsed.auction) {
        parsed.auction = { playerId: null, bid: 0, bidderId: null, increment: 10 };
      }
      parsed.teams.forEach(t => { if (!Array.isArray(t.players)) t.players = []; });

      data = parsed;
    } catch (err) {
      console.warn('ISPL.state: failed to load, using defaults', err);
      data = fresh();
    }
    return data;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (err) { console.warn('ISPL.state: save failed', err); }
  }

  function reset() {
    data = fresh();
    save();
  }

  /* ---------- Lookups ---------- */
  const team   = id => data.teams.find(t => t.id === id);
  const player = id => data.players.find(p => p.id === id);

  /* ---------- Derived team data ---------- */
  const teamPlayers = id => data.players.filter(p => p.teamId === id);
  const teamSpent   = id => teamPlayers(id).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const teamLeft    = id => (team(id)?.purse || 0) - teamSpent(id);
  const retainedOf  = id => data.players.filter(p => p.teamId === id && p.status === 'retained');
  const boughtOf    = id => data.players.filter(p => p.teamId === id && p.status === 'sold');

  const availablePlayers = () => data.players.filter(p => p.status === 'available');

  /* =========================================================
     TEAM CRUD
     ========================================================= */

  function addTeam(info) {
    const t = { id: uid(), purse: DEFAULT_PURSE, ...info };
    data.teams.push(t);
    return t;
  }

  function updateTeam(id, info) {
    const t = team(id);
    if (!t) return null;
    Object.assign(t, info);
    return t;
  }

  function deleteTeam(id) {
    // Release all their players back to the pool
    data.players.forEach(p => {
      if (p.teamId === id) {
        p.teamId = null;
        p.price  = null;
        p.status = 'available';
      }
    });
    data.teams = data.teams.filter(t => t.id !== id);

    // If the deleted team was mid-bid, clear the auction
    if (data.auction.bidderId === id) {
      data.auction.bidderId = null;
      data.auction.bid = data.auction.playerId ? player(data.auction.playerId)?.basePrice || 0 : 0;
    }
  }

  /* =========================================================
     PLAYER CRUD
     ========================================================= */

  function addPlayer(info) {
    const p = {
      id: uid(),
      status: 'available',
      teamId: null,
      price: null,
      ...info
    };
    data.players.push(p);
    return p;
  }

  function updatePlayer(id, info) {
    const p = player(id);
    if (!p) return null;
    Object.assign(p, info);
    return p;
  }

  function deletePlayer(id) {
    data.players = data.players.filter(p => p.id !== id);
    if (data.auction.playerId === id) clearAuction();
  }

  /* =========================================================
     RETENTION
     ========================================================= */

  function retain(playerId, teamId) {
    const p = player(playerId);
    const t = team(teamId);
    if (!p || !t) return { ok: false, msg: 'Player or team not found' };

    if (retainedOf(teamId).length >= MAX_RETENTIONS) {
      return { ok: false, msg: `Maximum ${MAX_RETENTIONS} retentions per team` };
    }
    if (teamLeft(teamId) < p.basePrice) {
      return { ok: false, msg: 'Not enough purse to retain this player' };
    }

    p.status = 'retained';
    p.teamId = teamId;
    p.price  = p.basePrice;
    return { ok: true };
  }

  function release(playerId) {
    const p = player(playerId);
    if (!p) return;
    p.status = 'available';
    p.teamId = null;
    p.price  = null;
  }

  /* =========================================================
     AUCTION
     ========================================================= */

  function setAuction(playerId, bid, increment) {
    data.auction = {
      playerId,
      bid: bid || 0,
      bidderId: null,
      increment: increment || data.auction.increment || 10
    };
  }

  function setIncrement(v) {
    data.auction.increment = Number(v) || 10;
  }

  function updateBid(teamId) {
    const a = data.auction;
    const p = player(a.playerId);
    const t = team(teamId);
    if (!p || !t) return { ok: false, msg: 'Player or team not found' };

    // First bid = base price. Subsequent bids = current + increment
    const nextBid = a.bidderId ? a.bid + a.increment : (a.bid || p.basePrice);

    if (teamLeft(teamId) < nextBid) {
      return { ok: false, msg: `${t.short} doesn't have enough purse` };
    }

    a.bid = nextBid;
    a.bidderId = teamId;
    return { ok: true, bid: nextBid, team: t };
  }

  function sellCurrent() {
    const a = data.auction;
    const p = player(a.playerId);
    const t = a.bidderId ? team(a.bidderId) : null;

    if (!p) return { ok: false, msg: 'No player selected' };
    if (!t) return { ok: false, msg: 'No bids placed yet' };
    if (teamLeft(t.id) < a.bid) return { ok: false, msg: 'Not enough purse' };

    p.status = 'sold';
    p.teamId = t.id;
    p.price  = a.bid;

    const info = { player: p.name, team: t.name, teamShort: t.short, price: p.price };
    clearAuction();
    return { ok: true, info };
  }

  function markUnsold() {
    const a = data.auction;
    const p = player(a.playerId);
    if (!p) return { ok: false, msg: 'No player selected' };

    p.status = 'unsold';
    p.teamId = null;
    p.price  = null;

    const info = { player: p.name };
    clearAuction();
    return { ok: true, info };
  }

  function clearAuction() {
    const inc = data.auction?.increment || 10;
    data.auction = { playerId: null, bid: 0, bidderId: null, increment: inc };
  }

  /* =========================================================
     EXPORT
     ========================================================= */
  function exportJSON() {
    return JSON.stringify(data, null, 2);
  }

  function importJSON(json) {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.teams || !parsed.players) return { ok: false, msg: 'Invalid file format' };
      data = parsed;
      save();
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: 'Could not parse JSON' };
    }
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */
  return {
    /* lifecycle */
    load, save, reset,

    /* raw data access */
    get data() { return data; },

    /* lookups */
    team, player,
    teamPlayers, teamSpent, teamLeft, retainedOf, boughtOf, availablePlayers,

    /* team mutations */
    addTeam, updateTeam, deleteTeam,

    /* player mutations */
    addPlayer, updatePlayer, deletePlayer,

    /* retention */
    retain, release,

    /* auction */
    setAuction, setIncrement, updateBid, sellCurrent, markUnsold, clearAuction,

    /* import / export */
    exportJSON, importJSON
  };
})();