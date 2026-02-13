/**
 * Utility functions for parsing Genshin Impact talent scaling values.
 *
 * Handles various formats:
 * - Simple numbers: "49.53"
 * - Addition format: "34.18\n+\n34.18"
 * - Multiplication format: "48.42×3"
 * - Complex ATK/EM: "193.6 ATK\n+\n154.88 Elemental Mastery"
 * - Parenthesized multiplication: "(67.2 ATK\n+\n134.4 Elemental Mastery)×2"
 */

export interface ParsedScalingValue {
  /** Sum of all numeric coefficients for comparison purposes */
  totalValue: number;
  /** Whether parsing was successful */
  isValid: boolean;
  /** Multiplier if present (e.g., ×2, ×3) */
  multiplier: number;
}

/**
 * Extract the multiplier suffix from a value string (e.g., "×2", "×3")
 */
function extractMultiplier(value: string): {
  cleanedValue: string;
  multiplier: number;
} {
  const multiplierMatch = value.match(/[×x*](\d+)\s*$/i);
  if (multiplierMatch) {
    const multiplier = parseInt(multiplierMatch[1], 10);
    const cleanedValue = value.replace(/[×x*]\d+\s*$/i, '').trim();
    return { cleanedValue, multiplier };
  }
  return { cleanedValue: value, multiplier: 1 };
}

/**
 * Remove parentheses from the value string
 */
function removeParentheses(value: string): string {
  return value.replace(/[()]/g, '');
}

/**
 * Extract all numeric values from a string
 * Ignores text like "ATK", "Elemental Mastery", etc.
 */
function extractNumbers(value: string): number[] {
  // Match decimal numbers (including negative)
  const numberPattern = /-?\d+(?:\.\d+)?/g;
  const matches = value.match(numberPattern);
  if (!matches) return [];
  return matches.map((m) => parseFloat(m));
}

/**
 * Parse a scaling value string and return its computed numeric value.
 * The value is computed by:
 * 1. Extracting the multiplier suffix if present
 * 2. Removing parentheses
 * 3. Splitting by addition operators
 * 4. Summing all numeric coefficients
 * 5. Applying the multiplier
 */
export function parseScalingValue(value: string): ParsedScalingValue {
  if (!value || typeof value !== 'string') {
    return { totalValue: 0, isValid: false, multiplier: 1 };
  }

  try {
    const { cleanedValue, multiplier } = extractMultiplier(value);
    const withoutParens = removeParentheses(cleanedValue);

    // Split by addition operators (newlines with '+' or just '+')
    // Handle formats like "34.18\n+\n34.18" and "193.6 ATK\n+\n154.88 Elemental Mastery"
    const parts = withoutParens.split(/\n?\+\n?/);

    let total = 0;
    for (const part of parts) {
      const numbers = extractNumbers(part.trim());
      // Sum all numbers found in this part
      // For simple values, there's just one number
      // For complex values like "193.6 ATK", we take the coefficient
      if (numbers.length > 0) {
        total += numbers[0];
      }
    }

    total *= multiplier;

    return {
      totalValue: total,
      isValid: total > 0,
      multiplier,
    };
  } catch {
    return { totalValue: 0, isValid: false, multiplier: 1 };
  }
}

/**
 * Calculate the percentage change between two values
 * Returns the percentage increase (positive) or decrease (negative)
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0 || !isFinite(previous)) return 0;
  if (current === previous) return 0;

  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 100) / 100; // Round to 2 decimal places
}

/**
 * Check if a scaling entry has values that change across levels
 * Returns false for static values like "CD", "Energy Cost", "Stamina Cost"
 */
export function hasScalingValues(values: string[]): boolean {
  if (!values || values.length <= 1) return false;
  const first = parseScalingValue(values[0]);
  const last = parseScalingValue(values[values.length - 1]);
  return first.isValid && last.isValid && first.totalValue !== last.totalValue;
}

export function getScalingComparison(values: string[], currentLevel: number) {
  const result = {
    fromPreviousLevel: 0,
    fromFirstLevel: 0,
    showComparison: false,
    currentValue: 0,
  };

  if (!values || values.length <= 1) return result;
  if (currentLevel < 1) return result;

  const currentIndex = Math.min(currentLevel - 1, values.length - 1);
  const previousIndex = Math.max(currentIndex - 1, 0);
  const firstIndex = 0;

  const currentParsed = parseScalingValue(values[currentIndex]);
  const previousParsed = parseScalingValue(values[previousIndex]);
  const firstParsed = parseScalingValue(values[firstIndex]);

  if (!currentParsed.isValid) return result;

  result.currentValue = currentParsed.totalValue;

  // Only show comparison if values actually scale
  if (!hasScalingValues(values)) return result;

  // Calculate from previous level (only if not at level 1)
  if (currentLevel > 1 && previousParsed.isValid) {
    result.fromPreviousLevel = calculatePercentageChange(
      currentParsed.totalValue,
      previousParsed.totalValue
    );
  }

  // Calculate from first level (only if not at level 1)
  if (currentLevel > 1 && firstParsed.isValid) {
    result.fromFirstLevel = calculatePercentageChange(
      currentParsed.totalValue,
      firstParsed.totalValue
    );
  }

  result.showComparison =
    currentLevel > 1 &&
    (result.fromPreviousLevel !== 0 || result.fromFirstLevel !== 0);

  return result;
}
