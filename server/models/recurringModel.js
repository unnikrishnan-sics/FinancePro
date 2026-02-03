const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    type: {
        type: String,
        required: [true, 'Type is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    frequency: {
        type: String, // 'monthly', 'yearly'
        required: true,
        default: 'monthly'
    },
    lastGenerated: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const recurringModel = mongoose.model('recurring', recurringSchema);
module.exports = recurringModel;
