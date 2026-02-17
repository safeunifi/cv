/**
 * Saves a generated workout plan to Supabase.
 *
 * 1. Deactivates any existing active plans for the user
 * 2. Inserts the workout_plans row
 * 3. Inserts workout_plan_days rows
 * 4. Batch inserts workout_plan_exercises per day
 * 5. Returns the new plan ID
 */

import { supabase } from '@/lib/supabase';
import type { GeneratedPlan } from './generate-plan';

export async function savePlanToSupabase(
  plan: GeneratedPlan,
  userId: string
): Promise<string> {
  // 1. Deactivate existing active plans
  await supabase
    .from('workout_plans')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  // 2. Insert the main plan
  const { data: planData, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      title: plan.title,
      description: plan.description,
      days_per_week: plan.daysPerWeek,
      duration_weeks: plan.durationWeeks,
      plan_type: plan.planType,
      equipment_tier: plan.equipmentTier,
      fitness_goals: plan.fitnessGoals,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single();

  if (planError || !planData) {
    throw new Error(`Failed to create workout plan: ${planError?.message || 'Unknown error'}`);
  }

  const planId = planData.id;

  // 3. Insert days
  for (const day of plan.days) {
    const { data: dayData, error: dayError } = await supabase
      .from('workout_plan_days')
      .insert({
        workout_plan_id: planId,
        day_number: day.dayNumber,
        day_name: day.dayName,
        focus: day.focus,
        estimated_duration_minutes: day.estimatedDurationMinutes,
        sort_order: day.dayNumber - 1,
      })
      .select('id')
      .single();

    if (dayError || !dayData) {
      throw new Error(`Failed to create plan day: ${dayError?.message || 'Unknown error'}`);
    }

    const dayId = dayData.id;

    // 4. Batch insert exercises for this day
    if (day.exercises.length > 0) {
      const exerciseRows = day.exercises.map((ex) => ({
        workout_plan_day_id: dayId,
        exercise_id: ex.exerciseId,
        sets: ex.sets,
        rep_range: ex.repRange,
        rest_seconds: ex.restSeconds,
        notes: ex.notes,
        sort_order: ex.sortOrder,
      }));

      const { error: exError } = await supabase
        .from('workout_plan_exercises')
        .insert(exerciseRows);

      if (exError) {
        throw new Error(`Failed to create plan exercises: ${exError.message}`);
      }
    }
  }

  return planId;
}
