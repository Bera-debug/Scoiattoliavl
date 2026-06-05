import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PanZoom: React.FC<Props> = ({
  children,
  initialScale = 1,
  minScale = 0.2,
  maxScale = 4,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale]   = useState(initialScale);
  const [pan,   setPan]     = useState({ x: 0, y: 0 });

  // track drag state across renders without re-render
  const drag = useRef<{ active: boolean; startX: number; startY: number; panX: number; panY: number }>({
    active: false, startX: 0, startY: 0, panX: 0, panY: 0,
  });

  // track pinch state
  const pinch = useRef<{ active: boolean; dist: number; scale: number }>({
    active: false, dist: 0, scale: 1,
  });

  // ── mouse: drag ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current.active) return;
    setPan({
      x: drag.current.panX + (e.clientX - drag.current.startX),
      y: drag.current.panY + (e.clientY - drag.current.startY),
    });
  }, []);

  const onMouseUp = useCallback(() => { drag.current.active = false; }, []);

  // ── mouse: wheel zoom ────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect  = container.getBoundingClientRect();
    const ox    = e.clientX - rect.left; // cursor offset in container
    const oy    = e.clientY - rect.top;

    setScale(prev => {
      const factor = e.deltaY < 0 ? 1.12 : 0.88;
      const next   = Math.min(maxScale, Math.max(minScale, prev * factor));
      // Adjust pan so the zoom is centered on the cursor
      setPan(p => ({
        x: ox - (ox - p.x) * (next / prev),
        y: oy - (oy - p.y) * (next / prev),
      }));
      return next;
    });
  }, [maxScale, minScale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── touch: pan & pinch ───────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      drag.current = { active: true, startX: t.clientX, startY: t.clientY, panX: pan.x, panY: pan.y };
      pinch.current.active = false;
    } else if (e.touches.length === 2) {
      drag.current.active  = false;
      const d = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
      pinch.current = { active: true, dist: d, scale };
    }
  }, [pan, scale]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && drag.current.active) {
      const t = e.touches[0];
      setPan({
        x: drag.current.panX + (t.clientX - drag.current.startX),
        y: drag.current.panY + (t.clientY - drag.current.startY),
      });
    } else if (e.touches.length === 2 && pinch.current.active) {
      const d    = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
      const next = Math.min(maxScale, Math.max(minScale, pinch.current.scale * (d / pinch.current.dist)));
      setScale(next);
    }
  }, [maxScale, minScale]);

  const onTouchEnd = useCallback(() => {
    drag.current.active  = false;
    pinch.current.active = false;
  }, []);

  // ── reset button ─────────────────────────────────────────────────────────
  const reset = () => { setScale(initialScale); setPan({ x: 0, y: 0 }); };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: 'hidden', position: 'relative', touchAction: 'none', userSelect: 'none', cursor: drag.current.active ? 'grabbing' : 'grab', ...style }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${scale})`, transformOrigin: '0 0', willChange: 'transform' }}>
        {children}
      </div>

      {/* Reset zoom button */}
      <button
        onClick={reset}
        style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: '0.75rem',
          cursor: 'pointer', zIndex: 10,
        }}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        ⟳ Reset
      </button>
    </div>
  );
};

export default PanZoom;
