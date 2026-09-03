const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorizePermission('canCreateTasks'), createTask);
router.put('/:id', authorizePermission('canCreateTasks'), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', authorizePermission('canCreateTasks'), deleteTask);

module.exports = router;
