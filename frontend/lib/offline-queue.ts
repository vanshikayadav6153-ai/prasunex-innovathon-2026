/**
 * A deliberately small opt-in queue. It never stores identities, credentials,
 * attendance scans, marks, or grievances. Callers must ask for queueing per
 * operation so the browser never silently persists a request.
 */
const SAFE_PATHS = new Set(["/api/v1/copilot/ask", "/api/v1/paper/audit"]);
const DB_NAME = "campus-nexus-safe-queue";
const STORE = "requests";

export type SafeQueuedRequest = { id: string; path: string; body: unknown; createdAt: string; attempts: number };

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE, { keyPath: "id" });
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

export async function queueSafeRequest(path: string, body: unknown, consent: boolean): Promise<string> {
  if (!consent) throw new Error("Offline retry requires explicit consent.");
  if (!SAFE_PATHS.has(path)) throw new Error("This request is not permitted for offline storage.");
  const request: SafeQueuedRequest = { id: crypto.randomUUID(), path, body, createdAt: new Date().toISOString(), attempts: 0 };
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(request);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
  return request.id;
}

export async function flushSafeQueue(): Promise<void> {
  if (!navigator.onLine) return;
  const db = await database();
  const requests = await new Promise<SafeQueuedRequest[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const get = tx.objectStore(STORE).getAll();
    get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error);
  });
  for (const item of requests) {
    try {
      const response = await fetch(item.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item.body), credentials: "same-origin" });
      if (!response.ok && response.status < 500) continue; // retain for visible/manual retry
      if (response.ok) {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(item.id);
      }
    } catch { /* retain for a later connection */ }
  }
}
