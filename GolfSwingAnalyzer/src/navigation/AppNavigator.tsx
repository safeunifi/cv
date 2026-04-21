import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/theme';

import CaptureScreen from '../screens/CaptureScreen';
import ReviewScreen from '../screens/ReviewScreen';
import AnalysisDetailScreen from '../screens/AnalysisDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DrillsScreen from '../screens/DrillsScreen';
import DrillDetailScreen from '../screens/DrillDetailScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.background },
  headerTintColor: Colors.text,
  headerShadowVisible: false,
};

// ── Capture Stack ─────────────────────────────────────────

function CaptureStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CaptureMain"
        component={CaptureScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Swing', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AnalysisDetail"
        component={AnalysisDetailScreen}
        options={{ title: 'Swing Analysis' }}
      />
      <Stack.Screen
        name="DrillDetail"
        component={DrillDetailScreen}
        options={({ route }: any) => ({ title: route.params?.drill?.name ?? 'Drill' })}
      />
    </Stack.Navigator>
  );
}

// ── History Stack ─────────────────────────────────────────

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{ title: 'Swing History' }}
      />
      <Stack.Screen
        name="AnalysisDetail"
        component={AnalysisDetailScreen}
        options={{ title: 'Swing Analysis' }}
      />
      <Stack.Screen
        name="DrillDetail"
        component={DrillDetailScreen}
        options={({ route }: any) => ({ title: route.params?.drill?.name ?? 'Drill' })}
      />
    </Stack.Navigator>
  );
}

// ── Drills Stack ──────────────────────────────────────────

function DrillsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DrillsMain"
        component={DrillsScreen}
        options={{ title: 'Practice Drills' }}
      />
      <Stack.Screen
        name="DrillDetail"
        component={DrillDetailScreen}
        options={({ route }: any) => ({ title: route.params?.drill?.name ?? 'Drill' })}
      />
    </Stack.Navigator>
  );
}

// ── Progress Stack ────────────────────────────────────────

function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProgressMain"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
    </Stack.Navigator>
  );
}

// ── Tab Navigator ─────────────────────────────────────────

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Capture"
        component={CaptureStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Drills"
        component={DrillsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="golf" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
