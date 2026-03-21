/**
 * Built-in golf mobility & strength exercise library.
 * Used when Supabase exercises haven't loaded yet or are unavailable.
 * Covers all major swing fault categories.
 */
import type { Exercise } from '@/types/fitness';

export const FALLBACK_GOLF_EXERCISES: Exercise[] = [
  // ── EARLY EXTENSION ──────────────────────────────────────────────
  {
    id: 'fb_glute_bridge', name: 'Glute Bridge', description: 'Lie on your back, feet flat, drive hips up to full extension, squeeze glutes at top.',
    category: 'strength', subcategory: undefined, muscleGroups: ['glutes', 'core', 'hamstrings'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Builds glute strength to maintain posture through impact and prevent early extension.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_dead_bug', name: 'Dead Bug', description: 'Lie on back, arms up, lower opposite arm/leg while keeping low back flat to the floor.',
    category: 'strength', subcategory: undefined, muscleGroups: ['core', 'hip flexors'],
    movementPattern: 'anti_rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Trains anti-extension core stability — keeps spine angle from thrusting toward the ball.',
    tpiCategory: 'Core', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_hip_hinge', name: 'Hip Hinge to Wall', description: 'Stand 6 inches from wall, hinge hips back to touch wall, keeping spine neutral.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['glutes', 'hamstrings', 'core'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Teaches the athletic golf posture and trains glutes to stay loaded — fixes early extension.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_single_leg_rdl', name: 'Single-Leg Romanian Deadlift', description: 'Balance on one foot, hinge forward with flat back, reach opposite hand to floor.',
    category: 'strength', subcategory: undefined, muscleGroups: ['glutes', 'hamstrings', 'core'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'intermediate',
    isGolfSpecific: true, golfBenefit: 'Builds single-leg glute stability — critical for maintaining posture during the downswing.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['knees'], isSystemExercise: true, createdAt: '',
  },

  // ── HIP SWAY ──────────────────────────────────────────────────────
  {
    id: 'fb_lateral_band_walk', name: 'Lateral Band Walk (Bodyweight)', description: 'Stand in quarter squat, step sideways 10 steps each direction, keeping hips level.',
    category: 'strength', subcategory: undefined, muscleGroups: ['hip abductors', 'glutes', 'core'],
    movementPattern: 'squat', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Activates hip abductors and glute med — the muscles that prevent lateral sway in the backswing.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_standing_hip_rotation', name: 'Standing Hip Rotation Drill', description: 'In golf stance, rotate hips left and right while keeping upper body still.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['hip abductors', 'obliques', 'glutes'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Trains isolated hip rotation to replace sway with a proper rotary backswing motion.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_single_leg_squat', name: 'Single-Leg Squat (Box Tap)', description: 'Balance on one foot, slowly lower until opposite foot taps a box or step.',
    category: 'balance', subcategory: undefined, muscleGroups: ['glutes', 'hip abductors', 'quads'],
    movementPattern: 'squat', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'intermediate',
    isGolfSpecific: true, golfBenefit: 'Builds lateral hip stability — directly reduces sway and improves weight transfer.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: false, contraindicatedAreas: ['knees', 'ankles'], isSystemExercise: true, createdAt: '',
  },

  // ── CASTING / EARLY RELEASE ───────────────────────────────────────
  {
    id: 'fb_forearm_plank', name: 'Forearm Plank Hold', description: 'Hold plank on forearms and toes, hips level, for 30-60 seconds.',
    category: 'strength', subcategory: undefined, muscleGroups: ['core', 'lats', 'forearms'],
    movementPattern: 'anti_rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Strengthens the core and lat connection that enables lag retention through impact.',
    tpiCategory: 'Core', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['wrists', 'shoulders'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_wrist_rotation', name: 'Wrist Rotation & Strength', description: 'Extend arm, rotate wrist through full range 15x each direction, then hold closed fist for 10s.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['forearms', 'wrists'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Builds wrist strength and control to hold the angle and prevent casting.',
    tpiCategory: 'Arms', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['wrists'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_lat_pulldown_band', name: 'Lat Pull-Down (Band or Doorframe)', description: 'Loop band overhead or grip a doorframe, pull elbows down to sides, feeling lats engage.',
    category: 'strength', subcategory: undefined, muscleGroups: ['lats', 'core'],
    movementPattern: 'horizontal_pull', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Strong lats hold lag and prevent the arms from releasing the club too early.',
    tpiCategory: 'Upper Body', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['shoulders'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_rotation_pallof', name: 'Pallof Press (Isometric Anti-Rotation)', description: 'Stand side-on to a wall, press hands out and hold against rotational pull for 10 seconds.',
    category: 'strength', subcategory: undefined, muscleGroups: ['core', 'obliques', 'lats'],
    movementPattern: 'anti_rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'intermediate',
    isGolfSpecific: true, golfBenefit: 'Builds the anti-rotation strength that keeps lag stored longer in the downswing.',
    tpiCategory: 'Core', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },

  // ── RESTRICTED TURN ───────────────────────────────────────────────
  {
    id: 'fb_thoracic_rotation', name: 'Seated Thoracic Rotation', description: 'Sit on floor with knees bent, cross arms on chest, rotate upper body left and right as far as possible.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['thoracic spine', 'obliques'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Improves thoracic (mid-back) rotation — the most important area for a full shoulder turn.',
    tpiCategory: 'Thoracic Spine', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_thoracic_extension', name: 'Thoracic Extension Over Chair', description: 'Sit in a chair, clasp hands behind head, arch upper back over chair back for 30 seconds.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['thoracic spine'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Opens the thoracic spine, allowing a bigger shoulder turn without losing posture.',
    tpiCategory: 'Thoracic Spine', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_hip_flexor_stretch', name: 'Kneeling Hip Flexor Stretch', description: 'Kneel on one knee, lean forward into hip flexor, hold 30 seconds, switch sides.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['hip flexors', 'quads'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Tight hip flexors restrict the backswing turn — stretching them enables a fuller rotation.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['knees'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_standing_rotation_club', name: 'Standing Rotation Stretch (Club)', description: 'Hold club across shoulders, stand in golf posture, rotate to 9 o\'clock and 3 o\'clock positions slowly.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['thoracic spine', 'obliques', 'hip flexors'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Increases rotational range specifically in the golf posture position.',
    tpiCategory: 'Thoracic Spine', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },

  // ── CHICKEN WING ──────────────────────────────────────────────────
  {
    id: 'fb_tricep_extension', name: 'Tricep Extension (Overhead)', description: 'Clasp hands overhead, bend elbows, extend arms fully overhead 15 times.',
    category: 'strength', subcategory: undefined, muscleGroups: ['triceps', 'rear deltoids'],
    movementPattern: 'horizontal_push', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Strengthens the triceps needed to maintain a straight lead arm through impact.',
    tpiCategory: 'Upper Body', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['elbows', 'shoulders'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_rear_delt_fly', name: 'Rear Deltoid Fly (Floor)', description: 'Lie face down, arms out wide, lift arms off the floor squeezing shoulder blades together.',
    category: 'strength', subcategory: undefined, muscleGroups: ['rear deltoids', 'lats', 'rhomboids'],
    movementPattern: 'horizontal_pull', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Strengthens rear deltoids and lats to keep the trail arm connected through the swing.',
    tpiCategory: 'Upper Body', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['shoulders'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_arm_extension_drill', name: 'Lead Arm Extension Drill', description: 'In golf posture, extend lead arm forward and hold for 10 seconds, focusing on straight elbow.',
    category: 'golf_specific', subcategory: undefined, muscleGroups: ['triceps', 'lats', 'rear deltoids'],
    movementPattern: 'horizontal_push', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Trains the feel of a straight lead arm through impact — directly fixes the chicken wing.',
    tpiCategory: 'Arms', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['elbows'], isSystemExercise: true, createdAt: '',
  },

  // ── HEAD MOVEMENT ─────────────────────────────────────────────────
  {
    id: 'fb_plank_shoulder_tap', name: 'Plank Shoulder Tap', description: 'In high plank, alternate tapping each shoulder without rotating hips.',
    category: 'strength', subcategory: undefined, muscleGroups: ['core', 'glutes', 'shoulders'],
    movementPattern: 'anti_rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'intermediate',
    isGolfSpecific: true, golfBenefit: 'Trains anti-rotation stability — keeps the head and spine steady during the swing.',
    tpiCategory: 'Core', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: false, contraindicatedAreas: ['wrists', 'shoulders'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_neck_mobility', name: 'Neck Mobility Circles', description: 'Slowly roll neck in full circles, 5 forward, 5 reverse. Then side-to-side holds.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['neck', 'upper trapezius'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Reduces neck tension that causes head movement; allows steady head position through impact.',
    tpiCategory: 'Neck', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_core_rotation', name: 'Standing Core Rotation', description: 'Stand feet shoulder width, arms crossed on chest, rotate torso left and right 20 times.',
    category: 'golf_specific', subcategory: undefined, muscleGroups: ['core', 'obliques', 'glutes'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Strengthens rotational core to maintain a quiet head while the body rotates beneath it.',
    tpiCategory: 'Core', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },

  // ── WARMUP ────────────────────────────────────────────────────────
  {
    id: 'fb_leg_swing', name: 'Leg Swings (Front & Side)', description: 'Hold a wall for balance, swing one leg forward/back 10 times, then side-to-side 10 times. Switch legs.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['hip flexors', 'glutes', 'hamstrings'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Dynamic hip warmup that primes the hips for rotation and weight transfer.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_arm_circles', name: 'Arm Circles & Cross-Body Swings', description: 'Large arm circles 10 each direction, then cross-body arm swings 20 times to open shoulders.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['shoulders', 'thoracic spine'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Warms up shoulders and thoracic spine for a fluid backswing.',
    tpiCategory: 'Upper Body', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_cat_cow', name: 'Cat-Cow Spinal Mobility', description: 'On hands and knees, arch and round spine slowly for 10 reps, breathing deeply.',
    category: 'mobility', subcategory: undefined, muscleGroups: ['thoracic spine', 'core', 'hip flexors'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: false, golfBenefit: 'Mobilizes the entire spine, especially the lower back, before swinging.',
    tpiCategory: 'Thoracic Spine', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },

  // ── COOLDOWN ──────────────────────────────────────────────────────
  {
    id: 'fb_pigeon_pose', name: 'Pigeon Pose Hip Stretch', description: 'From plank, bring one knee forward at angle and lower hips. Hold 45 seconds each side.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['glutes', 'hip flexors', 'piriformis'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Releases tight hips and glutes post-workout for faster recovery.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: ['knees', 'hips'], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_seated_twist', name: 'Seated Spinal Twist', description: 'Sit with legs extended, cross one foot over, twist toward raised knee, hold 30 seconds each side.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['thoracic spine', 'obliques', 'hamstrings'],
    movementPattern: 'rotation', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: true, golfBenefit: 'Deep spinal rotation stretch to decompress the back after a swing session.',
    tpiCategory: 'Thoracic Spine', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_hamstring_stretch', name: 'Standing Hamstring Stretch', description: 'Place one foot on a low surface, keep back flat, hinge forward until you feel a stretch. 30 sec each side.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['hamstrings', 'lower back'],
    movementPattern: 'hip_hinge', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: false, golfBenefit: 'Tight hamstrings cause posture issues at address — stretching them improves spine angle.',
    tpiCategory: 'Hip', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
  {
    id: 'fb_shoulder_stretch', name: 'Cross-Body Shoulder Stretch', description: 'Bring one arm across body, use other hand to pull it in. Hold 30 seconds each side.',
    category: 'flexibility', subcategory: undefined, muscleGroups: ['shoulders', 'rear deltoids', 'lats'],
    movementPattern: 'horizontal_pull', equipmentNeeded: [], equipmentTier: 'none', difficulty: 'beginner',
    isGolfSpecific: false, golfBenefit: 'Reduces shoulder tension post-swing and maintains range of motion for follow-through.',
    tpiCategory: 'Upper Body', videoUrl: null, thumbnailUrl: null,
    isJointFriendly: true, contraindicatedAreas: [], isSystemExercise: true, createdAt: '',
  },
];
