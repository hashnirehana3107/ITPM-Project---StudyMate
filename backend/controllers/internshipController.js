const Internship = require('../models/Internship');

// @desc    Get all internships (only approved ones for students, all for admin if needed)
// @route   GET /api/internships
// @access  Public
const getInternships = async (req, res) => {
    try {
        let query = { status: 'approved' };

        if (req.user && req.user.role === 'admin') {
            query = {}; // Admin sees all statuses
        }

        const internships = await Internship.find(query)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email');

        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id).populate('postedBy', 'name email');

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Student Eligibility Check
        if (req.user && req.user.role === 'student' && internship.status === 'approved') {
            // --- Flexible Degree Normalization (same as in getInternships) ---
            let userDegree = (req.user.degree || '').toLowerCase();
            
            if (userDegree.includes('information technology')) userDegree = 'IT';
            else if (userDegree.includes('software engineering')) userDegree = 'SE';
            else if (userDegree.includes('data science')) userDegree = 'DS';
            else if (userDegree.includes('business management')) userDegree = 'BM';
            else if (userDegree.includes('engineering')) userDegree = 'Engineering';
            else if (userDegree.includes('science')) userDegree = 'Science';
            else if (userDegree.includes('accounting')) userDegree = 'Accounting';
            else userDegree = req.user.degree;

            const yearMap = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
            const userYearStr = yearMap[req.user.year] || `${req.user.year}th Year`;

            const isStreamMatch = internship.degree === userDegree;
            const isYearMatch = internship.eligibleYears.includes(userYearStr);

            if (!isStreamMatch || !isYearMatch) {
                return res.status(403).json({ 
                    message: `You are not eligible for this internship based on your specialization (${req.user.degree}) or year. Expected: ${internship.degree} (${internship.eligibleYears})` 
                });
            }
        }

        res.json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create internship
// @route   POST /api/internships
// @access  Private (Admin or Partner)
const createInternship = async (req, res) => {
    try {
        const internship = await Internship.create({
            ...req.body,
            postedBy: req.user._id,
            status: req.user.role === 'admin' ? 'approved' : 'pending'
        });

        res.status(201).json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get internships posted by the logged-in employer
// @route   GET /api/internships/employer
// @access  Private/Partner
const getEmployerInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ postedBy: req.user._id });
        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update internship status (Approve/Reject)
// @route   PUT /api/internships/:id/status
// @access  Private/Admin
const updateInternshipStatus = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (internship) {
            // Check ownership for partners
            if (req.user.role === 'partner') {
                if (!internship.postedBy || internship.postedBy.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'You can only update your own internships' });
                }
            }

            // Update all fields provided in req.body
            const updateData = { ...req.body };
            delete updateData._id; // Ensure ID doesn't get messed up

            // If partner updates, set status back to pending for re-approval
            if (req.user.role === 'partner') {
                updateData.status = 'pending';
            }

            const updatedInternship = await Internship.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            // 🔔 NEW: Notify students if internship is approved
            if (req.user.role === 'admin' && req.body.status === 'approved') {
                const User = require('../models/User');
                const Notification = require('../models/Notification');

                // Find students with matched degree
                const students = await User.find({
                    role: 'student',
                    degree: updatedInternship.degree
                }).select('_id');

                const notifications = students.map(student => ({
                    recipient: student._id,
                    sender: req.user._id,
                    type: 'internship',
                    title: 'New Internship Opportunity!',
                    message: `${updatedInternship.company} is looking for a ${updatedInternship.title}. Check it out!`,
                    link: `/internships/${updatedInternship._id}`
                }));

                await Notification.insertMany(notifications);
            }

            res.json(updatedInternship);
        } else {
            res.status(404).json({ message: 'Internship not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending internships for admin
// @route   GET /api/internships/pending
// @access  Private/Admin
const getPendingInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ status: 'pending' }).populate('postedBy', 'name email');
        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private/Admin
const deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (internship) {
            // Check ownership for partners
            if (req.user.role === 'partner') {
                if (!internship.postedBy || internship.postedBy.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'You can only delete your own internships' });
                }
            }

            await internship.deleteOne();
            res.json({ message: 'Internship removed' });
        } else {
            res.status(404).json({ message: 'Internship not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInternships,
    getInternshipById,
    createInternship,
    getEmployerInternships,
    updateInternshipStatus,
    getPendingInternships,
    deleteInternship
};
