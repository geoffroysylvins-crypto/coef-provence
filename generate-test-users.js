#!/usr/bin/env node

/**
 * Generate test users.json for development/testing
 *
 * Usage:
 *   node generate-test-users.js
 *
 * This creates a users.json file with test data for authentication testing.
 * In production, use `npm run generate:users` to fetch from Notion.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function generateTestUsers() {
  console.log('🧪 Generating test users...\n');

  try {
    // Test password: "test123456"
    // Hash generated with bcrypt(10 rounds)
    const testPasswordHash = await bcrypt.hash('test123456', 10);

    const testUsers = {
      'geoffroy.sylvins@gmail.com': {
        name: 'Geoffrey Sylvins',
        password_hash: testPasswordHash,
        permissions: {
          role: 'admin',
          catalogs: ['Chr83', 'Caviste06', 'Palace', 'Franco'],
          departments: ['83', '06', '13', '04', '05']
        },
        created: new Date().toISOString(),
        last_modified: new Date().toISOString()
      },
      'test.viewer@sylvins.fr': {
        name: 'Test Viewer',
        password_hash: testPasswordHash,
        permissions: {
          role: 'viewer',
          catalogs: ['Caviste06'],
          departments: ['06']
        },
        created: new Date().toISOString(),
        last_modified: new Date().toISOString()
      },
      'test.manager@sylvins.fr': {
        name: 'Test Manager',
        password_hash: testPasswordHash,
        permissions: {
          role: 'manager',
          catalogs: ['Chr83', 'Caviste06', 'Palace'],
          departments: ['83', '06']
        },
        created: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }
    };

    // Write to file
    const outputPath = path.join(__dirname, 'users.json');
    fs.writeFileSync(outputPath, JSON.stringify(testUsers, null, 2));

    console.log('✅ Test users.json created successfully!\n');
    console.log('📄 File: users.json\n');

    console.log('🔑 Test Credentials:\n');
    console.log('Account 1 (Admin):');
    console.log('  Email:    geoffroy.sylvins@gmail.com');
    console.log('  Password: test123456');
    console.log('  Role:     admin');
    console.log('  Catalogs: Chr83, Caviste06, Palace, Franco\n');

    console.log('Account 2 (Viewer):');
    console.log('  Email:    test.viewer@sylvins.fr');
    console.log('  Password: test123456');
    console.log('  Role:     viewer');
    console.log('  Catalogs: Caviste06\n');

    console.log('Account 3 (Manager):');
    console.log('  Email:    test.manager@sylvins.fr');
    console.log('  Password: test123456');
    console.log('  Role:     manager');
    console.log('  Catalogs: Chr83, Caviste06, Palace\n');

    console.log('⚠️  IMPORTANT:');
    console.log('   This is a TEST file. In production, use:');
    console.log('   npm run generate:users\n');
    console.log('   Which fetches real users from Notion.\n');

  } catch (error) {
    console.error('❌ Error generating test users:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateTestUsers().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateTestUsers };
