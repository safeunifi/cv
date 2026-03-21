# Greenfit — Setup Guide
### Step-by-step for complete beginners. No experience needed.

---

## What you need before starting

- A computer (Mac or Windows)
- Your phone (iPhone or Android)
- About 20 minutes

---

## STEP 1 — Download the tools on your computer

### 1A. Install Node.js (the engine that runs the app)

1. Open your web browser
2. Go to: **https://nodejs.org**
3. Click the big green button that says **"LTS"** (the recommended version)
4. Open the file that downloads and click through the installer (just keep clicking Next/Continue)
5. When it's done, close the installer

### 1B. Install a code editor (so you can see and edit files)

1. Go to: **https://code.visualstudio.com**
2. Click **Download** for your computer type (Mac or Windows)
3. Install it the same way — open the file, click through

---

## STEP 2 — Open the Greenfit project in your code editor

1. Open **Visual Studio Code** (the app you just installed)
2. Click **File** in the top menu → **Open Folder**
3. Find the folder called **Greenfit** on your computer and select it
4. You should now see a list of files on the left side panel

---

## STEP 3 — Open the Terminal (the black command window)

Inside Visual Studio Code:

1. Click **Terminal** in the top menu
2. Click **New Terminal**
3. A black/dark panel will open at the bottom of the screen

You'll type commands in here. After each command, press **Enter** to run it.

---

## STEP 4 — Install the app's dependencies

In the terminal, type this exactly and press Enter:

```
npm install
```

Wait for it to finish. You'll see a lot of text scroll by — that's normal. It takes 1-3 minutes. When it stops and you see a `$` or `>` symbol again, it's done.

---

## STEP 5 — Create your secret keys file

This is the most important step. Your API keys go in a special file called `.env` that lives inside the `Greenfit` folder. This file is **never uploaded to GitHub** — it stays only on your computer.

### 5A. Create the file

In Visual Studio Code:
1. Look at the file list on the left side
2. Find the file called `.env.example` — it's already there
3. Right-click on it → **Copy**
4. Right-click on empty space in the file list → **Paste**
5. You now have a file called `.env.example copy` — rename it to exactly: `.env`
   - Right-click the copy → **Rename** → type `.env` → press Enter

**OR** if you prefer using the terminal:

```
cp .env.example .env
```

### 5B. Open the .env file

Click on `.env` in the file list. You'll see this:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
EXPO_PUBLIC_USDA_API_KEY=your-usda-key-here
```

You need to replace the placeholder values with your real keys. Instructions for each are below.

---

## STEP 6 — Get your Supabase keys (the database)

Your app's data (workouts, meals, profiles) is stored in Supabase — a free cloud database.

1. Go to: **https://supabase.com**
2. Click **Sign Up** and create a free account (or Sign In if you have one)
3. Click **New Project**
   - Give it a name like `greenfit`
   - Set a database password (write it down somewhere safe)
   - Choose a region closest to you
   - Click **Create new project**
4. Wait about 1 minute for it to set up
5. Once it's ready, click the **gear icon** (Settings) in the left sidebar
6. Click **API** in the settings menu
7. You'll see two values you need:

**Project URL** — looks like: `https://abcdefghijkl.supabase.co`
**anon public** key — a long string starting with `eyJ...`

8. Copy the **Project URL** and paste it into your `.env` file, replacing `https://your-project-id.supabase.co`
9. Copy the **anon public** key and paste it, replacing `your-anon-key-here`

After this step, your `.env` file should look like:
```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyODAwLCJleHAiOjE5NjA3Njg4MDB9.EXAMPLE_KEY_HERE
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
EXPO_PUBLIC_USDA_API_KEY=your-usda-key-here
```

---

## STEP 7 — Get your Anthropic API key (the AI coach)

This powers the NemoClaw AI golf coach.

1. Go to: **https://console.anthropic.com**
2. Sign up for an account (or sign in)
3. You'll need to add a credit card — usage is very cheap (a few cents per conversation)
4. Click **API Keys** in the left sidebar
5. Click **Create Key**
6. Give it a name like `greenfit`
7. Copy the key — it starts with `sk-ant-`

**IMPORTANT:** You only get to see this key once. Copy it immediately.

8. Paste it into your `.env` file, replacing `sk-ant-your-key-here`

---

## STEP 8 — Get your USDA food key (optional — for nutrition search)

This is free and lets users search real foods by name.

1. Go to: **https://fdc.nal.usda.gov/api-guide.html**
2. Click **Sign Up for an API Key**
3. Fill in your name and email
4. Check your email for the key (arrives in a few minutes)
5. Paste it into your `.env` file, replacing `your-usda-key-here`

**Note:** The app works fine without this key — food search just won't return results.

---

## STEP 9 — Your completed .env file

When all four keys are filled in, your `.env` file should look like this (with your real values):

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...your-real-key
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...your-real-key
EXPO_PUBLIC_USDA_API_KEY=abc123yourkeyhere
```

Save the file: press **Ctrl+S** (Windows) or **Cmd+S** (Mac).

---

## STEP 10 — Set up the database tables

Your Supabase database needs tables created before the app can store anything.

1. Go back to **https://supabase.com** → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire block below into the editor:

```sql
-- ============================================================
-- GreenFit — Full Database Schema
-- Paste this entire block into the Supabase SQL Editor and Run
-- ============================================================

-- 1. PROFILES
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

-- 2. FOOD LOG ENTRIES
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

-- 3. CUSTOM FOODS
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

-- 4. WATER LOG
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

-- 5. RECIPES
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

-- 6. RECIPE INGREDIENTS
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

-- 7. MEAL PLANS
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

-- 8. MEAL PLAN ENTRIES
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

-- 9. GROCERY LISTS
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

-- 10. EXERCISES
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

-- 11. WORKOUT PLANS
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

-- 12. WORKOUT LOGS
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

-- 13. PROGRESS TRACKING
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
```

5. Click the **Run** button (or press Ctrl+Enter)
6. You should see "Success. No rows returned" — that means it worked

---

## STEP 11 — Install Expo Go on your phone

Expo Go is the free app that lets you run Greenfit on your phone during development.

**iPhone:**
1. Open the App Store
2. Search for **Expo Go**
3. Install the free app by Expo

**Android:**
1. Open the Google Play Store
2. Search for **Expo Go**
3. Install the free app by Expo

---

## STEP 12 — Run the app!

1. Make sure your phone and computer are on the **same WiFi network**
2. In Visual Studio Code, open the Terminal (Terminal menu → New Terminal)
3. Type this and press Enter:

```
npx expo start
```

4. Wait about 30 seconds. You'll see a big QR code appear in the terminal.

**iPhone:** Open the **Camera app** → point it at the QR code → tap the notification that appears

**Android:** Open the **Expo Go app** → tap **Scan QR code** → point it at the QR code

5. The Greenfit app will load on your phone. It takes about 30-60 seconds the first time.

---

## Troubleshooting

**"Module not found" error when running npx expo start**
→ Run `npm install` again first, then try `npx expo start`

**QR code doesn't work on iPhone**
→ Make sure you're using the Camera app, not Expo Go, to scan it

**"Network error" or app won't load**
→ Make sure your phone and computer are on the same WiFi network (not one on WiFi, one on cellular)

**AI Coach says "add your API key"**
→ Check that your `.env` file has `EXPO_PUBLIC_ANTHROPIC_API_KEY=` with a real key, then restart `npx expo start`

**Supabase errors in the app**
→ Double-check that you ran the SQL in Step 10, and that the URL and key in `.env` are copied correctly (no spaces, no extra characters)

**"Port 8081 is already in use"**
→ Type `npx expo start --port 8082` instead

---

## Where everything lives

| What | Where on your computer |
|------|----------------------|
| The app code | `Greenfit/` folder |
| Your secret keys | `Greenfit/.env` (never touches GitHub) |
| The key template | `Greenfit/.env.example` (safe to share) |
| This setup guide | `Greenfit/SETUP.md` |
| Marketing scripts | `Greenfit/MARKETING.md` |
| AI Coach code | `Greenfit/lib/ai/neoclaw-coach.ts` |
| Swing workout code | `Greenfit/app/(tabs)/fitness/swing/` |
| Nutrition screens | `Greenfit/app/(tabs)/nutrition/` |
| Database (cloud) | Supabase — https://supabase.com |
| Swing video (local) | On your phone only (not uploaded anywhere) |

---

## You're set up! What to test first

1. **Create an account** — tap Sign Up on the first screen
2. **Fill in your profile** — handicap, injuries, fitness goals
3. **Record a swing** — go to the Fitness tab → Swing Analysis → Record
4. **See your results** — score, faults detected, recommended drills
5. **Generate a workout** — tap "Fix Your Swing Workout"
6. **Ask the AI coach** — tap "Ask Your AI Coach" and type a question
7. **Set up nutrition** — go to the Nutrition tab → set your macro targets → generate a meal plan

---

*Questions? Issues? Open a GitHub issue or reach out directly.*
