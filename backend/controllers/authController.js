const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LecturerRequest = require('../models/LecturerRequest');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error('ERROR: JWT_SECRET is not defined in environment variables');
        throw new Error('Server configuration error: JWT_SECRET missing');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, degree, year } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const isLecturer = role === 'lecturer';
        const finalRole = isLecturer ? 'pending_lecturer' : role;

        // Build user object - don't include degree/year for non-students
        const userFields = {
            name,
            email,
            password,
            role: finalRole
        };

        // Add degree/year - Now including degree for lecturers too
        if (finalRole === 'student') {
            userFields.degree = degree;
            userFields.year = year;
        } else if (isLecturer || finalRole === 'pending_lecturer') {
            userFields.degree = degree;
            userFields.universityName = req.body.universityName || 'Not Specified';
            userFields.faculty = req.body.department || req.body.faculty || 'Not Specified';
        }

        const user = await User.create(userFields);

        if (user && isLecturer) {
            const { universityName, department } = req.body;
            await LecturerRequest.create({
                user: user._id,
                name: user.name,
                universityName: universityName || 'Not Specified',
                department: department || 'Not Specified'
            });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                degree: user.degree,
                year: user.year,
                bio: user.bio || '',
                universityName: user.universityName || '',
                faculty: user.faculty || '',
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login fail: User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password).catch(err => {
            console.error('Bcrypt comparison error:', err);
            throw new Error('Password verification failed');
        });

        if (isMatch) {
            console.log('Login Success:', user.email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                degree: user.degree,
                year: user.year,
                bio: user.bio || '',
                universityName: user.universityName || '',
                faculty: user.faculty || '',
                goals: user.goals || [],
                token: generateToken(user._id)
            });
        } else {
            console.log('Login fail: Password mismatch');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('LOGIN_SERVER_ERROR:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                degree: user.degree,
                year: user.year,
                bio: user.bio || '',
                universityName: user.universityName || '',
                faculty: user.faculty || '',
                goals: user.goals || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Self update)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.universityName = req.body.universityName !== undefined ? req.body.universityName : user.universityName;
            user.faculty = (req.body.faculty || req.body.department) !== undefined ? (req.body.faculty || req.body.department) : user.faculty;
            
            // Allow degree update for students and lecturers
            if (user.role === 'student' || user.role === 'lecturer' || user.role === 'pending_lecturer') {
                user.degree = req.body.degree || user.degree;
                if (user.role === 'student') {
                    user.year = req.body.year || user.year;
                }
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            console.log('--- Profile Updated Successfully for User:', updatedUser.email, '---');

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                degree: updatedUser.degree,
                year: updatedUser.year,
                bio: updatedUser.bio,
                universityName: updatedUser.universityName,
                faculty: updatedUser.faculty,
                goals: updatedUser.goals || [],
                token: generateToken(updatedUser._id)
            });
        } else {
            console.log('--- Profile Update Failed: User not found ---');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('--- PROFILE_UPDATE_SERVER_ERROR:', error.message, '---');
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user profile (Self delete)
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log('--- Deleting Account Request for ID:', userId, '---');
        const user = await User.findByIdAndDelete(userId);

        if (user) {
            console.log('--- Account DELETED Successfully:', user.email, '---');
            res.json({ message: 'User account deleted successfully' });
        } else {
            console.log('--- Account Deletion Failed: User not found ---');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('--- ACCOUNT_DELETE_SERVER_ERROR:', error.message, '---');
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add user goal
// @route   POST /api/auth/profile/goals
// @access  Private
const addUserGoal = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id);
        if (user) {
            // Ensure goals array exists for old users
            if (!user.goals) user.goals = [];
            
            user.goals.push({ text: req.body.text });
            await user.save();
            res.status(201).json(user.goals);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user goal checked status (Check/Uncheck)
// @route   PUT /api/auth/profile/goals/:goalId
// @access  Private
const toggleUserGoal = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id);
        if (user) {
            if (!user.goals) user.goals = [];
            
            const goalId = req.params.goalId;
            const goalIndex = user.goals.findIndex(g => g._id.toString() === goalId);
            
            if (goalIndex !== -1) {
                user.goals[goalIndex].checked = !user.goals[goalIndex].checked;
                await user.save();
                res.json(user.goals);
            } else {
                res.status(404).json({ message: 'Goal not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user goal
// @route   DELETE /api/auth/profile/goals/:goalId
// @access  Private
const deleteUserGoal = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id);
        if (user) {
            if (!user.goals) user.goals = [];
            
            user.goals = user.goals.filter(g => g._id.toString() !== req.params.goalId);
            await user.save();
            res.json(user.goals);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    addUserGoal,
    toggleUserGoal,
    deleteUserGoal
};
