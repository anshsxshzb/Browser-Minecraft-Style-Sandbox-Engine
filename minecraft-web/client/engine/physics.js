import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { isSolid } from '../world/blockTypes.js';

export class PhysicsSystem {
  constructor(world) {
    this.world = world;
    this.gravity = 28;
    this.stepHeight = 0.6;
    this.playerSize = new THREE.Vector3(0.6, 1.8, 0.6);
  }

  sampleAABB(pos) {
    const half = this.playerSize.clone().multiplyScalar(0.5);
    const min = pos.clone().sub(half);
    const max = pos.clone().add(half);
    for (let y = Math.floor(min.y); y <= Math.floor(max.y); y++) {
      for (let z = Math.floor(min.z); z <= Math.floor(max.z); z++) {
        for (let x = Math.floor(min.x); x <= Math.floor(max.x); x++) {
          if (isSolid(this.world.getBlockGlobal(x, y, z))) return true;
        }
      }
    }
    return false;
  }

  integrate(player, dt) {
    player.velocity.y -= this.gravity * dt;

    const movement = player.velocity.clone().multiplyScalar(dt);
    const next = player.position.clone();

    next.x += movement.x;
    if (this.sampleAABB(next)) {
      next.x -= movement.x;
      player.velocity.x = 0;
    }

    next.z += movement.z;
    if (this.sampleAABB(next)) {
      next.z -= movement.z;
      player.velocity.z = 0;
    }

    next.y += movement.y;
    if (this.sampleAABB(next)) {
      next.y -= movement.y;
      if (movement.y < 0) player.grounded = true;
      player.velocity.y = 0;
    } else {
      player.grounded = false;
    }

    if (!player.grounded) {
      const stepped = next.clone();
      stepped.y += this.stepHeight;
      if (!this.sampleAABB(stepped)) next.copy(stepped);
    }

    player.position.copy(next);
  }
}
