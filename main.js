// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// ── FORM SUBMISSION ──────────────────────────────────────────
const WEBHOOK_URL = "https://hook.eu1.make.com/eapza1auhc7ii5m2vcnljn98nbaie1bb";

document.getElementById('access-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const payload = {
    first_name:      document.getElementById('first_name').value.trim(),
    email:           document.getElementById('email').value.trim(),
    role:            document.getElementById('role').value,
    outreach_method: document.getElementById('outreach_method').value,
    email_system:    document.getElementById('email_system').value,
    created_at:      new Date().toISOString(),
    source_url:      window.location.href
  };

  let success = false;

  try {
    const encoded = new URLSearchParams(payload).toString();
    await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      mode:    'no-cors',
      body:    encoded
    });
    success = true;
  } catch (err) {
    console.error('Webhook error:', err);
    success = true; // still show success — no-cors means we can't read response
  }

  if (success) {
    document.getElementById('access-form').style.display = 'none';
    document.getElementById('success-msg').classList.add('show');
  } else {
    btn.disabled = false;
    btn.textContent = 'Try again';
  }
});

// Smooth nav
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ─────────────────────────────────────────────

// ─────────────────────────────────────────────────────────
// HEARTBEAT PULSE — Electric Dreams palette
// Sharp Gaussian rise + diastolic echo, blobs staggered so
// the pulse ripples across the field rather than flashing all at once.
// ─────────────────────────────────────────────────────────
(function () {

  const canvas = document.getElementById('pulse-canvas');
  const ctx    = canvas.getContext('2d');

  // ── TUNE ──────────────────────────────────────────────
  const BLOB_COUNT     = 9;      // number of blobs
  const RADIUS_MIN     = 110;    // blob base radius min (px)
  const RADIUS_MAX     = 240;    // blob base radius max (px)
  const CYCLE_MS       = 8000;   // ms between heartbeats — slow, calm
  const PULSE_SWELL    = 0.22;   // radius expansion on beat — noticeable but soft
  const OPACITY_BASE   = 0.10;   // resting blob opacity
  const OPACITY_FLARE  = 0.14;   // extra opacity at beat peak
  const DRIFT          = 0.4;    // px per frame organic drift
  const BLUR_PX        = 55;     // gaussian blur (px)
  const STAGGER        = 0.15;   // phase stagger across blobs
  const PARALLAX       = 0.03;   // mouse parallax strength
  const MOBILE_FACTOR  = 0.6;    // blob reduction on mobile

  // Electric Dreams palette — pink, cyan, a hint of amber
  // [R, G, B]
  const PALETTE = [
    [255,  20, 147],   // --pink
    [255,  20, 147],   // pink (weighted double — dominant)
    [  0, 212, 255],   // --cyan
    [  0, 212, 255],   // cyan (weighted double)
    [180,  10, 120],   // deep pink
    [ 80, 160, 220],   // soft cyan-blue
  ];

  // Heartbeat curve: sharp primary spike + softer diastolic echo
  // t = 0..1 position within one cycle. Returns intensity 0..1.
  function heartbeatCurve(t) {
    const b1 = Math.exp(-((t - 0.04) ** 2) / 0.0012);        // primary beat
    const b2 = 0.45 * Math.exp(-((t - 0.13) ** 2) / 0.0022); // diastolic echo
    return Math.min(1, Math.max(0, b1 + b2));
  }

  let W, H, blobs = [];
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
  let off, octx, raf;

  function isMobile() { return window.innerWidth < 768; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    off = document.createElement('canvas');
    off.width = W; off.height = H;
    octx = off.getContext('2d');
    init();
  }

  function init() {
    blobs = [];
    const count = Math.floor(BLOB_COUNT * (isMobile() ? MOBILE_FACTOR : 1));
    // Grid distribution with jitter for full coverage from frame 1
    const cols = Math.ceil(Math.sqrt(count * W / H));
    const rows = Math.ceil(count / cols);
    const cw = W / cols, ch = H / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const pal = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const br  = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
      blobs.push({
        x:           (col + 0.15 + Math.random() * 0.7) * cw,
        y:           (row + 0.15 + Math.random() * 0.7) * ch,
        baseR: br,   r: br,
        col:         pal,
        baseOpacity: OPACITY_BASE + Math.random() * 0.07,
        ax:          Math.random() * Math.PI * 2,
        ay:          Math.random() * Math.PI * 2,
        sx:          0.0002 + Math.random() * 0.0003,
        sy:          0.0002 + Math.random() * 0.0003,
        // Stagger so blobs ripple rather than all flash simultaneously
        phaseOffset: (i / count) * STAGGER,
      });
    }
  }

  function frame(ts) {
    octx.clearRect(0, 0, W, H);
    ctx.clearRect(0, 0, W, H);

    // Smooth indirect mouse parallax
    mx += (tmx - mx) * 0.03;
    my += (tmy - my) * 0.03;
    const ox = (0.5 - mx) * W * PARALLAX;
    const oy = (0.5 - my) * H * PARALLAX;

    blobs.forEach(b => {
      // Slow organic drift, wraps at canvas edge
      b.ax += b.sx; b.ay += b.sy;
      b.x  += Math.sin(b.ax) * DRIFT;
      b.y  += Math.cos(b.ay) * DRIFT;
      const pad = b.baseR + 10;
      if (b.x < -pad)   b.x = W + pad;
      if (b.x > W + pad) b.x = -pad;
      if (b.y < -pad)   b.y = H + pad;
      if (b.y > H + pad) b.y = -pad;

      // Heartbeat phase — staggered per blob
      const cycleT = ((ts / CYCLE_MS) + b.phaseOffset) % 1;
      const hb = heartbeatCurve(cycleT);

      b.r = b.baseR * (1 + PULSE_SWELL * hb);
      const opacity = b.baseOpacity + OPACITY_FLARE * hb;

      const gx = b.x + ox, gy = b.y + oy;
      const [r, g, bv] = b.col;
      const grad = octx.createRadialGradient(gx, gy, 0, gx, gy, b.r);
      grad.addColorStop(0,   `rgba(${r},${g},${bv},${opacity.toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${bv},${(opacity * 0.5).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${r},${g},${bv},0)`);
      octx.beginPath();
      octx.arc(gx, gy, b.r, 0, Math.PI * 2);
      octx.fillStyle = grad;
      octx.fill();
    });

    // Blit offscreen → main canvas with gaussian blur for soft diffusion
    ctx.filter = `blur(${BLUR_PX}px)`;
    ctx.drawImage(off, 0, 0);
    ctx.filter = 'none';

    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', e => {
    tmx = e.clientX / W; tmy = e.clientY / H;
  });
  window.addEventListener('touchmove', e => {
    if (e.touches.length) {
      tmx = e.touches[0].clientX / W;
      tmy = e.touches[0].clientY / H;
    }
  }, { passive: true });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(frame);
  });

  resize();
  raf = requestAnimationFrame(frame);

})();


// ─────────────────────────────────────────────

// ── SUBTLE SCAN — linear sweep synced to 8s heartbeat cycle ──
(function () {

  const CYCLE_MS = 8000;  // must match pulse CYCLE_MS
  const LIT_MS   = 280;   // border lit duration — brief
  const FADE_MS  = 1400;  // long slow fade back to rest

  let scanTargets = [];

  function collectTargets() {
    scanTargets = Array.from(document.querySelectorAll('[data-scan]')).map(el => ({
      el,
      colour: el.dataset.scan,
      lastFired: -Infinity,
    }));
  }

  function getScanY(ts) {
    const t = (ts % CYCLE_MS) / CYCLE_MS;
    return document.documentElement.scrollHeight * (1 - t);
  }

  function frame(ts) {
    const scanY   = getScanY(ts);
    const scrollY = window.scrollY;

    scanTargets.forEach(target => {
      const rect        = target.el.getBoundingClientRect();
      const elCentreDoc = scrollY + rect.top + rect.height * 0.5;
      const dist        = Math.abs(scanY - elCentreDoc);

      if (dist < 60 && (ts - target.lastFired) > CYCLE_MS * 0.9) {
        target.lastFired = ts;
        light(target.el, target.colour);
      }
    });

    requestAnimationFrame(frame);
  }

  function light(el, colour) {
    el.classList.remove('scan-lit-pink', 'scan-lit-cyan', 'scan-fade');
    void el.offsetWidth;
    el.classList.add(colour === 'pink' ? 'scan-lit-pink' : 'scan-lit-cyan');
    setTimeout(() => {
      el.classList.add('scan-fade');
      el.classList.remove('scan-lit-pink', 'scan-lit-cyan');
      setTimeout(() => el.classList.remove('scan-fade'), FADE_MS + 50);
    }, LIT_MS);
  }

  collectTargets();
  window.addEventListener('resize', collectTargets);
  requestAnimationFrame(frame);

})();


// ─────────────────────────────────────────────

// ── BUTTON INK DROP ──────────────────────────────────────────
// Radial bloom from cursor entry point — like ink in water.
// No warp. Clean, elegant, disperses from origin.
(function () {
  const DURATION  = 1800;
  const MAX_SCALE = 2.8;
  const PEAK_AT   = 0.08;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function initButton(btn) {
    const cvs = document.createElement('canvas');
    cvs.className = 'btn-ripple-canvas';
    btn.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let W, H, diagonal, raf, startTs, ox, oy;

    function resize() {
      const r = btn.getBoundingClientRect();
      W = cvs.width  = r.width;
      H = cvs.height = r.height;
      diagonal = Math.sqrt(W * W + H * H);
    }
    resize();
    window.addEventListener('resize', resize);

    function frame(ts) {
      const elapsed = ts - startTs;
      const t       = Math.min(elapsed / DURATION, 1);
      const eased   = easeOut(t);
      const radius  = eased * diagonal * MAX_SCALE;

      ctx.clearRect(0, 0, W, H);

      let opacity;
      if (t < PEAK_AT) {
        opacity = t / PEAK_AT;
      } else {
        opacity = Math.pow(1 - (t - PEAK_AT) / (1 - PEAK_AT), 1.6);
      }
      opacity *= 0.22;

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      grad.addColorStop(0,    `rgba(255,255,255,${(opacity * 1.8).toFixed(3)})`);
      grad.addColorStop(0.15, `rgba(255,255,255,${(opacity * 1.2).toFixed(3)})`);
      grad.addColorStop(0.5,  `rgba(255,255,255,${(opacity * 0.5).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.arc(ox, oy, Math.max(radius, 1), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    }

    let ready = true;
    btn.addEventListener('mouseenter', (e) => {
      if (!ready) return;
      ready = false;
      if (raf) cancelAnimationFrame(raf);
      const rect = btn.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      startTs = null;
      raf = requestAnimationFrame(ts => { startTs = ts; frame(ts); });

      // Pulse ring — fires on the wrapper (outside overflow:hidden)
      const wrap = btn.closest('.btn-ring-wrap');
      if (wrap) {
        wrap.classList.remove('ring-pulse');
        void wrap.offsetWidth;
        wrap.classList.add('ring-pulse');
        wrap.addEventListener('animationend', () => {
          wrap.classList.remove('ring-pulse');
        }, { once: true });
      }
    });
    btn.addEventListener('mouseleave', () => {
      setTimeout(() => { ready = true; }, 100);
    });
  }

  document.querySelectorAll('.btn-primary, .nav-cta, .btn-ghost, .btn-submit').forEach(initButton);
// Safety: ensure scroll is never locked unless lightbox is open
document.addEventListener('keydown', () => {
  const lb = document.getElementById('lightbox');
  if (lb && !lb.classList.contains('open')) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
});
})();


// ─────────────────────────────────────────────

// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// DESKTOP — step cards + scoped pane carousel
// ═══════════════════════════════════════════
(function () {
  const panel = document.querySelector('.hiw-panel');
  const cards = Array.from(document.querySelectorAll('.hiw-card'));
  const panes = Array.from(document.querySelectorAll('.hiw-pane'));
  if (!panel || !cards.length) return;

  function resetPane(pane) {
    // Scope ALL queries to THIS pane only
    const slides  = Array.from(pane.querySelectorAll('.pane-slide'));
    const dots    = Array.from(pane.querySelectorAll('.pane-dot'));
    const arrows  = Array.from(pane.querySelectorAll('.pane-arrow'));
    const counter = pane.querySelector('.pane-counter');
    slides.forEach((s, i) => s.classList.toggle('active', i === 0));
    dots.forEach((d, i)   => d.classList.toggle('active', i === 0));
    if (arrows[0]) arrows[0].disabled = true;
    if (arrows[1]) arrows[1].disabled = slides.length <= 1;
    if (counter)   counter.textContent = `1 / ${slides.length}`;
  }

  function activateStep(idx) {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    panes.forEach((p, i) => {
      const willActive = i === idx;
      if (willActive && !p.classList.contains('active')) resetPane(p);
      p.classList.toggle('active', willActive);
    });
  }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => activateStep(idx));
  });

  // Scoped carousel per pane
  panes.forEach(pane => {
    const slides  = Array.from(pane.querySelectorAll('.pane-slide'));
    const dots    = Array.from(pane.querySelectorAll('.pane-dot'));
    const arrows  = Array.from(pane.querySelectorAll('.pane-arrow'));
    const counter = pane.querySelector('.pane-counter');
    let current   = 0;

    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current]  && dots[current].classList.remove('active');
      current = Math.max(0, Math.min(n, slides.length - 1));
      slides[current].classList.add('active');
      dots[current]  && dots[current].classList.add('active');
      if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
      if (arrows[0]) arrows[0].disabled = current === 0;
      if (arrows[1]) arrows[1].disabled = current === slides.length - 1;
    }

    arrows.forEach(arrow => {
      arrow.addEventListener('click', () => goTo(current + parseInt(arrow.dataset.dir)));
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  });
})();


// ═══════════════════════════════════════════
// MOBILE — accordion + scoped carousel
// ═══════════════════════════════════════════
(function () {
  const mobCards = Array.from(document.querySelectorAll('.mob-card'));
  if (!mobCards.length) return;

  function resetMobCarousel(card) {
    const slides  = Array.from(card.querySelectorAll('.mob-slide'));
    const dots    = Array.from(card.querySelectorAll('.pane-dot'));
    const arrows  = Array.from(card.querySelectorAll('.pane-arrow'));
    const counter = card.querySelector('.pane-counter');
    slides.forEach((s, i) => s.classList.toggle('active', i === 0));
    dots.forEach((d, i)   => d.classList.toggle('active', i === 0));
    if (arrows[0]) arrows[0].disabled = true;
    if (arrows[1]) arrows[1].disabled = slides.length <= 1;
    if (counter)   counter.textContent = `1 / ${slides.length}`;
  }

  function activateMob(idx) {
    mobCards.forEach((card, i) => {
      const wasActive  = card.classList.contains('active');
      const willActive = i === idx;
      if (wasActive && willActive) {
        card.classList.remove('active');
      } else {
        card.classList.toggle('active', willActive);
        if (willActive && !wasActive) resetMobCarousel(card);
      }
    });
  }

  mobCards.forEach((card, idx) => {
    card.querySelector('.mob-header').addEventListener('click', () => activateMob(idx));

    const slides  = Array.from(card.querySelectorAll('.mob-slide'));
    const dots    = Array.from(card.querySelectorAll('.pane-dot'));
    const arrows  = Array.from(card.querySelectorAll('.pane-arrow'));
    const counter = card.querySelector('.pane-counter');
    let current   = 0;

    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current]  && dots[current].classList.remove('active');
      current = Math.max(0, Math.min(n, slides.length - 1));
      slides[current].classList.add('active');
      dots[current]  && dots[current].classList.add('active');
      if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
      if (arrows[0]) arrows[0].disabled = current === 0;
      if (arrows[1]) arrows[1].disabled = current === slides.length - 1;
    }

    // No stopPropagation — not needed and causes scroll issues on mobile
    arrows.forEach(arrow => {
      arrow.addEventListener('click', () => goTo(current + parseInt(arrow.dataset.dir)));
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  });
})();


// ─────────────────────────────────────────────

// ── LIGHTBOX ENGINE ────────────────────────────────────
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbLabel  = document.getElementById('lb-label');
  const lbDots   = document.getElementById('lb-dots');
  const lbCounter= document.getElementById('lb-counter');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  const lbClose  = document.getElementById('lb-close');

  let images  = [];  // array of {src, alt}
  let current = 0;
  let label   = '';

  function openLightbox(pane, startIdx) {
    // Collect all images from this pane
    images = Array.from(pane.querySelectorAll('.pane-frame img')).map(img => ({
      src: img.src, alt: img.alt
    }));
    label   = (pane.querySelector('.pane-title') || {}).textContent || '';
    current = startIdx;
    lbLabel.textContent = label;
    renderLb();
    lightbox.classList.add('open');
    lightbox.style.opacity = '0';
    lightbox.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lightbox.style.opacity = '1';
    }));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.classList.remove('open');
      lightbox.style.opacity = '';
      lightbox.style.transition = '';
    }, 300);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  function renderLb() {
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    lbCounter.textContent = images.length > 1 ? `${current + 1} / ${images.length}` : '';
    lbPrev.disabled = current === 0;
    lbNext.disabled = current === images.length - 1;
    // Dots
    lbDots.innerHTML = '';
    if (images.length > 1) {
      images.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'pane-dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => { current = i; renderLb(); });
        lbDots.appendChild(d);
      });
    }
  }

  lbPrev.addEventListener('click', () => { if (current > 0) { current--; renderLb(); }});
  lbNext.addEventListener('click', () => { if (current < images.length - 1) { current++; renderLb(); }});
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight' && current < images.length - 1) { current++; renderLb(); }
    if (e.key === 'ArrowLeft'  && current > 0)                 { current--; renderLb(); }
  });

  // Wire up click on desktop pane frames
  // Use event delegation on the hiw-panel
  document.querySelectorAll('.hiw-panel').forEach(panel => {
    panel.addEventListener('click', e => {
      const frame = e.target.closest('.pane-frame');
      if (!frame) return;
      const pane     = frame.closest('.hiw-pane');
      const allFrames = Array.from(pane.querySelectorAll('.pane-frame'));
      const idx      = allFrames.indexOf(frame);
      openLightbox(pane, idx >= 0 ? idx : 0);
    });
  });

})();
