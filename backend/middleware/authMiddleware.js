const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    // Authentication check...
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    console.log('--- Admin Middleware Hit --- User Role:', req.user?.role);
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const partner = (req, res, next) => {
    if (req.user && req.user.role === 'partner') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as a partner' });
    }
};

const adminOrPartner = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'partner')) {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin or partner' });
    }
};

const lecturer = (req, res, next) => {
    if (req.user && req.user.role === 'lecturer') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as a lecturer' });
    }
};

const adminOrLecturer = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'lecturer')) {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin or lecturer' });
    }
};

module.exports = { protect, admin, partner, adminOrPartner, lecturer, adminOrLecturer };
