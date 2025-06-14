import { logger } from './logger.js';

export function validateConfig() {
  const requiredVars = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please check your .env file or environment configuration');
    process.exit(1);
  }

  // Validate boolean flags
  const booleanVars = ['DRY_RUN', 'EMBED_AND_STORE', 'CACHE_ENABLED'];
  for (const varName of booleanVars) {
    if (process.env[varName] && !['true', 'false'].includes(process.env[varName])) {
      logger.error(`Invalid value for ${varName}: must be 'true' or 'false'`);
      process.exit(1);
    }
  }

  // Validate numeric values
  if (process.env.BATCH_SIZE && isNaN(parseInt(process.env.BATCH_SIZE, 10))) {
    logger.error('Invalid BATCH_SIZE: must be a number');
    process.exit(1);
  }

  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (process.env.LOG_LEVEL && !validLogLevels.includes(process.env.LOG_LEVEL.toLowerCase())) {
    logger.error(`Invalid LOG_LEVEL: must be one of ${validLogLevels.join(', ')}`);
    process.exit(1);
  }

  logger.debug('Configuration validated successfully');
}