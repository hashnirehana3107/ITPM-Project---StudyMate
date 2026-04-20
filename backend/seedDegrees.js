const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Degree = require('./models/Degree');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const initialDegrees = [
    {
        name: 'BSc Information Technology',
        code: 'IT',
        years: 4,
        subjects: [
            { name: 'Cloud Computing', code: 'IT1010', year: 1, semester: 1 },
            { name: 'Networking', code: 'IT1020', year: 1, semester: 2 },
            { name: 'Database Systems', code: 'IT2010', year: 2, semester: 1 },
            { name: 'Cyber Security', code: 'IT3010', year: 3, semester: 1 },
            { name: 'Web Development', code: 'IT2020', year: 2, semester: 2 },
            { name: 'Mobile App Dev', code: 'IT4010', year: 4, semester: 1 }
        ]
    },
    {
        name: 'BSc Software Engineering',
        code: 'SE',
        years: 4,
        subjects: [
            { name: 'Software Architecture', code: 'SE3010', year: 3, semester: 1 },
            { name: 'Algorithms', code: 'SE2010', year: 2, semester: 1 },
            { name: 'Testing & QA', code: 'SE3020', year: 3, semester: 2 },
            { name: 'DevOps', code: 'SE4010', year: 4, semester: 1 }
        ]
    },
    {
        name: 'BSc Data Science',
        code: 'DS',
        years: 4,
        subjects: [
            { name: 'Machine Learning', code: 'DS3010', year: 3, semester: 1 },
            { name: 'Big Data', code: 'DS4010', year: 4, semester: 1 },
            { name: 'Statistical Modeling', code: 'DS2010', year: 2, semester: 1 }
        ]
    },
    {
        name: 'BSc Business Management',
        code: 'BM',
        years: 4,
        subjects: [
            { name: 'Financial Management', code: 'BM1010', year: 1, semester: 1 },
            { name: 'Marketing', code: 'BM2010', year: 2, semester: 1 },
            { name: 'HRM', code: 'BM3010', year: 3, semester: 1 }
        ]
    },
    {
        name: 'BSc Engineering',
        code: 'Engineering',
        years: 4,
        subjects: [
            { name: 'Civil Engineering', code: 'ENG1010', year: 1, semester: 1 },
            { name: 'Electronic Design', code: 'ENG2010', year: 2, semester: 1 }
        ]
    }
];

const seedData = async () => {
    try {
        await Degree.deleteMany(); // Clear existing
        await Degree.insertMany(initialDegrees);
        console.log('Degrees seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding degrees:', error);
        process.exit(1);
    }
};

seedData();
