import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quote, Star, Users, MessageSquare, Heart, Search, Filter, Send, UserPlus, LogIn, CheckCircle, Edit3, Trash2, X } from 'lucide-react';
import { studentReviews } from '../../utils/reviewData';
import AuthContext from '../../context/AuthContext';
import './Reviews.css';

const Reviews = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDegree, setFilterDegree] = useState('All');
    
    // Review Submission State
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initial Load & Persistence
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('studyMate_student_reviews_v1') || '[]');
        setReviews([...studentReviews, ...stored]);
    }, []);

    const handleAddReview = (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setTimeout(() => {
            const userId = user._id || user.id; // Support both id and _id
            const reviewToAdd = {
                id: Date.now(),
                name: user.name,
                degree: user.degree === 'Business Management' ? 'BM' : user.degree,
                year: `Year ${user.year || 1}`,
                comment: newReview.comment,
                rating: newReview.rating,
                avatar: `https://i.pravatar.cc/150?u=${userId || 'current'}`,
                studentId: userId // Ownership tracking
            };

            const updatedStored = JSON.parse(localStorage.getItem('studyMate_student_reviews_v1') || '[]');
            const newStored = [reviewToAdd, ...updatedStored];
            localStorage.setItem('studyMate_student_reviews_v1', JSON.stringify(newStored));
            
            setReviews([reviewToAdd, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    const handleDeleteReview = (id) => {
        if (!window.confirm("Are you sure you want to delete your success story?")) return;
        
        const updatedReviews = reviews.filter(r => r.id !== id);
        setReviews(updatedReviews);

        // Store persistent version only
        const updatedStored = JSON.parse(localStorage.getItem('studyMate_student_reviews_v1') || '[]');
        const newStored = updatedStored.filter(r => r.id !== id);
        localStorage.setItem('studyMate_student_reviews_v1', JSON.stringify(newStored));
    };

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editData, setEditData] = useState({ rating: 5, comment: '' });

    const handleStartEdit = (review) => {
        setEditingReviewId(review.id);
        setEditData({ rating: review.rating, comment: review.comment });
    };

    const handleUpdateReview = (e) => {
        e.preventDefault();
        const updatedReviews = reviews.map(r => {
            if (r.id === editingReviewId) {
                return { ...r, rating: editData.rating, comment: editData.comment };
            }
            return r;
        });
        setReviews(updatedReviews);

        // Persistent update
        const updatedStored = JSON.parse(localStorage.getItem('studyMate_student_reviews_v1') || '[]');
        const newStored = updatedStored.map(r => {
            if (r.id === editingReviewId) {
                return { ...r, rating: editData.rating, comment: editData.comment };
            }
            return r;
        });
        localStorage.setItem('studyMate_student_reviews_v1', JSON.stringify(newStored));
        
        setEditingReviewId(null);
    };

    const degrees = ['All', ...new Set(reviews.map(r => r.degree))];

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              r.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDegree = filterDegree === 'All' || r.degree === filterDegree;
        return matchesSearch && matchesDegree;
    });

    return (
        <div className="reviews-page animate-fade-in">
            {/* --- Hero Header --- */}
            <div className="reviews-hero">
                <div className="rh-content">
                    <div className="rh-icon-bg"><Star size={32} fill="#FFD700" color="#FFD700" /></div>
                    <h1>Student Success Stories</h1>
                    <p>Hear from thousands of students who have transformed their academic journey with StudyMate.</p>
                </div>
                <div className="rh-stats-row">
                    <div className="rh-stat-pill">
                        <Users size={16} /> 1,200+ Active Students
                    </div>
                    <div className="rh-stat-pill">
                        <MessageSquare size={16} /> 450+ Resolved Issues
                    </div>
                    <div className="rh-stat-pill">
                        <Heart size={16} /> 98% Success Rate
                    </div>
                </div>
            </div>

            <div className="reviews-container">
                {/* --- Add Review Section --- */}
                <div className="share-story-section-mi animate-slide-up">
                    <div className="share-story-card">
                        <div className="share-story-header">
                            <div className="ssh-icon"><Heart size={20} fill="#f43f5e" color="#f43f5e" /></div>
                            <h3>Share Your Success Story</h3>
                            <p>Inspire fellow students by highlighting your journey with StudyMate.</p>
                        </div>
                        
                        {user ? (
                            <form className="share-story-form" onSubmit={handleAddReview}>
                                <div className="rating-selector">
                                    <span className="rs-label">Your Rating:</span>
                                    <div className="stars-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                type="button"
                                                className={`star-btn ${newReview.rating >= star ? 'active' : ''}`}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            >
                                                <Star size={20} fill={newReview.rating >= star ? "#FFD700" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="comment-input-group">
                                    <textarea 
                                        placeholder="Tell us about your experience..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-submit-review"
                                        disabled={isSubmitting || !newReview.comment.trim()}
                                    >
                                        {isSubmitting ? 'Posting...' : <><Send size={18} /> Post My Story</>}
                                    </button>
                                </div>

                                {showSuccess && (
                                    <div className="review-success-toast">
                                        <CheckCircle size={16} /> Success! Your story is featured.
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="login-to-review">
                                <p>Please login as a student to share your experience with the community.</p>
                                <div className="ltr-actions">
                                    <button onClick={() => navigate('/login')} className="btn-ltr-login"><LogIn size={18} /> Login Now</button>
                                    <button onClick={() => navigate('/register')} className="btn-ltr-reg"><UserPlus size={18} /> Register</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Filters Toolbar --- */}
                <div className="reviews-toolbar">
                    <div className="rt-search">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search reviews or keywords..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="rt-filter">
                        <Filter size={18} className="filter-icon" />
                        <select value={filterDegree} onChange={(e) => setFilterDegree(e.target.value)}>
                            {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* --- Review Grid --- */}
                <div className="reviews-grid">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="review-card-premium animate-slide-up">
                                {editingReviewId === review.id ? (
                                    <form className="inline-edit-form" onSubmit={handleUpdateReview}>
                                        <div className="ief-header">
                                            <div className="stars-input-small">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button 
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, rating: star })}
                                                    >
                                                        <Star size={16} fill={editData.rating >= star ? "#FFD700" : "none"} color={editData.rating >= star ? "#FFD700" : "#64748b"} />
                                                    </button>
                                                ))}
                                            </div>
                                            <button type="button" className="btn-cancel-edit" onClick={() => setEditingReviewId(null)}><X size={16} /></button>
                                        </div>
                                        <textarea 
                                            value={editData.comment}
                                            onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                                            required
                                        />
                                        <button type="submit" className="btn-save-edit">Save Changes</button>
                                    </form>
                                ) : (
                                    <>
                                        <div className="rpc-header">
                                            <div className="rpc-quote"><Quote size={20} opacity="0.1" /></div>
                                            <div className="rpc-top-right">
                                                {user && (user._id || user.id) === review.studentId && (
                                                    <div className="rpc-actions">
                                                        <button onClick={() => handleStartEdit(review)} className="btn-edit-i"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDeleteReview(review.id)} className="btn-delete-i"><Trash2 size={14} /></button>
                                                    </div>
                                                )}
                                                <div className="rpc-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={12} 
                                                            fill={i < review.rating ? "#FFD700" : "none"} 
                                                            color={i < review.rating ? "#FFD700" : "#475569"} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="rpc-text">"{review.comment}"</p>
                                        
                                        <div className="rpc-footer">
                                            <div className="rpc-user">
                                                <div className="rpc-avatar">
                                                    <img src={review.avatar} alt={review.name} />
                                                </div>
                                                <div className="rpc-info">
                                                    <h4>{review.name}</h4>
                                                    <span>{review.degree} • {review.year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-reviews">
                            <Search size={48} opacity="0.2" />
                            <p>No success stories found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
