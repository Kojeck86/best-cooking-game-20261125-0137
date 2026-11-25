// Dapur Kilat — the kitchen itself: orders, the plate, the coins and the pace.
// The world knows nothing about drawing or input; it only advances the rules one fixed
// step at a time, so the same seed always cooks the same shift.

import {
  COMBO_WINDOW,
  MAX_ORDERS,
  MAX_STRIKES,
  SHIFT_SECONDS,
  SERVES_PER_LEVEL,
  dishesAtLevel,
  dishById,
  levelPace,
} from './config.js';
import { makeRandom, pick, range } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_MISSED = 2;
export const EVENT_OVER = 4;
export const EVENT_LEVEL = 8;
export const EVENT_WIN = 16;

let nextTicket = 1;

/** One order ticket pinned to the board. */
function makeTicket(dish, seconds) {
  return {
    number: nextTicket,
    dishId: dish.id,
    secondsLeft: seconds,
    secondsTotal: seconds,
  };
}

/** A plate holds the ingredients the chef has added, in the order they were added. */
export class World {
  constructor(seed) {
    this.reset(seed);
  }

  reset(seed) {
    this.random = makeRandom(seed === undefined ? (Date.now() % 2147483647) : seed);
    this.orders = [];
    this.plate = [];
    this.coins = 0;
    this.served = 0;
    this.strikes = 0;
    this.level = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.spawnTimer = 3.5;
    this.shiftTime = 0;
    this.over = false;
    this.won = false;
    this.lastEvent = EVENT_NONE;
    this.servedDishId = null;
    this.earned = 0;
    nextTicket = 1;
  }

  /** The dishes the kitchen can cook at the current level. */
  menu() {
    return dishesAtLevel(this.level);
  }

  /** Does the plate, as a set, match this dish exactly? */
  plateMatches(dishId) {
    const dish = dishById(dishId);
    if (this.plate.length !== dish.recipe.length) return false;
    const have = [...this.plate].sort().join(',');
    const need = [...dish.recipe].sort().join(',');
    return have === need;
  }

  /** The order this plate would satisfy, or null. */
  matchingOrder() {
    for (const order of this.orders) {
      if (this.plateMatches(order.dishId)) return order;
    }
    return null;
  }

  /** Add an ingredient to the plate. Returns false when the plate is full or already holds it. */
  addIngredient(id) {
    if (this.over || this.plate.length >= 3 || this.plate.includes(id)) return false;
    this.plate.push(id);
    return true;
  }

  /** Tip the plate into the bin and start over. */
  trashPlate() {
    if (this.plate.length === 0) return false;
    this.plate = [];
    this.combo = 0;
    this.comboTimer = 0;
    return true;
  }

  /** Serve the plate. Pays the matching order, or buzzes when nothing matches. */
  serve() {
    if (this.over) return null;
    const order = this.matchingOrder();
    if (order === null) return { ok: false };
    const dish = dishById(order.dishId);
    const fraction = Math.max(0, order.secondsLeft / order.secondsTotal);
    const tip = Math.round(fraction * 10);
    const combo = this.comboTimer > 0 ? this.combo + 1 : 1;
    const earned = dish.price + tip * Math.min(combo, 5);
    this.coins += earned;
    this.served += 1;
    this.combo = combo;
    this.comboTimer = COMBO_WINDOW;
    this.servedDishId = dish.id;
    this.earned = earned;
    this.orders = this.orders.filter((item) => item !== order);
    this.plate = [];
    if (this.served % SERVES_PER_LEVEL === 0) {
      this.level += 1;
      this.lastEvent = EVENT_LEVEL;
    }
    if (this.shiftTime >= SHIFT_SECONDS) {
      this.over = true;
      this.won = true;
      return { ok: true, dish, earned, event: EVENT_WIN };
    }
    return { ok: true, dish, earned, event: EVENT_SERVED };
  }

  /** Open a new ticket for a dish the kitchen knows. */
  spawnOrder() {
    const pace = levelPace(this.level);
    const dish = pick(this.random, this.menu());
    const seconds = pace.orderSeconds * range(this.random, 0.9, 1.15);
    this.orders.push(makeTicket(dish, seconds));
    nextTicket += 1;
  }

  /** Advance the rules by one fixed step. Returns an event bitmask for sounds and flashes. */
  step(dt) {
    if (this.over) return EVENT_NONE;
    let events = EVENT_NONE;
    this.shiftTime += dt;
    this.lastEvent = EVENT_NONE;
    if (this.comboTimer > 0) this.comboTimer -= dt;

    const pace = levelPace(this.level);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.orders.length < MAX_ORDERS) {
      this.spawnOrder();
      this.spawnTimer = pace.spawnEvery * range(this.random, 0.85, 1.2);
    }

    for (const order of this.orders) order.secondsLeft -= dt;
    const missed = this.orders.filter((order) => order.secondsLeft <= 0);
    if (missed.length > 0) {
      this.orders = this.orders.filter((order) => order.secondsLeft > 0);
      this.strikes += missed.length;
      this.combo = 0;
      this.comboTimer = 0;
      events |= EVENT_MISSED;
      if (this.strikes >= MAX_STRIKES) {
        this.over = true;
        this.won = false;
        events |= EVENT_OVER;
        return events;
      }
    }

    if (this.shiftTime >= SHIFT_SECONDS) {
      this.over = true;
      this.won = this.strikes < MAX_STRIKES;
      events |= this.won ? EVENT_WIN : EVENT_OVER;
    }
    return events;
  }
}
