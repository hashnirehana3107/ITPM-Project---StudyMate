import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getEnrichedMockIssues } from '../../utils/issueMocks';
import {
    ArrowLeft,
    MessageSquare,
    User,
    Clock,
    Send,
    CheckCircle2,
    ThumbsUp,
    Lightbulb,
    Heart,
    Share2,
    Calendar,
    Tag,
    BookOpen,
    Loader2,
    Award,
    CornerDownRight,
    Lock,
    Activity,
    Zap,
    Facebook,
    MessageCircle,
    Link as LinkIcon,
    Copy,
    Check,
    Paperclip,
    Download,
    FileText,
    Pencil,
    Trash2,
    Save,
    X,
    ShieldCheck,
    Eye,
    Info
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './IssueDetail.css';

// Constants
const AUTO_RESOLVE_HOURS = 24;

const CountdownTimer = ({ createdAt, requiredWithin }) => {
    const calculateTimeLeft = () => {
        const created = new Date(createdAt);
        let limitHours = 24; // default

        if (requiredWithin.includes('< 2h')) limitHours = 2;
        else if (requiredWithin.includes('24h')) limitHours = 24;
        else if (requiredWithin.includes('2-3 days')) limitHours = 72;
        else if (requiredWithin.includes('No Rush')) return null;

        const deadline = new Date(created.getTime() + limitHours * 60 * 60 * 1000);
        const difference = deadline - new Date();

        if (difference <= 0) return { expired: true };

        return {
            hours: Math.floor((difference / (1000 * 60 * 60))),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!timeLeft || timeLeft.expired) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    if (!timeLeft) return null;

    return (
        <div className={`countdown-glass ${timeLeft.expired ? 'expired' : ''}`}>
            <div className="countdown-label">
                <Clock size={12} className={timeLeft.expired ? '' : 'animate-pulse'} /> 
                {timeLeft.expired ? 'Time Exceeded' : 'Resolution Window'}
            </div>
            {!timeLeft.expired ? (
                <div className="time-digits-premium">
                    <span className="digit-val">{String(timeLeft.hours).padStart(2, '0')}<small>h</small></span>
                    <span className="digit-sep">:</span>
                    <span className="digit-val">{String(timeLeft.minutes).padStart(2, '0')}<small>m</small></span>
                    <span className="digit-sep">:</span>
                    <span className="digit-val">{String(timeLeft.seconds).padStart(2, '0')}<small>s</small></span>
                </div>
            ) : (
                <div className="expired-text-mini">Awaiting urgent response...</div>
            )}
        </div>
    );
};

const ReactionButtons = ({ response, isResolved, handleReaction, userReactions, handleReply }) => {
    // Check if user has reacted to this specific type for this response
    const isActive = (type) => userReactions[response._id]?.[type];

    return (
        <div className="response-reactions">
            <button
                className={`reaction-pill-sm ${isResolved ? 'disabled' : ''} ${isActive('helpful') ? 'active' : ''}`}
                onClick={() => handleReaction(response._id, 'helpful')}
                disabled={isResolved}
                title="Helpful"
            >
                <ThumbsUp size={14} fill={isActive('helpful') ? "currentColor" : "none"} />
                <span className="count">{Array.isArray(response.reactions?.helpful) ? response.reactions.helpful.length : 0}</span>
            </button>
            <button
                className={`reaction-pill-sm ${isResolved ? 'disabled' : ''} ${isActive('insightful') ? 'active' : ''}`}
                onClick={() => handleReaction(response._id, 'insightful')}
                disabled={isResolved}
                title="Insightful"
            >
                <Lightbulb size={14} fill={isActive('insightful') ? "currentColor" : "none"} />
                <span className="count">{Array.isArray(response.reactions?.insightful) ? response.reactions.insightful.length : 0}</span>
            </button>
            <button
                className={`reaction-pill-sm ${isResolved ? 'disabled' : ''} ${isActive('appreciate') ? 'active' : ''}`}
                onClick={() => handleReaction(response._id, 'appreciate')}
                disabled={isResolved}
                title="Appreciate"
            >
                <Heart size={14} fill={isActive('appreciate') ? "currentColor" : "none"} />
                <span className="count">{Array.isArray(response.reactions?.appreciate) ? response.reactions.appreciate.length : 0}</span>
            </button>
            <button
                className={`reaction-pill-sm reply-btn ${isResolved ? 'disabled' : ''}`}
                onClick={() => handleReply(response.author?.name)}
                disabled={isResolved}
            >
                <CornerDownRight size={14} /> Reply
            </button>
        </div>
    );
};

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const responseInputRef = useRef(null);

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState('');
    const [responseAttachments, setResponseAttachments] = useState([]);
    const [postingResponse, setPostingResponse] = useState(false);
    const responseFileRef = useRef(null);

    // Copy Link State
    const [copied, setCopied] = useState(false);
    const [editingResponseId, setEditingResponseId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editAttachments, setEditAttachments] = useState([]); // existing paths to keep
    const [editNewFiles, setEditNewFiles] = useState([]);       // newly added File objects
    const editFileRef = useRef(null);

    const [userReactions, setUserReactions] = useState({});

    // Toast Notification
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // Mapping Helper (Centralized)
    const mapIssueData = (fetchedIssue) => {
        if (!fetchedIssue) return null;
        let desc = fetchedIssue.description || '';
        let degree = fetchedIssue.degree || 'IT';
        let requiredWithin = fetchedIssue.requiredWithin || 'No deadline';
        
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
            ...fetchedIssue,
            description: desc,
            requiredWithin: requiredWithin,
            degree: degree,
            responses: (fetchedIssue.responses || []).map(r => ({
                ...r,
                reactions: r.reactions || { helpful: [], insightful: [], appreciate: [] }
            }))
        };
    };

    // API Data Fetching
    const [relatedIssues, setRelatedIssues] = useState([]);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                const { data: fetchedIssue } = await axios.get(`/api/issues/${id}`, config);
                console.log(`--- FETCHED ISSUE: ${fetchedIssue.title} --- Views: ${fetchedIssue.views}`);
                
                const mappedIssue = mapIssueData(fetchedIssue);
                setIssue(mappedIssue);

                // Initialize userReactions by checking if current user ID is in those reaction arrays
                const initialReactions = {};
                if (mappedIssue.responses && user?._id) {
                    mappedIssue.responses.forEach(r => {
                        initialReactions[r._id] = {
                            helpful: r.reactions?.helpful?.includes(user._id),
                            insightful: r.reactions?.insightful?.includes(user._id),
                            appreciate: r.reactions?.appreciate?.includes(user._id)
                        };
                    });
                }
                setUserReactions(initialReactions);

                // Fetch related
                try {
                    const { data: allIssues } = await axios.get('/api/issues');
                    const related = allIssues.filter(i => i.subject === mappedIssue.subject && i._id !== mappedIssue._id).slice(0, 3);
                    setRelatedIssues(related);
                } catch(e) {}

            } catch (error) {
                console.error("Error fetching issue:", error);
                navigate('/issues');
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
        window.scrollTo(0, 0);
    }, [id, navigate, user]);

    // Determine effective status
    const isResolved = issue ? issue.status === 'Resolved' : false;

    // Calculate Scores & sort (use lengths now)
    const calculateScore = (r) => {
        if (!r.reactions) return 0;
        return (r.reactions.helpful?.length || 0) + (r.reactions.insightful?.length || 0) + (r.reactions.appreciate?.length || 0);
    };

    const responses = issue ? [...issue.responses] : [];
    const sortedResponses = responses.sort((a, b) => calculateScore(b) - calculateScore(a));

    // Best Solution Logic
    const bestSolution = (() => {
        if (responses.length === 0) return null;
        return responses.find(r => r.isBest) || null;
    })();

    const handleReaction = async (responseId, type) => {
        if (!user) return navigate('/login');
        if (isResolved) return;

        // Detect Mock ID
        if (id.length < 5 || responseId.includes('r')) {
            console.log("Mock detected - blocking API call.");
            return;
        }

        const currentUserReaction = userReactions[responseId]?.[type];
        const action = currentUserReaction ? 'remove' : 'add';

        try {
            // OPTIMISTIC UPDATE: Update UI instantly for better feel
            const updatedResponses = (issue.responses || []).map(resp => {
                if (resp._id === responseId) {
                    const currentArr = Array.isArray(resp.reactions?.[type]) ? resp.reactions[type] : [];
                    const newArr = currentUserReaction
                        ? currentArr.filter(uid => uid?.toString() !== user?._id?.toString())
                        : [...currentArr, user?._id];
                    return {
                        ...resp,
                        reactions: {
                            ...(resp.reactions || { helpful: [], insightful: [], appreciate: [] }),
                            [type]: newArr
                        }
                    };
                }
                return resp;
            });
            setIssue({ ...issue, responses: updatedResponses });
            setUserReactions(prev => ({
                ...prev,
                [responseId]: { ...prev[responseId], [type]: !currentUserReaction }
            }));

            // PERSIST TO BACKEND: Actually save to database
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: updatedIssue } = await axios.post(
                `/api/issues/${id}/responses/${responseId}/react`,
                { reactionType: type },
                config
            );

            // SYNC: Update state with actual confirmed data from server
            setIssue(mapIssueData(updatedIssue));
        } catch (error) {
            console.error('Error saving reaction:', error);
            showToast('error', 'Could not save reaction to database');
        }
    };

    const handleUpvoteMain = async () => {
        if (!user) return navigate('/login');
        if (id.length < 5 || id.includes('m')) {
            alert("This is Mock Data. Please create a NEW Issue to test real persistence.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: updatedIssue } = await axios.post(`/api/issues/${id}/upvote`, {}, config);
            setIssue(mapIssueData(updatedIssue));
        } catch (error) {
            console.error("Error upvoting main issue:", error);
        }
    };

    const handleReply = (authorName) => {
        if (!user) return navigate('/login');
        if (isResolved) return;

        const replyPrefix = `@${authorName} `;
        setResponseText(prev => prev + replyPrefix);

        if (responseInputRef.current) {
            responseInputRef.current.focus();
            responseInputRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePostResponse = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (isResolved) return;
        if (!responseText.trim()) return;

        setPostingResponse(true);
        try {
            const config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`
                } 
            };
            
            const formData = new FormData();
            formData.append('content', responseText);
            
            responseAttachments.forEach(att => {
                formData.append('attachments', att.file);
            });

            const { data: updatedIssue } = await axios.post(`/api/issues/${id}/response`, formData, config);
            
            // Auto-dismiss from dashboard alerts after responding
            try {
                await axios.post('/api/dashboard/alerts/dismiss', { alertId: id }, config);
            } catch (e) {
                console.error("Failed to auto-dismiss alert", e);
            }

            const mappedIssue = mapIssueData(updatedIssue);
            setIssue(mappedIssue);

            const initialReactions = {};
            mappedIssue.responses.forEach(r => {
                initialReactions[r._id] = { helpful: false, insightful: false, appreciate: false };
            });
            setUserReactions(prev => ({ ...prev, ...initialReactions }));

            setResponseText('');
            setResponseAttachments([]);
            showToast('success', '🎉 Response posted successfully!');
        } catch (error) {
            console.error('Error posting response:', error);
            showToast('error', error.response?.data?.message || 'Failed to post response');
        } finally {
            setPostingResponse(false);
        }
    };

    const handleResponseFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (responseAttachments.length + files.length > 5) {
                alert("Maximum 5 attachments allowed per response.");
                return;
            }
            const newFiles = files.map(file => ({
                file,
                preview: file.type.startsWith('image') ? URL.createObjectURL(file) : null,
                name: file.name
            }));
            setResponseAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const removeResponseAttachment = (index) => {
        setResponseAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteResponse = async (responseId) => {
        console.log(`--- UI DELETE ATTEMPTED --- Issue ID: ${id}, Resp ID: ${responseId}`);
        // Detect Mock ID
        if (id.length < 5 || responseId.includes('r')) {
            console.log("Mock detected - blocking API call.");
            alert("This is Mock Data (System Demo). Mock data cannot be modified or deleted in the database. Please create a NEW Issue and post a solution to test real Edit/Delete functionality.");
            return;
        }

        if (window.confirm('Are you sure you want to remove your response?')) {
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                console.log("Sending DELETE request to backend...");
                const { data: updatedIssue } = await axios.delete(`/api/issues/${id}/responses/${responseId}`, config);
                console.log("Response received. Updating state.");
                
                setIssue(mapIssueData(updatedIssue));
            } catch (error) {
                console.error('Error deleting response:', error);
            }
        }
    };

    const handleEditResponse = async (responseId) => {
        if (id.length < 5 || responseId.includes('r')) {
            alert("This is Mock Data. Please create a NEW Issue to test real functionality.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', editContent);
            formData.append('keepAttachments', JSON.stringify(editAttachments));
            editNewFiles.forEach(f => formData.append('newAttachments', f.file));

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: updatedIssue } = await axios.put(
                `/api/issues/${id}/responses/${responseId}`,
                formData,
                config
            );

            setIssue(mapIssueData(updatedIssue));
            setEditingResponseId(null);
            setEditNewFiles([]);
            showToast('success', '✅ Response updated successfully!');
        } catch (error) {
            console.error('Error updating response:', error.response?.data || error.message);
            showToast('error', `Could not update: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleMarkResolved = async () => {
        if (!window.confirm("Mark this issue as resolved? This will lock the discussion.")) return;

        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.put(`/api/issues/${id}`, { status: 'Resolved' }, config);
            setIssue(mapIssueData(data));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleToggleBest = async (responseId) => {
        if (!user || (user.role !== 'lecturer' && user.role !== 'admin')) return;

        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.put(`/api/issues/${id}/responses/${responseId}/best`, {}, config);
            
            const mappedIssue = mapIssueData(data);
            setIssue(mappedIssue);

            // Automatically resolve if not already
            if (mappedIssue.status !== 'Resolved') {
                handleMarkResolved();
            }
        } catch (error) {
            console.error('Error toggling best response:', error);
        }
    };



    // Share Handlers
    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(`Check out this issue on StudyMate: ${issue.title} \n`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://wa.me/?text=${text}${url}`, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="issue-detail-page flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-teal-400 mb-4" size={48} />
                    <p className="text-slate-400">Loading discussion...</p>
                </div>
            </div>
        );
    }

    if (!issue) return <div className="text-center py-20">Issue not found</div>;

    // Helper to calculate relative time
    const getRelativeTime = (dateString, addDays = 0) => {
        const date = new Date(dateString);
        if (addDays) date.setDate(date.getDate() + addDays);

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 0) return 'Pending';
        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <div className="issue-detail-page premium-theme">

            {/* 🔔 Toast Notification */}
            {toast && (
                <div className={`toast-notification ${toast.type} ${toast ? 'visible' : ''}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' ? '✓' : '✕'}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => setToast(null)}>×</button>
                    <div className="toast-progress-bar"></div>
                </div>
            )}
            <div className="detail-container">

                {/* 🔙 Breadcrumb */}
                <div className="breadcrumb-nav">
                    <button onClick={() => navigate('/issues')} className="btn-back-link">
                        <ArrowLeft size={18} /> Back to Issues
                    </button>
                    <span className="separator">/</span>
                    <span className="current-crumb">{issue.subject}</span>
                </div>

                <div className="detail-layout-grid">

                    {/* 👈 Left Column: Main Content */}
                    <div className="main-content-column">

                        {/* 📝 Issue Description Card */}
                        <div className="issue-content-card animate-fade-in">
                            <header className="premium-header-modern">
                                <div className="header-left-group">
                                    <div className="user-profile-mini">
                                        <div className="avatar-med-glow">
                                            {issue.student?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="meta-text">
                                            <h4>{issue.student?.name}</h4>
                                            <div className="meta-sub-row">
                                                <span className="user-level-badge">{issue.student?.level || 'Student'}</span>
                                                <span className="meta-dot"></span>
                                                <span className="date-text">
                                                    <Calendar size={12} /> {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="header-right-group">
                                    {!isResolved && issue.requiredWithin && (
                                        <CountdownTimer 
                                            createdAt={issue.createdAt} 
                                            requiredWithin={issue.requiredWithin} 
                                        />
                                    )}
                                    
                                    <div className="status-indicator-stack">
                                        <span className={`status-pill-premium ${isResolved ? 'resolved' : 'open'}`}>
                                            {isResolved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                            {isResolved ? 'Resolved' : 'Open'}
                                        </span>
                                        {user && (user._id === issue.student?._id || user.name === issue.student?.name) && !isResolved && (
                                            <div className="review-status-pill">
                                                <Activity size={12} className="animate-pulse" /> Awaiting lecturer review
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </header>

                            <h1 className="issue-main-title">{issue.title}</h1>

                            <div className="issue-stats-bar-premium">
                                <div className="stat-pill"><Eye size={14} /> <span>{issue.views || 0} Views</span></div>
                                <div className="stat-pill"><MessageSquare size={14} /> <span>{issue.responses?.length || 0} Responses</span></div>
                                
                                <button 
                                    className={`stat-pill upvote-pill ${issue.upvotes?.includes(user?._id) ? 'active' : ''}`}
                                    onClick={handleUpvoteMain}
                                    disabled={user?._id === issue.student?._id}
                                    title={user?._id === issue.student?._id ? "You cannot upvote your own issue" : "I have this issue too"}
                                >
                                    <ThumbsUp size={14} /> 
                                    <span>{issue.upvotes?.length || 0} Me Too</span>
                                </button>

                                {issue.attachments?.length > 0 && (
                                    <div className="stat-pill text-emerald-400"><Paperclip size={14} /> <span>{issue.attachments.length} Files</span></div>
                                )}
                            </div>

                            <div className="issue-body-content">
                                {(issue.description || '').split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>

                            {/* 📎 Attachments Gallery (Live Backend Integration) */}
                            {issue.attachments && issue.attachments.length > 0 && (
                                <div className="detail-attachments-box mt-6">
                                    <h5 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Paperclip size={14} /> Attachments ({issue.attachments.length})
                                    </h5>
                                    <div className="detail-attachments-grid">
                                        {issue.attachments.map((path, idx) => {
                                            const cleanPath = path.replace(/\\/g, '/');
                                            const fullUrl = cleanPath.startsWith('http') ? cleanPath : `http://localhost:5000/${cleanPath}`;
                                            const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(path);
                                            return (
                                                <div key={idx} className="detail-att-card" onClick={() => window.open(fullUrl, '_blank')}>
                                                    <div className="att-visual">
                                                        {isImage ? (
                                                            <img src={fullUrl} alt={`Attachment ${idx + 1}`} />
                                                        ) : (
                                                            <FileText size={32} className="text-slate-500" />
                                                        )}
                                                    </div>
                                                    <div className="att-info-row">
                                                        <span className="att-filename">Attachment {idx + 1}</span>
                                                        <Download size={14} className="text-teal-400" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="issue-tags-row">
                                <span className="subject-pill"><BookOpen size={14} /> {issue.subject}</span>
                                <span className="degree-pill"><Tag size={14} /> {issue.degree}</span>
                            </div>
                        </div>

                        {/* 💬 Discussion Section */}
                        <div className="responses-section mt-8">
                            
                            {/* 🏆 ACADEMIC RESOLUTION SECTION */}
                            {(bestSolution || issue.lecturerResponse) && (
                                <div className="academic-resolution-container mb-10">
                                    <h3 className="section-title mb-6">
                                        <Award size={24} className="text-emerald-400" />
                                        Verified Resolution
                                    </h3>

                                    {/* Case 1: Best Student Solution (with potential lecturer feedback) */}
                                    {bestSolution ? (
                                        <div className="response-card best-solution animate-slide-up">
                                            <div className="best-solution-banner">
                                                <Award size={16} /> Best Solution
                                            </div>
                                            <div className="response-header">
                                                <div className="responder-info">
                                                    <div className="avatar-sm best">
                                                        {bestSolution.author?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="responder-name">{bestSolution.author?.name}</span>
                                                        <span className="responder-level">{bestSolution.author?.level}</span>
                                                    </div>
                                                </div>
                                                <div className="response-meta-right">
                                                    <span className="response-date">{new Date(bestSolution.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="response-content">
                                                <div className="student-answer-box">
                                                    <p>{bestSolution.content}</p>
                                                </div>
                                                
                                                {/* Best Response Gallery */}
                                                {bestSolution.attachments && bestSolution.attachments.length > 0 && (
                                                    <div className="response-gallery">
                                                        {bestSolution.attachments.map((att, attIdx) => {
                                                            const cleanPath = att.replace(/\\/g, '/');
                                                            const fullUrl = cleanPath.startsWith('http') ? cleanPath : `http://localhost:5000/${cleanPath}`;
                                                            return (
                                                                <a 
                                                                    key={attIdx} 
                                                                    href={fullUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="resp-gallery-thumb"
                                                                >
                                                                    <img src={fullUrl} alt="Solution clarity" />
                                                                    <div className="thumb-overlay">
                                                                        <Download size={14} /> Full View
                                                                    </div>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* 🎓 Combined Lecturer Feedback (Integrated into the same card) */}
                                                {issue.lecturerReview && (
                                                    <div className="embedded-lecturer-evaluation">
                                                        <div className="eval-header-row">
                                                            <div className="eval-label-chip">
                                                                <ShieldCheck size={14} /> Verdict for <strong>@{bestSolution.author?.name}</strong>
                                                            </div>
                                                            <div className="divider-line"></div>
                                                        </div>

                                                        <div className="lecturer-profile-info-mini">
                                                            <div className="lecturer-avatar-mini">
                                                                {issue.lecturer?.name?.charAt(0) || 'L'}
                                                            </div>
                                                            <div className="lecturer-meta-mini">
                                                                <span className="lecturer-name-mini">{issue.lecturer?.name || 'Lecturer'}</span>
                                                                <span className="lecturer-staff-tag">Academic Staff</span>
                                                            </div>
                                                        </div>

                                                        <div className="evaluation-feedback-text">
                                                            <p>
                                                                {issue.lecturerReview?.replace(`@${bestSolution.author?.name}`, '').trim()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* If there is ALSO an expert solution text, add it here too */}
                                                {issue.lecturerResponse && (
                                                    <div className="expert-supplementary-solution">
                                                        <div className="supplementary-label">
                                                            <Lightbulb size={14} /> Additional Expert Insight:
                                                        </div>
                                                        <div className="supplementary-text">
                                                            {issue.lecturerResponse}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="response-footer">
                                                <div className="flex flex-col w-full gap-3">
                                                    <div className="best-solution-note">
                                                        <CheckCircle2 size={14} /> Highest rated answer by the community
                                                    </div>

                                                    <ReactionButtons
                                                        response={bestSolution}
                                                        isResolved={isResolved}
                                                        handleReaction={handleReaction}
                                                        userReactions={userReactions}
                                                        handleReply={handleReply}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Case 2: Only Expert Solution available (No student was best) */
                                        <div className="expert-solution-card-standalone animate-fade-in">
                                            <div className="expert-badge-top">
                                                <Award size={18} /> Official Lecturer Solution
                                            </div>
                                            <div className="expert-card-body">
                                                <div className="expert-header">
                                                    <div className="expert-info">
                                                        <div className="expert-avatar">
                                                            {issue.lecturer?.name?.charAt(0) || 'L'}
                                                        </div>
                                                        <div>
                                                            <span className="expert-name">{issue.lecturer?.name || 'Lecturer'}</span>
                                                            <span className="expert-tag">Academic Staff</span>
                                                        </div>
                                                    </div>
                                                    <div className="expert-date">
                                                        <Calendar size={12} /> {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Academic Resolution'}
                                                    </div>
                                                </div>
                                                <div className="expert-content-box">
                                                    <p>{issue.lecturerResponse}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <h3 className="section-title">
                                <MessageSquare size={24} className="text-teal-400" />
                                Peer Discussion <span className="count-badge">{issue.responses?.length || 0}</span>
                            </h3>


                            {/* Other Responses (Exclude Best Solution if it exists) */}
                            {sortedResponses.filter(r => r !== bestSolution).map(resp => (
                                <div key={resp._id} className="response-card standard animate-slide-up">
                                    <div className="response-header">
                                        <div className="responder-info">
                                            <div className="avatar-sm">
                                                {resp.author?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="responder-name">{resp.author?.name}</span>
                                                <span className="responder-level">{resp.author?.level}</span>
                                            </div>
                                        </div>
                                        <span className="response-date">{new Date(resp.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="response-content">
                                        {editingResponseId === resp._id ? (
                                            <div className="edit-response-mode">
                                                <textarea 
                                                    className="edit-textarea-mi"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                />

                                                {/* Existing Attachments with Remove */}
                                                {editAttachments.length > 0 && (
                                                    <div className="edit-attachments-section">
                                                        <p className="edit-att-label"><Paperclip size={13}/> Current Attachments</p>
                                                        <div className="edit-att-chips">
                                                            {editAttachments.map((path, idx) => {
                                                                const name = path.split('/').pop().replace(/^issue-\d+-/, '');
                                                                return (
                                                                    <div key={idx} className="edit-att-chip">
                                                                        <FileText size={12}/>
                                                                        <span>{name}</span>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-remove-chip"
                                                                            onClick={() => setEditAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                                            title="Remove attachment"
                                                                        >
                                                                            <X size={11}/>
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New Files Preview */}
                                                {editNewFiles.length > 0 && (
                                                    <div className="edit-attachments-section">
                                                        <p className="edit-att-label" style={{color:'#64FFDA'}}><Paperclip size={13}/> New Attachments</p>
                                                        <div className="edit-att-chips">
                                                            {editNewFiles.map((f, idx) => (
                                                                <div key={idx} className="edit-att-chip new">
                                                                    <FileText size={12}/>
                                                                    <span>{f.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-chip"
                                                                        onClick={() => setEditNewFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                    >
                                                                        <X size={11}/>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Hidden file input */}
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
                                                        setEditNewFiles(prev => [...prev, ...files.map(f => ({ file: f, name: f.name }))]);
                                                        e.target.value = '';
                                                    }}
                                                />

                                                <div className="edit-actions-mi">
                                                    <button
                                                        type="button"
                                                        className="btn-attach-edit"
                                                        onClick={() => editFileRef.current.click()}
                                                        title="Add attachment"
                                                    >
                                                        <Paperclip size={14}/>
                                                    </button>
                                                    <div className="edit-actions-mi-right">
                                                        <button className="btn-save-edit" onClick={() => handleEditResponse(resp._id)}>
                                                            <Save size={14} /> Save
                                                        </button>
                                                        <button className="btn-cancel-edit" onClick={() => { setEditingResponseId(null); setEditNewFiles([]); }}>
                                                            <X size={14} /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p>{resp.content}</p>
                                                
                                                {/* Response Gallery Display */}
                                                {resp.attachments && resp.attachments.length > 0 && (
                                                    <div className="response-gallery">
                                                        {resp.attachments.map((att, attIdx) => {
                                                            const cleanPath = att.replace(/\\/g, '/');
                                                            const fullUrl = cleanPath.startsWith('http') ? cleanPath : `http://localhost:5000/${cleanPath}`;
                                                            return (
                                                                <a 
                                                                    key={attIdx} 
                                                                    href={fullUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="resp-gallery-thumb"
                                                                >
                                                                    <img src={fullUrl} alt="Solution clarify" />
                                                                    <div className="thumb-overlay">
                                                                        <Download size={14} /> Full View
                                                                    </div>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="response-footer">
                                        <div className="action-row w-full flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <ReactionButtons
                                                    response={resp}
                                                    isResolved={isResolved}
                                                    handleReaction={handleReaction}
                                                    userReactions={userReactions}
                                                    handleReply={handleReply}
                                                />
                                                {user && (user.role === 'lecturer' || user.role === 'admin') && !isResolved && (
                                                    <button 
                                                        className={`btn-mark-best ${resp.isBest ? 'active' : ''}`}
                                                        onClick={() => handleToggleBest(resp._id)}
                                                    >
                                                        <Award size={14} /> {resp.isBest ? 'Unmark Best' : 'Mark as Best'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Owner Actions */}
                                            {user && (user._id === resp.author?._id || user.id === resp.author?._id) && !isResolved && (
                                                <div className="owner-actions-mi">
                                                    <button className="btn-icon-action-mi edit" onClick={() => {
                                                        setEditingResponseId(resp._id);
                                                        setEditContent(resp.content);
                                                        setEditAttachments(resp.attachments || []);
                                                        setEditNewFiles([]);
                                                    }}>
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button className="btn-icon-action-mi delete" onClick={() => handleDeleteResponse(resp._id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {issue.responses?.length === 0 && (
                                <div className="empty-state-response">
                                    <MessageSquare size={40} />
                                    <p>No responses yet. Be the first to help!</p>
                                </div>
                            )}

                            {/* Write Response - Conditional Render */}
                            {!isResolved ? (
                                <div className="post-response-box">
                                    <h4>Post your solution</h4>
                                    <form onSubmit={handlePostResponse}>
                                        <textarea
                                            ref={responseInputRef}
                                            className="response-input-area"
                                            placeholder={user ? "Type your solution here..." : "Please login to respond"}
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            disabled={!user || postingResponse}
                                        />

                                        {/* Response Attachments Preview Area */}
                                        {responseAttachments.length > 0 && (
                                            <div className="response-attachment-previews">
                                                {responseAttachments.map((att, idx) => (
                                                    <div key={idx} className="resp-att-pill">
                                                        <div className="resp-att-icon">
                                                            {att.preview ? (
                                                                <img src={att.preview} alt="prev" />
                                                            ) : (
                                                                <FileText size={14} />
                                                            )}
                                                        </div>
                                                        <span className="resp-att-name">{att.name}</span>
                                                        <button 
                                                            type="button" 
                                                            className="btn-remove-resp-att" 
                                                            onClick={() => removeResponseAttachment(idx)}
                                                            title="Remove attachment"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="form-actions-right">
                                            <button 
                                                type="button" 
                                                className="btn-attach-resp" 
                                                onClick={() => responseFileRef.current.click()}
                                                disabled={!user || postingResponse}
                                                title="Attach screenshots/files"
                                            >
                                                <Paperclip size={18} />
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={responseFileRef} 
                                                className="hidden" 
                                                multiple 
                                                accept="image/*,.pdf,.doc,.docx,.txt" 
                                                onChange={handleResponseFileChange} 
                                            />
                                            
                                            <button
                                                type="submit"
                                                className="btn-submit-premium"
                                                disabled={!user || postingResponse || !responseText.trim()}
                                            >
                                                {postingResponse ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                                Submit Response
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="resolved-notice-box">
                                    <Lock size={24} />
                                    <div>
                                        <h4>This issue is resolved and locked.</h4>
                                        <p>No further responses or reactions can be added. You can use this as a reference.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* 👉 Right Column: Sidebar Info Panel */}
                    <div className="sidebar-column">

                        {/* 🆕 ISSUE LIFECYCLE WIDGET */}
                        <div className="sidebar-widget">
                            <h4 className="widget-title"><Activity size={18} className="text-teal-400" /> Issue Lifecycle</h4>
                            <div className="lifecycle-timeline">
                                {/* Step 1: Open */}
                                <div className={`lifecycle-step ${!isResolved ? 'active' : 'completed'}`}>
                                    <div className="timeline-line"></div>
                                    <div className="step-dot"></div>
                                    <div className="step-content">
                                        <h5>Open</h5>
                                        <span className="step-date">{getRelativeTime(issue.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Step 2: Resolved */}
                                <div className={`lifecycle-step ${isResolved ? 'active' : ''}`}>
                                    <div className="timeline-line"></div>
                                    <div className="step-dot"></div>
                                    <div className="step-content">
                                        <h5>Resolved</h5>
                                        <span className="step-date">
                                            {isResolved ? 'Solutions found' : 'Pending...'}
                                        </span>
                                    </div>
                                </div>

                                {/* Step 3: Locked */}
                                <div className={`lifecycle-step ${isResolved ? 'active' : ''}`}>
                                    <div className="step-dot"></div>
                                    <div className="step-content">
                                        <h5>Locked</h5>
                                        <span className="step-date">
                                            {isResolved ? 'Thread closed' : 'Pending...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ENGAGEMENT STATUS */}
                        <div className="sidebar-widget">
                            <h4 className="widget-title"><Award size={18} className="text-teal-400" /> Community Status</h4>
                            <div className="status-card-inner">
                                <div className="status-row-header">
                                    <span className="status-label-text">Peer Engagement</span>
                                    <span className="badge-high">High</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: '85%' }}></div>
                                </div>
                                <div className="status-desc-row">
                                    <Zap size={14} className="text-yellow-400" style={{ marginTop: '2px' }} />
                                    <span>This issue is getting high attention.</span>
                                </div>
                            </div>
                        </div>

                        {/* SHARE BUTTONS - UPDATED */}
                        <div className="sidebar-widget">
                            <h4 className="widget-title"><Share2 size={18} className="text-blue-400" /> Share Issue</h4>
                            <div className="share-buttons-grid">
                                <button className="share-btn facebook" onClick={handleShareFacebook}>
                                    <Facebook size={18} /> Share on Facebook
                                </button>
                                <button className="share-btn whatsapp" onClick={handleShareWhatsApp}>
                                    <MessageCircle size={18} /> Share on WhatsApp
                                </button>
                                <button className="share-btn link" onClick={handleCopyLink}>
                                    {copied ? <Check size={18} className="text-green-400" /> : <LinkIcon size={18} />}
                                    {copied ? 'Link Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                        {/* RELATED ISSUES WIDGET */}
                        {relatedIssues.length > 0 && (
                            <div className="sidebar-widget animate-fade-in">
                                <h4 className="widget-title"><BookOpen size={18} className="text-teal-400" /> Related in {issue.subject}</h4>
                                <div className="related-issues-list">
                                    {relatedIssues.map(ri => (
                                        <div key={ri._id} className="related-item" onClick={() => navigate(`/issues/${ri._id}`)}>
                                            <div className="ri-top">
                                                <span className={`ri-status ${ri.status.toLowerCase()}`}>{ri.status}</span>
                                                <span className="ri-date">{getRelativeTime(ri.createdAt)}</span>
                                            </div>
                                            <p className="ri-title">{ri.title}</p>
                                            <div className="ri-stats">
                                                <span><MessageSquare size={12} /> {ri.responses?.length || 0}</span>
                                                <span><ThumbsUp size={12} /> {ri.upvotes?.length || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
