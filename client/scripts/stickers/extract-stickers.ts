import * as path from 'node:path';

import chalk from 'chalk';

import { logger } from '../logger.js';
import {
  listFiles,
  loadJsonData,
  PUBLIC_DIR,
  saveToPublic,
} from '../scrape/fileio.js';

interface CharacterSticker {
  url: string;
  caption: string;
}

interface CharacterData {
  name: string;
  gallery?: {
    stickers?: CharacterSticker[];
  };
}

type StickersData = Record<string, string[]>;

async function extractStickers(): Promise<void> {
  console.log(chalk.cyan('\n🎮 Sticker Extraction Script'));
  console.log(chalk.gray('━'.repeat(50)));

  const charactersDir = path.join(PUBLIC_DIR, 'characters');
  const files = await listFiles(charactersDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  logger.info(`\n📂 Found ${jsonFiles.length} character files`);

  const stickersData: StickersData = {};
  let totalStickers = 0;
  let charactersWithStickers = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(charactersDir, file);
    const character = await loadJsonData<CharacterData>(filePath);

    if (!character) {
      logger.warn(`⚠️  Could not load: ${file}`);
      continue;
    }

    const stickers = character.gallery?.stickers ?? [];

    if (stickers.length > 0) {
      const urls = stickers.map((s) => s.url);
      stickersData[character.name] = urls;
      totalStickers += urls.length;
      charactersWithStickers++;

      logger.debug(
        `   ${character.name}: ${chalk.green(stickers.length)} stickers`
      );
    }
  }

  console.log(chalk.gray('\n━'.repeat(50)));
  logger.success(`\n✅ Extraction complete!`);
  logger.info(`   Characters with stickers: ${charactersWithStickers}`);
  logger.info(`   Total stickers: ${totalStickers}`);

  await saveToPublic(stickersData, 'stickers.json');

  console.log(chalk.gray('\n━'.repeat(50)));
  logger.success('🎉 stickers.json generated successfully!\n');
}

extractStickers().catch((error) => {
  logger.error('Failed to extract stickers:', error);
  process.exit(1);
});
