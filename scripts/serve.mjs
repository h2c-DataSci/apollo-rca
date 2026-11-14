import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const previewPort = Number(process.argv[2] || 8080);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json'};
const server = createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/apollo-rca(?=\/|$)/, '') || '/';
    if (path.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
    const target = await realpath(resolve(root, '.' + (path === '/' ? '/index.html' : path)));
    if (!target.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(target);
    res.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404).end(); }
});
server.on('error', err => { console.error(err.code === 'EADDRINUSE' ? 'Port already in use. Choose another port: node scripts/serve.mjs 8081' : err.message); process.exitCode = 1; });
server.listen(previewPort, '127.0.0.1', () => console.log(`Apollo RCA preview: http://127.0.0.1:${previewPort}/apollo-rca/`));
