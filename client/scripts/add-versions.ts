import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CHARACTERS_JSON = path.join(PUBLIC_DIR, 'characters.json');
const CHARACTERS_DIR = path.join(PUBLIC_DIR, 'characters');

async function main() {
  console.log(chalk.cyan('🔍 Reading characters.json...'));
  const raw = await fs.readFile(CHARACTERS_JSON, 'utf-8');
  const data = JSON.parse(raw);

  const characters: Array<Record<string, unknown>> = data.characters;
  let updated = 0;
  let missing = 0;
  let noVersion = 0;

  for (const char of characters) {
    const name = char.name as string;
    const fileName = name.replace(/ /g, '_') + '.json';
    const filePath = path.join(CHARACTERS_DIR, fileName);

    let individualData: Record<string, unknown>;
    try {
      const fileRaw = await fs.readFile(filePath, 'utf-8');
      individualData = JSON.parse(fileRaw);
    } catch {
      console.log(chalk.yellow(`  ⚠ Missing file: ${fileName}`));
      missing++;
      continue;
    }

    const version = individualData.version as string | undefined;
    if (!version) {
      console.log(chalk.gray(`  – No version: ${name}`));
      noVersion++;
      continue;
    }

    char.version = version;
    updated++;
    console.log(chalk.green(`  ✓ ${name}`) + chalk.gray(` → ${version}`));
  }

  await fs.writeFile(CHARACTERS_JSON, JSON.stringify(data, null, 4));

  console.log('');
  console.log(chalk.bold('Summary:'));
  console.log(chalk.green(`  Updated:     ${updated}`));
  console.log(chalk.gray(`  No version:  ${noVersion}`));
  console.log(chalk.yellow(`  Missing file: ${missing}`));
  console.log(chalk.cyan('✅ characters.json updated.'));
}

main().catch((err) => {
  console.error(chalk.red('Error:'), err);
  process.exit(1);
});
