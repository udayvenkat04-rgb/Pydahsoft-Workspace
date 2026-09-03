const express = require('express');
const router = express.Router();
const {
  getSuperiorDash,
  getTeamLeadDash,
  getEmployeeDash
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/superior', authorize('superior', 'superadmin'), getSuperiorDash);
router.get('/teamlead', authorize('superior', 'teamlead', 'superadmin'), getTeamLeadDash);
router.get('/employee', getEmployeeDash);

module.exports = router;
