// Dapur Kilat — configuration: the canvas, the pantry, the menu and the pace.
// Every number the game tunes lives here, so the rules can be read at a glance.

/** Logical canvas size. The page scales the canvas to the window; the game always draws in this space. */
export const VIEW = { width: 1280, height: 720 };

/** Fixed simulation step, in seconds. The world advances in whole steps, which keeps
 *  the screenshot scenes deterministic for a given seed. */
export const STEP = 1 / 60;

/** A shift lasts this many seconds of orders before the kitchen closes on a win. */
export const SHIFT_SECONDS = 180;

/** Miss this many orders and the shift ends in failure. */
export const MAX_STRIKES = 3;

/** The order board holds at most this many tickets at once. */
export const MAX_ORDERS = 3;

/** Seconds a served dish keeps the combo window open. */
export const COMBO_WINDOW = 6;

/** The pantry: eight ingredient bins on the counter, each with a keyboard key. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', shape: 'rice', color: '#fff6d8', edge: '#cbb26a' },
  { id: 'mie', name: 'Mie', key: '2', shape: 'noodle', color: '#ffd66e', edge: '#c98f1b' },
  { id: 'ayam', name: 'Ayam', key: '3', shape: 'drumstick', color: '#e8a34c', edge: '#9c5a16' },
  { id: 'telur', name: 'Telur', key: '4', shape: 'egg', color: '#fffdf5', edge: '#c9b48a' },
  { id: 'kecap', name: 'Kecap', key: '5', shape: 'bottle', color: '#4a2c14', edge: '#2b1808' },
  { id: 'sambal', name: 'Sambal', key: '6', shape: 'chili', color: '#e23b2e', edge: '#8f130b' },
  { id: 'teh', name: 'Teh', key: '7', shape: 'cup', color: '#c97b2d', edge: '#7a4a12' },
  { id: 'es', name: 'Es', key: '8', shape: 'cube', color: '#bfe9ff', edge: '#5aa7d6' },
];

/** The menu. A dish is its name, its English gloss, its price in coins, the
 *  ingredients that build it (in serving order) and the level that unlocks it. */
export const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', sub: 'Fried Rice', price: 10, recipe: ['nasi', 'telur', 'kecap'], minLevel: 1 },
  { id: 'mie-ayam', name: 'Mie Ayam', sub: 'Chicken Noodles', price: 12, recipe: ['mie', 'ayam', 'kecap'], minLevel: 1 },
  { id: 'es-teh', name: 'Es Teh', sub: 'Iced Tea', price: 6, recipe: ['teh', 'es'], minLevel: 1 },
  { id: 'ayam-geprek', name: 'Ayam Geprek', sub: 'Smashed Chicken', price: 14, recipe: ['ayam', 'sambal', 'nasi'], minLevel: 2 },
  { id: 'soto-ayam', name: 'Soto Ayam', sub: 'Chicken Soup', price: 14, recipe: ['ayam', 'mie', 'telur'], minLevel: 3 },
  { id: 'nasi-ayam', name: 'Nasi Ayam', sub: 'Chicken Rice', price: 13, recipe: ['nasi', 'ayam', 'sambal'], minLevel: 4 },
];

/** How many dishes the kitchen serves before the next level (and the pace) rises. */
export const SERVES_PER_LEVEL = 5;

/** Order timing by level: how often a new ticket appears, and how long a ticket lives. */
export function levelPace(level) {
  return {
    spawnEvery: Math.max(4.5, 9 - (level - 1) * 1.1),
    orderSeconds: Math.max(18, 32 - (level - 1) * 2.5),
  };
}

/** Dishes the kitchen knows at this level. */
export function dishesAtLevel(level) {
  return DISHES.filter((dish) => dish.minLevel <= level);
}

/** Look an ingredient up by id. */
export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

/** Look a dish up by id. */
export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}
