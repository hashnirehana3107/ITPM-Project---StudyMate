import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Briefcase, MapPin, Clock, Calendar, CheckCircle, ArrowLeft, 
    Building, Target, BookOpen, UserCheck, GraduationCap, Laptop,
    Sparkles, ShieldCheck, Zap
} from 'lucide-react';
import { MOCK_INTERNSHIPS } from '../../utils/internshipData';
import ApplyModal from '../../components/Internships/ApplyModal';
import './InternshipDetail.css';

const InternshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    // ── Compatibility Match Logic ─────────────────────────────────────────
    const calculateMatch = (internship, user) => {
        if (!user || !internship) return { score: 0, matching: [], missing: [] };
        
        const userSkills = (user.skills || []).map(s => s.toLowerCase().trim());
        const jobSkillsRaw = (internship.skills?.toString() || '').split(',').map(s => s.toLowerCase().trim()).filter(s => s);
        
        const matching = jobSkillsRaw.filter(s => userSkills.includes(s));
        const missing = jobSkillsRaw.filter(s => !userSkills.includes(s));
        
        let score = 0;
        if ((internship.degree || '').toLowerCase() === (user.degree || '').toLowerCase()) score += 40;
        if (jobSkillsRaw.length > 0) {
            score += Math.round((matching.length / jobSkillsRaw.length) * 60);
        } else {
            score += 20;
        }
        
        return { score: Math.min(score, 100), matching, missing };
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const analysis = calculateMatch(internship, userInfo);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const token = userInfo?.token;
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const { data } = await axios.get(`http://localhost:5000/api/internships/${id}`, config);
                if (data && data._id) {
                    setInternship({ 
                        ...data, 
                        id: data._id, 
                        logo: data.logo || (data.company?.charAt(0) || 'I') 
                    });
                    setLoading(false);
                    return;
                }
            } catch (_) {}

            const mockFound = MOCK_INTERNSHIPS.find(m => m.id.toString() === id.toString());
            setInternship(mockFound || null);
            setLoading(false);
        };
        fetchDetail();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
    if (!internship) return <div className="error-screen"><h2>Internship Not Found</h2><button onClick={() => navigate('/internships')}>Back to List</button></div>;

    return (
        <div className="internship-detail-page">
            {/* 🔙 Breadcrumb / Back Navigation */}
            <div className="detail-container">
                <div className="breadcrumb-nav">
                    <button onClick={() => navigate('/internships')} className="btn-back-link">
                        <ArrowLeft size={16} /> Career Opportunities
                    </button>
                    <span className="separator">/</span>
                    <span className="current-crumb">{internship.title}</span>
                </div>
            </div>

            <div className="detail-hero-section">
                <div className="detail-container">
                    
                    <div className="hero-content">
                        <div className="hero-left">
                            <div className="detail-company-logo">{internship.logo}</div>
                            <div className="hero-text">
                                <h1 className="detail-title">{internship.title}</h1>
                                <p className="detail-company-name"><Building size={20} /> {internship.company}</p>
                                <div className="hero-meta-tags">
                                    <span className="meta-tag"><MapPin size={16} /> {internship.location}</span>
                                    <span className="meta-tag"><Clock size={16} /> {internship.duration}</span>
                                    <span className="meta-tag"><Briefcase size={16} /> {internship.type}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-right">
                            <button className="main-apply-btn" onClick={() => setIsApplyModalOpen(true)}>
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-container main-grid">
                {/* ── Left Column: Analysis & Description ── */}
                <div className="main-content-column">
                    
                    {/* 📊 Compatibility Analysis */}
                    {userInfo && userInfo.role === 'student' && (
                        <div className="glass-card compatibility-analysis-card">
                            <div className="analysis-header">
                                <div className="score-circle-wrapper">
                                    <svg viewBox="0 0 36 36" className="circular-chart-lg">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle" strokeDasharray={`${analysis.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="21" className="percentage-lg">{analysis.score}%</text>
                                    </svg>
                                </div>
                                <div className="analysis-intro">
                                    <h3><Sparkles size={20} className="text-yellow" /> Personalized Match</h3>
                                    <p>Our algorithm compares your skills and degree with this role's requirements.</p>
                                </div>
                            </div>
                            
                            <div className="analysis-summary-grid">
                                <div className="sum-section">
                                    <span className="sum-label"><CheckCircle size={14} className="text-emerald" /> Matched Skills</span>
                                    <div className="sum-pills">
                                        {analysis.matching.length > 0 ? analysis.matching.map(s => <span key={s} className="pill-ok">{s}</span>) : <span className="no-pills">N/A</span>}
                                    </div>
                                </div>
                                <div className="sum-section">
                                    <span className="sum-label"><Laptop size={14} className="text-amber" /> Potential Gaps</span>
                                    <div className="sum-pills">
                                        {analysis.missing.length > 0 ? analysis.missing.map(s => <span key={s} className="pill-missing">{s}</span>) : <span className="pill-all-set">No gaps!</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card about-card">
                        <h3><BookOpen size={22} className="text-blue" /> Job Overview</h3>
                        <p className="description-text">{internship.description}</p>
                        
                        <h3 style={{marginTop: '2rem'}}><ShieldCheck size={22} className="text-blue" /> Key Selection Criteria</h3>
                        <ul className="criteria-list">
                            {(Array.isArray(internship.requirements) 
                                ? internship.requirements 
                                : (internship.requirements?.toString() || '').split('\n')
                            ).filter(r => r.trim()).map((req, idx) => (
                                <li key={idx}><CheckCircle size={16} className="text-emerald" /> {req}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Right Column: Skills & Guidance ── */}
                <div className="sidebar-column">
                    <div className="glass-card sidebar-item">
                        <h3>Required Competencies</h3>
                        <div className="skills-vertical">
                            <div className="sv-group">
                                <label>Technical Proficiency</label>
                                <div className="sv-pills">
                                    {(internship.skills?.toString() || '').split(',').map((s, i) => <span key={i} className="sv-pill tech">{s.trim()}</span>)}
                                </div>
                            </div>
                            <div className="sv-group">
                                <label>Interpersonal Skills</label>
                                <div className="sv-pills">
                                    {(internship.softSkills?.toString() || '').split(',').map((s, i) => <span key={i} className="sv-pill soft">{s.trim()}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card sidebar-item guidance-accent">
                        <h3><Target size={20} /> Success Blueprint</h3>
                        <p className="guidance-text">{internship.guidancePath}</p>
                        <div className="prep-tips">
                            <label>Quick Preparation Tips</label>
                            {Array.isArray(internship.guidanceTips) ? internship.guidanceTips.map((t, i) => <div key={i} className="tip-item">• {t}</div>) : <div className="tip-item">• Use company research tools</div>}
                        </div>
                    </div>

                    <div className="eligibility-summary">
                        <div className="elig-row">
                            <GraduationCap size={18} />
                            <span><strong>Target:</strong> {internship.degree}</span>
                        </div>
                        <div className="elig-row">
                            <UserCheck size={18} />
                            <span><strong>Eligibility:</strong> {Array.isArray(internship.eligibleYears) ? internship.eligibleYears.join(', ') : internship.eligibleYears}</span>
                        </div>
                        <div className="elig-row">
                            <Calendar size={18} />
                            <span><strong>Deadline:</strong> {internship.deadline}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isApplyModalOpen && (
                <ApplyModal 
                    internship={internship} 
                    onClose={() => setIsApplyModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default InternshipDetail;
