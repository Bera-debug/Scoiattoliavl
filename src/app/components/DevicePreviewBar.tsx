import React, { useState, useRef, useCallback } from 'react';

type Device = 'desktop' | 'mobile';

interface Props {
  children: React.ReactNode;
}

const DevicePreviewBar: React.FC<Props> = ({ children }) => {
  const [device, setDevice] = useState<Device>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Sync fullscreen state if user exits via Esc key
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: device === 'mobile' ? '#1a1a2e' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Barra toggle */}
      <div style={{
        position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        background: 'rgba(0,0,0,0.75)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 4,
        gap: 4,
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={() => setDevice('desktop')}
          style={{
            background: device === 'desktop' ? 'rgba(100,200,60,0.35)' : 'transparent',
            border: device === 'desktop' ? '1px solid rgba(100,200,60,0.5)' : '1px solid transparent',
            color: device === 'desktop' ? '#C0F080' : '#888',
            borderRadius: 16, padding: '5px 14px',
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Georgia, serif',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s',
          }}
        >
          🖥️ Desktop
        </button>
        <button
          onClick={() => setDevice('mobile')}
          style={{
            background: device === 'mobile' ? 'rgba(100,200,60,0.35)' : 'transparent',
            border: device === 'mobile' ? '1px solid rgba(100,200,60,0.5)' : '1px solid transparent',
            color: device === 'mobile' ? '#C0F080' : '#888',
            borderRadius: 16, padding: '5px 14px',
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Georgia, serif',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s',
          }}
        >
          📱 Mobile
        </button>

        {/* Bottone schermo intero — solo in mobile */}
        {device === 'mobile' && (
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
            style={{
              background: isFullscreen ? 'rgba(255,180,0,0.25)' : 'transparent',
              border: isFullscreen ? '1px solid rgba(255,180,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: isFullscreen ? '#FFD060' : '#aaa',
              borderRadius: 16, padding: '5px 12px',
              cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.2s',
            }}
          >
            {isFullscreen ? '⊠' : '⛶'}
          </button>
        )}
      </div>

      {/* Contenuto */}
      <div
        ref={containerRef}
        data-device-scroll=""
        style={{
          width: device === 'mobile' ? 390 : '100%',
          height: device === 'mobile' ? `calc(100vh - 44px)` : '100vh',
          marginTop: device === 'mobile' ? 44 : 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          boxShadow: device === 'mobile' ? '0 0 40px rgba(0,0,0,0.8)' : 'none',
          borderRadius: device === 'mobile' && !isFullscreen ? 12 : 0,
          transition: 'width 0.3s ease',
          position: 'relative',
          background: '#0D1F06',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DevicePreviewBar;
