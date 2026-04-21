// Weight conversions
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}

// Height conversions
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches: inches === 12 ? 0 : inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

// Volume conversions
export function mlToOz(ml: number): number {
  return Math.round(ml / 29.5735 * 10) / 10;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * 29.5735 * 10) / 10;
}

// Display helpers
export function formatWeight(kg: number, imperial: boolean): string {
  if (imperial) {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

export function formatHeight(cm: number, imperial: boolean): string {
  if (imperial) {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

export function formatVolume(ml: number, imperial: boolean): string {
  if (imperial) {
    return `${mlToOz(ml)} oz`;
  }
  return `${ml} ml`;
}
