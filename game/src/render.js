// Sizzle & Serve — rendering: every pixel the kitchen shows.
// One clear job: draw the title, the kitchen, the tickets and the game-over
// screen from the state, using only canvas shapes (no image files).
import {
  BIN_ORDER, CHOPS_NEEDED, GRILL_SECONDS, INGREDIENTS, LAYOUT, POT_SECONDS,
  SHIFT_SECONDS, W, H,
} from './config.js';
import {
  binRect, boardRect, grillSlotRect, plateRect, potRect, ticketRect, trashRect,
} from './kitchen.js';

const C = {
  bg: '#2b211a', panel: '#3a2d22', panelEdge: '#574433', cream: '#f6ead2',
  ink: '#241a12', gold: '#f5c542', green: '#7dc383', red: '#e4573d',
  board: '#8a6a45', boardEdge: '#6b4f31', steel: '#9aa3ad', pot: '#5b6b7a',
  plate: '#f2ede4', trash: '#7a3b34',
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function panel(ctx, r, fill = C.panel, edge = C.panelEdge) {
  rr(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = edge;
  ctx.stroke();
}

// --- ingredients, drawn as shapes -------------------------------------------
// `st` is the item state: raw | cooked | chopped | burnt. Size is the icon box.
export function drawIngredient(ctx, kind, cx, cy, size, st = 'raw') {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (kind === 'bun') {
    ctx.fillStyle = '#e8b06a';
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d99a4e';
    ctx.fillRect(-s * 0.95, s * 0.1, s * 1.9, s * 0.35);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.4, -0.45], [0.1, -0.6], [0.45, -0.35]]) {
      ctx.beginPath(); ctx.ellipse(dx * s, dy * s, s * 0.09, s * 0.06, 0.4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'patty') {
    ctx.fillStyle = st === 'burnt' ? '#1d1512' : st === 'cooked' ? '#6b4423' : '#a06a42';
    rr(ctx, -s, -s * 0.45, s * 2, s * 0.9, s * 0.4);
    ctx.fill();
    if (st === 'cooked') {
      ctx.strokeStyle = '#4a2c14';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * s * 0.5, -s * 0.3); ctx.lineTo(i * s * 0.5, s * 0.3); ctx.stroke();
      }
    }
  } else if (kind === 'lettuce') {
    ctx.fillStyle = st === 'chopped' ? '#8fd694' : '#5da865';
    for (const [dx, dy, r] of [[-0.45, 0.1, 0.5], [0.4, 0.15, 0.5], [0, -0.35, 0.55]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#3f7d49';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-s * 0.6, 0); ctx.quadraticCurveTo(0, s * 0.45, s * 0.6, 0); ctx.stroke();
  } else if (kind === 'tomato') {
    ctx.fillStyle = st === 'chopped' ? '#ff7a5c' : '#e4573d';
    ctx.beginPath(); ctx.arc(0, s * 0.1, s * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4d8f57';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.7, s * 0.35, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.25, s * 0.22, 0, Math.PI * 2); ctx.fill();
    if (st === 'chopped') {
      ctx.strokeStyle = '#a82f1d';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.1); ctx.lineTo(s * 0.5, s * 0.2); ctx.stroke();
    }
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85); ctx.lineTo(s * 0.9, s * 0.6); ctx.lineTo(-s * 0.9, s * 0.6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d99e1f';
    for (const [dx, dy] of [[-0.25, 0.15], [0.3, 0.3], [0.05, -0.15]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'pasta') {
    ctx.strokeStyle = st === 'cooked' ? '#f2d38a' : '#e0b95e';
    ctx.lineWidth = s * 0.22;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * s * 0.45;
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, y);
      ctx.bezierCurveTo(-s * 0.4, y - s * 0.35, s * 0.4, y + s * 0.35, s * 0.8, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// A small progress ring around a station item.
function ring(ctx, cx, cy, r, frac, color) {
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); ctx.stroke();
}

function stationLabel(ctx, r, label, hint) {
  text(ctx, label, r.x + 14, r.y + 16, 17, C.cream, 'left');
  if (hint) text(ctx, hint, r.x + r.w - 14, r.y + 16, 13, '#cbb693', 'right', 'normal');
}

// --- sections -----------------------------------------------------------------
function drawTopBar(ctx, state) {
  const r = LAYOUT.topBar;
  ctx.fillStyle = '#241a12';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  text(ctx, 'SIZZLE & SERVE', 24, 33, 26, C.gold);
  text(ctx, '90-second dinner rush', 268, 34, 15, '#cbb693', 'left', 'normal');
  const t = state.timeLeft;
  const tc = t <= 15 ? C.red : C.cream;
  text(ctx, `⏱ ${Math.ceil(t)}s`, 640, 33, 30, tc, 'center');
  text(ctx, `Score $${state.score}`, 900, 33, 24, C.cream, 'center');
  const mult = (1 + 0.1 * Math.min(state.combo, 10)).toFixed(1);
  text(ctx, state.combo >= 2 ? `🔥 x${mult} combo` : 'no combo yet', 1120, 33, 20, state.combo >= 2 ? '#ff9d5c' : '#cbb693', 'center');
}

function drawTickets(ctx, state) {
  const r = LAYOUT.board;
  text(ctx, 'ORDER BOARD', r.x + 2, r.y - 12, 14, '#cbb693');
  for (let i = 0; i < 3; i++) {
    const tr = ticketRect(i);
    const order = state.orders[i];
    if (!order) {
      rr(ctx, tr.x, tr.y, tr.w, tr.h, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      text(ctx, 'waiting for the next order…', tr.x + tr.w / 2, tr.y + tr.h / 2, 16, '#8a7561', 'center', 'normal');
      continue;
    }
    const shake = state.now < order.shakeUntil ? Math.sin(state.now * 60) * 4 : 0;
    ctx.save();
    ctx.translate(shake, 0);
    rr(ctx, tr.x, tr.y, tr.w, tr.h, 10);
    ctx.fillStyle = '#f6ead2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = order.patience < 10 ? C.red : '#d8c49a';
    ctx.stroke();
    text(ctx, order.recipe.name, tr.x + 14, tr.y + 22, 19, C.ink);
    text(ctx, `$${order.recipe.price}`, tr.x + tr.w - 14, tr.y + 22, 19, '#7a5a1e', 'right');
    order.recipe.needs.forEach((kind, j) => {
      drawIngredient(ctx, kind, tr.x + 34 + j * 52, tr.y + 62, 40,
        kind === 'patty' ? 'cooked' : kind === 'lettuce' || kind === 'tomato' ? 'chopped' : 'raw');
    });
    const frac = order.patience / order.maxPatience;
    ctx.fillStyle = '#e3d3b3';
    rr(ctx, tr.x + 14, tr.y + 84, tr.w - 28, 8, 4);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7dc383' : frac > 0.25 ? '#f5c542' : '#e4573d';
    rr(ctx, tr.x + 14, tr.y + 84, (tr.w - 28) * frac, 8, 4);
    ctx.fill();
    ctx.restore();
  }
}

function drawGrill(ctx, state) {
  const r = LAYOUT.grill;
  panel(ctx, r);
  stationLabel(ctx, r, 'GRILL', 'click patty in, click again when done');
  for (let i = 0; i < 2; i++) {
    const s = grillSlotRect(i);
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fillStyle = '#241a12';
    ctx.fill();
    ctx.strokeStyle = '#574433';
    ctx.lineWidth = 2;
    for (let g = 1; g < 5; g++) {
      ctx.beginPath(); ctx.moveTo(s.x + (s.w / 5) * g, s.y + 6); ctx.lineTo(s.x + (s.w / 5) * g, s.y + s.h - 6); ctx.stroke();
    }
    const slot = state.grill[i];
    if (slot) {
      const done = slot.t >= GRILL_SECONDS;
      const burnt = slot.t >= GRILL_SECONDS + 6;
      drawIngredient(ctx, 'patty', s.x + s.w / 2, s.y + s.h / 2, 84, burnt ? 'burnt' : done ? 'cooked' : 'raw');
      ring(ctx, s.x + s.w / 2, s.y + s.h / 2, 44, Math.min(1, slot.t / GRILL_SECONDS), burnt ? '#e4573d' : done ? '#7dc383' : '#f5c542');
      text(ctx, burnt ? 'BURNT!' : done ? 'READY' : 'cooking…', s.x + s.w / 2, s.y + s.h - 10, 13, burnt ? '#ff8a70' : done ? '#a8e0ae' : '#cbb693', 'center');
    } else {
      text(ctx, 'empty', s.x + s.w / 2, s.y + s.h / 2, 15, '#8a7561', 'center', 'normal');
    }
  }
}

function drawBoard(ctx, state) {
  const r = LAYOUT.chopping;
  panel(ctx, r, C.board, C.boardEdge);
  stationLabel(ctx, r, 'CHOPPING BOARD', 'click 3× to chop');
  const b = boardRect();
  rr(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fillStyle = '#a97e4f';
  ctx.fill();
  ctx.strokeStyle = '#6b4f31';
  ctx.lineWidth = 2;
  ctx.stroke();
  const item = state.board;
  if (item) {
    drawIngredient(ctx, item.kind, b.x + b.w / 2, b.y + b.h / 2 - 4, 72, item.chops >= CHOPS_NEEDED ? 'chopped' : 'raw');
    for (let c = 0; c < CHOPS_NEEDED; c++) {
      ctx.fillStyle = c < item.chops ? '#f5c542' : 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.arc(b.x + b.w / 2 - 24 + c * 24, b.y + b.h - 10, 7, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    text(ctx, 'drop lettuce or tomato here', b.x + b.w / 2, b.y + b.h / 2, 15, '#e8d5b5', 'center', 'normal');
  }
}

function drawPot(ctx, state) {
  const r = LAYOUT.pot;
  panel(ctx, r);
  stationLabel(ctx, r, 'POT', 'pasta boils 3s');
  const p = potRect();
  rr(ctx, p.x, p.y + 30, p.w, p.h - 30, 10);
  ctx.fillStyle = C.pot;
  ctx.fill();
  ctx.fillStyle = '#7fa8c9';
  ctx.fillRect(p.x + 8, p.y + 38, p.w - 16, 26);
  const slot = state.pot;
  if (slot) {
    drawIngredient(ctx, 'pasta', p.x + p.w / 2, p.y + 62, 72, slot.t >= POT_SECONDS ? 'cooked' : 'raw');
    ring(ctx, p.x + p.w / 2, p.y + 62, 46, Math.min(1, slot.t / POT_SECONDS), slot.t >= POT_SECONDS ? '#7dc383' : '#f5c542');
    text(ctx, slot.t >= POT_SECONDS ? 'READY' : 'boiling…', p.x + p.w / 2, p.y + p.h - 12, 13, slot.t >= POT_SECONDS ? '#a8e0ae' : '#cbb693', 'center');
  } else {
    text(ctx, 'empty', p.x + p.w / 2, p.y + p.h - 12, 15, '#8a7561', 'center', 'normal');
  }
}

function drawPlate(ctx, state) {
  const r = LAYOUT.plate;
  panel(ctx, r);
  stationLabel(ctx, r, 'PLATE', 'click a ticket to serve');
  const p = plateRect();
  ctx.fillStyle = C.plate;
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2 + 8, p.w / 2 - 8, p.h / 2 - 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cfc4ae';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (state.plate.length === 0) {
    text(ctx, 'empty plate', p.x + p.w / 2, p.y + p.h / 2, 15, '#8a7561', 'center', 'normal');
  } else {
    state.plate.forEach((kind, i) => {
      const x = p.x + 44 + i * 44;
      const y = p.y + p.h / 2 + 6 - Math.min(i, 3) * 4;
      drawIngredient(ctx, kind, x, y, 40, kind === 'patty' ? 'cooked' : kind === 'lettuce' || kind === 'tomato' ? 'chopped' : 'raw');
    });
  }
}

function drawBins(ctx, state) {
  const r = LAYOUT.bins;
  text(ctx, 'INGREDIENTS — click a bin, or press its key', r.x + 2, r.y - 12, 14, '#cbb693');
  BIN_ORDER.forEach((kind, i) => {
    const b = binRect(i);
    const def = INGREDIENTS[kind];
    rr(ctx, b.x, b.y, b.w, b.h, 10);
    ctx.fillStyle = '#4a3826';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = state.hand && state.hand.kind === kind ? C.gold : C.panelEdge;
    ctx.stroke();
    drawIngredient(ctx, kind, b.x + b.w / 2, b.y + 38, 56, 'raw');
    text(ctx, `${def.name} [${def.key}]`, b.x + b.w / 2, b.y + 82, 16, C.cream, 'center');
    if (def.prep === 'grill') text(ctx, 'needs grill', b.x + b.w / 2, b.y + 100, 12, '#c98a5a', 'center', 'normal');
    if (def.prep === 'chop') text(ctx, 'needs chopping', b.x + b.w / 2, b.y + 100, 12, '#c98a5a', 'center', 'normal');
    if (def.prep === 'pot') text(ctx, 'needs pot', b.x + b.w / 2, b.y + 100, 12, '#c98a5a', 'center', 'normal');
  });
  const t = trashRect();
  rr(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fillStyle = C.trash;
  ctx.fill();
  ctx.strokeStyle = '#a85a50';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🗑 TRASH', t.x + t.w / 2, t.y + 40, 20, '#f6ead2', 'center');
  text(ctx, 'hand or plate  [T]', t.x + t.w / 2, t.y + 72, 13, '#e8b8b0', 'center', 'normal');
}

function drawFooter(ctx, state) {
  const r = LAYOUT.footer;
  text(ctx, 'Serve the plate to a matching ticket. Fast serves earn tips; slow tickets walk out. Burnt food goes in the trash.', r.x, r.y + 16, 15, '#cbb693', 'left', 'normal');
  text(ctx, `Served ${state.served}  •  Walked out ${state.lost}  •  Best combo x${(1 + 0.1 * Math.min(state.bestCombo, 10)).toFixed(1)}  •  [Space] serve  [P] pause  [M] mute`, r.x, r.y + 44, 15, '#cbb693', 'left', 'normal');
  if (state.flash && state.now < state.flash.until) {
    const alpha = Math.min(1, (state.flash.until - state.now) / 0.4);
    ctx.globalAlpha = alpha;
    text(ctx, state.flash.text, W / 2, r.y + 74, 22, state.flash.color, 'center');
    ctx.globalAlpha = 1;
  }
  if (state.hand && state.mouse.x >= 0) {
    drawIngredient(ctx, state.hand.kind, state.mouse.x, state.mouse.y - 30, 44,
      state.hand.state === 'burnt' ? 'burnt' : state.hand.state);
    text(ctx, state.hand.state === 'burnt' ? 'burnt — trash it' : state.hand.state, state.mouse.x, state.mouse.y - 62, 12, '#f6ead2', 'center', 'normal');
  }
}

// --- screens ------------------------------------------------------------------
function drawTitle(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f5c542';
  ctx.beginPath(); ctx.arc(640, 150, 74, 0, Math.PI * 2); ctx.fill();
  drawIngredient(ctx, 'patty', 640, 168, 120, 'cooked');
  drawIngredient(ctx, 'bun', 640, 118, 120, 'raw');
  text(ctx, 'SIZZLE & SERVE', 640, 300, 64, C.gold, 'center');
  text(ctx, 'a 90-second dinner rush', 640, 348, 26, C.cream, 'center', 'normal');
  text(ctx, 'Tickets come in. Chop, grill and boil. Plate it. Serve it before it walks out.', 640, 400, 19, '#cbb693', 'center', 'normal');
  text(ctx, 'Click the bins, grill, board and pot — or press 1–6.  [Space] serves, [T] trashes.', 640, 432, 17, '#cbb693', 'center', 'normal');
  text(ctx, '▶  CLICK TO START  ◀', 640, 510, 30, '#7dc383', 'center');
  text(ctx, 'Classic Burger $12  •  Cheeseburger $15  •  Garden Salad $10  •  Pasta Pomodoro $14', 640, 570, 17, C.cream, 'center', 'normal');
  text(ctx, 'Fast serves earn up to $5 tip. Combos multiply your pay up to x2.0.', 640, 600, 15, '#cbb693', 'center', 'normal');
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,8,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, "SHIFT OVER!", 640, 220, 56, C.gold, 'center');
  text(ctx, `You served ${state.served} dish${state.served === 1 ? '' : 'es'} and earned $${state.score}`, 640, 300, 28, C.cream, 'center', 'normal');
  text(ctx, `${state.lost} ticket${state.lost === 1 ? '' : 's'} walked out  •  best combo x${(1 + 0.1 * Math.min(state.bestCombo, 10)).toFixed(1)}`, 640, 344, 20, '#cbb693', 'center', 'normal');
  const verdict = state.score >= 200 ? 'Head chef material. The rush never stood a chance.' :
    state.score >= 120 ? 'Solid service. The kitchen kept up.' :
    state.score >= 60 ? 'A decent shift — the tickets were faster than the pan.' :
    'The kitchen won this round. Run it back.';
  text(ctx, verdict, 640, 400, 20, '#7dc383', 'center', 'normal');
  text(ctx, '▶  CLICK OR PRESS R TO COOK AGAIN  ◀', 640, 480, 26, '#7dc383', 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,12,8,0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'PAUSED', 640, 350, 48, C.cream, 'center');
  text(ctx, 'press P or click to resume', 640, 400, 20, '#cbb693', 'center', 'normal');
}

export function render(ctx, state) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  if (state.mode === 'title') { drawTitle(ctx); return; }
  drawTopBar(ctx, state);
  drawTickets(ctx, state);
  drawGrill(ctx, state);
  drawBoard(ctx, state);
  drawPot(ctx, state);
  drawPlate(ctx, state);
  drawBins(ctx, state);
  drawFooter(ctx, state);
  if (state.mode === 'over') drawOver(ctx, state);
  if (state.mode === 'paused') drawPaused(ctx);
}
