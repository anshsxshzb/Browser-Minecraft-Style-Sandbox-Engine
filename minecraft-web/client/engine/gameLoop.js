export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.running = false;
    this.last = performance.now();
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame((time) => this.frame(time));
  }

  frame(time) {
    if (!this.running) return;
    const dt = Math.min(0.033, (time - this.last) / 1000);
    this.last = time;
    this.update(dt, time / 1000);
    this.render();
    requestAnimationFrame((t) => this.frame(t));
  }
}
