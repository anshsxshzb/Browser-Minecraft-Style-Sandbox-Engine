export class Controls {
  constructor(domElement) {
    this.domElement = domElement;
    this.locked = false;
    this.yaw = 0;
    this.pitch = 0;
    this.keys = new Set();
    this.hotbarDelta = 0;
    this.actions = { break: false, place: false };

    domElement.addEventListener('click', () => domElement.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === domElement;
    });

    addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.yaw -= e.movementX * 0.002;
      this.pitch -= e.movementY * 0.002;
      this.pitch = Math.max(-Math.PI / 2 + 0.001, Math.min(Math.PI / 2 - 0.001, this.pitch));
    });

    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('wheel', (e) => { this.hotbarDelta += Math.sign(e.deltaY); }, { passive: true });
    addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      if (e.button === 0) this.actions.break = true;
      if (e.button === 2) this.actions.place = true;
    });
    addEventListener('contextmenu', (e) => e.preventDefault());
  }

  consumeActions() {
    const out = { ...this.actions, hotbarDelta: this.hotbarDelta };
    this.actions.break = false;
    this.actions.place = false;
    this.hotbarDelta = 0;
    return out;
  }
}
