const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getAllUsers, 
    getGlobalStats, 
    getUserTransactions, 
    getSystemAnalytics,
    deleteUser,
    toggleBlockUser,
    toggleUserRole,
    getCohortAnalytics,
    getAuditLogs,
    getSystemConfig,
    updateSystemConfig
} = require('../controllers/adminController');

router.get('/users', protect, admin, getAllUsers);
router.get('/stats', protect, admin, getGlobalStats);
router.get('/system-analytics', protect, admin, getSystemAnalytics);
router.post('/user-transactions', protect, admin, getUserTransactions);

// Cohort Macro & Stress-testing
router.get('/cohort-analytics', protect, admin, getCohortAnalytics);

// Security Auditing Logs
router.get('/audit-logs', protect, admin, getAuditLogs);

// System Configuration Options
router.get('/config', protect, admin, getSystemConfig);
router.put('/config', protect, admin, updateSystemConfig);

// User Management Actions
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/block', protect, admin, toggleBlockUser);
router.put('/users/:id/role', protect, admin, toggleUserRole);

module.exports = router;
