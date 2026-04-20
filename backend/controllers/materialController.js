const StudyMaterial = require('../models/StudyMaterial');
const path = require('path');
const fs = require('fs');

// @desc    Get all study materials
// @route   GET /api/materials
// @access  Public
const getMaterials = async (req, res) => {
    try {
        const { degree, year, subject, search } = req.query;
        let query = { isApproved: true };

        if (degree && degree !== 'all') query.degree = degree;
        if (year && year !== 'all') query.year = year;
        if (subject && subject !== 'all') query.subject = subject;
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single study material by ID
// @route   GET /api/materials/:id
// @access  Public
const getMaterialById = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id)
            .populate('uploadedBy', 'name email');
        
        if (material) {
            // Increment view count
            material.views = (material.views || 0) + 1;
            await material.save();
            res.json(material);
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending materials (Admin only)
// @route   GET /api/materials/pending
// @access  Private/Admin
const getAdminMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Upload study material
// @route   POST /api/materials/upload
// @access  Private/Admin or Lecturer
const uploadMaterial = async (req, res) => {
    try {
        const { title, subject, degree, year, semester, description, moduleCode, academicYear, type } = req.body;
        
        // Multer.fields puts files in req.files[fieldName]
        const mainFile = req.files && req.files.file ? req.files.file[0] : null;
        const extraFiles = req.files && req.files.additionalFiles ? req.files.additionalFiles : [];

        if (!mainFile) {
            return res.status(400).json({ message: 'Primary resource file is required' });
        }

        const additionalFilesArray = extraFiles.map(file => ({
            url: file.path.replace(/\\/g, '/'),
            name: file.originalname
        }));

        const material = await StudyMaterial.create({
            title,
            subject,
            degree,
            year,
            semester,
            description,
            moduleCode,
            academicYear,
            fileUrl: mainFile.path.replace(/\\/g, '/'), // Normalize Windows paths
            additionalFiles: additionalFilesArray,
            uploadedBy: req.user ? req.user._id : null,
            type: type || 'pdf',
            isApproved: true,
            fileType: path.extname(mainFile.originalname).substring(1).toUpperCase()
        });

        res.status(201).json(material);
    } catch (error) {
        console.error('Upload Error Details:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update material details
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res) => {
    try {
        const materialId = req.params.id;
        const { title, subject, degree, year, description, type, semester, moduleCode, academicYear } = req.body;
        const material = await StudyMaterial.findById(materialId);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        material.title = title || material.title;
        material.subject = subject || material.subject;
        material.degree = degree || material.degree;
        material.year = year || material.year;
        material.description = description !== undefined ? description : material.description;
        material.type = type || material.type;
        material.semester = semester || material.semester;
        material.moduleCode = moduleCode || material.moduleCode;
        material.academicYear = academicYear !== undefined ? academicYear : material.academicYear;

        // Process Main File Replacement
        const mainFile = req.files && req.files.file ? req.files.file[0] : null;
        if (mainFile) {
            if (material.fileUrl && fs.existsSync(material.fileUrl) && !material.fileUrl.includes('mock')) {
                fs.unlinkSync(material.fileUrl);
            }
            material.fileUrl = mainFile.path.replace(/\\/g, '/'); // Normalize Windows paths
            material.fileType = path.extname(mainFile.originalname).substring(1).toUpperCase();
        }

        // Process Additional Files (if provided, we replace/add)
        // For simplicity in this update, new uploads override or append
        const extraFiles = req.files && req.files.additionalFiles ? req.files.additionalFiles : [];
        if (extraFiles.length > 0) {
            // Note: In a real system, you might want more complex logic to edit specific files
            // Here, we'll append new ones to the existing list
            extraFiles.forEach(file => {
                material.additionalFiles.push({
                    url: file.path.replace(/\\/g, '/'),
                    name: file.originalname
                });
            });
        }

        const updatedMaterial = await material.save();
        res.json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update material status (Approve/Reject)
// @route   PUT /api/materials/:id/status
// @access  Private/Admin
const updateMaterialStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const material = await StudyMaterial.findById(req.params.id);

        if (material) {
            material.isApproved = isApproved;
            const updatedMaterial = await material.save();
            res.json(updatedMaterial);
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);

        if (material) {
            // Delete primary file
            if (material.fileUrl && fs.existsSync(material.fileUrl)) {
                fs.unlinkSync(material.fileUrl);
            }
            // Delete additional files
            if (material.additionalFiles && material.additionalFiles.length > 0) {
                material.additionalFiles.forEach(file => {
                    if (fs.existsSync(file.url)) {
                        fs.unlinkSync(file.url);
                    }
                });
            }
            await material.deleteOne();
            res.json({ message: 'Material removed successfully along with all files' });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate a material
// @route   POST /api/materials/:id/rate
// @access  Private
const rateMaterial = async (req, res) => {
    try {
        const { rating } = req.body;
        const material = await StudyMaterial.findById(req.params.id);

        if (material) {
            const alreadyRated = material.ratings.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyRated) {
                alreadyRated.rating = rating;
            } else {
                const newRating = {
                    user: req.user._id,
                    rating: Number(rating)
                };
                material.ratings.push(newRating);
            }

            await material.save();
            res.json({ message: 'Rating added successfully', averageRating: material.averageRating });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 🎯 NEW: Interactive Material Reactions (Multi-type) ---
// @desc    Toggle reaction to material (like, helpful, etc)
// @route   POST /api/materials/:id/react
const reactMaterial = async (req, res) => {
    try {
        const { type } = req.body;
        const userId = req.user._id;

        // 1. Validation
        if (!['like', 'helpful'].includes(type)) {
            return res.status(400).json({ message: 'Invalid reaction type' });
        }

        // 2. Fetch and Toggle
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Ensure reactions object exists to prevent errors
        if (!material.reactions) {
            material.reactions = { like: [], helpful: [] };
        }
        
        if (!material.reactions[type]) {
            material.reactions[type] = [];
        }

        const userIdStr = userId.toString();
        const alreadyReacted = material.reactions[type].some(id => id.toString() === userIdStr);

        if (alreadyReacted) {
            // Remove user from reaction list
            material.reactions[type] = material.reactions[type].filter(id => id.toString() !== userIdStr);
        } else {
            // Add user to reaction list
            material.reactions[type].push(userId);
        }

        // 3. Persist and Respond
        await material.save();

        res.json({
            reactions: {
                like: material.reactions.like || [],
                helpful: material.reactions.helpful || []
            }
        });
    } catch (error) {
        console.error('Reaction Controller Error:', error.message);
        res.status(500).json({ message: 'Reaction failed: ' + error.message });
    }
};

// @desc    Download material (increment download count)
// @route   POST /api/materials/:id/download
// @access  Public (or Private)
const downloadMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (material) {
            material.downloads = (material.downloads || 0) + 1;
            await material.save();
            res.json({ downloads: material.downloads });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMaterials,
    getMaterialById,
    getAdminMaterials,
    uploadMaterial,
    updateMaterial,
    updateMaterialStatus,
    deleteMaterial,
    rateMaterial,
    reactMaterial,
    downloadMaterial
};
