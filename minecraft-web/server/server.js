import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorldStorage } from './worldStorage.js';
import { SocketServer } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const storage = new WorldStorage();

await storage.init();

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.resolve(__dirname, '../client')));

app.get('/api/chunk/:cx/:cz', async (req, res) => {
  const cx = Number.parseInt(req.params.cx, 10);
  const cz = Number.parseInt(req.params.cz, 10);
  const chunk = await storage.loadChunk(cx, cz);
  if (!chunk) {
    res.status(404).json({ message: 'Chunk not found' });
    return;
  }
  res.json({
    cx: chunk.cx,
    cz: chunk.cz,
    voxels: Array.from(chunk.voxels),
  });
});

app.post('/api/chunk', async (req, res) => {
  const { cx, cz, voxels } = req.body;
  if (!Number.isInteger(cx) || !Number.isInteger(cz) || !Array.isArray(voxels)) {
    res.status(400).json({ message: 'Invalid chunk payload' });
    return;
  }

  await storage.saveChunk({ cx, cz, voxels: Uint8Array.from(voxels) });
  res.json({ ok: true });
});

const sockets = new SocketServer(server);
sockets.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Minecraft web sandbox running at http://localhost:${PORT}`);
});
