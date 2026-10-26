import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defaultCategories, defaultProducts, defaultSettings } from '../seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

let db = null;

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(String(password), salt, 64);
  const expectedBuf = Buffer.from(expected, 'hex');
  if (expectedBuf.length !== actual.length) return false;
  return crypto.timingSafeEqual(actual, expectedBuf);
}

function freshDb() {
  const now = new Date().toISOString();
  return {
    meta: {
      version: 1,
      nextOrder: 1001,
      createdAt: now
    },
    admin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashPassword(process.env.ADMIN_PASSWORD || 'albaraka2026')
    },
    settings: structuredClone(defaultSettings),
    categories: defaultCategories.map((category) => ({
      ...structuredClone(category),
      createdAt: now,
      updatedAt: now
    })),
    drivers: [],
    products: defaultProducts.map((p) => ({
      ...structuredClone(p),
      createdAt: now,
      updatedAt: now,
      archived: false
    })),
    orders: []
  };
}

export function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    try {
      db = JSON.parse(raw);
    } catch (err) {
      const backup = `${DB_PATH}.broken-${Date.now()}`;
      fs.copyFileSync(DB_PATH, backup);
      throw new Error(`data/db.json is not valid JSON (backup: ${backup}): ${err.message}`);
    }
    db.meta ||= { version: 1, nextOrder: 1001 };
    db.settings ||= structuredClone(defaultSettings);
    db.categories ||= defaultCategories.map((category) => ({
      ...structuredClone(category),
      createdAt: db.meta.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    db.drivers ||= [];
    db.products ||= [];
    db.orders ||= [];
    db.admin ||= {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashPassword(process.env.ADMIN_PASSWORD || 'albaraka2026')
    };
  } else {
    db = freshDb();
    saveDb();
  }
  return db;
}

export function getDb() {
  if (!db) initDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

export function resetDb() {
  db = freshDb();
  saveDb();
  return db;
}
