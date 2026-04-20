const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Issue = require('./models/Issue');
const StudyMaterial = require('./models/StudyMaterial');
const Internship = require('./models/Internship');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const materials = await StudyMaterial.countDocuments();
    const internships = await Internship.countDocuments();
    console.log({ totalUsers, students, admins, totalIssues, resolvedIssues, materials, internships });
    process.exit(0);
});
