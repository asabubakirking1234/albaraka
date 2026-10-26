import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb, saveDb, initDb, hashPassword, verifyPassword, PUBLIC_DIR, UPLOAD_DIR } from './lib/db.js';
import {
  createSession,
  readSession,
  destroySession,
  destroyAllSessions,
  loginAllowed,
  recordFailedLogin,
  clearLoginAttempts
} from './lib/auth.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const UNITS = new Set(['dona', 'qop', 'metr', 'litr', 'banka', 'toplm', 'list', 'xizmat', 'rulon']);
const STATUSES = new Set(['new', 'confirmed', 'ready', 'completed', 'cancelled']);
const MAX_BODY = 6 * 1024 * 1024;

class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new ApiError(413, 'too_large', 'Request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new ApiError(400, 'bad_json', 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function text(value, max, { required = false, min = 1 } = {}) {
  if (value === undefined || value === null) value = '';
  const cleaned = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').trim();
  if (required && cleaned.length < min) {
    throw new ApiError(400, 'validation', 'Please fill in all required fields');
  }
  if (cleaned.length > max) {
    throw new ApiError(400, 'validation', 'One of the fields is too long');
  }
  return cleaned;
}

function intValue(value, min, max, fallback = null) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== null) return fallback;
    throw new ApiError(400, 'validation', 'A number is required');
  }
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, 'validation', 'Invalid number');
  }
  return n;
}

function normalizePhone(value) {
  const display = text(value, 30, { required: true, min: 7 });
  const digits = display.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) {
    throw new ApiError(400, 'validation', 'Invalid phone number');
  }
  return { display, digits };
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function productPayload(body, existing = null, db) {
  const category = String(body.category || existing?.category || '');
  if (!db.categories.some((item) => item.id === category)) {
    throw new ApiError(400, 'validation', 'Unknown category');
  }

  const unit = String(body.unit || existing?.unit || 'dona');
  if (!UNITS.has(unit)) throw new ApiError(400, 'validation', 'Unknown unit');

  const price = intValue(body.price ?? existing?.price, 0, 1_000_000_000);
  const stock = intValue(body.stock ?? existing?.stock, 0, 1_000_000);

  const image = `/assets/img/box.svg`;
  return {
    category,
    name: {
      uz: text(body.nameUz ?? existing?.name?.uz, 90, { required: true, min: 2 }),
      ru: text(body.nameRu ?? existing?.name?.ru, 90, { required: true, min: 2 })
    },
    desc: {
      uz: text(body.descUz ?? existing?.desc?.uz, 800),
      ru: text(body.descRu ?? existing?.desc?.ru, 800)
    },
    price,
    unit,
    stock,
    image: existing?.image || image,
    active: body.active === undefined ? existing?.active ?? true : Boolean(body.active)
  };
}

function storeImage(dataUrl, oldUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new ApiError(400, 'bad_image', 'Only JPEG, PNG or WebP images are allowed');
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > 3.5 * 1024 * 1024) {
    throw new ApiError(400, 'bad_image', 'Image is too large (max 3.5 MB)');
  }
  const type = match[1];
  const valid = {
    jpeg: buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    png: buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47,
    webp: buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP'
  }[type];
  if (!valid) throw new ApiError(400, 'bad_image', 'Image file is corrupted');

  const ext = type === 'jpeg' ? 'jpg' : type;
  const filename = `p-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  if (oldUrl && oldUrl.startsWith('/uploads/')) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(oldUrl));
    try {
      fs.unlinkSync(oldPath);
    } catch {
      /* orphaned file, harmless */
    }
  }
  return `/uploads/${filename}`;
}

function publicProduct(p) {
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    desc: p.desc,
    price: p.price,
    unit: p.unit,
    stock: p.stock,
    image: p.image
  };
}

function publicCategory(category) {
  return {
    id: category.id,
    name: category.name,
    blurb: category.blurb,
    image: category.image,
    sort: category.sort || 0
  };
}

function publicDriver(driver) {
  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    area: driver.area,
    note: driver.note
  };
}

function categoryPayload(body, existing = null) {
  return {
    name: {
      uz: text(body.nameUz ?? existing?.name?.uz, 60, { required: true, min: 2 }),
      ru: text(body.nameRu ?? existing?.name?.ru, 60, { required: true, min: 2 })
    },
    blurb: {
      uz: text(body.blurbUz ?? existing?.blurb?.uz, 120),
      ru: text(body.blurbRu ?? existing?.blurb?.ru, 120)
    }
  };
}

function driverPayload(body, existing = null) {
  const phone = normalizePhone(body.phone ?? existing?.phone);
  return {
    name: text(body.name ?? existing?.name, 70, { required: true, min: 2 }),
    phone: phone.display,
    area: text(body.area ?? existing?.area, 100),
    note: text(body.note ?? existing?.note, 220),
    active: body.active === undefined ? existing?.active ?? true : Boolean(body.active)
  };
}

function safeOrder(order) {
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    createdAt: order.createdAt,
    pickupAt: order.pickupAt,
    total: order.total,
    fulfillment: order.fulfillment || 'pickup',
    driver: order.driver || null,
    customer: order.customer,
    items: order.items,
    history: order.history
  };
}

function publicOrder(order) {
  return {
    code: order.code,
    status: order.status,
    createdAt: order.createdAt,
    pickupAt: order.pickupAt,
    total: order.total,
    fulfillment: order.fulfillment || 'pickup',
    driver: order.driver
      ? { name: order.driver.name, phone: order.driver.phone, area: order.driver.area }
      : null,
    customer: { name: order.customer.name, phone: order.customer.phone },
    items: order.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      unit: i.unit,
      price: i.price,
      image: i.image
    }))
  };
}

function requireAuth(req) {
  const session = readSession(req);
  if (!session) throw new ApiError(401, 'unauthorized', 'Please sign in');
  return session;
}

function clientIp(req) {
  return req.socket.remoteAddress || 'unknown';
}

function setSessionCookie(res, token, maxAge) {
  const secure = process.env.SECURE_COOKIES === '1' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `ab_sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
  );
}

async function handleApi(req, res, url) {
  const { pathname } = url;
  const method = req.method;

  // ---------- session ----------
  if (pathname === '/api/login' && method === 'POST') {
    const ip = clientIp(req);
    if (!loginAllowed(ip)) {
      throw new ApiError(429, 'too_many_attempts', 'Too many attempts. Try again later.');
    }
    const body = await readBody(req);
    const username = text(body.username, 60);
    const password = String(body.password || '');
    const db = getDb();
    const ok = username === db.admin.username && verifyPassword(password, db.admin.password);
    if (!ok) {
      recordFailedLogin(ip);
      throw new ApiError(401, 'invalid_credentials', 'Login or password is incorrect');
    }
    clearLoginAttempts(ip);
    const { token, maxAge } = createSession(username);
    setSessionCookie(res, token, maxAge);
    return sendJson(res, 200, { ok: true, username });
  }

  if (pathname === '/api/logout' && method === 'POST') {
    destroySession(req);
    setSessionCookie(res, '', 0);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/me' && method === 'GET') {
    const session = readSession(req);
    return sendJson(res, 200, {
      authed: Boolean(session),
      username: session?.username || null
    });
  }

  // ---------- public catalog / settings ----------
  if (pathname === '/api/catalog' && method === 'GET') {
    const db = getDb();
    return sendJson(res, 200, {
      products: db.products.filter((p) => p.active && !p.archived).map(publicProduct),
      categories: [...db.categories]
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        .map(publicCategory),
      drivers: db.drivers
        .filter((driver) => driver.active)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(publicDriver),
      settings: db.settings,
      serverTime: new Date().toISOString()
    });
  }

  if (pathname === '/api/settings' && method === 'GET') {
    return sendJson(res, 200, { settings: getDb().settings });
  }

  // ---------- public orders ----------
  if (pathname === '/api/orders' && method === 'POST') {
    const body = await readBody(req);
    const db = getDb();
    const name = text(body.name, 80, { required: true, min: 2 });
    const phone = normalizePhone(body.phone);
    const address = text(body.address, 180, { required: true, min: 3 });
    const note = text(body.note, 400);
    const fulfillment = body.fulfillment === 'delivery' ? 'delivery' : 'pickup';
    let driver = null;
    if (fulfillment === 'delivery') {
      const activeDrivers = db.drivers.filter((item) => item.active);
      if (!activeDrivers.length) {
        throw new ApiError(409, 'delivery_unavailable', 'Delivery drivers are not available right now');
      }
      if (body.driverId) {
        const selected = activeDrivers.find((item) => item.id === String(body.driverId));
        if (!selected) {
          throw new ApiError(400, 'driver_unavailable', 'Selected driver is not available');
        }
        driver = {
          id: selected.id,
          name: selected.name,
          phone: selected.phone,
          area: selected.area
        };
      }
    }
    const pickup = parseDate(body.pickupAt);
    if (!pickup) throw new ApiError(400, 'pickup_invalid', 'Choose a valid pickup time');
    const now = Date.now();
    if (pickup.getTime() < now - 60_000 || pickup.getTime() > now + 45 * 24 * 60 * 60 * 1000) {
      throw new ApiError(400, 'pickup_invalid', 'Pickup time is out of range');
    }

    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 40) {
      throw new ApiError(400, 'empty_cart', 'Cart is empty');
    }

    const wanted = new Map();
    for (const item of body.items) {
      const id = String(item.id || '');
      const qty = intValue(item.qty, 1, 500);
      if (!id) throw new ApiError(400, 'validation', 'Invalid cart item');
      wanted.set(id, (wanted.get(id) || 0) + qty);
    }

    const lines = [];
    for (const [id, qty] of wanted) {
      const product = db.products.find((p) => p.id === id);
      if (!product || !product.active || product.archived) {
        throw new ApiError(409, 'product_unavailable', 'One of the products is no longer available', {
          productId: id
        });
      }
      if (qty > product.stock) {
        throw new ApiError(409, 'insufficient_stock', 'Not enough stock for one of the products', {
          productId: id,
          available: product.stock,
          name: product.name
        });
      }
      lines.push({
        product,
        qty,
        lineTotal: product.price * qty
      });
    }

    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const code = `AB-${db.meta.nextOrder}`;
    db.meta.nextOrder += 1;

    for (const line of lines) {
      line.product.stock -= line.qty;
      line.product.updatedAt = new Date().toISOString();
    }

    const order = {
      id: crypto.randomUUID(),
      code,
      status: 'new',
      createdAt: new Date().toISOString(),
      pickupAt: pickup.toISOString(),
      total,
      fulfillment,
      driver,
      customer: {
        name,
        phone: phone.display,
        phoneDigits: phone.digits,
        address,
        note
      },
      items: lines.map(({ product, qty, lineTotal }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
        unit: product.unit,
        image: product.image,
        lineTotal
      })),
      history: [{ at: new Date().toISOString(), status: 'new', by: 'customer' }]
    };
    db.orders.unshift(order);
    saveDb();
    return sendJson(res, 201, { ok: true, order: publicOrder(order) });
  }

  if (pathname === '/api/orders/track' && method === 'GET') {
    const code = text(url.searchParams.get('code'), 40).toUpperCase();
    const phone = text(url.searchParams.get('phone'), 30).replace(/\D/g, '');
    if (!code || !phone) throw new ApiError(400, 'validation', 'Enter order number and phone');
    const order = getDb().orders.find(
      (o) => o.code.toUpperCase() === code && o.customer.phoneDigits === phone
    );
    if (!order) throw new ApiError(404, 'not_found', 'Order not found');
    return sendJson(res, 200, { order: publicOrder(order) });
  }

  // ---------- admin ----------
  if (pathname.startsWith('/api/admin/')) {
    requireAuth(req);
    const db = getDb();

    // categories
    if (pathname === '/api/admin/categories' && method === 'GET') {
      const counts = new Map();
      for (const product of db.products) {
        counts.set(product.category, (counts.get(product.category) || 0) + 1);
      }
      return sendJson(res, 200, {
        categories: [...db.categories]
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
          .map((category) => ({
            ...publicCategory(category),
            productCount: counts.get(category.id) || 0
          }))
      });
    }

    if (pathname === '/api/admin/categories' && method === 'POST') {
      if (db.categories.length >= 30) {
        throw new ApiError(400, 'validation', 'Too many categories');
      }
      const body = await readBody(req);
      const payload = categoryPayload(body);
      const image = storeImage(body.imageData, null);
      const now = new Date().toISOString();
      const maxSort = db.categories.reduce((max, item) => Math.max(max, item.sort || 0), 0);
      const category = {
        id: `cat-${crypto.randomBytes(4).toString('hex')}`,
        ...payload,
        image: image || '/assets/img/box.svg',
        sort: maxSort + 10,
        createdAt: now,
        updatedAt: now
      };
      db.categories.push(category);
      saveDb();
      return sendJson(res, 201, { ok: true, category: publicCategory(category) });
    }

    const categoryMatch = pathname.match(/^\/api\/admin\/categories\/([A-Za-z0-9_-]+)$/);
    if (categoryMatch && method === 'PUT') {
      const category = db.categories.find((item) => item.id === categoryMatch[1]);
      if (!category) throw new ApiError(404, 'not_found', 'Category not found');
      const body = await readBody(req);
      const payload = categoryPayload(body, category);
      const image = storeImage(body.imageData, category.image);
      Object.assign(category, payload, {
        image: image || category.image,
        updatedAt: new Date().toISOString()
      });
      saveDb();
      return sendJson(res, 200, { ok: true, category: publicCategory(category) });
    }

    if (categoryMatch && method === 'DELETE') {
      const category = db.categories.find((item) => item.id === categoryMatch[1]);
      if (!category) throw new ApiError(404, 'not_found', 'Category not found');
      const productCount = db.products.filter((product) => product.category === category.id).length;
      if (productCount > 0) {
        throw new ApiError(409, 'category_in_use', 'Move products to another category first', {
          count: productCount,
          categoryId: category.id
        });
      }
      db.categories = db.categories.filter((item) => item.id !== category.id);
      if (category.image && category.image.startsWith('/uploads/')) {
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, path.basename(category.image)));
        } catch {
          /* already removed */
        }
      }
      saveDb();
      return sendJson(res, 200, { ok: true });
    }

    // delivery drivers
    if (pathname === '/api/admin/drivers' && method === 'GET') {
      return sendJson(res, 200, {
        drivers: [...db.drivers].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      });
    }

    if (pathname === '/api/admin/drivers' && method === 'POST') {
      if (db.drivers.length >= 30) {
        throw new ApiError(400, 'validation', 'Too many drivers');
      }
      const body = await readBody(req);
      const now = new Date().toISOString();
      const driver = {
        id: crypto.randomUUID(),
        ...driverPayload(body),
        createdAt: now,
        updatedAt: now
      };
      db.drivers.push(driver);
      saveDb();
      return sendJson(res, 201, { ok: true, driver });
    }

    const driverMatch = pathname.match(/^\/api\/admin\/drivers\/([A-Za-z0-9_-]+)$/);
    if (driverMatch && method === 'PUT') {
      const driver = db.drivers.find((item) => item.id === driverMatch[1]);
      if (!driver) throw new ApiError(404, 'not_found', 'Driver not found');
      const body = await readBody(req);
      Object.assign(driver, driverPayload(body, driver), { updatedAt: new Date().toISOString() });
      saveDb();
      return sendJson(res, 200, { ok: true, driver });
    }

    if (driverMatch && method === 'DELETE') {
      const driver = db.drivers.find((item) => item.id === driverMatch[1]);
      if (!driver) throw new ApiError(404, 'not_found', 'Driver not found');
      db.drivers = db.drivers.filter((item) => item.id !== driver.id);
      saveDb();
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/orders' && method === 'GET') {
      return sendJson(res, 200, { orders: db.orders.map(safeOrder) });
    }

    const orderMatch = pathname.match(/^\/api\/admin\/orders\/([A-Za-z0-9_-]+)$/);
    if (orderMatch && method === 'PATCH') {
      const order = db.orders.find((o) => o.id === orderMatch[1]);
      if (!order) throw new ApiError(404, 'not_found', 'Order not found');
      const body = await readBody(req);
      const previousStatus = order.status;

      if (body.status !== undefined) {
        const status = String(body.status);
        if (!STATUSES.has(status)) throw new ApiError(400, 'validation', 'Unknown status');
        if (status !== previousStatus) {
          if (status === 'cancelled') {
            for (const item of order.items) {
              const product = db.products.find((p) => p.id === item.productId);
              if (product) {
                product.stock += item.qty;
                product.updatedAt = new Date().toISOString();
              }
            }
          } else if (previousStatus === 'cancelled') {
            for (const item of order.items) {
              const product = db.products.find((p) => p.id === item.productId);
              if (!product) {
                throw new ApiError(409, 'product_missing', 'A product from this order no longer exists');
              }
              if (product.stock < item.qty) {
                throw new ApiError(409, 'insufficient_stock', 'Not enough stock to restore this order', {
                  productId: product.id,
                  available: product.stock
                });
              }
            }
            for (const item of order.items) {
              const product = db.products.find((p) => p.id === item.productId);
              product.stock -= item.qty;
              product.updatedAt = new Date().toISOString();
            }
          }
          order.status = status;
          order.history.push({ at: new Date().toISOString(), status, by: 'seller' });
        }
      }

      if (body.pickupAt !== undefined) {
        const pickup = parseDate(body.pickupAt);
        if (!pickup) throw new ApiError(400, 'pickup_invalid', 'Invalid pickup time');
        order.pickupAt = pickup.toISOString();
        order.history.push({
          at: new Date().toISOString(),
          status: 'pickup_changed',
          by: 'seller',
          pickupAt: order.pickupAt
        });
      }

      saveDb();
      return sendJson(res, 200, { ok: true, order: safeOrder(order) });
    }

    if (pathname === '/api/admin/products' && method === 'GET') {
      return sendJson(res, 200, {
        products: [...db.products].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      });
    }

    if (pathname === '/api/admin/products' && method === 'POST') {
      const body = await readBody(req);
      const payload = productPayload(body, null, db);
      const image = storeImage(body.imageData, null);
      const now = new Date().toISOString();
      const product = {
        id: crypto.randomUUID(),
        ...payload,
        image: image || payload.image,
        archived: false,
        createdAt: now,
        updatedAt: now
      };
      db.products.push(product);
      saveDb();
      return sendJson(res, 201, { ok: true, product });
    }

    const stockMatch = pathname.match(/^\/api\/admin\/products\/([A-Za-z0-9_-]+)\/stock$/);
    if (stockMatch && method === 'POST') {
      const product = db.products.find((p) => p.id === stockMatch[1]);
      if (!product) throw new ApiError(404, 'not_found', 'Product not found');
      const body = await readBody(req);
      if (body.delta !== undefined) {
        product.stock = Math.max(0, Math.min(1_000_000, product.stock + intValue(body.delta, -100000, 100000)));
      } else {
        product.stock = intValue(body.stock, 0, 1_000_000);
      }
      product.updatedAt = new Date().toISOString();
      saveDb();
      return sendJson(res, 200, { ok: true, product });
    }

    const productMatch = pathname.match(/^\/api\/admin\/products\/([A-Za-z0-9_-]+)$/);
    if (productMatch && method === 'PUT') {
      const product = db.products.find((p) => p.id === productMatch[1]);
      if (!product) throw new ApiError(404, 'not_found', 'Product not found');
      const body = await readBody(req);
      const payload = productPayload(body, product, db);
      const image = storeImage(body.imageData, product.image);
      Object.assign(product, payload, { image: image || payload.image });
      if (body.active === true) product.archived = false;
      product.updatedAt = new Date().toISOString();
      saveDb();
      return sendJson(res, 200, { ok: true, product });
    }

    if (productMatch && method === 'DELETE') {
      const product = db.products.find((p) => p.id === productMatch[1]);
      if (!product) throw new ApiError(404, 'not_found', 'Product not found');
      product.archived = true;
      product.active = false;
      product.updatedAt = new Date().toISOString();
      saveDb();
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/settings' && method === 'GET') {
      return sendJson(res, 200, { settings: db.settings });
    }

    if (pathname === '/api/admin/settings' && method === 'PUT') {
      const body = await readBody(req);
      const phone = text(body.phone, 30, { required: true, min: 7 });
      if (phone.replace(/\D/g, '').length < 9) throw new ApiError(400, 'validation', 'Invalid phone');
      db.settings = {
        phone,
        phone2: text(body.phone2, 30),
        address: {
          uz: text(body.addressUz, 180, { required: true, min: 3 }),
          ru: text(body.addressRu, 180, { required: true, min: 3 })
        },
        landmark: {
          uz: text(body.landmarkUz, 160),
          ru: text(body.landmarkRu, 160)
        },
        hours: {
          uz: text(body.hoursUz, 120, { required: true, min: 3 }),
          ru: text(body.hoursRu, 120, { required: true, min: 3 })
        },
        pickupNote: {
          uz: text(body.pickupNoteUz, 400),
          ru: text(body.pickupNoteRu, 400)
        }
      };
      saveDb();
      return sendJson(res, 200, { ok: true, settings: db.settings });
    }

    if (pathname === '/api/admin/password' && method === 'POST') {
      const body = await readBody(req);
      const current = String(body.current || '');
      const next = String(body.next || '');
      if (!verifyPassword(current, db.admin.password)) {
        throw new ApiError(400, 'wrong_password', 'Current password is incorrect');
      }
      if (next.length < 8) throw new ApiError(400, 'validation', 'New password must be at least 8 characters');
      if (next === current) throw new ApiError(400, 'validation', 'New password must be different');
      db.admin.password = hashPassword(next);
      saveDb();
      destroyAllSessions();
      setSessionCookie(res, '', 0);
      return sendJson(res, 200, { ok: true, relogin: true });
    }

    throw new ApiError(404, 'not_found', 'Unknown admin endpoint');
  }

  throw new ApiError(404, 'not_found', 'Unknown API endpoint');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function serveStatic(req, res, pathname) {
  const pages = { '/': 'index.html', '/admin': 'admin.html', '/admin/': 'admin.html' };
  let relative = pages[pathname] || pathname.replace(/^\/+/, '');
  if (!relative || relative.includes('\0')) return false;

  let filePath = path.resolve(PUBLIC_DIR, relative);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) return false;

  let stat;
  try {
    stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = fs.statSync(filePath);
    }
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(filePath).toLowerCase();
  const isHtml = ext === '.html';
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': isHtml ? 'no-store' : 'no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'"
    ].join('; ')
  });
  if (req.method === 'HEAD') {
    res.end();
    return true;
  }
  fs.createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      if (!serveStatic(req, res, decodeURIComponent(url.pathname))) {
        const notFound = path.join(PUBLIC_DIR, '404.html');
        if (fs.existsSync(notFound) && req.method === 'GET') {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(notFound).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Sahifa topilmadi / Страница не найдена');
        }
      }
    } else {
      res.writeHead(405, { Allow: 'GET, HEAD, POST, PUT, PATCH, DELETE' });
      res.end('Method not allowed');
    }
  } catch (err) {
    if (err instanceof ApiError) {
      sendJson(res, err.status, { error: err.code, message: err.message, details: err.details });
    } else {
      console.error(`[${new Date().toISOString()}] ${req.method} ${url.pathname} failed:`, err);
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'server_error', message: 'Internal server error' });
      } else {
        res.end();
      }
    }
  }

  if (process.env.LOG_REQUESTS === '1') {
    console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

initDb();

server.listen(PORT, HOST, () => {
  console.log(`Al Baraka store running at http://${HOST}:${PORT}`);
  console.log(`Seller panel: http://${HOST}:${PORT}/admin`);
});
