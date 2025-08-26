// ===================== Storage Keys =====================
const KEYS = {
  products: 'shop.products',
  orders: 'shop.orders',
  theme: 'shop.theme',
  ownerPass: 'shop.owner.pass'
};

// ===================== State =====================
let PRODUCTS = JSON.parse(localStorage.getItem(KEYS.products) || '[]');
let ORDERS = JSON.parse(localStorage.getItem(KEYS.orders) || '[]');
let THEME = JSON.parse(localStorage.getItem(KEYS.theme) || '{"name":"My Fashion Shop","primary":"#0ea5e9","accent":"#22c55e"}');
if(!localStorage.getItem(KEYS.ownerPass)) localStorage.setItem(KEYS.ownerPass, JSON.stringify('564321'));
let OWNER_LOGGED = false;

let CURRENT_VIEW_PRODUCT = null;
let PENDING_ORDER = { items: [], contact: {}, address: {} };

// ===================== Helpers =====================
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
const uid = () => 'p' + Math.random().toString(36).slice(2, 9);

// Pakistan cities (wide list) and some areas for top cities
const PAK_CITIES = [
  "Karachi","Lahore","Faisalabad","Rawalpindi","Gujranwala","Peshawar","Multan","Hyderabad",
  "Islamabad","Quetta","Bahawalpur","Sargodha","Sialkot","Sukkur","Larkana","Rahim Yar Khan",
  "Sheikhupura","Jhang","Dera Ghazi Khan","Mardan","Kasur","Gujrat","Sahiwal","Okara","Wah Cantonment",
  "Mingora","Mirpur Khas","Chiniot","Kamoke","Mandi Bahauddin","Khanewal","Hafizabad","Kohat",
  "Jacobabad","Shikarpur","Muzaffargarh","Abbottabad","Nawabshah (SBA)","Dera Ismail Khan","Tando Adam",
  "Khairpur","Chakwal","Bannu","Gilgit","Skardu","Mirpur (AJK)","Muzaffarabad","Kotli","Gwadar","Turbat",
  "Charsadda","Swabi","Attock","Nowshera","Haripur","Mansehra","Battagram","Hangu","Karak","Lakki Marwat",
  "Buner","Lower Dir","Upper Dir","Chitral","Tando Allahyar","Tando Muhammad Khan","Thatta","Badin","Umerkot",
  "Ghotki","Sanghar","Naushahro Feroze","Matiari","Jamshoro","Dadu","Kambar Shahdadkot","Kashmore","Jhelum",
  "Gojra","Toba Tek Singh","Vehari","Bahawalnagar","Pakpattan","Lodhran","Narowal","Muridke","Jaranwala",
  "Daska","Sambrial","Wazirabad","Sialkot Cantonment","Hasilpur","Arifwala","Chishtian","Mian Channu","Bhakkar",
  "Khushab","Mianwali","Layyah","Muzaffargarh","Khanpur","Shahdadpur","Usta Mohammad","Hub","Kalat","Zhob",
  "Ziarat","Chaman","Kharan","Pishin","Sibi","Dera Murad Jamali","Harnai","Uthal","Saidu Sharif","Kohlu"
].filter((v,i,a)=>a.indexOf(v)===i).sort();

const CITY_AREAS = {
  "Karachi":[
    "DHA","Clifton","PECHS","Saddar","Gulshan-e-Iqbal","Gulistan-e-Johar","North Nazimabad","Nazimabad",
    "Liaquatabad","Malir","Korangi","Landhi","Shah Faisal","Lyari","Baldia Town","New Karachi","Surjani",
    "FB Area","Kemari","Orangi Town","Garden East","Garden West"
  ],
  "Lahore":[
    "DHA","Gulberg","Model Town","Johar Town","Bahria Town","Cantt","Garden Town","Township",
    "Iqbal Town","Valencia","Askari","Wapda Town","Shalimar","Ferozepur Road","GT Road"
  ],
  "Islamabad":[
    "F-6","F-7","F-8","F-10","F-11","G-6","G-7","G-8","G-9","G-10","G-11","E-7",
    "I-8","I-9","I-10","H-8","Bahria Enclave","PWD"
  ],
  "Rawalpindi":[
    "Saddar","Chaklala","Bahria Town Phase 1-8","DHA Phase 1-2","Scheme III","Peshawar Road","Adiala Road"
  ],
  "Peshawar":[ "University Town","Hayatabad","Saddar","Gulbahar","DHA" ],
  "Quetta":[ "Jinnah Town","Satellite Town","Sariab Road","Kuchlak","Brewery Road" ],
  "Faisalabad":[ "D Ground","Madina Town","Canal Road","Jaranwala Road","Satiana" ],
  "Multan":[ "Cantt","Gulgasht","Bosan Road","New Multan","Shahrukn-e-Alam" ],
  "Hyderabad":[ "Latifabad","Qasimabad","City" ],
  "Sialkot":[ "Cantt","Daska Road","Paris Road","Ugoki" ],
  "Gujranwala":[ "Model Town","Wapda Town","Satellite Town" ],
  "Bahawalpur":[ "Model Town","Cantt","Civil Lines" ],
  "Sargodha":[ "University Road","Cantt","Satellite Town" ],
  "Gilgit":[ "Juglot","Danyore","Nomal","Jutial" ],
  "Skardu":[ "Sadpara","Hussainabad","Shigar Road" ]
};

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
  // Apply theme
  applyTheme(THEME);
  $('#siteName').textContent = THEME.name || 'My Fashion Shop';

  // Owner init
  $('#ownerBtn').addEventListener('click', openOwnerLogin);
  $('[data-close-modal]', $('#ownerLogin')).addEventListener('click', () => closeModal('#ownerLogin'));
  $('#ownerLoginSubmit').addEventListener('click', ownerLoginSubmit);
  $('#ownerLogout').addEventListener('click', ownerLogout);
  $('#closeOwnerPanel').addEventListener('click', () => toggleOwnerPanel(false));
  $$('.tab').forEach(btn => btn.addEventListener('click', switchTab));

  // Customize tab
  $('#cfgName').value = THEME.name;
  $('#cfgPrimary').value = THEME.primary;
  $('#cfgAccent').value = THEME.accent;
  $('#saveTheme').addEventListener('click', saveTheme);
  $('#savePass').addEventListener('click', saveOwnerPass);

  // Products tab
  $('#saveProduct').addEventListener('click', saveProduct);
  $('#resetProduct').addEventListener('click', resetProductForm);

  // Cart
  $('#cartBtn').addEventListener('click', () => toggleCart(true));
  $('#closeCart').addEventListener('click', () => toggleCart(false));
  $('#checkoutBtn').addEventListener('click', startCheckoutFromCart);

  // Modal close buttons
  $$('.modal').forEach(m => {
    const x = $('[data-close-modal]', m);
    if(x) x.addEventListener('click', () => m.classList.add('hidden'));
    m.addEventListener('click', (e) => { if(e.target === m) m.classList.add('hidden'); });
  });

  // Checkout flow
  $('#cancelCheckout1').addEventListener('click', () => navigate('home'));
  $('#toArea').addEventListener('click', gotoArea);
  $('#backToContact').addEventListener('click', () => navigate('contact'));
  $('#toAddress').addEventListener('click', gotoAddress);
  $('#backToArea').addEventListener('click', () => navigate('area'));
  $('#placeOrder').addEventListener('click', placeOrder);
  $('#sendEmailBtn').addEventListener('click', () => sendEmail(PENDING_ORDER));
  $('#copyEmail').addEventListener('click', copyEmailText);
  $('#backHome').addEventListener('click', () => navigate('home'));

  // Cities dropdown
  const citySel = $('#cCity');
  citySel.innerHTML = PAK_CITIES.map(c => `<option value="${c}">${c}</option>`).join('');
  $('#chosenCity').textContent = '';
  // Render
  renderCatalog();
  renderOwnerProducts();
  renderCart();
  renderOrders();
});

// ===================== Rendering =====================
function renderCatalog(){
  const grid = $('#catalog');
  grid.innerHTML = '';
  if(!PRODUCTS.length){
    $('#emptyCatalog').classList.remove('hidden');
    return;
  }
  $('#emptyCatalog').classList.add('hidden');

  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card product';
    card.innerHTML = `
      <div class="img-wrap"><img src="${p.image || ''}" alt="${escapeHtml(p.name)}"></div>
      <div class="name">${escapeHtml(p.name)}</div>
      <div class="price">${money(p.price)}</div>
      <div class="actions">
        <button class="btn" data-id="${p.id}" data-act="view">View</button>
        <button class="btn primary" data-id="${p.id}" data-act="add">Add</button>
      </div>
    `;
    grid.appendChild(card);

    // actions
    $('[data-act="view"]', card).addEventListener('click', () => openProduct(p.id));
    $('[data-act="add"]', card).addEventListener('click', () => { addToCart(p.id, 1); });
  });
}

function renderOwnerProducts(){
  const list = $('#ownerProducts');
  list.innerHTML = '';
  if(!PRODUCTS.length){ list.innerHTML = '<div class="muted">No products yet.</div>'; return; }
  PRODUCTS.forEach(p => {
    const row = document.createElement('div');
    row.className = 'row card';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <img src="${p.image || ''}" alt="" style="width:56px;height:56px;border-radius:10px;object-fit:cover">
      <div class="grow">
        <div><strong>${escapeHtml(p.name)}</strong></div>
        <div class="muted small">${money(p.price)} • Ships in ${p.shipDays} days</div>
      </div>
      <button class="btn subtle" data-id="${p.id}" data-act="edit">Edit</button>
      <button class="btn" data-id="${p.id}" data-act="delete">Delete</button>
    `;
    list.appendChild(row);
    $('[data-act="edit"]', row).addEventListener('click', () => editProduct(p.id));
    $('[data-act="delete"]', row).addEventListener('click', () => deleteProduct(p.id));
  });
}

function renderCart(){
  const list = $('#cartItems');
  const count = PRODUCTS.length ? PENDING_CART().reduce((a,i)=>a+i.qty,0) : 0;
  $('#cartCount').textContent = count;

  list.innerHTML = '';
  let total = 0;

  PENDING_CART().forEach(ci => {
    const p = PRODUCTS.find(x => x.id === ci.id);
    if(!p) return;
    total += p.price * ci.qty;
    const row = document.createElement('div');
    row.className = 'row card';
    row.innerHTML = `
      <img src="${p.image || ''}" alt="" style="width:54px;height:54px;border-radius:10px;object-fit:cover">
      <div class="grow">
        <div><strong>${escapeHtml(p.name)}</strong></div>
        <div class="muted small">${money(p.price)} × ${ci.qty}</div>
      </div>
      <div class="row">
        <button class="btn subtle" data-act="minus">−</button>
        <button class="btn subtle" data-act="plus">+</button>
        <button class="btn" data-act="remove">Remove</button>
      </div>
    `;
    $('[data-act="minus"]', row).addEventListener('click', () => { changeQty(ci.id, -1); });
    $('[data-act="plus"]', row).addEventListener('click', () => { changeQty(ci.id, +1); });
    $('[data-act="remove"]', row).addEventListener('click', () => { removeFromCart(ci.id); });
    list.appendChild(row);
  });

  $('#cartTotal').textContent = money(total);
}

function renderOrders(){
  const list = $('#ordersList');
  list.innerHTML = '';
  if(!ORDERS.length){ list.innerHTML = '<div class="muted">No orders yet.</div>'; return; }

  ORDERS.slice().reverse().forEach(o => {
    const box = document.createElement('div');
    box.className = 'card';
    const items = o.items.map(it => `• ${escapeHtml(it.name)} × ${it.qty} (${money(it.price)})`).join('<br>');
    box.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <strong>Order ${o.id}</strong>
        <span class="muted small">${new Date(o.date).toLocaleString()}</span>
      </div>
      <div class="small">Name: <strong>${escapeHtml(o.contact.name)}</strong> • Phone: ${escapeHtml(o.contact.phone1)} ${o.contact.phone2? ' / '+escapeHtml(o.contact.phone2): ''}</div>
      <div class="small">City/Area: ${escapeHtml(o.address.city)} / ${escapeHtml(o.address.area)}</div>
      <div class="small">Address: ${escapeHtml(o.address.address)}</div>
      <div class="small">Mashoor Jagah: ${escapeHtml(o.address.landmark || '—')}</div>
      <div class="small">Items:<br>${items}</div>
      <div class="total-row"><span>Total</span><strong>${money(o.total)}</strong></div>
    `;
    list.appendChild(box);
  });

  $('#exportOrders').onclick = () => {
    const csv = [
      ["OrderID","Date","Name","Phone1","Phone2","City","Area","Address","Landmark","Items","Total"].join(","),
      ...ORDERS.map(o => {
        const items = o.items.map(it => `${it.name} x${it.qty} (Rs ${it.price})`).join("; ");
        return [
          o.id, new Date(o.date).toISOString(), safeCSV(o.contact.name), safeCSV(o.contact.phone1), safeCSV(o.contact.phone2||""),
          safeCSV(o.address.city), safeCSV(o.address.area), safeCSV(o.address.address), safeCSV(o.address.landmark||""),
          safeCSV(items), o.total
        ].join(",");
      })
    ].join("\n");
    downloadFile('orders.csv', csv, 'text/csv');
  };
}

// ===================== Product Modal =====================
function openProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  CURRENT_VIEW_PRODUCT = p;
  $('#pmImage').src = p.image || '';
  $('#pmName').textContent = p.name;
  $('#pmPrice').textContent = money(p.price);
  $('#pmShip').textContent = `Estimated shipping: ${p.shipDays} day(s) (within Pakistan)`;
  $('#pmDesc').textContent = p.desc || '';
  $('#pmQty').value = 1;

  // Actions
  $('#pmAddToCart').onclick = () => { addToCart(p.id, Number($('#pmQty').value || 1)); closeModal('#productModal'); };
  $('#pmBuyNow').onclick = () => { buyNow(p.id, Number($('#pmQty').value || 1)); };

  openModal('#productModal');
}

// ===================== Cart ops =====================
function PENDING_CART(){
  if(!PENDING_ORDER.cart){ PENDING_ORDER.cart = []; }
  return PENDING_ORDER.cart;
}

function addToCart(id, qty=1){
  if(qty<1) qty=1;
  const item = PENDING_CART().find(c => c.id === id);
  if(item) item.qty += qty; else PENDING_CART().push({id, qty});
  renderCart();
  toggleCart(true);
}

function changeQty(id, delta){
  const item = PENDING_CART().find(c => c.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) removeFromCart(id);
  renderCart();
}

function removeFromCart(id){
  PENDING_ORDER.cart = PENDING_CART().filter(c => c.id !== id);
  renderCart();
}

function startCheckoutFromCart(){
  if(!PENDING_CART().length){ alert('Your cart is empty.'); return; }
  beginCheckoutWithItems(PENDING_CART());
}

function buyNow(id, qty=1){
  beginCheckoutWithItems([{id, qty}]);
  closeModal('#productModal');
}

function beginCheckoutWithItems(items){
  const expanded = items.map(ci => {
    const p = PRODUCTS.find(x => x.id === ci.id);
    return { id: ci.id, name: p?.name || 'Item', price: p?.price || 0, qty: ci.qty };
  });
  PENDING_ORDER.items = expanded;
  updateSummary();
  navigate('contact');
  toggleCart(false);
}

// ===================== Checkout navigation & data =====================
function navigate(where){
  ['page-contact','page-area','page-address','page-thanks'].forEach(id => $('#'+id).classList.add('hidden'));
  if(where === 'home'){
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  if(where === 'contact') $('#page-contact').classList.remove('hidden');
  if(where === 'area') $('#page-area').classList.remove('hidden');
  if(where === 'address') $('#page-address').classList.remove('hidden');
  if(where === 'thanks') $('#page-thanks').classList.remove('hidden');
  location.hash = where;
}

function gotoArea(){
  const name = $('#cName').value.trim();
  const phone1 = $('#cPhone1').value.trim();
  const phone2 = $('#cPhone2').value.trim();
  const city = $('#cCity').value;

  if(!name){ alert('Please enter your name.'); return; }
  if(!/^0\d{10}$/.test(phone1)){ alert('Enter valid Pakistani phone (11 digits, starts with 0).'); return; }
  if(!city){ alert('Please choose your city.'); return; }

  PENDING_ORDER.contact = { name, phone1, phone2 };
  PENDING_ORDER.address = { city };

  // Populate areas
  $('#chosenCity').textContent = city;
  const areas = CITY_AREAS[city] || [];
  const sel = $('#cArea');
  sel.innerHTML = areas.map(a => `<option value="${a}">${a}</option>`).join('') + (areas.length? `<option value="Other">Other</option>`: `<option value="">No preset areas</option>`);
  $('#cAreaCustom').value = '';
  navigate('area');
}

function gotoAddress(){
  const areaSel = $('#cArea').value;
  const areaCustom = $('#cAreaCustom').value.trim();
  const area = (areaSel === 'Other' || !areaSel) ? (areaCustom || '') : areaSel;
  if(!area){ alert('Please select or type your area/town.'); return; }
  PENDING_ORDER.address.area = area;
  updateSummary();
  navigate('address');
}

function updateSummary(){
  const list = $('#summaryItems');
  list.innerHTML = '';
  let total = 0;
  PENDING_ORDER.items.forEach(it => {
    total += it.price * it.qty;
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="grow">${escapeHtml(it.name)} × ${it.qty}</div><div>${money(it.price * it.qty)}</div>`;
    list.appendChild(row);
  });
  $('#summaryTotal').textContent = money(total);
}

function placeOrder(){
  const address = $('#cAddress').value.trim();
  const landmark = $('#cLandmark').value.trim();
  if(!address){ alert('Please enter your full address.'); return; }

  PENDING_ORDER.address.address = address;
  PENDING_ORDER.address.landmark = landmark;
  const total = PENDING_ORDER.items.reduce((a,it)=>a + it.price*it.qty,0);

  const order = {
    id: 'PK' + Date.now().toString().slice(-6),
    date: Date.now(),
    items: PENDING_ORDER.items,
    contact: PENDING_ORDER.contact,
    address: PENDING_ORDER.address,
    total
  };
  ORDERS.push(order);
  localStorage.setItem(KEYS.orders, JSON.stringify(ORDERS));

  PENDING_ORDER.cart = [];
  renderCart();

  $('#orderId').textContent = order.id;
  const email = buildEmail(order);
  $('#emailPreview').value = email.body;
  navigate('thanks');

  sendEmail(order);
}

function buildEmail(order){
  const subject = `New COD Order ${order.id} from ${order.contact.name}`;
  const lines = [
    `Order ID: ${order.id}`,
    `Name: ${order.contact.name}`,
    `Phone: ${order.contact.phone1}${order.contact.phone2 ? " / "+order.contact.phone2 : ""}`,
    `City: ${order.address.city}`,
    `Area: ${order.address.area}`,
    `Address: ${order.address.address}`,
    `Mashoor Jagah: ${order.address.landmark || "-"}`,
    `Items:`,
    ...order.items.map(it => `- ${it.name} x${it.qty} @ Rs ${it.price} = Rs ${it.price*it.qty}`),
    `Total: Rs ${order.total}`,
    `Payment: Cash on Delivery`,
  ];
  return { to: 'animeboy8898@gmail.com', subject, body: lines.join('\n') };
}

function sendEmail(order){
  const email = buildEmail(order);
  const mailto = `mailto:${encodeURIComponent(email.to)}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
  window.location.href = mailto;
  $('#sendEmailBtn').onclick = () => { window.location.href = mailto; };
}

async function copyEmailText(){
  try{
    await navigator.clipboard.writeText($('#emailPreview').value);
    alert('Email text copied.');
  }catch(e){
    alert('Copy failed. You can select and copy manually.');
  }
}

// ===================== Owner: login & tabs =====================
function openOwnerLogin(){
  openModal('#ownerLogin');
  $('#ownerPassInput').value = '';
  setTimeout(()=>$('#ownerPassInput').focus(), 50);
}

function ownerLoginSubmit(){
  const entered = $('#ownerPassInput').value;
  const pass = JSON.parse(localStorage.getItem(KEYS.ownerPass) || '"564321"');
  if(entered === pass){
    OWNER_LOGGED = true;
    closeModal('#ownerLogin');
    toggleOwnerPanel(true);
  }else{
    alert('Wrong password');
  }
}

function ownerLogout(){
  OWNER_LOGGED = false;
  toggleOwnerPanel(false);
}

function toggleOwnerPanel(show){
  const el = $('#ownerPanel');
  if(show){ el.classList.add('show'); el.classList.remove('hidden'); }
  else{ el.classList.remove('show'); setTimeout(()=>el.classList.add('hidden'), 200); }
}

function switchTab(e){
  const btn = e.currentTarget;
  $$('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const name = btn.dataset.tab;
  ['customize','products','orders'].forEach(id => $('#tab-'+id).classList.add('hidden'));
  $('#tab-' + name).classList.remove('hidden');
}

function saveTheme(){
  const name = $('#cfgName').value.trim() || 'My Fashion Shop';
  const primary = $('#cfgPrimary').value || '#0ea5e9';
  const accent = $('#cfgAccent').value || '#22c55e';
  THEME = { name, primary, accent };
  localStorage.setItem(KEYS.theme, JSON.stringify(THEME));
  applyTheme(THEME);
  $('#siteName').textContent = name;
  alert('Theme saved.');
}

function applyTheme(theme){
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.title = theme.name || 'My Fashion Shop';
}

function saveOwnerPass(){
  const p = $('#cfgPass').value.trim();
  if(!p){ alert('Enter a new password'); return; }
  localStorage.setItem(KEYS.ownerPass, JSON.stringify(p));
  $('#cfgPass').value = '';
  alert('Password updated. Remember it!');
}

// ===================== Owner: products CRUD =====================
function resetProductForm(){
  $('#pId').value = '';
  $('#pName').value = '';
  $('#pPrice').value = '';
  $('#pShip').value = 4;
  $('#pDesc').value = '';
  $('#pImage').value = '';
}

function saveProduct(){
  const id = $('#pId').value || uid();
  const name = $('#pName').value.trim();
  const price = Number($('#pPrice').value || 0);
  const shipDays = Number($('#pShip').value || 4);
  const desc = $('#pDesc').value.trim();

  if(!name){ alert('Enter product name'); return; }
  if(!price){ alert('Enter product price'); return; }

  const file = $('#pImage').files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = () => {
      upsertProduct({ id, name, price, shipDays, desc, image: reader.result });
    };
    reader.readAsDataURL(file);
  }else{
    const existing = PRODUCTS.find(p => p.id === id);
    const image = existing?.image || '';
    upsertProduct({ id, name, price, shipDays, desc, image });
  }
}

function upsertProduct(p){
  const idx = PRODUCTS.findIndex(x => x.id === p.id);
  if(idx >= 0) PRODUCTS[idx] = p; else PRODUCTS.push(p);
  localStorage.setItem(KEYS.products, JSON.stringify(PRODUCTS));
  renderCatalog();
  renderOwnerProducts();
  resetProductForm();
  alert('Product saved.');
}

function editProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  $('#pId').value = p.id;
  $('#pName').value = p.name;
  $('#pPrice').value = p.price;
  $('#pShip').value = p.shipDays;
  $('#pDesc').value = p.desc || '';
  $('#pImage').value = '';
  switchToTab('products');
}

function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  localStorage.setItem(KEYS.products, JSON.stringify(PRODUCTS));
  renderCatalog();
  renderOwnerProducts();
}

function switchToTab(name){
  $$('.tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  ['customize','products','orders'].forEach(id => $('#tab-'+id).classList.add('hidden'));
  $('#tab-' + name).classList.remove('hidden');
  toggleOwnerPanel(true);
}

// ===================== UI general =====================
function openModal(sel){ $(sel).classList.remove('hidden'); }
function closeModal(sel){ $(sel).classList.add('hidden'); }
function toggleCart(show){
  const el = $('#cartDrawer');
  if(show){ el.classList.add('show'); el.classList.remove('hidden'); }
  else{ el.classList.remove('show'); setTimeout(()=>el.classList.add('hidden'), 200); }
}

// ===================== Utils =====================
function escapeHtml(s=''){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function safeCSV(s=''){ return `"${String(s).replace(/"/g,'""')}"`; }
function downloadFile(name, content, type='text/plain'){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}