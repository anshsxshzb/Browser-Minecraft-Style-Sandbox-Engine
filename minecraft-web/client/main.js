import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { RendererSystem } from './engine/renderer.js';
import { CameraSystem } from './engine/camera.js';
import { Controls } from './engine/controls.js';
import { PhysicsSystem } from './engine/physics.js';
import { BlockRaycaster } from './engine/raycast.js';
import { GameLoop } from './engine/gameLoop.js';
import { World } from './world/world.js';
import { BLOCK } from './world/blockTypes.js';
import { Player } from './player/player.js';
import { Inventory } from './player/inventory.js';
import { Hotbar } from './player/hotbar.js';
import { HUD } from './ui/hud.js';
import { Crosshair } from './ui/crosshair.js';
import { Menu } from './ui/menu.js';

function createAtlasTexture() {
  const cvs = document.createElement('canvas');
  cvs.width = 256;
  cvs.height = 256;
  const ctx = cvs.getContext('2d');
  const colors = ['#6ab04a', '#8e5a3c', '#7f8c8d', '#8b4513', '#2ecc71'];
  colors.forEach((color, i) => {
    const x = (i % 4) * 64;
    const y = Math.floor(i / 4) * 64;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 64, 64);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let n = 0; n < 12; n++) {
      ctx.beginPath();
      ctx.moveTo(x + Math.random() * 64, y + Math.random() * 64);
      ctx.lineTo(x + Math.random() * 64, y + Math.random() * 64);
      ctx.stroke();
    }
  });

  const tex = new THREE.CanvasTexture(cvs);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipMapNearestFilter;
  return tex;
}

const app = document.getElementById('app');
const rendererSystem = new RendererSystem(app);
const cameraSystem = new CameraSystem();
const controls = new Controls(rendererSystem.renderer.domElement);
new Crosshair(app);
new Menu(app);

const hud = new HUD(app);
const inventory = new Inventory();
const hotbar = new Hotbar(inventory);
const player = new Player();

const world = new World(rendererSystem.scene, createAtlasTexture());
await world.init();

const physics = new PhysicsSystem(world);
const raycast = new BlockRaycaster(world);

const socket = new WebSocket(`ws://${location.host}/ws`);
socket.addEventListener('open', () => console.log('ws connected'));

function handleInteraction(actions) {
  const direction = new THREE.Vector3(0, 0, -1).applyEuler(cameraSystem.camera.rotation).normalize();
  const hit = raycast.cast(cameraSystem.camera.position, direction, 5);
  if (actions.break && hit) {
    world.setBlockGlobal(hit.hit.x, hit.hit.y, hit.hit.z, BLOCK.AIR);
    inventory.add(hit.id, 1);
  }
  if (actions.place && hit?.previous) {
    const held = hotbar.current();
    if (held.count > 0) {
      world.setBlockGlobal(hit.previous.x, hit.previous.y, hit.previous.z, held.block);
      held.count -= 1;
    }
  }
}

const loop = new GameLoop((dt, elapsed) => {
  player.updateFromControls(controls, cameraSystem.camera, dt);
  physics.integrate(player, dt);
  world.update(player.position);
  const actions = controls.consumeActions();
  hotbar.scroll(actions.hotbarDelta);
  handleInteraction(actions);

  socket.readyState === 1 && socket.send(JSON.stringify({
    type: 'player_position',
    position: player.position,
    rotation: { yaw: controls.yaw, pitch: controls.pitch },
  }));

  hud.update(player, hotbar);
  rendererSystem.updateDayNight(elapsed);
}, () => {
  rendererSystem.render(cameraSystem.camera);
});

loop.start();
