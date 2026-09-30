/* REVNT prototype — screen templates.
   Each screen: { name, grp, html(), after?() }.
   Group index: 0 Onboarding · 1 Renting gear · 2 Listing gear · 3 Account */

const I = (n, c = '') => `<span class="ms ${c}" aria-hidden="true">${n}</span>`;
const rs = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- shared pieces ---------- */
function statusBar() {
  if (MOBILE) {
    const sc = SCREENS[S.cur];
    return `<div class="sb dev">
      <button data-act="back" aria-label="Back" ${S.hist.length ? '' : 'disabled'}>${I('arrow_back')}</button>
      <span class="ttl">${esc(sc.name)}</span>
      <button data-act="menu" aria-label="All screens">${I('apps')}</button></div>`;
  }
  return `<div class="sb"><span>8:07</span><span class="ic">${I('wifi')}${I('signal_cellular_alt')}${I('battery_4_bar')}</span></div>`;
}
const TABS = [['home', 'Home', 'home'], ['search', 'Search', 'explore'], ['add', '', 'listGear'], ['notifications', 'Alerts', 'notifications'], ['account_circle', 'Profile', 'profile']];
function tabbar(active) {
  return `<nav class="tabbar" aria-label="App tabs">${TABS.map(([ic, label, go]) => ic === 'add'
    ? `<button class="tab add" data-go="${go}" aria-label="List gear"><span class="box">${I('add')}</span></button>`
    : `<button class="tab ${active === go ? 'on' : ''}" data-go="${go}" ${active === go ? 'aria-current="page"' : ''}>${I(ic)}<span>${label}</span></button>`).join('')}</nav>`;
}
function shell({ body, cta = '', tab = null, bdClass = '', bdStyle = '' }) {
  return statusBar()
    + `<div class="bd ${bdClass}" style="${bdStyle}">${body}</div>`
    + (cta ? `<div class="cta">${cta}</div>` : '')
    + (tab !== null ? tabbar(tab) : '')
    + '<div class="hi"></div>';
}
const heart = (id, extra = '') => `<button class="heart ${extra} ${S.fav.has(id) ? 'on' : ''}" data-act="fav" data-id="${id}" aria-label="Save" aria-pressed="${S.fav.has(id)}">${I('favorite')}</button>`;
const thumb = (g, size = 80) => `<div class="ph" style="width:${size}px;height:${size}px">${I(g.icon)}</div>`;
const listItem = g => `<div class="card li-row"><button class="li" data-go="details" data-gear="${g.id}">${thumb(g)}<span class="meta"><span class="nm">${esc(g.name)}</span><span class="pr"><b>${rs(g.price)}</b> / day</span><span class="rate">${I('star')}${g.rating} · ${g.km} km away</span></span></button><div style="padding:6px 6px 0 0">${heart(g.id)}</div></div>`;
const gridCard = g => `<button class="gcard" data-go="details" data-gear="${g.id}"><div class="ph">${I(g.icon)}</div><div class="cap"><div>${esc(g.name)}</div><div>${rs(g.price)} / day</div></div></button>`;
const px = v => typeof v === 'number' ? v + 'px' : v;
const myAvatar = size => `<span class="avatar" style="width:${px(size)};height:${px(size)}"><img src="${S.photo || ASSETS.avatar}" alt=""></span>`;
const personAv = size => `<span class="avatar" style="width:${size}px;height:${size}px"><img src="${ASSETS.avatar}" alt=""></span>`;
const chips = (items, current, act, extra = '') => `<div class="chips">${items.map(v => `<button class="chip ${current === v ? 'on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${current === v}" ${extra}>${v}</button>`).join('')}</div>`;

const checkIllu = () => `<svg class="illu" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="70" style="fill:var(--brand-soft)"/><circle cx="70" cy="70" r="50" style="fill:var(--brand)"/><path d="M48 71l15 15 30-31" style="fill:none;stroke:var(--brand-ink);stroke-width:9;stroke-linecap:round;stroke-linejoin:round"/></svg>`;
const mountainIllu = () => `<svg class="illu" viewBox="0 0 320 150" width="100%" style="max-width:300px" aria-hidden="true"><polygon points="85,150 180,18 275,150" style="fill:var(--ink);opacity:.85"/><polygon points="180,18 160,46 172,41 181,52 191,41 201,46" style="fill:var(--bg)"/><polygon points="0,150 80,58 165,150" style="fill:var(--brand)"/><polygon points="175,150 252,64 320,150" style="fill:var(--brand);opacity:.65"/><rect x="0" y="146" width="320" height="4" style="fill:var(--stroke)"/></svg>`;

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00'); if (isNaN(d)) return iso;
  const n = d.getDate();
  const s = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
  return `${n}${s} ${d.toLocaleString('en', { month: 'short' })}, ${d.getFullYear()}`;
}
function rentalDays() { const n = Math.round((new Date(S.to + 'T00:00') - new Date(S.from + 'T00:00')) / 864e5); return n > 0 ? n : 1; }
function price() {
  const g = gearById(S.gear), d = rentalDays();
  const fee = g.price * d, plat = 100, dep = 1000, delivery = S.pickup.startsWith('Doorstep') ? 150 : 0;
  return { d, fee, plat, dep, delivery, total: fee + plat + dep + delivery };
}

function onboarding(i) {
  const o = ONBOARDING[i];
  return shell({
    body: `<div class="ph hero-ph">${I(o.icon, 'big')}</div>
      <div class="center" style="margin-top:18px"><h1 class="t1">${o.title}</h1><p class="sub">${o.text}</p></div>
      <div class="dots gap-m">${[0, 1, 2].map(j => `<button class="${i === j ? 'on' : ''}" data-go="onb${j + 1}" aria-label="Slide ${j + 1}"></button>`).join('')}</div>`,
    cta: `<button class="btn" data-go="${i < 2 ? 'onb' + (i + 2) : 'signin'}">${i < 2 ? 'Next' : 'Get Started!'}</button>`
      + (i < 2 ? `<button class="small" style="align-self:center;padding:6px" data-go="signin">Skip</button>` : '')
  });
}

/* ---------- screens ---------- */
const SCREENS = {
  /* ===== Onboarding ===== */
  splash: {
    name: 'Splash Screen', grp: 0,
    html: () => statusBar() + `<div class="bd" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:56px;padding-bottom:100px">
      <img src="${ASSETS.logo}" alt="REVNT — Gear up. Ride out." width="143" height="167" style="filter:var(--logo-filter)">
      <div style="width:183px;height:8px;background:var(--brand-soft);border-radius:6px;overflow:hidden"><div id="load" style="height:100%;width:0;background:var(--brand);border-radius:6px;transition:width 1.6s ease"></div></div></div>`,
    after() {
      requestAnimationFrame(() => requestAnimationFrame(() => { const l = document.getElementById('load'); if (l) l.style.width = '100%'; }));
      setTimeout(() => { if (S.cur === 'splash') go('onb1'); }, 1900);
    }
  },
  onb1: { name: 'Onboarding 1', grp: 0, html: () => onboarding(0) },
  onb2: { name: 'Onboarding 2', grp: 0, html: () => onboarding(1) },
  onb3: { name: 'Onboarding 3', grp: 0, html: () => onboarding(2) },

  signin: {
    name: 'Sign-in', grp: 0,
    html: () => shell({
      body: `<div class="center gap-hero"><h1 class="t1">Welcome Back</h1><p class="sub">Sign-in to continue</p></div>
      <form class="stack" id="signinForm" novalidate>
        <input class="field" id="si-email" type="email" autocomplete="email" placeholder="Email" value="ayush@revnt.in" aria-label="Email">
        <label class="field"><input id="si-pass" type="password" autocomplete="current-password" placeholder="Password" value="ridesafe26" aria-label="Password"><button type="button" data-act="peek" aria-label="Show password">${I('visibility')}</button></label>
        <div style="text-align:right"><button type="button" class="link" data-act="toast" data-msg="Reset link sent to your email">Forgot Password?</button></div>
        <button class="btn gap-m" type="submit">Sign-In</button>
      </form>
      <div class="stack" style="margin-top:18px"><div class="or">or</div>
        <div class="socials"><button class="soc" data-go="home" aria-label="Continue with Google"><img src="${ASSETS.google}" alt=""></button><button class="soc" data-go="home" aria-label="Continue with Facebook"><img src="${ASSETS.facebook}" alt=""></button><button class="soc" data-go="verify" aria-label="Continue with phone">${I('call')}</button></div>
        <p class="center" style="font-size:13px;margin-top:24px;color:var(--sub)">Don’t Have an Account? <button data-go="register" style="font-weight:700;color:var(--brand)">Register</button></p></div>`
    }),
    after() { document.getElementById('signinForm').addEventListener('submit', e => { e.preventDefault(); A.signin(); }); }
  },

  register: {
    name: 'Register', grp: 0,
    html: () => shell({
      body: `<div class="center gap-hero" style="margin-bottom:18px"><h1 class="t1">Create Account</h1><p class="sub">Rent or list gear in minutes.</p></div>
      <div class="stack">
        <input class="field" id="rg-name" autocomplete="name" placeholder="Name" aria-label="Name">
        <input class="field" id="rg-email" type="email" autocomplete="email" placeholder="Email" aria-label="Email">
        <input class="field" id="rg-phone" type="tel" autocomplete="tel" placeholder="Phone Number" aria-label="Phone Number">
        <input class="field" id="rg-pass" type="password" autocomplete="new-password" placeholder="Password" aria-label="Password"></div>
      <div class="row" style="margin:24px 0 0 4px;font-size:13px;color:var(--sub);flex-wrap:wrap;gap:6px"><button class="row ${S.agreed ? 'on' : ''}" data-act="terms" style="gap:12px" aria-pressed="${S.agreed}"><span class="chk">${I('check')}</span>I agree to</button><button class="link" data-go="terms">Terms and Conditions</button></div>
      <div class="stack gap-m"><button class="btn" data-act="register">Create Account</button><div class="or">or</div>
        <div class="socials"><button class="soc" data-go="verify" aria-label="Sign up with Google"><img src="${ASSETS.google}" alt=""></button><button class="soc" data-go="verify" aria-label="Sign up with Facebook"><img src="${ASSETS.facebook}" alt=""></button><button class="soc" data-go="verify" aria-label="Sign up with phone">${I('call')}</button></div>
        <p class="center" style="font-size:13px;margin-top:12px;color:var(--sub)">Already have an account? <button data-go="signin" style="font-weight:700;color:var(--brand)">Sign-in</button></p></div>`
    })
  },

  verify: {
    name: 'Verification', grp: 0,
    html: () => shell({
      body: `<div class="center gap-hero"><div class="icon-circ" style="margin:0 auto 16px">${I('sms')}</div><h1 class="t1">Verify Your Account</h1><p class="sub">Enter the 6-digit code sent to your<br>phone</p></div>
      <div class="otp" id="otp">${[0, 1, 2, 3, 4, 5].map(i => `<input inputmode="numeric" pattern="[0-9]*" autocomplete="${i ? 'off' : 'one-time-code'}" id="otp${i}" aria-label="Digit ${i + 1}">`).join('')}</div>
      <p class="center small gap-m">Resend Code <button id="resend" class="link" data-act="resend" style="font-weight:700">(00:30)</button></p>
      <p class="center small" style="margin-top:6px">Demo: any six digits work</p>`,
      cta: `<button class="btn" data-act="verify">Verify</button>`
    }),
    after() { wireOtp(); startResend(); }
  },

  personal: {
    name: 'Personalization', grp: 0,
    html: () => shell({
      body: `<div class="center gap-hero" style="margin-bottom:24px"><h1 class="t1">Let’s Set You Up</h1><p class="sub">This helps us personalize your<br>experience.</p></div>
      <label class="av-edit" title="Change photo">${myAvatar('100%')}<span class="cam">${I('photo_camera')}</span><input type="file" accept="image/*" class="sr" id="avatarFile" aria-label="Upload profile photo"></label>
      <div class="stack">
        <input class="field" id="pz-name" placeholder="Name" value="${esc(S.name)}" aria-label="Name">
        <input class="field" id="pz-loc" placeholder="Location" value="${esc(S.location)}" aria-label="Location">
        <select class="field" id="pz-style" aria-label="Riding Style">${['Commuter', 'Touring', 'Track days', 'Off-road', 'Weekend cruiser'].map(o => `<option ${o === S.style ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`,
      cta: `<button class="btn" data-act="personal">Continue</button>`
    }),
    after() { wireFile('avatarFile', url => { S.photo = url; rerender(); }); }
  },

  purpose: {
    name: 'Choose Purpose', grp: 0,
    html: () => shell({
      body: `<div class="center gap-hero"><h1 class="t1">How will you use REVNT</h1><p class="sub">You can always change this later.</p></div>
      <div class="menu" role="radiogroup" style="gap:16px">${[['rent', 'sports_motorsports', 'Rent Gear', 'Find and Rent Gear.'], ['lease', 'apparel', 'Lease Gear', 'List your own Gear.'], ['both', 'sync_alt', 'Both', 'Rent and List Gear.']].map(([k, ic, t, s]) =>
        `<button class="mi purpose ${S.purpose === k ? 'on' : ''}" role="radio" aria-checked="${S.purpose === k}" data-act="purpose" data-v="${k}"><span class="icon-circ">${I(ic)}</span><span><b>${t}</b><span class="s">${s}</span></span>${S.purpose === k ? I('check_circle', 'go fill') : ''}</button>`).join('')}</div>`,
      cta: `<button class="btn" data-act="purposeDone">Continue</button>`
    })
  },

  /* ===== Renting gear ===== */
  home: {
    name: 'Main App - Home', grp: 1,
    html: () => shell({
      tab: 'home',
      body: `<div class="row" style="margin:6px 0 18px;gap:6px"><span class="accent">${I('location_on', 'fill')}</span><div><div style="font-weight:700;font-size:15px">${esc(S.location || 'Bengaluru')}</div><div class="small">Tavarekere, SG Palya</div></div><div class="sp"></div><button data-go="messages" aria-label="Messages" class="heart bubble-bg">${I('chat_bubble')}</button></div>
      <button class="field muted" data-go="explore">${I('search')}Search for Gear...</button>
      <div class="cats">${[['sports_motorsports', 'Helmets'], ['apparel', 'Jackets'], ['pan_tool', 'Gloves'], ['hiking', 'Boots'], ['checkroom', 'Pants'], ['luggage', 'Accessories']].map(([ic, l]) =>
        `<button data-act="cat" data-v="${l}"><span class="circ">${I(ic)}</span>${l}</button>`).join('')}</div>
      <div class="hdr" style="margin:24px 0 12px"><h2 class="t2">Featured Gear</h2><button class="see" data-go="explore">See all</button></div>
      <div class="gcards">${gridCard(gearById('k5r'))}${gridCard(gearById('nhk'))}</div>
      <div class="hdr" style="margin:24px 0 12px"><h2 class="t2">Nearby Gear</h2><button class="see" data-go="explore">See all</button></div>
      <div class="gcards">${gridCard(gearById('alp'))}${gridCard(gearById('dai'))}</div>`
    })
  },

  explore: {
    name: 'Explore', grp: 1,
    html: () => {
      let list = GEAR.filter(g => (S.exploreCat === 'All' || g.cat === S.exploreCat) && (!S.query || g.name.toLowerCase().includes(S.query.toLowerCase())));
      if (S.sortDir) list = [...list].sort((a, b) => (a.price - b.price) * S.sortDir);
      return shell({
        tab: 'explore',
        body: `<h1 class="t1" style="margin:6px 0 20px">Explore</h1>
        <label class="field">${I('search')}<input id="q" type="search" placeholder="Search for Gear..." value="${esc(S.query)}" aria-label="Search for gear"></label>
        <div class="chips" style="margin:12px 0"><button class="chip lft" data-act="sort">${I('sort')}${S.sortDir === 0 ? 'Sort' : S.sortDir > 0 ? 'Price: low → high' : 'Price: high → low'}</button><button class="chip lft" data-go="filters">${I('filter_alt')}Filter</button></div>
        <div class="hscroll" style="margin-bottom:16px">${['All', 'Helmets', 'Jackets', 'Gloves', 'Boots', 'Pants'].map(c => `<button class="chip ${S.exploreCat === c ? 'on' : ''}" data-act="xcat" data-v="${c}">${c}</button>`).join('')}</div>
        <div class="stack" style="gap:10px">${list.map(listItem).join('') || `<p class="small center" style="margin-top:30px">No gear matches “${esc(S.query)}”.</p>`}</div>`
      });
    },
    after() { liveInput('q', v => S.query = v); }
  },

  filters: {
    name: 'Filters', grp: 1,
    html: () => {
      const F = S.filters;
      return shell({
        body: `<div class="hdr" style="margin:6px 0 8px;align-items:center"><h1 class="t1">Filters</h1><button class="see" data-act="clearF">Clear all</button></div><div class="rule"></div>
        <h2 class="t2" style="margin:14px 0 14px">Category</h2>
        <div class="stack" style="gap:12px">${['Helmets', 'Jackets', 'Gloves', 'Pants', 'Boots', 'Accessories'].map(c => `<button class="row ${F.cats.has(c) ? 'on' : ''}" style="gap:12px;font-size:14px" data-act="fcat" data-v="${c}" aria-pressed="${F.cats.has(c)}"><span class="chk">${I('check')}</span>${c}</button>`).join('')}</div>
        <div class="rule" style="margin-top:22px"></div>
        <h2 class="t2" style="margin:14px 0 4px">Price Range</h2><p class="small" style="margin:0">Up to <b id="fmaxL" class="accent">${F.max >= 2000 ? '₹2000+' : rs(F.max)}</b> per day</p>
        <div class="range"><input type="range" id="fmax" min="100" max="2000" step="50" value="${F.max}" aria-label="Maximum price per day"></div>
        <div class="row small" style="justify-content:space-between"><span>₹0</span><span>₹2000+</span></div>
        <div class="rule" style="margin-top:18px"></div>
        <h2 class="t2" style="margin:14px 0 12px">Size</h2>${chips(['S', 'M', 'L', 'XL'], F.size, 'fsize')}
        <div class="rule" style="margin-top:22px"></div>
        <h2 class="t2" style="margin:14px 0 12px">Brands</h2>
        <div class="acc"><button data-act="brands" aria-expanded="${F.brands}">${F.brands ? 'Hide brands' : 'Choose brands'}${I(F.brands ? 'expand_less' : 'expand_more')}</button>${F.brands ? `<div class="ans stack" style="gap:10px">${['KSR', 'Alpinestars', 'Dainese', 'Rynox', 'Viaterra'].map((b, i) => `<label class="row" style="gap:10px;color:var(--ink)"><input type="checkbox" id="br${i}" ${i < 2 ? 'checked' : ''} style="accent-color:var(--brand);width:18px;height:18px">${b}</label>`).join('')}</div>` : ''}</div>`,
        cta: `<button class="btn" data-act="applyF">Apply</button>`
      });
    },
    after() {
      const r = document.getElementById('fmax');
      r.addEventListener('input', () => { S.filters.max = +r.value; document.getElementById('fmaxL').textContent = r.value >= 2000 ? '₹2000+' : rs(r.value); });
    }
  },

  results: {
    name: 'Search Results', grp: 1,
    html: () => {
      const R = S.results;
      const list = GEAR.filter(g => R.cats.includes(g.cat) && g.price <= (R.max >= 2000 ? Infinity : R.max));
      return shell({
        tab: 'explore',
        body: `<div class="hdr" style="margin:6px 0 20px;align-items:center"><h1 class="t1">${esc(R.label)} (${list.length})</h1><button class="chip pill" data-go="filters" aria-label="Edit filters">${I('tune')}Filters</button></div>
        <div class="stack" style="gap:10px">${list.map(listItem).join('') || `<div class="center" style="margin-top:60px"><p class="t2">Nothing in that range</p><p class="sub">Raise the price limit or pick another category.</p><button class="btn ghost sm" style="margin-top:18px" data-go="filters">Edit filters</button></div>`}</div>`
      });
    }
  },

  details: {
    name: 'Gear Details', grp: 1,
    html: () => {
      const g = gearById(S.gear);
      return shell({
        body: `<div style="position:relative;margin-top:12px"><div class="carousel" id="car">${[g.icon, 'photo_camera', '360'].map(ic => `<div class="ph">${I(ic, 'big')}</div>`).join('')}</div>
          <div style="position:absolute;top:10px;right:10px">${heart(g.id, 'bubble-bg')}</div>
          <div class="dots" id="cardots" style="position:absolute;bottom:12px;left:0;right:0">${[0, 1, 2].map(i => `<button class="${i ? '' : 'on'}" data-act="slide" data-v="${i}" aria-label="Photo ${i + 1}"></button>`).join('')}</div></div>
        <h1 class="t1" style="margin:16px 0 8px;font-size:21px">${esc(g.title)}</h1>
        <div class="hdr" style="margin-bottom:14px"><span style="font-size:16px"><b class="accent">${rs(g.price)}</b> / day</span><span class="rate">${I('star')}${g.rating} (${g.reviews})</span></div>
        <div class="rule"></div>
        <button class="row" data-act="chat" data-v="${g.owner}" style="width:100%;padding:12px 0;gap:16px;text-align:left">${personAv(56)}<span style="flex:1"><b style="font-size:15px">${g.owner}</b><br><span class="small">${g.km} km away · replies in ~10 min</span></span><span class="see">Message</span></button>
        <div class="rule"></div>
        <h2 class="t2" style="margin:14px 0 12px">Size</h2>${chips(['S', 'M', 'L', 'XL'], S.size, 'size')}
        <div class="rule" style="margin-top:18px"></div>
        <h2 class="t2" style="margin:14px 0 12px">Availability · Jan 2026</h2>
        <div class="chips" style="gap:8px">${['MON', 'TUE', 'WED', 'THU', 'FRI'].map((d, i) => `<button class="chip day ${S.day === i ? 'on' : ''}" data-act="avail" data-v="${i}" ${i === 2 ? 'disabled aria-label="Wednesday 23, booked"' : ''}>${d}<span>${21 + i}</span></button>`).join('')}</div>
        <p class="small" style="margin:8px 0 0">Tap a day to set your pick-up. Wed 23rd is booked.</p>`,
        cta: `<button class="btn" data-go="rental">Rent Now · ${rs(g.price)}/day</button>`
      });
    },
    after() {
      const c = document.getElementById('car');
      c.addEventListener('scroll', () => { const i = Math.round(c.scrollLeft / c.clientWidth); document.querySelectorAll('#cardots button').forEach((b, j) => b.classList.toggle('on', i === j)); }, { passive: true });
    }
  },

  rental: {
    name: 'Rental Details', grp: 1,
    html: () => {
      const g = gearById(S.gear), p = price();
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 18px">Rental Details</h1>
        <div class="row" style="align-items:flex-start;gap:14px">${thumb(g, 104)}<div style="min-width:0"><div style="font-weight:700;font-size:17px;line-height:1.25">${esc(g.title)}</div><div style="margin-top:6px"><b class="accent">${rs(g.price)}</b> / day</div><div class="rate" style="margin-top:6px">${I('star')}${g.rating} (${g.reviews})</div></div></div>
        <h2 class="t2" style="margin:20px 0 10px">Select Dates</h2>
        <div class="row" style="gap:8px"><label class="field" style="flex:1;padding:0 10px;min-width:0"><input type="date" id="from" value="${S.from}" aria-label="Start date"></label>${I('arrow_forward')}<label class="field" style="flex:1;padding:0 10px;min-width:0"><input type="date" id="to" value="${S.to}" aria-label="End date"></label></div>
        <p class="small" style="margin:6px 0 0">${fmtDate(S.from)} → ${fmtDate(S.to)} · ${p.d} day${p.d > 1 ? 's' : ''}</p>
        <h2 class="t2" style="margin:18px 0 10px">Select Size</h2>${chips(['S', 'M', 'L', 'XL'], S.size, 'size')}
        <h2 class="t2" style="margin:18px 0 10px">Pick-Up Location</h2>
        <select class="field" id="pickup" aria-label="Pick-up location">${['Koramangala, Bengaluru', 'Indiranagar, Bengaluru', 'HSR Layout, Bengaluru', 'Doorstep delivery (+₹150)'].map(o => `<option ${o === S.pickup ? 'selected' : ''}>${o}</option>`).join('')}</select>
        <h2 class="t2" style="margin:18px 0 10px">Price Break-up</h2>
        <div class="acc"><button data-act="breakup" aria-expanded="${S.breakup}"><span>Total <b class="accent">${rs(p.total)}</b></span>${I(S.breakup ? 'expand_less' : 'expand_more')}</button>${S.breakup ? `<div class="ans price-rows">
          <div class="row"><span>Rental Fee (${p.d} days)</span><span class="sp"></span><span>${rs(p.fee)}</span></div>
          <div class="row"><span>Platform Fee</span><span class="sp"></span><span>${rs(p.plat)}</span></div>
          ${p.delivery ? `<div class="row"><span>Doorstep delivery</span><span class="sp"></span><span>${rs(p.delivery)}</span></div>` : ''}
          <div class="row"><span>Security Deposit (refundable)</span><span class="sp"></span><span>${rs(p.dep)}</span></div></div>` : ''}</div>`,
        cta: `<button class="btn" data-go="payment">Continue</button>`
      });
    },
    after() {
      ['from', 'to'].forEach(k => document.getElementById(k).addEventListener('change', e => {
        S[k] = e.target.value;
        if (S.to <= S.from) toast('End date must be after the start date');
        rerender();
      }));
      document.getElementById('pickup').addEventListener('change', e => { S.pickup = e.target.value; rerender(); });
    }
  },

  payment: {
    name: 'Payment', grp: 1,
    html: () => {
      const p = price();
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 16px">Payment Methods</h1>
        <div class="menu" role="radiogroup">${[['upi', 'qr_code_2', 'UPI'], ['card', 'credit_card', 'Credit / Debit Card'], ['wallet', 'account_balance_wallet', 'Wallet'], ['other', 'payments', 'Other Methods']].map(([k, ic, l]) =>
          `<button class="mi ${S.pay === k ? 'on' : ''}" role="radio" aria-checked="${S.pay === k}" data-act="pay" data-v="${k}">${I(ic)}${l}${S.pay === k ? I('check_circle', 'go fill accent') : ''}</button>`).join('')}</div>
        <div class="rule" style="margin-top:28px"></div>
        <h2 class="t2" style="margin:14px 0 12px">Price Details</h2>
        <div class="price-rows">
          <div class="row"><span>Rental Fee (${p.d} days)</span><span class="sp"></span><span>${rs(p.fee)}</span></div>
          <div class="row"><span>Platform Fee</span><span class="sp"></span><span>${rs(p.plat)}</span></div>
          ${p.delivery ? `<div class="row"><span>Doorstep delivery</span><span class="sp"></span><span>${rs(p.delivery)}</span></div>` : ''}
          <div class="row"><span>Security Deposit</span><span class="sp"></span><span>${rs(p.dep)}</span></div></div>
        <div class="rule" style="margin-top:16px"></div>
        <div class="row" style="margin-top:12px"><h2 class="t2">Total</h2><span class="sp"></span><b style="font-size:22px" class="accent">${rs(p.total)}</b></div>`,
        cta: `<button class="btn" data-act="payNow">Pay ${rs(p.total)}</button>`
      });
    }
  },

  confirmed: {
    name: 'Renting Confirmed', grp: 1,
    html: () => shell({
      body: `<div class="center gap-hero" style="margin-bottom:0">${checkIllu()}<h1 class="t1" style="margin-top:20px">Booking Confirmed!</h1><p class="sub">Your gear is reserved.</p></div>
      <div class="stack" style="margin-top:22px"><button class="btn sm" data-act="viewRentals">View Rental Details</button><button class="btn ghost sm" data-go="home">Go to Home</button></div>
      <div class="center gap-l">${mountainIllu()}<h2 class="t2" style="margin-top:10px">See you on the Ride!</h2><p class="small accent" style="margin:2px 0 0;font-weight:700">#RideWithREVNT</p></div>`
    })
  },

  rentals: {
    name: 'My Rentals', grp: 1,
    html: () => {
      const L = S.rentals.filter(r => r.status === S.rentTab);
      return shell({
        tab: 'profile',
        body: `<h1 class="t1" style="margin:6px 0 16px">My Rentals</h1>${chips(['Upcoming', 'Active', 'Completed'], S.rentTab, 'rtab')}
        <div class="stack" style="margin-top:20px">${L.map(r => {
          const g = gearById(r.gear);
          return `<div class="card" style="padding:12px"><div class="row" style="align-items:flex-start;gap:12px">${thumb(g)}<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;padding-top:4px"><b style="font-size:11.5px;text-transform:uppercase">${esc(g.name)}</b><span style="font-size:13px">${r.from} – ${r.to}</span><span class="small">Pick-up: ${esc(r.pickup)}</span></div><span class="status-pill ${r.status === 'Completed' ? 'muted' : r.status === 'Active' ? 'ok' : ''}">${r.status}</span></div><button class="btn sm dark" style="margin-top:12px" data-go="details" data-gear="${g.id}">View Details</button></div>`;
        }).join('') || `<p class="small center" style="margin-top:40px">No ${S.rentTab.toLowerCase()} rentals yet.</p>`}</div>`
      });
    }
  },

  /* ===== Listing gear ===== */
  listGear: {
    name: 'List Gear', grp: 2,
    html: () => shell({
      tab: 'listGear',
      body: `<h1 class="t1" style="margin:6px 0 6px">What are you Listing?</h1><p class="sub" style="margin:0 0 16px">Pick a category to start.</p>
      <div class="menu">${[['sports_motorsports', 'Helmets'], ['apparel', 'Jackets'], ['checkroom', 'Pants'], ['pan_tool', 'Gloves'], ['hiking', 'Boots'], ['shield', 'Protection'], ['weather_hail', 'Weather Gear'], ['backpack', 'Other Accessories']].map(([ic, l]) =>
        `<button class="mi ${S.listing.cat === l ? 'on' : ''}" data-act="lcat" data-v="${l}">${I(ic)}${l}${I('chevron_right', 'go')}</button>`).join('')}</div>`
    })
  },

  addPhotos: {
    name: 'Add Photos', grp: 2,
    html: () => {
      const P = S.listing.photos;
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 16px">Add Photos</h1>
        <label class="upload" for="upl">${P[0] ? `<img src="${P[0]}" alt="Cover photo">` : `${I('photo_camera')}<b>Upload Photos</b><span class="small">Add up to 10 photos</span>`}</label>
        <input type="file" id="upl" class="sr" accept="image/*" multiple>
        <div class="thumbs">${[1, 2, 3].map(i => `<label for="upl" class="ph">${P[i] ? `<img src="${P[i]}" alt="">` : I('add')}</label>`).join('')}</div>
        <p class="small" style="margin-top:12px">${P.length ? `${P.length} photo${P.length > 1 ? 's' : ''} added. The first one is your cover.` : 'Good light and a plain background help renters trust the listing.'}</p>`,
        cta: `<button class="btn" data-go="gearInfo">Continue</button>`
      });
    },
    after() { wireFile('upl', url => { if (S.listing.photos.length < 10) S.listing.photos.push(url); rerender(); }, true); }
  },

  gearInfo: {
    name: 'Gear Information', grp: 2,
    html: () => {
      const L = S.listing;
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 10px">Gear Information</h1><div class="stack" style="gap:8px">
        <label for="gi-name" class="t2" style="font-size:16px;margin-top:10px">Gear Name</label><input class="field" id="gi-name" value="${esc(L.name)}">
        <label for="gi-brand" class="t2" style="font-size:16px;margin-top:10px">Gear Brand</label><input class="field" id="gi-brand" value="${esc(L.brand)}">
        <label for="gi-model" class="t2" style="font-size:16px;margin-top:10px">Gear Model</label><input class="field" id="gi-model" value="${esc(L.model)}">
        <label for="gi-desc" class="t2" style="font-size:16px;margin-top:10px">Gear Description</label><textarea class="field" id="gi-desc" placeholder="Write a description...">${esc(L.desc)}</textarea></div>`,
        cta: `<button class="btn" data-act="gearInfo">Continue</button>`
      });
    }
  },

  pricing: {
    name: 'Pricing and Availability', grp: 2,
    html: () => {
      const L = S.listing;
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 16px">Rental Pricing</h1><div class="stack" style="gap:12px">
        <label class="field">${I('currency_rupee')}<input id="pr-day" type="number" inputmode="numeric" placeholder="Per Day" value="${L.perDay}" aria-label="Price per day"><span class="small">/ day</span></label>
        <label class="field">${I('currency_rupee')}<input id="pr-week" type="number" inputmode="numeric" placeholder="Per Week (optional)" value="${L.perWeek}" aria-label="Price per week"><span class="small">/ week</span></label>
        <label class="field">${I('savings')}<input id="pr-dep" type="number" inputmode="numeric" placeholder="Security Deposit" value="${L.deposit}" aria-label="Security deposit"><span class="small">deposit</span></label></div>
        <h2 class="t2" style="margin:32px 0 10px">Availability</h2>
        <button class="field" data-act="cal" style="justify-content:space-between;color:var(--sub)" aria-expanded="${S.calOpen}">${L.blocked.size ? `${L.blocked.size} date${L.blocked.size > 1 ? 's' : ''} blocked` : 'Select unavailable dates'}${I('calendar_today')}</button>
        ${S.calOpen ? `<p class="small" style="margin:10px 0 0">February 2026 · tap to block a date</p><div class="cal">${Array.from({ length: 28 }, (_, i) => {
          const d = i + 1, w = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d % 7];
          return `<button class="${L.blocked.has(d) ? 'x' : ''}" data-act="block" data-v="${d}" aria-pressed="${L.blocked.has(d)}"><small>${w}</small>${d}</button>`;
        }).join('')}</div>` : ''}`,
        cta: `<button class="btn" data-act="pricing">Continue</button>`
      });
    }
  },

  review: {
    name: 'Review Listing', grp: 2,
    html: () => {
      const L = S.listing;
      return shell({
        body: `<h1 class="t1" style="margin:6px 0 18px">Review Listing</h1>
        <div class="row" style="align-items:flex-start;gap:14px"><div class="ph" style="width:104px;height:104px">${L.photos[0] ? `<img src="${L.photos[0]}" alt="">` : I('image')}</div><div style="min-width:0"><div style="font-weight:700;font-size:17px;line-height:1.25">${esc(L.name)}</div><div style="margin-top:6px"><b class="accent">${rs(L.perDay)}</b> / day${L.perWeek ? ` · ${rs(L.perWeek)} / week` : ''}</div><div class="small" style="margin-top:6px">Deposit ${rs(L.deposit)}</div></div></div>
        <div style="margin-top:28px;border-top:1px solid var(--stroke)">${[['Category', L.cat], ['Brand', L.brand], ['Model', L.model], ['Size', S.size], ['Condition', 'Like New'], ['Location', 'Koramangala'], ['Photos', L.photos.length || 'None yet'], ['Blocked dates', L.blocked.size || 'None']].map(([k, v]) => `<div class="kv"><b>${k}</b><span>${esc(v)}</span></div>`).join('')}</div>
        ${L.desc ? `<p class="sub" style="margin-top:14px">${esc(L.desc)}</p>` : ''}`,
        cta: `<button class="btn" data-act="publish">Publish Listing</button>`
      });
    }
  },

  live: {
    name: 'Listing Live', grp: 2,
    html: () => shell({
      body: `<div class="center gap-hero" style="margin-bottom:0">${checkIllu()}<h1 class="t1" style="margin-top:20px">Your Listing is Live!</h1><p class="sub">Start receiving rental requests.</p></div>
      <div class="stack" style="margin-top:22px"><button class="btn sm" data-go="myListings">View Listing</button><button class="btn ghost sm" data-go="home">Go to Home</button></div>
      <div class="center gap-l">${mountainIllu()}<h2 class="t2" style="margin-top:10px">Get Ready for Requests</h2><p class="small accent" style="margin:2px 0 0;font-weight:700">#RideWithREVNT</p></div>`
    })
  },

  myListings: {
    name: 'My Listings', grp: 2,
    html: () => {
      const L = S.myListings.filter(l => l.status === S.listTab);
      const n = S.requests.filter(r => r.status === 'New').length;
      return shell({
        tab: 'profile',
        body: `<div class="hdr" style="margin:6px 0 16px;align-items:center"><h1 class="t1">My Listings</h1><button class="chip pill ${n ? 'on' : ''}" data-go="requests">Requests${n ? ` (${n})` : ''}</button></div>
        ${chips(['Active', 'Pending', 'Expired'], S.listTab, 'ltab')}
        <div class="stack" style="margin-top:18px;gap:10px">${L.map(l => `<div class="card li"><div class="ph" style="width:80px;height:80px">${l.photo ? `<img src="${l.photo}" alt="">` : I('sports_motorsports')}</div><span class="meta"><span class="nm">${esc(l.title)}</span><span class="pr"><b>${rs(l.price)}</b> / day</span><span class="rate">${l.status === 'Active' ? `${I('star')}4.8 · 6 rentals` : l.status === 'Pending' ? 'Under review' : 'Listing ended'}</span></span><span class="status-pill ${l.status === 'Active' ? 'ok' : l.status === 'Expired' ? 'muted' : ''}">${l.status}</span></div>`).join('') || `<p class="small center" style="margin-top:40px">Nothing ${S.listTab.toLowerCase()} right now.</p>`}</div>`
      });
    }
  },

  requests: {
    name: 'Rental Requests', grp: 2,
    html: () => {
      const L = S.requests.filter(r => r.status === S.reqTab);
      return shell({
        tab: 'notifications',
        body: `<h1 class="t1" style="margin:6px 0 16px">Rental Requests</h1>${chips(['New', 'Accepted', 'Declined'], S.reqTab, 'qtab')}
        <div class="stack" style="margin-top:16px">${L.map(r => `<div class="card" style="padding:14px"><div class="row" style="gap:14px">${personAv(56)}<div style="flex:1;min-width:0"><b style="font-size:16px">${r.who}</b><div class="row" style="gap:4px;margin-top:6px"><span class="date-pill">${r.from}</span>${I('arrow_forward')}<span class="date-pill">${r.to}</span></div><div style="font-size:10.5px;font-weight:700;margin-top:6px;color:var(--sub)">${esc(r.gear)}</div></div></div><button class="btn sm" style="margin-top:12px" data-act="openReq" data-v="${r.id}">View Details</button></div>`).join('') || `<p class="small center" style="margin-top:40px">No ${S.reqTab.toLowerCase()} requests.</p>`}</div>`
      });
    }
  },

  reqDetail: {
    name: 'Request Details', grp: 2,
    html: () => {
      const r = S.requests.find(x => x.id === S.req) || S.requests[0];
      return shell({
        tab: 'notifications',
        body: `<h1 class="t1" style="margin:6px 0 16px">Request</h1>
        <div class="row" style="gap:14px">${personAv(60)}<div><b style="font-size:17px">${r.who}</b><div class="rate" style="margin-top:4px">${I('star')}${r.rating} (${r.count} rentals)</div></div><div class="sp"></div><button class="heart bubble-bg" data-act="chat" data-v="${r.who}" aria-label="Message ${r.who}">${I('chat_bubble')}</button></div>
        <div class="rule" style="margin:18px 0"></div>
        <div class="kv" style="border:0;padding:6px 0"><b>Dates</b><span>${r.from} – ${r.to}</span></div>
        <div class="kv" style="border:0;padding:6px 0"><b>Gear</b><span>${esc(r.gear)}</span></div>
        <b style="display:block;font-size:14px;margin:16px 0 8px">Message</b>
        <div class="bubble them" style="max-width:100%">${esc(r.msg)}</div>
        ${r.status === 'New'
          ? `<div class="row" style="gap:12px;margin-top:20px"><button class="btn sm" data-act="decide" data-v="Accepted">Accept</button><button class="btn ghost sm" data-act="decide" data-v="Declined">Decline</button></div>`
          : `<p class="sub" style="margin-top:16px">You ${r.status.toLowerCase()} this request.</p>`}`
      });
    }
  },

  /* ===== Account ===== */
  earnings: {
    name: 'Earnings', grp: 3,
    html: () => shell({
      tab: 'profile',
      body: `<h1 class="t1" style="margin:6px 0 4px">Total Earnings</h1>
      <div style="font-size:30px;font-weight:700" class="accent">${rs(EARNINGS[S.bar][1])}</div>
      <p class="small" style="margin:2px 0 0">${EARNINGS[S.bar][0]} 2026 · tap a bar to compare</p>
      <div class="bar-chart" role="group" aria-label="Monthly earnings">${EARNINGS.map(([m, v], i) => `<button class="${S.bar === i ? 'on' : ''}" data-act="bar" data-v="${i}" aria-label="${m}: ${rs(v)}"><i style="height:${Math.round(v / 12500 * 120)}px"></i>${m}</button>`).join('')}</div>
      <h2 class="t2" style="margin:24px 0 4px;font-size:17px">Recent Transactions</h2>
      ${(S.txAll ? TRANSACTIONS : TRANSACTIONS.slice(0, 3)).map(([a, w, d]) => `<div class="tx"><span class="amt">+ ${a}</span><span style="color:var(--sub)">${w}</span><span class="sp"></span><span class="small">${d}</span></div>`).join('')}
      <button class="btn sm dark" style="margin-top:16px" data-act="txAll">${S.txAll ? 'Show Less' : 'View All'}</button>`
    })
  },

  messages: {
    name: 'Messages', grp: 3,
    html: () => shell({
      tab: 'profile',
      body: `<h1 class="t1" style="margin:6px 0 16px">Messages</h1><div class="stack" style="gap:8px">${CONTACTS.map(([n, t], i) => {
        const th = S.chats[n]; const last = th ? th[th.length - 1][1] : 'Hi! Is this available?';
        return `<button class="card row" data-act="chat" data-v="${n}" style="padding:10px 12px;gap:12px;width:100%;text-align:left">${personAv(44)}<span style="flex:1;min-width:0"><b style="font-size:14px">${n}</b><span style="font-size:12.5px;color:var(--sub);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(last)}</span></span><span style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><span class="small">${t}</span>${i < 2 ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--brand)"></span>` : ''}</span></button>`;
      }).join('')}</div>`
    })
  },

  chat: {
    name: 'Chat', grp: 3,
    html: () => {
      const th = S.chats[S.chatWith] || [['them', 'Hi! Is this available?']];
      return statusBar() + `<div class="chat-head">${personAv(38)}<div><b style="font-size:14px">${esc(S.chatWith)}</b><div class="online">● Active now</div></div></div>
        <div class="bd" id="thread" style="display:flex;flex-direction:column;gap:10px;padding-top:16px">${th.map(([w, t]) => `<div class="bubble ${w}">${esc(t)}</div>`).join('')}</div>
        <form id="chatForm" class="composer"><label class="field"><input id="msg" placeholder="Message" autocomplete="off" enterkeyhint="send" aria-label="Message">${I('attach_file')}</label><button class="send" aria-label="Send">${I('send')}</button></form><div class="hi"></div>`;
    },
    after() {
      const t = document.getElementById('thread'); t.scrollTop = t.scrollHeight;
      document.getElementById('chatForm').addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('msg'); const v = input.value.trim(); if (!v) return;
        const who = S.chatWith;
        (S.chats[who] = S.chats[who] || []).push(['me', v]);
        rerender();
        const th = document.getElementById('thread');
        th.insertAdjacentHTML('beforeend', '<div class="typing">typing…</div>'); th.scrollTop = th.scrollHeight;
        setTimeout(() => {
          S.chats[who].push(['them', AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]]);
          if (S.cur === 'chat' && S.chatWith === who) rerender();
        }, 1300);
        if (!MOBILE) setTimeout(() => document.getElementById('msg')?.focus(), 0);
      });
    }
  },

  notifications: {
    name: 'Notifications', grp: 3,
    html: () => shell({
      tab: 'notifications',
      body: `<h1 class="t1" style="margin:6px 0 16px">Notifications</h1><div class="menu">${[['assignment_add', 'New Rental Requests', '2m', 'requests'], ['event_available', 'Bookings Confirmed', '1h', 'rentals'], ['payments', 'Payments Received', '5h', 'earnings'], ['assignment_return', 'Return Requests', '1d', 'rentals']].map(([ic, l, t, g]) =>
        `<button class="mi" data-go="${g}">${I(ic)}${l}<span class="time">${t}</span></button>`).join('')}</div>`
    })
  },

  profile: {
    name: 'Profile', grp: 3,
    html: () => shell({
      tab: 'profile',
      body: `<div class="row" style="justify-content:flex-end;margin-top:4px"><button class="heart bubble-bg" data-go="settings" aria-label="Settings">${I('settings')}</button></div>
      <div class="center">${myAvatar(128)}<h1 class="t1" style="margin-top:10px">${esc(S.name || 'Ayush Roy')}</h1><p class="small" style="margin:2px 0 0">${esc(S.style)} rider · ${esc(S.location)}</p><button class="see" data-go="personal" style="margin-top:6px">Edit Profile</button></div>
      <div class="menu" style="margin-top:20px">${[['badge', 'Personal Information', 'personal'], ['straighten', 'My sizes', '@sizes'], ['history', 'Rentals History', 'rentals'], ['inventory_2', 'Gears Listed', 'myListings'], ['trending_up', 'Earnings', 'earnings'], ['chat', 'Messages', 'messages']].map(([ic, l, g]) =>
        g === '@sizes'
          ? `<button class="mi" data-act="toast" data-msg="Saved sizes: Helmet M · Jacket L · Gloves M">${I(ic)}${l}</button>`
          : `<button class="mi" data-go="${g}">${I(ic)}${l}${I('chevron_right', 'go')}</button>`).join('')}</div>`
    })
  },

  settings: {
    name: 'Settings', grp: 3,
    html: () => shell({
      tab: 'profile',
      body: `<h1 class="t1" style="margin:6px 0 16px">Settings</h1><div class="menu">${[['two_wheeler', 'Your Trips', 'rentals'], ['credit_card', 'Payment Methods', 'payment'], ['support_agent', 'Help and Support', 'help'], ['contrast', 'Appearance', '@theme'], ['gavel', 'Terms and Conditions', 'terms'], ['logout', 'Log Out', 'logout']].map(([ic, l, g]) =>
        g === '@theme'
          ? `<button class="mi" data-act="cycleTheme">${I(ic)}${l}<span class="time" style="font-size:12px">${THEME_LABEL[theme]}</span></button>`
          : `<button class="mi ${g === 'logout' ? 'danger' : ''}" data-go="${g}">${I(ic)}${l}${I('chevron_right', 'go')}</button>`).join('')}</div>`
    })
  },

  help: {
    name: 'Help and Support', grp: 3,
    html: () => {
      const q = S.helpQ.toLowerCase();
      const list = FAQ.map((f, i) => [f, i]).filter(([f]) => !q || (f[0] + f[1]).toLowerCase().includes(q));
      return shell({
        tab: 'profile',
        body: `<h1 class="t1" style="margin:6px 0 16px">Help and Support</h1>
        <label class="field">${I('search')}<input id="hq" type="search" placeholder="Search Help..." value="${esc(S.helpQ)}" aria-label="Search help"></label>
        <div class="stack" style="gap:8px;margin-top:16px">${list.map(([f, i]) => `<div class="acc"><button data-act="faq" data-v="${i}" aria-expanded="${S.faq === i}">${f[0]}${I(S.faq === i ? 'expand_more' : 'chevron_right')}</button>${S.faq === i ? `<div class="ans">${f[1]}</div>` : ''}</div>`).join('') || '<p class="small">No answers match. Try “deposit” or “list”.</p>'}</div>
        <button class="btn ghost sm" style="margin-top:20px" data-act="chat" data-v="REVNT Support">${I('support_agent')}Chat with support</button>`
      });
    },
    after() { liveInput('hq', v => S.helpQ = v); }
  },

  terms: {
    name: 'Terms and Conditions', grp: 3,
    html: () => shell({
      body: `<h1 class="t1" style="margin:6px 0 14px">Terms and Conditions</h1>
      <ol class="terms" style="padding-left:18px;margin:0;display:flex;flex-direction:column;gap:12px;font-size:13.5px;color:var(--sub);line-height:1.55">
        <li><b>Acceptance of Terms.</b> By creating an account you agree to rent and list gear under these terms.</li>
        <li><b>Gear Condition.</b> Owners must list gear that is safe to ride in. Helmets involved in a crash may not be listed.</li>
        <li><b>Security Deposit.</b> Held by REVNT for the rental period and returned within 48 hours of a clean return.</li>
        <li><b>Late Returns.</b> Each late day is charged at the daily rate plus ₹100.</li>
        <li><b>Damage.</b> Renters pay for damage beyond normal wear, assessed from the check-in and check-out photos.</li>
        <li><b>Cancellations.</b> Free up to 24 hours before pick-up; 50% of the first day after that.</li></ol>`,
      cta: `<button class="btn" data-act="acceptTerms">I Agree</button>`
    })
  },

  logout: {
    name: 'Logout', grp: 3,
    html: () => shell({
      body: `<div class="center gap-l"><div class="icon-circ" style="margin:0 auto">${I('logout')}</div><h1 class="t2" style="margin-top:16px">Are you sure you want to logout?</h1><p class="sub" style="font-size:13px">You will need to sign-in again to access your<br>account and preferences</p></div>
      <div class="stack gap-l"><button class="btn sm" data-act="logout">Logout</button><button class="btn ghost sm" data-act="back">Stay signed in</button></div>`
    })
  }
};

const GROUPS = ['Onboarding', 'Renting gear', 'Listing gear', 'Account'];
