import { Buffer } from 'node:buffer';

/**
 * Binary chunk layout:
 * [version:uint8][cx:int32][cz:int32][length:uint32][voxel bytes...]
 */
export class ChunkSerializer {
  static VERSION = 1;

  static encode(chunk) {
    const voxelData = Buffer.from(chunk.voxels);
    const header = Buffer.alloc(1 + 4 + 4 + 4);
    header.writeUInt8(this.VERSION, 0);
    header.writeInt32LE(chunk.cx, 1);
    header.writeInt32LE(chunk.cz, 5);
    header.writeUInt32LE(voxelData.length, 9);
    return Buffer.concat([header, voxelData]);
  }

  static decode(buffer) {
    const version = buffer.readUInt8(0);
    if (version !== this.VERSION) {
      throw new Error(`Unsupported chunk version ${version}`);
    }
    const cx = buffer.readInt32LE(1);
    const cz = buffer.readInt32LE(5);
    const length = buffer.readUInt32LE(9);
    const voxels = new Uint8Array(buffer.subarray(13, 13 + length));
    return { cx, cz, voxels };
  }
}
