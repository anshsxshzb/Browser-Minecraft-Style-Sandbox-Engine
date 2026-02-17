import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { BLOCK } from '../world/blockTypes.js';

export class BlockRaycaster {
  constructor(world) {
    this.world = world;
  }

  cast(origin, direction, maxDistance = 5) {
    const step = 0.05;
    const pos = new THREE.Vector3();
    let prev = null;

    for (let d = 0; d <= maxDistance; d += step) {
      pos.copy(origin).addScaledVector(direction, d);
      const block = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
      if (!prev || !block.equals(prev)) {
        const id = this.world.getBlockGlobal(block.x, block.y, block.z);
        if (id !== BLOCK.AIR) {
          return { hit: block, previous: prev, id };
        }
        prev = block.clone();
      }
    }

    return null;
  }
}
