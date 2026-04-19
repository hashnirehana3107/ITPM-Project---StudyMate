const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to Database
connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/degrees', require('./routes/degreeRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lecturers', require('./routes/lecturerRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Serve Uploads folder as static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));







const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API StudyMate V3 is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
