// Dapur Kilat — everything the player sees: the kitchen, the order board, the counter,
// the plate and the overlays. All art is drawn with canvas shapes, so the game needs
// no image files and never touches the network.

import { INGREDIENTS, DISHES, VIEW, SHIFT_SECONDS, MAX_STRIKES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

/** Where every clickable thing sits, in logical pixels. Input hit-testing reads this. */
export function computeLayout() {
  const bins = [];
  const binWidth = 138;
  const binGap = 12;
  const firstX = 24;
  for (let index = 0; index < INGREDIENTS.length; index += 1) {
    bins.push({
      id: INGREDIENTS[index].id,
      x: firstX + index * (binWidth + binGap),
      y: 576,
      w: binWidth,
      h: 120,
    });
  }
  return {
    bins,
    serveBtn: { x: 470, y: 452, w: 220, h: 64 },
    trashBtn: { x: 706, y: 452, w: 110, h: 64 },
    pauseBtn: { x: 1150, y: 14, w: 52, h: 36 },
    muteBtn: { x: 1210, y: 14, w: 52, h: 36 },
    startBtn: { x: 490, y: 520, w: 300, h: 64 },
    restartBtn: { x: 490, y: 528, w: 300, h: 64 },
  };
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** Draw one ingredient's little picture inside a square of the given size. */
export function drawIngredientIcon(ctx, shape, cx, cy, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, size * 0.05);
  if (shape === 'rice') {
    ctx.fillStyle = '#fff6d8';
    ctx.strokeStyle = '#cbb26a';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.35, s * 0.95, s * 0.55, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e8d49a';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.ellipse(-s * 0.5 + i * s * 0.25, -s * 0.1 - (i % 2) * s * 0.18, s * 0.09, s * 0.16, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === 'noodle') {
    ctx.strokeStyle = '#e8a91c';
    ctx.lineWidth = size * 0.09;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      const y = -s * 0.45 + i * s * 0.45;
      ctx.moveTo(-s * 0.8, y);
      ctx.bezierCurveTo(-s * 0.3, y - s * 0.35, s * 0.3, y + s * 0.35, s * 0.8, y);
      ctx.stroke();
    }
  } else if (shape === 'drumstick') {
    ctx.fillStyle = '#e8a34c';
    ctx.strokeStyle = '#9c5a16';
    ctx.beginPath();
    ctx.arc(-s * 0.1, -s * 0.05, s * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#fffdf5';
    ctx.lineWidth = size * 0.1;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.35);
    ctx.lineTo(s * 0.85, s * 0.85);
    ctx.stroke();
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(s * 0.88, s * 0.88, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'egg') {
    ctx.fillStyle = '#fffdf5';
    ctx.strokeStyle = '#c9b48a';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.8, s * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'bottle') {
    ctx.fillStyle = '#4a2c14';
    ctx.strokeStyle = '#2b1808';
    roundRect(ctx, -s * 0.32, -s * 0.15, s * 0.64, s * 0.95, s * 0.18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(-s * 0.16, -s * 0.85, s * 0.32, s * 0.75);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-s * 0.2, -s * 0.98, s * 0.4, s * 0.18);
  } else if (shape === 'chili') {
    ctx.fillStyle = '#e23b2e';
    ctx.strokeStyle = '#8f130b';
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.9, -s * 0.7, s * 0.55, s * 0.55);
    ctx.quadraticCurveTo(s * 0.35, s * 0.95, -s * 0.15, s * 0.6);
    ctx.quadraticCurveTo(s * 0.15, s * 0.1, -s * 0.7, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = size * 0.07;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.85, -s * 0.9, -s * 0.45, -s * 0.95);
    ctx.stroke();
  } else if (shape === 'cup') {
    ctx.fillStyle = '#c97b2d';
    ctx.strokeStyle = '#7a4a12';
    roundRect(ctx, -s * 0.55, -s * 0.45, s * 1.1, s * 1.1, s * 0.16);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#7a4a12';
    ctx.lineWidth = size * 0.07;
    ctx.beginPath();
    ctx.arc(s * 0.68, s * 0.05, s * 0.34, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.75);
    ctx.quadraticCurveTo(-s * 0.4, -s * 1.05, -s * 0.2, -s * 1.2);
    ctx.moveTo(s * 0.2, -s * 0.75);
    ctx.quadraticCurveTo(s * 0.05, -s * 1.05, s * 0.25, -s * 1.2);
    ctx.stroke();
  } else if (shape === 'cube') {
    ctx.fillStyle = '#bfe9ff';
    ctx.strokeStyle = '#5aa7d6';
    for (const [dx, dy, sizeMul] of [[-0.35, -0.3, 0.62], [0.35, 0.15, 0.7], [-0.1, 0.45, 0.55]]) {
      ctx.save();
      ctx.translate(dx * s, dy * s);
      ctx.rotate(0.35);
      const w = s * sizeMul;
      ctx.fillRect(-w, -w, w * 2, w * 2);
      ctx.strokeRect(-w, -w, w * 2, w * 2);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawChip(ctx, ingredient, x, y, size) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d8cfc0';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, size, size, size * 0.22);
  ctx.fill();
  ctx.stroke();
  drawIngredientIcon(ctx, ingredient.shape, x + size / 2, y + size / 2, size * 0.72);
}

function drawButton(ctx, rect, label, enabled, accent) {
  ctx.fillStyle = enabled ? accent : '#9a938a';
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 24, '#ffffff', 800, 'center');
}

function drawTicket(ctx, order, x, y, w, h, dish) {
  const urgent = order.secondsLeft < 8;
  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = urgent ? '#d62828' : '#e0d5bd';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  text(ctx, `#${order.number}`, x + 14, y + 22, 15, '#8a7a5c', 800);
  text(ctx, dish.name, x + 62, y + 24, 22, '#2b2118', 800);
  text(ctx, dish.sub, x + 62, y + 46, 13, '#8a7a5c', 600);
  let chipX = x + 14;
  for (const id of dish.recipe) {
    const ingredient = INGREDIENTS.find((item) => item.id === id);
    drawChip(ctx, ingredient, chipX, y + 62, 34);
    chipX += 42;
  }
  const barX = x + 14;
  const barW = w - 28 - 48;
  const fraction = Math.max(0, order.secondsLeft / order.secondsTotal);
  ctx.fillStyle = '#eee6d3';
  roundRect(ctx, barX, y + h - 22, barW, 10, 5);
  ctx.fill();
  ctx.fillStyle = fraction > 0.5 ? '#43aa5b' : fraction > 0.25 ? '#f4a71d' : '#d62828';
  if (fraction > 0) {
    roundRect(ctx, barX, y + h - 22, barW * fraction, 10, 5);
    ctx.fill();
  }
  // The seconds sit beside the bar, never on top of it.
  text(ctx, `${Math.ceil(order.secondsLeft)}s`, x + w - 14, y + h - 16, 15, urgent ? '#d62828' : '#6b5d43', 800, 'right');
}

/** Draw the whole scene for the given screen and world. */
export function draw(ctx, world, screen, ui) {
  const layout = computeLayout();
  const { width, height } = VIEW;

  // Kitchen wall: warm cream tiles.
  ctx.fillStyle = '#f7ead2';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(180,140,90,0.25)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= width; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 556); ctx.stroke();
  }
  for (let y = 64; y <= 556; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  // Wooden counter along the bottom.
  ctx.fillStyle = '#a9713f';
  ctx.fillRect(0, 556, width, 20);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(0, 576, width, 144);

  // Header bar.
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(0, 0, width, 64);
  text(ctx, 'DAPUR KILAT', 24, 33, 30, '#ffd166', 900);
  text(ctx, 'Lightning Kitchen', 248, 36, 15, '#f7ead2', 600);
  // Coin display: a drawn gold coin, never an emoji (headless fonts vary).
  ctx.fillStyle = '#ffd166';
  ctx.strokeStyle = '#c98f1b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(482, 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'K', 482, 33, 15, '#7f1d1d', 900, 'center');
  text(ctx, `${world.coins}`, 502, 33, 24, '#ffffff', 800);
  text(ctx, `Disajikan ${world.served}`, 620, 33, 20, '#f7ead2', 700);
  text(ctx, `Level ${world.level}`, 790, 33, 20, '#f7ead2', 700);
  const shiftFraction = Math.min(1, world.shiftTime / SHIFT_SECONDS);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 880, 24, 150, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  roundRect(ctx, 880, 24, 150 * shiftFraction, 14, 7);
  ctx.fill();
  const minutes = Math.floor(world.shiftTime / 60);
  const seconds = Math.floor(world.shiftTime % 60);
  text(ctx, `${minutes}:${String(seconds).padStart(2, '0')}`, 1042, 33, 18, '#ffffff', 700);
  // Strikes as chillies, kept clear of the pause button.
  for (let i = 0; i < MAX_STRIKES; i += 1) {
    const lost = i < world.strikes;
    ctx.globalAlpha = lost ? 0.25 : 1;
    drawIngredientIcon(ctx, 'chili', 1078 + i * 24, 32, 20);
    ctx.globalAlpha = 1;
  }
  drawButton(ctx, layout.pauseBtn, ui.paused ? '▶' : 'II', true, '#5b3a29');
  drawButton(ctx, layout.muteBtn, ui.muted ? '✕' : '♪', true, '#5b3a29');

  // Order board (left).
  ctx.fillStyle = '#5b3a29';
  roundRect(ctx, 24, 84, 356, 452, 14);
  ctx.fill();
  text(ctx, 'ORDER BOARD', 44, 112, 20, '#ffd166', 900);
  text(ctx, 'Pesanan masuk', 44, 136, 14, '#d9c4a5', 600);
  if (world.orders.length === 0) {
    text(ctx, 'Belum ada pesanan…', 202, 300, 18, '#d9c4a5', 600, 'center');
    text(ctx, 'tunggu sebentar, pelanggan datang!', 202, 328, 15, '#b89b74', 600, 'center');
  }
  world.orders.forEach((order, index) => {
    const dish = DISHES.find((item) => item.id === order.dishId);
    drawTicket(ctx, order, 40, 152 + index * 128, 324, 116, dish);
  });

  // Recipe book (right).
  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = '#e0d5bd';
  ctx.lineWidth = 2;
  roundRect(ctx, 900, 84, 356, 452, 14);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'RESEP', 924, 112, 20, '#7f1d1d', 900);
  text(ctx, 'Buku resep dapur', 924, 136, 14, '#8a7a5c', 600);
  DISHES.forEach((dish, index) => {
    const y = 152 + index * 62;
    const unlocked = dish.minLevel <= world.level;
    ctx.globalAlpha = unlocked ? 1 : 0.45;
    text(ctx, dish.name, 924, y + 14, 19, '#2b2118', 800);
    text(ctx, dish.sub, 924, y + 36, 12, '#8a7a5c', 600);
    if (!unlocked) text(ctx, `Lv ${dish.minLevel}`, 1180, y + 14, 14, '#b3541e', 800);
    let chipX = 1120;
    for (const id of dish.recipe) {
      const ingredient = INGREDIENTS.find((item) => item.id === id);
      drawChip(ctx, ingredient, chipX, y - 2, 30);
      chipX -= 36;
    }
    ctx.globalAlpha = 1;
    if (index < DISHES.length - 1) {
      ctx.strokeStyle = '#eee6d3';
      ctx.beginPath(); ctx.moveTo(924, y + 50); ctx.lineTo(1232, y + 50); ctx.stroke();
    }
  });

  // Stove and plate (centre).
  ctx.fillStyle = '#3f3a35';
  roundRect(ctx, 404, 84, 472, 340, 14);
  ctx.fill();
  ctx.fillStyle = '#2b2724';
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.arc(520 + i * 240, 170, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#55504a';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  // The plate.
  const plateX = 640;
  const plateY = 330;
  ctx.fillStyle = '#fffdf6';
  ctx.strokeStyle = '#d8cfc0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(plateX, plateY, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(plateX, plateY, 68, 0, Math.PI * 2);
  ctx.strokeStyle = '#eee6d3';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (world.plate.length === 0) {
    text(ctx, 'Piring kosong', plateX, plateY - 8, 17, '#b0a284', 700, 'center');
    text(ctx, 'klik bahan di bawah', plateX, plateY + 16, 14, '#c9bda6', 600, 'center');
  } else {
    world.plate.forEach((id, index) => {
      const ingredient = INGREDIENTS.find((item) => item.id === id);
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / 3);
      const x = plateX + Math.cos(angle) * 40 - 24;
      const y = plateY + Math.sin(angle) * 40 - 24;
      drawChip(ctx, ingredient, x, y, 48);
    });
  }
  const matching = world.matchingOrder();
  const serveReady = matching !== null;
  drawButton(ctx, layout.serveBtn, serveReady ? 'SAJIKAN ✓' : 'SAJIKAN', serveReady, serveReady ? '#2e9e4f' : '#9a938a');
  drawButton(ctx, layout.trashBtn, 'BUANG', world.plate.length > 0, '#b3541e');
  // The serve hint belongs to live play only; the title and closing panels cover it.
  if (screen === SCREEN_PLAY) {
    if (serveReady) {
      text(ctx, `untuk #${matching.number} ${DISHES.find((d) => d.id === matching.dishId).name}`, 580, 540, 16, '#2e7d32', 800, 'center');
    } else if (world.plate.length > 0) {
      text(ctx, 'belum cocok dengan pesanan', 580, 540, 15, '#8a7a5c', 600, 'center');
    }
  }

  // Ingredient bins on the counter.
  text(ctx, 'BAHAN DI COUNTER  —  klik atau tekan 1–8', 24, 566, 15, '#ffd166', 800);
  layout.bins.forEach((bin) => {
    const ingredient = INGREDIENTS.find((item) => item.id === bin.id);
    const onPlate = world.plate.includes(bin.id);
    ctx.fillStyle = onPlate ? '#ffe9a8' : '#fffdf6';
    ctx.strokeStyle = onPlate ? '#e8a91c' : '#d8cfc0';
    ctx.lineWidth = onPlate ? 3 : 2;
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 12);
    ctx.fill();
    ctx.stroke();
    drawIngredientIcon(ctx, ingredient.shape, bin.x + bin.w / 2, bin.y + 46, 52);
    text(ctx, ingredient.name, bin.x + bin.w / 2, bin.y + 96, 17, '#2b2118', 800, 'center');
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(bin.x + bin.w - 14, bin.y + 14, 11, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ingredient.key, bin.x + bin.w - 14, bin.y + 15, 13, '#ffffff', 800, 'center');
  });

  // Combo badge.
  if (world.combo >= 2 && world.comboTimer > 0) {
    ctx.fillStyle = '#b3541e';
    roundRect(ctx, 1060, 452, 196, 64, 12);
    ctx.fill();
    text(ctx, `KOMBO x${Math.min(world.combo, 5)}`, 1158, 476, 22, '#ffffff', 900, 'center');
    text(ctx, 'sajikan cepat untuk bonus', 1158, 500, 13, '#ffd166', 600, 'center');
  }

  // Toast (floating +coins / warnings).
  if (ui.toast && ui.toast.until > ui.now) {
    ctx.globalAlpha = Math.min(1, (ui.toast.until - ui.now) / 0.4);
    text(ctx, ui.toast.text, 640, 420, 26, ui.toast.color || '#2e7d32', 900, 'center');
    ctx.globalAlpha = 1;
  }

  // Title screen overlay.
  if (screen === SCREEN_TITLE) {
    ctx.fillStyle = 'rgba(43,33,24,0.72)';
    ctx.fillRect(0, 0, width, height);
    text(ctx, 'DAPUR KILAT', 640, 190, 84, '#ffd166', 900, 'center');
    text(ctx, 'Lightning Kitchen — masak cepat, sajikan tepat!', 640, 252, 24, '#ffffff', 700, 'center');
    text(ctx, 'Pesanan datang di order board. Klik bahan di counter (atau tekan 1–8),', 640, 316, 20, '#f7ead2', 600, 'center');
    text(ctx, 'susun di piring, lalu SAJIKAN sebelum waktunya habis. 3 pesanan hangus = shift berakhir.', 640, 346, 20, '#f7ead2', 600, 'center');
    text(ctx, 'Spasi = sajikan   •   T = buang piring   •   P = jeda   •   M = suara', 640, 386, 18, '#ffd166', 700, 'center');
    const pulse = 0.75 + 0.25 * Math.sin(ui.now * 4);
    ctx.globalAlpha = pulse;
    drawButton(ctx, layout.startBtn, 'MULAI MEMASAK', true, '#2e9e4f');
    ctx.globalAlpha = 1;
    if (ui.best > 0) text(ctx, `Rekor: ${ui.best} koin`, 640, 616, 20, '#ffffff', 800, 'center');
  }

  // Pause overlay.
  if (screen === SCREEN_PLAY && ui.paused) {
    ctx.fillStyle = 'rgba(43,33,24,0.6)';
    ctx.fillRect(0, 0, width, height);
    text(ctx, 'JEDA', 640, 330, 64, '#ffffff', 900, 'center');
    text(ctx, 'tekan P atau klik tombol II untuk lanjut', 640, 392, 20, '#f7ead2', 600, 'center');
  }

  // Game over overlay.
  if (screen === SCREEN_OVER) {
    ctx.fillStyle = 'rgba(43,33,24,0.78)';
    ctx.fillRect(0, 0, width, height);
    text(ctx, world.won ? 'SHIFT SELESAI!' : 'SHIFT BERAKHIR', 640, 210, 64, world.won ? '#7ddb8a' : '#ff9d8a', 900, 'center');
    text(ctx, world.won ? 'Semua pesanan terlayani — dapur bangga padamu!' : 'Tiga pesanan hangus — pelanggan pulang kecewa.', 640, 272, 22, '#ffffff', 700, 'center');
    text(ctx, `${world.coins} koin  •  ${world.served} hidangan disajikan  •  Level ${world.level}`, 640, 330, 24, '#ffd166', 800, 'center');
    if (ui.best > 0) text(ctx, `Rekor: ${ui.best} koin`, 640, 368, 20, '#ffffff', 700, 'center');
    drawButton(ctx, layout.restartBtn, 'MASAK LAGI (R)', true, '#2e9e4f');
    text(ctx, 'atau tekan Enter', 640, 616, 18, '#f7ead2', 600, 'center');
  }
}
