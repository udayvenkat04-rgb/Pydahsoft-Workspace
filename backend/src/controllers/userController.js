const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { username, name, password, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, name, and password are required' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const user = await User.create({
      username: username.toLowerCase().trim(),
      name,
      password,
      role: role || 'employee'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating user' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users' });
  }
};

module.exports = {
  createUser,
  getUsers
};
