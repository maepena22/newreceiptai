import { processPendingJobs } from './processJob.mjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Enhanced logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} [Worker] [${level}] ${message}`);
}

async function main() {
  log('Worker started', 'INFO');
  
  while (true) {
    try {
      await processPendingJobs();
      await new Promise(r => setTimeout(r, 2000)); // Wait 2s between checks
    } catch (error) {
      log(`Worker loop error: ${error.message}`, 'ERROR');
      log(`Stack trace: ${error.stack}`, 'ERROR');
      
      // Wait a bit longer on error to avoid rapid retries
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully...', 'INFO');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully...', 'INFO');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'ERROR');
  log(`Stack trace: ${error.stack}`, 'ERROR');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
  process.exit(1);
});

main().catch(error => {
  log(`Main function error: ${error.message}`, 'ERROR');
  log(`Stack trace: ${error.stack}`, 'ERROR');
  process.exit(1);
}); 