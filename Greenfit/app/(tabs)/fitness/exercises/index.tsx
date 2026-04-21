import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useFitnessStore } from '@/stores/fitness-store';
import { Pill } from '@/components/ui/Pill';
import { useState, useEffect } from 'react';
import type { ExerciseCategory } from '@/types/fitness';

const CATEGORIES: { id: ExerciseCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'strength', label: 'Strength' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'power', label: 'Power' },
  { id: 'golf_specific', label: 'Golf' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'flexibility', label: 'Flexibility' },
  { id: 'balance', label: 'Balance' },
];

export default function ExerciseLibraryScreen() {
  const { exercises, isLoadingExercises, fetchExercises } = useFitnessStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');

  // Backup trigger — safe to call multiple times due to guard in store
  useEffect(() => {
    fetchExercises();
  }, []);

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || ex.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-3">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Exercise Library</Text>
        <Text className="font-inter text-sm text-sand-400 ml-auto">
          {exercises.length} exercises
        </Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-earth-50 border border-earth-200 rounded-xl px-4">
          <Search size={18} color="#9B917F" />
          <TextInput
            className="flex-1 py-3 px-3 font-inter text-base text-sand-900"
            placeholder="Search exercises..."
            placeholderTextColor="#B8B0A1"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View className="px-5 mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={({ item }) => (
            <View className="mr-2">
              <Pill
                label={item.label}
                selected={category === item.id}
                onPress={() => setCategory(item.id)}
                size="sm"
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Loading State */}
      {isLoadingExercises ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A7C59" />
          <Text className="font-inter text-base text-sand-400 mt-4">
            Loading exercises...
          </Text>
        </View>
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          contentContainerClassName="px-5 pb-6"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(tabs)/fitness/exercises/${item.id}`)}
              className="py-3 border-b border-earth-100 active:bg-earth-50"
            >
              <Text className="font-inter-medium text-base text-sand-800">{item.name}</Text>
              <View className="flex-row gap-2 mt-1 flex-wrap">
                <Text className="font-inter text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {item.category.replace(/_/g, ' ')}
                </Text>
                <Text className="font-inter text-xs text-sand-500 bg-sand-100 px-2 py-0.5 rounded-full">
                  {item.equipmentTier?.replace(/_/g, ' ') || 'none'}
                </Text>
                {item.isGolfSpecific && (
                  <Text className="font-inter text-xs text-earth-500 bg-earth-50 px-2 py-0.5 rounded-full">
                    Golf
                  </Text>
                )}
                {item.isJointFriendly && (
                  <Text className="font-inter text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                    Joint-Friendly
                  </Text>
                )}
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="font-inter text-base text-sand-400 text-center">
            {exercises.length === 0
              ? 'No exercises found.\nCheck your connection and try again.'
              : 'No exercises match your search.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
