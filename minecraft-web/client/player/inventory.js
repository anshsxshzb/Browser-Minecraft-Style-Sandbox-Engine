export class Inventory {
  constructor(size = 9) {
    this.slots = Array.from({ length: size }, () => ({ id: 0, count: 0 }));
    this.selected = 0;
    this.seedStarterItems();
  }

  seedStarterItems() {
    this.slots[0] = { id: 1, count: 64 };
    this.slots[1] = { id: 2, count: 64 };
    this.slots[2] = { id: 3, count: 64 };
  }

  addItem(id, count = 1) {
    for (const slot of this.slots) {
      if (slot.id === id && slot.count < 64) {
        const added = Math.min(count, 64 - slot.count);
        slot.count += added;
        count -= added;
        if (count === 0) return true;
      }
    }

    for (const slot of this.slots) {
      if (slot.count === 0) {
        const added = Math.min(count, 64);
        slot.id = id;
        slot.count = added;
        count -= added;
        if (count === 0) return true;
      }
    }

    return count === 0;
  }

  selectedBlockId() {
    return this.slots[this.selected].id;
  }
}
