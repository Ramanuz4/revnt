/* REVNT — UI helpers and motion */

const I = (n, c = '') => `<span class="ms ${c}" aria-hidden="true">${n}</span>`;
const rs = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* product art tile: gradient + stripes + big icon */
function art(catId, { icon, cls = '', tag = '', img = '', big = false } = {}) {
  const c = catById(catId);
  return `<div class="art tint-${c.tint} ${cls}">${img ? `<img src="${img}" alt="">` : I(icon || c.icon, big ? 'huge' : '')}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</div>`;
}
const heart = (id) => `<button class="heart ${S.fav.has(id) ? 'on' : ''}" data-act="fav" data-id="${id}" aria-label="Save ${esc(gearById(id).name)}" aria-pressed="${S.fav.has(id)}">${I('favorite')}</button>`;
function gcard(g, i = 0) {
  return `<article class="gcard" data-reveal style="--d:${i % 8}">
    ${heart(g.id)}
    <a href="#/gear/${g.id}" aria-label="${esc(g.name)}">${art(g.cat, { tag: g.cat })}</a>
    <a class="body" href="#/gear/${g.id}">
      <span class="nm">${esc(g.name)}</span>
      <span class="meta"><span class="rate">${I('star')}${g.rating}</span><span class="km">· ${g.km} km · ${esc(g.area)}</span></span>
      <span class="pr"><b>${rs(g.price)}</b>/ day</span>
    </a></article>`;
}
const avatarImg = (size, src) => `<span class="avatar" style="width:${size}px;height:${size}px"><img src="${src || ASSETS.avatar}" alt=""></span>`;
const myAvatar = size => avatarImg(size, S.photo);
function seg(items, current, act) {
  return `<div class="seg" role="tablist">${items.map(v => `<button role="tab" class="${current === v ? 'on' : ''}" aria-selected="${current === v}" data-act="${act}" data-v="${v}">${v}</button>`).join('')}<span class="thumb"></span></div>`;
}
const chips = (items, current, act, cls = '') => `<div class="chips ${cls}">${items.map(v => `<button class="chip ${current === v ? 'on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${current === v}">${v}</button>`).join('')}</div>`;
const speedlines = n => `<div class="speed" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="top:${(i * 37 + 7) % 100}%;width:${18 + (i * 13) % 26}vw;animation-duration:${2.4 + (i % 5) * .7}s;animation-delay:-${(i * .9) % 4}s"></i>`).join('')}</div>`;

function checkAnim(size = 140) {
  return `<svg class="check-anim" width="${size}" height="${size}" viewBox="0 0 140 140" aria-hidden="true"><circle class="bg" cx="70" cy="70" r="70"/><circle class="fg" cx="70" cy="70" r="50"/><path d="M48 71l15 15 30-31"/></svg>`;
}
function mountains() {
  return `<svg class="mountains" viewBox="0 0 320 150" aria-hidden="true"><polygon points="85,150 180,18 275,150" style="fill:var(--ink);opacity:.85"/><polygon points="180,18 160,46 172,41 181,52 191,41 201,46" style="fill:var(--bg)"/><polygon points="0,150 80,58 165,150" style="fill:var(--brand)"/><polygon points="175,150 252,64 320,150" style="fill:var(--brand);opacity:.65"/></svg>`;
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg, icon = 'check_circle') {
  const t = $('#toast');
  t.innerHTML = I(icon) + `<span>${esc(msg)}</span>`;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- ripple on buttons ---------- */
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn'); if (!b || REDUCED) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const d = document.createElement('span'); d.className = 'ripple';
  d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(d); setTimeout(() => d.remove(), 650);
});

/* ---------- heart burst ---------- */
function burst(el) {
  if (REDUCED) return;
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('i'); p.className = 'burst'; p.style.setProperty('--a', (i * 45) + 'deg');
    el.appendChild(p); setTimeout(() => p.remove(), 650);
  }
}

/* ---------- scroll reveal ---------- */
let revealObs;
function reveal(root) {
  const els = $$('[data-reveal]:not(.in)', root);
  if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  revealObs = revealObs || new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(e => revealObs.observe(e));
}

/* ---------- count-up numbers ---------- */
function countUp(root) {
  $$('[data-count]', root).forEach(el => {
    const end = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const fmt = v => pre + Math.round(v).toLocaleString('en-IN') + suf;
    if (REDUCED) { el.textContent = fmt(end); return; }
    const start = performance.now(), dur = +el.dataset.dur || 1400;
    const step = t => { const k = Math.min(1, (t - start) / dur); el.textContent = fmt(end * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* ---------- 3D tilt on cards (mouse only) ---------- */
function tilt(root) {
  if (!HOVER || REDUCED) return;
  $$('.gcard', root).forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-6px)`;
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });
}

/* ---------- segmented control thumb ---------- */
function segThumbs(root) {
  $$('.seg', root).forEach(s => {
    const on = $('button.on', s), th = $('.thumb', s); if (!on || !th) return;
    th.style.left = on.offsetLeft + 'px'; th.style.width = on.offsetWidth + 'px';
  });
}

/* ---------- rotating hero word ---------- */
let rotTimer;
function rotator(el) {
  clearInterval(rotTimer); if (!el) return;
  const words = $$('span', el); let i = 0;
  rotTimer = setInterval(() => {
    if (!document.body.contains(el)) return clearInterval(rotTimer);
    words[i].classList.replace('on', 'out');
    const prev = words[i]; setTimeout(() => prev.classList.remove('out'), 650);
    i = (i + 1) % words.length; words[i].classList.add('on');
  }, 2200);
}

/* ---------- mouse parallax for hero art ---------- */
function parallax(root) {
  if (!HOVER || REDUCED) return;
  const box = $('.stack-vis', root); if (!box) return;
  const layers = $$('.fl, .fl-chip', box);
  root.addEventListener('pointermove', e => {
    const x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
    layers.forEach((l, i) => { const d = (i + 1) * 7; l.style.transform = `translate(${x * d}px, ${y * d}px)`; });
  });
}

/* ---------- confetti ---------- */
function confetti(canvas) {
  if (!canvas || REDUCED) return;
  const ctx = canvas.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.width = canvas.offsetWidth * dpr, H = canvas.height = canvas.offsetHeight * dpr;
  const cols = ['#F0643A', '#D94A20', '#F2B04A', '#2E9A68', '#6D93B8', '#1A1D22'];
  const P = Array.from({ length: 150 }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .2, y: H * .35, vx: (Math.random() - .5) * 18 * dpr, vy: (-Math.random() * 16 - 6) * dpr,
    s: (6 + Math.random() * 6) * dpr, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)]
  }));
  const t0 = performance.now();
  (function frame(t) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, W, H);
    P.forEach(p => { p.vy += .45 * dpr; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (t - t0 < 4000) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  })(t0);
}

/* ---------- file inputs & drag-drop ---------- */
function wireFiles(input, cb, multi, dropZone) {
  if (!input) return;
  const read = files => [...files].filter(f => f.type.startsWith('image/')).slice(0, multi ? 10 : 1).forEach(f => { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(f); });
  input.addEventListener('change', () => read(input.files));
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('drag'); }));
    dropZone.addEventListener('drop', e => read(e.dataTransfer.files));
  }
}

function fmtDate(iso, withYear = true) {
  const d = new Date(iso + 'T00:00'); if (isNaN(d)) return iso;
  const n = d.getDate();
  const s = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
  return `${n}${s} ${d.toLocaleString('en', { month: 'short' })}${withYear ? ', ' + d.getFullYear() : ''}`;
}
