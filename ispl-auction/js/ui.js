/* =========================================================
   UI — modal + toast helpers
   Used by every view. No business logic here.
   ========================================================= */

ISPL.ui = (function () {

  const { $, $$ } = ISPL.utils;

  /* ---------- TOAST ---------- */
  function toast(msg, type = '') {
    const el = $('#toast');
    if (!el) return;

    el.textContent = msg;
    el.className = 'on ' + type;   // 'on ok'  or  'on err'

    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.className = type;          // keep color class, drop 'on'
    }, 2400);
  }

  /* ---------- MODAL ---------- */
  /*
     openModal(title, bodyHTML, afterInit)
       - title     : string
       - bodyHTML  : inner HTML for .mbody
       - afterInit : optional (root) => {} — wire up buttons/inputs after insert

     Any element with [data-close] closes the modal when clicked.
     Clicking the backdrop closes it. Esc key closes it.
  */
  function openModal(title, bodyHTML, afterInit) {
    const root = $('#modalRoot');
    if (!root) return;

    root.innerHTML = `
      <div class="backdrop">
        <div class="modal">
          <header>
            <h3>${title}</h3>
            <button class="x" aria-label="Close">&times;</button>
          </header>
          <div class="mbody">${bodyHTML}</div>
        </div>
      </div>`;

    root.classList.add('open');

    /* Close handlers */
    $('.x', root).onclick = closeModal;
    $('.backdrop', root).onclick = e => {
      if (e.target.classList.contains('backdrop')) closeModal();
    };
    $$('[data-close]', root).forEach(b => { b.onclick = closeModal; });

    /* Esc to close — bound once, removed on close */
    document.addEventListener('keydown', escClose, true);

    /* Let the caller wire up buttons/inputs */
    if (typeof afterInit === 'function') afterInit(root);
  }

  function escClose(e) {
    if (e.key === 'Escape') closeModal();
  }

  function closeModal() {
    const root = $('#modalRoot');
    if (!root) return;
    root.classList.remove('open');
    root.innerHTML = '';
    document.removeEventListener('keydown', escClose, true);
  }

  /* ---------- CONFIRM ---------- */
  /* Wraps window.confirm so you can swap it for a custom dialog later
     without touching every view. */
  function confirm(msg) {
    return window.confirm(msg);
  }

  return { toast, openModal, closeModal, confirm };
})();