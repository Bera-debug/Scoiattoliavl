import '../i18n';
import { useTreeStore } from '../store/useTreeStore';
import { LangProvider } from '../lib/lang';
import HanoiGame from './components/HanoiGame';
import LevelSelect from './components/LevelSelect';

export default function App() {
  const isActive = useTreeStore(s => s.hanoiState.isActive);
  return (
    <LangProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isActive ? <HanoiGame /> : <LevelSelect />}
      </div>
    </LangProvider>
  );
}
