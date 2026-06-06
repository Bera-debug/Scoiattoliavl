import { AVLNode, avlInsert, findByKey, updateDiscs } from './avl';

export interface LevelConfig {
  // Structural template — relative insertion order (determines AVL shape)
  insertOrder: number[];
  // Which structural positions get discs (by relative rank in sorted insertOrder)
  discByRank: { rank: number; discs: number[] }[];
  totalDiscs: number;
  label: string;
  description: string;
}

// disc array sorted descending: [largest, ..., smallest]
const dr = (from: number, to: number): number[] =>
  Array.from({ length: from - to + 1 }, (_, i) => from - i);

export const LEVELS: LevelConfig[] = [
  // L1 – depth 2, 3 nodes, 3 discs on rightmost leaf
  {
    insertOrder: [2, 1, 3],
    discByRank: [{ rank: 2, discs: dr(3, 1) }],
    totalDiscs: 3,
    label: 'Amateur',
    description: 'Discover the rules',
  },
  // L2 – depth 3, 4 nodes, 6 discs on leftmost leaf
  {
    insertOrder: [4, 2, 6, 1],
    discByRank: [{ rank: 0, discs: dr(6, 1) }],
    totalDiscs: 6,
    label: 'Apprentice',
    description: 'First steps on the path',
  },
  // L3 – depth 3, 5 nodes, 12 discs split 6+6 on two leaves
  {
    insertOrder: [4, 2, 6, 1, 3],
    discByRank: [
      { rank: 0, discs: dr(12, 7) },
      { rank: 2, discs: dr(6,  1) },
    ],
    totalDiscs: 12,
    label: 'Beginner',
    description: 'The mind begins to settle',
  },
  // L4 – depth 3, 6 nodes, 24 discs split 12+12 on two distant leaves
  {
    insertOrder: [4, 2, 6, 1, 3, 5],
    discByRank: [
      { rank: 0, discs: dr(24, 13) },
      { rank: 4, discs: dr(12,  1) },
    ],
    totalDiscs: 24,
    label: 'Artisan',
    description: 'Patience shapes the form',
  },
  // L5 – depth 3, 7 nodes, 36 discs split 12+12+12 on three leaves
  {
    insertOrder: [4, 2, 6, 1, 3, 5, 7],
    discByRank: [
      { rank: 0, discs: dr(36, 25) },
      { rank: 2, discs: dr(24, 13) },
      { rank: 6, discs: dr(12,  1) },
    ],
    totalDiscs: 36,
    label: 'Master',
    description: 'Clarity through restraint',
  },
  // L6 – depth 4, 10 nodes, 48 discs split 16+16+16 on three leaves
  {
    insertOrder: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5],
    discByRank: [
      { rank: 0, discs: dr(48, 33) },
      { rank: 2, discs: dr(32, 17) },
      { rank: 4, discs: dr(16,  1) },
    ],
    totalDiscs: 48,
    label: 'Grand Master',
    description: 'Each move, a breath',
  },
  // L7 – depth 4, 12 nodes, 64 discs split 16+16+16+16 on four leaves
  {
    insertOrder: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 9, 11],
    discByRank: [
      { rank: 0,  discs: dr(64, 49) },
      { rank: 2,  discs: dr(48, 33) },
      { rank: 7,  discs: dr(32, 17) },
      { rank: 9,  discs: dr(16,  1) },
    ],
    totalDiscs: 64,
    label: 'Enlightened',
    description: 'The tree and you are one',
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function randomUniqueKeys(count: number): number[] {
  const used = new Set<number>();
  const keys: number[] = [];
  while (keys.length < count) {
    const k = 1 + Math.floor(Math.random() * 200);
    if (!used.has(k)) { used.add(k); keys.push(k); }
  }
  return keys;
}

// ── buildLevel ────────────────────────────────────────────────────────────────

export function buildLevel(level: number): AVLNode {
  const cfg = LEVELS[level - 1];
  if (!cfg) throw new Error(`Level ${level} not found`);

  const n = cfg.insertOrder.length;

  // 1. Generate n random unique keys in [1, 200]
  const rndKeys = randomUniqueKeys(n);
  rndKeys.sort((a, b) => a - b); // sorted ascending → rank = index

  // 2. Map each original template key to a random key of the same rank
  //    (preserves the exact AVL tree shape)
  const templateSorted = [...cfg.insertOrder].sort((a, b) => a - b);
  const rankOf = new Map<number, number>(templateSorted.map((k, i) => [k, i]));
  const newInsertOrder = cfg.insertOrder.map(k => rndKeys[rankOf.get(k)!]);

  // 3. Build the AVL tree with remapped keys
  let tree: AVLNode | null = null;
  for (const key of newInsertOrder) tree = avlInsert(tree, key);

  // 4. Place discs on the correct structural nodes (by rank → real key)
  for (const { rank, discs } of cfg.discByRank) {
    const targetKey = rndKeys[rank];
    const node = findByKey(tree!, targetKey);
    if (node) tree = updateDiscs(tree!, node.id, discs);
  }

  return tree!;
}
