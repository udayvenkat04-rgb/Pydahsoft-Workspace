const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('superior', 'teamlead', 'superadmin', 'employee'));

router.get('/generate', generateReport);
router.get('/', generateReport);

module.exports = router;
