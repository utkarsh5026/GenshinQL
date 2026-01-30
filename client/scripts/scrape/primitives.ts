import * as path from 'node:path';

import { logger } from '../logger.js';
import { loadFromPublic, saveToPublic } from './fileio.js';
import { BaseCharacterSchema, Primitives, primitivesSchema } from './schema.js';

const CHARACTERS_FILE = 'characters';
const PRIMITIVES_FILE = 'primitives';

/**
 * Extracts unique primitive values from character data
 * Uses Map for O(n) deduplication based on name as key
 */
function extractPrimitives(characters: BaseCharacterSchema[]): Primitives {
  const elementsMap = new Map<string, string>();
  const regionsMap = new Map<string, string>();
  const weaponTypesMap = new Map<string, string>();

  for (const char of characters) {
    if (char.element && char.elementUrl) {
      elementsMap.set(char.element, char.elementUrl);
    }
    if (char.region && char.regionUrl) {
      regionsMap.set(char.region, char.regionUrl);
    }
    if (char.weaponType && char.weaponUrl) {
      weaponTypesMap.set(char.weaponType, char.weaponUrl);
    }
  }

  const toSortedArray = (map: Map<string, string>) =>
    Array.from(map.entries())
      .map(([name, url]) => ({ name, url }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return {
    elements: toSortedArray(elementsMap),
    regions: toSortedArray(regionsMap),
    weaponTypes: toSortedArray(weaponTypesMap),
  };
}

/**
 * Main execution function
 */
async function generatePrimitives(): Promise<void> {
  logger.cyan('\n=== Generating Primitives from Characters Data ===\n');

  const characters =
    await loadFromPublic<BaseCharacterSchema[]>(CHARACTERS_FILE);

  if (!characters || !Array.isArray(characters)) {
    logger.error('Failed to load characters.json or invalid format');
    process.exit(1);
  }

  logger.success(`Loaded ${characters.length} characters`);

  logger.info('Extracting unique primitives...');
  const primitives = extractPrimitives(characters);

  logger.info('Validating primitives schema...');
  const result = primitivesSchema.safeParse(primitives);

  if (!result.success) {
    logger.error('Primitives validation failed:');
    result.error.issues.forEach((issue) => {
      logger.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  logger.success('Validation passed');
  logger.info(`  Elements: ${primitives.elements.length}`);
  logger.info(`  Regions: ${primitives.regions.length}`);
  logger.info(`  Weapon Types: ${primitives.weaponTypes.length}`);

  logger.info('Saving primitives.json...');
  await saveToPublic(primitives, PRIMITIVES_FILE);

  logger.success('\n=== Primitives generated successfully! ===\n');
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));

if (isMainModule) {
  generatePrimitives().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}
