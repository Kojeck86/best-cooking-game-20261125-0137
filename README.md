# Dapur Kilat — Lightning Kitchen

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Kojeck86/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Kojeck86/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A fast, original cooking game for the [make.fun bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). You are the chef of a small Indonesian kitchen: orders land on the board, you grab ingredients from the counter, build each dish on the plate and serve it before its timer runs out. Three missed orders and the shift is over.

## How to play

Serve the game folder and open it in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

No network is needed — the game is plain static files, all art drawn on canvas and all sounds synthesized with WebAudio.

- **Click an ingredient bin** on the counter, or press **1–8**, to add it to the plate.
- **SAJIKAN (Space)** serves the plate when it matches an order exactly.
- **BUANG (T)** tips the plate into the bin and starts over.
- **P** pauses, **M** mutes, **R** restarts, **Enter** starts / plays again.

## Scoring

Each dish pays its price in coins plus a tip of up to 10 coins for serving fast. Serving dishes back to back builds a combo (up to x5) that multiplies the tip. Every 5 dishes served raises the level: orders arrive faster, tickets live shorter, and new dishes unlock (Ayam Geprek at level 2, Soto Ayam at 3, Nasi Ayam at 4). A shift lasts 3 minutes; survive it, or lose it on 3 missed orders.

## Menu

| Dish | Recipe | Price |
| --- | --- | --- |
| Nasi Goreng | Nasi + Telur + Kecap | 10 |
| Mie Ayam | Mie + Ayam + Kecap | 12 |
| Es Teh | Teh + Es | 6 |
| Ayam Geprek | Ayam + Sambal + Nasi | 14 |
| Soto Ayam | Ayam + Mie + Telur | 14 |
| Nasi Ayam | Nasi + Ayam + Sambal | 13 |

## Screenshots

Four real renders of the game's own code live in `screenshots/`: the title screen over the kitchen, a dish mid-assembly with orders on the board, a plate ready to serve, and the shift-over panel. They are staged deterministically with `?shot=start|play|serve|end&seed=1` (see `game/src/shots.js`).

## Files

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` (run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to check it).
- `game/index.html` + `game/src/` — the game: `config.js` (menu and pace), `world.js` (rules), `render.js` (canvas drawing), `input.js` (mouse and keys), `audio.js` (synth sounds), `shots.js` (deterministic screenshot scenes), `main.js` (loop).
- `screenshots/` — real renders of the game's own code: title, mid-game, plate ready to serve, shift over.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
