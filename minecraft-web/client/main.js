import { RendererSystem } from './engine/renderer.js';
import { CameraSystem } from './engine/camera.js';
import { ControlSystem } from './engine/controls.js';
import { PhysicsSystem } from './engine/physics.js';
import { RaycastSystem } from './engine/raycast.js';
import { GameLoop } from './engine/gameLoop.js';
import { World } from './world/world.js';
import { Player } from './player/player.js';
import { Inventory } from './player/inventory.js';
import { Hotbar } from './player/hotbar.js';
import { HUD } from './ui/hud.js';
import { Crosshair } from './ui/crosshair.js';
import { Menu } from './ui/menu.js';

const container = document.getElementById('game-root');
const renderer = new RendererSystem(container);
const cameraSystem = new CameraSystem();
const world = new World(renderer.scene, 2026);
const controls = new ControlSystem(renderer.renderer.domElement);
const physics = new PhysicsSystem(world);
const raycast = new RaycastSystem(world);
const player = new Player();
const inventory = new Inventory(9);
const hotbar = new Hotbar(inventory);
const hud = new HUD(inventory);
new Crosshair();
new Menu();

const socket = new WebSocket(`ws://${window.location.host}/ws`);
let playerId = null;

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'player_join') {
    playerId = message.payload.id;
  }
});

function update(dt, timeSec) {
  const frame = controls.consumeFrameInput();
  player.look(frame.mouseDelta.x, frame.mouseDelta.y);
  physics.simulatePlayer(player, controls, dt);
  world.updateStreaming(player.position);

  if (frame.scrollDelta !== 0) {
    hotbar.scroll(frame.scrollDelta);
  }

  const eye = {
    x: player.position.x,
    y: player.position.y + player.eyeHeight,
    z: player.position.z,
  };

  if (frame.breakRequested || frame.placeRequested) {
    const dir = player.getViewDirection();
    const hit = raycast.cast(eye, dir, 5);
    if (hit?.hit && frame.breakRequested) {
      const blockId = world.getBlock(hit.hit.x, hit.hit.y, hit.hit.z);
      if (world.setBlock(hit.hit.x, hit.hit.y, hit.hit.z, 0)) {
        inventory.addItem(blockId, 1);
      }
    }

    if (hit?.previous && frame.placeRequested) {
      const placeId = inventory.selectedBlockId();
      if (placeId !== 0) {
        world.setBlock(hit.previous.x, hit.previous.y, hit.previous.z, placeId);
      }
    }
  }

  if (socket.readyState === WebSocket.OPEN && playerId) {
    socket.send(JSON.stringify({
      type: 'position_sync',
      payload: {
        id: playerId,
        position: { x: player.position.x, y: player.position.y, z: player.position.z },
        rotation: { yaw: player.yaw, pitch: player.pitch },
      },
    }));
  }

  cameraSystem.updateFromPlayer(player);
  renderer.updateDayNight((timeSec * 0.01) % 1);
  hud.render();
}

function render() {
  renderer.render(cameraSystem.camera);
}

const loop = new GameLoop(update, render);
loop.start();
