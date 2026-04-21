import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ArrowLeft, Camera, Type, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, Leaf, ChefHat, Lightbulb,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analyzeMealPhoto, analyzeMealText } from '@/lib/nutrition/meal-scanner';
import type { MealAnalysis } from '@/lib/nutrition/meal-scanner';

type Mode = 'input' | 'camera' | 'analyzing' | 'results';

export default function MealScannerScreen() {
  const [mode, setMode] = useState<Mode>('input');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setMode('camera');
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo) {
      setPhotoUri(photo.uri);
      setMode('analyzing');
      try {
        const result = await analyzeMealPhoto(photo.uri);
        setAnalysis(result);
        setMode('results');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setMode('input');
      }
    }
  };

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setMode('analyzing');
    setError(null);
    try {
      const result = await analyzeMealText(textInput.trim());
      setAnalysis(result);
      setMode('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setMode('input');
    }
  };

  const reset = () => {
    setMode('input');
    setPhotoUri(null);
    setAnalysis(null);
    setError(null);
    setShowRecipe(false);
    setTextInput('');
  };

  // Camera mode
  if (mode === 'camera') {
    return (
      <View className="flex-1 bg-black">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center px-5 pt-4">
              <Pressable onPress={() => setMode('input')}>
                <ArrowLeft size={28} color="#fff" />
              </Pressable>
              <Text className="font-inter-bold text-lg text-white ml-3">
                Photo Your Meal
              </Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <View className="w-72 h-72 border-2 border-white/40 rounded-2xl" />
              <Text className="font-inter text-sm text-white/70 mt-3">
                Center the meal in the frame
              </Text>
            </View>
            <View className="items-center pb-8">
              <Pressable
                onPress={takePhoto}
                className="w-20 h-20 rounded-full border-4 border-white bg-white/30 items-center justify-center"
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </Pressable>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // Analyzing mode
  if (mode === 'analyzing') {
    return (
      <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4A7C59" />
        <Text className="font-inter-semibold text-base text-sand-700 mt-4">
          Analyzing your meal...
        </Text>
        <Text className="font-inter text-sm text-sand-500 mt-1">
          Finding a healthier alternative
        </Text>
      </SafeAreaView>
    );
  }

  // Results mode
  if (mode === 'results' && analysis) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center pt-4 gap-3 mb-4">
            <Pressable onPress={reset}>
              <ArrowLeft size={24} color="#4A7C59" />
            </Pressable>
            <Text className="font-inter-bold text-2xl text-sand-900">Meal Analysis</Text>
          </View>

          {/* Photo preview */}
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className="w-full h-48 rounded-xl mb-4"
              resizeMode="cover"
            />
          )}

          {/* Original Meal */}
          <Card className="mb-3">
            <Text className="font-inter-bold text-lg text-sand-900">
              {analysis.originalMeal}
            </Text>
            <MacroRow macros={analysis.originalMacros} label="Original" color="#E74C3C" />
            {analysis.concerns.length > 0 && (
              <View className="mt-3 gap-1">
                {analysis.concerns.map((c, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <AlertTriangle size={14} color="#E67E22" />
                    <Text className="font-inter text-sm text-sand-600 flex-1">{c}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Healthier Alternative */}
          <Card className="mb-3 bg-green-50 border-green-200">
            <View className="flex-row items-center gap-2 mb-1">
              <Leaf size={18} color="#4A7C59" />
              <Text className="font-inter-bold text-lg text-green-800">
                {analysis.healthierName}
              </Text>
            </View>
            <Text className="font-inter text-sm text-green-700 mb-2">
              {analysis.healthierReason}
            </Text>
            <MacroRow macros={analysis.healthierMacros} label="Healthier" color="#4A7C59" />

            {/* Macro comparison */}
            <View className="mt-3 bg-white/60 rounded-lg px-3 py-2">
              <Text className="font-inter-semibold text-xs text-green-800 mb-1">
                You save:
              </Text>
              <Text className="font-inter text-sm text-green-700">
                {Math.max(0, analysis.originalMacros.calories - analysis.healthierMacros.calories)} fewer calories
                {' · '}
                {Math.max(0, analysis.originalMacros.fat - analysis.healthierMacros.fat)}g less fat
                {analysis.healthierMacros.protein > analysis.originalMacros.protein
                  ? ` · +${analysis.healthierMacros.protein - analysis.originalMacros.protein}g more protein`
                  : ''}
              </Text>
            </View>
          </Card>

          {/* Ingredients */}
          {analysis.ingredients.length > 0 && (
            <Card className="mb-3">
              <Text className="font-inter-bold text-base text-sand-900 mb-2">
                Ingredients
              </Text>
              {analysis.ingredients.map((ing, i) => (
                <View key={i} className="flex-row gap-2 py-1">
                  <Text className="font-inter text-sm text-green-600">•</Text>
                  <Text className="font-inter text-sm text-sand-700 flex-1">{ing}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Recipe (collapsible) */}
          {analysis.recipe.length > 0 && (
            <Pressable onPress={() => setShowRecipe(!showRecipe)}>
              <Card className="mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <ChefHat size={18} color="#4A7C59" />
                    <Text className="font-inter-bold text-base text-sand-900">
                      Recipe ({analysis.recipe.length} steps)
                    </Text>
                  </View>
                  {showRecipe ? (
                    <ChevronUp size={20} color="#9B917F" />
                  ) : (
                    <ChevronDown size={20} color="#9B917F" />
                  )}
                </View>
                {showRecipe && (
                  <View className="mt-3 gap-3">
                    {analysis.recipe.map((step) => (
                      <View key={step.step} className="flex-row gap-3">
                        <View className="w-7 h-7 rounded-full bg-green-100 items-center justify-center">
                          <Text className="font-inter-bold text-xs text-green-700">{step.step}</Text>
                        </View>
                        <Text className="font-inter text-sm text-sand-700 flex-1 pt-0.5">
                          {step.instruction}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Pressable>
          )}

          {/* Tips */}
          {analysis.tips.length > 0 && (
            <Card className="mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Lightbulb size={18} color="#E67E22" />
                <Text className="font-inter-bold text-base text-sand-900">Quick Tips</Text>
              </View>
              {analysis.tips.map((tip, i) => (
                <Text key={i} className="font-inter text-sm text-sand-600 mb-1">• {tip}</Text>
              ))}
            </Card>
          )}

          {/* Try again */}
          <Button title="Scan Another Meal" onPress={reset} variant="outline" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Input mode (default)
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center pt-4 gap-3 mb-2">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#4A7C59" />
            </Pressable>
            <Text className="font-inter-bold text-2xl text-sand-900">Meal Scanner</Text>
          </View>
          <Text className="font-inter text-sm text-sand-500 mb-6">
            Snap a photo or describe a meal to get a healthier alternative with full recipe and macros.
          </Text>

          {error && (
            <Card className="mb-4 bg-red-50 border-red-200">
              <Text className="font-inter text-sm text-red-700">{error}</Text>
            </Card>
          )}

          {/* Camera option */}
          <Pressable onPress={openCamera}>
            <Card className="mb-4">
              <View className="items-center py-6">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-3">
                  <Camera size={32} color="#4A7C59" />
                </View>
                <Text className="font-inter-bold text-lg text-sand-900">Take a Photo</Text>
                <Text className="font-inter text-sm text-sand-500 mt-1 text-center">
                  Point your camera at a restaurant menu item,{'\n'}takeout container, or any meal
                </Text>
              </View>
            </Card>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-sand-200" />
            <Text className="font-inter text-sm text-sand-400">or</Text>
            <View className="flex-1 h-px bg-sand-200" />
          </View>

          {/* Text description option */}
          <Card className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Type size={18} color="#4A7C59" />
              <Text className="font-inter-bold text-base text-sand-900">Describe a Meal</Text>
            </View>
            <TextInput
              className="font-inter text-base text-sand-800 border border-sand-200 rounded-xl px-4 py-3 min-h-[80px]"
              placeholder="e.g. Clubhouse cheeseburger with fries and a beer"
              placeholderTextColor="#B8B0A1"
              multiline
              textAlignVertical="top"
              value={textInput}
              onChangeText={setTextInput}
            />
            <View className="mt-3">
              <Button
                title="Analyze & Find Healthier Option"
                onPress={analyzeText}
                disabled={!textInput.trim()}
              />
            </View>
          </Card>

          {/* Example suggestions */}
          <Text className="font-inter-semibold text-sm text-sand-600 mb-2">Try these:</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              'Clubhouse burger & fries',
              'Gas station hot dog',
              'Pizza and soda',
              'Fried chicken sandwich',
              'Nachos with cheese',
            ].map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => setTextInput(suggestion)}
                className="bg-sand-100 rounded-full px-3 py-1.5"
              >
                <Text className="font-inter text-sm text-sand-600">{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MacroRow({ macros, label, color }: { macros: MealAnalysis['originalMacros']; label: string; color: string }) {
  return (
    <View className="flex-row justify-between mt-2 bg-sand-100 rounded-lg px-3 py-2">
      <View className="items-center">
        <Text className="font-inter-bold text-sm" style={{ color }}>{macros.calories}</Text>
        <Text className="font-inter text-xs text-sand-500">Cal</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-sm" style={{ color }}>{macros.protein}g</Text>
        <Text className="font-inter text-xs text-sand-500">Protein</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-sm" style={{ color }}>{macros.carbs}g</Text>
        <Text className="font-inter text-xs text-sand-500">Carbs</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-sm" style={{ color }}>{macros.fat}g</Text>
        <Text className="font-inter text-xs text-sand-500">Fat</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-sm" style={{ color }}>{macros.fiber}g</Text>
        <Text className="font-inter text-xs text-sand-500">Fiber</Text>
      </View>
    </View>
  );
}
