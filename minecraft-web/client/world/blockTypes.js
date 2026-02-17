export const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  LOG: 4,
  LEAVES: 5,
};

export const SOLID_BLOCKS = new Set([BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE, BLOCK.LOG, BLOCK.LEAVES]);

export function isSolid(id) {
  return SOLID_BLOCKS.has(id);
}
