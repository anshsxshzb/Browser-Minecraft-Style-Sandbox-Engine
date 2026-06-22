export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.left = '50%';
    this.root.style.bottom = '18px';
    this.root.style.transform = 'translateX(-50%)';
    this.root.style.display = 'flex';
    this.root.style.gap = '6px';

    this.slots = [];
    for (let i = 0; i < inventory.slots.length; i++) {
      const slot = document.createElement('div');
      slot.style.width = '52px';
      slot.style.height = '52px';
      slot.style.background = 'rgba(0,0,0,0.45)';
      slot.style.color = '#fff';
      slot.style.border = '2px solid #444';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.whiteSpace = 'pre';
      this.root.appendChild(slot);
      this.slots.push(slot);
    }

    document.body.appendChild(this.root);
  }

  render() {
    this.inventory.slots.forEach((item, i) => {
      const selected = i === this.inventory.selected;
      this.slots[i].style.borderColor = selected ? '#ffd43b' : '#444';
      this.slots[i].textContent = item.count > 0 ? `${item.id}\n${item.count}` : '';
    });
  }
}
