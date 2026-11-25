// Sizzle & Serve — orders: tickets, patience, serving, scoring.
// One clear job: everything about the order board and the money it pays.
import { MAX_ORDERS, ORDER_PATIENCE, ORDER_SPAWN_EVERY, RECIPES } from './config.js';
import { pick } from './random.js';
import { sfx } from './audio.js';

let orderSeq = 0;

// A fresh ticket: a recipe picked by the rng, full patience.
export function newOrder(rng, now) {
  return {
    id: ++orderSeq,
    recipe: pick(rng, RECIPES),
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
    bornAt: now,
    shakeUntil: 0,
  };
}

// Does the plate (a list of ingredient kinds) match the recipe exactly?
export function plateMatches(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = [...plate].sort().join(',');
  const want = [...recipe.needs].sort().join(',');
  return have === want;
}

// Serve the plate to ticket `order`. Returns the dollars earned, or 0 when
// the plate does not match (the ticket shakes, the plate stays).
export function serveOrder(state, order) {
  if (!plateMatches(state.plate, order.recipe)) {
    order.shakeUntil = state.now + 0.35;
    sfx.error();
    return 0;
  }
  const tip = Math.round((order.patience / order.maxPatience) * 5);
  const comboMult = 1 + 0.1 * Math.min(state.combo, 10);
  const earned = Math.round((order.recipe.price + tip) * comboMult);
  state.score += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  state.flash = { text: `+$${earned} ${order.recipe.name}!`, color: '#7dc383', until: state.now + 1.2 };
  sfx.serve();
  return earned;
}

// Advance the order board: patience drains, tickets walk out, new ones arrive.
export function tickOrders(state, dt) {
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.orders.length < MAX_ORDERS) {
    state.orders.push(newOrder(state.rng, state.now));
    state.nextOrderIn = ORDER_SPAWN_EVERY;
  }
  for (const order of [...state.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders = state.orders.filter((o) => o.id !== order.id);
      state.lost += 1;
      state.combo = 0;
      state.flash = { text: `${order.recipe.name} walked out!`, color: '#e4573d', until: state.now + 1.2 };
      sfx.expire();
    }
  }
}
