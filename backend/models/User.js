const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'partner', 'lecturer', 'pending_lecturer'],
        default: 'student'
    },
    degree: {
        type: String, // Degree program, e.g., "BSc IT"
        required: function () { return this.role === 'student'; }
    },
    year: {
        type: Number, // Academic year, e.g., 1, 2, 3, 4
        required: function () { return this.role === 'student'; }
    },
    bio: {
        type: String,
        default: ''
    },
    universityName: {
        type: String,
        default: ''
    },
    faculty: {
        type: String, // Department / Faculty
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'deactivated'],
        default: 'active'
    },
    skills: {
        type: [String], // Technical skills, e.g., ["React", "Node.js", "SQL"]
        default: []
    },
    dismissedAlerts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Issue',
        default: []
    },
    goals: [
        {
            text: { type: String, required: true },
            checked: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
