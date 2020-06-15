// Persistent storage. This is it's own module so I can exchange how to store
// For now it's local storage, but cloud storage is possible in the future

export function store(key, data) {
  if (key) localStorage.setItem(key, JSON.stringify(data));
}

export function load(key) {
  if (key) return JSON.parse(localStorage.getItem(key));
  return undefined;
}

export function remove(key) {
  if (key) localStorage.removeItem(key);
}

export function clear() {
  localStorage.clear();
}
