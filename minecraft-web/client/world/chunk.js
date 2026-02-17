export class Chunk {
  static SIZE_X = 16;
  static SIZE_Y = 256;
  static SIZE_Z = 16;

  constructor(cx, cz, voxels = null) {
    this.cx = cx;
    this.cz = cz;
    this.voxels = voxels || new Uint8Array(Chunk.SIZE_X * Chunk.SIZE_Y * Chunk.SIZE_Z);
    this.mesh = null;
    this.dirty = true;
  }

  index(x, y, z) {
    return x + Chunk.SIZE_X * (z + Chunk.SIZE_Z * y);
  }

  get(x, y, z) {
    if (x < 0 || z < 0 || y < 0 || x >= Chunk.SIZE_X || z >= Chunk.SIZE_Z || y >= Chunk.SIZE_Y) return 0;
    return this.voxels[this.index(x, y, z)];
  }

  set(x, y, z, v) {
    if (x < 0 || z < 0 || y < 0 || x >= Chunk.SIZE_X || z >= Chunk.SIZE_Z || y >= Chunk.SIZE_Y) return;
    this.voxels[this.index(x, y, z)] = v;
    this.dirty = true;
  }
}
