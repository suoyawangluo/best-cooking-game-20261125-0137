// Sizzle & Serve — input: mouse clicks and keyboard shortcuts.
// One clear job: turn a pointer position or a key into a kitchen action.
import { BIN_ORDER, INGREDIENTS, MAX_ORDERS } from './config.js';
import {
  binRect, boardRect, clickBoard, clickGrill, clickPlate, clickPot, clickTicket,
  clickTrash, grillSlotRect, inside, pickBin, plateRect, potRect, serveFirstMatch,
  startShift, ticketRect, trashRect,
} from './kitchen.js';
import { ensureAudio, toggleMute } from './audio.js';

function toCanvas(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (canvas.width / r.width),
    y: (clientY - r.top) * (canvas.height / r.height),
  };
}

// One click, routed by mode and by what is under the pointer.
function handleClick(state, canvas, clientX, clientY) {
  ensureAudio();
  const p = toCanvas(canvas, clientX, clientY);
  if (state.mode === 'title') { startShift(state); return; }
  if (state.mode === 'over') { startShift(state); return; }
  if (state.mode === 'paused') { state.mode = 'playing'; return; }

  for (let i = 0; i < MAX_ORDERS; i++) {
    if (inside(ticketRect(i), p.x, p.y)) { clickTicket(state, i); return; }
  }
  for (let i = 0; i < 2; i++) {
    if (inside(grillSlotRect(i), p.x, p.y)) { clickGrill(state, i); return; }
  }
  if (inside(boardRect(), p.x, p.y)) { clickBoard(state); return; }
  if (inside(potRect(), p.x, p.y)) { clickPot(state); return; }
  if (inside(plateRect(), p.x, p.y)) { clickPlate(state); return; }
  for (let i = 0; i < BIN_ORDER.length; i++) {
    if (inside(binRect(i), p.x, p.y)) { pickBin(state, BIN_ORDER[i]); return; }
  }
  if (inside(trashRect(), p.x, p.y)) { clickTrash(state); return; }
}

export function bindInput(state, canvas) {
  canvas.addEventListener('pointerdown', (e) => {
    handleClick(state, canvas, e.clientX, e.clientY);
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = toCanvas(canvas, e.clientX, e.clientY);
    state.mouse.x = p.x;
    state.mouse.y = p.y;
  });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (key === 'm') { toggleMute(); return; }
    if (state.mode === 'title' || state.mode === 'over') {
      if (key === ' ' || key === 'enter' || key === 'r') { ensureAudio(); startShift(state); }
      return;
    }
    if (key === 'p' || key === 'escape') {
      state.mode = state.mode === 'paused' ? 'playing' : 'paused';
      return;
    }
    if (state.mode !== 'playing') return;
    if (key === ' ') { e.preventDefault(); serveFirstMatch(state); return; }
    if (key === 't') { clickTrash(state); return; }
    if (key === 'r') { startShift(state); return; }
    for (const [kind, def] of Object.entries(INGREDIENTS)) {
      if (key === def.key) { ensureAudio(); pickBin(state, kind); return; }
    }
  });
}
