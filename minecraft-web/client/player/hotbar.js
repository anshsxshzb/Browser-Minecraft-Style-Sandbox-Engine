export class Hotbar {
  constructor(inventory) {
    this.inventory = inventory;
  }

  scroll(delta) {
    const size = this.inventory.slots.length;
    if (delta > 0) this.inventory.selected = (this.inventory.selected + 1) % size;
    if (delta < 0) this.inventory.selected = (this.inventory.selected - 1 + size) % size;
  }
}
