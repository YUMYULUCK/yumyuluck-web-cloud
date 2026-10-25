(() => {
  const room = document.querySelector('.film-room');
  if (!room) return;
  const buttons = [...room.querySelectorAll('[data-film-category]')];
  const panels = [...room.querySelectorAll('[data-film-panel]')];
  const announcer = room.querySelector('#film-announcer');
  const machineStatus = room.querySelector('#machine-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeButton = null;
  let scrollFrame = 0;

  function closePanel(returnFocus = false) {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    const previousButton = activeButton;
    buttons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    panels.forEach(panel => { panel.hidden = true; panel.classList.remove('is-opening'); });
    activeButton = null;
    room.classList.remove('is-projecting');
    machineStatus.textContent = '等待选片';
    announcer.textContent = '胶片已收回';
    if (returnFocus) previousButton?.focus({ preventScroll: true });
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    if (activeButton === button) { closePanel(); return; }
    closePanel();
    activeButton = button;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.classList.add('is-opening');
    const name = panel.querySelector('h3').textContent;
    const count = panel.querySelectorAll('.film-frame').length;
    machineStatus.textContent = `已选片 · ${name}`;
    announcer.textContent = `${name}胶片已展开，${count}部作品${count ? '' : '，作品待补充'}`;
    room.classList.add('is-projecting');
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      panel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
    });
  }));
  panels.forEach(panel => panel.querySelector('.film-panel-close').addEventListener('click', () => closePanel(true)));
  room.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeButton) { event.preventDefault(); closePanel(true); }
  });
  // Only run the mechanical reels while this chapter is visible.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => room.classList.toggle('is-offscreen', !entry.isIntersecting));
    observer.observe(room);
  }
})();
