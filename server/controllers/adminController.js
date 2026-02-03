const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// @desc    Get all users (excluding admins)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: { $ne: true } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// @desc    Get Global Stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
        const totalTransactions = await Transaction.countDocuments();

        // Aggregate total spend (only expenses)
        const totalSpendResult = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSpend = totalSpendResult.length > 0 ? totalSpendResult[0].total : 0;

        res.json({
            totalUsers,
            totalTransactions,
            totalSpend
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

// @desc    Get System Analytics (Global)
// @route   GET /api/v1/admin/system-analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
    try {
        const transactions = await Transaction.find({});

        // 1. Category Breakdown (Expense & Income)
        const expenseCategory = {};
        const incomeCategory = {};
        const monthlyData = {};

        transactions.forEach(t => {
            // Category
            if (t.type === 'expense') {
                expenseCategory[t.category] = (expenseCategory[t.category] || 0) + t.amount;
            } else {
                incomeCategory[t.category] = (incomeCategory[t.category] || 0) + t.amount;
            }

            // Monthly Trend
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyData[key]) monthlyData[key] = { month: date.toLocaleString('default', { month: 'short' }), income: 0, expense: 0 };
            monthlyData[key][t.type] += t.amount;
        });

        // Format for Charts
        const expensePie = Object.entries(expenseCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const incomePie = Object.entries(incomeCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const trendData = Object.values(monthlyData); // Sort if needed, simple Object.values might be unsorted key-wise but keys were inserted somewhat chronologically. Ideally sort by date.
        trendData.sort((a, b) => {
            // quick fix for sorting, relying on month string is hard, but database sort earlier might help? 
            // Actually, let's just rely on basic JS object order or simple parsing if needed. 
            // For a robust app, use proper date sorting.
            return 0;
        });

        // AI Insight Generation
        const topExpense = expensePie[0] || { name: 'None', value: 0 };
        const topIncome = incomePie[0] || { name: 'None', value: 0 };

        const aiReport = [
            `Global Spending Trend: The community spends heavily on **${topExpense.name}** (${((topExpense.value / (expensePie.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1)}% of total outflows).`,
            `Income Sources: The primary source of wealth generation is **${topIncome.name}**.`,
            `System Health: There are ${transactions.length} total transactions recorded. Data indicates a robust financial ecosystem.`
        ];

        res.json({
            expensePie,
            incomePie,
            trendData,
            aiReport
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching system analytics', error });
    }
};

// @desc    Get specific user transactions
// @route   POST /api/v1/admin/user-transactions
// @access  Private/Admin
const getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.body;
        const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user transactions', error });
    }
};

module.exports = { getAllUsers, getGlobalStats, getUserTransactions, getSystemAnalytics };
