// Simple logging utility for the application
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

function shouldLog(level) {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatMessage(message, level, context = null) {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '[App]';
  return `${timestamp} ${prefix} [${level}] ${message}`;
}

export function log(message, level = 'INFO', context = null) {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatMessage(message, level, context);
  
  switch (level) {
    case 'ERROR':
      console.error(formattedMessage);
      break;
    case 'WARN':
      console.warn(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

export function debug(message, context = null) {
  log(message, 'DEBUG', context);
}

export function info(message, context = null) {
  log(message, 'INFO', context);
}

export function warn(message, context = null) {
  log(message, 'WARN', context);
}

export function error(message, context = null) {
  log(message, 'ERROR', context);
}

// Log unhandled errors
process.on('uncaughtException', (err) => {
  error(`Uncaught Exception: ${err.message}`, 'Process');
  error(`Stack trace: ${err.stack}`, 'Process');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'Process');
  process.exit(1);
}); 