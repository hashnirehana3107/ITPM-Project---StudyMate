const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User Model
const path = require('path');
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({})
            .populate('student', 'name degree year')
            .populate('lecturer', 'name')
            .populate('responses.author', 'name degree year')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(
            req.params.id, 
            { $inc: { views: 1 } }, 
            { new: true }
        )
        .populate('student', 'name degree year')
        .populate('lecturer', 'name')
        .populate('responses.author', 'name degree year');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        console.log(`--- Issue Detail Viewed: ${issue.title} --- Views: ${issue.views}`);
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
    console.log('--- POST /api/issues Attempted ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                message: 'Internal parsing error: Request body could not be read. Please ensure you are sending a valid issue.',
                debugInfo: { bodyReceived: !!req.body, filesCount: req.files?.length || 0 }
            });
        }

        const { title, description, subject } = req.body;
        
        if (!title || !description || !subject) {
            return res.status(400).json({ message: 'Missing required fields: Title, description, or subject.' });
        }

        // Ensure we store relative paths starting with 'uploads/'
        const attachments = req.files ? req.files.map(file => {
            const relativePath = file.path.replace(/\\/g, '/');
            if (relativePath.includes('uploads/')) {
                return 'uploads/' + relativePath.split('uploads/')[1];
            }
            return relativePath;
        }) : [];

        const issue = await Issue.create({
            title,
            description,
            subject,
            student: req.user._id,
            attachments
        });

        // --- BROADCAST PEER HELP NOTIFICATIONS ---
        try {
            let issueDegree = 'IT';
            let isUrgent = false;

            if (description?.includes('---META---')) {
                try {
                    const parts = description.split('---META---');
                    const meta = JSON.parse(parts[1].trim());
                    issueDegree = meta.degree || issueDegree;
                    if (meta.requiredWithin && meta.requiredWithin.toString().toUpperCase().includes('URGENT')) {
                        isUrgent = true;
                    }
                } catch(e) {}
            }

            // Find peers in the same degree (excluding the sender)
            const peers = await User.find({ 
                degree: issueDegree, 
                role: 'student',
                _id: { $ne: req.user._id } 
            });

            if (peers.length > 0) {
                const notificationsBatch = peers.map(peer => ({
                    recipient: peer._id,
                    sender: req.user._id,
                    type: 'issue',
                    title: isUrgent ? 'URGENT PEER HELP' : 'PEER HELP',
                    message: `${title} ::: ${req.user.name} from ${req.user.degree || 'Academic Program'} needs help!`,
                    link: `/issues/${issue._id}`,
                    isRead: false
                }));

                await Notification.insertMany(notificationsBatch);
            }
        } catch (notifErr) {
            console.error('Failed to broadcast peer notifications:', notifErr.message);
        }

        const populatedIssue = await Issue.findById(issue._id).populate('student', 'name');
        res.status(201).json(populatedIssue);
    } catch (error) {
        console.error('CRITICAL Issue Create Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add response to issue
// @route   POST /api/issues/:id/response
// @access  Private
const addResponse = async (req, res) => {
    // Diagnostic log — remove after confirming fix
    console.log('[addResponse] req.body:', req.body);
    console.log('[addResponse] req.files:', req.files ? req.files.length : 0);

    const content = req.body && req.body.content;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Solution content is required.' });
    }

    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            // Process attachments if any
            const attachments = req.files ? req.files.map(file => {
                const relativePath = file.path.replace(/\\/g, '/');
                if (relativePath.includes('uploads/')) {
                    return 'uploads/' + relativePath.split('uploads/')[1];
                }
                return relativePath;
            }) : [];

            const response = {
                author: req.user._id,
                content,
                attachments
            };

            issue.responses.push(response);
            await issue.save();

            const populatedIssue = await Issue.findById(req.params.id)
                .populate('student', 'name')
                .populate('lecturer', 'name')
                .populate('responses.author', 'name');

            res.status(201).json(populatedIssue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
    console.log(`--- Issue Update Attempt: ${req.params.id} ---`);
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            // Check if user is the owner, lecturer, or admin
            const isOwner = issue.student?.toString() === req.user._id?.toString();
            const isLecturer = req.user.role === 'lecturer';
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isLecturer && !isAdmin) {
                return res.status(401).json({ 
                    message: 'User not authorized to update this issue'
                });
            }

            issue.title = req.body.title || issue.title;
            issue.description = req.body.description || issue.description;
            issue.subject = req.body.subject || issue.subject;

            // Handle attachment updates (keepAttachments = existing, newAttachments = uploads)
            if (req.body.keepAttachments !== undefined) {
                let keepAttachments = [];
                try {
                    keepAttachments = JSON.parse(req.body.keepAttachments);
                } catch(e) {
                    keepAttachments = Array.isArray(req.body.keepAttachments)
                        ? req.body.keepAttachments
                        : [req.body.keepAttachments];
                }
                const newAttachments = req.files ? req.files.map(file => {
                    const relativePath = file.path.replace(/\\/g, '/');
                    if (relativePath.includes('uploads/')) {
                        return 'uploads/' + relativePath.split('uploads/')[1];
                    }
                    return relativePath;
                }) : [];
                issue.attachments = [...keepAttachments, ...newAttachments];
            }
            
            if (req.body.status) {
                const oldStatus = issue.status;
                issue.status = req.body.status;
                
                // If status changed to Resolved, send notification to student
                if (req.body.status === 'Resolved' && oldStatus !== 'Resolved') {
                    try {
                        await Notification.create({
                            recipient: issue.student,
                            sender: req.user._id,
                            type: 'system',
                            title: 'Academic Issue Resolved',
                            message: `Your issue "${issue.title}" has been successfully resolved by ${req.user.name || 'a lecturer'}.`,
                            link: `/issues/${issue._id}`,
                            isRead: false
                        });
                        console.log('--- Issue Resolution Notification Sent ---');
                    } catch (notifErr) {
                        console.error('Failed to create resolution notification:', notifErr.message);
                    }

                    if (isLecturer) {
                        issue.lecturer = req.user._id;
                    }
                }
            }

            if (req.body.lecturerReview !== undefined) issue.lecturerReview = req.body.lecturerReview;
            if (req.body.lecturerResponse !== undefined) issue.lecturerResponse = req.body.lecturerResponse;

            const updatedIssue = await issue.save();
            res.json(updatedIssue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            // Check if user is the owner
            if (issue.student.toString() !== req.user._id.toString()) {
                res.status(401).json({ message: 'User not authorized' });
                return;
            }

            await Issue.findByIdAndDelete(req.params.id);
            res.json({ message: 'Issue removed' });
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle best response
// @route   PUT /api/issues/:id/responses/:responseId/best
// @access  Private/Admin
const toggleBestResponse = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            // Find the response
            const response = issue.responses.id(req.params.responseId);
            if (!response) {
                return res.status(404).json({ message: 'Response not found' });
            }

            const currentIsBest = response.isBest;

            // Optional: Untick all other responses for this issue
            issue.responses.forEach((r) => {
                r.isBest = false;
            });

            // Toggle the selected one
            response.isBest = !currentIsBest;

            await issue.save();
            res.json(issue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete any issue (Admin)
// @route   DELETE /api/issues/:id/admin
// @access  Private/Admin
const deleteIssueByAdmin = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (issue) {
            res.json({ message: 'Issue removed by Admin' });
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete any response (Admin)
// @route   DELETE /api/issues/:id/responses/:responseId/admin
// @access  Private/Admin
const deleteResponseByAdmin = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            issue.responses = issue.responses.filter(
                (r) => r._id.toString() !== req.params.responseId
            );
            await issue.save();
            res.json(issue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a response
// @route   PUT /api/issues/:id/responses/:responseId
// @access  Private
const updateResponse = async (req, res) => {
    const content = req.body && req.body.content;
    console.log(`--- UPDATING RESPONSE --- Issue: ${req.params.id}, Response: ${req.params.responseId}`);
    console.log(`Content: ${content}, New Files: ${req.files ? req.files.length : 0}`);

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Response content is required.' });
    }

    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const response = issue.responses.id(req.params.responseId);

            if (!response) {
                return res.status(404).json({ message: 'Response not found' });
            }

            // Check ownership
            if (response.author.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }

            // Update text content
            response.content = content;

            // Build updated attachments:
            // 1. Keep existing attachments the user didn't remove
            let keepAttachments = [];
            if (req.body.keepAttachments) {
                try {
                    keepAttachments = JSON.parse(req.body.keepAttachments);
                } catch (e) {
                    keepAttachments = Array.isArray(req.body.keepAttachments)
                        ? req.body.keepAttachments
                        : [req.body.keepAttachments];
                }
            }

            // 2. Process newly uploaded files
            const newAttachments = req.files ? req.files.map(file => {
                const relativePath = file.path.replace(/\\/g, '/');
                if (relativePath.includes('uploads/')) {
                    return 'uploads/' + relativePath.split('uploads/')[1];
                }
                return relativePath;
            }) : [];

            response.attachments = [...keepAttachments, ...newAttachments];

            issue.markModified('responses');
            await issue.save();

            const populatedIssue = await Issue.findById(req.params.id)
                .populate('student', 'name')
                .populate('lecturer', 'name')
                .populate('responses.author', 'name');

            res.json(populatedIssue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a response
// @route   DELETE /api/issues/:id/responses/:responseId
// @access  Private
const deleteResponse = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (issue) {
            const response = issue.responses.id(req.params.responseId);

            if (!response) {
                return res.status(404).json({ message: 'Response not found' });
            }

            // Check ownership
            if (response.author.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }

            console.log(`--- DELETING RESPONSE --- Issue ID: ${req.params.id}, Resp ID: ${req.params.responseId}`);
            issue.responses.pull(req.params.responseId);
            issue.markModified('responses');
            await issue.save();

            const populatedIssue = await Issue.findById(req.params.id)
                .populate('student', 'name')
                .populate('lecturer', 'name')
                .populate('responses.author', 'name');

            res.json(populatedIssue);
        } else {
            res.status(404).json({ message: 'Issue not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    React to a response
// @route   POST /api/issues/:id/responses/:responseId/react
// @access  Private
const reactToResponse = async (req, res) => {
    console.log(`--- POST /api/issues/${req.params.id}/responses/${req.params.responseId}/react hit ---`);
    try {
        const { reactionType } = req.body; 
        if (!['helpful', 'insightful', 'appreciate'].includes(reactionType)) {
            return res.status(400).json({ message: 'Invalid reaction type' });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const response = issue.responses.id(req.params.responseId);
        if (!response) return res.status(404).json({ message: 'Response not found' });

        // Ensure reactions object and specific type array exit (for legacy data)
        if (!response.reactions) {
            response.reactions = { helpful: [], insightful: [], appreciate: [] };
        }
        if (!Array.isArray(response.reactions[reactionType])) {
            response.reactions[reactionType] = [];
        }

        const userId = req.user._id.toString();
        const existingIndex = response.reactions[reactionType].findIndex(id => id.toString() === userId);

        if (existingIndex > -1) {
            // REMOVE reaction
            response.reactions[reactionType].splice(existingIndex, 1);
        } else {
            // ADD reaction
            response.reactions[reactionType].push(req.user._id);
        }

        await issue.save();

        const populatedIssue = await Issue.findById(req.params.id)
            .populate('student', 'name')
            .populate('lecturer', 'name')
            .populate('responses.author', 'name');

        res.json(populatedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle upvote for an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const userId = req.user._id.toString();
        const existingIndex = (issue.upvotes || []).findIndex(id => id.toString() === userId);

        if (existingIndex > -1) {
            // REMOVE upvote
            issue.upvotes.splice(existingIndex, 1);
        } else {
            // ADD upvote
            issue.upvotes.push(req.user._id);
        }

        await issue.save();

        const populatedIssue = await Issue.findById(req.params.id)
            .populate('student', 'name')
            .populate('lecturer', 'name')
            .populate('responses.author', 'name');

        res.json(populatedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get issues posted by user
// @route   GET /api/issues/my
// @access  Private
const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ student: req.user._id })
            .populate('student', 'name degree year')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user academic stats
// @route   GET /api/issues/stats/me
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Total Issues Posted
        const totalIssues = await Issue.countDocuments({ student: userId });

        // 2. Resolved Issues (Owner of the issue that is marked resolved)
        const resolvedIssues = await Issue.countDocuments({ student: userId, status: 'Resolved' });

        // 3. Solutions Provided (Responses given to OTHER people's issues)
        const solutionsProvided = await Issue.countDocuments({ 
            'responses.author': userId,
            student: { $ne: userId }
        });

        // 4. Total Contributions (Issues + Responses)
        const totalResponses = await Issue.countDocuments({ 'responses.author': userId });
        const contributions = totalIssues + totalResponses;

        // 5. Calculating dynamic reputation
        // Rules: +50 per issue, +100 per response, +200 if response is marked as "Best"
        // Also add logic for upvotes: +10 per upvote received
        const myIssues = await Issue.find({ student: userId });
        const upvotesOnIssues = myIssues.reduce((acc, curr) => acc + (curr.upvotes?.length || 0), 0);

        const issuesWithMyResponses = await Issue.find({ 'responses.author': userId });
        let bestResponseBonus = 0;
        let upvotesOnResponses = 0;

        issuesWithMyResponses.forEach(issue => {
            issue.responses.forEach(resp => {
                if (resp.author.toString() === userId.toString()) {
                    if (resp.isBest) bestResponseBonus += 200;
                    // Sum up reactions as well
                    const helpful = resp.reactions?.helpful?.length || 0;
                    const insightful = resp.reactions?.insightful?.length || 0;
                    const appreciate = resp.reactions?.appreciate?.length || 0;
                    upvotesOnResponses += (helpful + insightful + appreciate);
                }
            });
        });

        const reputation = (totalIssues * 50) + (totalResponses * 100) + bestResponseBonus + (upvotesOnIssues * 10) + (upvotesOnResponses * 20);

        res.json({
            totalIssues,
            resolvedIssues,
            solutionsProvided,
            contributions,
            reputation: Math.min(reputation, 1000) // Caps at 1000 for the UI progress bar
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
