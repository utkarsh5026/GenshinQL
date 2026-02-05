/**
 * Cleans and formats a description by removing common section headers
 * and truncating to the first 3 sentences.
 */
export const formatDescription = (desc: string): string => {
  const cleaned = desc
    .replace(/^Description\n.*?\n/i, '')
    .replace(/^Gameplay Notes\n.*?\n/i, '')
    .replace(/^Advanced Properties\n.*?\n/i, '')
    .replace(/^Attribute Scaling\n.*?\n/i, '')
    .replace(/^Preview\n/i, '')
    .trim();
  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');
};
