/**
 * InterLevelModal – victory screen with advertising slot.
 *
 * MONETIZZAZIONE:
 *   1. Registrarsi su Google AdSense (adsense.google.com)
 *   2. Aggiungere lo script AdSense nell'HTML principale
 *   3. Sostituire il div "ad-placeholder" con il codice <ins class="adsbygoogle" …>
 *
 * PROPRIETÀ INTELLETTUALE:
 *   - Il software è protetto da copyright automatico al momento della scrittura.
 *   - Registrare il nome del gioco come marchio (UIBM per l'Italia, EUIPO per l'Europa).
 *   - Aggiungere Termini di Servizio e Privacy Policy (obbligatoria per AdSense).
 *
 * Copyright © 2025 – Tutti i diritti riservati.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { useDiaryStore } from '../../store/useDiaryStore';
import { useLang } from '../../lib/lang';

const AD_WAIT_SEC = 5; // seconds before Next Level button is active

const InterLevelModal: React.FC = () => {
  const hanoiState    = useTreeStore(s => s.hanoiState);
  const gameStartTime = useTreeStore(s => s.gameStartTime);
  const moveCount     = useTreeStore(s => s.moveCount);
  const startHanoi    = useTreeStore(s => s.startHanoi);
  const exitToMenu    = useTreeStore(s => s.exitToMenu);
  const addSession    = useDiaryStore(s => s.addSession);

  const sessionLogged = useRef(false);
  const [countdown, setCountdown] = useState(AD_WAIT_SEC);

  const { isActive, isWon, gameLevel, totalDiscs } = hanoiState;
  const isLastLevel = gameLevel >= 7;

  // Log session once per victory
  useEffect(() => {
    if (isWon && isActive && !sessionLogged.current) {
      sessionLogged.current = true;
      const endTime = Date.now();
      addSession({
        game: 'avl-hanoi',
        category: 'avl',
        level: gameLevel,
        startTime: gameStartTime,
        endTime,
        duration: endTime - gameStartTime,
        errors: 0,
        result: 'victory',
      });
    }
    if (!isWon) { sessionLogged.current = false; setCountdown(AD_WAIT_SEC); }
  }, [isWon, isActive, gameLevel, gameStartTime, addSession]);

  // Countdown timer
  useEffect(() => {
    if (!isWon) return;
    setCountdown(AD_WAIT_SEC);
    const t = setInterval(() => {
      setCountdown(c => (c <= 1 ? (clearInterval(t), 0) : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [isWon]);

  const { lang } = useLang();

  if (!isActive || !isWon) return null;

  const duration = Math.round((Date.now() - gameStartTime) / 1000);
  const minutes  = Math.floor(duration / 60);
  const seconds  = duration % 60;
  const timeStr  = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const it = lang === 'it';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(44,34,20,0.72)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Georgia, serif',
      padding: 24,
    }}>
      <div style={{
        background: '#F5F0E8',
        border: '1px solid rgba(139,115,85,0.25)',
        borderRadius: 16,
        padding: '32px 32px 24px',
        maxWidth: 380, width: '100%',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(44,34,20,0.25)',
      }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🏆🐿️</div>

        <h2 style={{ fontSize: '1.35rem', color: '#2C2416', fontStyle: 'italic', fontWeight: 400, margin: '0 0 4px', letterSpacing: '0.02em' }}>
          {it ? `Livello ${gameLevel} completato!` : `Level ${gameLevel} complete!`}
        </h2>
        <p style={{ color: '#7A6E5F', fontSize: '0.84rem', margin: '0 0 18px' }}>
          {it
            ? `${totalDiscs} scoiattoli portati a terra in salvo 🌱`
            : `${totalDiscs} squirrels safely on the ground 🌱`}
        </p>

        {/* stats */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 20, color: '#8B7355', fontSize: '0.82rem' }}>
          <span>⏱ {timeStr}</span>
          <span>🔄 {moveCount} {it ? 'mosse' : 'moves'}</span>
        </div>

        {/* AD SLOT — replace with AdSense ins tag */}
        <div style={{
          width: '100%', maxWidth: 320, height: 90,
          margin: '0 auto 22px',
          background: 'rgba(139,115,85,0.06)',
          border: '1px dashed rgba(139,115,85,0.25)',
          borderRadius: 6,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(139,115,85,0.45)', fontSize: '0.72rem', gap: 3,
        }}>
          <span style={{ fontSize: '1rem' }}>📢</span>
          <span>{it ? 'Spazio pubblicitario' : 'Ad space'}</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>300×90 banner</span>
        </div>

        {/* buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isLastLevel ? (
            <button
              disabled={countdown > 0}
              onClick={() => startHanoi(gameLevel + 1)}
              style={{
                background: countdown > 0 ? 'rgba(139,115,85,0.10)' : 'rgba(139,115,85,0.18)',
                border: '1px solid rgba(139,115,85,0.30)',
                color: countdown > 0 ? '#A89878' : '#5A3E20',
                padding: '10px 20px', borderRadius: 8,
                cursor: countdown > 0 ? 'default' : 'pointer',
                fontSize: '0.84rem', fontFamily: 'Georgia, serif',
                transition: 'all 0.25s', letterSpacing: '0.02em',
              }}
            >
              {countdown > 0
                ? (it ? `Livello ${gameLevel + 1} (${countdown}s)` : `Level ${gameLevel + 1} (${countdown}s)`)
                : (it ? `Livello ${gameLevel + 1} →` : `Level ${gameLevel + 1} →`)}
            </button>
          ) : (
            <button onClick={exitToMenu}
              style={{ background: 'rgba(139,115,85,0.18)', border: '1px solid rgba(139,115,85,0.30)', color: '#5A3E20', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'Georgia, serif' }}>
              {it ? '🎉 Tutti i livelli completati!' : '🎉 All levels complete!'}
            </button>
          )}
          <button onClick={() => startHanoi(gameLevel)}
            style={{ background: 'transparent', border: '1px solid rgba(139,115,85,0.20)', color: '#8B7355', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.80rem', fontFamily: 'Georgia, serif' }}>
            ↺ {it ? 'Riprova' : 'Retry'}
          </button>
        </div>

        <p style={{ marginTop: 18, fontSize: '0.62rem', color: 'rgba(139,115,85,0.35)', letterSpacing: '0.04em' }}>
          © 2025 AVL Hanoi · {it ? 'Tutti i diritti riservati' : 'All rights reserved'}
        </p>
      </div>
    </div>
  );
};

export default InterLevelModal;
