const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('superior', 'superadmin'), createEmployee);
router.put('/:id', authorize('superior', 'superadmin'), updateEmployee);
router.delete('/:id', authorize('superior', 'superadmin'), deleteEmployee);

module.exports = router;
