import db from './lib/db.mjs';

console.log('Adding free credits to existing users...');

// Get all users
const users = db.prepare('SELECT id, email FROM users').all();

let addedCount = 0;
let skippedCount = 0;

for (const user of users) {
  const existingCredits = db.getUserCredits(user.id);
  
  if (!existingCredits) {
    // User has no credits, add 10 free credits
    db.addUserCredits(user.id, 10);
    console.log(`✅ Added 10 free credits to user: ${user.email} (ID: ${user.id})`);
    addedCount++;
  } else {
    console.log(`⏭️  User ${user.email} already has credits: ${existingCredits.credits_remaining} remaining`);
    skippedCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`- Added credits to: ${addedCount} users`);
console.log(`- Skipped: ${skippedCount} users (already had credits)`);
console.log(`- Total users: ${users.length}`);

console.log('\n✅ Free credits distribution complete!'); 