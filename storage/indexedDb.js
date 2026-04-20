import { DB_NAME, DB_VERSION, STORE_SCREENSHOTS } from '../utils/constants.js';

let dbPromise;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SCREENSHOTS)) {
        const store = db.createObjectStore(STORE_SCREENSHOTS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore(mode, handler) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, mode);
    const store = tx.objectStore(STORE_SCREENSHOTS);
    let result;

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);

    result = handler(store);
  });
}

export async function saveCapture(record) {
  const id = record.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    ...record,
    id,
    createdAt: record.createdAt || Date.now(),
    updatedAt: Date.now()
  };

  await withStore('readwrite', (store) => store.put(payload));
  return payload;
}

export async function updateCapture(id, patch) {
  const current = await getCapture(id);
  if (!current) return null;
  const next = { ...current, ...patch, id, updatedAt: Date.now() };
  await withStore('readwrite', (store) => store.put(next));
  return next;
}

export async function getCapture(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, 'readonly');
    const store = tx.objectStore(STORE_SCREENSHOTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function listCaptures(limit = 25) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, 'readonly');
    const store = tx.objectStore(STORE_SCREENSHOTS);
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result || [];
      const sorted = all.sort((a, b) => b.createdAt - a.createdAt);
      resolve(sorted.slice(0, limit));
    };

    request.onerror = () => reject(request.error);
  });
}
