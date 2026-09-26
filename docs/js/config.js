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

  /* Bowling styles (used to split bowlers into Pacers vs Spinners) */
  BOWL_STYLES: ['—', 'Fast', 'Medium', 'Off Spin', 'Leg Spin', 'Left Orthodox', 'Chinaman'],

  /* Bid increment options (in Lakhs) */
  BID_INCREMENTS: [5, 10, 25, 50],

  /* ---------------------------------------------------------
     Default teams — created on first run / reset
     Each team gets DEFAULT_PURSE automatically.
     --------------------------------------------------------- */
  DEFAULT_TEAMS: [
    { id:'t1', name:'Night Sentinels',  short:'NS', primary:'#16a34a', secondary:'#7c3aed', accent:'#c4b5fd' },
    { id:'t2', name:'Cosmic Strikers',  short:'CS', primary:'#ea580c', secondary:'#111827', accent:'#fdba74' },
    { id:'t3', name:'Velocity XI',      short:'VX', primary:'#2563eb', secondary:'#0ea5e9', accent:'#bae6fd' },
    { id:'t4', name:'Dominator XI',     short:'DX', primary:'#dc2626', secondary:'#111827', accent:'#fca5a5' },
    { id:'t5', name:'Nova Royals',      short:'NR', primary:'#7c3aed', secondary:'#f8fafc', accent:'#fde047' },
    { id:'t6', name:'Panwala XI',       short:'PX', primary:'#0f766e', secondary:'#a16207', accent:'#fef3c7' },
    { id:'t7', name:'Unsold XI',        short:'UX', primary:'#475569', secondary:'#1e293b', accent:'#94a3b8' }
  ],

  /* ---------------------------------------------------------
     Default players — created on first run / reset
     Format: [name, role, country, age, basePrice(Lakhs), bowlStyle]
     bowlStyle is only meaningful for role = 'Bowler'.
       Pace  : 'Fast' | 'Medium'
       Spin  : 'Off Spin' | 'Leg Spin' | 'Left Orthodox' | 'Chinaman'
       Other : '—'
     --------------------------------------------------------- */
  DEFAULT_PLAYERS: [
    ['Arjun Rathore',      'Batter',        'India',    32, 200, '—'],
    ['Vikram Sethi',       'All-Rounder',   'India',    28, 200, '—'],
    ['Rohit Bansal',       'Wicket-Keeper', 'India',    30, 150, '—'],
    ['Imran Qureshi',      'Bowler',        'India',    26, 100, 'Fast'],
    ["Daniel O'Connor",    'Batter',        'Overseas', 29, 200, '—'],
    ['Karan Malhotra',     'Bowler',        'India',    24, 50,  'Leg Spin'],
    ['Suresh Nair',        'All-Rounder',   'India',    31, 150, '—'],
    ['Travis Blake',       'Wicket-Keeper', 'Overseas', 27, 175, '—'],
    ['Aditya Verma',       'Batter',        'India',    22, 30,  '—'],
    ['Naveen Reddy',       'Bowler',        'India',    25, 75,  'Medium'],
    ['Faisal Khan',        'All-Rounder',   'India',    29, 125, '—'],
    ['Liam Petersen',      'Bowler',        'Overseas', 30, 200, 'Fast'],
    ['Harshit Jain',       'Batter',        'India',    21, 20,  '—'],
    ['Manoj Pillai',       'Wicket-Keeper', 'India',    33, 100, '—'],
    ['Zaheer Abbas',       'Bowler',        'India',    27, 80,  'Off Spin'],
    ['Chris Whitfield',    'All-Rounder',   'Overseas', 31, 175, '—'],
    ['Yash Thakur',        'Batter',        'India',    23, 40,  '—'],
    ['Ravi Shankar',       'Bowler',        'India',    28, 60,  'Fast'],
    ['Sameer Joshi',       'All-Rounder',   'India',    25, 45,  '—'],
    ['Brandon Miles',      'Batter',        'Overseas', 26, 150, '—'],
    ['Devendra Singh',     'Bowler',        'India',    22, 25,  'Left Orthodox'],
    ['Nikhil Rao',         'Wicket-Keeper', 'India',    24, 35,  '—'],
    ['Aryan Kapoor',       'Batter',        'India',    20, 20,  '—'],
    ['Tanveer Ahmed',      'Bowler',        'India',    30, 90,  'Chinaman'],
    ['Mitchell Hayes',     'All-Rounder',   'Overseas', 28, 200, '—'],
    ['Pranav Deshmukh',    'Batter',        'India',    27, 70,  '—'],
    ['Sunny Gill',         'Bowler',        'India',    23, 30,  'Leg Spin'],
    ['Rakesh Kumar',       'Wicket-Keeper', 'India',    29, 55,  '—']
  ]
};

/* Turn DEFAULT_PLAYERS rows into full player objects. */
ISPL.config.buildDefaultPlayers = function () {
  return ISPL.config.DEFAULT_PLAYERS.map((p, i) => ({
    id: 'p' + (i + 1),
    name: p[0],
    role: p[1],
    country: p[2],
    age: p[3],
    basePrice: p[4],
    bowlStyle: p[5] || '—',
    status: 'available',   // 'available' | 'retained' | 'sold' | 'unsold'
    teamId: null,
    price: null
  }));
};
