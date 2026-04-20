const mongoose = require('mongoose');

const dashboardContentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['announcement', 'featured', 'trending']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
    },
    targetDegree: {
        type: String,
        default: 'All'
    },
    targetYear: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        default: 'Normal'
    },
    subject: {
        type: String,
    },
    degree: {
        type: String,
    },
    year: {
        type: String,
    },
    status: {
        type: String,
    },
    views: {
        type: Number,
        default: 0
    },
    trendValue: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const DashboardContent = mongoose.model('DashboardContent', dashboardContentSchema);
module.exports = DashboardContent;
