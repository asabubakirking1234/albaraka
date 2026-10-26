(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const STORE = {
    cart: 'ab_cart_v1',
    customer: 'ab_customer_v1'
  };

  const state = {
    products: [],
    categories: [],
    drivers: [],
    settings: null,
    cart: {},
    category: 'all',
    search: '',
    sort: 'default',
    fulfillment: 'pickup',
    lastOrder: null,
    trackOrder: null,
    loaded: false
  };

  const refs = {};
  let scrimTimer = null;
  let cartReturnFocus = null;

  function cacheRefs() {
    [
      'siteHeader', 'menuBtn', 'mobileNav', 'mobileScrim', 'cartBtn', 'cartCount', 'cartDrawer', 'cartClose',
      'cartItems', 'cartCountInline', 'cartFoot', 'cartTotal', 'checkoutBtn', 'scrim',
      'categoryGrid', 'filterChips', 'searchInput', 'sortSelect', 'productGrid', 'emptyState',
      'clearFilters', 'checkoutModal', 'checkoutForm', 'checkoutItems', 'coItemCount', 'coTotal',
      'coTotalInline', 'coError', 'coSubmit', 'coName', 'coPhone', 'coAddress', 'coPickup', 'coNote',
      'pickupHoursHint', 'summaryAddress', 'summaryHours', 'successModal', 'okCode', 'okPickup',
      'okTotal', 'okTrackBtn', 'okPhoneLink', 'trackModal', 'trackForm', 'trackBtn', 'trackCode',
      'trackPhone', 'trackSubmit', 'trackError', 'trackResult', 'toastRegion', 'topbarPhone',
      'mobilePhone', 'aboutPhone', 'aboutPhoneCard', 'aboutAddress', 'aboutHours', 'footerPhone',
      'footerPhone2', 'footerAddress', 'footerHours', 'footerCategories', 'trTitle',
      'categoryCount', 'driverList', 'driverCount', 'deliveryStorePhoneLink', 'coFulfillmentPickup',
      'coFulfillmentDelivery', 'coDeliveryOption', 'deliveryPanel', 'coDriverList', 'coDriver',
      'coDriverPhoneRow', 'coDriverPhone', 'coDeliveryNoDrivers', 'coAddressLabel', 'coAddressHint',
      'coPickupLabel', 'coSummaryMethod', 'coSummaryDriverRow', 'coSummaryDriver', 'okPickupLabel',
      'okMethod', 'serviceBand', 'coDeliverySub'
    ].forEach((id) => {
      refs[id] = document.getElementById(id);
    });
  }

  async function api(url, options = {}) {
    let response;
    try {
      response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
    } catch {
      const error = new Error(AB.t('errNetwork'));
      error.code = 'network';
      throw error;
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
      /* empty body */
    }
    if (!response.ok) {
      const error = new Error(data?.message || AB.t('errGeneric'));
      error.code = data?.error || 'http_error';
      error.status = response.status;
      error.details = data?.details || null;
      throw error;
    }
    return data;
  }

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / quota */
    }
  }

  function loadCart() {
    const stored = readStorage(STORE.cart, {});
    state.cart = {};
    if (stored && typeof stored === 'object') {
      for (const [id, qty] of Object.entries(stored)) {
        const n = Number(qty);
        if (Number.isInteger(n) && n > 0) state.cart[id] = n;
      }
    }
  }

  function saveCart() {
    writeStorage(STORE.cart, state.cart);
  }

  function cartEntries() {
    return Object.entries(state.cart)
      .map(([id, qty]) => {
        const product = state.products.find((p) => p.id === id);
        return product ? { product, qty: Math.min(qty, product.stock) } : null;
      })
      .filter((entry) => entry && entry.qty > 0);
  }

  function cartCount() {
    return cartEntries().reduce((sum, entry) => sum + entry.qty, 0);
  }

  function cartTotal() {
    return cartEntries().reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
  }

  function sanitizeCart() {
    let changed = false;
    for (const [id, qty] of Object.entries(state.cart)) {
      const product = state.products.find((p) => p.id === id);
      if (!product || product.stock <= 0) {
        delete state.cart[id];
        changed = true;
      } else if (qty > product.stock) {
        state.cart[id] = product.stock;
        changed = true;
      }
    }
    if (changed) saveCart();
  }

  function productImage(image) {
    return image && String(image).startsWith('/') ? image : '/assets/img/box.svg';
  }

  function productName(product) {
    return product?.name?.[AB.lang] || product?.name?.uz || '';
  }

  function productDesc(product) {
    return product?.desc?.[AB.lang] || product?.desc?.uz || '';
  }

  function lowStock(product) {
    return product.stock > 0 && product.stock <= 5;
  }

  function renderSkeleton() {
    refs.productGrid.hidden = false;
    refs.productGrid.innerHTML = Array.from({ length: 6 })
      .map(
        () => `
        <div class="skeleton-card" aria-hidden="true">
          <div class="skeleton-card__media"></div>
          <div class="skeleton-card__body">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-75"></div>
            <div class="skeleton-line w-55"></div>
          </div>
        </div>`
      )
      .join('');
    refs.emptyState.hidden = true;
  }

  async function loadCatalog({ skeleton = false } = {}) {
    if (skeleton) renderSkeleton();
    try {
      const data = await api('/api/catalog');
      state.products = Array.isArray(data.products) ? data.products : [];
      state.categories = Array.isArray(data.categories) ? data.categories : [];
      state.drivers = Array.isArray(data.drivers) ? data.drivers : [];
      AB.setCategories(state.categories);
      state.settings = data.settings || state.settings;
      state.loaded = true;
      sanitizeCart();
      renderAll();
    } catch (error) {
      refs.productGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
          </div>
          <h3>${AB.esc(AB.t('errNetwork'))}</h3>
          <button type="button" class="btn btn--ghost" data-retry>${AB.esc(AB.t('adminRetry'))}</button>
        </div>`;
      refs.emptyState.hidden = true;
      if (error.code !== 'network') showToast(AB.t('errGeneric'));
    }
  }

  function renderAll() {
    renderCategories();
    renderChips();
    renderProducts();
    renderCart();
    renderDrivers();
    renderCheckoutDriverOptions();
    syncSettings();
    renderCheckoutSummary();
    renderFooterCategories();
    updateCategoryCount();
    updateServiceBand();
    setFulfillment(state.fulfillment);
    if (state.trackOrder) renderTrack(state.trackOrder);
  }

  function updateCategoryCount() {
    if (refs.categoryCount) refs.categoryCount.textContent = String(state.categories.length);
  }

  function updateServiceBand() {
    if (!refs.serviceBand) return;
    const hasService = state.products.some((product) => product.category === 'xizmat');
    refs.serviceBand.hidden = !hasService;
  }

  function renderCategories() {
    const counts = new Map();
    for (const product of state.products) {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    }
    refs.categoryGrid.innerHTML = state.categories
      .map((category) => {
        const count = counts.get(category.id) || 0;
        return `
          <button type="button" class="cat-card" data-category="${AB.esc(category.id)}">
            <span class="cat-card__img">
              <img src="${AB.esc(category.image || '/assets/img/box.svg')}" alt="" loading="lazy" width="320" height="250">
            </span>
            <span class="cat-card__body">
              <span class="cat-card__name">${AB.esc(AB.catName(category.id))}</span>
              <span class="cat-card__blurb">${AB.esc(AB.catBlurb(category.id))}</span>
              <span class="cat-card__foot">
                <span class="cat-card__count">${AB.esc(AB.t('catProducts', { n: count }))}</span>
                <span class="cat-card__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
                </span>
              </span>
            </span>
          </button>`;
      })
      .join('');
  }

  function renderFooterCategories() {
    refs.footerCategories.innerHTML = state.categories
      .map(
        (category) =>
          `<button type="button" class="footer__link" data-category="${AB.esc(category.id)}">${AB.esc(AB.catName(category.id))}</button>`
      )
      .join('');
  }

  function renderChips() {
    const counts = new Map();
    for (const product of state.products) {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    }
    const allActive = state.category === 'all';
    const chips = [
      `<button type="button" class="chip ${allActive ? 'is-active' : ''}" data-category="all" aria-pressed="${allActive}">
        ${AB.esc(AB.t('filterAll'))} <span>${state.products.length}</span>
      </button>`,
      ...state.categories.map((category) => {
        const active = state.category === category.id;
        return `<button type="button" class="chip ${active ? 'is-active' : ''}" data-category="${AB.esc(category.id)}" aria-pressed="${active}">
          ${AB.esc(AB.catName(category.id))} <span>${counts.get(category.id) || 0}</span>
        </button>`;
      })
    ];
    refs.filterChips.innerHTML = chips.join('');
  }

  function filteredProducts() {
    const query = state.search.trim().toLowerCase();
    let list = state.products.filter((product) => {
      if (state.category !== 'all' && product.category !== state.category) return false;
      if (!query) return true;
      const haystack = [
        product.name?.uz,
        product.name?.ru,
        product.desc?.uz,
        product.desc?.ru,
        AB.catName(product.category)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    if (state.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (state.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (state.sort === 'name') {
      list = [...list].sort((a, b) => productName(a).localeCompare(productName(b), AB.lang));
    }
    return list;
  }

  function renderProducts() {
    const list = filteredProducts();
    refs.productGrid.innerHTML = list
      .map((product) => {
        const out = product.stock <= 0;
        const isService = product.category === 'xizmat';
        const low = !isService && lowStock(product);
        const stockText = out
          ? AB.t('stockOut')
          : isService
            ? AB.t('serviceAvailable')
            : AB.t('stockLeft', { n: product.stock, unit: AB.unit(product.unit) });
        const stockClass = out ? 'is-out' : low ? 'is-low' : '';
        const badges = out
          ? `<span class="badge badge--out">${AB.esc(AB.t('unavailable'))}</span>`
          : low
            ? `<span class="badge badge--low">${AB.esc(AB.t('lowStock'))}</span>`
            : '';
        return `
          <article class="product-card ${out ? 'is-out' : ''}" data-product-card="${product.id}">
            <div class="product-card__media">
              <img src="${AB.esc(productImage(product.image))}" alt="${AB.esc(productName(product))}" loading="lazy" width="600" height="448">
              <div class="product-card__badges">${badges}</div>
              ${
                out
                  ? ''
                  : `<button type="button" class="product-card__add-icon" data-add="${product.id}" aria-label="${AB.esc(AB.t('addToCart'))}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
                    </button>`
              }
            </div>
            <div class="product-card__body">
              <span class="product-card__cat">${AB.esc(AB.catName(product.category))}</span>
              <h3 class="product-card__name">${AB.esc(productName(product))}</h3>
              <p class="product-card__desc">${AB.esc(productDesc(product))}</p>
              <div class="product-card__stock ${stockClass}">${AB.esc(stockText)}</div>
              <div class="product-card__foot">
                <div class="product-card__price">
                  <strong>${AB.price(product.price)}</strong>
                  <span>1 ${AB.esc(AB.unit(product.unit))}</span>
                </div>
                <button type="button" class="add-btn" data-add="${product.id}" ${out ? 'disabled' : ''}>
                  ${AB.esc(out ? AB.t('unavailable') : AB.t('addToCart'))}
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
                </button>
              </div>
            </div>
          </article>`;
      })
      .join('');
    refs.emptyState.hidden = list.length > 0;
    refs.productGrid.hidden = list.length === 0;
  }

  function renderCart() {
    const entries = cartEntries();
    const count = entries.reduce((sum, entry) => sum + entry.qty, 0);
    refs.cartCount.textContent = String(count);
    refs.cartCountInline.textContent = String(count);

    if (!entries.length) {
      refs.cartItems.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5.5 8h13l-1 12h-11z"></path><path d="M9 9V6.5a3 3 0 0 1 6 0V9"></path></svg>
          </div>
          <h3>${AB.esc(AB.t('cartEmptyTitle'))}</h3>
          <p>${AB.esc(AB.t('cartEmptyText'))}</p>
          <button type="button" class="btn btn--ghost" data-cart-shop>${AB.esc(AB.t('cartContinue'))}</button>
        </div>`;
      refs.cartFoot.hidden = true;
      refs.checkoutBtn.disabled = true;
      refs.cartTotal.textContent = AB.price(0);
      return;
    }

    refs.cartFoot.hidden = false;
    refs.checkoutBtn.disabled = false;
    refs.cartItems.innerHTML = entries
      .map(({ product, qty }) => {
        const stockText =
          product.category === 'xizmat'
            ? AB.t('serviceAvailable')
            : AB.t('cartStockNote', { n: product.stock, unit: AB.unit(product.unit) });
        return `
          <div class="cart-item" data-cart-row="${product.id}">
            <img class="cart-item__img" src="${AB.esc(productImage(product.image))}" alt="" width="70" height="70">
            <div class="cart-item__info">
              <div class="cart-item__name">${AB.esc(productName(product))}</div>
              <div class="cart-item__price">${AB.price(product.price)} / ${AB.esc(AB.unit(product.unit))}</div>
              <div class="cart-item__bottom">
                <div class="qty">
                  <button type="button" data-cart-dec="${product.id}" ${qty <= 1 ? 'disabled' : ''} aria-label="-">
                    <svg viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>
                  </button>
                  <span>${qty}</span>
                  <button type="button" data-cart-inc="${product.id}" ${qty >= product.stock ? 'disabled' : ''} aria-label="+">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  </button>
                </div>
                <span class="cart-item__stock">${AB.esc(stockText)}</span>
              </div>
            </div>
            <div class="cart-item__side">
              <span class="cart-item__total">${AB.price(product.price * qty)}</span>
              <button type="button" class="cart-item__remove" data-cart-remove="${product.id}">${AB.esc(AB.t('cartRemove'))}</button>
            </div>
          </div>`;
      })
      .join('');
    refs.cartTotal.textContent = AB.price(cartTotal());
  }

  function renderDrivers() {
    if (!refs.driverList) return;
    refs.driverCount.textContent = state.drivers.length
      ? AB.t('deliveryDriversCount', { n: state.drivers.length })
      : '';
    if (!state.drivers.length) {
      refs.driverList.innerHTML = `<div class="driver-empty">${AB.esc(AB.t('deliveryNoDrivers'))}</div>`;
      return;
    }
    refs.driverList.innerHTML = state.drivers
      .map((driver) => {
        const initial = (driver.name || '?').trim().charAt(0).toUpperCase();
        return `<article class="driver-card">
          <span class="driver-card__avatar" aria-hidden="true">${AB.esc(initial)}</span>
          <div class="driver-card__info">
            <div class="driver-card__name">${AB.esc(driver.name)}</div>
            ${driver.area ? `<span class="driver-card__area">${AB.esc(driver.area)}</span>` : ''}
            <a class="driver-card__phone" href="${phoneHref(driver.phone)}">${AB.esc(driver.phone)}</a>
            ${driver.note ? `<div class="driver-card__note">${AB.esc(driver.note)}</div>` : ''}
          </div>
          <a class="driver-call" href="${phoneHref(driver.phone)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>
            <span>${AB.esc(AB.t('deliveryCall'))}</span>
          </a>
        </article>`;
      })
      .join('');
  }

  function selectedDriver() {
    if (!refs.coDriver) return null;
    return state.drivers.find((driver) => driver.id === refs.coDriver.value) || null;
  }

  function updateSelectedDriverPhone() {
    if (!refs.coDriverPhoneRow) return;
    const driver = selectedDriver();
    refs.coDriverPhoneRow.hidden = !driver;
    if (driver) {
      refs.coDriverPhone.textContent = driver.phone;
      refs.coDriverPhone.href = phoneHref(driver.phone);
    } else {
      refs.coDriverPhone.textContent = '';
      refs.coDriverPhone.href = 'tel:';
    }
    renderCheckoutSummary();
  }

  function renderCheckoutDriverOptions() {
    if (!refs.coDriver) return;
    const current = refs.coDriver.value;
    const hasDrivers = state.drivers.length > 0;
    refs.coDriver.innerHTML =
      `<option value="">${AB.esc(AB.t('coDriverNone'))}</option>` +
      state.drivers
        .map(
          (driver) =>
            `<option value="${AB.esc(driver.id)}">${AB.esc(driver.name)}${driver.area ? ` — ${AB.esc(driver.area)}` : ''}</option>`
        )
        .join('');
    if (state.drivers.some((driver) => driver.id === current)) {
      refs.coDriver.value = current;
    }
    refs.coDeliveryNoDrivers.hidden = hasDrivers;
    refs.coDriverList.innerHTML = state.drivers
      .map(
        (driver) =>
          `<a class="co-driver-chip" href="${phoneHref(driver.phone)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>
            ${AB.esc(driver.name)} · ${AB.esc(driver.phone)}
          </a>`
      )
      .join('');
    refs.coFulfillmentDelivery.disabled = !hasDrivers;
    refs.coDeliveryOption.classList.toggle('is-disabled', !hasDrivers);
    refs.coDeliverySub.dataset.i18n = hasDrivers ? 'fulfillmentDeliverySub' : 'coDeliveryNoDrivers';
    refs.coDeliverySub.textContent = AB.t(refs.coDeliverySub.dataset.i18n);
    if (!hasDrivers && state.fulfillment === 'delivery') {
      state.fulfillment = 'pickup';
    }
    updateSelectedDriverPhone();
  }

  function setFulfillment(value, { preserveScroll = false } = {}) {
    if (!refs.deliveryPanel) return;
    const deliveryAvailable = state.drivers.length > 0;
    let next = value === 'delivery' ? 'delivery' : 'pickup';
    if (next === 'delivery' && !deliveryAvailable) next = 'pickup';
    state.fulfillment = next;
    const isDelivery = next === 'delivery';

    refs.coFulfillmentPickup.checked = !isDelivery;
    refs.coFulfillmentDelivery.checked = isDelivery;
    refs.coFulfillmentPickup.closest('.fulfillment-option').classList.toggle('is-selected', !isDelivery);
    refs.coFulfillmentDelivery.closest('.fulfillment-option').classList.toggle('is-selected', isDelivery);
    refs.deliveryPanel.hidden = !isDelivery;

    refs.coPickupLabel.dataset.i18n = isDelivery ? 'coPickupDelivery' : 'coPickup';
    refs.coPickupLabel.textContent = AB.t(refs.coPickupLabel.dataset.i18n);
    refs.coAddressHint.dataset.i18n = isDelivery ? 'coAddressHintDelivery' : 'coAddressHint';
    refs.coAddressHint.textContent = AB.t(refs.coAddressHint.dataset.i18n);

    renderCheckoutSummary();
    if (!preserveScroll) updateSelectedDriverPhone();
  }

  function renderCheckoutSummary() {
    if (!refs.checkoutItems) return;
    const entries = cartEntries();
    const count = entries.reduce((sum, entry) => sum + entry.qty, 0);
    refs.coItemCount.textContent = entries.length ? AB.itemCount(count) : '';
    refs.checkoutItems.innerHTML = entries
      .map(
        ({ product, qty }) => `
        <div class="checkout-item">
          <img src="${AB.esc(productImage(product.image))}" alt="" width="46" height="46">
          <div>
            <div class="checkout-item__name">${AB.esc(productName(product))}</div>
            <div class="checkout-item__meta">${qty} × ${AB.price(product.price)}</div>
          </div>
          <strong>${AB.price(product.price * qty)}</strong>
        </div>`
      )
      .join('');
    refs.coTotal.textContent = AB.price(cartTotal());
    if (refs.coTotalInline) refs.coTotalInline.textContent = AB.price(cartTotal());
    if (refs.coSummaryMethod) {
      const isDelivery = state.fulfillment === 'delivery';
      refs.coSummaryMethod.textContent = AB.t(isDelivery ? 'methodDelivery' : 'methodPickup');
      const driver = isDelivery ? selectedDriver() : null;
      refs.coSummaryDriverRow.hidden = !driver;
      refs.coSummaryDriver.textContent = driver
        ? `${driver.name} · ${driver.phone}`
        : '';
    }
  }

  function phoneHref(phone) {
    const digits = String(phone || '').replace(/[^\d+]/g, '');
    return `tel:${digits}`;
  }

  function syncSettings() {
    const settings = state.settings;
    if (!settings) return;
    const lang = AB.lang;
    const address = settings.address?.[lang] || settings.address?.uz || '';
    const hours = settings.hours?.[lang] || settings.hours?.uz || '';
    const landmark = settings.landmark?.[lang] || settings.landmark?.uz || '';
    const phone = settings.phone || '';

    for (const el of [refs.topbarPhone, refs.mobilePhone, refs.aboutPhone, refs.footerPhone, refs.okPhoneLink]) {
      if (!el) continue;
      el.textContent = phone;
      if (el.tagName === 'A') el.href = phoneHref(phone);
    }
    if (refs.aboutPhoneCard) refs.aboutPhoneCard.href = phoneHref(phone);
    if (refs.deliveryStorePhoneLink) refs.deliveryStorePhoneLink.href = phoneHref(phone);

    if (refs.footerPhone2) {
      refs.footerPhone2.textContent = settings.phone2 || '';
      refs.footerPhone2.href = phoneHref(settings.phone2 || '');
      refs.footerPhone2.hidden = !settings.phone2;
    }

    if (refs.aboutAddress) refs.aboutAddress.textContent = address;
    if (refs.footerAddress) refs.footerAddress.textContent = address;
    if (refs.aboutHours) refs.aboutHours.textContent = hours;
    if (refs.footerHours) refs.footerHours.textContent = hours;

    const topbarHours = $('.topbar__hours');
    if (topbarHours) topbarHours.textContent = hours;

    if (refs.pickupHoursHint) refs.pickupHoursHint.textContent = AB.t('coPickupHint', { hours });
    if (refs.summaryAddress) refs.summaryAddress.textContent = landmark || address;
    if (refs.summaryHours) refs.summaryHours.textContent = hours;
  }

  function updateMeta() {
    const isRu = AB.lang === 'ru';
    document.title = isRu
      ? 'Al Baraka — Стройматериалы | Ташкент'
      : 'Al Baraka — Qurilish mollari | Toshkent';
    const description = $('meta[name="description"]');
    if (description) {
      description.setAttribute(
        'content',
        isRu
          ? 'Al Baraka — цемент, краски, сантехника, гипс и электрика. Онлайн-каталог, актуальные остатки, самовывоз или доставка с водителем. Ташкент, Чиланзар.'
          : "Al Baraka Qurilish Mollari — sement, bo'yoq, santexnika, gips va elektrotexnika. Onlayn katalog, real vaqtdagi qoldiq, olib ketish yoki haydovchi orqali yetkazish. Toshkent, Chilonzor."
      );
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    refs.toastRegion.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-out');
      setTimeout(() => toast.remove(), 320);
    }, 2800);
  }

  function bumpCartBadge() {
    refs.cartCount.classList.remove('is-bumped');
    void refs.cartCount.offsetWidth;
    refs.cartCount.classList.add('is-bumped');
  }

  function addToCart(id) {
    const product = state.products.find((p) => p.id === id);
    if (!product || product.stock <= 0) {
      showToast(AB.t('stockOut'));
      return;
    }
    const current = state.cart[id] || 0;
    if (current >= product.stock) {
      showToast(AB.t('toastMax'));
      return;
    }
    state.cart[id] = current + 1;
    saveCart();
    renderCart();
    bumpCartBadge();
    showToast(AB.t('toastAdded'));
  }

  function setCategory(category, { scroll = false } = {}) {
    state.category = category;
    renderChips();
    renderProducts();
    if (scroll) {
      const catalog = document.getElementById('catalog');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFilters() {
    state.category = 'all';
    state.search = '';
    state.sort = 'default';
    refs.searchInput.value = '';
    refs.sortSelect.value = 'default';
    renderChips();
    renderProducts();
  }

  function syncBodyLock() {
    const hasDialog = Boolean(document.querySelector('dialog[open]'));
    const cartOpen = refs.cartDrawer.classList.contains('is-open');
    document.body.classList.toggle('no-scroll', hasDialog || cartOpen);
  }

  function showScrim() {
    clearTimeout(scrimTimer);
    refs.scrim.hidden = false;
    requestAnimationFrame(() => refs.scrim.classList.add('is-on'));
  }

  function hideScrim() {
    refs.scrim.classList.remove('is-on');
    clearTimeout(scrimTimer);
    scrimTimer = setTimeout(() => {
      refs.scrim.hidden = true;
    }, 320);
  }

  function openCart() {
    toggleMobileMenu(false);
    renderCart();
    cartReturnFocus = document.activeElement;
    refs.cartDrawer.classList.add('is-open');
    refs.cartDrawer.setAttribute('aria-hidden', 'false');
    refs.cartBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('cart-open');
    showScrim();
    syncBodyLock();
    setTimeout(() => refs.cartClose?.focus(), 180);
  }

  function closeCart({ restoreFocus = true } = {}) {
    if (!refs.cartDrawer.classList.contains('is-open')) return;
    refs.cartDrawer.classList.remove('is-open');
    refs.cartDrawer.setAttribute('aria-hidden', 'true');
    refs.cartBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cart-open');
    hideScrim();
    syncBodyLock();
    if (restoreFocus && cartReturnFocus instanceof HTMLElement) {
      cartReturnFocus.focus();
    }
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    syncBodyLock();
  }

  function closeDialog(dialog) {
    if (dialog?.open) dialog.close();
    syncBodyLock();
  }

  function toggleMobileMenu(force) {
    const open = typeof force === 'boolean' ? force : refs.mobileNav.hidden;
    refs.mobileNav.hidden = !open;
    refs.mobileScrim.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    refs.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function nextPickupSlot() {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
    if (date.getHours() < 8) date.setHours(8, 0, 0, 0);
    if (date.getHours() >= 19) {
      date.setDate(date.getDate() + 1);
      date.setHours(8, 0, 0, 0);
    }
    while (date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
      date.setHours(8, 0, 0, 0);
    }
    return AB.toLocalInput(date.toISOString());
  }

  function preparePickupInput() {
    if (!refs.coPickup) return;
    const minDate = new Date(Date.now() + 10 * 60 * 1000);
    refs.coPickup.min = AB.toLocalInput(minDate.toISOString());
    if (!refs.coPickup.value || new Date(refs.coPickup.value).getTime() < minDate.getTime()) {
      refs.coPickup.value = nextPickupSlot();
    }
  }

  function openCheckout() {
    const entries = cartEntries();
    if (!entries.length) {
      showToast(AB.t('errCart'));
      return;
    }
    closeCart({ restoreFocus: false });
    renderCheckoutSummary();
    renderCheckoutDriverOptions();
    refs.coDriver.value = '';
    setFulfillment('pickup');
    refs.coError.hidden = true;
    refs.coError.textContent = '';
    preparePickupInput();
    const customer = readStorage(STORE.customer, null);
    if (customer && !refs.coName.value) refs.coName.value = customer.name || '';
    if (customer && !refs.coPhone.value) refs.coPhone.value = customer.phone || '';
    syncSettings();
    openDialog(refs.checkoutModal);
    setTimeout(() => {
      if (!refs.coName.value) refs.coName.focus();
      else if (!refs.coPhone.value) refs.coPhone.focus();
    }, 120);
  }

  function setButtonBusy(button, busy, idleKey, busyKey) {
    if (!button) return;
    button.disabled = busy;
    const span = button.querySelector('span');
    if (span) span.textContent = AB.t(busy ? busyKey : idleKey);
  }

  function validateCheckout() {
    const name = refs.coName.value.trim();
    const phoneDigits = refs.coPhone.value.replace(/\D/g, '');
    const address = refs.coAddress.value.trim();
    const pickup = refs.coPickup.value;
    const errors = [];
    const fields = [refs.coName, refs.coPhone, refs.coAddress, refs.coPickup];
    fields.forEach((el) => el.classList.remove('is-invalid'));

    if (name.length < 2) {
      refs.coName.classList.add('is-invalid');
      errors.push(AB.t('errName'));
    }
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      refs.coPhone.classList.add('is-invalid');
      errors.push(AB.t('errPhone'));
    }
    if (address.length < 3) {
      refs.coAddress.classList.add('is-invalid');
      errors.push(AB.t('errAddress'));
    }
    if (!pickup || Number.isNaN(new Date(pickup).getTime())) {
      refs.coPickup.classList.add('is-invalid');
      errors.push(AB.t('errPickup'));
    }
    if (state.fulfillment === 'delivery' && !state.drivers.length) {
      errors.push(AB.t('errDelivery'));
    }
    if (!cartEntries().length) errors.push(AB.t('errCart'));
    if (errors.length) {
      refs.coError.hidden = false;
      refs.coError.textContent = errors[0];
      return false;
    }
    return true;
  }

  async function submitCheckout(event) {
    event.preventDefault();
    refs.coError.hidden = true;
    if (!validateCheckout()) return;

    const entries = cartEntries();
    const customer = {
      name: refs.coName.value.trim(),
      phone: refs.coPhone.value.trim(),
      address: refs.coAddress.value.trim()
    };

    setButtonBusy(refs.coSubmit, true, 'coSubmit', 'coSubmitting');
    try {
      const data = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          note: refs.coNote.value.trim(),
          pickupAt: new Date(refs.coPickup.value).toISOString(),
          fulfillment: state.fulfillment,
          driverId: state.fulfillment === 'delivery' ? refs.coDriver.value || undefined : undefined,
          items: entries.map(({ product, qty }) => ({ id: product.id, qty }))
        })
      });

      writeStorage(STORE.customer, customer);
      state.lastOrder = { code: data.order.code, phone: customer.phone };
      state.cart = {};
      saveCart();
      renderCart();
      refs.coNote.value = '';
      closeDialog(refs.checkoutModal);
      fillSuccess(data.order);
      openDialog(refs.successModal);
      loadCatalog();
    } catch (error) {
      let message = AB.t('errGeneric');
      if (error.code === 'insufficient_stock') {
        const product = state.products.find((p) => p.id === error.details?.productId);
        message = product
          ? `${AB.t('errStock')} ${productName(product)} — ${AB.t('stockLeft', {
              n: error.details?.available ?? product.stock,
              unit: AB.unit(product.unit)
            })}.`
          : AB.t('errStock');
        loadCatalog();
      } else if (error.code === 'product_unavailable' || error.code === 'empty_cart') {
        message = AB.t('errStock');
        loadCatalog();
      } else if (error.code === 'pickup_invalid') {
        message = AB.t('errPickup');
      } else if (error.code === 'delivery_unavailable' || error.code === 'driver_unavailable') {
        message = AB.t('errDelivery');
        loadCatalog();
      } else if (error.code === 'network') {
        message = AB.t('errNetwork');
      }
      refs.coError.hidden = false;
      refs.coError.textContent = message;
    } finally {
      setButtonBusy(refs.coSubmit, false, 'coSubmit', 'coSubmitting');
    }
  }

  function fillSuccess(order) {
    const isDelivery = order.fulfillment === 'delivery';
    refs.okCode.textContent = order.code;
    refs.okPickupLabel.dataset.i18n = isDelivery ? 'orderDeliveryLabel' : 'orderPickupLabel';
    refs.okPickupLabel.textContent = AB.t(refs.okPickupLabel.dataset.i18n);
    refs.okPickup.textContent = AB.formatDate(order.pickupAt);
    refs.okTotal.textContent = AB.price(order.total);
    refs.okMethod.textContent = `${AB.t('coSummaryMethod')}: ${AB.t(isDelivery ? 'methodDelivery' : 'methodPickup')}${
      isDelivery && order.driver ? ` · ${AB.t('coSummaryDriver')}: ${order.driver.name} (${order.driver.phone})` : ''
    }`;
    const phone = state.settings?.phone || '';
    refs.okPhoneLink.textContent = phone;
    refs.okPhoneLink.href = phoneHref(phone);
  }

  function openTrack({ code = '', phone = '', auto = false } = {}) {
    toggleMobileMenu(false);
    refs.trackError.hidden = true;
    refs.trackError.textContent = '';
    if (code) refs.trackCode.value = code;
    else if (state.lastOrder?.code) refs.trackCode.value = state.lastOrder.code;
    if (phone) refs.trackPhone.value = phone;
    else if (state.lastOrder?.phone) refs.trackPhone.value = state.lastOrder.phone;
    openDialog(refs.trackModal);
    if (auto && refs.trackCode.value && refs.trackPhone.value) {
      submitTrack(new Event('submit'));
    } else {
      setTimeout(() => {
        if (!refs.trackCode.value) refs.trackCode.focus();
        else if (!refs.trackPhone.value) refs.trackPhone.focus();
      }, 120);
    }
  }

  async function submitTrack(event) {
    event.preventDefault();
    refs.trackError.hidden = true;
    const code = refs.trackCode.value.trim();
    const phone = refs.trackPhone.value.replace(/\D/g, '');
    if (!code || phone.length < 9) {
      refs.trackError.hidden = false;
      refs.trackError.textContent = AB.t('trNotFound');
      return;
    }
    setButtonBusy(refs.trackSubmit, true, 'trSubmit', 'trChecking');
    refs.trackResult.hidden = true;
    try {
      const data = await api(
        `/api/orders/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`
      );
      state.trackOrder = data.order;
      state.lastOrder = { code: data.order.code, phone: refs.trackPhone.value.trim() };
      renderTrack(data.order);
    } catch (error) {
      state.trackOrder = null;
      refs.trackError.hidden = false;
      refs.trackError.textContent =
        error.code === 'not_found' ? AB.t('trNotFound') : error.code === 'network' ? AB.t('errNetwork') : AB.t('errGeneric');
    } finally {
      setButtonBusy(refs.trackSubmit, false, 'trSubmit', 'trChecking');
    }
  }

  function renderTrack(order) {
    if (!refs.trackResult) return;
    refs.trackResult.hidden = false;
    refs.trackError.hidden = true;
    const steps = ['new', 'confirmed', 'ready', 'completed'];
    const currentIndex = steps.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';
    const isDelivery = (order.fulfillment || 'pickup') === 'delivery';
    const driver = order.driver;
    const methodHtml = `<div class="track-fulfillment">
      <span>${AB.esc(AB.t('coSummaryMethod'))}: <b>${AB.esc(AB.t(isDelivery ? 'methodDelivery' : 'methodPickup'))}</b></span>
      ${
        driver
          ? `<span>${AB.esc(AB.t('coSummaryDriver'))}: <a href="${phoneHref(driver.phone)}">${AB.esc(driver.name)} · ${AB.esc(driver.phone)}</a></span>`
          : ''
      }
    </div>`;
    const stepHtml = isCancelled
      ? ''
      : `<div class="track-steps">
          ${steps
            .map((status, index) => {
              const done = index <= currentIndex;
              const current = index === currentIndex;
              return `<div class="track-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}">
                ${AB.esc(AB.status(status))}
              </div>`;
            })
            .join('')}
        </div>`;

    refs.trackResult.innerHTML = `
      <div class="track-result__head">
        <div>
          <span class="track-result__code">${AB.esc(order.code)}</span>
          <span class="track-result__date">${AB.esc(AB.t('trCreated'))}: ${AB.esc(AB.formatDate(order.createdAt))}</span>
        </div>
        <span class="status-pill status-${order.status}">${AB.esc(AB.status(order.status))}</span>
      </div>
      ${methodHtml}
      <div class="track-pickup" style="margin-top:16px">
        <span class="track-pickup__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3 2"></path></svg>
        </span>
        <div>
          <span>${AB.esc(AB.t('trPickup'))}</span>
          <strong>${AB.esc(AB.formatDate(order.pickupAt))}</strong>
        </div>
      </div>
      <p class="track-hint">${AB.esc(AB.t('trChanged'))}</p>
      ${isCancelled ? `<div class="track-cancelled">${AB.esc(AB.statusHint('cancelled'))}</div>` : stepHtml}
      <p class="track-hint">${AB.esc(AB.statusHint(order.status))}</p>
      <div class="track-items">
        <h4>${AB.esc(AB.t('trItems'))}</h4>
        ${order.items
          .map(
            (item) => `<div class="track-item">
              <span>${AB.esc(item.name?.[AB.lang] || item.name?.uz || '')} × ${item.qty}</span>
              <span>${AB.price(item.price * item.qty)}</span>
            </div>`
          )
          .join('')}
      </div>
      <div class="track-total">
        <span>${AB.esc(AB.t('trTotal'))}</span>
        <strong>${AB.price(order.total)}</strong>
      </div>
      <button type="button" class="track-again" data-track-again>${AB.esc(AB.t('trNewSearch'))}</button>`;
  }

  function setupReveal() {
    const elements = $$('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );
    elements.forEach((el) => observer.observe(el));
  }

  function bindEvents() {
    $$('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => AB.setLang(button.getAttribute('data-lang')));
    });

    window.addEventListener('ab:langchange', () => {
      updateMeta();
      renderAll();
    });

    const onScroll = () => refs.siteHeader.classList.toggle('is-scrolled', window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    refs.menuBtn.addEventListener('click', () => toggleMobileMenu());
    refs.mobileScrim.addEventListener('click', () => toggleMobileMenu(false));
    refs.mobileNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) toggleMobileMenu(false);
      if (event.target.closest('[data-open-track]')) {
        toggleMobileMenu(false);
        openTrack();
      }
    });

    document.addEventListener('click', (event) => {
      if (
        !refs.mobileNav.hidden &&
        !refs.mobileNav.contains(event.target) &&
        !refs.menuBtn.contains(event.target)
      ) {
        toggleMobileMenu(false);
      }
    });

    refs.cartBtn.addEventListener('click', openCart);
    refs.cartClose.addEventListener('click', () => closeCart());
    refs.scrim.addEventListener('click', () => closeCart());
    refs.checkoutBtn.addEventListener('click', openCheckout);

    refs.cartItems.addEventListener('click', (event) => {
      const shop = event.target.closest('[data-cart-shop]');
      if (shop) {
        closeCart();
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const inc = event.target.closest('[data-cart-inc]');
      const dec = event.target.closest('[data-cart-dec]');
      const remove = event.target.closest('[data-cart-remove]');
      const id = inc?.dataset.cartInc || dec?.dataset.cartDec || remove?.dataset.cartRemove;
      if (!id) return;
      const product = state.products.find((p) => p.id === id);
      if (!product) return;
      if (inc) {
        const qty = state.cart[id] || 0;
        if (qty >= product.stock) {
          showToast(AB.t('toastMax'));
          return;
        }
        state.cart[id] = qty + 1;
      } else if (dec) {
        const qty = (state.cart[id] || 0) - 1;
        if (qty <= 0) delete state.cart[id];
        else state.cart[id] = qty;
      } else if (remove) {
        delete state.cart[id];
        showToast(AB.t('toastRemoved'));
      }
      saveCart();
      renderCart();
      renderCheckoutSummary();
      bumpCartBadge();
    });

    refs.categoryGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-category]');
      if (card) setCategory(card.dataset.category, { scroll: true });
    });

    refs.footerCategories.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category]');
      if (button) setCategory(button.dataset.category, { scroll: true });
    });

    $$('[data-filter-category]').forEach((button) => {
      button.addEventListener('click', () => setCategory(button.dataset.filterCategory, { scroll: true }));
    });

    refs.filterChips.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-category]');
      if (chip) setCategory(chip.dataset.category);
    });

    refs.productGrid.addEventListener('click', (event) => {
      const retry = event.target.closest('[data-retry]');
      if (retry) {
        loadCatalog({ skeleton: true });
        return;
      }
      const add = event.target.closest('[data-add]');
      if (add) addToCart(add.dataset.add);
    });

    let searchTimer = null;
    refs.searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.search = refs.searchInput.value;
        renderProducts();
      }, 120);
    });
    refs.sortSelect.addEventListener('change', () => {
      state.sort = refs.sortSelect.value;
      renderProducts();
    });
    refs.clearFilters.addEventListener('click', resetFilters);

    refs.checkoutForm.addEventListener('submit', submitCheckout);
    refs.coFulfillmentPickup.addEventListener('change', () => setFulfillment('pickup'));
    refs.coFulfillmentDelivery.addEventListener('change', () => setFulfillment('delivery'));
    refs.coDriver.addEventListener('change', updateSelectedDriverPhone);
    refs.trackForm.addEventListener('submit', submitTrack);
    refs.trackBtn.addEventListener('click', () => openTrack());
    refs.okTrackBtn.addEventListener('click', () => {
      closeDialog(refs.successModal);
      if (state.lastOrder) openTrack({ ...state.lastOrder, auto: true });
      else openTrack();
    });
    $$('[data-open-track]').forEach((button) => {
      button.addEventListener('click', () => openTrack());
    });

    refs.trackResult.addEventListener('click', (event) => {
      if (event.target.closest('[data-track-again]')) {
        state.trackOrder = null;
        refs.trackCode.value = '';
        refs.trackPhone.value = state.lastOrder?.phone || '';
        refs.trackResult.hidden = true;
        refs.trackError.hidden = true;
        refs.trackCode.focus();
      }
    });

    $$('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => {
        const dialog = button.closest('dialog');
        if (dialog) closeDialog(dialog);
      });
    });

    $$('dialog').forEach((dialog) => {
      dialog.addEventListener('close', syncBodyLock);
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    refs.checkoutModal.addEventListener('close', () => {
      refs.coError.hidden = true;
      syncBodyLock();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!refs.mobileNav.hidden) toggleMobileMenu(false);
      if (refs.cartDrawer.classList.contains('is-open')) closeCart();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) toggleMobileMenu(false);
    });

    window.addEventListener('storage', (event) => {
      if (event.key === STORE.cart) {
        loadCart();
        sanitizeCart();
        renderCart();
        renderCheckoutSummary();
      }
    });

    document.addEventListener(
      'error',
      (event) => {
        const img = event.target;
        if (img instanceof HTMLImageElement && !img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = '/assets/img/box.svg';
        }
      },
      true
    );
  }

  function init() {
    cacheRefs();
    loadCart();
    AB.applyTranslations();
    updateMeta();
    bindEvents();
    renderSkeleton();
    loadCatalog();
    setupReveal();
    syncBodyLock();

    setInterval(async () => {
      if (document.hidden) return;
      if (document.querySelector('dialog[open]')) return;
      if (refs.cartDrawer.classList.contains('is-open')) return;
      try {
        const data = await api('/api/catalog');
        state.products = Array.isArray(data.products) ? data.products : state.products;
        state.settings = data.settings || state.settings;
        sanitizeCart();
        renderAll();
      } catch {
        /* keep the current catalog when a background refresh fails */
      }
    }, 60000);

    const params = new URLSearchParams(window.location.search);
    if (params.get('order')) {
      refs.trackCode.value = params.get('order');
      if (params.get('phone')) refs.trackPhone.value = params.get('phone');
      openTrack({ code: params.get('order'), phone: params.get('phone') || '', auto: Boolean(params.get('phone')) });
    }
  }

  init();
})();
