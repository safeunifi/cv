import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSettingsStore } from '@/stores/settings-store';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Pill } from '@/components/ui/Pill';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6">
        <View className="flex-row items-center pt-4 gap-3 mb-6">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Settings</Text>
        </View>

        {/* Units */}
        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Units</Text>
          <View className="flex-row gap-2">
            <Pill
              label="Imperial (lbs, oz)"
              selected={settings.units === 'imperial'}
              onPress={() => settings.setUnits('imperial')}
            />
            <Pill
              label="Metric (kg, ml)"
              selected={settings.units === 'metric'}
              onPress={() => settings.setUnits('metric')}
            />
          </View>
        </Card>

        {/* Theme */}
        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Appearance</Text>
          <View className="flex-row gap-2">
            <Pill label="Light" selected={settings.theme === 'light'} onPress={() => settings.setTheme('light')} />
            <Pill label="Dark" selected={settings.theme === 'dark'} onPress={() => settings.setTheme('dark')} />
            <Pill label="System" selected={settings.theme === 'system'} onPress={() => settings.setTheme('system')} />
          </View>
        </Card>

        {/* Notifications */}
        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Reminders</Text>
          <View className="gap-4">
            <SettingsRow
              label="Meal Reminders"
              value={settings.mealReminders}
              onToggle={settings.setMealReminders}
            />
            <SettingsRow
              label="Workout Reminders"
              value={settings.workoutReminders}
              onToggle={settings.setWorkoutReminders}
            />
            <SettingsRow
              label="Water Reminders"
              value={settings.waterReminders}
              onToggle={settings.setWaterReminders}
            />
          </View>
        </Card>

        {/* About */}
        <Card>
          <Text className="font-inter-semibold text-base text-sand-800 mb-2">About</Text>
          <Text className="font-inter text-sm text-sand-500">GreenFit v1.0.0</Text>
          <Text className="font-inter text-sm text-sand-500">Fuel Your Game</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-inter text-base text-sand-700">{label}</Text>
      <Toggle value={value} onValueChange={onToggle} />
    </View>
  );
}
