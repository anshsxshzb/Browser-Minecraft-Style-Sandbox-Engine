export class PhysicsSystem {
  constructor(world) {
    this.world = world;
    this.gravity = 28;
    this.stepHeight = 0.6;
  }

  simulatePlayer(player, input, dt) {
    const speed = player.grounded ? 6 : 4;
    const forwardX = Math.sin(player.yaw);
    const forwardZ = Math.cos(player.yaw);
    const rightX = Math.cos(player.yaw);
    const rightZ = -Math.sin(player.yaw);

    let moveX = 0;
    let moveZ = 0;
    if (input.isDown('KeyW')) { moveX += forwardX; moveZ += forwardZ; }
    if (input.isDown('KeyS')) { moveX -= forwardX; moveZ -= forwardZ; }
    if (input.isDown('KeyA')) { moveX -= rightX; moveZ -= rightZ; }
    if (input.isDown('KeyD')) { moveX += rightX; moveZ += rightZ; }

    const len = Math.hypot(moveX, moveZ) || 1;
    player.velocity.x = (moveX / len) * speed;
    player.velocity.z = (moveZ / len) * speed;

    if (player.grounded && input.isDown('Space')) {
      player.velocity.y = 9.5;
      player.grounded = false;
    }

    player.velocity.y -= this.gravity * dt;

    this.moveAxis(player, 'x', dt);
    this.moveAxis(player, 'z', dt);
    this.moveAxis(player, 'y', dt);
  }

  moveAxis(player, axis, dt) {
    const next = player.position[axis] + player.velocity[axis] * dt;
    const current = player.position[axis];
    player.position[axis] = next;

    if (this.collides(player)) {
      if ((axis === 'x' || axis === 'z') && player.grounded && !this.collidesAtStep(player)) {
        player.position.y += this.stepHeight;
        return;
      }

      player.position[axis] = current;
      player.velocity[axis] = 0;
      if (axis === 'y' && player.velocity.y <= 0) {
        player.grounded = true;
      }
      return;
    }

    if (axis === 'y') {
      player.grounded = false;
    }
  }

  collidesAtStep(player) {
    player.position.y += this.stepHeight;
    const hit = this.collides(player);
    player.position.y -= this.stepHeight;
    return hit;
  }

  collides(player) {
    const minX = Math.floor(player.position.x - player.radius);
    const maxX = Math.floor(player.position.x + player.radius);
    const minY = Math.floor(player.position.y);
    const maxY = Math.floor(player.position.y + player.height);
    const minZ = Math.floor(player.position.z - player.radius);
    const maxZ = Math.floor(player.position.z + player.radius);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          if (this.world.getBlock(x, y, z) !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
