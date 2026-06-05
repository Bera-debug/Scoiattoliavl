import React, { useState, useEffect, useRef } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { findById } from '../../lib/avl';
import TreeRenderer, { SVG_W, SVG_H } from './TreeRenderer';
import PanZoom from './PanZoom';
import InterLevelModal from './InterLevelModal';

// Detect touch device once
const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const HanoiGame: React.FC = () => {
  const {
    tree, hanoiState, selectedNodeId, validTargetIds,
    errorNodeId, lastAddedNodeId, moveCount, groundedCount, animatingDiscs,
    startHanoi, selectNode, clearSelection, moveDisc, addNode, exitToMenu,
  } = useTreeStore();

  const [keyInput, setKeyInput] = useState('');
  const [addMsg,   setAddMsg]   = useState<{ text: string; ok: boolean } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showPinchHint, setShowPinchHint] = useState(false);
  const hintShownRef = useRef(false);

  // Show pinch hint once per level on touch devices
  useEffect(() => {
    if (!isTouchDevice || hintShownRef.current) return;
    if (!hanoiState.isActive || hanoiState.isWon) return;
    hintShownRef.current = true;
    setShowPinchHint(true);
    const t = setTimeout(() => setShowPinchHint(false), 3500);
    return () => clearTimeout(t);
  }, [hanoiState.isActive, hanoiState.gameLevel]);

  // Reset hint flag when level changes so it shows again
  useEffect(() => {
    hintShownRef.current = false;
  }, [hanoiState.gameLevel]);

  const handleNodeClick = (nodeId: string) => {
    if (!hanoiState.isActive || hanoiState.isWon) return;
    if (selectedNodeId === nodeId) { clearSelection(); return; }
    if (selectedNodeId) { moveDisc(nodeId); return; }
    selectNode(nodeId);
  };

  const handleAdd = () => {
    const k = parseInt(keyInput.trim(), 10);
    if (isNaN(k) || k < 1 || k > 9999) {
      setAddMsg({ text: 'Chiave non valida (1–9999)', ok: false });
      setTimeout(() => setAddMsg(null), 2000);
      return;
    }
    const res = addNode(k);
    if (res.success) {
      setAddMsg({ text: `Nodo ${k} aggiunto — osserva il ribilanciamento!`, ok: true });
      setKeyInput('');
    } else {
      setAddMsg({ text: res.reason === 'exists' ? `Nodo ${k} già presente` : 'Errore', ok: false });
    }
    setTimeout(() => setAddMsg(null), 2500);
  };

  const selectedNode = tree && selectedNodeId ? findById(tree, selectedNodeId) : null;
  const topDisc      = selectedNode?.discs[selectedNode.discs.length - 1] ?? null;

  const statusText = hanoiState.isWon
    ? '🎉 Tutti gli scoiattoli a terra!'
    : topDisc
    ? `🐿️ Scoiattolo #${topDisc} selezionato — scegli ramo destinazione`
    : '🌳 Clicca un nodo con scoiattoli per selezionarlo';

  // Compute initial scale to fit SVG in viewport
  const initScale = typeof window !== 'undefined'
    ? Math.min(1, (window.innerWidth) / SVG_W, (window.innerHeight - 110) / SVG_H)
    : 0.8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0D1F06', fontFamily: 'Georgia, serif' }}>

      {/* ── header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(120,180,60,0.2)',
        flexShrink: 0, gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.3rem' }}>🌳</span>
          <span style={{ fontSize: '1rem', color: '#F0E8C0', fontStyle: 'italic' }}>AVL Hanoi</span>
        </div>

        {/* status badge */}
        <div style={{
          flex: 1, minWidth: 160, textAlign: 'center',
          background: 'rgba(0,30,0,0.6)',
          border: '1px solid rgba(100,180,50,0.25)',
          borderRadius: 16, padding: '4px 12px',
          color: topDisc ? '#FFE060' : '#90C870', fontSize: '0.78rem',
        }}>
          {statusText}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#80B060', fontSize: '0.78rem' }}>
            <strong style={{ color: '#F0E8C0' }}>L{hanoiState.gameLevel}</strong>
            {' '}·{' '}
            <strong style={{ color: '#F0E8C0' }}>{moveCount}</strong> mosse
          </span>
          <button onClick={() => startHanoi(hanoiState.gameLevel)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(120,180,60,0.3)', color: '#90C870', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.75rem' }}>
            ↺
          </button>
          <button onClick={exitToMenu}
            style={{ background: 'transparent', border: '1px solid rgba(120,180,60,0.2)', color: '#60A040', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.75rem' }}>
            ☰
          </button>
        </div>
      </div>

      {/* ── pan/zoom tree ── */}
      <PanZoom
        initialScale={initScale}
        minScale={0.15}
        maxScale={5}
        style={{ flex: 1, background: '#0D1F06' }}
      >
        <TreeRenderer
          root={tree}
          totalDiscs={hanoiState.totalDiscs}
          selectedNodeId={selectedNodeId}
          validTargetIds={validTargetIds}
          errorNodeId={errorNodeId}
          lastAddedNodeId={lastAddedNodeId}
          groundedCount={groundedCount}
          animatingDiscs={animatingDiscs}
          onNodeClick={handleNodeClick}
        />
      </PanZoom>

      {/* ── footer controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(120,180,60,0.2)',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ color: '#60A040', fontSize: '0.78rem' }}>+ Nodo:</span>
        <input
          type="number"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="chiave"
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(120,180,60,0.3)',
            borderRadius: 5, color: '#F0E8C0', padding: '4px 8px', fontSize: '0.8rem',
            width: 90, outline: 'none',
          }}
        />
        <button onClick={handleAdd}
          style={{
            background: 'rgba(40,100,20,0.45)', border: '1px solid rgba(90,160,40,0.4)',
            color: '#B8E098', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem',
          }}>
          Aggiungi
        </button>

        {addMsg && (
          <span style={{ fontSize: '0.78rem', color: addMsg.ok ? '#80DD60' : '#FF8080', fontStyle: 'italic' }}>
            {addMsg.text}
          </span>
        )}

        <button
          onClick={() => setShowInfo(v => !v)}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#60A040', cursor: 'pointer', fontSize: '1rem' }}
          title="Regole"
        >
          ℹ️
        </button>
      </div>

      {/* ── info panel ── */}
      {showInfo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
        }}
          onClick={() => setShowInfo(false)}>
          <div style={{
            background: '#1A3A0A', border: '1px solid rgba(120,200,60,0.3)',
            borderRadius: 12, padding: '24px 28px', maxWidth: 360, color: '#C0E0A0',
            fontSize: '0.84rem', lineHeight: 1.7,
          }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#F0E8C0', marginTop: 0 }}>Regole del gioco</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>Clicca un nodo con dischi per selezionare il disco in cima.</li>
              <li>Clicca un nodo destinazione per spostarlo.</li>
              <li>Non puoi mettere un disco grande su uno piccolo.</li>
              <li>Il percorso tra nodi non deve avere dischi più piccoli del tuo.</li>
              <li>Aggiungi nodi con la barra in basso — ma attenzione: il ribilanciamento AVL può cambiare tutto!</li>
              <li><strong style={{ color: '#F0E8C0' }}>Obiettivo</strong>: portare tutti i dischi alla radice.</li>
            </ul>
            <button onClick={() => setShowInfo(false)}
              style={{ marginTop: 16, background: 'rgba(80,160,40,0.3)', border: '1px solid rgba(100,180,50,0.4)', color: '#C0E0A0', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Pinch-to-zoom hint for touch devices */}
      {showPinchHint && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.72)',
          border: '1px solid rgba(120,200,60,0.35)',
          borderRadius: 24,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 200,
          pointerEvents: 'none',
          animation: 'hintFadeInOut 3.5s ease forwards',
          whiteSpace: 'nowrap',
        }}>
          <style>{`
            @keyframes hintFadeInOut {
              0%   { opacity: 0; transform: translateX(-50%) translateY(6px); }
              15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
              75%  { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <span style={{ fontSize: '1.4rem' }}>🤏</span>
          <span style={{ color: '#C0E8A0', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>
            Pizzica per zoomare · Trascina per spostarti
          </span>
        </div>
      )}

      <InterLevelModal />
    </div>
  );
};

export default HanoiGame;
