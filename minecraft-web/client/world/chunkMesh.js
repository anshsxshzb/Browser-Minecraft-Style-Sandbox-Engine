import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { BLOCK, isSolid } from './blockTypes.js';
import { CHUNK_SIZE, CHUNK_HEIGHT } from './chunk.js';

const FACE_DELTAS = [
  { n: [1, 0, 0], corners: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
  { n: [-1, 0, 0], corners: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]] },
  { n: [0, 1, 0], corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] },
  { n: [0, -1, 0], corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
  { n: [0, 0, 1], corners: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] },
  { n: [0, 0, -1], corners: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] },
];

function uvForBlock(id) {
  const tile = id - 1;
  const columns = 4;
  const size = 1 / columns;
  const tx = (tile % columns) * size;
  const ty = 1 - Math.floor(tile / columns + 1) * size;
  return [tx, ty, tx + size, ty + size];
}

export class ChunkMesher {
  constructor(material) {
    this.material = material;
  }

  build(chunk, world) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let i = 0;

    // Face run batching on X-axis for top faces as lightweight greedy meshing.
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        let runStart = -1;
        let runType = BLOCK.AIR;
        for (let x = 0; x <= CHUNK_SIZE; x++) {
          const id = x < CHUNK_SIZE ? chunk.get(x, y, z) : BLOCK.AIR;
          const above = world.getBlockGlobal(chunk.cx * CHUNK_SIZE + x, y + 1, chunk.cz * CHUNK_SIZE + z);
          const exposed = id !== BLOCK.AIR && !isSolid(above);
          if (exposed && (runStart === -1 || runType !== id)) {
            if (runStart !== -1) this.pushTopRun(runStart, x, y, z, runType, chunk, positions, normals, uvs, indices, i);
            if (runStart !== -1) i += 4;
            runStart = x;
            runType = id;
          } else if (!exposed && runStart !== -1) {
            this.pushTopRun(runStart, x, y, z, runType, chunk, positions, normals, uvs, indices, i);
            i += 4;
            runStart = -1;
            runType = BLOCK.AIR;
          }
        }
      }
    }

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const id = chunk.get(x, y, z);
          if (id === BLOCK.AIR) continue;
          for (const face of FACE_DELTAS) {
            const nx = chunk.cx * CHUNK_SIZE + x + face.n[0];
            const ny = y + face.n[1];
            const nz = chunk.cz * CHUNK_SIZE + z + face.n[2];
            const nId = world.getBlockGlobal(nx, ny, nz);
            if (isSolid(nId)) continue;
            if (face.n[1] === 1) continue;
            const uv = uvForBlock(id);
            for (const [cx, cy, cz] of face.corners) {
              positions.push(chunk.cx * CHUNK_SIZE + x + cx, y + cy, chunk.cz * CHUNK_SIZE + z + cz);
              normals.push(...face.n);
            }
            uvs.push(uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]);
            indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
            i += 4;
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.frustumCulled = true;
    return mesh;
  }

  pushTopRun(start, end, y, z, blockId, chunk, positions, normals, uvs, indices, i) {
    const x0 = chunk.cx * CHUNK_SIZE + start;
    const x1 = chunk.cx * CHUNK_SIZE + end;
    const z0 = chunk.cz * CHUNK_SIZE + z;
    const z1 = z0 + 1;
    positions.push(x0, y + 1, z1, x1, y + 1, z1, x1, y + 1, z0, x0, y + 1, z0);
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    const uv = uvForBlock(blockId);
    uvs.push(uv[0], uv[3], uv[2], uv[3], uv[2], uv[1], uv[0], uv[1]);
    indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
  }
}
