import { create } from 'zustand';

export interface Session {
  game: string;
  category: string;
  level: number;
  startTime: number;
  endTime: number;
  duration: number;
  errors: number;
  result: 'victory' | 'defeat';
}

interface DiaryState {
  sessions: Session[];
  addSession: (session: Session) => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  sessions: [],
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
}));
