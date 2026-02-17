// Must run before any module that uses uuid/crypto.getRandomValues.
// This file has no imports, so the polyfill executes immediately.
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {};
}
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = function (array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}
