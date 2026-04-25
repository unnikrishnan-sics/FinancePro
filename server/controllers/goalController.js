const Goal = require('../models/goalModel');

// @desc    Get all goals for a user
// @route   GET /api/v1/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching goals', error });
    }
};

// @desc    Create a new goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = async (req, res) => {
    try {
        const { title, targetAmount, category, deadline } = req.body;

        if (!title || !targetAmount || !category) {
            return res.status(400).json({ message: 'Please provide title, target amount and category' });
        }

        const goal = await Goal.create({
            user: req.user.id,
            title,
            targetAmount,
            category,
            deadline,
        });

        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating goal', error });
    }
};

// @desc    Add contribution to a goal
// @route   POST /api/v1/goals/contribution
// @access  Private
const addContribution = async (req, res) => {
    try {
        const { goalId, amount } = req.body;

        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        goal.currentAmount += Number(amount);

        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'completed';
        }

        await goal.save();

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error adding contribution', error });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await goal.deleteOne();
        res.status(200).json({ message: 'Goal removed', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal', error });
    }
};

module.exports = {
    getGoals,
    createGoal,
    addContribution,
    deleteGoal,
};
