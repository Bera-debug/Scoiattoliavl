import '../i18n';
import { useTreeStore } from '../store/useTreeStore';
import HanoiGame from './components/HanoiGame';
import LevelSelect from './components/LevelSelect';

export default function App() {
  const isActive = useTreeStore(s => s.hanoiState.isActive);
  return isActive ? <HanoiGame /> : <LevelSelect />;
}
