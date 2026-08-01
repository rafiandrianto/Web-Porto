const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- ambient ascii/data symbols in hero ---------- */
(function initAmbient() {
  const symbols = ['0','1','∑','μ','σ','β','λ','{ }','[ ]','~','#','%','.csv','.py','df.','n=','R²','p<','~ε','α','w','b','X','y','ŷ','J(w,b)','L','∇','η','θ','γ','df.fit()','df.predict()','x_train','x_test','y_train','y_test','lr=','epochs=','batch_size=','k=','C=','γ_rbf','f1_score','AUC','ROC','MAE','MSE','RMSE','ReLU','Softmax','Sigmoid'];
  const ambient = document.getElementById('ambient');
  if (!ambient || prefersReduced) return;

  const count = window.innerWidth < 768 ? 14 : 30;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    if (Math.random() < 0.12) el.classList.add('signal');
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    const duration = 14 + Math.random() * 18;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = -(Math.random() * duration) + 's';
    el.style.fontSize = (0.7 + Math.random() * 0.6) + 'rem';
    ambient.appendChild(el);
  }
})();

/* ---------- weighted section-to-section scrolling (desktop only) ---------- */
const main = document.querySelector('main');
const sections = Array.from(document.querySelectorAll('section'));
const dots = document.querySelectorAll('.dotnav button');

let current = 0;
let isAnimating = false;

// Higher = heavier / slower. This is the main knob for scroll "weight".
const SCROLL_DURATION = 1050;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function isDesktop() {
  return window.innerWidth >= 769;
}

function scrollToSection(index) {
  index = Math.max(0, Math.min(sections.length - 1, index));
  const target = sections[index].offsetTop;
  const start = main.scrollTop;
  const distance = target - start;

  current = index;

  if (prefersReduced || distance === 0) {
    main.scrollTop = target;
    return;
  }

  isAnimating = true;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / SCROLL_DURATION, 1);
    main.scrollTop = start + distance * easeInOutCubic(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      isAnimating = false;
    }
  }
  requestAnimationFrame(step);
}

// Wheel: one gesture = one section, with a deliberate eased travel time.
main.addEventListener('wheel', (e) => {
  if (!isDesktop() || prefersReduced) return;
  e.preventDefault();
  if (isAnimating) return;
  if (e.deltaY > 8) scrollToSection(current + 1);
  else if (e.deltaY < -8) scrollToSection(current - 1);
}, { passive: false });

// Keyboard paging.
window.addEventListener('keydown', (e) => {
  if (!isDesktop() || prefersReduced) return;
  if (['ArrowDown', 'PageDown'].includes(e.key)) {
    e.preventDefault();
    scrollToSection(current + 1);
  } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    scrollToSection(current - 1);
  }
});

// Dot nav uses the same weighted animation.
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => scrollToSection(i));
});

/* ---------- scroll position sync + section reveal animation ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const idx = sections.indexOf(entry.target);
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      dots.forEach((d) => d.classList.toggle('active', d.dataset.target === entry.target.id));
      if (idx !== -1 && !isAnimating) current = idx;
    } else {
      entry.target.classList.remove('in-view');
    }
  });
}, { root: main, threshold: 0.4 });

sections.forEach((s) => revealObserver.observe(s));
