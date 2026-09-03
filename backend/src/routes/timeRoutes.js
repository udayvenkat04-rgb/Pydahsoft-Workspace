const express = require('express');
const router = express.Router();
const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  createManualTimeLog,
  getActiveTimer,
  getTaskTimeData
} = require('../controllers/timeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', startTimer);
router.post('/pause', pauseTimer);
router.post('/resume', resumeTimer);
router.post('/stop', stopTimer);
router.post('/manual', createManualTimeLog);
router.get('/my-active', getActiveTimer);
router.get('/task/:taskId', getTaskTimeData);

module.exports = router;
