import { AVLNode, findById, findPath, updateDiscs, getAllNodes } from './avl';

export function canMove(
  tree: AVLNode,
  fromId: string,
  toId: string,
): { ok: boolean; reason?: string } {
  if (fromId === toId) return { ok: false };

  const from = findById(tree, fromId);
  const to   = findById(tree, toId);
  if (!from || !to) return { ok: false };
  if (from.discs.length === 0) return { ok: false, reason: 'no-disc' };

  const moving = from.discs[from.discs.length - 1]; // top (smallest) disc

  // Destination: empty or top disc must be strictly larger
  if (to.discs.length > 0 && to.discs[to.discs.length - 1] <= moving) {
    return { ok: false, reason: 'dest-blocked' };
  }

  // Path: no intermediate node may have any disc smaller than the moving one
  const path = findPath(tree, fromId, toId);
  if (!path) return { ok: false, reason: 'no-path' };

  for (let i = 1; i < path.length - 1; i++) {
    const node = findById(tree, path[i]);
    if (node?.discs.some(d => d < moving)) {
      return { ok: false, reason: 'path-blocked' };
    }
  }

  return { ok: true };
}

export function applyMove(tree: AVLNode, fromId: string, toId: string): AVLNode {
  const from = findById(tree, fromId)!;
  const to   = findById(tree, toId)!;
  const disc = from.discs[from.discs.length - 1];
  let t = updateDiscs(tree, fromId, from.discs.slice(0, -1))!;
  return updateDiscs(t, toId, [...to.discs, disc])!;
}

export function checkWin(tree: AVLNode, totalDiscs: number): boolean {
  if (tree.discs.length !== totalDiscs) return false;
  return getAllNodes(tree).every(n => n === tree || n.discs.length === 0);
}

export function getValidTargets(tree: AVLNode, fromId: string): string[] {
  return getAllNodes(tree)
    .filter(n => n.id !== fromId && canMove(tree, fromId, n.id).ok)
    .map(n => n.id);
}
