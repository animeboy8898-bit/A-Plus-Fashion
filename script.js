// ===================== GLOBALS =====================
const KEYS = { products:'products', cart:'cart', orders:'orders' };
let PRODUCTS = JSON.parse(localStorage.getItem(KEYS.products) || '[]');
let CART = JSON.parse(localStorage.getItem(KEYS.cart) || '[]');
let ORDERS = JSON.parse(localStorage.getItem(KEYS.orders) || '[]');

// ===================== RENDER CATALOG =====================
function renderCatalog(){
  const container=document.getElementById('catalog');
  if(!container) return;
  container.innerHTML='';
  PRODUCTS.forEach(p=>{
    const card=document.createElement('div');
    card.className='product-card';
    card.innerHTML=`<img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Rs ${p.price}</p>
      <button onclick="addToCart('${p.id}')">Add to Cart</button>
      <button onclick="buyNow('${p.id}')">Buy Now</button>`;
    container.appendChild(card);
  });
}

// ===================== CART =====================
function addToCart(id){
  const product=PRODUCTS.find(p=>p.id===id);
  if(!product) return;
  CART.push(product);
  localStorage.setItem(KEYS.cart, JSON.stringify(CART));
  renderCart();
}

function renderCart(){
  const container=document.getElementById('cart');
  if(!container) return;
  container.innerHTML='';
  CART.forEach((p,i)=>{
    const div=document.createElement('div');
    div.textContent=`${p.name} - Rs ${p.price}`;
    container.appendChild(div);
  });
  if(CART.length){
    const checkoutBtn=document.createElement('button');
    checkoutBtn.textContent='Checkout';
    checkoutBtn.onclick=goCheckout;
    container.appendChild(checkoutBtn);
  }
}

// ===================== BUY NOW =====================
function buyNow(id){
  CART=[PRODUCTS.find(p=>p.id===id)];
  localStorage.setItem(KEYS.cart, JSON.stringify(CART));
  goCheckout();
}

// ===================== CHECKOUT =====================
function goCheckout(){
  window.location.href='checkout.html';
}

function submitOrder(){
  const name=document.getElementById('cust-name').value;
  const phone=document.getElementById('cust-phone').value;
  const phone2=document.getElementById('cust-phone2').value;
  const city=document.getElementById('cust-city').value;
  const area=document.getElementById('cust-area').value;
  const addr=document.getElementById('cust-address').value;
  const mashoor=document.getElementById('cust-mashoor').value;
  const order={name,phone,phone2,city,area,addr,mashoor,items:CART};
  ORDERS.push(order);
  localStorage.setItem(KEYS.orders, JSON.stringify(ORDERS));
  CART=[];
  localStorage.removeItem(KEYS.cart);
  window.location.href='thanks.html';
}

// ===================== OWNER LOGIN =====================
function ownerLogin(){
  const pw=prompt('Enter owner password:');
  if(pw==='564321'){
    document.getElementById('owner').style.display='block';
    renderOwnerProducts();
    renderOrders();
  }else alert('Wrong password');
}

// ===================== OWNER PRODUCT MGMT =====================
function renderOwnerProducts(){
  const c=document.getElementById('owner-products');
  if(!c) return;
  c.innerHTML='';
  PRODUCTS.forEach(p=>{
    const div=document.createElement('div');
    div.textContent=`${p.name} - Rs ${p.price}`;
    c.appendChild(div);
  });
}

function resetProductForm(){
  document.getElementById('prod-name').value='';
  document.getElementById('prod-price').value='';
  document.getElementById('prod-img').value='';
  document.getElementById('prod-desc').value='';
}

// ===================== ORDERS VIEW =====================
function renderOrders(){
  const c=document.getElementById('owner-orders');
  if(!c) return;
  c.innerHTML='';
  ORDERS.forEach(o=>{
    const div=document.createElement('div');
    div.className='order';
    div.innerHTML=`<p>${o.name} - ${o.phone}, ${o.city}, ${o.area}</p>
      <p>${o.addr}, ${o.mashoor}</p>
      <p>Items: ${o.items.map(i=>i.name).join(', ')}</p>`;
    c.appendChild(div);
  });
}

// ===================== FIREBASE SYNC =====================
// This uses Firebase (make sure firebase-app.js + firebase-firestore.js are loaded in index.html)

async function upsertProduct(p){
  const idx=PRODUCTS.findIndex(x=>x.id===p.id);
  if(idx>=0) PRODUCTS[idx]=p; else PRODUCTS.push(p);
  localStorage.setItem(KEYS.products, JSON.stringify(PRODUCTS));

  try {
    await db.collection("products").doc(p.id).set(p);
    console.log("✅ Product synced to Firestore:", p.name);
  } catch(err) {
    console.error("❌ Firestore save failed", err);
  }

  renderCatalog();
  renderOwnerProducts();
  resetProductForm();
  alert('Product saved.');
}

function saveProduct(){
  const id=Date.now().toString();
  const name=document.getElementById('prod-name').value;
  const price=document.getElementById('prod-price').value;
  const img=document.getElementById('prod-img').value;
  const desc=document.getElementById('prod-desc').value;
  const product={id,name,price,img,desc};
  upsertProduct(product);
}

async function loadProductsFromFirestore(){
  try {
    const snap=await db.collection("products").get();
    PRODUCTS=snap.docs.map(doc=>doc.data());
    localStorage.setItem(KEYS.products, JSON.stringify(PRODUCTS));
    renderCatalog();
    renderOwnerProducts();
    console.log("✅ Products loaded from Firestore");
  } catch(err) {
    console.error("❌ Failed to load products", err);
  }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded',()=>{
  renderCatalog();
  renderCart();
  loadProductsFromFirestore(); // load from Firestore at start
});