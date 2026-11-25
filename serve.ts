// Dapur Kilat — a tiny static server for playtesting (development only, not part of
// the hand-in). Serves this repository's game/ at http://localhost:8080.
// Run: node serve.ts   (Node 22, standard library only)

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const gameRoot = join(repoRoot, 'game');
const port = Number(process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = join(gameRoot, decodeURIComponent(path));
  if (!file.startsWith(gameRoot) || !existsSync(file)) {
    console.log(`404 ${url.pathname}`);
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  response.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`Dapur Kilat at http://localhost:${port} (serving game/)`);
});
