import type { Talent } from '@/types';

export type AbilityReference = {
  name: string;
  talent: Talent;
  shortDescription: string;
};

/**
 * Extracts ability names from character talents and creates a lookup map
 * Handles both full names and effect names (e.g., "Abiogenesis: Solar Isotoma" -> ["Abiogenesis: Solar Isotoma", "Solar Isotoma"])
 */
export function extractAbilityNames(
  talents: Talent[]
): Map<string, AbilityReference> {
  const abilityMap = new Map<string, AbilityReference>();

  for (const talent of talents) {
    const { talentName, description } = talent;

    const shortDescription =
      description.length > 60
        ? description.substring(0, 60).trim() + '...'
        : description;

    abilityMap.set(talentName, {
      name: talentName,
      talent,
      shortDescription,
    });

    // If talent name contains a colon, also add the effect name (part after colon)
    // Example: "Abiogenesis: Solar Isotoma" -> also map "Solar Isotoma"
    if (talentName.includes(':')) {
      const parts = talentName.split(':');
      if (parts.length === 2) {
        const effectName = parts[1].trim();
        if (effectName.length > 5) {
          abilityMap.set(effectName, {
            name: talentName,
            talent,
            shortDescription,
          });
        }
      }
    }
  }

  return abilityMap;
}

/**
 * Creates a regex pattern to match ability names in text
 * Prioritizes longest matches first to avoid partial overlaps
 */
export function createAbilityPattern(abilityNames: string[]): RegExp | null {
  if (abilityNames.length === 0) return null;

  // Sort by length (longest first) to prioritize longer matches
  const sortedNames = [...abilityNames].sort((a, b) => b.length - a.length);

  // Escape special regex characters
  const escapedNames = sortedNames.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  // Create pattern with word boundaries
  // Use non-capturing group (?:...) for alternation
  const pattern = `\\b(?:${escapedNames.join('|')})\\b`;

  return new RegExp(pattern, 'gi');
}

/**
 * Segments text into parts: ability references and plain text
 */
export type TextSegment =
  | { type: 'text'; content: string }
  | { type: 'ability'; content: string; reference: AbilityReference };

export function segmentText(
  text: string,
  abilityMap: Map<string, AbilityReference>
): TextSegment[] {
  if (abilityMap.size === 0) {
    return [{ type: 'text', content: text }];
  }

  const abilityNames = Array.from(abilityMap.keys());
  const pattern = createAbilityPattern(abilityNames);

  if (!pattern) {
    return [{ type: 'text', content: text }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      const plainText = text.substring(lastIndex, matchIndex);
      segments.push({ type: 'text', content: plainText });
    }

    const reference = Array.from(abilityMap.entries()).find(
      ([key]) => key.toLowerCase() === matchedText.toLowerCase()
    )?.[1];

    if (reference) {
      segments.push({
        type: 'ability',
        content: matchedText,
        reference,
      });
    } else {
      segments.push({ type: 'text', content: matchedText });
    }

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return segments;
}
