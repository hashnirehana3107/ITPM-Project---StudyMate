// @author: Majeed H.R (IT23197732)
// @subsystem: Academic Issue Resolution System
// @description: Handles administrative moderation tasks for academic content.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getEnrichedMockIssues } from '../../utils/issueMocks';
import {
    AlertTriangle, ShieldAlert, CheckCircle, X, Search,
    Filter, Eye, Trash2, MessageSquare,
    ArrowLeft, Flag, Award, ThumbsUp, BarChart3, MoreVertical, Activity,
    Lightbulb, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Moderation.css';

const Moderation = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'reported'
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterDegree, setFilterDegree] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedIssueDetail, setSelectedIssueDetail] = useState(null);

    // Synchronized Degrees & Subjects from Backend
    const [degrees, setDegrees] = useState([]);
    const [subjectMapping, setSubjectMapping] = useState({});

    useEffect(() => {
        fetchIssues();
        fetchDegrees();

        const handleStorageChange = (e) => {
            if (e.key === 'studyMate_global_issues_v7') {
                const updatedGlobal = JSON.parse(e.newValue || '[]');
                setIssues(updatedGlobal);
                if (selectedIssueDetail) {
                    setSelectedIssueDetail(updatedGlobal.find(i => i._id === selectedIssueDetail._id) || null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [selectedIssueDetail]);

    const fetchDegrees = async () => {
        try {
            const { data } = await axios.get('/api/degrees');
            if (data) {
                const degList = [];
                const subMap = {};
                data.forEach(d => {
                    const dName = d.title || d.name;
                    degList.push(dName);
                    subMap[dName] = Array.isArray(d.subjects) ? d.subjects : [];
                });
                setDegrees(degList);
                setSubjectMapping(subMap);
            }
        } catch (err) {
            console.error("Failed to load degrees for moderation", err);
        }
    };

    const fetchIssues = async () => {
        setLoading(true);
        try {
            // Assume admin is logged in and token is in localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = userInfo.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
            const { data } = await axios.get('/api/issues', config);
            
            const globalIssues = data.map(issue => {
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
                return { ...issue, description: desc, degree, requiredWithin };
            });
            setIssues(globalIssues);
        } catch (err) {
            console.error('Error fetching issues:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIssue = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = userInfo.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
            await axios.delete(`/api/issues/${selectedItem._id}/admin`, config);

            const updatedIssues = issues.filter(i => i._id !== selectedItem._id);
            setIssues(updatedIssues);
            setShowDeleteModal(false);
            setSelectedItem(null);
            showNotification('Academic issue removed by Admin');
        } catch (err) {
            showNotification('Failed to remove issue');
        }
    };

    const handleToggleBest = async (issueId, responseId) => {
        try {
            const globalIssues = JSON.parse(localStorage.getItem('studyMate_global_issues_v7') || '[]');
            const updated = globalIssues.map(i => {
                if (i._id === issueId) {
                    const updatedResponses = i.responses.map(r => ({
                        ...r,
                        isBest: r._id === responseId
                    }));
                    return { ...i, responses: updatedResponses };
                }
                return i;
            });

            localStorage.setItem('studyMate_global_issues_v7', JSON.stringify(updated));
            setIssues(updated);
            showNotification('Best solution status updated');
        } catch (err) {
            showNotification('Failed to update status');
        }
    };

    const handleRemoveResponse = async (issueId, responseId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const config = userInfo.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
            await axios.delete(`/api/issues/${issueId}/responses/${responseId}/admin`, config);
            
            setIssues(prev => prev.map(issue => {
                if(issue._id === issueId) {
                    return { ...issue, responses: issue.responses.filter(r => r._id !== responseId) };
                }
                return issue;
            }));
            
            if (selectedIssueDetail && selectedIssueDetail._id === issueId) {
                setSelectedIssueDetail(prev => ({ ...prev, responses: prev.responses.filter(r => r._id !== responseId) }));
            }
            showNotification('Response removed successfully');
        } catch (err) {
            showNotification('Failed to remove response');
        }
    };

    const showNotification = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredIssues = issues.filter(i => {
        const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
            i.subject.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = filterSubject === 'all' || i.subject === filterSubject;
        const matchesDegree = filterDegree === 'all' || i.degree === filterDegree;
        const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
        return matchesSearch && matchesSubject && matchesDegree && matchesStatus;
    });

    const resetFilters = () => {
        setSearch('');
        setFilterSubject('all');
        setFilterDegree('all');
        setFilterStatus('all');
    };

    const reportedIssues = issues.filter(i => i.isReported);

    return (
        <div className="manage-materials-page">
            <div className="mm-container">
                {/* Header */}
                <div className="mm-header">
                    <div className="mm-header-left">
                        <div className="mm-header-icon">
                            <ShieldAlert size={24} />
                        </div>
                        <div className="mm-title">
                            <h1>Academic Issues Management</h1>
                            <p>Monitor, moderate, and resolve student academic concerns.</p>
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {successMessage && (
                    <div className="mm-toast">
                        <CheckCircle size={18} /> {successMessage}
                    </div>
                )}

                {/* Custom Tabs System */}
                <div className="mod-tabs-mi">
                    <button
                        className={`mod-tab-btn-mi ${activeTab === 'issues' ? 'active' : ''}`}
                        onClick={() => setActiveTab('issues')}
                    >
                        <MessageSquare size={18} /> All Issues
                    </button>
                    <button
                        className={`mod-tab-btn-mi ${activeTab === 'reported' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reported')}
                    >
                        <AlertTriangle size={18} /> Flagged Content
                        {reportedIssues.length > 0 && <span className="mod-badge-mi">{reportedIssues.length}</span>}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="mm-toolbar">
                    <div className="mm-search">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="mm-filters">
                        <select value={filterDegree} onChange={(e) => { setFilterDegree(e.target.value); setFilterSubject('all'); }}>
                            <option value="all">All Degrees</option>
                            {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                            <option value="all">All Subjects</option>
                            {filterDegree !== 'all' && subjectMapping[filterDegree]?.map(s => {
                                const subjectName = typeof s === 'object' ? s.name : s;
                                const subjectVal = typeof s === 'object' ? (s._id || s.name) : s;
                                return <option key={subjectVal} value={subjectName}>{subjectName}</option>;
                            })}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        {(search || filterSubject !== 'all' || filterDegree !== 'all' || filterStatus !== 'all') && (
                            <button className="btn-reset-filters" onClick={resetFilters}>
                                <X size={14} /> Reset
                            </button>
                        )}
                        <button className="btn-toolbar-action" onClick={fetchIssues}>
                            <Activity size={18} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mm-table-card">
                    {loading ? (
                        <div className="loading-state-mi">
                            <div className="spinner-mi"></div>
                            <span>Fetching data...</span>
                        </div>
                    ) : (
                        <div className="mm-table-wrapper">
                            <table className="mm-table">
                                <thead>
                                    <tr>
                                        <th>Academic Issue</th>
                                        <th>Target Context</th>
                                        <th>Engagement</th>
                                        <th>Status</th>
                                        <th>Best Solution</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'issues' ? filteredIssues : reportedIssues).map(issue => (
                                        <tr key={issue._id}>
                                            <td>
                                                <div className="material-cell">
                                                    <div className="material-info">
                                                        <div className="name-status-row">
                                                            <span className="m-title" title={issue.title}>{issue.title}</span>
                                                        </div>
                                                        <span className="m-subject">Posted by {issue.student?.name || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="context-cell">
                                                    <span className="tag-degree-purple-force">{issue.degree}</span>
                                                    <span className="tag-subject-mod">{issue.subject}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="metrics-cell">
                                                    <span className="metric"><MessageSquare size={14} /> {issue.responses?.length || 0} Comments</span>
                                                    <span className="metric"><Eye size={14} /> {issue.views || 0} Views</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge-inline ${issue.status.toLowerCase()}`}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td>
                                                {issue.status === 'Open' ? (
                                                    <span className="no-best-meta-mi">Waiting for Expert...</span>
                                                ) : (
                                                    <div className="system-best-tag-mi lecturer-badge-force">
                                                        <Award size={12} /> {issue.lecturer?.name || 'Lecturer Verified'}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="mm-actions">
                                                    <button
                                                        className="btn-action-mm"
                                                        title="Detailed View"
                                                        onClick={() => setSelectedIssueDetail(issue)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="btn-action-mm danger"
                                                        title="Delete Issue"
                                                        onClick={() => {
                                                            setSelectedItem(issue);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {(activeTab === 'issues' ? filteredIssues : reportedIssues).length === 0 && (
                                <div className="no-data-state-mi">
                                    <CheckCircle size={40} />
                                    <p>No issues found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Issue Detail Modal */}
                {selectedIssueDetail && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <div className="header-top-mi">
                                    <span className="tag-degree-mod">{selectedIssueDetail.subject}</span>
                                    <button className="btn-close-modal" onClick={() => setSelectedIssueDetail(null)}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="view-modal-body-mi">
                                <h2 className="mi-view-title">{selectedIssueDetail.title}</h2>
                                <p className="mi-view-desc">{selectedIssueDetail.description}</p>

                                <div className="view-info-grid">
                                    <div className="view-item">
                                        <span className="v-label">Degree</span>
                                        <span className="v-value" style={{ color: '#A855F7', fontWeight: 'bold' }}>{selectedIssueDetail.degree}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Subject Area</span>
                                        <span className="v-value">{selectedIssueDetail.subject}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Posted By</span>
                                        <span className="v-value">{selectedIssueDetail.student?.name}</span>
                                    </div>
                                </div>

                                {selectedIssueDetail.status === 'Resolved' && (
                                    <div className="lecturer-resolution-review glass-panel-nested" style={{ 
                                        background: 'rgba(15, 23, 42, 0.7)', 
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderLeft: '4px solid #3B82F6'
                                    }}>
                                        <div className="res-header" style={{ color: '#60A5FA', marginBottom: '15px' }}>
                                            <Award size={20} />
                                            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>Official Academic Resolution (by {selectedIssueDetail.lecturer?.name || 'Lecturer'})</h3>
                                        </div>

                                        {selectedIssueDetail.lecturerReview && (
                                            <div className="res-feedback">
                                                <strong>Evaluation / Feedback:</strong>
                                                <p>{selectedIssueDetail.lecturerReview}</p>
                                            </div>
                                        )}

                                        {selectedIssueDetail.lecturerResponse && (
                                            <div className="res-expert-answer">
                                                <strong>Lecturer's Direct Solution:</strong>
                                                <div className="expert-content">
                                                    {selectedIssueDetail.lecturerResponse}
                                                </div>
                                            </div>
                                        )}

                                        {/* Unified Best Student Solution */}
                                        {selectedIssueDetail.responses?.find(r => r.isBest) && (
                                            <div className="unified-best-student" style={{
                                                background: 'rgba(16, 185, 129, 0.05)',
                                                border: '1px dashed rgba(16, 185, 129, 0.3)',
                                                borderRadius: '12px',
                                                padding: '1.25rem',
                                                marginTop: '1rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                    <CheckCircle size={16} color="#10B981" />
                                                    <strong style={{ color: '#10B981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Lecturer Verified Peer Solution (by {selectedIssueDetail.responses.find(r => r.isBest).author?.name || 'Student'})
                                                    </strong>
                                                </div>
                                                <div className="expert-content" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                                    {selectedIssueDetail.responses.find(r => r.isBest).content}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mod-responses-section-mi">
                                    <h3>Responses & Discussions ({selectedIssueDetail.responses?.filter(r => !r.isBest).length || 0})</h3>
                                    <div className="responses-list-mi">
                                        {selectedIssueDetail.responses?.filter(r => !r.isBest).map((resp) => {
                                            const getCount = (val, fallbackVal) => {
                                                if (Array.isArray(val)) return val.length;
                                                if (typeof val === 'number') return val;
                                                if (Array.isArray(fallbackVal)) return fallbackVal.length;
                                                if (typeof fallbackVal === 'number') return fallbackVal;
                                                return 0;
                                            };
                                            
                                            return (
                                                <div key={resp._id} className="resp-card-mi">
                                                    <div className="resp-header-mi">
                                                        <div className="author-info-mi">
                                                            <div className="author-avatar-mi">{resp.author?.name?.charAt(0) || 'U'}</div>
                                                            <span>{resp.author?.name || 'Student'}</span>
                                                        </div>
                                                        <div className="resp-stats-mi" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ display: 'flex', gap: '10px', color: '#64748b', fontSize: '13px' }}>
                                                                <span title="Helpful" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <ThumbsUp size={14} /> {getCount(resp.reactions?.helpful, resp.likes)}
                                                                </span>
                                                                <span title="Insightful" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Lightbulb size={14} /> {getCount(resp.reactions?.insightful, resp.insightful)}
                                                                </span>
                                                                <span title="Appreciate" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Heart size={14} /> {getCount(resp.reactions?.appreciate, resp.appreciate)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="resp-body-mi">{resp.content}</p>

                                                    {selectedIssueDetail.status === 'Resolved' && (
                                                        <div className="resp-actions-mi">
                                                            <button
                                                                className="btn-mod-action-mi delete"
                                                                onClick={() => handleRemoveResponse(selectedIssueDetail._id, resp._id)}
                                                            >
                                                                Remove Response
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal-small">
                            <div className="warning-icon-bg"><AlertTriangle size={32} /></div>
                            <h3>Remove Issue?</h3>
                            <p>This will permanently delete the academic issue and all its responses. This action cannot be undone.</p>
                            <div className="modal-footer">
                                <button className="btn-cancel-flat" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn-danger-confirm" onClick={handleDeleteIssue}>Remove Issue</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Moderation;
