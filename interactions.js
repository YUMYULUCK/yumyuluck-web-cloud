(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibleProjects = new Set();
  let depthFrame = 0;
  const updateDepth = () => {
    depthFrame = 0;
    if (reducedMotion.matches) return;
    const amount = innerWidth <= 640 ? 16 : 34;
    visibleProjects.forEach(project => {
      const bounds = project.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - bounds.top - bounds.height / 2) / ((innerHeight + bounds.height) / 2)));
      project.style.setProperty('--depth-y', `${(progress * amount).toFixed(2)}px`);
    });
  };
  const scheduleDepth = () => {
    if (!depthFrame && !reducedMotion.matches) depthFrame = requestAnimationFrame(updateDepth);
  };
  if ('IntersectionObserver' in window) {
    const depthObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleProjects.add(entry.target);
        else visibleProjects.delete(entry.target);
      });
      scheduleDepth();
    });
    document.querySelectorAll('.project').forEach(project => depthObserver.observe(project));
    window.addEventListener('scroll', scheduleDepth, { passive: true });
    window.addEventListener('resize', scheduleDepth);
    reducedMotion.addEventListener('change', () => {
      document.querySelectorAll('.project').forEach(project => project.style.removeProperty('--depth-y'));
      scheduleDepth();
    });
  }
})();
