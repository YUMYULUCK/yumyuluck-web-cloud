(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || motionPreference.matches) return;

  const targets = document.querySelectorAll(
    '.profile-topline, .profile-greeting, .profile-portrait, .profile-info, .profile-footer, .section-heading, .index-links > a, .project-top, .project-title, .artwork, .project-bottom, .footer > *'
  );
  const reveal = element => {
    element.classList.remove('is-pending');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -36px 0px' });

  targets.forEach(element => {
    let delay = 0;
    if (element.classList.contains('project-title')) delay = 60;
    if (element.classList.contains('artwork')) delay = 120;
    if (element.classList.contains('project-bottom')) delay = 160;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.add('scroll-reveal', 'is-pending');
    observer.observe(element);
  });

  // Keyboard navigation must expose a focused control immediately.
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.scroll-reveal');
    if (target) reveal(target);
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      targets.forEach(reveal);
      observer.disconnect();
    }
  });
})();
