(() => {
  const links = [...document.querySelectorAll('.project-sections a')];
  const targets = links.map(link => document.querySelector(link.hash));
  let frame = 0;
  const updateNavigation = () => {
    frame = 0;
    let active = 0;
    targets.forEach((target, index) => {
      if (target && target.getBoundingClientRect().top <= 160) active = index;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) active = links.length - 1;
    links.forEach((link, index) => {
      link.classList.toggle('is-active', index === active);
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateNavigation);
  }, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
  function bindGallery(gallery) {
    const image = gallery.querySelector('.asset-stage > img');
    const caption = gallery.querySelector('[data-asset-caption]');
    const count = gallery.querySelector('[data-asset-count]');
    const thumbnails = [...gallery.querySelectorAll('.asset-thumb')];
    const strip = gallery.querySelector('.asset-thumbnails');
    let pointer = null;
    let suppressClick = false;
    strip.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      suppressClick = false;
      pointer = {id:event.pointerId, x:event.clientX, scroll:strip.scrollLeft, dragging:false};
    });
    strip.addEventListener('pointermove', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (event.buttons !== 1) {
        strip.classList.remove('is-dragging');
        pointer = null;
        return;
      }
      const distance = event.clientX - pointer.x;
      if (!pointer.dragging && Math.abs(distance) > 5) {
        pointer.dragging = true;
        strip.setPointerCapture(event.pointerId);
        strip.classList.add('is-dragging');
      }
      if (pointer.dragging) {
        event.preventDefault();
        strip.scrollLeft = pointer.scroll - distance;
      }
    });
    const finishDrag = event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      suppressClick = pointer.dragging;
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
      strip.classList.remove('is-dragging');
      pointer = null;
    };
    strip.addEventListener('pointerup', finishDrag);
    strip.addEventListener('pointercancel', finishDrag);
    strip.addEventListener('pointerleave', () => { if (pointer && !pointer.dragging) pointer = null; });
    strip.addEventListener('lostpointercapture', () => {
      strip.classList.remove('is-dragging');
      pointer = null;
    });
    strip.addEventListener('click', event => {
      if (event.detail === 0) { suppressClick = false; return; }
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
    strip.addEventListener('dragstart', event => event.preventDefault());
    const select = index => {
      const button = thumbnails[index];
      image.src = button.dataset.assetSrc;
      image.alt = button.dataset.assetAlt;
      caption.textContent = button.dataset.assetTitle;
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(thumbnails.length).padStart(2, '0')}`;
      thumbnails.forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    };
    thumbnails.forEach((button, index) => {
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % thumbnails.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + thumbnails.length) % thumbnails.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = thumbnails.length - 1;
        else return;
        event.preventDefault();
        select(next);
        thumbnails[next].focus();
      });
    });
  }
  document.querySelectorAll('[data-asset-library]').forEach(library => {
    const data = JSON.parse(library.querySelector('[data-project-assets]').textContent);
    const tabs = [...library.querySelectorAll('[data-asset-category]')];
    const panel = library.querySelector('[role="tabpanel"]');
    const render = tab => {
      const category = tab.dataset.assetCategory;
      const items = data[category] || [];
      tabs.forEach(button => {
        const selected = button === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      panel.replaceChildren();
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'asset-empty';
        const title = document.createElement('p');
        title.textContent = `${tab.childNodes[0].textContent}待添加`;
        const note = document.createElement('span');
        note.textContent = '本分类图片将在这里展示';
        empty.append(title, note);
        panel.append(empty);
        return;
      }
      const gallery = document.createElement('div');
      gallery.className = 'asset-gallery';
      gallery.innerHTML = '<figure class="asset-stage"><img width="1672" height="941"><figcaption aria-live="polite"><span data-asset-caption></span><span data-asset-count></span></figcaption></figure><div class="asset-thumbnails" aria-label="选择分类图片"></div>';
      const image = gallery.querySelector('.asset-stage > img');
      image.src = items[0].src;
      image.alt = items[0].alt;
      gallery.querySelector('[data-asset-caption]').textContent = items[0].title;
      gallery.querySelector('[data-asset-count]').textContent = `01 / ${String(items.length).padStart(2, '0')}`;
      items.forEach((item, index) => {
        const button = document.createElement('button');
        button.className = `asset-thumb${index === 0 ? ' is-selected' : ''}`;
        button.type = 'button';
        button.setAttribute('aria-pressed', String(index === 0));
        button.dataset.assetSrc = item.src;
        button.dataset.assetTitle = item.title;
        button.dataset.assetAlt = item.alt;
        const thumbnail = document.createElement('img');
        thumbnail.src = item.src;
        thumbnail.alt = '';
        thumbnail.width = 160;
        thumbnail.height = 90;
        thumbnail.loading = 'lazy';
        const label = document.createElement('span');
        label.append(`${String(index + 1).padStart(2, '0')} `);
        const name = document.createElement('b');
        name.textContent = item.title;
        label.append(name);
        button.append(thumbnail, label);
        gallery.querySelector('.asset-thumbnails').append(button);
      });
      panel.append(gallery);
      bindGallery(gallery);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => render(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        render(tabs[next]);
        tabs[next].focus({preventScroll:true});
      });
    });
    render(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
  const video = document.querySelector('.project-screen video');
  if (!video) return;
  // Stop audio when leaving this project, including browser back navigation.
  window.addEventListener('pagehide', () => video.pause());
})();
