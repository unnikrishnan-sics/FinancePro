const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: [true, 'Please add a title for your goal'],
        trim: true,
    },
    targetAmount: {
        type: Number,
        required: [true, 'Please add a target amount'],
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        default: 'Savings',
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Goal', goalSchema);
