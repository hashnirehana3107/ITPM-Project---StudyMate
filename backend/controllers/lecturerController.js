const LecturerRequest = require('../models/LecturerRequest');
const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc Submit Lecturer Access Request
// @route POST /api/lecturer/request
// @access Private
const submitLecturerRequest = async (req, res) => {
    try {
        const { name, universityEmail, department, staffId } = req.body;

        // Check if a request already exists for this user
        const existingRequest = await LecturerRequest.findOne({ user: req.user._id, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'A pending request already exists for this user.' });
        }

        const request = await LecturerRequest.create({
            user: req.user._id,
            name,
            universityEmail,
            department,
            staffId,
            status: 'pending'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get All Lecturer Requests (Admin Only)
// @route GET /api/lecturer/admin/requests
// @access Private/Admin
const getLecturerRequests = async (req, res) => {
    try {
        const requests = await LecturerRequest.find().populate('user', 'name email degree').sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Approve or Reject Lecturer Request (Admin Only)
// @route PUT /api/lecturers/admin/requests/:id
// @access Private/Admin
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await LecturerRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const prevStatus = request.status;
        request.status = status;
        await request.save();

        if (status === 'approved') {
            const user = await User.findById(request.user);
            if (user) {
                user.role = 'lecturer';
                await user.save();
            }
        } else if (status === 'rejected' && prevStatus === 'approved') {
            // Revert role if previously approved
            const user = await User.findById(request.user);
            if (user) {
                user.role = 'pending_lecturer';
                await user.save();
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete Lecturer Request (Admin Only)
// @route DELETE /api/lecturers/admin/requests/:id
// @access Private/Admin
const deleteLecturerRequest = async (req, res) => {
    try {
        const request = await LecturerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        await request.deleteOne();
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Issues for Lecturer Review (Lecturer Only)
// @route GET /api/lecturer/pending-reviews
// @access Private/Lecturer
const getPendingReviews = async (req, res) => {
    try {
        const lecturerDegree = req.user.degree;

        // Find issues that are Open
        const issues = await Issue.find({ status: 'Open' })
            .populate('student', 'name degree')
            .populate('responses.author', 'name')
            .sort('-createdAt');

        // Filter and Enhance issues
        const filteredAndEnhancedIssues = issues
            .filter(issue => {
                // If lecturer has no degree, show all (fallback)
                if (!lecturerDegree) return true;

                let issueDegree = issue.student?.degree || 'IT';
                if (issue.description?.includes('---META---')) {
                    try {
                        const meta = JSON.parse(issue.description.split('---META---')[1].trim());
                        issueDegree = meta.degree || issueDegree;
                    } catch (e) {}
                }

                const target = lecturerDegree.toLowerCase().trim();
                const current = issueDegree.toLowerCase().trim();
                return target === current || target.includes(current) || current.includes(target);
            })
            .map(issue => {
                let suggestedAnswer = null;
                if (issue.responses && issue.responses.length > 0) {
                    // Rank by total reaction score
                    suggestedAnswer = issue.responses.reduce((prev, current) => {
                        const prevScore = (prev.reactions?.helpful?.length || 0) +
                                          (prev.reactions?.insightful?.length || 0) +
                                          (prev.reactions?.appreciate?.length || 0);
                        const currScore = (current.reactions?.helpful?.length || 0) +
                                          (current.reactions?.insightful?.length || 0) +
                                          (current.reactions?.appreciate?.length || 0);
                        return prevScore >= currScore ? prev : current;
                    });
                }
                return {
                    ...issue.toObject(),
                    suggestedAnswerId: suggestedAnswer ? suggestedAnswer._id : null
                };
            });

        res.json(filteredAndEnhancedIssues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get Issue Detail for Lecturer Review
// @route GET /api/lecturer/issues/:id
// @access Private/Lecturer
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('student', 'name email')
            .populate('responses.author', 'name email');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Resolve Issue by selecting Best Answer or providing own (Lecturer Only)
// @route POST /api/lecturers/admin/resolve-issue
// @access Private/Lecturer
const resolveIssue = async (req, res) => {
    try {
        const { issueId, answerId, lecturerReview, lecturerResponse } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Mark the selected answer as Best Answer (if one exists)
        if (answerId) {
            issue.responses.forEach(resp => {
                resp.isBest = (resp._id.toString() === answerId);
            });
        }

        issue.lecturerReview = lecturerReview || '';
        issue.lecturerResponse = lecturerResponse || '';
        issue.lecturer = req.user._id;
        issue.status = 'Resolved';

        await issue.save();

        res.json({ message: 'Issue resolved successfully', issue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitLecturerRequest,
    getLecturerRequests,
    updateRequestStatus,
    deleteLecturerRequest,
    getPendingReviews,
    getIssueById,
    resolveIssue
};
