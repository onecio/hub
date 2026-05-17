import { createHash, randomUUID } from 'node:crypto';

export function generateId() {
  return randomUUID();
}

// Deterministic UUID v4-shaped ID from a seed string (stable across deployments)
export function deterministicId(seedName) {
  const hash = createHash('sha256').update(seedName).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-');
}
