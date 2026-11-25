// Dapur Kilat — a tiny seeded random generator (mulberry32).
// The world takes its seed from here, so a screenshot scene staged from a fixed seed
// always plays out the same way.

/** Make a generator that yields numbers in [0, 1) from an integer seed. */
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element of an array with the generator. */
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

/** A number in [low, high) from the generator. */
export function range(random, low, high) {
  return low + random() * (high - low);
}
