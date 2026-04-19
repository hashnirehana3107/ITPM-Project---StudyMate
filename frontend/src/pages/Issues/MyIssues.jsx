import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Eye, Edit, Trash2, Plus, MessageSquare, Calendar,
    Loader2, LayoutDashboard, X, Save, Tag, FileText,
    BookOpen, Clock, CheckCircle2, AlertCircle, Paperclip,
    ThumbsUp
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './MyIssues.css';

const MyIssues = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Open');
    const [editIssue, setEditIssue] = useState(null);  // Issue currently being edited
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSubject, setEditSubject] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [editAttachments, setEditAttachments] = useState([]);
    const [editNewFiles, setEditNewFiles] = useState([]);
    const editFileRef = useRef(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const commonSubjects = ['University Life', 'Research Support', 'Career Advice'];
    const [availableSubjects, setAvailableSubjects] = useState(commonSubjects);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                const userDegreeKey = user?.degree === 'Business Management' ? 'BM' : user?.degree;
                const matched = data.find(d => d.code === userDegreeKey || d.name === user?.degree);
                const degreeSubjects = matched ? matched.subjects.map(s => s.name) :
                    [...new Set(data.flatMap(d => d.subjects.map(s => s.name)))];
                setAvailableSubjects([...degreeSubjects, ...commonSubjects]);
            } catch (e) { console.warn('Failed to fetch subjects'); }
        };
        fetchSubjects();
    }, [user]);

    const fetchMyIssues = async () => {
        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.get('/api/issues', config);
            
            // Filter to get only user's issues
            const myIssues = data.filter(issue => 
                issue.student && (issue.student._id?.toString() === user?._id?.toString() || issue.student?._id === user?.id)
            );

            // Map UI fallbacks since backend misses some fields and extract META
            setIssues(myIssues.map(issue => {
                let desc = issue.description || '';
                let degree = 'IT';
                let requiredWithin = 'Within 24h';
                
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
                    requiredWithin: requiredWithin
                };
            }));
        } catch (error) {
            console.error('Error fetching my issues:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        
        // Redirect Admin to moderation
        if (user?.role === 'admin') {
            navigate('/admin/moderation');
            return;
        }

        fetchMyIssues();
    }, [user, navigate]);

    const handleDelete = (id) => {
        setDeleteConfirmId(id); // Open custom confirm modal
    };

    const confirmDelete = async () => {
        const id = deleteConfirmId;
        
        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            await axios.delete(`/api/issues/${id}`, config);

            // Remove linked announcement so it vanishes from ALL dashboards (Local mock logic kept)
            const allAnns = JSON.parse(localStorage.getItem('studyMate_announcements_v3') || '[]');
            localStorage.setItem('studyMate_announcements_v3', JSON.stringify(allAnns.filter(a => a.issueId?.toString() !== id?.toString())));

            // Cleanup dismissed tracking
            const dismissed = JSON.parse(localStorage.getItem('studyMate_dismissed_alerts') || '[]');
            localStorage.setItem('studyMate_dismissed_alerts', JSON.stringify(dismissed.filter(d => d?.toString() !== id?.toString())));

            setIssues(prev => prev.filter(i => i._id !== id));
        } catch (error) {
            console.error('Error deleting issue:', error);
            alert('Could not delete issue. It might have been deleted already or you are not authorized.');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleOpenEdit = (issue) => {
        setEditIssue(issue);
        setEditTitle(issue.title);
        
        // Clean description for editing (hide internal meta blocks)
        const pureDescription = issue.description ? issue.description.split('---META---')[0].trim() : '';
        setEditDescription(pureDescription);
        
        setEditSubject(issue.subject || '');
        setEditDeadline(issue.requiredWithin || 'Within 24h');
        setEditAttachments(issue.attachments || []);
        setEditNewFiles([]);
        setSaveSuccess(false);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !editSubject.trim()) return;

        try {
            const meta = { degree: editIssue.degree || 'IT', requiredWithin: editDeadline };
            const finalDescription = `${editDescription}\n\n---META---\n${JSON.stringify(meta)}`;

            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('description', finalDescription);
            formData.append('subject', editSubject);
            formData.append('keepAttachments', JSON.stringify(editAttachments));
            editNewFiles.forEach(f => formData.append('newAttachments', f));

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: updatedIssue } = await axios.put(`/api/issues/${editIssue._id}`, formData, config);

            setIssues(prev => prev.map(i =>
                i._id === editIssue._id
                    ? {
                        ...i,
                        title: editTitle,
                        description: editDescription,
                        subject: editSubject,
                        requiredWithin: editDeadline,
                        attachments: updatedIssue.attachments || editAttachments
                      }
                    : i
            ));

            setEditNewFiles([]);
            setSaveSuccess(true);
            setTimeout(() => setEditIssue(null), 1200);
        } catch (error) {
            console.error('Error saving edit:', error);
            alert(`Failed to save changes: ${error.response?.data?.message || error.message}`);
        }
    };

    const filteredIssues = issues.filter(issue => issue.status === activeTab);

    return (
        <div className="my-issues-page animate-fade-in">
            <div className="my-container">

                {/* 👤 Header */}
                <header className="my-user-card">
                    <div className="user-profile-info">
                        <div className="large-avatar">{user?.name?.charAt(0) || 'U'}</div>
                        <div className="user-text">
                            <h1>My Academic Feed</h1>
                            <p>Manage and track your questions — only <strong>{user?.degree}</strong> issues are shown here.</p>
                        </div>
                    </div>
                    <Link to="/issues/new" className="btn-post-new">
                        <Plus size={20} /> Post New Issue
                    </Link>
                </header>

                {/* 📑 Tabs */}
                <div className="tabs-control-row">
                    {['Open', 'Resolved'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'Open' ? 'Active Issues' : 'Resolved'}
                            &nbsp;({issues.filter(i => i.status === tab).length})
                        </button>
                    ))}
                </div>

                {/* 📋 List */}
                <div className="my-issues-list">
                    {loading ? (
                        <div className="my-loading-box">
                            <Loader2 className="animate-spin" size={40} />
                            <p>Loading your dashboard...</p>
                        </div>
                    ) : filteredIssues.length > 0 ? (
                        filteredIssues.map(issue => (
                            <div key={issue._id} className="my-issue-item">
                                <div className="item-left">
                                    <div className="date-row">
                                        <Calendar size={13} />
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                        <span className="mx-2">•</span>
                                        <span className="subject-tag">{issue.subject}</span>
                                        {issue.requiredWithin && (
                                            <span className={`deadline-chip ${issue.requiredWithin === 'Urgent (< 2h)' ? 'urgent' : ''}`}>
                                                <Clock size={11} /> {issue.requiredWithin}
                                            </span>
                                        )}
                                    </div>
                                    <h3>{issue.title}</h3>
                                    {issue.description && (
                                        <p className="issue-preview">{issue.description.slice(0, 100)}{issue.description.length > 100 ? '…' : ''}</p>
                                    )}
                                    <div className="response-row">
                                        <div className="ri-stat-pill" title="Comments Received"><MessageSquare size={12} /> {issue.responses?.length || 0} Responses</div>
                                        <div className="ri-stat-pill" title="Total Views"><Eye size={12} /> {issue.views || 0} Views</div>
                                    </div>
                                </div>

                                <div className="item-right">
                                    <button
                                        className="action-btn view"
                                        onClick={() => navigate(`/issues/${issue._id}`)}
                                        title="View Issue"
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                    {(issue.student?._id === user?._id || issue.student === user?._id || issue.student?._id === user?.id) && (
                                        <>
                                            {issue.status === 'Open' && (
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleOpenEdit(issue)}
                                                    title="Edit Issue"
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                            )}
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(issue._id)}
                                                title="Delete Issue"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <LayoutDashboard size={56} />
                            <h3>No {activeTab} Issues Found</h3>
                            <p>{activeTab === 'Open' ? "You don't have any active questions right now." : "You haven't resolved any issues yet."}</p>
                            {activeTab === 'Open' && (
                                <Link to="/issues/new" className="btn-post-new" style={{ margin: '0 auto', width: 'fit-content' }}>
                                    <Plus size={20} /> Post Your First Issue
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ✏️ Edit Modal */}
            {editIssue && (
                <div className="edit-modal-overlay" onClick={(e) => { if (e.target.classList.contains('edit-modal-overlay')) setEditIssue(null); }}>
                    <div className="edit-modal-box animate-scale-in">
                        <div className="edit-modal-header">
                            <div className="edit-header-left"><Edit size={20} className="text-blue-400" /> <h3>Edit Issue</h3></div>
                            <button className="btn-close-edit" onClick={() => setEditIssue(null)}><X size={20} /></button>
                        </div>

                        <div className="edit-modal-body">
                            {saveSuccess && (
                                <div className="save-success-banner">
                                    <CheckCircle2 size={18} /> Changes saved successfully!
                                </div>
                            )}

                            <div className="edit-field-group">
                                <label className="edit-label"><Tag size={14} /> Subject / Module</label>
                                <select className="edit-select" value={editSubject} onChange={e => setEditSubject(e.target.value)}>
                                    <option value="">Select subject...</option>
                                    {availableSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="edit-field-group">
                                <label className="edit-label"><Clock size={14} /> Solution Required Within</label>
                                <select className="edit-select" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}>
                                    <option value="Urgent (< 2h)">Urgent (Less than 2h)</option>
                                    <option value="Within 24h">Within 24 hours</option>
                                    <option value="Within 2-3 days">Within 2-3 days</option>
                                    <option value="No Rush">No specific rush</option>
                                </select>
                            </div>

                            <div className="edit-field-group full-width">
                                <label className="edit-label"><FileText size={14} /> Issue Title</label>
                                <input
                                    className="edit-input"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    placeholder="Issue title..."
                                />
                            </div>

                            <div className="edit-field-group full-width">
                                <label className="edit-label"><BookOpen size={14} /> Detailed Description</label>
                                <textarea
                                    className="edit-textarea"
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    rows={4}
                                />
                            </div>

                            <div className="edit-field-group full-width">
                                <label className="edit-label">
                                    <Paperclip size={14} /> Attachments
                                </label>
                                <div className="edit-attachments-list">
                                    {editAttachments && editAttachments.length > 0 ? (
                                        editAttachments.map((att, idx) => {
                                            // Handle both string paths and objects
                                            const isPath = typeof att === 'string';
                                            const name = isPath ? att.split('/').pop() : att.name;
                                            const isImage = isPath ? (att.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) : att.type?.startsWith('image');
                                            const displayUrl = isPath ? `http://localhost:5000/${att.replace(/\\/g, '/')}` : att.data;

                                            return (
                                                <div key={idx} className="edit-attachment-pill">
                                                    <div className="att-preview-icon">
                                                        {isImage ? (
                                                            <img src={displayUrl} alt="prev" style={{width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover'}} />
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </div>
                                                    <span className="att-name-text" title={name}>{name}</span>
                                                    <button 
                                                        type="button"
                                                        className="remove-att-btn" 
                                                        onClick={() => setEditAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="no-attachments-text">No files attached to this issue.</p>
                                    )}
                                </div>

                                {/* New Files Preview */}
                                {editNewFiles.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                        {editNewFiles.map((f, idx) => (
                                            <div key={idx} className="edit-attachment-pill">
                                                <FileText size={14} />
                                                <span className="att-name-text" title={f.name}>{f.name}</span>
                                                <button
                                                    type="button"
                                                    className="remove-att-btn"
                                                    onClick={() => setEditNewFiles(prev => prev.filter((_, i) => i !== idx))}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={editFileRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        const total = editAttachments.length + editNewFiles.length + files.length;
                                        if (total > 5) { alert('Maximum 5 attachments total.'); return; }
                                        setEditNewFiles(prev => [...prev, ...files]);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    type="button"
                                    style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#818cf8', cursor: 'pointer', fontSize: '13px' }}
                                    onClick={() => editFileRef.current?.click()}
                                >
                                    <Plus size={14} /> Add Files
                                </button>
                            </div>
                        </div>

                        <div className="edit-modal-footer">
                            <button className="btn-cancel-edit" onClick={() => setEditIssue(null)}>
                                <X size={16} /> Cancel
                            </button>
                            <button className="btn-save-edit" onClick={handleSaveEdit}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🗑️ Delete Confirm Modal */}
            {deleteConfirmId && (() => {
                const issueToDelete = issues.find(i => i._id === deleteConfirmId);
                return (
                    <div className="delete-modal-overlay" onClick={(e) => { if (e.target.classList.contains('delete-modal-overlay')) setDeleteConfirmId(null); }}>
                        <div className="delete-modal-box animate-scale-in">
                            <div className="delete-modal-icon">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="delete-modal-title">Delete Issue?</h3>
                            <p className="delete-modal-desc">
                                You are about to permanently delete:
                            </p>
                            <div className="delete-issue-preview">
                                "{issueToDelete?.title}"
                            </div>
                            <p className="delete-modal-warn">
                                This will also remove it from <strong>all students' dashboards</strong>. This action cannot be undone.
                            </p>
                            <div className="delete-modal-actions">
                                <button className="btn-cancel-delete" onClick={() => setDeleteConfirmId(null)}>
                                    Cancel
                                </button>
                                <button className="btn-confirm-delete" onClick={confirmDelete}>
                                    <Trash2 size={16} /> Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default MyIssues;
