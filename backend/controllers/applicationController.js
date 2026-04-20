const Application = require('../models/Application');
const Internship = require('../models/Internship');

// @desc    Apply for an internship
// @route   POST /api/applications/apply
// @access  Private (Student)
const applyForInternship = async (req, res) => {
    try {
        const { internshipId, email, phoneNumber } = req.body;
        
        // 1. Check if internship exist
        const internship = await Internship.findById(internshipId);
        if(!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // 2. Already applied check
        const alreadyApplied = await Application.findOne({ 
            student: req.user._id, 
            internship: internshipId 
        });
        if(alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this internship' });
        }

        // 3. Create Application
        const application = await Application.create({
            internship: internshipId,
            student: req.user._id,
            email,
            phoneNumber,
            cvPath: req.file ? req.file.path : '', // From multer
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Application submitted successfully!',
            application,
            externalLink: internship.applicationLink // Send back external link for Option 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for a partner's internships
// @route   GET /api/applications/partner
// @access  Private (Partner)
const getPartnerApplications = async (req, res) => {
    try {
        // Find internships posted by this partner
        const partnerInternships = await Internship.find({ postedBy: req.user._id }).select('_id');
        const internshipIds = partnerInternships.map(i => i._id);

        // Find applications for these internships
        const applications = await Application.find({ 
            internship: { $in: internshipIds } 
        })
        .populate('student', 'name email degree year')
        .populate('internship', 'title company');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's own applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('internship', 'title company location status deadline');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Partner/Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate('internship');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Ownership check: If the user is a partner, they must own the internship
        if (req.user.role === 'partner' && String(application.internship.postedBy) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized: You do not own this internship' });
        }

        application.status = status;
        const updatedApplication = await application.save();
        res.json(updatedApplication);

    } catch (error) {
        console.error('Update Status Error:', error.message);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    applyForInternship,
    getPartnerApplications,
    getMyApplications,
    updateApplicationStatus
};
