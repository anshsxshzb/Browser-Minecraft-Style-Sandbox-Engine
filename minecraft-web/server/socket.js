import { WebSocketServer } from 'ws';

export class SocketServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();
    this.nextId = 1;
  }

  init() {
    this.wss.on('connection', (ws) => {
      const id = `player-${this.nextId++}`;
      this.clients.set(ws, { id, position: { x: 0, y: 80, z: 0 } });

      ws.send(JSON.stringify({
        type: 'player_join',
        payload: { id },
      }));

      ws.on('message', (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          this.handleMessage(ws, message);
        } catch {
          // Ignore malformed packets to keep the networking loop resilient.
        }
      });

      ws.on('close', () => {
        const client = this.clients.get(ws);
        if (!client) return;
        this.clients.delete(ws);
        this.broadcast({
          type: 'player_leave',
          payload: { id: client.id },
        });
      });
    });
  }

  handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) return;

    if (message.type === 'position_sync') {
      client.position = message.payload.position;
      this.broadcast({
        type: 'position_sync',
        payload: {
          id: client.id,
          position: client.position,
          rotation: message.payload.rotation,
          timestamp: Date.now(),
        },
      }, ws);
    }
  }

  broadcast(message, exclude = null) {
    const payload = JSON.stringify(message);
    for (const socket of this.clients.keys()) {
      if (socket === exclude) continue;
      if (socket.readyState === socket.OPEN) {
        socket.send(payload);
      }
    }
  }
}
