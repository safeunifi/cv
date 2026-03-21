import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Droplets, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import {
  GOLF_SNACKS, HYDRATION_PLAN, TIMING_INFO,
  getSnacksByTiming, buildRoundPlan,
  type GolfSnack,
} from '@/data/golf-nutrition';

const TIMINGS = ['pre-round', 'front-nine', 'turn', 'back-nine', 'post-round'] as const;

export default function CourseFuelScreen() {
  const [selectedTiming, setSelectedTiming] = useState<string>('front-nine');
  const [showHydration, setShowHydration] = useState(false);
  const snacks = getSnacksByTiming(selectedTiming);
  const timingInfo = TIMING_INFO[selectedTiming];

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center pt-4 gap-3 mb-2">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Course Fuel</Text>
        </View>
        <Text className="font-inter text-sm text-sand-500 mb-5">
          Skip the clubhouse hot dog. Fuel your round like a pro.
        </Text>

        {/* Timing selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {TIMINGS.map((t) => (
              <Pill
                key={t}
                label={`${TIMING_INFO[t].emoji} ${TIMING_INFO[t].label}`}
                selected={selectedTiming === t}
                onPress={() => setSelectedTiming(t)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Timing description */}
        <Card className="mb-4 bg-green-50 border-green-200">
          <Text className="font-inter-semibold text-base text-green-800">
            {timingInfo.emoji} {timingInfo.label}
          </Text>
          <Text className="font-inter text-sm text-green-700 mt-1">
            {timingInfo.description}
          </Text>
        </Card>

        {/* Snack cards */}
        {snacks.map((snack) => (
          <SnackCard key={snack.id} snack={snack} />
        ))}

        {/* Hydration Section */}
        <Pressable onPress={() => setShowHydration(!showHydration)}>
          <Card className="mt-4 mb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Droplets size={20} color="#3498DB" />
                <Text className="font-inter-bold text-base text-sand-900">Hydration Plan</Text>
              </View>
              {showHydration ? (
                <ChevronUp size={20} color="#9B917F" />
              ) : (
                <ChevronDown size={20} color="#9B917F" />
              )}
            </View>
            {showHydration && (
              <View className="mt-3 gap-3">
                {HYDRATION_PLAN.map((tip, i) => (
                  <View key={i} className="border-l-2 border-blue-300 pl-3">
                    <Text className="font-inter-semibold text-sm text-sand-800">{tip.timing}</Text>
                    <Text className="font-inter text-sm text-sand-600">{tip.recommendation}</Text>
                    <Text className="font-inter-medium text-xs text-blue-600 mt-0.5">{tip.amount}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </Pressable>

        {/* Pro Tips */}
        <Card className="mt-2">
          <Text className="font-inter-bold text-base text-sand-900 mb-2">Pro Tips</Text>
          <View className="gap-2">
            <TipRow text="Eat before you're hungry — by the time you feel low, it's too late to recover mid-round." />
            <TipRow text="Avoid high-sugar sports drinks. Water + electrolyte tabs are better for focus." />
            <TipRow text="Caffeine is fine but cap it at 200mg (1-2 cups). Too much causes jitters in your short game." />
            <TipRow text="Alcohol dehydrates and kills coordination. Save it for the 19th hole." />
            <TipRow text="Pack your snacks the night before. Prep = performance." />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SnackCard({ snack }: { snack: GolfSnack }) {
  return (
    <Card className="mb-3">
      <Text className="font-inter-bold text-base text-sand-900">{snack.name}</Text>
      <Text className="font-inter text-sm text-sand-600 mt-1">{snack.description}</Text>
      <Text className="font-inter text-xs text-sand-500 mt-1">Serving: {snack.serving}</Text>

      {/* Macro row */}
      <View className="flex-row justify-between mt-3 bg-sand-100 rounded-lg px-3 py-2">
        <MacroItem label="Cal" value={snack.calories} />
        <MacroItem label="Protein" value={snack.protein} unit="g" />
        <MacroItem label="Carbs" value={snack.carbs} unit="g" />
        <MacroItem label="Fat" value={snack.fat} unit="g" />
        <MacroItem label="Fiber" value={snack.fiber} unit="g" />
      </View>

      {/* Golf benefit */}
      <View className="mt-2 bg-green-50 rounded-lg px-3 py-2">
        <Text className="font-inter text-xs text-green-700">{snack.golfBenefit}</Text>
      </View>
    </Card>
  );
}

function MacroItem({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <View className="items-center">
      <Text className="font-inter-bold text-sm text-sand-800">{value}{unit}</Text>
      <Text className="font-inter text-xs text-sand-500">{label}</Text>
    </View>
  );
}

function TipRow({ text }: { text: string }) {
  return (
    <View className="flex-row gap-2">
      <Text className="font-inter text-sm text-green-600">•</Text>
      <Text className="font-inter text-sm text-sand-700 flex-1">{text}</Text>
    </View>
  );
}
