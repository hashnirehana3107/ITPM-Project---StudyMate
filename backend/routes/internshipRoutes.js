const express = require('express');
const router = express.Router();
const { 
    getInternships, 
    getInternshipById, 
    createInternship,
    getEmployerInternships,
    updateInternshipStatus,
    getPendingInternships,
    deleteInternship
} = require('../controllers/internshipController');
const { protect, admin, adminOrPartner, partner } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getInternships)
    .post(protect, adminOrPartner, createInternship);

router.get('/employer', protect, partner, getEmployerInternships);
router.get('/pending', protect, admin, getPendingInternships);

router.route('/:id')
    .get(getInternshipById)
    .delete(protect, adminOrPartner, deleteInternship);

router.put('/:id/status', protect, adminOrPartner, updateInternshipStatus);

module.exports = router;
