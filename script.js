// ===========================================================
// AI KABZ — interactions, 3D, animations
// ===========================================================
// Three.js loaded dynamically so a network hiccup can't break the rest of the page.
let THREE = null;
import('https://unpkg.com/three@0.160.0/build/three.module.js')
  .then(mod => { THREE = mod; initHero3D(); })
  .catch(err => { console.warn('[AI KABZ] 3D disabled:', err); });

/* ---------- Custom Cursor ---------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (dot) dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
});
(function loop() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  if (ring) ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a, button, .feature-card, .problem-item, .how-step').forEach(el => {
  el.addEventListener('mouseenter', () => ring && ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover'));
});

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
const progressBar = document.querySelector('.scroll-progress span');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav && nav.classList.add('scrolled');
  else nav && nav.classList.remove('scrolled');
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = `${Math.min(100, (window.scrollY / h) * 100)}%`;
}, { passive: true });

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    // Calendly buttons open the popup instead of scrolling — handled in bookDemo().
    if (a.hasAttribute('data-cal-link')) return;
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    }
  });
});

/* ---------- Hero 3D Particles (Three.js) ---------- */
function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7;

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const l1 = new THREE.PointLight(0xf9c6d1, 2.5, 20); l1.position.set(4, 3, 4); scene.add(l1);
  const l2 = new THREE.PointLight(0x8fc5ff, 2, 20); l2.position.set(-4, -2, 3); scene.add(l2);

  const geo = new THREE.IcosahedronGeometry(1.6, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 0.45, roughness: 0.2,
    emissive: new THREE.Color(0x3a1a30), emissiveIntensity: 0.4,
    wireframe: false, flatShading: true,
  });
  const core = new THREE.Mesh(geo, mat);
  scene.add(core);

  const wireMat = new THREE.MeshBasicMaterial({ color: 0xf9c6d1, wireframe: true, transparent: true, opacity: 0.18 });
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 2), wireMat);
  scene.add(wire);

  const pCount = 1200;
  const positions = new Float32Array(pCount * 3);
  const colors = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 2.5 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);
    const mix = Math.random();
    colors[i*3] = 0.98 * mix + 0.56 * (1 - mix);
    colors[i*3+1] = 0.78 * mix + 0.77 * (1 - mix);
    colors[i*3+2] = 0.82 * mix + 1 * (1 - mix);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const rings = [];
  for (let i = 0; i < 3; i++) {
    const rg = new THREE.TorusGeometry(2.4 + i * 0.6, 0.006, 12, 140);
    const rm = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xf9c6d1 : i === 1 ? 0x8fc5ff : 0xe6c188, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    rings.push(ring); scene.add(ring);
  }

  let mxn = 0, myn = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    mxn = (e.clientX / window.innerWidth - 0.5) * 2;
    myn = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const basePositions = geo.attributes.position.array.slice();

  function animate(t) {
    t *= 0.001;
    core.rotation.x = t * 0.2;
    core.rotation.y = t * 0.15;
    wire.rotation.x = -t * 0.1;
    wire.rotation.y = t * 0.12;

    const pos = geo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = basePositions[i], oy = basePositions[i+1], oz = basePositions[i+2];
      const n = Math.sin(t * 1.2 + ox * 2 + oy * 1.6 + oz * 1.1) * 0.08;
      pos[i] = ox * (1 + n);
      pos[i+1] = oy * (1 + n);
      pos[i+2] = oz * (1 + n);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    particles.rotation.y = t * 0.05;
    particles.rotation.x = Math.sin(t * 0.2) * 0.1;

    rings.forEach((r, i) => {
      r.rotation.x += 0.002 * (i + 1);
      r.rotation.y += 0.0015 * (i + 1);
    });

    tx += (mxn - tx) * 0.05;
    ty += (myn - ty) * 0.05;
    camera.position.x = tx * 0.8;
    camera.position.y = -ty * 0.6;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------- GSAP scroll reveals ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.section-head').forEach(h => {
    gsap.from(h.children, {
      y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 85%' }
    });
  });

  gsap.from('.problem-item', {
    y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.problem-list', start: 'top 80%' }
  });

  gsap.from('.feature-card', {
    y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.features-grid', start: 'top 80%' }
  });

  gsap.from('.result-card', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.results-grid', start: 'top 85%' }
  });

  gsap.from('.how-step', {
    y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.how-steps', start: 'top 85%' }
  });

  // Subtle hero parallax
  gsap.to('.hero-inner', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ---------- Card 3D tilt ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 8;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ---------- Year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Cursor blob ---------- */
const blob = document.querySelector('.cursor-blob');
let bx = 0, by = 0;
(function blobLoop() {
  bx += (mx - bx) * 0.08;
  by += (my - by) * 0.08;
  if (blob) blob.style.transform = `translate3d(${bx - 150}px, ${by - 150}px, 0)`;
  requestAnimationFrame(blobLoop);
})();

/* ---------- Magnetic buttons ---------- */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ---------- Side nav active section + show on scroll ---------- */
const sideNav = document.querySelector('.side-nav');
const sideLinks = document.querySelectorAll('.side-nav a');
const floatingCTA = document.querySelector('.floating-cta');

const sections = Array.from(sideLinks).map(a => {
  const id = a.getAttribute('href').slice(1);
  return { id, el: document.getElementById(id), link: a };
}).filter(s => s.el);

function updateSideNav() {
  const y = window.scrollY + window.innerHeight * 0.35;
  let current = sections[0];
  for (const s of sections) {
    if (s.el.offsetTop <= y) current = s;
  }
  sideLinks.forEach(l => l.classList.remove('active'));
  if (current) current.link.classList.add('active');

  if (window.scrollY > window.innerHeight * 0.6) {
    sideNav && sideNav.classList.add('show');
    floatingCTA && floatingCTA.classList.add('show');
  } else {
    sideNav && sideNav.classList.remove('show');
    floatingCTA && floatingCTA.classList.remove('show');
  }
}
window.addEventListener('scroll', updateSideNav, { passive: true });
updateSideNav();

/* ---------- Mobile drawer ---------- */
(function mobileDrawer() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  function open() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => {
    drawer.classList.contains('open') ? close() : open();
  });
  drawer.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ---------- Cursor spotlight on premium cards ---------- */
document.querySelectorAll('.problem-item, .feature-card, .how-step, .result-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
});

/* ---------- Inject spotlight overlay for cards ---------- */
(function injectSpotlight() {
  const style = document.createElement('style');
  style.textContent = `
    .problem-item, .feature-card, .how-step, .result-card { --mx: 50%; --my: 50%; }
    .problem-item::after, .feature-card::after, .how-step::after, .result-card.glass::after {
      content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
      background: radial-gradient(380px circle at var(--mx) var(--my), rgba(249,198,209,0.14), transparent 50%);
      opacity: 0; transition: opacity 0.4s ease;
    }
    .problem-item:hover::after, .feature-card:hover::after,
    .how-step:hover::after, .result-card.glass:hover::after { opacity: 1; }
  `;
  document.head.appendChild(style);
})();

/* ---------- Book a Demo (Calendly) ---------- */
(function bookDemo() {
  const url = window.AIKAB_CALENDLY_URL;
  if (!url) return;

  function openCalendly(e) {
    if (e) e.preventDefault();
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank', 'noopener');
    }
    return false;
  }

  document.querySelectorAll('[data-cal-link]').forEach(el => {
    el.addEventListener('click', openCalendly);
  });
})();
