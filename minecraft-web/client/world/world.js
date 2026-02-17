import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Chunk, CHUNK_SIZE } from './chunk.js';
import { ChunkMesher } from './chunkMesh.js';
import { BLOCK } from './blockTypes.js';

class ClientWorldDB {
  constructor(name = 'minecraft-web-cache') {
    this.name = name;
    this.db = null;
  }

  async init() {
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(this.name, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('chunks');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getChunk(key) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('chunks', 'readonly');
      const req = tx.objectStore('chunks').get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  }

  async putChunk(key, data) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('chunks', 'readwrite');
      tx.objectStore('chunks').put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }
}

export class World {
  constructor(scene, texture) {
    this.scene = scene;
    this.seed = 1337;
    this.renderDistance = 8;
    this.chunks = new Map();
    this.pending = new Set();
    this.worker = new Worker('./world/terrainWorker.js', { type: 'module' });
    this.db = new ClientWorldDB();
    this.material = new THREE.MeshLambertMaterial({ map: texture });
    this.mesher = new ChunkMesher(this.material);

    this.worker.onmessage = (e) => this.onChunkGenerated(e.data);
  }

  async init() {
    await this.db.init();
    try {
      const meta = await fetch('/api/world/meta').then((r) => r.json());
      this.seed = meta.seed ?? this.seed;
    } catch {
      // offline single player fallback
    }
  }

  key(cx, cz) { return `${cx},${cz}`; }

  async ensureChunk(cx, cz) {
    const key = this.key(cx, cz);
    if (this.chunks.has(key) || this.pending.has(key)) return;
    this.pending.add(key);

    const cached = await this.db.getChunk(key);
    if (cached?.blocks) {
      const chunk = new Chunk(cx, cz);
      chunk.blocks = new Uint8Array(cached.blocks);
      this.chunks.set(key, chunk);
      this.pending.delete(key);
      this.remeshChunk(chunk);
      return;
    }

    this.worker.postMessage({ cx, cz, seed: this.seed });
  }

  onChunkGenerated({ cx, cz, blocks }) {
    const key = this.key(cx, cz);
    const chunk = new Chunk(cx, cz);
    chunk.blocks = new Uint8Array(blocks);
    this.chunks.set(key, chunk);
    this.pending.delete(key);
    this.db.putChunk(key, { blocks: Array.from(chunk.blocks) });
    this.remeshChunk(chunk);
  }

  remeshChunk(chunk) {
    if (chunk.mesh) {
      chunk.mesh.geometry.dispose();
      this.scene.remove(chunk.mesh);
    }
    chunk.mesh = this.mesher.build(chunk, this);
    this.scene.add(chunk.mesh);
    chunk.dirty = false;
  }

  worldToChunk(wx, wz) {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { cx, cz, lx, lz };
  }

  getBlockGlobal(wx, y, wz) {
    if (y < 0 || y >= 256) return BLOCK.AIR;
    const { cx, cz, lx, lz } = this.worldToChunk(Math.floor(wx), Math.floor(wz));
    const chunk = this.chunks.get(this.key(cx, cz));
    if (!chunk) return BLOCK.AIR;
    return chunk.get(lx, Math.floor(y), lz);
  }

  setBlockGlobal(wx, y, wz, id) {
    const { cx, cz, lx, lz } = this.worldToChunk(Math.floor(wx), Math.floor(wz));
    const key = this.key(cx, cz);
    const chunk = this.chunks.get(key);
    if (!chunk) return;
    chunk.set(lx, Math.floor(y), lz, id);
    this.remeshChunk(chunk);
    this.db.putChunk(key, { blocks: Array.from(chunk.blocks) });
    fetch(`/api/chunk/${cx}/${cz}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: this.seed, blocks: Array.from(chunk.blocks) }),
    }).catch(() => {});
  }

  update(playerPos) {
    const pCx = Math.floor(playerPos.x / CHUNK_SIZE);
    const pCz = Math.floor(playerPos.z / CHUNK_SIZE);
    for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
      for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
        this.ensureChunk(pCx + dx, pCz + dz);
      }
    }

    for (const [key, chunk] of this.chunks.entries()) {
      if (Math.abs(chunk.cx - pCx) > this.renderDistance + 1 || Math.abs(chunk.cz - pCz) > this.renderDistance + 1) {
        if (chunk.mesh) this.scene.remove(chunk.mesh);
        this.chunks.delete(key);
      }
    }
  }
}
