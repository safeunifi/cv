/**
 * Golf-specific nutrition data: on-course snacks, hydration timing, and round fueling strategy.
 *
 * Based on sports nutrition research for endurance activities lasting 4-5 hours.
 * A typical 18-hole round burns 1,200-2,000 calories depending on walking vs riding.
 */

export interface GolfSnack {
  id: string;
  name: string;
  description: string;
  /** When during the round to eat it */
  timing: 'pre-round' | 'front-nine' | 'turn' | 'back-nine' | 'post-round';
  /** Suggested serving description */
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  /** Why it's good for golf specifically */
  golfBenefit: string;
  /** Tags for filtering */
  tags: string[];
}

export interface HydrationTip {
  timing: string;
  recommendation: string;
  amount: string;
}

export const HYDRATION_PLAN: HydrationTip[] = [
  { timing: '2 hours before tee time', recommendation: 'Drink water to start hydrated', amount: '16-20 oz' },
  { timing: '10 minutes before tee time', recommendation: 'Small sip of water or electrolyte drink', amount: '8 oz' },
  { timing: 'Every 3 holes', recommendation: 'Drink water consistently — don\'t wait until thirsty', amount: '6-8 oz' },
  { timing: 'Hot weather (80°F+)', recommendation: 'Add electrolyte mix or sports drink every other water break', amount: '8-12 oz per 3 holes' },
  { timing: 'Post-round', recommendation: 'Rehydrate with water + electrolytes', amount: '16-24 oz' },
];

export const GOLF_SNACKS: GolfSnack[] = [
  // Pre-Round
  {
    id: 'pre_oatmeal',
    name: 'Oatmeal with Banana & Almonds',
    description: 'Slow-release carbs with potassium for sustained energy. Eat 60-90 min before tee time.',
    timing: 'pre-round',
    serving: '1 cup oats + 1 banana + 1 tbsp almond butter',
    calories: 420, protein: 14, carbs: 68, fat: 12, fiber: 8,
    golfBenefit: 'Steady blood sugar means consistent focus from hole 1 through 18',
    tags: ['complex-carbs', 'potassium', 'sustained-energy'],
  },
  {
    id: 'pre_toast_eggs',
    name: 'Whole Grain Toast with Eggs',
    description: 'Balanced protein and carbs to fuel your round without feeling heavy on the first tee.',
    timing: 'pre-round',
    serving: '2 slices whole grain + 2 scrambled eggs',
    calories: 380, protein: 22, carbs: 36, fat: 14, fiber: 5,
    golfBenefit: 'Protein + complex carbs keep energy steady without digestive distraction',
    tags: ['protein', 'complex-carbs', 'balanced'],
  },
  {
    id: 'pre_smoothie',
    name: 'Green Smoothie',
    description: 'Light, nutrient-dense pre-round option that digests quickly.',
    timing: 'pre-round',
    serving: '1 cup spinach + 1 banana + 1/2 cup berries + 1 scoop protein',
    calories: 280, protein: 24, carbs: 38, fat: 4, fiber: 6,
    golfBenefit: 'Quick-digesting nutrients without bloating — great for early tee times',
    tags: ['quick-digesting', 'vitamins', 'light'],
  },

  // Front Nine
  {
    id: 'fn_trail_mix',
    name: 'Golf Trail Mix',
    description: 'Almonds, walnuts, dried cranberries, and dark chocolate chips. Calorie-dense and portable.',
    timing: 'front-nine',
    serving: '1/4 cup (small handful)',
    calories: 180, protein: 5, carbs: 18, fat: 11, fiber: 3,
    golfBenefit: 'Healthy fats + natural sugars sustain focus between holes 3-6',
    tags: ['healthy-fats', 'portable', 'no-prep'],
  },
  {
    id: 'fn_banana',
    name: 'Banana',
    description: 'Nature\'s perfect golf snack — packed with potassium to prevent muscle cramps.',
    timing: 'front-nine',
    serving: '1 medium banana',
    calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3,
    golfBenefit: 'Potassium prevents cramping; natural sugars provide a quick energy lift',
    tags: ['potassium', 'quick-energy', 'no-prep'],
  },
  {
    id: 'fn_apple_pb',
    name: 'Apple Slices with Peanut Butter',
    description: 'Natural sugars paired with protein and healthy fats for sustained energy.',
    timing: 'front-nine',
    serving: '1 apple + 1 tbsp peanut butter',
    calories: 195, protein: 4, carbs: 30, fat: 8, fiber: 5,
    golfBenefit: 'Fiber slows sugar release — no crash on the back nine',
    tags: ['fiber', 'healthy-fats', 'sustained-energy'],
  },
  {
    id: 'fn_rx_bar',
    name: 'Whole Food Protein Bar',
    description: 'Clean ingredient bar (RXBar, KIND, etc.) — easy to stash in your bag.',
    timing: 'front-nine',
    serving: '1 bar',
    calories: 210, protein: 12, carbs: 24, fat: 9, fiber: 5,
    golfBenefit: 'Convenient protein keeps muscles fueled during walking rounds',
    tags: ['protein', 'convenient', 'portable'],
  },

  // Turn (Between 9 and 10)
  {
    id: 'turn_turkey_wrap',
    name: 'Turkey & Avocado Wrap',
    description: 'Light, protein-packed wrap that won\'t weigh you down for the back nine.',
    timing: 'turn',
    serving: '1 whole wheat tortilla + 3 oz turkey + 1/4 avocado + lettuce',
    calories: 320, protein: 24, carbs: 28, fat: 12, fiber: 6,
    golfBenefit: 'Real food at the turn — protein for back-nine muscle endurance',
    tags: ['protein', 'balanced', 'real-food'],
  },
  {
    id: 'turn_chicken_salad',
    name: 'Chicken Salad Cup',
    description: 'Greek yogurt-based chicken salad with celery and grapes. High protein, low heaviness.',
    timing: 'turn',
    serving: '3/4 cup chicken salad + whole grain crackers',
    calories: 290, protein: 28, carbs: 22, fat: 10, fiber: 3,
    golfBenefit: 'Lean protein without the sluggishness of a heavy clubhouse meal',
    tags: ['high-protein', 'low-glycemic', 'prepared'],
  },
  {
    id: 'turn_pb_sandwich',
    name: 'PB & Honey on Whole Wheat',
    description: 'Classic combo: quick energy from honey, sustained energy from PB and whole grains.',
    timing: 'turn',
    serving: '1 sandwich (2 slices bread + 2 tbsp PB + 1 tbsp honey)',
    calories: 440, protein: 14, carbs: 56, fat: 18, fiber: 5,
    golfBenefit: 'Dual-speed carbs: honey hits fast, whole grains sustain through holes 13-18',
    tags: ['dual-energy', 'classic', 'filling'],
  },

  // Back Nine
  {
    id: 'bn_dates',
    name: 'Medjool Dates with Almonds',
    description: 'Natural energy bombs — quick sugar with mineral-rich calories.',
    timing: 'back-nine',
    serving: '3 dates + 8 almonds',
    calories: 245, protein: 4, carbs: 48, fat: 7, fiber: 5,
    golfBenefit: 'Fast-acting natural sugars when fatigue sets in around hole 14-15',
    tags: ['quick-energy', 'minerals', 'portable'],
  },
  {
    id: 'bn_jerky',
    name: 'Beef or Turkey Jerky',
    description: 'High-protein, zero-sugar option that\'s easy to eat between shots.',
    timing: 'back-nine',
    serving: '1 oz (about 4-5 pieces)',
    calories: 80, protein: 13, carbs: 3, fat: 1, fiber: 0,
    golfBenefit: 'Protein keeps muscles from fatiguing on late-round swings',
    tags: ['high-protein', 'portable', 'savory'],
  },
  {
    id: 'bn_energy_balls',
    name: 'Oat Energy Balls',
    description: 'Homemade: oats, PB, honey, dark chocolate chips, rolled into balls.',
    timing: 'back-nine',
    serving: '2 balls',
    calories: 200, protein: 6, carbs: 28, fat: 8, fiber: 3,
    golfBenefit: 'Compact energy for the final push — quick to eat, no crumbs in the cart',
    tags: ['homemade', 'quick-energy', 'compact'],
  },
  {
    id: 'bn_cheese_crackers',
    name: 'Cheese & Whole Grain Crackers',
    description: 'Protein and fat from cheese with complex carbs from crackers.',
    timing: 'back-nine',
    serving: '1.5 oz cheese + 6 crackers',
    calories: 230, protein: 10, carbs: 20, fat: 12, fiber: 2,
    golfBenefit: 'Steady energy release for the last 4-5 holes of the round',
    tags: ['protein', 'balanced', 'portable'],
  },

  // Post-Round
  {
    id: 'post_protein_shake',
    name: 'Protein Recovery Shake',
    description: 'Whey or plant protein with banana and milk — hit protein within 30 min of finishing.',
    timing: 'post-round',
    serving: '1 scoop protein + 1 banana + 8 oz milk',
    calories: 340, protein: 32, carbs: 40, fat: 6, fiber: 3,
    golfBenefit: 'Kickstarts muscle recovery — especially after a walking round',
    tags: ['recovery', 'high-protein', 'quick'],
  },
  {
    id: 'post_grilled_chicken',
    name: 'Grilled Chicken with Sweet Potato',
    description: 'Post-round meal that replaces glycogen stores and rebuilds muscle.',
    timing: 'post-round',
    serving: '5 oz chicken + 1 medium sweet potato + side salad',
    calories: 480, protein: 42, carbs: 48, fat: 8, fiber: 7,
    golfBenefit: 'Complete recovery meal instead of the usual burger and beer at the 19th hole',
    tags: ['recovery', 'complete-meal', 'high-protein'],
  },
  {
    id: 'post_salmon_bowl',
    name: 'Salmon & Rice Bowl',
    description: 'Omega-3 rich salmon with rice and veggies for full recovery.',
    timing: 'post-round',
    serving: '4 oz salmon + 1 cup rice + mixed vegetables',
    calories: 520, protein: 34, carbs: 55, fat: 16, fiber: 4,
    golfBenefit: 'Omega-3s reduce inflammation from 4+ hours of repetitive swing motion',
    tags: ['omega-3', 'anti-inflammatory', 'complete-meal'],
  },
];

export const TIMING_INFO: Record<string, { label: string; description: string; emoji: string }> = {
  'pre-round': {
    label: 'Pre-Round',
    description: '60-90 minutes before tee time. Focus on complex carbs + moderate protein.',
    emoji: '🌅',
  },
  'front-nine': {
    label: 'Front Nine',
    description: 'Light, portable snacks every 3-4 holes. Keep it simple and easy to eat.',
    emoji: '⛳',
  },
  turn: {
    label: 'The Turn',
    description: 'Skip the hot dog. A balanced mini-meal here is the key to back-nine performance.',
    emoji: '🔄',
  },
  'back-nine': {
    label: 'Back Nine',
    description: 'Combat fatigue with quick energy + protein. This is where most golfers fade.',
    emoji: '🏌️',
  },
  'post-round': {
    label: 'Post-Round Recovery',
    description: 'Protein + carbs within 30-45 minutes. Your body needs real fuel, not just beer.',
    emoji: '🏆',
  },
};

export function getSnacksByTiming(timing: string): GolfSnack[] {
  return GOLF_SNACKS.filter((s) => s.timing === timing);
}

/**
 * Build a sample round fueling plan with one pick per timing window.
 */
export function buildRoundPlan(): { timing: string; snack: GolfSnack }[] {
  const timings = ['pre-round', 'front-nine', 'turn', 'back-nine', 'post-round'];
  return timings.map((timing) => {
    const options = getSnacksByTiming(timing);
    const pick = options[Math.floor(Math.random() * options.length)];
    return { timing, snack: pick };
  });
}
