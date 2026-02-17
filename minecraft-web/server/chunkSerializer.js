const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const TOTAL_BLOCKS = CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT;

function serializeChunk(chunk) {
  if (!chunk || !chunk.blocks || chunk.blocks.length !== TOTAL_BLOCKS) {
    throw new Error('Invalid chunk payload for serialization');
  }

  const header = Buffer.alloc(16);
  header.writeInt32LE(chunk.cx, 0);
  header.writeInt32LE(chunk.cz, 4);
  header.writeUInt32LE(chunk.version ?? 1, 8);
  header.writeUInt32LE(chunk.seed ?? 0, 12);

  const blocks = Buffer.from(chunk.blocks.buffer, chunk.blocks.byteOffset, chunk.blocks.byteLength);
  return Buffer.concat([header, blocks]);
}

function deserializeChunk(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16 + TOTAL_BLOCKS) {
    throw new Error('Invalid chunk buffer payload');
  }

  const cx = buffer.readInt32LE(0);
  const cz = buffer.readInt32LE(4);
  const version = buffer.readUInt32LE(8);
  const seed = buffer.readUInt32LE(12);
  const blocks = new Uint8Array(buffer.subarray(16, 16 + TOTAL_BLOCKS));

  return { cx, cz, version, seed, blocks };
}

module.exports = {
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  TOTAL_BLOCKS,
  serializeChunk,
  deserializeChunk,
};
