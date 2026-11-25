// Sizzle & Serve — entrypoint: game loop, screen flow, screenshot staging.
// One clear job: wire the canvas, the clock and the state together.
// ?shot=start|play|end&seed=N stages a frozen scene for screenshots:
// the game code itself renders it, exactly as the starter's shots.json does.
import { RECIPES, SHIFT_SECONDS } from './config.js';
import { freshState, tick } from './kitchen.js';
import { seedFromUrl } from './random.js';
import { bindInput } from './input.js';
import { render } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const seed = seedFromUrl();
const state = freshState(seed);
state.rngSeed = seed;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

// Stage a deterministic mid-game scene: two tickets waiting, one dish
// mid-assembly on the plate, a patty on the grill, a chopped tomato ready.
function stagePlay() {
  state.mode = 'playing';
  state.frozen = true;
  state.elapsed = SHIFT_SECONDS - 47;
  state.timeLeft = 47;
  state.score = 86;
  state.served = 5;
  state.combo = 3;
  state.bestCombo = 4;
  state.orders = [
    { id: 1, recipe: RECIPES[1], patience: 22, maxPatience: 35, bornAt: 0, shakeUntil: 0 },
    { id: 2, recipe: RECIPES[0], patience: 12, maxPatience: 35, bornAt: 0, shakeUntil: 0 },
    { id: 3, recipe: RECIPES[2], patience: 30, maxPatience: 35, bornAt: 0, shakeUntil: 0 },
  ];
  state.grill = [{ kind: 'patty', t: 2.5 }, null];
  state.board = { kind: 'tomato', chops: 3 };
  state.pot = null;
  state.plate = ['bun', 'patty', 'lettuce'];
  state.hand = null;
  state.flash = { text: '+$18 Cheeseburger!', color: '#7dc383', until: 9999 };
}

// Stage the end-of-shift screen with a finished score.
function stageEnd() {
  state.mode = 'over';
  state.frozen = true;
  state.elapsed = SHIFT_SECONDS;
  state.timeLeft = 0;
  state.score = 214;
  state.served = 14;
  state.lost = 2;
  state.combo = 0;
  state.bestCombo = 5;
  state.orders = [];
  state.plate = [];
}

if (shot === 'play') stagePlay();
else if (shot === 'end') stageEnd();
else state.mode = 'title';

bindInput(state, canvas);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  tick(state, dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
