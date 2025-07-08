import { processPendingJobs } from './processJob.mjs';

async function main() {
  while (true) {
    await processPendingJobs();
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s between checks
  }
}

main(); 