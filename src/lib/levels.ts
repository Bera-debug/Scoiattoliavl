import { AVLNode, avlInsert, findByKey, updateDiscs } from './avl';

export interface LevelConfig {
  insertOrder: number[];
  discPlacements: { key: number; discs: number[] }[];
  totalDiscs: number;
  label: string;
  description: string;
}

// disc range [from, from-1, ..., to] sorted descending (largest first)
const dr = (from: number, to: number): number[] =>
  Array.from({ length: from - to + 1 }, (_, i) => from - i);

export const LEVELS: LevelConfig[] = [
  // L1 – profondità 2, 3 nodi, 3 dischi
  {
    insertOrder: [2, 1, 3],
    discPlacements: [{ key: 3, discs: dr(3, 1) }],
    totalDiscs: 3,
    label: 'Livello 1',
    description: 'Introduzione · 3 dischi · 3 nodi (prof. 2)',
  },
  // L2 – profondità 3, 4 nodi, 6 dischi
  {
    insertOrder: [4, 2, 6, 1],
    discPlacements: [{ key: 1, discs: dr(6, 1) }],
    totalDiscs: 6,
    label: 'Livello 2',
    description: 'Facile · 6 dischi · 4 nodi (prof. 3)',
  },
  // L3 – profondità 3, 5 nodi, 12 dischi (6+6)
  {
    insertOrder: [4, 2, 6, 1, 3],
    discPlacements: [
      { key: 1, discs: dr(12, 7) },
      { key: 3, discs: dr(6,  1) },
    ],
    totalDiscs: 12,
    label: 'Livello 3',
    description: 'Normale · 12 dischi · 5 nodi (prof. 3)',
  },
  // L4 – profondità 3, 6 nodi, 24 dischi (12+12)
  {
    insertOrder: [4, 2, 6, 1, 3, 5],
    discPlacements: [
      { key: 1, discs: dr(24, 13) },
      { key: 5, discs: dr(12,  1) },
    ],
    totalDiscs: 24,
    label: 'Livello 4',
    description: 'Difficile · 24 dischi · 6 nodi (prof. 3)',
  },
  // L5 – profondità 3, 7 nodi, 36 dischi (12+12+12)
  {
    insertOrder: [4, 2, 6, 1, 3, 5, 7],
    discPlacements: [
      { key: 1, discs: dr(36, 25) },
      { key: 3, discs: dr(24, 13) },
      { key: 7, discs: dr(12,  1) },
    ],
    totalDiscs: 36,
    label: 'Livello 5',
    description: 'Difficile · 36 dischi · 7 nodi (prof. 3)',
  },
  // L6 – profondità 4, 10 nodi, 48 dischi (16+16+16)
  {
    insertOrder: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5],
    discPlacements: [
      { key: 1, discs: dr(48, 33) },
      { key: 3, discs: dr(32, 17) },
      { key: 5, discs: dr(16,  1) },
    ],
    totalDiscs: 48,
    label: 'Livello 6',
    description: 'Esperto · 48 dischi · 10 nodi (prof. 4)',
  },
  // L7 – profondità 4, 12 nodi, 64 dischi (16+16+16+16)
  {
    insertOrder: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 9, 11],
    discPlacements: [
      { key: 1,  discs: dr(64, 49) },
      { key: 3,  discs: dr(48, 33) },
      { key: 9,  discs: dr(32, 17) },
      { key: 11, discs: dr(16,  1) },
    ],
    totalDiscs: 64,
    label: 'Livello 7',
    description: 'Maestro · 64 dischi · 12 nodi (prof. 4)',
  },
];

export function buildLevel(level: number): AVLNode {
  const cfg = LEVELS[level - 1];
  if (!cfg) throw new Error(`Level ${level} not found`);

  let tree: AVLNode | null = null;
  for (const key of cfg.insertOrder) tree = avlInsert(tree, key);

  for (const { key, discs } of cfg.discPlacements) {
    const node = findByKey(tree!, key);
    if (node) tree = updateDiscs(tree!, node.id, discs);
  }

  return tree!;
}
