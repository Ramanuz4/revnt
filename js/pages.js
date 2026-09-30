/* REVNT — pages.
   Each page: { title, layout: 'site' | 'auth' | 'bare', tab?, back?, auth?, html(params), after?(params, root) } */

function price() {
  const g = gearById(S.gear);
  const d = Math.max(1, Math.round((new Date(S.to + 'T00:00') - new Date(S.from + 'T00:00')) / 864e5) || 1);
  const fee = g.price * d, plat = 100, dep = 1000, delivery = S.pickup.startsWith('Doorstep') ? 150 : 0;
  return { g, d, fee, plat, dep, delivery, total: fee + plat + dep + delivery };
}
function breakdown(p) {
  return `<div class="kv"><span>${rs(p.g.price)} × ${p.d} day${p.d > 1 ? 's' : ''}</span><span>${rs(p.fee)}</span></div>
    <div class="kv"><span>Platform fee</span><span>${rs(p.plat)}</span></div>
    ${p.delivery ? `<div class="kv"><span>Doorstep delivery</span><span>${rs(p.delivery)}</span></div>` : ''}
    <div class="kv"><span>Security deposit <span class="small">(refundable)</span></span><span>${rs(p.dep)}</span></div>
    <div class="kv total"><span>Total</span><span>${rs(p.total)}</span></div>`;
}
function stepper(steps, cur) {
  return `<div class="stepper">${steps.map((s, i) => `${i ? `<span class="bar ${i <= cur ? 'done' : ''}"></span>` : ''}<span class="s ${i === cur ? 'on' : i < cur ? 'done' : ''}"><i>${i < cur ? I('check') : i + 1}</i>${s}</span>`).join('')}</div>`;
}
const crumbs = items => `<nav class="crumbs desk-only" aria-label="Breadcrumb">${items.map((c, i) => i < items.length - 1 ? `<a href="#/${c[1]}">${c[0]}</a>${I('chevron_right')}` : `<span>${c[0]}</span>`).join('')}</nav>`;

/* ---------- auth side panel ---------- */
function authShell(inner, { head = 'Gear up.<br><em>Ride out.</em>', quote = true, img = '' } = {}) {
  return `<div class="auth">
    <aside class="side-art ${img ? 'has-photo' : ''}">${img ? `<div class="side-photo" id="sidePhoto" style="background-image:url('${img}')"></div>` : ''}<div class="road"></div>
      <a href="#/home" aria-label="REVNT home"><img src="${ASSETS.logo}" alt="REVNT"></a>
      <h2>${head}</h2>
      ${quote ? `<div class="quote">${avatarImg(44)}<div><b>“Rented a Dainese jacket for Spiti instead of buying one. Saved ₹28k.”</b><div style="opacity:.7;margin-top:4px">Riya M. · 41 rentals</div></div></div>` : '<span></span>'}
    </aside>
    <div class="form-side"><div class="form">
      <div class="mlogo"><a href="#/home"><img src="${ASSETS.logo}" alt="REVNT"></a><button class="icon-btn" data-act="back" aria-label="Back">${I('close')}</button></div>
      ${inner}
    </div></div></div>`;
}

/* ---------- explore helpers ---------- */
function exploreList() {
  const ex = S.ex, q = ex.query.trim().toLowerCase();
  let list = GEAR.filter(g => (!ex.cats.size || ex.cats.has(g.cat)) && (!ex.brands.size || ex.brands.has(g.brand)) && g.price <= (ex.max >= 2000 ? Infinity : ex.max)
    && (!q || (g.name + g.brand + g.cat).toLowerCase().includes(q)));
  if (ex.sort === 1) list.sort((a, b) => a.price - b.price);
  if (ex.sort === 2) list.sort((a, b) => b.price - a.price);
  if (ex.sort === 3) list.sort((a, b) => b.rating - a.rating);
  return list;
}
function filterPanel() {
  const ex = S.ex;
  return `<div><h3>Category</h3><div class="stack" style="gap:6px">${CATS.map(c => `<button class="checkrow ${ex.cats.has(c.id) ? 'on' : ''}" data-act="fcat" data-v="${c.id}" aria-pressed="${ex.cats.has(c.id)}"><span class="chk">${I('check')}</span>${c.id}<span class="sp"></span><span class="small">${GEAR.filter(g => g.cat === c.id).length}</span></button>`).join('')}</div></div>
    <div><h3>Price per day</h3><input type="range" class="range" id="fmax" min="100" max="2000" step="50" value="${ex.max}" aria-label="Maximum price per day"><div class="row small" style="justify-content:space-between"><span>₹100</span><b class="accent" id="fmaxL">${ex.max >= 2000 ? 'Any price' : 'Up to ' + rs(ex.max)}</b><span>₹2000+</span></div></div>
    <div><h3>Size</h3>${chips(['S', 'M', 'L', 'XL'], ex.size, 'fsize', 'fill')}</div>
    <div><h3>Brands</h3><div class="chips">${[...new Set(GEAR.map(g => g.brand))].map(b => `<button class="chip sm ${ex.brands.has(b) ? 'on' : ''}" data-act="fbrand" data-v="${esc(b)}" aria-pressed="${ex.brands.has(b)}">${esc(b)}</button>`).join('')}</div></div>
    <button class="btn ghost sm" data-act="clearF">${I('restart_alt')}Clear all filters</button>`;
}
function resultsHtml() {
  const list = exploreList(), ex = S.ex;
  const af = [...ex.cats].map(c => `<button class="af" data-act="fcat" data-v="${c}">${c}${I('close')}</button>`)
    .concat(ex.max < 2000 ? [`<button class="af" data-act="fmaxClear">Up to ${rs(ex.max)}${I('close')}</button>`] : [])
    .concat([...ex.brands].map(b => `<button class="af" data-act="fbrand" data-v="${esc(b)}">${esc(b)}${I('close')}</button>`))
    .concat(ex.size ? [`<button class="af" data-act="fsize" data-v="${ex.size}">Size ${ex.size}${I('close')}</button>`] : []);
  return `${af.length ? `<div class="active-filters">${af.join('')}</div>` : ''}
    <p class="small" style="margin-bottom:14px">${list.length} item${list.length === 1 ? '' : 's'} near ${esc(S.location)}</p>
    ${list.length ? `<div class="cards two-mob">${list.map(gcard).join('')}</div>`
      : `<div class="empty">${I('search_off')}<b style="font-size:17px;color:var(--ink)">Nothing matches yet</b><p style="margin:6px 0 16px">Try a higher price limit or fewer filters.</p><button class="btn ghost sm" data-act="clearF">Clear filters</button></div>`}`;
}

/* ---------- wizard helpers ---------- */
const WIZ = [['list', 'Category'], ['list/photos', 'Photos'], ['list/info', 'Details'], ['list/pricing', 'Pricing'], ['list/review', 'Review']];
function wizShell(step, title, sub, body, next) {
  const L = S.listing;
  return `<section class="page"><div class="wrap">
    ${crumbs([['Home', 'home'], ['List gear', 'list'], [WIZ[step][1], WIZ[step][0]]])}
    <div class="wprog" aria-hidden="true"><i style="width:${(step + 1) / WIZ.length * 100}%"></i></div>
    <div class="wizard"><div>
      <span class="kicker">Step ${step + 1} of ${WIZ.length}</span>
      <h1 class="h1" style="margin:10px 0 6px">${title}</h1><p class="lead" style="margin-bottom:24px">${sub}</p>
      ${body}
      <div class="row" style="margin-top:28px;gap:12px">${step ? `<button class="btn ghost" data-act="back">${I('arrow_back')}Back</button>` : ''}${next}</div>
    </div>
    <aside class="preview"><p class="kicker" style="margin-bottom:12px">Live preview</p><div id="pv">${previewCard()}</div>
      <p class="small" style="margin-top:12px">This is how renters will see your listing.</p></aside></div>
  </div></section>`;
}
function previewCard() {
  const L = S.listing;
  return `<article class="gcard">${art(L.cat, { tag: L.cat, img: L.photos[0] })}<div class="body"><span class="nm">${esc(L.name || 'Your gear')}</span><span class="meta"><span class="rate">${I('star')}New</span><span>· ${esc(L.brand || 'Brand')}</span></span><span class="pr"><b>${rs(L.perDay)}</b>/ day</span></div></article>`;
}

/* ================= PAGES ================= */
const PAGES = {

  /* ----- Splash Screen ----- */
  'splash': {
    title: 'Splash Screen', layout: 'bare',
    html: () => `<div class="splash-page">
      <div class="lines" aria-hidden="true"><i style="top:22%;animation-delay:.1s"></i><i style="top:38%;animation-delay:.5s"></i><i style="top:61%;animation-delay:.25s"></i><i style="top:78%;animation-delay:.7s"></i></div>
      <img src="${ASSETS.logo}" alt="REVNT — Gear up. Ride out.">
      <div class="bar"><i></i></div>
      <button class="skip small" data-act="skipSplash">Skip intro</button></div>`,
    after() { clearTimeout(window.splashT); window.splashT = setTimeout(() => { if (current.key === 'splash') { navStack.length = 0; location.replace('#/onboarding/1'); } }, REDUCED ? 400 : 2300); }
  },
  'welcome': { redirect: 'onboarding/1' },
  'onboarding/1': onbPage(0),
  'onboarding/2': onbPage(1),
  'onboarding/3': onbPage(2),

  /* ----- Sign-in ----- */
  'signin': {
    title: 'Sign-in', layout: 'auth',
    html: () => authShell(`
      <h1 class="h1">Welcome Back</h1><p class="lead" style="margin:6px 0 26px">Sign-in to continue</p>
      <form class="stack" id="signinForm" novalidate>
        <div><label class="label" for="si-email">Email</label><input class="field" id="si-email" type="email" autocomplete="email" value="${esc(S.email)}" placeholder="you@example.com"></div>
        <div><div class="row" style="justify-content:space-between"><label class="label" for="si-pass">Password</label><button type="button" class="link small" style="margin-bottom:8px" data-act="toast" data-msg="Reset link sent to your email">Forgot Password?</button></div>
          <label class="field"><input id="si-pass" type="password" autocomplete="current-password" value="ridesafe26" placeholder="••••••••"><button type="button" data-act="peek" aria-label="Show password">${I('visibility')}</button></label></div>
        <button class="btn block lg" type="submit" style="margin-top:8px">Sign-In${I('arrow_forward', 'slide')}</button>
      </form>
      <div class="or">or continue with</div>
      <div class="socials"><button class="soc" data-act="social"><img src="${ASSETS.google}" alt="">Google</button><button class="soc" data-act="social"><img src="${ASSETS.facebook}" alt="">Facebook</button><a class="soc" href="#/verify">${I('call')}Phone</a></div>
      <p class="center muted" style="margin-top:26px;text-align:center">Don’t Have an Account? <a class="link" href="#/register">Register</a></p>`),
    after(p, root) { $('#signinForm', root).addEventListener('submit', e => { e.preventDefault(); A.signin(); }); }
  },

  /* ----- Register ----- */
  'register': {
    title: 'Register', layout: 'auth',
    html: () => authShell(`
      <h1 class="h1">Create Account</h1><p class="lead" style="margin:6px 0 24px">Rent or list riding gear in minutes.</p>
      <form class="stack" id="regForm" novalidate>
        <div class="grid2"><div><label class="label" for="rg-name">Name</label><input class="field" id="rg-name" autocomplete="name" placeholder="Ayush Roy"></div>
          <div><label class="label" for="rg-phone">Phone Number</label><input class="field" id="rg-phone" type="tel" autocomplete="tel" placeholder="+91 98xxx xxxxx"></div></div>
        <div><label class="label" for="rg-email">Email</label><input class="field" id="rg-email" type="email" autocomplete="email" placeholder="you@example.com"></div>
        <div><label class="label" for="rg-pass">Password</label><input class="field" id="rg-pass" type="password" autocomplete="new-password" placeholder="At least 8 characters"></div>
        <div class="row" style="flex-wrap:wrap;gap:6px;font-size:14px"><button type="button" class="checkrow ${S.agreed ? 'on' : ''}" data-act="terms" aria-pressed="${S.agreed}"><span class="chk">${I('check')}</span>I agree to</button><a class="link" href="#/terms">Terms and Conditions</a></div>
        <button class="btn block lg" type="submit">Create Account${I('arrow_forward', 'slide')}</button>
      </form>
      <div class="or">or sign up with</div>
      <div class="socials"><button class="soc" data-act="socialNew"><img src="${ASSETS.google}" alt="">Google</button><button class="soc" data-act="socialNew"><img src="${ASSETS.facebook}" alt="">Facebook</button><a class="soc" href="#/verify">${I('call')}Phone</a></div>
      <p class="muted" style="margin-top:24px;text-align:center">Already have an account? <a class="link" href="#/signin">Sign-in</a></p>`, { head: 'Join <em>12,000+</em><br>riders.' }),
    after(p, root) { $('#regForm', root).addEventListener('submit', e => { e.preventDefault(); A.register(); }); }
  },

  /* ----- Verification ----- */
  'verify': {
    title: 'Verification', layout: 'auth',
    html: () => authShell(`
      <div class="icon-circ" style="margin-bottom:18px">${I('sms')}</div>
      <h1 class="h1">Verify Your Account</h1><p class="lead" style="margin:6px 0 26px">Enter the 6-digit code sent to your phone.</p>
      <div class="otp" id="otp">${[0, 1, 2, 3, 4, 5].map(i => `<input inputmode="numeric" pattern="[0-9]*" autocomplete="${i ? 'off' : 'one-time-code'}" id="otp${i}" aria-label="Digit ${i + 1}">`).join('')}</div>
      <p class="muted" style="margin-top:18px">Didn’t get it? Resend Code <button class="link" id="resend" data-act="resend">(00:30)</button></p>
      <button class="btn block lg" style="margin-top:26px" data-act="verify">Verify</button>
      <p class="small" style="margin-top:12px;text-align:center">Demo: any six digits work.</p>`, { head: 'One step<br>from the<br><em>open road.</em>', quote: false }),
    after(p, root) { wireOtp(root); startResend(); }
  },

  /* ----- Personalization ----- */
  'setup': {
    title: 'Personalization', layout: 'auth',
    html: () => authShell(`
      ${stepper(['Profile', 'Purpose'], 0)}
      <h1 class="h1">Let’s Set You Up</h1><p class="lead" style="margin:6px 0 18px">This helps us personalize your experience.</p>
      <label class="av-edit" title="Change photo">${myAvatar(132)}<span class="cam">${I('photo_camera')}</span><input type="file" accept="image/*" class="sr" id="avatarFile" aria-label="Upload profile photo"></label>
      <div class="stack">
        <div><label class="label" for="pz-name">Name</label><input class="field" id="pz-name" value="${esc(S.name)}"></div>
        <div><label class="label" for="pz-loc">Location</label><label class="field">${I('location_on')}<input id="pz-loc" value="${esc(S.location)}"></label></div>
        <div><label class="label" for="pz-style">Riding Style</label><select class="field" id="pz-style">${['Commuter', 'Touring', 'Track days', 'Off-road', 'Weekend cruiser'].map(o => `<option ${o === S.style ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
      </div>
      <button class="btn block lg" style="margin-top:24px" data-act="setup">Continue${I('arrow_forward', 'slide')}</button>`, { head: 'Make it<br><em>yours.</em>', quote: false }),
    after(p, root) { wireFiles($('#avatarFile', root), url => { S.photo = url; render(); }); }
  },

  /* ----- Choose Purpose ----- */
  'purpose': {
    title: 'Choose Purpose', layout: 'auth',
    html: () => authShell(`
      ${stepper(['Profile', 'Purpose'], 1)}
      <h1 class="h1">How will you use REVNT</h1><p class="lead" style="margin:6px 0 24px">You can always change this later.</p>
      <div class="stack" role="radiogroup">${PURPOSES.map(([k, ic, t, s]) =>
        `<button class="opt pic ${S.purpose === k ? 'on' : ''}" role="radio" aria-checked="${S.purpose === k}" data-act="purpose" data-v="${k}"><span class="thumb"><img src="assets/${k}-thumb.jpg" alt=""><span class="badge-ic">${I(ic)}</span></span><span><b>${t}</b><span class="s">${s}</span></span>${I('check_circle', 'ok fill')}</button>`).join('')}</div>
      <button class="btn block lg" style="margin-top:24px" data-act="purposeDone">Continue${I('arrow_forward', 'slide')}</button>`, { head: 'Rent it.<br>List it.<br><em>Ride it.</em>', quote: false, img: `assets/${S.purpose}.jpg` })
  },

  /* ----- Main App - Home ----- */
  'home': {
    title: 'Main App - Home', layout: 'site', tab: 'home',
    html: () => `
      <section class="hero">${speedlines(14)}<div class="wrap hero-grid">
        <div>
          <span class="kicker" style="animation:fadeUp .6s both">${I('location_on', 'fill')} ${esc(S.location)} · 1,240 items nearby</span>
          <h1 style="margin-top:18px"><span class="ln"><span>Gear up.</span></span><span class="ln"><span>Ride <em>out.</em></span></span>
            <span class="ln"><span style="font-size:.5em;font-stretch:105%;font-weight:700;letter-spacing:-.01em">Rent <span class="rotator" id="rot"><span class="on">helmets</span><span>jackets</span><span>gloves</span><span>boots</span></span> from riders near you.</span></span></h1>
          <p class="lead">High quality riding gear for riders like you. Book in minutes, pick it up around the corner, and return it after the ride.</p>
          <form class="hero-search" id="heroSearch"><label class="field" style="flex:1">${I('search')}<input id="hq" placeholder="Search for Gear..." aria-label="Search for gear"></label><button class="btn">Search</button></form>
          <div class="stats"><div><b data-count="12000" data-suf="+">0</b><span>riders</span></div><div><b data-count="3400" data-suf="+">0</b><span>items listed</span></div><div><b>4.8</b><span>average rating</span></div></div>
        </div>
        <div class="stack-vis" aria-hidden="true">
          <div class="fl a">${art('Helmets', { big: true })}</div>
          <div class="fl b">${art('Jackets', { big: true })}</div>
          <div class="fl c">${art('Gloves', { big: true })}</div>
          <div class="fl-chip"><span class="icon-circ" style="width:42px;height:42px">${I('verified', 'fill')}</span><div><b>Booking confirmed</b>KSR helmet · 4 days</div></div>
        </div>
      </div></section>

      <div class="marquee" aria-hidden="true"><div class="track">${[...BRANDS, ...BRANDS].map(b => `<span>${b}</span>`).join('')}</div></div>

      <section class="section"><div class="wrap">
        <div class="sec-head" data-reveal><div><span class="kicker">Browse</span><h2 class="h2">Shop by category</h2></div><a class="see" href="#/explore">All gear${I('arrow_forward')}</a></div>
        <div class="cat-grid">${CATS.map((c, i) => `<button class="cat" data-act="cat" data-v="${c.id}" data-reveal style="--d:${i}">${art(c.id)}<span class="lbl"><b>${c.id}</b><span>${c.blurb}</span></span></button>`).join('')}</div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="sec-head" data-reveal><div><span class="kicker">Hand-picked</span><h2 class="h2">Featured Gear</h2></div><a class="see" href="#/explore">See all${I('arrow_forward')}</a></div>
        <div class="cards two-mob">${['k5r', 'dai', 'hjc', 'tvs'].map((id, i) => gcard(gearById(id), i)).join('')}</div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="sec-head" data-reveal><div><span class="kicker">Under 3 km</span><h2 class="h2">Nearby Gear</h2></div><a class="see" href="#/explore">See all${I('arrow_forward')}</a></div>
        <div class="cards two-mob">${[...GEAR].sort((a, b) => a.km - b.km).slice(0, 4).map(gcard).join('')}</div>
      </div></section>

      <section class="section" style="background:var(--bg-2)"><div class="wrap">
        <div class="sec-head" data-reveal><div><span class="kicker">How it works</span><h2 class="h2">Three steps to the ride</h2></div></div>
        <div class="steps">${[['search', 'Find it', 'Search 3,400+ items by size, price and distance. Every listing shows real photos and ratings.'], ['event_available', 'Book it', 'Pick your dates and pay securely. Your deposit is held safely and refunded after return.'], ['two_wheeler', 'Ride it', 'Collect from the owner or get it delivered. Return it after your ride, and rate each other.']].map(([ic, t, d], i) =>
          `<div class="step" data-reveal style="--d:${i}"><span class="num">0${i + 1}</span><span class="icon-circ">${I(ic)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="band" data-reveal>
          <div><span class="kicker" style="color:#F0643A">For owners</span><h2 style="margin-top:12px">Your gear, earning<br>while you don’t ride.</h2><p>Riders on REVNT earn from helmets, jackets and luggage that would otherwise sit in a cupboard. You set the price and the dates.</p>
            <div class="row" style="margin-top:22px;gap:12px;flex-wrap:wrap"><a class="btn lg" href="#/list">List your gear${I('arrow_forward', 'slide')}</a><a class="btn lg ghost" style="background:transparent;color:inherit;border-color:rgba(127,127,127,.4)" href="#/earnings">See earnings</a></div></div>
          <div><div class="earn" data-count="4200" data-pre="₹">₹0</div><p style="margin-top:8px">average monthly earnings from 3 listed items</p></div>
        </div>
      </div></section>`,
    after(p, root) {
      rotator($('#rot', root)); parallax(root);
      $('#heroSearch', root).addEventListener('submit', e => { e.preventDefault(); S.ex = { cats: new Set(), brands: new Set(), max: 2000, size: '', query: $('#hq', root).value, sort: 0 }; go('results'); });
    }
  },

  /* ----- Explore / Filters / Search Results ----- */
  'explore': {
    title: 'Explore', layout: 'site', tab: 'explore',
    html: () => {
      const one = S.ex.cats.size === 1 ? [...S.ex.cats][0] : null;
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], [one || 'Explore', 'explore']])}
        <div class="page-head"><div><h1 class="h1">${one ? esc(one) : 'Explore'}</h1><p class="lead">${one ? catById(one).blurb : 'Riding gear from verified riders around you.'}</p></div></div>
        <div class="toolbar">
          <label class="field">${I('search')}<input id="q" type="search" placeholder="Search for Gear..." value="${esc(S.ex.query)}" aria-label="Search for gear"></label>
          <select class="field" id="sort" style="flex:0 0 auto;width:auto;min-width:0" aria-label="Sort">${['Recommended', 'Price: low to high', 'Price: high to low', 'Top rated'].map((o, i) => `<option value="${i}" ${S.ex.sort === i ? 'selected' : ''}>${o}</option>`).join('')}</select>
          <a class="btn ghost mob-only" href="#/filters">${I('tune')}Filter</a>
        </div>
        <div class="ex-grid"><aside class="filters-side" id="fpanel" aria-label="Filters">${filterPanel()}</aside><div id="results">${resultsHtml()}</div></div>
      </div></section>`;
    },
    after(p, root) {
      const q = $('#q', root);
      let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { S.ex.query = q.value; refreshResults(); }, 180); });
      $('#sort', root).addEventListener('change', e => { S.ex.sort = +e.target.value; refreshResults(true); });
      wireRange(root);
    }
  },

  /* ----- Filters ----- */
  'filters': {
    title: 'Filters', layout: 'site', back: 'explore',
    html: () => `<section class="page"><div class="wrap narrow">
      ${crumbs([['Home', 'home'], ['Explore', 'explore'], ['Filters', 'filters']])}
      <div class="page-head"><div><h1 class="h1">Filters</h1><p class="lead">Narrow down gear near ${esc(S.location)}.</p></div><button class="see" data-act="clearF">Clear all</button></div>
      <div class="filters-side filters-page" id="fpanel">${filterPanel()}</div>
      <div class="apply-bar"><button class="btn block lg" data-act="applyF">Apply · <span id="applyCount">${exploreList().length}</span>&nbsp;results</button></div>
    </div></section>`,
    after(p, root) { wireRange(root); }
  },

  /* ----- Search Results ----- */
  'results': {
    title: 'Search Results', layout: 'site', tab: 'explore', back: 'explore',
    html: () => {
      const ex = S.ex, one = ex.cats.size === 1 ? [...ex.cats][0] : null;
      const label = ex.query ? `“${esc(ex.query)}”` : one ? esc(one) : 'Results';
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['Explore', 'explore'], ['Search Results', 'results']])}
        <div class="page-head"><div><h1 class="h1">${label} (<span id="resCount">${exploreList().length}</span>)</h1><p class="lead">${one ? catById(one).blurb : 'Matching gear from riders near you.'}</p></div>
          <div class="row"><select class="field" id="sort" style="width:auto" aria-label="Sort">${['Recommended', 'Price: low to high', 'Price: high to low', 'Top rated'].map((o, i) => `<option value="${i}" ${ex.sort === i ? 'selected' : ''}>${o}</option>`).join('')}</select><a class="btn ghost" href="#/filters">${I('tune')}Filters</a></div></div>
        <div id="results">${resultsHtml()}</div>
      </div></section>`;
    },
    after(p, root) { $('#sort', root).addEventListener('change', e => { S.ex.sort = +e.target.value; refreshResults(true); }); }
  },

  /* ----- Gear Details ----- */
  'gear/:id': {
    title: 'Gear Details', layout: 'site', back: 'explore',
    html: ({ id }) => {
      const g = gearById(id); S.gear = g.id;
      const views = [g.cat, 'photo_camera', 'straighten', 'verified'];
      const similar = GEAR.filter(x => x.id !== g.id && (x.cat === g.cat || x.km < 2)).slice(0, 4);
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['Explore', 'explore'], [g.cat, 'explore'], [g.title, 'gear/' + g.id]])}
        <div class="detail">
          <div class="gallery">
            <div class="main" id="gmain">${heart(g.id)}${views.map((v, i) => art(g.cat, { icon: i ? v : undefined, cls: i ? '' : 'on', big: true })).join('')}</div>
            <div class="thumbs">${views.map((v, i) => `<button class="${i ? '' : 'on'}" data-act="gview" data-v="${i}" aria-label="View ${i + 1}">${art(g.cat, { icon: i ? v : undefined })}</button>`).join('')}</div>
          </div>
          <div class="buy">
            <span class="kicker">${esc(g.brand)} · ${esc(g.cat)}</span>
            <h1 class="h1" style="margin:10px 0 8px">${esc(g.title)}</h1>
            <div class="row" style="gap:14px;flex-wrap:wrap"><span class="rate" style="font-size:14px">${I('star')}<b style="color:var(--ink)">${g.rating}</b>&nbsp;(${g.reviews} reviews)</span><span class="small">${I('location_on')} ${g.km} km · ${esc(g.area)}</span></div>
            <div class="row" style="margin:18px 0;align-items:baseline;gap:6px"><span class="price">${rs(g.price)}</span><span class="muted">/ day</span><span class="sp"></span><span class="pill ok">Available</span></div>
            <div class="owner">${avatarImg(52)}<div style="flex:1;min-width:0"><b>${esc(g.owner)}</b><div class="small">Owner · replies in ~10 min</div></div><button class="btn ghost sm" data-act="chat" data-v="${esc(g.owner)}">${I('chat_bubble')}Message</button></div>
            <h2 class="h3" style="margin:22px 0 10px">Size</h2>${chips(['S', 'M', 'L', 'XL'], S.size, 'size')}
            <h2 class="h3" style="margin:22px 0 10px">Availability · Jan 2026</h2>
            <div class="chips">${['MON', 'TUE', 'WED', 'THU', 'FRI'].map((d, i) => `<button class="chip day ${S.day === i ? 'on' : ''}" data-act="avail" data-v="${i}" ${i === 2 ? 'disabled title="Booked"' : ''}>${d}<b>${21 + i}</b></button>`).join('')}</div>
            <p class="small" style="margin-top:8px">Pick a day to start your rental. Wed 23rd is booked.</p>
            <button class="btn block lg desk-only" style="margin-top:22px" data-act="rent">Rent Now${I('arrow_forward', 'slide')}</button>
            <p class="small desk-only" style="text-align:center;margin-top:10px">You won’t be charged until the owner confirms.</p>
          </div>
        </div>
        <div class="detail" style="margin-top:44px"><div>
          <h2 class="h2" style="margin-bottom:12px">About this gear</h2><p class="lead">${esc(g.desc)}</p>
          <div class="specs" style="margin-top:18px">${g.specs.map(([k, v]) => `<div class="spec"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
        </div><div></div></div>
        ${similar.length ? `<div class="sec-head" style="margin-top:56px" data-reveal><h2 class="h2">You might also like</h2><a class="see" href="#/explore">See all${I('arrow_forward')}</a></div><div class="cards two-mob">${similar.map(gcard).join('')}</div>` : ''}
      </div></section>
      <div class="sticky-cta"><div><div class="p">${rs(g.price)}<span class="small"> / day</span></div><div class="small">Size ${S.size} · from ${21 + S.day} Jan</div></div><span class="sp"></span><button class="btn" data-act="rent">Rent Now</button></div>`;
    }
  },

  /* ----- Rental Details ----- */
  'checkout': {
    title: 'Rental Details', layout: 'site', back: true, auth: true,
    html: () => {
      const p = price(), g = p.g;
      return `<section class="page"><div class="wrap">
        ${stepper(['Rental details', 'Payment', 'Confirmed'], 0)}
        <div class="checkout"><div>
          <h1 class="h1" style="margin-bottom:22px">Rental Details</h1>
          <div class="stack" style="gap:24px">
            <div><h2 class="h3" style="margin-bottom:10px">Select Dates</h2>
              <div class="date-row"><label class="field">${I('calendar_today')}<input type="date" id="from" value="${S.from}" aria-label="Start date"></label>${I('arrow_forward')}<label class="field">${I('event')}<input type="date" id="to" value="${S.to}" aria-label="End date"></label></div>
              <p class="small" style="margin-top:8px">${fmtDate(S.from)} → ${fmtDate(S.to)} · <b class="accent">${p.d} day${p.d > 1 ? 's' : ''}</b></p></div>
            <div><h2 class="h3" style="margin-bottom:10px">Select Size</h2>${chips(['S', 'M', 'L', 'XL'], S.size, 'size')}</div>
            <div><h2 class="h3" style="margin-bottom:10px">Pick-Up Location</h2>
              <select class="field" id="pickup" aria-label="Pick-up location">${['Koramangala, Bengaluru', 'Indiranagar, Bengaluru', 'HSR Layout, Bengaluru', 'Doorstep delivery (+₹150)'].map(o => `<option ${o === S.pickup ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
            <div class="panel row" style="gap:14px;align-items:flex-start">${I('shield', 'accent')}<div><b>Protected rental</b><p class="small" style="margin-top:2px">Your deposit is held by REVNT and refunded within 48 hours of return.</p></div></div>
          </div>
        </div>
        <aside class="summary card pad"><div class="item">${art(g.cat)}<div><b>${esc(g.title)}</b><div class="small">Size ${S.size} · ${esc(g.owner)}</div></div></div>
          <h2 class="h3" style="margin-bottom:6px">Price Break-up</h2>${breakdown(p)}
          <a class="btn block lg" style="margin-top:18px" href="#/payment">Continue${I('arrow_forward', 'slide')}</a></aside>
        </div></div></section>`;
    },
    after(p, root) {
      ['from', 'to'].forEach(k => $('#' + k, root).addEventListener('change', e => { S[k] = e.target.value; if (S.to <= S.from) toast('End date must be after the start date', 'error'); render(); }));
      $('#pickup', root).addEventListener('change', e => { S.pickup = e.target.value; render(); });
    }
  },

  /* ----- Payment ----- */
  'payment': {
    title: 'Payment', layout: 'site', back: true, auth: true,
    html: () => {
      const p = price(), g = p.g;
      return `<section class="page"><div class="wrap">
        ${stepper(['Rental details', 'Payment', 'Confirmed'], 1)}
        <div class="checkout"><div>
          <h1 class="h1" style="margin-bottom:22px">Payment Methods</h1>
          <div class="stack" role="radiogroup" style="gap:10px">${[['upi', 'qr_code_2', 'UPI', 'GPay, PhonePe, Paytm'], ['card', 'credit_card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay'], ['wallet', 'account_balance_wallet', 'Wallet', 'Balance ₹1,240'], ['other', 'payments', 'Other Methods', 'Net banking, pay later']].map(([k, ic, l, s]) =>
            `<button class="pay-opt ${S.pay === k ? 'on' : ''}" role="radio" aria-checked="${S.pay === k}" data-act="pay" data-v="${k}">${I(ic)}<span><b>${l}</b><span class="small" style="display:block">${s}</span></span><span class="radio"></span></button>`).join('')}</div>
          <div class="collapse ${S.pay === 'upi' ? 'open' : ''}"><div><label class="label" for="upi" style="margin-top:18px">UPI ID</label><input class="field" id="upi" value="ayushroy@okaxis"></div></div>
          <div class="collapse ${S.pay === 'card' ? 'open' : ''}"><div><div class="grid2" style="margin-top:18px"><div><label class="label" for="cn">Card number</label><input class="field" id="cn" inputmode="numeric" placeholder="1234 5678 9012 3456"></div><div class="grid2"><div><label class="label" for="ce">Expiry</label><input class="field" id="ce" placeholder="MM/YY"></div><div><label class="label" for="cv">CVV</label><input class="field" id="cv" inputmode="numeric" placeholder="123"></div></div></div></div></div>
        </div>
        <aside class="summary card pad"><div class="item">${art(g.cat)}<div><b>${esc(g.title)}</b><div class="small">${fmtDate(S.from, false)} – ${fmtDate(S.to, false)} · ${esc(S.pickup.split(',')[0].replace(/ \(.*/, ''))}</div></div></div>
          <h2 class="h3" style="margin-bottom:6px">Price Details</h2>${breakdown(p)}
          <button class="btn block lg" style="margin-top:18px" data-act="payNow">${I('lock')}Pay ${rs(p.total)}</button>
          <p class="small" style="text-align:center;margin-top:10px">Demo checkout. No real payment is made.</p></aside>
        </div></div></section>`;
    }
  },

  /* ----- Renting Confirmed ----- */
  'confirmed': {
    title: 'Renting Confirmed', layout: 'site',
    html: () => {
      const r = S.rentals[0], g = gearById(r.gear);
      return `<section class="celebrate"><canvas id="confetti"></canvas>
        ${checkAnim()}<h1 class="h1">Booking Confirmed!</h1><p class="lead">Your gear is reserved.</p>
        <div class="receipt card pad"><div class="row" style="gap:14px">${art(g.cat, {}).replace('class="art', 'style="width:60px;height:60px;border-radius:14px;flex:none" class="art')}<div style="flex:1"><b>${esc(g.title)}</b><div class="small">${r.from} – ${r.to} · Pick-up ${esc(r.pickup)}</div></div><span class="pill">Upcoming</span></div></div>
        <div class="acts"><a class="btn lg" href="#/rentals">View Rental Details</a><a class="btn lg ghost" href="#/home">Go to Home</a></div>
        ${mountains()}<h2 class="h2" style="margin-top:14px;animation:fadeUp .6s 1.2s both">See you on the Ride!</h2><p class="tagline">#RideWithREVNT</p></section>`;
    },
    after(p, root) { confetti($('#confetti', root)); }
  },

  /* ----- My Rentals ----- */
  'rentals': {
    title: 'My Rentals', layout: 'site', tab: 'profile', auth: true,
    html: () => {
      const L = S.rentals.filter(r => r.status === S.rentTab);
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['Profile', 'profile'], ['My Rentals', 'rentals']])}
        <div class="page-head"><h1 class="h1">My Rentals</h1>${seg(['Upcoming', 'Active', 'Completed'], S.rentTab, 'rtab')}</div>
        <div class="dash-grid">${L.map((r, i) => { const g = gearById(r.gear); return `<a class="card lcard" href="#/gear/${g.id}" data-reveal style="--d:${i}">${art(g.cat)}<div class="info"><b>${esc(g.name)}</b><span class="small">${I('date_range')} ${r.from} – ${r.to}</span><span class="small">${I('location_on')} Pick-up: ${esc(r.pickup)}</span></div><span class="pill ${r.status === 'Active' ? 'ok' : r.status === 'Completed' ? 'mute' : ''}">${r.status}</span></a>`; }).join('')
          || `<div class="empty">${I('two_wheeler')}No ${S.rentTab.toLowerCase()} rentals yet.<div style="margin-top:14px"><a class="btn sm" href="#/explore">Find gear</a></div></div>`}</div>
      </div></section>`;
    }
  },

  /* ----- List Gear wizard ----- */
  'list': {
    title: 'List Gear', layout: 'site', tab: 'list', auth: true,
    html: () => wizShell(0, 'What are you Listing?', 'Pick the category that fits best.',
      `<div class="cat-pick">${[['Helmets', 'sports_motorsports'], ['Jackets', 'apparel'], ['Pants', 'checkroom'], ['Gloves', 'pan_tool'], ['Boots', 'hiking'], ['Protection', 'shield'], ['Weather Gear', 'weather_hail'], ['Accessories', 'backpack']].map(([l, ic], i) =>
        `<button class="${S.listing.cat === l ? 'on' : ''}" data-act="lcat" data-v="${l}" data-reveal style="--d:${i}"><span class="icon-circ">${I(ic)}</span>${l}</button>`).join('')}</div>`,
      `<a class="btn lg" href="#/list/photos">Continue${I('arrow_forward', 'slide')}</a>`)
  },
  'list/photos': {
    title: 'Add Photos', layout: 'site', back: true, auth: true,
    html: () => {
      const P = S.listing.photos;
      return wizShell(1, 'Add Photos', 'Good light and a plain background help renters trust your listing.',
        `<label class="upload" id="drop" for="upl">${P[0] ? `<img src="${P[0]}" alt="Cover photo">` : `${I('add_a_photo')}<b>Upload Photos</b><span class="small">Drag images here or click. Add up to 10 photos.</span>`}</label>
        <input type="file" id="upl" class="sr" accept="image/*" multiple>
        <div class="thumbs-row">${[1, 2, 3, 4].map(i => P[i] ? `<div><img src="${P[i]}" alt=""></div>` : `<label for="upl">${I('add')}</label>`).join('')}</div>
        <p class="small" style="margin-top:10px">${P.length ? `${P.length} photo${P.length > 1 ? 's' : ''} added. The first one is your cover.` : 'No photos yet. You can also add them later.'}</p>`,
        `<a class="btn lg" href="#/list/info">Continue${I('arrow_forward', 'slide')}</a>`);
    },
    after(p, root) { wireFiles($('#upl', root), url => { if (S.listing.photos.length < 10) S.listing.photos.push(url); render(); }, true, $('#drop', root)); }
  },
  'list/info': {
    title: 'Gear Information', layout: 'site', back: true, auth: true,
    html: () => {
      const L = S.listing;
      return wizShell(2, 'Gear Information', 'Tell renters exactly what they’re getting.',
        `<div class="stack" style="gap:18px">
          <div><label class="label" for="gi-name">Gear Name</label><input class="field" id="gi-name" data-bind="name" value="${esc(L.name)}"></div>
          <div class="grid2"><div><label class="label" for="gi-brand">Gear Brand</label><input class="field" id="gi-brand" data-bind="brand" value="${esc(L.brand)}"></div><div><label class="label" for="gi-model">Gear Model</label><input class="field" id="gi-model" data-bind="model" value="${esc(L.model)}"></div></div>
          <div><label class="label" for="gi-desc">Gear Description</label><textarea class="field" id="gi-desc" data-bind="desc" placeholder="Write a description... size, condition, what’s included">${esc(L.desc)}</textarea></div></div>`,
        `<button class="btn lg" data-act="gearInfo">Continue${I('arrow_forward', 'slide')}</button>`);
    },
    after(p, root) { wireBind(root); }
  },
  'list/pricing': {
    title: 'Pricing and Availability', layout: 'site', back: true, auth: true,
    html: () => {
      const L = S.listing;
      const first = new Date('2026-02-01T00:00').getDay();
      return wizShell(3, 'Rental Pricing', 'Most helmets on REVNT rent for ₹400–₹900 a day.',
        `<div class="stack" style="gap:18px">
          <div class="grid2"><div><label class="label" for="pr-day">Per Day</label><label class="field">${I('currency_rupee')}<input id="pr-day" data-bind="perDay" type="number" inputmode="numeric" value="${L.perDay}"></label></div>
            <div><label class="label" for="pr-week">Per Week <span class="small">(optional)</span></label><label class="field">${I('currency_rupee')}<input id="pr-week" data-bind="perWeek" type="number" inputmode="numeric" value="${L.perWeek}" placeholder="e.g. 2800"></label></div></div>
          <div><label class="label" for="pr-dep">Security Deposit</label><label class="field">${I('savings')}<input id="pr-dep" data-bind="deposit" type="number" inputmode="numeric" value="${L.deposit}"></label></div>
          <div><h2 class="h3" style="margin:6px 0 4px">Availability</h2><p class="small">February 2026 · click the dates you’re <b>not</b> available${L.blocked.size ? ` · <b class="accent">${L.blocked.size} blocked</b>` : ''}</p>
            <div class="cal">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="dow">${d}</span>`).join('')}${'<span></span>'.repeat(first)}${Array.from({ length: 28 }, (_, i) => `<button class="${L.blocked.has(i + 1) ? 'x' : ''}" data-act="block" data-v="${i + 1}" aria-pressed="${L.blocked.has(i + 1)}">${i + 1}</button>`).join('')}</div></div></div>`,
        `<button class="btn lg" data-act="pricing">Continue${I('arrow_forward', 'slide')}</button>`);
    },
    after(p, root) { wireBind(root); }
  },
  'list/review': {
    title: 'Review Listing', layout: 'site', back: true, auth: true,
    html: () => {
      const L = S.listing;
      return wizShell(4, 'Review Listing', 'Check everything before it goes live.',
        `<div class="card pad">${[['Category', L.cat], ['Name', L.name], ['Brand', L.brand], ['Model', L.model], ['Price', `${rs(L.perDay)} / day${L.perWeek ? ` · ${rs(L.perWeek)} / week` : ''}`], ['Deposit', rs(L.deposit)], ['Condition', 'Like New'], ['Location', 'Koramangala'], ['Photos', L.photos.length || 'None yet'], ['Blocked dates', L.blocked.size ? [...L.blocked].sort((a, b) => a - b).map(d => d + ' Feb').join(', ') : 'None']].map(([k, v]) => `<div class="kv"><span>${k}</span><b style="text-align:right">${esc(v)}</b></div>`).join('')}</div>
        ${L.desc ? `<p class="lead" style="margin-top:16px">${esc(L.desc)}</p>` : ''}`,
        `<button class="btn lg" data-act="publish">${I('rocket_launch')}Publish Listing</button>`);
    }
  },
  'list/live': {
    title: 'Listing Live', layout: 'site',
    html: () => `<section class="celebrate"><canvas id="confetti"></canvas>
      ${checkAnim()}<h1 class="h1">Your Listing is Live!</h1><p class="lead">Start receiving rental requests.</p>
      <div class="receipt" style="width:min(300px,100%)">${previewCard()}</div>
      <div class="acts"><a class="btn lg" href="#/listings">View Listing</a><a class="btn lg ghost" href="#/home">Go to Home</a></div>
      ${mountains()}<h2 class="h2" style="margin-top:14px;animation:fadeUp .6s 1.2s both">Get Ready for Requests</h2><p class="tagline">#RideWithREVNT</p></section>`,
    after(p, root) { confetti($('#confetti', root)); }
  },

  /* ----- My Listings ----- */
  'listings': {
    title: 'My Listings', layout: 'site', tab: 'profile', auth: true,
    html: () => {
      const L = S.myListings.filter(l => l.status === S.listTab), n = S.requests.filter(r => r.status === 'New').length;
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['Profile', 'profile'], ['My Listings', 'listings']])}
        <div class="page-head"><div><h1 class="h1">My Listings</h1><p class="lead">${S.myListings.filter(l => l.status === 'Active').length} active · ${n} new request${n === 1 ? '' : 's'}</p></div>
          <div class="row" style="flex-wrap:wrap">${seg(['Active', 'Pending', 'Expired'], S.listTab, 'ltab')}<a class="btn" href="#/requests">${I('inbox')}Requests${n ? ` (${n})` : ''}</a></div></div>
        <div class="dash-grid">${L.map((l, i) => `<div class="card lcard" data-reveal style="--d:${i}">${art(l.cat, { img: l.photo })}<div class="info"><b>${esc(l.title)}</b><span><b class="accent">${rs(l.price)}</b> / day</span><span class="small">${l.status === 'Active' ? '6 rentals · ★ 4.8' : l.status === 'Pending' ? 'Under review, usually within 2 hours' : 'Ended 12th Aug'}</span></div><span class="pill ${l.status === 'Active' ? 'ok' : l.status === 'Expired' ? 'mute' : ''}">${l.status}</span></div>`).join('')
          || `<div class="empty">${I('inventory_2')}Nothing ${S.listTab.toLowerCase()} right now.</div>`}
          <a class="card lcard" href="#/list" style="border-style:dashed;justify-content:center;min-height:112px;color:var(--brand);font-weight:700">${I('add')}List new gear</a></div>
      </div></section>`;
    }
  },

  /* ----- Rental Requests + Request Details ----- */
  'requests': {
    title: 'Rental Requests', layout: 'site', tab: 'alerts', back: 'listings', auth: true,
    html: () => {
      const L = S.requests.filter(r => r.status === S.reqTab);
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['My Listings', 'listings'], ['Rental Requests', 'requests']])}
        <div class="page-head"><h1 class="h1">Rental Requests</h1>${seg(['New', 'Accepted', 'Declined'], S.reqTab, 'qtab')}</div>
        <div class="dash-grid">${L.map((r, i) => `<div class="card req" id="req${r.id}" data-reveal style="--d:${i}">
          <div class="row" style="gap:14px">${avatarImg(52)}<div style="flex:1"><b style="font-size:16px">${r.who}</b><div class="rate small">${I('star')}${r.rating} · ${r.count} rentals</div></div><button class="icon-btn" data-act="chat" data-v="${r.who}" aria-label="Message ${r.who}">${I('chat_bubble')}</button></div>
          <div class="row" style="justify-content:space-between;flex-wrap:wrap"><b>${esc(r.gear)}</b><span class="dates">${r.from}${I('arrow_forward')}${r.to}</span></div>
          <div class="msg">${esc(r.msg)}</div>
          <div class="row" style="justify-content:space-between"><span class="small">You earn</span><b class="accent" style="font-size:18px">${rs(r.total - 1100)}</b></div>
          <div class="row">${r.status === 'New' ? '<span class="pill">New</span>' : `<span class="pill ${r.status === 'Accepted' ? 'ok' : 'mute'}">${r.status}</span>`}<span class="sp"></span><a class="btn sm" href="#/requests/${r.id}">View Details${I('arrow_forward', 'slide')}</a></div>
        </div>`).join('') || `<div class="empty">${I('inbox')}No ${S.reqTab.toLowerCase()} requests.</div>`}</div>
      </div></section>`;
    }
  },

  'requests/:id': {
    title: 'Request Details', layout: 'site', tab: 'alerts', back: 'requests', auth: true,
    html: ({ id }) => {
      const r = S.requests.find(x => x.id === +id) || S.requests[0];
      return `<section class="page"><div class="wrap narrow">
        ${crumbs([['My Listings', 'listings'], ['Rental Requests', 'requests'], [r.who, 'requests/' + r.id]])}
        <div class="card pad req-detail">
          <div class="row" style="gap:16px">${avatarImg(72)}<div style="flex:1"><h1 class="h2">${esc(r.who)}</h1><div class="rate">${I('star')}${r.rating} · ${r.count} rentals · verified rider</div></div><button class="btn ghost sm" data-act="chat" data-v="${esc(r.who)}">${I('chat_bubble')}Message</button></div>
          <hr class="rule">
          <div class="kv"><span>Dates</span><b>${r.from} – ${r.to}</b></div>
          <div class="kv"><span>Gear</span><b>${esc(r.gear)}</b></div>
          <div class="kv"><span>Renter pays</span><b>${rs(r.total)}</b></div>
          <div class="kv"><span>You earn</span><b class="accent">${rs(r.total - 1100)}</b></div>
          <h2 class="h3" style="margin:18px 0 8px">Message</h2>
          <div class="bubble them" style="max-width:100%">${esc(r.msg)}</div>
          ${r.status === 'New'
            ? `<div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:22px"><button class="btn lg" data-act="decide" data-id="${r.id}" data-v="Accepted">${I('check')}Accept</button><button class="btn lg ghost" data-act="decide" data-id="${r.id}" data-v="Declined">Decline</button></div>`
            : `<p class="lead" style="margin-top:18px">You <b class="${r.status === 'Accepted' ? '' : ''}">${r.status.toLowerCase()}</b> this request.</p>`}
        </div></div></section>`;
    }
  },

  /* ----- Earnings ----- */
  'earnings': {
    title: 'Earnings', layout: 'site', tab: 'profile', auth: true,
    html: () => {
      const [m, v] = EARNINGS[S.bar], prev = S.bar ? EARNINGS[S.bar - 1][1] : 0, up = prev ? Math.round((v - prev) / prev * 100) : 0;
      return `<section class="page"><div class="wrap">
        ${crumbs([['Home', 'home'], ['Profile', 'profile'], ['Earnings', 'earnings']])}
        <div class="page-head"><div><span class="kicker">Total Earnings · ${m} 2026</span><div class="metric" style="margin-top:10px" data-count="${v}" data-pre="₹" data-dur="900">${rs(v)}</div>
          ${up ? `<p class="small" style="margin-top:8px"><b style="color:var(--ok)">▲ ${up}%</b> vs ${EARNINGS[S.bar - 1][0]}</p>` : ''}</div>
          <button class="btn dark" data-act="toast" data-msg="₹12,500 will reach your bank in 1–2 days" data-icon="account_balance">${I('account_balance')}Withdraw</button></div>
        <div class="card pad"><div class="chart" role="group" aria-label="Monthly earnings">${EARNINGS.map(([mm, vv], i) => `<button class="${S.bar === i ? 'on' : ''}" data-act="bar" data-v="${i}" style="--i:${i}" aria-label="${mm}: ${rs(vv)}"><span class="tip">${rs(vv)}</span><i style="height:${Math.round(vv / 12500 * 100)}%"></i>${mm}</button>`).join('')}</div></div>
        <div class="sec-head" style="margin-top:36px"><h2 class="h2">Recent Transactions</h2><button class="see" data-act="txAll">${S.txAll ? 'Show less' : 'View All'}${I(S.txAll ? 'expand_less' : 'arrow_forward')}</button></div>
        <div class="card table-wrap"><table class="table"><thead><tr><th>Amount</th><th>Gear</th><th class="desk-only">Rented by</th><th>Date</th></tr></thead><tbody>
          ${(S.txAll ? TRANSACTIONS : TRANSACTIONS.slice(0, 3)).map(([a, gname, who, d], i) => `<tr style="animation-delay:${i * 60}ms"><td class="amt">+ ₹${a}</td><td>${gname}</td><td class="desk-only">${who}</td><td class="small">${d}</td></tr>`).join('')}</tbody></table></div>
      </div></section>`;
    }
  },

  /* ----- Messages + Chat ----- */
  'messages': { title: 'Messages', layout: 'site', tab: 'profile', auth: true, noFooter: true, html: () => inbox(null), after: (p, root) => inboxAfter(root) },
  'messages/:who': { title: 'Chat', layout: 'site', back: 'messages', auth: true, noFooter: true, html: ({ who }) => inbox(who), after: ({ who }, root) => inboxAfter(root, who) },

  /* ----- Notifications ----- */
  'notifications': {
    title: 'Notifications', layout: 'site', tab: 'alerts', auth: true,
    html: () => `<section class="page"><div class="wrap narrow">
      <div class="page-head"><h1 class="h1">Notifications</h1><button class="see" data-act="toast" data-msg="All caught up">Mark all read</button></div>
      <div class="card" style="padding:6px">${NOTIFS.map(([ic, t, d, time, to], i) => `<a class="notif" href="#/${to}" data-reveal style="--d:${i}"><span class="icon-circ">${I(ic)}</span><span class="t"><b>${t}</b><span>${d}</span></span><time>${time}</time></a>`).join('')}</div>
    </div></section>`
  },

  /* ----- Profile ----- */
  'profile': {
    title: 'Profile', layout: 'site', tab: 'profile', auth: true,
    html: () => `<section class="page"><div class="wrap narrow">
      <div class="profile-hero">${myAvatar(108)}<div style="flex:1;min-width:200px"><h1 class="h1">${esc(S.name)}</h1><p class="muted">${esc(S.style)} rider · ${esc(S.location)} · member since 2025</p></div><a class="btn ghost" href="#/setup">${I('edit')}Edit Profile</a></div>
      <div class="pstats"><div><b data-count="${S.rentals.length + 11}">0</b><span>rentals</span></div><div><b data-count="${S.myListings.length}">0</b><span>listings</span></div><div><b>4.9</b><span>rating</span></div></div>
      <div class="tiles">${[['badge', 'Personal Information', 'Name, phone, riding style', 'setup'], ['straighten', 'My sizes', 'Helmet M · Jacket L · Gloves M', '@sizes'], ['history', 'Rentals History', `${S.rentals.length} bookings`, 'rentals'], ['inventory_2', 'Gears Listed', `${S.myListings.length} items`, 'listings'], ['trending_up', 'Earnings', '₹12,500 this month', 'earnings'], ['chat', 'Messages', `${S.unread.size} unread`, 'messages'], ['settings', 'Settings', 'Theme, payments, help', 'settings']].map(([ic, t, s, to], i) =>
        to === '@sizes' ? `<button class="tile" data-act="toast" data-msg="Sizes saved: Helmet M · Jacket L · Gloves M" data-reveal style="--d:${i}"><span class="icon-circ">${I(ic)}</span><span><b>${t}</b><span class="s">${s}</span></span></button>`
          : `<a class="tile" href="#/${to}" data-reveal style="--d:${i}"><span class="icon-circ">${I(ic)}</span><span><b>${t}</b><span class="s">${s}</span></span>${I('chevron_right', 'go')}</a>`).join('')}</div>
    </div></section>`
  },

  /* ----- Settings ----- */
  'settings': {
    title: 'Settings', layout: 'site', tab: 'profile', back: 'profile', auth: true,
    html: () => `<section class="page"><div class="wrap narrow">
      ${crumbs([['Profile', 'profile'], ['Settings', 'settings']])}
      <h1 class="h1" style="margin-bottom:24px">Settings</h1>
      <h2 class="h3" style="margin-bottom:12px">Appearance</h2>
      <div class="theme-opts" role="radiogroup">${[['light', 'light_mode', 'Light'], ['system', 'contrast', 'System'], ['dark', 'dark_mode', 'Dark']].map(([k, ic, l]) => `<button class="${theme === k ? 'on' : ''}" role="radio" aria-checked="${theme === k}" data-act="theme" data-v="${k}">${I(ic)}${l}</button>`).join('')}</div>
      <div class="tiles">${[['two_wheeler', 'Your Trips', 'rentals'], ['credit_card', 'Payment Methods', 'payment'], ['support_agent', 'Help and Support', 'help'], ['gavel', 'Terms and Conditions', 'terms']].map(([ic, t, to]) => `<a class="tile" href="#/${to}"><span class="icon-circ">${I(ic)}</span><b>${t}</b>${I('chevron_right', 'go')}</a>`).join('')}
        <a class="tile danger" href="#/logout"><span class="icon-circ">${I('logout')}</span><b>Log Out</b>${I('chevron_right', 'go')}</a></div>
    </div></section>`
  },

  /* ----- Help and Support ----- */
  'help': {
    title: 'Help and Support', layout: 'site', tab: 'profile', back: 'settings',
    html: () => `<section class="page"><div class="wrap narrow">
      <span class="kicker">Support</span><h1 class="h1" style="margin:10px 0 18px">Help and Support</h1>
      <label class="field">${I('search')}<input id="helpq" type="search" placeholder="Search Help..." value="${esc(S.helpQ)}" aria-label="Search help"></label>
      <div class="stack" id="faqs" style="gap:10px;margin-top:20px">${faqHtml()}</div>
      <div class="panel row" style="margin-top:28px;gap:16px;flex-wrap:wrap"><span class="icon-circ">${I('support_agent')}</span><div style="flex:1;min-width:180px"><b>Still stuck?</b><p class="small">Our team replies in about 5 minutes, 8am–11pm.</p></div><button class="btn" data-act="chat" data-v="REVNT Support">Chat with us</button></div>
    </div></section>`,
    after(p, root) { $('#helpq', root).addEventListener('input', e => { S.helpQ = e.target.value; $('#faqs').innerHTML = faqHtml(); }); }
  },

  /* ----- Terms and Conditions ----- */
  'terms': {
    title: 'Terms and Conditions', layout: 'site', back: true,
    html: () => `<section class="page terms"><div class="wrap narrow">
      <span class="kicker">Legal · Updated Jan 2026</span><h1 class="h1" style="margin:10px 0 22px">Terms and Conditions</h1>
      <ol>
        <li><b>Acceptance of Terms.</b> By creating an account you agree to rent and list gear under these terms.</li>
        <li><b>Gear Condition.</b> Owners must list gear that is safe to ride in. Helmets involved in a crash may not be listed.</li>
        <li><b>Security Deposit.</b> Held by REVNT for the rental period and returned within 48 hours of a clean return.</li>
        <li><b>Late Returns.</b> Each late day is charged at the daily rate plus ₹100.</li>
        <li><b>Damage.</b> Renters pay for damage beyond normal wear, assessed from the check-in and check-out photos.</li>
        <li><b>Cancellations.</b> Free up to 24 hours before pick-up; 50% of the first day after that.</li>
      </ol>
      <button class="btn lg" style="margin-top:28px" data-act="acceptTerms">${I('check')}I Agree</button>
    </div></section>`
  },

  /* ----- Logout ----- */
  'logout': {
    title: 'Logout', layout: 'site', back: 'settings',
    html: () => `<section class="celebrate"><div class="card pad logout-card">
      <div class="icon-circ big-ic">${I('logout')}</div>
      <h1 class="h2" style="margin-top:18px">Are you sure you want to logout?</h1>
      <p class="muted" style="margin-top:8px">You will need to sign-in again to access your account and preferences.</p>
      <div class="stack" style="margin-top:26px;gap:10px"><button class="btn block lg danger-btn" data-act="logout">Logout</button><button class="btn block lg ghost" data-act="back">Cancel</button></div>
    </div></section>`
  },

  /* ----- All screens (sitemap of every Figma frame) ----- */
  'screens': {
    title: 'All Screens', layout: 'site',
    html: () => `<section class="page"><div class="wrap">
      <div class="page-head"><div><span class="kicker">Figma → Website</span><h1 class="h1" style="margin-top:10px">All Screens</h1><p class="lead">Every wireframe from the REVNT Figma file, as a live page.</p></div>
        ${S.signedIn ? '<span class="pill ok">Signed in as demo user</span>' : `<button class="btn" data-act="demoSignIn">${I('bolt')}Sign in as demo user</button>`}</div>
      <div class="screens-grid">${SCREEN_MAP.map(([grp, items], gi) => `<div class="card pad" data-reveal style="--d:${gi}"><h2 class="h3" style="margin-bottom:10px">${grp}</h2><ol class="screen-list">${items.map(([name, path]) => `<li><a href="#/${path}"><span>${name}</span>${I('arrow_outward')}</a></li>`).join('')}</ol></div>`).join('')}</div>
    </div></section>`
  }
};

const SCREEN_MAP = [
  ['Onboarding', [['Splash Screen', 'splash'], ['Onboarding 1', 'onboarding/1'], ['Onboarding 2', 'onboarding/2'], ['Onboarding 3', 'onboarding/3'], ['Sign-in', 'signin'], ['Register', 'register'], ['Verification', 'verify'], ['Personalization', 'setup'], ['Choose Purpose', 'purpose']]],
  ['Renting gear', [['Main App - Home', 'home'], ['Explore', 'explore'], ['Filters', 'filters'], ['Search Results', 'results'], ['Gear Details', 'gear/k5r'], ['Rental Details', 'checkout'], ['Payment', 'payment'], ['Renting Confirmed', 'confirmed'], ['My Rentals', 'rentals']]],
  ['Listing gear', [['List Gear', 'list'], ['Add Photos', 'list/photos'], ['Gear Information', 'list/info'], ['Pricing and Availability', 'list/pricing'], ['Review Listing', 'list/review'], ['Listing Live', 'list/live'], ['My Listings', 'listings'], ['Rental Requests', 'requests'], ['Request Details', 'requests/1']]],
  ['Account', [['Earnings', 'earnings'], ['Messages', 'messages'], ['Chat', 'messages/Ayush%20K.'], ['Notifications', 'notifications'], ['Profile', 'profile'], ['Settings', 'settings'], ['Help and Support', 'help'], ['Terms and Conditions', 'terms'], ['Logout', 'logout']]]
];

/* ---------- onboarding page factory (Onboarding 1–3) ---------- */
function onbPage(i) {
  return {
    title: `Onboarding ${i + 1}`, layout: 'bare',
    html: () => {
      const o = ONBOARDING[i];
      return `<div class="welcome">
        <div class="vis"><img class="photo" src="${o.img}" alt="${esc(o.alt)}">${speedlines(8)}<div class="shade"></div>
          <a class="top" href="#/home" aria-label="REVNT home"><img src="${ASSETS.logo}" alt="REVNT"></a>
          <span class="counter">0${i + 1} <i>/ 03</i></span></div>
        <div class="copy">
          <div class="progress-dots">${ONBOARDING.map((_, j) => `<a href="#/onboarding/${j + 1}" aria-label="Slide ${j + 1}" class="${j === i ? 'on' : j < i ? 'done' : ''}"><i></i></a>`).join('')}</div>
          <div class="txt anim"><span class="kicker">${o.kicker}</span><h1 style="margin:12px 0">${o.title}</h1><p class="lead">${o.text}</p></div>
          <div class="row" style="gap:12px;flex-wrap:wrap">
            ${i < 2 ? `<a class="btn lg" href="#/onboarding/${i + 2}">Next${I('arrow_forward', 'slide')}</a><a class="btn lg ghost" href="#/signin">Skip</a>`
              : `<a class="btn lg" href="#/register">Get Started!${I('arrow_forward', 'slide')}</a><a class="btn lg ghost" href="#/signin">Sign in</a>`}
          </div>
          <a class="small link" style="align-self:flex-start;font-weight:500" href="#/home">Browse gear without an account</a>
        </div></div>`;
    },
    after(p, root) {
      const w = $('.welcome', root); let sx = null;
      w.addEventListener('pointerdown', e => { sx = e.clientX; }, { passive: true });
      w.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null;
        if (dx < -60) go(i < 2 ? `onboarding/${i + 2}` : 'register'); else if (dx > 60 && i > 0) go(`onboarding/${i}`); }, { passive: true });
    }
  };
}

/* ---------- inbox (Messages + Chat) ---------- */
function inbox(who) {
  const th = who ? (S.chats[who] || [['them', 'Hi! Is this still available?']]) : null;
  return `<div class="wrap"><div class="inbox ${who ? 'is-thread' : ''}">
    <div class="list"><h1 class="h2">Messages</h1>${CONTACTS.map(([n, t]) => { const c = S.chats[n]; const last = c ? c[c.length - 1][1] : 'Hi! Is this still available?';
      return `<a class="convo ${n === who ? 'on' : ''}" href="#/messages/${encodeURIComponent(n)}">${avatarImg(46)}<span class="t"><b>${n}</b><span>${esc(last)}</span></span><span style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="small">${t}</span>${S.unread.has(n) ? '<span class="dot"></span>' : ''}</span></a>`; }).join('')}</div>
    <div class="thread">${who ? `<div class="head">${avatarImg(42)}<div><b>${esc(who)}</b><div class="online">Active now</div></div><span class="sp"></span><a class="icon-btn" href="#/explore" aria-label="Browse their gear">${I('storefront')}</a></div>
      <div class="msgs" id="msgs">${th.map(([w, t]) => `<div class="bubble ${w}">${esc(t)}</div>`).join('')}</div>
      <form class="composer" id="composer"><label class="field">${I('mood')}<input id="msg" placeholder="Message" autocomplete="off" enterkeyhint="send" aria-label="Message"></label><button class="send" aria-label="Send">${I('send')}</button></form>`
      : `<div class="empty" style="margin:auto">${I('forum')}<b style="color:var(--ink)">Pick a conversation</b><p class="small">Chats with owners and renters show up here.</p></div>`}</div>
  </div></div>`;
}
function inboxAfter(root, who) {
  if (!who) return;
  S.unread.delete(who); renderChrome();
  const box = $('#msgs', root); box.scrollTop = box.scrollHeight;
  $('#composer', root).addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#msg', root), v = inp.value.trim(); if (!v) return;
    (S.chats[who] = S.chats[who] || [['them', 'Hi! Is this still available?']]).push(['me', v]);
    box.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(v)}</div><div class="typing" id="typing"><i></i><i></i><i></i></div>`);
    inp.value = ''; box.scrollTop = box.scrollHeight;
    setTimeout(() => {
      const r = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]; S.chats[who].push(['them', r]);
      const t = $('#typing'); if (t) { t.outerHTML = `<div class="bubble them">${esc(r)}</div>`; box.scrollTop = box.scrollHeight; }
    }, 1400);
  });
  if (HOVER) $('#msg', root).focus();
}
function faqHtml() {
  const q = S.helpQ.toLowerCase();
  const list = FAQ.map((f, i) => [f, i]).filter(([f]) => !q || (f[0] + f[1]).toLowerCase().includes(q));
  return list.map(([f, i]) => `<div class="acc ${S.faq === i ? 'open' : ''}"><button data-act="faq" data-v="${i}" aria-expanded="${S.faq === i}">${f[0]}${I('expand_more')}</button><div class="collapse ${S.faq === i ? 'open' : ''}"><div><p>${f[1]}</p></div></div></div>`).join('')
    || '<p class="muted">No answers match. Try “deposit” or “list”.</p>';
}
