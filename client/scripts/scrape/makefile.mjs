#!/usr/bin/env node

/**
 * Makefile-like script for running scrape commands.
 * This script provides a unified interface for all scraping operations.
 *
 * Usage: node makefile.mjs <command>
 *
 * Commands:
 *   help                  - Show this help message
 *   characters-base       - Scrape base character data
 *   characters-detailed   - Scrape detailed character data
 *   characters-check      - Check character data coverage
 *   gallery               - Scrape and merge gallery data
 *   gallery-check         - Check gallery data coverage
 *   talents               - Scrape talent materials
 *   weapons-base          - Scrape base weapon data
 *   weapons-detailed      - Scrape detailed weapon data
 *   weapons-calendar      - Scrape weapon material calendar
 *   weapons-full          - Scrape all weapon data (base + calendar + optimize)
 *   primitives            - Generate primitives from characters data
 *   all                   - Run all scraping tasks
 */

import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPTS_DIR = dirname(__dirname);
const CLIENT_DIR = dirname(SCRIPTS_DIR);
const SCRAPE_DIR = __dirname;

const chalkModulePath = join(
  CLIENT_DIR,
  'node_modules',
  'chalk',
  'source',
  'index.js'
);
const chalkModuleURL = pathToFileURL(chalkModulePath).href;
const chalk = await import(chalkModuleURL).then((m) => m.default);

const tasks = {
  help: {
    description: 'Show this help message',
    category: 'Help',
    action: showHelp,
  },

  'characters-base': {
    description: 'Scrape base character data from wiki table',
    category: 'Characters',
    action: () => runTsxScript('characters.ts', ['--base']),
  },
  'characters-detailed': {
    description: 'Scrape detailed character data (talents, constellations)',
    category: 'Characters',
    action: () => runTsxScript('characters.ts', ['--detailed']),
  },
  'characters-check': {
    description: 'Check character data coverage and validation',
    category: 'Characters',
    action: () => runTsxScript('characters.ts', ['--check']),
  },
  characters: {
    description: 'Scrape all character data (base + detailed)',
    category: 'Characters',
    action: async () => {
      await runTsxScript('characters.ts', ['--base']);
      await runTsxScript('characters.ts', ['--detailed']);
    },
  },

  gallery: {
    description: 'Scrape and merge gallery data for characters',
    category: 'Gallery',
    action: () => runTsxScript('gallery.ts', ['--merge']),
  },
  'gallery-check': {
    description: 'Check gallery data coverage',
    category: 'Gallery',
    action: () => runTsxScript('gallery.ts', ['--check']),
  },

  talents: {
    description: 'Scrape talent materials schedule',
    category: 'Talents',
    action: () => runTsxScript('talents.ts', []),
  },

  'weapons-base': {
    description: 'Scrape base weapon data from wiki tables',
    category: 'Weapons',
    action: () => runTsxScript('weapons.ts', ['--base']),
  },
  'weapons-detailed': {
    description: 'Scrape detailed weapon data (materials, ascension)',
    category: 'Weapons',
    action: () => runTsxScript('weapons.ts', ['--detailed']),
  },
  'weapons-calendar': {
    description: 'Scrape weapon material calendar',
    category: 'Weapons',
    action: () => runTsxScript('weapons.ts', ['--calendar']),
  },
  'weapons-full': {
    description: 'Scrape all weapon data (base + calendar + optimize)',
    category: 'Weapons',
    action: () => runTsxScript('weapons.ts', ['--base', '--calendar']),
  },
  weapons: {
    description: 'Scrape all weapon data (base + detailed)',
    category: 'Weapons',
    action: async () => {
      await runTsxScript('weapons.ts', ['--base']);
      await runTsxScript('weapons.ts', ['--detailed']);
    },
  },

  primitives: {
    description: 'Generate primitives from characters data',
    category: 'Data Processing',
    action: () => runTsxScript('primitives.ts', []),
  },
};

/**
 * Run a TypeScript script from the scrape directory using tsx
 */
function runTsxScript(script, args = []) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const npxCommand = isWindows ? 'npx.cmd' : 'npx';
    const scriptPath = join(SCRAPE_DIR, script);

    console.log(chalk.cyan(`Running: tsx ${script} ${args.join(' ')}`));
    console.log();

    // On Windows with shell, we need to quote the path if it contains spaces
    const quotedPath = isWindows ? `"${scriptPath}"` : scriptPath;

    const child = spawn(npxCommand, ['tsx', quotedPath, ...args], {
      cwd: CLIENT_DIR,
      stdio: 'inherit',
      shell: isWindows,
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log();
        console.log(chalk.green('✓ Done!'));
        resolve();
      } else {
        reject(new Error(`Script failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Display help message with all available commands
 */
function showHelp() {
  console.log();
  console.log(chalk.bold.cyan('GenshinQL Scraper - Available Commands'));
  console.log();

  const categories = {};
  for (const [name, task] of Object.entries(tasks)) {
    if (!categories[task.category]) {
      categories[task.category] = [];
    }
    categories[task.category].push({ name, ...task });
  }

  for (const [category, categoryTasks] of Object.entries(categories)) {
    console.log(chalk.bold.yellow(`  ${category}`));
    console.log(chalk.dim('  ─────────────────────────────────────'));

    for (const task of categoryTasks) {
      const taskName = chalk.green(`make ${task.name.padEnd(20)}`);
      console.log(`  ${taskName} ${task.description}`);
    }

    console.log();
  }

  return Promise.resolve();
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const taskName = args[0] || 'help';

  if (!tasks[taskName]) {
    console.error(chalk.red(`Error: Unknown task "${taskName}"`));
    console.log();
    console.log(chalk.dim('Run "make help" to see available tasks'));
    process.exit(1);
  }

  try {
    await tasks[taskName].action();
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

await main();
