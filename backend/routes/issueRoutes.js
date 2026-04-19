const express = require('express');
const router = express.Router();
const { 
    getIssues, 
    getIssueById, 
    createIssue, 
    addResponse, 
    updateIssue, 
    deleteIssue,
    toggleBestResponse,
    deleteIssueByAdmin,
    deleteResponseByAdmin,
    updateResponse,
    deleteResponse,
    reactToResponse,
    upvoteIssue,
    getMyIssues,
    getUserStats
} = require('../controllers/issueController');
const { protect, admin, adminOrLecturer } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const issueUploadDir = 'uploads/issues';
if (!fs.existsSync(issueUploadDir)) {
    fs.mkdirSync(issueUploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/issues'));
    },
    filename: (req, file, cb) => {
        cb(null, `issue-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});


router.route('/')
    .get(getIssues)
    .post(protect, upload.array('attachments', 5), createIssue);

router.get('/my', protect, getMyIssues);
router.get('/stats/me', protect, getUserStats);

router.route('/:id')
    .get(getIssueById)
    .put(protect, upload.array('newAttachments', 5), updateIssue)
    .delete(protect, deleteIssue);

router.route('/:id/admin')
    .delete(protect, admin, deleteIssueByAdmin);

router.route('/:id/responses/:responseId/admin')
    .delete(protect, admin, deleteResponseByAdmin);

router.route('/:id/responses/:responseId/best')
    .put(protect, adminOrLecturer, toggleBestResponse);

router.route('/:id/response')
    .post(protect, upload.array('attachments', 5), addResponse);

router.route('/:id/responses/:responseId')
    .put(upload.array('newAttachments', 5), protect, updateResponse)
    .delete(protect, deleteResponse);

router.route('/:id/responses/:responseId/react')
    .post(protect, reactToResponse);

router.route('/:id/upvote')
    .post(protect, upvoteIssue);

module.exports = router;
