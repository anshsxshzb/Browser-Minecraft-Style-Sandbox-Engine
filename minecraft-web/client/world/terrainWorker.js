const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;

function hash(x, z, seed) {
  let n = x * 374761393 + z * 668265263 + seed * 69069;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function noise2(x, z, seed) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const xf = x - x0;
  const zf = z - z0;
  const s = hash(x0, z0, seed);
  const t = hash(x0 + 1, z0, seed);
  const u = hash(x0, z0 + 1, seed);
  const v = hash(x0 + 1, z0 + 1, seed);
  const sx = xf * xf * (3 - 2 * xf);
  const sz = zf * zf * (3 - 2 * zf);
  const a = s + (t - s) * sx;
  const b = u + (v - u) * sx;
  return a + (b - a) * sz;
}

function fractal2(x, z, seed, octaves = 4) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, z * freq, seed + i * 31) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function caveNoise(x, y, z, seed) {
  return fractal2(x * 0.07 + y * 0.03, z * 0.07 + y * 0.02, seed + y, 3);
}

self.onmessage = (event) => {
  const { cx, cz, seed } = event.data;
  const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);

  for (let z = 0; z < CHUNK_SIZE; z++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const wx = cx * CHUNK_SIZE + x;
      const wz = cz * CHUNK_SIZE + z;

      const biomeMask = fractal2(wx * 0.002, wz * 0.002, seed + 99, 3);
      const mountain = fractal2(wx * 0.008, wz * 0.008, seed + 55, 5);
      const plains = fractal2(wx * 0.01, wz * 0.01, seed + 22, 3);
      const baseHeight = biomeMask > 0.55
        ? 84 + Math.floor(mountain * 70)
        : 60 + Math.floor(plains * 18);

      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        const idx = y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
        if (y > baseHeight) {
          blocks[idx] = 0;
          continue;
        }
        const cave = caveNoise(wx, y, wz, seed);
        if (y < baseHeight - 3 && cave > 0.74) {
          blocks[idx] = 0;
        } else if (y === baseHeight) {
          blocks[idx] = 1;
        } else if (y > baseHeight - 4) {
          blocks[idx] = 2;
        } else {
          blocks[idx] = 3;
        }
      }
    }
  }

  self.postMessage({ cx, cz, blocks }, [blocks.buffer]);
};
