
/* ── CUSTOM CURSOR ──────────────────────────── */
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});
(function tickCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(tickCursor);
})();

document.querySelectorAll('a,button,.port-card,.fbtn,.skill-pill,.budget-radio').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hov'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
});

/* ── HEADER SCROLL ──────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── MOBILE NAV ─────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(l =>
  l.addEventListener('click', () => mobileNav.classList.remove('open'))
);

/* ── SCROLL REVEAL ──────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ── COUNTER ANIMATION ──────────────────────── */
function countUp(el, target, dur = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      countUp(e.target, parseInt(e.target.dataset.target));
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));

/* ── HERO CAROUSEL ──────────────────────────── */
(function carousel() {
  const track  = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  const bar    = document.getElementById('carouselBar');
  if (!track || !dotsEl || !bar) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const SPEED  = 4000;
  let cur = 0, timer = null;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'c-dot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => go(i, true));
    dotsEl.appendChild(d);
  });
  const dots = Array.from(dotsEl.querySelectorAll('.c-dot'));

  function go(next, manual = false) {
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('on');
    cur = (next + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('on');
    if (manual) { clearInterval(timer); startTimer(); }
  }

  function startTimer() {
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.transition = 'width ' + SPEED + 'ms linear';
    bar.style.width = '100%';
    timer = setInterval(() => go(cur + 1), SPEED);
  }

  // Init
  slides[0].classList.add('active');
  startTimer();

  // Pause on hover
  track.addEventListener('mouseenter', () => {
    clearInterval(timer);
    const w = parseFloat(bar.style.width);
    bar.style.transition = 'none';
    bar.style.width = w + '%';
  });
  track.addEventListener('mouseleave', () => {
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    startTimer();
  });

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) go(d > 0 ? cur + 1 : cur - 1, true);
  });
})();

/* ── PORTFOLIO FILTER ───────────────────────── */
const fbtns = document.querySelectorAll('.fbtn');
const cards = document.querySelectorAll('.port-card');

fbtns.forEach(btn => {
  btn.addEventListener('click', () => {
    fbtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach((c, i) => {
      const show = f === 'all' || c.dataset.cat === f;
      if (show) {
        c.style.display = '';
        setTimeout(() => { c.style.opacity = '1'; c.style.transform = ''; }, i * 50);
      } else {
        c.style.opacity = '0';
        c.style.transform = 'scale(0.94)';
        setTimeout(() => { c.style.display = 'none'; }, 280);
      }
    });
  });
});

/* ── MODALES ────────────────────────────────── */
window.openModal = function(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

/* ── SMOOTH SCROLL ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
  });
});

/* ── CONTACT FORM ───────────────────────────── */
const form       = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn  = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.classList.add('loading');
    const btnText = submitBtn.querySelector('.btn-submit-text');
    if (btnText) btnText.textContent = 'Enviando...';
    formStatus.style.display = 'none';
    formStatus.className = 'form-status';

    try {
      const res  = await fetch('send.php', { method: 'POST', body: new FormData(form) });
      const text = await res.text();
      if (res.ok && text.includes('success')) {
        formStatus.className = 'form-status success';
        formStatus.textContent = '✓ Mensaje enviado. Te respondo en menos de 24 horas.';
        form.reset();
      } else throw new Error();
    } catch {
      formStatus.className = 'form-status error';
      formStatus.textContent = '✕ Error al enviar. Escríbeme directamente a hola@nicolayev.co';
    } finally {
      submitBtn.classList.remove('loading');
      if (btnText) btnText.textContent = 'Enviar Mensaje';
    }
  });
}

/* ── PARALLAX ORBS ──────────────────────────── */
window.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 24;
  const y = (e.clientY / window.innerHeight - 0.5) * 24;
  const o1 = document.querySelector('.orb1');
  const o2 = document.querySelector('.orb2');
  if (o1) o1.style.transform = `translate(${x}px,${y}px)`;
  if (o2) o2.style.transform = `translate(${-x*.6}px,${-y*.6}px)`;
});

/* ── STAGGER TIMELINE ITEMS ─────────────────── */
document.querySelectorAll('.tl-item').forEach((item, i) => {
  item.style.transitionDelay = (i * 0.07) + 's';
  item.classList.add('reveal-up');
  revealObs.observe(item);
});

console.log('%cNicolayev Portfolio ✓', 'color:#0439d9;font-family:monospace;font-size:12px');
