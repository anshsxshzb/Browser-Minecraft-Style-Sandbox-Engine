import { BLOCK } from './blockTypes.js';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 256;

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT).fill(BLOCK.AIR);
    this.dirty = true;
    this.mesh = null;
  }

  index(x, y, z) {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  get(x, y, z) {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= CHUNK_HEIGHT) return BLOCK.AIR;
    return this.blocks[this.index(x, y, z)];
  }

  set(x, y, z, id) {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= CHUNK_HEIGHT) return;
    this.blocks[this.index(x, y, z)] = id;
    this.dirty = true;
  }
}
