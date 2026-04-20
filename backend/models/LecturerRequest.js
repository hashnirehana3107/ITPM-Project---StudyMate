const mongoose = require('mongoose');

const lecturerRequestSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    universityName: { type: String, required: true },
    department: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const LecturerRequest = mongoose.model('LecturerRequest', lecturerRequestSchema);
module.exports = LecturerRequest;
