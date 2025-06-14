import chalk from 'chalk';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] || LOG_LEVELS.info;
  }

  debug(message, ...args) {
    if (this.level <= LOG_LEVELS.debug) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message, ...args) {
    if (this.level <= LOG_LEVELS.info) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  warn(message, ...args) {
    if (this.level <= LOG_LEVELS.warn) {
      console.log(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  error(message, ...args) {
    if (this.level <= LOG_LEVELS.error) {
      console.error(chalk.red(`[ERROR] ${message}`), ...args);
    }
  }

  success(message, ...args) {
    if (this.level <= LOG_LEVELS.info) {
      console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
    }
  }
}

export const logger = new Logger();