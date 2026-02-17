export class ControlSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.breakRequested = false;
    this.placeRequested = false;
    this.scrollDelta = 0;

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== canvas) return;
      if (e.button === 0) this.breakRequested = true;
      if (e.button === 2) this.placeRequested = true;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('wheel', (e) => {
      this.scrollDelta += Math.sign(e.deltaY);
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  consumeFrameInput() {
    const frame = {
      mouseDelta: { ...this.mouseDelta },
      breakRequested: this.breakRequested,
      placeRequested: this.placeRequested,
      scrollDelta: this.scrollDelta,
    };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.breakRequested = false;
    this.placeRequested = false;
    this.scrollDelta = 0;
    return frame;
  }
}
