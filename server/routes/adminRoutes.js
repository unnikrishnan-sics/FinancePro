const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers, getGlobalStats, getUserTransactions, getSystemAnalytics } = require('../controllers/adminController');

router.get('/users', protect, admin, getAllUsers);
router.get('/stats', protect, admin, getGlobalStats);
router.get('/system-analytics', protect, admin, getSystemAnalytics);
router.post('/user-transactions', protect, admin, getUserTransactions);

module.exports = router;
