const DashboardContent = require('../models/DashboardContent');

// @desc    Get dashboard items (Announcements, Featured, Trending)
// @route   GET /api/dashboard
// @access  Public
const getDashboardItems = async (req, res) => {
    try {
        const { type, degree, year } = req.query;
        let query = {};

        if (type) query.type = type;

        // Filtering logic for students
        if (degree || year) {
            query.$and = [
                {
                    $or: [
                        { targetDegree: 'All' },
                        { targetDegree: degree }
                    ]
                }
            ];

            if (year) {
                query.$and.push({
                    $or: [
                        { targetYear: '' },
                        { targetYear: year }
                    ]
                });
            }
        }

        const items = await DashboardContent.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create dashboard item
// @route   POST /api/dashboard
// @access  Private/Admin
const createDashboardItem = async (req, res) => {
    try {
        const item = await DashboardContent.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update dashboard item
// @route   PUT /api/dashboard/:id
// @access  Private/Admin
const updateDashboardItem = async (req, res) => {
    try {
        const item = await DashboardContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete dashboard item
// @route   DELETE /api/dashboard/:id
// @access  Private/Admin
const deleteDashboardItem = async (req, res) => {
    try {
        const item = await DashboardContent.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment view count
// @route   POST /api/dashboard/:id/view
// @access  Public or Student
const incrementView = async (req, res) => {
    try {
        const item = await DashboardContent.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ views: item.views });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const User = require('../models/User');
const Issue = require('../models/Issue');
const StudyMaterial = require('../models/StudyMaterial');
const Internship = require('../models/Internship');

const LecturerRequest = require('../models/LecturerRequest');

// @desc    Get admin overview stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        console.log("Admin Stats Request Received...");
        const totalUsers = await User.countDocuments();
        const activeStudents = await User.countDocuments({ role: 'student' });
        const totalIssues = await Issue.countDocuments();
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const materials = await StudyMaterial.countDocuments();
        const internships = await Internship.countDocuments();
        const pendingRequests = await LecturerRequest.countDocuments({ status: 'pending' });

        console.log("Counts found:", { totalUsers, totalIssues, materials });

        // Calculate Resolution Rate
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

        // Fetch Recent Activity (Parallel)
        const [recentUsers, recentMaterials, recentIssues] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(3).select('name createdAt'),
            StudyMaterial.find().sort({ createdAt: -1 }).limit(3).select('title createdAt'),
            Issue.find().sort({ createdAt: -1 }).limit(3).select('title createdAt status')
        ]);

        // Combine and sort activities for a unified log
        const activityLog = [
            ...recentUsers.map(u => ({ id: u._id, type: 'user', message: `New registration: ${u.name}`, time: u.createdAt })),
            ...recentMaterials.map(m => ({ id: m._id, type: 'material', message: `Material uploaded: ${m.title}`, time: m.createdAt })),
            ...recentIssues.map(i => ({ id: i._id, type: 'issue', message: `Issue reported: ${i.title}`, time: i.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
            totalUsers,
            activeStudents,
            totalIssues,
            resolvedIssues,
            materials,
            internships,
            resolutionRate,
            pendingRequests,
            activityLog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardItems,
    createDashboardItem,
    updateDashboardItem,
    deleteDashboardItem,
    incrementView,
    getAdminStats
};
