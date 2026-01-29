import chalk from 'chalk';

/**
 * Simple logger utility for consistent colored console output
 */
export const logger = {
  /**
   * Info message (blue) - for general information
   */
  info: (message: string, ...args: any[]) => {
    console.log(chalk.blue(message), ...args);
  },

  /**
   * Success message (green) - for successful operations
   */
  success: (message: string, ...args: any[]) => {
    console.log(chalk.green(message), ...args);
  },

  /**
   * Error message (red) - for errors and failures
   */
  error: (message: string, ...args: any[]) => {
    console.log(chalk.red(message), ...args);
  },

  /**
   * Warning message (yellow) - for warnings
   */
  warn: (message: string, ...args: any[]) => {
    console.log(chalk.yellow(message), ...args);
  },

  /**
   * Debug/secondary message (gray) - for less important info
   */
  debug: (message: string, ...args: any[]) => {
    console.log(chalk.gray(message), ...args);
  },

  /**
   * Cyan message - for supplementary info
   */
  cyan: (message: string, ...args: any[]) => {
    console.log(chalk.cyan(message), ...args);
  },

  /**
   * Plain message - no color
   */
  log: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  },
};
