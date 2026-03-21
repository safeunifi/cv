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
-- User profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  handicap numeric,
  golf_experience text,
  fitness_goals text[] default '{}',
  injury_areas text[] default '{}',
  equipment_tier text default 'none',
  height_cm numeric,
  weight_kg numeric,
  age integer,
  target_calories integer,
  target_protein_g integer,
  dietary_preferences text[] default '{}',
  updated_at timestamptz default now()
);

-- Exercises library
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  muscle_groups text[] default '{}',
  movement_pattern text,
  equipment_needed text[] default '{}',
  contraindicated_areas text[] default '{}',
  golf_benefit text,
  video_url text,
  difficulty text default 'beginner',
  duration_seconds integer default 30,
  created_at timestamptz default now()
);

-- Workout plans
create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  swing_faults text[] default '{}',
  created_at timestamptz default now()
);

-- Workout sessions
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references workout_plans(id),
  started_at timestamptz default now(),
  completed_at timestamptz,
  exercises_completed integer default 0,
  notes text
);

-- Recipes
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  meal_type text,
  calories_per_serving integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer default 1,
  ingredients jsonb default '[]',
  instructions text[] default '{}',
  tags text[] default '{}',
  dietary_flags text[] default '{}',
  created_at timestamptz default now()
);

-- Meal plans
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  days integer default 7,
  target_calories integer,
  target_protein_g integer,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Meal plan entries
create table if not exists meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references meal_plans(id) on delete cascade,
  recipe_id uuid references recipes(id),
  day_number integer not null,
  meal_type text not null,
  servings numeric default 1
);

-- Grocery list items
create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references meal_plans(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category text default 'other',
  is_checked boolean default false,
  created_at timestamptz default now()
);

-- Swing sessions
create table if not exists swing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  overall_score integer,
  faults jsonb default '[]',
  strengths text[] default '{}',
  analysis_data jsonb,
  recorded_at timestamptz default now()
);

-- Enable Row Level Security (users only see their own data)
alter table profiles enable row level security;
alter table workout_plans enable row level security;
alter table workout_sessions enable row level security;
alter table meal_plans enable row level security;
alter table meal_plan_entries enable row level security;
alter table grocery_items enable row level security;
alter table swing_sessions enable row level security;

-- Policies (allow users to read/write their own rows)
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own workout plans" on workout_plans for all using (auth.uid() = user_id);
create policy "Users manage own sessions" on workout_sessions for all using (auth.uid() = user_id);
create policy "Users manage own meal plans" on meal_plans for all using (auth.uid() = user_id);
create policy "Users manage own meal entries" on meal_plan_entries for all
  using (plan_id in (select id from meal_plans where user_id = auth.uid()));
create policy "Users manage own grocery items" on grocery_items for all using (auth.uid() = user_id);
create policy "Users manage own swing sessions" on swing_sessions for all using (auth.uid() = user_id);
create policy "Anyone reads exercises" on exercises for select using (true);
create policy "Anyone reads recipes" on recipes for select using (true);
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
