// Polyfill crypto.getRandomValues for React Native (required by uuid transitive deps)
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {};
}
if (!(globalThis.crypto as any).getRandomValues) {
  (globalThis.crypto as any).getRandomValues = function <T extends ArrayBufferView>(array: T): T {
    const bytes = array as unknown as Uint8Array;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/utils/theme';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
