(() => {
  document.querySelectorAll('[data-creative-notebook]').forEach(notebook => {
    const links = [...notebook.querySelectorAll('.notebook-nav a')];
    const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
    let frame = 0;
    const update = () => {
      frame = 0;
      const mobile = window.matchMedia('(max-width:760px)').matches;
      const threshold = mobile ? 225 : 165;
      let active = 0;
      chapters.forEach((chapter, index) => {
        if (chapter.getBoundingClientRect().top <= threshold) active = index;
      });
      links.forEach((link, index) => {
        link.classList.toggle('is-active', index === active);
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    update();

    const dialog = notebook.querySelector('.notebook-lightbox');
    const preview = dialog.querySelector('img');
    const title = dialog.querySelector('#notebook-lightbox-title');
    const closeButton = dialog.querySelector('[data-notebook-close]');
    if (typeof dialog.showModal !== 'function') return;
    notebook.querySelectorAll('[data-notebook-image]').forEach(button => {
      button.addEventListener('click', () => {
        const image = button.querySelector('img');
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;
        title.textContent = button.dataset.caption;
        dialog.showModal();
        document.body.classList.add('notebook-preview-open');
        closeButton.focus();
      });
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('notebook-preview-open');
      preview.removeAttribute('src');
    });
  });
})();
