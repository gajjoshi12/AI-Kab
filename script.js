// ===========================================================
// AI KAB — interactions, 3D, animations
// ===========================================================
// Three.js loaded dynamically so a network hiccup can't break the rest of the page.
let THREE = null;
import('https://unpkg.com/three@0.160.0/build/three.module.js')
  .then(mod => { THREE = mod; initHero3D(); })
  .catch(err => { console.warn('[AI Kab] 3D disabled:', err); });

/* ---------- Custom Cursor ---------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
});
(function loop() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a, button, .service-card, .chip, .ba-handle').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
const progressBar = document.querySelector('.scroll-progress span');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${Math.min(100, (window.scrollY / h) * 100)}%`;
}, { passive: true });

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
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

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const l1 = new THREE.PointLight(0xf9c6d1, 2.5, 20); l1.position.set(4, 3, 4); scene.add(l1);
  const l2 = new THREE.PointLight(0x8fc5ff, 2, 20); l2.position.set(-4, -2, 3); scene.add(l2);

  // Main knot / morph shape (3D element)
  const geo = new THREE.IcosahedronGeometry(1.6, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 0.45, roughness: 0.2,
    emissive: new THREE.Color(0x3a1a30), emissiveIntensity: 0.4,
    wireframe: false, flatShading: true,
  });
  const core = new THREE.Mesh(geo, mat);
  scene.add(core);

  // Wire overlay
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xf9c6d1, wireframe: true, transparent: true, opacity: 0.18 });
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 2), wireMat);
  scene.add(wire);

  // Particle field
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

  // Floating rings
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const rg = new THREE.TorusGeometry(2.4 + i * 0.6, 0.006, 12, 140);
    const rm = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xf9c6d1 : i === 1 ? 0x8fc5ff : 0xe6c188, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    rings.push(ring); scene.add(ring);
  }

  // Mouse parallax
  let mxn = 0, myn = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    mxn = (e.clientX / window.innerWidth - 0.5) * 2;
    myn = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Morph vertices subtly
  const basePositions = geo.attributes.position.array.slice();

  function animate(t) {
    t *= 0.001;
    // Rotation
    core.rotation.x = t * 0.2;
    core.rotation.y = t * 0.15;
    wire.rotation.x = -t * 0.1;
    wire.rotation.y = t * 0.12;

    // Gentle vertex morph
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
      scrollTrigger: { trigger: h, start: 'top 80%' }
    });
  });

  gsap.from('.service-card', {
    y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.services-grid', start: 'top 75%' }
  });

  gsap.from('.chat', {
    y: 60, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.chat', start: 'top 80%' }
  });

  gsap.from('.roi-inputs, .roi-output > *', {
    y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.roi-grid', start: 'top 75%' }
  });

  gsap.from('.ba', {
    scale: 0.95, opacity: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.ba', start: 'top 80%' }
  });

  gsap.from('.stat', {
    y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' }
  });

  gsap.from('.t-card', {
    y: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.t-grid', start: 'top 80%' }
  });

  gsap.from('.contact-inner', {
    y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact', start: 'top 75%' }
  });

  // Parallax hero-sub
  gsap.to('.hero-inner', {
    y: -80, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ---------- Service card 3D tilt ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ---------- AI Chat demo ---------- */
const chatBody = document.getElementById('chat-body');
const chatForm = document.getElementById('chat-form');
const chatText = document.getElementById('chat-text');

const RESPONSES = {
  cancel: [
    "Here's how Kab fills last-minute cancellations 🪄",
    "1. The instant a booking cancels, I scan your client DB for 3 signals: location proximity, treatment interest match, and price sensitivity.",
    "2. I blast a smart offer to the top 12 matches via SMS + IG DM — different copy for each persona.",
    "3. First-come-first-served, auto-booked. Median fill time across AI Kab spas: **7 minutes**. You don't lift a finger."
  ],
  revenue: [
    "Doubling revenue is an outcome of 4 levers we pull simultaneously 💸",
    "1. **Retention AI** — win back ~22% of dormant clients in month 1.",
    "2. **Dynamic pricing** — lifts avg ticket 14–26% without losing bookings.",
    "3. **AI receptionist** — captures the 40% of leads you currently miss after-hours.",
    "4. **Attribution AI** — reallocates ad spend to what actually converts (ROAS usually jumps 2–3x).",
    "Most med spas hit 2x between months 4–7 with us."
  ],
  caption: [
    "On it — here's a conversion-optimized caption for a lip filler promo 💋",
    "_\"That plush, barely-there pout? Achievable. Our Signature Lip Enhancement is $150 off this week only — soft, symmetrical, never overdone. Tap to secure your slot before we close the books Friday. 💉✨\"_",
    "I'll also auto-generate 3 variants for A/B testing and schedule them for your highest-engagement hours (Tue 7pm, Thu 12pm, Sun 10am based on your audience). Want me to queue them?"
  ],
  hipaa: [
    "Great question — compliance is non-negotiable for us 🔒",
    "1. **HIPAA-aware architecture**: All PHI is stored in encrypted, audited, BAA-covered infrastructure (AWS + isolated containers).",
    "2. **Role-based access**: staff only see what they need. Full audit logs on every action.",
    "3. **No training on your data**: your client records are never used to train public AI models.",
    "4. **US-based data residency** with SOC 2 Type II attestation in progress.",
    "Happy to share our security one-pager on the strategy call."
  ],
  default: [
    "Love the question. Here's how I'd approach it for your med spa:",
    "I'd start by pulling your booking, marketing, and retention data into one model — then identify your top 2 revenue leaks. Most med spas find $20k–$80k/mo hiding in missed leads, no-shows, and underpriced packages.",
    "Want to run it live on your numbers? Book a 30-min strategy call below and I'll have a tailored plan ready for you in 48 hours."
  ]
};

function classify(q) {
  const s = q.toLowerCase();
  if (/cancel|no.?show|gap|fill/.test(s)) return 'cancel';
  if (/revenue|double|income|grow|sales|money/.test(s)) return 'revenue';
  if (/caption|ig|instagram|post|promo|ad copy|write/.test(s)) return 'caption';
  if (/hipaa|data|security|privacy|compliance/.test(s)) return 'hipaa';
  return 'default';
}

function addMsg(text, who = 'bot') {
  const d = document.createElement('div');
  d.className = `msg ${who}`;
  d.innerHTML = `<p>${text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/_(.+?)_/g, '<em>$1</em>')}</p>`;
  chatBody.appendChild(d);
  chatBody.scrollTop = chatBody.scrollHeight;
  return d;
}

function addTyping() {
  const d = document.createElement('div');
  d.className = 'msg typing bot';
  d.innerHTML = '<span></span><span></span><span></span>';
  chatBody.appendChild(d);
  chatBody.scrollTop = chatBody.scrollHeight;
  return d;
}

async function respond(q) {
  addMsg(q, 'user');
  const kind = classify(q);
  const lines = RESPONSES[kind];
  for (let i = 0; i < lines.length; i++) {
    const t = addTyping();
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    t.remove();
    addMsg(lines[i], 'bot');
    await new Promise(r => setTimeout(r, 250));
  }
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = chatText.value.trim();
  if (!q) return;
  chatText.value = '';
  respond(q);
});

document.querySelectorAll('.chip').forEach(c => {
  c.addEventListener('click', () => respond(c.dataset.q));
});

/* ---------- ROI Calculator ---------- */
const S = {
  clients: document.getElementById('s-clients'),
  ticket: document.getElementById('s-ticket'),
  noshow: document.getElementById('s-noshow'),
  ads: document.getElementById('s-ads'),
};
const V = {
  clients: document.getElementById('v-clients'),
  ticket: document.getElementById('v-ticket'),
  noshow: document.getElementById('v-noshow'),
  ads: document.getElementById('v-ads'),
};
const K = {
  current: document.getElementById('k-current'),
  future: document.getElementById('k-future'),
  delta: document.getElementById('k-delta'),
  hours: document.getElementById('k-hours'),
  recovered: document.getElementById('k-recovered'),
  roas: document.getElementById('k-roas'),
  bc: document.getElementById('b-current'),
  bf: document.getElementById('b-future'),
};

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

function calcROI() {
  const clients = +S.clients.value;
  const ticket = +S.ticket.value;
  const noshow = +S.noshow.value;
  const ads = +S.ads.value;

  V.clients.textContent = clients;
  V.ticket.textContent = fmt(ticket);
  V.noshow.textContent = noshow + '%';
  V.ads.textContent = fmt(ads);

  const effective = clients * (1 - noshow / 100);
  const current = effective * ticket;

  // AI lifts: +35% bookings, +18% ticket, no-show halved, ROAS 3x on ads
  const liftBookings = 1.35;
  const liftTicket = 1.18;
  const liftNoshow = 0.5;
  const newEffective = clients * liftBookings * (1 - (noshow * liftNoshow) / 100);
  const future = newEffective * ticket * liftTicket;

  const delta = future - current;
  const pct = current > 0 ? Math.round((delta / current) * 100) : 0;

  K.current.textContent = fmt(current);
  K.future.textContent = fmt(future);
  K.delta.textContent = `+ ${fmt(delta)} / mo • +${pct}%`;

  const maxBar = Math.max(current, future) * 1.1;
  K.bc.style.width = `${(current / maxBar) * 100}%`;
  K.bf.style.width = `${(future / maxBar) * 100}%`;

  K.hours.textContent = Math.round(12 + clients * 0.08);
  K.recovered.textContent = Math.round(clients * (noshow / 100) * liftNoshow);
  K.roas.textContent = (Math.min(8, 3 + ads / 15000)).toFixed(1) + 'x';
}
Object.values(S).forEach(s => s.addEventListener('input', calcROI));
calcROI();

/* ---------- Before/After slider ---------- */
const ba = document.getElementById('ba');
const baHandle = document.getElementById('ba-handle');
const baAfter = ba.querySelector('.ba-after');
let draggingBA = false;

function setBA(pct) {
  pct = Math.max(2, Math.min(98, pct));
  baHandle.style.left = pct + '%';
  baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
}
setBA(50);

function pointerMove(e) {
  if (!draggingBA) return;
  const r = ba.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  setBA((x / r.width) * 100);
}
function pointerUp() { draggingBA = false; document.body.style.userSelect = ''; }
baHandle.addEventListener('mousedown', () => { draggingBA = true; document.body.style.userSelect = 'none'; });
baHandle.addEventListener('touchstart', () => { draggingBA = true; }, { passive: true });
window.addEventListener('mousemove', pointerMove);
window.addEventListener('touchmove', pointerMove, { passive: true });
window.addEventListener('mouseup', pointerUp);
window.addEventListener('touchend', pointerUp);
ba.addEventListener('click', e => {
  const r = ba.getBoundingClientRect();
  setBA(((e.clientX - r.left) / r.width) * 100);
});

/* ---------- Stat counters ---------- */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.count;
      const duration = 1600;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  formNote.textContent = '✓ Thanks — we\'ll reach out within 12 hours.';
  contactForm.reset();
  setTimeout(() => formNote.textContent = '', 6000);
});

/* ---------- Year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===========================================================
   ADVANCED ADDITIONS
   =========================================================== */

/* ---------- Cursor blob ---------- */
const blob = document.querySelector('.cursor-blob');
let bx = 0, by = 0;
(function blobLoop() {
  bx += (mx - bx) * 0.08;
  by += (my - by) * 0.08;
  if (blob) blob.style.transform = `translate3d(${bx - 150}px, ${by - 150}px, 0)`;
  requestAnimationFrame(blobLoop);
})();

/* ---------- Hero word rotator ---------- */
(function rotator() {
  const words = document.querySelectorAll('.rot-word');
  if (!words.length) return;
  let i = 0;
  setInterval(() => {
    words[i].classList.remove('active');
    words[i].classList.add('leaving');
    const next = (i + 1) % words.length;
    words[next].classList.remove('leaving');
    words[next].classList.add('active');
    // Reset previous after transition
    setTimeout(() => words[i].classList.remove('leaving'), 800);
    i = next;
  }, 2400);
})();

/* ---------- Split text reveal ---------- */
(function splitText() {
  const els = document.querySelectorAll('.split');
  els.forEach(el => {
    const text = el.innerHTML;
    // Skip if contains complex children (keep span.gradient etc)
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        // Text node - split to chars
        n.textContent.split('').forEach(ch => {
          const s = document.createElement('span');
          s.className = 'split-char';
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          el.appendChild(s);
        });
      } else {
        // Element - split its text
        const inner = n.textContent;
        const wrapper = document.createElement(n.tagName.toLowerCase());
        if (n.className) wrapper.className = n.className;
        inner.split('').forEach(ch => {
          const s = document.createElement('span');
          s.className = 'split-char';
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          wrapper.appendChild(s);
        });
        el.appendChild(wrapper);
      }
    });
    el.classList.add('split-ready');
  });
  // Observer to trigger
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const chars = e.target.querySelectorAll('.split-char');
        chars.forEach((c, i) => {
          setTimeout(() => c.style.cssText = 'transform: translateY(0); opacity: 1;', i * 22);
        });
        e.target.classList.add('split-active');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach(el => obs.observe(el));
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

  // Show after hero
  if (window.scrollY > window.innerHeight * 0.6) {
    sideNav && sideNav.classList.add('show');
    floatingCTA && floatingCTA.classList.add('show');
  } else {
    sideNav && sideNav.classList.remove('show');
    floatingCTA && floatingCTA.classList.remove('show');
  }

  // Hide floating CTA while viewing contact section
  const contact = document.getElementById('contact');
  if (contact) {
    const r = contact.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.8) floatingCTA && floatingCTA.classList.remove('show');
  }
}
window.addEventListener('scroll', updateSideNav, { passive: true });
updateSideNav();

/* ---------- Pinned horizontal flow scroll ---------- */
if (window.gsap && window.ScrollTrigger && window.innerWidth > 900) {
  const panels = document.querySelector('.flow-panels');
  const flow = document.querySelector('.flow');
  if (panels && flow) {
    const scrollAmount = () => panels.scrollWidth - window.innerWidth + 160;
    const progressBar = document.getElementById('flow-progress-bar');
    gsap.to(panels, {
      x: () => -scrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: flow,
        start: 'top top',
        end: () => `+=${scrollAmount()}`,
        scrub: 0.6,
        pin: '.flow-sticky',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (progressBar) progressBar.style.width = (self.progress * 100) + '%';
        }
      }
    });
  }
}

/* ---------- Live dashboard preview ---------- */
(function dashboard() {
  // Chart line
  const points = [];
  for (let i = 0; i < 30; i++) {
    const base = 40 + i * 2.4;
    const noise = Math.sin(i * 0.7) * 12 + Math.random() * 10;
    points.push(Math.max(10, Math.min(130, 140 - (base + noise))));
  }
  const line = document.getElementById('dc-line');
  const fill = document.getElementById('dc-fill');
  const dot = document.getElementById('dc-dot');
  const W = 400, gap = W / (points.length - 1);
  const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * gap},${y}`).join(' ');
  if (line) line.setAttribute('d', path);
  if (fill) fill.setAttribute('d', `${path} L${W},140 L0,140 Z`);
  if (dot) { dot.setAttribute('cx', W); dot.setAttribute('cy', points[points.length - 1]); }

  // Animate line draw on intersect
  if (line) {
    const len = 1000;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    const o = new IntersectionObserver(e => {
      if (e[0].isIntersecting) {
        line.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.3,0,.3,1)';
        line.style.strokeDashoffset = 0;
        o.disconnect();
      }
    }, { threshold: 0.3 });
    o.observe(line);
  }

  // Tick counters
  const counters = [
    { el: document.getElementById('dc-rev'), val: 184320, fmt: n => '$' + Math.round(n).toLocaleString() },
    { el: document.getElementById('dc-conv'), val: 347, fmt: n => Math.round(n).toLocaleString() },
    { el: document.getElementById('dc-book'), val: 82, fmt: n => Math.round(n).toString() },
    { el: document.getElementById('dc-rev2'), val: 1284, fmt: n => Math.round(n).toLocaleString() },
    { el: document.getElementById('dc-ltv'), val: 3240, fmt: n => '$' + Math.round(n).toLocaleString() },
  ];
  counters.forEach(c => {
    if (!c.el) return;
    let cur = 0;
    const start = performance.now();
    const dur = 1800;
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      cur = c.val * e;
      c.el.textContent = c.fmt(cur);
      if (p < 1) requestAnimationFrame(tick);
    }
    const obs = new IntersectionObserver(ent => {
      if (ent[0].isIntersecting) { requestAnimationFrame(tick); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(c.el);
  });

  // Periodic ticks (live feel)
  setInterval(() => {
    const rev = document.getElementById('dc-rev');
    const conv = document.getElementById('dc-conv');
    const book = document.getElementById('dc-book');
    if (rev) {
      const cur = parseInt(rev.textContent.replace(/[^0-9]/g, '')) || 184320;
      rev.textContent = '$' + (cur + Math.floor(Math.random() * 120 + 20)).toLocaleString();
      rev.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 400 });
    }
    if (conv) {
      const cur = parseInt(conv.textContent) || 347;
      conv.textContent = (cur + Math.floor(Math.random() * 3 + 1)).toLocaleString();
    }
    if (book && Math.random() > 0.5) {
      const cur = parseInt(book.textContent) || 82;
      book.textContent = cur + 1;
    }
  }, 2800);

  // Tabs (visual toggle only)
  document.querySelectorAll('.dash-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.dash-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });

  // Animated feed
  const feed = document.getElementById('dc-feed');
  const feedItems = [
    'Auto-filled 9:30 Botox slot via SMS',
    'Sent IG reply to @velvet_beauty_',
    'Re-engaged dormant client — booked consult',
    'Drafted 5★ review response (tone-matched)',
    'Reallocated $240 ad spend to TikTok',
    'Flagged churn risk: client #4827',
    'A/B variant B winning (+34% CTR)',
    'Upsold HydraFacial → Platinum',
    'Sent birthday offer to 12 VIPs',
    'Recovered 2 no-shows via waitlist',
  ];
  let fi = 0;
  function pushFeed() {
    if (!feed) return;
    const el = document.createElement('div');
    el.className = 'dc-feed-item';
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    el.innerHTML = `<span class="dot"></span><span>${feedItems[fi % feedItems.length]}</span><span class="time">${hh}:${mm}:${ss}</span>`;
    feed.prepend(el);
    while (feed.children.length > 4) feed.removeChild(feed.lastChild);
    fi++;
  }
  // Seed with 3
  for (let i = 0; i < 3; i++) pushFeed();
  setInterval(pushFeed, 3200);
})();

/* ---------- Smooth-reveal for price cards via scroll ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.from('.price-card', {
    y: 80, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.price-grid', start: 'top 75%' }
  });
  gsap.from('.faq-item', {
    y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.faq-list', start: 'top 80%' }
  });
  gsap.from('.int-pill', {
    opacity: 0, scale: 0.8, duration: 0.6, stagger: 0.02, ease: 'power2.out',
    scrollTrigger: { trigger: '.integrations', start: 'top 80%' }
  });
}

/* ---------- FAQ: only one open at a time ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

/* ---------- Price card hover spotlight ---------- */
document.querySelectorAll('.price-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
});
