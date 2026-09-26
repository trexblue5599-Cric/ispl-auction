/* =========================================================
   CONFIG — constants + default data
   Edit this file to change the starting teams, players, or rules.
   ========================================================= */

window.ISPL = window.ISPL || {};

ISPL.config = {

  /* Where data is saved in the browser */
  STORAGE_KEY: 'ispl_auction_v2',

  /* Auction rules */
  MAX_RETENTIONS: 5,
  DEFAULT_PURSE: 10000,                    // in Lakhs (10000 = 100 Cr)

  /* Player roles */
  ROLES: ['Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],

  /* Bid increment options (in Lakhs) */
  BID_INCREMENTS: [5, 10, 25, 50],

  /* ---------------------------------------------------------
     Default teams — created on first run / reset
     Each team gets DEFAULT_PURSE automatically.
     --------------------------------------------------------- */
  DEFAULT_TEAMS: [
    { id:'t1', name:'Mumbai Mavericks',   short:'MM', primary:'#1e40af', secondary:'#0ea5e9', accent:'#fbbf24' },
    { id:'t2', name:'Delhi Dynamos',      short:'DD', primary:'#b91c1c', secondary:'#1e3a8a', accent:'#f8fafc' },
    { id:'t3', name:'Chennai Chargers',   short:'CC', primary:'#eab308', secondary:'#0369a1', accent:'#fde047' },
    { id:'t4', name:'Kolkata Kings',      short:'KK', primary:'#6d28d9', secondary:'#a21caf', accent:'#fbbf24' },
    { id:'t5', name:'Bangalore Blasters', short:'BB', primary:'#dc2626', secondary:'#111827', accent:'#f59e0b' },
    { id:'t6', name:'Hyderabad Hawks',    short:'HH', primary:'#ea580c', secondary:'#1c1917', accent:'#fb923c' },
    { id:'t7', name:'Punjab Panthers',    short:'PP', primary:'#be123c', secondary:'#475569', accent:'#e2e8f0' }
  ],

  /* ---------------------------------------------------------
     Default players — created on first run / reset
     Format: [name, role, country, age, basePrice(Lakhs)]
     --------------------------------------------------------- */
  DEFAULT_PLAYERS: [
    ['Arjun Rathore',      'Batter',        'India',    32, 200],
    ['Vikram Sethi',       'All-Rounder',   'India',    28, 200],
    ['Rohit Bansal',       'Wicket-Keeper', 'India',    30, 150],
    ['Imran Qureshi',      'Bowler',        'India',    26, 100],
    ["Daniel O'Connor",    'Batter',        'Overseas', 29, 200],
    ['Karan Malhotra',     'Bowler',        'India',    24, 50],
    ['Suresh Nair',        'All-Rounder',   'India',    31, 150],
    ['Travis Blake',       'Wicket-Keeper', 'Overseas', 27, 175],
    ['Aditya Verma',       'Batter',        'India',    22, 30],
    ['Naveen Reddy',       'Bowler',        'India',    25, 75],
    ['Faisal Khan',        'All-Rounder',   'India',    29, 125],
    ['Liam Petersen',      'Bowler',        'Overseas', 30, 200],
    ['Harshit Jain',       'Batter',        'India',    21, 20],
    ['Manoj Pillai',       'Wicket-Keeper', 'India',    33, 100],
    ['Zaheer Abbas',       'Bowler',        'India',    27, 80],
    ['Chris Whitfield',    'All-Rounder',   'Overseas', 31, 175],
    ['Yash Thakur',        'Batter',        'India',    23, 40],
    ['Ravi Shankar',       'Bowler',        'India',    28, 60],
    ['Sameer Joshi',       'All-Rounder',   'India',    25, 45],
    ['Brandon Miles',      'Batter',        'Overseas', 26, 150],
    ['Devendra Singh',     'Bowler',        'India',    22, 25],
    ['Nikhil Rao',         'Wicket-Keeper', 'India',    24, 35],
    ['Aryan Kapoor',       'Batter',        'India',    20, 20],
    ['Tanveer Ahmed',      'Bowler',        'India',    30, 90],
    ['Mitchell Hayes',     'All-Rounder',   'Overseas', 28, 200],
    ['Pranav Deshmukh',    'Batter',        'India',    27, 70],
    ['Sunny Gill',         'Bowler',        'India',    23, 30],
    ['Rakesh Kumar',       'Wicket-Keeper', 'India',    29, 55]
  ]
};

/* Turn DEFAULT_PLAYERS rows into full player objects.
   Kept here so state.js stays clean. */
ISPL.config.buildDefaultPlayers = function () {
  return ISPL.config.DEFAULT_PLAYERS.map((p, i) => ({
    id: 'p' + (i + 1),
    name: p[0],
    role: p[1],
    country: p[2],
    age: p[3],
    basePrice: p[4],
    status: 'available',   // 'available' | 'retained' | 'sold' | 'unsold'
    teamId: null,
    price: null            // actual price once retained/sold
  }));
};