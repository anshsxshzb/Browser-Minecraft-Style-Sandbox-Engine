const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { WorldStorage } = require('./worldStorage');
const { SocketHub } = require('./socket');

const app = express();
const server = http.createServer(app);
const storage = new WorldStorage();

app.use(express.json({ limit: '2mb' }));
app.use('/', express.static(path.resolve(process.cwd(), 'minecraft-web/client')));

app.get('/api/world/meta', async (_req, res) => {
  const meta = await storage.readMeta();
  res.json(meta);
});

app.get('/api/chunk/:cx/:cz', async (req, res) => {
  const cx = Number(req.params.cx);
  const cz = Number(req.params.cz);
  const chunk = await storage.loadChunk(cx, cz);
  if (!chunk) {
    res.status(404).json({ error: 'missing' });
    return;
  }
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(Buffer.from(chunk.blocks.buffer));
});

app.post('/api/chunk/:cx/:cz', async (req, res) => {
  const cx = Number(req.params.cx);
  const cz = Number(req.params.cz);
  const blocks = Uint8Array.from(req.body.blocks || []);
  await storage.saveChunk({ cx, cz, blocks, version: 1, seed: req.body.seed ?? 0 });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

(async () => {
  await storage.init();
  new SocketHub(server);
  server.listen(PORT, () => {
    console.log(`Minecraft web sandbox listening on http://localhost:${PORT}`);
  });
})();
