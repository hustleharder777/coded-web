/* ============================================================
   CODED — script.js
   ============================================================ */

/* ── Cipher Loader ── */
(function () {
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><';
  const DURATION = 2600;    // total loader time (ms)
  const SCRAMBLE_CYCLES = 9;
  const CHAR_STAGGER = 100; // ms between each char starting

  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loaderBar');
  const loaderAccess = document.getElementById('loaderAccess');
  const chars       = document.querySelectorAll('.cipher-char');

  let startTime = null;

  function randChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }

  function scrambleChar(el, target, delay) {
    let count = 0;
    setTimeout(function () {
      const iv = setInterval(function () {
        if (count >= SCRAMBLE_CYCLES) {
          clearInterval(iv);
          el.textContent = target;
          el.classList.add('locked');
          return;
        }
        el.textContent = randChar();
        count++;
      }, 60);
    }, delay);
  }

  function animateBar() {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const pct = Math.min(((ts - start) / DURATION) * 100, 100);
      loaderBar.style.width = pct + '%';
      if (pct < 100) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runLoader() {
    // Start bar
    animateBar();

    // Scramble each character staggered
    chars.forEach(function (el, i) {
      scrambleChar(el, el.dataset.char, i * CHAR_STAGGER);
    });

    // Show ACCESS_GRANTED
    setTimeout(function () {
      loaderAccess.textContent = '[ACCESS_GRANTED]';
      loaderAccess.classList.add('visible');
    }, DURATION - 300);

    // Fade out loader
    setTimeout(function () {
      loader.classList.add('fade-out');
      setTimeout(function () {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 520);
    }, DURATION);
  }

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }
})();


/* ── Piece + Colorway switcher ── */
(function () {
  // Map [piece][colorway] → image path
  const imageMap = {
    hoodie: {
      spectrum: 'assets/hoodie.png',
      emerald:  'assets/emerald_hoodie.png',
      teal:     'assets/teal_hoodie.png',
      violet:   'assets/violet_hoodie.png',
      cream:    'assets/cream_hoodie.png',
    },
    joggers: {
      spectrum: 'assets/joggers.jpg',
      emerald:  'assets/emerald_joggers.png',
      teal:     'assets/teal_joggers.png',
      violet:   'assets/violet_joggers.png',
      cream:    'assets/cream_joggers.png',
    },
    set: {
      spectrum: 'assets/hoodie.png',
      emerald:  'assets/product_emerald.png',
      teal:     'assets/teal_set.png',
      violet:   'assets/violet_set.png',
      cream:    'assets/cream_set.png',
    }
  };

  let activePiece = 'hoodie';
  let activeCw    = 'spectrum';

  const productImg  = document.getElementById('productImg');
  const pieceBtns   = document.querySelectorAll('.piece-btn');
  const cwSwatches  = document.querySelectorAll('.cw-swatch');

  function updateImage() {
    const src = (imageMap[activePiece] || {})[activeCw];
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


/* ── Size selector ── */
(function () {
  const sizeBtns = document.querySelectorAll('.size-btn:not(.sold-out)');
  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sizeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
})();


/* ── Buy Now ── */
(function () {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;
  buyBtn.addEventListener('click', function () {
    const orig = buyBtn.textContent;
    buyBtn.textContent = '[ADDED_TO_CART]';
    buyBtn.style.borderColor = '#2dd47f';
    buyBtn.style.color = '#2dd47f';
    setTimeout(function () {
      buyBtn.textContent = orig;
      buyBtn.style.borderColor = '';
      buyBtn.style.color = '';
    }, 2000);
  });
})();


/* ── Campaign strip drag-to-scroll ── */
(function () {
  const strip = document.getElementById('campaignStrip');
  if (!strip) return;
  let isDown = false, startX = 0, scrollLeft = 0;

  strip.addEventListener('mousedown', function (e) {
    isDown = true;
    strip.classList.add('dragging');
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', function () {
    isDown = false;
    strip.classList.remove('dragging');
  });
  strip.addEventListener('mouseup', function () {
    isDown = false;
    strip.classList.remove('dragging');
  });
  strip.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.8;
    strip.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  let touchStart = 0, touchScrollLeft = 0;
  strip.addEventListener('touchstart', function (e) {
    touchStart = e.touches[0].pageX;
    touchScrollLeft = strip.scrollLeft;
  }, { passive: true });
  strip.addEventListener('touchmove', function (e) {
    const x    = e.touches[0].pageX;
    const walk = (x - touchStart) * 1.8;
    strip.scrollLeft = touchScrollLeft - walk;
  }, { passive: true });
})();


/* ── Newsletter form ── */
(function () {
  const form  = document.querySelector('.newsletter-form');
  const input = document.querySelector('.newsletter-input');
  const btn   = document.querySelector('.newsletter-btn');
  if (!form || !input || !btn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = 'rgba(168,94,212,0.6)';
      setTimeout(function () { input.style.borderColor = ''; }, 1200);
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


/* ── Vault cell — sync click to product switcher ── */
(function () {
  const vaultCells = document.querySelectorAll('.vault-cell');
  const cwSwatches = document.querySelectorAll('.cw-swatch');

  vaultCells.forEach(function (cell) {
    cell.addEventListener('click', function () {
      const cw = cell.dataset.colorway;
      if (!cw) return;
      // Find matching swatch and click it
      cwSwatches.forEach(function (sw) {
        if (sw.dataset.cw === cw) sw.click();
      });
      // Scroll to product section smoothly
      const productSection = document.getElementById('product');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
