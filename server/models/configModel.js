const mongoose = require('mongoose');

const configSchema = mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        required: true,
        default: false,
    },
    disableAiAdvisor: {
        type: Boolean,
        required: true,
        default: false,
    },
    globalHighValueThreshold: {
        type: Number,
        required: true,
        default: 2000,
    },
    maxDailyTransactionCount: {
        type: Number,
        required: true,
        default: 50,
    }
}, {
    timestamps: true,
});

const SystemConfig = mongoose.model('SystemConfig', configSchema);
module.exports = SystemConfig;
