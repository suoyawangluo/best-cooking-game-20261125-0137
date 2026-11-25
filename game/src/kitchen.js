// Sizzle & Serve — the kitchen: hand, stations, plate, and every action on them.
// One clear job: the world state and what a click or a key does to it.
// Rendering and input both read the hit-rects exported here.
import {
  BIN_ORDER, BURN_AFTER, CHOPS_NEEDED, GRILL_SECONDS, INGREDIENTS,
  LAYOUT, POT_SECONDS, SHIFT_SECONDS,
} from './config.js';
import { makeRng } from './random.js';
import { serveOrder, tickOrders } from './orders.js';
import { ensureAudio, sfx } from './audio.js';

// --- geometry: every clickable rect, shared by render and input -------------
export function binRect(i) {
  const { x, y } = LAYOUT.bins;
  return { x: x + i * 168, y: y + 8, w: 160, h: 108 };
}
export function grillSlotRect(i) {
  const { x, y } = LAYOUT.grill;
  return { x: x + 14 + i * 178, y: y + 48, w: 168, h: 122 };
}
export function boardRect() {
  const { x, y } = LAYOUT.chopping;
  return { x: x + 14, y: y + 48, w: 272, h: 122 };
}
export function potRect() {
  const { x, y } = LAYOUT.pot;
  return { x: x + 14, y: y + 48, w: 172, h: 122 };
}
export function plateRect() {
  const { x, y } = LAYOUT.plate;
  return { x: x + 14, y: y + 48, w: 264, h: 122 };
}
export function trashRect() {
  const { x, y } = LAYOUT.trash;
  return { x: x + 14, y: y + 8, w: 172, h: 108 };
}
export function ticketRect(i) {
  const { x, y } = LAYOUT.board;
  return { x: x + i * 410, y: y + 8, w: 390, h: 100 };
}
export function inside(r, px, py) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// --- state ------------------------------------------------------------------
export function freshState(seed) {
  return {
    mode: 'title', // title | playing | paused | over
    now: 0,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    nextOrderIn: 1.5,
    hand: null, // { kind, state: 'raw' | 'cooked' | 'chopped' | 'burnt' }
    grill: [null, null], // { kind: 'patty', t } each
    board: null, // { kind, chops }
    pot: null, // { kind: 'pasta', t }
    plate: [], // kinds, ready to serve
    flash: null, // { text, color, until }
    rng: makeRng(seed),
    rngSeed: seed,
    mouse: { x: -1, y: -1 },
    frozen: false, // screenshot staging: render only, no ticking
  };
}

// --- actions ----------------------------------------------------------------
// An ingredient is "ready" when it needs no more work: bun and cheese as-is,
// a cooked patty, chopped veg, boiled pasta.
function isReady(item) {
  if (!item) return false;
  if (item.kind === 'bun' || item.kind === 'cheese') return item.state === 'raw';
  return item.state === 'cooked' || item.state === 'chopped';
}

export function pickBin(state, kind) {
  if (state.hand) { sfx.error(); return false; }
  state.hand = { kind, state: 'raw' };
  sfx.pickup();
  return true;
}

export function clickGrill(state, i) {
  const slot = state.grill[i];
  if (!slot && state.hand && state.hand.kind === 'patty' && state.hand.state === 'raw') {
    state.grill[i] = { kind: 'patty', t: 0 };
    state.hand = null;
    sfx.sizzle();
    return true;
  }
  if (slot && !state.hand) {
    const done = slot.t >= GRILL_SECONDS;
    const burnt = slot.t >= GRILL_SECONDS + BURN_AFTER;
    state.hand = { kind: 'patty', state: burnt ? 'burnt' : done ? 'cooked' : 'raw' };
    state.grill[i] = null;
    sfx.pickup();
    return true;
  }
  sfx.error();
  return false;
}

export function clickBoard(state) {
  const item = state.board;
  if (!item && state.hand && (state.hand.kind === 'lettuce' || state.hand.kind === 'tomato') && state.hand.state === 'raw') {
    state.board = { kind: state.hand.kind, chops: 0 };
    state.hand = null;
    sfx.drop();
    return true;
  }
  if (item && !state.hand) {
    item.chops += 1;
    sfx.chop();
    if (item.chops >= CHOPS_NEEDED) {
      state.hand = { kind: item.kind, state: 'chopped' };
      state.board = null;
      sfx.ready();
    }
    return true;
  }
  sfx.error();
  return false;
}

export function clickPot(state) {
  const slot = state.pot;
  if (!slot && state.hand && state.hand.kind === 'pasta' && state.hand.state === 'raw') {
    state.pot = { kind: 'pasta', t: 0 };
    state.hand = null;
    sfx.sizzle();
    return true;
  }
  if (slot && !state.hand && slot.t >= POT_SECONDS) {
    state.hand = { kind: 'pasta', state: 'cooked' };
    state.pot = null;
    sfx.pickup();
    return true;
  }
  sfx.error();
  return false;
}

export function clickPlate(state) {
  if (state.hand && isReady(state.hand)) {
    if (state.plate.length >= 6) { sfx.error(); return false; }
    state.plate.push(state.hand.kind);
    state.hand = null;
    sfx.drop();
    return true;
  }
  sfx.error();
  return false;
}

export function clickTrash(state) {
  if (state.hand) {
    state.hand = null;
    sfx.drop();
    return true;
  }
  if (state.plate.length > 0) {
    state.plate = [];
    sfx.drop();
    return true;
  }
  return false;
}

export function clickTicket(state, i) {
  const order = state.orders[i];
  if (!order) return false;
  return serveOrder(state, order) > 0;
}

export function serveFirstMatch(state) {
  for (const order of state.orders) {
    if (serveOrder(state, order) > 0) return true;
  }
  sfx.error();
  return false;
}

// --- tick -------------------------------------------------------------------
export function tick(state, dt) {
  if (state.mode !== 'playing' || state.frozen) return;
  state.now += dt;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  for (const slot of state.grill) if (slot) slot.t += dt;
  if (state.pot) state.pot.t += dt;
  tickOrders(state, dt);
  if (state.timeLeft <= 0) {
    state.mode = 'over';
    sfx.end();
  }
}

export function startShift(state) {
  const seed = (state.rngSeed ?? 1);
  const fresh = freshState(seed);
  fresh.mode = 'playing';
  Object.assign(state, fresh);
  ensureAudio();
  sfx.start();
}
