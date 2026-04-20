import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Briefcase, MapPin, Clock, Calendar, Search, Building,
    ChevronRight, GraduationCap, Book, Bookmark, BookmarkCheck,
    Zap, Timer, Star, CheckCircle2, Flame, Sparkles, Trophy
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { MOCK_INTERNSHIPS } from '../../utils/internshipData';
import './Internships.css';

// ── helpers ────────────────────────────────────────────────────────────
const TODAY = new Date();

const daysUntil = (deadline) =>
    Math.ceil((new Date(deadline) - TODAY) / (1000 * 60 * 60 * 24));

const isExpired = (deadline) => daysUntil(deadline) < 0;

// Helper for flexible matching
const helperMatchesDegree = (targetDeg, itemDeg) => {
    if (!targetDeg || targetDeg === 'All' || targetDeg === 'all') return true;
    if (!itemDeg) return false;
    const normalize = (s) => {
        let val = String(s).toLowerCase().replace(/bsc\s+/g, '').replace(/stream/g, '').trim();
        if (val.includes('information technology')) return 'it';
        if (val.includes('software engineering')) return 'se';
        if (val.includes('data science')) return 'ds';
        if (val.includes('business management')) return 'bm';
        return val;
    };
    const t = normalize(targetDeg);
    const i = normalize(itemDeg);
    return t === i || t.includes(i) || i.includes(t);
};

const calcMatch = (job, user) => {
    if (!user) return 0;
    let score = 0;

    // 1. Degree Match (Max 40)
    if (helperMatchesDegree(user.degree, job.degree)) score += 40;
    
    // 2. Year Match (Max 20)
    const yearMap = { '1st year': 1, '2nd year': 2, '3rd year': 3, '4th year': 4 };
    const uYear = yearMap[String(user.year || '').toLowerCase()] || parseInt(user.year) || 3;
    
    // Safely handle eligibleYears
    const eligibleRaw = Array.isArray(job.eligibleYears) ? job.eligibleYears : (job.eligibleYears?.toString() || '').split(',');
    const eligible = eligibleRaw.map(y => yearMap[String(y).toLowerCase().trim()] || 0);
    if (eligible.includes(uYear)) score += 20;

    // 3. Skills Match (Max 40)
    const userSkills = (user.skills || []).map(s => String(s).toLowerCase().trim());
    
    // Safely handle job skills
    const jobSkillsRaw = Array.isArray(job.skills) ? job.skills : (job.skills?.toString() || '').split(',');
    const jobSkills = jobSkillsRaw.map(s => String(s).toLowerCase().trim()).filter(s => s);
    
    if (jobSkills.length > 0) {
        const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
        const skillScore = (matchingSkills.length / jobSkills.length) * 40;
        score += skillScore;
    } else {
        score += 20;
    }

    return Math.round(Math.min(score, 100));
};

// ── component ──────────────────────────────────────────────────────────
const InternshipList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        degree: user?.degree || 'All',
        year: 'All',
        type: 'All',
    });
    const [activeTab, setActiveTab] = useState('all');
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [degrees, setDegrees] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [appliedIds, setAppliedIds] = useState([]);

    // Derived storage keys
    const savedKey = user ? `studyMate_saved_internships_${user._id || user.id}` : null;
    const appliedKey = user ? `studyMate_applied_internships_${user._id || user.id}` : null;

    // ── load ───────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchInternships = async () => {
            try {
                setLoading(true);
                const token = user?.token;
                if (!token) return;

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/internships', config);
                
                if (data && data.length > 0) {
                    const approvedOnly = data.filter(item => item.status === 'approved' || item.status === 'Active');
                    const mappedReal = approvedOnly.map(item => ({
                        ...item,
                        id: item._id,
                        logo: item.logo || (item.company ? item.company.charAt(0) : 'I'),
                        source: 'live'
                    }));
                    setInternships(mappedReal);
                } else {
                    setInternships(MOCK_INTERNSHIPS);
                }
            } catch (error) {
                console.error('Error fetching internships:', error);
                setInternships(MOCK_INTERNSHIPS);
            } finally {
                setLoading(false);
            }
        };

        const fetchApplied = async () => {
            if (!user) return;
            const token = user?.token;
            
            // 1. Get user-specific local tracked items
            const localApplied = JSON.parse(localStorage.getItem(appliedKey) || '[]');
            
            if (token) {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get('http://localhost:5000/api/applications/my', config);
                    const backendIds = data.map(app => app.internship?._id || app.internship);
                    
                    const merged = [...new Set([...localApplied, ...backendIds])];
                    setAppliedIds(merged);
                } catch (error) {
                    console.error('Error fetching applied status:', error);
                    setAppliedIds(localApplied);
                }
            } else {
                setAppliedIds(localApplied);
            }
        };

        const loadSaved = () => {
            if (savedKey) {
                const localSaved = JSON.parse(localStorage.getItem(savedKey) || '[]');
                setSavedIds(localSaved);
            }
        };

        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/degrees');
                setDegrees(data);
            } catch (err) {
                console.error("Failed to fetch degrees");
            }
        };

        fetchInternships();
        fetchApplied();
        fetchDegrees();
        loadSaved();
    }, [user?.token, user?._id, savedKey, appliedKey]);

    useEffect(() => {
        if (user?.degree) setFilters(prev => ({ ...prev, degree: user.degree }));
    }, [user?.degree]);

    // ── save / track ───────────────────────────────────────────────────
    const toggleSave = (e, jobId) => {
        e.stopPropagation();
        if (!savedKey) return;
        setSavedIds(prev => {
            const next = prev.includes(jobId) ? prev.filter(x => x !== jobId) : [...prev, jobId];
            localStorage.setItem(savedKey, JSON.stringify(next));
            return next;
        });
    };
    const markApplied = (e, jobId) => {
        e.stopPropagation();
        if (!appliedKey) return;
        setAppliedIds(prev => {
            const next = prev.includes(jobId) ? prev.filter(x => x !== jobId) : [...prev, jobId];
            localStorage.setItem(appliedKey, JSON.stringify(next));
            return next;
        });
    };

    // ── filters ────────────────────────────────────────────────────────
    const categories = {
        years: ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"],
        types: ["All", "Full-time", "Part-time", "Remote"],
    };

    const degreeMapping = {
        'it': ['it', 'information technology'], 'se': ['se', 'software engineering'],
        'ds': ['ds', 'data science'], 'bm': ['bm', 'business management'],
        'accounting': ['accounting', 'acc'], 'engineering': ['engineering', 'eng'],
        'business': ['business', 'biz'], 'science': ['science', 'sci'],
    };

    const baseFiltered = internships.filter(job => {
        if (isExpired(job.deadline) || job.status === 'Expired') return false;
        const q = searchTerm.toLowerCase();
        if (q && !job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q)) return false;
        
        const cf = (filters.degree || 'All').toLowerCase();
        const jd = (job.degree || '').toLowerCase();
        
        if (cf !== 'all') {
            let degreeOk = helperMatchesDegree(cf, jd);
            if (!degreeOk && degreeMapping[cf]) degreeOk = degreeMapping[cf].includes(jd);
            if (!degreeOk) return false;
        }

        if (filters.year !== 'All' && !(job.eligibleYears || []).includes(filters.year)) return false;
        if (filters.type !== 'All' && job.type !== filters.type) return false;
        return true;
    });

    const displayJobs = baseFiltered.filter(job => {
        if (activeTab === 'matched') return calcMatch(job, user) >= 80;
        if (activeTab === 'saved') return savedIds.includes(job.id);
        if (activeTab === 'applied') return appliedIds.includes(job.id);
        return true;
    });

    const sortedJobs = [...displayJobs].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return daysUntil(a.deadline) - daysUntil(b.deadline);
    });

    const matchedCount = baseFiltered.filter(j => calcMatch(j, user) >= 80).length;
    const urgentCount = baseFiltered.filter(j => daysUntil(j.deadline) <= 14).length;

    // ── year-smart banner ──────────────────────────────────────────────
    const getYearBanner = () => {
        const yearMap = { '1st year': 1, '2nd year': 2, '3rd year': 3, '4th year': 4 };
        const uYear = yearMap[String(user?.year || '').toLowerCase()] || parseInt(user?.year) || 0;
        if (uYear === 3) return { icon: <Zap size={15} />, cls: 'blue', text: <>You're in <strong>Year 3</strong> — the best time to secure an internship! Listings eligible for 3rd Year students are highlighted.</> };
        if (uYear === 4) return { icon: <Trophy size={15} />, cls: 'gold', text: <>Final year students: Industrial Training placements are waiting. <strong>Apply before deadlines close!</strong></> };
        if (uYear <= 2) return { icon: <Star size={15} />, cls: 'purple', text: <>Early birds get the worm! <strong>Part-time placements</strong> & student programs are available for 1st & 2nd year students.</> };
        return null;
    };
    const banner = getYearBanner();

    return (
        <div className="internship-page animate-fade-in">
            <div className="internship-container">

                {/* ── Header Card (mirrors materials-header-card) ── */}
                <div className="internship-header-card">
                    <div className="header-content">
                        <div className="header-icon">
                            <Briefcase size={32} />
                        </div>
                        <div className="header-text">
                            <h1>Career Opportunities</h1>
                            <p>Personalized internships for <strong>{user?.degree || 'your'}</strong> students</p>
                        </div>
                        {/* Stats pills tucked into header */}
                        <div className="int-header-stats">
                            <span className="int-stat-pill green"><Trophy size={13} /> {matchedCount} Matched</span>
                            <span className="int-stat-pill red"><Flame size={13} /> {urgentCount} Closing Soon</span>
                            <span className="int-stat-pill blue"><Bookmark size={13} /> {savedIds.length} Saved</span>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="int-tabs">
                    {[
                        { key: 'all',     label: 'All Openings',             icon: <Briefcase size={14} /> },
                        { key: 'matched', label: `Best Matches (${matchedCount})`, icon: <Sparkles size={14} /> },
                        { key: 'saved',   label: `Saved (${savedIds.length})`,    icon: <Bookmark size={14} /> },
                        { key: 'applied', label: `Applied (${appliedIds.length})`,icon: <CheckCircle2 size={14} /> },
                    ].map(tab => (
                        <button key={tab.key} className={`int-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Filter & Search (mirrors filter-section-premium) ── */}
                <div className="filter-section-premium">
                    <div className="search-bar-modern">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by role or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-modern"
                        />
                    </div>
                    <div className="filter-grid-modern">
                        <div className="filter-group-modern">
                            <label><GraduationCap size={18} /> Degree</label>
                            <select 
                                value={filters.degree} 
                                onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                                className="filter-select-modern"
                            >
                                <option value="All">All Degrees</option>
                                {user?.degree && !degrees.find(d => (d.code || d.name) === user.degree) && (
                                    <option value={user.degree}>{user.degree}</option>
                                )}
                                {degrees.map(d => <option key={d._id} value={d.code || d.name}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Book size={18} /> Academic Year</label>
                            <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="filter-select-modern">
                                {categories.years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Briefcase size={18} /> Job Category</label>
                            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="filter-select-modern">
                                {categories.types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="filter-actions-modern">
                            <button onClick={() => { setFilters({ degree: user?.degree || 'All', year: 'All', type: 'All' }); setActiveTab('all'); }} className="reset-filter-btn">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Year-smart Banner ── */}
                {banner && (
                    <div className={`int-smart-banner banner-${banner.cls}`}>
                        <span className="banner-icon">{banner.icon}</span>
                        <span>{banner.text}</span>
                    </div>
                )}

                {/* ── Cards Grid (mirrors materials-grid) ── */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Scanning career opportunities...</p>
                    </div>
                ) : (
                    <div className="internship-grid">
                        {sortedJobs.length > 0 ? sortedJobs.map(job => {
                            const match = calcMatch(job, user);
                            const days = daysUntil(job.deadline);
                            const isSaved = savedIds.includes(job.id);
                            const isApplied = appliedIds.includes(job.id);
                            const yearMap = { '1st year': 1, '2nd year': 2, '3rd year': 3, '4th year': 4 };
                            const uYear = yearMap[String(user?.year || '').toLowerCase()] || parseInt(user?.year) || 0;
                            const isEligible = (job.eligibleYears || []).some(y => (yearMap[y.toLowerCase()] || 0) === uYear);

                            return (
                                <div
                                    key={job.id}
                                    className={`internship-card-modern ${days <= 14 ? 'closing-soon' : ''} ${isApplied ? 'applied-card' : ''}`}
                                    onClick={() => navigate(`/internships/${job.id}`)}
                                >
                                    {/* Featured ribbon */}
                                    {job.featured && <div className="int-ribbon">⭐ Featured</div>}

                                    {/* Card top (mirrors card-top) */}
                                    <div className="card-top">
                                        <div className="company-logo-box">{job.logo}</div>
                                        <div className="int-top-right">
                                            {/* Deadline badge */}
                                            {days <= 3
                                                ? <span className="int-deadline-badge critical"><Flame size={11} />{days}d left!</span>
                                                : days <= 14
                                                    ? <span className="int-deadline-badge urgent"><Timer size={11} />{days} days</span>
                                                    : <span className="int-deadline-badge normal"><Calendar size={11} />{days}d left</span>
                                            }
                                            {/* Bookmark */}
                                            <button className={`int-bookmark-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => toggleSave(e, job.id)}>
                                                {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title & company */}
                                    <h3 className="internship-title">{job.title}</h3>
                                    <p className="internship-company"><Building size={13} /> {job.company}</p>

                                    {/* Meta tags (mirrors material-meta) */}
                                    <div className="internship-meta">
                                        {match >= 80 && <span className="int-meta-tag match-high"><Sparkles size={11} /> {match}% Match</span>}
                                        {match >= 50 && match < 80 && <span className="int-meta-tag match-med"><Star size={11} /> {match}% Match</span>}
                                        {isEligible && <span className="int-meta-tag eligible"><CheckCircle2 size={11} /> Eligible for You</span>}
                                        {isApplied && <span className="int-meta-tag applied"><CheckCircle2 size={11} /> Applied</span>}
                                    </div>

                                    {/* Stats (mirrors card-stats) */}
                                    <div className="card-stats internship-stats">
                                        <div className="stat"><MapPin size={14} /> {job.location}</div>
                                        <div className="stat"><Clock size={14} /> {job.duration}</div>
                                        <div className="stat"><Briefcase size={14} /> {job.type}</div>
                                        <div className="stat">
                                            <GraduationCap size={14} /> 
                                            {Array.isArray(job.eligibleYears) ? job.eligibleYears.join(', ') : (job.eligibleYears || 'All Years')}
                                        </div>
                                    </div>

                                    {/* Actions (mirrors card-actions) */}
                                    <div className="card-actions">
                                        <button
                                            className={`btn-action track ${isApplied ? 'applied' : ''}`}
                                            onClick={(e) => markApplied(e, job.id)}
                                        >
                                            {isApplied ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                                            {isApplied ? 'Applied' : 'Track'}
                                        </button>
                                        <button className="btn-action view">
                                            View <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <Search size={48} />
                                <h3>No matching internships</h3>
                                <p>Try adjusting your search or filters.</p>
                                <button className="reset-filter-btn" style={{ marginTop: '1rem' }}
                                    onClick={() => { setFilters({ degree: user?.degree || 'All', year: 'All', type: 'All' }); setActiveTab('all'); }}>
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternshipList;
