const express = require('express');
const router = express.Router();
const { 
    getDashboardItems, 
    createDashboardItem, 
    updateDashboardItem, 
    deleteDashboardItem,
    incrementView,
    getAdminStats
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// --- Dismissed Alerts API (MUST be before /:id) ---

// GET dismissed alert IDs for current user
router.get('/alerts/dismissed', protect, async (req, res) => {
    console.log('--- GET /api/dashboard/alerts/dismissed hit --- User ID:', req.user?._id);
    try {
        const user = await User.findById(req.user._id).select('dismissedAlerts');
        res.json(user.dismissedAlerts || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST dismiss an alert (add to dismissed list)
router.post('/alerts/dismiss', protect, async (req, res) => {
    try {
        const { alertId } = req.body;
        if (!alertId) return res.status(400).json({ message: 'alertId is required' });

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { dismissedAlerts: alertId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Dashboard Content CRUD ---
// Temporarily public for debugging 0 stats issue
router.get('/stats', getAdminStats);

router.route('/')
    .get(getDashboardItems)
    .post(protect, admin, createDashboardItem);

router.route('/:id')
    .put(protect, admin, updateDashboardItem)
    .delete(protect, admin, deleteDashboardItem);

router.post('/:id/view', protect, incrementView);

module.exports = router;
