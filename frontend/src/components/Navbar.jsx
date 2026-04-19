import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    GraduationCap, Menu, X, ChevronDown, User,
    Bell, Settings, LogOut, LayoutDashboard,
    FileText, Briefcase, Users, Layout, ShieldCheck,
    Info, Phone, Star, Key, Edit, UserCircle,
    MessageSquare, BookOpen, Award, CheckCircle
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (user && user.token) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/notifications', config);
                setNotifications(data);
                
                const { data: countData } = await axios.get('/api/notifications/unread/count', config);
                setUnreadCount(countData.count);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling for real-time feel (every 30 seconds)
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.token]);

    const handleMarkAllRead = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('/api/notifications/read-all', {}, config);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            // Local update first for instant feedback (nathi wenna hadanawa)
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            // No need to fetchNotifications again since we did it locally
        } catch (error) {
            console.error('Error marking read:', error);
            fetchNotifications(); // Rollback if failed
        }
    };

    const hasUnread = unreadCount > 0;

    // 🔒 CLICK OUTSIDE TO CLOSE HANDLER
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
                setIsNotifOpen(false);
            }
        };

        if (isProfileOpen || isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen, isNotifOpen]);

    // 🔄 Close dropdowns on route change (fixes auto-open after login/register)
    useEffect(() => {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // --- Role-Based Content Config ---

    // 1. Guest Links (Before Login)
    const guestLinks = [
        { name: 'Home', path: '/', icon: null },
        { name: 'About', path: '/about', icon: null },
        { name: 'Contact', path: '/contact', icon: null },
        { name: 'FAQ', path: '/faq', icon: null },

    ];

    // 2. Student Links (After Login)
    const studentLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Issues Hub', path: '/issues', icon: <FileText size={18} /> },
        { name: 'Libraries', path: '/materials', icon: <Star size={18} /> },
        { name: 'Internships', path: '/internships', icon: <Briefcase size={18} /> },
    ];

    // 3. Admin Links (Admin Login)
    const adminLinks = [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: <ShieldCheck size={18} /> },
        { name: 'Manage Users', path: '/admin/moderation', icon: <Users size={18} /> },
        { name: 'Manage Content', path: '/admin/manage-materials', icon: <Layout size={18} /> },
        { name: 'Reports', path: '/admin/moderation', icon: <FileText size={18} /> },
    ];

    // 4. Lecturer Links
    const lecturerLinks = [
        { name: 'Lecturer Panel', path: '/lecturer/dashboard', icon: <Award size={18} /> },
        { name: 'Academic Issues', path: '/issues', icon: <FileText size={18} /> },
        { name: 'Study Materials', path: '/materials', icon: <Star size={18} /> },
    ];

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isLecturer = user?.role?.toLowerCase() === 'lecturer';
    const currentLinks = !user ? guestLinks : (isAdmin ? adminLinks : (isLecturer ? lecturerLinks : studentLinks));

    return (
        <nav className="smart-navbar">
            <div className="navbar-container">

                {/* 🎓 Logo */}
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon-bg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 10L12 5L2 10L12 15L22 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 12V17C6 17 8 19 12 19C16 19 18 17 18 17V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 10V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="logo-text">
                            StudyMate {isAdmin && <span className="admin-tag">ADMIN</span>}
                        </span>
                    </Link>
                </div>

                {/* 🍔 Mobile Toggle */}
                <button className={`mobile-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                {/* 🧭 Center Links (Desktop) */}
                <div className={`navbar-center ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {currentLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            className={`nav-link ${isActive(link.path)}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.icon && <span className="nav-icon">{link.icon}</span>}
                            {link.name}
                        </Link>
                    ))}

                    {/* Mobile Only Auth Actions */}

                </div>

                {/* 👤 Right Actions */}
                <div className="navbar-right">
                    {!user ? (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/register" className="btn-register">Register</Link>
                        </div>
                    ) : (
                        <div className="user-controls" ref={dropdownRef}>
                            {user.role === 'student' && (
                                <div className="notif-wrapper">
                                    <button
                                        className={`notification-btn ${isNotifOpen ? 'active' : ''} ${hasUnread ? 'shake' : ''}`}
                                        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                                        title="Notifications"
                                    >
                                        <Bell size={20} />
                                        {hasUnread && <span className="notif-dot"></span>}
                                    </button>

                                    {isNotifOpen && (
                                        <div className="notif-panel animate-slide-up">
                                            <div className="panel-header">
                                                <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                                                <button onClick={handleMarkAllRead} className="mark-read-btn">Mark all read</button>
                                            </div>
                                            <div className="panel-list">
                                                {notifications.filter(n => !n.isRead).length > 0 ? notifications.filter(n => !n.isRead).map(notif => (
                                                    <div
                                                        key={notif._id}
                                                        className="panel-item unread"
                                                        onClick={() => {
                                                            handleMarkRead(notif._id);
                                                            if (notif.link && notif.link !== '#') navigate(notif.link);
                                                            setIsNotifOpen(false);
                                                        }}
                                                    >
                                                        <div className="item-icon">
                                                            {notif.type === 'internship' ? <Briefcase size={16} /> : 
                                                             notif.type === 'application' ? <CheckCircle size={16} /> : 
                                                             notif.type === 'system' ? <Award size={16} className="text-orange-400" /> :
                                                             <Bell size={16} />}
                                                        </div>
                                                        <div className="item-content">
                                                            <p className="item-msg">{notif.message}</p>
                                                            <span className="item-time">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {!notif.isRead && <div className="active-dot"></div>}
                                                    </div>
                                                )) : (
                                                    <div className="empty-panel-msg">No new notifications</div>
                                                )}
                                            </div>
                                            <Link to="/notifications" className="view-all-link" onClick={() => setIsNotifOpen(false)}>
                                                View All Notifications
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="profile-wrapper">
                                <button
                                    className={`profile-trigger ${isProfileOpen ? 'active' : ''}`}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="avatar-circle">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="user-details-nav">
                                        <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                                        <ChevronDown size={14} className={`arrow ${isProfileOpen ? 'up' : ''}`} />
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="nav-dropdown animate-slide-up">
                                        <div className="dropdown-user-info">
                                            <p className="full-name">{user.name}</p>
                                            <p className="user-email">{user.email}</p>
                                            <span className="role-chip" style={{textTransform: 'uppercase'}}>{user.role}</span>
                                        </div>

                                        <div className="dropdown-divider"></div>

                                        <Link to="/profile" className="dropdown-link">
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link to="/issues/my" className="dropdown-link">
                                            <MessageSquare size={16} /> My Issues
                                        </Link>
                                        <Link to="/profile/edit" className="dropdown-link">
                                            <Edit size={16} /> Edit Profile
                                        </Link>
                                        <Link to="/profile/change-password" className="dropdown-link">
                                            <Key size={16} /> Change Password
                                        </Link>

                                        <div className="dropdown-divider"></div>

                                        <button onClick={handleLogout} className="dropdown-link logout-btn-nav">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
