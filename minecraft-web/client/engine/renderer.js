import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class RendererSystem {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.sun = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sun.position.set(100, 100, 10);
    this.scene.add(this.ambient, this.sun);

    addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.renderer.setSize(innerWidth, innerHeight);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }

  updateDayNight(time) {
    const cycle = (time * 0.02) % (Math.PI * 2);
    const y = Math.sin(cycle);
    this.sun.position.set(Math.cos(cycle) * 120, y * 120, 40);
    const intensity = Math.max(0.1, y * 0.9 + 0.2);
    this.sun.intensity = intensity;
    this.ambient.intensity = 0.15 + intensity * 0.2;

    const day = new THREE.Color(0x77aaff);
    const night = new THREE.Color(0x0a1025);
    this.scene.background = night.clone().lerp(day, Math.max(0, y * 0.5 + 0.5));
  }
}
