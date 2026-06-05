import { AVLNode } from './avl';

export interface Position { x: number; y: number }

function subtreeSize(node: AVLNode | null): number {
  if (!node) return 0;
  return 1 + subtreeSize(node.left) + subtreeSize(node.right);
}

function treeDepth(node: AVLNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

// Root at BOTTOM (large y), children spread upward (decreasing y).
// Leaves are at the TOP of the diagram.
export function layoutTree(
  root: AVLNode | null,
  svgW: number,
  svgH: number,
): Map<string, Position> {
  const pos = new Map<string, Position>();
  if (!root) return pos;

  const depth  = treeDepth(root);
  const rootY  = svgH - 120;                                   // root near bottom
  const leafY  = rootY - Math.max(1, depth - 1) * 220;        // leaves near top (smaller y)
  const levelH = depth > 1 ? (leafY - rootY) / (depth - 1) : 0;
  const padX   = 100;

  function assign(node: AVLNode | null, d: number, xMin: number, xMax: number) {
    if (!node) return;
    pos.set(node.id, { x: (xMin + xMax) / 2, y: rootY + d * levelH });

    const ls  = subtreeSize(node.left);
    const rs  = subtreeSize(node.right);
    const tot = ls + rs;
    if (tot > 0) {
      const mid = xMin + (xMax - xMin) * (ls / tot);
      assign(node.left,  d + 1, xMin, mid);
      assign(node.right, d + 1, mid,  xMax);
    }
  }

  assign(root, 0, padX, svgW - padX);
  return pos;
}
