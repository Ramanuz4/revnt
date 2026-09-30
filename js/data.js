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

const GEAR = [
  { id: 'k5r', name: 'K5R Anomalistic Helmet',      title: 'KSR Anomalistic - 7V',  brand: 'KSR',         price: 500, cat: 'Helmets',     rating: 4.8, reviews: 32, km: 2,   owner: 'Ayush K.', area: 'Koramangala',
    desc: 'ECE 22.06 full-face helmet with a pinlock-ready clear visor and an internal sun shield. Sanitised after every rental.', specs: [['Certification', 'ECE 22.06'], ['Weight', '1,450 g'], ['Visor', 'Clear + drop-down tint'], ['Condition', 'Like new']] },
  { id: 'nhk', name: 'NHK Alonso Starwhite Helmet', title: 'NHK Alonso Starwhite',  brand: 'NHK',         price: 700, cat: 'Helmets',     rating: 4.6, reviews: 18, km: 3.4, owner: 'Karan S.', area: 'HSR Layout',
    desc: 'Race-replica graphics, aerodynamic spoiler and a wide eye-port. Ideal for track days and fast weekend runs.', specs: [['Certification', 'DOT + ECE'], ['Weight', '1,520 g'], ['Visor', 'Smoke'], ['Condition', 'Good']] },
  { id: 'hjc', name: 'HJC RPHA 11 Helmet',          title: 'HJC RPHA 11',           brand: 'HJC',         price: 900, cat: 'Helmets',     rating: 4.9, reviews: 12, km: 5.1, owner: 'Riya M.',  area: 'Indiranagar',
    desc: 'Carbon-composite shell used in MotoGP. Very light and very quiet at speed.', specs: [['Certification', 'ECE 22.06'], ['Weight', '1,290 g'], ['Visor', 'Iridium'], ['Condition', 'Like new']] },
  { id: 'dai', name: 'Dainese Super Speed Jacket',  title: 'Dainese Super Speed 4', brand: 'Dainese',     price: 650, cat: 'Jackets',     rating: 4.9, reviews: 41, km: 1.2, owner: 'Riya M.',  area: 'Indiranagar',
    desc: 'Perforated leather sports jacket with CE level 2 shoulder and elbow armour. Zips to matching pants.', specs: [['Armour', 'CE Level 2'], ['Material', 'Perforated leather'], ['Back protector', 'Pocket ready'], ['Condition', 'Excellent']] },
  { id: 'ryn', name: 'Rynox Stealth Evo Jacket',    title: 'Rynox Stealth Evo 5',   brand: 'Rynox',       price: 400, cat: 'Jackets',     rating: 4.5, reviews: 27, km: 2.8, owner: 'Karan S.', area: 'HSR Layout',
    desc: 'All-season touring jacket with a removable thermal liner and a rain layer. Built for Indian summers and monsoons.', specs: [['Armour', 'CE Level 1'], ['Material', 'Mesh + textile'], ['Liners', 'Thermal + rain'], ['Condition', 'Good']] },
  { id: 'alp', name: 'Alpinestars SP-8 Gloves',     title: 'Alpinestars SP-8 V3',   brand: 'Alpinestars', price: 150, cat: 'Gloves',      rating: 4.7, reviews: 22, km: 0.9, owner: 'Ayush K.', area: 'Koramangala',
    desc: 'Short-cuff leather sport gloves with knuckle protection and touchscreen fingertips.', specs: [['Protection', 'Hard knuckle'], ['Material', 'Goat leather'], ['Touchscreen', 'Yes'], ['Condition', 'Like new']] },
  { id: 'bbg', name: 'BBG Snake Skin Gloves',       title: 'BBG Snake Skin',        brand: 'BBG',         price: 120, cat: 'Gloves',      rating: 4.3, reviews: 9,  km: 4.2, owner: 'Dev P.',   area: 'Jayanagar',
    desc: 'Affordable full-gauntlet gloves for highway runs, with palm sliders.', specs: [['Protection', 'Palm sliders'], ['Material', 'Textile + leather'], ['Touchscreen', 'No'], ['Condition', 'Good']] },
  { id: 'tvs', name: 'TVS Racing Touring Boots',    title: 'TVS Racing Touring',    brand: 'TVS Racing',  price: 300, cat: 'Boots',       rating: 4.6, reviews: 15, km: 3.0, owner: 'Dev P.',   area: 'Jayanagar',
    desc: 'Waterproof mid-length touring boots with ankle cups and an oil-resistant sole.', specs: [['Height', 'Mid-calf'], ['Waterproof', 'Yes'], ['Closure', 'Zip + velcro'], ['Condition', 'Good']] },
  { id: 'rai', name: 'Raida Tourer Pants',          title: 'Raida Tourer',          brand: 'Raida',       price: 350, cat: 'Pants',       rating: 4.4, reviews: 11, km: 2.2, owner: 'Ayush K.', area: 'Koramangala',
    desc: 'Riding pants with CE knee and hip armour and adjustable waist straps.', specs: [['Armour', 'CE knee + hip'], ['Waterproof', 'Liner included'], ['Fit', 'Regular'], ['Condition', 'Like new']] },
  { id: 'via', name: 'Viaterra Hammer Tail Bag',    title: 'Viaterra Hammer',       brand: 'Viaterra',    price: 250, cat: 'Accessories', rating: 4.8, reviews: 30, km: 1.7, owner: 'Riya M.',  area: 'Indiranagar',
    desc: '38-litre expandable tail bag with a rain cover and universal straps.', specs: [['Capacity', '38 L'], ['Rain cover', 'Included'], ['Mounting', 'Universal straps'], ['Condition', 'Excellent']] }
];
const gearById = id => GEAR.find(g => g.id === id) || GEAR[0];

const ONBOARDING = [
  { icon: 'sports_motorsports', kicker: 'Rent', title: 'Rent Gear, Explore More', text: 'High quality riding gear, for riders like you. Pick it up near you, ride, return.' },
  { icon: 'sell',               kicker: 'List', title: 'List Your Own Gear',      text: 'Turn your gears into opportunities. That helmet on the shelf can pay for your next trip.' },
  { icon: 'groups',             kicker: 'Ride', title: 'A Community of Riders',   text: 'Safe. Simple. Reliable. Verified riders, refundable deposits, and support that rides with you.' }
];

const BRANDS = ['KSR', 'Alpinestars', 'Dainese', 'HJC', 'Rynox', 'Viaterra', 'Raida', 'TVS Racing', 'BBG', 'NHK'];
const EARNINGS = [['Mar', 3200], ['Apr', 5100], ['May', 6400], ['Jun', 7800], ['Jul', 9200], ['Aug', 11000], ['Sep', 12500]];
const TRANSACTIONS = [
  ['2,000', 'KSR Helmet', 'Karan S.', '21st Jan'], ['1,500', 'Dainese Jacket', 'Sneha R.', '18th Jul'], ['1,200', 'HJC Helmet', 'Arjun T.', '18th Jul'],
  ['900', 'Alpinestars Gloves', 'Dev P.', '2nd Jul'], ['2,400', 'Rynox Jacket', 'Riya M.', '24th Jun']
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
    ex: { cats: new Set(), max: 2000, size: '', query: '', sort: 0 },
    rentals: [
      { gear: 'k5r', from: '21st Jan', to: '25th Jan', pickup: 'Koramangala', status: 'Upcoming' },
      { gear: 'dai', from: '28th Sep', to: '2nd Oct', pickup: 'Indiranagar', status: 'Active' },
      { gear: 'alp', from: '12th Aug', to: '14th Aug', pickup: 'HSR Layout', status: 'Completed' }
    ],
    rentTab: 'Upcoming',
    listing: { cat: 'Helmets', photos: [], name: 'KSR Anomalistic - 7V', brand: 'KSR', model: 'Anomalistic - 7V', desc: '', perDay: 500, perWeek: '', deposit: 1000, blocked: new Set() },
    myListings: [
      { title: 'HJC RPHA 11 Helmet', price: 900, status: 'Active', cat: 'Helmets' },
      { title: 'Raida Tourer Pants', price: 350, status: 'Pending', cat: 'Pants' },
      { title: 'BBG Snake Skin Gloves', price: 120, status: 'Expired', cat: 'Gloves' }
    ],
    listTab: 'Active',
    requests: [
      { id: 1, who: 'Karan S.', rating: 4.8, count: 12, gear: 'KSR Anomalistic - 7V', from: '21st Jan', to: '25th Jan', total: 3100, msg: 'Hi! I’d like to rent this for my trip this weekend.', status: 'New' },
      { id: 2, who: 'Riya M.', rating: 4.9, count: 7, gear: 'HJC RPHA 11', from: '3rd Feb', to: '5th Feb', total: 2900, msg: 'Is the visor tinted? Planning a Nandi Hills sunrise ride.', status: 'New' },
      { id: 3, who: 'Dev P.', rating: 4.5, count: 3, gear: 'Raida Tourer Pants', from: '9th Jan', to: '11th Jan', total: 1800, msg: 'Need size M for a Coorg run.', status: 'Accepted' }
    ],
    reqTab: 'New',
    chats: { 'Ayush K.': [['them', 'Is it still available?'], ['me', 'Yes it is. When are you planning to rent it?'], ['them', 'This weekend. 21st–25th.']] },
    unread: new Set(['Karan S.', 'Riya M.']),
    bar: 6, txAll: false, faq: -1, helpQ: ''
  };
}
