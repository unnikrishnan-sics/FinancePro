const express = require('express');
const router = express.Router();
const { getAnalyticsData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/data', protect, getAnalyticsData);
router.post('/admin-data', protect, getAnalyticsData); // Dedicated admin route (controller handles logic)

module.exports = router;
