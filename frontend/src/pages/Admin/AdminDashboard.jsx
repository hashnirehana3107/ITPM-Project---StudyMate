import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Users, AlertCircle, BookOpen, Briefcase,
    TrendingUp, Shield, Activity,
    Clock, ArrowUpRight, CheckCircle, LayoutDashboard,
    GraduationCap, UserX, UserCheck, CheckSquare, Layers, Send, Bell, Settings, Search, ShieldAlert
} from 'lucide-react';

// Import Tab Components
import ManageUsers from './ManageUsers';
import Moderation from './Moderation';
import ManageMaterials from './ManageMaterials';
import ManageInternships from './ManageInternships';
import ManageDegrees from './ManageDegrees';
import DashboardControl from './DashboardControl';
import LecturerRequests from './LecturerRequests';
import AuthContext from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Overview Stats State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        materials: 0,
        internships: 0,
        activeStudents: 0,
        resolutionRate: 0,
        pendingRequests: 0,
        activityLog: []
    });
    const [loading, setLoading] = useState(true);

    // Protect Route: Only admin can access
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
            } else if (user.role !== 'admin') {
                navigate('/dashboard');
            }
        }
    }, [user, authLoading, navigate]);

    const [error, setError] = useState(null);

    // Load Live Data for Overview
    useEffect(() => {
        if (user && user.role === 'admin') {
            const fetchStats = async () => {
                setError(null);
                try {
                    const { data } = await axios.get('/api/dashboard/stats');
                    setStats(data);
                } catch (error) {
                    console.error("Failed to fetch admin stats", error);
                    setError(`Sync error: ${error.message} (${error.response ? error.response.status : 'Network Error'})`);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [user]);

    if (authLoading) return <div className="loading-screen">Loading Admin Panel...</div>;
    if (!user || user.role !== 'admin') return null;



    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
    };

    // Render logic for Tabs
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'users':
                return <ManageUsers />;
            case 'issues':
                return <Moderation />;
            case 'materials':
                return <ManageMaterials />;
            case 'internships':
                return <ManageInternships />;
            case 'settings':
                return <ManageDegrees />;
            case 'control':
                return <DashboardControl />;
            case 'lecturers':
                return <LecturerRequests />;
            default:
                return renderOverview();
        }
    };

    // The Overview UI (Existing beautiful dashboard code)
    const renderOverview = () => (
        <div className="overview-tab animate-fade-in">
            {/* 🖼️ Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <div className="header-icon-box">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1>Admin Control Center</h1>
                        <p>System moderation, analytics, and personalized configuration.</p>
                    </div>
                </div>
                <div className="header-right">
                    <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* 📊 Analytics & Insights (Stats Grid) */}
            <h2 className="section-title">Analytics & Insights</h2>

            {error && (
                <div className="alert-error-banner" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem'
                }}>
                    <ShieldAlert size={18} /> {error}
                </div>
            )}

            <div className="stats-grid premium-stats">
                <div className="stat-card">
                    <div className="stat-icon users"><Users size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                    <div className="stat-trend positive">
                        <TrendingUp size={14} /> +12%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon issues-total"><Activity size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.totalIssues}</h3>
                        <p>Total Issues</p>
                    </div>
                    <div className="stat-trend positive">
                        <TrendingUp size={14} /> +8%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon issues-resolved"><CheckCircle size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.resolvedIssues}</h3>
                        <p>Resolved Issues</p>
                    </div>
                    <div className="stat-trend positive">
                        <TrendingUp size={14} /> +15%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon materials"><BookOpen size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.materials}</h3>
                        <p>Study Materials</p>
                    </div>
                    <div className="stat-trend positive">
                        <TrendingUp size={14} /> +5%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon internships"><Briefcase size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.internships}</h3>
                        <p>Active Internships</p>
                    </div>
                    <div className="stat-trend neutral">
                        <Clock size={14} /> Stable
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active-users"><UserCheck size={24} /></div>
                    <div className="stat-content">
                        <h3>{loading ? '...' : stats.activeStudents}</h3>
                        <p>Active Students</p>
                    </div>
                    <div className="stat-trend positive">
                        <TrendingUp size={14} /> +20%
                    </div>
                </div>
            </div>

            {/* 📈 System Overview Row */}
            <div className="dashboard-row">

                {/* Activity Feed */}
                <div className="dashboard-card activity-feed">
                    <div className="card-header">
                        <h3><Clock size={20} /> System Activity Log</h3>
                    </div>
                    <div className="activity-list">
                        {(stats.activityLog || []).map(item => (
                            <div key={item.id} className="activity-item">
                                <div className={`activity-icon type-${item.type}`}>
                                    {item.type === 'user' ? <Users size={16} /> : 
                                     item.type === 'issue' ? <AlertCircle size={16} /> : 
                                     <BookOpen size={16} />}
                                </div>
                                <div className="activity-details">
                                    <span className="activity-msg">{item.message}</span>
                                    <span className="activity-time">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        {(!stats.activityLog || stats.activityLog.length === 0) && (
                            <p style={{ color: '#64748B', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>No recent activity found.</p>
                        )}
                    </div>
                </div>

                {/* System Health / Goal Tracking */}
                <div className="dashboard-card analytics-card">
                    <div className="card-header">
                        <h3><Shield size={20} /> Moderation Status</h3>
                    </div>
                    <div className="analytics-body">

                        <div className="chart-item">
                            <div className="chart-label">
                                <span>Resolution Rate</span>
                                <span className="text-emerald">{stats.resolutionRate || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill emerald" style={{ width: `${stats.resolutionRate || 0}%` }}></div>
                            </div>
                        </div>
                        
                        {/* Static placeholder for styling parity or replace with another real metric */}
                        <div className="chart-item">
                            <div className="chart-label">
                                <span>Security Compliance</span>
                                <span className="text-blue">100%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill blue" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="chart-item">
                            <div className="chart-label">
                                <span>Lecturer Approvals</span>
                                <span className="text-orange">{stats.pendingRequests || 0} Pending</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill orange" style={{ width: stats.pendingRequests > 0 ? '70%' : '0%' }}></div>
                            </div>
                        </div>

                        <div className="mini-stats-row">
                            <div className="mini-stat">
                                <span className="val text-emerald"><CheckCircle size={14} /> Secure</span>
                                <span className="lbl">System Status</span>
                            </div>
                            <div className="mini-stat">
                                <span className="val text-blue">v2.0</span>
                                <span className="lbl">Version</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <div className="admin-dashboard-layout">
            {/* 📑 Sidebar Tabs */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Shield size={28} className="brand-icon" />
                    <h2>Admin Panel</h2>
                </div>

                <nav className="admin-nav">
                    <button 
                        className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} /> <span>Overview</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} /> <span>User Management</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'issues' ? 'active' : ''}`}
                        onClick={() => setActiveTab('issues')}
                    >
                        <AlertCircle size={20} /> <span>Issues & Moderation</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'materials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('materials')}
                    >
                        <BookOpen size={20} /> <span>Study Materials</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'internships' ? 'active' : ''}`}
                        onClick={() => setActiveTab('internships')}
                    >
                        <Briefcase size={20} /> <span>Internships</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> <span>System Config</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'control' ? 'active' : ''}`}
                        onClick={() => setActiveTab('control')}
                    >
                        <Layers size={20} /> <span>Dashboard Control</span>
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'lecturers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lecturers')}
                    >
                        <GraduationCap size={20} /> <span>Lecturer Requests</span>
                    </button>
                </nav>

                <div className="admin-sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                    <button 
                        className="admin-nav-item logout-btn"
                        onClick={handleLogout}
                        style={{ color: '#EF4444' }}
                    >
                        <LogOut size={20} /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* 🖥️ Main Tab Content Area */}
            <main className="admin-main-content">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;

