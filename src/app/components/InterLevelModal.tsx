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

  if (!isActive || !isWon) return null;

  const duration  = Math.round((Date.now() - gameStartTime) / 1000);
  const minutes   = Math.floor(duration / 60);
  const seconds   = duration % 60;
  const timeStr   = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,10,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #1A3A0A 0%, #2D5A18 100%)',
        border: '1px solid rgba(140,200,80,0.35)',
        borderRadius: 14,
        padding: '28px 32px',
        maxWidth: 380,
        width: '90vw',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* trophy + title */}
        <div style={{ fontSize: '2.8rem', marginBottom: 6 }}>🏆🐿️</div>
        <h2 style={{ fontSize: '1.5rem', color: '#F5E8C0', fontStyle: 'italic', margin: '0 0 4px' }}>
          Livello {gameLevel} completato!
        </h2>
        <p style={{ color: '#A8C890', fontSize: '0.88rem', margin: '0 0 16px' }}>
          {totalDiscs} scoiattoli portati a terra in salvo! 🌱
        </p>

        {/* stats */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center',
          marginBottom: 20, color: '#C8E8A0', fontSize: '0.84rem',
        }}>
          <span>⏱ {timeStr}</span>
          <span>🔄 {moveCount} mosse</span>
        </div>

        {/* ── AD SLOT ────────────────────────────────────────────────── */}
        {/* Replace the content of this div with Google AdSense code:   */}
        {/* <ins className="adsbygoogle"                                 */}
        {/*   style={{display:'block'}}                                  */}
        {/*   data-ad-client="ca-pub-XXXXXXXXXXXXXXXXXX"                 */}
        {/*   data-ad-slot="XXXXXXXXXX"                                  */}
        {/*   data-ad-format="auto" data-full-width-responsive="true">   */}
        {/* </ins>                                                        */}
        <div style={{
          width: '100%', maxWidth: 320, height: 100,
          margin: '0 auto 20px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px dashed rgba(140,200,80,0.3)',
          borderRadius: 6,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(150,200,120,0.5)',
          fontSize: '0.75rem',
          gap: 4,
        }}>
          <span style={{ fontSize: '1.2rem' }}>📢</span>
          <span>Spazio pubblicitario</span>
          <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>300×100 banner</span>
        </div>

        {/* buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isLastLevel ? (
            <button
              disabled={countdown > 0}
              onClick={() => startHanoi(gameLevel + 1)}
              style={{
                background: countdown > 0 ? 'rgba(50,100,30,0.3)' : 'rgba(60,130,30,0.5)',
                border: '1px solid rgba(100,180,50,0.4)',
                color: countdown > 0 ? '#7AAA60' : '#C8F080',
                padding: '10px 20px',
                borderRadius: 7, cursor: countdown > 0 ? 'default' : 'pointer',
                fontSize: '0.88rem', fontWeight: 600,
                transition: 'all 0.3s',
              }}
            >
              {countdown > 0 ? `Livello ${gameLevel + 1} (${countdown}s)` : `Livello ${gameLevel + 1} →`}
            </button>
          ) : (
            <button
              onClick={exitToMenu}
              style={{
                background: 'rgba(60,130,30,0.5)',
                border: '1px solid rgba(100,180,50,0.4)',
                color: '#C8F080', padding: '10px 20px',
                borderRadius: 7, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              }}
            >
              🎉 Hai completato tutti i livelli!
            </button>
          )}

          <button
            onClick={() => startHanoi(gameLevel)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(140,200,80,0.25)',
              color: '#A0C880', padding: '10px 16px',
              borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem',
            }}
          >
            ↺ Riprova
          </button>
        </div>

        {/* copyright/IP notice */}
        <p style={{ marginTop: 20, fontSize: '0.65rem', color: 'rgba(140,180,100,0.4)' }}>
          © 2025 AVL Hanoi – Tutti i diritti riservati.<br />
          Il software è protetto da copyright. Marchio in registrazione.
        </p>
      </div>
    </div>
  );
};

export default InterLevelModal;
