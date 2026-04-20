const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Issue = require('./models/Issue');
const StudyMaterial = require('./models/StudyMaterial');
const Internship = require('./models/Internship');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const materials = await StudyMaterial.countDocuments();
    const internships = await Internship.countDocuments();
    console.log({ totalUsers, totalIssues, materials, internships });
    process.exit(0);
});
