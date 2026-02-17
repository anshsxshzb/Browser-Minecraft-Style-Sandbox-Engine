export class Crosshair {
  constructor() {
    this.el = document.createElement('div');
    this.el.style.position = 'fixed';
    this.el.style.left = '50%';
    this.el.style.top = '50%';
    this.el.style.width = '8px';
    this.el.style.height = '8px';
    this.el.style.marginLeft = '-4px';
    this.el.style.marginTop = '-4px';
    this.el.style.border = '1px solid #fff';
    this.el.style.background = 'rgba(255,255,255,0.25)';
    this.el.style.pointerEvents = 'none';
    document.body.appendChild(this.el);
  }
}
