const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile, 
    deleteUserProfile,
    addUserGoal,
    toggleUserGoal,
    deleteUserGoal
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUserProfile);

// --- User Goals API ---
router.route('/profile/goals')
    .post(protect, addUserGoal);

router.route('/profile/goals/:goalId')
    .put(protect, toggleUserGoal)
    .delete(protect, deleteUserGoal);

module.exports = router;
