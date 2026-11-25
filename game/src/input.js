// Dapur Kilat — mouse and keyboard. The canvas is scaled by CSS, so every pointer
// position is mapped back into the game's logical 1280x720 space before hit-testing.

import { INGREDIENTS, VIEW } from './config.js';
import { computeLayout } from './render.js';

/** Is a point inside a rectangle? */
function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** Wire the canvas and the keyboard to the game's actions.
 *  `actions` gets one function per thing the player can do. */
export function bindInput(canvas, actions) {
  const layout = computeLayout();

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    // One tap is one action: stop the browser from also firing a synthetic click.
    event.preventDefault();
    const point = toLogical(event);
    for (const bin of layout.bins) {
      if (inside(point.x, point.y, bin)) {
        actions.onIngredient(bin.id);
        return;
      }
    }
    if (inside(point.x, point.y, layout.serveBtn)) actions.onServe();
    else if (inside(point.x, point.y, layout.trashBtn)) actions.onTrash();
    else if (inside(point.x, point.y, layout.pauseBtn)) actions.onPause();
    else if (inside(point.x, point.y, layout.muteBtn)) actions.onMute();
    else if (inside(point.x, point.y, layout.startBtn)) actions.onStart();
    else if (inside(point.x, point.y, layout.restartBtn)) actions.onRestart();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const ingredient = INGREDIENTS.find((item) => item.key === event.key);
    if (ingredient) {
      actions.onIngredient(ingredient.id);
      return;
    }
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        actions.onConfirm();
        break;
      case 't':
      case 'T':
        actions.onTrash();
        break;
      case 'p':
      case 'P':
        actions.onPause();
        break;
      case 'm':
      case 'M':
        actions.onMute();
        break;
      case 'r':
      case 'R':
        actions.onRestart();
        break;
      default:
        break;
    }
  });
}
