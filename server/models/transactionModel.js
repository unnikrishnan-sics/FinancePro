const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive or negative number'],
    },
    type: {
        type: String,
        required: [true, 'Please select a type (income/expense)'],
        enum: ['income', 'expense'],
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
    },
    description: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
