const CHUNK_X = 16;
const CHUNK_Y = 256;
const CHUNK_Z = 16;

function hash(x, y, z, seed) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1013904223;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function valueNoise2D(x, z, seed) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;

  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  const v00 = hash(xi, 0, zi, seed);
  const v10 = hash(xi + 1, 0, zi, seed);
  const v01 = hash(xi, 0, zi + 1, seed);
  const v11 = hash(xi + 1, 0, zi + 1, seed);

  const i1 = lerp(v00, v10, smooth(xf));
  const i2 = lerp(v01, v11, smooth(xf));
  return lerp(i1, i2, smooth(zf)) * 2 - 1;
}

function fbm2D(x, z, seed, octaves = 4) {
  let total = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(x * freq, z * freq, seed + i * 31) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return total / norm;
}

function caveNoise(x, y, z, seed) {
  const n1 = valueNoise2D((x + y) * 0.06, (z + y) * 0.06, seed + 999);
  const n2 = valueNoise2D((x - y) * 0.09, (z - y) * 0.09, seed + 201);
  return (n1 + n2) * 0.5;
}

self.onmessage = (event) => {
  const { cx, cz, seed } = event.data;
  const voxels = new Uint8Array(CHUNK_X * CHUNK_Y * CHUNK_Z);

  for (let z = 0; z < CHUNK_Z; z++) {
    for (let x = 0; x < CHUNK_X; x++) {
      const wx = cx * CHUNK_X + x;
      const wz = cz * CHUNK_Z + z;

      const biome = fbm2D(wx * 0.002, wz * 0.002, seed + 300);
      const plainsHeight = 62 + fbm2D(wx * 0.01, wz * 0.01, seed) * 8;
      const mountainHeight = 88 + fbm2D(wx * 0.008, wz * 0.008, seed + 100) * 36;
      const h = Math.floor(plainsHeight * (1 - Math.max(0, biome)) + mountainHeight * Math.max(0, biome));

      for (let y = 0; y < CHUNK_Y; y++) {
        const idx = x + CHUNK_X * (z + CHUNK_Z * y);
        if (y > h) {
          voxels[idx] = 0;
          continue;
        }

        const cave = caveNoise(wx, y, wz, seed);
        if (y < h - 4 && cave > 0.56) {
          voxels[idx] = 0;
          continue;
        }

        if (y === h) voxels[idx] = 1;
        else if (y > h - 4) voxels[idx] = 2;
        else voxels[idx] = 3;
      }
    }
  }

  self.postMessage({ cx, cz, voxels }, [voxels.buffer]);
};
