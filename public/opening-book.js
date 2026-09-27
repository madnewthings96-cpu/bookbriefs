/* Runs before the application bundle so the first visit has immediate feedback. */
(() => {
  const loader = document.getElementById('opening-book');
  const root = document.getElementById('root');
  if (!loader || !root) return;
  const sessionKey = 'ta7leel:opening-book-seen';
  try {
    if (sessionStorage.getItem(sessionKey)) {
      loader.remove();
      return;
    }
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // Storage restrictions must never prevent access to the application.
  }
  if (location.pathname.startsWith('/ar/')) {
    loader.dir = 'rtl';
    loader.lang = 'ar';
    loader.querySelector('.opening-heading').textContent = 'فكرتك القادمة بانتظارك';
    loader.querySelector('.opening-status').textContent = 'نفتح فصلاً جديداً';
    loader.querySelector('.opening-skip').textContent = 'المتابعة إلى الموقع';
  }
  loader.hidden = false;
  loader.removeAttribute('aria-hidden');
  const wasInert = root.inert;
  root.inert = true;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(failsafe);
    window.removeEventListener('ta7leel:page-ready', dismiss);
    root.inert = wasInert;
    if (loader.contains(document.activeElement)) document.activeElement.blur();
    loader.setAttribute('aria-hidden', 'true');
    loader.classList.add('opening-leaving');
    setTimeout(() => loader.remove(), 260);
  };
  const failsafe = setTimeout(dismiss, 8000);
  window.addEventListener('ta7leel:page-ready', dismiss, { once: true });
  loader.querySelector('.opening-skip').addEventListener('click', dismiss);
})();
