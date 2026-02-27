import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  RotationAbility,
  RotationStep,
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
  steps: RotationStep[];
  selectedCharName: string | null;
  filledSlots: (TeamCharacterSlot & {
    character: NonNullable<TeamCharacterSlot['character']>;
  })[];
  serializedLength: number;
  handleSelectChar: (name: string) => void;
  handleAddStep: (ability: RotationAbility) => void;
  handleRemoveStep: (index: number) => void;
  handleNoteChange: (index: number, note: string) => void;
  handleReset: () => void;
}

/** Manages rotation step state and all associated handlers for the rotation editor. */
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

  const [steps, setSteps] = useState<RotationStep[]>(() =>
    parseSteps(value, validNames, iconUrlMap)
  );
  const [selectedCharName, setSelectedCharName] = useState<string | null>(null);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onChange(serializeSteps(steps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  /** Reset steps when the parent clears the value externally. */
  useEffect(() => {
    if (value === '' && steps.length > 0) {
      setSteps([]);
      setSelectedCharName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelectChar = useCallback((name: string) => {
    setSelectedCharName((prev) => (prev === name ? null : name));
  }, []);

  const handleAddStep = useCallback(
    (ability: RotationAbility) => {
      if (!selectedCharName) return;
      const iconUrl = iconUrlMap[selectedCharName] ?? '';
      setSteps((prev) => [
        ...prev,
        {
          characterName: selectedCharName,
          characterIconUrl: iconUrl,
          ability,
          note: '',
        },
      ]);
      setSelectedCharName(null);
    },
    [selectedCharName, iconUrlMap]
  );

  const handleRemoveStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleNoteChange = useCallback((index: number, note: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, note } : s)));
  }, []);

  const handleReset = useCallback(() => {
    setSteps([]);
    setSelectedCharName(null);
  }, []);

  const serializedLength = useMemo(() => serializeSteps(steps).length, [steps]);

  return {
    steps,
    selectedCharName,
    filledSlots,
    serializedLength,
    handleSelectChar,
    handleAddStep,
    handleRemoveStep,
    handleNoteChange,
    handleReset,
  };
}
