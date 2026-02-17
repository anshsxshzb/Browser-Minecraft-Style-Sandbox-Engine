import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Chunk } from './chunk.js';
import { BLOCK_COLORS } from './blockTypes.js';

export class ChunkMesher {
  constructor() {
    this.material = new THREE.MeshLambertMaterial({ vertexColors: true });
  }

  build(chunk, world) {
    const dims = [Chunk.SIZE_X, Chunk.SIZE_Y, Chunk.SIZE_Z];
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    let index = 0;

    const getVoxel = (x, y, z) => {
      const wx = chunk.cx * Chunk.SIZE_X + x;
      const wz = chunk.cz * Chunk.SIZE_Z + z;
      return world.getBlock(wx, y, wz);
    };

    for (let d = 0; d < 3; d += 1) {
      const u = (d + 1) % 3;
      const v = (d + 2) % 3;
      const x = [0, 0, 0];
      const q = [0, 0, 0];
      q[d] = 1;
      const mask = [];

      for (x[d] = -1; x[d] < dims[d];) {
        let n = 0;
        for (x[v] = 0; x[v] < dims[v]; x[v]++) {
          for (x[u] = 0; x[u] < dims[u]; x[u]++) {
            const a = x[d] >= 0 ? getVoxel(x[0], x[1], x[2]) : 0;
            const b = x[d] < dims[d] - 1 ? getVoxel(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : 0;

            if (!!a === !!b) {
              mask[n++] = 0;
            } else if (a) {
              mask[n++] = a;
            } else {
              mask[n++] = -b;
            }
          }
        }

        x[d] += 1;
        n = 0;

        for (let j = 0; j < dims[v]; j++) {
          for (let i = 0; i < dims[u];) {
            const c = mask[n];
            if (!c) { i++; n++; continue; }

            let w = 1;
            while (i + w < dims[u] && mask[n + w] === c) w++;

            let h = 1;
            let done = false;
            while (j + h < dims[v] && !done) {
              for (let k = 0; k < w; k++) {
                if (mask[n + k + h * dims[u]] !== c) { done = true; break; }
              }
              if (!done) h++;
            }

            x[u] = i;
            x[v] = j;

            const du = [0, 0, 0];
            const dv = [0, 0, 0];
            du[u] = w;
            dv[v] = h;

            const positive = c > 0;
            const blockId = Math.abs(c);
            const color = BLOCK_COLORS[blockId] || [1, 1, 1];

            const p = [x[0], x[1], x[2]];
            if (!positive) p[d] += 1;

            const quad = [
              [p[0], p[1], p[2]],
              [p[0] + du[0], p[1] + du[1], p[2] + du[2]],
              [p[0] + du[0] + dv[0], p[1] + du[1] + dv[1], p[2] + du[2] + dv[2]],
              [p[0] + dv[0], p[1] + dv[1], p[2] + dv[2]],
            ];

            const normal = [0, 0, 0];
            normal[d] = positive ? 1 : -1;

            const order = positive ? [0, 1, 2, 3] : [0, 3, 2, 1];
            for (const oi of order) {
              const vx = quad[oi][0] + chunk.cx * Chunk.SIZE_X;
              const vy = quad[oi][1];
              const vz = quad[oi][2] + chunk.cz * Chunk.SIZE_Z;
              vertices.push(vx, vy, vz);
              normals.push(normal[0], normal[1], normal[2]);
              colors.push(color[0], color[1], color[2]);
            }

            indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
            index += 4;

            for (let l = 0; l < h; l++) {
              for (let k = 0; k < w; k++) {
                mask[n + k + l * dims[u]] = 0;
              }
            }

            i += w;
            n += w;
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    return new THREE.Mesh(geometry, this.material);
  }
}
