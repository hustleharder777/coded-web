/* ============================================================
   CODED — script.js  (terminal edition)
   ============================================================ */

/* ================================================================
   VAULT.HTML PAGE FADE-IN
   ================================================================ */
(function () {
  if (!document.getElementById('brandHero')) return;
  /* Body starts at opacity:0 (set inline in vault.html head).
     Adding page-ready triggers the CSS transition to opacity:1. */
  setTimeout(function () {
    document.body.classList.add('page-ready');
  }, 60);
})();

/* ================================================================
   2D TERMINAL RAIN
   ================================================================ */
(function () {
  const canvas  = document.getElementById('bg-canvas');
  const ctx     = canvas.getContext('2d');
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><:/\\|[]{}01';
  const COLORS  = ['#2dd47f', '#3aabd1', '#a85ed4'];
  const FS      = 13; /* px per column/row */

  let cols, drops, dropColors;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols       = Math.floor(canvas.width / FS);
    drops      = Array.from({ length: cols }, () => Math.random() * -60);
    dropColors = Array.from({ length: cols }, () => COLORS[Math.floor(Math.random() * 3)]);
  }

  resize();
  window.addEventListener('resize', resize);

  /* Only ~35% of columns active at any time — sparse, terminal feel */
  const ACTIVE_RATIO = 0.35;
  const active = Array.from({ length: 1 }, () => null)
    .map(() => drops.map(() => Math.random() < ACTIVE_RATIO));

  let lastTick = 0;
  const TICK_MS = 55; /* ~18fps — slow intentional terminal pace */

  function rain(ts) {
    requestAnimationFrame(rain);
    if (ts - lastTick < TICK_MS) return;
    lastTick = ts;

    /* Slow fade — long trails */
    ctx.fillStyle = 'rgba(4,4,6,0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FS}px "JetBrains Mono", monospace`;

    for (let i = 0; i < cols; i++) {
      if (!active[0][i]) continue;

      const y = drops[i] * FS;
      if (y < 0) { drops[i] += 0.4; continue; }

      const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];

      /* Leading char — brighter white tint */
      ctx.globalAlpha = 0.55;
      ctx.fillStyle   = '#fff';
      ctx.fillText(char, i * FS, y);

      /* Brand color underneath */
      ctx.globalAlpha = 0.18;
      ctx.fillStyle   = dropColors[i];
      ctx.fillText(char, i * FS, y);

      ctx.globalAlpha = 1;

      /* Reset column when it passes bottom */
      if (y > canvas.height && Math.random() > 0.978) {
        drops[i]      = Math.random() * -50;
        dropColors[i] = COLORS[Math.floor(Math.random() * 3)];
        active[0][i]  = Math.random() < ACTIVE_RATIO;
      }
      drops[i] += 0.38;
    }
  }

  requestAnimationFrame(rain);
})();


/* ================================================================
   PIXELVAULT-STYLE LOADER
   ================================================================ */
(function () {
  var CHARSET    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><:/\\|[]{}';
  var loader     = document.getElementById('loader');
  var cipherEl   = document.getElementById('loaderCipher');
  var CIPHER_LEN = 12;

  if (!loader || !cipherEl) return;

  document.body.style.overflow = 'hidden';

  function randCipherStr(len) {
    var s = '[';
    for (var i = 0; i < len; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    return s + ']';
  }

  var scrambleIv = setInterval(function () {
    cipherEl.textContent = randCipherStr(CIPHER_LEN);
  }, 80);

  var MIN_LOAD_MS = 1800;
  var start = performance.now();

  function onReady() {
    var wait = Math.max(0, MIN_LOAD_MS - (performance.now() - start));
    setTimeout(function () {
      clearInterval(scrambleIv);
      cipherEl.textContent = '[ACCESS_GRANTED]';
      cipherEl.classList.add('resolved');

      setTimeout(function () {
        loader.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(function () {
          loader.classList.add('hidden');
        }, 650);
      }, 500);
    }, wait);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


/* ================================================================
   VAULT ENTER — door transition
   ================================================================ */
(function () {
  var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><:/\\|[]{}';
  var btn     = document.getElementById('vaultEnter');
  var screen  = document.getElementById('entryScreen');
  if (!btn || !screen) return;

  btn.addEventListener('click', function () {
    btn.style.pointerEvents = 'none';

    /* 1. Scramble button text */
    var scrambles = 0;
    var iv = setInterval(function () {
      var r = '[';
      for (var i = 0; i < 11; i++) r += CHARSET[Math.floor(Math.random() * CHARSET.length)];
      r += ']';
      btn.textContent = r;
      if (++scrambles >= 8) {
        clearInterval(iv);
        btn.textContent = '[VAULT_OPEN...]';

        /* 2. Brief pause then fade out and navigate to vault.html */
        setTimeout(function () {
          document.body.classList.add('page-exit');
          setTimeout(function () {
            window.location.href = 'vault.html';
          }, 450);
        }, 280);
      }
    }, 60);
  });
})();


/* ================================================================
   SCROLL REVEAL
   ================================================================ */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});


/* ================================================================
   COLORWAY SHOWCASE — auto-cycle with progress indicators
   ================================================================ */
(function () {
  var colorways = [
    { id: 'emerald',  name: 'EMERALD',  price: '285' },
    { id: 'teal',     name: 'TEAL',     price: '285' },
    { id: 'violet',   name: 'VIOLET',   price: '285' },
    { id: 'cream',    name: 'CREAM',    price: '285' },
    { id: 'spectrum', name: 'SPECTRUM', price: '320' },
  ];

  var stage      = document.querySelector('.cw-stage');
  var slides     = document.querySelectorAll('.cw-slide');
  var indicators = document.querySelectorAll('.cw-indicator');
  var nameEl     = document.querySelector('.cw-showcase-name');
  var priceEl    = document.querySelector('.cw-showcase-price-val');
  var cta        = document.querySelector('.cw-bar-cta');

  if (!stage || !slides.length) return;

  var current  = 0;
  var timer    = null;
  var paused   = false;
  var DURATION = 3500;

  function goTo(idx) {
    slides[current].classList.remove('active');
    indicators[current].classList.remove('playing');
    indicators[current].classList.add('done');

    current = ((idx % colorways.length) + colorways.length) % colorways.length;

    /* Reset indicators after current */
    for (var i = current + 1; i < indicators.length; i++) {
      indicators[i].classList.remove('done', 'playing');
    }

    slides[current].classList.add('active');

    /* Force reflow so CSS transition restarts */
    void indicators[current].offsetWidth;
    indicators[current].classList.remove('done');
    indicators[current].classList.add('playing');

    nameEl.textContent  = colorways[current].name;
    priceEl.textContent = colorways[current].price;

    if (!paused) schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { goTo(current + 1); }, DURATION);
  }

  /* Pause auto-cycle on hover */
  stage.addEventListener('mouseenter', function () {
    paused = true;
    clearTimeout(timer);
    indicators[current].classList.remove('playing');
  });
  stage.addEventListener('mouseleave', function () {
    paused = false;
    void indicators[current].offsetWidth;
    indicators[current].classList.add('playing');
    schedule();
  });

  /* Click stage or CTA → sync colorway + scroll to product */
  function syncAndShop() {
    var cwId = colorways[current].id;
    document.querySelectorAll('.cw-swatch').forEach(function (sw) {
      if (sw.dataset.cw === cwId) sw.click();
    });
    var productSection = document.getElementById('product');
    if (productSection) productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  stage.addEventListener('click', syncAndShop);
  if (cta) cta.addEventListener('click', syncAndShop);

  /* Click indicator → jump to that colorway */
  indicators.forEach(function (ind, i) {
    ind.addEventListener('click', function (e) {
      e.stopPropagation();
      goTo(i);
    });
  });

  goTo(0);
})();


/* ================================================================
   PRODUCT IMAGE 3D TILT
   ================================================================ */
var productImgWrap = document.getElementById('productImgWrap');
if (productImgWrap) {
  productImgWrap.addEventListener('mousemove', function (e) {
    var r = productImgWrap.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width  - 0.5;
    var y = (e.clientY - r.top)  / r.height - 0.5;
    productImgWrap.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    productImgWrap.style.transform  = 'perspective(900px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
  });
  productImgWrap.addEventListener('mouseleave', function () {
    productImgWrap.style.transition = 'transform 0.6s ease, box-shadow 0.3s ease';
    productImgWrap.style.transform  = '';
  });
}


/* ================================================================
   PIECE + COLORWAY SWITCHER
   ================================================================ */
(function () {
  var imageMap = {
    hoodie:  { spectrum: 'assets/colorway-spectrum.jpg', emerald: 'assets/colorway-emerald.jpg', teal: 'assets/colorway-teal.jpg', violet: 'assets/colorway-violet.jpg', cream: 'assets/colorway-cream.jpg' },
    joggers: { spectrum: 'assets/colorway-spectrum.jpg', emerald: 'assets/colorway-emerald.jpg', teal: 'assets/colorway-teal.jpg', violet: 'assets/colorway-violet.jpg', cream: 'assets/colorway-cream.jpg' },
    set:     { spectrum: 'assets/colorway-spectrum.jpg', emerald: 'assets/colorway-emerald.jpg', teal: 'assets/colorway-teal.jpg', violet: 'assets/colorway-violet.jpg', cream: 'assets/colorway-cream.jpg' },
  };

  var activePiece = 'hoodie';
  var activeCw    = 'spectrum';
  var productImg  = document.getElementById('productImg');
  var pieceBtns   = document.querySelectorAll('.piece-btn');
  var cwSwatches  = document.querySelectorAll('.cw-swatch');

  function updateImage() {
    var src = (imageMap[activePiece] || {})[activeCw];
    if (!src) return;
    productImg.classList.remove('img-missing');
    productImg.style.opacity = '0';
    productImg.src = src;
    productImg.onload  = function () { productImg.style.opacity = '1'; };
    productImg.onerror = function () { productImg.classList.add('img-missing'); productImg.style.opacity = '1'; };
  }

  pieceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pieceBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activePiece = btn.dataset.piece;
      updateImage();
    });
  });

  cwSwatches.forEach(function (sw) {
    sw.addEventListener('click', function () {
      cwSwatches.forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      activeCw = sw.dataset.cw;
      updateImage();
    });
  });
})();


/* ================================================================
   SIZE SELECTOR
   ================================================================ */
(function () {
  var sizeBtns = document.querySelectorAll('.size-btn:not(.sold-out)');
  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sizeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
})();


/* ================================================================
   BUY NOW
   ================================================================ */
(function () {
  var buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;
  buyBtn.addEventListener('click', function () {
    var orig = buyBtn.textContent;
    buyBtn.textContent = '[ADDED_TO_CART]';
    buyBtn.style.borderColor = '#2dd47f';
    buyBtn.style.color = '#2dd47f';
    buyBtn.style.boxShadow = '0 0 24px rgba(45,212,127,0.2)';
    setTimeout(function () {
      buyBtn.textContent = orig;
      buyBtn.style.borderColor = '';
      buyBtn.style.color = '';
      buyBtn.style.boxShadow = '';
    }, 2000);
  });
})();


/* ================================================================
   CAMPAIGN STRIP DRAG-TO-SCROLL
   ================================================================ */
(function () {
  var strip = document.getElementById('campaignStrip');
  if (!strip) return;
  var isDown = false, startX = 0, scrollLeft = 0;

  strip.addEventListener('mousedown', function (e) {
    isDown = true; strip.classList.add('dragging');
    startX = e.pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', function () { isDown = false; strip.classList.remove('dragging'); });
  strip.addEventListener('mouseup',    function () { isDown = false; strip.classList.remove('dragging'); });
  strip.addEventListener('mousemove',  function (e) {
    if (!isDown) return;
    e.preventDefault();
    strip.scrollLeft = scrollLeft - (e.pageX - strip.offsetLeft - startX) * 1.8;
  });

  var touchStart = 0, touchScrollLeft = 0;
  strip.addEventListener('touchstart', function (e) {
    touchStart = e.touches[0].pageX; touchScrollLeft = strip.scrollLeft;
  }, { passive: true });
  strip.addEventListener('touchmove', function (e) {
    strip.scrollLeft = touchScrollLeft - (e.touches[0].pageX - touchStart) * 1.8;
  }, { passive: true });
})();


/* ================================================================
   NEWSLETTER FORM
   ================================================================ */
(function () {
  var form  = document.querySelector('.newsletter-form');
  var input = document.querySelector('.newsletter-input');
  var btn   = document.querySelector('.newsletter-btn');
  if (!form || !input || !btn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = 'rgba(168,94,212,0.6)';
      input.style.boxShadow   = '0 0 12px rgba(168,94,212,0.15)';
      setTimeout(function () { input.style.borderColor = ''; input.style.boxShadow = ''; }, 1200);
      return;
    }
    btn.textContent = '[SUBSCRIBED]';
    btn.style.borderColor = '#2dd47f';
    btn.style.color = '#2dd47f';
    input.value = '';
    input.placeholder = '[ARCHIVE_UNLOCKED]';
    setTimeout(function () {
      btn.textContent = '[SUBSCRIBE]';
      btn.style.borderColor = '';
      btn.style.color = '';
      input.placeholder = '[EMAIL_ADDRESS_____________]';
    }, 3000);
  });
})();


