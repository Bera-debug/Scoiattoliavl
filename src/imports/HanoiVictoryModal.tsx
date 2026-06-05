import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTreeStore } from '../../store/useTreeStore';
import { useDiaryStore } from '../../store/useDiaryStore';

const HanoiVictoryModal: React.FC = () => {
  const { t } = useTranslation();
  const hanoiState    = useTreeStore(s => s.hanoiState);
  const gameStartTime = useTreeStore(s => s.gameStartTime);
  const startHanoi    = useTreeStore(s => s.startHanoi);
  const addSession    = useDiaryStore(s => s.addSession);
  const sessionLogged = useRef(false);

  const { gameLevel } = hanoiState;
  const isLastLevel = gameLevel >= 6;

  useEffect(() => {
    if (hanoiState.isWon && hanoiState.isActive && !sessionLogged.current) {
      sessionLogged.current = true;
      const endTime = Date.now();
      addSession({
        game: 'hanoi',
        category: 'profonda',
        level: gameLevel,
        startTime: gameStartTime,
        endTime,
        duration: endTime - gameStartTime,
        errors: 0,
        result: 'victory',
      });
    }
    if (!hanoiState.isWon) sessionLogged.current = false;
  }, [hanoiState.isWon, hanoiState.isActive, gameLevel, gameStartTime, addSession]);

  if (!hanoiState.isActive || !hanoiState.isWon) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(240,232,216,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #E8E0D0 100%)',
        border: '1px solid rgba(150,120,70,0.3)',
        borderRadius: 12,
        padding: '32px 40px',
        maxWidth: 420,
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '1.5rem',
          color: '#3D2A14',
          marginBottom: 12,
        }}>
          {t('games.hanoi.victoryTitle')}
        </h2>
        
        <p style={{
          fontSize: '0.95rem',
          color: '#5C4A32',
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          {t('games.hanoi.victoryMessage')}
        </p>
        
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}>
          {!isLastLevel ? (
            <button
              onClick={() => startHanoi(gameLevel + 1)}
              style={{
                background: 'rgba(58,107,66,0.15)',
                border: '1px solid rgba(58,107,66,0.3)',
                color: '#3A6B42',
                padding: '10px 20px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {t('games.hanoi.nextLevel')} →
            </button>
          ) : (
            <button
              onClick={() => startHanoi(1)}
              style={{
                background: 'rgba(58,107,66,0.15)',
                border: '1px solid rgba(58,107,66,0.3)',
                color: '#3A6B42',
                padding: '10px 20px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ↺ {t('games.chan.restart')}
            </button>
          )}
          
          <button
            onClick={() => startHanoi(gameLevel)}
            style={{
              background: 'rgba(150,120,70,0.1)',
              border: '1px solid rgba(150,120,70,0.25)',
              color: '#5C4A32',
              padding: '10px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {t('games.hanoi.repeat')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HanoiVictoryModal;
