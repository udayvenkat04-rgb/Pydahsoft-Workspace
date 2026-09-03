const express = require('express');
const router = express.Router();
const {
  createModule,
  assignTeamToModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule
} = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getModules);
router.get('/:id', getModuleById);
router.post('/', authorizePermission('canCreateModules'), createModule);
router.put('/:id/assign-team', authorizePermission('canAssignModulesToTeams'), assignTeamToModule);
router.put('/:id', authorizePermission('canCreateModules'), updateModule);
router.delete('/:id', authorizePermission('canCreateModules'), deleteModule);

module.exports = router;
