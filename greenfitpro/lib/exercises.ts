export type ExerciseCategory = "strength" | "mobility" | "power" | "flexibility" | "balance" | "golf_specific";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  isGolfSpecific: boolean;
  golfBenefit?: string;
  description: string;
  sets: string;
  reps: string;
  rest: string;
  instructions: string[];
  tips: string[];
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // Golf-specific
  {
    id: "med_ball_rotation",
    name: "Med Ball Rotational Throw",
    category: "golf_specific",
    muscleGroups: ["Core", "Obliques", "Shoulders"],
    equipment: ["Medicine ball", "Wall"],
    difficulty: "intermediate",
    isGolfSpecific: true,
    golfBenefit: "Develops rotational power and X-Factor separation",
    description: "Mimic golf swing rotation with explosive power using a medicine ball.",
    sets: "3–4", reps: "8–10 per side", rest: "90s",
    instructions: [
      "Stand 3 feet from a wall, medicine ball in both hands",
      "Rotate away from the wall like a backswing",
      "Explosively rotate and throw the ball into the wall",
      "Catch and repeat on the same side",
    ],
    tips: ["Drive from your hips, not just your arms", "Think 'hip bump' to start the throw"],
  },
  {
    id: "pallof_press",
    name: "Pallof Press",
    category: "golf_specific",
    muscleGroups: ["Core", "Anti-rotation"],
    equipment: ["Cable machine or resistance band"],
    difficulty: "beginner",
    isGolfSpecific: true,
    golfBenefit: "Builds anti-rotation core stability for consistent impact",
    description: "Anti-rotation press that trains core stability critical for golf.",
    sets: "3", reps: "10–12 per side", rest: "60s",
    instructions: [
      "Attach band to a fixed point at chest height",
      "Stand perpendicular to the anchor point",
      "Hold band with both hands at chest",
      "Press hands straight out, hold 2 seconds, return",
    ],
    tips: ["Do not rotate toward or away from the anchor", "Keep core braced throughout"],
  },
  {
    id: "hip_90_90",
    name: "90/90 Hip Stretch",
    category: "mobility",
    muscleGroups: ["Hip flexors", "Glutes", "Piriformis"],
    equipment: [],
    difficulty: "beginner",
    isGolfSpecific: true,
    golfBenefit: "Improves hip mobility for deeper rotation in backswing",
    description: "Essential hip mobility drill for golf rotation.",
    sets: "2–3", reps: "Hold 60s per side", rest: "30s",
    instructions: [
      "Sit on floor, both knees bent at 90°, one in front, one to the side",
      "Keep chest tall and back straight",
      "Lean forward slightly over front shin",
      "Switch sides and repeat",
    ],
    tips: ["Don't round your back", "Use hands on ground for support initially"],
  },
  {
    id: "deadbug",
    name: "Dead Bug",
    category: "strength",
    muscleGroups: ["Core", "Lower back"],
    equipment: [],
    difficulty: "beginner",
    isGolfSpecific: true,
    golfBenefit: "Builds core stability that transfers to swing stability",
    description: "Core control exercise that builds the stability needed for consistent swings.",
    sets: "3", reps: "8–10 per side", rest: "60s",
    instructions: [
      "Lie on back, arms up over chest, knees bent 90° in the air",
      "Slowly lower one arm overhead and opposite leg toward floor",
      "Keep lower back pressed into floor throughout",
      "Return to start and switch sides",
    ],
    tips: ["Lower back must not arch off the floor", "Breathe out as you extend"],
  },
  // Strength
  {
    id: "goblet_squat",
    name: "Goblet Squat",
    category: "strength",
    muscleGroups: ["Quads", "Glutes", "Core"],
    equipment: ["Kettlebell or dumbbell"],
    difficulty: "beginner",
    isGolfSpecific: false,
    description: "Fundamental lower body strength movement for golf power base.",
    sets: "3–4", reps: "8–12", rest: "90s",
    instructions: [
      "Hold a kettlebell at chest height with both hands",
      "Stand feet shoulder-width apart, toes slightly out",
      "Squat down keeping chest tall and knees tracking over toes",
      "Drive through heels to stand",
    ],
    tips: ["Keep elbows inside your knees at the bottom", "Full depth if mobility allows"],
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift (RDL)",
    category: "strength",
    muscleGroups: ["Hamstrings", "Glutes", "Lower back"],
    equipment: ["Barbell or dumbbells"],
    difficulty: "intermediate",
    isGolfSpecific: false,
    description: "Hip hinge pattern that builds posterior chain strength for golf power.",
    sets: "3–4", reps: "8–10", rest: "2 min",
    instructions: [
      "Hold bar or dumbbells in front of thighs",
      "Hinge at hips, pushing them back while maintaining flat back",
      "Lower weight along legs until you feel hamstring stretch",
      "Drive hips forward to return to standing",
    ],
    tips: ["Soft bend in knees throughout", "Feel it in your hamstrings, not your lower back"],
  },
  {
    id: "cable_row",
    name: "Seated Cable Row",
    category: "strength",
    muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    equipment: ["Cable machine"],
    difficulty: "beginner",
    isGolfSpecific: false,
    description: "Upper back strength that helps maintain posture during the golf swing.",
    sets: "3", reps: "10–12", rest: "75s",
    instructions: [
      "Sit at cable machine, feet on footplate, slight knee bend",
      "Grab handle with neutral grip, sit tall",
      "Pull handle to lower chest, squeezing shoulder blades",
      "Slowly return to start",
    ],
    tips: ["Do not round your lower back", "Lead with elbows, not hands"],
  },
  // Mobility
  {
    id: "thoracic_rotation",
    name: "Thoracic Spine Rotation",
    category: "mobility",
    muscleGroups: ["Thoracic spine", "Obliques"],
    equipment: ["Mat"],
    difficulty: "beginner",
    isGolfSpecific: true,
    golfBenefit: "Directly improves shoulder turn capacity",
    description: "Targeted mobility drill for upper back rotation — the engine of a good shoulder turn.",
    sets: "2–3", reps: "10 per side", rest: "30s",
    instructions: [
      "Start in quadruped (hands and knees position)",
      "Place one hand behind your head",
      "Rotate that elbow toward the floor, then open up to the ceiling",
      "Follow the movement with your eyes",
    ],
    tips: ["Keep hips square throughout", "Move slowly and breathe into the rotation"],
  },
  {
    id: "hip_flexor_stretch",
    name: "Kneeling Hip Flexor Stretch",
    category: "flexibility",
    muscleGroups: ["Hip flexors", "Quads"],
    equipment: ["Mat"],
    difficulty: "beginner",
    isGolfSpecific: true,
    golfBenefit: "Reduces hip tightness that causes restricted turn",
    description: "Essential stretch for opening up the hips for better backswing rotation.",
    sets: "2", reps: "Hold 45–60s per side", rest: "30s",
    instructions: [
      "Kneel on one knee, other foot forward",
      "Drive your hips forward gently",
      "Raise the same-side arm as kneeling knee overhead",
      "Lean slightly away to intensify the stretch",
    ],
    tips: ["Feel the stretch at the front of your hip, not your knee", "Tuck pelvis slightly under"],
  },
  // Power
  {
    id: "box_jump",
    name: "Box Jump",
    category: "power",
    muscleGroups: ["Quads", "Glutes", "Calves"],
    equipment: ["Plyo box"],
    difficulty: "intermediate",
    isGolfSpecific: false,
    description: "Develops lower body explosiveness that translates to clubhead speed.",
    sets: "3–4", reps: "5–6", rest: "2 min",
    instructions: [
      "Stand facing a box at a comfortable distance",
      "Dip slightly and swing arms back",
      "Explosively jump onto the box, landing softly",
      "Stand fully upright, then step or jump down",
    ],
    tips: ["Land with soft knees", "Focus on quality over height", "Reset fully between reps"],
  },
  // Balance
  {
    id: "single_leg_rdl",
    name: "Single Leg RDL",
    category: "balance",
    muscleGroups: ["Hamstrings", "Glutes", "Core"],
    equipment: ["Dumbbell (optional)"],
    difficulty: "intermediate",
    isGolfSpecific: true,
    golfBenefit: "Trains single-leg balance critical for impact stability",
    description: "Balance and posterior chain drill that mimics the demands of the golf swing finish.",
    sets: "3", reps: "8–10 per side", rest: "75s",
    instructions: [
      "Stand on one leg, slight bend in knee",
      "Hinge forward at hip, extending free leg behind you",
      "Lower torso parallel to floor",
      "Drive standing hip forward to return upright",
    ],
    tips: ["Keep hips square, don't rotate open", "Look at a fixed point for balance"],
  },
];

export type MobilityRoutine = {
  id: string;
  name: string;
  duration: string;
  target: string;
  exercises: { name: string; duration: string; notes: string }[];
};

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: "pre_round",
    name: "Pre-Round Warm-Up",
    duration: "10 min",
    target: "Full body activation",
    exercises: [
      { name: "Leg swings (front/back)", duration: "30s per side", notes: "Loosen hip flexors" },
      { name: "Arm circles", duration: "30s each direction", notes: "Shoulder warm-up" },
      { name: "Thoracic rotation", duration: "10 per side", notes: "Open up shoulder turn" },
      { name: "Hip 90/90 hold", duration: "30s per side", notes: "Hip mobility" },
      { name: "Half-swing practice swings", duration: "10 swings", notes: "Feel the tempo" },
      { name: "Full swing rehearsal", duration: "10 swings", notes: "Build to full speed gradually" },
    ],
  },
  {
    id: "post_round",
    name: "Post-Round Recovery",
    duration: "10 min",
    target: "Reduce soreness & stiffness",
    exercises: [
      { name: "Kneeling hip flexor stretch", duration: "60s per side", notes: "Release hip flexors" },
      { name: "Seated forward fold", duration: "60s", notes: "Hamstrings and lower back" },
      { name: "Figure-4 glute stretch", duration: "60s per side", notes: "Piriformis release" },
      { name: "Doorway chest stretch", duration: "45s per side", notes: "Pec and shoulder opening" },
      { name: "Cat-cow", duration: "10 reps", notes: "Spinal mobility and decompression" },
    ],
  },
  {
    id: "swing_mobility",
    name: "Swing Mobility Boost",
    duration: "15 min",
    target: "Increase rotation range",
    exercises: [
      { name: "Thoracic rotation (quadruped)", duration: "10 per side", notes: "Key for shoulder turn" },
      { name: "Hip 90/90 stretch", duration: "60s per side", notes: "Hip internal rotation" },
      { name: "Scorpion stretch", duration: "8 per side", notes: "Thoracic and hip mobility" },
      { name: "Wall hip flexor stretch", duration: "60s per side", notes: "Open backswing" },
      { name: "Lateral lunge hold", duration: "45s per side", notes: "Groin and adductor mobility" },
      { name: "Seated rotation with club", duration: "15 per side", notes: "Practice range of motion" },
    ],
  },
];
