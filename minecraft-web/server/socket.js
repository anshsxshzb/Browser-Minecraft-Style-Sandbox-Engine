const { WebSocketServer } = require('ws');

class SocketHub {
  constructor(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();
    this.nextId = 1;
    this.setup();
  }

  setup() {
    this.wss.on('connection', (socket) => {
      const id = this.nextId++;
      this.clients.set(id, socket);

      socket.send(JSON.stringify({
        type: 'player_join',
        playerId: id,
        serverTime: Date.now(),
      }));

      socket.on('message', (raw) => {
        let message;
        try {
          message = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (message.type === 'player_position') {
          this.broadcast({
            type: 'player_position',
            playerId: id,
            position: message.position,
            rotation: message.rotation,
            t: Date.now(),
          }, id);
        }
      });

      socket.on('close', () => {
        this.clients.delete(id);
        this.broadcast({ type: 'player_leave', playerId: id });
      });
    });
  }

  broadcast(payload, exceptId = null) {
    const serialized = JSON.stringify(payload);
    for (const [id, socket] of this.clients.entries()) {
      if (id === exceptId || socket.readyState !== 1) continue;
      socket.send(serialized);
    }
  }
}

module.exports = { SocketHub };
