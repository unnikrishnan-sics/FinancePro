const mongoose = require('mongoose');

const auditSchema = mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    adminName: {
        type: String,
        required: true,
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    targetUserName: {
        type: String,
    },
    details: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const AuditLog = mongoose.model('AuditLog', auditSchema);
module.exports = AuditLog;
