const User = require('../models/User');
const LecturerRequest = require('../models/LecturerRequest');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/users
// @access  Public (should be Admin usually, keeping simple based on context)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user (Admin dashboard function)
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, degree, year, status, faculty, universityName } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userPayload = {
            name,
            email,
            password,
            role: role ? role.toLowerCase() : 'student',
            status: status || 'active'
        };

        // Role-specific mapping
        if (userPayload.role === 'student') {
            userPayload.degree = degree;
            userPayload.year = year;
        } else if (userPayload.role === 'lecturer') {
            userPayload.faculty = faculty || '';
            userPayload.universityName = universityName || '';
            userPayload.degree = degree; // Allow degree for lecturers
        } else if (userPayload.role === 'partner') {
            userPayload.universityName = universityName || '';
        }

        const user = await User.create(userPayload);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role ? req.body.role.toLowerCase() : user.role;
            user.status = req.body.status || user.status;

            if (user.role === 'student') {
                user.degree = req.body.degree !== undefined ? req.body.degree : user.degree;
                user.year = req.body.year !== undefined ? req.body.year : user.year;
                user.faculty = undefined;
                user.universityName = undefined;
            } else if (user.role === 'lecturer') {
                user.faculty = req.body.faculty !== undefined ? req.body.faculty : user.faculty;
                user.universityName = req.body.universityName !== undefined ? req.body.universityName : user.universityName;
                user.degree = req.body.degree !== undefined ? req.body.degree : user.degree;
                user.year = undefined;
            } else if (user.role === 'partner') {
                user.universityName = req.body.universityName !== undefined ? req.body.universityName : user.universityName;
                user.degree = undefined;
                user.year = undefined;
                user.faculty = undefined;
            }
 else {
                user.degree = undefined;
                user.year = undefined;
                user.faculty = undefined;
                user.universityName = undefined;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('--- deleteUser requested for:', userId);
        const user = await User.findById(userId);

        if (user) {
            // --- Selective Cleanup ---
            
            // 1. Remove Lecturer Requests (To keep request list clean)
            await LecturerRequest.deleteMany({ user: userId });
            
            // 2. Remove Notifications (Safe to remove as they are ephemeral)
            await Notification.deleteMany({ 
                $or: [{ recipient: userId }, { sender: userId }] 
            });

            // Note: We are KEEPING Issues, Study Materials, and Applications 
            // so that valuable academic content is not lost when a user is deleted.

            // 3. Finally remove the user itself
            await user.deleteOne();
            
            console.log(`--- User ${userId} removed. Content preserved. ---`);
            res.json({ message: 'User removed successfully. Academic content preserved.' });
        } else {
            console.log('--- deleteUser: user not found:', userId);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('deleteUser Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
