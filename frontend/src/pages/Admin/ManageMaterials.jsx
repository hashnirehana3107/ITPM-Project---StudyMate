import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Edit3, Trash2, Eye, Search, Filter, CheckCircle,
    AlertTriangle, X, Save, ArrowLeft, FileText,
    Upload, Star, Download, Calendar, Book, GraduationCap,
    MoreVertical, Info, Layers, Plus
} from 'lucide-react';
import './ManageMaterials.css';

const ManageMaterials = () => {
    const navigate = useNavigate();

    // Data State
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterYear, setFilterYear] = useState('all');
    const [filterDegree, setFilterDegree] = useState('all');
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [degrees, setDegrees] = useState([]);
    const [subjectMapping, setSubjectMapping] = useState({});

    // Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // Form States
    const [uploadForm, setUploadForm] = useState({ title: '', subject: '', degree: '', year: '1', academicYear: '', type: 'pdf', description: '', file: null, rawFile: null, additionalFiles: [] });
    const [editForm, setEditForm] = useState({ title: '', subject: '', degree: '', year: '1', academicYear: '', type: 'pdf', description: '', additionalFiles: [] });

    const [successMessage, setSuccessMessage] = useState('');

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const res = await axios.get('/api/materials/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError(err.response?.data?.message || 'Failed to fetch materials from database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
        const fetchDegrees = async () => {
            try {
                const { data } = await axios.get('/api/degrees');
                setDegrees(data);
                // Build subjectMapping dynamically from API data
                const mapping = {};
                data.forEach(d => {
                    mapping[d.code] = ['All', ...d.subjects.map(s => s.name)];
                    // Also map by full name for backward compat
                    mapping[d.name] = ['All', ...d.subjects.map(s => s.name)];
                });
                setSubjectMapping(mapping);
            } catch (e) {
                console.warn('Failed to fetch degrees for materials form');
            }
        };
        fetchDegrees();
    }, []);

    const showNotification = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Filter Logic
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
            m.subject.toLowerCase().includes(search.toLowerCase());
        const matchesYear = filterYear === 'all' || (m.year ? m.year.toString() : '') === filterYear;
        const matchesDegree = filterDegree === 'all' || m.degree === filterDegree;
        return matchesSearch && matchesYear && matchesDegree;
    });

    // Handlers
    const handleUpload = async (e) => {
        e.preventDefault();
        console.log('--- Handle Upload Started ---', uploadForm);
        setFormError('');

        // Strict Manual Validation
        const errors = [];
        if (!uploadForm.title.trim()) errors.push('Title');
        if (!uploadForm.degree) errors.push('Degree');
        if (!uploadForm.subject) errors.push('Subject');
        if (!uploadForm.year) errors.push('Year');
        if (!uploadForm.rawFile) errors.push('File');

        if (errors.length > 0) {
            const msg = `Please fill in these missing fields: ${errors.join(', ')}`;
            setFormError(msg);
            alert(msg);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('subject', uploadForm.subject);
            formData.append('degree', uploadForm.degree);
            formData.append('year', uploadForm.year);
            formData.append('academicYear', uploadForm.academicYear || '');
            formData.append('type', uploadForm.type);
            formData.append('description', uploadForm.description);
            // Append Primary File
            if (uploadForm.rawFile) {
                formData.append('file', uploadForm.rawFile);
            }

            // Append Additional Files
            if (uploadForm.additionalFiles && uploadForm.additionalFiles.length > 0) {
                uploadForm.additionalFiles.forEach(file => {
                    formData.append('additionalFiles', file);
                });
            }

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            await axios.post('/api/materials/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setIsUploadModalOpen(false);
            setFormError('');
            setUploadForm({ title: '', subject: '', degree: '', year: '1', academicYear: '', type: 'pdf', description: '', file: null, rawFile: null, additionalFiles: [] });
            fetchMaterials();
            showNotification('Study material and attachments uploaded successfully!');
        } catch (err) {
            console.error('Upload Error:', err);
            const errMsg = err.response?.data?.message || err.message;
            setFormError(errMsg);
            alert('Upload Failed: ' + errMsg);
        }
    };

    const handleEditClick = (material) => {
        setSelectedMaterial(material);
        setEditForm({
            title: material.title,
            subject: material.subject,
            degree: material.degree,
            year: material.year ? material.year.toString() : '1',
            academicYear: material.academicYear || '',
            type: material.type || 'pdf',
            description: material.description || '',
            fileUrl: material.fileUrl || '#',
            existingAdditional: material.additionalFiles || [],
            newAdditional: []
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        console.log('--- Handle Save Edit Started ---', editForm);
        setFormError('');

        // Manual Validation
        const errors = [];
        if (!editForm.title.trim()) errors.push('Title');
        if (!editForm.degree) errors.push('Degree');
        if (!editForm.subject) errors.push('Subject');
        if (!editForm.year) errors.push('Year');

        if (errors.length > 0) {
            const msg = ` fields missing: ${errors.join(', ')}`;
            setFormError(msg);
            alert(msg);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', editForm.title);
            formData.append('subject', editForm.subject);
            formData.append('degree', editForm.degree);
            formData.append('year', editForm.year);
            formData.append('academicYear', editForm.academicYear || '');
            formData.append('type', editForm.type);
            formData.append('description', editForm.description);
            if (editForm.rawFile) {
                formData.append('file', editForm.rawFile);
            }

            // Append New Additional Files
            if (editForm.newAdditional && editForm.newAdditional.length > 0) {
                editForm.newAdditional.forEach(file => {
                    formData.append('additionalFiles', file);
                });
            }

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const materialId = selectedMaterial._id || selectedMaterial.id;

            await axios.put(`/api/materials/${materialId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setIsEditModalOpen(false);
            setFormError('');
            fetchMaterials();
            showNotification('Material and new attachments updated successfully!');
        } catch (err) {
            console.error('Update Error:', err);
            const errMsg = err.response?.data?.message || err.message;
            setFormError(errMsg);
            alert('Update Failed: ' + errMsg);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setFilterYear('all');
        setFilterDegree('all');
    };

    const handleDelete = async (id) => {
        if (isDeleting) return;
        try {
            setIsDeleting(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            await axios.delete(`/api/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedMaterials = materials.filter(m => (m._id !== id && m.id !== id));
            setMaterials(updatedMaterials);
            setIsDeleteModalOpen(false);
            showNotification('Material removed from repository');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Delete Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="manage-materials-page">
            <div className="mm-container">
                {/* Header */}
                <div className="mm-header">
                    <div className="mm-header-left">
                        <div className="mm-header-icon">
                            <Book size={24} />
                        </div>
                        <div className="mm-title">
                            <h1>Study Materials Management</h1>
                            <p>Organize, verify, and maintain academic resources.</p>
                        </div>
                    </div>
                    <button className="btn-add-material" onClick={() => setIsUploadModalOpen(true)}>
                        <Upload size={18} /> Upload New Material
                    </button>
                </div>

                {/* Notification */}
                {successMessage && (
                    <div className="mm-toast">
                        <CheckCircle size={18} /> {successMessage}
                    </div>
                )}

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
                        <select value={filterDegree} onChange={(e) => setFilterDegree(e.target.value)}>
                            <option value="all">All Degrees</option>
                            {degrees.map(d => <option key={`filter-${d._id}`} value={d.name}>{d.name}</option>)}
                        </select>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                            <option value="all">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                        {(search || filterYear !== 'all' || filterDegree !== 'all') && (
                            <button className="btn-reset-filters" onClick={resetFilters}>
                                <X size={14} /> Reset
                            </button>
                        )}
                        <button className="btn-toolbar-action">
                            <Filter size={18} /> More Filters
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mm-table-card">
                    <div className="mm-table-wrapper">
                        <table className="mm-table">
                            <thead>
                                <tr>
                                    <th>Resource & Status</th>
                                    <th>Target Audience</th>
                                    <th>Quality Metrics</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Fetching records from database...</td></tr>
                                ) : filteredMaterials.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>No materials found match your criteria.</td></tr>
                                ) : filteredMaterials.map(m => (
                                    <tr key={m._id || m.id} className={m.isLowQuality ? 'row-low-quality' : ''}>
                                        <td>
                                            <div className="material-cell">
                                                <div className="file-icon-box">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="material-info">
                                                    <div className="name-status-row">
                                                        <span className="m-title">{m.title}</span>
                                                        {m.isLowQuality ? (
                                                            <span className="status-badge-inline low-quality">Low Quality</span>
                                                        ) : (
                                                            <span className="status-badge-inline verified">Verified</span>
                                                        )}
                                                    </div>
                                                    <span className="m-subject">{m.subject}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="audience-cell">
                                                <span className="tag-degree">{m.degree}</span>
                                                <span className="tag-year">Year {m.year}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metrics-cell">
                                                <span className="metric"><Download size={14} /> {m.downloads || 0}</span>
                                                <span className={`metric ${(m.averageRating || 0) < 3 ? 'low-rating' : ''}`}>
                                                    <Star size={14} /> {m.averageRating || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="mm-actions">
                                                <button className="btn-action-mm" title="Edit" onClick={() => handleEditClick(m)}><Edit3 size={16} /></button>
                                                <button className="btn-action-mm danger" title="Delete" onClick={() => { setSelectedMaterial(m); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                                                <button className="btn-action-mm" title="View" onClick={() => { setSelectedMaterial(m); setIsViewModalOpen(true); }}><Eye size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>Upload New Material</h3>
                                <button className="btn-close-modal" onClick={() => { setIsUploadModalOpen(false); setFormError(''); }}><X size={20} /></button>
                            </div>
                            <form className="mm-form-enhanced" onSubmit={handleUpload}>
                                <div className="form-grid">
                                    <div className="form-group-full">
                                        <label><FileText size={16} /> Material Title <span style={{color: '#EF4444'}}>*</span></label>
                                        <input
                                            type="text"
                                            
                                            placeholder="e.g. Distributed Systems Lecture 1"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><GraduationCap size={16} /> Target Degree <span style={{color: '#EF4444'}}>*</span></label>
                                        <select  value={uploadForm.degree} onChange={(e) => setUploadForm({ ...uploadForm, degree: e.target.value, subject: '' })}>
                                            <option value="">Select Degree</option>
                                            {degrees.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Book size={16} /> Subject Area <span style={{color: '#EF4444'}}>*</span></label>
                                        <select
                                            value={uploadForm.subject}
                                            onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                                            
                                            disabled={!uploadForm.degree}
                                        >
                                            <option value="">Select Subject</option>
                                            {(subjectMapping[uploadForm.degree] || []).filter(s => s !== "All").map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Layers size={16} /> Resource Type</label>
                                        <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lecture</option>
                                            <option value="ppt">Presentation</option>
                                            <option value="paper">Past Paper</option>
                                            <option value="zip">ZIP Archive (Multiple Files)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={16} /> Study Level / Year</label>
                                        <select value={uploadForm.year} onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={16} /> Academic Session (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2023/24"
                                            value={uploadForm.academicYear}
                                            onChange={(e) => setUploadForm({ ...uploadForm, academicYear: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-full">
                                        <label><Upload size={16} /> Upload Resource File</label>
                                        <input
                                            type="file"
                                            className="file-input-modern"
                                            accept={
                                                uploadForm.type === 'pdf' ? '.pdf' :
                                                    uploadForm.type === 'video' ? 'video/*' :
                                                        uploadForm.type === 'ppt' ? '.ppt,.pptx' :
                                                            uploadForm.type === 'paper' ? '.pdf,.doc,.docx' :
                                                                uploadForm.type === 'zip' ? '.zip,.rar,.7z' : '*'
                                            }
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setUploadForm({ ...uploadForm, file: file.name, rawFile: file });
                                                }
                                                e.target.value = null; // Clear input to allow re-selecting same file
                                            }}
                                            style={{ padding: '0.8rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', width: '100%', color: 'white', display: uploadForm.rawFile ? 'none' : 'block' }}
                                        />
                                        
                                        {/* Dynamic Full File Preview Thumbnail */}
                                        {uploadForm.rawFile && (
                                            <div className="file-preview-thumbnail animate-scale-in" style={{ 
                                                marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px', 
                                                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', 
                                                padding: '16px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                                            }}>
                                                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                                                    <FileText size={28} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {uploadForm.rawFile.name}
                                                    </div>
                                                    <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px'}}>{uploadForm.type.toUpperCase()}</span>
                                                        <span>{(uploadForm.rawFile.size / (1024 * 1024)).toFixed(2)} MB Selected</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setUploadForm({...uploadForm, file: null, rawFile: null})} 
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => Object.assign(e.currentTarget.style, {background: 'rgba(239, 68, 68, 0.2)'})}
                                                    onMouseOut={(e) => Object.assign(e.currentTarget.style, {background: 'rgba(239, 68, 68, 0.1)'})}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}

                                        {!uploadForm.rawFile && (
                                            <small style={{ color: '#64748B', display: 'block', marginTop: '5px' }}>
                                                Accepted formats adapt based on selected Resource Type. Maximum 20MB limit.
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label><Upload size={16} /> Additional Attachments (Optional)</label>
                                        <div className="multi-upload-zone" style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '20px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    setUploadForm(prev => ({ ...prev, additionalFiles: [...prev.additionalFiles, ...files] }));
                                                    e.target.value = null;
                                                }}
                                                id="multi-file-upload"
                                                className="hidden-input"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="multi-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3B82F6' }}>
                                                    <Plus size={24} />
                                                </div>
                                                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Click to add secondary files or ZIPs</span>
                                            </label>
                                        </div>

                                        {/* Additional Files Preview List */}
                                        {uploadForm.additionalFiles.length > 0 && (
                                            <div className="additional-files-list" style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {uploadForm.additionalFiles.map((f, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <FileText size={16} style={{ color: '#64748B' }} />
                                                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setUploadForm(prev => ({ ...prev, additionalFiles: prev.additionalFiles.filter((_, i) => i !== idx) }))}
                                                            style={{ padding: '4px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group-full">
                                        <label><Info size={16} /> Description / Learning Objectives</label>
                                        <textarea
                                            placeholder="Briefly describe what students will learn from this resource..."
                                            value={uploadForm.description}
                                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>

                                {formError && (
                                    <div className="form-error-banner animate-slide-down" style={{margin: '0 24px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', borderLeft: '4px solid #EF4444', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <AlertTriangle size={18} /> {formError}
                                    </div>
                                )}

                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsUploadModalOpen(false)}>Discard</button>
                                    <button type="submit" className="btn-save-glow"><Save size={18} /> Publish Material</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && selectedMaterial && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>Edit Material Details</h3>
                                <button className="btn-close-modal" onClick={() => { setIsEditModalOpen(false); setFormError(''); }}><X size={20} /></button>
                            </div>
                            <form className="mm-form-enhanced" onSubmit={handleSaveEdit}>
                                <div className="form-grid">
                                    <div className="form-group-full">
                                        <label><FileText size={16} /> Material Title <span style={{color: '#EF4444'}}>*</span></label>
                                        <input
                                            type="text"
                                            
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><GraduationCap size={16} /> Target Degree <span style={{color: '#EF4444'}}>*</span></label>
                                        <select  value={editForm.degree} onChange={(e) => setEditForm({ ...editForm, degree: e.target.value, subject: '' })}>
                                            <option value="">Select Degree</option>
                                            {degrees.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Book size={16} /> Subject Area <span style={{color: '#EF4444'}}>*</span></label>
                                        <select
                                            value={editForm.subject}
                                            onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                            
                                            disabled={!editForm.degree}
                                        >
                                            <option value="">Select Subject</option>
                                            {(subjectMapping[editForm.degree] || []).filter(s => s !== "All").map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Layers size={16} /> Resource Type</label>
                                        <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                                            <option value="pdf">PDF Document</option>
                                            <option value="video">Video Lecture</option>
                                            <option value="ppt">Presentation</option>
                                            <option value="paper">Past Paper</option>
                                            <option value="zip">ZIP Archive (Multiple Files)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={16} /> Study Level / Year</label>
                                        <select value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={16} /> Academic Session</label>
                                        <input
                                            type="text"
                                            value={editForm.academicYear}
                                            onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-full">
                                        <label><Upload size={16} /> Replace File (Optional)</label>
                                        
                                        {/* Current Existing File Banner */}
                                        {!editForm.rawFile && editForm.fileUrl && editForm.fileUrl !== '#' && (
                                            <div className="current-file-banner" style={{ 
                                                marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', 
                                                background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed #475569', 
                                                padding: '12px 16px', borderRadius: '10px' 
                                            }}>
                                                <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#CBD5E1' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: '500' }}>Active Resource File</div>
                                                    <div style={{ color: '#64748B', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                                        {editForm.fileUrl.split(/[\\/]/).pop()}
                                                    </div>
                                                </div>
                                                <span style={{background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22C55E', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px'}}>CURRENTLY LIVE</span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            className="file-input-modern"
                                            accept={
                                                editForm.type === 'pdf' ? '.pdf' :
                                                    editForm.type === 'video' ? 'video/*' :
                                                        editForm.type === 'ppt' ? '.ppt,.pptx' :
                                                            editForm.type === 'paper' ? '.pdf,.doc,.docx' :
                                                                editForm.type === 'zip' ? '.zip,.rar,.7z' : '*'
                                            }
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditForm({ ...editForm, file: file.name, rawFile: file });
                                                }
                                                e.target.value = null;
                                            }}
                                            style={{ padding: '0.8rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', width: '100%', color: 'white', display: editForm.rawFile ? 'none' : 'block' }}
                                        />
                                        
                                        {/* Dynamic Full File Preview Thumbnail */}
                                        {editForm.rawFile && (
                                            <div className="file-preview-thumbnail animate-scale-in" style={{ 
                                                marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px', 
                                                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', 
                                                padding: '16px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                                            }}>
                                                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                                                    <FileText size={28} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {editForm.rawFile.name}
                                                    </div>
                                                    <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px'}}>{editForm.type.toUpperCase()}</span>
                                                        <span>{(editForm.rawFile.size / (1024 * 1024)).toFixed(2)} MB Selected</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditForm({...editForm, file: null, rawFile: null})} 
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => Object.assign(e.currentTarget.style, {background: 'rgba(239, 68, 68, 0.2)'})}
                                                    onMouseOut={(e) => Object.assign(e.currentTarget.style, {background: 'rgba(239, 68, 68, 0.1)'})}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}

                                        {!editForm.rawFile && (
                                            <small style={{ color: '#64748B', display: 'block', marginTop: '5px' }}>
                                                Leave empty to keep the currently uploaded file. Maximum 20MB limit.
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group-full">
                                        <label><Upload size={16} /> Additional Attachments</label>
                                        
                                        {/* Existing Additional Files */}
                                        {editForm.existingAdditional && editForm.existingAdditional.length > 0 && (
                                            <div style={{ marginBottom: '10px' }}>
                                                <small style={{ color: '#64748B', marginBottom: '8px', display: 'block' }}>Already Uploaded:</small>
                                                <div className="additional-files-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    {editForm.existingAdditional.map((f, idx) => (
                                                        <div key={`existing-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                            <FileText size={16} style={{ color: '#10B981' }} />
                                                            <span style={{ flex: 1, fontSize: '0.8rem', color: '#A7F3D0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name || f.url.split('/').pop()}</span>
                                                            <CheckCircle size={14} style={{ color: '#10B981' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="multi-upload-zone" style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '15px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    setEditForm(prev => ({ ...prev, newAdditional: [...prev.newAdditional, ...files] }));
                                                    e.target.value = null;
                                                }}
                                                id="edit-multi-file-upload"
                                                className="hidden-input"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="edit-multi-file-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                <Plus size={18} style={{ color: '#3B82F6' }} />
                                                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Add more attachments</span>
                                            </label>
                                        </div>

                                        {/* New Additional Files Preview */}
                                        {editForm.newAdditional && editForm.newAdditional.length > 0 && (
                                            <div className="additional-files-list" style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {editForm.newAdditional.map((f, idx) => (
                                                    <div key={`new-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59, 130, 246, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                        <FileText size={16} style={{ color: '#3B82F6' }} />
                                                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#93C5FD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setEditForm(prev => ({ ...prev, newAdditional: prev.newAdditional.filter((_, i) => i !== idx) }))}
                                                            style={{ padding: '4px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group-full">
                                        <label><Info size={16} /> Description</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>

                                {formError && (
                                    <div className="form-error-banner animate-slide-down" style={{margin: '0 24px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', borderLeft: '4px solid #EF4444', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <AlertTriangle size={18} /> {formError}
                                    </div>
                                )}

                                <div className="modal-footer-enhanced">
                                    <button type="button" className="btn-cancel-flat" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-glow"><Save size={18} /> Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {isViewModalOpen && selectedMaterial && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal">
                            <div className="modal-header">
                                <h3>Resource Details</h3>
                                <button className="btn-close-modal" onClick={() => setIsViewModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="view-modal-body">
                                <div className="view-header-row">
                                    <div className="view-icon-large">
                                        <FileText size={40} />
                                    </div>
                                    <div className="view-title-status">
                                        <h2>{selectedMaterial.title}</h2>
                                        {selectedMaterial.isLowQuality ? (
                                            <span className="status-badge low-quality">Low Quality Content</span>
                                        ) : (
                                            <span className="status-badge verified">Verified Material</span>
                                        )}
                                    </div>
                                </div>
                                <div className="view-info-grid">
                                    <div className="view-item">
                                        <span className="v-label">Subject Area</span>
                                        <span className="v-value">{selectedMaterial.subject}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Target Degree</span>
                                        <span className="v-value">{selectedMaterial.degree}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Resource Type</span>
                                        <span className="v-value" style={{ textTransform: 'uppercase' }}>{selectedMaterial.type}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Study Year</span>
                                        <span className="v-value">Year {selectedMaterial.year}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Academic Session</span>
                                        <span className="v-value">{selectedMaterial.academicYear || "Not specified"}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Upload Date</span>
                                        <span className="v-value">{selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleDateString() : "Unknown"}</span>
                                    </div>
                                    <div className="view-item">
                                        <span className="v-label">Uploader</span>
                                        <span className="v-value">{selectedMaterial.uploadedBy}</span>
                                    </div>
                                </div>
                                <div className="view-stats-row">
                                    <div className="stat-pill"><Download size={14} /> {selectedMaterial.downloads || 0} Downloads</div>
                                    <div className="stat-pill"><Eye size={14} /> {selectedMaterial.views || 0} Views</div>
                                    <div className="stat-pill"><Star size={14} fill="#FACC15" color="#FACC15" /> {selectedMaterial.averageRating || 0} ({selectedMaterial.ratings?.length || 0} Ratings)</div>
                                </div>
                                <div className="view-description-box">
                                    <label>Detailed Description</label>
                                    <p>{selectedMaterial.description || "No description provided."}</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>Close Overview</button>
                                <button className="btn-save" onClick={() => { setIsViewModalOpen(false); handleEditClick(selectedMaterial); }}><Edit3 size={16} /> Edit Material</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && selectedMaterial && (
                    <div className="modal-overlay">
                        <div className="modal-content mm-modal-small">
                            <div className="warning-icon-bg">
                                <AlertTriangle size={32} />
                            </div>
                            <h3>Remove Material?</h3>
                            <p>Are you sure you want to delete <strong>{selectedMaterial.title}</strong>? This action cannot be undone.</p>
                             <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
                                <button 
                                    className="btn-danger-confirm" 
                                    onClick={() => handleDelete(selectedMaterial._id || selectedMaterial.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Removing...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManageMaterials;
