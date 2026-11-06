// Tiny IndexedDB key-value store. Unlike localStorage (~5 MB), it can hold large datasets.
// Every function resolves instead of throwing, so the app still works when storage is blocked or full.
const DB_NAME = 'csv-explorer';
const STORE = 'kv';

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = async (mode, fn) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
};

/** Resolves true if saved, false if the browser refused (quota, private mode, …). */
export const save = (key, value) => run('readwrite', (s) => s.put(value, key)).then(() => true, () => false);
export const load = (key) => run('readonly', (s) => s.get(key)).catch(() => null);
export const clearAll = () => run('readwrite', (s) => s.clear()).catch(() => {});