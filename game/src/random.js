// Sizzle & Serve — deterministic randomness (mulberry32).
// One clear job: every random choice in the game, so a seed replays the same shift.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one item from `list` using the rng.
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// A stable integer seed from the URL (?seed=7) or from the clock.
export function seedFromUrl() {
  const q = new URLSearchParams(location.search);
  const raw = q.get('seed');
  const n = raw === null ? (Date.now() % 2147483647) : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 1;
}
