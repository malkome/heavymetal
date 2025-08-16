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
  slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
  currentSlideSpan.textContent = currentSlide + 1;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((el, idx) => el.classList.toggle('active', idx === currentSlide));
}
function nextSlide() { if (currentSlide < totalSlides - 1) { currentSlide++; updateSlide(); } }
function previousSlide() { if (currentSlide > 0) { currentSlide--; updateSlide(); } }
function goToSlide(index) { if (index >= 0 && index < totalSlides) { currentSlide = index; updateSlide(); } }
// Keyboard
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowRight': case ' ': e.preventDefault(); nextSlide(); break;
    case 'ArrowLeft': e.preventDefault(); previousSlide(); break;
    case 'Home': e.preventDefault(); goToSlide(0); break;
    case 'End': e.preventDefault(); goToSlide(totalSlides - 1); break;
  }
});
// Touch
let startX = 0, startY = 0;
document.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; });
document.addEventListener('touchend', (e) => {
  if (!startX && !startY) return;
  const endX = e.changedTouches[0].clientX; const endY = e.changedTouches[0].clientY;
  const diffX = startX - endX; const diffY = startY - endY;
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) { if (diffX > 0) nextSlide(); else previousSlide(); }
  startX = 0; startY = 0;
});
updateSlide();