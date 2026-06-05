import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    it: {
      translation: {
        games: {
          hanoi: {
            victoryTitle: 'Vittoria!',
            victoryMessage: "Hai portato tutti i dischi alla radice dell'albero AVL!",
            nextLevel: 'Livello successivo',
            repeat: 'Ripeti livello',
          },
          chan: { restart: 'Ricomincia' },
        },
      },
    },
  },
  lng: 'it',
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
});

export default i18n;
