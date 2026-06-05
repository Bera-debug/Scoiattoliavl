import React from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { LEVELS } from '../../lib/levels';

const DIFF = [
  { label: 'Intro',     color: '#4CAF50' },
  { label: 'Facile',    color: '#66BB6A' },
  { label: 'Normale',   color: '#FF9800' },
  { label: 'Difficile', color: '#EF5350' },
  { label: 'Difficile', color: '#E53935' },
  { label: 'Esperto',   color: '#AB47BC' },
  { label: 'Maestro',   color: '#7B1FA2' },
];

const LevelSelect: React.FC = () => {
  const startHanoi = useTreeStore(s => s.startHanoi);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(175deg, #0D2206 0%, #1A3A0A 50%, #0D2206 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'Georgia, serif',
    }}>
      {/* header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: '3rem', marginBottom: 6 }}>🐿️🌳</div>
        <h1 style={{ fontSize: '2rem', color: '#F0E8C0', fontStyle: 'italic', margin: '0 0 8px', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
          Scoiattoli AVL
        </h1>
        <p style={{ color: '#88B868', fontSize: '0.9rem', maxWidth: 460, lineHeight: 1.7, margin: '0 auto' }}>
          Fai scendere tutti gli <strong style={{ color: '#F0E8C0' }}>scoiattoli</strong> a terra passando di ramo in ramo.<br />
          Uno scoiattolo grosso non può scavalcarne uno più piccolo lungo il percorso!
        </p>
      </div>

      {/* rule summary */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,180,60,0.2)',
        borderRadius: 10, padding: '14px 20px', marginBottom: 32,
        maxWidth: 480, width: '100%', color: '#A0C880', fontSize: '0.82rem', lineHeight: 1.7,
      }}>
        🐿️ Sposta solo lo scoiattolo in cima. Scoiattoli più piccoli lungo il percorso bloccano il movimento.
        Uno scoiattolo grosso non può sedersi sopra uno piccolo. Usa lo scroll/pizzica per zoomare.
      </div>

      {/* level grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        maxWidth: 560,
        width: '100%',
      }}>
        {LEVELS.map((cfg, i) => {
          const d = DIFF[i] ?? DIFF[DIFF.length - 1];
          return (
            <button
              key={i}
              onClick={() => startHanoi(i + 1)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(120,180,60,0.25)',
                borderRadius: 10, padding: '16px 10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'background 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.13)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F0E8C0' }}>{i + 1}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
              <span style={{ fontSize: '0.78rem', color: '#88B868', lineHeight: 1.4, textAlign: 'center' }}>
                {cfg.totalDiscs} 🐿️<br />
                {cfg.insertOrder.length} nodi · prof.{' '}
                {cfg.insertOrder.length <= 3 ? 2 : cfg.insertOrder.length <= 7 ? 3 : 4}
              </span>
            </button>
          );
        })}
      </div>

      {/* footer copyright */}
      <p style={{ marginTop: 40, color: 'rgba(100,150,70,0.35)', fontSize: '0.68rem', textAlign: 'center' }}>
        © 2025 AVL Hanoi – Tutti i diritti riservati. Marchio in registrazione.<br />
        Riproduzione non autorizzata vietata.
      </p>
    </div>
  );
};

export default LevelSelect;
