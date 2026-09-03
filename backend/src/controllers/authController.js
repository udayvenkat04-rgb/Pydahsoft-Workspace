const userService = require('../services/userService');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = await userService.loginUser(username, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

const seedSuperAdminController = async (req, res) => {
  try {
    const result = await userService.seedSuperAdmin();
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed superadmin'
    });
  }
};

module.exports = {
  login,
  seedSuperAdminController
};
