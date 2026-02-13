/**
 * Abbreviates long substat labels for compact display in filters
 */
export const getCompactSubstatLabel = (substat: string): string => {
  const abbreviations: Record<string, string> = {
    'Elemental Mastery': 'EM',
    'Energy Recharge': 'ER',
  };
  return abbreviations[substat] || substat;
};
