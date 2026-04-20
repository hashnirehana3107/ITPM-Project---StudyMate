import React, { useState, useEffect, useContext } from 'react';
import { BookOpen, Search, Filter, Star, Eye, Download, Book, FileText, Video, MoreHorizontal, X, GraduationCap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './StudyMaterials.css';

const StudyMaterials = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Filters and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        degree: user?.degree || 'All',
        subject: 'All',
        year: 'All',
        rating: 'All'
    });

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [degrees, setDegrees] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState(["All"]);

    useEffect(() => {
        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                setDegrees(data);
                
                const degreeFilter = (filters.degree?.toLowerCase() || 'all').trim();

                if (degreeFilter === 'all') {
                    const allSubs = [...new Set(data.flatMap(d => (d.subjects || []).map(s => s.name)))];
                    setAvailableSubjects(["All", ...allSubs]);
                } else {
                    const matched = data.find(d => 
                        d.name?.toLowerCase().trim() === degreeFilter || 
                        d.code?.toLowerCase().trim() === degreeFilter
                    );
                    if (matched) {
                        setAvailableSubjects(["All", ...matched.subjects.map(s => s.name)]);
                    } else {
                        setAvailableSubjects(["All"]);
                    }
                }
            } catch (err) { 
                console.error("API Fetch failed for degrees/subjects:", err);
                setAvailableSubjects(["All"]);
            }
        };
        fetchDegrees();
    }, [filters.degree]);

    useEffect(() => {
        // Redirect Admin - they have their own management page
        if (user?.role === 'admin') {
            navigate('/admin/manage-materials');
            return;
        }

        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/materials');
                
                const mappedData = data.map(m => {
                    let uRating = 0;
                    if (user && user._id && m.ratings) {
                        const existingRating = m.ratings.find(r => r.user === user._id || r.user?._id === user._id);
                        if (existingRating) {
                            uRating = existingRating.rating;
                        }
                    } else if (user && user.id && m.ratings) { // fallback
                        const existingRating = m.ratings.find(r => r.user === user.id || r.user?._id === user.id);
                        if (existingRating) {
                            uRating = existingRating.rating;
                        }
                    }
                    
                    return {
                        ...m,
                        id: m._id, // Map backend _id to frontend id
                        userRating: uRating
                    };
                });
                setMaterials(mappedData);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching materials:', error);
                setMaterials([]);
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [user?.degree, user?.role, navigate]);

    const handleRate = async (id, rating) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const { data } = await axios.post(`/api/materials/${id}/rate`, { rating }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(materials.map(m => m.id === id ? { ...m, averageRating: data.averageRating, userRating: rating } : m));
        } catch (err) {
            console.error('Rating failed:', err);
        }
    };

    const handleReact = async (materialId, type) => {
        if (!user?.token) {
            alert('Please log in to react.');
            return;
        }
        try {
            console.log(`Reacting to ${materialId} with ${type}...`);
            const { data } = await axios.post(
                `/api/materials/${materialId}/react`,
                { type },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log('Reaction Response:', data);
            
            // Update the list with the fresh reactions array from backend
            setMaterials(prev => prev.map(m =>
                (m._id === materialId || m.id === materialId)
                    ? { ...m, reactions: data.reactions }
                    : m
            ));
        } catch (err) {
            console.error('Reaction failed:', err.response?.data || err.message);
            alert('Reaction failed: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    const categories = {
        ratings: ["All", "4.5+", "4.0+", "3.0+"]
    };

    // Helper for flexible degree matching
    const helperMatchesDegree = (targetDeg, itemDeg) => {
        if (!targetDeg || targetDeg === 'All') return true;
        if (!itemDeg) return false;
        const t = targetDeg.toLowerCase().trim();
        const i = itemDeg.toLowerCase().trim();
        return t === i || t.includes(i) || i.includes(t);
    };

    // Filter Logic
    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDegree = helperMatchesDegree(filters.degree, material.degree);
        const matchesSubject = filters.subject === 'All' || material.subject === filters.subject;
        const matchesYear = filters.year === 'All' || material.year?.toString() === filters.year;

        let matchesRating = true;
        if (filters.rating !== 'All') {
            const minRating = parseFloat(filters.rating);
            matchesRating = (material.averageRating || 0) >= minRating;
        }

        return matchesSearch && matchesDegree && matchesSubject && matchesYear && matchesRating;
    });

    // Helper to render icon based on type
    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={24} className="text-red-400" />;
            case 'video': return <Video size={24} className="text-blue-400" />;
            default: return <Book size={24} className="text-emerald-400" />;
        }
    };

    return (
        <div className="study-materials-page animate-fade-in">
            <div className="materials-container">

                {/* Header Section */}
                <div className="materials-header-card">
                    <div className="header-content">
                        <div className="header-icon">
                            <BookOpen size={32} />
                        </div>
                        <div className="header-text">
                            <h1>Study Materials</h1>
                            <p>Explore degree-based learning resources curated for you.</p>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Section */}
                <div className="filter-section-premium">
                    <div className="search-bar-modern">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or keyword..."
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
                                onChange={(e) => setFilters({ ...filters, degree: e.target.value, subject: 'All' })}
                                disabled={user?.role === 'student'}
                                className={`filter-select-modern ${user?.role === 'student' ? 'disabled-fixed' : ''}`}
                            >
                                {user?.role === 'student' ? (
                                    <option value={user?.degree}>{user?.degree}</option>
                                ) : (
                                    <>
                                        <option value="All">All Degrees</option>
                                        {degrees.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Book size={18} /> Subject</label>
                            <select
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                className="filter-select-modern"
                            >
                                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Star size={18} /> Ratings</label>
                            <select
                                value={filters.rating}
                                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                className="filter-select-modern"
                            >
                                {categories.ratings.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="filter-group-modern">
                            <label><Calendar size={18} /> Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="filter-select-modern"
                            >
                                <option value="All">All Years</option>
                                <option value="1">Year 1</option>
                                <option value="2">Year 2</option>
                                <option value="3">Year 3</option>
                                <option value="4">Year 4</option>
                            </select>
                        </div>
                        <div className="filter-actions-modern">
                            <button
                                onClick={() => setFilters({ degree: user?.degree || 'All', subject: 'All', year: 'All', rating: 'All' })}
                                className="reset-filter-btn"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Study Material Cards */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading resources...</p>
                    </div>
                ) : (
                    <div className="materials-grid">
                        {filteredMaterials.length > 0 ? (
                            filteredMaterials.map((material) => (
                                <div key={material.id} className="material-card-modern">
                                    <div className="card-top">
                                        <div className="file-type-icon">
                                            {getFileIcon(material.type)}
                                        </div>
                                        <div className="rating-badge" title="Average Rating">
                                            <Star size={14} fill="#FBBF24" color="#FBBF24" />
                                            <span>{material.averageRating || '0.0'}</span>
                                        </div>
                                    </div>

                                    <h3 className="material-title">{material.title}</h3>

                                    <div className="material-meta">
                                        <span className="meta-tag degree">{material.degree}</span>
                                        <span className="meta-tag subject">{material.subject}</span>
                                        <span className="meta-tag year">Year {material.year}</span>
                                    </div>

                                    {/* Interaction Row */}
                                    <div className="card-interactions">
                                        <button
                                            className={`react-btn ${((material.reactions?.like || []).includes(user?._id) || (material.reactions?.like || []).includes(user?.id)) ? 'reacted' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleReact(material._id || material.id, 'like'); }}
                                        >
                                            👍 {(material.reactions?.like || []).length}
                                        </button>
                                        <button
                                            className={`react-btn ${((material.reactions?.helpful || []).includes(user?._id) || (material.reactions?.helpful || []).includes(user?.id)) ? 'reacted' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleReact(material._id || material.id, 'helpful'); }}
                                        >
                                            💡 {(material.reactions?.helpful || []).length}
                                        </button>
                                        <div className="star-rating-mini">
                                            {[1,2,3,4,5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    size={14} 
                                                    className="star-icon-clickable"
                                                    fill={star <= (material.userRating || material.averageRating || 0) ? "#FBBF24" : "none"}
                                                    onClick={() => handleRate(material.id, star)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card-stats">
                                        <div className="stat" title="Total Views">
                                            <Eye size={14} className="text-blue" />
                                            <span>{material.views || 0} Views</span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="btn-action view primary-action"
                                            onClick={() => navigate(`/materials/${material.id}`, { state: { userRating: material.userRating } })}
                                        >
                                            <Eye size={18} /> View Material
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <Search size={48} />
                                <h3>No materials found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyMaterials;
