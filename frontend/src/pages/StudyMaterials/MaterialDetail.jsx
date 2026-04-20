import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Download, FileText, Calendar, User, Star, ArrowLeft, Eye, Clock, Shield, Layers } from 'lucide-react';
import './MaterialDetail.css';

const MaterialDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(location.state?.userRating || 0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    // Fetch data directly from backend
    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/materials/${id}`);
                
                if (data && data._id) {
                    const materialData = {
                        ...data,
                        id: data._id,
                        uploadedBy: data.uploadedBy?.name || 'Admin System',
                        uploadDate: new Date(data.createdAt).toLocaleDateString(),
                        totalRatings: data.ratings?.length || 0,
                        description: data.description || 'Comprehensive guide covering essential topics. Recommended for this course module.',
                        rating: data.averageRating || 0,
                        downloads: data.downloads || 0,
                        views: data.views || 0
                    };
                    setMaterial(materialData);

                    // --- 🎯 Check if user has already rated ---
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    if (userInfo && data.ratings) {
                        const myRating = data.ratings.find(r => 
                            (r.user._id || r.user).toString() === (userInfo._id || userInfo.id).toString()
                        );
                        if (myRating) setUserRating(myRating.rating);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching material detail:', error);
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [id]);

    useEffect(() => {
        if (material?.fileUrl) {
            if (material.fileUrl.startsWith('data:')) {
                fetch(material.fileUrl)
                    .then(res => res.blob())
                    .then(blob => setPreviewUrl(URL.createObjectURL(blob)))
                    .catch(() => setPreviewUrl(material.fileUrl));
            } else {
                const cleanPath = material.fileUrl.replace(/\\/g, '/').replace(/^\/+/, '');
                const url = material.fileUrl.startsWith('http') ? material.fileUrl : `http://localhost:5000/${cleanPath}`;
                setPreviewUrl(url);
            }
        }
    }, [material]);

    useEffect(() => {
        return () => {
             if (previewUrl && previewUrl.startsWith('blob:')) {
                 URL.revokeObjectURL(previewUrl);
             }
        };
    }, [previewUrl]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // 1. Track download in backend
            const { data } = await axios.post(`/api/materials/${id}/download`);
            if (data && data.downloads !== undefined) {
                setMaterial(prev => ({ ...prev, downloads: data.downloads }));
            }

            // 2. Trigger browser download
            const url = previewUrl;
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.download = material.title || 'study_material';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 3000);
            } else {
                alert("File not available for download.");
            }
        } catch (err) {
            console.error('Download tracking failed:', err);
        }
        setIsDownloading(false);
    };

    const handleRating = async (stars) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const { data } = await axios.post(`/api/materials/${id}/rate`, { rating: stars }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserRating(stars);
            setMaterial(prev => ({ ...prev, rating: data.averageRating, totalRatings: (prev.totalRatings || 0) + 1 }));
        } catch (err) {
            console.error('Rating failed:', err);
            alert('Failed to submit rating');
        }
    };

    if (loading) return (
        <div className="material-detail-page loading-center">
            <div className="spinner"></div>
            <p>Loading preview...</p>
        </div>
    );

    if (!material) return (
        <div className="material-detail-page center-content">
            <h3>Material not found</h3>
            <button onClick={() => navigate('/materials')} className="btn-back">
                <ArrowLeft size={18} /> Back to Materials
            </button>
        </div>
    );

    return (
        <div className="material-detail-page animate-fade-in">
            <div className="detail-container">

                {/* 🔙 Breadcrumb / Back */}
                <div className="breadcrumb-nav">
                    <button onClick={() => navigate('/materials')} className="btn-back-link">
                        <ArrowLeft size={16} /> Study Materials
                    </button>
                    <span className="separator">/</span>
                    <span className="current-crumb">{material.subject}</span>
                </div>

                <div className="detail-layout">

                    {/* 👈 Left Column: Preview */}
                    <div className="preview-section">
                        <div className="preview-card">
                            <div className="preview-header">
                                <FileText size={20} className="text-blue" />
                                <span>File Preview</span>
                            </div>

                            <div className="preview-window">
                                {previewUrl && material.type === 'pdf' ? (
                                    <iframe src={previewUrl} width="100%" height="500px" title="PDF Preview" style={{border: 'none', borderRadius: '12px', background: 'white'}}></iframe>
                                ) : previewUrl && (material.type === 'video') ? (
                                    <video src={previewUrl} controls width="100%" style={{borderRadius: '12px', maxHeight: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}></video>
                                ) : previewUrl && (['jpg', 'jpeg', 'png', 'gif'].includes(material.type?.toLowerCase())) ? (
                                    <img src={previewUrl} alt="Preview" style={{width: '100%', borderRadius: '12px', maxHeight: '500px', objectFit: 'contain'}} />
                                ) : (
                                    <div className="preview-placeholder" style={{ padding: '3rem 1rem' }}>
                                        <div className="preview-icon-bg" style={{ 
                                            background: material.type?.toLowerCase().includes('ppt') ? 'rgba(185, 28, 28, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            color: material.type?.toLowerCase().includes('ppt') ? '#EF4444' : '#60A5FA'
                                        }}>
                                            {material.type?.toLowerCase().includes('ppt') ? <Layers size={48} /> : <FileText size={48} />}
                                        </div>
                                        <h4 style={{ color: '#F8FAFC', marginBottom: '8px' }}>
                                            {material.type?.toLowerCase().includes('ppt') ? 'PowerPoint Resource' : 'Preview Not Available'}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '250px', margin: '0 auto 1.5rem' }}>
                                            {material.type?.toLowerCase().includes('ppt') 
                                                ? 'Microsoft PowerPoint files cannot be previewed directly in the browser.' 
                                                : `Browser preview is not supported for ${material.type?.toUpperCase()} files.`}
                                        </p>
                                        <button className="btn-preview-action" onClick={handleDownload} style={{ background: material.type?.toLowerCase().includes('ppt') ? '#B91C1C' : '#3B82F6', margin: '0 auto' }}>
                                            <Download size={16} /> Download to View
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rating Interaction */}
                        <div className="rating-card">
                            <h3>Rate this Material</h3>
                            <p>How helpful was this resource?</p>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        className={`star-btn ${star <= userRating ? 'filled' : ''}`}
                                        onClick={() => handleRating(star)}
                                        title={`Rate ${star} stars`}
                                    >
                                        <Star size={24} fill={star <= userRating ? "#FBBF24" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 👉 Right Column: Details */}
                    <div className="info-sidebar">

                        <div className="info-card">
                            <div className="file-type-badge">{material.type}</div>
                            <h1 className="material-title-lg">{material.title}</h1>

                            <div className="meta-stats">
                                <div className="meta-item">
                                    <Star size={18} className="text-yellow" fill="#FBBF24" />
                                    <span className="rating-val">{material.rating}</span>
                                    <span className="rating-count">({material.totalRatings} ratings)</span>
                                </div>
                            </div>

                            <p className="material-description">{material.description}</p>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Subject</span>
                                    <span className="value">{material.subject}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Degree</span>
                                    <span className="value degree-hl">{material.degree}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Uploaded By</span>
                                    <div className="uploader-info">
                                        <Shield size={14} className="text-emerald" /> {material.uploadedBy}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="label">Date</span>
                                    <div className="uploader-info">
                                        <Calendar size={14} /> {material.uploadDate}
                                    </div>
                                </div>
                            </div>

                            <div className="download-section">
                                <div className="download-stats">
                                    <span><Download size={16} /> {material.downloads} Downloads</span>
                                    <span><Eye size={16} /> {material.views} Views</span>
                                </div>

                                <button
                                    className={`btn-download-lg ${isDownloading ? 'loading' : ''}`}
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <>Downloading...</>
                                    ) : (
                                        <>
                                            <Download size={20} /> Download Primary File
                                        </>
                                    )}
                                </button>
                                {downloadSuccess && <div className="success-msg">Download started!</div>}

                                {/* 📦 Additional Resource Pack (Premium View) */}
                                {material.additionalFiles && material.additionalFiles.length > 0 && (
                                    <div className="resource-pack animate-fade-in">
                                        <h4>
                                            <Shield size={18} className="text-blue" /> 
                                            Attachment Pack ({material.additionalFiles.length})
                                        </h4>
                                        <div className="attachments-scroller">
                                            {material.additionalFiles.map((file, idx) => (
                                                <div key={idx} className="att-item-row">
                                                    <div className="att-icon-box">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="att-body-info">
                                                        <div className="att-file-name">
                                                            {file.name || 'Supporting Document'}
                                                        </div>
                                                        <div className="att-file-meta">Resource Node • {idx + 1}</div>
                                                    </div>
                                                    <button 
                                                        className="btn-att-download"
                                                        onClick={() => {
                                                            const cleanPath = file.url.replace(/\\/g, '/').replace(/^\/+/, '');
                                                            const url = file.url.startsWith('http') ? file.url : `http://localhost:5000/${cleanPath}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        title="Download Attachment"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default MaterialDetail;
