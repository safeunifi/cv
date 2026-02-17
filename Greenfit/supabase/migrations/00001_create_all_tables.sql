-- GreenFit Database Schema
-- All tables with Row Level Security

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm NUMERIC(5,1),
  current_weight_kg NUMERIC(5,1),
  fitness_goals TEXT[] DEFAULT '{}',
  activity_level TEXT CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','active','very_active')),
  equipment_tier TEXT CHECK (equipment_tier IN ('none','minimal','home_gym','full_gym')),
  golf_experience TEXT CHECK (golf_experience IN ('none','beginner','intermediate','advanced')),
  golf_handicap NUMERIC(4,1),
  injury_areas TEXT[] DEFAULT '{}',
  training_days_per_week INTEGER CHECK (training_days_per_week BETWEEN 1 AND 7),
  dietary_preferences TEXT[] DEFAULT '{}',
  bmr NUMERIC(7,1),
  tdee NUMERIC(7,1),
  target_calories NUMERIC(7,1),
  target_protein_g NUMERIC(5,1),
  target_carbs_g NUMERIC(5,1),
  target_fat_g NUMERIC(5,1),
  units TEXT DEFAULT 'imperial' CHECK (units IN ('imperial', 'metric')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FOOD LOG ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.food_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  fdc_id INTEGER,
  custom_food_id UUID,
  food_name TEXT NOT NULL,
  brand_name TEXT,
  serving_size NUMERIC(7,2) NOT NULL,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  number_of_servings NUMERIC(5,2) DEFAULT 1,
  calories NUMERIC(7,1) NOT NULL,
  protein_g NUMERIC(6,1) NOT NULL,
  carbs_g NUMERIC(6,1) NOT NULL,
  fat_g NUMERIC(6,1) NOT NULL,
  fiber_g NUMERIC(6,1) DEFAULT 0,
  sugar_g NUMERIC(6,1) DEFAULT 0,
  sodium_mg NUMERIC(7,1) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON public.food_log_entries(user_id, logged_date);
ALTER TABLE public.food_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own food logs" ON public.food_log_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. CUSTOM FOODS
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  brand_name TEXT,
  serving_size NUMERIC(7,2) NOT NULL,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories NUMERIC(7,1) NOT NULL,
  protein_g NUMERIC(6,1) NOT NULL,
  carbs_g NUMERIC(6,1) NOT NULL,
  fat_g NUMERIC(6,1) NOT NULL,
  fiber_g NUMERIC(6,1) DEFAULT 0,
  sugar_g NUMERIC(6,1) DEFAULT 0,
  sodium_mg NUMERIC(7,1) DEFAULT 0,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_dairy_free BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own custom foods" ON public.custom_foods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. WATER LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.water_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml NUMERIC(6,1) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_log_user_date ON public.water_log(user_id, logged_date);
ALTER TABLE public.water_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water log" ON public.water_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. RECIPES
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  meal_types TEXT[] DEFAULT '{}',
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving NUMERIC(7,1),
  protein_per_serving NUMERIC(6,1),
  carbs_per_serving NUMERIC(6,1),
  fat_per_serving NUMERIC(6,1),
  fiber_per_serving NUMERIC(6,1),
  tags TEXT[] DEFAULT '{}',
  is_gluten_free BOOLEAN DEFAULT TRUE,
  is_dairy_free BOOLEAN DEFAULT TRUE,
  instructions JSONB DEFAULT '[]',
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'easy',
  is_system_recipe BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read system recipes" ON public.recipes
  FOR SELECT USING (is_system_recipe = TRUE);
CREATE POLICY "Users can read own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can manage own recipes" ON public.recipes
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- ============================================
-- 6. RECIPE INGREDIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC(7,2) NOT NULL,
  unit TEXT NOT NULL,
  fdc_id INTEGER,
  preparation_note TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  grocery_category TEXT DEFAULT 'other'
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredients follow recipe access" ON public.recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_id
      AND (r.is_system_recipe = TRUE OR r.created_by = auth.uid())
    )
  );

-- ============================================
-- 7. MEAL PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  target_calories NUMERIC(7,1),
  target_protein_g NUMERIC(5,1),
  target_carbs_g NUMERIC(5,1),
  target_fat_g NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. MEAL PLAN ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id),
  plan_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  servings NUMERIC(4,2) DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_plan ON public.meal_plan_entries(meal_plan_id, plan_date);
ALTER TABLE public.meal_plan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plan entries" ON public.meal_plan_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meal_plans mp WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid())
  );

-- ============================================
-- 9. GROCERY LISTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery lists" ON public.grocery_lists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.grocery_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id UUID NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(7,2),
  unit TEXT,
  grocery_category TEXT DEFAULT 'other',
  is_checked BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  notes TEXT
);

ALTER TABLE public.grocery_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery items" ON public.grocery_list_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.grocery_lists gl WHERE gl.id = grocery_list_id AND gl.user_id = auth.uid())
  );

-- ============================================
-- 10. EXERCISES
-- ============================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('strength','mobility','power','cardio','flexibility','balance','golf_specific')),
  subcategory TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  movement_pattern TEXT,
  equipment_needed TEXT[] DEFAULT '{}',
  equipment_tier TEXT CHECK (equipment_tier IN ('none','minimal','home_gym','full_gym')),
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  is_golf_specific BOOLEAN DEFAULT FALSE,
  golf_benefit TEXT,
  tpi_category TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  is_joint_friendly BOOLEAN DEFAULT FALSE,
  contraindicated_areas TEXT[] DEFAULT '{}',
  is_system_exercise BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category, equipment_tier);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read system exercises" ON public.exercises
  FOR SELECT USING (is_system_exercise = TRUE);
CREATE POLICY "Users can read own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = created_by);

-- ============================================
-- 11. WORKOUT PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  days_per_week INTEGER NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  plan_type TEXT,
  equipment_tier TEXT,
  fitness_goals TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workout plans" ON public.workout_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workout_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  focus TEXT,
  estimated_duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.workout_plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own plan days" ON public.workout_plan_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_plans wp WHERE wp.id = workout_plan_id AND wp.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_day_id UUID NOT NULL REFERENCES public.workout_plan_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  sets INTEGER NOT NULL,
  rep_range TEXT NOT NULL,
  rest_seconds INTEGER DEFAULT 60,
  tempo TEXT,
  rpe_target NUMERIC(3,1),
  notes TEXT,
  superset_group TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own plan exercises" ON public.workout_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plan_days wpd
      JOIN public.workout_plans wp ON wp.id = wpd.workout_plan_id
      WHERE wpd.id = workout_plan_day_id AND wp.user_id = auth.uid()
    )
  );

-- ============================================
-- 12. WORKOUT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_plan_day_id UUID REFERENCES public.workout_plan_days(id),
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  overall_rpe NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, workout_date);
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workout logs" ON public.workout_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workout_log_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  set_number INTEGER NOT NULL,
  set_type TEXT DEFAULT 'working' CHECK (set_type IN ('warmup','working','dropset','amrap','timed')),
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  duration_seconds INTEGER,
  distance_meters NUMERIC(8,2),
  rpe NUMERIC(3,1),
  is_completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_log_sets ON public.workout_log_sets(workout_log_id);
ALTER TABLE public.workout_log_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own log sets" ON public.workout_log_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_logs wl WHERE wl.id = workout_log_id AND wl.user_id = auth.uid())
  );

-- ============================================
-- 13. PROGRESS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,1) NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'apple_health')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_weight_history ON public.weight_history(user_id, recorded_date);
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own weight history" ON public.weight_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.daily_nutrition_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_calories NUMERIC(7,1) DEFAULT 0,
  total_protein_g NUMERIC(6,1) DEFAULT 0,
  total_carbs_g NUMERIC(6,1) DEFAULT 0,
  total_fat_g NUMERIC(6,1) DEFAULT 0,
  total_fiber_g NUMERIC(6,1) DEFAULT 0,
  total_water_ml NUMERIC(7,1) DEFAULT 0,
  target_calories NUMERIC(7,1),
  target_protein_g NUMERIC(5,1),
  target_carbs_g NUMERIC(5,1),
  target_fat_g NUMERIC(5,1),
  meals_logged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summary ON public.daily_nutrition_summary(user_id, summary_date);
ALTER TABLE public.daily_nutrition_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily summaries" ON public.daily_nutrition_summary
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
