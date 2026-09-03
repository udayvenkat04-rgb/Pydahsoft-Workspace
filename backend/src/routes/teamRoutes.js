const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateMembers,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', authorizePermission('canManageTeams'), createTeam);
router.put('/:id', authorizePermission('canManageTeams'), updateTeam);
router.post('/:id/members', authorizePermission('canManageTeams'), updateMembers);
router.delete('/:id', authorizePermission('canManageTeams'), deleteTeam);

module.exports = router;
