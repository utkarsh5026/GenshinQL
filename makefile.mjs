#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_DIR = join(__dirname, 'client');

const chalkModulePath = join(
  APP_DIR,
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
  install: {
    description: 'Install dependencies',
    category: 'Development',
    action: runBunInstall,
  },
  dev: {
    description: 'Start development server',
    category: 'Development',
    action: () => runBunCommand('dev'),
  },
  build: {
    description: 'Build for production',
    category: 'Build',
    action: () => runBunCommand('build'),
  },
  preview: {
    description: 'Preview production build',
    category: 'Build',
    action: () => runBunCommand('preview'),
  },
  lint: {
    description: 'Run ESLint',
    category: 'Quality',
    action: () => runBunCommand('lint'),
  },
  autofix: {
    description: 'Auto-fix linting issues (including import sorting)',
    category: 'Quality',
    action: () => runBunCommand('lint:fix'),
  },
  typecheck: {
    description: 'Run TypeScript type checking',
    category: 'Quality',
    action: () => runTypeCheck(),
  },
  format: {
    description: 'Format code with Prettier',
    category: 'Quality',
    action: () => runBunCommand('format'),
  },
  'format-check': {
    description: 'Check code formatting',
    category: 'Quality',
    action: () => runBunCommand('format:check'),
  },
  'pre-commit': {
    description: 'Run all CI checks (lint, typecheck, build)',
    category: 'Quality',
    action: runPreCommit,
  },
  test: {
    description: 'Run all tests',
    category: 'Testing',
    action: () => runBunCommand('test'),
  },
  'test-watch': {
    description: 'Run tests in watch mode',
    category: 'Testing',
    action: () => runBunCommand('test:watch'),
  },
  validate: {
    description: 'Run lint, typecheck, and format-check',
    category: 'Quality',
    action: runValidate,
  },
  ci: {
    description: 'Run all CI checks (validate + test + build)',
    category: 'Quality',
    action: runCI,
  },
  update: {
    description: 'Update dependencies',
    category: 'Maintenance',
    action: () => runCommand('bun', ['update']),
  },
  outdated: {
    description: 'Check for outdated dependencies',
    category: 'Maintenance',
    action: () => runCommand('bun', ['outdated']),
  },
  audit: {
    description: 'Run security audit',
    category: 'Maintenance',
    action: () => runCommand('bun', ['pm', 'audit']),
  },
  'audit-fix': {
    description: 'Fix security vulnerabilities',
    category: 'Maintenance',
    action: () => runCommand('bun', ['pm', 'audit', '--fix']),
  },
  clean: {
    description: 'Remove node_modules and dist',
    category: 'Maintenance',
    action: cleanProject,
  },
  'clean-cache': {
    description: 'Clear build caches',
    category: 'Maintenance',
    action: cleanCache,
  },
  'fresh-install': {
    description: 'Clean and reinstall dependencies',
    category: 'Maintenance',
    action: runFreshInstall,
  },
  scrape: {
    description: 'Run scraping scripts (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape'),
  },
  'scrape-all': {
    description: 'Run all scraping scripts (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape:all'),
  },
  'scrape-characters': {
    description: 'Scrape character data (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape:characters'),
  },
  'scrape-gallery': {
    description: 'Scrape gallery images (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape:gallery'),
  },
  'scrape-talents': {
    description: 'Scrape talent materials (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape:talents'),
  },
  'scrape-weapons': {
    description: 'Scrape weapon data (headless)',
    category: 'Scraping',
    action: () => runScrapeCommand('scrape:weapons'),
  },
  'check-characters': {
    description: 'Check character data coverage',
    category: 'Scraping',
    action: () => runBunCommand('check-characters'),
  },
  'check-gallery': {
    description: 'Check gallery data coverage',
    category: 'Scraping',
    action: () => runBunCommand('check-gallery'),
  },
  consolidate: {
    description: 'Consolidate scraped data',
    category: 'Scraping',
    action: () => runScrapeCommand('consolidate'),
  },
  'generate-primitives': {
    description: 'Generate primitives from characters data',
    category: 'Scraping',
    action: () => runBunCommand('generate-primitives'),
  },
};

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const finalCommand = isWindows && command === 'bun' ? 'bun.exe' : command;

    const child = spawn(finalCommand, args, {
      cwd: APP_DIR,
      stdio: 'inherit',
      shell: isWindows,
      ...options,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runBunInstall() {
  try {
    console.log(chalk.cyan('Running: bun install...'));
    console.log();

    await runCommand('bun', ['install']);

    console.log();
    console.log(chalk.green('✓ Dependencies installed!'));
  } catch (error) {
    throw new Error('bun install failed');
  }
}

function runBunCommand(command) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(chalk.cyan(`Running: bun run ${command}...`));
      console.log();

      await runCommand('bun', ['run', command]);

      console.log();
      console.log(chalk.green('✓ Done!'));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function runScrapeCommand(command) {
  try {
    console.log(chalk.cyan(`Running: bun run ${command} (headless mode)...`));
    console.log();

    await runCommand('bun', ['run', command], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    console.log();
    console.log(chalk.green('✓ Scraping completed!'));
  } catch (error) {
    throw new Error(`Scraping command failed: ${error.message}`);
  }
}

async function runTypeCheck() {
  try {
    console.log(chalk.cyan('Running TypeScript type check...'));
    console.log();

    await runCommand('bunx', ['tsc', '--noEmit']);

    console.log();
    console.log(chalk.green('✓ Type check passed!'));
  } catch (error) {
    console.error('TypeScript type check failed');
    process.exit(1);
  }
}

async function runPreCommit() {
  console.log(chalk.bold.cyan('Running pre-commit checks...'));
  console.log();

  const checks = [
    { name: 'ESLint', fn: () => runBunCommand('lint') },
    { name: 'TypeScript', fn: runTypeCheck },
    { name: 'Build', fn: () => runBunCommand('build') },
  ];

  for (const check of checks) {
    try {
      console.log(chalk.bold.yellow(`\n▶ Running ${check.name}...`));
      console.log(chalk.dim('─'.repeat(50)));
      await check.fn();
    } catch (error) {
      console.log();
      console.log(chalk.bold.red(`✗ ${check.name} check failed!`));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log();
      console.log(chalk.dim('Fix the issues above and try again.'));
      process.exit(1);
    }
  }

  console.log();
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log(chalk.bold.green('✓ All pre-commit checks passed!'));
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log();
}

async function cleanProject() {
  console.log(chalk.cyan('Cleaning up...'));

  const pathsToRemove = [join(APP_DIR, 'node_modules'), join(APP_DIR, 'dist')];

  for (const path of pathsToRemove) {
    if (existsSync(path)) {
      console.log(chalk.dim(`  Removing ${path}...`));
      await rm(path, { recursive: true, force: true });
    }
  }

  console.log(chalk.green('✓ Done!'));
}

async function cleanCache() {
  console.log(chalk.cyan('Clearing caches...'));

  const cachePaths = [
    join(APP_DIR, '.cache'),
    join(APP_DIR, '.vite'),
    join(APP_DIR, 'node_modules/.vite'),
  ];

  for (const path of cachePaths) {
    if (existsSync(path)) {
      console.log(chalk.dim(`  Removing ${path}...`));
      await rm(path, { recursive: true, force: true });
    }
  }

  console.log(chalk.green('✓ Caches cleared!'));
}

async function runValidate() {
  console.log(chalk.bold.cyan('Running validation checks...'));
  console.log();

  const checks = [
    { name: 'ESLint', fn: () => runBunCommand('lint') },
    { name: 'TypeScript', fn: runTypeCheck },
    { name: 'Format Check', fn: () => runBunCommand('format:check') },
  ];

  for (const check of checks) {
    try {
      console.log(chalk.bold.yellow(`\n▶ Running ${check.name}...`));
      console.log(chalk.dim('─'.repeat(50)));
      await check.fn();
    } catch (error) {
      console.log();
      console.log(chalk.bold.red(`✗ ${check.name} failed!`));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log();
      console.log(chalk.dim('Fix the issues above and try again.'));
      process.exit(1);
    }
  }

  console.log();
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log(chalk.bold.green('✓ All validation checks passed!'));
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log();
}

async function runCI() {
  console.log(chalk.bold.cyan('Running CI checks...'));
  console.log();

  const checks = [
    { name: 'ESLint', fn: () => runBunCommand('lint') },
    { name: 'TypeScript', fn: runTypeCheck },
    { name: 'Format Check', fn: () => runBunCommand('format:check') },
    { name: 'Tests', fn: () => runBunCommand('test') },
    { name: 'Build', fn: () => runBunCommand('build') },
  ];

  for (const check of checks) {
    try {
      console.log(chalk.bold.yellow(`\n▶ Running ${check.name}...`));
      console.log(chalk.dim('─'.repeat(50)));
      await check.fn();
    } catch (error) {
      console.log();
      console.log(chalk.bold.red(`✗ ${check.name} failed!`));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log();
      console.log(chalk.dim('Fix the issues above and try again.'));
      process.exit(1);
    }
  }

  console.log();
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log(chalk.bold.green('✓ All CI checks passed!'));
  console.log(chalk.bold.green('═'.repeat(50)));
  console.log();
}

async function runFreshInstall() {
  console.log(chalk.bold.cyan('Running fresh install...'));
  console.log();

  await cleanProject();
  console.log();
  await runBunInstall();
}

function showHelp() {
  console.log();
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
      const taskName = chalk.green(`make ${task.name.padEnd(15)}`);
      console.log(`  ${taskName} ${task.description}`);
    }

    console.log();
  }

  return Promise.resolve();
}

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
