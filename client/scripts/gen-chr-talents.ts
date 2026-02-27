/**
 * Generates client/public/chrTalents.json from individual character JSON files.
 *
 * Output format:
 *   { [characterName]: [normalAttack, elementalSkill, elementalBurst] }
 * where each entry is { name: string; iconUrl: string }.
 *
 * Run from repo root: bun run scripts/gen-chr-talents.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CHARS_DIR = join(
  import.meta.dirname,
  '..',
  'client',
  'public',
  'characters'
);
const OUTPUT_FILE = join(
  import.meta.dirname,
  '..',
  'client',
  'public',
  'chrTalents.json'
);

const TALENT_TYPES = [
  'Normal Attack',
  'Elemental Skill',
  'Elemental Burst',
] as const;

type TalentIconEntry = { name: string; iconUrl: string };
type CharTalentsMap = Record<
  string,
  [TalentIconEntry, TalentIconEntry, TalentIconEntry]
>;

const result: CharTalentsMap = {};

const files = await readdir(CHARS_DIR);
let processed = 0;
let skipped = 0;

for (const file of files.sort()) {
  if (!file.endsWith('.json')) continue;

  const raw = await readFile(join(CHARS_DIR, file), 'utf8');
  const data = JSON.parse(raw) as {
    name: string;
    talents?: Array<{
      talentName: string;
      talentIcon: string;
      talentType: string;
    }>;
  };

  if (!data.name || !Array.isArray(data.talents)) {
    console.warn(`Skipping ${file}: missing name or talents array`);
    skipped++;
    continue;
  }

  const entries = TALENT_TYPES.map((type) => {
    const talent = data.talents!.find((t) => t.talentType === type);
    return {
      name: talent?.talentName ?? '',
      iconUrl: talent?.talentIcon ?? '',
    };
  }) as [TalentIconEntry, TalentIconEntry, TalentIconEntry];

  result[data.name] = entries;
  processed++;
}

await writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2));

console.log(`Done. Processed ${processed} characters, skipped ${skipped}.`);
console.log(`Output: ${OUTPUT_FILE}`);
