const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorizePermission('canCreateProjects'), createProject);
router.put('/:id', authorizePermission('canCreateProjects'), updateProject);
router.delete('/:id', authorizePermission('canCreateProjects'), deleteProject);

module.exports = router;
