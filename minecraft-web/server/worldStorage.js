const fs = require('node:fs/promises');
const path = require('node:path');
const { serializeChunk, deserializeChunk } = require('./chunkSerializer');

class WorldStorage {
  constructor(baseDir = path.resolve(process.cwd(), 'minecraft-web-data')) {
    this.baseDir = baseDir;
    this.worldDir = path.join(this.baseDir, 'world');
    this.metaFile = path.join(this.baseDir, 'world.json');
  }

  async init() {
    await fs.mkdir(this.worldDir, { recursive: true });
    try {
      await fs.access(this.metaFile);
    } catch {
      await fs.writeFile(this.metaFile, JSON.stringify({ seed: 1337, createdAt: Date.now() }, null, 2), 'utf8');
    }
  }

  async readMeta() {
    const raw = await fs.readFile(this.metaFile, 'utf8');
    return JSON.parse(raw);
  }

  chunkFilePath(cx, cz) {
    return path.join(this.worldDir, `chunk_${cx}_${cz}.bin`);
  }

  async loadChunk(cx, cz) {
    try {
      const buffer = await fs.readFile(this.chunkFilePath(cx, cz));
      return deserializeChunk(buffer);
    } catch {
      return null;
    }
  }

  async saveChunk(chunk) {
    const buffer = serializeChunk(chunk);
    await fs.writeFile(this.chunkFilePath(chunk.cx, chunk.cz), buffer);
  }
}

module.exports = { WorldStorage };
