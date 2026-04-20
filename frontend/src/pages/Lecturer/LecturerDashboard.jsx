import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getEnrichedMockIssues } from '../../utils/issueMocks';
import {
    LayoutDashboard, CheckCircle, Clock, BookOpen,
    MessageSquare, ThumbsUp, Filter, Search,
    ChevronRight, ArrowRight, Loader2, Award,
    AlertTriangle, Calendar, TrendingUp, User, Bell,
    Zap, Eye, AlertCircle, Paperclip, ShieldCheck
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './LecturerDashboard.css';

const LecturerDashboard = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null); // Custom Toast State
    const [systemDegrees, setSystemDegrees] = useState([]); // Dynamic degrees from DB

    // Profile Edit States
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        degree: user?.degree || 'IT', // Default to IT if none
        bio: `Dedicated academic lecturer specialized in supporting students through professional issue resolution and expert feedback moderation.`
    });
    useEffect(() => {
        const fetchEssentialData = async () => {
            // Only fetch if token is available
            if (user?.token) {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get('/api/auth/profile', config);
                    // Do NOT call updateProfile(data) here as it sends a PUT request.
                    // If we need to update context user locally, we should use a dedicated method,
                    // but usually the profile doesn't change on every dashboard mount.
                } catch (e) { console.error("Profile fetch failed", e); }
            }
            
            // Fetch All Degrees from System
            try {
                const { data } = await axios.get('/api/degrees');
                setSystemDegrees(data);
            } catch (e) { console.error("Degrees fetch failed", e); }
        };
        fetchEssentialData();
    }, []);

    useEffect(() => {
        if (user) {
            setEditData({
                name: user?.name || '',
                degree: user?.degree || 'IT',
                bio: user?.bio || '',
                universityName: user?.universityName || '',
                faculty: user?.faculty || ''
            });
        }
    }, [user]);
    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    useEffect(() => {
        const fetchPendingReviews = async () => {
            setLoading(true);
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                const { data } = await axios.get('/api/issues', config);
                
                const globalIssues = data.map(issue => {
                    let desc = issue.description || '';
                    let degree = issue.student?.degree || 'IT'; // Fallback to student degree
                    let requiredWithin = 'No deadline';
                    if (desc.includes('---META---')) {
                        const parts = desc.split('---META---');
                        desc = parts[0].trim();
                        try {
                            const meta = JSON.parse(parts[1].trim());
                            degree = meta.degree || degree;
                            requiredWithin = meta.requiredWithin || requiredWithin;
                        } catch(e) {}
                    }
                    return { 
                        ...issue, 
                        description: desc, 
                        degree: degree, 
                        requiredWithin: requiredWithin,
                        responses: issue.responses || []
                    };
                });

                console.log("--- All Loaded Issues:", globalIssues.map(i => `${i.title} (${i.degree})`));

                // Filter issues: Show only Open issues matching lecturer's degree,
                // and Resolved issues only for the one who resolved it
                const myId = user?._id || user?.id;
                const lecturerDegree = user?.degree;

                const departmentIssues = globalIssues.filter(i => {
                    if (i.status === 'Open') {
                        // If lecturer has no degree set, show all (fallback)
                        if (!lecturerDegree) return true;
                        
                        // Strict degree matching
                        const target = lecturerDegree.toLowerCase().trim();
                        const current = i.degree.toLowerCase().trim();
                        return target === current || target.includes(current) || current.includes(target);
                    }
                    
                    // For resolved issues, only show to the lecturer who resolved it
                    const issueLecturerId = (i.lecturer?._id || i.lecturer || '').toString();
                    const currentUserId = (user?._id || user?.id || '').toString();
                    return issueLecturerId === currentUserId;
                });

                console.log("--- Filtered Department Issues:", departmentIssues.map(i => i.title));

                // Simulate the "suggestedAnswer" enhancement for Open issues
                const enhancedIssues = departmentIssues.map(issue => {
                    let suggestedAnswer = null;
                    if (issue.responses && issue.responses.length > 0) {
                        suggestedAnswer = issue.responses.reduce((prev, current) => {
                            const prevLikes = Array.isArray(prev.reactions?.helpful) ? prev.reactions.helpful.length : 0;
                            const currLikes = Array.isArray(current.reactions?.helpful) ? current.reactions.helpful.length : 0;
                            return (prevLikes > currLikes) ? prev : current;
                        });
                    }
                    return {
                        ...issue,
                        suggestedAnswerId: suggestedAnswer ? suggestedAnswer._id : null
                    };
                });

                const urgencyRank = {
                    "Urgent (< 2h)": 1,
                    "Within 24h": 2,
                    "Within 2-3 days": 3,
                    "No Rush": 4
                };

                enhancedIssues.sort((a, b) => {
                    const rankA = urgencyRank[a.requiredWithin] || 5;
                    const rankB = urgencyRank[b.requiredWithin] || 5;
                    
                    if (rankA !== rankB) return rankA - rankB;
                    
                    // Fallback to newest if urgency is same
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setIssues(enhancedIssues);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingReviews();
    }, [user]);

    const filteredIssues = issues.filter(issue => {
        if (filter === 'all') return true;
        if (filter === 'pending') return issue.status === 'Open';
        if (filter === 'resolved') return issue.status === 'Resolved';
        return true;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-950">
            <Loader2 className="animate-spin text-blue-500" size={50} />
        </div>
    );

    const stats = [
        { label: 'Pending Reviews', value: issues.filter(i => i.status === 'Open').length, icon: <Clock size={18} />, color: '#F59E0B' },
        { label: 'Resolved Issues', value: issues.filter(i => i.status === 'Resolved').length, icon: <CheckCircle size={18} />, color: '#10B981' },
        { label: 'Suggested Answers', value: issues.filter(i => i.suggestedAnswerId).length, icon: <ThumbsUp size={18} />, color: '#3B82F6' },
        { label: 'Engagement Rate', value: 'High', icon: <TrendingUp size={18} />, color: '#8B5CF6' }
    ];

    return (
        <div className="ld-dashboard">
            {/* Success/Error Toast Notification */}
            {statusMsg && (
                <div className={`status-toast ${statusMsg.type} animate-slide-in`}>
                    <div className="toast-icon">
                        {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <span>{statusMsg.text}</span>
                </div>
            )}
            
            {/* Sidebar */}
            <aside className="ld-sidebar">
                <div className="ld-brand">
                    <div className="brand-icon">
                        <Award size={24} />
                    </div>
                    <div className="brand-text">
                        <h2>StudyMate</h2>
                        <span>Lecturer Panel</span>
                    </div>
                </div>

                <nav className="ld-nav">
                    <div className="nav-main">
                        <div className="nav-group">
                            <small>Evaluation Panel</small>
                            <button
                                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <LayoutDashboard size={18} /> Overview
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                <BookOpen size={18} /> Issues for Review
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <Bell size={18} /> Alerts & Deadlines
                                {issues.filter(i => i.status === 'Open' && i.requiredWithin?.includes('< 2h')).length > 0 && (
                                    <span className="urgent-count">{issues.filter(i => i.status === 'Open' && i.requiredWithin?.includes('< 2h')).length}</span>
                                )}
                            </button>
                        </div>

                        <div className="nav-group">
                            <small>Settings & Account</small>
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User size={18} /> My Profile
                            </button>
                        </div>
                    </div>

                    <div className="nav-bottom">
                        <button className="nav-item logout" onClick={handleLogout}>
                            <LayoutDashboard size={18} className="rotate-180" /> Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ld-main">
                {activeTab === 'overview' && (
                    <div className="ld-content animate-fade-in">
                        <header className="ld-header">
                            <div className="header-titles">
                                <span className="welcome-tag">Faculty Dashboard</span>
                                <h1>Welcome back, {user?.name?.split(' ')[0] || 'Lecturer'}</h1>
                                <p>Academic Overview for {user?.degree || 'General'} Department</p>
                            </div>
                        </header>

                        <div className="ld-stats-grid">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="stat-card-ld glass-panel" style={{ borderLeft: `3px solid ${stat.color}` }}>
                                    <div className="stat-icon-ld" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
                                    <div className="stat-info-ld">
                                        <span className="stat-value">{stat.value}</span>
                                        <span className="stat-label">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="ld-dashboard-split">
                            <div className="ld-section glass-panel">
                                <div className="section-header">
                                    <h3 className="flex items-center gap-2">
                                        <Zap size={18} className="text-amber-500" /> Action Required (Priority)
                                    </h3>
                                    <button onClick={() => setActiveTab('reviews')} className="view-all-btn">View All</button>
                                </div>
                                <div className="mini-issue-list">
                                    {issues.filter(i => i.status === 'Open').slice(0, 3).map(issue => (
                                        <div key={issue._id} className="mini-issue-item" onClick={() => navigate(`/lecturer/issues/${issue._id}`)}>
                                            <div className="mini-issue-info">
                                                <span className="title">{issue.title}</span>
                                                <span className="meta">{issue.subject} • {issue.responses.length} responses</span>
                                            </div>
                                            <div className={`mini-status ${issue.suggestedAnswerId ? 'has-suggestion' : ''}`}>
                                                {issue.suggestedAnswerId ? <ThumbsUp size={12} /> : <AlertTriangle size={12} />}
                                            </div>
                                        </div>
                                    ))}
                                    {issues.filter(i => i.status === 'Open').length === 0 && <p className="text-slate-500 text-sm italic py-4">No pending reviews found.</p>}
                                </div>
                            </div>

                            <div className="ld-section glass-panel">
                                <div className="section-header">
                                    <h3 className="flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-emerald-500" /> Recently Verified Issues
                                    </h3>
                                </div>
                                <div className="mini-issue-list">
                                    {issues.filter(i => i.status === 'Resolved').slice(0, 3).map(issue => (
                                        <div key={issue._id} className="mini-issue-item resolved" style={{ opacity: 0.7, cursor: 'default' }}>
                                            <div className="mini-issue-info">
                                                <span className="title line-through text-slate-500">{issue.title}</span>
                                                <span className="meta text-xs">Resolved by {issue.lecturer?.name || 'Academic Staff'}</span>
                                            </div>
                                            <div className="mini-status text-emerald-500">
                                                <CheckCircle size={14} />
                                            </div>
                                        </div>
                                    ))}
                                    {issues.filter(i => i.status === 'Resolved').length === 0 && <p className="text-slate-500 text-sm italic py-4">No issues resolved recently.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="ld-content animate-fade-in">
                        <header className="ld-header">
                            <div className="header-titles">
                                <h1>Issue Filtering</h1>
                                <p>Search and filter pending reviews based on student engagement.</p>
                            </div>
                            <div className="ld-filter-box">
                                <div className="filter-item">
                                    <label>Status Filter</label>
                                    <div className="filter-select-wrapper">
                                        <Filter size={16} />
                                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                            <option value="all">All Issues</option>
                                            <option value="pending">Pending Issues</option>
                                            <option value="resolved">Resolved Issues</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="ld-issue-grid">
                            {filteredIssues.map((issue, idx) => (
                                <div
                                    key={issue._id}
                                    className="ld-issue-card glass-panel animate-up"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                    onClick={() => navigate(`/lecturer/issues/${issue._id}`)}
                                >
                                    <div className="card-top">
                                        <span className={`subject-tag ${issue.requiredWithin?.includes('< 2h') ? 'urgent-bg' : ''}`}>
                                            {issue.requiredWithin?.includes('< 2h') && <Zap size={10} />}
                                            {issue.subject}
                                        </span>
                                        <span className={`status-badge-mini ${issue.status?.toLowerCase()}`}>
                                            {issue.status || 'Open'}
                                        </span>
                                    </div>
                                    <h3>{issue.title}</h3>
                                    <p>{issue.description}</p>
                                    <div className="card-footer">
                                        <div className="author">
                                            <User size={14} /> {issue.student?.name}
                                        </div>
                                        <div className="engagement-summary">
                                            <div className="stat-pill"><Eye size={14} className="text-blue-400" /> {issue.views || 0}</div>
                                            <div className="stat-pill"><MessageSquare size={14} className="text-slate-400" /> {issue.responses?.length || 0}</div>
                                            <div className="stat-pill"><Paperclip size={14} className="text-emerald-400" /> {issue.attachments?.length || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="ld-content animate-fade-in">
                        <header className="ld-header">
                            <div className="header-titles">
                                <h1>Alerts & Academic Deadlines</h1>
                                <p>Monitor urgent student inquiries that require immediate resolution.</p>
                            </div>
                        </header>

                        <div className="notifications-list flex flex-col gap-4">
                            {issues.filter(i => i.status === 'Open').map((issue, idx) => (
                                <div
                                    key={issue._id}
                                    className={`notification-item glass-panel animate-up ${issue.requiredWithin?.includes('< 2h') ? 'urgent' : ''}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                    onClick={() => navigate(`/lecturer/issues/${issue._id}`)}
                                >
                                    <div className="notif-icon">
                                        {issue.requiredWithin?.includes('< 2h') ? <AlertTriangle size={20} /> : <Bell size={20} />}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-header">
                                            <span className="notif-title">Student requires solution <strong>{issue.requiredWithin}</strong></span>
                                            <span className="notif-time">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="notif-msg">
                                            {issue.student?.name} posted: "{issue.title}" in {issue.subject}.
                                        </p>
                                    </div>
                                    <div className="notif-arrow">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))}
                            {issues.filter(i => i.status === 'Open').length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    <CheckCircle size={40} className="mx-auto mb-4 opacity-20" />
                                    <p>Your department is clear! No pending academic deadlines.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="ld-content animate-fade-in">
                        <header className="ld-header">
                            <div className="header-titles">
                                <h1>Lecturer Profile</h1>
                                <p>Manage your professional academic profile and department details.</p>
                            </div>
                            <button
                                className={`btn-edit-profile ${isEditing ? 'saving' : ''}`}
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                            >
                                {isEditing ? 'Cancel' : <><User size={16} /> Edit Profile</>}
                            </button>
                        </header>

                        <div className="ld-profile-card glass-panel animate-up">
                            <div className="profile-top-banner"></div>
                            <div className="profile-content">
                                <div className="profile-avatar-large">
                                    {editData.name?.charAt(0) || 'L'}
                                </div>

                                {isEditing ? (
                                    <div className="profile-edit-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    disabled
                                                    className="disabled-input"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>University / Institution Name</label>
                                                <input
                                                    type="text"
                                                    value={editData.universityName}
                                                    onChange={(e) => setEditData({ ...editData, universityName: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Department / Faculty</label>
                                                <input
                                                    type="text"
                                                    value={editData.faculty}
                                                    onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group full-width">
                                                <label>Specialization / Relevant Degree</label>
                                                <select
                                                    value={editData.degree}
                                                    onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                                                >
                                                    <option value="">Select Specialization</option>
                                                    {systemDegrees.length > 0 ? (
                                                        systemDegrees.map(deg => (
                                                            <option key={deg._id} value={deg.name}>{deg.name}</option>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <option value="IT">IT</option>
                                                            <option value="SE">SE</option>
                                                            <option value="DS">DS</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Professional Bio</label>
                                            <textarea
                                                value={editData.bio}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                        <button
                                            className="btn-save-profile"
                                            disabled={submitting}
                                            onClick={async () => {
                                                setSubmitting(true);
                                                try {
                                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                    const { data } = await axios.put('/api/auth/profile', {
                                                        name: editData.name,
                                                        degree: editData.degree,
                                                        bio: editData.bio,
                                                        universityName: editData.universityName,
                                                        faculty: editData.faculty
                                                    }, config);
                                                    
                                                    // Update Context & Local Storage
                                                    updateProfile(data);
                                                    
                                                    setIsEditing(false);
                                                    setStatusMsg({ type: 'success', text: '✅ Profile updated successfully!' });
                                                    setTimeout(() => setStatusMsg(null), 3000);
                                                } catch (e) {
                                                    console.error("Profile update failed:", e);
                                                    setStatusMsg({ type: 'error', text: '❌ Failed to update profile.' });
                                                    setTimeout(() => setStatusMsg(null), 3000);
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                        >
                                            {submitting ? 'Updating...' : 'Update Profile Details'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="profile-main-info">
                                            <h2>{editData.name}</h2>
                                            <span className="profile-email-badge">{user?.email}</span>
                                        </div>

                                        <div className="profile-details-grid">
                                            <div className="pd-item">
                                                <span className="pd-label">Full Name</span>
                                                <span className="pd-value">{user?.name}</span>
                                            </div>
                                            <div className="pd-item">
                                                <span className="pd-label">Email Address</span>
                                                <span className="pd-value">{user?.email}</span>
                                            </div>
                                            <div className="pd-item">
                                                <span className="pd-label">University / Institution Name</span>
                                                <span className="pd-value">{user?.universityName ? user.universityName : 'Not Specified'}</span>
                                            </div>
                                            <div className="pd-item">
                                                <span className="pd-label">Department / Faculty</span>
                                                <span className="pd-value">{user?.faculty ? user.faculty : 'Not Specified'}</span>
                                            </div>
                                            <div className="pd-item">
                                                <span className="pd-label">Specialization / Relevant Degree</span>
                                                <span className="pd-value">{user?.degree ? user.degree : 'Not Specified'}</span>
                                            </div>
                                            <div className="pd-item">
                                                <span className="pd-label">Trust Score</span>
                                                <span className="pd-value" style={{ color: '#10B981', fontWeight: 'bold' }}>Certified 99%</span>
                                            </div>
                                        </div>

                                        <div className="profile-bio-section">
                                            <h3>About Academic Role</h3>
                                            <p>{user?.bio || 'No bio information provided yet. Click edit to add your academic background.'}</p>
                                        </div>
                                        
                                        <div className="account-danger-zone">
                                            <div className="danger-header">
                                                <AlertTriangle size={18} />
                                                <span>Account Danger Zone</span>
                                            </div>
                                            <p>Once you delete your account, there is no going back. Please be certain.</p>
                                            <button 
                                                className="btn-delete-account"
                                                onClick={async () => {
                                                    const confirmed = window.confirm("⚠️ Are you absolutely sure you want to delete your account? This action cannot be undone.");
                                                    if (confirmed) {
                                                        const secondConfirmed = window.confirm("Final Warning: All your data will be permanently removed. Proceed?");
                                                        if (secondConfirmed) {
                                                            try {
                                                                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                                // Use User.id or User._id consistently
                                                                const { data } = await axios.delete('/api/auth/profile', config);
                                                                alert(data.message || "Account deleted successfully.");
                                                                handleLogout();
                                                            } catch (e) {
                                                                console.error("Account deletion failed:", e.response?.data || e.message);
                                                                alert(`Failed to delete account: ${e.response?.data?.message || e.message}`);
                                                            }
                                                        }
                                                    }
                                                }}
                                            >
                                                Permanently Delete Account
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LecturerDashboard;
