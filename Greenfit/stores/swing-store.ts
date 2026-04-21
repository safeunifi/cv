import { create } from 'zustand';
import type { SwingSession, SwingAnalysis, CameraAngle, ClubType } from '@/types/golf';
import { SwingStorageService } from '@/lib/golf/storage';

interface SwingState {
  sessions: SwingSession[];
  isLoading: boolean;

  // Current recording state (passed between capture → review → results)
  currentVideoUri: string | null;
  currentCameraAngle: CameraAngle;
  currentClubType: ClubType;
  currentDuration: number;
  currentAnalysis: SwingAnalysis | null;

  // Actions
  loadSessions: () => Promise<void>;
  saveSession: (session: SwingSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentRecording: (data: {
    videoUri: string;
    cameraAngle: CameraAngle;
    clubType: ClubType;
    duration: number;
  }) => void;
  setCurrentAnalysis: (analysis: SwingAnalysis | null) => void;
  clearCurrentRecording: () => void;
}

export const useSwingStore = create<SwingState>((set, get) => ({
  sessions: [],
  isLoading: false,

  currentVideoUri: null,
  currentCameraAngle: 'dtl',
  currentClubType: '7 Iron',
  currentDuration: 0,
  currentAnalysis: null,

  loadSessions: async () => {
    set({ isLoading: true });
    const sessions = await SwingStorageService.getSessions();
    set({
      sessions: sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      isLoading: false,
    });
  },

  saveSession: async (session) => {
    await SwingStorageService.saveSession(session);
    const sessions = await SwingStorageService.getSessions();
    set({
      sessions: sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
  },

  deleteSession: async (id) => {
    await SwingStorageService.deleteSession(id);
    const sessions = await SwingStorageService.getSessions();
    set({
      sessions: sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
  },

  setCurrentRecording: (data) => set({
    currentVideoUri: data.videoUri,
    currentCameraAngle: data.cameraAngle,
    currentClubType: data.clubType,
    currentDuration: data.duration,
    currentAnalysis: null,
  }),

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  clearCurrentRecording: () => set({
    currentVideoUri: null,
    currentAnalysis: null,
    currentDuration: 0,
  }),
}));
