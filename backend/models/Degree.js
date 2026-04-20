const mongoose = require('mongoose');

const degreeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        default: '' // Add code to schema so it gets saved properly
    },
    years: {
        type: Number,
        required: true, // e.g., 4 years
        default: 4
    },
    subjects: [{
        name: { type: String, required: true },
        code: { type: String, required: true },
        year: { type: Number, required: true }, // Which year this subject belongs to
        semester: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

const Degree = mongoose.model('Degree', degreeSchema);

module.exports = Degree;
