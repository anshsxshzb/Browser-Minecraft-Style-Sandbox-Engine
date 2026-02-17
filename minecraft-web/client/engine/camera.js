import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  updateFromPlayer(player) {
    this.camera.position.copy(player.position);
    this.camera.position.y += player.eyeHeight;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = player.yaw;
    this.camera.rotation.x = player.pitch;
  }
}
