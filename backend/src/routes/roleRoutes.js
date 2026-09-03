const express = require('express');
const router = express.Router();
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getRoles);
router.post('/', authorize('superior', 'superadmin'), createRole);
router.put('/:id', authorize('superior', 'superadmin'), updateRole);
router.delete('/:id', authorize('superior', 'superadmin'), deleteRole);

module.exports = router;
