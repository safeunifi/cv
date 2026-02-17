// Patches uuid's rng files to work without crypto.getRandomValues in React Native.
// Run via: node scripts/patch-uuid.js
// Also runs automatically as a postinstall hook.

const fs = require('fs');
const path = require('path');

const safeRngCJS = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rng;
var rnds8 = new Uint8Array(16);
function rng() {
  for (var i = 0; i < 16; i++) rnds8[i] = Math.floor(Math.random() * 256);
  return rnds8;
}
module.exports = exports.default;
`;

const safeRngESM = `var rnds8 = new Uint8Array(16);
export default function rng() {
  for (var i = 0; i < 16; i++) rnds8[i] = Math.floor(Math.random() * 256);
  return rnds8;
}
`;

const uuidDir = path.resolve(__dirname, '..', 'node_modules', 'uuid', 'dist');

const patches = [
  [path.join(uuidDir, 'rng-browser.js'), safeRngCJS],
  [path.join(uuidDir, 'rng.js'), safeRngCJS],
  [path.join(uuidDir, 'esm-browser', 'rng.js'), safeRngESM],
  [path.join(uuidDir, 'esm-node', 'rng.js'), safeRngESM],
];

let patched = 0;
for (const [file, content] of patches) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    patched++;
    console.log('Patched:', path.relative(process.cwd(), file));
  }
}
console.log(`Done: ${patched} file(s) patched.`);
