import { useSyncExternalStore } from 'react';
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('hashchange', onStoreChange);
  return () => window.removeEventListener('hashchange', onStoreChange);
}
function getSnapshot(): string { return window.location.hash; }
function getServerSnapshot(): string { return ''; }
/** Subscribe to the browser hash as an external store. */
export function useHash(): string { return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); }
/** Write a hash and report whether it changed. */
export function setHash(hash: string): boolean {
  if (window.location.hash === hash) return false;
  window.location.hash = hash;
  return true;
}
