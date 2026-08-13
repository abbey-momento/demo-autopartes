/* Autopartes Johnny's — demo cart & search interactions */

// ---- Cart ----
(function () {
  const CART_KEY = 'johnnys_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadges();
    renderDrawer();
  }
  function fmt(n) {
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function addToCart(item) {
    if (!item.ref) return;
    const cart = getCart();
    const existing = cart.find(function (p) { return p.ref === item.ref; });
    if (existing) { existing.qty += 1; }
    else { cart.push({ ref: item.ref, name: item.name, price: item.price, img: item.img, qty: 1 }); }
    saveCart(cart);
    openCart();
  }
  function removeFromCart(ref) {
    saveCart(getCart().filter(function (p) { return p.ref !== ref; }));
  }
  function changeQty(ref, delta) {
    const cart = getCart();
    const item = cart.find(function (p) { return p.ref === ref; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { return removeFromCart(ref); }
    saveCart(cart);
  }
  function cartCount() {
    return getCart().reduce(function (s, i) { return s + i.qty; }, 0);
  }
  function cartTotal() {
    return getCart().reduce(function (s, i) { return s + i.qty * i.price; }, 0);
  }
  function updateBadges() {
    const count = cartCount();
    document.querySelectorAll('.js-cart-badge').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
  function renderDrawer() {
    const body = document.getElementById('cart-drawer-body');
    if (!body) return;
    const footer = document.getElementById('cart-drawer-footer');
    const cart = getCart();
    if (cart.length === 0) {
      body.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-center px-8">' +
        '<svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' +
        '<p class="text-steel text-sm font-medium">Tu carrito está vacío</p>' +
        '<a href="products.html" class="mt-4 text-pink text-xs font-bold uppercase tracking-wide hover:underline">Ver catálogo</a></div>';
      if (footer) footer.classList.add('hidden');
      return;
    }
    if (footer) footer.classList.remove('hidden');
    body.innerHTML = cart.map(function (item) {
      return '<div class="flex gap-3 py-4 border-b border-gray-100">' +
        '<div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 p-1.5">' +
        '<img src="' + item.img + '" alt="" class="w-full h-full object-contain mix-blend-multiply"></div>' +
        '<div class="flex-1 min-w-0">' +
        '<p class="text-xs font-bold text-ink leading-snug line-clamp-2">' + item.name + '</p>' +
        '<p class="text-[10px] text-steel font-mono mt-0.5">REF. ' + item.ref + '</p>' +
        '<div class="flex items-center justify-between mt-2">' +
        '<div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">' +
        '<button class="w-6 h-6 text-steel hover:bg-gray-50 text-sm" onclick="JohnnysCart.changeQty(\'' + item.ref + '\', -1)">-</button>' +
        '<span class="w-6 text-center text-xs font-bold">' + item.qty + '</span>' +
        '<button class="w-6 h-6 text-steel hover:bg-gray-50 text-sm" onclick="JohnnysCart.changeQty(\'' + item.ref + '\', 1)">+</button>' +
        '</div><span class="text-sm font-display font-semibold text-pink">' + fmt(item.price * item.qty) + '</span>' +
        '</div></div>' +
        '<button class="text-gray-300 hover:text-pink shrink-0" onclick="JohnnysCart.removeFromCart(\'' + item.ref + '\')" aria-label="Quitar">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>';
    }).join('');
    const totalEl = document.getElementById('cart-drawer-total');
    if (totalEl) totalEl.textContent = fmt(cartTotal());
  }
  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    drawer.classList.remove('translate-x-full');
    if (overlay) overlay.classList.remove('pointer-events-none', 'opacity-0');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    drawer.classList.add('translate-x-full');
    if (overlay) overlay.classList.add('pointer-events-none', 'opacity-0');
    document.body.style.overflow = '';
  }
  function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    if (drawer.classList.contains('translate-x-full')) openCart(); else closeCart();
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-add-cart]');
    if (btn) {
      e.preventDefault();
      addToCart({
        ref: btn.dataset.ref,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img
      });
    }
  });

  window.JohnnysCart = {
    addToCart: addToCart, removeFromCart: removeFromCart, changeQty: changeQty,
    toggleCart: toggleCart, openCart: openCart, closeCart: closeCart
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    renderDrawer();
  });
})();

// ---- Search autocomplete ----
(function () {
  const PRODUCTS = [
    { ref: 'ALT-2210', name: 'Alternador Automotriz Alta Durabilidad', price: 1450, img: 'images/sample3.webp', cat: 'Eléctrico' },
    { ref: 'OIL-5W30-1L', name: 'Aceite Synth-Etec Full Synthetic 5W-30 1L', price: 280, img: 'images/sample4.webp', cat: 'Aceites' },
    { ref: 'IGN-880', name: 'Bobina de Encendido Pro', price: 650, img: 'images/sample5.webp', cat: 'Eléctrico' },
    { ref: 'THR-410', name: 'Cuerpo de Aceleración Electrónico O.E.M.', price: 2100, img: 'images/sample6.webp', cat: 'Motor' },
    { ref: 'OIL-5W40-5L', name: 'Aceite Synth-Etec Ultra-Performance 5W-40 5L', price: 980, img: 'images/sample7.webp', cat: 'Aceites' },
    { ref: 'MAF-105', name: 'Sensor de Flujo de Masa de Aire (MAF)', price: 1150, img: 'images/sample8.webp', cat: 'Motor' },
    { ref: 'OIL-0W30-5L', name: 'Aceite Synth-Etec Full Synthetic 0W-30 5L', price: 920, img: 'images/sample10.webp', cat: 'Aceites' },
    { ref: 'OIL-5W40-SE5L', name: 'Aceite Synth-Etec Full Synthetic 5W-40 5L', price: 950, img: 'images/sample11.webp', cat: 'Aceites' },
    { ref: 'OIL-0W30-P5L', name: 'Aceite Synth-Etec 0W-30 5L Edición Premium', price: 940, img: 'images/sample12.webp', cat: 'Aceites' },
    { ref: 'INJ-3021', name: 'Inyector de Combustible de Alta Precisión', price: 1320, img: 'images/sample13.webp', cat: 'Motor' }
  ];

  function fmt(n) {
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function buildDropdown(input) {
    const wrap = input.closest('.js-search-wrap');
    if (!wrap) return null;
    let dd = wrap.querySelector('.js-search-dropdown');
    if (!dd) {
      dd = document.createElement('div');
      dd.className = 'js-search-dropdown absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-float border border-gray-100 overflow-hidden z-50 hidden';
      wrap.appendChild(dd);
    }
    return dd;
  }
  function renderResults(input) {
    const dd = buildDropdown(input);
    if (!dd) return;
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dd.classList.add('hidden'); dd.innerHTML = ''; return; }
    const matches = PRODUCTS.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || p.cat.toLowerCase().indexOf(q) !== -1 || p.ref.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 5);
    if (matches.length === 0) {
      dd.innerHTML = '<div class="p-4 text-xs text-steel text-center">Sin resultados para &ldquo;' + input.value + '&rdquo;</div>';
      dd.classList.remove('hidden');
      return;
    }
    dd.innerHTML = matches.map(function (p) {
      return '<a href="product-detail.html" class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">' +
        '<div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 p-1">' +
        '<img src="' + p.img + '" alt="" class="w-full h-full object-contain mix-blend-multiply"></div>' +
        '<div class="flex-1 min-w-0"><p class="text-xs font-bold text-ink truncate">' + p.name + '</p>' +
        '<p class="text-[10px] text-steel">' + p.cat + ' · ' + fmt(p.price) + '</p></div></a>';
    }).join('') + '<a href="products.html" class="block text-center text-xs font-bold text-pink py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">Ver todos los resultados</a>';
    dd.classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-search-input').forEach(function (input) {
      input.addEventListener('input', function () { renderResults(input); });
      input.addEventListener('focus', function () { if (input.value.trim().length >= 2) renderResults(input); });
    });
    document.addEventListener('click', function (e) {
      document.querySelectorAll('.js-search-dropdown').forEach(function (dd) {
        const wrap = dd.closest('.js-search-wrap');
        if (wrap && !wrap.contains(e.target)) dd.classList.add('hidden');
      });
    });
  });
})();
