import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getEnrichedMockIssues } from '../../utils/issueMocks';
import {
    ChevronLeft, CheckCircle, MessageSquare, ThumbsUp,
    User, Calendar, BookOpen, AlertCircle, Send,
    ShieldCheck, Loader2, Award, Info, Paperclip, FileText,
    Eye, Download
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import './LecturerIssueReview.css';

const LecturerIssueReview = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAnswerId, setSelectedAnswerId] = useState(null);
    const [lecturerReview, setLecturerReview] = useState('');
    const [lecturerResponse, setLecturerResponse] = useState('');

    // Mapping Helper (Consistent with Student View)
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

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                const { data: rawIssue } = await axios.get(`/api/issues/${id}`, config);
                
                const mappedIssue = mapIssueData(rawIssue);
                setIssue(mappedIssue);

                setLecturerReview(mappedIssue.lecturerReview || '');
                setLecturerResponse(mappedIssue.lecturerResponse || '');

                if (mappedIssue.responses && mappedIssue.responses.length > 0) {
                    const officialBest = mappedIssue.responses.find(r => r.isBest);
                    if (officialBest) {
                        setSelectedAnswerId(officialBest._id);
                    } else {
                        const best = mappedIssue.responses.reduce((prev, curr) =>
                            (((Array.isArray(prev.reactions?.helpful) ? prev.reactions.helpful.length : 0)) > 
                             ((Array.isArray(curr.reactions?.helpful) ? curr.reactions.helpful.length : 0))) ? prev : curr
                        );
                        setSelectedAnswerId(best._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching issue for review:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [id, user]);

    const handleResolve = async () => {
        if (!selectedAnswerId && !lecturerReview && !lecturerResponse) {
            alert('Please provide some evaluation or select a best answer.');
            return;
        }

        setSubmitting(true);
        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            
            // If a best answer was selected, mark it
            if (selectedAnswerId) {
                try {
                    await axios.put(`/api/issues/${id}/responses/${selectedAnswerId}/best`, {}, config);
                } catch(e) {
                    console.error('Best answer toggle skipped/failed backend:', e);
                }
            }

            // Using the updated backend schema fields
            await axios.put(`/api/issues/${id}`, { 
                status: 'Resolved',
                lecturerReview: lecturerReview,
                lecturerResponse: lecturerResponse 
            }, config);
            
            navigate('/lecturer/dashboard');
        } catch (error) {
            console.error('Error resolving issue:', error);
            alert('Failed to resolve. Check backend connection.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="review-loading">
            <Loader2 className="animate-spin text-blue-500" size={50} />
        </div>
    );

    if (!issue) return <div className="review-error">Issue not found.</div>;

    return (
        <div className="lecturer-review-page">
            <div className="review-container">
                <header className="review-header">
                    <button className="back-btn" onClick={() => navigate('/lecturer/dashboard')}>
                        <ChevronLeft size={20} /> Back to Dashboard
                    </button>
                    <div className="header-badge">
                        <ShieldCheck size={18} />
                        Academic Verification Mode
                    </div>
                </header>

                <main className="review-main">
                    <div className="issue-details-panel glass-panel">
                        <div className="panel-header">
                            <span className="subject-tag">{issue.subject}</span>
                            <span className="issue-status">{issue.status}</span>
                        </div>
                        <h1 className="issue-title">{issue.title}</h1>
                        <p className="issue-description">{issue.description}</p>

                        <div className="issue-meta">
                            <div className="meta-item"><User size={14} /> Posted by {issue.student?.name}</div>
                            <div className="meta-item"><Calendar size={14} /> {new Date(issue.createdAt).toLocaleString()}</div>
                            <div className="meta-item ml-auto flex gap-4">
                                <span className="stat-value-rev"><Eye size={14} /> {issue.views || 0} Views</span>
                                <span className="stat-value-rev"><ThumbsUp size={14} /> {issue.upvotes?.length || 0} Me Too</span>
                            </div>
                        </div>

                        {issue.attachments && issue.attachments.length > 0 && (
                            <div className="issue-attachments-section">
                                <h4 className="flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                                    <Paperclip size={16} /> Student Attachments ({issue.attachments.length})
                                </h4>
                                <div className="attachments-grid">
                                    {issue.attachments.map((att, idx) => {
                                        const storedPath = typeof att === 'string' ? att : (att.data || att.url || '');
                                        const originalName = typeof att === 'object' ? att.name : '';
                                        
                                        const fileUrl = (storedPath.startsWith('http') || storedPath.startsWith('data:')) 
                                            ? storedPath 
                                            : `http://localhost:5000/${storedPath.replace(/\\/g, '/')}`;
                                        
                                        const isImage = (typeof att === 'object' && att.type?.startsWith('image')) || 
                                                        storedPath.startsWith('data:image') || 
                                                        storedPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                        
                                        const displayName = originalName || 
                                                          storedPath.split(/[/\\]/).pop()?.replace(/^issue-\d+-/, '') || 
                                                          `Attachment ${idx + 1}`;
                                        
                                        return (
                                            <div key={idx} className="detail-att-card shadow-lg" onClick={() => window.open(fileUrl, '_blank')}>
                                                <div className="att-visual">
                                                    {isImage ? (
                                                        <img src={fileUrl} alt={displayName} />
                                                    ) : (
                                                        <FileText size={32} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="att-info-row">
                                                    <span className="att-filename">{displayName}</span>
                                                    <Download size={14} className="text-teal-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="responses-section">
                        <h2 className="section-title">Student Responses ({issue.responses.length})</h2>
                        <div className="responses-grid">
                            {issue.responses.map(resp => (
                                <div
                                    key={resp._id}
                                    className={`response-card glass-panel ${selectedAnswerId === resp._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAnswerId(selectedAnswerId === resp._id ? null : resp._id)}
                                >
                                    <div className="resp-header">
                                        <div className="author-info">
                                            <div className="author-avatar">{resp.author?.name[0]}</div>
                                            <span className="author-name">{resp.author?.name}</span>
                                        </div>
                                        <div className="resp-stats-multi">
                                            <div className="stat-pill helpful">
                                                <ThumbsUp size={12} /> {Array.isArray(resp.reactions?.helpful) ? resp.reactions.helpful.length : 0}
                                            </div>
                                            <div className="stat-pill insightful">
                                                <BookOpen size={12} /> {Array.isArray(resp.reactions?.insightful) ? resp.reactions.insightful.length : 0}
                                            </div>
                                            <div className="stat-pill appreciative">
                                                <Award size={12} /> {Array.isArray(resp.reactions?.appreciate) ? resp.reactions.appreciate.length : 0}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="resp-content">{resp.content}</div>
                                    
                                    {resp.attachments && resp.attachments.length > 0 && (
                                        <div className="resp-attachments-mini">
                                            {resp.attachments.map((att, aidx) => {
                                                const storedPath = typeof att === 'string' ? att : (att.url || att.data || '');
                                                const fileUrl = storedPath.startsWith('http')
                                                    ? storedPath
                                                    : `http://localhost:5000/${storedPath}`;
                                                const displayName = typeof att === 'object'
                                                    ? att.name
                                                    : storedPath.split('/').pop().replace(/^issue-\d+-/, '') || `File ${aidx + 1}`;
                                                return (
                                                    <a key={aidx} href={fileUrl} target="_blank" rel="noreferrer" className="att-mini-chip" onClick={(e) => e.stopPropagation()}>
                                                        <Paperclip size={10} /> {displayName}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="resp-action">
                                        {selectedAnswerId === resp._id ? (
                                            <span className="status-selected"><CheckCircle size={14} /> Selected as Best Answer</span>
                                        ) : (
                                            <span className="status-unselected">Click to select as Best</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lecturer-resolution-panel glass-panel">
                        <h2 className="section-title"><Award size={20} className="text-blue-500" /> Resolution Verdict</h2>

                        <div className="form-group verdict-group">
                            <div className="verdict-label-row">
                                <label>
                                    {selectedAnswerId ? (
                                        <>Final Evaluation for <strong>@{issue.responses.find(r => r._id === selectedAnswerId)?.author?.name}</strong>'s Solution</>
                                    ) : (
                                        "Evaluation / Final Feedback (Public)"
                                    )}
                                </label>
                                <div className="verdict-chips">
                                    <span className="chip-label">Quick Praise:</span>
                                    {['Precision', 'Clarity', 'In-depth', 'Great Effort'].map(tag => (
                                        <button 
                                            key={tag}
                                            type="button" 
                                            className="verdict-mini-chip"
                                            onClick={() => setLecturerReview(prev => prev + (prev ? ' ' : '') + `Awarded for ${tag}.`)}
                                        >
                                            +{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                placeholder="Provide your feedback on the selected answer or clarify the student's doubt..."
                                value={lecturerReview}
                                onChange={(e) => setLecturerReview(e.target.value)}
                                rows="3"
                                className="verdict-textarea"
                            ></textarea>
                            <p className="field-hint">This evaluation will be officially verified as the academic solution.</p>
                        </div>

                        <div className="form-group">
                            <label>Expert Solution (Optional)</label>
                            <textarea
                                placeholder="If you want to provide a dedicated expert solution, type it here..."
                                value={lecturerResponse}
                                onChange={(e) => setLecturerResponse(e.target.value)}
                                rows="4"
                            ></textarea>
                            <p className="field-hint">Use this if the student answers are incomplete or incorrect.</p>
                        </div>

                        <div className="resolution-footer">
                            <div className="info-box">
                                <Info size={16} />
                                <p>{issue.status === 'Resolved' ? "You can update your evaluation feedback below." : "Resolving this issue will mark it as 'Resolved' site-wide."}</p>
                            </div>
                            
                            <div className="action-group-rev">
                                {issue.status === 'Resolved' && (
                                    <button
                                        className="btn-delete-verdict"
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to clear your Expert Solution and Evaluation? The issue will remain Resolved but without your specific feedback.')) {
                                                setSubmitting(true);
                                                try {
                                                    const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                                                    await axios.put(`/api/issues/${id}`, { 
                                                        lecturerReview: '',
                                                        lecturerResponse: '' 
                                                    }, config);
                                                    setLecturerReview('');
                                                    setLecturerResponse('');
                                                    alert('Feedback cleared successfully.');
                                                } catch (e) { alert('Failed to clear.'); }
                                                finally { setSubmitting(false); }
                                            }
                                        }}
                                        disabled={submitting}
                                    >
                                        Clear Feedback
                                    </button>
                                )}
                                <button
                                    className={`resolve-btn ${issue.status === 'Resolved' ? 'resolved-btn' : ''}`}
                                    onClick={handleResolve}
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    {issue.status === 'Resolved' ? 'Update & Save changes' : 'Confirm & Resolve Issue'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LecturerIssueReview;
