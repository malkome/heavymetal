
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

// --- Robust swipe with threshold & velocity ---
(function() {
  const container = document.getElementById('slides-container');
  let startX = 0, startY = 0, isDragging = false;
  let currentX = 0, currentY = 0;
  let startTime = 0;
  let baseOffset = 0; // px
  let animReq = 0;

  function getWidth() { return container.clientWidth; }
  function setTranslate(px) {
    container.style.transform = `translate3d(${px}px, 0, 0)`;
  }

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

    // Activate horizontal drag only when horizontal intent is clear
    if (!isDragging) { if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
        isDragging = true;
      } else {
        return; // let browser handle vertical scroll
      }
    }

    // Prevent vertical scroll while dragging horizontally
    e.preventDefault();
    setTranslate(baseOffset + dx);
  }

  function onTouchEnd(e) {
    const dt = Math.max(1, performance.now() - startTime);
    const dx = currentX - startX;
    const vx = dx / dt; // px per ms

    // thresholds
    const width = getWidth();
    const DIST_THRESHOLD = Math.min(0.7 * width, 500); // 70% or 500px
    const VELO_THRESHOLD = 1.2; // px per ms (~1200 px/s)ng) {
      if (Math.abs(dx) > DIST_THRESHOLD || Math.abs(vx) > VELO_THRESHOLD) {
        if (dx < 0 && currentSlide < totalSlides - 1) { currentSlide++; moved = true; }
        if (dx > 0 && currentSlide > 0) { currentSlide--; moved = true; }
      }
    }
    // Snap to the final slide position
    updateSlide();
    // Cleanup
    startX = startY = currentX = currentY = 0;
    startTime = 0;
    isDragging = false;
    container.classList.remove('dragging');
  }

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: true });
})();
