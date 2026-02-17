import { BLOCK } from '../world/blockTypes.js';

export class Inventory {
  constructor() {
    this.slots = Array.from({ length: 9 }, (_, i) => ({
      block: [BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE][i % 3],
      count: 64,
    }));
  }

  add(blockId, amount = 1) {
    for (const slot of this.slots) {
      if (slot.block === blockId && slot.count < 64) {
        const take = Math.min(64 - slot.count, amount);
        slot.count += take;
        amount -= take;
        if (amount === 0) return;
      }
    }
    for (const slot of this.slots) {
      if (slot.count === 0) {
        slot.block = blockId;
        slot.count = amount;
        return;
      }
    }
  }
}
