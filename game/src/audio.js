// Sizzle & Serve — tiny synthesised sounds (WebAudio, no audio files).
// One clear job: every blip and ding the kitchen makes, so the game stays silent
// until the player first interacts (browsers block audio before a gesture).
let ctx = null;
let muted = false;

export function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
export function isMuted() {
  return muted;
}

function tone(freq, dur, type, vol, when = 0) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  pickup() { tone(520, 0.07, 'triangle', 0.12); },
  drop() { tone(340, 0.07, 'triangle', 0.10); },
  chop() { tone(180, 0.05, 'square', 0.10); tone(90, 0.05, 'square', 0.08, 0.02); },
  sizzle() { tone(1200, 0.12, 'sawtooth', 0.04); },
  ready() { tone(880, 0.10, 'sine', 0.12); tone(1320, 0.14, 'sine', 0.10, 0.09); },
  serve() { tone(660, 0.10, 'sine', 0.14); tone(880, 0.10, 'sine', 0.14, 0.08); tone(1320, 0.18, 'sine', 0.14, 0.16); },
  error() { tone(160, 0.16, 'sawtooth', 0.10); },
  expire() { tone(220, 0.25, 'sawtooth', 0.10); tone(165, 0.30, 'sawtooth', 0.10, 0.18); },
  start() { tone(523, 0.12, 'triangle', 0.14); tone(659, 0.12, 'triangle', 0.14, 0.10); tone(784, 0.20, 'triangle', 0.14, 0.20); },
  end() { tone(784, 0.15, 'triangle', 0.12); tone(659, 0.15, 'triangle', 0.12, 0.12); tone(523, 0.30, 'triangle', 0.12, 0.24); },
};
