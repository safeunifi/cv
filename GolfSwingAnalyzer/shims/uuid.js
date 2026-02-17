// Drop-in uuid shim that works in React Native without crypto.getRandomValues.
// Only v4 (random UUID) is implemented — the only variant used at runtime.

function v4() {
  var hex = '0123456789abcdef';
  var uuid = '';
  for (var i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4'; // version 4
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8]; // variant bits
    } else {
      uuid += hex[(Math.random() * 16) | 0];
    }
  }
  return uuid;
}

// no-op stubs for other versions
function v1() { return v4(); }
function v3() { return v4(); }
function v5() { return v4(); }

module.exports = { v1: v1, v3: v3, v4: v4, v5: v5 };
