import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEnrichedMockIssues } from '../../utils/issueMocks';
import {
    MessageSquare, Search, Plus, BookOpen, Calendar, Filter,
    GraduationCap, CheckCircle2, Clock, User, ChevronRight,
    Loader2, ThumbsUp, Flame, Eye, Timer, Sparkles, Paperclip
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './IssueList.css';

const IssueList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        degree: user?.degree || 'All',
        subject: 'All',
        status: 'All',
        sortBy: 'newest'
    });
    

    const [activeTab, setActiveTab] = useState('all');
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });

    // Dynamic degrees from API
    const [degrees, setDegrees] = useState([]);

    const statuses = ["All", "Open", "Resolved"];

    let currentSubjects = ['All'];
    if (filters.degree && filters.degree !== 'All' && degrees.length > 0) {
        const userDeg = filters.degree.toLowerCase().trim();
        const matched = degrees.find(d => {
            const code = (d.code || '').trim().toLowerCase();
            const name = (d.name || '').trim().toLowerCase();
            if (!userDeg) return false;
            return code === userDeg || 
                   name === userDeg || 
                   (name && userDeg.includes(name)) || 
                   (userDeg && name.includes(userDeg)) ||
                   (code && userDeg.includes(code)) ||
                   (code && name.includes(userDeg));
        });

        if (matched && matched.subjects && matched.subjects.length > 0) {
            currentSubjects = ['All', ...matched.subjects.map(s => s.name)];
        }
    } else {
        // If 'All' is selected, collect all subjects
        const allSubs = new Set();
        degrees.forEach(d => {
            if (d.subjects) d.subjects.forEach(s => allSubs.add(s.name));
        });
        currentSubjects = ['All', ...Array.from(allSubs)];
    }

    // Fetch degrees & subjects from API
    useEffect(() => {
        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                setDegrees(data);
            } catch (e) { 
                console.error('API Fetch failed for degrees:', e);
            }
        };
        fetchDegrees();
    }, []);

    // Fetch issues & calculate stats
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/moderation');
            return;
        }

        const fetchIssues = async () => {
            setLoading(true);
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                const { data } = await axios.get('/api/issues', config);
                
                // Map the data to maintain UI compatibility and parse META
                const mappedIssues = data.map(issue => {
                    let desc = issue.description || '';
                    let degree = 'IT';
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
                        upvotes: Array.isArray(issue.upvotes) ? issue.upvotes : []
                    };
                });
                
                // Merge with mock issues for demo purposes
                const mockIssues = getEnrichedMockIssues().filter(mock => !mappedIssues.some(mi => mi._id === mock._id || mi.id === mock.id));
                const combinedIssues = [...mappedIssues, ...mockIssues];
                
                setIssues(combinedIssues);

                // Stats calculation based on active degree
                const statsDegree = user?.role === 'admin' ? filters.degree : (user?.degree || 'All');
                const relevantForStats = statsDegree === 'All'
                    ? combinedIssues
                    : combinedIssues.filter(i => helperMatchesDegree(statsDegree, i.degree));

                const total = relevantForStats.length;
                const open = relevantForStats.filter(i => i.status === 'Open').length;
                const resolved = relevantForStats.filter(i => i.status === 'Resolved').length;
                setStats({ total, open, resolved });
            } catch (error) {
                console.error("Error fetching issues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [navigate, user, filters.degree]);

    const handleDegreeChange = (newDegree) => {
        setFilters(prev => ({ ...prev, degree: newDegree, subject: 'All' }));
    };

    const helperMatchesDegree = (targetDeg, itemDeg) => {
        if (!targetDeg || targetDeg === 'All') return true;
        if (!itemDeg) return false;
        const t = targetDeg.toLowerCase().trim();
        const i = itemDeg.toLowerCase().trim();
        return t === i || t.includes(i) || i.includes(t);
    };

    const baseFiltered = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());
        const targetDegree = user?.role === 'admin' ? filters.degree : (user?.degree || 'All');
        const matchesDegree = helperMatchesDegree(targetDegree, issue.degree);
        const matchesSubject = filters.subject === 'All' || issue.subject === filters.subject;
        const matchesStatus = filters.status === 'All' || issue.status === filters.status;
        return matchesSearch && matchesDegree && matchesSubject && matchesStatus;
    });

    const tabFilteredIssues = baseFiltered.filter(issue => {
        if (activeTab === 'matched') return helperMatchesDegree(user?.degree, issue.degree);
        if (activeTab === 'trending') return (issue.responses?.length > 5 || (issue.upvotes?.length || 0) > 10);
        if (activeTab === 'resolved') return issue.status === 'Resolved';
        return true;
    });

    const sortedIssues = [...tabFilteredIssues].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (filters.sortBy === 'newest') return dateB - dateA;
        if (filters.sortBy === 'popular') return (b.responses?.length || 0) - (a.responses?.length || 0);
        if (filters.sortBy === 'upvoted') return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
        return 0;
    });

    const handleUpvote = async (e, issueId) => {
        e.stopPropagation();
        if (!user) return navigate('/login');

        // Detect Mock ID
        if (issueId.length < 5 || (typeof issueId === 'string' && issueId.includes('m'))) {
            alert("This is Mock Data. Please create a NEW Issue to test real persistence.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: updatedIssue } = await axios.post(`/api/issues/${issueId}/upvote`, {}, config);

            setIssues(prevIssues => prevIssues.map(issue => 
                issue._id === issueId ? { ...issue, upvotes: updatedIssue.upvotes } : issue
            ));
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    const displayDegree = user?.role === 'admin' ? filters.degree : (user?.degree || 'All');

    return (
        <div className="issue-page animate-fade-in">
            <div className="issue-container">
                <div className="issue-header-card-centered">
                    <div className="header-icon-centered"><BookOpen size={30} /></div>
                    <div className="header-text-centered">
                        <h1>Academic Issues</h1>
                        <p>Browse and solve academic problems shared by <strong>{displayDegree !== 'All' ? `${displayDegree}` : 'your'}</strong> students</p>
                    </div>
                    <div className="int-header-stats-bottom">
                        <span className="int-stat-pill blue"><MessageSquare size={13} /> {stats.total} Total</span>
                        <span className="int-stat-pill red"><Clock size={13} /> {stats.open} Needs Help</span>
                        <span className="int-stat-pill green"><CheckCircle2 size={13} /> {stats.resolved} Resolved</span>
                    </div>
                </div>

                <div className="int-tabs-modern">
                    {[
                        { key: 'all', label: 'All Discussions', icon: <MessageSquare size={14} /> },
                        { key: 'matched', label: 'Questions for Me', icon: <Sparkles size={14} /> },
                        { key: 'trending', label: 'Trending Now', icon: <Flame size={14} /> },
                        { key: 'resolved', label: 'Fixed & Resolved', icon: <CheckCircle2 size={14} /> },
                    ].map(tab => (
                        <button key={tab.key} className={`int-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="filter-section-premium">
                    <div className="search-bar-modern">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by topic, question or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-modern"
                        />
                        <Link to="/issues/new" className="btn-create-floating"><Plus size={18} /> Post Issue</Link>
                    </div>

                    <div className="filter-grid-modern">
                        <div className="filter-group-modern">
                            <label><GraduationCap size={18} /> Degree</label>
                            <select
                                value={filters.degree}
                                onChange={(e) => handleDegreeChange(e.target.value)}
                                disabled={user?.role?.toLowerCase() !== 'admin'}
                                className={`filter-select-modern ${user?.role?.toLowerCase() !== 'admin' ? 'disabled-fixed' : ''}`}
                            >
                                {user?.role === 'admin' ? (
                                    <>
                                        <option value="All">All Degrees</option>
                                        {degrees.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </>
                                ) : (
                                    <option value={user?.degree || 'All'}>{user?.degree || 'All Degrees'}</option>
                                )}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><BookOpen size={18} /> Subject</label>
                            <select
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                className="filter-select-modern"
                            >
                                {currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Filter size={18} /> Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="filter-select-modern"
                            >
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="filter-actions-modern">
                            <button
                                className="reset-filter-btn"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({ degree: user?.role === 'admin' ? 'All' : (user?.degree || 'All'), subject: 'All', status: 'All', sortBy: 'newest' });
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state"><div className="spinner" /><p>Scanning academic discussions...</p></div>
                ) : (
                    <div className="issue-grid">
                        {sortedIssues.length > 0 ? (
                            sortedIssues.map((issue) => (
                                <div key={issue._id} className="issue-card-modern" onClick={() => navigate(`/issues/${issue._id}`)}>
                                    <div className="card-top">
                                        <div className="student-avatar-box">{issue.student?.name?.charAt(0) || <User size={16} />}</div>
                                        <div className="issue-top-right">
                                            <span className={`status-badge-modern ${issue.status.toLowerCase()}`}>
                                                {issue.status === 'Resolved' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                                {issue.status}
                                            </span>
                                            {(issue.responses?.length > 5 || (issue.upvotes?.length || 0) > 10) && (
                                                <span className="trending-pill"><Flame size={11} /> Trending</span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="issue-title">{issue.title}</h3>
                                    <div className="issue-meta-row">
                                        <span className="meta-tag subject-tag">{issue.subject}</span>
                                        <span className="meta-tag degree-tag">{issue.degree}</span>
                                        {issue.status !== 'Resolved' && (
                                            <span className={`meta-tag time-tag ${issue.requiredWithin?.includes('Urgent') ? 'urgent' : ''}`}>
                                                <Timer size={11} /> {issue.requiredWithin}
                                            </span>
                                        )}
                                    </div>
                                    <p className="issue-description-text">{issue.description}</p>
                                    <div className="card-stats issue-stats-row">
                                        <div className="stat">
                                            <User size={13} />
                                            <span className="author-stat">
                                                {issue.student?.name || (typeof issue.student === 'string' ? issue.student : 'Academic Student')}
                                            </span>
                                        </div>
                                        <div className="stat"><Eye size={13} /> {issue.views || 0}</div>
                                        <div className="stat"><MessageSquare size={13} /> {issue.responses?.length || 0}</div>
                                        {issue.attachments && issue.attachments.length > 0 && (
                                            <div className="stat" style={{color: '#34d399'}}>
                                                <Paperclip size={13} /> {issue.attachments.length}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-actions">
                                        {user?._id !== issue.student?._id && (
                                            <button
                                                className={`btn-action upvote-btn ${issue.upvotes?.includes(user?._id) ? 'reacted' : ''}`}
                                                onClick={(e) => handleUpvote(e, issue._id)}
                                            >
                                                <ThumbsUp size={16} />
                                                {issue.upvotes?.includes(user?._id) ? 'Me Too!' : 'Me Too'}
                                            </button>
                                        )}
                                        <button className="btn-action view" onClick={() => navigate(`/issues/${issue._id}`)}>Solve <ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <Search size={48} />
                                <h3>No issues found</h3>
                                <p>Try adjusting your filters.</p>
                                <button className="reset-filter-btn" style={{ marginTop: '1rem' }} onClick={() => {
                                    setFilters({ degree: user?.role === 'admin' ? 'All' : (user?.degree || 'All'), subject: 'All', status: 'All', sortBy: 'newest' });
                                }}>Clear filters</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssueList;
