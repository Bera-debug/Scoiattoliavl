import React, { useMemo } from 'react';
import { AVLNode } from '../../lib/avl';
import { layoutTree } from '../../lib/treeLayout';
import { AnimatingDisc } from '../../store/useTreeStore';

// ── Branch path & grain ───────────────────────────────────────────────────────
function branchWidth(childDepth: number, maxDepth: number, nw: number): number {
  const ratio = 1 - childDepth / (maxDepth + 1);
  return Math.max(1.5, ratio * nw * 0.20);
}

function cubicPath(x1: number, y1: number, x2: number, y2: number, ox = 0): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1 + ox} ${y1} C ${x1 + ox} ${midY}, ${x2 + ox} ${midY}, ${x2 + ox} ${y2}`;
}

// ── NestNode ──────────────────────────────────────────────────────────────────
interface NestNodeProps {
  cx: number; cy: number;
  discs: number[];
  nodeKey: number;
  isSelected: boolean;
  isTarget: boolean;
  isError: boolean;
  isNew: boolean;
  nw: number; nh: number; labelH: number;
  onClick: () => void;
}

const NestNode: React.FC<NestNodeProps> = ({
  cx, cy, discs, nodeKey,
  isSelected, isTarget, isError, isNew,
  nw, nh, labelH, onClick,
}) => {
  const count    = discs.length;
  const biggest  = count > 0 ? discs[0] : null;
  const smallest = count > 0 ? discs[count - 1] : null;

  // Nest geometry — cup shape, center slightly lowered
  const bx   = cx;
  const by   = cy + nh * 0.08;
  const rx   = nw * 0.50;
  const ry   = nh * 0.46;

  // Inner cavity (dark opening at the top of the cup)
  const cavRX = nw * 0.34;
  const cavRY = nh * 0.20;
  const cavY  = by - ry * 0.42;

  const labelCY = by + ry + labelH * 0.55 + 2;
  const sw      = Math.max(0.8, nw * 0.018);
  const clipId  = `nestClip-${nodeKey}`;
  const gradId  = `nestGrad-${nodeKey}`;

  // Selection ring
  let ringColor = '';
  let ringW     = 0;
  if      (isError)    { ringColor = '#8B3A28'; ringW = Math.max(2.5, nw * 0.055); }
  else if (isSelected) { ringColor = '#B89030'; ringW = Math.max(2.5, nw * 0.055); }
  else if (isTarget)   { ringColor = '#5A7840'; ringW = Math.max(2,   nw * 0.045); }
  else if (isNew)      { ringColor = '#4A6888'; ringW = Math.max(2,   nw * 0.045); }

  const fs = {
    emoji: Math.max(9,  nw * 0.28),
    badge: Math.max(5,  nw * 0.12),
    empty: Math.max(5,  nw * 0.12),
    label: Math.max(6,  nw * 0.16),
  };

  // Twig strokes (woven look) — pre-computed offsets for performance
  const twigs = useMemo(() => [
    // Horizontal-ish
    { d: `M ${bx-rx*0.9} ${by+ry*0.1} Q ${bx-rx*0.2} ${by-ry*0.15} ${bx+rx*0.85} ${by+ry*0.05}`, op: 0.55 },
    { d: `M ${bx-rx*0.8} ${by-ry*0.1} Q ${bx+rx*0.1} ${by+ry*0.2}  ${bx+rx*0.75} ${by-ry*0.05}`, op: 0.40 },
    { d: `M ${bx-rx*0.7} ${by+ry*0.3} Q ${bx}        ${by+ry*0.1}  ${bx+rx*0.70} ${by+ry*0.35}`, op: 0.50 },
    { d: `M ${bx-rx*0.6} ${by-ry*0.35} Q ${bx-rx*0.1} ${by+ry*0.05} ${bx+rx*0.6} ${by-ry*0.28}`, op: 0.38 },
    // Diagonal /
    { d: `M ${bx-rx*0.85} ${by+ry*0.4} Q ${bx-rx*0.1} ${by-ry*0.05} ${bx+rx*0.4} ${by-ry*0.38}`, op: 0.45 },
    { d: `M ${bx-rx*0.5}  ${by+ry*0.45} Q ${bx+rx*0.2} ${by+ry*0.1} ${bx+rx*0.8} ${by-ry*0.2}`, op: 0.40 },
    // Diagonal \
    { d: `M ${bx+rx*0.8}  ${by+ry*0.4} Q ${bx+rx*0.05} ${by-ry*0.1} ${bx-rx*0.45} ${by-ry*0.36}`, op: 0.42 },
    { d: `M ${bx+rx*0.55} ${by+ry*0.45} Q ${bx-rx*0.15} ${by+ry*0.1} ${bx-rx*0.82} ${by-ry*0.18}`, op: 0.38 },
  ], [bx, by, rx, ry]);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <defs>
        {/* Per-node clip path for twigs */}
        <clipPath id={clipId}>
          <ellipse cx={bx} cy={by} rx={rx} ry={ry} />
        </clipPath>
        {/* Per-node radial gradient for nest body */}
        <radialGradient id={gradId} cx="42%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#C49060" />
          <stop offset="40%"  stopColor="#8B5A28" />
          <stop offset="100%" stopColor="#3E1E08" />
        </radialGradient>
      </defs>

      {/* Selection ring */}
      {ringW > 0 && (
        <ellipse
          cx={bx} cy={by}
          rx={rx + ringW + 2} ry={ry + ringW + 2}
          fill="none" stroke={ringColor} strokeWidth={ringW} opacity={0.85}
        />
      )}

      {/* ── Nest body ── */}
      <ellipse cx={bx} cy={by} rx={rx} ry={ry}
        fill={`url(#${gradId})`}
        stroke="#2A1408" strokeWidth={sw}
        filter="url(#nestShadow)" />

      {/* Woven twig texture (clipped inside body) */}
      <g clipPath={`url(#${clipId})`}>
        {twigs.map((t, i) => (
          <path key={i} d={t.d}
            fill="none"
            stroke="#1A0A04"
            strokeWidth={Math.max(0.6, nw * 0.018)}
            opacity={t.op}
            strokeLinecap="round" />
        ))}
        {/* lighter grain layer on top */}
        {twigs.slice(0, 4).map((t, i) => (
          <path key={`g${i}`} d={t.d}
            fill="none"
            stroke="#C49060"
            strokeWidth={Math.max(0.4, nw * 0.009)}
            opacity={0.18}
            strokeLinecap="round" />
        ))}
      </g>

      {/* Inner cavity — dark well */}
      <ellipse cx={bx} cy={cavY} rx={cavRX} ry={cavRY}
        fill="#100804" opacity={0.92} />

      {/* Cavity rim highlight */}
      <ellipse cx={bx} cy={cavY} rx={cavRX} ry={cavRY}
        fill="none"
        stroke="#C49060"
        strokeWidth={Math.max(0.6, nw * 0.016)}
        opacity={0.70} />
      {/* Inner rim light spot */}
      <ellipse cx={bx - cavRX * 0.25} cy={cavY - cavRY * 0.35}
        rx={cavRX * 0.22} ry={cavRY * 0.22}
        fill="white" opacity={0.10} />

      {/* ── Contents ── */}
      {count === 0 && (
        <text x={bx} y={cavY + 1}
          textAnchor="middle" dominantBaseline="central"
          fontSize={fs.empty} fill="#8A6840" fontFamily="Georgia,serif" fontStyle="italic"
          style={{ pointerEvents: 'none', userSelect: 'none' }}>—</text>
      )}

      {count === 1 && smallest !== null && (
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {/* Squirrel peeking from cavity */}
          <text x={bx} y={cavY + cavRY * 0.1}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.emoji}>🐿️</text>
          {/* Count badge */}
          <circle cx={bx + cavRX * 0.72} cy={cavY - cavRY * 0.65}
            r={nw * 0.125} fill="#4A2808" stroke="#C49060" strokeWidth={Math.max(0.5, nw * 0.013)} />
          <text x={bx + cavRX * 0.72} y={cavY - cavRY * 0.65}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.badge} fill="#F0D090" fontFamily="Georgia,serif" fontWeight="bold">
            {smallest}
          </text>
        </g>
      )}

      {count >= 2 && biggest !== null && smallest !== null && (
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {/* Two squirrels peeking */}
          <text x={bx - cavRX * 0.38} y={cavY + cavRY * 0.15}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.emoji * 0.88}>🐿️</text>
          <text x={bx + cavRX * 0.42} y={cavY - cavRY * 0.10}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.emoji}>🐿️</text>
          {/* Bottom squirrel badge (largest) */}
          <circle cx={bx - cavRX * 0.65} cy={cavY + cavRY * 0.72}
            r={nw * 0.125} fill="#7A4018" stroke="#C49060" strokeWidth={Math.max(0.5, nw * 0.013)} />
          <text x={bx - cavRX * 0.65} y={cavY + cavRY * 0.72}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.badge} fill="#F0D090" fontFamily="Georgia,serif" fontWeight="bold">
            {biggest}
          </text>
          {/* Top squirrel badge (smallest / topmost) */}
          <circle cx={bx + cavRX * 0.72} cy={cavY - cavRY * 0.65}
            r={nw * 0.125} fill="#2A5018" stroke="#C49060" strokeWidth={Math.max(0.5, nw * 0.013)} />
          <text x={bx + cavRX * 0.72} y={cavY - cavRY * 0.65}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fs.badge} fill="#F0D090" fontFamily="Georgia,serif" fontWeight="bold">
            {smallest}
          </text>
        </g>
      )}

      {/* ── Key label tag ── */}
      <rect
        x={bx - nw * 0.34} y={by + ry + 3}
        width={nw * 0.68} height={labelH}
        rx={labelH * 0.38}
        fill="#D4B870" stroke="#9A8040" strokeWidth={Math.max(0.6, nw * 0.012)} />
      <text x={bx} y={labelCY}
        textAnchor="middle" dominantBaseline="central"
        fontSize={fs.label} fill="#2A1800" fontFamily="Georgia,serif" fontWeight="bold"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {nodeKey}
      </text>
    </g>
  );
};

// ── Tree helpers ──────────────────────────────────────────────────────────────
interface NodeDepth { node: AVLNode; depth: number }

function getAllNodesWithDepth(root: AVLNode | null): NodeDepth[] {
  const result: NodeDepth[] = [];
  function walk(n: AVLNode | null, d: number) {
    if (!n) return;
    result.push({ node: n, depth: d });
    walk(n.left, d + 1);
    walk(n.right, d + 1);
  }
  walk(root, 0);
  return result;
}

function treeMaxDepth(n: AVLNode | null): number {
  if (!n) return 0;
  return 1 + Math.max(treeMaxDepth(n.left), treeMaxDepth(n.right));
}

interface Edge { x1: number; y1: number; x2: number; y2: number; childDepth: number }

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  root:            AVLNode | null;
  totalDiscs:      number;
  containerW:      number;
  containerH:      number;
  selectedNodeId:  string | null;
  validTargetIds:  string[];
  errorNodeId:     string | null;
  lastAddedNodeId: string | null;
  groundedCount:   number;
  animatingDiscs:  AnimatingDisc[];
  onNodeClick:     (id: string) => void;
}

const TreeRenderer: React.FC<Props> = ({
  root, containerW, containerH,
  selectedNodeId, validTargetIds, errorNodeId, lastAddedNodeId,
  groundedCount, animatingDiscs, onNodeClick,
}) => {
  const depth    = useMemo(() => Math.max(1, treeMaxDepth(root)), [root]);
  const nodesD   = useMemo(() => getAllNodesWithDepth(root), [root]);
  const maxDepth = Math.max(0, depth - 1);

  const { NW, NH, LABEL_H, NODE_R } = useMemo(() => {
    const groundArea = Math.max(40, containerH * 0.07);
    const usableH    = containerH - groundArea;
    const maxAtLevel = Math.pow(2, depth - 1);
    const usableW    = containerW * 0.92;
    const cellW      = usableW / (maxAtLevel + 0.5);
    const treeSpanH  = usableH * 0.78;
    const cellH      = depth > 1 ? treeSpanH / (depth - 1) : treeSpanH;
    const rawNW      = Math.min(cellW * 0.80, cellH * 1.4);
    const NW         = Math.max(28, Math.min(rawNW, 110));
    return { NW, NH: NW * 0.58, LABEL_H: NW * 0.27, NODE_R: NW * 0.4 };
  }, [containerW, containerH, depth]);

  const pos = useMemo(
    () => layoutTree(root, containerW, containerH, NW),
    [root, containerW, containerH, NW],
  );

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];
    function collect(node: AVLNode | null, d: number) {
      if (!node) return;
      const p = pos.get(node.id);
      if (!p) return;
      for (const child of [node.left, node.right]) {
        if (!child) continue;
        const cp = pos.get(child.id);
        if (!cp) return;
        result.push({ x1: p.x, y1: p.y, x2: cp.x, y2: cp.y, childDepth: d + 1 });
        collect(child, d + 1);
      }
    }
    collect(root, 0);
    return result;
  }, [pos, root]);

  const groundY = containerH - Math.max(50, containerH * 0.07);

  return (
    <svg width={containerW} height={containerH}
      viewBox={`0 0 ${containerW} ${containerH}`} style={{ display: 'block' }}>
      <defs>
        {/* ── Sky gradient — zen ink-wash morning mist ── */}
        <linearGradient id="treeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D8D2C4" />
          <stop offset="45%"  stopColor="#C4B89E" />
          <stop offset="85%"  stopColor="#AE9E84" />
          <stop offset="100%" stopColor="#9E8E74" />
        </linearGradient>
        {/* ── Global nest shadow ── */}
        <filter id="nestShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#00000050" />
        </filter>
        {/* ── Trunk gradient ── */}
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1E0E06" />
          <stop offset="40%"  stopColor="#3A2010" />
          <stop offset="100%" stopColor="#1E0E06" />
        </linearGradient>
      </defs>

      {/* ── Sky ── */}
      <rect width={containerW} height={containerH} fill="url(#treeSky)" />

      {/* Subtle mist band near horizon */}
      <rect x={0} y={groundY - containerH * 0.06} width={containerW} height={containerH * 0.08}
        fill="rgba(220,210,190,0.22)" />

      {/* ── Ground ── */}
      <rect x={0} y={groundY + 10} width={containerW} height={containerH - groundY}
        fill="#3A2A18" />
      {/* Moss / grass strip */}
      <rect x={0} y={groundY} width={containerW} height={12}
        fill="#6A7850" />
      {/* Ground texture lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i}
          x1={0} y1={groundY + 14 + i * 6}
          x2={containerW} y2={groundY + 14 + i * 6}
          stroke="#2A1A0C" strokeWidth={0.6} opacity={0.3} />
      ))}

      {/* ── Branches with grain ── */}
      {edges.map((e, i) => {
        const w   = branchWidth(e.childDepth, maxDepth, NW);
        const rat = maxDepth > 0 ? e.childDepth / maxDepth : 0;
        // Walnut hue from dark to medium
        const L   = Math.round(16 + rat * 14);
        const col = `hsl(22, 42%, ${L}%)`;
        const colLight = `hsl(22, 30%, ${L + 10}%)`;
        const colDark  = `hsl(22, 50%, ${Math.max(10, L - 6)}%)`;

        return (
          <g key={i}>
            {/* Main branch */}
            <path d={cubicPath(e.x1, e.y1, e.x2, e.y2)}
              fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" />
            {/* Grain line 1 — slightly left, lighter */}
            <path d={cubicPath(e.x1, e.y1, e.x2, e.y2, -w * 0.22)}
              fill="none" stroke={colLight}
              strokeWidth={Math.max(0.5, w * 0.28)}
              strokeLinecap="round" opacity={0.55} />
            {/* Grain line 2 — slightly right, darker */}
            <path d={cubicPath(e.x1, e.y1, e.x2, e.y2, w * 0.28)}
              fill="none" stroke={colDark}
              strokeWidth={Math.max(0.4, w * 0.20)}
              strokeLinecap="round" opacity={0.45} />
          </g>
        );
      })}

      {/* ── Trunk ── */}
      {root && (() => {
        const rp = pos.get(root.id);
        if (!rp) return null;
        const tw = Math.max(10, NW * 0.38);
        return (
          <g>
            <line x1={rp.x} y1={rp.y + NODE_R} x2={rp.x} y2={groundY + 10}
              stroke="url(#trunkGrad)" strokeWidth={tw} strokeLinecap="round" />
            {/* Trunk grain lines */}
            <line x1={rp.x - tw * 0.18} y1={rp.y + NODE_R + 4} x2={rp.x - tw * 0.18} y2={groundY + 10}
              stroke="#4A2810" strokeWidth={Math.max(0.8, tw * 0.10)} opacity={0.5} strokeLinecap="round" />
            <line x1={rp.x + tw * 0.22} y1={rp.y + NODE_R + 4} x2={rp.x + tw * 0.22} y2={groundY + 10}
              stroke="#1A0A04" strokeWidth={Math.max(0.6, tw * 0.08)} opacity={0.45} strokeLinecap="round" />
          </g>
        );
      })()}

      {/* ── Nests ── */}
      {nodesD.map(({ node }) => {
        const p = pos.get(node.id);
        if (!p) return null;
        return (
          <NestNode key={node.id}
            cx={p.x} cy={p.y}
            discs={node.discs} nodeKey={node.key}
            isSelected={node.id === selectedNodeId}
            isTarget={validTargetIds.includes(node.id)}
            isError={node.id === errorNodeId}
            isNew={node.id === lastAddedNodeId}
            nw={NW} nh={NH} labelH={LABEL_H}
            onClick={() => onNodeClick(node.id)}
          />
        );
      })}

      {/* ── Squirrels on ground ── */}
      {groundedCount > 0 && (() => {
        const gy      = groundY - NH * 0.25;
        const spacing = Math.min(NW * 0.88, containerW / (groundedCount + 1));
        return Array.from({ length: groundedCount }).map((_, i) => (
          <text key={i}
            x={spacing * (i + 1)} y={gy}
            textAnchor="middle" dominantBaseline="central"
            fontSize={Math.max(12, NW * 0.32)}
            style={{ pointerEvents: 'none', userSelect: 'none' }}>🐿️</text>
        ));
      })()}

      {/* ── Fall animation ── */}
      {animatingDiscs.length > 0 && root && (() => {
        const rp = pos.get(root.id);
        if (!rp) return null;
        const fallDist = groundY - rp.y;
        return (
          <>
            <style>{`
              @keyframes squirrelFall {
                0%   { transform: translateY(0px);           opacity: 1; }
                80%  { transform: translateY(${fallDist}px); opacity: 1; }
                100% { transform: translateY(${fallDist}px); opacity: 0; }
              }
            `}</style>
            {animatingDiscs.map((a, i) => (
              <text key={a.key}
                x={rp.x + (i % 3 - 1) * NW * 0.44}
                y={rp.y - NH * 0.2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={Math.max(14, NW * 0.34)}
                style={{ animation: 'squirrelFall 2.2s ease-in forwards', pointerEvents: 'none' }}>
                🐿️
              </text>
            ))}
          </>
        );
      })()}
    </svg>
  );
};

export default TreeRenderer;
