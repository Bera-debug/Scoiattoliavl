import React, { createContext, useContext, useState } from 'react';

export type Lang = 'it' | 'en';

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const Ctx = createContext<LangCtx>({ lang: 'it', setLang: () => {} });

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('it');
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
};

export const useLang = () => useContext(Ctx);

// ── All strings ───────────────────────────────────────────────────────────────
export const T = {
  // LevelSelect
  subtitle: {
    it: 'Equilibrio · Pazienza · Armonia',
    en: 'Balance · Patience · Harmony',
  },
  description: {
    it: 'Guida gli scoiattoli di ramo in ramo applicando i princìpi dell\'Albero di Hanoi e l\'equilibrio del bosco AVL.',
    en: 'Guide the squirrels from branch to branch, applying the principles of the Hanoi Tree and the balance of the AVL forest.',
  },
  instructionsBtn: {
    it: 'Istruzioni · Tutorial',
    en: 'Instructions · Tutorial',
  },
  chooseLevel: {
    it: 'Scegli il tuo livello',
    en: 'Choose your level',
  },
  squirrels: {
    it: (n: number) => `${n} scoiattol${n === 1 ? 'o' : 'i'}`,
    en: (n: number) => `${n} squirrel${n === 1 ? '' : 's'}`,
  },
  footer: {
    it: 'AVL Hanoi · Giardino Zen Digitale',
    en: 'AVL Hanoi · Zen Digital Garden',
  },

  // Level names & descriptions
  levels: [
    { it: 'Amatore',     en: 'Amateur',     descIt: 'Scopri le regole',              descEn: 'Discover the rules' },
    { it: 'Apprendista', en: 'Apprentice',  descIt: 'Primi passi sul sentiero',      descEn: 'First steps on the path' },
    { it: 'Principiante',en: 'Beginner',    descIt: 'La mente comincia a calmarsi',  descEn: 'The mind begins to settle' },
    { it: 'Artigiano',   en: 'Artisan',     descIt: 'La pazienza plasma la forma',   descEn: 'Patience shapes the form' },
    { it: 'Maestro',     en: 'Master',      descIt: 'Chiarezza attraverso la calma', descEn: 'Clarity through restraint' },
    { it: 'Gran Maestro',en: 'Grand Master',descIt: 'Ogni mossa, un respiro',        descEn: 'Each move, a breath' },
    { it: 'Illuminato',  en: 'Enlightened', descIt: 'L\'albero e tu siete uno',      descEn: 'The tree and you are one' },
  ],

  // Tutorial
  tutorialTitle:  { it: 'Come si gioca',      en: 'How to Play' },
  tutorialSub:    { it: 'L\'Albero di Hanoi · Guida rapida', en: 'The Hanoi Tree · Quick Guide' },
  tutorialSteps: [
    {
      icon: '🐿️', titleIt: 'Seleziona', titleEn: 'Select',
      it: 'Tocca un nido che contiene scoiattoli. Viene selezionato quello in cima — i più pesanti stanno sotto.',
      en: 'Tap a nest that holds squirrels. The topmost squirrel is chosen — heavier ones rest below.',
    },
    {
      icon: '🌿', titleIt: 'Sposta', titleEn: 'Move',
      it: 'Tocca un nido di destinazione. Uno scoiattolo pesante non può passare sopra uno più leggero lungo il percorso.',
      en: 'Tap a destination nest. A heavy squirrel cannot pass over a lighter one along the branch path.',
    },
    {
      icon: '🎯', titleIt: 'Obiettivo', titleEn: 'Goal',
      it: 'Porta tutti gli scoiattoli alla radice, poi guardali scendere a terra.',
      en: 'Guide all squirrels down to the root, then watch them leap to the ground.',
    },
    {
      icon: '🔄', titleIt: 'Cresci', titleEn: 'Grow',
      it: 'Aggiungi nodi in qualsiasi momento — il ribilanciamento AVL ridisegna il puzzle.',
      en: 'Add nodes anytime — the AVL tree rebalances itself, reshaping the puzzle.',
    },
  ],
  tutorialBtn: { it: 'Inizia', en: 'Begin' },

  // HanoiGame header
  gameTitle:    { it: 'L\'Albero di Hanoi', en: 'The Hanoi Tree' },
  moves:        { it: 'mosse', en: 'moves' },
  statusWon:    { it: '🎉 Tutti gli scoiattoli a terra!', en: '🎉 All squirrels on the ground!' },
  statusSel:    { it: (n: number) => `🐿️ Scoiattolo #${n} selezionato — scegli il ramo destinazione`, en: (n: number) => `🐿️ Squirrel #${n} selected — choose a destination branch` },
  statusIdle:   { it: '🌳 Clicca un nido con scoiattoli per selezionarlo', en: '🌳 Click a nest with squirrels to select it' },

  // HanoiGame footer
  addNode:      { it: '+ Nodo', en: '+ Node' },
  addPlaceholder:{ it: '1–200', en: '1–200' },
  addBtn:       { it: 'Aggiungi', en: 'Add' },
  addMsgExists: { it: (k: number) => `Nodo ${k} già presente`, en: (k: number) => `Node ${k} already exists` },
  addMsgInvalid:{ it: 'Chiave non valida (1–200)', en: 'Invalid key (1–200)' },
  addMsgOk:     { it: (k: number) => `Nodo ${k} aggiunto — osserva il ribilanciamento!`, en: (k: number) => `Node ${k} added — watch the rebalancing!` },
  addMsgError:  { it: 'Errore', en: 'Error' },

  // Info panel
  rulesTitle:   { it: 'Regole', en: 'Rules' },
  rules: [
    { it: 'Clicca un nido con scoiattoli per selezionare quello in cima.', en: 'Click a nest with squirrels to select the topmost one.' },
    { it: 'Clicca un nido destinazione per spostarlo.', en: 'Click a destination nest to move it there.' },
    { it: 'Uno scoiattolo pesante non può superare uno più leggero lungo il percorso.', en: 'A heavier squirrel cannot pass a lighter one along the path.' },
    { it: 'Aggiungi nodi in qualsiasi momento — il ribilanciamento AVL cambia tutto!', en: 'Add nodes anytime — AVL rebalancing reshapes the puzzle!' },
    { it: 'Obiettivo: porta tutti gli scoiattoli alla radice e poi a terra.', en: 'Goal: bring all squirrels to the root, then to the ground.' },
  ],
  closeBtn: { it: 'Chiudi', en: 'Close' },
  emptyNest:{ it: 'vuoto', en: 'empty' },
};

// Helper: pick the right string for current lang
export function t<V extends string | ((...args: any[]) => string)>(
  obj: { it: V; en: V },
  lang: Lang,
): V {
  return obj[lang];
}
