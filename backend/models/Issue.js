const mongoose = require('mongoose');

const issueSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved', 'Locked'],
        default: 'Open'
    },
    isReported: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    responses: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: { type: String, required: true },
        isBest: { type: Boolean, default: false },
        likes: { type: Number, default: 0 },
        attachments: { type: [String], default: [] },
        reactions: {
            helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            appreciate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        },
        createdAt: { type: Date, default: Date.now }
    }],
    lecturerReview: {
        type: String,
        default: ''
    },
    lecturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lecturerResponse: {
        type: String,
        default: ''
    },
    attachments: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
