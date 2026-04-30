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

/* ---------- GSAP scroll effects (hero parallax only;
   cascade reveals are handled by the IntersectionObserver below) ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

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

/* ---------- Morphing background blob (shape-shifts on scroll) ---------- */
(function morphBg() {
  const path = document.getElementById('morph-path');
  const wrap = document.querySelector('.morph-bg');
  if (!path) return;

  // Pre-baked organic blob shapes — one per major scroll milestone.
  const shapes = [
    'M421,318Q393,386,322,418Q251,450,179,419Q107,388,86,309Q65,230,116,164Q167,98,243,86Q319,74,377,124Q435,174,438,237Q441,300,421,318Z',
    'M455,300Q425,375,355,408Q285,441,212,420Q139,399,98,330Q57,261,98,184Q139,107,221,82Q303,57,371,108Q439,159,455,229Q471,299,455,300Z',
    'M409,335Q379,400,303,422Q227,444,156,416Q85,388,75,308Q65,228,123,170Q181,112,261,92Q341,72,395,135Q449,198,438,266Q427,334,409,335Z',
    'M433,310Q420,385,346,422Q272,459,193,432Q114,405,87,326Q60,247,113,177Q166,107,247,85Q328,63,388,118Q448,173,452,236Q456,299,433,310Z',
    'M395,325Q375,395,302,425Q229,455,160,420Q91,385,80,305Q69,225,124,162Q179,99,259,82Q339,65,400,122Q461,179,452,252Q443,325,395,325Z',
  ];
  const colors = [
    ['#f9c6d1', '#e6c188', '#8fc5ff'],
    ['#ffd1dc', '#b3d8ff', '#f9c6d1'],
    ['#e6c188', '#f9c6d1', '#b3d8ff'],
    ['#8fc5ff', '#f9c6d1', '#e6c188'],
    ['#f9c6d1', '#8fc5ff', '#ffe9c7'],
  ];
  const stops = document.querySelectorAll('#morphGrad stop');

  let cur = 0;
  function pickShape() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    const idx = Math.min(shapes.length - 1, Math.floor(p * shapes.length));
    if (idx !== cur) {
      cur = idx;
      path.setAttribute('d', shapes[idx]);
      if (stops.length === 3 && colors[idx]) {
        stops[0].setAttribute('stop-color', colors[idx][0]);
        stops[1].setAttribute('stop-color', colors[idx][1]);
        stops[2].setAttribute('stop-color', colors[idx][2]);
      }
    }
    if (wrap) {
      const tx = Math.sin(p * Math.PI * 2) * 6;
      const ty = p * 8;
      const rot = p * 30;
      wrap.style.transform = `translate3d(${tx}%, ${ty}%, 0) rotate(${rot}deg)`;
    }
  }
  pickShape();
  window.addEventListener('scroll', pickShape, { passive: true });
})();

/* ---------- Cascading scroll reveals (blur-up + stagger) ---------- */
(function cascadeReveals() {
  // Tag every major group as a cascade-stagger and individual section heads as cascade.
  const staggerGroups = [
    '.problem-list',
    '.features-grid',
    '.results-grid',
    '.how-steps',
  ];
  staggerGroups.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('cascade-stagger');
  });
  document.querySelectorAll('.section-head, .solution-inner, .cta-inner, .features-cta').forEach(el => {
    el.classList.add('cascade');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.cascade, .cascade-stagger').forEach(el => obs.observe(el));
})();

/* ---------- KABZ AI Chatbot ---------- */
(function kabzBot() {
  const bot = document.getElementById('kabz-bot');
  const launcher = document.getElementById('kbot-launcher');
  const minBtn = document.getElementById('kbot-min');
  const body = document.getElementById('kbot-body');
  const form = document.getElementById('kbot-form');
  const input = document.getElementById('kbot-text');
  if (!bot || !launcher || !body) return;

  const COMPANY = {
    name: 'AI Kabz Limited',
    email: 'vin@aikabz.com',
    address: '12 Yew Tree Walk, Frimley, Camberley, GU16 8LG, England',
    company_no: '17183858',
    calendly: window.AIKAB_CALENDLY_URL || '#cta',
  };

  const ANSWERS = {
    services: [
      "We build AI systems that turn missed enquiries into booked clients — automatically.",
      "Our core systems: AI WhatsApp Booking, Missed Call Recovery, AI Receptionist, Automated Follow-Ups, Reactivation Campaigns, and Conversion Optimisation.",
      "Want to see it run for your business? Just type <b>demo</b> and I'll get you booked in."
    ],
    contact: [
      `📧 Email: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>`,
      `🏢 ${COMPANY.name}`,
      `📍 ${COMPANY.address}`,
      `Registered in England and Wales · Company No. ${COMPANY.company_no}`
    ],
    pricing: [
      "Pricing is scoped to your business size, channels, and integration depth.",
      "Most clients start with a Demo — we walk you through the leak points in your enquiry flow and quote based on outcomes, not seats.",
      "Type <b>demo</b> to book a 30-minute call."
    ],
    address: [
      `🏢 <b>${COMPANY.name}</b>`,
      `📍 ${COMPANY.address}`,
      `Company No. ${COMPANY.company_no} · Registered in England and Wales`
    ],
    demo: [
      "Perfect — let's get you booked in.",
      `Tap here to open the calendar: <a href="${COMPANY.calendly}" target="_blank" rel="noopener">Book a Demo</a>`,
      "30 minutes. No pressure. You'll walk away with a clear plan."
    ],
    email: [
      `Easiest way to reach us: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>`
    ],
    hours: [
      "Our AI systems run 24/7 for your clients.",
      "Our human team is UK-based — we typically reply to enquiries within a few hours during working hours."
    ],
    fallback: [
      "Great question — I'd love to dig in deeper on a quick call.",
      `You can email us at <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> or type <b>demo</b> to book a slot.`
    ]
  };

  function classify(q) {
    const s = q.toLowerCase();
    if (/\b(demo|book|appointment|call|meeting|schedule)\b/.test(s)) return 'demo';
    if (/\b(address|office|where|located|location|hq|headquarters)\b/.test(s)) return 'address';
    if (/\b(email|reach|contact|phone|number)\b/.test(s)) return 'contact';
    if (/\b(price|pricing|cost|how much|fee|fees|quote)\b/.test(s)) return 'pricing';
    if (/\b(service|services|do|offer|product|features|what)\b/.test(s)) return 'services';
    if (/\b(hours|open|when|available|time)\b/.test(s)) return 'hours';
    return 'fallback';
  }

  function addMsg(html, who = 'bot') {
    const div = document.createElement('div');
    div.className = `kbot-msg ${who}`;
    div.innerHTML = `<p>${html}</p>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function addTyping() {
    const t = document.createElement('div');
    t.className = 'kbot-msg bot typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  async function respond(q) {
    addMsg(q, 'user');
    const kind = classify(q);
    const lines = ANSWERS[kind] || ANSWERS.fallback;
    for (const line of lines) {
      const t = addTyping();
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      t.remove();
      addMsg(line, 'bot');
      await new Promise(r => setTimeout(r, 200));
    }
  }

  function open() { bot.classList.add('open'); setTimeout(() => input && input.focus(), 350); }
  function close() { bot.classList.remove('open'); }

  launcher.addEventListener('click', () => bot.classList.contains('open') ? close() : open());
  minBtn && minBtn.addEventListener('click', close);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    respond(q);
  });

  document.querySelectorAll('.kbot-chip').forEach(c => {
    c.addEventListener('click', () => {
      const key = c.dataset.q;
      // Use the chip label as the user's "spoken" question
      addMsg(c.textContent, 'user');
      (async () => {
        const lines = ANSWERS[key] || ANSWERS.fallback;
        for (const line of lines) {
          const t = addTyping();
          await new Promise(r => setTimeout(r, 500 + Math.random() * 350));
          t.remove();
          addMsg(line, 'bot');
          await new Promise(r => setTimeout(r, 180));
        }
      })();
    });
  });

  // Auto-open invitation after 12s if user hasn't engaged
  setTimeout(() => {
    if (!bot.classList.contains('open') && !sessionStorage.getItem('kbot-seen')) {
      launcher.classList.add('kbot-bounce');
      sessionStorage.setItem('kbot-seen', '1');
    }
  }, 12000);
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
