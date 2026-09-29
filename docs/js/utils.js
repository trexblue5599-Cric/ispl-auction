/* =========================================================
   UTILS — tiny helpers used everywhere
   $ , $$ , uid , esc , money , flag , debounce
   ========================================================= */

ISPL.utils = (function () {

  /* querySelector wrapper */
  const $  = (sel, root = document) => root.querySelector(sel);

  /* querySelectorAll → array (not NodeList) */
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Random short id */
  const uid = () => Math.random().toString(36).slice(2, 9);

  /* Escape user text before injecting into innerHTML */
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  /* Display money. Stored in Lakhs.
     200   -> "200 L"
     10000 -> "100 Cr"
     10550 -> "105.50 Cr" */
  function money(lakhs) {
    const l = Number(lakhs) || 0;
    if (l >= 100) {
      const cr = l / 100;
      return (cr % 1 === 0 ? cr : cr.toFixed(2)) + ' Cr';
    }
    return l + ' L';
  }

  /* Country flag emoji */
  function flag(country) {
    return ISPL.config.flagOf(country);
  }

  /* Delay a function */
  function debounce(fn, ms = 200) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  return { $, $$, uid, esc, money, flag, debounce };
})();
