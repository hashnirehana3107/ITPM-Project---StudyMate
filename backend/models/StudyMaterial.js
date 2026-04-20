const mongoose = require('mongoose');

const materialSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    year: {
        type: Number
    },
    semester: {
        type: Number
    },
    academicYear: {
        type: String
    },
    moduleCode: {
        type: String
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String, 
        required: true
    },
    additionalFiles: [
        {
            url: { type: String, required: true },
            name: { type: String }
        }
    ],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        default: 'pdf'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    fileType: {
        type: String
    },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, required: true }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    reactions: {
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        star: { type: Number, default: 0 }
    },
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate average rating before saving
materialSchema.pre('save', function() {
    if (this.ratings.length > 0) {
        const total = this.ratings.reduce((sum, item) => sum + item.rating, 0);
        this.averageRating = Number((total / this.ratings.length).toFixed(1));
    }
});

const StudyMaterial = mongoose.model('StudyMaterial', materialSchema);

module.exports = StudyMaterial;
