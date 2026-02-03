const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'info', 'warning', 'success', 'error'
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const notificationModel = mongoose.model('notifications', notificationSchema);
module.exports = notificationModel;
