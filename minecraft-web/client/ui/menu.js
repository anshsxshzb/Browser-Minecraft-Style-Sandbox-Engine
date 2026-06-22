export class Menu {
  constructor() {
    this.el = document.createElement('div');
    this.el.style.position = 'fixed';
    this.el.style.top = '16px';
    this.el.style.left = '16px';
    this.el.style.color = 'white';
    this.el.style.background = 'rgba(0,0,0,0.35)';
    this.el.style.padding = '10px';
    this.el.style.fontSize = '12px';
    this.el.textContent = 'Click to lock pointer | Esc to unlock';
    document.body.appendChild(this.el);
  }
}
