const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'pydahsoft_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

const seedSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({ username: 'superadmin' });
  
  if (existingSuperAdmin) {
    console.log('[Seeder] Superadmin user already exists.');
    return {
      message: 'Superadmin user already exists',
      user: {
        id: existingSuperAdmin._id,
        username: existingSuperAdmin.username,
        role: existingSuperAdmin.role,
        name: existingSuperAdmin.name
      }
    };
  }

  const superAdmin = await User.create({
    username: 'superadmin',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'superadmin'
  });

  console.log('[Seeder] Superadmin seeded successfully with username: superadmin');
  return {
    message: 'Superadmin seeded successfully',
    user: {
      id: superAdmin._id,
      username: superAdmin.username,
      role: superAdmin.role,
      name: superAdmin.name
    }
  };
};

const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Please provide both username and password');
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, user.role);

  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
    token
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
  seedSuperAdmin,
  loginUser,
  getUserById
};
