export class Hotbar {
  constructor(inventory) {
    this.inventory = inventory;
    this.selected = 0;
  }

  scroll(delta) {
    if (!delta) return;
    this.selected = (this.selected + delta + 9) % 9;
  }

  current() {
    return this.inventory.slots[this.selected];
  }
}
