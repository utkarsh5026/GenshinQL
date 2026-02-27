/* Export all utilities from team-builder feature */

import type { RotationAbility, RotationSegment } from '../types';

/**
 * One segment per line: "CharacterName ABILITY>ABILITY>ABILITY (note)"
 * Single-ability old format "CharacterName ABILITY (note)" is also matched (backward-compat).
 */
const SEGMENT_PATTERN =
  /^(.+?) ((?:E|Q|NA|CA)(?:>(?:E|Q|NA|CA))*)(?: \((.+)\))?$/;

/**
 * Serialize a rotation segments array into a plain multi-line string.
 * Format per line: "CharacterName E>CA>Q" or "CharacterName E>CA>Q (note)"
 */
export function serializeSteps(segments: RotationSegment[]): string {
  return segments
    .map((s) => {
      const base = `${s.characterName} ${s.abilities.join('>')}`;
      return s.note.trim() ? `${base} (${s.note.trim()})` : base;
    })
    .join('\n');
}

/**
 * Parse a plain rotation string back into structured segments.
 * Lines that don't match the pattern are skipped.
 * If validNames is provided, only lines whose character name is in the set are included.
 */
export function parseSteps(
  text: string,
  validNames: string[],
  iconUrlMap: Record<string, string>
): RotationSegment[] {
  if (!text.trim()) return [];
  const nameSet = new Set(validNames);
  const segments: RotationSegment[] = [];
  for (const line of text.split('\n')) {
    const match = line.trim().match(SEGMENT_PATTERN);
    if (!match) continue;
    const [, characterName, abilitiesStr, note = ''] = match;
    if (nameSet.size > 0 && !nameSet.has(characterName)) continue;
    segments.push({
      id: crypto.randomUUID(),
      characterName,
      characterIconUrl: iconUrlMap[characterName] ?? '',
      abilities: abilitiesStr.split('>') as RotationAbility[],
      note,
    });
  }
  return segments;
}
