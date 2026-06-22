import fs from 'node:fs/promises';
import path from 'node:path';
import { ChunkSerializer } from './chunkSerializer.js';

export class WorldStorage {
  constructor(worldName = 'default') {
    this.baseDir = path.resolve('minecraft-web-data', worldName);
    this.chunksDir = path.join(this.baseDir, 'chunks');
  }

  async init() {
    await fs.mkdir(this.chunksDir, { recursive: true });
  }

  chunkPath(cx, cz) {
    return path.join(this.chunksDir, `${cx}_${cz}.bin`);
  }

  async saveChunk(chunk) {
    const encoded = ChunkSerializer.encode(chunk);
    await fs.writeFile(this.chunkPath(chunk.cx, chunk.cz), encoded);
  }

  async loadChunk(cx, cz) {
    try {
      const data = await fs.readFile(this.chunkPath(cx, cz));
      return ChunkSerializer.decode(data);
    } catch {
      return null;
    }
  }

  async listSavedChunks() {
    const files = await fs.readdir(this.chunksDir);
    return files
      .filter((file) => file.endsWith('.bin'))
      .map((file) => file.replace('.bin', ''));
  }
}
