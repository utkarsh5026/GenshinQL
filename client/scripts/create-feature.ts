import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import chalk from 'chalk';

const FEATURES_DIR = path.join(process.cwd(), 'src', 'features');

interface FeatureStructure {
  folders: string[];
  files: Record<string, string>;
}

const getFeatureStructure = (featureName: string): FeatureStructure => {
  const pascalCase = featureName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return {
    folders: [
      'components',
      'stores',
      'hooks',
      'services',
      'types',
      'utils',
      'constants',
    ],
    files: {
      'index.ts': `/* Export all public APIs from ${featureName} feature */
export * from './components';
export * from './hooks';
export * from './stores';
export * from './types';
`,
      'components/index.ts': `/* Export all components from ${featureName} feature */
`,
      'stores/index.ts': `/* Export all stores from ${featureName} feature */
`,
      'hooks/index.ts': `/* Export all hooks from ${featureName} feature */
`,
      'services/index.ts': `/* Export all services from ${featureName} feature */
`,
      'types/index.ts': `/* Export all types from ${featureName} feature */
`,
      'utils/index.ts': `/* Export all utilities from ${featureName} feature */
`,
      'constants/index.ts': `/* Export all constants from ${featureName} feature */
`,
      'README.md': `# ${pascalCase} Feature

## Overview
Description of the ${featureName} feature.

## Structure
- \`components/\` - React components
- \`stores/\` - Zustand state management
- \`hooks/\` - Custom React hooks
- \`services/\` - API and data services
- \`types/\` - TypeScript type definitions
- \`utils/\` - Utility functions
- \`constants/\` - Constants and configurations

## Usage
\`\`\`typescript
import { } from '@/features/${featureName}';
\`\`\`
`,
    },
  };
};

async function createFeature(featureName: string): Promise<void> {
  if (!featureName || featureName.trim() === '') {
    console.error(chalk.red('❌ Error: Feature name is required'));
    console.log(chalk.yellow('Usage: npm run feature <feature-name>'));
    process.exit(1);
  }

  const kebabCaseRegex = /^[a-z]+(-[a-z]+)*$/;
  if (!kebabCaseRegex.test(featureName)) {
    console.error(
      chalk.red(
        '❌ Error: Feature name must be in kebab-case (e.g., user-profile, data-table)'
      )
    );
    process.exit(1);
  }

  const featurePath = path.join(FEATURES_DIR, featureName);
  try {
    await fs.access(featurePath);
    console.error(
      chalk.red(`❌ Error: Feature '${featureName}' already exists`)
    );
    process.exit(1);
  } catch {
    // Feature doesn't exist, continue
  }

  console.log(chalk.blue(`\n🚀 Creating feature: ${featureName}\n`));

  try {
    const structure = getFeatureStructure(featureName);

    await fs.mkdir(featurePath, { recursive: true });
    console.log(chalk.green(`✓ Created ${featureName}/`));

    for (const folder of structure.folders) {
      const folderPath = path.join(featurePath, folder);
      await fs.mkdir(folderPath, { recursive: true });
      console.log(chalk.green(`✓ Created ${featureName}/${folder}/`));
    }

    for (const [filePath, content] of Object.entries(structure.files)) {
      const fullPath = path.join(featurePath, filePath);
      await fs.writeFile(fullPath, content, 'utf-8');
      console.log(chalk.green(`✓ Created ${featureName}/${filePath}`));
    }

    console.log(
      chalk.green.bold(`\n✅ Feature '${featureName}' created successfully!\n`)
    );
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white(`  1. Navigate to src/features/${featureName}`));
    console.log(chalk.white('  2. Start building your components and logic'));
    console.log(chalk.white(`  3. Import from '@/features/${featureName}'\n`));
  } catch (error) {
    console.error(
      chalk.red(`❌ Error creating feature: ${(error as Error).message}`)
    );
    process.exit(1);
  }
}

const featureName = process.argv[2];
createFeature(featureName);
