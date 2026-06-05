import { create } from 'zustand';
import { AVLNode, avlInsert, findById, getAllNodes } from '../lib/avl';
import { canMove, applyMove, getValidTargets } from '../lib/hanoiLogic';
import { buildLevel, LEVELS } from '../lib/levels';

export interface HanoiState {
  isActive: boolean;
  isWon: boolean;
  gameLevel: number;
  totalDiscs: number;
}

export interface AnimatingDisc {
  disc: number;
  key: number; // unique id per animation instance
}

interface TreeStore {
  tree: AVLNode | null;
  hanoiState: HanoiState;
  gameStartTime: number;
  selectedNodeId: string | null;
  validTargetIds: string[];
  lastAddedNodeId: string | null;
  errorNodeId: string | null;
  moveCount: number;
  groundedCount: number;
  animatingDiscs: AnimatingDisc[];

  startHanoi:     (level: number) => void;
  selectNode:     (nodeId: string) => void;
  clearSelection: () => void;
  moveDisc:       (toId: string) => void;
  addNode:        (key: number) => { success: boolean; reason?: string };
  exitToMenu:     () => void;
}

const INITIAL_HANOI: HanoiState = {
  isActive: false,
  isWon: false,
  gameLevel: 1,
  totalDiscs: 0,
};

let animKey = 0;

export const useTreeStore = create<TreeStore>((set, get) => ({
  tree: null,
  hanoiState: INITIAL_HANOI,
  gameStartTime: Date.now(),
  selectedNodeId: null,
  validTargetIds: [],
  lastAddedNodeId: null,
  errorNodeId: null,
  moveCount: 0,
  groundedCount: 0,
  animatingDiscs: [],

  startHanoi: (level) => {
    const cfg = LEVELS[level - 1];
    if (!cfg) return;
    set({
      tree: buildLevel(level),
      hanoiState: { isActive: true, isWon: false, gameLevel: level, totalDiscs: cfg.totalDiscs },
      gameStartTime: Date.now(),
      selectedNodeId: null,
      validTargetIds: [],
      lastAddedNodeId: null,
      errorNodeId: null,
      moveCount: 0,
      groundedCount: 0,
      animatingDiscs: [],
    });
  },

  selectNode: (nodeId) => {
    const { tree, hanoiState } = get();
    if (!tree || !hanoiState.isActive || hanoiState.isWon) return;
    const node = findById(tree, nodeId);
    if (!node || node.discs.length === 0) {
      set({ errorNodeId: nodeId });
      setTimeout(() => set({ errorNodeId: null }), 500);
      return;
    }
    const validTargetIds = getValidTargets(tree, nodeId);
    set({ selectedNodeId: nodeId, validTargetIds, errorNodeId: null });
  },

  clearSelection: () => set({ selectedNodeId: null, validTargetIds: [] }),

  moveDisc: (toId) => {
    const { tree, selectedNodeId, hanoiState, groundedCount } = get();
    if (!tree || !selectedNodeId || !hanoiState.isActive || hanoiState.isWon) return;

    const result = canMove(tree, selectedNodeId, toId);
    if (!result.ok) {
      set({ errorNodeId: toId });
      setTimeout(() => set({ errorNodeId: null }), 500);
      return;
    }

    const newTree = applyMove(tree, selectedNodeId, toId);

    // Check if the disc that just landed at the root is the global max on the tree
    let finalTree = newTree;
    let escapedDisc: number | null = null;
    let escapedKey = -1;

    if (toId === newTree.id && newTree.discs.length > 0) {
      const allDiscs = getAllNodes(newTree).flatMap(n => n.discs);
      const globalMax = Math.max(...allDiscs);
      const rootTop = newTree.discs[newTree.discs.length - 1]; // top = just arrived

      if (rootTop === globalMax) {
        // Remove it from root and send it to the ground
        finalTree = { ...newTree, discs: newTree.discs.slice(0, -1) };
        escapedDisc = rootTop;
        escapedKey = ++animKey;
      }
    }

    const newGrounded = groundedCount + (escapedDisc !== null ? 1 : 0);
    const isWon = newGrounded >= hanoiState.totalDiscs;

    set(s => ({
      tree: finalTree,
      hanoiState: { ...hanoiState, isWon: false },
      selectedNodeId: null,
      validTargetIds: [],
      moveCount: s.moveCount + 1,
      groundedCount: newGrounded,
      animatingDiscs: escapedDisc !== null
        ? [...s.animatingDiscs, { disc: escapedDisc, key: escapedKey }]
        : s.animatingDiscs,
    }));

    if (escapedDisc !== null) {
      const k = escapedKey;
      setTimeout(() => {
        set(s => ({
          animatingDiscs: s.animatingDiscs.filter(a => a.key !== k),
          ...(isWon ? { hanoiState: { ...s.hanoiState, isWon: true } } : {}),
        }));
      }, 2400);
    }
  },

  addNode: (key) => {
    const { tree, hanoiState } = get();
    if (!tree || !hanoiState.isActive) return { success: false, reason: 'not-active' };

    if (getAllNodes(tree).some(n => n.key === key)) {
      return { success: false, reason: 'exists' };
    }

    const beforeIds = new Set(getAllNodes(tree).map(n => n.id));
    const newTree   = avlInsert(tree, key);
    const newNodeId = getAllNodes(newTree).find(n => !beforeIds.has(n.id))?.id ?? null;

    set({ tree: newTree, lastAddedNodeId: newNodeId, selectedNodeId: null, validTargetIds: [] });
    if (newNodeId) setTimeout(() => set({ lastAddedNodeId: null }), 1800);

    return { success: true };
  },

  exitToMenu: () => set({
    hanoiState: { isActive: false, isWon: false, gameLevel: 1, totalDiscs: 0 },
    selectedNodeId: null,
    validTargetIds: [],
    groundedCount: 0,
    animatingDiscs: [],
  }),
}));
