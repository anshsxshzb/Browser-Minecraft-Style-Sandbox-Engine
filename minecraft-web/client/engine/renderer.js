import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class RendererSystem {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87ceeb, 24, 220);

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;

    container.appendChild(this.renderer.domElement);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(30, 100, 20);
    this.scene.add(this.sunLight);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambient);

    this.skyTop = new THREE.Color(0x87ceeb);
    this.skyNight = new THREE.Color(0x061225);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  updateDayNight(cycle01) {
    const sunAngle = cycle01 * Math.PI * 2;
    this.sunLight.position.set(Math.cos(sunAngle) * 80, Math.sin(sunAngle) * 100, 10);

    const daylight = Math.max(0.1, Math.sin(sunAngle) * 0.8 + 0.2);
    this.sunLight.intensity = daylight;
    this.ambient.intensity = 0.15 + daylight * 0.4;

    const skyColor = this.skyNight.clone().lerp(this.skyTop, daylight);
    this.scene.background = skyColor;
    this.scene.fog.color.copy(skyColor);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}
