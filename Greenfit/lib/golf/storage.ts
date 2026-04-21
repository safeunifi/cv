import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { SwingSession } from '@/types/golf';

const SESSIONS_KEY = 'greenfit_swing_sessions';

export const SwingStorageService = {
  async getSessions(): Promise<SwingSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      if (!data) return [];
      return JSON.parse(data) as SwingSession[];
    } catch {
      return [];
    }
  },

  async saveSession(session: SwingSession): Promise<void> {
    const sessions = await this.getSessions();
    sessions.unshift(session);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === id);

    if (session?.videoUri) {
      try {
        const info = await FileSystem.getInfoAsync(session.videoUri);
        if (info.exists) await FileSystem.deleteAsync(session.videoUri);
      } catch {
        // File may already be deleted
      }
    }

    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },
};
