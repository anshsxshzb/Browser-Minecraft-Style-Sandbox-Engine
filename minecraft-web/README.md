# Minecraft Web Sandbox Engine

A modular Minecraft-like voxel sandbox foundation built with ES Modules, Three.js, Web Workers, IndexedDB, Express, and WebSockets.

## Features
- Infinite chunk streaming (16x16x256)
- Deterministic seeded terrain generation (plains + mountains + caves)
- Worker-based generation (main-thread safe)
- Greedy meshed chunk rendering
- First-person physics (gravity, jump, AABB collision, step assist)
- Block breaking / placing with 5-block raycast interaction
- Inventory and 9-slot hotbar with stacking
- Day/night cycle with dynamic light and sky interpolation
- IndexedDB client persistence + server chunk disk saves (binary chunk files)
- WebSocket join + position sync packet architecture for future multiplayer

## Project Structure

```
minecraft-web/
├── server/
├── client/
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   cd minecraft-web
   npm install
   ```
2. Start the local server:
   ```bash
   npm run start
   ```
3. Open:
   `http://localhost:3000`

## Controls
- `WASD` - movement
- `Space` - jump
- `Mouse` - look
- `Left Click` - break block
- `Right Click` - place block
- `Scroll` - hotbar select
- `Esc` - unlock cursor

## Notes
- Client saves chunks in IndexedDB (`minecraft-world` database).
- Server writes authoritative chunk save files to `minecraft-web-data/default/chunks/*.bin`.
- Render distance defaults to 8 chunks and can be tuned in `client/world/world.js`.
