export interface AVLNode {
  key: number;
  id: string;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;
  discs: number[]; // sorted descending: [largest, ..., smallest]
}

let _ctr = 0;
export const genId = () => `n${++_ctr}`;

const h = (n: AVLNode | null) => n?.height ?? 0;
const rh = (n: AVLNode): AVLNode => ({ ...n, height: 1 + Math.max(h(n.left), h(n.right)) });
const bf = (n: AVLNode) => h(n.left) - h(n.right);

function rotR(y: AVLNode): AVLNode {
  const x = y.left!;
  return rh({ ...x, right: rh({ ...y, left: x.right }) });
}
function rotL(x: AVLNode): AVLNode {
  const y = x.right!;
  return rh({ ...y, left: rh({ ...x, right: y.left }) });
}
function balance(n: AVLNode): AVLNode {
  const u = rh(n);
  const f = bf(u);
  if (f > 1)  return bf(u.left!)  < 0 ? rotR({ ...u, left:  rotL(u.left!)  }) : rotR(u);
  if (f < -1) return bf(u.right!) > 0 ? rotL({ ...u, right: rotR(u.right!) }) : rotL(u);
  return u;
}

export function avlInsert(root: AVLNode | null, key: number): AVLNode {
  if (!root) return { key, id: genId(), height: 1, left: null, right: null, discs: [] };
  if (key === root.key) return root;
  if (key < root.key) return balance({ ...root, left: avlInsert(root.left, key) });
  return balance({ ...root, right: avlInsert(root.right, key) });
}

export function getAllNodes(root: AVLNode | null): AVLNode[] {
  if (!root) return [];
  return [root, ...getAllNodes(root.left), ...getAllNodes(root.right)];
}

export function findById(root: AVLNode | null, id: string): AVLNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  return findById(root.left, id) ?? findById(root.right, id);
}

export function findByKey(root: AVLNode | null, key: number): AVLNode | null {
  if (!root) return null;
  if (key === root.key) return root;
  return key < root.key ? findByKey(root.left, key) : findByKey(root.right, key);
}

export function updateDiscs(root: AVLNode | null, id: string, discs: number[]): AVLNode | null {
  if (!root) return null;
  if (root.id === id) return { ...root, discs };
  return { ...root, left: updateDiscs(root.left, id, discs), right: updateDiscs(root.right, id, discs) };
}

export function findPath(root: AVLNode | null, fromId: string, toId: string): string[] | null {
  const toNode = (node: AVLNode | null, target: string, path: string[]): string[] | null => {
    if (!node) return null;
    const p = [...path, node.id];
    if (node.id === target) return p;
    return toNode(node.left, target, p) ?? toNode(node.right, target, p);
  };

  const pF = toNode(root, fromId, []);
  const pT = toNode(root, toId,   []);
  if (!pF || !pT) return null;

  let lca = -1;
  for (let i = 0; i < Math.min(pF.length, pT.length); i++) {
    if (pF[i] === pT[i]) lca = i; else break;
  }
  if (lca < 0) return null;

  return [...pF.slice(lca).reverse(), ...pT.slice(lca + 1)];
}
