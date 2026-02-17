export class Crosshair {
  constructor(container) {
    this.el = document.createElement('div');
    this.el.textContent = '+';
    Object.assign(this.el.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      fontSize: '26px',
      pointerEvents: 'none',
      textShadow: '0 0 4px #000',
    });
    container.appendChild(this.el);
  }
}
