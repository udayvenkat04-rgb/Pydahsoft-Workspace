const express = require('express');
const router = express.Router();
const {
  submitTaskForReview,
  approveTask,
  rejectTask,
  getPendingReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/submit', submitTaskForReview);
router.post('/approve', authorize('superior', 'teamlead', 'superadmin'), approveTask);
router.post('/reject', authorize('superior', 'teamlead', 'superadmin'), rejectTask);
router.get('/pending', authorize('superior', 'teamlead', 'superadmin'), getPendingReviews);

module.exports = router;
