const mongoose = require('mongoose');

const internshipSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., 'Full-time', 'Part-time', 'Remote'
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    guidance: {
        type: String, // Career guidance text
    },
    degree: {
        type: String,
        required: true
    },
    eligibleYears: [{
        type: String
    }],
    deadline: {
        type: String
    },
    duration: {
        type: String
    },
    skills: {
        type: String
    },
    softSkills: {
        type: String
    },
    guidancePath: {
        type: String
    },
    guidanceTips: {
        type: String
    },
    applicationLink: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // Default to pending for partners
    },
    featured: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String // We'll store initials or a URL string
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
