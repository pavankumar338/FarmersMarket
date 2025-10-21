#!/usr/bin/env node

/**
 * This script displays the Firebase Realtime Database rules
 * Copy the output and paste it into Firebase Console
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('📋 FIREBASE RULES - COPY EVERYTHING BELOW THIS LINE');
console.log('='.repeat(60) + '\n');

try {
  const rulesPath = path.join(__dirname, '..', 'firebase.rules.json');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  
  console.log(rules);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 COPY EVERYTHING ABOVE THIS LINE');
  console.log('='.repeat(60));
  console.log('\n✅ Instructions:');
  console.log('1. Select all the text between the lines above');
  console.log('2. Copy it (Ctrl+C)');
  console.log('3. Open Firebase Console → Build → Realtime Database → Rules');
  console.log('4. Delete everything in the editor');
  console.log('5. Paste the copied rules');
  console.log('6. Click "Publish"');
  console.log('\n🔗 Firebase Console: https://console.firebase.google.com/\n');
  
} catch (error) {
  console.error('❌ Error reading firebase.rules.json:', error.message);
  console.log('\n💡 Make sure you run this from the project root:');
  console.log('   node scripts/show-firebase-rules.js\n');
}
