/* REVNT prototype — sample data and app state */

const ASSETS = {
  logo: 'assets/logo.png',
  avatar: 'assets/avatar.png',
  google: 'assets/google.svg',
  facebook: 'assets/facebook.svg'
};

const GEAR = [
  { id: 'k5r', name: 'K5R Anomalistic Helmet',      title: 'KSR ANOMALISTIC - 7V',  price: 500, cat: 'Helmets',     icon: 'sports_motorsports', rating: 4.8, reviews: 32, km: 2,   owner: 'Ayush K.' },
  { id: 'nhk', name: 'NHK Alonso Starwhite Helmet', title: 'NHK ALONSO STARWHITE',  price: 700, cat: 'Helmets',     icon: 'sports_motorsports', rating: 4.6, reviews: 18, km: 3.4, owner: 'Karan S.' },
  { id: 'hjc', name: 'HJC RPHA 11 Helmet',          title: 'HJC RPHA 11',           price: 900, cat: 'Helmets',     icon: 'sports_motorsports', rating: 4.9, reviews: 12, km: 5.1, owner: 'Riya M.' },
  { id: 'dai', name: 'Dainese Super Speed Jacket',  title: 'DAINESE SUPER SPEED 4', price: 650, cat: 'Jackets',     icon: 'apparel',            rating: 4.9, reviews: 41, km: 1.2, owner: 'Riya M.' },
  { id: 'ryn', name: 'Rynox Stealth Evo Jacket',    title: 'RYNOX STEALTH EVO 5',   price: 400, cat: 'Jackets',     icon: 'apparel',            rating: 4.5, reviews: 27, km: 2.8, owner: 'Karan S.' },
  { id: 'alp', name: 'Alpinestars SP-8 Gloves',     title: 'ALPINESTARS SP-8 V3',   price: 150, cat: 'Gloves',      icon: 'pan_tool',           rating: 4.7, reviews: 22, km: 0.9, owner: 'Ayush K.' },
  { id: 'bbg', name: 'BBG Snake Skin Gloves',       title: 'BBG SNAKE SKIN',        price: 120, cat: 'Gloves',      icon: 'pan_tool',           rating: 4.3, reviews: 9,  km: 4.2, owner: 'Dev P.' },
  { id: 'tvs', name: 'TVS Racing Touring Boots',    title: 'TVS RACING TOURING',    price: 300, cat: 'Boots',       icon: 'hiking',             rating: 4.6, reviews: 15, km: 3.0, owner: 'Dev P.' },
  { id: 'rai', name: 'Raida Tourer Pants',          title: 'RAIDA TOURER',          price: 350, cat: 'Pants',       icon: 'checkroom',          rating: 4.4, reviews: 11, km: 2.2, owner: 'Ayush K.' },
  { id: 'via', name: 'Viaterra Hammer Tail Bag',    title: 'VIATERRA HAMMER',       price: 250, cat: 'Accessories', icon: 'luggage',            rating: 4.8, reviews: 30, km: 1.7, owner: 'Riya M.' }
];
const gearById = id => GEAR.find(g => g.id === id) || GEAR[0];

const ONBOARDING = [
  { icon: 'sports_motorsports', title: 'Rent Gear, Explore More', text: 'High Quality Riding Gear,<br>For Riders Like You' },
  { icon: 'sell',               title: 'List Your Own Gear',      text: 'Turn Your Gears Into<br>Opportunities.' },
  { icon: 'groups',             title: 'A Community of Riders',   text: 'Safe. Simple. Reliable.' }
];

const EARNINGS = [['Mar', 3200], ['Apr', 5100], ['May', 6400], ['Jun', 7800], ['Jul', 9200], ['Aug', 11000], ['Sep', 12500]];
const TRANSACTIONS = [
  ['₹2,000', 'KSR Helmet', '21st Jan'], ['₹1,500', 'Dainese Jacket', '18th Jul'], ['₹1,200', 'HJC Helmet', '18th Jul'],
  ['₹900', 'Alpinestars Gloves', '2nd Jul'], ['₹2,400', 'Rynox Jacket', '24th Jun']
];
const CONTACTS = [['Ayush K.', '2m'], ['Karan S.', '14m'], ['Riya M.', '1h'], ['Dev P.', '3h'], ['Sneha R.', '1d'], ['Arjun T.', '2d']];
const AUTO_REPLIES = ['Sounds good! See you at pick-up.', 'Can you share the helmet size?', 'Perfect, I’ll book it now.', 'Is the deposit refundable the same day?'];
const FAQ = [
  ['How to Rent Gear', 'Search or browse, open the gear, pick your size and dates, then pay. The owner confirms and you collect it at the pick-up point.'],
  ['How to List Gear', 'Tap + in the tab bar, choose a category, add photos, describe the gear, set a daily price and deposit, then publish.'],
  ['Payments and Refunds', 'Deposits are refunded within 48 hours of return once the owner confirms the gear came back in the same condition.'],
  ['Damage and Disputes', 'Report damage in the app within 24 hours with photos. REVNT support mediates and holds the deposit until it is resolved.']
];

function freshState() {
  return {
    hist: [], cur: 'splash',
    fav: new Set(['nhk']), gear: 'k5r', size: 'S', day: 0,
    from: '2026-01-21', to: '2026-01-25', pickup: 'Koramangala, Bengaluru', pay: 'upi', breakup: false,
    agreed: false, resendLeft: 30,
    purpose: 'rent', name: 'Ayush Roy', location: 'Bengaluru', style: 'Touring', photo: null,
    exploreCat: 'All', sortDir: 0, query: '',
    filters: { cats: new Set(['Helmets']), max: 2000, size: 'S', brands: false },
    results: { label: 'Helmets', cats: ['Helmets'], max: 2000 },
    rentals: [
      { gear: 'k5r', from: '21st Jan', to: '25th Jan', pickup: 'Koramangala', status: 'Upcoming' },
      { gear: 'dai', from: '28th Sep', to: '2nd Oct', pickup: 'Indiranagar', status: 'Active' },
      { gear: 'alp', from: '12th Aug', to: '14th Aug', pickup: 'HSR Layout', status: 'Completed' }
    ],
    rentTab: 'Upcoming',
    listing: { cat: 'Helmets', photos: [], name: 'KSR ANOMALISTIC - 7V', brand: 'KSR', model: 'ANOMALISTIC - 7V', desc: '', perDay: 500, perWeek: '', deposit: 1000, blocked: new Set() },
    calOpen: false,
    myListings: [
      { title: 'HJC RPHA 11 HELMET', price: 900, status: 'Active' },
      { title: 'RAIDA TOURER PANTS', price: 350, status: 'Pending' },
      { title: 'BBG SNAKE SKIN GLOVES', price: 120, status: 'Expired' }
    ],
    listTab: 'Active',
    requests: [
      { id: 1, who: 'Karan S.', rating: 4.8, count: 12, gear: 'ANOMALISTIC - 7V', from: '21st Jan', to: '25th Jan', msg: 'Hi! I’d like to rent this for my trip this weekend.', status: 'New' },
      { id: 2, who: 'Riya M.', rating: 4.9, count: 7, gear: 'HJC RPHA 11', from: '3rd Feb', to: '5th Feb', msg: 'Is the visor tinted? Planning a Nandi Hills sunrise ride.', status: 'New' },
      { id: 3, who: 'Dev P.', rating: 4.5, count: 3, gear: 'RAIDA TOURER PANTS', from: '9th Jan', to: '11th Jan', msg: 'Need size M for a Coorg run.', status: 'Accepted' }
    ],
    reqTab: 'New', req: 1,
    chats: { 'Ayush K.': [['them', 'Is it still available?'], ['me', 'Yes it is. When are you planning to rent it?'], ['them', 'This weekend. 21st–25th.']] },
    chatWith: 'Ayush K.', bar: 6, txAll: false, faq: -1, helpQ: ''
  };
}
