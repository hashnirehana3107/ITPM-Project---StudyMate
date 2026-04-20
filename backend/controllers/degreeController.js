const Degree = require('../models/Degree');

// @desc    Get all degrees
// @route   GET /api/degrees
// @access  Public (or Private)
const getDegrees = async (req, res) => {
    try {
        const degrees = await Degree.find({});
        res.json(degrees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a degree
// @route   POST /api/degrees
// @access  Private/Admin
const createDegree = async (req, res) => {
    const { name, code, years, subjects } = req.body;

    try {
        const degreeExists = await Degree.findOne({ name });

        if (degreeExists) {
            return res.status(400).json({ message: 'Degree already exists' });
        }

        const degree = await Degree.create({
            name,
            code,
            years,
            subjects: subjects || []
        });

        res.status(201).json(degree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDegree = async (req, res) => {
    try {
        const degree = await Degree.findById(req.params.id);
        if (degree) {
            await degree.deleteOne();
            res.json({ message: 'Degree removed' });
        } else {
            res.status(404).json({ message: 'Degree not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDegree = async (req, res) => {
    try {
        const degree = await Degree.findById(req.params.id);
        if (degree) {
            degree.name = req.body.name !== undefined ? req.body.name : degree.name;
            degree.code = req.body.code !== undefined ? req.body.code : degree.code;
            degree.years = req.body.years !== undefined ? req.body.years : degree.years;
            degree.subjects = req.body.subjects !== undefined ? req.body.subjects : degree.subjects;

            const updatedDegree = await degree.save();
            res.json(updatedDegree);
        } else {
            res.status(404).json({ message: 'Degree not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDegrees, createDegree, deleteDegree, updateDegree };
