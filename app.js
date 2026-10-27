const progress = document.querySelector('.reading-progress');
const fixedHeader = document.querySelector('.home-header');
const lightSections = [...document.querySelectorAll('.dunhuang, .sakura, .project-veo, .profile, .film-room')];
let scheduled = false;
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0})`;
  fixedHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  const headerMiddle = fixedHeader.offsetHeight / 2;
  fixedHeader.classList.toggle('on-light', lightSections.some(section => {
    if (section.dataset.colorScheme === 'dark') return false;
    const bounds = section.getBoundingClientRect();
    return bounds.top <= headerMiddle && bounds.bottom > headerMiddle;
  }));
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { requestAnimationFrame(updateProgress); scheduled = true; }
}, {passive: true});
window.addEventListener('resize', updateProgress);
window.addEventListener('festivalthemechange', updateProgress);
updateProgress();

const backgroundVideo = document.querySelector('.home-film');
const playbackButton = document.querySelector('.home-playback');
if (backgroundVideo && playbackButton) {
  const updatePlayback = () => {
    const paused = backgroundVideo.paused;
    playbackButton.querySelector('.playback-label').textContent = paused ? '播放背景' : '暂停背景';
    playbackButton.querySelector('.playback-symbol').textContent = paused ? '▷' : 'Ⅱ';
    playbackButton.setAttribute('aria-label', paused ? '播放背景视频' : '暂停背景视频');
  };
  backgroundVideo.addEventListener('play', updatePlayback);
  backgroundVideo.addEventListener('pause', updatePlayback);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    backgroundVideo.autoplay = false;
    backgroundVideo.pause();
    updatePlayback();
  } else {
    backgroundVideo.play().catch(updatePlayback);
  }
  playbackButton.addEventListener('click', () => {
    if (backgroundVideo.paused) backgroundVideo.play().catch(updatePlayback);
    else backgroundVideo.pause();
  });
}
