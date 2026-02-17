import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class CameraSystem {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }
}
