import { generateId as uuid } from '../utils/id';
import { SwingFault, DrillRecommendation } from '../models/types';

const FAULT_TO_DRILLS: Record<string, string[]> = {
  'Early Extension': ['wall_drill', 'chair_drill', 'belt_buckle_down'],
  'Hip Sway': ['hip_bump_wall', 'alignment_stick_hips', 'feet_together'],
  'Casting / Early Release': ['lag_towel_drill', 'pump_drill', 'split_hand_drill'],
  'Restricted Turn': ['shoulder_turn_chair', 'cross_arm_rotation', 'hip_mobility_stretch'],
  'Chicken Wing': ['towel_under_arms', 'trail_arm_only', 'impact_bag'],
  'Head Movement': ['mirror_head_steady', 'hat_brim_focus', 'short_swing_drill'],
};

/** Generate drill recommendations based on detected faults */
export function recommendDrills(faults: SwingFault[]): DrillRecommendation[] {
  const recommendations: DrillRecommendation[] = [];
  const added = new Set<string>();

  for (let i = 0; i < faults.length; i++) {
    const drillIds = FAULT_TO_DRILLS[faults[i].name] ?? ['alignment_fundamentals', 'tempo_whoosh_drill'];
    for (const drillId of drillIds) {
      if (!added.has(drillId)) {
        added.add(drillId);
        recommendations.push({
          id: uuid(),
          drillId,
          priority: i + 1,
          reason: `Addresses: ${faults[i].name}`,
        });
      }
    }
  }

  return recommendations;
}
