import React, { useMemo } from 'react';
import { AVLNode, getAllNodes } from '../../lib/avl';
import { layoutTree, Position } from '../../lib/treeLayout';

const SVG_W = 820;
const SVG_H = 600;
const POT_CX = 410;
const POT_TOP = 510; // y of pot rim opening

// ─────────────── colour palettes ───────────────
const BRANCH_COLORS  = ['#2E1500', '#4A2800', '#6B3E10', '#8A5A28', '#A87840'];
const BRANCH_WIDTHS  = [20, 13, 8, 5, 3];
const LEAF_COLORS    = ['#163D12', '#215E1A', '#2E7D22', '#3D9A2C', '#50B038'];
const DISC_COLORS: Record<number, string> = {
  1: '#2980B9', 2: '#27AE60', 3: '#F1C40F', 4: '#E67E22', 5: '#C0392B', 6: '#8E44AD',
};

// ─────────────── tree traversal helpers ───────────────
interface EdgeData { parentId: string; childId: string; depth: number; isLeft: boolean }

function collectEdges(node: AVLNode | null, depth: number): EdgeData[] {
  if (!node) return [];
  const out: EdgeData[] = [];
  if (node.left)  { out.push({ parentId: node.id, childId: node.left.id,  depth, isLeft: true  }); out.push(...collectEdges(node.left,  depth + 1)); }
  if (node.right) { out.push({ parentId: node.id, childId: node.right.id, depth, isLeft: false }); out.push(...collectEdges(node.right, depth + 1)); }
  return out;
}

function collectLeaves(node: AVLNode | null): AVLNode[] {
  if (!node) return [];
  if (!node.left && !node.right) return [node];
  return [...collectLeaves(node.left), ...collectLeaves(node.right)];
}

// ─────────────── sub-components ───────────────

function Branch({ from, to, depth, isLeft }: { from: Position; to: Position; depth: number; isLeft: boolean }) {
  const w     = BRANCH_WIDTHS[Math.min(depth, BRANCH_WIDTHS.length - 1)];
  const color = BRANCH_COLORS[Math.min(depth, BRANCH_COLORS.length - 1)];

  const dx   = to.x - from.x;
  const midX = from.x + dx * 0.45 + (isLeft ? -Math.abs(dx) * 0.18 : Math.abs(dx) * 0.18);
  const midY = (from.y + to.y) * 0.5 - Math.abs(from.y - to.y) * 0.08;

  return (
    <path
      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function LeafCluster({ x, y, seed }: { x: number; y: number; seed: number }) {
  const v = ((seed * 137) % 100) / 100;
  const offsets = [
    { dx: v * 6 - 3,       dy: -32,        rx: 34, ry: 24, rot: -8 + v * 12,  ci: 0 },
    { dx: -16 + v * 5,     dy: -44,        rx: 30, ry: 21, rot: -22 + v * 10, ci: 1 },
    { dx: 18 + v * 4,      dy: -42,        rx: 28, ry: 20, rot: 18 + v * 10,  ci: 0 },
    { dx: -28 + v * 4,     dy: -24,        rx: 26, ry: 19, rot: -35 + v * 8,  ci: 2 },
    { dx: 26 + v * 4,      dy: -22,        rx: 26, ry: 19, rot: 32 + v * 8,   ci: 1 },
    { dx: -6 + v * 5,      dy: -57,        rx: 24, ry: 17, rot: -6 + v * 8,   ci: 3 },
    { dx: 10 + v * 5,      dy: -54,        rx: 22, ry: 16, rot: 8 + v * 8,    ci: 4 },
  ];

  return (
    <g style={{ filter: 'drop-shadow(0 4px 6px rgba(0,60,0,0.35))' }}>
      {offsets.map((o, i) => (
        <ellipse
          key={i}
          cx={x + o.dx} cy={y + o.dy}
          rx={o.rx} ry={o.ry}
          fill={LEAF_COLORS[o.ci]}
          opacity={0.88}
          transform={`rotate(${o.rot},${x + o.dx},${y + o.dy})`}
        />
      ))}
    </g>
  );
}

function Pot({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      {/* body */}
      <path d={`M${cx-64} ${y} L${cx-46} ${y+62} L${cx+46} ${y+62} L${cx+64} ${y} Z`}
        fill="url(#pot-grad)" />
      {/* highlight */}
      <path d={`M${cx-42} ${y+5} L${cx-28} ${y+60} L${cx-16} ${y+60} L${cx-22} ${y+5} Z`}
        fill="rgba(255,180,100,0.22)" />
      {/* rim */}
      <rect x={cx-70} y={y-12} width={140} height={20} rx={6} fill="url(#rim-grad)" />
      {/* rim highlight */}
      <rect x={cx-67} y={y-12} width={134} height={7} rx={4} fill="rgba(220,140,80,0.35)" />
      {/* base */}
      <rect x={cx-42} y={y+62} width={84} height={13} rx={5} fill="#6B3010" />
      {/* soil */}
      <ellipse cx={cx} cy={y-1} rx={62} ry={9} fill="#1E0E07" />
      <ellipse cx={cx-18} cy={y-2} rx={9} ry={4} fill="#2F1A0C" opacity={0.6} />
      <ellipse cx={cx+20} cy={y-3} rx={8} ry={3} fill="#2F1A0C" opacity={0.6} />
    </g>
  );
}

function Trunk({ rootPos }: { rootPos: Position }) {
  const cpX = POT_CX + (rootPos.x - POT_CX) * 0.2 + 5;
  const cpY1 = POT_TOP - 35;
  const cpY2 = rootPos.y + 28;
  return (
    <path
      d={`M ${POT_CX} ${POT_TOP - 4} C ${cpX} ${cpY1} ${rootPos.x - 4} ${cpY2} ${rootPos.x} ${rootPos.y}`}
      stroke="url(#trunk-grad)"
      strokeWidth={24}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function NodeCircle({
  node, pos, selected, isValid, isError, isAdded, onClick,
}: {
  node: AVLNode; pos: Position;
  selected: boolean; isValid: boolean; isError: boolean; isAdded: boolean;
  onClick: () => void;
}) {
  const R = 24;
  let ringColor = 'none';
  let ringW = 0;
  if (selected)  { ringColor = '#FFD700'; ringW = 4; }
  else if (isValid)  { ringColor = '#22CC55'; ringW = 3; }
  else if (isError)  { ringColor = '#EE2222'; ringW = 3; }
  else if (isAdded)  { ringColor = '#44AAFF'; ringW = 3; }

  const fill = selected ? '#FFFADF' : node.discs.length > 0 ? '#F5E8C0' : '#E8DFCB';

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {ringW > 0 && (
        <circle cx={pos.x} cy={pos.y} r={R + 7}
          fill="none" stroke={ringColor} strokeWidth={ringW} opacity={0.9}
          style={{ filter: selected ? 'drop-shadow(0 0 6px #FFD700)' : undefined }}
        />
      )}
      {/* bark-ring outer */}
      <circle cx={pos.x} cy={pos.y} r={R + 2} fill="#6B3E10" opacity={0.4} />
      {/* main circle */}
      <circle cx={pos.x} cy={pos.y} r={R} fill={fill} stroke="#7A5000" strokeWidth={2} />
      {/* inner shine */}
      <ellipse cx={pos.x - 5} cy={pos.y - 7} rx={10} ry={7} fill="rgba(255,255,255,0.25)" />
      {/* key label */}
      <text x={pos.x} y={pos.y + 5}
        textAnchor="middle" fontSize={14} fontWeight="700" fill="#4A2E00"
        style={{ userSelect: 'none', fontFamily: 'Georgia, serif' }}>
        {node.key}
      </text>
    </g>
  );
}

function DiscStack({ node, pos }: { node: AVLNode; pos: Position }) {
  if (node.discs.length === 0) return null;
  const R    = 24;
  const baseY = pos.y - R - 2;
  const gap   = 14;

  return (
    <g>
      {node.discs.map((size, i) => {
        const cy    = baseY - i * gap;
        const rx    = 9 + size * 7;
        const ry    = 8;
        const color = DISC_COLORS[size] ?? '#888';
        const isTop = i === node.discs.length - 1;
        return (
          <g key={i}>
            {/* shadow */}
            <ellipse cx={pos.x} cy={cy + 4} rx={rx} ry={ry * 0.5} fill="rgba(0,0,0,0.18)" />
            {/* side face */}
            <ellipse cx={pos.x} cy={cy + 4} rx={rx} ry={ry}
              fill={color} opacity={0.55} />
            {/* top face */}
            <ellipse cx={pos.x} cy={cy} rx={rx} ry={ry}
              fill={color}
              stroke={isTop ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.2)'}
              strokeWidth={isTop ? 1.5 : 1}
            />
            {/* shine */}
            <ellipse cx={pos.x - rx * 0.25} cy={cy - ry * 0.3} rx={rx * 0.4} ry={ry * 0.3}
              fill="rgba(255,255,255,0.3)" />
            {/* disc size number */}
            {isTop && (
              <text x={pos.x} y={cy + 4}
                textAnchor="middle" fontSize={10} fontWeight="700"
                fill="rgba(255,255,255,0.9)"
                style={{ userSelect: 'none', fontFamily: 'monospace' }}>
                {size}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ─────────────── main component ───────────────

interface BonsaiTreeProps {
  root: AVLNode | null;
  selectedNodeId: string | null;
  validTargetIds: string[];
  errorNodeId: string | null;
  lastAddedNodeId: string | null;
  onNodeClick: (id: string) => void;
}

const BonsaiTree: React.FC<BonsaiTreeProps> = ({
  root, selectedNodeId, validTargetIds, errorNodeId, lastAddedNodeId, onNodeClick,
}) => {
  const positions = useMemo(() => layoutTree(root, SVG_W, SVG_H), [root]);
  const allNodes  = useMemo(() => getAllNodes(root), [root]);
  const edges     = useMemo(() => collectEdges(root, 0), [root]);
  const leaves    = useMemo(() => collectLeaves(root), [root]);
  const validSet  = useMemo(() => new Set(validTargetIds), [validTargetIds]);
  const rootPos   = root ? positions.get(root.id) : null;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%" height="100%"
      style={{ display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#B8D8F0" />
          <stop offset="55%"  stopColor="#DFF0D8" />
          <stop offset="100%" stopColor="#D4C89A" />
        </linearGradient>
        <linearGradient id="trunk-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1E0A00" />
          <stop offset="40%"  stopColor="#3D2000" />
          <stop offset="100%" stopColor="#2A1500" />
        </linearGradient>
        <linearGradient id="pot-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7A3010" />
          <stop offset="45%"  stopColor="#B5601A" />
          <stop offset="100%" stopColor="#8A3A18" />
        </linearGradient>
        <linearGradient id="rim-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8A3A12" />
          <stop offset="100%" stopColor="#6B2C0E" />
        </linearGradient>
        <filter id="ground-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ── background ── */}
      <rect width={SVG_W} height={SVG_H} fill="url(#sky-grad)" />

      {/* ── distant hills ── */}
      <ellipse cx={160} cy={SVG_H - 80} rx={210} ry={70} fill="#B8CFA0" opacity={0.35} filter="url(#ground-blur)" />
      <ellipse cx={680} cy={SVG_H - 75} rx={190} ry={65} fill="#B8CFA0" opacity={0.35} filter="url(#ground-blur)" />

      {/* ── ground strip ── */}
      <rect x={0} y={SVG_H - 85} width={SVG_W} height={85} fill="#C4A86E" opacity={0.28} />

      {/* ── trunk ── */}
      {rootPos && <Trunk rootPos={rootPos} />}

      {/* ── branches ── */}
      {edges.map(e => {
        const from = positions.get(e.parentId);
        const to   = positions.get(e.childId);
        if (!from || !to) return null;
        return <Branch key={`${e.parentId}-${e.childId}`} from={from} to={to} depth={e.depth + 1} isLeft={e.isLeft} />;
      })}

      {/* ── leaf clusters (behind nodes) ── */}
      {leaves.map(n => {
        const p = positions.get(n.id);
        if (!p) return null;
        return <LeafCluster key={n.id} x={p.x} y={p.y} seed={n.key} />;
      })}

      {/* ── pot (in front of trunk base) ── */}
      <Pot cx={POT_CX} y={POT_TOP} />

      {/* ── disc stacks ── */}
      {allNodes.map(n => {
        const p = positions.get(n.id);
        if (!p) return null;
        return <DiscStack key={n.id} node={n} pos={p} />;
      })}

      {/* ── node circles ── */}
      {allNodes.map(n => {
        const p = positions.get(n.id);
        if (!p) return null;
        return (
          <NodeCircle
            key={n.id}
            node={n} pos={p}
            selected={selectedNodeId === n.id}
            isValid={validSet.has(n.id)}
            isError={errorNodeId === n.id}
            isAdded={lastAddedNodeId === n.id}
            onClick={() => onNodeClick(n.id)}
          />
        );
      })}
    </svg>
  );
};

export default BonsaiTree;
