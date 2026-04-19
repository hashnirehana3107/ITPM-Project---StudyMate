import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, BookOpen, FileText, Tag, AlertCircle,
    CheckCircle2, Loader2, Upload, Image as ImageIcon, X, Paperclip, Clock
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './PostIssue.css';

const PostIssue = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const MAX_TITLE_CHARS = 100;

    const commonSubjects = ['University Life', 'Research Support', 'Career Advice'];
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [targetDegreeDisplay, setTargetDegreeDisplay] = useState('Loading...');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                
                if (!data || data.length === 0) {
                    setAvailableSubjects(['General Support', 'Administration', 'IT Helpdesk']);
                    setTargetDegreeDisplay('General (No degrees configured in system)');
                    return;
                }

                const userDeg = (user?.degree || '').trim().toLowerCase();
                
                // Extremely flexible matching logic to support any data shape
                const matched = data.find(d => {
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

                if (matched) {
                    if (matched.subjects && matched.subjects.length > 0) {
                        setAvailableSubjects(matched.subjects.map(s => s.name));
                        setTargetDegreeDisplay(`${matched.name} ${matched.code ? `(${matched.code})` : ''}`);
                    } else {
                        // The degree exists but the admin hasn't added subjects to it yet
                        setAvailableSubjects(['General Help', 'Subject Not Listed']);
                        setTargetDegreeDisplay(`${matched.name} (No Subjects configured yet)`);
                    }
                } else {
                    // Total fallback if mapping is corrupted or admin deleted the degree after student registered
                    setAvailableSubjects(['General Options', 'Other']);
                    setTargetDegreeDisplay(user?.degree ? `${user.degree}` : 'General / Unspecified Degree');
                }
            } catch (e) {
                console.warn('Failed to fetch subjects completely', e);
                setAvailableSubjects(['Network Error', 'Please contact admin']);
                setTargetDegreeDisplay('Offline / Error');
            }
        };
        if (user) {
            fetchSubjects();
        }
    }, [user]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const [deadline, setDeadline] = useState('Within 24h');

    const handleTitleChange = (e) => {
        const val = e.target.value;
        if (val.length <= MAX_TITLE_CHARS) {
            setTitle(val);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            
            // Limit 1: Total count check
            if (attachments.length + files.length > 5) {
                setError("You can only attach a maximum of 5 files.");
                return;
            }

            // Limit 2: Individual file size check (1MB to fit in localStorage)
            for (let f of files) {
                if (f.size > 1 * 1024 * 1024) {
                    setError(`File "${f.name}" is too large. Clearer images should be under 1MB.`);
                    return;
                }
            }


            const newFiles = files.map(file => ({
                file,
                preview: file.type.startsWith('image') ? URL.createObjectURL(file) : null,
                name: file.name
            }));
            setAttachments(prev => [...prev, ...newFiles]);
            setError(""); // clear previous errors if everything is fine
        }
    };


    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!subject) {
            setError("Please select a relevant subject.");
            setLoading(false);
            return;
        }

        if (title.length < 5) {
            setError("Title must be at least 5 characters long.");
            setLoading(false);
            return;
        }

        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            
            const meta = { degree: user?.degree || 'IT', requiredWithin: deadline };
            const finalDescription = `${description}\n\n---META---\n${JSON.stringify(meta)}`;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', finalDescription);
            formData.append('subject', subject);

            attachments.forEach(att => {
                formData.append('attachments', att.file);
            });

            await axios.post('/api/issues', formData, config);

            // --- 📢 BROADCAST NOTIFICATION TO PEERS (Keep Mock for Announcements) ---
            const newAnn = {
                id: Date.now(),
                issueId: Date.now().toString(),
                title: `🆘 New Inquiry: ${subject}`,
                message: `${user?.name} just posted a new issue: "${title}". Respond by ${deadline}!`,
                targetDegree: user?.degree || 'IT',
                targetYear: '',
                priority: deadline === 'Urgent (< 2h)' ? 'High' : 'Normal',
                date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            };

            const existingAnn = JSON.parse(localStorage.getItem('studyMate_announcements_v3') || '[]');
            localStorage.setItem('studyMate_announcements_v3', JSON.stringify([newAnn, ...existingAnn]));

            setSuccess(true);
            setTimeout(() => {
                navigate('/issues/my');
            }, 4000);
        } catch (error) {
            console.error('Error posting issue:', error);
            setError(error.response?.data?.message || 'Failed to post issue. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="post-issue-page premium-theme">
                <div className="issue-form-container">
                    <div className="issue-form-card animate-fade-in success-card-view">
                        <div className="success-icon-ring">
                            <CheckCircle2 size={60} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Academic Issue Posted!</h2>
                        <p className="text-slate-400 mb-8">Your question has been shared with {user?.degree || 'your'} peers. Expect answers soon!</p>
                        <button onClick={() => navigate('/issues/my')} className="btn-submit-premium" style={{ margin: '0 auto', width: 'auto' }}>
                            View My Issues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="post-issue-page premium-theme">
            <div className="issue-form-container">

                {/* 🔙 Back Navigation */}
                <div className="breadcrumb-row">
                    <button onClick={() => navigate(-1)} className="btn-back-link">
                        <ArrowLeft size={18} />
                        Cancel & Back
                    </button>
                </div>

                <div className="issue-form-card animate-fade-in">

                    {/* 🖼️ Header Section */}
                    <div className="form-header-box">
                        <div className="form-icon-bg">
                            <BookOpen size={32} />
                        </div>
                        <div className="header-content">
                            <h1>Post an Academic Issue</h1>
                            <p>Ask your academic question and get peer-reviewed solutions</p>
                            <span className="degree-badge">
                                Targeting: {targetDegreeDisplay} {user?.year ? `- Year ${user.year}` : ''}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="error-banner mb-6 animate-shake">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-layout">

                            {/* 1️⃣ Subject & Time Period Row */}
                            <div className="form-row-flexible">
                                <div className="input-group-premium flex-1">
                                    <label className="input-label-row">
                                        <Tag size={16} /> Subject / Module
                                    </label>
                                    <div className="select-wrapper-custom">
                                        <select
                                            className="premium-form-select"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select a subject...</option>
                                            {availableSubjects.map((sub, idx) => (
                                                <option key={idx} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group-premium flex-1">
                                    <label className="input-label-row">
                                        <Clock size={16} /> Solution Required Within
                                    </label>
                                    <div className="select-wrapper-custom">
                                        <select
                                            className="premium-form-select"
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
                            </div>

                            {/* 2️⃣ Issue Title */}
                            <div className="input-group-premium">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="input-label-row">
                                        <FileText size={16} /> Issue Title
                                    </label>
                                    <span className={`char-count ${title.length >= MAX_TITLE_CHARS ? 'text-red-400' : 'text-slate-500'}`}>
                                        {title.length}/{MAX_TITLE_CHARS}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="premium-form-input"
                                    placeholder="Enter a brief title for your issue..."
                                    value={title}
                                    onChange={handleTitleChange}
                                    required
                                />
                            </div>

                            {/* 3️⃣ Issue Description */}
                            <div className="input-group-premium">
                                <label className="input-label-row">
                                    <BookOpen size={16} /> Detailed Description
                                </label>
                                <textarea
                                    className="premium-form-area"
                                    placeholder="Explain your academic problem clearly. Include any relevant code snippets, formulas, or context..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* 4️⃣ Attachments (Optional) */}
                            <div className="input-group-premium">
                                <label className="input-label-row">
                                    <Paperclip size={16} /> Attachments (Optional)
                                </label>

                                <div
                                    className="attachment-upload-area"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Upload size={24} className="mb-2 text-slate-400" />
                                    <p>Click to upload images or documents</p>
                                    <span className="text-xs text-slate-500">Supports JPG, PNG (Max 1MB per file)</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                />


                                {attachments.length > 0 && (
                                    <div className="attachments-preview-list">
                                        {attachments.map((att, index) => (
                                            <div key={index} className="attachment-item fade-in">
                                                <div className="file-icon">
                                                    {att.preview ? (
                                                        <img src={att.preview} alt="preview" />
                                                    ) : (
                                                        <FileText size={18} />
                                                    )}
                                                </div>
                                                <span className="file-name truncate">{att.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="remove-btn"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* 5️⃣ Submit Button */}
                        <div className="form-footer-actions">
                            <button
                                type="submit"
                                className="btn-submit-premium"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Post Issue
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostIssue;
