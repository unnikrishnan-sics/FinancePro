const express = require('express');
const router = express.Router();
const { getAnalyticsData, getMonthlyReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/data', protect, getAnalyticsData);
router.post('/admin-data', protect, getAnalyticsData); // Dedicated admin route (controller handles logic)
router.get('/monthly-report', protect, getMonthlyReport);

module.exports = router;
