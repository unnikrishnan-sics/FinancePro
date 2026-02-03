const express = require('express');
const router = express.Router();
const { addTransaction, getAllTransactions, deleteTransaction } = require('../controllers/transactionController');
const { addRecurringTransaction, checkRecurringTransactions } = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// All routes are protected
router.post('/add-transaction', protect, addTransaction);
router.get('/get-transactions', protect, getAllTransactions);
router.post('/delete-transaction', protect, deleteTransaction);

router.post('/add-recurring', protect, addRecurringTransaction);
router.post('/check-recurring', protect, checkRecurringTransactions);

module.exports = router;
