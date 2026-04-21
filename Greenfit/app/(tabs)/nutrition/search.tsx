import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useState, useCallback, useRef } from 'react';
import { searchFoods, extractMacros } from '@/lib/nutrition/usda-api';
import { useNutritionStore } from '@/stores/nutrition-store';
import { Card } from '@/components/ui/Card';
import type { USDAFoodSearchResult } from '@/types/nutrition';

export default function FoodSearchScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const { recentFoods } = useNutritionStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<USDAFoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const foods = await searchFoods(text.trim());
        setResults(foods);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectFood = (food: USDAFoodSearchResult) => {
    // Navigate to log-food screen with the food data
    router.push({
      pathname: '/(tabs)/nutrition/log-food',
      params: {
        fdcId: String(food.fdcId),
        name: food.description,
        meal: meal || 'snack',
        nutrients: JSON.stringify(food.foodNutrients),
      },
    });
  };

  const renderFoodItem = ({ item }: { item: USDAFoodSearchResult }) => {
    const macros = extractMacros(item.foodNutrients);
    return (
      <Pressable
        onPress={() => handleSelectFood(item)}
        className="py-3 px-4 border-b border-earth-100 active:bg-earth-50"
      >
        <Text className="font-inter-medium text-base text-sand-800" numberOfLines={1}>
          {item.description}
        </Text>
        <View className="flex-row gap-3 mt-1">
          <Text className="font-inter text-xs text-sand-500">
            {Math.round(macros.calories)} cal
          </Text>
          <Text className="font-inter text-xs text-sand-500">
            P: {macros.protein}g
          </Text>
          <Text className="font-inter text-xs text-sand-500">
            C: {macros.carbs}g
          </Text>
          <Text className="font-inter text-xs text-sand-500">
            F: {macros.fat}g
          </Text>
          <Text className="font-inter text-xs text-earth-400">per 100g</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2 gap-3">
        <Pressable onPress={() => router.back()} className="py-1">
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-semibold text-lg text-sand-900">
          Add to {meal ? meal.charAt(0).toUpperCase() + meal.slice(1) : 'Food Log'}
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-earth-50 border border-earth-200 rounded-xl px-4">
          <Search size={18} color="#9B917F" />
          <TextInput
            className="flex-1 py-3 px-3 font-inter text-base text-sand-900"
            placeholder="Search foods..."
            placeholderTextColor="#B8B0A1"
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && <ActivityIndicator size="small" color="#4A7C59" />}
        </View>
      </View>

      {/* Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderFoodItem}
          keyExtractor={(item) => String(item.fdcId)}
          contentContainerClassName="px-1"
        />
      ) : query.length === 0 && recentFoods.length > 0 ? (
        <View className="px-5">
          <Text className="font-inter-semibold text-base text-sand-700 mb-3">Recent Foods</Text>
          {recentFoods.map((food) => (
            <Pressable
              key={food.fdcId}
              onPress={() => router.push({
                pathname: '/(tabs)/nutrition/log-food',
                params: { fdcId: String(food.fdcId), name: food.name, meal: meal || 'snack' },
              })}
              className="py-3 border-b border-earth-100"
            >
              <Text className="font-inter text-base text-sand-800">{food.name}</Text>
              <Text className="font-inter text-xs text-sand-500">{food.calories} cal</Text>
            </Pressable>
          ))}
        </View>
      ) : query.length > 0 && !isSearching ? (
        <View className="items-center mt-12">
          <Text className="font-inter text-base text-sand-500">No results found</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/nutrition/custom-food')}
            className="mt-3"
          >
            <Text className="font-inter-medium text-base text-green-600">+ Create Custom Food</Text>
          </Pressable>
        </View>
      ) : (
        <View className="items-center mt-12">
          <Search size={48} color="#D5CFC3" />
          <Text className="font-inter text-base text-sand-400 mt-3">
            Search the USDA food database
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
