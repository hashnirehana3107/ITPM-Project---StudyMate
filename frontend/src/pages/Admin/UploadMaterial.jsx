import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, File, X, BookOpen, Layers, Edit3, ArrowLeft } from 'lucide-react';
import './UploadMaterial.css';

const UploadMaterial = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        degree: '',
        subject: '',
        description: '',
        file: null
    });

    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Categories
    const degrees = ["Information Technology", "Business Management", "Engineering", "Science & Humanities"];
    const subjects = {
        "Information Technology": ["Web Development", "Software Engineering", "Data Structures", "Database Systems"],
        "Business Management": ["Accounting", "Marketing", "Economics", "Business Law"],
        "Engineering": ["Mechanics", "Electronics", "Thermodynamics", "Calculus"],
        "Science & Humanities": ["Psychology", "History", "Biology", "Chemistry"]
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subject if degree changes
            subject: name === 'degree' ? '' : (name === 'subject' ? value : prev.subject)
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    // Drag and Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData({ ...formData, file: e.dataTransfer.files[0] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.file || !formData.degree || !formData.subject) return;

        setUploading(true);

        // Mock API Upload
        setTimeout(() => {
            setUploading(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setFormData({ title: '', degree: '', subject: '', description: '', file: null });
            }, 3000);
        }, 2000);
    };

    return (
        <div className="admin-page animate-fade-in">
            <div className="admin-container">

                {/* 🔙 Back Navigation */}
                <button onClick={() => navigate('/admin/dashboard')} className="btn-back-link">
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                {/* 🖼️ Header */}
                <div className="admin-header">
                    <div className="header-icon-box">
                        <UploadCloud size={28} />
                    </div>
                    <div>
                        <h1>Upload Study Materials</h1>
                        <p>Add and organize academic resources for students.</p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="alert-success animate-slide-up">
                        <CheckCircle size={20} /> Study material uploaded successfully!
                    </div>
                )}

                {/* 📋 Upload Form */}
                <div className="upload-card">
                    <form onSubmit={handleSubmit} className="upload-form" onDragEnter={handleDrag}>

                        {/* 1️⃣ File Upload Area (Drag & Drop) */}
                        <div
                            className={`drop-zone ${dragActive ? 'active' : ''} ${formData.file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="file-input"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.ppt,.pptx,.jpg,.png"
                            />

                            {!formData.file ? (
                                <label htmlFor="file-upload" className="drop-label">
                                    <div className="upload-icon-wrapper">
                                        <UploadCloud size={40} />
                                    </div>
                                    <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
                                    <p className="upload-hint">PDF, DOCX, PPT, Images (Max 10MB)</p>
                                </label>
                            ) : (
                                <div className="file-preview">
                                    <div className="file-icon">
                                        <File size={32} />
                                    </div>
                                    <div className="file-info">
                                        <span className="file-name">{formData.file.name}</span>
                                        <span className="file-size">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-remove-file"
                                        onClick={() => setFormData({ ...formData, file: null })}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Form Grid */}
                        <div className="form-grid">

                            {/* 2️⃣ Material Title */}
                            <div className="form-group full-width">
                                <label className="form-label"><Edit3 size={16} /> Material Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Introduction to React Hooks"
                                    className="form-input"
                                    required
                                />
                            </div>

                            {/* 3️⃣ Degree Selection */}
                            <div className="form-group">
                                <label className="form-label"><Layers size={16} /> Degree Program</label>
                                <select
                                    name="degree"
                                    value={formData.degree}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>Select Degree</option>
                                    {degrees.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                                </select>
                            </div>

                            {/* 4️⃣ Subject Selection */}
                            <div className="form-group">
                                <label className="form-label"><BookOpen size={16} /> Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                    disabled={!formData.degree}
                                >
                                    <option value="" disabled>Select Subject</option>
                                    {formData.degree && subjects[formData.degree]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 5️⃣ Description */}
                            <div className="form-group full-width">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add a short description about this material..."
                                    className="form-textarea"
                                    rows={3}
                                ></textarea>
                            </div>

                        </div>

                        {/* 6️⃣ Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className={`btn-upload ${uploading ? 'loading' : ''}`}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Material'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default UploadMaterial;
