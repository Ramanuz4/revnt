/* REVNT — router, actions, site chrome */

let S = freshState();
S.onb = 0; S.gear = 'k5r';

/* ---------- theme ---------- */
let theme = 'system';
try { theme = localStorage.getItem('revnt-theme') || 'system'; } catch (e) { /* storage blocked */ }
function applyTheme(t) {
  theme = t;
  if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('revnt-theme', t); } catch (e) { /* ignore */ }
}
applyTheme(theme);
const isDark = () => theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

/* ---------- routing ---------- */
const view = $('#view');
const navStack = [];
let current = { key: 'home', params: {}, path: 'home' };

function parse(hash) {
  const path = decodeURIComponent((hash || '').replace(/^#\/?/, '')).replace(/\/$/, '');
  if (PAGES[path]) return { key: path, params: {}, path };
  for (const key of Object.keys(PAGES)) {
    if (!key.includes(':')) continue;
    const kp = key.split('/'), pp = path.split('/');
    if (kp.length !== pp.length) continue;
    const params = {}; let ok = true;
    kp.forEach((seg, i) => { if (seg.startsWith(':')) params[seg.slice(1)] = pp[i]; else if (seg !== pp[i]) ok = false; });
    if (ok) return { key, params, path };
  }
  return null;
}
function go(path) { location.hash = '#/' + path; }
function back() {
  if (navStack.length > 1) { history.back(); return; }
  const pg = PAGES[current.key];
  go(typeof pg.back === 'string' ? pg.back : 'home');
}

function onRoute() {
  let r = parse(location.hash);
  if (!r) {
    let seen = false; try { seen = !!localStorage.getItem('revnt-seen'); } catch (e) { /* ignore */ }
    location.replace('#/' + (seen ? 'home' : 'welcome')); return;
  }
  const pg = PAGES[r.key];
  if (pg.auth && !S.signedIn) {
    S.after = r.path; location.replace('#/signin');
    setTimeout(() => toast('Sign in to continue', 'lock'), 100); return;
  }
  let dir = 'fwd';
  if (navStack.length > 1 && navStack[navStack.length - 2] === r.path) { navStack.pop(); dir = 'back'; }
  else if (navStack[navStack.length - 1] !== r.path) navStack.push(r.path);
  current = r;
  closeOverlays();
  render(dir);
}

function render(dir) {
  const pg = PAGES[current.key];
  const nav = !!dir;
  const keepY = nav ? 0 : window.scrollY;
  document.body.classList.toggle('has-tabs', pg.layout === 'site' && !!pg.tab);
  document.body.classList.toggle('has-sticky', current.key === 'gear/:id');
  renderChrome();
  view.innerHTML = pg.html(current.params);
  if (nav) { view.classList.remove('view', 'back'); void view.offsetWidth; view.classList.add('view'); if (dir === 'back') view.classList.add('back'); window.scrollTo(0, 0); }
  else window.scrollTo(0, keepY);
  $$('body > .sticky-cta').forEach(e => e.remove());
  const stickyBar = $('.sticky-cta', view); if (stickyBar) document.body.appendChild(stickyBar); /* keep fixed bars outside the animated view */
  pg.after && pg.after(current.params, view);
  reveal(view); tilt(view); segThumbs(view); countUp(view);
  document.title = pg.title === 'Home' ? 'REVNT — Gear up. Ride out.' : `${pg.title} · REVNT`;
}

/* ---------- chrome: nav, mobile header, tab bar, footer ---------- */
function renderChrome() {
  const pg = PAGES[current.key], site = pg.layout === 'site';
  const navEl = $('#nav'), mh = $('#mhead'), tb = $('#tabbar'), ft = $('#footer');
  navEl.hidden = mh.hidden = !site; ft.hidden = !site || pg.noFooter; tb.hidden = !(site && pg.tab);
  if (!site) return;
  const newReq = S.requests.filter(r => r.status === 'New').length;
  const top = current.path.split('/')[0];
  const links = [['explore', 'Explore'], ['list', 'List gear'], ['rentals', 'My rentals'], ['help', 'Help']];
  navEl.innerHTML = `<div class="wrap">
    <a class="logo" href="#/home" aria-label="REVNT home"><img src="${ASSETS.logo}" alt="">REVNT</a>
    <nav class="nav-links" id="navLinks">${links.map(([p, l]) => `<a href="#/${p}" class="${top === p ? 'on' : ''}">${l}</a>`).join('')}<span class="nav-ind" id="navInd"></span></nav>
    <div class="nav-actions">
      <button class="icon-btn" data-act="themeToggle" aria-label="Toggle dark mode">${I(isDark() ? 'light_mode' : 'dark_mode')}</button>
      ${S.signedIn ? `
        <a class="icon-btn" href="#/messages" aria-label="Messages">${I('chat_bubble')}${S.unread.size ? `<span class="badge">${S.unread.size}</span>` : ''}</a>
        <a class="icon-btn" href="#/notifications" aria-label="Notifications">${I('notifications')}${newReq ? `<span class="badge">${newReq}</span>` : ''}</a>
        <div class="rel"><button class="me-btn" data-act="menuToggle" aria-haspopup="true" aria-expanded="false">${myAvatar(32)}<span class="nm">${esc(S.name.split(' ')[0])}</span>${I('expand_more')}</button><div id="meMenu"></div></div>`
      : `<a class="btn ghost sm" href="#/signin">Sign in</a><a class="btn sm" href="#/register">Get started</a>`}
    </div></div>`;
  requestAnimationFrame(moveNavInd);

  mh.innerHTML = `<div class="in">
    ${pg.back || !pg.tab ? `<button class="icon-btn" data-act="back" aria-label="Back">${I('arrow_back')}</button>` : `<a href="#/home" class="logo" style="font-size:17px"><img src="${ASSETS.logo}" alt="" style="height:26px"></a>`}
    <span class="ttl">${current.key === 'home' ? 'REVNT' : esc(current.key === 'messages/:who' ? current.params.who : pg.title)}</span>
    <button class="icon-btn" data-act="themeToggle" aria-label="Toggle dark mode">${I(isDark() ? 'light_mode' : 'dark_mode')}</button>
    ${S.signedIn ? `<a class="icon-btn" href="#/messages" aria-label="Messages">${I('chat_bubble')}${S.unread.size ? `<span class="badge">${S.unread.size}</span>` : ''}</a>` : `<a class="btn sm" href="#/signin">Sign in</a>`}
  </div>`;

  const tabs = [['home', 'home', 'Home'], ['explore', 'search', 'Explore'], ['list', 'add', ''], ['alerts', 'notifications', 'Alerts'], ['profile', 'account_circle', 'Profile']];
  const route = { home: 'home', explore: 'explore', list: 'list', alerts: 'notifications', profile: 'profile' };
  tb.innerHTML = tabs.map(([k, ic, l]) => k === 'list'
    ? `<a class="tab add" href="#/list" aria-label="List gear"><span class="box">${I(ic)}</span></a>`
    : `<a class="tab ${pg.tab === k ? 'on' : ''}" href="#/${route[k]}" ${pg.tab === k ? 'aria-current="page"' : ''}>${I(ic)}<span>${l}</span>${k === 'alerts' && S.signedIn && newReq ? `<span class="badge" style="top:0;right:10px">${newReq}</span>` : ''}</a>`).join('');

  if (!ft.dataset.done) {
    ft.dataset.done = 1;
    ft.innerHTML = `<div class="wrap"><div class="cols">
      <div><a class="logo" href="#/home"><img src="${ASSETS.logo}" alt="">REVNT</a><p class="small" style="margin-top:12px;max-width:280px">Riding gear rentals from riders, for riders. Gear up. Ride out.</p></div>
      <div><h4>Rent</h4>${CATS.slice(0, 4).map(c => `<button data-act="cat" data-v="${c.id}">${c.id}</button>`).join('')}</div>
      <div><h4>Earn</h4><a href="#/list">List your gear</a><a href="#/earnings">Earnings</a><a href="#/listings">My listings</a></div>
      <div><h4>Company</h4><a href="#/help">Help and Support</a><a href="#/terms">Terms and Conditions</a><a href="#/welcome">How REVNT works</a></div>
    </div><div class="base"><span>© 2026 REVNT · Bengaluru</span><span class="mono">#RideWithREVNT</span></div></div>`;
  }
}
function moveNavInd() {
  const ind = $('#navInd'), on = $('#navLinks a.on');
  if (!ind) return;
  if (!on) { ind.style.opacity = 0; return; }
  ind.style.opacity = 1; ind.style.left = on.offsetLeft + 14 + 'px'; ind.style.width = on.offsetWidth - 28 + 'px';
}
window.addEventListener('scroll', () => {
  const y = window.scrollY > 8;
  $('#nav').classList.toggle('scrolled', y); $('#mhead').classList.toggle('scrolled', y);
}, { passive: true });

/* ---------- overlays: menu, filter sheet, modal ---------- */
function closeOverlays() {
  $('#overlay').innerHTML = ''; document.body.classList.remove('lock');
  const m = $('#meMenu'); if (m) m.innerHTML = '';
}
function openSheet(html) { $('#overlay').innerHTML = `<div class="sheet" data-act="closeSheet"><div class="in" role="dialog" aria-label="Filters"><div class="grab"></div>${html}</div></div>`; document.body.classList.add('lock'); }
function openModal(html) { $('#overlay').innerHTML = `<div class="modal" data-act="closeModal"><div class="in" role="dialog" aria-modal="true">${html}</div></div>`; document.body.classList.add('lock'); }

/* ---------- explore partial updates ---------- */
let resTimer;
function refreshResults(skeleton) {
  const res = $('#results'); if (!res) return;
  const fp = $('#fpanel'); if (fp) { fp.innerHTML = filterPanel(); wireRange(fp); }
  const sh = $('#sheetFilters'); if (sh) { sh.innerHTML = filterPanel(); wireRange(sh); }
  clearTimeout(resTimer);
  const paint = () => { res.innerHTML = resultsHtml(); reveal(res); tilt(res); };
  if (skeleton && !REDUCED) { res.innerHTML = `<p class="small" style="margin-bottom:14px">Updating…</p><div class="cards two-mob">${'<div class="skeleton"></div>'.repeat(Math.max(2, Math.min(6, exploreList().length)))}</div>`; resTimer = setTimeout(paint, 320); }
  else paint();
  // title reflects a single category
  const h = $('.page-head .h1', view), one = S.ex.cats.size === 1 ? [...S.ex.cats][0] : null;
  if (h) h.textContent = one || 'Explore';
}
function wireRange(root) {
  const r = $('#fmax', root); if (!r) return;
  let t;
  r.addEventListener('input', () => {
    S.ex.max = +r.value; const lbl = $('#fmaxL', root); if (lbl) lbl.textContent = r.value >= 2000 ? 'Any price' : 'Up to ' + rs(r.value);
    clearTimeout(t); t = setTimeout(() => { const res = $('#results'); if (res) { res.innerHTML = resultsHtml(); reveal(res); tilt(res); } }, 150);
  });
}
function wireBind(root) {
  $$('[data-bind]', root).forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.bind; S.listing[k] = ['perDay', 'deposit'].includes(k) ? (+el.value || 0) : el.value;
    const pv = $('#pv'); if (pv) pv.innerHTML = previewCard();
  }));
}

/* ---------- onboarding carousel ---------- */
let onbTimer;
function startOnbTimer() {
  clearInterval(onbTimer);
  onbTimer = setInterval(() => { if (current.key !== 'welcome') return clearInterval(onbTimer); setOnb((S.onb + 1) % 3); }, 5000);
  const w = $('.welcome'); if (!w) return;
  let sx = null;
  w.addEventListener('pointerdown', e => { sx = e.clientX; }, { passive: true });
  w.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) setOnb(Math.max(0, Math.min(2, S.onb + (dx < 0 ? 1 : -1)))); }, { passive: true });
}
function setOnb(i) {
  if (i === S.onb) return;
  S.onb = i;
  const w = $('.welcome'); if (!w) return;
  $$('.vis .art', w).forEach((a, j) => a.classList.toggle('on', j === i));
  const o = ONBOARDING[i];
  $('#onbTxt').outerHTML = `<div class="txt anim" id="onbTxt"><span class="kicker">${o.kicker}</span><h1 style="margin:12px 0">${o.title}</h1><p class="lead">${o.text}</p></div>`;
  $('.progress-dots', w).innerHTML = ONBOARDING.map((_, j) => `<button role="tab" aria-label="Slide ${j + 1}" data-act="onb" data-v="${j}" class="${j === i ? 'on' : j < i ? 'done' : ''}"><i></i></button>`).join('');
  const row = $('.copy .row', w);
  row.innerHTML = i < 2 ? `<button class="btn lg" data-act="onbNext">Next${I('arrow_forward', 'slide')}</button><a class="btn lg ghost" href="#/signin">Skip</a>`
    : `<a class="btn lg" href="#/register">Get Started!${I('arrow_forward', 'slide')}</a><a class="btn lg ghost" href="#/signin">Sign in</a>`;
  startOnbTimer();
}

/* ---------- OTP ---------- */
function wireOtp(root) {
  const ins = $$('#otp input', root);
  if (HOVER) ins[0].focus();
  ins.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      const d = inp.value.replace(/\D/g, '');
      if (d.length > 1) d.slice(0, 6 - i).split('').forEach((c, j) => { ins[i + j].value = c; ins[i + j].classList.add('filled'); });
      else inp.value = d;
      inp.classList.toggle('filled', !!inp.value);
      const next = ins.find(x => !x.value); if (next && inp.value) next.focus();
      if (ins.every(x => x.value)) setTimeout(() => A.verify(), 300);
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); });
  });
}
let resendTimer;
function startResend() {
  clearInterval(resendTimer); S.resendLeft = 30;
  const tick = () => {
    const b = $('#resend'); if (!b) return clearInterval(resendTimer);
    b.textContent = S.resendLeft > 0 ? `(00:${String(S.resendLeft).padStart(2, '0')})` : 'Resend now';
    if (S.resendLeft-- <= 0) clearInterval(resendTimer);
  };
  tick(); resendTimer = setInterval(tick, 1000);
}

/* ---------- actions ---------- */
function signIn(to) {
  S.signedIn = true;
  try { localStorage.setItem('revnt-seen', '1'); } catch (e) { /* ignore */ }
  const dest = S.after || to || 'home'; S.after = null; go(dest);
}
const A = {
  back() { back(); },
  toast(el) { toast(el.dataset.msg, el.dataset.icon); },
  fav(el) {
    const id = el.dataset.id; S.fav.has(id) ? S.fav.delete(id) : S.fav.add(id);
    $$(`.heart[data-id="${id}"]`).forEach(h => { h.classList.toggle('on', S.fav.has(id)); h.setAttribute('aria-pressed', S.fav.has(id)); });
    if (S.fav.has(id)) burst(el);
    toast(S.fav.has(id) ? 'Saved to favourites' : 'Removed from favourites', S.fav.has(id) ? 'favorite' : 'heart_broken');
  },
  themeToggle() { applyTheme(isDark() ? 'light' : 'dark'); renderChrome(); },
  theme(el) { applyTheme(el.dataset.v); render(); },
  menuToggle(el) {
    const m = $('#meMenu'); const open = !m.innerHTML;
    m.innerHTML = open ? `<div class="menu-pop" role="menu">
      <div style="padding:10px 12px"><b>${esc(S.name)}</b><div class="small">${esc(S.email)}</div></div><hr>
      <a href="#/profile" role="menuitem">${I('person')}Profile</a><a href="#/listings" role="menuitem">${I('inventory_2')}My listings</a>
      <a href="#/earnings" role="menuitem">${I('trending_up')}Earnings</a><a href="#/settings" role="menuitem">${I('settings')}Settings</a><hr>
      <button data-act="logoutAsk" role="menuitem">${I('logout')}Log out</button></div>` : '';
    el.setAttribute('aria-expanded', open);
  },
  peek(el) { const p = $('#si-pass'); p.type = p.type === 'password' ? 'text' : 'password'; el.innerHTML = I(p.type === 'password' ? 'visibility' : 'visibility_off'); },
  signin() {
    const e = $('#si-email').value.trim(), p = $('#si-pass').value;
    if (!/\S+@\S+\.\S+/.test(e)) return toast('Enter a valid email to sign in', 'error');
    if (p.length < 6) return toast('Password needs at least 6 characters', 'error');
    S.email = e; toast(`Welcome back, ${S.name.split(' ')[0]}`, 'waving_hand'); signIn();
  },
  social() { toast('Signed in', 'verified'); signIn(); },
  socialNew() { go('setup'); },
  terms(el) { S.agreed = !S.agreed; el.classList.toggle('on', S.agreed); el.setAttribute('aria-pressed', S.agreed); },
  register() {
    if (!S.agreed) { toast('Tick “I agree to Terms and Conditions” first', 'error'); return; }
    const n = $('#rg-name').value.trim(), em = $('#rg-email').value.trim();
    if (n) S.name = n; if (em) S.email = em;
    go('verify');
  },
  acceptTerms() { S.agreed = true; toast('Terms accepted'); back(); },
  resend() { if (S.resendLeft > 0) return; toast('New code sent', 'sms'); startResend(); },
  verify() {
    const box = $('#otp'); if (!box) return;
    const v = $$('input', box).map(i => i.value).join('');
    if (v.length < 6) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); return toast('Enter all 6 digits', 'error'); }
    toast('Phone verified', 'verified'); go('setup');
  },
  setup() {
    S.name = $('#pz-name').value.trim() || S.name; S.location = $('#pz-loc').value.trim() || S.location; S.style = $('#pz-style').value;
    if (S.signedIn && navStack.includes('profile')) { toast('Profile saved'); back(); } else go('purpose');
  },
  purpose(el) {
    S.purpose = el.dataset.v;
    $$('.opt').forEach(o => { const on = o.dataset.v === S.purpose; o.classList.toggle('on', on); o.setAttribute('aria-checked', on); });
  },
  purposeDone() { toast(`Welcome to REVNT, ${S.name.split(' ')[0]}!`, 'celebration'); signIn(S.purpose === 'lease' ? 'list' : 'home'); },
  onb(el) { setOnb(+el.dataset.v); },
  onbNext() { setOnb(Math.min(2, S.onb + 1)); },

  cat(el) { S.ex = { cats: new Set([el.dataset.v]), max: 2000, size: '', query: '', sort: 0 }; if (current.key === 'explore') { render(); } else go('explore'); },
  fcat(el) { const c = el.dataset.v; S.ex.cats.has(c) ? S.ex.cats.delete(c) : S.ex.cats.add(c); refreshResults(true); },
  fsize(el) { S.ex.size = S.ex.size === el.dataset.v ? '' : el.dataset.v; refreshResults(true); },
  fmaxClear() { S.ex.max = 2000; refreshResults(true); },
  clearF() { S.ex = { cats: new Set(), max: 2000, size: '', query: '', sort: 0 }; const q = $('#q'); if (q) q.value = ''; refreshResults(true); toast('Filters cleared', 'restart_alt'); },
  openFilters() { openSheet(`<div class="row" style="margin-bottom:16px"><h2 class="h2">Filters</h2><span class="sp"></span><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I('close')}</button></div><div class="filters-side" id="sheetFilters" style="position:static;max-height:none">${filterPanel()}</div><button class="btn block lg" style="margin-top:18px" data-act="closeSheet">Show ${exploreList().length} results</button>`); wireRange($('#sheetFilters')); },
  closeSheet(el, e) { if (e && el.classList.contains('sheet') && e.target !== el) return; closeOverlays(); refreshResults(); },
  closeModal(el, e) { if (e && el.classList.contains('modal') && e.target !== el) return; closeOverlays(); },

  gview(el) {
    const i = +el.dataset.v;
    $$('#gmain .art').forEach((a, j) => a.classList.toggle('on', i === j));
    $$('.gallery .thumbs button').forEach((b, j) => b.classList.toggle('on', i === j));
  },
  size(el) { S.size = el.dataset.v; render(); },
  avail(el) {
    S.day = +el.dataset.v; const d = 21 + S.day;
    S.from = `2026-01-${d}`; if (S.to <= S.from) S.to = `2026-01-${d + 2}`;
    render(); toast(`Pick-up set to ${fmtDate(S.from)}`, 'event');
  },
  rent() { go('checkout'); },
  chat(el) { if (!S.signedIn) { S.after = 'messages/' + encodeURIComponent(el.dataset.v); go('signin'); return; } go('messages/' + encodeURIComponent(el.dataset.v)); },
  pay(el) {
    S.pay = el.dataset.v;
    $$('.pay-opt').forEach(o => { const on = o.dataset.v === S.pay; o.classList.toggle('on', on); o.setAttribute('aria-checked', on); });
    const cols = $$('.checkout .collapse'); cols[0]?.classList.toggle('open', S.pay === 'upi'); cols[1]?.classList.toggle('open', S.pay === 'card');
  },
  payNow(el) {
    el.innerHTML = '<span class="spin"></span>Processing…'; el.disabled = true;
    setTimeout(() => {
      S.rentals.unshift({ gear: S.gear, from: fmtDate(S.from, false), to: fmtDate(S.to, false), pickup: S.pickup.split(',')[0].replace(/ \(.*/, ''), status: 'Upcoming' });
      S.rentTab = 'Upcoming'; go('confirmed');
    }, 1300);
  },
  rtab(el) { S.rentTab = el.dataset.v; render(); },

  lcat(el) {
    S.listing.cat = el.dataset.v;
    $$('.cat-pick button').forEach(b => b.classList.toggle('on', b.dataset.v === S.listing.cat));
    const pv = $('#pv'); if (pv) pv.innerHTML = previewCard();
  },
  gearInfo() { if (!S.listing.name.trim()) return toast('Give your gear a name', 'error'); go('list/pricing'); },
  block(el) {
    const d = +el.dataset.v, B = S.listing.blocked; B.has(d) ? B.delete(d) : B.add(d);
    el.classList.toggle('x', B.has(d)); el.setAttribute('aria-pressed', B.has(d));
  },
  pricing() { if (!(S.listing.perDay > 0)) return toast('Set a price per day', 'error'); go('list/review'); },
  publish(el) {
    el.innerHTML = '<span class="spin"></span>Publishing…'; el.disabled = true;
    setTimeout(() => {
      const L = S.listing;
      S.myListings.unshift({ title: L.name || 'New gear', price: L.perDay, status: 'Active', cat: CATS.some(c => c.id === L.cat) ? L.cat : 'Accessories', photo: L.photos[0] });
      S.listTab = 'Active'; go('list/live');
    }, 900);
  },
  ltab(el) { S.listTab = el.dataset.v; render(); },
  qtab(el) { S.reqTab = el.dataset.v; render(); },
  decide(el) {
    const r = S.requests.find(x => x.id === +el.dataset.id); r.status = el.dataset.v;
    const card = $('#req' + r.id);
    toast(`${r.who}’s request ${r.status.toLowerCase()}`, r.status === 'Accepted' ? 'check_circle' : 'cancel');
    if (card && !REDUCED) { card.classList.add('leaving'); setTimeout(() => render(), 420); } else render();
  },
  bar(el) { S.bar = +el.dataset.v; render(); },
  txAll() { S.txAll = !S.txAll; render(); },
  faq(el) {
    const i = +el.dataset.v; S.faq = S.faq === i ? -1 : i;
    $$('#faqs .acc').forEach(acc => { const on = +acc.querySelector('button').dataset.v === S.faq; acc.classList.toggle('open', on); acc.querySelector('.collapse').classList.toggle('open', on); acc.querySelector('button').setAttribute('aria-expanded', on); });
  },
  logoutAsk() {
    openModal(`<div class="icon-circ">${I('logout')}</div><h2 class="h2">Are you sure you want to logout?</h2><p class="muted" style="margin-top:8px">You will need to sign-in again to access your account and preferences.</p>
      <div class="acts"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn" style="background:var(--danger)" data-act="logout">Logout</button></div>`);
  },
  logout() { S.signedIn = false; closeOverlays(); navStack.length = 0; toast('Logged out', 'logout'); go('signin'); }
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a) { const fn = A[a.dataset.act]; if (fn) { if (a.tagName === 'A') e.preventDefault(); fn(a, e); } return; }
  if (!e.target.closest('.rel')) { const m = $('#meMenu'); if (m && m.innerHTML) m.innerHTML = ''; }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if ($('#overlay').innerHTML || ($('#meMenu') && $('#meMenu').innerHTML)) { closeOverlays(); return; }
});
window.addEventListener('hashchange', onRoute);
window.addEventListener('resize', () => { moveNavInd(); segThumbs(view); });
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (theme === 'system') renderChrome(); });

/* icon font fallback for offline use */
if (document.fonts && document.fonts.load) {
  setTimeout(() => document.fonts.load('24px "Material Symbols Outlined"', 'home')
    .then(f => { if (!f.length) document.body.classList.add('no-icons'); })
    .catch(() => document.body.classList.add('no-icons')), 3000);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { moveNavInd(); segThumbs(view); });

/* ---------- boot: intro loader, then route ---------- */
onRoute();
(function splash() {
  const sp = $('#splash');
  const hold = REDUCED ? 0 : 1500;
  setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 900); }, hold);
})();
