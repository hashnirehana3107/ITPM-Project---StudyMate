import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, BookOpen, GraduationCap, Calendar, Settings, Edit,
    MessageSquare, CheckCircle2, Clock, Award, Hash, Loader2,
    Target, Activity, ChevronRight, Sparkles, UserCheck, ShieldCheck,
    Globe, Phone, Github, Linkedin, ExternalLink, Flame, Briefcase, Building, Zap
} from 'lucide-react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        totalIssues: 0,
        resolvedIssues: 0,
        contributions: 0,
        reputation: 850
    });
    const [myRecentIssues, setMyRecentIssues] = useState([]);
    const [internships, setInternships] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'partner') {
            const fetchPartnerData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get('http://localhost:5000/api/internships/employer', config);
                    setInternships(data);
                    setUserStats({
                        totalInternships: data.length,
                        activeListings: data.filter(i => i.status === 'approved').length
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching partner data", err);
                    setLoading(false);
                }
            };
            fetchPartnerData();
        } else {
            // Student view - Fetch real backend data
            const fetchStudentData = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    
                    // 1. Fetch real academic statistics
                    const { data: stats } = await axios.get('/api/issues/stats/me', config);
                    setUserStats(stats);

                    // 2. Fetch real recent issues posted by student
                    const { data: issues } = await axios.get('/api/issues/my', config);
                    setMyRecentIssues(issues.slice(0, 3)); // Display top 3 for the journal

                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching student profile data", err);
                    // Fallback to zeros if fetch fails (better than mock data for a real app)
                    setUserStats({
                        contributions: 0,
                        resolvedIssues: 0,
                        totalIssues: 0,
                        reputation: 0
                    });
                    setLoading(false);
                }
            };
            fetchStudentData();
        }
    }, [user?._id, user?.role, navigate]);

    if (loading) {
        return (
            <div className="profile-page-loading">
                <div className="loader-orbit"></div>
                <p>Curating your academic profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page-premium">
            <div className="profile-main-container">

                {/* --- 🎩 Hero Identity Card --- */}
                <div className="profile-identity-card animate-fade-in">
                    <div className="profile-header-background">
                        <div className="overlay-mesh"></div>
                    </div>
                    
                    <div className="profile-header-content">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-main">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="Profile" className="profile-img-main" />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="profile-crown"><Sparkles size={16} /></div>
                            <div className="status-badge-online"></div>
                        </div>

                        <div className="profile-primary-details">
                            <div className="profile-name-area">
                                <h1>{user?.name || 'Academic Scholar'}</h1>
                                <span className="verified-status-tag"><ShieldCheck size={14} /> Verified Member</span>
                            </div>
                            <div className="profile-meta-row">
                                <span className="meta-item"><GraduationCap size={16} /> {user?.degree || 'IT'} Stream</span>
                                <span className="meta-separator">•</span>
                                <span className="meta-item"><Calendar size={16} /> Year {String(user?.year || '1').charAt(0)} Undergraduate</span>
                            </div>
                        </div>

                        <div className="profile-action-group">
                            <button onClick={() => navigate('/profile/edit')} className="btn-premium-edit">
                                <Edit size={18} /> Modify Profile
                            </button>
                            <button onClick={() => navigate('/profile/change-password')} className="btn-premium-settings">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-grid-system">

                    {/* 👈 sidebar column: Stats & Overview */}
                    <div className="profile-sidebar-stack">

                        {/* Impact Analytics */}
                        <div className="profile-widget stat-reveal animate-up">
                            <div className="widget-header">
                                <Award size={20} className="text-yellow-400" />
                                <h3>Community Recognition</h3>
                            </div>
                            <div className="analytics-grid">
                                <div className="analytics-box">
                                    <span className="box-val">{userStats.contributions}</span>
                                    <span className="box-label">Contributions</span>
                                </div>
                                <div className="analytics-box">
                                    <span className="box-val">{userStats.solutionsProvided}</span>
                                    <span className="box-label">Solutions</span>
                                </div>
                            </div>
                            <div className="reputation-bar-wrapper">
                                <div className="rep-label-row">
                                    <span>Reputation Points</span>
                                    <span>{userStats.reputation} / 1000</span>
                                </div>
                                <div className="rep-progress-track">
                                    <div className="rep-progress-fill" style={{ width: `${(userStats.reputation/1000)*100}%` }}></div>
                                </div>
                                <p className="rep-milestone">Top 5% in {user?.degree} track this month!</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="profile-widget slide-up-delay animate-up">
                            <div className="widget-header">
                                <UserCheck size={20} className="text-blue-400" />
                                <h3>Communication</h3>
                            </div>
                            <div className="contact-info-list">
                                <div className="contact-entry">
                                    <div className="entry-icon"><Mail size={16} /></div>
                                    <div className="entry-body"><span>Email Address</span><p>{user?.email}</p></div>
                                </div>
                                <div className="contact-entry">
                                    <div className="entry-icon"><Hash size={16} /></div>
                                    <div className="entry-body"><span>Registration ID</span><p>{user?.regNo || 'ST-2022-001'}</p></div>
                                </div>
                                <div className="contact-entry">
                                    <div className="entry-icon"><Phone size={16} /></div>
                                    <div className="entry-body"><span>Phone</span><p>Not provided</p></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 👉 Main activity column */}
                    <div className="profile-content-stack">

                        {/* Expertise Showcase / Impact Highlights */}
                        <div className="profile-large-panel showcase-panel animate-up">
                            <div className="panel-header-row">
                                <div className="panel-title-box">
                                    <Target size={22} className="text-blue-400" />
                                    <h2>Impact Highlights</h2>
                                </div>
                            </div>
                            <div className="expertise-grid">
                                <div className="expertise-card">
                                    <div className="exp-icon"><Flame size={18} className="text-red-400" /></div>
                                    <div className="exp-info">
                                        <h5>Fastest Solver</h5>
                                        <p>Average resolution time under 2 hours.</p>
                                    </div>
                                </div>
                                <div className="expertise-card">
                                    <div className="exp-icon"><Globe size={18} className="text-teal-400" /></div>
                                    <div className="exp-info">
                                        <h5>Peer Mentor</h5>
                                        <p>Highly rated for technical clarity in solutions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Career Path / Opportunities (Replacing the journal with something more dynamic) */}
                        <div className="profile-widget slide-up-delay animate-up" style={{ marginTop: '1.5rem', background: 'rgba(59, 130, 246, 0.03)', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                            <div className="widget-header">
                                <Briefcase size={20} className="text-blue-400" />
                                <h3>Career Readiness</h3>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#94A3B8', padding: '0.5rem 0' }}>
                                Based on your contributions in {user?.degree || 'your stream'}, you are currently in the <b>Top Tier</b> for internship recommendations.
                            </p>
                            <button onClick={() => navigate('/internships')} className="btn-tile-action blue" style={{ width: '100%', marginTop: '10px' }}>
                                Explore Matched Roles
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
