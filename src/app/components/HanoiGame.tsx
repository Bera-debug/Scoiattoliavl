import React, { useState, useEffect, useRef } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { findById } from '../../lib/avl';
import { useLang, t, T } from '../../lib/lang';
import TreeRenderer from './TreeRenderer';
import PanZoom from './PanZoom';
import InterLevelModal from './InterLevelModal';

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// ── Inline flag switcher ───────────────────────────────────────────────────────
const FlagSwitcher: React.FC = () => {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button onClick={() => setLang('it')} title="Italiano"
        style={{ background: lang === 'it' ? 'rgba(255,255,255,0.15)' : 'transparent', border: '1px solid rgba(160,140,100,0.25)', borderRadius: 5, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1, opacity: lang === 'it' ? 1 : 0.45 }}>
        🇮🇹
      </button>
      <button onClick={() => setLang('en')} title="English"
        style={{ background: lang === 'en' ? 'rgba(255,255,255,0.15)' : 'transparent', border: '1px solid rgba(160,140,100,0.25)', borderRadius: 5, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1, opacity: lang === 'en' ? 1 : 0.45 }}>
        🇬🇧
      </button>
    </div>
  );
};

// ── HanoiGame ─────────────────────────────────────────────────────────────────
const HanoiGame: React.FC = () => {
  const {
    tree, hanoiState, selectedNodeId, validTargetIds,
    errorNodeId, lastAddedNodeId, moveCount, groundedCount, animatingDiscs,
    startHanoi, selectNode, clearSelection, moveDisc, addNode, exitToMenu,
  } = useTreeStore();

  const { lang } = useLang();

  const [keyInput, setKeyInput]     = useState('');
  const [addMsg,   setAddMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [showInfo, setShowInfo]     = useState(false);
  const [showPinchHint, setShowPinchHint] = useState(false);
  const hintShownRef = useRef(false);

  // Misura il container per il sizing dinamico
  const treeAreaRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = treeAreaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pinch hint (touch only)
  useEffect(() => {
    if (!isTouchDevice || hintShownRef.current) return;
    if (!hanoiState.isActive || hanoiState.isWon) return;
    hintShownRef.current = true;
    setShowPinchHint(true);
    const timer = setTimeout(() => setShowPinchHint(false), 3500);
    return () => clearTimeout(timer);
  }, [hanoiState.isActive, hanoiState.gameLevel]);

  useEffect(() => { hintShownRef.current = false; }, [hanoiState.gameLevel]);

  const handleNodeClick = (nodeId: string) => {
    if (!hanoiState.isActive || hanoiState.isWon) return;
    if (selectedNodeId === nodeId) { clearSelection(); return; }
    if (selectedNodeId) { moveDisc(nodeId); return; }
    selectNode(nodeId);
  };

  const handleAdd = () => {
    const k = parseInt(keyInput.trim(), 10);
    if (isNaN(k) || k < 1 || k > 200) {
      setAddMsg({ text: t(T.addMsgInvalid, lang), ok: false });
      setTimeout(() => setAddMsg(null), 2000);
      return;
    }
    const res = addNode(k);
    if (res.success) {
      setAddMsg({ text: t(T.addMsgOk, lang)(k), ok: true });
      setKeyInput('');
    } else {
      setAddMsg({ text: res.reason === 'exists' ? t(T.addMsgExists, lang)(k) : t(T.addMsgError, lang), ok: false });
    }
    setTimeout(() => setAddMsg(null), 2500);
  };

  const selectedNode = tree && selectedNodeId ? findById(tree, selectedNodeId) : null;
  const topDisc      = selectedNode?.discs[selectedNode.discs.length - 1] ?? null;

  const statusText = hanoiState.isWon
    ? t(T.statusWon, lang)
    : topDisc
    ? t(T.statusSel, lang)(topDisc)
    : t(T.statusIdle, lang);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#C8BCA8', fontFamily: 'Georgia, serif' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 14px',
        background: 'rgba(44,34,20,0.90)',
        borderBottom: '1px solid rgba(160,140,100,0.28)',
        flexShrink: 0, gap: 8, flexWrap: 'wrap',
      }}>
        {/* Left: title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>🌳</span>
          <span style={{ fontSize: '0.88rem', color: '#D4C8A8', fontStyle: 'italic', letterSpacing: '0.04em' }}>
            {t(T.gameTitle, lang)}
          </span>
        </div>

        {/* Center: status */}
        <div style={{
          flex: 1, minWidth: 140, textAlign: 'center',
          background: 'rgba(20,14,6,0.50)',
          border: '1px solid rgba(160,140,100,0.20)',
          borderRadius: 12, padding: '3px 10px',
          color: topDisc ? '#D4B870' : '#A89878', fontSize: '0.73rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {statusText}
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FlagSwitcher />
          <span style={{ color: '#9A8A6A', fontSize: '0.73rem' }}>
            <strong style={{ color: '#D4C8A8' }}>L{hanoiState.gameLevel}</strong>
            {' · '}
            <strong style={{ color: '#D4C8A8' }}>{moveCount}</strong>
            {' '}{t(T.moves, lang)}
          </span>
          <button onClick={() => startHanoi(hanoiState.gameLevel)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(160,140,100,0.25)', color: '#C4B890', padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontSize: '0.72rem' }}>
            ↺
          </button>
          <button onClick={exitToMenu}
            style={{ background: 'transparent', border: '1px solid rgba(160,140,100,0.18)', color: '#9A8A6A', padding: '3px 9px', borderRadius: 5, cursor: 'pointer', fontSize: '0.72rem' }}>
            ☰
          </button>
        </div>
      </div>

      {/* ── Tree area ── */}
      <div ref={treeAreaRef} style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        <PanZoom
          initialScale={1} minScale={0.15} maxScale={8}
          style={{ width: '100%', height: '100%', background: '#C8BCA8', touchAction: 'none' }}
        >
          <TreeRenderer
            root={tree}
            totalDiscs={hanoiState.totalDiscs}
            containerW={containerSize.w}
            containerH={containerSize.h}
            selectedNodeId={selectedNodeId}
            validTargetIds={validTargetIds}
            errorNodeId={errorNodeId}
            lastAddedNodeId={lastAddedNodeId}
            groundedCount={groundedCount}
            animatingDiscs={animatingDiscs}
            onNodeClick={handleNodeClick}
          />
        </PanZoom>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px',
        background: 'rgba(44,34,20,0.90)',
        borderTop: '1px solid rgba(160,140,100,0.22)',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ color: '#9A8A6A', fontSize: '0.74rem' }}>{t(T.addNode, lang)}:</span>
        <input
          type="number" value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={t(T.addPlaceholder, lang)}
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(160,140,100,0.26)',
            borderRadius: 5, color: '#D4C8A8', padding: '4px 8px', fontSize: '0.76rem',
            width: 76, outline: 'none', fontFamily: 'Georgia, serif',
          }}
        />
        <button onClick={handleAdd}
          style={{
            background: 'rgba(100,80,40,0.32)', border: '1px solid rgba(160,140,100,0.32)',
            color: '#C4B890', padding: '4px 12px', borderRadius: 5, cursor: 'pointer',
            fontSize: '0.74rem', fontFamily: 'Georgia, serif',
          }}>
          {t(T.addBtn, lang)}
        </button>

        {addMsg && (
          <span style={{ fontSize: '0.73rem', color: addMsg.ok ? '#A0B880' : '#C08060', fontStyle: 'italic' }}>
            {addMsg.text}
          </span>
        )}

        <button onClick={() => setShowInfo(v => !v)}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#9A8A6A', cursor: 'pointer', fontSize: '1rem' }}
          title={t(T.rulesTitle, lang)}>
          ℹ️
        </button>
      </div>

      {/* ── Info panel ── */}
      {showInfo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(44,34,20,0.62)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 24 }}
          onClick={() => setShowInfo(false)}>
          <div
            style={{ background: '#F2EDE4', border: '1px solid rgba(139,115,85,0.20)', borderRadius: 14, padding: '28px 30px', maxWidth: 360, width: '100%', color: '#4A3828', fontSize: '0.81rem', lineHeight: 1.75, boxShadow: '0 16px 48px rgba(44,34,20,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#2C2416', marginTop: 0, fontWeight: 400, fontSize: '1.05rem', letterSpacing: '0.02em', fontFamily: 'Georgia,serif' }}>
              {t(T.rulesTitle, lang)}
            </h3>
            <ul style={{ paddingLeft: 18, margin: 0, color: '#6A5840' }}>
              {T.rules.map((r, i) => (
                <li key={i} style={i === T.rules.length - 1 ? { color: '#4A3828', fontStyle: 'italic' } : {}}>
                  {lang === 'it' ? r.it : r.en}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowInfo(false)}
              style={{ marginTop: 18, background: 'rgba(139,115,85,0.10)', border: '1px solid rgba(139,115,85,0.22)', color: '#8B7355', padding: '8px 22px', borderRadius: 7, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t(T.closeBtn, lang)}
            </button>
          </div>
        </div>
      )}

      {/* ── Pinch hint ── */}
      {showPinchHint && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(44,34,20,0.80)', border: '1px solid rgba(160,140,100,0.30)',
          borderRadius: 20, padding: '9px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 200, pointerEvents: 'none',
          animation: 'hintFade 3.5s ease forwards', whiteSpace: 'nowrap',
        }}>
          <style>{`@keyframes hintFade{0%{opacity:0;transform:translateX(-50%) translateY(6px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}75%{opacity:1}100%{opacity:0}}`}</style>
          <span style={{ fontSize: '1.3rem' }}>🤏</span>
          <span style={{ color: '#D4C8A8', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>
            {lang === 'it'
              ? 'Pizzica per zoomare · Trascina per spostarti'
              : 'Pinch to zoom · Drag to pan'}
          </span>
        </div>
      )}

      <InterLevelModal />
    </div>
  );
};

export default HanoiGame;
