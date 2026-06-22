import { Chunk } from './chunk.js';
import { ChunkMesher } from './chunkMesh.js';

export class World {
  constructor(scene, seed = 1337) {
    this.scene = scene;
    this.seed = seed;
    this.renderDistance = 8;
    this.chunks = new Map();
    this.mesher = new ChunkMesher();
    this.worker = new Worker('./world/terrainWorker.js', { type: 'module' });
    this.pending = new Set();
    this.dbPromise = this.openDB();

    this.worker.onmessage = (event) => {
      const { cx, cz, voxels } = event.data;
      const key = this.key(cx, cz);
      this.pending.delete(key);
      const chunk = new Chunk(cx, cz, new Uint8Array(voxels));
      this.chunks.set(key, chunk);
      this.rebuildChunk(chunk);
      this.saveChunkToIndexedDB(chunk);
    };
  }

  key(cx, cz) { return `${cx},${cz}`; }

  async openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('minecraft-world', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('chunks');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async saveChunkToIndexedDB(chunk) {
    const db = await this.dbPromise;
    const tx = db.transaction('chunks', 'readwrite');
    tx.objectStore('chunks').put(chunk.voxels, this.key(chunk.cx, chunk.cz));
  }

  async loadChunkFromIndexedDB(cx, cz) {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction('chunks', 'readonly');
      const req = tx.objectStore('chunks').get(this.key(cx, cz));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async ensureChunk(cx, cz) {
    const key = this.key(cx, cz);
    if (this.chunks.has(key) || this.pending.has(key)) return;
    this.pending.add(key);

    const cached = await this.loadChunkFromIndexedDB(cx, cz);
    if (cached) {
      const chunk = new Chunk(cx, cz, new Uint8Array(cached));
      this.pending.delete(key);
      this.chunks.set(key, chunk);
      this.rebuildChunk(chunk);
      return;
    }

    try {
      const response = await fetch(`/api/chunk/${cx}/${cz}`);
      if (response.ok) {
        const saved = await response.json();
        const chunk = new Chunk(cx, cz, Uint8Array.from(saved.voxels));
        this.pending.delete(key);
        this.chunks.set(key, chunk);
        this.rebuildChunk(chunk);
        return;
      }
    } catch {
      // server may be unavailable during local static testing
    }

    this.worker.postMessage({ cx, cz, seed: this.seed });
  }

  updateStreaming(playerPosition) {
    const pcx = Math.floor(playerPosition.x / Chunk.SIZE_X);
    const pcz = Math.floor(playerPosition.z / Chunk.SIZE_Z);

    for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
      for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
        this.ensureChunk(pcx + dx, pcz + dz);
      }
    }

    for (const [key, chunk] of this.chunks) {
      const dist = Math.max(Math.abs(chunk.cx - pcx), Math.abs(chunk.cz - pcz));
      const visible = dist <= this.renderDistance;
      if (chunk.mesh) chunk.mesh.visible = visible;

      if (dist > this.renderDistance + 1) {
        if (chunk.mesh) this.scene.remove(chunk.mesh);
        this.chunks.delete(key);
      }
    }
  }

  rebuildChunk(chunk) {
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
    }
    chunk.mesh = this.mesher.build(chunk, this);
    chunk.mesh.frustumCulled = true;
    this.scene.add(chunk.mesh);
    chunk.dirty = false;
  }

  getChunkAtWorld(wx, wz) {
    const cx = Math.floor(wx / Chunk.SIZE_X);
    const cz = Math.floor(wz / Chunk.SIZE_Z);
    return this.chunks.get(this.key(cx, cz)) || null;
  }

  getBlock(wx, wy, wz) {
    if (wy < 0 || wy >= Chunk.SIZE_Y) return 0;
    const chunk = this.getChunkAtWorld(wx, wz);
    if (!chunk) return 0;
    const lx = ((wx % Chunk.SIZE_X) + Chunk.SIZE_X) % Chunk.SIZE_X;
    const lz = ((wz % Chunk.SIZE_Z) + Chunk.SIZE_Z) % Chunk.SIZE_Z;
    return chunk.get(lx, wy, lz);
  }

  setBlock(wx, wy, wz, value) {
    const chunk = this.getChunkAtWorld(wx, wz);
    if (!chunk || wy < 0 || wy >= Chunk.SIZE_Y) return false;

    const lx = ((wx % Chunk.SIZE_X) + Chunk.SIZE_X) % Chunk.SIZE_X;
    const lz = ((wz % Chunk.SIZE_Z) + Chunk.SIZE_Z) % Chunk.SIZE_Z;
    chunk.set(lx, wy, lz, value);
    this.rebuildChunk(chunk);
    this.saveChunkToIndexedDB(chunk);
    this.saveChunkToServer(chunk);
    return true;
  }

  async saveChunkToServer(chunk) {
    try {
      await fetch('/api/chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cx: chunk.cx, cz: chunk.cz, voxels: Array.from(chunk.voxels) }),
      });
    } catch {
      // Offline single-player fallback.
    }
  }
}
