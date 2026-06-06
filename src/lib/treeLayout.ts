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

export function layoutTree(
  root: AVLNode | null,
  svgW: number,
  svgH: number,
  nodeW: number = 60,
): Map<string, Position> {
  const pos = new Map<string, Position>();
  if (!root) return pos;

  const depth   = treeDepth(root);
  const nodeH   = nodeW * 0.58;
  const labelH  = nodeW * 0.27;
  const groundH = Math.max(40, svgH * 0.07);
  const usableH = svgH - groundH;

  // Padding orizzontale: metà nodo + margine
  const padX = Math.max(nodeW * 0.55 + 8, svgW * 0.04);

  // rootY: il fondo del nodo (centro + NH/2 + labelH) deve stare sopra il terreno
  const rootY = Math.min(
    usableH * 0.88,
    usableH - nodeH * 0.5 - labelH - 10,
  );

  // leafY: la cima del nodo (centro - NH/2 - emoji overhang ~0.67*NH) deve stare > 0
  const emojiOverhang = nodeH * 0.67 + nodeW * 0.15;
  const leafY = Math.max(emojiOverhang + 10, usableH * 0.08);

  // Sicurezza: se l'albero è troppo alto per lo spazio, comprimi
  const span   = depth > 1 ? rootY - leafY : 1;
  const levelH = depth > 1 ? span / (depth - 1) : 0;

  function assign(node: AVLNode | null, d: number, xMin: number, xMax: number) {
    if (!node) return;
    pos.set(node.id, { x: (xMin + xMax) / 2, y: rootY - d * levelH });
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
