import React, { useRef, useEffect, useCallback } from 'react';

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
  maxScale = 6,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);

  const state = useRef({ x: 0, y: 0, scale: initialScale });
  const drag  = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 });
  const pinch = useRef({ active: false, dist: 0, baseScale: initialScale, mx: 0, my: 0 });

  const applyTransform = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const { x, y, scale } = state.current;
    el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }, []);

  const clampScale = (s: number) => Math.min(maxScale, Math.max(minScale, s));

  // ── Wheel zoom ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect   = container.getBoundingClientRect();
      const ox     = e.clientX - rect.left;
      const oy     = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.88;
      const prev   = state.current.scale;
      const next   = clampScale(prev * factor);
      const ratio  = next / prev;

      state.current = {
        scale: next,
        x: ox - (ox - state.current.x) * ratio,
        y: oy - (oy - state.current.y) * ratio,
      };
      applyTransform();
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [minScale, maxScale, applyTransform]);

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onDown = (e: MouseEvent) => {
      // Only drag with left button, not on interactive elements
      if (e.button !== 0) return;
      const target = e.target as Element;
      if (target.closest('button')) return;

      drag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        ox: state.current.x,
        oy: state.current.y,
      };
      container.style.cursor = 'grabbing';
    };

    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      e.preventDefault();
      state.current = {
        ...state.current,
        x: drag.current.ox + (e.clientX - drag.current.startX),
        y: drag.current.oy + (e.clientY - drag.current.startY),
      };
      applyTransform();
    };

    const onUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [applyTransform]);

  // ── Touch: pan & pinch ──────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getDist = (t: TouchList) =>
      Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);

    const getMid = (t: TouchList, rect: DOMRect) => ({
      x: (t[0].clientX + t[1].clientX) / 2 - rect.left,
      y: (t[0].clientY + t[1].clientY) / 2 - rect.top,
    });

    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        drag.current  = { active: true, startX: t.clientX, startY: t.clientY, ox: state.current.x, oy: state.current.y };
        pinch.current.active = false;
      } else if (e.touches.length >= 2) {
        drag.current.active  = false;
        const mid = getMid(e.touches, rect);
        pinch.current = { active: true, dist: getDist(e.touches), baseScale: state.current.scale, mx: mid.x, my: mid.y };
      }
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && drag.current.active) {
        const t = e.touches[0];
        state.current = {
          ...state.current,
          x: drag.current.ox + (t.clientX - drag.current.startX),
          y: drag.current.oy + (t.clientY - drag.current.startY),
        };
        applyTransform();
      } else if (e.touches.length >= 2 && pinch.current.active) {
        const rect    = container.getBoundingClientRect();
        const dist    = getDist(e.touches);
        const next    = clampScale(pinch.current.baseScale * (dist / pinch.current.dist));
        const ratio   = next / state.current.scale;
        const { mx, my } = pinch.current;
        state.current = {
          scale: next,
          x: mx - (mx - state.current.x) * ratio,
          y: my - (my - state.current.y) * ratio,
        };
        applyTransform();
      }
    };

    const onEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        drag.current.active  = false;
        pinch.current.active = false;
      } else if (e.touches.length === 1) {
        pinch.current.active = false;
        const t = e.touches[0];
        drag.current = { active: true, startX: t.clientX, startY: t.clientY, ox: state.current.x, oy: state.current.y };
      }
    };

    container.addEventListener('touchstart', onStart, { passive: false });
    container.addEventListener('touchmove',  onMove,  { passive: false });
    container.addEventListener('touchend',   onEnd,   { passive: false });
    container.addEventListener('touchcancel',onEnd,   { passive: false });
    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove',  onMove);
      container.removeEventListener('touchend',   onEnd);
      container.removeEventListener('touchcancel',onEnd);
    };
  }, [minScale, maxScale, applyTransform]);

  const reset = () => {
    state.current = { x: 0, y: 0, scale: initialScale };
    applyTransform();
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab',
        ...style,
      }}
    >
      <div
        ref={innerRef}
        style={{
          transform: `translate(0px, 0px) scale(${initialScale})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={reset}
        style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: '0.75rem',
          cursor: 'pointer', zIndex: 10, touchAction: 'manipulation',
        }}
      >
        ⟳ Reset
      </button>
    </div>
  );
};

export default PanZoom;
