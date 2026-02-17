import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Settings, ChevronRight, TrendingUp, Edit, LogOut } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="font-inter-bold text-2xl text-sand-900">Profile</Text>
        </View>

        {/* User Info */}
        <Card className="mb-4">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center">
              <Text className="font-inter-bold text-2xl text-green-600">
                {(profile?.fullName || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-xl text-sand-900">
                {profile?.fullName || 'User'}
              </Text>
              <Text className="font-inter text-sm text-sand-500">
                {profile?.email || 'Guest Mode'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Macro Targets */}
        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Daily Targets</Text>
          <View className="flex-row justify-around">
            <TargetBox label="Calories" value={String(profile?.targetCalories || '-')} />
            <TargetBox label="Protein" value={`${profile?.targetProteinG || '-'}g`} />
            <TargetBox label="Carbs" value={`${profile?.targetCarbsG || '-'}g`} />
            <TargetBox label="Fat" value={`${profile?.targetFatG || '-'}g`} />
          </View>
        </Card>

        {/* Menu Items */}
        <View className="gap-2 mb-6">
          <MenuItem
            icon={<TrendingUp size={20} color="#4A7C59" />}
            label="Progress & Charts"
            onPress={() => router.push('/(tabs)/profile/progress')}
          />
          <MenuItem
            icon={<Edit size={20} color="#4A7C59" />}
            label="Edit Profile & Goals"
            onPress={() => router.push('/(tabs)/profile/edit-profile')}
          />
          <MenuItem
            icon={<Settings size={20} color="#4A7C59" />}
            label="Settings"
            onPress={() => router.push('/(tabs)/profile/settings')}
          />
        </View>

        {/* Sign Out */}
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

function TargetBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="font-inter-bold text-lg text-green-600">{value}</Text>
      <Text className="font-inter text-xs text-sand-500">{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} padding="md">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {icon}
          <Text className="font-inter-medium text-base text-sand-800">{label}</Text>
        </View>
        <ChevronRight size={20} color="#B8B0A1" />
      </View>
    </Card>
  );
}
