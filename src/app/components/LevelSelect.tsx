import React, { useState } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { LEVELS } from '../../lib/levels';
import { useLang, t, T } from '../../lib/lang';

// ── Palette zen ────────────────────────────────────────────────────────────────
const Z = {
  bg:        '#F2EDE4',
  card:      '#FAFAF8',
  border:    'rgba(120, 95, 65, 0.18)',
  textPri:   '#2C2416',
  textSec:   '#7A6E5F',
  textMuted: '#A89880',
  accent:    '#8B7355',
  accentLt:  '#C4A882',
  line:      'rgba(120, 95, 65, 0.12)',
  btnBg:     'rgba(139, 115, 85, 0.10)',
  btnHov:    'rgba(139, 115, 85, 0.20)',
};

// ── Flag switcher ──────────────────────────────────────────────────────────────
const FlagSwitcher: React.FC = () => {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <button
        onClick={() => setLang('it')}
        title="Italiano"
        style={{
          background: lang === 'it' ? Z.btnHov : 'transparent',
          border: `1px solid ${lang === 'it' ? Z.accentLt : Z.border}`,
          borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
          fontSize: '1.1rem', lineHeight: 1, opacity: lang === 'it' ? 1 : 0.5,
          transition: 'all 0.18s',
        }}
      >🇮🇹</button>
      <button
        onClick={() => setLang('en')}
        title="English"
        style={{
          background: lang === 'en' ? Z.btnHov : 'transparent',
          border: `1px solid ${lang === 'en' ? Z.accentLt : Z.border}`,
          borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
          fontSize: '1.1rem', lineHeight: 1, opacity: lang === 'en' ? 1 : 0.5,
          transition: 'all 0.18s',
        }}
      >🇬🇧</button>
    </div>
  );
};

// ── Tutorial modal ─────────────────────────────────────────────────────────────
const TutorialModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLang();
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(44, 36, 22, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: Z.card, borderRadius: 16,
          border: `1px solid ${Z.border}`,
          padding: '36px 32px',
          maxWidth: 460, width: '100%',
          boxShadow: '0 20px 60px rgba(44,36,22,0.15)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: `1.5px solid ${Z.accentLt}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem',
          }}>🌳</div>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 6px', color: Z.textPri, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.25rem', letterSpacing: '0.02em' }}>
          {t(T.tutorialTitle, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: Z.textMuted, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.8rem', margin: '0 0 28px' }}>
          {t(T.tutorialSub, lang)}
        </p>

        <div style={{ borderTop: `1px solid ${Z.line}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {T.tutorialSteps.map((step) => (
            <div key={step.icon} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>{step.icon}</span>
              <div>
                <span style={{ color: Z.accent, fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                  {lang === 'it' ? step.titleIt : step.titleEn}
                </span>
                <span style={{ color: Z.textSec, fontSize: '0.8rem', lineHeight: 1.6 }}>
                  {lang === 'it' ? step.it : step.en}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: Z.btnBg, border: `1px solid ${Z.border}`,
              color: Z.accent, borderRadius: 8,
              padding: '10px 32px', cursor: 'pointer',
              fontFamily: 'Georgia, serif', fontSize: '0.82rem', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {t(T.tutorialBtn, lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── LevelSelect ────────────────────────────────────────────────────────────────
const LevelSelect: React.FC = () => {
  const startHanoi = useTreeStore(s => s.startHanoi);
  const { lang }   = useLang();
  const [tutorial, setTutorial] = useState(false);
  const [hovered, setHovered]   = useState<number | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: Z.bg,
      fontFamily: 'Georgia, serif',
      color: Z.textPri,
    }}>

      {/* ── hero ── */}
      <div style={{ paddingTop: 56, paddingBottom: 36, textAlign: 'center', borderBottom: `1px solid ${Z.line}`, position: 'relative' }}>

        {/* Flag switcher — top right */}
        <div style={{ position: 'absolute', top: 16, right: 20 }}>
          <FlagSwitcher />
        </div>

        {/* icon circle */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: `1.5px solid ${Z.accentLt}`,
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
          background: 'rgba(255,255,255,0.6)',
        }}>
          🌳
        </div>

        <h1 style={{
          margin: '0 0 6px',
          fontSize: '1.9rem',
          fontWeight: 400,
          letterSpacing: '0.03em',
          color: Z.textPri,
        }}>
          L'Albero di Hanoi
        </h1>

        <p style={{
          margin: '0 0 20px',
          fontSize: '0.82rem',
          color: Z.textMuted,
          fontStyle: 'italic',
          letterSpacing: '0.08em',
        }}>
          {t(T.subtitle, lang)}
        </p>

        <p style={{
          margin: '0 auto 28px',
          maxWidth: 380,
          padding: '0 16px',
          fontSize: '0.82rem',
          color: Z.textSec,
          lineHeight: 1.8,
        }}>
          {t(T.description, lang)}
        </p>

        <button
          onClick={() => setTutorial(true)}
          style={{
            background: 'transparent',
            border: `1px solid ${Z.border}`,
            color: Z.accent,
            borderRadius: 8,
            padding: '9px 26px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = Z.btnHov)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {t(T.instructionsBtn, lang)}
        </button>
      </div>

      {/* ── divider label ── */}
      <div style={{
        textAlign: 'center',
        padding: '28px 16px 16px',
        fontSize: '0.68rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: Z.textMuted,
      }}>
        {t(T.chooseLevel, lang)}
      </div>

      {/* ── level grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
        gap: 12,
        padding: '0 20px 48px',
        maxWidth: 560,
        margin: '0 auto',
      }}>
        {LEVELS.map((_, i) => {
          const meta  = T.levels[i] ?? T.levels[T.levels.length - 1];
          const cfg   = LEVELS[i];
          const isHov = hovered === i;
          const name  = lang === 'it' ? meta.it : meta.en;
          const desc  = lang === 'it' ? meta.descIt : meta.descEn;
          return (
            <button
              key={i}
              onClick={() => startHanoi(i + 1)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? '#FFFFFF' : Z.card,
                border: `1px solid ${isHov ? Z.accentLt : Z.border}`,
                borderRadius: 12,
                padding: '20px 12px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                boxShadow: isHov ? '0 8px 24px rgba(44,36,22,0.10)' : '0 2px 8px rgba(44,36,22,0.04)',
                transform: isHov ? 'translateY(-2px)' : 'none',
                fontFamily: 'Georgia, serif',
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 400, color: isHov ? Z.accent : Z.textPri, lineHeight: 1, transition: 'color 0.2s' }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: Z.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {name}
              </span>
              <div style={{ width: 28, height: 1, background: Z.line, margin: '2px 0' }} />
              <span style={{ fontSize: '0.68rem', color: Z.textSec, lineHeight: 1.4, textAlign: 'center', fontStyle: 'italic' }}>
                {desc}
              </span>
              <span style={{ fontSize: '0.72rem', color: Z.textMuted, marginTop: 2 }}>
                {t(T.squirrels, lang)(cfg.totalDiscs)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── footer ── */}
      <div style={{
        borderTop: `1px solid ${Z.line}`,
        padding: '20px 16px',
        textAlign: 'center',
        fontSize: '0.65rem',
        color: Z.textMuted,
        letterSpacing: '0.06em',
      }}>
        {t(T.footer, lang)}
      </div>

      {tutorial && <TutorialModal onClose={() => setTutorial(false)} />}
    </div>
  );
};

export default LevelSelect;
