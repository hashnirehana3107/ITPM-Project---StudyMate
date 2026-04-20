import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    Save,
    BookOpen,
    FileText,
    Tag,
    AlertCircle,
    Loader2,
    Edit3,
    Paperclip,
    X,
    Clock,
    CheckCircle2,
    Plus
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './EditIssue.css';

const EditIssue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [deadline, setDeadline] = useState('Within 24h');
    const [existingAttachments, setExistingAttachments] = useState([]); // paths to keep
    const [newFiles, setNewFiles] = useState([]);                        // new File objects
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [availableSubjects, setAvailableSubjects] = useState([
        'University Life', 'Research Support', 'Career Advice'
    ]);

    // Fetch real subjects from degrees API
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                const userDegreeKey = user?.degree === 'Business Management' ? 'BM' : user?.degree;
                const matched = data.find(d => d.code === userDegreeKey || d.name === user?.degree);
                const degreeSubjects = matched
                    ? matched.subjects.map(s => s.name)
                    : [...new Set(data.flatMap(d => d.subjects.map(s => s.name)))];
                setAvailableSubjects([...degreeSubjects, 'University Life', 'Research Support', 'Career Advice']);
            } catch (e) {
                console.warn('Failed to fetch subjects, using defaults');
            }
        };
        fetchSubjects();
    }, [user]);

    // Fetch the real issue from backend
    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        const fetchIssue = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/issues/${id}`, config);

                // Check ownership
                const ownerId = data.student?._id || data.student;
                if (ownerId?.toString() !== (user._id || user.id)?.toString()) {
                    navigate('/my-issues');
                    return;
                }

                // Parse ---META--- from description if present
                let desc = data.description || '';
                let deg = user?.degree || 'IT';
                let reqWithin = 'Within 24h';

                if (desc.includes('---META---')) {
                    const parts = desc.split('---META---');
                    desc = parts[0].trim();
                    try {
                        const meta = JSON.parse(parts[1].trim());
                        deg = meta.degree || deg;
                        reqWithin = meta.requiredWithin || reqWithin;
                    } catch (e) {}
                }

                setTitle(data.title || '');
                setDescription(desc);
                setSubject(data.subject || '');
                setDeadline(reqWithin);
                setExistingAttachments(data.attachments || []);
            } catch (err) {
                console.error('Failed to fetch issue:', err);
                setError('Could not load issue. Make sure you are the owner.');
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [id, user, navigate]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const total = existingAttachments.length + newFiles.length + files.length;
        if (total > 5) {
            alert('Maximum 5 attachments allowed per issue.');
            return;
        }
        setNewFiles(prev => [...prev, ...files]);
        e.target.value = '';
    };

    const removeExisting = (idx) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNew = (idx) => {
        setNewFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (title.trim().length < 5) {
            setError('Title must be at least 5 characters long.');
            return;
        }
        if (!subject) {
            setError('Please select a subject.');
            return;
        }

        setUpdating(true);
        try {
            const meta = { degree: user?.degree || 'IT', requiredWithin: deadline };
            const finalDescription = `${description}\n\n---META---\n${JSON.stringify(meta)}`;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', finalDescription);
            formData.append('subject', subject);
            formData.append('keepAttachments', JSON.stringify(existingAttachments));
            newFiles.forEach(f => formData.append('newAttachments', f));

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/issues/${id}`, formData, config);

            setSuccess(true);
            setTimeout(() => navigate(`/issues/${id}`), 1200);
        } catch (err) {
            console.error('Update failed:', err);
            setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="post-issue-page">
                <div className="issue-container">
                    <div className="loading-state flex flex-col items-center py-20">
                        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                        <p className="text-slate-400">Loading issue content...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="post-issue-page">
            <div className="issue-container">
                <button onClick={() => navigate(-1)} className="btn-back-issue">
                    <ArrowLeft size={20} />
                    Cancel
                </button>

                <div className="issue-card-premium animate-fade-in">
                    <div className="issue-header edit-header" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <div className="icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                            <Edit3 size={30} className="glow-icon" />
                        </div>
                        <div className="header-text">
                            <h1>Edit Academic Issue</h1>
                            <p className="subtitle">Update your problem details to get better help</p>
                        </div>
                    </div>

                    {error && (
                        <div className="error-banner mb-4">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="error-banner mb-4" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}>
                            <CheckCircle2 size={20} />
                            <span>Changes saved! Redirecting...</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="issue-form">

                        {/* Subject */}
                        <div className="form-group-premium">
                            <label><Tag size={18} /> Subject / Module</label>
                            <div className="select-wrapper">
                                <select
                                    className="premium-select"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                >
                                    <option value="">Select a subject...</option>
                                    {availableSubjects.map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="form-group-premium">
                            <label><Clock size={18} /> Solution Required Within</label>
                            <div className="select-wrapper">
                                <select
                                    className="premium-select"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                >
                                    <option value="Urgent (< 2h)">Urgent (Less than 2h)</option>
                                    <option value="Within 24h">Within 24 hours</option>
                                    <option value="Within 2-3 days">Within 2-3 days</option>
                                    <option value="No Rush">No specific rush</option>
                                </select>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="form-group-premium">
                            <label><FileText size={18} /> Issue Title</label>
                            <input
                                type="text"
                                className="premium-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Describe your problem clearly..."
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group-premium">
                            <label><BookOpen size={18} /> Detailed Description</label>
                            <textarea
                                className="premium-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain your issue in detail..."
                                required
                            />
                        </div>

                        {/* Attachments */}
                        <div className="form-group-premium">
                            <label><Paperclip size={18} /> Attachments</label>

                            {/* Existing files */}
                            {existingAttachments.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Current files:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {existingAttachments.map((att, idx) => {
                                            const name = att.split('/').pop().replace(/^issue-\d+-/, '');
                                            return (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                                                    <FileText size={13} />
                                                    <span>{name}</span>
                                                    <button type="button" onClick={() => removeExisting(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: '0' }}>
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* New files preview */}
                            {newFiles.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ fontSize: '12px', color: '#64ffda', marginBottom: '6px' }}>New files to upload:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {newFiles.map((f, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '8px', fontSize: '12px', color: '#2dd4bf' }}>
                                                <FileText size={13} />
                                                <span>{f.name}</span>
                                                <button type="button" onClick={() => removeNew(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: '0' }}>
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '10px', color: '#818cf8', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                            >
                                <Plus size={15} /> Add Files
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                                    ({existingAttachments.length + newFiles.length}/5)
                                </span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-post-issue"
                            style={{ background: '#3B82F6', color: 'white' }}
                            disabled={updating}
                        >
                            {updating ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditIssue;
