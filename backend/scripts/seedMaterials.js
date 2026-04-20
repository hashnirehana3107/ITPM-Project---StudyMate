const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudyMaterial = require('../models/StudyMaterial');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const MOCK_MATERIALS = [
    { title: 'AWS Cloud EC2 Setup Guide', subject: 'Cloud Computing', degree: 'IT', rating: 4.8, type: 'pdf', downloads: 120, views: 350, year: 3, fileUrl: 'mock_pdf_path' },
    { title: 'Advanced React Patterns', subject: 'Web Development', degree: 'IT', rating: 4.7, type: 'pdf', downloads: 300, views: 600, year: 2, fileUrl: 'mock_pdf_path' },
    { title: 'Database Normalization', subject: 'Database Systems', degree: 'IT', rating: 4.1, type: 'pdf', downloads: 83, views: 210, year: 2, fileUrl: 'mock_pdf_path' },
    { title: 'Microservices Communication', subject: 'Software Architecture', degree: 'SE', rating: 4.5, type: 'ppt', downloads: 85, views: 150, year: 3, fileUrl: 'mock_ppt_path' },
    { title: 'Writing meaningful Unit Tests', subject: 'Testing & QA', degree: 'SE', rating: 4.8, type: 'video', downloads: 210, views: 400, year: 3, fileUrl: 'mock_video_url' },
    { title: 'Intro to Pandas & NumPy', subject: 'Python for DS', degree: 'DS', rating: 4.9, type: 'pdf', downloads: 400, views: 800, year: 2, fileUrl: 'mock_pdf_path' },
    { title: 'Introduction to Mechanics', subject: 'Mechanics', degree: 'Engineering', rating: 4.2, type: 'video', downloads: 85, views: 200, year: 1, fileUrl: 'mock_video_url' },
    { title: 'Thermodynamics Final Review', subject: 'Thermodynamics', degree: 'Engineering', rating: 4.9, type: 'pdf', downloads: 410, views: 800, year: 2, fileUrl: 'mock_pdf_path' },
    { title: 'Circuit Design Principles', subject: 'Electronic Design', degree: 'Engineering', rating: 4.0, type: 'video', downloads: 120, views: 320, year: 2, fileUrl: 'mock_video_url' },
    { title: 'Financial Management Basics', subject: 'Financial Management', degree: 'BM', rating: 4.9, type: 'pdf', downloads: 200, views: 500, year: 2, fileUrl: 'mock_pdf_path' },
    { title: 'Marketing Strategies 2025', subject: 'Marketing', degree: 'BM', rating: 3.8, type: 'ppt', downloads: 45, views: 100, year: 3, fileUrl: 'mock_ppt_path' },
    { title: 'HR Analytics', subject: 'HRM', degree: 'BM', rating: 4.3, type: 'video', downloads: 150, views: 400, year: 4, fileUrl: 'mock_video_url' },
    { title: 'Organic Chemistry Notes', subject: 'Chemistry', degree: 'Science', rating: 4.5, type: 'pdf', downloads: 95, views: 180, year: 1, fileUrl: 'mock_pdf_path' },
    { title: 'Calculus II Practice set', subject: 'Mathematics', degree: 'Science', rating: 4.7, type: 'pdf', downloads: 220, views: 450, year: 1, fileUrl: 'mock_pdf_path' },
    { title: 'Quantum Mechanics Intro', subject: 'Quantum Mechanics', degree: 'Science', rating: 4.4, type: 'ppt', downloads: 110, views: 310, year: 3, fileUrl: 'mock_ppt_path' }
];

const seedMaterials = async () => {
    try {
        for (const item of MOCK_MATERIALS) {
            const exists = await StudyMaterial.findOne({ title: item.title, subject: item.subject });
            if (!exists) {
                await StudyMaterial.create(item);
                console.log(`Added: ${item.title}`);
            } else {
                console.log(`Exists: ${item.title}`);
            }
        }
        console.log('Materials Seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding materials:', error);
        process.exit(1);
    }
};

seedMaterials();
