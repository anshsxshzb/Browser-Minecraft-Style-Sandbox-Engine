import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 120, 0);
    this.velocity = new THREE.Vector3();
    this.grounded = false;
    this.walkSpeed = 7;
    this.jumpStrength = 10;
  }

  updateFromControls(controls, camera, dt) {
    camera.position.copy(this.position).add(new THREE.Vector3(0, 0.7, 0));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = controls.yaw;
    camera.rotation.x = controls.pitch;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.yaw);
    const wish = new THREE.Vector3();
    if (controls.keys.has('KeyW')) wish.add(forward);
    if (controls.keys.has('KeyS')) wish.sub(forward);
    if (controls.keys.has('KeyD')) wish.add(right);
    if (controls.keys.has('KeyA')) wish.sub(right);
    wish.y = 0;
    wish.normalize();

    this.velocity.x = wish.x * this.walkSpeed;
    this.velocity.z = wish.z * this.walkSpeed;

    if (controls.keys.has('Space') && this.grounded) {
      this.velocity.y = this.jumpStrength;
      this.grounded = false;
    }

    if (controls.keys.has('ShiftLeft')) {
      this.velocity.x *= 1.5;
      this.velocity.z *= 1.5;
    }
  }
}
