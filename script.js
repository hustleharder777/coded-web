/* ============================================================
   CODED — script.js  (PixelVault WebGL edition)
   ES module — requires <script type="module">
   ============================================================ */

import * as THREE from 'three';

/* ================================================================
   THREE.JS SCENE
   ================================================================ */
const canvas  = document.getElementById('bg-canvas');
const scene   = new THREE.Scene();
const camera  = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 55);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

/* ── Brand colors ── */
const C_EM     = new THREE.Color(0x2dd47f);
const C_TEAL   = new THREE.Color(0x3aabd1);
const C_VIOLET = new THREE.Color(0xa85ed4);
const BRAND    = [C_EM, C_TEAL, C_VIOLET];

/* ── 1. Particle field ── */
const PARTICLE_COUNT = 6000;
const posArr   = new Float32Array(PARTICLE_COUNT * 3);
const colorArr = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const r     = 80 * Math.cbrt(Math.random());
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  posArr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  posArr[i * 3 + 2] = r * Math.cos(phi);
  const c = BRAND[Math.floor(Math.random() * 3)];
  colorArr[i * 3]     = c.r;
  colorArr[i * 3 + 1] = c.g;
  colorArr[i * 3 + 2] = c.b;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.75,
  sizeAttenuation: true,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ── 2. Primary torus (emerald) ── */
const torus1 = new THREE.Mesh(
  new THREE.TorusGeometry(18, 0.15, 6, 120),
  new THREE.MeshBasicMaterial({ color: 0x2dd47f, transparent: true, opacity: 0.55 })
);
scene.add(torus1);

/* ── 3. Secondary torus (teal) ── */
const torus2 = new THREE.Mesh(
  new THREE.TorusGeometry(11, 0.1, 6, 80),
  new THREE.MeshBasicMaterial({ color: 0x3aabd1, transparent: true, opacity: 0.4 })
);
torus2.rotation.x = Math.PI * 0.45;
scene.add(torus2);

/* ── 4. Icosahedra array ── */
const icoPositions = [
  [-28,  12, -20],
  [ 30, -10, -25],
  [-18, -20, -15],
  [ 22,  18, -30],
  [  5, -28, -10],
  [-35,  -5, -35],
];
const icoColors = [0x2dd47f, 0x3aabd1, 0xa85ed4, 0x3aabd1, 0x2dd47f, 0xa85ed4];
const icoSpeeds = [
  { x: 0.003, y: 0.005, z: 0.002 },
  { x: -0.004, y: 0.003, z: -0.003 },
  { x: 0.005, y: -0.004, z: 0.004 },
  { x: -0.003, y: 0.006, z: -0.002 },
  { x: 0.004, y: -0.003, z: 0.005 },
  { x: -0.005, y: 0.002, z: -0.004 },
];

const icos = icoPositions.map((pos, i) => {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 1),
    new THREE.MeshBasicMaterial({ color: icoColors[i], wireframe: true, transparent: true, opacity: 0.35 })
  );
  mesh.position.set(...pos);
  mesh.scale.set(0, 0, 0);
  scene.add(mesh);
  return mesh;
});

/* ── Assembly state ── */
let assemble  = false;
let assembled = false;
const ASSEMBLE_DURATION = 1400;
let assembleStart = 0;

particles.scale.set(0, 0, 0);
torus1.scale.set(0, 0, 0);
torus2.scale.set(0, 0, 0);

function triggerAssembly() {
  assemble     = true;
  assembleStart = performance.now();
}

/* ── Scroll & mouse state ── */
let scrollPct  = 0;
let mouseX     = 0;
let mouseY     = 0;
let camTargetX = 0;
let camTargetY = 0;
let camTargetZ = 55;

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollPct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
});

window.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ── Lerp helper ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ── Animation loop ── */
function animate(time) {
  requestAnimationFrame(animate);

  /* Assembly animation */
  if (assemble && !assembled) {
    const elapsed = time - assembleStart;
    const t = Math.min(elapsed / ASSEMBLE_DURATION, 1);
    const e = easeOut(t);

    particles.scale.setScalar(e);
    torus1.scale.setScalar(e);
    torus2.scale.setScalar(e);

    icos.forEach((ico, i) => {
      const delay = i * 120;
      const icoT = Math.min(Math.max((elapsed - delay) / (ASSEMBLE_DURATION * 0.7), 0), 1);
      ico.scale.setScalar(easeOut(icoT));
    });

    if (t >= 1) assembled = true;
  }

  /* Particle rotation */
  particles.rotation.y += 0.0003;
  particles.rotation.x += 0.00008;

  /* Torus rotation */
  torus1.rotation.x += 0.002;
  torus1.rotation.z += 0.001;
  torus2.rotation.y -= 0.0015;
  torus2.rotation.z += 0.0012;

  /* Icosahedra rotation */
  icos.forEach((ico, i) => {
    ico.rotation.x += icoSpeeds[i].x;
    ico.rotation.y += icoSpeeds[i].y;
    ico.rotation.z += icoSpeeds[i].z;
  });

  /* Scroll-driven camera keyframes */
  let targetZ, targetY, icoDrift;
  if (scrollPct < 0.15) {
    const t = scrollPct / 0.15;
    targetZ   = lerp(55, 45, t);
    targetY   = lerp(0, -3, t);
    icoDrift  = 0;
  } else if (scrollPct < 0.45) {
    const t = (scrollPct - 0.15) / 0.30;
    targetZ   = lerp(45, 35, t);
    targetY   = lerp(-3, -10, t);
    icoDrift  = t * 3;
  } else if (scrollPct < 0.80) {
    const t = (scrollPct - 0.45) / 0.35;
    targetZ   = lerp(35, 30, t);
    targetY   = lerp(-10, -20, t);
    icoDrift  = 3 + t * 5;
  } else {
    const t = (scrollPct - 0.80) / 0.20;
    targetZ   = lerp(30, 50, t);
    targetY   = lerp(-20, -28, t);
    icoDrift  = 8;
  }

  camTargetZ = lerp(camTargetZ, targetZ, 0.04);
  camTargetY = lerp(camTargetY, targetY, 0.04);
  camTargetX = lerp(camTargetX, mouseX * 3, 0.03);

  camera.position.x = camTargetX;
  camera.position.y = camTargetY + (-mouseY * 1.5);
  camera.position.z = camTargetZ;
  camera.lookAt(0, camTargetY, 0);

  /* Icosahedra drift on scroll */
  if (icoDrift > 0) {
    icos.forEach((ico, i) => {
      const base = icoPositions[i];
      const driftDir = i % 2 === 0 ? 1 : -1;
      ico.position.x = base[0] + driftDir * icoDrift * 0.6;
      ico.position.y = base[1] + (i % 3 - 1) * icoDrift * 0.3;
    });
  }

  /* Torus opacity fades on deep scroll */
  const torusOpacity = Math.max(0, 1 - scrollPct * 3);
  torus1.material.opacity = 0.55 * torusOpacity;
  torus2.material.opacity = 0.40 * torusOpacity;

  renderer.render(scene, camera);
}
animate(0);


/* ================================================================
   PIXELVAULT-STYLE LOADER
   ================================================================ */
(function () {
  const CHARSET     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?><:/\\|[]{}';
  const loader      = document.getElementById('loader');
  const cipherEl    = document.getElementById('loaderCipher');
  const CIPHER_LEN  = 12;

  document.body.style.overflow = 'hidden';

  function randChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }

  function randCipherStr(len) {
    let s = '[';
    for (let i = 0; i < len; i++) s += randChar();
    return s + ']';
  }

  /* Scramble continuously */
  let scrambleIv = setInterval(() => {
    cipherEl.textContent = randCipherStr(CIPHER_LEN);
  }, 80);

  /* After a short delay, trigger 3D assembly and begin reveal */
  const MIN_LOAD_MS = 1800;
  const start = performance.now();

  function onReady() {
    const elapsed = performance.now() - start;
    const wait    = Math.max(0, MIN_LOAD_MS - elapsed);

    setTimeout(() => {
      /* Kick off Three.js assembly */
      triggerAssembly();

      /* After 600ms into assembly, resolve cipher */
      setTimeout(() => {
        clearInterval(scrambleIv);
        cipherEl.textContent = '[ACCESS_GRANTED]';
        cipherEl.classList.add('resolved');
      }, 600);

      /* After another 500ms, fade loader out */
      setTimeout(() => {
        loader.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(() => {
          loader.classList.add('hidden');
          revealHeroContent();
        }, 650);
      }, 1100);

    }, wait);
  }

  /* Wait for fonts + document ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


/* ================================================================
   SCROLL REVEAL
   ================================================================ */
function revealHeroContent() {
  /* Immediately reveal hero children */
  document.querySelectorAll('.hero-section .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('in-view'), i * 120);
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal:not(.hero-section .reveal)').forEach(el => {
  revealObserver.observe(el);
});


/* ================================================================
   VAULT CELL 3D TILT
   ================================================================ */
document.querySelectorAll('.vault-cell').forEach(cell => {
  cell.addEventListener('mousemove', e => {
    const r = cell.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    cell.style.transition = 'border-color 0.3s, box-shadow 0.3s, transform 0.1s ease';
    cell.style.transform  = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  cell.addEventListener('mouseleave', () => {
    cell.style.transition = 'border-color 0.3s, box-shadow 0.3s, transform 0.5s ease';
    cell.style.transform  = '';
  });
});


/* ================================================================
   PRODUCT IMAGE 3D TILT
   ================================================================ */
const productImgWrap = document.getElementById('productImgWrap');
if (productImgWrap) {
  productImgWrap.addEventListener('mousemove', e => {
    const r = productImgWrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    productImgWrap.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    productImgWrap.style.transform  = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  productImgWrap.addEventListener('mouseleave', () => {
    productImgWrap.style.transition = 'transform 0.6s ease, box-shadow 0.3s ease';
    productImgWrap.style.transform  = '';
  });
}


/* ================================================================
   PIECE + COLORWAY SWITCHER
   ================================================================ */
(function () {
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

  const productImg = document.getElementById('productImg');
  const pieceBtns  = document.querySelectorAll('.piece-btn');
  const cwSwatches = document.querySelectorAll('.cw-swatch');

  function updateImage() {
    const src = (imageMap[activePiece] || {})[activeCw];
    if (!src) return;
    productImg.classList.remove('img-missing');
    productImg.style.opacity = '0';
    productImg.src = src;
    productImg.onload  = () => { productImg.style.opacity = '1'; };
    productImg.onerror = () => { productImg.classList.add('img-missing'); productImg.style.opacity = '1'; };
  }

  pieceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pieceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePiece = btn.dataset.piece;
      updateImage();
    });
  });

  cwSwatches.forEach(sw => {
    sw.addEventListener('click', () => {
      cwSwatches.forEach(s => s.classList.remove('active'));
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
  const sizeBtns = document.querySelectorAll('.size-btn:not(.sold-out)');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();


/* ================================================================
   BUY NOW
   ================================================================ */
(function () {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;
  buyBtn.addEventListener('click', () => {
    const orig = buyBtn.textContent;
    buyBtn.textContent = '[ADDED_TO_CART]';
    buyBtn.style.borderColor = '#2dd47f';
    buyBtn.style.color = '#2dd47f';
    buyBtn.style.boxShadow = '0 0 24px rgba(45,212,127,0.2)';
    setTimeout(() => {
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
  const strip = document.getElementById('campaignStrip');
  if (!strip) return;
  let isDown = false, startX = 0, scrollLeft = 0;

  strip.addEventListener('mousedown', e => {
    isDown = true;
    strip.classList.add('dragging');
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', () => { isDown = false; strip.classList.remove('dragging'); });
  strip.addEventListener('mouseup',    () => { isDown = false; strip.classList.remove('dragging'); });
  strip.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.8;
    strip.scrollLeft = scrollLeft - walk;
  });

  let touchStart = 0, touchScrollLeft = 0;
  strip.addEventListener('touchstart', e => {
    touchStart = e.touches[0].pageX;
    touchScrollLeft = strip.scrollLeft;
  }, { passive: true });
  strip.addEventListener('touchmove', e => {
    const x    = e.touches[0].pageX;
    const walk = (x - touchStart) * 1.8;
    strip.scrollLeft = touchScrollLeft - walk;
  }, { passive: true });
})();


/* ================================================================
   NEWSLETTER FORM
   ================================================================ */
(function () {
  const form  = document.querySelector('.newsletter-form');
  const input = document.querySelector('.newsletter-input');
  const btn   = document.querySelector('.newsletter-btn');
  if (!form || !input || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = 'rgba(168,94,212,0.6)';
      input.style.boxShadow   = '0 0 12px rgba(168,94,212,0.15)';
      setTimeout(() => { input.style.borderColor = ''; input.style.boxShadow = ''; }, 1200);
      return;
    }
    btn.textContent = '[SUBSCRIBED]';
    btn.style.borderColor = '#2dd47f';
    btn.style.color = '#2dd47f';
    btn.style.boxShadow = '0 0 16px rgba(45,212,127,0.15)';
    input.value = '';
    input.placeholder = '[ARCHIVE_UNLOCKED]';
    setTimeout(() => {
      btn.textContent = '[SUBSCRIBE]';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.boxShadow = '';
      input.placeholder = '[EMAIL_ADDRESS_____________]';
    }, 3000);
  });
})();


/* ================================================================
   VAULT CELL → SYNC TO PRODUCT SWITCHER
   ================================================================ */
(function () {
  const vaultCells = document.querySelectorAll('.vault-cell');
  const cwSwatches = document.querySelectorAll('.cw-swatch');

  vaultCells.forEach(cell => {
    cell.addEventListener('click', () => {
      const cw = cell.dataset.colorway;
      if (!cw) return;
      cwSwatches.forEach(sw => { if (sw.dataset.cw === cw) sw.click(); });
      const productSection = document.getElementById('product');
      if (productSection) productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
