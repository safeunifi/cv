interface Point {
  x: number;
  y: number;
}

export function angleBetweenThreePoints(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dotProduct = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

export function angleFromVertical(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.abs(Math.atan2(dx, dy)) * (180 / Math.PI);
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const IDEAL_RANGES: Record<string, Record<string, [number, number]>> = {
  address: {
    'Spine Angle': [25, 35],
    'Knee Flex': [15, 25],
    'Hip Bend': [30, 45],
  },
  topOfBackswing: {
    'Shoulder Turn': [85, 100],
    'Hip Turn': [40, 55],
    'X-Factor': [35, 55],
    'Lead Arm': [170, 185],
    'Wrist Hinge': [80, 100],
  },
  impact: {
    'Spine Angle': [25, 40],
    'Hip Turn': [35, 50],
    'Shaft Lean': [5, 15],
    'Head Movement': [0, 3],
  },
  finish: {
    'Shoulder Turn': [160, 180],
    'Finish Balance': [85, 100],
  },
};

export type AngleEvaluation = 'ideal' | 'acceptable' | 'poor' | 'notApplicable';

export function evaluateAngle(
  angleName: string,
  value: number,
  phase: string,
): AngleEvaluation {
  const ranges = IDEAL_RANGES[phase];
  if (!ranges) return 'notApplicable';

  const range = ranges[angleName];
  if (!range) return 'notApplicable';

  const [low, high] = range;
  if (value >= low && value <= high) return 'ideal';

  const deficit = value < low ? low - value : value - high;
  return deficit > 15 ? 'poor' : 'acceptable';
}
