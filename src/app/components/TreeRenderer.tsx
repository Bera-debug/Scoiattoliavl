import React, { useMemo } from 'react';
import { AVLNode } from '../../lib/avl';
import { layoutTree } from '../../lib/treeLayout';

export const SVG_W = 1200;
export const SVG_H = 1400;

// Logical half-size used only for branch connection points
const NODE_R  = 30;
// Nest visual dimensions
const NW      = 76;   // nest body width
const NH      = 46;   // nest body height
const LABEL_H = 20;   // yellow label height below nest

// ── Branch helpers ─────────────────────────────────────────────────────────────
function branchWidth(childDepth: number, maxDepth: number): number {
  const ratio = 1 - childDepth / (maxDepth + 1);
  return Math.max(3, ratio * 20);
}

function branchPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

// ── NestNode — sostituisce completamente il cerchio del nodo ───────────────────
// cx,cy = punto di connessione dei rami (centro geometrico del nodo nel layout)
// discs = [più grande, ..., più piccolo]  (sorted descending)
// nodeKey = chiave AVL del nodo
interface NestNodeProps {
  cx: number; cy: number;
  discs: number[];
  nodeKey: number;
  isSelected: boolean;
  isTarget: boolean;
  isError: boolean;
  isNew: boolean;
  onClick: () => void;
}

const NestNode: React.FC<NestNodeProps> = ({
  cx, cy, discs, nodeKey,
  isSelected, isTarget, isError, isNew,
  onClick,
}) => {
  const count    = discs.length;
  const biggest  = count > 0 ? discs[0] : null;               // più grande (in fondo)
  const smallest = count > 0 ? discs[discs.length - 1] : null; // più piccolo (in cima, muovibile)

  // Nido centrato sul punto di connessione del ramo
  const nestCY = cy;          // centro verticale del corpo nido
  const nestTop = nestCY - NH / 2;
  const labelCY = nestCY + NH / 2 + LABEL_H / 2;

  const nestStroke = '#3A1E06';

  // Highlight ring attorno a tutto il nido
  let ringColor = '';
  let ringW = 0;
  if (isError)         { ringColor = '#FF3333'; ringW = 5; }
  else if (isSelected) { ringColor = '#FFD700'; ringW = 5; }
  else if (isTarget)   { ringColor = '#44EE44'; ringW = 4; }
  else if (isNew)      { ringColor = '#44AAFF'; ringW = 4; }

  const totalH = NH + LABEL_H + 4;
  const centerY = nestCY + LABEL_H / 2 + 2;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>

      {/* highlight ring attorno al nido intero */}
      {ringW > 0 && (
        <rect
          x={cx - NW / 2 - ringW - 2} y={nestTop - ringW - 2}
          width={NW + (ringW + 2) * 2} height={totalH + (ringW + 2) * 2}
          rx={14} ry={14}
          fill="none" stroke={ringColor} strokeWidth={ringW} opacity={0.9}
        />
      )}

      {/* ── corpo nido ── */}
      {/* base ovale con sfumatura radiale */}
      <ellipse cx={cx} cy={nestCY + NH * 0.15}
        rx={NW / 2} ry={NH * 0.52}
        fill="url(#nestBody)" stroke={nestStroke} strokeWidth={1.5}
        filter="url(#nestShadow)" />

      {/* linee intreccio ramoscelli */}
      {[-0.32, -0.12, 0.1, 0.3].map((t, i) => (
        <path key={i}
          d={`M ${cx + t * NW} ${nestTop + 4}
              Q ${cx + t * NW * 0.6} ${nestCY + NH * 0.5}
                ${cx + (t + 0.18) * NW * 0.8} ${nestCY + NH * 0.65}`}
          fill="none" stroke="#3A1E06" strokeWidth={1.3} opacity={0.5} />
      ))}
      {/* secondo strato ramoscelli incrociati */}
      {[0.28, 0.08, -0.14].map((t, i) => (
        <path key={`b${i}`}
          d={`M ${cx + t * NW} ${nestTop + 8}
              Q ${cx + (t - 0.2) * NW} ${nestCY + NH * 0.4}
                ${cx + (t - 0.1) * NW} ${nestCY + NH * 0.7}`}
          fill="none" stroke="#5A3010" strokeWidth={0.9} opacity={0.35} />
      ))}

      {/* bordo superiore del nido con sfumatura */}
      <ellipse cx={cx} cy={nestTop + NH * 0.12}
        rx={NW / 2} ry={NH * 0.2}
        fill="url(#nestRim)" stroke={nestStroke} strokeWidth={1.5} />

      {/* riflesso luce in alto a sinistra sul bordo */}
      <ellipse cx={cx - NW * 0.12} cy={nestTop + NH * 0.06}
        rx={NW * 0.14} ry={NH * 0.07}
        fill="white" opacity={0.18} />

      {/* ── scoiattoli dentro il nido ── */}
      {count === 0 && (
        // nido vuoto
        <text x={cx} y={nestCY - 2} textAnchor="middle" dominantBaseline="central" fontSize={11}
          fill="#C8A878" fontFamily="Georgia, serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
          vuoto
        </text>
      )}

      {count === 1 && smallest !== null && (
        // un solo scoiattolo, centrato
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <text x={cx} y={nestTop - 2}
            textAnchor="middle" dominantBaseline="central" fontSize={22}>🐿️</text>
          <circle cx={cx} cy={nestTop + 13} r={10} fill="#5A2E08" stroke="white" strokeWidth={1.2} />
          <text x={cx} y={nestTop + 13} textAnchor="middle" dominantBaseline="central"
            fontSize={9} fill="white" fontFamily="Georgia, serif" fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {smallest}
          </text>
        </g>
      )}

      {count >= 2 && biggest !== null && smallest !== null && (
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {/* scoiattolo GRANDE — più in basso, dentro il nido (profondo) */}
          <text x={cx - NW * 0.18} y={nestCY - 4}
            textAnchor="middle" dominantBaseline="central" fontSize={19}>🐿️</text>
          <circle cx={cx - NW * 0.18} cy={nestCY + 10} r={10}
            fill="#8B4010" stroke="white" strokeWidth={1.2} />
          <text x={cx - NW * 0.18} y={nestCY + 10}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fill="white" fontFamily="Georgia, serif" fontWeight="bold">
            {biggest}
          </text>

          {/* scoiattolo PICCOLO — più in alto, sbuca dal bordo (in cima, muovibile) */}
          <text x={cx + NW * 0.2} y={nestTop - 8}
            textAnchor="middle" dominantBaseline="central" fontSize={22}>🐿️</text>
          <circle cx={cx + NW * 0.2} cy={nestTop + 10} r={10}
            fill="#2A5E18" stroke="white" strokeWidth={1.5} />
          <text x={cx + NW * 0.2} y={nestTop + 10}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fill="white" fontFamily="Georgia, serif" fontWeight="bold">
            {smallest}
          </text>
        </g>
      )}

      {/* ── etichetta gialla con chiave nodo ── */}
      <rect
        x={cx - NW * 0.38} y={nestCY + NH / 2 + 3}
        width={NW * 0.76} height={LABEL_H}
        rx={5} ry={5}
        fill="#F5D020" stroke="#B89010" strokeWidth={1.2}
      />
      <text x={cx} y={labelCY + 1}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fill="#3A1E00"
        fontFamily="Georgia, serif" fontWeight="bold"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {nodeKey}
      </text>
    </g>
  );
};

// ── Depth helpers ─────────────────────────────────────────────────────────────
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

interface Edge {
  x1: number; y1: number; x2: number; y2: number;
  childDepth: number;
}

// ── Props ─────────────────────────────────────────────────────────────────────
import { AnimatingDisc } from '../../store/useTreeStore';

interface Props {
  root:            AVLNode | null;
  totalDiscs:      number;
  selectedNodeId:  string | null;
  validTargetIds:  string[];
  errorNodeId:     string | null;
  lastAddedNodeId: string | null;
  groundedCount:   number;
  animatingDiscs:  AnimatingDisc[];
  onNodeClick:     (id: string) => void;
}

const TreeRenderer: React.FC<Props> = ({
  root, totalDiscs, selectedNodeId, validTargetIds,
  errorNodeId, lastAddedNodeId, groundedCount, animatingDiscs, onNodeClick,
}) => {
  const pos      = useMemo(() => layoutTree(root, SVG_W, SVG_H), [root]);
  const nodesD   = useMemo(() => getAllNodesWithDepth(root), [root]);
  const maxDepth = useMemo(() => Math.max(0, treeMaxDepth(root) - 1), [root]);

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];
    function collect(node: AVLNode | null, d: number) {
      if (!node) return;
      const p = pos.get(node.id);
      if (!p) return;
      for (const child of [node.left, node.right]) {
        if (!child) continue;
        const cp = pos.get(child.id);
        if (!cp) continue;
        result.push({ x1: p.x, y1: p.y, x2: cp.x, y2: cp.y, childDepth: d + 1 });
        collect(child, d + 1);
      }
    }
    collect(root, 0);
    return result;
  }, [pos, root]);

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="treeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7BB8E8" />
          <stop offset="70%"  stopColor="#C8DFF5" />
          <stop offset="100%" stopColor="#D4C070" />
        </linearGradient>

        {/* sfumatura corpo nido: più scuro sul fondo, più caldo in cima */}
        <radialGradient id="nestBody" cx="45%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#C48A40" />
          <stop offset="45%"  stopColor="#8B5520" />
          <stop offset="100%" stopColor="#4A2808" />
        </radialGradient>

        {/* sfumatura bordo/rim nido */}
        <linearGradient id="nestRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D4A055" />
          <stop offset="100%" stopColor="#8B5520" />
        </linearGradient>

        {/* ombra sotto nido */}
        <filter id="nestShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#00000040" />
        </filter>
      </defs>

      {/* cielo */}
      <rect width={SVG_W} height={SVG_H} fill="url(#treeSky)" />

      {/* terreno */}
      <rect x={0} y={SVG_H - 70} width={SVG_W} height={70} fill="#5C3A14" />
      <rect x={0} y={SVG_H - 82} width={SVG_W} height={18} fill="#4A8A22" />

      {/* rami */}
      {edges.map((e, i) => {
        const w    = branchWidth(e.childDepth, maxDepth);
        const rat  = maxDepth > 0 ? e.childDepth / maxDepth : 0;
        const bark = `hsl(22,55%,${Math.round(20 + rat * 18)}%)`;
        return (
          <path key={i}
            d={branchPath(e.x1, e.y1, e.x2, e.y2)}
            fill="none" stroke={bark} strokeWidth={w} strokeLinecap="round" />
        );
      })}

      {/* tronco verso il basso */}
      {root && (() => {
        const rp = pos.get(root.id);
        if (!rp) return null;
        return <line x1={rp.x} y1={rp.y + NODE_R} x2={rp.x} y2={SVG_H - 70}
          stroke="#3A1E08" strokeWidth={32} strokeLinecap="round" />;
      })()}

      {/* nidi (sostituiscono i cerchi nodo) */}
      {nodesD.map(({ node }) => {
        const p = pos.get(node.id);
        if (!p) return null;
        return (
          <NestNode
            key={node.id}
            cx={p.x} cy={p.y}
            discs={node.discs}
            nodeKey={node.key}
            isSelected={node.id === selectedNodeId}
            isTarget={validTargetIds.includes(node.id)}
            isError={node.id === errorNodeId}
            isNew={node.id === lastAddedNodeId}
            onClick={() => onNodeClick(node.id)}
          />
        );
      })}

      {/* scoiattoli già atterrati sul terreno */}
      {groundedCount > 0 && (() => {
        const groundY = SVG_H - 58;
        return Array.from({ length: groundedCount }).map((_, i) => (
          <text
            key={i}
            x={60 + i * 48}
            y={groundY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={24}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            🐿️
          </text>
        ));
      })()}

      {/* scoiattoli in caduta dalla radice verso il terreno */}
      {animatingDiscs.length > 0 && root && (() => {
        const rp = pos.get(root.id);
        if (!rp) return null;
        const groundY = SVG_H - 76;
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
              <g key={a.key}>
                <text
                  x={rp.x + (i % 3 - 1) * 30}
                  y={rp.y - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                  style={{
                    animation: 'squirrelFall 2.2s ease-in forwards',
                    pointerEvents: 'none',
                  }}
                >
                  🐿️
                </text>
              </g>
            ))}
          </>
        );
      })()}
    </svg>
  );
};

export default TreeRenderer;
