// Sizzle & Serve — shared constants: dimensions, recipes, stations, colours.
// One clear job: the numbers every other module reads, so tuning never touches logic.
export const W = 1280;
export const H = 720;
export const SHIFT_SECONDS = 90;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 35; // seconds before a ticket walks out
export const ORDER_SPAWN_EVERY = 7; // seconds between new tickets
export const GRILL_SECONDS = 4; // patty cooks this long, then burns after BURN_AFTER more
export const BURN_AFTER = 6;
export const POT_SECONDS = 3; // pasta boils this long
export const CHOPS_NEEDED = 3; // clicks to chop lettuce / tomato
export const MAX_COMBO = 10; // combo multiplier caps at 1 + 0.1 * 10 = x2.0

// Ingredient catalogue. `prep` says what the ingredient needs before plating:
// 'none' goes straight on the plate, 'grill' / 'pot' cook on a station,
// 'chop' needs the chopping board. `key` is the keyboard shortcut.
export const INGREDIENTS = {
  bun: { name: 'Bun', key: '1', prep: 'none', color: '#e8b06a', dark: '#b97f3a' },
  patty: { name: 'Patty', key: '2', prep: 'grill', color: '#8a5a33', dark: '#5d3a1e' },
  lettuce: { name: 'Lettuce', key: '3', prep: 'chop', color: '#7dc383', dark: '#4d8f57' },
  tomato: { name: 'Tomato', key: '4', prep: 'chop', color: '#e4573d', dark: '#a82f1d' },
  cheese: { name: 'Cheese', key: '5', prep: 'none', color: '#f5c542', dark: '#c99a17' },
  pasta: { name: 'Pasta', key: '6', prep: 'pot', color: '#f2d38a', dark: '#c9a24e' },
};
export const BIN_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'pasta'];

// Recipes: the exact multiset a ticket wants. Price is the base pay; a fast
// serve adds a tip of up to $5 from the patience left.
export const RECIPES = [
  { id: 'burger', name: 'Classic Burger', price: 12, needs: ['bun', 'patty', 'lettuce'] },
  { id: 'cheeseburger', name: 'Cheeseburger', price: 15, needs: ['bun', 'patty', 'cheese', 'tomato'] },
  { id: 'salad', name: 'Garden Salad', price: 10, needs: ['lettuce', 'tomato', 'cheese'] },
  { id: 'pasta', name: 'Pasta Pomodoro', price: 14, needs: ['pasta', 'tomato'] },
];

// Layout rectangles, in canvas pixels. The kitchen reads left to right:
// grill, chopping board, pot, plate; bins along the bottom, trash at the end.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 80, w: 1232, h: 116 },
  grill: { x: 24, y: 216, w: 380, h: 190 },
  chopping: { x: 424, y: 216, w: 300, h: 190 },
  pot: { x: 744, y: 216, w: 200, h: 190 },
  plate: { x: 964, y: 216, w: 292, h: 190 },
  bins: { x: 24, y: 436, w: 1012, h: 150 },
  trash: { x: 1056, y: 436, w: 200, h: 150 },
  footer: { x: 24, y: 606, w: 1232, h: 90 },
};
