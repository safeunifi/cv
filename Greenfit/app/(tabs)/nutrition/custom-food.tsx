import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';

export default function CustomFoodScreen() {
  const { session } = useAuthStore();
  const [name, setName] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !calories) {
      Alert.alert('Error', 'Please fill in name and calories');
      return;
    }
    setLoading(true);
    try {
      if (session?.user?.id) {
        await supabase.from('custom_foods').insert({
          user_id: session.user.id,
          food_name: name.trim(),
          serving_size: Number(servingSize) || 100,
          serving_unit: servingUnit,
          calories: Number(calories) || 0,
          protein_g: Number(protein) || 0,
          carbs_g: Number(carbs) || 0,
          fat_g: Number(fat) || 0,
        });
      }
      Alert.alert('Saved', 'Custom food created!');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Create Custom Food</Text>
      </View>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6 gap-4">
        <Input label="Food Name" placeholder="e.g., Homemade Energy Balls" value={name} onChangeText={setName} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Serving Size" placeholder="100" value={servingSize} onChangeText={setServingSize} keyboardType="numeric" />
          </View>
          <View className="flex-1">
            <Input label="Unit" placeholder="g" value={servingUnit} onChangeText={setServingUnit} />
          </View>
        </View>
        <Input label="Calories" placeholder="0" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <Input label="Protein (g)" placeholder="0" value={protein} onChangeText={setProtein} keyboardType="numeric" />
        <Input label="Carbs (g)" placeholder="0" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
        <Input label="Fat (g)" placeholder="0" value={fat} onChangeText={setFat} keyboardType="numeric" />
        <Button title="Save Custom Food" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
