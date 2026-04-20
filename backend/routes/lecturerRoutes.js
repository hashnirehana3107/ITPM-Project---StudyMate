const express = require('express');
const router = express.Router();
const {
    submitLecturerRequest,
    getLecturerRequests,
    updateRequestStatus,
    deleteLecturerRequest,
    getPendingReviews,
    getIssueById,
    resolveIssue
} = require('../controllers/lecturerController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

// Public route for submitting request (after login)
router.post('/request', protect, submitLecturerRequest);

// Admin routes for managing requests
router.get('/admin/requests', protect, admin, getLecturerRequests);
router.put('/admin/requests/:id', protect, admin, updateRequestStatus);
router.delete('/admin/requests/:id', protect, admin, deleteLecturerRequest);

// Lecturer routes for reviewing issues
router.get('/pending-reviews', protect, lecturer, getPendingReviews);
router.get('/issues/:id', protect, lecturer, getIssueById);
router.post('/resolve-issue', protect, lecturer, resolveIssue);

module.exports = router;
