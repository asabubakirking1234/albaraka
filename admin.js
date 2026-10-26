(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    authed: false,
    tab: 'orders',
    orders: [],
    products: [],
    categories: [],
    drivers: [],
    settings: null,
    statusFilter: 'all',
    orderSearch: '',
    productSearch: '',
    categoryFilter: 'all',
    editingId: null,
    editingCategoryId: null,
    editingDriverId: null,
    imageData: null,
    categoryImageData: null,
    currentImage: null,
    loadError: false,
    busyOrders: new Set()
  };

  const refs = {};
  let confirmResolver = null;
  let pollTimer = null;
  let knownOrderIds = new Set();

  function cacheRefs() {
    [
      'loginView', 'dashboardView', 'loginForm', 'loginUser', 'loginPass', 'loginBtn',
      'loginError', 'loginPassToggle', 'logoutBtn', 'adminUser', 'todayLabel', 'pageTitle',
      'tab-orders', 'tab-products', 'tab-settings', 'statNewOrders', 'statNewSub', 'statToday',
      'statTodaySub', 'statRevenue', 'statLowStock', 'statProductsCount', 'navNewBadge',
      'ordersCountBadge', 'orderStatusChips', 'orderSearch', 'ordersList', 'refreshOrders',
      'productsCountBadge', 'productSearch', 'productCategoryFilter', 'productsBody',
      'productsEmpty', 'addProductBtn', 'settingsForm', 'stPhone', 'stPhone2', 'stAddressUz',
      'stAddressRu', 'stLandmarkUz', 'stLandmarkRu', 'stHoursUz', 'stHoursRu', 'stPickupUz',
      'stPickupRu', 'settingsError', 'saveSettingsBtn', 'passwordForm', 'pwCurrent', 'pwNew',
      'pwRepeat', 'passwordError', 'changePasswordBtn', 'productModal', 'productModalTitle',
      'productForm', 'imageDrop', 'productImagePreview', 'productImageInput', 'chooseImageBtn',
      'pfNameUz', 'pfNameRu', 'pfCategory', 'pfUnit', 'pfPrice', 'pfStock', 'pfDescUz',
      'pfDescRu', 'pfActive', 'pfActiveText', 'productFormError', 'saveProductBtn',
      'manageCategoriesBtn', 'categoryModal', 'categoryList', 'categoryForm', 'categoryFormTitle',
      'newCategoryBtn', 'cancelCategoryEdit', 'cfNameUz', 'cfNameRu', 'cfBlurbUz', 'cfBlurbRu',
      'categoryImagePreview', 'categoryImageInput', 'chooseCategoryImageBtn', 'categoryFormError',
      'saveCategoryBtn', 'categoryImageDrop', 'addDriverBtn', 'driversList', 'driverModal',
      'driverForm', 'driverFormTitle', 'dfName', 'dfPhone', 'dfArea', 'dfNote', 'dfActive',
      'dfActiveText', 'driverFormError', 'saveDriverBtn',
      'confirmModal', 'confirmTitle', 'confirmText', 'confirmOk', 'confirmCancel',
      'adminToastRegion'
    ].forEach((id) => {
      refs[id] = document.getElementById(id);
    });
  }

  async function api(path, options = {}, { admin = true } = {}) {
    let response;
    try {
      response = await fetch(path, {
        credentials: 'same-origin',
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
      /* no body */
    }

    if (!response.ok) {
      if (response.status === 401 && admin) handleSessionExpired();
      const error = new Error(data?.message || AB.t('errGeneric'));
      error.code = data?.error || 'http_error';
      error.status = response.status;
      error.details = data?.details || null;
      throw error;
    }
    return data;
  }

  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `admin-toast ${isError ? 'is-error' : ''}`;
    toast.textContent = message;
    refs.adminToastRegion.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function setBusy(button, busy, idleKey, busyKey) {
    if (!button) return;
    button.disabled = busy;
    const span = button.querySelector('span');
    if (span) span.textContent = AB.t(busy ? busyKey : idleKey);
  }

  function updateTitle() {
    document.title = AB.lang === 'ru' ? 'Панель продавца — Al Baraka' : 'Sotuvchi paneli — Al Baraka';
  }

  function showLogin() {
    state.authed = false;
    state.loadError = false;
    if (confirmResolver) settleConfirm(false);
    if (refs.loginView) refs.loginView.hidden = false;
    if (refs.dashboardView) refs.dashboardView.hidden = true;
    document.body.classList.remove('dashboard-mode');
    for (const dialog of $$('dialog[open]')) dialog.close();
  }

  function openAdminModal(dialog) {
    if (dialog && !dialog.open) dialog.showModal();
  }

  function showDashboard() {
    state.authed = true;
    refs.loginView.hidden = true;
    refs.dashboardView.hidden = false;
    document.body.classList.add('dashboard-mode');
    updateTitle();
  }

  function handleSessionExpired() {
    if (!state.authed) return;
    showLogin();
    showToast(AB.t('adminSessionExpired'), true);
  }

  function orderCounts() {
    const counts = { all: state.orders.length };
    for (const key of Object.keys(AB.statuses)) counts[key] = 0;
    for (const order of state.orders) counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }

  function renderStats() {
    const counts = orderCounts();
    const todayKey = AB.formatDate(new Date().toISOString(), { short: true });
    const todayOrders = state.orders.filter(
      (order) => AB.formatDate(order.createdAt, { short: true }) === todayKey
    );
    const revenue = state.orders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    const lowStock = state.products.filter(
      (product) => !product.archived && product.active && product.stock <= 5
    );
    const activeProducts = state.products.filter((product) => !product.archived);

    refs.statNewOrders.textContent = String(counts.new || 0);
    refs.statNewSub.textContent = AB.orderCount(state.orders.length);
    refs.statToday.textContent = String(todayOrders.length);
    refs.statTodaySub.textContent = AB.price(
      todayOrders.reduce((sum, order) => sum + order.total, 0)
    );
    refs.statRevenue.textContent = AB.price(revenue);
    refs.statLowStock.textContent = String(lowStock.length);
    refs.statProductsCount.textContent = AB.t('adminProductCount', { n: activeProducts.length });
    refs.ordersCountBadge.textContent = String(state.orders.length);
    refs.productsCountBadge.textContent = String(state.products.length);
    refs.navNewBadge.textContent = String(counts.new || 0);
    refs.navNewBadge.hidden = !counts.new;
    updateToday();
  }

  function updateToday() {
    refs.todayLabel.textContent = AB.formatDate(new Date().toISOString(), { withTime: false });
  }

  function renderOrderFilters() {
    const counts = orderCounts();
    const tabs = [
      { key: 'all', label: AB.t('adminAll'), count: counts.all },
      ...Object.keys(AB.statuses).map((key) => ({
        key,
        label: AB.status(key),
        count: counts[key] || 0
      }))
    ];
    refs.orderStatusChips.innerHTML = tabs
      .map(
        (tab) => `<button type="button" class="filter-tab ${state.statusFilter === tab.key ? 'is-active' : ''}" data-status-filter="${tab.key}">
          ${AB.esc(tab.label)} <b>${tab.count}</b>
        </button>`
      )
      .join('');
  }

  function filteredOrders() {
    const query = state.orderSearch.trim().toLowerCase();
    return state.orders.filter((order) => {
      if (state.statusFilter !== 'all' && order.status !== state.statusFilter) return false;
      if (!query) return true;
      return [
        order.code,
        order.customer?.name,
        order.customer?.phone,
        order.customer?.address,
        order.customer?.note
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  function orderItemsHtml(order) {
    return order.items
      .map((item) => {
        const name = item.name?.[AB.lang] || item.name?.uz || '';
        return `<div class="order-item">
          <img src="${AB.esc(item.image || '/assets/img/box.svg')}" alt="" width="32" height="32">
          <div class="order-item__name">
            ${AB.esc(name)}
            <span class="order-item__qty">${item.qty} × ${AB.price(item.price)} / ${AB.esc(AB.unit(item.unit))}</span>
          </div>
          <span class="order-item__total">${AB.price(item.lineTotal ?? item.price * item.qty)}</span>
        </div>`;
      })
      .join('');
  }

  function quickAction(status) {
    if (status === 'new') return { next: 'confirmed', label: AB.t('adminMarkConfirmed'), style: 'primary' };
    if (status === 'confirmed') return { next: 'ready', label: AB.t('adminMarkReady'), style: 'primary' };
    if (status === 'ready') return { next: 'completed', label: AB.t('adminMarkCompleted'), style: 'primary' };
    if (status === 'cancelled') return { next: 'confirmed', label: AB.t('adminRestore'), style: 'ghost' };
    return null;
  }

  function orderCardHtml(order) {
    const pickupPassed =
      new Date(order.pickupAt).getTime() < Date.now() &&
      !['completed', 'cancelled'].includes(order.status);
    const quick = quickAction(order.status);
    const canCancel = !['completed', 'cancelled'].includes(order.status);
    const isDelivery = (order.fulfillment || 'pickup') === 'delivery';
    const driver = order.driver;
    return `
      <article class="order-card ${order.status === 'new' ? 'order-card--new' : ''}" data-order="${order.id}">
        <div class="order-card__head">
          <div class="order-card__identity">
            <span class="order-code">${AB.esc(order.code)}</span>
            <span class="status-pill status-${order.status}">${AB.esc(AB.status(order.status))}</span>
            <span class="fulfillment-pill ${isDelivery ? 'fulfillment-pill--delivery' : ''}">${AB.esc(AB.t(isDelivery ? 'methodDelivery' : 'methodPickup'))}</span>
            <span class="order-created">${AB.esc(AB.t('adminCreated'))}: ${AB.esc(AB.formatDate(order.createdAt))}</span>
          </div>
          <div class="order-head-side">
            <select class="order-status-select" data-order-status aria-label="${AB.esc(AB.t('adminStatus'))}">
              ${Object.keys(AB.statuses)
                .map(
                  (status) =>
                    `<option value="${status}" ${status === order.status ? 'selected' : ''}>${AB.esc(AB.status(status))}</option>`
                )
                .join('')}
            </select>
          </div>
        </div>
        <div class="order-grid">
          <div class="order-customer">
            <div class="order-customer__name">${AB.esc(order.customer.name)}</div>
            <a class="order-customer__phone" href="tel:${AB.esc(order.customer.phone.replace(/[^\d+]/g, ''))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>
              ${AB.esc(order.customer.phone)}
            </a>
            <div class="order-info">
              <span class="order-info__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
              </span>
              <div>
                <span>${AB.esc(AB.t(isDelivery ? 'adminDeliveryAddress' : 'adminAddress'))}</span>
                <strong>${AB.esc(order.customer.address || AB.t('adminNoAddress'))}</strong>
              </div>
            </div>
            ${
              isDelivery
                ? `<div class="order-driver">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h11v9H3z"></path><path d="M14 11h4l3 3v3h-7z"></path><circle cx="7" cy="18.5" r="1.8"></circle><circle cx="18" cy="18.5" r="1.8"></circle></svg>
                    <div>
                      <span>${AB.esc(AB.t('adminOrderDriver'))}</span>
                      ${
                        driver
                          ? `<a href="tel:${AB.esc(driver.phone.replace(/[^\d+]/g, ''))}">${AB.esc(driver.name)} · ${AB.esc(driver.phone)}</a>`
                          : `<strong>${AB.esc(AB.t('adminNoDriverChosen'))}</strong>`
                      }
                    </div>
                  </div>`
                : ''
            }
            ${
              order.customer.note
                ? `<div class="order-info order-info--note">
                    <span class="order-info__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"></path></svg>
                    </span>
                    <div>
                      <span>${AB.esc(AB.t('adminNote'))}</span>
                      <strong>${AB.esc(order.customer.note)}</strong>
                    </div>
                  </div>`
                : ''
            }
          </div>
          <div class="order-items">
            <div class="order-items__label">
              <span>${AB.esc(AB.t('adminItems'))}</span>
              <span>${AB.itemCount(order.items.reduce((sum, item) => sum + item.qty, 0))}</span>
            </div>
            ${orderItemsHtml(order)}
          </div>
          <div class="order-side">
            <div class="order-total">
              <span>${AB.esc(AB.t('adminTotal'))}</span>
              <strong>${AB.price(order.total)}</strong>
            </div>
            <label class="pickup-field">
              <span>${AB.esc(AB.t(isDelivery ? 'orderDeliveryLabel' : 'orderPickupLabel'))}</span>
              <div class="pickup-row">
                <input type="datetime-local" data-pickup value="${AB.toLocalInput(order.pickupAt)}">
                <button type="button" class="pickup-save" data-save-pickup data-i18n-title="adminSavePickup" aria-label="${AB.esc(AB.t('adminSavePickup'))}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"></path></svg>
                </button>
              </div>
              ${pickupPassed ? `<span class="pickup-passed">${AB.esc(AB.t('adminPickupPassed'))}</span>` : ''}
            </label>
          </div>
        </div>
        <div class="order-actions">
          <span class="order-actions__label">${AB.esc(AB.t('adminActions'))}</span>
          ${
            quick
              ? `<button type="button" class="admin-btn admin-btn--${quick.style}" data-quick-status="${quick.next}">
                  ${AB.esc(quick.label)}
                </button>`
              : ''
          }
          ${
            canCancel
              ? `<button type="button" class="admin-btn admin-btn--ghost" data-quick-status="cancelled">
                  ${AB.esc(AB.t('adminCancelOrder'))}
                </button>`
              : ''
          }
        </div>
      </article>`;
  }

  function emptyBlock(title, text, retry = false) {
    return `<div class="admin-empty">
      <h3>${AB.esc(title)}</h3>
      <p>${AB.esc(text)}</p>
      ${retry ? `<button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-reload style="margin-top:14px">${AB.esc(AB.t('adminRetry'))}</button>` : ''}
    </div>`;
  }

  function renderOrders() {
    if (!refs.ordersList) return;
    if (!state.authed) return;
    if (state.loadError) {
      refs.ordersList.innerHTML = emptyBlock(AB.t('adminError'), AB.t('errNetwork'), true);
      return;
    }
    if (!state.orders.length) {
      refs.ordersList.innerHTML = emptyBlock(AB.t('adminNoOrders'), AB.t('adminNoOrdersText'));
      return;
    }
    const list = filteredOrders();
    if (!list.length) {
      refs.ordersList.innerHTML = emptyBlock(AB.t('adminNoOrders'), AB.t('adminSearchEmpty'));
      return;
    }
    refs.ordersList.innerHTML = list.map(orderCardHtml).join('');
  }

  function productPayloadFrom(product, overrides = {}) {
    return {
      nameUz: product.name?.uz || '',
      nameRu: product.name?.ru || '',
      descUz: product.desc?.uz || '',
      descRu: product.desc?.ru || '',
      category: product.category,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
      active: product.active,
      ...overrides
    };
  }

  function filteredProducts() {
    const query = state.productSearch.trim().toLowerCase();
    return state.products.filter((product) => {
      if (state.categoryFilter !== 'all' && product.category !== state.categoryFilter) return false;
      if (!query) return true;
      return [product.name?.uz, product.name?.ru, product.desc?.uz, product.desc?.ru]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  function renderProducts() {
    if (!refs.productsBody) return;
    if (!state.authed) return;
    if (state.loadError) {
      refs.productsBody.innerHTML = '';
      refs.productsEmpty.hidden = false;
      refs.productsEmpty.innerHTML = emptyBlock(AB.t('adminError'), AB.t('errNetwork'), true);
      return;
    }
    const list = filteredProducts();
    refs.productsCountBadge.textContent = String(state.products.length);
    refs.productsEmpty.hidden = list.length > 0;

    if (!list.length) {
      refs.productsBody.innerHTML = '';
      refs.productsEmpty.innerHTML = state.products.length
        ? emptyBlock(AB.t('adminNoProducts'), AB.t('adminSearchEmpty'))
        : emptyBlock(AB.t('adminNoProducts'), AB.t('adminAddProduct'));
      return;
    }

    refs.productsBody.innerHTML = list
      .map((product) => {
        const name = product.name?.[AB.lang] || product.name?.uz || '';
        const other = AB.lang === 'ru' ? product.name?.uz : product.name?.ru;
        const stockClass = product.stock <= 0 ? 'is-out' : product.stock <= 5 ? 'is-low' : '';
        const statusClass = product.archived
          ? 'is-archived'
          : product.active
            ? ''
            : 'is-hidden';
        const statusLabel = product.archived
          ? AB.t('adminArchived')
          : product.active
            ? AB.t('adminShown')
            : AB.t('adminHidden');
        return `<tr class="${product.archived ? 'is-archived' : ''}" data-product="${product.id}">
          <td>
            <div class="table-product">
              <img src="${AB.esc(product.image || '/assets/img/box.svg')}" alt="" width="44" height="44">
              <div class="table-product__names">
                <strong>${AB.esc(name)}</strong>
                <span>${AB.esc(other || '')}</span>
              </div>
            </div>
          </td>
          <td><span class="table-category">${AB.esc(AB.catName(product.category))}</span></td>
          <td><div class="table-price">${AB.price(product.price)}<small>${AB.esc(AB.unit(product.unit))}</small></div></td>
          <td>
            <div class="stock-stepper ${stockClass}">
              <button type="button" data-stock-delta="-1" data-id="${product.id}" aria-label="-1">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path></svg>
              </button>
              <button type="button" class="stock-number" data-stock-edit="${product.id}" title="${AB.esc(AB.t('adminQuickStock'))}">${product.stock}</button>
              <button type="button" data-stock-delta="1" data-id="${product.id}" aria-label="+1">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
              </button>
            </div>
          </td>
          <td>
            <div class="table-status">
              <span class="status-text ${statusClass}">${AB.esc(statusLabel)}</span>
              <label class="switch" title="${AB.esc(AB.t('adminActive'))}">
                <input type="checkbox" data-product-active data-id="${product.id}" ${product.active && !product.archived ? 'checked' : ''}>
                <span class="switch__ui" aria-hidden="true"></span>
              </label>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="table-action" data-edit-product="${product.id}" title="${AB.esc(AB.t('adminEdit'))}" aria-label="${AB.esc(AB.t('adminEdit'))}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg>
              </button>
              ${
                product.archived
                  ? `<button type="button" class="table-action" data-restore-product="${product.id}" title="${AB.esc(AB.t('adminRestore'))}" aria-label="${AB.esc(AB.t('adminRestore'))}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 2 6"></path><path d="M4 4v6h6"></path></svg>
                    </button>`
                  : `<button type="button" class="table-action table-action--danger" data-archive-product="${product.id}" title="${AB.esc(AB.t('adminArchive'))}" aria-label="${AB.esc(AB.t('adminArchive'))}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V4h6v2M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg>
                    </button>`
              }
            </div>
          </td>
        </tr>`;
      })
      .join('');
  }

  function fillSettingsForm() {
    const settings = state.settings;
    if (!settings) return;
    refs.stPhone.value = settings.phone || '';
    refs.stPhone2.value = settings.phone2 || '';
    refs.stAddressUz.value = settings.address?.uz || '';
    refs.stAddressRu.value = settings.address?.ru || '';
    refs.stLandmarkUz.value = settings.landmark?.uz || '';
    refs.stLandmarkRu.value = settings.landmark?.ru || '';
    refs.stHoursUz.value = settings.hours?.uz || '';
    refs.stHoursRu.value = settings.hours?.ru || '';
    refs.stPickupUz.value = settings.pickupNote?.uz || '';
    refs.stPickupRu.value = settings.pickupNote?.ru || '';
  }

  function populatePickers() {
    const categoryOptions = AB.categories
      .map(
        (category) =>
          `<option value="${category.key}">${AB.esc(AB.catName(category.key))}</option>`
      )
      .join('');
    refs.pfCategory.innerHTML = categoryOptions;
    refs.pfUnit.innerHTML = Object.keys(AB.units)
      .map((key) => `<option value="${key}">${AB.esc(AB.unit(key))}</option>`)
      .join('');
    refs.productCategoryFilter.innerHTML =
      `<option value="all">${AB.esc(AB.t('adminAllCategories'))}</option>` +
      AB.categories
        .map(
          (category) =>
            `<option value="${category.key}">${AB.esc(AB.catName(category.key))}</option>`
        )
        .join('');
    if (!AB.categories.some((category) => category.key === state.categoryFilter)) {
      state.categoryFilter = 'all';
    }
    refs.productCategoryFilter.value = state.categoryFilter;
  }

  function switchTab(tab, { updateHash = true } = {}) {
    if (!['orders', 'products', 'settings'].includes(tab)) tab = 'orders';
    state.tab = tab;
    $$('.side-link').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.tab === tab);
    });
    for (const key of ['orders', 'products', 'settings']) {
      const panel = document.getElementById(`tab-${key}`);
      if (panel) panel.hidden = key !== tab;
    }
    const titles = {
      orders: 'adminOrdersTitle',
      products: 'adminProductsTitle',
      settings: 'adminSettingsTitle'
    };
    refs.pageTitle.setAttribute('data-i18n', titles[tab]);
    refs.pageTitle.textContent = AB.t(titles[tab]);
    if (updateHash) {
      try {
        history.replaceState(null, '', `#${tab}`);
      } catch {
        /* file:// or blocked history */
      }
    }
    if (tab === 'orders') {
      renderOrders();
      renderStats();
    } else if (tab === 'products') {
      renderProducts();
      renderStats();
    }
  }

  async function loadOrders({ silent = false } = {}) {
    if (!silent) {
      refs.ordersList.innerHTML = `<div class="admin-loading">${AB.esc(AB.t('adminLoading'))}</div>`;
    }
    try {
      const data = await api('/api/admin/orders');
      const previousIds = knownOrderIds;
      const fresh = data.orders.filter((order) => !previousIds.has(order.id));
      state.orders = data.orders;
      knownOrderIds = new Set(state.orders.map((order) => order.id));
      state.loadError = false;
      renderStats();
      renderOrderFilters();
      renderOrders();
      if (fresh.length && previousIds.size) {
        showToast(`${AB.t('adminStatsNew')}: ${fresh[0].code}`);
      }
    } catch (error) {
      if (error.code === 'unauthorized') return;
      state.loadError = true;
      renderOrders();
      if (!silent) showToast(AB.t('adminError'), true);
    }
  }

  async function loadProducts() {
    try {
      const data = await api('/api/admin/products');
      state.products = data.products;
      state.loadError = false;
      renderProducts();
      renderStats();
    } catch (error) {
      if (error.code === 'unauthorized') return;
      state.loadError = true;
      renderProducts();
      showToast(AB.t('adminError'), true);
    }
  }

  async function loadSettings() {
    try {
      const data = await api('/api/admin/settings');
      state.settings = data.settings;
      fillSettingsForm();
    } catch (error) {
      if (error.code === 'unauthorized') return;
      showToast(AB.t('adminError'), true);
    }
  }

  async function loadCategories({ silent = false } = {}) {
    try {
      const data = await api('/api/admin/categories');
      state.categories = data.categories;
      AB.setCategories(state.categories);
      populatePickers();
      renderCategoryList();
      renderProducts();
      renderStats();
    } catch (error) {
      if (error.code !== 'unauthorized' && !silent) {
        showToast(error.message || AB.t('adminError'), true);
      }
    }
  }

  async function loadDrivers({ silent = false } = {}) {
    try {
      const data = await api('/api/admin/drivers');
      state.drivers = data.drivers;
      renderDrivers();
    } catch (error) {
      if (error.code !== 'unauthorized' && !silent) {
        showToast(error.message || AB.t('adminError'), true);
      }
    }
  }

  function renderCategoryList() {
    if (!refs.categoryList) return;
    if (!state.categories.length) {
      refs.categoryList.innerHTML = `<div class="admin-empty"><h3>${AB.esc(AB.t('adminNoCategories'))}</h3></div>`;
      return;
    }
    refs.categoryList.innerHTML = state.categories
      .map((category) => {
        const name = category.name?.[AB.lang] || category.name?.uz || category.id;
        const other = AB.lang === 'ru' ? category.name?.uz : category.name?.ru;
        const active = state.editingCategoryId === category.id;
        return `<div class="category-row ${active ? 'is-editing' : ''}" data-category-row="${category.id}">
          <img src="${AB.esc(category.image || '/assets/img/box.svg')}" alt="" width="38" height="38">
          <div class="category-row__info">
            <div class="category-row__name">${AB.esc(name)}</div>
            <span>${AB.esc(other || '')} · ${AB.esc(AB.itemCount(category.productCount || 0))}</span>
          </div>
          <div class="category-row__actions">
            <button type="button" class="table-action" data-edit-category="${category.id}" title="${AB.esc(AB.t('adminEdit'))}" aria-label="${AB.esc(AB.t('adminEdit'))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg>
            </button>
            <button type="button" class="table-action table-action--danger" data-delete-category="${category.id}" title="${AB.esc(AB.t('adminArchive'))}" aria-label="${AB.esc(AB.t('adminArchive'))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V4h6v2M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg>
            </button>
          </div>
        </div>`;
      })
      .join('');
  }

  function resetCategoryForm() {
    state.editingCategoryId = null;
    state.categoryImageData = null;
    refs.categoryForm.reset();
    refs.categoryFormTitle.removeAttribute('data-i18n');
    refs.categoryFormTitle.textContent = AB.t('adminAddCategory');
    refs.cancelCategoryEdit.hidden = true;
    refs.categoryFormError.hidden = true;
    refs.categoryFormError.textContent = '';
    refs.categoryImagePreview.src = '/assets/img/box.svg';
    refs.categoryImageInput.value = '';
    renderCategoryList();
  }

  function editCategory(id) {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;
    state.editingCategoryId = id;
    state.categoryImageData = null;
    refs.cfNameUz.value = category.name?.uz || '';
    refs.cfNameRu.value = category.name?.ru || '';
    refs.cfBlurbUz.value = category.blurb?.uz || '';
    refs.cfBlurbRu.value = category.blurb?.ru || '';
    refs.categoryImagePreview.src = category.image || '/assets/img/box.svg';
    refs.categoryImageInput.value = '';
    refs.categoryFormError.hidden = true;
    refs.categoryFormTitle.removeAttribute('data-i18n');
    refs.categoryFormTitle.textContent = AB.t('adminEditCategory');
    refs.cancelCategoryEdit.hidden = false;
    renderCategoryList();
    refs.cfNameUz.focus();
  }

  function openCategoryModal() {
    openAdminModal(refs.categoryModal);
    loadCategories({ silent: true });
    resetCategoryForm();
  }

  async function submitCategory(event) {
    event.preventDefault();
    refs.categoryFormError.hidden = true;
    const nameUz = refs.cfNameUz.value.trim();
    const nameRu = refs.cfNameRu.value.trim();
    if (nameUz.length < 2 || nameRu.length < 2) {
      refs.categoryFormError.hidden = false;
      refs.categoryFormError.textContent = AB.t('adminRequired');
      return;
    }
    const payload = {
      nameUz,
      nameRu,
      blurbUz: refs.cfBlurbUz.value.trim(),
      blurbRu: refs.cfBlurbRu.value.trim()
    };
    if (state.categoryImageData) payload.imageData = state.categoryImageData;
    setBusy(refs.saveCategoryBtn, true, 'adminSave', 'adminSaving');
    try {
      await api(
        state.editingCategoryId
          ? `/api/admin/categories/${state.editingCategoryId}`
          : '/api/admin/categories',
        {
          method: state.editingCategoryId ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );
      await loadCategories({ silent: true });
      resetCategoryForm();
      showToast(AB.t('adminCategorySaved'));
    } catch (error) {
      if (error.code !== 'unauthorized') {
        refs.categoryFormError.hidden = false;
        refs.categoryFormError.textContent = error.message || AB.t('errGeneric');
      }
    } finally {
      setBusy(refs.saveCategoryBtn, false, 'adminSave', 'adminSaving');
    }
  }

  async function deleteCategory(id) {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;
    const name = category.name?.[AB.lang] || category.name?.uz || '';
    const confirmed = await askConfirm({
      title: AB.t('adminCategoryDeleteTitle'),
      text: `${name}. ${AB.t('adminCategoryDeleteText')}`,
      confirmLabel: AB.t('adminCategoryDeleteConfirm'),
      danger: true
    });
    if (!confirmed) return;
    try {
      await api(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (state.editingCategoryId === id) resetCategoryForm();
      await loadCategories({ silent: true });
      showToast(AB.t('adminCategoryDeleted'));
    } catch (error) {
      if (error.code === 'category_in_use') {
        const count = error.details?.count || 0;
        refs.categoryFormError.hidden = false;
        refs.categoryFormError.textContent = AB.t('adminCategoryInUse', { n: count });
        showToast(AB.t('adminCategoryInUse', { n: count }), true);
      } else if (error.code !== 'unauthorized') {
        showToast(error.message || AB.t('errGeneric'), true);
      }
    }
  }

  function renderDrivers() {
    if (!refs.driversList) return;
    if (!state.drivers.length) {
      refs.driversList.innerHTML = `<div class="admin-empty" style="grid-column:1/-1">
        <h3>${AB.esc(AB.t('adminNoDrivers'))}</h3>
        <p>${AB.esc(AB.t('adminNoDriversText'))}</p>
      </div>`;
      return;
    }
    refs.driversList.innerHTML = state.drivers
      .map((driver) => {
        const initial = (driver.name || '?').trim().charAt(0).toUpperCase();
        return `<article class="driver-row" data-driver-row="${driver.id}">
          <span class="driver-row__avatar" aria-hidden="true">${AB.esc(initial)}</span>
          <div class="driver-row__info">
            <div class="driver-row__name">${AB.esc(driver.name)}</div>
            <a href="tel:${AB.esc(driver.phone.replace(/[^\d+]/g, ''))}">${AB.esc(driver.phone)}</a>
            <span>${AB.esc(driver.area || AB.t('adminNoAddress'))}${driver.note ? ` · ${AB.esc(driver.note)}` : ''}</span>
          </div>
          <div class="driver-row__actions">
            <div class="driver-row__status">
              <span class="${driver.active ? 'is-active' : 'is-inactive'}">${AB.esc(driver.active ? AB.t('adminShown') : AB.t('adminHidden'))}</span>
              <label class="switch" title="${AB.esc(AB.t('adminDriverActive'))}">
                <input type="checkbox" data-driver-active data-id="${driver.id}" ${driver.active ? 'checked' : ''}>
                <span class="switch__ui" aria-hidden="true"></span>
              </label>
            </div>
            <button type="button" class="table-action" data-edit-driver="${driver.id}" title="${AB.esc(AB.t('adminEdit'))}" aria-label="${AB.esc(AB.t('adminEdit'))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg>
            </button>
            <button type="button" class="table-action table-action--danger" data-delete-driver="${driver.id}" title="${AB.esc(AB.t('adminArchive'))}" aria-label="${AB.esc(AB.t('adminArchive'))}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V4h6v2M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg>
            </button>
          </div>
        </article>`;
      })
      .join('');
  }

  function openDriverModal(driver = null) {
    state.editingDriverId = driver?.id || null;
    refs.driverForm.reset();
    refs.driverFormTitle.removeAttribute('data-i18n');
    refs.driverFormTitle.textContent = AB.t(driver ? 'adminEditDriver' : 'adminAddDriver');
    refs.dfName.value = driver?.name || '';
    refs.dfPhone.value = driver?.phone || '';
    refs.dfArea.value = driver?.area || '';
    refs.dfNote.value = driver?.note || '';
    refs.dfActive.checked = driver ? Boolean(driver.active) : true;
    refs.dfActiveText.textContent = AB.t(refs.dfActive.checked ? 'adminShown' : 'adminHidden');
    refs.driverFormError.hidden = true;
    refs.driverFormError.textContent = '';
    openAdminModal(refs.driverModal);
    setTimeout(() => refs.dfName.focus(), 100);
  }

  async function submitDriver(event) {
    event.preventDefault();
    refs.driverFormError.hidden = true;
    const name = refs.dfName.value.trim();
    const phone = refs.dfPhone.value.trim();
    if (name.length < 2 || phone.replace(/\D/g, '').length < 9) {
      refs.driverFormError.hidden = false;
      refs.driverFormError.textContent = AB.t('adminRequired');
      return;
    }
    const payload = {
      name,
      phone,
      area: refs.dfArea.value.trim(),
      note: refs.dfNote.value.trim(),
      active: refs.dfActive.checked
    };
    setBusy(refs.saveDriverBtn, true, 'adminSave', 'adminSaving');
    try {
      await api(
        state.editingDriverId ? `/api/admin/drivers/${state.editingDriverId}` : '/api/admin/drivers',
        {
          method: state.editingDriverId ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );
      if (refs.driverModal.open) refs.driverModal.close();
      await loadDrivers({ silent: true });
      showToast(AB.t('adminDriverSaved'));
    } catch (error) {
      if (error.code !== 'unauthorized') {
        refs.driverFormError.hidden = false;
        refs.driverFormError.textContent = error.message || AB.t('errGeneric');
      }
    } finally {
      setBusy(refs.saveDriverBtn, false, 'adminSave', 'adminSaving');
    }
  }

  async function toggleDriverActive(id, active) {
    const driver = state.drivers.find((item) => item.id === id);
    if (!driver) return;
    try {
      await api(`/api/admin/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: driver.name,
          phone: driver.phone,
          area: driver.area,
          note: driver.note,
          active
        })
      });
      await loadDrivers({ silent: true });
      showToast(AB.t('adminDriverSaved'));
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
      renderDrivers();
    }
  }

  async function deleteDriver(id) {
    const driver = state.drivers.find((item) => item.id === id);
    if (!driver) return;
    const confirmed = await askConfirm({
      title: AB.t('adminDriverDeleteTitle'),
      text: `${driver.name}. ${AB.t('adminDriverDeleteText')}`,
      confirmLabel: AB.t('adminDriverDeleteConfirm'),
      danger: true
    });
    if (!confirmed) return;
    try {
      await api(`/api/admin/drivers/${id}`, { method: 'DELETE' });
      await loadDrivers({ silent: true });
      showToast(AB.t('adminDriverDeleted'));
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
    }
  }

  async function loadAll() {
    showDashboard();
    state.loadError = false;
    refs.ordersList.innerHTML = `<div class="admin-loading">${AB.esc(AB.t('adminLoading'))}</div>`;
    refs.productsBody.innerHTML = '';
    refs.productsEmpty.hidden = false;
    refs.productsEmpty.innerHTML = `<div class="admin-loading">${AB.esc(AB.t('adminLoading'))}</div>`;
    try {
      const [ordersData, productsData, settingsData, categoriesData, driversData] = await Promise.all([
        api('/api/admin/orders'),
        api('/api/admin/products'),
        api('/api/admin/settings'),
        api('/api/admin/categories'),
        api('/api/admin/drivers')
      ]);
      state.orders = ordersData.orders;
      state.products = productsData.products;
      state.settings = settingsData.settings;
      state.categories = categoriesData.categories;
      state.drivers = driversData.drivers;
      AB.setCategories(state.categories);
      knownOrderIds = new Set(state.orders.map((order) => order.id));
      state.loadError = false;
      populatePickers();
      fillSettingsForm();
      renderStats();
      renderOrderFilters();
      renderOrders();
      renderProducts();
      renderCategoryList();
      renderDrivers();
      switchTab(state.tab, { updateHash: false });
    } catch (error) {
      if (error.code === 'unauthorized') return;
      state.loadError = true;
      renderOrders();
      renderProducts();
      showToast(AB.t('adminError'), true);
    }
  }

  async function checkSession() {
    try {
      const data = await api('/api/me', {}, { admin: false });
      if (data.authed) {
        refs.adminUser.textContent = data.username || 'admin';
        state.tab = ['orders', 'products', 'settings'].includes(location.hash.slice(1))
          ? location.hash.slice(1)
          : 'orders';
        showDashboard();
        await loadAll();
      } else {
        showLogin();
      }
    } catch {
      showLogin();
      showToast(AB.t('errNetwork'), true);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    refs.loginError.hidden = true;
    const username = refs.loginUser.value.trim();
    const password = refs.loginPass.value;
    if (!username || !password) {
      refs.loginError.hidden = false;
      refs.loginError.textContent = AB.t('adminLoginRequired');
      return;
    }
    setBusy(refs.loginBtn, true, 'adminLoginBtn', 'adminLoginWait');
    try {
      const data = await api(
        '/api/login',
        { method: 'POST', body: JSON.stringify({ username, password }) },
        { admin: false }
      );
      refs.adminUser.textContent = data.username || username;
      refs.loginPass.value = '';
      showDashboard();
      state.tab = 'orders';
      await loadAll();
    } catch (error) {
      refs.loginError.hidden = false;
      if (error.status === 429) {
        refs.loginError.textContent = AB.lang === 'ru'
          ? 'Слишком много попыток. Попробуйте позже.'
          : "Juda ko'p urinish. Keyinroq qayta urinib ko'ring.";
      } else if (error.code === 'network') {
        refs.loginError.textContent = AB.t('errNetwork');
      } else {
        refs.loginError.textContent = AB.t('adminLoginError');
      }
    } finally {
      setBusy(refs.loginBtn, false, 'adminLoginBtn', 'adminLoginWait');
    }
  }

  async function logout() {
    try {
      await api('/api/logout', { method: 'POST' }, { admin: false });
    } catch {
      /* the local session is cleared anyway */
    }
    state.orders = [];
    state.products = [];
    showLogin();
    refs.loginPass.value = '';
  }

  async function updateOrder(id, payload, successMessage) {
    if (state.busyOrders.has(id)) return;
    state.busyOrders.add(id);
    try {
      const data = await api(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      const index = state.orders.findIndex((order) => order.id === id);
      if (index >= 0) state.orders[index] = data.order;
      renderOrders();
      renderStats();
      renderOrderFilters();
      showToast(successMessage);
    } catch (error) {
      renderOrders();
      if (error.code === 'insufficient_stock') {
        showToast(AB.t('errStock'), true);
      } else if (error.code !== 'unauthorized') {
        showToast(error.message || AB.t('errGeneric'), true);
      }
    } finally {
      state.busyOrders.delete(id);
    }
  }

  async function changeOrderStatus(id, status) {
    if (status === 'cancelled') {
      const confirmed = await askConfirm({
        title: AB.t('adminCancelConfirmTitle'),
        text: AB.t('adminCancelConfirmText'),
        confirmLabel: AB.t('adminCancelConfirm'),
        danger: true
      });
      if (!confirmed) {
        renderOrders();
        return;
      }
    }
    await updateOrder(id, { status }, AB.t('adminStatusSaved'));
  }

  function askConfirm({ title, text, confirmLabel, danger = true }) {
    if (confirmResolver) settleConfirm(false);
    refs.confirmTitle.textContent = title;
    refs.confirmText.textContent = text;
    refs.confirmOk.textContent = confirmLabel;
    refs.confirmOk.classList.toggle('admin-btn--danger', danger);
    refs.confirmOk.classList.toggle('admin-btn--primary', !danger);
    if (!refs.confirmModal.open) refs.confirmModal.showModal();
    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  function settleConfirm(value) {
    const resolver = confirmResolver;
    confirmResolver = null;
    if (refs.confirmModal.open) refs.confirmModal.close();
    resolver?.(value);
  }

  async function savePickup(orderId, input) {
    if (!input.value) {
      showToast(AB.t('adminError'), true);
      return;
    }
    const iso = AB.fromLocalInput(input.value);
    if (!iso) {
      showToast(AB.t('adminError'), true);
      return;
    }
    await updateOrder(orderId, { pickupAt: iso }, AB.t('adminPickupSaved'));
  }

  function openProductModal(product = null) {
    state.editingId = product?.id || null;
    state.imageData = null;
    state.currentImage = product?.image || '/assets/img/box.svg';
    populatePickers();
    refs.productModalTitle.removeAttribute('data-i18n');
    refs.productModalTitle.textContent = AB.t(product ? 'adminEditProduct' : 'adminNewProduct');
    refs.pfNameUz.value = product?.name?.uz || '';
    refs.pfNameRu.value = product?.name?.ru || '';
    refs.pfDescUz.value = product?.desc?.uz || '';
    refs.pfDescRu.value = product?.desc?.ru || '';
    refs.pfCategory.value = product?.category || AB.categories[0]?.key || '';
    refs.pfUnit.value = product?.unit || 'dona';
    refs.pfPrice.value = product?.price ?? '';
    refs.pfStock.value = product?.stock ?? 0;
    refs.pfActive.checked = product ? Boolean(product.active && !product.archived) : true;
    refs.pfActiveText.textContent = AB.t(refs.pfActive.checked ? 'adminShown' : 'adminHidden');
    refs.productImagePreview.src = state.currentImage;
    refs.productImagePreview.dataset.fallback = '';
    refs.productImageInput.value = '';
    refs.productFormError.hidden = true;
    refs.productFormError.textContent = '';
    if (!refs.productModal.open) refs.productModal.showModal();
    setTimeout(() => refs.pfNameUz.focus(), 100);
  }

  function closeProductModal() {
    if (refs.productModal.open) refs.productModal.close();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('decode_failed'));
      image.src = src;
    });
  }

  async function compressImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('type');
    if (file.size > 8 * 1024 * 1024) throw new Error('size');
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);
    const maxSide = 1200;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#f2ede3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  async function handleImageFile(file) {
    if (!file) return;
    refs.productFormError.hidden = true;
    try {
      const dataUrl = await compressImage(file);
      state.imageData = dataUrl;
      refs.productImagePreview.src = dataUrl;
    } catch (error) {
      refs.productFormError.hidden = false;
      refs.productFormError.textContent =
        error.message === 'size'
          ? AB.lang === 'ru'
            ? 'Фото больше 8 МБ. Выберите файл меньше.'
            : "Rasm 8 MB dan katta. Kichikroq fayl tanlang."
          : AB.t('adminImageHint');
    }
  }

  async function handleCategoryImageFile(file) {
    if (!file) return;
    refs.categoryFormError.hidden = true;
    try {
      const dataUrl = await compressImage(file);
      state.categoryImageData = dataUrl;
      refs.categoryImagePreview.src = dataUrl;
    } catch (error) {
      refs.categoryFormError.hidden = false;
      refs.categoryFormError.textContent =
        error.message === 'size'
          ? AB.lang === 'ru'
            ? 'Фото больше 8 МБ. Выберите файл меньше.'
            : "Rasm 8 MB dan katta. Kichikroq fayl tanlang."
          : AB.t('adminImageHint');
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    refs.productFormError.hidden = true;
    const nameUz = refs.pfNameUz.value.trim();
    const nameRu = refs.pfNameRu.value.trim();
    const price = Number(refs.pfPrice.value);
    const stock = Number(refs.pfStock.value);
    if (
      nameUz.length < 2 ||
      nameRu.length < 2 ||
      !refs.pfCategory.value ||
      !refs.pfUnit.value ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      refs.productFormError.hidden = false;
      refs.productFormError.textContent = AB.t('adminRequired');
      return;
    }

    const payload = {
      nameUz,
      nameRu,
      descUz: refs.pfDescUz.value.trim(),
      descRu: refs.pfDescRu.value.trim(),
      category: refs.pfCategory.value,
      unit: refs.pfUnit.value,
      price,
      stock,
      active: refs.pfActive.checked
    };
    if (state.imageData) payload.imageData = state.imageData;

    setBusy(refs.saveProductBtn, true, 'adminSave', 'adminSaving');
    try {
      const url = state.editingId
        ? `/api/admin/products/${state.editingId}`
        : '/api/admin/products';
      await api(url, {
        method: state.editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      closeProductModal();
      await loadProducts();
      renderStats();
      showToast(AB.t('adminProductSaved'));
    } catch (error) {
      if (error.code === 'unauthorized') return;
      refs.productFormError.hidden = false;
      refs.productFormError.textContent =
        error.message || AB.t('errGeneric');
    } finally {
      setBusy(refs.saveProductBtn, false, 'adminSave', 'adminSaving');
    }
  }

  async function changeStock(id, delta) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    try {
      const data = await api(`/api/admin/products/${id}/stock`, {
        method: 'POST',
        body: JSON.stringify({ delta })
      });
      const index = state.products.findIndex((item) => item.id === id);
      if (index >= 0) state.products[index] = data.product;
      renderProducts();
      renderStats();
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
    }
  }

  async function toggleProductActive(id, active) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    try {
      const data = await api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productPayloadFrom(product, { active }))
      });
      const index = state.products.findIndex((item) => item.id === id);
      if (index >= 0) state.products[index] = data.product;
      renderProducts();
      renderStats();
      showToast(active ? AB.t('adminProductRestored') : AB.t('adminProductSaved'));
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
      renderProducts();
    }
  }

  async function archiveProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    const confirmed = await askConfirm({
      title: AB.t('adminArchiveTitle'),
      text: AB.t('adminArchiveText'),
      confirmLabel: AB.t('adminArchiveConfirm'),
      danger: true
    });
    if (!confirmed) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      await loadProducts();
      renderStats();
      showToast(AB.t('adminProductArchived'));
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
    }
  }

  async function restoreProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    try {
      const data = await api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productPayloadFrom(product, { active: true }))
      });
      const index = state.products.findIndex((item) => item.id === id);
      if (index >= 0) state.products[index] = data.product;
      renderProducts();
      renderStats();
      showToast(AB.t('adminProductRestored'));
    } catch (error) {
      if (error.code !== 'unauthorized') showToast(error.message || AB.t('errGeneric'), true);
    }
  }

  async function submitSettings(event) {
    event.preventDefault();
    refs.settingsError.hidden = true;
    const payload = {
      phone: refs.stPhone.value.trim(),
      phone2: refs.stPhone2.value.trim(),
      addressUz: refs.stAddressUz.value.trim(),
      addressRu: refs.stAddressRu.value.trim(),
      landmarkUz: refs.stLandmarkUz.value.trim(),
      landmarkRu: refs.stLandmarkRu.value.trim(),
      hoursUz: refs.stHoursUz.value.trim(),
      hoursRu: refs.stHoursRu.value.trim(),
      pickupNoteUz: refs.stPickupUz.value.trim(),
      pickupNoteRu: refs.stPickupRu.value.trim()
    };
    if (!payload.phone || !payload.addressUz || !payload.addressRu || !payload.hoursUz || !payload.hoursRu) {
      refs.settingsError.hidden = false;
      refs.settingsError.textContent = AB.t('adminRequired');
      return;
    }
    setBusy(refs.saveSettingsBtn, true, 'adminSaveSettings', 'adminSaving');
    try {
      const data = await api('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      state.settings = data.settings;
      fillSettingsForm();
      showToast(AB.t('adminSettingsSaved'));
    } catch (error) {
      if (error.code === 'unauthorized') return;
      refs.settingsError.hidden = false;
      refs.settingsError.textContent = error.message || AB.t('errGeneric');
    } finally {
      setBusy(refs.saveSettingsBtn, false, 'adminSaveSettings', 'adminSaving');
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    refs.passwordError.hidden = true;
    const current = refs.pwCurrent.value;
    const next = refs.pwNew.value;
    const repeat = refs.pwRepeat.value;
    if (next.length < 8) {
      refs.passwordError.hidden = false;
      refs.passwordError.textContent = AB.t('adminPasswordShort');
      return;
    }
    if (next !== repeat) {
      refs.passwordError.hidden = false;
      refs.passwordError.textContent = AB.t('adminPasswordMismatch');
      return;
    }
    setBusy(refs.changePasswordBtn, true, 'adminChangePassword', 'adminSaving');
    try {
      await api('/api/admin/password', {
        method: 'POST',
        body: JSON.stringify({ current, next })
      });
      refs.passwordForm.reset();
      showLogin();
      showToast(AB.t('adminPasswordChanged'));
    } catch (error) {
      if (error.code === 'wrong_password') {
        refs.passwordError.hidden = false;
        refs.passwordError.textContent = AB.t('adminWrongPassword');
      } else if (error.code !== 'unauthorized') {
        refs.passwordError.hidden = false;
        refs.passwordError.textContent = error.message || AB.t('errGeneric');
      }
    } finally {
      setBusy(refs.changePasswordBtn, false, 'adminChangePassword', 'adminSaving');
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(async () => {
      if (!state.authed || document.hidden || state.tab !== 'orders') return;
      if (document.querySelector('dialog[open]')) return;
      if (refs.ordersList.contains(document.activeElement)) return;
      try {
        const data = await api('/api/admin/orders');
        const fresh = data.orders.filter((order) => !knownOrderIds.has(order.id));
        state.orders = data.orders;
        knownOrderIds = new Set(state.orders.map((order) => order.id));
        renderStats();
        renderOrderFilters();
        renderOrders();
        if (fresh.length) showToast(`${AB.t('adminStatsNew')}: ${fresh[0].code}`);
      } catch {
        /* silent background refresh */
      }
    }, 25000);
  }

  function bindEvents() {
    $$('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => AB.setLang(button.getAttribute('data-lang')));
    });

    window.addEventListener('ab:langchange', () => {
      updateTitle();
      updateToday();
      if (state.authed) {
        const categoryValue = refs.pfCategory.value;
        const unitValue = refs.pfUnit.value;
        populatePickers();
        if (refs.productModal.open) {
          if (state.editingId) {
            const product = state.products.find((item) => item.id === state.editingId);
            if (product) refs.pfCategory.value = product.category;
          } else if (AB.categories[0]) {
            refs.pfCategory.value = AB.categories[0].key;
          }
          if (unitValue) refs.pfUnit.value = unitValue;
        } else if (categoryValue) {
          refs.pfCategory.value = categoryValue;
        }
        renderStats();
        renderOrderFilters();
        renderOrders();
        renderProducts();
        renderCategoryList();
        renderDrivers();
        refs.pageTitle.textContent = AB.t(
          state.tab === 'orders' ? 'adminOrdersTitle' : state.tab === 'products' ? 'adminProductsTitle' : 'adminSettingsTitle'
        );
        if (refs.productModal.open) {
          refs.productModalTitle.textContent = AB.t(state.editingId ? 'adminEditProduct' : 'adminNewProduct');
          refs.pfActiveText.textContent = AB.t(refs.pfActive.checked ? 'adminShown' : 'adminHidden');
        }
        if (refs.categoryModal.open) {
          refs.categoryFormTitle.textContent = AB.t(state.editingCategoryId ? 'adminEditCategory' : 'adminAddCategory');
        }
        if (refs.driverModal.open) {
          refs.driverFormTitle.textContent = AB.t(state.editingDriverId ? 'adminEditDriver' : 'adminAddDriver');
          refs.dfActiveText.textContent = AB.t(refs.dfActive.checked ? 'adminShown' : 'adminHidden');
        }
      }
    });

    refs.loginForm.addEventListener('submit', submitLogin);
    refs.loginPassToggle.addEventListener('click', () => {
      const isPassword = refs.loginPass.type === 'password';
      refs.loginPass.type = isPassword ? 'text' : 'password';
      refs.loginPassToggle.setAttribute(
        'aria-label',
        isPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"
      );
    });
    refs.logoutBtn.addEventListener('click', logout);

    $$('.side-link').forEach((button) => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    refs.refreshOrders.addEventListener('click', async () => {
      refs.refreshOrders.disabled = true;
      await loadOrders({ silent: true });
      refs.refreshOrders.disabled = false;
    });

    refs.orderStatusChips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-status-filter]');
      if (!button) return;
      state.statusFilter = button.dataset.statusFilter;
      renderOrderFilters();
      renderOrders();
    });

    refs.orderSearch.addEventListener('input', () => {
      state.orderSearch = refs.orderSearch.value;
      renderOrders();
    });

    refs.ordersList.addEventListener('change', async (event) => {
      const select = event.target.closest('[data-order-status]');
      if (!select) return;
      const card = select.closest('[data-order]');
      if (!card) return;
      const order = state.orders.find((item) => item.id === card.dataset.order);
      if (!order || select.value === order.status) return;
      await changeOrderStatus(order.id, select.value);
    });

    refs.ordersList.addEventListener('click', async (event) => {
      const card = event.target.closest('[data-order]');
      if (!card) return;
      const order = state.orders.find((item) => item.id === card.dataset.order);
      if (!order) return;

      const quick = event.target.closest('[data-quick-status]');
      if (quick) {
        quick.disabled = true;
        await changeOrderStatus(order.id, quick.dataset.quickStatus);
        return;
      }

      const saveButton = event.target.closest('[data-save-pickup]');
      if (saveButton) {
        const input = card.querySelector('[data-pickup]');
        saveButton.disabled = true;
        await savePickup(order.id, input);
        saveButton.disabled = false;
      }
    });

    refs.addProductBtn.addEventListener('click', () => openProductModal());
    refs.manageCategoriesBtn.addEventListener('click', openCategoryModal);
    refs.newCategoryBtn.addEventListener('click', resetCategoryForm);
    refs.cancelCategoryEdit.addEventListener('click', resetCategoryForm);
    refs.categoryForm.addEventListener('submit', submitCategory);
    refs.categoryList.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-category]');
      if (edit) {
        editCategory(edit.dataset.editCategory);
        return;
      }
      const remove = event.target.closest('[data-delete-category]');
      if (remove) deleteCategory(remove.dataset.deleteCategory);
    });
    refs.chooseCategoryImageBtn.addEventListener('click', () => refs.categoryImageInput.click());
    refs.categoryImageDrop.addEventListener('click', () => refs.categoryImageInput.click());
    refs.categoryImageDrop.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        refs.categoryImageInput.click();
      }
    });
    refs.categoryImageInput.addEventListener('change', () => {
      handleCategoryImageFile(refs.categoryImageInput.files?.[0]);
    });
    refs.categoryImageDrop.addEventListener('dragover', (event) => {
      event.preventDefault();
      refs.categoryImageDrop.classList.add('is-drag');
    });
    refs.categoryImageDrop.addEventListener('dragleave', () =>
      refs.categoryImageDrop.classList.remove('is-drag')
    );
    refs.categoryImageDrop.addEventListener('drop', (event) => {
      event.preventDefault();
      refs.categoryImageDrop.classList.remove('is-drag');
      handleCategoryImageFile(event.dataTransfer?.files?.[0]);
    });

    refs.addDriverBtn.addEventListener('click', () => openDriverModal());
    refs.driverForm.addEventListener('submit', submitDriver);
    refs.driversList.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-driver]');
      if (edit) {
        const driver = state.drivers.find((item) => item.id === edit.dataset.editDriver);
        if (driver) openDriverModal(driver);
        return;
      }
      const remove = event.target.closest('[data-delete-driver]');
      if (remove) deleteDriver(remove.dataset.deleteDriver);
    });
    refs.driversList.addEventListener('change', (event) => {
      const toggle = event.target.closest('[data-driver-active]');
      if (toggle) toggleDriverActive(toggle.dataset.id, toggle.checked);
    });
    refs.dfActive.addEventListener('change', () => {
      refs.dfActiveText.textContent = AB.t(refs.dfActive.checked ? 'adminShown' : 'adminHidden');
    });
    refs.productSearch.addEventListener('input', () => {
      state.productSearch = refs.productSearch.value;
      renderProducts();
    });
    refs.productCategoryFilter.addEventListener('change', () => {
      state.categoryFilter = refs.productCategoryFilter.value;
      renderProducts();
    });

    refs.productsBody.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-product]');
      if (edit) {
        const product = state.products.find((item) => item.id === edit.dataset.editProduct);
        if (product) openProductModal(product);
        return;
      }
      const archive = event.target.closest('[data-archive-product]');
      if (archive) {
        archiveProduct(archive.dataset.archiveProduct);
        return;
      }
      const restore = event.target.closest('[data-restore-product]');
      if (restore) {
        restoreProduct(restore.dataset.restoreProduct);
        return;
      }
      const stockButton = event.target.closest('[data-stock-delta]');
      if (stockButton) {
        changeStock(stockButton.dataset.id, Number(stockButton.dataset.stockDelta));
        return;
      }
      const stockEdit = event.target.closest('[data-stock-edit]');
      if (stockEdit) {
        const product = state.products.find((item) => item.id === stockEdit.dataset.stockEdit);
        if (product) openProductModal(product);
      }
    });

    refs.productsBody.addEventListener('change', (event) => {
      const toggle = event.target.closest('[data-product-active]');
      if (toggle) toggleProductActive(toggle.dataset.id, toggle.checked);
    });

    refs.productForm.addEventListener('submit', submitProduct);
    refs.chooseImageBtn.addEventListener('click', () => refs.productImageInput.click());
    refs.imageDrop.addEventListener('click', () => refs.productImageInput.click());
    refs.imageDrop.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        refs.productImageInput.click();
      }
    });
    refs.productImageInput.addEventListener('change', () => {
      handleImageFile(refs.productImageInput.files?.[0]);
    });
    refs.imageDrop.addEventListener('dragover', (event) => {
      event.preventDefault();
      refs.imageDrop.classList.add('is-drag');
    });
    refs.imageDrop.addEventListener('dragleave', () => refs.imageDrop.classList.remove('is-drag'));
    refs.imageDrop.addEventListener('drop', (event) => {
      event.preventDefault();
      refs.imageDrop.classList.remove('is-drag');
      handleImageFile(event.dataTransfer?.files?.[0]);
    });
    refs.pfActive.addEventListener('change', () => {
      refs.pfActiveText.textContent = AB.t(refs.pfActive.checked ? 'adminShown' : 'adminHidden');
    });

    refs.settingsForm.addEventListener('submit', submitSettings);
    refs.passwordForm.addEventListener('submit', submitPassword);

    $$('[data-close-modal]').forEach((button) => {
      button.addEventListener('click', () => {
        const dialog = button.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    refs.confirmOk.addEventListener('click', () => settleConfirm(true));
    refs.confirmCancel.addEventListener('click', () => settleConfirm(false));
    refs.confirmModal.addEventListener('click', (event) => {
      if (event.target === refs.confirmModal) settleConfirm(false);
    });
    refs.confirmModal.addEventListener('cancel', (event) => {
      event.preventDefault();
      settleConfirm(false);
    });

    for (const dialog of $$('.admin-modal')) {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    }

    document.addEventListener('click', (event) => {
      const reload = event.target.closest('[data-reload]');
      if (reload) loadAll();
    });

    window.addEventListener('hashchange', () => {
      const tab = location.hash.slice(1);
      if (['orders', 'products', 'settings'].includes(tab) && tab !== state.tab) switchTab(tab, { updateHash: false });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.authed && state.tab === 'orders') loadOrders({ silent: true });
    });
  }

  function init() {
    cacheRefs();
    AB.applyTranslations();
    updateTitle();
    refs.productModalTitle.removeAttribute('data-i18n');
    populatePickers();
    bindEvents();
    refs.productCategoryFilter.value = 'all';
    checkSession();
    startPolling();
  }

  init();
})();
