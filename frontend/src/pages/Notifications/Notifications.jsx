import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Bell, CheckCircle, Clock, Trash2,
    MessageSquare, BookOpen, Briefcase, Award,
    AlertCircle, Filter, ArrowLeft, MoreVertical
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './Notifications.css';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

    const fetchNotifications = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/notifications', config);
            setNotifications(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.token]);

    const markAsRead = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('/api/notifications/read-all', {}, config);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        // Backend delete route might be needed, for now locally filtering or check if route exists
        setNotifications(notifications.filter(n => n._id !== id));
    };

    const clearAll = () => {
        if (window.confirm('Clear all notifications locally?')) {
            setNotifications([]);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'response': return <MessageSquare size={18} />;
            case 'material': return <BookOpen size={18} />;
            case 'internship': return <Briefcase size={18} />;
            case 'system': return <Award size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    return (
        <div className="notifications-page animate-fade-in">
            <div className="notif-container">

                {/* 🔙 Header Navigation */}
                <div className="notif-header">
                    <div className="header-left">
                        <button onClick={() => navigate(-1)} className="btn-back">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="title-section">
                            <h1>Notifications</h1>
                            <p>Stay updated with your academic activity</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="btn-mark-all" onClick={markAllAsRead}>
                            <CheckCircle size={16} /> Mark all as read
                        </button>
                        <button className="btn-clear" onClick={clearAll}>
                            <Trash2 size={16} /> Clear all
                        </button>
                    </div>
                </div>

                {/* 🔍 Filters Bar */}
                <div className="notif-toolbar">
                    <div className="filter-group">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >All</button>
                        <button
                            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread {notifications.filter(n => !n.isRead).length > 0 && <span>({notifications.filter(n => !n.isRead).length})</span>}
                        </button>
                        <button
                            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                            onClick={() => setFilter('read')}
                        >Read</button>
                    </div>
                </div>

                {/* 📋 Notifications List */}
                <div className="notif-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your updates...</p>
                        </div>
                    ) : filteredNotifs.length > 0 ? (
                        filteredNotifs.map(notif => (
                            <div
                                key={notif._id}
                                className={`notif-item ${notif.isRead ? 'read' : 'unread'} animate-slide-up`}
                                onClick={() => {
                                    markAsRead(notif._id);
                                    if (notif.link && notif.link !== '#') navigate(notif.link);
                                }}
                            >
                                <div className={`notif-icon type-${notif.type}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="notif-content">
                                    <div className="notif-top">
                                        <h3>{notif.title}</h3>
                                        <span className="notif-time"><Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p>{notif.message}</p>
                                </div>

                                <div className="notif-actions">
                                    <button
                                        className="btn-delete-notif"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notif._id);
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {!notif.isRead && <div className="unread-dot"></div>}
                            </div>
                        ))
                    ) : (
                        <div className="empty-notifs">
                            <Bell size={48} />
                            <h3>No notifications yet</h3>
                            <p>We'll notify you when something important happens.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Notifications;
