const Transaction = require('../models/transactionModel');

// @desc    Get all transactions
// @route   GET /api/v1/transactions/get-transactions
// @access  Private
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// @desc    Add transaction
// @route   POST /api/v1/transactions/add-transaction
// @access  Private
const addTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;

        // Simple validation
        if (!amount || !type || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const transaction = await Transaction.create({
            user: req.user.id,
            amount: Number(amount),
            type,
            category,
            description,
            date: date || Date.now(),
        });

        // --- Notification Logic ---
        // 1. Check for High Value Transaction
        if (type === 'expense') {
            const user = await User.findById(req.user.id);
            const threshold = user.highValueThreshold || 1000; // Default if not set

            if (Number(amount) > threshold) {
                await Notification.create({
                    user: req.user.id,
                    message: `High Spending Alert: You spent $${amount} on ${category}. This exceeds your limit of $${threshold}.`,
                    type: 'warning'
                });
            }
        }

        res.status(201).json(transaction);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding transaction', error });
    }
};

// @desc    Delete transaction
// @route   POST /api/v1/transactions/delete-transaction
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Ensure user owns transaction
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await transaction.deleteOne();

        res.status(200).json({ message: 'Transaction removed', id: transactionId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};

module.exports = { getAllTransactions, addTransaction, deleteTransaction };
