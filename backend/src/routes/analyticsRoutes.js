const express = require('express');
const router = express.Router();
const {
  getPerformanceAnalytics,
  getTimeUtilization,
  getTaskDistribution
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('superior', 'teamlead', 'superadmin', 'employee'));

router.get('/performance', getPerformanceAnalytics);
router.get('/time-utilization', getTimeUtilization);
router.get('/task-distribution', getTaskDistribution);

module.exports = router;
