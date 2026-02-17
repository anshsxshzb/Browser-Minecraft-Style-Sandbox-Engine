export class Menu {
  constructor(container) {
    this.el = document.createElement('div');
    this.el.textContent = 'Click to play - ESC to unlock cursor';
    Object.assign(this.el.style, {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '10px 14px',
    });
    container.appendChild(this.el);
    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement;
      this.el.style.display = locked ? 'none' : 'block';
    });
  }
}
