/* REVNT prototype — state, actions, router, layout */

let S = freshState();
let MOBILE = false;

/* ---------- theme ---------- */
const THEME_LABEL = { system: 'Match system', light: 'Light', dark: 'Dark' };
let theme = 'system';
try { theme = localStorage.getItem('revnt-theme') || 'system'; } catch (e) { /* storage blocked */ }
function applyTheme() {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-set]').forEach(b => { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', b.dataset.themeSet === theme); });
  try { localStorage.setItem('revnt-theme', theme); } catch (e) { /* ignore */ }
}
applyTheme();

/* ---------- actions (data-act="name" data-v="value") ---------- */
const A = {
  fav(el) { const id = el.dataset.id; S.fav.has(id) ? S.fav.delete(id) : S.fav.add(id); el.classList.toggle('on'); el.setAttribute('aria-pressed', S.fav.has(id)); toast(S.fav.has(id) ? 'Saved to favourites' : 'Removed from favourites'); },
  toast(el) { toast(el.dataset.msg); },
  back() { back(); },
  menu() { openSide(true); },
  peek(el) { const p = document.getElementById('si-pass'); p.type = p.type === 'password' ? 'text' : 'password'; el.innerHTML = I(p.type === 'password' ? 'visibility' : 'visibility_off'); },
  signin() {
    const e = document.getElementById('si-email').value.trim(), p = document.getElementById('si-pass').value;
    if (!/\S+@\S+\.\S+/.test(e)) return toast('Enter a valid email to sign in');
    if (p.length < 6) return toast('Password needs at least 6 characters');
    go('home');
  },
  terms(el) { S.agreed = !S.agreed; el.classList.toggle('on', S.agreed); el.setAttribute('aria-pressed', S.agreed); },
  register() {
    if (!S.agreed) return toast('Tick “I agree to Terms and Conditions” to continue');
    const n = document.getElementById('rg-name').value.trim(); if (n) S.name = n;
    go('verify');
  },
  acceptTerms() { S.agreed = true; S.hist.length ? back() : go('signin'); },
  resend() { if (S.resendLeft > 0) return; toast('New code sent'); startResend(); },
  verify() {
    const v = [0, 1, 2, 3, 4, 5].map(i => document.getElementById('otp' + i).value).join('');
    if (v.length < 6) return toast('Enter all 6 digits');
    go('personal');
  },
  personal() {
    S.name = document.getElementById('pz-name').value.trim() || S.name;
    S.location = document.getElementById('pz-loc').value.trim() || S.location;
    S.style = document.getElementById('pz-style').value;
    go('purpose');
  },
  purpose(el) { S.purpose = el.dataset.v; rerender(); },
  purposeDone() { go(S.purpose === 'lease' ? 'listGear' : 'home'); },

  cat(el) { const c = el.dataset.v; S.results = { label: c, cats: [c], max: 2000 }; go('results'); },
  sort() { S.sortDir = S.sortDir === 0 ? 1 : S.sortDir === 1 ? -1 : 0; rerender(); },
  xcat(el) { S.exploreCat = el.dataset.v; rerender(); },
  fcat(el) { const c = el.dataset.v, F = S.filters.cats; F.has(c) ? F.delete(c) : F.add(c); rerender(); },
  fsize(el) { S.filters.size = el.dataset.v; rerender(); },
  brands() { S.filters.brands = !S.filters.brands; rerender(); },
  clearF() { S.filters = { cats: new Set(), max: 2000, size: 'S', brands: false }; rerender(); toast('Filters cleared'); },
  applyF() {
    let cats = [...S.filters.cats];
    const label = cats.length === 1 ? cats[0] : cats.length ? 'Results' : 'All Gear';
    if (!cats.length) cats = [...new Set(GEAR.map(g => g.cat))];
    S.results = { label, cats, max: S.filters.max };
    S.size = S.filters.size;
    go('results');
  },
  size(el) { S.size = el.dataset.v; rerender(); },
  avail(el) {
    S.day = +el.dataset.v; const d = 21 + S.day;
    S.from = `2026-01-${d}`; if (S.to <= S.from) S.to = `2026-01-${d + 2}`;
    rerender(); toast(`Pick-up set to ${fmtDate(S.from)}`);
  },
  slide(el) { const c = document.getElementById('car'); c.scrollTo({ left: +el.dataset.v * c.clientWidth, behavior: 'smooth' }); },
  chat(el) { S.chatWith = el.dataset.v; go('chat'); },
  breakup() { S.breakup = !S.breakup; rerender(); },
  pay(el) { S.pay = el.dataset.v; rerender(); },
  payNow(el) {
    el.innerHTML = '<span class="spin"></span>Processing'; el.disabled = true;
    setTimeout(() => {
      const short = iso => fmtDate(iso).replace(/, \d+$/, '');
      S.rentals.unshift({ gear: S.gear, from: short(S.from), to: short(S.to), pickup: S.pickup.split(',')[0].replace(/ \(.*/, ''), status: 'Upcoming' });
      go('confirmed');
    }, 1100);
  },
  viewRentals() { S.rentTab = 'Upcoming'; go('rentals'); },
  rtab(el) { S.rentTab = el.dataset.v; rerender(); },

  lcat(el) { S.listing.cat = el.dataset.v; go('addPhotos'); },
  gearInfo() {
    const L = S.listing, v = id => document.getElementById(id).value.trim();
    L.name = v('gi-name'); L.brand = v('gi-brand'); L.model = v('gi-model'); L.desc = v('gi-desc');
    if (!L.name) return toast('Give your gear a name');
    go('pricing');
  },
  cal() { savePricing(); S.calOpen = !S.calOpen; rerender(); },
  block(el) { savePricing(); const d = +el.dataset.v, B = S.listing.blocked; B.has(d) ? B.delete(d) : B.add(d); rerender(); },
  pricing() { savePricing(); if (!(S.listing.perDay > 0)) return toast('Set a price per day'); go('review'); },
  publish() {
    const L = S.listing;
    S.myListings.unshift({ title: (L.name || 'New gear').toUpperCase(), price: L.perDay, status: 'Active', photo: L.photos[0] });
    S.listTab = 'Active'; go('live');
  },
  ltab(el) { S.listTab = el.dataset.v; rerender(); },
  qtab(el) { S.reqTab = el.dataset.v; rerender(); },
  openReq(el) { S.req = +el.dataset.v; go('reqDetail'); },
  decide(el) {
    const r = S.requests.find(x => x.id === S.req); r.status = el.dataset.v;
    toast(`${r.who}’s request ${r.status.toLowerCase()}`); S.reqTab = r.status; back();
  },

  bar(el) { S.bar = +el.dataset.v; rerender(); },
  txAll() { S.txAll = !S.txAll; rerender(); },
  faq(el) { const i = +el.dataset.v; S.faq = S.faq === i ? -1 : i; rerender(); },
  cycleTheme() { theme = { system: 'light', light: 'dark', dark: 'system' }[theme]; applyTheme(); rerender(); toast(`Appearance: ${THEME_LABEL[theme]}`); },
  logout() { S.hist = []; S.cur = 'signin'; paint('b'); toast('Logged out'); }
};

function savePricing() {
  const L = S.listing, v = id => document.getElementById(id);
  if (!v('pr-day')) return;
  L.perDay = +v('pr-day').value || 0; L.perWeek = v('pr-week').value; L.deposit = +v('pr-dep').value || 0;
}

/* ---------- helpers ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function wireFile(id, cb, multi) {
  const f = document.getElementById(id); if (!f) return;
  f.addEventListener('change', () => {
    [...f.files].slice(0, multi ? 10 : 1).forEach(file => {
      const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file);
    });
  });
}
/* re-render while typing, keeping focus and caret */
function liveInput(id, set) {
  const el = document.getElementById(id); if (!el) return;
  el.addEventListener('input', () => {
    set(el.value); const pos = el.selectionStart; rerender();
    const n = document.getElementById(id); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* search inputs */ }
  });
}
function wireOtp() {
  const ins = [...document.querySelectorAll('#otp input')];
  if (!MOBILE) ins[0].focus();
  const done = () => setTimeout(() => { if (S.cur === 'verify') go('personal'); }, 350);
  ins.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      const digits = inp.value.replace(/\D/g, '');
      if (digits.length > 1) { digits.slice(0, 6 - i).split('').forEach((c, j) => { ins[i + j].value = c; ins[i + j].classList.add('filled'); }); }
      else inp.value = digits;
      inp.classList.toggle('filled', !!inp.value);
      const next = ins.find(x => !x.value); if (next && inp.value) next.focus();
      if (ins.every(x => x.value)) done();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); });
  });
}
let resendTimer;
function startResend() {
  clearInterval(resendTimer); S.resendLeft = 30;
  const tick = () => {
    const b = document.getElementById('resend'); if (!b) { clearInterval(resendTimer); return; }
    b.textContent = S.resendLeft > 0 ? `(00:${String(S.resendLeft).padStart(2, '0')})` : 'Resend now';
    if (S.resendLeft-- <= 0) clearInterval(resendTimer);
  };
  tick(); resendTimer = setInterval(tick, 1000);
}

/* ---------- router ---------- */
const phone = document.getElementById('phone');
function paint(dir) {
  const sc = SCREENS[S.cur];
  const old = phone.querySelector('.scr');
  const keepTop = !dir && old ? old.querySelector('.bd')?.scrollTop : 0;
  const n = document.createElement('div');
  n.className = 'scr' + (dir ? ` in-${dir}` : '');
  n.innerHTML = sc.html();
  if (old) old.replaceWith(n); else phone.prepend(n);
  if (keepTop) { const b = n.querySelector('.bd'); if (b) b.scrollTop = keepTop; }
  sc.after && sc.after();
  syncChrome();
}
function go(id) {
  if (!SCREENS[id]) return;
  if (S.cur !== id) S.hist.push(S.cur);
  S.cur = id; paint('f');
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandboxed */ }
}
function rerender() { paint(null); }
function back() {
  if (!S.hist.length) return;
  S.cur = S.hist.pop(); paint('b');
  try { history.replaceState(null, '', '#' + S.cur); } catch (e) { /* sandboxed */ }
}

phone.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && phone.contains(a)) { e.preventDefault(); A[a.dataset.act]?.(a); return; }
  const g = e.target.closest('[data-go]');
  if (g && phone.contains(g)) { e.preventDefault(); if (g.dataset.gear) S.gear = g.dataset.gear; go(g.dataset.go); }
});

/* swipe: onboarding slides, and edge-swipe back on phones */
let sx = null, sy = null;
phone.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; }, { passive: true });
phone.addEventListener('pointerup', e => {
  if (sx === null) return;
  const dx = e.clientX - sx, dy = Math.abs(e.clientY - sy), startX = sx; sx = null;
  if (dy > 60 || Math.abs(dx) < 60) return;
  if (/^onb\d$/.test(S.cur)) { const i = +S.cur.slice(3); if (dx < 0) go(i < 3 ? 'onb' + (i + 1) : 'signin'); else if (i > 1) back(); return; }
  const left = phone.getBoundingClientRect().left;
  if (dx > 0 && startX - left < 30) back();
}, { passive: true });

/* ---------- screen map ---------- */
const side = document.getElementById('side');
const map = document.getElementById('map');
map.innerHTML = GROUPS.map((g, gi) => `<section class="grp"><h3>${g}</h3><ol>${Object.entries(SCREENS).filter(([, s]) => s.grp === gi)
  .map(([id, s], i) => `<li><button data-jump="${id}"><span class="n">${gi + 1}.${i + 1}</span>${s.name}</button></li>`).join('')}</ol></section>`).join('');
map.addEventListener('click', e => { const b = e.target.closest('[data-jump]'); if (!b) return; go(b.dataset.jump); openSide(false); });
function openSide(open) { side.classList.toggle('open', open); }
document.getElementById('scrim').onclick = () => openSide(false);
document.getElementById('closeSide').onclick = () => openSide(false);
document.getElementById('openMap').onclick = () => openSide(true);
document.getElementById('back').onclick = back;
document.getElementById('restart').onclick = () => { S = freshState(); openSide(false); paint('b'); };
document.querySelectorAll('[data-theme-set]').forEach(b => b.addEventListener('click', () => { theme = b.dataset.themeSet; applyTheme(); if (S.cur === 'settings') rerender(); }));
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (side.classList.contains('open')) return openSide(false);
  if (!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) back();
});

function syncChrome() {
  map.querySelectorAll('[data-jump]').forEach(b => {
    const on = b.dataset.jump === S.cur;
    b.setAttribute('aria-current', on);
    if (on) b.scrollIntoView({ block: 'nearest' });
  });
  const sc = SCREENS[S.cur];
  document.getElementById('crumb').innerHTML = `${GROUPS[sc.grp]} / <b>${sc.name}</b>`;
  document.getElementById('back').disabled = !S.hist.length;
  document.title = `${sc.name} · REVNT Prototype`;
}

/* ---------- layout: phone frame on big screens, full-screen on phones ---------- */
const holder = document.getElementById('holder'), stage = document.getElementById('stage');
function layout() {
  const wasMobile = MOBILE;
  MOBILE = window.innerWidth <= 600 || (window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) <= 600);
  document.body.classList.toggle('mobile', MOBILE);
  if (!MOBILE) {
    const narrow = window.innerWidth <= 900;
    const w = stage.clientWidth - 32, h = stage.clientHeight - (narrow ? 84 : 100);
    const s = Math.max(.35, Math.min(1, w / 424, h / 896));
    phone.style.transform = `scale(${s})`;
    holder.style.width = 402 * s + 'px';
    holder.style.height = 874 * s + 'px';
    holder.style.marginTop = narrow ? '20px' : '28px';
  } else {
    phone.style.transform = ''; holder.style.cssText = '';
  }
  if (wasMobile !== MOBILE && phone.querySelector('.scr')) rerender();
}
let resizeRaf;
window.addEventListener('resize', () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(layout); });
window.addEventListener('orientationchange', () => setTimeout(layout, 200));
layout();

const start = location.hash.slice(1);
S.cur = SCREENS[start] ? start : 'splash';
paint(null);

/* icon font fallback for offline use */
if (document.fonts && document.fonts.load) {
  setTimeout(() => {
    document.fonts.load('24px "Material Symbols Outlined"', 'home')
      .then(f => { if (!f.length) document.body.classList.add('no-icons'); })
      .catch(() => document.body.classList.add('no-icons'));
  }, 2500);
}
