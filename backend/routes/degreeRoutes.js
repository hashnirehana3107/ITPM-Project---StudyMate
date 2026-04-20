const express = require('express');
const router = express.Router();
const { getDegrees, createDegree, deleteDegree, updateDegree } = require('../controllers/degreeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getDegrees).post(protect, admin, createDegree);
router.route('/:id').put(protect, admin, updateDegree).delete(protect, admin, deleteDegree);

module.exports = router;
