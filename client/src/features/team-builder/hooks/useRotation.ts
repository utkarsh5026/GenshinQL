import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  RotationAbility,
  RotationSegment,
  TeamCharacterSlot,
} from '../types';
import { parseSteps, serializeSteps } from '../utils';

interface UseRotationOptions {
  value: string;
  onChange: (value: string) => void;
  slots: [
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
  ];
}

interface UseRotationReturn {
  segments: RotationSegment[];
  selectedCharName: string | null;
  filledSlots: (TeamCharacterSlot & {
    character: NonNullable<TeamCharacterSlot['character']>;
  })[];
  serializedLength: number;
  handleSelectChar: (name: string) => void;
  handleAddAbility: (ability: RotationAbility) => void;
  handleAddAbilityToSegment: (
    segmentId: string,
    ability: RotationAbility
  ) => void;
  handleRemoveAbilityFromSegment: (
    segmentId: string,
    abilityIndex: number
  ) => void;
  handleRemoveSegment: (segmentId: string) => void;
  handleNoteChange: (segmentId: string, note: string) => void;
  handleReorderSegments: (newSegments: RotationSegment[]) => void;
  handleReset: () => void;
}

/** Manages rotation segment state and all associated handlers for the rotation editor. */
export function useRotation({
  value,
  onChange,
  slots,
}: UseRotationOptions): UseRotationReturn {
  const filledSlots = useMemo(
    () =>
      slots.filter(
        (
          s
        ): s is TeamCharacterSlot & {
          character: NonNullable<TeamCharacterSlot['character']>;
        } => s.character !== null
      ),
    [slots]
  );

  const iconUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of filledSlots) map[s.character.name] = s.character.iconUrl;
    return map;
  }, [filledSlots]);

  const validNames = useMemo(
    () => filledSlots.map((s) => s.character.name),
    [filledSlots]
  );

  const [segments, setSegments] = useState<RotationSegment[]>(() =>
    parseSteps(value, validNames, iconUrlMap)
  );
  const [selectedCharName, setSelectedCharName] = useState<string | null>(null);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onChange(serializeSteps(segments));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  /** Reset segments when the parent clears the value externally. */
  useEffect(() => {
    if (value === '' && segments.length > 0) {
      setSegments([]);
      setSelectedCharName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelectChar = useCallback((name: string) => {
    setSelectedCharName((prev) => (prev === name ? null : name));
  }, []);

  /**
   * If the last segment belongs to the selected character, append the ability there.
   * Otherwise start a new segment for the selected character.
   */
  const handleAddAbility = useCallback(
    (ability: RotationAbility) => {
      if (!selectedCharName) return;
      const iconUrl = iconUrlMap[selectedCharName] ?? '';
      setSegments((prev) => {
        const last = prev[prev.length - 1];
        if (last?.characterName === selectedCharName) {
          return prev.map((s, i) =>
            i === prev.length - 1
              ? { ...s, abilities: [...s.abilities, ability] }
              : s
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            characterName: selectedCharName,
            characterIconUrl: iconUrl,
            abilities: [ability],
            note: '',
          },
        ];
      });
    },
    [selectedCharName, iconUrlMap]
  );

  /** Append an ability to any existing segment (inline card [+] button). */
  const handleAddAbilityToSegment = useCallback(
    (segmentId: string, ability: RotationAbility) => {
      setSegments((prev) =>
        prev.map((s) =>
          s.id === segmentId
            ? { ...s, abilities: [...s.abilities, ability] }
            : s
        )
      );
    },
    []
  );

  /** Remove a single ability from a segment by index. Removes the segment if it becomes empty. */
  const handleRemoveAbilityFromSegment = useCallback(
    (segmentId: string, abilityIndex: number) => {
      setSegments((prev) => {
        const updated = prev
          .map((s) =>
            s.id === segmentId
              ? {
                  ...s,
                  abilities: s.abilities.filter((_, i) => i !== abilityIndex),
                }
              : s
          )
          .filter((s) => s.abilities.length > 0);
        return updated;
      });
    },
    []
  );

  const handleRemoveSegment = useCallback((segmentId: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== segmentId));
  }, []);

  const handleNoteChange = useCallback((segmentId: string, note: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, note } : s))
    );
  }, []);

  const handleReorderSegments = useCallback(
    (newSegments: RotationSegment[]) => {
      setSegments(newSegments);
    },
    []
  );

  const handleReset = useCallback(() => {
    setSegments([]);
    setSelectedCharName(null);
  }, []);

  const serializedLength = useMemo(
    () => serializeSteps(segments).length,
    [segments]
  );

  return {
    segments,
    selectedCharName,
    filledSlots,
    serializedLength,
    handleSelectChar,
    handleAddAbility,
    handleAddAbilityToSegment,
    handleRemoveAbilityFromSegment,
    handleRemoveSegment,
    handleNoteChange,
    handleReorderSegments,
    handleReset,
  };
}
