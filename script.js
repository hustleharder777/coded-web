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
        window.location.href = 'vault.html';
      }, 400);
    }, wait);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();




/* ================================================================
   PRODUCT PAGE — ACCESS SCREEN
   ================================================================ */
(function () {
  var access   = document.getElementById('productAccess');
  var cipher   = document.getElementById('productAccessCipher');
  if (!access || !cipher) return;

  var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><:/\\|[]{}';
  function randStr(len) {
    var s = '[';
    for (var i = 0; i < len; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    return s + ']';
  }

  document.body.style.opacity = '1';

  var iv = setInterval(function () { cipher.textContent = randStr(14); }, 70);

  setTimeout(function () {
    clearInterval(iv);
    cipher.textContent = '[DROP_SECURED]';
    cipher.classList.add('resolved');
    setTimeout(function () { access.classList.add('dismissed'); }, 520);
  }, 1700);
})();


/* ================================================================
   PRODUCT PAGE — INIT COLORWAY FROM URL PARAM (?cw=emerald)
   ================================================================ */
(function () {
  var param = new URLSearchParams(window.location.search).get('cw');
  if (!param) return;
  var swatch = document.querySelector('.cw-swatch[data-cw="' + param + '"]');
  if (!swatch) return;
  document.querySelectorAll('.cw-swatch').forEach(function (s) { s.classList.remove('active'); });
  swatch.classList.add('active');
  swatch.click();
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
    { id: 'emerald',  name: 'LEVERAGE',    price: '285' },
    { id: 'teal',     name: 'OFFSHORE',    price: '285' },
    { id: 'violet',   name: 'DISTRACTION', price: '285' },
    { id: 'cream',    name: 'THE FRONT',   price: '285' },
    { id: 'spectrum', name: 'ANOMALY',     price: '320' },
  ];

  var stage      = document.querySelector('.cw-stage');
  var slides     = document.querySelectorAll('.cw-slide');
  var indicators = document.querySelectorAll('.cw-indicator');
  var nameEl     = document.querySelector('.cw-showcase-name');
  var priceEl    = document.querySelector('.cw-showcase-price-val');
  var cta        = document.getElementById('vaultShopCta');

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

  /* Touch swipe */
  var touchStartX = 0;
  stage.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

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
    window.location.href = 'product.html?cw=' + colorways[current].id;
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
   COLORWAY SWITCHER
   ================================================================ */
(function () {
  var imageMap = {
    spectrum: 'assets/colorway-spectrum.jpg',
    emerald:  'assets/colorway-emerald.jpg',
    teal:     'assets/colorway-teal.jpg',
    violet:   'assets/colorway-violet.jpg',
    cream:    'assets/colorway-cream.jpg',
  };
  var prices = { spectrum: '320', emerald: '285', teal: '285', violet: '285', cream: '285' };
  var names  = { spectrum: 'ANOMALY', emerald: 'LEVERAGE', teal: 'OFFSHORE', violet: 'DISTRACTION', cream: 'THE FRONT' };

  var activeCw    = 'spectrum';
  var productImg  = document.getElementById('productImg');
  var productImgBack = document.getElementById('productImgBack');
  var cwSwatches  = document.querySelectorAll('.cw-swatch');
  var editionEl      = document.getElementById('productEditionLabel');
  var panelEditionEl = document.getElementById('productPanelEdition');
  var priceValEl     = document.querySelector('.product-price-val');

  function updateProduct() {
    var src = imageMap[activeCw];
    var editionText = names[activeCw] + ' EDITION';
    if (editionEl)      editionEl.textContent      = editionText;
    if (panelEditionEl) panelEditionEl.textContent = editionText;
    if (priceValEl) priceValEl.textContent  = prices[activeCw];
    if (!productImg || !src) return;
    productImg.classList.remove('img-missing');

    // Load new image into back layer silently, then crossfade
    var back = productImgBack;
    if (!back) { productImg.src = src; return; }

    function doFade() {
      productImg.style.opacity = '0';
      function onEnd() {
        productImg.removeEventListener('transitionend', onEnd);
        productImg.src = src;
        productImg.style.opacity = '1';
      }
      productImg.addEventListener('transitionend', onEnd);
    }

    back.onload = doFade;
    back.onerror = function () { productImg.classList.add('img-missing'); };
    back.src = src;
    if (back.complete) doFade();
  }

  cwSwatches.forEach(function (sw) {
    sw.addEventListener('click', function () {
      cwSwatches.forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      activeCw = sw.dataset.cw;
      updateProduct();
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
   CART
   ================================================================ */
var cart = [];
try { cart = JSON.parse(localStorage.getItem('coded_cart') || '[]'); } catch(e) { cart = []; }

function cartOpen() {
  var el = document.getElementById('cartDrawer');
  if (!el) return;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function cartClose() {
  var el = document.getElementById('cartDrawer');
  if (!el) return;
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function cartRender() {
  var itemsEl  = document.getElementById('cartItems');
  var totalEl  = document.getElementById('cartTotal');
  var emptyEl  = document.getElementById('cartEmpty');
  var checkEl  = document.getElementById('cartCheckoutBtn');
  var navCart  = document.querySelector('.nav-cart');
  if (!itemsEl) return;

  var totalQty = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  if (navCart) navCart.textContent = '[CART_' + (totalQty < 10 ? '0' : '') + totalQty + ']';

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl)  { emptyEl.style.display  = 'block'; }
    if (totalEl)  { totalEl.style.display  = 'none'; }
    if (checkEl)  { checkEl.style.display  = 'none'; }
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (totalEl) totalEl.style.display = 'flex';
  if (checkEl) checkEl.style.display = 'block';

  itemsEl.innerHTML = cart.map(function(item, idx) {
    return '<div class="cart-item">' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-meta">' + item.colorway + ' &nbsp;·&nbsp; SIZE_' + item.size + '</div>' +
      '</div>' +
      '<div class="cart-item-right">' +
        '<div class="cart-item-price">$' + (item.price * item.qty) + '</div>' +
        '<div class="cart-item-qty">' +
          '<button class="qty-btn" onclick="cartChangeQty(' + idx + ',-1)">−</button>' +
          '<span class="qty-val">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="cartChangeQty(' + idx + ',1)">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  if (totalEl) totalEl.innerHTML = '<span>TOTAL</span><span>$' + total + '</span>';
  try { localStorage.setItem('coded_cart', JSON.stringify(cart)); } catch(e) {}
}
function cartChangeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  cartRender();
}
function cartAddItem() {
  var cwEl   = document.querySelector('.cw-swatch.active');
  var sizeEl = document.querySelector('.size-btn.active');
  var cw     = cwEl   ? cwEl.dataset.cw   : 'spectrum';
  var size   = sizeEl ? sizeEl.textContent : 'M';
  var price  = cw === 'spectrum' ? 320 : 285;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].colorway === cw.toUpperCase() && cart[i].size === size) {
      cart[i].qty++;
      cartRender();
      cartOpen();
      return;
    }
  }
  cart.push({ name: 'CODED TRACKSUIT', colorway: cw.toUpperCase(), size: size, price: price, qty: 1 });
  cartRender();
  cartOpen();
}

(function () {
  var navBuyBtn = document.getElementById('navBuyBtn');
  var navCart   = document.querySelector('.nav-cart');
  var closeBtn  = document.getElementById('cartClose');
  var overlay   = document.getElementById('cartOverlay');

  function handleBuy(btn) {
    cartAddItem();
    var orig = btn.textContent;
    btn.textContent = '[ADDED_TO_CART]';
    btn.classList.add('added');
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove('added');
    }, 1800);
  }

  var panelBuyBtn = document.getElementById('panelBuyBtn');
  if (navBuyBtn)   navBuyBtn.addEventListener('click',   function () { handleBuy(navBuyBtn); });
  if (panelBuyBtn) panelBuyBtn.addEventListener('click', function () { handleBuy(panelBuyBtn); });
  if (navCart) navCart.addEventListener('click', function(e) { e.preventDefault(); cartOpen(); });
  if (closeBtn) closeBtn.addEventListener('click', cartClose);
  if (overlay)  overlay.addEventListener('click', cartClose);

  var checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      window.location.href = 'checkout.html';
    });
  }

  cartRender();
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


/* ================================================================
   PRODUCT PAGE — pre-select colorway from URL param (?cw=emerald)
   ================================================================ */
(function () {
  if (!document.getElementById('productImg')) return;
  var params = new URLSearchParams(window.location.search);
  var cw = params.get('cw');
  if (cw) {
    var swatch = document.querySelector('.cw-swatch[data-cw="' + cw + '"]');
    if (swatch) swatch.click();
  }
})();

/* Vault shop CTA — show after hero leaves view, hide if user scrolls back */
(function () {
  var cta  = document.getElementById('vaultShopCta');
  var hero = document.getElementById('brandHero');
  if (!cta || !hero) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        cta.classList.remove('visible');
      } else {
        cta.classList.add('visible');
      }
    });
  }, { threshold: window.innerWidth <= 800 ? 0 : 0.3, rootMargin: window.innerWidth <= 800 ? '-56px 0px 0px 0px' : '0px' });

  io.observe(hero);
})();


/* ================================================================
   MOBILE NAVIGATION
   ================================================================ */
(function () {
  var hamburger = document.getElementById('navHamburger');
  var menu      = document.getElementById('navMobileMenu');
  if (!hamburger || !menu) return;
  hamburger.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('open'); });
  });
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
})();
