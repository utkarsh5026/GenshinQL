import type { Character } from '@/types';

import { ELEMENTAL_REACTIONS } from '../constants/elemental-reactions';

/** A labeled group of characters for the sectioned picker. */
export interface CharacterGroup {
  /** Unique key for React rendering and dedup. */
  id: string;
  /** Display label, e.g., "Vaporize (Hydro)", "Pyro (Resonance)". */
  label: string;
  /** Optional element name for section coloring. */
  element?: string;
  /** Characters in this group. */
  characters: Character[];
}

/** Returns true if the character has at least one of the specified roles. */
function hasAnyRole(character: Character, roles: string[]): boolean {
  if (!character.roles || character.roles.length === 0) return false;
  return character.roles.some((r) => roles.includes(r));
}

/** Moves matched characters into the placed set and returns them. */
function placeCharacters(
  characters: Character[],
  placed: Set<string>
): Character[] {
  characters.forEach((c) => placed.add(c.name));
  return characters;
}

/** Builds groups for Step 0 — Main DPS. */
function groupDps(available: Character[]): CharacterGroup[] {
  const recommended = available.filter(
    (c) => hasAnyRole(c, ['DPS']) && hasAnyRole(c, ['On-Field'])
  );
  const recommendedNames = new Set(recommended.map((c) => c.name));
  const others = available.filter((c) => !recommendedNames.has(c.name));

  return [
    { id: 'recommended', label: 'Recommended', characters: recommended },
    { id: 'other', label: 'Other Characters', characters: others },
  ];
}

/** Builds groups for Step 1 — Sub DPS. */
function groupSubDps(
  available: Character[],
  dpsElement: string | undefined
): CharacterGroup[] {
  if (!dpsElement) {
    const offField = available.filter((c) =>
      hasAnyRole(c, ['Off-Field', 'DPS'])
    );
    const offFieldNames = new Set(offField.map((c) => c.name));
    const others = available.filter((c) => !offFieldNames.has(c.name));
    return [
      { id: 'off-field', label: 'Off-Field DPS', characters: offField },
      { id: 'other', label: 'Other Characters', characters: others },
    ];
  }

  const placed = new Set<string>();
  const groups: CharacterGroup[] = [];

  /** Same-element for resonance */
  const sameElement = available.filter(
    (c) =>
      c.element.toLowerCase() === dpsElement.toLowerCase() &&
      hasAnyRole(c, ['Off-Field', 'DPS']) &&
      !placed.has(c.name)
  );
  if (sameElement.length > 0) {
    placeCharacters(sameElement, placed);
    groups.push({
      id: `resonance-${dpsElement}`,
      label: `${dpsElement} (Resonance)`,
      element: dpsElement,
      characters: sameElement,
    });
  }

  /** Reaction partner groups */
  const reactions = ELEMENTAL_REACTIONS[dpsElement] ?? [];
  for (const reaction of reactions) {
    const chars = available.filter(
      (c) =>
        c.element.toLowerCase() === reaction.partnerElement.toLowerCase() &&
        hasAnyRole(c, ['Off-Field', 'DPS']) &&
        !placed.has(c.name)
    );
    if (chars.length > 0) {
      placeCharacters(chars, placed);
      groups.push({
        id: `reaction-${reaction.reactionName}-${reaction.partnerElement}`,
        label: `${reaction.reactionName} (${reaction.partnerElement})`,
        element: reaction.partnerElement,
        characters: chars,
      });
    }
  }

  /** Remaining */
  const others = available.filter((c) => !placed.has(c.name));
  groups.push({ id: 'other', label: 'Other Characters', characters: others });

  return groups;
}

/** Builds groups for Steps 2-3 — Support. */
function groupSupport(
  available: Character[],
  teamElements: string[]
): CharacterGroup[] {
  const placed = new Set<string>();
  const groups: CharacterGroup[] = [];
  const supportRoles = ['Support', 'Survivability', 'Off-Field'];

  /** Count element occurrences to find resonance potential */
  const elementCounts: Record<string, number> = {};
  teamElements.forEach((el) => {
    elementCounts[el] = (elementCounts[el] || 0) + 1;
  });

  /** Resonance potential groups: elements appearing exactly once */
  for (const [element, count] of Object.entries(elementCounts)) {
    if (count === 1) {
      const chars = available.filter(
        (c) =>
          c.element.toLowerCase() === element.toLowerCase() &&
          hasAnyRole(c, supportRoles) &&
          !placed.has(c.name)
      );
      if (chars.length > 0) {
        placeCharacters(chars, placed);
        groups.push({
          id: `resonance-${element}`,
          label: `${element} (Resonance)`,
          element,
          characters: chars,
        });
      }
    }
  }

  /** Reaction groups from team elements */
  const uniqueTeamElements = [...new Set(teamElements)];
  const seenReactions = new Set<string>();

  for (const element of uniqueTeamElements) {
    const reactions = ELEMENTAL_REACTIONS[element] ?? [];
    for (const reaction of reactions) {
      const reactionKey = `${reaction.reactionName}-${reaction.partnerElement}`;
      if (seenReactions.has(reactionKey)) continue;
      seenReactions.add(reactionKey);

      /** Skip if partner element is already on the team */
      if (
        uniqueTeamElements.some(
          (el) => el.toLowerCase() === reaction.partnerElement.toLowerCase()
        )
      )
        continue;

      const chars = available.filter(
        (c) =>
          c.element.toLowerCase() === reaction.partnerElement.toLowerCase() &&
          hasAnyRole(c, supportRoles) &&
          !placed.has(c.name)
      );
      if (chars.length > 0) {
        placeCharacters(chars, placed);
        groups.push({
          id: `reaction-${reactionKey}`,
          label: `${reaction.reactionName} (${reaction.partnerElement})`,
          element: reaction.partnerElement,
          characters: chars,
        });
      }
    }
  }

  /** Remaining */
  const others = available.filter((c) => !placed.has(c.name));
  groups.push({ id: 'other', label: 'Other Characters', characters: others });

  return groups;
}

/**
 * Computes smart character groups based on the current wizard step and previous selections.
 * Returns an array of labeled groups with characters sorted by relevance.
 *
 * @param step - Current wizard step index (0=DPS, 1=Sub DPS, 2-3=Support)
 * @param selections - Array of 4 character selections (null = skipped/empty)
 * @param allCharacters - Full list of available characters
 */
export function computeCharacterGroups(
  step: number,
  selections: (Character | null)[],
  allCharacters: Character[]
): CharacterGroup[] {
  /** Exclude already-selected characters */
  const selectedNames = new Set(selections.filter(Boolean).map((c) => c!.name));
  const available = allCharacters.filter((c) => !selectedNames.has(c.name));

  if (step === 0) {
    return groupDps(available);
  }

  if (step === 1) {
    const dpsElement = selections[0]?.element;
    return groupSubDps(available, dpsElement);
  }

  /** Steps 2-3: Support */
  const teamElements = selections
    .slice(0, step)
    .filter(Boolean)
    .map((c) => c!.element);
  return groupSupport(available, teamElements);
}
