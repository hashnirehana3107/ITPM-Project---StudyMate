const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Internship'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    cvPath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Under Review', 'Shortlisted', 'Interviewing', 'Rejected', 'Hired', 'Accepted'], // Comprehensive states
        default: 'Pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
