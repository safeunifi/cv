import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { SwingSession } from '../models/types';

const SESSIONS_KEY = 'swing_sessions';

/**
 * Persistent storage for swing sessions using AsyncStorage
 */
export const StorageService = {
  /** Get all saved sessions */
  async getSessions(): Promise<SwingSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      if (!data) return [];
      return JSON.parse(data) as SwingSession[];
    } catch {
      return [];
    }
  },

  /** Save a new session */
  async saveSession(session: SwingSession): Promise<void> {
    const sessions = await this.getSessions();
    sessions.unshift(session);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  /** Update an existing session */
  async updateSession(session: SwingSession): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  },

  /** Delete a session and its video file */
  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === id);

    // Delete video file
    if (session?.videoUri) {
      try {
        const info = await FileSystem.getInfoAsync(session.videoUri);
        if (info.exists) {
          await FileSystem.deleteAsync(session.videoUri);
        }
      } catch {
        // File may already be deleted
      }
    }

    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },

  /** Clear all sessions */
  async clearAll(): Promise<void> {
    const sessions = await this.getSessions();
    for (const session of sessions) {
      if (session.videoUri) {
        try {
          await FileSystem.deleteAsync(session.videoUri, { idempotent: true });
        } catch {
          // ignore
        }
      }
    }
    await AsyncStorage.removeItem(SESSIONS_KEY);
  },
};
