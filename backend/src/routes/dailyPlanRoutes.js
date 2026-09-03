const express = require('express');
const router = express.Router();
const {
  createDailyPlan,
  getDailyPlans,
  getDailyPlanById,
  updateDailyPlan
} = require('../controllers/dailyPlanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getDailyPlans);
router.get('/:id', getDailyPlanById);
router.post('/', authorize('superior', 'teamlead', 'superadmin'), createDailyPlan);
router.put('/:id', authorize('superior', 'teamlead', 'superadmin'), updateDailyPlan);

module.exports = router;
