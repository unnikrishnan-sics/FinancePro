const Recurring = require('../models/recurringModel');
const Transaction = require('../models/transactionModel');

// @desc    Add new recurring transaction template
const addRecurringTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, frequency } = req.body;
        const recurring = await Recurring.create({
            user: req.user.id,
            amount,
            type,
            category,
            description,
            frequency,
            lastGenerated: new Date() // Set to now, so next one is generated next month/year
        });

        // Also create the FIRST transaction immediately? 
        // Usually users expect "I paid this just now, and want it to repeat".
        // Let's create the first one now.
        await Transaction.create({
            user: req.user.id,
            amount: Number(amount),
            type,
            category,
            description: `${description} (Recurring)`,
            date: new Date()
        });

        res.status(201).json(recurring);
    } catch (error) {
        res.status(500).json({ message: 'Error adding recurring', error });
    }
};

// @desc    Check and Generate Due Transactions
// System should call this on user login or dashboard load
const checkRecurringTransactions = async (req, res) => {
    try {
        const userId = req.user.id; // Or filtered by user if specific route
        const recurringItems = await Recurring.find({ user: userId, isActive: true });

        const generated = [];

        for (const item of recurringItems) {
            const lastDate = new Date(item.lastGenerated);
            const now = new Date();
            let nextDate = new Date(lastDate);

            // Calculate Next Due Date
            if (item.frequency === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else {
                // Monthly
                nextDate.setMonth(nextDate.getMonth() + 1);
            }

            // If due date is in the past (it's due!)
            if (nextDate <= now) {
                // Create Transaction
                const newTrans = await Transaction.create({
                    user: userId,
                    amount: item.amount,
                    type: item.type,
                    category: item.category,
                    description: `${item.description} (Recurring)`,
                    date: now // Transaction date is today
                });

                // Update last generated to NOW (or nextDate to be precise, but NOW avoids loop if cron missed)
                item.lastGenerated = now;
                await item.save();
                generated.push(newTrans);
            }
        }
        res.status(200).json({ message: 'Checked recurring', generatedCount: generated.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking recurring' });
    }
};

module.exports = { addRecurringTransaction, checkRecurringTransactions };
