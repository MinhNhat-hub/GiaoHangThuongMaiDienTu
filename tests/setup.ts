import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

function ensureStorage(): Storage {
  if (typeof window !== 'undefined' && typeof window.localStorage?.clear === 'function') {
    if (typeof globalThis.localStorage?.clear !== 'function') {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        writable: true,
        value: window.localStorage,
      });
    }
    return window.localStorage;
  }

  const memoryStorage = createMemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memoryStorage,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: memoryStorage,
    });
  }
  return memoryStorage;
}

const activeStorage = ensureStorage();

beforeEach(() => {
  activeStorage.clear();
});

afterEach(() => {
  cleanup();
  activeStorage.clear();
});
