import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPTS_DIR = __dirname;
const CLIENT_DIR = path.resolve(SCRIPTS_DIR, '../..');

/**
 * Task definitions
 */
const tasks = {
  // ============================================================
  // Status & Information
  // ============================================================
  status: {
    description: 'Show migration status',
    category: 'Status & Information',
    action: () => runR2Command('status'),
  },
  audit: {
    description: 'Run R2 storage audit',
    category: 'Status & Information',
    action: () => runR2Command('audit'),
  },

  // ============================================================
  // Download
  // ============================================================
  download: {
    description: 'Download assets from Wikia',
    category: 'Download',
    action: () => runR2Command('download'),
  },
  clean: {
    description: 'Clean download cache',
    category: 'Download',
    action: () => runR2Command('clean'),
  },

  // ============================================================
  // Upload
  // ============================================================
  upload: {
    description: 'Upload assets to R2',
    category: 'Upload',
    action: () => runR2Command('upload'),
  },
  'upload-characters': {
    description: 'Upload character assets to R2',
    category: 'Upload',
    action: () => runR2Command('upload-characters'),
  },
  'upload-weapons': {
    description: 'Upload weapon assets to R2',
    category: 'Upload',
    action: () => runR2Command('upload-weapons'),
  },
  'upload-all': {
    description: 'Upload all character and weapon assets',
    category: 'Upload',
    action: () => runR2Command('upload-all-assets'),
  },

  // ============================================================
  // Force Upload
  // ============================================================
  'force-characters': {
    description: 'Force re-upload character assets',
    category: 'Force Upload',
    action: () => runR2Command('force-upload-characters'),
  },
  'force-weapons': {
    description: 'Force re-upload weapon assets',
    category: 'Force Upload',
    action: () => runR2Command('force-upload-weapons'),
  },
  'force-all': {
    description: 'Force re-upload all assets',
    category: 'Force Upload',
    action: () => runR2Command('force-upload-all'),
  },

  // ============================================================
  // Update
  // ============================================================
  update: {
    description: 'Update character JSONs with R2 URLs',
    category: 'Update',
    action: () => runR2Command('update'),
  },
  restore: {
    description:
      'Restore from backup (usage: make restore TIMESTAMP=<timestamp>)',
    category: 'Update',
    action: () => {
      const timestamp = process.env.TIMESTAMP || process.argv[3];
      if (!timestamp) {
        console.error(chalk.red('Error: TIMESTAMP required'));
        console.log(chalk.dim('Usage: make restore TIMESTAMP=<timestamp>'));
        process.exit(1);
      }
      return runR2Command('restore', [timestamp]);
    },
  },

  // ============================================================
  // Full Migration
  // ============================================================
  migrate: {
    description: 'Run full migration (download + upload + update)',
    category: 'Full Migration',
    action: () => runR2Command('migrate'),
  },

  // ============================================================
  // Verification
  // ============================================================
  verify: {
    description: 'Verify uploaded assets',
    category: 'Verification',
    action: () => runR2Command('verify'),
  },
  'retry-upload': {
    description: 'Retry failed uploads',
    category: 'Verification',
    action: () => runR2Command('retry-upload'),
  },

  // ============================================================
  // Sync
  // ============================================================
  sync: {
    description: 'Sync new assets (post-scraping)',
    category: 'Sync',
    action: () => runR2Command('sync'),
  },
  'sync-r2': {
    description: 'Sync mapping database with R2 state',
    category: 'Sync',
    action: () => runR2Command('sync-r2'),
  },

  // ============================================================
  // Mapping Management
  // ============================================================
  'push-mapping': {
    description: 'Upload url-mapping.json to R2',
    category: 'Mapping Management',
    action: () => runR2Command('push-mapping'),
  },
  'pull-mapping': {
    description: 'Download url-mapping.json from R2',
    category: 'Mapping Management',
    action: () => runR2Command('pull-mapping'),
  },

  // ============================================================
  // Fixes
  // ============================================================
  fix: {
    description: 'Fix file type mismatches',
    category: 'Fixes',
    action: () => runR2Command('fix'),
  },

  // ============================================================
  // Help
  // ============================================================
  help: {
    description: 'Show this help message',
    category: 'Help',
    action: showHelp,
  },
};

/**
 * Run R2 command
 */
function runR2Command(command, extraArgs = []) {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan(`\n▸ Running: bun run r2 ${command}\n`));

    const isWindows = process.platform === 'win32';
    const bunCommand = isWindows ? 'bun.exe' : 'bun';

    const args = ['run', 'r2', '--', command, ...extraArgs];

    const child = spawn(bunCommand, args, {
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
        console.log(chalk.green('\n✓ Done!\n'));
        resolve();
      } else {
        reject(new Error(`R2 command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Show help message
 */
function showHelp() {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   R2 Asset Migration CLI - Tasks     ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));

  const categories = {};

  // Group tasks by category
  for (const [taskName, task] of Object.entries(tasks)) {
    if (!categories[task.category]) {
      categories[task.category] = [];
    }
    categories[task.category].push({
      name: taskName,
      description: task.description,
    });
  }

  // Display tasks by category
  for (const [category, taskList] of Object.entries(categories)) {
    console.log(chalk.bold.yellow(`${category}:`));
    for (const task of taskList) {
      console.log(
        `  ${chalk.cyan(task.name.padEnd(20))} ${chalk.dim(task.description)}`
      );
    }
    console.log();
  }

  console.log(chalk.dim('Usage: make <task-name>'));
  console.log(chalk.dim('Example: make upload-characters\n'));
}

/**
 * Main execution
 */
async function main() {
  const taskName = process.argv[2] || 'help';

  const task = tasks[taskName];

  if (!task) {
    console.error(chalk.red(`\nError: Unknown task "${taskName}"\n`));
    console.log(chalk.dim('Run "make help" to see available tasks\n'));
    process.exit(1);
  }

  try {
    await task.action();
  } catch (error) {
    console.error(chalk.red('\n✗ Task failed:'), error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
