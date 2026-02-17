# Minecraft Web Sandbox Engine

A modular, expandable voxel sandbox engine foundation built with ES modules, Three.js, Web Workers, IndexedDB, and a local Node.js + WebSocket backend.

## Setup

```bash
cd minecraft-web
npm install
npm start
```

Open `http://localhost:3000`.

## Controls

- **WASD**: Move
- **Space**: Jump
- **Mouse**: Look
- **Left Click**: Break block
- **Right Click**: Place selected block
- **Scroll**: Hotbar selection
- **Esc**: Unlock cursor

## Architecture

- `server/`: Express API, websocket protocol foundation, binary chunk serialization and disk persistence.
- `client/engine/`: Rendering, camera, controls, physics, raycast, and game loop systems.
- `client/world/`: Chunk model, meshing, block types, world manager, worker-based terrain generation.
- `client/player/`: Player controller, inventory, and hotbar systems.
- `client/ui/`: HUD, crosshair, and menu overlay.

## Notes

- Chunk dimensions: `16 x 16 x 256`
- Deterministic terrain using seeded fractal-value noise with biome blending and cave carving.
- IndexedDB stores client chunk cache, while server writes persistent binary chunk files.
