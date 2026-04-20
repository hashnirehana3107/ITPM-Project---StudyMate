import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, ChevronRight,
    Clock, Plus, Calendar, ArrowLeft, ArrowUpRight,
    Sparkles, Zap, Megaphone,
    UserCircle, Flame, GraduationCap, Target,
    Search, Star,
    Activity, CheckCircle2, Bookmark, X, Shield
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './Dashboard.css';

const defaultAnn = [
    { id: 1, title: '🚀 IT Internship at Leading Hub', message: 'New internship opportunity for IT Students! Leading tech hub is hiring now.', targetDegree: 'IT', targetYear: '', priority: 'High', date: 'Mar 22' },
    { id: 2, title: '📢 SE Final Year Project Workshop', message: 'Mandatory session regarding documentation and deadlines for all Year 4 SE students.', targetDegree: 'SE', targetYear: '4', priority: 'High', date: 'Mar 21' },
    { id: 3, title: '🏆 Global AI Hackathon', message: 'DS students can now register for the upcoming competition.', targetDegree: 'DS', targetYear: '', priority: 'Normal', date: 'Mar 20' },
    { id: 4, title: '💼 Business Ethics Summit', message: 'Annual summit for BM and Business students.', targetDegree: 'BM', targetYear: '', priority: 'Normal', date: 'Mar 19' },
    { id: 5, title: '🏗️ Engineering Site Visit', message: 'Visit to the city bridge construction site next Tuesday.', targetDegree: 'Engineering', targetYear: '', priority: 'High', date: 'Mar 18' },
    { id: 6, title: '🔬 Research Grant Applications', message: 'Apply for the annual Science research stipend.', targetDegree: 'Science', priority: 'Normal', date: 'Mar 17' },
];

const defaultFeat = [
    { id: 101, title: 'Advanced Algorithms 2024', subject: 'Data Structures', degree: 'SE', year: 'Year 2', status: 'Featured', date: 'Mar 20' },
    { id: 102, title: 'Cloud Computing Architecture', subject: 'Cloud Dev', degree: 'IT', year: 'Year 3', status: 'Featured', date: 'Mar 22' },
    { id: 103, title: 'React Hooks Deep Dive', subject: 'Web Dev', degree: 'IT', year: 'Year 3', status: 'Featured', date: 'Mar 23' },
    { id: 104, title: 'Financial Risk Management', subject: 'Finance', degree: 'BM', year: 'Year 3', status: 'Featured', date: 'Mar 24' },
    { id: 105, title: 'Quantum Physics Basics', subject: 'Physics', degree: 'Science', year: 'Year 2', status: 'Featured', date: 'Mar 25' },
    { id: 106, title: 'Structural Design Ethics', subject: 'Eng Ethics', degree: 'Engineering', year: 'Year 4', status: 'Featured', date: 'Mar 26' },
];

const defaultTrend = [
    { id: 201, title: 'Docker Compose Connectivity', subject: 'ITPM Project', trendValue: 'Hot', degree: 'IT' },
    { id: 202, title: 'Prisma Client Migration Error', subject: 'Backend Dev', trendValue: 'Viral', degree: 'SE' },
    { id: 203, title: 'Market Volatility Analysis 2024', subject: 'Economics', trendValue: 'Trending', degree: 'BM' },
    { id: 204, title: 'TensorFlow vs PyTorch debates', subject: 'AI/ML', trendValue: 'Hot', degree: 'DS' },
    { id: 205, title: 'Fluid Dynamics Lab Help', subject: 'Physics', trendValue: 'Hot', degree: 'Engineering' },
];

// --- Fuzzy Degree Matcher ---
const helperMatchesDegree = (targetDeg, itemDeg) => {
    if (!targetDeg || targetDeg === 'All') return true;
    if (!itemDeg) return false;
    const t = targetDeg.toLowerCase().trim();
    const i = itemDeg.toLowerCase().trim();
    return t === i || t.includes(i) || i.includes(t);
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- State Persistence ---
    const [notifications, setNotifications] = useState([]);
    const [featuredMaterials, setFeaturedMaterials] = useState([]);
    const [trendingIssues, setTrendingIssues] = useState([]);
    const [peerAlerts, setPeerAlerts] = useState([]);
    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [selectedAnn, setSelectedAnn] = useState(null);
    const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
    const [isAllAnnModalOpen, setIsAllAnnModalOpen] = useState(false); 
    const [personalNotifications, setPersonalNotifications] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [internships, setInternships] = useState([]);
    const [allIssues, setAllIssues] = useState([]);

    // Goals local state
    const [personalGoals, setPersonalGoals] = useState(user?.goals || []);

    const [readNotes, setReadNotes] = useState(() => {
        const saved = localStorage.getItem('studyMate_read_announcements');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        // Redirection logic
        if (user) {
            const role = user.role?.toLowerCase();
            if (role === 'admin') {
                navigate('/admin/dashboard');
                return;
            }
            if (role === 'lecturer') {
                navigate('/lecturer/dashboard');
                return;
            }
        }

        const loadDashboardData = async () => {
            try {
                const userDegree = user?.degree || 'IT';
                const userYearShort = String(user?.year || '1st Year').charAt(0);
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

                // 1. Fetch targeted dashboard items (Announcements)
                const { data: dbItems } = await axios.get(`/api/dashboard?degree=${userDegree}&year=${userYearShort}`);
                
                if (dbItems && dbItems.length > 0) {
                    const mappedData = dbItems.map(i => ({
                        ...i,
                        id: i._id,
                        date: i.date || new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }));
                    setNotifications(mappedData.filter(i => i.type === 'announcement'));
                } else {
                    setNotifications(defaultAnn);
                }

                // 2. Fetch ALL Study Materials for Smart Recommendations
                const { data: allMaterials } = await axios.get('/api/materials');
                if (allMaterials) {
                    setMaterials(allMaterials.map(m => ({
                        ...m,
                        id: m._id,
                        reactionCount: (m.reactions?.like?.length || 0) + (m.reactions?.helpful?.length || 0)
                    })));
                }

                // 3. Fetch Internships for Career Section
                const { data: degreeInternships } = await axios.get('/api/internships', config);
                if (degreeInternships) {
                    setInternships(degreeInternships.slice(0, 2));
                }

                // 4. Fetch ALL Issues for Trending Section
                const { data: issuesData } = await axios.get('/api/issues');
                if (issuesData) {
                    setAllIssues(issuesData);
                }

                // --- Peer Alerts ---
                setPeerAlerts([]);

                // --- Fetch Dismissed Alerts from Backend ---
                try {
                    const { data: dismissedData } = await axios.get('/api/dashboard/alerts/dismissed', config);
                    setDismissedAlerts(dismissedData || []);
                } catch (e) {
                    console.error("Failed to load dismissed alerts", e);
                }

                // --- Fetch Personal Notifications & Goals ---
                try {
                    if (user?.token) {
                        const { data: pNotifs } = await axios.get('/api/notifications', config);
                        setPersonalNotifications(pNotifs || []);
                        const { data: userData } = await axios.get('/api/auth/profile', config);
                        if (userData && userData.goals) {
                            setPersonalGoals(userData.goals);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load personal data (Notifs/Goals)", e);
                }

                setLoading(false);
            } catch (err) {
                console.error("Dashboard Load Error", err);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user, navigate]);

    useEffect(() => {
        localStorage.setItem('studyMate_read_announcements', JSON.stringify(readNotes));
    }, [readNotes]);

    const handleAddGoal = (text) => {
        if (!text || !text.trim()) return;
        if (!user?.token) return;
        
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        axios.post('/api/auth/profile/goals', { text: text.trim() }, config)
            .then(res => setPersonalGoals(res.data))
            .catch(err => {
                console.error('Add goal fail:', err);
                alert('Failed to add goal. Please try again.');
            });
    };

    const handleMarkAsRead = (id) => {
        if (!readNotes.includes(id)) setReadNotes([...readNotes, id]);
    };

    const handleOpenAnn = async (note) => {
        setSelectedAnn(note);
        setIsAnnModalOpen(true);
        handleMarkAsRead(note.id);
        
        // Only increment view if we haven't read it yet in this session
        if (!readNotes.includes(note.id)) {
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                await axios.post(`/api/dashboard/${note.id}/view`, {}, config);
            } catch (err) {
                console.error("Failed to increment views:", err);
            }
        }
    };


    const handleDismissAlert = async (alertId) => {
        // Optimistic update
        setDismissedAlerts(prev => [...prev, alertId]);
        
        try {
            if (user?.token) {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post('/api/dashboard/alerts/dismiss', { alertId }, config);
            }
        } catch (error) {
            console.error('Error dismissing alert on backend:', error);
        }
    };

    const userDegree = user?.degree || 'IT';
    const userYearFull = String(user?.year || '1st Year');
    const userYearShort = userYearFull.charAt(0);

    // --- Smart LIVE Filtering for Dashboard ---
    const streamFilteredMaterials = Array.isArray(materials) 
        ? materials.filter(m => helperMatchesDegree(userDegree, m.degree)) 
        : [];

    // 1. Recommended: Top 2 based on Score (Rating + Reactions)
    const recommendedContent = [...streamFilteredMaterials]
        .sort((a,b) => ((b.averageRating || 0)*2 + (b.reactionCount || 0)) - ((a.averageRating || 0)*2 + (a.reactionCount || 0)))
        .slice(0, 2);

    // 2. Trending Peer Discussions: Top 2 by engagement score (Filtered by Degree)
    const trendingPeerIssues = [...(allIssues || [])]
        .filter(issue => {
            // Parse metadata to find the degree if it exists in the description
            let issueDegree = 'IT'; // fallback
            if (issue.description?.includes('---META---')) {
                try {
                    const metaStr = issue.description.split('---META---')[1];
                    const meta = JSON.parse(metaStr);
                    issueDegree = meta.degree || issueDegree;
                } catch (e) {
                    // Fallback to student's degree if metadata parsing fails
                    issueDegree = issue.student?.degree || issueDegree;
                }
            } else {
                issueDegree = issue.student?.degree || issueDegree;
            }
            
            return helperMatchesDegree(userDegree, issueDegree);
        })
        .sort((a, b) => {
            const scoreA = (a.upvotes?.length || 0) * 3 + (a.responses?.length || 0) * 2 + (a.views || 0) / 10;
            const scoreB = (b.upvotes?.length || 0) * 3 + (b.responses?.length || 0) * 2 + (b.views || 0) / 10;
            return scoreB - scoreA;
        })
        .slice(0, 2);

    const personalizedAnnouncements = notifications.filter(note => {
        const isGlobal = note.targetDegree?.toLowerCase() === 'all';
        const isDegreeMatch = note.targetDegree?.toUpperCase() === userDegree.toUpperCase();
        if (!isGlobal && !isDegreeMatch) return false;
        if (note.targetYear && String(note.targetYear) !== userYearShort) return false;
        return true;
    });

    if (user?.role === 'pending_lecturer') {
        return (
            <div className="dashboard-page premium-theme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
                <div className="ann-preview-modal animate-scale-in" style={{ maxWidth: '600px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', padding: '2.5rem 2.5rem 1rem' }}>
                        <div className="flex flex-col items-center gap-4 text-center w-full">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', boxShadow: '0 0 30px rgba(234, 179, 8, 0.15)' }}>
                                <Shield size={40} className="text-yellow-500 animate-pulse" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-wide uppercase" style={{ color: '#F8FAFC' }}>Registration Pending</h1>
                        </div>
                    </div>
                    <div className="ann-modal-body text-center" style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', padding: '0 1rem' }}>
                            Thank you for joining StudyMate as a Lecturer. Your account is currently being reviewed by our administration team to ensure academic integrity.
                        </p>
                        <div className="modal-message-box" style={{ margin: '0 1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontSize: '0.9rem', fontWeight: '700' }}>
                                <Clock size={16} /> Under Review
                            </div>
                            <p style={{ margin: '0', fontSize: '0.85rem', color: '#94A3B8' }}>
                                This usually takes less than 24 hours. You'll gain access to the Lecturer Panel once approved.
                            </p>
                        </div>
                    </div>
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-modal-help pulse-action"
                            style={{ maxWidth: '300px', borderRadius: '16px', fontSize: '0.95rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <ArrowLeft size={18} /> Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="dashboard-page flex justify-center items-center h-screen bg-slate-950">
            <div className="loader-pulse"></div>
        </div>
    );

    return (
        <div className="dashboard-page premium-theme">
            <div className="dashboard-container">

                {/* --- 🎫 Header Hero --- */}
                <div className="dash-hero-card animate-fade-in">
                    <div className="dash-hero-blob"></div>
                    <div className="dash-hero-content">
                        <div className="dash-hero-header">
                            <div className="dash-identity">
                                <div className="dash-avatar-main shadow-glow">
                                    {user?.name?.charAt(0) || 'U'}
                                    <div className="status-indicator"></div>
                                </div>
                                <div className="dash-welcome">
                                    <h1>Hi, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
                                    <div className="dash-badges-row">
                                        <span className="badge-identity degree"><GraduationCap size={14} /> {userDegree} Stream</span>
                                        <span className="badge-identity year"><Target size={14} /> Year {userYearShort}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dash-top-actions flex items-center gap-3">
                                <Link
                                    to="/profile"
                                    className="btn-profile-access pulse-action"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <UserCircle size={20} /> My Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dash-main-grid">

                    {/* 📢 Side Panel (Notifications & Announcements) --- */}
                    <aside className="dash-side-panel">
                        
                        {/* 🔔 Box 1: Your Notifications Section (Personalized alerts) */}
                        {personalNotifications.filter(n => !n.isRead).length > 0 && (
                            <div className="glass-panel animate-up">
                                <div className="panel-header">
                                    <div className="header-left-box">
                                        <Megaphone size={18} className="text-orange-400" /> 
                                        <h2 style={{color: '#FB923C'}}>Your Notifications</h2>
                                    </div>
                                </div>
                                <div className="announcement-stack">
                                    {personalNotifications.filter(n => !n.isRead).map(notif => {
                                        const isPeerHelp = notif.type === 'issue';
                                        const isUrgent = isPeerHelp && notif.title?.toUpperCase().includes('URGENT');
                                        const isResolved = notif.title?.toUpperCase().includes('RESOLVED');
                                        
                                        return (
                                            <div 
                                                key={`pnotif-${notif._id}`} 
                                                className={`ann-item ${isPeerHelp ? (isUrgent ? 'peer-alert pulse-border urgent-red' : 'peer-alert regular-peer') : 'priority'}`}
                                                onClick={!isPeerHelp ? (() => navigate(notif.link || '/issues')) : undefined}
                                                style={!isPeerHelp ? { borderLeftColor: '#FB923C', background: 'rgba(251, 146, 60, 0.05)' } : {}}
                                            >
                                                <div className="ann-top">
                                                    {isPeerHelp ? (
                                                        isUrgent ? (
                                                            <span className="priority-badge-urgent"><Flame size={12} /> URGENT PEER HELP</span>
                                                        ) : (
                                                            <span className="priority-badge-normal" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.2)'}}><Zap size={12} /> PEER HELP</span>
                                                        )
                                                    ) : (
                                                        <span className="ann-labels" style={{color: '#FB923C'}}>{notif.title} • JUST NOW</span>
                                                    )}
                                                    <span className="ann-labels">{new Date(notif.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                                </div>

                                                {(() => {
                                                    const parts = notif.message.split(' ::: ');
                                                    if (parts.length > 1) {
                                                        return (
                                                            <>
                                                                <h4 className="alert-title" style={isUrgent ? {color: '#F87171', fontSize: '1.25rem', fontWeight: '900', marginBottom: '4px'} : {color: '#F1F5F9'}}>{parts[0]}</h4>
                                                                <p style={{fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600', marginBottom: '0.5rem'}}>{parts[1]}</p>
                                                            </>
                                                        );
                                                    }
                                                    return <h4 style={{fontSize: '1rem', marginTop: '0.5rem', fontWeight: '850'}}>{notif.message}</h4>;
                                                })()}
                                                
                                                <div className="alert-two-buttons" style={{marginTop: '1rem'}}>
                                                    {isUrgent ? (
                                                        <button 
                                                            className="btn-help-colleague urgent"
                                                            onClick={(e) => { 
                                                                e.stopPropagation();
                                                                navigate(notif.link || '/issues'); 
                                                            }}
                                                        >
                                                            <Zap size={13} /> Help Urgent
                                                        </button>
                                                    ) : isResolved ? (
                                                        <button 
                                                            className="btn-help-colleague"
                                                            style={{background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.2)'}}
                                                            onClick={(e) => { 
                                                                e.stopPropagation();
                                                                navigate(notif.link || '/issues'); 
                                                            }}
                                                        >
                                                            <Search size={13} /> View Solution
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn-help-colleague"
                                                            style={isPeerHelp ? {background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.2)'} : {}}
                                                            onClick={(e) => { 
                                                                e.stopPropagation();
                                                                navigate(notif.link || '/issues'); 
                                                            }}
                                                        >
                                                            <BookOpen size={13} /> Give Answer
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn-dismiss-alert"
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            axios.put(`/api/notifications/${notif._id}/read`, {}, user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {})
                                                                .then(() => setPersonalNotifications(prev => prev.filter(n => n._id !== notif._id)));
                                                        }}
                                                    >
                                                        <X size={13} /> Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 📢 Box 2: System Announcements */}
                        <div className={`glass-panel animate-up ${personalNotifications.filter(n => !n.isRead).length > 0 ? 'mt-6' : ''}`}>
                            <div className="panel-header">
                                <div className="header-left-box"><Megaphone size={18} className="text-blue-400" /> <h2>Announcements</h2></div>
                                <button className="btn-segment-more" style={{fontSize: '0.75rem', padding: '4px 8px'}} onClick={() => setIsAllAnnModalOpen(true)}>View All</button>
                            </div>
                            <div className="announcement-stack">
                                {personalizedAnnouncements.slice(0, 3).map(note => (
                                    <div
                                        key={note.id}
                                        className={`ann-item ${note.priority.toLowerCase() === 'high' ? 'priority' : ''} ${readNotes.includes(note.id) ? 'read' : ''}`}
                                        onClick={() => handleOpenAnn(note)}
                                    >
                                        <div className="ann-top">
                                            <span className="ann-labels">{note.priority} • {note.date}</span>
                                            {!readNotes.includes(note.id) && <div className="ann-dot"></div>}
                                        </div>
                                        <h4>{note.title}</h4>
                                        <p>{note.message}</p>
                                    </div>
                                )) }
                                {personalizedAnnouncements.length === 0 && (
                                    <div className="empty-ann"><CheckCircle2 size={32} className="text-slate-800" /><p>No announcements today</p></div>
                                )}
                            </div>
                        </div>

                        {/* --- 🎯 Personal Goals Section --- */}
                        <div className="glass-panel mt-6 animate-scale-in" style={{animationDelay: '0.2s'}}>
                            <div className="panel-header">
                                <div className="header-left-box"><Bookmark size={18} className="text-emerald-400" /> <h2>Personal Goals</h2></div>
                            </div>

                            {/* Add Goal Input */}
                            <div className="add-goal-container" style={{marginBottom: '1.2rem', display: 'flex', gap: '8px'}}>
                                <input 
                                    id="new-goal-input"
                                    type="text" 
                                    placeholder="Add a new academic goal..." 
                                    className="goal-input"
                                    style={{
                                        flex: 1,
                                        padding: '12px 15px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddGoal(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button 
                                    className="btn-add-goal"
                                    style={{
                                        padding: '0 15px',
                                        background: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => {
                                        const input = document.getElementById('new-goal-input');
                                        if (input) {
                                            handleAddGoal(input.value);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="sub-list" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                {personalGoals && personalGoals.length > 0 ? (
                                    personalGoals.map(goal => (
                                        <div key={goal._id} className="goal-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 12px', borderRadius: '12px'}}>
                                            <div 
                                                style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer'}}
                                                onClick={() => {
                                                    axios.put(`/api/auth/profile/goals/${goal._id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
                                                        .then(res => setPersonalGoals(res.data))
                                                        .catch(err => {
                                                            console.error('Toggle fail:', err);
                                                            alert('Failed to update goal. Please try again.');
                                                        });
                                                }}
                                            >
                                                <div className={`goal-check ${goal.checked ? 'active' : ''}`}></div>
                                                <span className={goal.checked ? 'text-strikethrough' : ''} style={{fontSize: '0.85rem', color: goal.checked ? '#475569' : '#CBD5E1'}}>{goal.text}</span>
                                            </div>
                                            <button 
                                                style={{background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', opacity: 0.6}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    axios.delete(`/api/auth/profile/goals/${goal._id}`, { headers: { Authorization: `Bearer ${user.token}` } })
                                                        .then(res => setPersonalGoals(res.data))
                                                        .catch(err => {
                                                            console.error('Delete fail:', err);
                                                            alert('Failed to delete goal. Please try again.');
                                                        });
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{fontSize: '0.75rem', color: '#64748B', textAlign: 'center', padding: '1rem'}}>No academic goals yet. Focus on your success!</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* 🚀 Right side: Academic Content --- */}
                    <main className="dash-content-center">

                        {/* Recommended Study Materials (Stream 1) */}
                        <section className="content-segment animate-up" style={{ animationDelay: '0.2s' }}>
                            <div className="segment-head">
                                <div className="title-box"><Sparkles size={20} className="text-yellow-400" /> <h2>Recommended Study Materials</h2></div>
                                <button className="btn-segment-more" onClick={() => navigate('/materials')}>View All</button>
                            </div>
                            <div className="content-tiles">
                                {recommendedContent.map(item => (
                                    <div key={item._id || item.id} className="content-tile pulse-on-hover" onClick={() => navigate(`/materials/${item._id || item.id}`)}>
                                        <div className="tile-rating-badge" style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(251, 191, 36, 0.15)', padding: '4px 8px', borderRadius: '20px', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 'bold'}}>
                                            <Star size={12} fill="#FBBF24" /> {item.averageRating || '0.0'}
                                        </div>
                                        <span className="tile-tag">{item.subject}</span>
                                        <h3>{item.title}</h3>
                                        <div className="tile-footer" style={{fontSize: '0.75rem', color: '#94A3B8', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px'}}>
                                            <span><Sparkles size={12} className="text-yellow-500" /> {item.reactionCount || 0} Reactions</span>
                                            <span><Target size={12} /> Year {item.year}</span>
                                        </div>
                                        <button className="btn-tile-action">Open Detail Now <ArrowUpRight size={14} /></button>
                                    </div>
                                ))}
                                {recommendedContent.length === 0 && (
                                     <div className="empty-content-box" style={{gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)'}}>
                                        <p style={{color: '#64748B'}}>Select your degree in profile to get matched materials.</p>
                                     </div>
                                )}
                            </div>
                        </section>

                        {/* Internships for Degree (Stream 2) */}
                        <section className="content-segment animate-up" style={{ animationDelay: '0.3s' }}>
                            <div className="segment-head">
                                <div className="title-box"><Shield size={20} className="text-emerald-400" /> <h2>Internships for {userDegree}</h2></div>
                                <button className="btn-segment-more" onClick={() => navigate('/internships')}>View All</button>
                            </div>
                            <div className="content-tiles">
                                {internships && internships.length > 0 ? (
                                    internships.map(item => (
                                        <div key={item._id} className="content-tile alt pulse-on-hover" onClick={() => navigate(`/internships/${item._id}`)}>
                                            <span className="tile-tag blue">{item.company || 'Top Company'}</span>
                                            <h3>{item.title}</h3>
                                            <div className="tile-footer" style={{fontSize: '0.75rem', color: '#94A3B8', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <Target size={12} /> {item.location || 'Remote'}
                                            </div>
                                            <button className="btn-tile-action blue" style={{marginTop: '15px'}}>View Details</button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-content-box" style={{gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)'}}>
                                        <p style={{color: '#64748B'}}>No internships posted for your stream yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Trending Peer Discussions (Stream 3) */}
                        <section className="content-segment animate-up" style={{ animationDelay: '0.4s' }}>
                            <div className="segment-head">
                                <div className="title-box"><Flame size={20} className="text-red-400" /> <h2>Trending Peer Discussions</h2></div>
                                <button className="btn-segment-more" onClick={() => navigate('/issues')}>View All</button>
                            </div>
                            <div className="content-tiles">
                                {trendingPeerIssues.length > 0 ? (
                                    trendingPeerIssues.map(issue => {
                                        const totalReactions = (issue.upvotes?.length || 0);
                                        const totalResponses = (issue.responses?.length || 0);
                                        const isHot = totalReactions > 2 || totalResponses > 3;
                                        const isResolved = issue.status === 'Resolved';
                                        return (
                                            <div
                                                key={issue._id}
                                                className="content-tile pulse-on-hover"
                                                style={{ borderColor: isResolved ? 'rgba(16,185,129,0.2)' : isHot ? 'rgba(239,68,68,0.2)' : undefined, cursor: 'pointer' }}
                                                onClick={() => navigate(`/issues/${issue._id}`)}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <span className="tile-tag" style={{ color: isResolved ? '#34D399' : isHot ? '#F87171' : '#F59E0B', marginBottom: 0 }}>
                                                        {isResolved ? '✅ Resolved' : isHot ? '🔥 Hot' : '💬 Active'}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                                                        {issue.subject}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{issue.title}</h3>
                                                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {issue.description?.replace(/---META---.*$/s, '').trim()}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.72rem', color: '#64748B', marginBottom: '1rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: totalReactions > 0 ? '#F87171' : '#64748B' }}>
                                                        <Flame size={12} /> {totalReactions} Upvotes
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: totalResponses > 0 ? '#60A5FA' : '#64748B' }}>
                                                        <Activity size={12} /> {totalResponses} Responses
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <BookOpen size={12} /> {issue.views || 0} Views
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '1rem' }}>
                                                    By <span style={{ color: '#94A3B8', fontWeight: 600 }}>{issue.student?.name || 'A Student'}</span>
                                                </div>
                                                {isResolved ? (
                                                    <button className="btn-tile-action" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: '#34D399' }}>
                                                        <CheckCircle2 size={14} /> View Solution
                                                    </button>
                                                ) : (
                                                    <button className="btn-tile-action" style={{ background: isHot ? 'rgba(239,68,68,0.1)' : undefined, borderColor: isHot ? 'rgba(239,68,68,0.2)' : undefined, color: isHot ? '#F87171' : undefined }}>
                                                        Join Discussion <ArrowUpRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-content-box" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ color: '#64748B' }}>No trending discussions yet. Be the first to start one!</p>
                                    </div>
                                )}
                            </div>
                        </section>

                    </main>

                </div>

                {/* --- 📢 All Announcements (History) Modal --- */}
                {isAllAnnModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content ann-preview-modal animate-scale-in" style={{ maxWidth: '700px', maxHeight: '85vh' }}>
                            <div className="modal-header">
                                <div className="header-left-title"><Megaphone size={20} className="text-blue-400" /> <h3>Historical Announcements</h3></div>
                                <button className="btn-close-modal" onClick={() => setIsAllAnnModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="ann-modal-body" style={{ overflowY: 'auto', paddingRight: '10px' }}>
                                {notifications.length > 0 ? (
                                    <div className="announcement-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {notifications.map(note => (
                                            <div 
                                                key={`hist-${note.id}`} 
                                                className={`ann-item ${note.priority.toLowerCase() === 'high' ? 'priority' : ''}`}
                                                style={{ cursor: 'default', opacity: 1, transform: 'none' }}
                                            >
                                                <div className="ann-top">
                                                    <span className="ann-labels">{note.priority} Alert • {note.date}</span>
                                                </div>
                                                <h4 style={{ marginBottom: '8px' }}>{note.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.5' }}>{note.message}</p>
                                                <div className="modal-audience-box" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem' }}>
                                                    <Target size={14} className="text-blue-400" />
                                                    <span>Audience: {note.targetDegree} Students {note.targetYear && `• Year ${note.targetYear}`}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <Megaphone size={48} style={{ color: '#1E293B', marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748B' }}>No announcement history found.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'center' }}>
                                <button className="btn-modal-done" onClick={() => setIsAllAnnModalOpen(false)}>Close Archive</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;
