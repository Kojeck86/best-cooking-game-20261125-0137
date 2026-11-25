// Dapur Kilat — bootstrap and game loop.
// Normal play runs a fixed-step loop in the browser; a ?shot=start|play|serve|end
// query stages one deterministic scene, draws it once and stops, for screenshots.

import { STEP, VIEW } from './config.js';
import { World, EVENT_LEVEL, EVENT_MISSED, EVENT_OVER, EVENT_SERVED, EVENT_WIN } from './world.js';
import { draw, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { bindInput } from './input.js';
import { SoundBank } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const sounds = new SoundBank();
const world = new World();
let screen = SCREEN_TITLE;
let paused = false;
let best = 0;
try {
  best = Number(window.localStorage.getItem('dapur-kilat-best') || 0) || 0;
} catch (error) {
  best = 0;
}
let toast = null;

function saveBest() {
  try {
    window.localStorage.setItem('dapur-kilat-best', String(best));
  } catch (error) {
    // Private mode or file:// without storage: the record simply does not persist.
  }
}

function showToast(message, color) {
  toast = { text: message, color, until: performance.now() / 1000 + 1.6 };
}

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

function startGame() {
  world.reset();
  screen = SCREEN_PLAY;
  paused = false;
  toast = null;
}

function render(now) {
  draw(ctx, world, screen, {
    paused,
    muted: sounds.muted,
    best,
    toast,
    now: now / 1000,
  });
  // Keep the screen-reader status line in step with the kitchen.
  const status = document.getElementById('status');
  if (status) {
    status.textContent =
      screen === SCREEN_PLAY
        ? `${world.coins} koin, ${world.served} hidangan disajikan, ${world.orders.length} pesanan di papan, ${world.plate.length} bahan di piring`
        : screen === SCREEN_OVER
          ? `Shift berakhir: ${world.coins} koin, ${world.served} hidangan`
          : 'Dapur Kilat: tekan Enter untuk mulai memasak';
  }
}

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
if (shotName !== null) {
  // Screenshot mode: stage the scene from a fixed seed and draw it once.
  const seed = Number(params.get('seed') || 1);
  const staged = stageShot(shotName, world);
  if (world.coins > best) best = world.coins;
  screen = staged.screen;
  fitCanvas();
  render(performance.now());
  window.__shotReady = true;
} else {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  const actions = {
    onIngredient(id) {
      if (screen !== SCREEN_PLAY || paused) return;
      if (world.addIngredient(id)) sounds.chop();
    },
    onServe() {
      if (screen !== SCREEN_PLAY || paused) return;
      const result = world.serve();
      if (result === null) return;
      if (result.ok) {
        sounds.ding();
        showToast(`+${result.earned} koin — ${result.dish.name} disajikan!`, '#2e7d32');
        if (world.coins > best) {
          best = world.coins;
          saveBest();
        }
      } else {
        sounds.buzz();
        showToast('Piring ini tidak cocok dengan pesanan!', '#b3541e');
      }
    },
    onTrash() {
      if (screen !== SCREEN_PLAY || paused) return;
      world.trashPlate();
    },
    onPause() {
      if (screen === SCREEN_PLAY) paused = !paused;
    },
    onMute() {
      sounds.muted = !sounds.muted;
    },
    onStart() {
      if (screen === SCREEN_TITLE) startGame();
    },
    onRestart() {
      if (screen === SCREEN_OVER) startGame();
    },
    onConfirm() {
      if (screen === SCREEN_TITLE) startGame();
      else if (screen === SCREEN_OVER) startGame();
      else actions.onServe();
    },
  };
  bindInput(canvas, actions);

  let last = performance.now();
  let accumulator = 0;
  let lastTickSecond = -1;
  function frame(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (!paused && screen === SCREEN_PLAY) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        accumulator -= STEP;
        const events = world.step(STEP);
        if (events & EVENT_MISSED) {
          sounds.buzz();
          showToast('Satu pesanan hangus!', '#d62828');
        }
        if (events & EVENT_LEVEL) showToast(`Level ${world.level} — pesanan makin cepat!`, '#b3541e');
        if (events & (EVENT_OVER | EVENT_WIN)) {
          screen = SCREEN_OVER;
          sounds.jingle(Boolean(events & EVENT_WIN));
          if (world.coins > best) {
            best = world.coins;
            saveBest();
          }
        }
      }
      const urgent = world.orders.find((order) => order.secondsLeft <= 5 && order.secondsLeft > 0);
      if (urgent) {
        const second = Math.ceil(urgent.secondsLeft);
        if (second !== lastTickSecond) {
          lastTickSecond = second;
          sounds.tick();
        }
      }
    }
    render(now);
    requestAnimationFrame(frame);
  }
  render(performance.now());
  requestAnimationFrame(frame);
}
