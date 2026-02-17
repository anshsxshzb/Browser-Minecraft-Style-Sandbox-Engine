export class RaycastSystem {
  constructor(world) {
    this.world = world;
  }

  cast(origin, direction, maxDistance = 5) {
    const step = 0.1;
    const pos = { x: origin.x, y: origin.y, z: origin.z };
    let previous = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };

    for (let t = 0; t <= maxDistance; t += step) {
      pos.x = origin.x + direction.x * t;
      pos.y = origin.y + direction.y * t;
      pos.z = origin.z + direction.z * t;

      const cell = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
      if (this.world.getBlock(cell.x, cell.y, cell.z) !== 0) {
        return { hit: cell, previous };
      }
      previous = cell;
    }
    return null;
  }
}
