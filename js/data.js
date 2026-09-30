/* REVNT — sample data and app state */

const ASSETS = {
  logo: 'assets/logo.png',
  avatar: 'assets/avatar.png',
  google: 'assets/google.svg',
  facebook: 'assets/facebook.svg'
};

const CATS = [
  { id: 'Helmets',     icon: 'sports_motorsports', tint: 'orange', blurb: 'Full-face, modular, open-face' },
  { id: 'Jackets',     icon: 'apparel',            tint: 'slate',  blurb: 'Mesh, leather, touring' },
  { id: 'Gloves',      icon: 'pan_tool',           tint: 'amber',  blurb: 'Summer, winter, track' },
  { id: 'Boots',       icon: 'hiking',             tint: 'olive',  blurb: 'Touring, racing, adventure' },
  { id: 'Pants',       icon: 'checkroom',          tint: 'plum',   blurb: 'Armoured, rain-proof' },
  { id: 'Accessories', icon: 'luggage',            tint: 'teal',   blurb: 'Luggage, comms, rain gear' }
];
const catById = id => CATS.find(c => c.id === id) || CATS[0];

/* product cut-outs by category (assets/products) */
const PRODUCTS = {
  Helmets: 'assets/products/helmet.webp', Jackets: 'assets/products/jacket.webp', Gloves: 'assets/products/gloves.webp',
  Boots: 'assets/products/boots.webp', Pants: 'assets/products/pants.webp', Accessories: 'assets/products/backpack.webp'
};

/* fx = colour variant of the shared category photo */
const GEAR = [
  { id: 'k5r', name: 'KSR Anomalistic Modular Helmet', title: 'KSR Anomalistic - 7V', brand: 'KSR', price: 500, cat: 'Helmets', rating: 4.8, reviews: 32, km: 2, owner: 'Ayush K.', area: 'Koramangala',
    desc: 'Modular flip-up helmet in wine red with an ECE 22.06 rating, clear visor and a drop-down sun shield. Sanitised after every rental.', specs: [['Certification', 'ECE 22.06'], ['Type', 'Modular flip-up'], ['Visor', 'Clear + drop-down tint'], ['Condition', 'Like new']] },
  { id: 'nhk', name: 'NHK Alonso Modular Helmet', title: 'NHK Alonso Blue', brand: 'NHK', price: 700, cat: 'Helmets', rating: 4.6, reviews: 18, km: 3.4, owner: 'Karan S.', area: 'HSR Layout', fx: 'hue-rotate(205deg) saturate(1.1)',
    desc: 'Modular touring helmet with a quick-release chin bar, wide eye-port and Bluetooth speaker pockets.', specs: [['Certification', 'DOT + ECE'], ['Type', 'Modular flip-up'], ['Visor', 'Clear, pinlock ready'], ['Condition', 'Good']] },
  { id: 'hjc', name: 'HJC Stealth Modular Helmet', title: 'HJC Stealth Black', brand: 'HJC', price: 900, cat: 'Helmets', rating: 4.9, reviews: 12, km: 5.1, owner: 'Riya M.', area: 'Indiranagar', fx: 'grayscale(1) brightness(.62) contrast(1.25)',
    desc: 'Gloss-black composite shell, very quiet at speed. Comes with a spare smoke visor.', specs: [['Certification', 'ECE 22.06'], ['Weight', '1,290 g'], ['Visor', 'Clear + smoke'], ['Condition', 'Like new']] },
  { id: 'dai', name: 'Rainbow Apex Leather Jacket', title: 'Rainbow Apex Leather', brand: 'Rainbow', price: 650, cat: 'Jackets', rating: 4.9, reviews: 41, km: 1.2, owner: 'Riya M.', area: 'Indiranagar',
    desc: 'Full-grain leather sports jacket with CE level 2 shoulder and elbow armour, stretch panels and a waist adjuster. Zips to matching pants.', specs: [['Armour', 'CE Level 2'], ['Material', 'Full-grain leather'], ['Back protector', 'Pocket ready'], ['Condition', 'Excellent']] },
  { id: 'ryn', name: 'Rainbow Street Leather Jacket', title: 'Rainbow Street', brand: 'Rainbow', price: 400, cat: 'Jackets', rating: 4.5, reviews: 27, km: 2.8, owner: 'Karan S.', area: 'HSR Layout', fx: 'sepia(.35) saturate(.8)',
    desc: 'Everyday leather riding jacket with CE armour and cuff zips. A good first jacket for city riders.', specs: [['Armour', 'CE Level 1'], ['Material', 'Leather'], ['Liner', 'Removable'], ['Condition', 'Good']] },
  { id: 'alp', name: 'Inbike Carbon Knuckle Gloves', title: 'Inbike Carbon Pro', brand: 'Inbike', price: 150, cat: 'Gloves', rating: 4.7, reviews: 22, km: 0.9, owner: 'Ayush K.', area: 'Koramangala',
    desc: 'Leather gauntlet gloves with carbon-fibre knuckle guards, palm sliders and touchscreen fingertips.', specs: [['Protection', 'Carbon knuckle'], ['Material', 'Goat leather'], ['Touchscreen', 'Yes'], ['Condition', 'Like new']] },
  { id: 'bbg', name: 'Inbike Tourer Gloves', title: 'Inbike Tourer', brand: 'Inbike', price: 120, cat: 'Gloves', rating: 4.3, reviews: 9, km: 4.2, owner: 'Dev P.', area: 'Jayanagar', fx: 'brightness(1.15) contrast(.9)',
    desc: 'Affordable full-gauntlet gloves for highway runs, with palm sliders and a velcro wrist strap.', specs: [['Protection', 'Palm sliders'], ['Material', 'Textile + leather'], ['Touchscreen', 'Yes'], ['Condition', 'Good']] },
  { id: 'tvs', name: 'Rideract Enjoy Race Boots', title: 'Rideract Enjoy Race', brand: 'Rideract', price: 300, cat: 'Boots', rating: 4.6, reviews: 15, km: 3.0, owner: 'Dev P.', area: 'Jayanagar',
    desc: 'CE-certified racing boots with hard shin plates, replaceable toe sliders and a full-length side zip.', specs: [['Height', 'Over-calf'], ['Certification', 'CE'], ['Closure', 'Side zip + velcro'], ['Condition', 'Good']] },
  { id: 'rai', name: 'Alpinestars Track v2 Pants', title: 'Alpinestars Track v2', brand: 'Alpinestars', price: 350, cat: 'Pants', rating: 4.4, reviews: 11, km: 2.2, owner: 'Ayush K.', area: 'Koramangala',
    desc: 'Perforated leather track pants with knee sliders, stretch panels and CE knee armour. Zips to most leather jackets.', specs: [['Armour', 'CE knee'], ['Knee sliders', 'Replaceable'], ['Fit', 'Sport'], ['Condition', 'Like new']] },
  { id: 'via', name: 'Key of Street Helmet Backpack', title: 'Key of Street Helmet Pack', brand: 'Key of Street', price: 250, cat: 'Accessories', rating: 4.8, reviews: 30, km: 1.7, owner: 'Riya M.', area: 'Indiranagar', views: 'assets/products/backpack-views.webp',
    desc: 'Hard-shell camo backpack that swallows a full-face helmet, with a laptop sleeve, bottle pocket and reflective strips.', specs: [['Capacity', '35 L'], ['Fits', 'Full-face helmet'], ['Reflective', 'Yes'], ['Condition', 'Excellent']] }
];
const gearById = id => GEAR.find(g => g.id === id) || GEAR[0];

const ONBOARDING = [
  { img: 'assets/rent.jpg', alt: 'Helmet, gloves, jacket and backpack on a ledge at sunset', icon: 'sports_motorsports', kicker: 'Rent', title: 'Rent Gear, Explore More', text: 'High quality riding gear, for riders like you. Pick it up near you, ride, return.' },
  { img: 'assets/lease.jpg', alt: 'Rider photographing his helmet to list it', icon: 'sell', kicker: 'List', title: 'List Your Own Gear',      text: 'Turn your gears into opportunities. That helmet on the shelf can pay for your next trip.' },
  { img: 'assets/both.jpg', alt: 'Rider resting beside his motorcycle at sunset', icon: 'groups', kicker: 'Ride', title: 'A Community of Riders',   text: 'Safe. Simple. Reliable. Verified riders, refundable deposits, and support that rides with you.' }
];

const PURPOSES = [
  ['rent', 'sports_motorsports', 'Rent Gear', 'Find and rent gear near you.'],
  ['lease', 'sell', 'Lease Gear', 'List your own gear and earn.'],
  ['both', 'sync_alt', 'Both', 'Rent and list gear.']
];

const BRANDS = ['KSR', 'Alpinestars', 'Rainbow', 'HJC', 'Rideract', 'Inbike', 'Key of Street', 'NHK', 'Rynox', 'Raida'];
const EARNINGS = [['Mar', 3200], ['Apr', 5100], ['May', 6400], ['Jun', 7800], ['Jul', 9200], ['Aug', 11000], ['Sep', 12500]];
const TRANSACTIONS = [
  ['2,000', 'KSR Helmet', 'Karan S.', '21st Jan'], ['1,500', 'Rainbow Jacket', 'Sneha R.', '18th Jul'], ['1,200', 'HJC Helmet', 'Arjun T.', '18th Jul'],
  ['900', 'Inbike Gloves', 'Dev P.', '2nd Jul'], ['2,400', 'Rainbow Street Jacket', 'Riya M.', '24th Jun']
];
const CONTACTS = [['Ayush K.', '2m'], ['Karan S.', '14m'], ['Riya M.', '1h'], ['Dev P.', '3h'], ['Sneha R.', '1d'], ['Arjun T.', '2d']];
const AUTO_REPLIES = ['Sounds good! See you at pick-up.', 'Can you share your helmet size?', 'Perfect, I’ll book it now.', 'Is the deposit refunded the same day?'];
const FAQ = [
  ['How to Rent Gear', 'Search or browse, open the gear, pick your size and dates, then pay. The owner confirms and you collect it at the pick-up point.'],
  ['How to List Gear', 'Click “List gear”, choose a category, add photos, describe the gear, set a daily price and deposit, then publish.'],
  ['Payments and Refunds', 'Deposits are refunded within 48 hours of return once the owner confirms the gear came back in the same condition.'],
  ['Damage and Disputes', 'Report damage within 24 hours with photos. REVNT support mediates and holds the deposit until it is resolved.']
];
const NOTIFS = [
  ['assignment_add', 'New Rental Requests', 'Karan S. and Riya M. want to rent your gear.', '2m', 'requests'],
  ['event_available', 'Bookings Confirmed', 'Your KSR Anomalistic booking for 21st Jan is confirmed.', '1h', 'rentals'],
  ['payments', 'Payments Received', '₹2,000 from Karan S. has reached your wallet.', '5h', 'earnings'],
  ['assignment_return', 'Return Requests', 'Dev P. is returning the Raida Tourer pants tomorrow.', '1d', 'rentals']
];

function freshState() {
  return {
    signedIn: false,
    fav: new Set(['nhk']), size: 'M', day: 0,
    from: '2026-01-21', to: '2026-01-25', pickup: 'Koramangala, Bengaluru', pay: 'upi',
    agreed: false, resendLeft: 30,
    purpose: 'rent', name: 'Ayush Roy', email: 'ayush@revnt.in', location: 'Bengaluru', style: 'Touring', photo: null,
    ex: { cats: new Set(), brands: new Set(), max: 2000, size: '', query: '', sort: 0 },
    rentals: [
      { gear: 'k5r', from: '21st Jan', to: '25th Jan', pickup: 'Koramangala', status: 'Upcoming' },
      { gear: 'dai', from: '28th Sep', to: '2nd Oct', pickup: 'Indiranagar', status: 'Active' },
      { gear: 'alp', from: '12th Aug', to: '14th Aug', pickup: 'HSR Layout', status: 'Completed' }
    ],
    rentTab: 'Upcoming',
    listing: { cat: 'Helmets', photos: [], name: 'KSR Anomalistic - 7V', brand: 'KSR', model: 'Anomalistic - 7V', desc: '', perDay: 500, perWeek: '', deposit: 1000, blocked: new Set() },
    myListings: [
      { title: 'HJC RPHA 11 Helmet', price: 900, status: 'Active', cat: 'Helmets' },
      { title: 'Alpinestars Track v2 Pants', price: 350, status: 'Pending', cat: 'Pants' },
      { title: 'Inbike Tourer Gloves', price: 120, status: 'Expired', cat: 'Gloves' }
    ],
    listTab: 'Active',
    requests: [
      { id: 1, who: 'Karan S.', rating: 4.8, count: 12, gear: 'KSR Anomalistic - 7V', from: '21st Jan', to: '25th Jan', total: 3100, msg: 'Hi! I’d like to rent this for my trip this weekend.', status: 'New' },
      { id: 2, who: 'Riya M.', rating: 4.9, count: 7, gear: 'HJC RPHA 11', from: '3rd Feb', to: '5th Feb', total: 2900, msg: 'Is the visor tinted? Planning a Nandi Hills sunrise ride.', status: 'New' },
      { id: 3, who: 'Dev P.', rating: 4.5, count: 3, gear: 'Alpinestars Track v2 Pants', from: '9th Jan', to: '11th Jan', total: 1800, msg: 'Need size M for a Coorg run.', status: 'Accepted' }
    ],
    reqTab: 'New',
    chats: { 'Ayush K.': [['them', 'Is it still available?'], ['me', 'Yes it is. When are you planning to rent it?'], ['them', 'This weekend. 21st–25th.']] },
    unread: new Set(['Karan S.', 'Riya M.']),
    bar: 6, txAll: false, faq: -1, helpQ: ''
  };
}
