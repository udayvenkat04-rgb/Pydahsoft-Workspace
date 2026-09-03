const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const userService = require('../services/userService');

const runSeeder = async () => {
  try {
    console.log('[Seeder Script] Initializing superadmin seeding process...');
    await connectDB();
    const result = await userService.seedSuperAdmin();
    console.log('[Seeder Script] Result:', result.message);
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Script Error]:', error.message);
    process.exit(1);
  }
};

runSeeder();
