// Dapur Kilat — the screenshot scenes behind ?shot=start|play|serve|end.
// Each one plays the real rules forward from a fresh world for a fixed amount of
// game time, steered by a simple autopilot, so the frame is what a short game really
// looks like — and the same seed always gives the same frame.

import { STEP, dishById } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 6;
const PLAY_MIN_SECONDS = 10;
const PLAY_MAX_SECONDS = 26;
const SERVE_MAX_SECONDS = 60;
const END_LIMIT_SECONDS = 600;

/** The autopilot's target: the oldest ticket on the board, or null. */
function targetOrder(world) {
  return world.orders.length > 0 ? world.orders[0] : null;
}

/** One autopilot decision: which ingredient to add next, 'serve', 'trash' or 'wait'. */
function autopilot(world, serveAllowed) {
  const target = targetOrder(world);
  if (target === null) return 'wait';
  if (world.matchingOrder() !== null) return serveAllowed ? 'serve' : 'wait';
  const dish = world.menu().find((item) => item.id === target.dishId);
  const wrong = world.plate.find((id) => !dish.recipe.includes(id));
  if (wrong !== undefined) return 'trash';
  const missing = dish.recipe.find((id) => !world.plate.includes(id));
  return missing === undefined ? 'wait' : missing;
}

/** Run the autopilot for up to `seconds`, stopping early when `stopWhen` says so. */
function runPilot(world, seconds, serveAllowed, stopWhen) {
  const steps = Math.floor(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    const decision = autopilot(world, serveAllowed);
    if (decision === 'serve') world.serve();
    else if (decision === 'trash') world.trashPlate();
    else if (decision !== 'wait') world.addIngredient(decision);
    world.step(STEP);
    if (world.over) return;
    if (stopWhen && stopWhen(world)) return;
  }
}

/**
 * Set `world` to the named scene (start, play, serve or end) and return the
 * screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset(1);
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'serve') {
    runPilot(world, SERVE_MAX_SECONDS, false, (state) => state.matchingOrder() !== null);
    return { screen: SCREEN_PLAY, best: world.coins };
  }
  if (name === 'end') {
    // A hurried cook who never serves: orders expire one by one until the shift ends.
    // Every so often they toss a stray ingredient on the plate, so the kitchen behind
    // the closing panel still looks like a shift that went wrong.
    let sinceIngredient = 0;
    for (let index = 0; index < END_LIMIT_SECONDS / STEP; index += 1) {
      sinceIngredient += STEP;
      if (sinceIngredient >= 15) {
        sinceIngredient = 0;
        const pantry = ['nasi', 'mie', 'ayam', 'telur', 'kecap', 'sambal', 'teh', 'es'];
        world.addIngredient(pantry[Math.floor(world.random() * pantry.length)]);
      }
      world.step(STEP);
      if (world.over) break;
    }
    return { screen: SCREEN_OVER, best: world.coins };
  }
  runPilot(world, PLAY_MAX_SECONDS, true, (state) => {
    if (state.shiftTime < PLAY_MIN_SECONDS) return false;
    // Mid-assembly means two of three ingredients on the plate for a three-ingredient
    // ticket — a two-ingredient dish would already be finished at two.
    if (state.plate.length !== 2 || state.orders.length === 0) return false;
    return dishById(state.orders[0].dishId).recipe.length === 3;
  });
  return { screen: SCREEN_PLAY, best: world.coins };
}
