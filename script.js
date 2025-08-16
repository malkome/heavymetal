
// --- Viewport height lock (mobile) ---
(function() {
  function setVh() {
    const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  let rafId = null;
  function onResize() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(setVh);
  }
  setVh();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
})();


function scrollMainToTop() {
  const mc = document.querySelector('.main-content');
  if (mc) {
    try {
      // Instant jump to top to avoid visible delay on slide switch
      mc.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch(e) {
      mc.scrollTop = 0;
      mc.scrollLeft = 0;
    }
  }
}

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slidesContainer = document.getElementById('slides-container');
const currentSlideSpan = document.getElementById('current-slide');
const totalSlidesSpan = document.getElementById('total-slides');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const indicatorsContainer = document.getElementById('indicators');
// Initialize
totalSlidesSpan.textContent = totalSlides;
// Create indicators
for (let i = 0; i < totalSlides; i++) {
  const indicator = document.createElement('div');
  indicator.classList.add('indicator');
  if (i === 0) indicator.classList.add('active');
  indicator.addEventListener('click', () => goToSlide(i));
  indicatorsContainer.appendChild(indicator);
}
function updateSlide() {
  slidesContainer.style.transform = `translate3d(${-currentSlide * slidesContainer.clientWidth}px,0,0)`;
  currentSlideSpan.textContent = currentSlide + 1;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((el, idx) => el.classList.toggle('active', idx === currentSlide));
}
function nextSlide() { if (currentSlide < totalSlides - 1) { currentSlide++; updateSlide();
// ensure top after init
scrollMainToTop(); } }
function previousSlide() { if (currentSlide > 0) { currentSlide--; updateSlide();
// ensure top after init
scrollMainToTop(); } }
function goToSlide(index) { if (index >= 0 && index < totalSlides) { currentSlide = index; updateSlide();
// ensure top after init
scrollMainToTop(); } }
// Keyboard
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowRight': case ' ': e.preventDefault(); nextSlide(); break;
    case 'ArrowLeft': e.preventDefault(); previousSlide(); break;
    case 'Home': e.preventDefault(); goToSlide(0); break;
    case 'End': e.preventDefault(); goToSlide(totalSlides - 1); break;
  }
});
updateSlide();
// ensure top after init
scrollMainToTop();

// --- Robust swipe with threshold & velocity (fixed 2025-08-16) ---
(function() {
  const container = document.getElementById('slides-container');
  if (!container) return;

  let startX = 0, startY = 0, isDragging = false;
  let currentX = 0, currentY = 0;
  let startTime = 0;
  let baseOffset = 0; // px

  function getWidth() { return container.clientWidth; }
  function setTranslate(px) { container.style.transform = `translate3d(${px}px, 0, 0)`; }

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = currentX = t.clientX;
    startY = currentY = t.clientY;
    startTime = performance.now();
    baseOffset = -currentSlide * getWidth();
    isDragging = false;
    container.classList.add('dragging');
  }

  function onTouchMove(e) {
    if (!startTime) return;
    const t = e.touches[0];
    currentX = t.clientX;
    currentY = t.clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;

    if (!isDragging) {
      if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
        isDragging = true;
      } else {
        return; // allow vertical scrolling
      }
    }
    e.preventDefault();
    setTranslate(baseOffset + dx);
  }

  function onTouchEnd() {
    if (!startTime) return;

    const dt = Math.max(1, performance.now() - startTime);
    const dx = currentX - startX;
    const vx = dx / dt; // px/ms

    const width = getWidth();
    const DIST_THRESHOLD = Math.min(0.25 * width, 200); // 25% or 200px
    const VELO_THRESHOLD = 0.6; // ~600 px/s

    if (Math.abs(dx) > DIST_THRESHOLD || Math.abs(vx) > VELO_THRESHOLD) {
      if (dx < 0 && currentSlide < totalSlides - 1) currentSlide++;
      else if (dx > 0 && currentSlide > 0) currentSlide--;
    }

    updateSlide();
    scrollMainToTop();

    startX = startY = currentX = currentY = 0;
    startTime = 0;
    isDragging = false;
    container.classList.remove('dragging');
  }

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: true });

  // Re-snap on resize (because we use px translate)
  window.addEventListener('resize', () => {
    const original = container.style.transition;
    container.style.transition = 'none';
    updateSlide();
    requestAnimationFrame(() => { container.style.transition = original; });
  });
})();
